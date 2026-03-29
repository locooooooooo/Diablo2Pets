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
  buildSetupGuideHint,
  getIntegrationLabel,
  isTaskProfileReady
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
import { buildTodayStats } from './lib/stats';
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
  windowMode: 'panel',
  setupGuideCompleted: false,
  windowPlacement: {}
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return '发生了未知错误。';
}

function getAdminSuccessText(action: RunAutomationAdminInput['action']): string {
  switch (action) {
    case 'record-profile':
      return '坐标录制完成，日志已经更新。';
    case 'print-profile':
      return '当前坐标配置已输出到日志。';
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

type CompanionIssueTone = 'success' | 'attention' | 'error';

interface CompanionIssue {
  title: string;
  detail: string;
  tone: CompanionIssueTone;
}

function buildCompanionIssues(
  preflight: AutomationPreflightResponse | null,
  setupGuideCompleted: boolean
): CompanionIssue[] {
  if (!preflight) {
    return [
      {
        title: '正在检查当前环境',
        detail: '桌宠已经打开，正在读取内置运行环境、依赖和工坊状态。',
        tone: 'attention'
      }
    ];
  }

  const globalChecks = preflight.globalChecks ?? [];
  const tasks = preflight.tasks ?? [];
  const runtimeFailed = globalChecks.some(
    (check) =>
      ['runtime-root', 'python-command', 'pip-command', 'requirements-file', 'python-source'].includes(
        check.key
      ) && check.level === 'error'
  );
  const dependencyFailed = globalChecks.some(
    (check) =>
      ['python-dependencies', 'ocr-engine'].includes(check.key) && check.level === 'error'
  );
  const missingProfiles = tasks.filter((task) => !isTaskProfileReady(task));
  const warningTasks = tasks.filter((task) => task.status === 'warning');

  const issues: CompanionIssue[] = [];

  if (runtimeFailed) {
    issues.push({
      title: '内置运行环境还没完全就绪',
      detail: '先去工坊的环境区处理运行环境，处理完再执行自动化会稳定很多。',
      tone: 'error'
    });
  }

  if (dependencyFailed) {
    issues.push({
      title: '依赖还没装齐',
      detail: '当前主要缺少 Python 依赖或 OCR 能力，先去工坊补安装。',
      tone: 'error'
    });
  }

  if (missingProfiles.length > 0) {
    const labels = missingProfiles.map((task) => getIntegrationLabel(task.id));
    issues.push({
      title: `还缺坐标配置：${labels.join('、')}`,
      detail: '去工坊录好这些坐标后，符文、宝石、金币功能才能稳定执行。',
      tone: 'attention'
    });
  }

  if (!runtimeFailed && !dependencyFailed && missingProfiles.length === 0) {
    issues.push({
      title: '核心环境已经能用了',
      detail: setupGuideCompleted
        ? '现在可以直接刷图、记战报，或者去工坊试运行。'
        : '虽然引导还没点完成，但核心功能已经能用了，悬浮和通知可以后面再开。',
      tone: 'success'
    });
  }

  if (warningTasks.length > 0) {
    issues.push({
      title: '工坊还有提醒项',
      detail: warningTasks[0]?.summary ?? '建议先看一眼工坊预检，再决定是否马上执行。',
      tone: 'attention'
    });
  }

  return issues.slice(0, 2);
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('companion');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
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
  const nextWorkshopTask = useMemo(
    () =>
      (setupPreflight?.tasks ?? []).find(
        (task) => task.status !== 'ready' || !isTaskProfileReady(task)
      ) ?? null,
    [setupPreflight]
  );
  const companionIssues = useMemo(
    () => buildCompanionIssues(setupPreflight, data?.settings.setupGuideCompleted ?? false),
    [data?.settings.setupGuideCompleted, setupPreflight]
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

  if (!data) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <p className="eyebrow">Booting</p>
          <h2>正在唤醒桌宠助手</h2>
          <p>首次启动会创建本地数据目录、截图目录和自动化日志目录。</p>
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
        void handleStartRun(recentRuns[0]?.mapName ?? '混沌避难所');
        return;
      case 'start-default':
        void handleStartRun('混沌避难所');
        return;
    }
  }

  async function handleStartRun(mapName: string) {
    setBusyKey('start-run');
    setMessage(null);

    try {
      const nextData = await window.d2Pet.startRun({ mapName });
      setData(nextData);
      setMessage({ kind: 'success', text: '已经开始记录本次刷图。' });
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
      setMessage({ kind: 'success', text: '本次刷图已经完成并写入统计。' });
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
          ? 'Python 运行时依赖安装完成。'
          : '内置 Python 运行环境已准备完成。';

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
            : '内置运行环境处理结果',
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
      } else if (typeof patch.setupGuideCompleted === 'boolean') {
        setMessage({
          kind: 'success',
          text: patch.setupGuideCompleted ? '首次引导已经标记完成。' : '首次引导已重新开启。'
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

  function handleSelectTab(tab: TabKey) {
    const isSameTab = activeTab === tab;

    setActiveTab(tab);
    setShowPetCodex(false);

    if (tab === 'companion') {
      setShowSetupGuide(false);
      setShowCompanionDetails(false);
    }

    window.requestAnimationFrame(() => {
      scrollPanelToTop(isSameTab ? 'auto' : 'smooth');
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
    panelStackRef.current?.focus({ preventScroll: true });
  }, [activeTab, showPetCodex]);

  function handleOpenPanel(tab: TabKey) {
    handleSelectTab(tab);

    if (data.settings.windowMode !== 'panel') {
      void handleUpdateSettings({ windowMode: 'panel' });
    }
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

  const defaultRouteName = recentRuns[0]?.mapName ?? '混沌避难所';
  const companionFocusTitle = data.activeRun
    ? `正在记录 ${data.activeRun.mapName}`
    : !data.settings.setupGuideCompleted
      ? setupGuideHint.title
      : nextWorkshopTask
        ? `先补 ${getIntegrationLabel(nextWorkshopTask.id)} 这一条`
        : '现在可以直接开跑';
  const companionFocusDetail = data.activeRun
    ? '先刷完这一轮，再去战报补掉落；其他内容先不用看。'
    : !data.settings.setupGuideCompleted
      ? `${setupGuideHint.detail} 先把这一步补完，别的信息可以先忽略。`
      : nextWorkshopTask
        ? `${nextWorkshopTask.summary}。我建议先处理这一条，工坊才会更稳。`
        : '你现在只需要做三件事里的一个：开始一轮、去工坊试运行、去战报记掉落。';
  const companionFocusBadge = data.activeRun
    ? '当前任务'
    : !data.settings.setupGuideCompleted
      ? '下一步'
      : nextWorkshopTask
        ? '先补条件'
        : '已可开跑';

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
          onToggleDetails={() => setShowCompanionDetails((current) => !current)}
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

        <div
          className={activeTab === 'companion' ? 'panel-stack panel-stack-companion' : 'panel-stack'}
          onWheelCapture={handlePanelWheel}
          ref={panelStackRef}
          tabIndex={-1}
        >
          {activeTab === 'companion' ? (
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
                  onNextAction={handleFollowSetupGuideHint}
                  onOpenWorkshop={handleOpenWorkshopFromGuide}
                  onOpenWorkshopTask={handleOpenWorkshopTaskFromGuide}
                  onRefresh={refreshSetupGuide}
                  nextAction={setupGuideHint}
                  preflight={setupPreflight}
                  settings={data.settings}
                />
              ) : null}

              {!data.settings.setupGuideCompleted && !showSetupGuide ? (
                <article className="card setup-guide-reminder">
                  <div>
                    <p className="eyebrow">下一步</p>
                    <strong>{setupGuideHint.title}</strong>
                    <p className="secondary-text">
                      {setupGuideHint.detail}
                    </p>
                  </div>
                  <div className="tool-row">
                    <button className="primary-button" onClick={handleFollowSetupGuideHint} type="button">
                      {setupGuideHint.actionLabel}
                    </button>
                    <button className="ghost-button" onClick={handleOpenSetupGuide} type="button">
                      打开完整引导
                    </button>
                    <button className="ghost-button" onClick={handleCompleteSetupGuide} type="button">
                      直接完成
                    </button>
                  </div>
                </article>
              ) : null}

              {!showSetupGuide ? (
                <article className="card companion-focus-card">
                  <div className="integration-head">
                    <div>
                      <p className="eyebrow">{companionFocusBadge}</p>
                      <div className="card-title">{companionFocusTitle}</div>
                      <p className="secondary-text">{companionFocusDetail}</p>
                    </div>
                    <span className={`status-pill ${data.activeRun ? 'warm' : nextWorkshopTask ? 'attention' : 'success'}`}>
                      {data.activeRun
                        ? '先刷完这轮'
                        : !data.settings.setupGuideCompleted
                          ? '先补引导'
                          : nextWorkshopTask
                            ? '工坊待处理'
                            : '直接开跑'}
                    </span>
                  </div>

                  <div className="companion-focus-grid">
                    <article className="focus-step-card">
                      <span className="mini-pill">1</span>
                      <strong>
                        {data.activeRun
                          ? '先完成这一轮'
                          : !data.settings.setupGuideCompleted
                            ? setupGuideHint.title
                            : nextWorkshopTask
                              ? `去补 ${getIntegrationLabel(nextWorkshopTask.id)}`
                              : `开始 ${defaultRouteName}`}
                      </strong>
                      <p>
                        {data.activeRun
                          ? '刷完以后先结算本轮，再决定要不要记掉落。'
                          : !data.settings.setupGuideCompleted
                            ? '只跟着这一步走，不用先看养成和收藏。'
                            : nextWorkshopTask
                              ? '先把这条工坊线补齐，后面执行会更稳。'
                              : '先开一轮最熟的图，首页和战报就会开始有内容。'}
                      </p>
                    </article>
                    <article className="focus-step-card">
                      <span className="mini-pill">2</span>
                      <strong>工坊只做一件事</strong>
                      <p>进工坊后只看顶部高亮任务卡，先录坐标或先试运行，不要同时管三条线。</p>
                    </article>
                    <article className="focus-step-card">
                      <span className="mini-pill">3</span>
                      <strong>战报最后再补</strong>
                      <p>等真正刷完一轮，再去战报记掉落；现在可以先不用管收藏和养成。</p>
                    </article>
                  </div>

                  <div className="tool-row">
                    <button
                      className="primary-button"
                      disabled={busyKey === 'start-run' || busyKey === 'stop-run'}
                      onClick={() => {
                        if (data.activeRun) {
                          void handleStopRun();
                          return;
                        }

                        if (!data.settings.setupGuideCompleted) {
                          handleFollowSetupGuideHint();
                          return;
                        }

                        if (nextWorkshopTask) {
                          handleOpenWorkshopTaskFromGuide(nextWorkshopTask.id);
                          return;
                        }

                        void handleStartRun(defaultRouteName);
                      }}
                      type="button"
                    >
                      {data.activeRun
                        ? busyKey === 'stop-run'
                          ? '结算中...'
                          : '完成这一轮'
                        : !data.settings.setupGuideCompleted
                          ? setupGuideHint.actionLabel
                          : nextWorkshopTask
                            ? `去处理${getIntegrationLabel(nextWorkshopTask.id)}`
                            : `开始 ${defaultRouteName}`}
                    </button>
                    <button
                      className="ghost-button"
                      onClick={() =>
                        nextWorkshopTask
                          ? handleOpenWorkshopTaskFromGuide(nextWorkshopTask.id)
                          : handleSelectTab('workshop')
                      }
                      type="button"
                    >
                      打开工坊
                    </button>
                    <button
                      className="ghost-button"
                      onClick={() => handleSelectTab('drops')}
                      type="button"
                    >
                      打开战报
                    </button>
                    <button
                      className="ghost-button"
                      onClick={() => setShowCompanionDetails((current) => !current)}
                      type="button"
                    >
                      {showCompanionDetails ? '收起扩展状态' : '展开扩展状态'}
                    </button>
                  </div>

                  <div className="companion-issue-grid">
                    {companionIssues.map((issue) => (
                      <article
                        className={`companion-issue-card tone-${issue.tone}`}
                        key={`${issue.tone}-${issue.title}`}
                      >
                        <strong>{issue.title}</strong>
                        <p>{issue.detail}</p>
                      </article>
                    ))}
                  </div>
                </article>
              ) : null}

              {showCompanionDetails ? (
                <CounterPanel
                  activeDurationText={activeDurationText}
                  activeRun={data.activeRun}
                  busy={busyKey === 'start-run' || busyKey === 'stop-run'}
                  onFollowSetupGuideHint={handleFollowSetupGuideHint}
                  onOpenSetupGuide={handleOpenSetupGuide}
                  onGoToDrops={() => handleSelectTab('drops')}
                  onGoToWorkshop={() => handleSelectTab('workshop')}
                  onStartRun={handleStartRun}
                  onStopRun={handleStopRun}
                  preflight={setupPreflight}
                  preflightBusy={setupPreflightBusy}
                  recentDrops={todayDrops}
                  recentRuns={recentRuns}
                  setupGuideHint={setupGuideHint}
                  setupGuideCompleted={data.settings.setupGuideCompleted}
                  stats={todayStats}
                />
              ) : null}

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
          ) : null}

          {activeTab === 'drops' ? (
            <DropPanel
              busy={busyKey === 'create-drop'}
              drops={data.drops}
              onCreateDrop={handleCreateDrop}
              onExportText={handleExportTextFile}
              onExportVisual={handleExportVisualReport}
              onOpenPath={handleOpenPath}
              onPreviewOcr={handlePreviewDropOcr}
              todayKey={todayKey}
            />
          ) : null}

          {activeTab === 'workshop' ? (
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
            />
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
