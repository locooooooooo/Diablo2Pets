import { useEffect, useRef, useState } from 'react';
import { AutomationPanel } from './components/AutomationPanel';
import { CounterPanel } from './components/CounterPanel';
import { DropPanel } from './components/DropPanel';
import { FloatingPet } from './components/FloatingPet';
import { PetShell } from './components/PetShell';
import { formatDuration, getDayKey } from './lib/date';
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
  const latestDropIdRef = useRef<string | null>(null);

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

  const todayKey = getDayKey(new Date());
  const todayStats = buildTodayStats(data.runHistory, todayKey);
  const recentRuns = data.runHistory.slice(0, 6);
  const todayDrops = data.drops.filter((drop) => drop.dayKey === todayKey).slice(0, 12);
  const activeDurationText = data.activeRun
    ? formatDuration((now - new Date(data.activeRun.startedAt).getTime()) / 1000)
    : '00:00';
  const isFloatingMode = data.settings.windowMode === 'floating';

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

  if (isFloatingMode) {
    return (
      <div className="scene scene-floating">
        <FloatingPet
          activeRun={data.activeRun}
          alwaysOnTop={data.settings.alwaysOnTop}
          highlightDropName={highlightedDropName}
          liveDurationText={activeDurationText}
          onMinimize={() => void window.d2Pet.minimize()}
          onOpenDrops={() => handleOpenPanel('drops')}
          onOpenPanel={() => handleOpenPanel('companion')}
          onOpenWorkshop={() => handleOpenPanel('workshop')}
          onToggleAlwaysOnTop={() =>
            void handleUpdateSettings({ alwaysOnTop: !data.settings.alwaysOnTop })
          }
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
          launchOnStartup={data.settings.launchOnStartup}
          liveDurationText={activeDurationText}
          notificationsEnabled={data.settings.notificationsEnabled}
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
            <CounterPanel
              activeDurationText={activeDurationText}
              activeRun={data.activeRun}
              busy={busyKey === 'start-run' || busyKey === 'stop-run'}
              onGoToDrops={() => setActiveTab('drops')}
              onGoToWorkshop={() => setActiveTab('workshop')}
              onStartRun={handleStartRun}
              onStopRun={handleStopRun}
              recentDrops={todayDrops}
              recentRuns={recentRuns}
              stats={todayStats}
            />
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
