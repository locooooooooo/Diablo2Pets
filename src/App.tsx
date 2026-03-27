import { useEffect, useMemo, useRef, useState } from 'react';
import { AutomationPanel } from './components/AutomationPanel';
import { CounterPanel } from './components/CounterPanel';
import { DropPanel } from './components/DropPanel';
import { FloatingPet } from './components/FloatingPet';
import { PetShell } from './components/PetShell';
import { SetupGuide } from './components/SetupGuide';
import {
  buildPetCeremony,
  createPetCeremonySnapshot,
  type PetCeremony
} from './lib/petCeremony';
import { formatDuration, getDayKey } from './lib/date';
import { buildPetHabitat } from './lib/petHabitat';
import {
  createPetInteractionCue,
  type PetInteractionCue
} from './lib/petPersona';
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return '发生了未知错误。';
}

function getAdminSuccessText(action: RunAutomationAdminInput['action']): string {
  switch (action) {
    case 'record-profile':
      return 'Profile 录制完成，日志已经更新。';
    case 'print-profile':
      return '当前 profile 已输出到日志。';
    case 'import-legacy-config':
      return '旧配置已经导入到新的 runtime。';
  }
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
  const [petInteractionCue, setPetInteractionCue] = useState<PetInteractionCue | null>(null);
  const [petCeremony, setPetCeremony] = useState<PetCeremony | null>(null);
  const [petEvent, setPetEvent] = useState<PetEvent | null>(null);
  const [floatingSnapPreview, setFloatingSnapPreview] = useState<FloatingSnapPreview>({
    visible: false,
    snapped: false
  });
  const [setupGuideTick, setSetupGuideTick] = useState(0);
  const [workshopFocusId, setWorkshopFocusId] = useState<IntegrationId | null>(null);
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
    if (!workshopFocusId) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setWorkshopFocusId(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [workshopFocusId]);

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
      Boolean(petInteractionCue)
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPetInteractionCue(createPetInteractionCue('idle-play', petPersonaInput));
    }, 16_000 + Math.floor(Math.random() * 10_000));

    return () => window.clearTimeout(timer);
  }, [
    busyKey,
    data,
    highlightedDropName,
    petInteractionCue,
    petPersonaInput
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
      setMessage({
        kind: response.result.success ? 'success' : 'error',
        text: response.result.success
          ? payload.action === 'install-python-deps'
            ? 'Python 运行时依赖安装完成。'
            : '环境修复动作已完成。'
          : response.result.stderr || '环境修复失败。'
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

  function handleOpenPanel(tab: TabKey) {
    setActiveTab(tab);

    if (data.settings.windowMode !== 'panel') {
      void handleUpdateSettings({ windowMode: 'panel' });
    }
  }

  function handleOpenSetupGuide() {
    setActiveTab('companion');
    setShowSetupGuide(true);
  }

  function handleOpenWorkshopFromGuide() {
    setActiveTab('workshop');
  }

  function handleOpenWorkshopTaskFromGuide(id: IntegrationId) {
    setActiveTab('workshop');
    setWorkshopFocusId(id);
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
    void handleUpdateSettings({ setupGuideCompleted: true });
  }

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
          highlightDropName={highlightedDropName}
          interactionCue={petInteractionCue}
          liveDurationText={activeDurationText}
          onMinimize={() => void window.d2Pet.minimize()}
          onEventAction={handlePetEventAction}
          onOpenDrops={() => handleOpenPanel('drops')}
          onOpenPanel={() => handleOpenPanel('companion')}
          onOpenSetupGuide={handleOpenSetupGuide}
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
          highlightDropName={highlightedDropName}
          interactionCue={petInteractionCue}
          launchOnStartup={data.settings.launchOnStartup}
          liveDurationText={activeDurationText}
          notificationsEnabled={data.settings.notificationsEnabled}
          onEventAction={handlePetEventAction}
          onOpenSetupGuide={handleOpenSetupGuide}
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
          setupGuideCompleted={data.settings.setupGuideCompleted}
          todayCount={todayStats.totalCount}
          todayDropCount={todayDrops.length}
        />

        <nav className="tab-row">
          <button
            className={activeTab === 'companion' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('companion')}
            type="button"
          >
            陪刷
          </button>
          <button
            className={activeTab === 'drops' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('drops')}
            type="button"
          >
            战报
          </button>
          <button
            className={activeTab === 'workshop' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('workshop')}
            type="button"
          >
            工坊
          </button>
        </nav>

        <div className="panel-stack">
          {activeTab === 'companion' ? (
            <>
              {!data.settings.setupGuideCompleted && showSetupGuide ? (
                <SetupGuide
                  busyKey={busyKey}
                  error={setupPreflightError}
                  loading={setupPreflightBusy}
                  onComplete={handleCompleteSetupGuide}
                  onDismiss={() => setShowSetupGuide(false)}
                  onEnableFloating={handleEnableFloatingFromGuide}
                  onEnableNotifications={handleEnableNotificationsFromGuide}
                  onInstallDependencies={() =>
                    handleRunEnvironmentAction({ action: 'install-python-deps' }).then(() => undefined)
                  }
                  onOpenWorkshop={handleOpenWorkshopFromGuide}
                  onOpenWorkshopTask={handleOpenWorkshopTaskFromGuide}
                  onRefresh={refreshSetupGuide}
                  preflight={setupPreflight}
                  settings={data.settings}
                />
              ) : null}

              {!data.settings.setupGuideCompleted && !showSetupGuide ? (
                <article className="card setup-guide-reminder">
                  <div>
                    <p className="eyebrow">Guide</p>
                    <strong>首次启动引导已收起</strong>
                    <p className="secondary-text">
                      你可以随时再打开，把 Python、依赖、Profile 和悬浮态继续补完整。
                    </p>
                  </div>
                  <div className="tool-row">
                    <button className="ghost-button" onClick={handleOpenSetupGuide} type="button">
                      继续引导
                    </button>
                    <button className="primary-button" onClick={handleCompleteSetupGuide} type="button">
                      直接完成
                    </button>
                  </div>
                </article>
              ) : null}

              <CounterPanel
                activeDurationText={activeDurationText}
                activeRun={data.activeRun}
                busy={busyKey === 'start-run' || busyKey === 'stop-run'}
                onOpenSetupGuide={handleOpenSetupGuide}
                onGoToDrops={() => setActiveTab('drops')}
                onGoToWorkshop={() => setActiveTab('workshop')}
                onStartRun={handleStartRun}
                onStopRun={handleStopRun}
                preflight={setupPreflight}
                preflightBusy={setupPreflightBusy}
                recentDrops={todayDrops}
                recentRuns={recentRuns}
                setupGuideCompleted={data.settings.setupGuideCompleted}
                stats={todayStats}
              />
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
