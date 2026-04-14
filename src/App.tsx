import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type WheelEvent as ReactWheelEvent
} from 'react';
import { AutomationPanel } from './components/AutomationPanel';
import { CounterPanel } from './components/CounterPanel';
import { DropPanel } from './components/DropPanel';
import { FloatingPet } from './components/FloatingPet';
import { PanelErrorBoundary } from './components/PanelErrorBoundary';
import { PetCodexOverlay } from './components/PetCodexOverlay';
import { PetShell } from './components/PetShell';
import { SetupGuide } from './components/SetupGuide';
import {
  buildPetCeremony,
  createPetCeremonySnapshot,
  type PetCeremony
} from './lib/petCeremony';
import { formatCompactDateTime, formatDuration, getDayKey } from './lib/date';
import { buildPetCodex } from './lib/petCodex';
import { buildPetHabitat } from './lib/petHabitat';
import {
  buildPetFishingInteractionCue,
  createPetFishingCatch,
  type PetFishingCatch
} from './lib/petFishing';
import {
  createPetInteractionCue,
  type PetInteractionCue
} from './lib/petPersona';
import {
  buildSetupGuideHint
} from './lib/setupGuideState';
import { playPetChime } from './lib/petSound';
import {
  buildPetProgression,
  buildPetRewards,
  buildPetRoom,
  buildPetScene,
  createPetEvent,
  type PetEvent
} from './lib/petWorld';
import { buildRunHistoryStats, buildTodayStats } from './lib/stats';
import type {
  AppData,
  AutomationLogDocument,
  AutomationPreflightInput,
  AutomationPreflightResponse,
  CreateDropInput,
  DropOcrPreviewInput,
  DropOcrResult,
  EnvironmentActionResponse,
  ExportTextFileInput,
  ExportTextFileResult,
  ExportVisualReportInput,
  ExportVisualReportResult,
  FloatingSnapPreview,
  IntegrationId,
  IntegrationRunResponse,
  RunAutomationAdminInput,
  RunEnvironmentActionInput,
  RunAutomationTaskInput,
  WindowMode
} from './types';

type TabKey = 'companion' | 'drops' | 'workshop';
type Message = { kind: 'success' | 'error'; text: string } | null;
type SurfaceNoticeTone = 'neutral' | 'success' | 'attention' | 'error';
type SurfaceNotice = {
  title: string;
  detail: string;
  tone: SurfaceNoticeTone;
} | null;
type SetupGuideActivity = {
  title: string;
  detail: string;
  tone: 'success' | 'attention' | 'error';
  timestampLabel: string;
  logPreview?: string;
} | null;
const DEFAULT_SETTINGS: AppData['settings'] = {
  alwaysOnTop: false,
  launchOnStartup: false,
  notificationsEnabled: false,
  autoCounterEnabled: false,
  counterLockEnabled: false,
  counterRecognitionIntervalSeconds: 2,
  counterSceneTemplatePath: '',
  counterSceneMatchThreshold: 0.82,
  defaultRunMapName: '3C',
  windowMode: 'panel',
  setupGuideCompleted: false,
  windowPlacement: {}
};

function translateError(errorText: string): string {
  if (errorText.includes('EPERM') || errorText.includes('Access is denied')) {
    return '权限不足，请尝试以管理员身份运行桌宠或游戏。';
  }
  if (errorText.includes('not found') && errorText.includes('D2R.exe')) {
    return '没有检测到暗黑 2 游戏进程，请先启动游戏。';
  }
  if (errorText.includes('python: can\'t open file')) {
    return 'Python 脚本缺失，请重新安装内置运行环境。';
  }
  if (errorText.includes('ModuleNotFoundError') || errorText.includes('No module named')) {
    return '缺少必要的 Python 依赖，请在工坊里安装运行依赖。';
  }
  if (errorText.includes('tesseract') || errorText.includes('TesseractNotFoundError')) {
    return 'OCR 识别引擎异常，请检查运行依赖是否安装完整。';
  }
  return errorText;
}

function normalizeFrontendErrorMessage(errorText: string): string {
  const ipcWrapped = errorText.match(/Error invoking remote method '[^']+': Error: (.+)$/);
  const normalizedErrorText = (ipcWrapped?.[1] ?? errorText).trim();

  if (
    normalizedErrorText.includes('自动统计已经在运行') ||
    normalizedErrorText.includes('自动计数已经在运行')
  ) {
    return '这轮自动计数已经在待命了，直接进游戏就会自动开始。';
  }

  return normalizedErrorText;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return normalizeFrontendErrorMessage(translateError(error.message));
  }

  if (typeof error === 'string') {
    return normalizeFrontendErrorMessage(translateError(error));
  }

  return '发生了未知错误。';
}

function getAdminSuccessText(action: RunAutomationAdminInput['action']): string {
  switch (action) {
    case 'record-profile':
      return '坐标录制完成，日志已经更新。';
    case 'print-profile':
      return '当前坐标配置已经输出到日志。';
    case 'import-legacy-config':
      return '旧配置已经导入到新的运行环境。';
  }
}

function getSetupActivityTimeLabel() {
  return formatCompactDateTime(new Date().toISOString());
}

function getLogPreview(content?: string): string | undefined {
  if (!content?.trim()) {
    return undefined;
  }

  return content.trim().split(/\r?\n/).slice(-10).join('\n');
}

interface PanelScrollState {
  canScrollUp: boolean;
  canScrollDown: boolean;
  progress: number;
}

function getTabMeta(tab: TabKey): { label: string; detail: string } {
  switch (tab) {
    case 'companion':
      return {
        label: '陪刷',
        detail: '只保留 3C 计数、开始停止和最近几把。'
      };
    case 'drops':
      return {
        label: '战报',
        detail: '先记掉落，再看最近记录和导出。'
      };
    case 'workshop':
      return {
        label: '工坊',
        detail: '只看任务状态、补条件和试运行。'
      };
  }
}

function getBusySummary(busyKey: string | null): string | null {
  if (!busyKey) {
    return null;
  }

  if (busyKey === 'start-run') {
    return '正在开始本次刷图统计。';
  }

  if (busyKey === 'stop-run') {
    return '正在结算这一轮刷图。';
  }

  if (busyKey === 'reset-run-history') {
    return '正在清空 3C 计数历史。';
  }

  if (busyKey === 'pick-counter-template') {
    return '正在接入 3C 地图名截图。';
  }

  if (busyKey === 'create-drop') {
    return '正在保存这条掉落记录。';
  }

  if (busyKey === 'settings') {
    return '正在同步桌宠设置。';
  }

  if (busyKey.startsWith('env-')) {
    return '正在处理运行环境或依赖。';
  }

  if (busyKey.startsWith('task-')) {
    return '自动化任务正在执行，请先等待结果返回。';
  }

  if (busyKey.startsWith('admin-')) {
    return '正在处理坐标配置或维护动作。';
  }

  return '当前操作还在处理中。';
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('companion');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [surfaceNotice, setSurfaceNotice] = useState<SurfaceNotice>(null);
  const [now, setNow] = useState(Date.now());
  const [highlightedDropName, setHighlightedDropName] = useState('');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [setupPreflight, setSetupPreflight] = useState<AutomationPreflightResponse | null>(null);
  const [setupPreflightBusy, setSetupPreflightBusy] = useState(false);
  const [setupPreflightError, setSetupPreflightError] = useState('');
  const [setupGuideActivity, setSetupGuideActivity] = useState<SetupGuideActivity>(null);
  const [petInteractionCue, setPetInteractionCue] = useState<PetInteractionCue | null>(null);
  const [petFishingCatch, setPetFishingCatch] = useState<PetFishingCatch | null>(null);
  const [petCeremony, setPetCeremony] = useState<PetCeremony | null>(null);
  const [petEvent, setPetEvent] = useState<PetEvent | null>(null);
  const [floatingSnapPreview, setFloatingSnapPreview] = useState<FloatingSnapPreview>({
    visible: false,
    snapped: false
  });
  const [setupGuideTick, setSetupGuideTick] = useState(0);
  const [workshopFocusId, setWorkshopFocusId] = useState<IntegrationId | null>(null);
  const [showPetCodex, setShowPetCodex] = useState(false);
  const [showCompanionDetails, setShowCompanionDetails] = useState(false);
  const [selectedCodexEntryId, setSelectedCodexEntryId] = useState<string | null>(null);
  const [panelScrollState, setPanelScrollState] = useState<PanelScrollState>({
    canScrollUp: false,
    canScrollDown: false,
    progress: 0
  });
  const panelStackRef = useRef<HTMLDivElement | null>(null);
  const latestDropIdRef = useRef<string | null>(null);
  const petCeremonySnapshotRef = useRef<ReturnType<typeof createPetCeremonySnapshot> | null>(null);
  const setupGuideInitializedRef = useRef(false);

  useEffect(() => {
    void window.d2Pet
      .getData()
      .then((value) => setData(value))
      .catch((error) =>
        setMessage({
          kind: 'error',
          text: getErrorMessage(error)
        })
      );
  }, []);

  useEffect(() => {
    return window.d2Pet.onDataChanged((value) => {
      setData(value);
    });
  }, []);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setMessage((current) => (current === message ? null : current));
    }, message.kind === 'error' ? 7200 : 4200);

    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!surfaceNotice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSurfaceNotice((current) => (current === surfaceNotice ? null : current));
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [surfaceNotice]);

  useEffect(() => {
    return window.d2Pet.onFloatingSnapPreview((preview) => {
      setFloatingSnapPreview(preview);
    });
  }, []);

  useEffect(() => {
    if (!data || setupGuideInitializedRef.current) {
      return;
    }

    setShowSetupGuide(!data.settings.setupGuideCompleted);
    setupGuideInitializedRef.current = true;
  }, [data]);

  useEffect(() => {
    if (!data?.settings.setupGuideCompleted) {
      return;
    }

    setShowSetupGuide(false);
  }, [data?.settings.setupGuideCompleted]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    const latestDrop = data.drops[0];
    if (!latestDrop) {
      latestDropIdRef.current = null;
      return;
    }

    if (!latestDropIdRef.current) {
      latestDropIdRef.current = latestDrop.id;
      return;
    }

    if (latestDropIdRef.current !== latestDrop.id) {
      latestDropIdRef.current = latestDrop.id;
      setHighlightedDropName(latestDrop.itemName);
    }
  }, [data]);

  useEffect(() => {
    if (!highlightedDropName) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setHighlightedDropName('');
    }, 5200);

    return () => window.clearTimeout(timer);
  }, [highlightedDropName]);

  useEffect(() => {
    if (!petInteractionCue) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPetInteractionCue((current) =>
        current?.id === petInteractionCue.id ? null : current
      );
    }, petInteractionCue.durationMs);

    return () => window.clearTimeout(timer);
  }, [petInteractionCue]);

  useEffect(() => {
    if (!petFishingCatch) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPetFishingCatch((current) =>
        current?.id === petFishingCatch.id ? null : current
      );
    }, 6_200);

    return () => window.clearTimeout(timer);
  }, [petFishingCatch]);

  useEffect(() => {
    if (!petEvent) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPetEvent((current) => (current?.id === petEvent.id ? null : current));
    }, 12_500);

    return () => window.clearTimeout(timer);
  }, [petEvent]);

  useEffect(() => {
    if (!petCeremony) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPetCeremony((current) => (current?.id === petCeremony.id ? null : current));
    }, 7600);

    return () => window.clearTimeout(timer);
  }, [petCeremony]);

  useEffect(() => {
    if (!petCeremony || !data?.settings.notificationsEnabled) {
      return;
    }

    playPetChime(
      petCeremony.kind === 'mastery'
        ? 'mastery'
        : petCeremony.kind === 'unlock'
          ? 'unlock'
          : 'rare'
    );
  }, [data?.settings.notificationsEnabled, petCeremony?.id]);

  useEffect(() => {
    if (!workshopFocusId) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setWorkshopFocusId(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [workshopFocusId]);

  useEffect(() => {
    const container = panelStackRef.current;
    if (!container) {
      return;
    }

    if (activeTab === 'companion' && !showSetupGuide) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, showSetupGuide]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSetupPreflightBusy(true);
      setSetupPreflightError('');
      void window.d2Pet
        .getAutomationPreflight({
          drafts: data.automationDrafts,
          hasGemClipboardImage: false
        })
        .then((value) => setSetupPreflight(value))
        .catch((error) => setSetupPreflightError(getErrorMessage(error)))
        .finally(() => setSetupPreflightBusy(false));
    }, 160);

    return () => window.clearTimeout(timer);
  }, [data, setupGuideTick]);

  const todayKey = getDayKey(new Date(now));
  const todayStats = useMemo(
    () =>
      data
        ? buildTodayStats(data.runHistory, todayKey)
        : {
            totalCount: 0,
            totalDurationSeconds: 0,
            averageDurationSeconds: 0,
            mapBreakdown: []
          },
    [data, todayKey]
  );
  const historyStats = useMemo(
    () => buildRunHistoryStats(data?.runHistory ?? []),
    [data?.runHistory]
  );
  const recentRuns = useMemo(() => data?.runHistory.slice(0, 6) ?? [], [data]);
  const todayDrops = useMemo(
    () => data?.drops.filter((drop) => drop.dayKey === todayKey).slice(0, 12) ?? [],
    [data, todayKey]
  );
  const activeDurationText = data?.activeRun
    ? formatDuration((now - new Date(data.activeRun.startedAt).getTime()) / 1000)
    : '00:00';
  const isFloatingMode = data?.settings.windowMode === 'floating';
  const petPersonaInput = useMemo(
    () =>
      data
        ? {
            activeRun: data.activeRun,
            highlightDropName: highlightedDropName,
            liveDurationText: activeDurationText,
            preflight: setupPreflight,
            recentDrops: todayDrops,
            recentRuns,
            setupGuideCompleted: data.settings.setupGuideCompleted,
            todayCount: todayStats.totalCount,
            todayDropCount: todayDrops.length
          }
        : null,
    [
      activeDurationText,
      data,
      highlightedDropName,
      recentRuns,
      setupPreflight,
      todayDrops,
      todayStats.totalCount
    ]
  );
  const petWorldInput = useMemo(
    () => (petPersonaInput ? { ...petPersonaInput, now } : null),
    [now, petPersonaInput]
  );
  const petScene = useMemo(
    () => (petWorldInput ? buildPetScene(petWorldInput) : null),
    [petWorldInput]
  );
  const petRoom = useMemo(
    () => (petWorldInput ? buildPetRoom(petWorldInput) : null),
    [petWorldInput]
  );
  const petProgression = useMemo(
    () => (petWorldInput ? buildPetProgression(petWorldInput) : null),
    [petWorldInput]
  );
  const petRewards = useMemo(
    () => (petWorldInput ? buildPetRewards(petWorldInput) : null),
    [petWorldInput]
  );
  const petHabitat = useMemo(
    () =>
      petWorldInput && petProgression && petRewards
        ? buildPetHabitat(petWorldInput, petProgression, petRewards)
        : null,
    [petProgression, petRewards, petWorldInput]
  );
  const petCodex = useMemo(
    () =>
      petProgression && petRewards && petRoom && petHabitat
        ? buildPetCodex({
            drops: data?.drops ?? [],
            progression: petProgression,
            rewards: petRewards,
            room: petRoom,
            habitat: petHabitat
          })
        : null,
    [data?.drops, petHabitat, petProgression, petRewards, petRoom]
  );
  const setupGuideHint = useMemo(
    () => buildSetupGuideHint(setupPreflight, data?.settings ?? DEFAULT_SETTINGS),
    [data?.settings, setupPreflight]
  );
  useEffect(() => {
    if (!petCodex) {
      return;
    }

    const entryIds = new Set(
      petCodex.chapters.flatMap((chapter) => chapter.entries.map((entry) => entry.id))
    );

    if (!selectedCodexEntryId || !entryIds.has(selectedCodexEntryId)) {
      setSelectedCodexEntryId(petCodex.featuredEntryId);
    }
  }, [petCodex, selectedCodexEntryId]);

  useEffect(() => {
    if (!petProgression || !petRewards) {
      return;
    }

    const snapshot = createPetCeremonySnapshot(petProgression, petRewards);
    const previousSnapshot = petCeremonySnapshotRef.current;
    petCeremonySnapshotRef.current = snapshot;

    if (!previousSnapshot) {
      return;
    }

    const nextCeremony = buildPetCeremony(previousSnapshot, petProgression, petRewards);
    if (!nextCeremony) {
      return;
    }

    setPetCeremony(nextCeremony);
    setPetEvent(null);
    setPetInteractionCue({
      id: nextCeremony.id,
      kind: 'cheer',
      emotion: nextCeremony.kind === 'level-up' ? 'proud' : 'celebrate',
      emotionLabel: nextCeremony.badge,
      headline: nextCeremony.title,
      statusLine: nextCeremony.detail,
      scripts: nextCeremony.scripts,
      durationMs: 5600
    });
  }, [petProgression, petRewards]);

  useEffect(() => {
    if (
      !data ||
      !petPersonaInput ||
      !data.settings.setupGuideCompleted ||
      data.activeRun ||
      Boolean(highlightedDropName) ||
      Boolean(busyKey) ||
      Boolean(petInteractionCue) ||
      Boolean(petFishingCatch) ||
      showSetupGuide
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const fishingCatch = createPetFishingCatch(petPersonaInput);
      setPetFishingCatch(fishingCatch);
      setPetEvent(null);
      setPetInteractionCue(buildPetFishingInteractionCue(fishingCatch));
    }, 16_000 + Math.floor(Math.random() * 10_000));

    return () => window.clearTimeout(timer);
  }, [
    busyKey,
    data,
    highlightedDropName,
    petInteractionCue,
    petFishingCatch,
    petPersonaInput,
    showSetupGuide
  ]);

  useEffect(() => {
    if (
      !data ||
      !petWorldInput ||
      Boolean(busyKey) ||
      Boolean(petInteractionCue) ||
      Boolean(petEvent) ||
      showSetupGuide
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPetEvent(createPetEvent(petWorldInput));
    }, 26_000 + Math.floor(Math.random() * 12_000));

    return () => window.clearTimeout(timer);
  }, [busyKey, data, petEvent, petInteractionCue, petWorldInput, showSetupGuide]);

  useEffect(() => {
    const root = panelStackRef.current;
    if (!root) {
      return;
    }

    const handleNativeWheel = (event: WheelEvent) => {
      if (showPetCodex || shouldIgnorePanelWheelTarget(event.target)) {
        return;
      }

      if (scrollPanelByDelta(event.deltaY, event.deltaMode)) {
        event.preventDefault();
      }
    };

    root.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => root.removeEventListener('wheel', handleNativeWheel);
  }, [activeTab, showPetCodex]);

  useEffect(() => {
    const root = panelStackRef.current;
    if (!root) {
      return;
    }

    let frame = 0;
    const scheduleRefresh = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        refreshPanelScrollState();
      });
    };

    const mutationObserver = new MutationObserver(() => {
      scheduleRefresh();
    });

    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true
    });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        scheduleRefresh();
      });
      resizeObserver.observe(root);
      Array.from(root.children).forEach((child) => resizeObserver?.observe(child));
    }

    root.addEventListener('scroll', scheduleRefresh, { passive: true });
    window.addEventListener('resize', scheduleRefresh);
    scheduleRefresh();

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      root.removeEventListener('scroll', scheduleRefresh);
      window.removeEventListener('resize', scheduleRefresh);
    };
  }, [activeTab, showCompanionDetails, showPetCodex, showSetupGuide]);

  useEffect(() => {
    panelStackRef.current?.focus({ preventScroll: true });
  }, [activeTab, showPetCodex]);

  if (!data) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <p className="eyebrow">Booting</p>
          <h2>正在唤起桌宠助手</h2>
          <p>首次启动会创建数据、截图和日志目录，请稍等一下。</p>
        </div>
      </div>
    );
  }

  function refreshSetupGuide() {
    setSetupGuideTick((current) => current + 1);
  }

  function handlePetHeadpat() {
    if (!petPersonaInput) {
      return;
    }

    setPetInteractionCue(createPetInteractionCue('headpat', petPersonaInput));
  }

  function handlePetCheer() {
    if (!petPersonaInput) {
      return;
    }

    setPetInteractionCue(createPetInteractionCue('cheer', petPersonaInput));
  }

  function handlePetEventAction() {
    if (!petEvent) {
      return;
    }

    const action = petEvent.action;
    setPetEvent(null);

    switch (action) {
      case 'open-companion':
        handleOpenPanel('companion');
        return;
      case 'open-drops':
        handleOpenPanel('drops');
        return;
      case 'open-workshop':
        handleOpenPanel('workshop');
        return;
      case 'open-setup':
        handleOpenSetupGuide();
        return;
      case 'start-latest':
        void handleStartRun(recentRuns[0]?.mapName ?? '3C');
        return;
      case 'start-default':
        void handleStartRun('3C');
        return;
    }
  }

  async function handleStartRun(mapName: string) {
    setBusyKey('start-run');
    setMessage(null);

    try {
      const nextData = await window.d2Pet.startRun({ mapName });
      setData(nextData);
      setMessage({
        kind: 'success',
        text: `${mapName} 自动计数已待命。你进游戏后会自动开始计时。`
      });
    } catch (error) {
      setMessage({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleStopRun() {
    setBusyKey('stop-run');
    setMessage(null);

    try {
      const nextData = await window.d2Pet.stopRun();
      setData(nextData);
      setMessage({ kind: 'success', text: '自动计数已停止，本次陪刷统计已经写入今日记录。' });
    } catch (error) {
      setMessage({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleResetCounterHistory() {
    const confirmed = window.confirm(
      '确认清空 3C 计数历史吗？这会清掉已完成场次、总耗时和平均耗时。'
    );
    if (!confirmed) {
      return;
    }

    setBusyKey('reset-run-history');
    setMessage(null);

    try {
      const nextData = await window.d2Pet.resetCounterHistory();
      setData(nextData);
      setMessage({
        kind: 'success',
        text: '3C 计数历史已经清空，可以重新开始新一轮统计。'
      });
      announceSurfaceNotice({
        tone: 'success',
        title: '计数历史已重置',
        detail: '本轮统计已经归零，后续会从第 1 把重新累计。'
      });
    } catch (error) {
      setMessage({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setBusyKey(null);
    }
  }

  async function handlePickCounterSceneTemplate() {
    setBusyKey('pick-counter-template');
    setMessage(null);

    try {
      const picked = await window.d2Pet.pickCounterSceneTemplate();
      if (!picked) {
        return;
      }

      const nextData = await window.d2Pet.updateSettings({
        patch: {
          counterSceneTemplatePath: picked.path,
          defaultRunMapName: '3C'
        }
      });
      setData(nextData);
      setMessage({
        kind: 'success',
        text: `3C 地图名截图已接入：${picked.fileName}`
      });
      announceSurfaceNotice({
        tone: 'success',
        title: '3C 模板已更新',
        detail: '后续会优先按这张地图名截图识别 3C，并用它来自动计数。'
      });
    } catch (error) {
      setMessage({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleCreateDrop(payload: CreateDropInput & { imageDataUrl?: string }) {
    setBusyKey('create-drop');
    setMessage(null);

    try {
      let screenshotPath: string | undefined = payload.screenshotPath;
      if (!screenshotPath && payload.imageDataUrl) {
        const image = await window.d2Pet.saveImage({
          dataUrl: payload.imageDataUrl,
          suggestedName: payload.itemName
        });
        screenshotPath = image.path;
      }

      const nextData = await window.d2Pet.createDrop({
        itemName: payload.itemName,
        mapName: payload.mapName,
        note: payload.note,
        screenshotPath,
        ocrText: payload.ocrText,
        ocrEngine: payload.ocrEngine,
        ocrItemName: payload.ocrItemName
      });
      setData(nextData);
      setActiveTab('drops');
      setMessage({ kind: 'success', text: '掉落记录已经保存。' });
    } catch (error) {
      setMessage({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setBusyKey(null);
    }
  }

  async function handlePreviewDropOcr(payload: DropOcrPreviewInput): Promise<DropOcrResult> {
    return window.d2Pet.previewDropOcr(payload);
  }

  async function handleRunAutomationTask(
    payload: RunAutomationTaskInput
  ): Promise<IntegrationRunResponse> {
    setBusyKey(`task-${payload.id}-${payload.mode}`);
    setMessage(null);

    try {
      let nextPayload = payload;
      if (
        payload.id === 'gem-cube' &&
        payload.drafts.gemInputMode === 'scan-image' &&
        payload.gemImageDataUrl
      ) {
        const image = await window.d2Pet.saveImage({
          dataUrl: payload.gemImageDataUrl,
          suggestedName: 'gem-scan'
        });

        nextPayload = {
          ...payload,
          gemImageDataUrl: undefined,
          drafts: {
            ...payload.drafts,
            gemImagePath: image.path
          }
        };
      }

      const response = await window.d2Pet.runAutomationTask(nextPayload);
      setData(response.data);
      setMessage({
        kind: response.result.success ? 'success' : 'error',
        text: response.result.success
          ? payload.mode === 'dry-run'
            ? '试运行已经完成，计划和日志已经更新。'
            : '自动化任务执行完成。'
          : response.result.stderr || '自动化任务执行失败。'
      });
      refreshSetupGuide();
      return response;
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: 'error', text });
      throw new Error(text);
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRunAutomationAdmin(
    payload: RunAutomationAdminInput
  ): Promise<IntegrationRunResponse> {
    setBusyKey(`admin-${payload.id}-${payload.action}`);
    setMessage(null);

    try {
      const response = await window.d2Pet.runAutomationAdmin(payload);
      setData(response.data);
      setMessage({
        kind: response.result.success ? 'success' : 'error',
        text: response.result.success
          ? getAdminSuccessText(payload.action)
          : response.result.stderr || '自动化工具操作失败。'
      });
      refreshSetupGuide();
      return response;
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: 'error', text });
      throw new Error(text);
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRunEnvironmentAction(
    payload: RunEnvironmentActionInput
  ): Promise<EnvironmentActionResponse> {
    setBusyKey(`env-${payload.action}`);
    setMessage(null);

    try {
      const response = await window.d2Pet.runEnvironmentAction(payload);
      const successText =
        payload.action === 'install-python-deps'
          ? 'Python 运行依赖安装完成。'
          : '内置 Python 运行环境准备完成。';

      setMessage({
        kind: response.result.success ? 'success' : 'error',
        text: response.result.success
          ? successText
          : response.result.stderr || '环境修复失败。'
      });
      setSetupGuideActivity({
        title:
          payload.action === 'install-python-deps'
            ? '依赖安装结果'
            : '运行环境处理结果',
        detail: response.result.success
          ? successText
          : response.result.stderr || response.result.stdout || '环境修复失败。',
          tone: response.result.success ? 'success' : 'error',
        timestampLabel: getSetupActivityTimeLabel(),
        logPreview: getLogPreview(response.log.content)
      });
      refreshSetupGuide();
      return response;
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: 'error', text });
      setSetupGuideActivity({
        title: '引导动作执行失败',
        detail: text,
        tone: 'error',
        timestampLabel: getSetupActivityTimeLabel()
      });
      throw new Error(text);
    } finally {
      setBusyKey(null);
    }
  }

  async function handleInstallAllEnvironments() {
    setBusyKey('env-install-all');
    setMessage(null);

    try {
      setSetupGuideActivity({
        title: '一键安装',
        detail: '正在准备内置 Python 运行环境...',
        tone: 'attention',
        timestampLabel: getSetupActivityTimeLabel()
      });

      const runtimeResponse = await window.d2Pet.runEnvironmentAction({ action: 'install-python-runtime' });
      if (!runtimeResponse.result.success) {
        throw new Error(runtimeResponse.result.stderr || 'Python 环境安装失败');
      }

      setSetupGuideActivity({
        title: '一键安装',
        detail: 'Python 环境准备完成，正在安装依赖...',
        tone: 'attention',
        timestampLabel: getSetupActivityTimeLabel()
      });

      const depsResponse = await window.d2Pet.runEnvironmentAction({ action: 'install-python-deps' });
      if (!depsResponse.result.success) {
        throw new Error(depsResponse.result.stderr || '依赖安装失败');
      }

      setMessage({ kind: 'success', text: '一键安装环境及依赖完成。' });
      setSetupGuideActivity({
        title: '一键安装结果',
        detail: '内置 Python 运行环境及依赖均已准备就绪。',
        tone: 'success',
        timestampLabel: getSetupActivityTimeLabel()
      });
      refreshSetupGuide();
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: 'error', text });
      setSetupGuideActivity({
        title: '一键安装失败',
        detail: text,
        tone: 'error',
        timestampLabel: getSetupActivityTimeLabel()
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleGetAutomationLog(
    id: RunAutomationTaskInput['id']
  ): Promise<AutomationLogDocument> {
    return window.d2Pet.getAutomationLog(id);
  }

  async function handleGetAutomationPreflight(
    payload: AutomationPreflightInput
  ): Promise<AutomationPreflightResponse> {
    return window.d2Pet.getAutomationPreflight(payload);
  }

  async function handleOpenPath(targetPath: string) {
    try {
      const result = await window.d2Pet.openPath(targetPath);
      if (result) {
        setMessage({ kind: 'error', text: result });
      }
    } catch (error) {
      setMessage({ kind: 'error', text: getErrorMessage(error) });
    }
  }

  async function handleExportTextFile(
    payload: ExportTextFileInput
  ): Promise<ExportTextFileResult> {
    try {
      const result = await window.d2Pet.exportTextFile(payload);
      if (!result.canceled && result.path) {
        setMessage({ kind: 'success', text: `文件已导出到 ${result.path}` });
      }
      return result;
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: 'error', text });
      throw new Error(text);
    }
  }

  async function handleCopyText(text: string) {
    try {
      await window.d2Pet.copyText({ text });
      setMessage({ kind: 'success', text: '诊断内容已经复制到剪贴板。' });
    } catch (error) {
      const nextText = getErrorMessage(error);
      setMessage({ kind: 'error', text: nextText });
      throw new Error(nextText);
    }
  }

  async function handleExportVisualReport(
    payload: ExportVisualReportInput
  ): Promise<ExportVisualReportResult> {
    try {
      const result = await window.d2Pet.exportVisualReport(payload);
      if (!result.canceled && result.path) {
        setMessage({
          kind: 'success',
          text:
            payload.format === 'pdf'
              ? `战报 PDF 已导出到 ${result.path}`
              : `战报海报已导出到 ${result.path}`
        });
      }
      return result;
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: 'error', text });
      throw new Error(text);
    }
  }

  async function handleUpdateSettings(patch: Partial<AppData['settings']>) {
    setBusyKey('settings');
    setMessage(null);

    try {
      const nextData = await window.d2Pet.updateSettings({ patch });
      setData(nextData);
      refreshSetupGuide();

      if (typeof patch.alwaysOnTop === 'boolean') {
        setMessage({
          kind: 'success',
          text: patch.alwaysOnTop ? '桌宠已经置顶。' : '桌宠已经取消置顶。'
        });
      } else if (typeof patch.launchOnStartup === 'boolean') {
        setMessage({
          kind:
            nextData.settings.launchOnStartup === patch.launchOnStartup
              ? 'success'
              : 'error',
          text:
            nextData.settings.launchOnStartup === patch.launchOnStartup
              ? nextData.settings.launchOnStartup
                ? '已启用开机自启。'
                : '已关闭开机自启。'
              : '当前环境未能切换开机自启，建议打包后再验证一次。'
        });
      } else if (typeof patch.notificationsEnabled === 'boolean') {
        setMessage({
          kind: 'success',
          text: nextData.settings.notificationsEnabled
            ? '已开启系统通知。'
            : '已关闭系统通知。'
        });
      } else if (typeof patch.autoCounterEnabled === 'boolean') {
        setMessage({
          kind: 'success',
          text: nextData.settings.autoCounterEnabled
            ? `已开启全自动整轮。识别到 ${nextData.settings.defaultRunMapName} 地图名后，会自动开始计数。`
            : '已关闭全自动整轮，后续只会在你手动开始时计数。'
        });
      } else if (typeof patch.counterLockEnabled === 'boolean') {
        setMessage({
          kind: 'success',
          text: nextData.settings.counterLockEnabled
            ? '计数器已锁定，按 Alt+Shift+L 可以解锁。'
            : '计数器已解锁，现在可以继续点击和拖动窗口。'
        });
      } else if (typeof patch.counterRecognitionIntervalSeconds === 'number') {
        setMessage({
          kind: 'success',
          text: `识别间隔已更新为 ${nextData.settings.counterRecognitionIntervalSeconds} 秒。`
        });
      } else if (typeof patch.counterSceneTemplatePath === 'string') {
        setMessage({
          kind: 'success',
          text: nextData.settings.counterSceneTemplatePath
            ? '3C 地图名截图已经更新。'
            : '3C 地图名截图已清空。'
        });
      } else if (typeof patch.defaultRunMapName === 'string') {
        setMessage({
          kind: 'success',
          text: `默认刷图路线已改成 ${nextData.settings.defaultRunMapName}。`
        });
      } else if (typeof patch.setupGuideCompleted === 'boolean') {
        setMessage({
          kind: 'success',
          text: patch.setupGuideCompleted
            ? '首次引导已经标记完成。'
            : '首次引导已经重新开启。'
        });
      }
    } catch (error) {
      setMessage({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setBusyKey(null);
    }
  }

  function handleSwitchWindowMode(mode: WindowMode) {
    if (data.settings.windowMode === mode) {
      return;
    }

    void handleUpdateSettings({ windowMode: mode });
  }

  function scrollPanelToTop(behavior: ScrollBehavior = 'smooth') {
    panelStackRef.current?.scrollTo({ top: 0, behavior });
  }

  function refreshPanelScrollState() {
    const root = panelStackRef.current;
    if (!root) {
      setPanelScrollState({
        canScrollUp: false,
        canScrollDown: false,
        progress: 0
      });
      return;
    }

    const maxTop = Math.max(0, root.scrollHeight - root.clientHeight);
    const nextState: PanelScrollState = {
      canScrollUp: root.scrollTop > 4,
      canScrollDown: root.scrollTop < maxTop - 4,
      progress: maxTop > 0 ? Math.round((root.scrollTop / maxTop) * 100) : 0
    };

    setPanelScrollState((current) =>
      current.canScrollUp === nextState.canScrollUp &&
      current.canScrollDown === nextState.canScrollDown &&
      current.progress === nextState.progress
        ? current
        : nextState
    );
  }

  function handleSelectTab(tab: TabKey) {
    const isSameTab = activeTab === tab;
    const tabMeta = getTabMeta(tab);
    const collapsedCompanionOverlays =
      tab === 'companion' && (showSetupGuide || showCompanionDetails || showPetCodex);

    setActiveTab(tab);
    setShowPetCodex(false);

    if (tab === 'companion') {
      setShowSetupGuide(false);
      setShowCompanionDetails(false);
    }

    window.requestAnimationFrame(() => {
      scrollPanelToTop(isSameTab ? 'auto' : 'smooth');
      refreshPanelScrollState();
    });

    setSurfaceNotice({
      tone: isSameTab ? 'success' : 'attention',
      title: isSameTab ? `${tabMeta.label} 已回到第一页` : `已切换到 ${tabMeta.label}`,
      detail: isSameTab
        ? collapsedCompanionOverlays
          ? '我顺手把陪刷页里展开的层收回去了，主路径已经回到顶部。'
          : '当前页已经回到顶部，继续往下滚就能看到后面的内容。'
        : tabMeta.detail
    });
  }

  function shouldIgnorePanelWheelTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(
      target.closest('.pet-codex-overlay') ||
      target.closest('textarea, input, select, [contenteditable="true"], .code-view')
    );
  }

  function scrollPanelByDelta(deltaY: number, deltaMode: number): boolean {
    const root = panelStackRef.current;
    if (!root || root.scrollHeight <= root.clientHeight + 1) {
      return false;
    }

    const multiplier =
      deltaMode === 1 ? 20 : deltaMode === 2 ? root.clientHeight : 1;
    const maxTop = Math.max(0, root.scrollHeight - root.clientHeight);
    const nextTop = Math.max(0, Math.min(maxTop, root.scrollTop + deltaY * multiplier));

    if (Math.abs(nextTop - root.scrollTop) < 1) {
      return false;
    }

    root.scrollTop = nextTop;
    return true;
  }

  function handlePanelWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (showPetCodex) {
      return;
    }

    if (shouldIgnorePanelWheelTarget(event.target)) {
      return;
    }

    if (scrollPanelByDelta(event.deltaY, event.deltaMode)) {
      event.preventDefault();
    }
  }

  function handlePanelScroll() {
    refreshPanelScrollState();
  }

  function handleOpenPanel(tab: TabKey) {
    handleSelectTab(tab);

    if (data.settings.windowMode !== 'panel') {
      void handleUpdateSettings({ windowMode: 'panel' });
    }
  }

  function announceSurfaceNotice(notice: NonNullable<SurfaceNotice>) {
    setSurfaceNotice(notice);
  }

  function handleToggleCompanionDetails() {
    const nextExpanded = !showCompanionDetails;
    setShowCompanionDetails(nextExpanded);

    window.requestAnimationFrame(() => {
      scrollPanelToTop('smooth');
      refreshPanelScrollState();
    });

    announceSurfaceNotice({
      tone: nextExpanded ? 'attention' : 'success',
      title: nextExpanded ? '桌宠详情已展开' : '桌宠详情已收起',
      detail: nextExpanded
        ? '顶部已经展开成长、场景和开关设置，继续往下滚就能回到主内容。'
        : '我把桌宠壳收回到精简模式了，当前主路径已经回到最短视图。'
    });
  }

  function handleOpenSetupGuide() {
    handleSelectTab('companion');
    setShowPetCodex(false);
    setShowSetupGuide(true);
    refreshSetupGuide();

    if (data.settings.windowMode !== 'panel') {
      void handleUpdateSettings({ windowMode: 'panel' });
    }
  }

  function handleFollowSetupGuideHint() {
    switch (setupGuideHint.action) {
      case 'install-runtime':
        void handleRunEnvironmentAction({ action: 'install-python-runtime' });
        return;
      case 'install-deps':
        void handleRunEnvironmentAction({ action: 'install-python-deps' });
        return;
      case 'complete-guide':
        handleCompleteSetupGuide();
        return;
      case 'open-workshop-task':
        if (setupGuideHint.integrationId) {
          handleOpenWorkshopTaskFromGuide(setupGuideHint.integrationId);
          return;
        }
        handleOpenSetupGuide();
        return;
      case 'enable-floating':
        handleEnableFloatingFromGuide();
        return;
      case 'open-guide':
      default:
        handleOpenSetupGuide();
    }
  }

  function handleOpenWorkshopFromGuide() {
    handleOpenPanel('workshop');
  }

  function handleOpenWorkshopTaskFromGuide(id: IntegrationId) {
    handleOpenPanel('workshop');
    setWorkshopFocusId(id);
    setSetupGuideActivity({
      title: `下一步：去录${id === 'rune-cube' ? '符文' : id === 'gem-cube' ? '宝石' : '金币'}坐标`,
      detail: '我已经把你带到工坊对应任务卡了。看到高亮任务后，先点“录坐标”，按弹出的提示捕获坐标。',
      tone: 'attention',
      timestampLabel: getSetupActivityTimeLabel()
    });
  }

  function handleEnableFloatingFromGuide() {
    void handleUpdateSettings({ windowMode: 'floating' });
  }

  function handleEnableNotificationsFromGuide() {
    if (!data.settings.notificationsEnabled) {
      void handleUpdateSettings({ notificationsEnabled: true });
    }
  }

  function handleCompleteSetupGuide() {
    setSetupGuideActivity({
      title: '首次引导已完成',
      detail: '现在已经不再是“安家中”。你可以直接去工坊执行任务，或者开始记录刷图和掉落。',
      tone: 'success',
      timestampLabel: getSetupActivityTimeLabel()
    });
    void handleUpdateSettings({ setupGuideCompleted: true });
  }

  function handleOpenPetCodex(entryId?: string) {
    if (petCodex) {
      setSelectedCodexEntryId(entryId ?? petCodex.featuredEntryId);
    }

    setShowSetupGuide(false);
    setShowPetCodex(true);
    setActiveTab('companion');

    if (data.settings.windowMode !== 'panel') {
      void handleUpdateSettings({ windowMode: 'panel' });
    }
  }

  function handleClosePetCodex() {
    setShowPetCodex(false);
  }

  const defaultRouteName =
    data.settings.defaultRunMapName.trim() || recentRuns[0]?.mapName || '3C';
  const activeTabMeta = getTabMeta(activeTab);
  const busySummary = getBusySummary(busyKey);
  const panelScrollLabel = panelScrollState.canScrollDown
    ? panelScrollState.canScrollUp
      ? `已浏览 ${panelScrollState.progress}% ，继续下滑`
      : '向下滑动查看更多'
    : panelScrollState.canScrollUp
      ? '已经到底了'
      : '当前内容已全部显示';
  const panelStatusLabel = busySummary
    ? '处理中'
    : panelScrollState.canScrollDown
      ? '可下滑'
      : panelScrollState.canScrollUp
        ? '已到底'
        : '已全显';
  const panelFeedback = surfaceNotice ?? {
    title: `当前：${activeTabMeta.label}`,
    detail: busySummary ?? activeTabMeta.detail,
    tone: (busySummary ? 'attention' : 'neutral') as SurfaceNoticeTone
  };

  if (isFloatingMode) {
    return (
      <div className="scene scene-floating">
        <FloatingPet
          activeRun={data.activeRun}
          alwaysOnTop={data.settings.alwaysOnTop}
          busy={busyKey === 'start-run' || busyKey === 'stop-run'}
          event={petEvent}
          eventBusy={Boolean(busyKey)}
          ceremony={petCeremony}
          fishingCatch={petFishingCatch}
          highlightDropName={highlightedDropName}
          interactionCue={petInteractionCue}
          liveDurationText={activeDurationText}
          onMinimize={() => void window.d2Pet.minimize()}
          onEventAction={handlePetEventAction}
          onOpenCodex={() => handleOpenPetCodex()}
          onOpenCodexEntry={handleOpenPetCodex}
          onOpenDrops={() => handleOpenPanel('drops')}
          onOpenPanel={() => handleOpenPanel('companion')}
          onOpenSetupGuide={handleFollowSetupGuideHint}
          onOpenWorkshop={() => handleOpenPanel('workshop')}
          onPetCheer={handlePetCheer}
          onPetHeadpat={handlePetHeadpat}
          onStartRun={(mapName) => void handleStartRun(mapName)}
          onStopRun={() => void handleStopRun()}
          onToggleWindowMode={handleSwitchWindowMode}
          onToggleAlwaysOnTop={() =>
            void handleUpdateSettings({ alwaysOnTop: !data.settings.alwaysOnTop })
          }
          preflight={setupPreflight}
          preflightBusy={setupPreflightBusy}
          progression={petProgression!}
          rewards={petRewards!}
          habitat={petHabitat!}
          recentDrops={todayDrops}
          recentRuns={recentRuns}
          room={petRoom!}
          scene={petScene!}
          snapPreview={floatingSnapPreview}
          setupGuideHint={setupGuideHint}
          setupGuideCompleted={data.settings.setupGuideCompleted}
          todayCount={todayStats.totalCount}
          todayDropCount={todayDrops.length}
        />

        {message ? (
          <div className={`toast ${message.kind === 'error' ? 'error' : 'success'}`}>
            {message.text}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="scene scene-panel">
      <div className="app-shell">
        <PetShell
          activeRun={data.activeRun}
          alwaysOnTop={data.settings.alwaysOnTop}
          event={petEvent}
          eventBusy={Boolean(busyKey)}
          ceremony={petCeremony}
          fishingCatch={petFishingCatch}
          highlightDropName={highlightedDropName}
          interactionCue={petInteractionCue}
          launchOnStartup={data.settings.launchOnStartup}
          liveDurationText={activeDurationText}
          notificationsEnabled={data.settings.notificationsEnabled}
          onEventAction={handlePetEventAction}
          onOpenCodex={() => handleOpenPetCodex()}
          onOpenCodexEntry={handleOpenPetCodex}
          onOpenSetupGuide={handleFollowSetupGuideHint}
          onPetCheer={handlePetCheer}
          onPetHeadpat={handlePetHeadpat}
          onMinimize={() => void window.d2Pet.minimize()}
          onToggleAlwaysOnTop={() =>
            void handleUpdateSettings({ alwaysOnTop: !data.settings.alwaysOnTop })
          }
          onToggleLaunchOnStartup={() =>
            void handleUpdateSettings({
              launchOnStartup: !data.settings.launchOnStartup
            })
          }
          onToggleNotifications={() =>
            void handleUpdateSettings({
              notificationsEnabled: !data.settings.notificationsEnabled
            })
          }
          onToggleWindowMode={handleSwitchWindowMode}
          preflight={setupPreflight}
          progression={petProgression!}
          rewards={petRewards!}
          habitat={petHabitat!}
          recentDrops={todayDrops}
          recentRuns={recentRuns}
          room={petRoom!}
          scene={petScene!}
          setupGuideHint={setupGuideHint}
          setupGuideCompleted={data.settings.setupGuideCompleted}
          detailsExpanded={showCompanionDetails}
          todayCount={todayStats.totalCount}
          todayDropCount={todayDrops.length}
          onToggleDetails={handleToggleCompanionDetails}
        />

        <nav className="tab-row">
          <button
            className={activeTab === 'companion' ? 'tab-button active' : 'tab-button'}
            onClick={() => handleSelectTab('companion')}
            type="button"
          >
            陪刷
          </button>
          <button
            className={activeTab === 'drops' ? 'tab-button active' : 'tab-button'}
            onClick={() => handleSelectTab('drops')}
            type="button"
          >
            战报
          </button>
          <button
            className={activeTab === 'workshop' ? 'tab-button active' : 'tab-button'}
            onClick={() => handleSelectTab('workshop')}
            type="button"
          >
            工坊
          </button>
        </nav>

        <article className={`page-feedback-bar tone-${panelFeedback.tone}`}>
          <div>
            <p className="eyebrow">{activeTabMeta.label}</p>
            <strong>{panelFeedback.title}</strong>
            <p className="secondary-text">{panelFeedback.detail}</p>
          </div>
          <div className="page-feedback-meta">
            <span className={`status-pill ${busySummary ? 'attention' : 'success'}`}>
              {panelStatusLabel}
            </span>
            <span className="helper-text">{panelScrollLabel}</span>
          </div>
        </article>

        <div
          className={[
            'panel-stack',
            activeTab === 'companion' ? 'panel-stack-companion' : '',
            panelScrollState.canScrollUp ? 'has-top-hint' : '',
            panelScrollState.canScrollDown ? 'has-bottom-hint' : ''
          ]
            .filter(Boolean)
            .join(' ')}
          onWheelCapture={handlePanelWheel}
          onScroll={handlePanelScroll}
          ref={panelStackRef}
          tabIndex={-1}
        >
          {activeTab === 'companion' ? (
            <PanelErrorBoundary
              onReset={() => handleSelectTab('companion')}
              panelLabel="陪刷"
              resetKey={`companion-${showSetupGuide}-${showCompanionDetails}-${showPetCodex}-${data.settings.setupGuideCompleted}`}
            >
            <>
              {!data.settings.setupGuideCompleted && showSetupGuide ? (
                <SetupGuide
                  busyKey={busyKey}
                  error={setupPreflightError}
                  latestActivity={setupGuideActivity}
                  loading={setupPreflightBusy}
                  onComplete={handleCompleteSetupGuide}
                  onDismiss={() => setShowSetupGuide(false)}
                  onEnableFloating={handleEnableFloatingFromGuide}
                  onEnableNotifications={handleEnableNotificationsFromGuide}
                  onInstallRuntime={() =>
                    handleRunEnvironmentAction({ action: 'install-python-runtime' }).then(
                      () => undefined
                    )
                  }
                  onInstallDependencies={() =>
                    handleRunEnvironmentAction({ action: 'install-python-deps' }).then(() => undefined)
                  }
                  onInstallAllEnvironments={handleInstallAllEnvironments}
                  onNextAction={handleFollowSetupGuideHint}
                  onOpenWorkshop={handleOpenWorkshopFromGuide}
                  onOpenWorkshopTask={handleOpenWorkshopTaskFromGuide}
                  onRefresh={refreshSetupGuide}
                  nextAction={setupGuideHint}
                  preflight={setupPreflight}
                  settings={data.settings}
                />
              ) : null}

              <CounterPanel
                activeDurationText={activeDurationText}
                activeRun={data.activeRun}
                autoCounterEnabled={data.settings.autoCounterEnabled}
                busy={
                  busyKey === 'start-run' ||
                  busyKey === 'stop-run' ||
                  busyKey === 'reset-run-history' ||
                  busyKey === 'settings'
                }
                counterLocked={data.settings.counterLockEnabled}
                counterRecognitionIntervalSeconds={
                  data.settings.counterRecognitionIntervalSeconds
                }
                counterSceneTemplatePath={data.settings.counterSceneTemplatePath}
                counterSession={data.counterSession}
                defaultRouteName={defaultRouteName}
                historyStats={historyStats}
                onPickCounterSceneTemplate={handlePickCounterSceneTemplate}
                onResetCounterHistory={handleResetCounterHistory}
                onSaveDefaultRouteName={(mapName) =>
                  handleUpdateSettings({ defaultRunMapName: mapName })
                }
                onSaveCounterRecognitionInterval={(seconds) =>
                  handleUpdateSettings({ counterRecognitionIntervalSeconds: seconds })
                }
                onStartRun={handleStartRun}
                onStopRun={handleStopRun}
                onToggleCounterLock={(enabled) =>
                  handleUpdateSettings({ counterLockEnabled: enabled })
                }
                onToggleAutoCounter={(enabled) =>
                  handleUpdateSettings({ autoCounterEnabled: enabled })
                }
                recentRuns={recentRuns}
                setupGuideCompleted={data.settings.setupGuideCompleted}
              />

              {showPetCodex && petCodex ? (
                <PetCodexOverlay
                  codex={petCodex}
                  onClose={handleClosePetCodex}
                  onOpenDrops={() => handleSelectTab('drops')}
                  onOpenPath={handleOpenPath}
                  onOpenWorkshop={() => handleSelectTab('workshop')}
                  onSelectEntry={setSelectedCodexEntryId}
                  selectedEntryId={selectedCodexEntryId}
                  soundEnabled={data.settings.notificationsEnabled}
                />
              ) : null}
            </>
            </PanelErrorBoundary>
          ) : null}

          {activeTab === 'drops' ? (
            <PanelErrorBoundary
              onReset={() => handleSelectTab('drops')}
              panelLabel="战报"
              resetKey="drops"
            >
            <DropPanel
              busy={busyKey === 'create-drop'}
              drops={data.drops}
              onCreateDrop={handleCreateDrop}
              onExportText={handleExportTextFile}
              onExportVisual={handleExportVisualReport}
              onOpenPath={handleOpenPath}
              onPreviewOcr={handlePreviewDropOcr}
              onSurfaceNotice={announceSurfaceNotice}
              todayKey={todayKey}
            />
            </PanelErrorBoundary>
          ) : null}

          {activeTab === 'workshop' ? (
            <PanelErrorBoundary
              onReset={() => handleSelectTab('workshop')}
              panelLabel="工坊"
              resetKey="workshop"
            >
            <AutomationPanel
              busyKey={busyKey}
              highlightedTaskId={workshopFocusId}
              initialDrafts={data.automationDrafts}
              onCopyText={handleCopyText}
              onExportText={handleExportTextFile}
              integrations={data.integrations}
              onGetPreflight={handleGetAutomationPreflight}
              onGetLog={handleGetAutomationLog}
              onOpenPath={handleOpenPath}
              onRunAdmin={handleRunAutomationAdmin}
              onRunEnvironmentAction={handleRunEnvironmentAction}
              onRunTask={handleRunAutomationTask}
              onSurfaceNotice={announceSurfaceNotice}
            />
            </PanelErrorBoundary>
          ) : null}
        </div>

        {message ? (
          <div className={`toast ${message.kind === 'error' ? 'error' : 'success'}`}>
            {message.text}
          </div>
        ) : null}
      </div>
    </div>
  );
}

