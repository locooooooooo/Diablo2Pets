import {
  useEffect,
  useMemo,
  useState,
  type ClipboardEvent as ReactClipboardEvent
} from 'react';
import { formatCompactDateTime } from '../lib/date';
import { parseAutomationLog } from '../lib/automationLog';
import type {
  AutomationAdminAction,
  AutomationCheckItem,
  AutomationDrafts,
  AutomationLogDocument,
  AutomationPreflightInput,
  AutomationPreflightResponse,
  AutomationPreflightTask,
  AutomationRunMode,
  GemInputMode,
  IntegrationConfig,
  IntegrationId,
  IntegrationRunResponse,
  RunAutomationAdminInput,
  RunAutomationTaskInput
} from '../types';

interface AutomationPanelProps {
  integrations: IntegrationConfig[];
  initialDrafts: AutomationDrafts;
  busyKey: string | null;
  onRunTask: (payload: RunAutomationTaskInput) => Promise<IntegrationRunResponse>;
  onRunAdmin: (payload: RunAutomationAdminInput) => Promise<IntegrationRunResponse>;
  onGetPreflight: (payload: AutomationPreflightInput) => Promise<AutomationPreflightResponse>;
  onGetLog: (id: IntegrationId) => Promise<AutomationLogDocument>;
  onOpenPath: (targetPath: string) => Promise<void>;
}

interface ViewerState {
  title: string;
  path?: string;
  content: string;
}

function getIntegration(
  integrations: IntegrationConfig[],
  id: IntegrationId
): IntegrationConfig {
  const target = integrations.find((item) => item.id === id);
  if (!target) {
    throw new Error(`Missing integration config for ${id}`);
  }

  return target;
}

function getTaskMeta(id: IntegrationId): { title: string; description: string } {
  switch (id) {
    case 'rune-cube':
      return {
        title: '自动合成低级符文',
        description: '读取符文数量后生成合成计划，适合先试运行再切回游戏执行。'
      };
    case 'gem-cube':
      return {
        title: '自动合成宝石',
        description: '支持矩阵输入和截图识别两种方式，适合共享仓库联调。'
      };
    case 'drop-shared-gold':
      return {
        title: '共享仓库丢金币',
        description: '根据总额和角色等级计算分批方案，降低手工重复操作。'
      };
  }
}

function getBusyKey(id: IntegrationId, mode: AutomationRunMode): string {
  return `task-${id}-${mode}`;
}

function getAdminBusyKey(id: IntegrationId, action: AutomationAdminAction): string {
  return `admin-${id}-${action}`;
}

function getModeLabel(mode: AutomationRunMode): string {
  return mode === 'dry-run' ? '试运行' : '立即执行';
}

function getStatusText(item: IntegrationConfig): string {
  return item.lastRunAt ? `上次执行 ${formatCompactDateTime(item.lastRunAt)}` : '尚未执行';
}

function getInputModeLabel(mode: GemInputMode): string {
  return mode === 'matrix' ? '输入矩阵' : '截图识别';
}

function getAdminLabel(action: AutomationAdminAction): string {
  switch (action) {
    case 'record-profile':
      return '录 Profile';
    case 'print-profile':
      return '看 Profile';
    case 'import-legacy-config':
      return '导旧配置';
  }
}

function getRecordSteps(id: IntegrationId): string[] {
  switch (id) {
    case 'rune-cube':
      return ['输出格', 'Transmute', '第 1 格符文', '第 9 格符文', '第 28 格符文'];
    case 'gem-cube':
      return [
        '输入格 1',
        '输入格 2',
        '输入格 3',
        '输出格',
        'Transmute',
        '结果落点',
        '第 1 堆宝石',
        '第 7 堆宝石',
        '第 29 堆宝石'
      ];
    case 'drop-shared-gold':
      return ['仓库物体', '共享标签', '仓库金币按钮', '背包金币按钮'];
  }
}

function getProfileNote(item: IntegrationConfig): string {
  if (item.supportsLegacyImport && item.legacyConfigPath) {
    return `默认旧配置路径：${item.legacyConfigPath}`;
  }

  return '这条任务线没有独立旧配置，建议直接录新的 profile。';
}

function readImageDataFromItems(items: DataTransferItemList): Promise<string | null> {
  const imageItem = Array.from(items).find((item) => item.type.startsWith('image/'));
  const imageFile = imageItem?.getAsFile();

  if (!imageFile) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('截图读取失败，请重新截图后再试。'));
    reader.readAsDataURL(imageFile);
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return '发生了未知错误。';
}

function getCheckToneClass(level: AutomationCheckItem['level']): string {
  switch (level) {
    case 'ok':
      return 'check-ok';
    case 'warning':
      return 'check-warning';
    case 'error':
      return 'check-error';
  }
}

function getTaskToneClass(task: AutomationPreflightTask | null): string {
  switch (task?.status) {
    case 'ready':
      return 'success';
    case 'warning':
      return 'attention';
    case 'error':
      return 'error';
    default:
      return 'attention';
  }
}

function getTaskHint(message?: string): string {
  if (!message) {
    return '先看预检，再决定是试运行还是正式执行。';
  }

  if (message.includes('未找到')) {
    return '通常是脚本、profile、旧配置或截图路径不存在，先看预检项里哪一条红了。';
  }

  if (message.includes('整数')) {
    return '检查数量、金额、等级这些输入是否都是整数。';
  }

  if (message.includes('截图')) {
    return '先粘贴截图，或者把现有截图路径填完整。';
  }

  if (message.includes('停用')) {
    return '任务当前被禁用了，先确认任务状态。';
  }

  if (message.includes('执行失败')) {
    return '先点“看日志”，再对照预检看是环境问题还是输入问题。';
  }

  return '如果这条结果不符合预期，优先看预检和日志。';
}

function getParsedTaskLabel(task: string): string {
  if (task === 'rune-cube' || task === 'gem-cube' || task === 'drop-shared-gold') {
    return getTaskMeta(task).title;
  }

  return task || '未知任务';
}

function getActionSummaryLabel(action: string): string {
  switch (action) {
    case 'dry-run':
      return '试运行';
    case 'execute':
      return '立即执行';
    case 'record-profile':
      return '录 Profile';
    case 'print-profile':
      return '看 Profile';
    case 'import-legacy-config':
      return '导旧配置';
    default:
      return action || '未命名动作';
  }
}

function getLogToneClass(success: boolean | null): string {
  if (success === true) {
    return 'success';
  }

  if (success === false) {
    return 'error';
  }

  return 'attention';
}

function getLogResultLabel(success: boolean | null): string {
  if (success === true) {
    return '执行成功';
  }

  if (success === false) {
    return '执行失败';
  }

  return '结果未知';
}

export function AutomationPanel(props: AutomationPanelProps) {
  const [drafts, setDrafts] = useState<AutomationDrafts>(props.initialDrafts);
  const [gemImageDataUrl, setGemImageDataUrl] = useState('');
  const [gemPasteHint, setGemPasteHint] = useState(
    '切到“截图识别”后，截图后直接按 Ctrl+V，下一次运行会自动保存到本地。'
  );
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [logBusyId, setLogBusyId] = useState<IntegrationId | null>(null);
  const [preflight, setPreflight] = useState<AutomationPreflightResponse | null>(null);
  const [preflightBusy, setPreflightBusy] = useState(false);
  const [preflightError, setPreflightError] = useState('');

  useEffect(() => {
    setDrafts(props.initialDrafts);
  }, [props.initialDrafts]);

  useEffect(() => {
    if (drafts.gemInputMode !== 'scan-image') {
      return undefined;
    }

    function handlePaste(event: ClipboardEvent) {
      if (!event.clipboardData) {
        return;
      }

      const hasImage = Array.from(event.clipboardData.items).some((item) =>
        item.type.startsWith('image/')
      );
      if (!hasImage) {
        return;
      }

      event.preventDefault();
      void readImageDataFromItems(event.clipboardData.items)
        .then((value) => {
          if (!value) {
            return;
          }

          setGemImageDataUrl(value);
          setGemPasteHint('新截图已经就绪，下一次试运行或执行会自动保存并用于识别。');
        })
        .catch(() => {
          setGemPasteHint('截图读取失败，请重新截图后再试。');
        });
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [drafts.gemInputMode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPreflightBusy(true);
      setPreflightError('');
      void props.onGetPreflight({
        drafts,
        hasGemClipboardImage: Boolean(gemImageDataUrl)
      })
        .then((value) => setPreflight(value))
        .catch((error) => {
          setPreflightError(getErrorMessage(error));
        })
        .finally(() => setPreflightBusy(false));
    }, 180);

    return () => window.clearTimeout(timer);
  }, [drafts, gemImageDataUrl]);

  const runeTask = getIntegration(props.integrations, 'rune-cube');
  const gemTask = getIntegration(props.integrations, 'gem-cube');
  const goldTask = getIntegration(props.integrations, 'drop-shared-gold');
  const preflightMap = useMemo(() => {
    return new Map((preflight?.tasks ?? []).map((task) => [task.id, task]));
  }, [preflight]);
  const parsedViewerLog = useMemo(() => {
    return viewer ? parseAutomationLog(viewer.content) : null;
  }, [viewer]);

  function updateDraft<Key extends keyof AutomationDrafts>(
    key: Key,
    value: AutomationDrafts[Key]
  ) {
    setDrafts((current) => ({
      ...current,
      [key]: value
    }));
  }

  function updateWaitSeconds(
    key: 'runeWaitSeconds' | 'gemWaitSeconds' | 'goldWaitSeconds',
    value: string
  ) {
    const nextValue = Number(value);
    updateDraft(key, Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : 0);
  }

  function clearGemImage() {
    setGemImageDataUrl('');
    setGemPasteHint('切到“截图识别”后，截图后直接按 Ctrl+V，下一次运行会自动保存到本地。');
  }

  async function handleGemPasteZone(event: ReactClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    try {
      const value = await readImageDataFromItems(event.clipboardData.items);
      if (!value) {
        return;
      }

      setGemImageDataUrl(value);
      setGemPasteHint('新截图已经就绪，下一次试运行或执行会自动保存并用于识别。');
    } catch {
      setGemPasteHint('截图读取失败，请重新截图后再试。');
    }
  }

  async function openLogViewer(id: IntegrationId, title: string) {
    setLogBusyId(id);
    try {
      const log = await props.onGetLog(id);
      setViewer({
        title,
        path: log.path,
        content: log.content
      });
    } catch (error) {
      setViewer({
        title,
        content: getErrorMessage(error)
      });
    } finally {
      setLogBusyId(null);
    }
  }

  async function runTask(id: IntegrationId, mode: AutomationRunMode) {
    try {
      const response = await props.onRunTask({
        id,
        mode,
        drafts,
        gemImageDataUrl:
          id === 'gem-cube' && drafts.gemInputMode === 'scan-image'
            ? gemImageDataUrl
            : undefined
      });

      if (response.result.success) {
        if (id === 'gem-cube' && gemImageDataUrl) {
          clearGemImage();
        }
        await openLogViewer(id, `${getTaskMeta(id).title} / ${getModeLabel(mode)}日志`);
      }
    } catch {
      return;
    }
  }

  async function runAdmin(item: IntegrationConfig, action: AutomationAdminAction) {
    try {
      const response = await props.onRunAdmin({
        id: item.id,
        action
      });

      if (response.result.success) {
        await openLogViewer(item.id, `${getTaskMeta(item.id).title} / ${getAdminLabel(action)}日志`);
      }
    } catch {
      return;
    }
  }

  function renderRunButtons(id: IntegrationId) {
    return (
      <>
        {(['dry-run', 'execute'] as AutomationRunMode[]).map((mode) => {
          const busy = props.busyKey === getBusyKey(id, mode);

          return (
            <button
              className={mode === 'execute' ? 'primary-button' : 'ghost-button'}
              disabled={props.busyKey !== null}
              key={mode}
              onClick={() => void runTask(id, mode)}
              type="button"
            >
              {busy ? `${getModeLabel(mode)}中...` : getModeLabel(mode)}
            </button>
          );
        })}
      </>
    );
  }

  function renderAdminButtons(item: IntegrationConfig) {
    return (
      <>
        <button
          className="ghost-button"
          disabled={props.busyKey !== null}
          onClick={() => void runAdmin(item, 'print-profile')}
          type="button"
        >
          {props.busyKey === getAdminBusyKey(item.id, 'print-profile')
            ? '读取中...'
            : '看 Profile'}
        </button>
        <button
          className="ghost-button"
          disabled={props.busyKey !== null}
          onClick={() => void runAdmin(item, 'record-profile')}
          type="button"
        >
          {props.busyKey === getAdminBusyKey(item.id, 'record-profile')
            ? '录制中...'
            : '录 Profile'}
        </button>
        {item.supportsLegacyImport ? (
          <button
            className="ghost-button"
            disabled={props.busyKey !== null}
            onClick={() => void runAdmin(item, 'import-legacy-config')}
            type="button"
          >
            {props.busyKey === getAdminBusyKey(item.id, 'import-legacy-config')
              ? '导入中...'
              : '导旧配置'}
          </button>
        ) : null}
        <button
          className="ghost-button"
          disabled={props.busyKey !== null || logBusyId === item.id}
          onClick={() => void openLogViewer(item.id, `${getTaskMeta(item.id).title} / 执行日志`)}
          type="button"
        >
          {logBusyId === item.id ? '读取日志中...' : '看日志'}
        </button>
      </>
    );
  }

  function renderGlobalChecks() {
    return (
      <article className="card preflight-banner">
        <div className="integration-head">
          <div>
            <div className="card-title">工坊预检</div>
            <p className="secondary-text">
              这里会实时检查 Python、runtime、profile 和当前输入条件，先扫雷再执行。
            </p>
          </div>
          <span className="status-pill">{preflightBusy ? '预检更新中' : '实时联调'}</span>
        </div>

        {preflightError ? (
          <div className="empty-state compact-empty">
            <strong>预检暂时失败</strong>
            <p>{preflightError}</p>
          </div>
        ) : (
          <div className="preflight-grid">
            {(preflight?.globalChecks ?? []).map((check) => (
              <div className={`check-chip ${getCheckToneClass(check.level)}`} key={check.key}>
                <strong>{check.label}</strong>
                <span>{check.detail}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    );
  }

  function renderTaskOverviewCard(item: IntegrationConfig) {
    const task = preflightMap.get(item.id) ?? null;
    const topChecks = task?.checks.slice(0, 3) ?? [];

    return (
      <article className={`overview-card overview-card-${getTaskToneClass(task)}`} key={item.id}>
        <div className="overview-head">
          <div>
            <span className="eyebrow">Task</span>
            <strong>{getTaskMeta(item.id).title}</strong>
          </div>
          <span className={`status-pill ${getTaskToneClass(task)}`}>
            {task?.status === 'ready'
              ? '可以开跑'
              : task?.status === 'warning'
                ? '先看提醒'
                : task?.status === 'error'
                  ? '先补条件'
                  : '等待预检'}
          </span>
        </div>
        <p>{task?.summary ?? getTaskMeta(item.id).description}</p>
        <div className="tag-row">
          {topChecks.length > 0
            ? topChecks.map((check) => (
                <span className={`mini-pill ${getCheckToneClass(check.level)}`} key={check.key}>
                  {check.label}
                </span>
              ))
            : <span className="mini-pill">正在准备预检结果</span>}
        </div>
      </article>
    );
  }

  function renderAdvancedDetails(item: IntegrationConfig) {
    return (
      <details className="tool-details">
        <summary>高级信息</summary>
        <div className="tool-details-content">
          <p className="helper-text">{getProfileNote(item)}</p>
          <p className="helper-text">当前 Profile：{item.profilePath}</p>
          <div className="tool-row">
            <button
              className="text-button"
              onClick={() => void props.onOpenPath(item.profilePath)}
              type="button"
            >
              打开 Profile 文件
            </button>
            {item.lastLogPath ? (
              <button
                className="text-button"
                onClick={() => void props.onOpenPath(item.lastLogPath as string)}
                type="button"
              >
                打开日志文件
              </button>
            ) : null}
          </div>
          <div className="sequence-chips">
            {getRecordSteps(item.id).map((step) => (
              <span className="mini-pill" key={step}>
                {step}
              </span>
            ))}
          </div>
          <p className="helper-text">录制时按 `F10` 捕获当前位置，按 `F12` 终止。</p>
        </div>
      </details>
    );
  }

  function renderTaskChecks(id: IntegrationId) {
    const task = preflightMap.get(id);

    if (!task) {
      return (
        <div className="empty-state compact-empty">
          <strong>正在等待预检结果</strong>
          <p>输入变化后会自动刷新，不需要手动点检测。</p>
        </div>
      );
    }

    return (
      <div className="preflight-list">
        {task.checks.map((check) => (
          <div className={`check-item ${getCheckToneClass(check.level)}`} key={check.key}>
            <div className="check-item-head">
              <strong>{check.label}</strong>
              <span>{check.level === 'ok' ? '正常' : check.level === 'warning' ? '提醒' : '阻塞'}</span>
            </div>
            <p>{check.detail}</p>
          </div>
        ))}
      </div>
    );
  }

  function renderTaskFooter(item: IntegrationConfig) {
    return (
      <>
        <div className="result-line">
          <span className={`status-dot status-${item.lastStatus ?? 'idle'}`} />
          <span>{getStatusText(item)}</span>
        </div>
        <p className="secondary-text">{item.lastMessage || '执行结果摘要会显示在这里。'}</p>
        <p className="helper-text">{getTaskHint(item.lastMessage)}</p>
      </>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Workshop</p>
          <h3>赫拉迪姆工坊</h3>
        </div>
        <span className="status-pill">预检、执行、维护和日志同屏闭环</span>
      </div>

      <article className="card safety-card">
        <div className="integration-head">
          <div>
            <div className="card-title">统一执行策略</div>
            <p className="secondary-text">先试运行看计划，再切回游戏执行，会更稳。</p>
          </div>
          <span className="status-chip">联调优先</span>
        </div>

        <label className="checkbox-row">
          <input
            checked={drafts.allowInactiveWindow}
            onChange={(event) => updateDraft('allowInactiveWindow', event.target.checked)}
            type="checkbox"
          />
          <span>允许在游戏窗口未置顶时继续点击</span>
        </label>
      </article>

      {renderGlobalChecks()}

      <div className="overview-grid">
        {[runeTask, gemTask, goldTask].map((item) => renderTaskOverviewCard(item))}
      </div>

      <div className="workshop-grid">
        <article className="card workshop-card">
          <div className="workshop-topbar">
            <div>
              <p className="eyebrow">builtin:rune_cubing</p>
              <div className="card-title">{getTaskMeta(runeTask.id).title}</div>
              <p className="secondary-text">{getTaskMeta(runeTask.id).description}</p>
            </div>
            <span className={`status-pill ${getTaskToneClass(preflightMap.get(runeTask.id) ?? null)}`}>
              {preflightMap.get(runeTask.id)?.status === 'ready'
                ? '可以开跑'
                : preflightMap.get(runeTask.id)?.status === 'warning'
                  ? '先看提醒'
                  : preflightMap.get(runeTask.id)?.status === 'error'
                    ? '先补条件'
                    : '等待预检'}
            </span>
          </div>

          <div className="task-section">
            <span className="task-section-label">运行</span>
            <div className="task-toolbar">{renderRunButtons('rune-cube')}</div>
          </div>
          <div className="task-section">
            <span className="task-section-label">维护</span>
            <div className="task-toolbar secondary">{renderAdminButtons(runeTask)}</div>
          </div>

          <label className="field">
            <span>符文数量</span>
            <textarea
              onChange={(event) => updateDraft('runeCounts', event.target.value)}
              placeholder="例如：12 6 0 0 0 0 0 0 0"
              rows={2}
              value={drafts.runeCounts}
            />
          </label>

          <div className="task-grid">
            <label className="field">
              <span>等待秒数</span>
              <input
                min={0}
                onChange={(event) => updateWaitSeconds('runeWaitSeconds', event.target.value)}
                type="number"
                value={drafts.runeWaitSeconds}
              />
            </label>
          </div>

          <p className="helper-text">空格分隔即可，执行前会先等几秒让你切回游戏。</p>
          {renderTaskChecks('rune-cube')}
          {renderAdvancedDetails(runeTask)}
          {renderTaskFooter(runeTask)}
        </article>

        <article className="card workshop-card">
          <div className="workshop-topbar">
            <div>
              <p className="eyebrow">builtin:gem_cubing</p>
              <div className="card-title">{getTaskMeta(gemTask.id).title}</div>
              <p className="secondary-text">{getTaskMeta(gemTask.id).description}</p>
            </div>
            <span className={`status-pill ${getTaskToneClass(preflightMap.get(gemTask.id) ?? null)}`}>
              {preflightMap.get(gemTask.id)?.status === 'ready'
                ? '可以开跑'
                : preflightMap.get(gemTask.id)?.status === 'warning'
                  ? '先看提醒'
                  : preflightMap.get(gemTask.id)?.status === 'error'
                    ? '先补条件'
                    : '等待预检'}
            </span>
          </div>

          <div className="task-section">
            <span className="task-section-label">运行</span>
            <div className="task-toolbar">{renderRunButtons('gem-cube')}</div>
          </div>
          <div className="task-section">
            <span className="task-section-label">维护</span>
            <div className="task-toolbar secondary">{renderAdminButtons(gemTask)}</div>
          </div>

          <div className="mode-switch">
            {(['matrix', 'scan-image'] as GemInputMode[]).map((mode) => (
              <button
                className={
                  drafts.gemInputMode === mode ? 'mode-button active' : 'mode-button'
                }
                key={mode}
                onClick={() => updateDraft('gemInputMode', mode)}
                type="button"
              >
                {getInputModeLabel(mode)}
              </button>
            ))}
          </div>

          {drafts.gemInputMode === 'matrix' ? (
            <label className="field">
              <span>宝石矩阵</span>
              <textarea
                onChange={(event) => updateDraft('gemMatrix', event.target.value)}
                placeholder="例如：10 5 2 0 0; 8 4 1 0 0"
                rows={3}
                value={drafts.gemMatrix}
              />
            </label>
          ) : (
            <div className="stack compact">
              <div
                className={`paste-zone compact-zone ${gemImageDataUrl ? 'ready' : ''}`}
                onPaste={handleGemPasteZone}
                tabIndex={0}
              >
                <div>
                  <strong>宝石截图粘贴区</strong>
                  <p>{gemPasteHint}</p>
                </div>
                {gemImageDataUrl ? (
                  <img alt="宝石截图预览" className="paste-preview" src={gemImageDataUrl} />
                ) : (
                  <span className="paste-empty">点这里后也可以直接 Ctrl+V 粘贴截图</span>
                )}
              </div>

              <label className="field">
                <span>或使用现有截图路径</span>
                <input
                  onChange={(event) => updateDraft('gemImagePath', event.target.value)}
                  placeholder="例如：E:\\screenshots\\gems.png"
                  value={drafts.gemImagePath}
                />
              </label>

              <div className="tool-row">
                <button className="ghost-button" onClick={clearGemImage} type="button">
                  清空截图
                </button>
                <button
                  className="ghost-button"
                  disabled={!drafts.gemImagePath.trim()}
                  onClick={() => void props.onOpenPath(drafts.gemImagePath)}
                  type="button"
                >
                  打开当前截图
                </button>
              </div>
            </div>
          )}

          <div className="task-grid">
            <label className="field">
              <span>等待秒数</span>
              <input
                min={0}
                onChange={(event) => updateWaitSeconds('gemWaitSeconds', event.target.value)}
                type="number"
                value={drafts.gemWaitSeconds}
              />
            </label>
          </div>

          <p className="helper-text">矩阵适合手填库存，截图识别适合直接粘贴共享仓库截图。</p>
          {renderTaskChecks('gem-cube')}
          {renderAdvancedDetails(gemTask)}
          {renderTaskFooter(gemTask)}
        </article>

        <article className="card workshop-card">
          <div className="workshop-topbar">
            <div>
              <p className="eyebrow">builtin:gold_drop</p>
              <div className="card-title">{getTaskMeta(goldTask.id).title}</div>
              <p className="secondary-text">{getTaskMeta(goldTask.id).description}</p>
            </div>
            <span className={`status-pill ${getTaskToneClass(preflightMap.get(goldTask.id) ?? null)}`}>
              {preflightMap.get(goldTask.id)?.status === 'ready'
                ? '可以开跑'
                : preflightMap.get(goldTask.id)?.status === 'warning'
                  ? '先看提醒'
                  : preflightMap.get(goldTask.id)?.status === 'error'
                    ? '先补条件'
                    : '等待预检'}
            </span>
          </div>

          <div className="task-section">
            <span className="task-section-label">运行</span>
            <div className="task-toolbar">{renderRunButtons('drop-shared-gold')}</div>
          </div>
          <div className="task-section">
            <span className="task-section-label">维护</span>
            <div className="task-toolbar secondary">{renderAdminButtons(goldTask)}</div>
          </div>

          <div className="task-grid">
            <label className="field">
              <span>总金额</span>
              <input
                inputMode="numeric"
                onChange={(event) => updateDraft('goldAmount', event.target.value)}
                placeholder="例如：20000000"
                value={drafts.goldAmount}
              />
            </label>

            <label className="field">
              <span>角色等级</span>
              <input
                inputMode="numeric"
                onChange={(event) => updateDraft('goldLevel', event.target.value)}
                placeholder="例如：90"
                value={drafts.goldLevel}
              />
            </label>

            <label className="field">
              <span>等待秒数</span>
              <input
                min={0}
                onChange={(event) => updateWaitSeconds('goldWaitSeconds', event.target.value)}
                type="number"
                value={drafts.goldWaitSeconds}
              />
            </label>
          </div>

          <p className="helper-text">先输入总额和等级，试运行会先给你分批方案。</p>
          {renderTaskChecks('drop-shared-gold')}
          {renderAdvancedDetails(goldTask)}
          {renderTaskFooter(goldTask)}
        </article>
      </div>

      {viewer ? (
        <article className="card log-viewer">
          <div className="integration-head">
            <div>
              <div className="card-title">{viewer.title}</div>
              {viewer.path ? <p className="secondary-text">{viewer.path}</p> : null}
            </div>
            <div className="tool-row">
              {viewer.path ? (
                <button
                  className="ghost-button"
                  onClick={() => void props.onOpenPath(viewer.path as string)}
                  type="button"
                >
                  打开文件
                </button>
              ) : null}
              <button className="ghost-button" onClick={() => setViewer(null)} type="button">
                关闭
              </button>
            </div>
          </div>

          {parsedViewerLog ? (
            <>
              <div className="log-summary-grid">
                <article className={`log-stat-card ${getLogToneClass(parsedViewerLog.success)}`}>
                  <span>结果</span>
                  <strong>{getLogResultLabel(parsedViewerLog.success)}</strong>
                  <p>{parsedViewerLog.headline}</p>
                </article>
                <article className="log-stat-card">
                  <span>任务</span>
                  <strong>{getParsedTaskLabel(parsedViewerLog.task)}</strong>
                  <p>{getActionSummaryLabel(parsedViewerLog.action)}</p>
                </article>
                <article className="log-stat-card">
                  <span>退出码</span>
                  <strong>{parsedViewerLog.exitCode || '无'}</strong>
                  <p>
                    {parsedViewerLog.time
                      ? `执行于 ${formatCompactDateTime(parsedViewerLog.time)}`
                      : '日志里没有时间戳'}
                  </p>
                </article>
              </div>

              <article className="report-summary-card log-insight-card">
                <div className="card-title small">这次怎么看</div>
                <p>{parsedViewerLog.guidance}</p>
                <div className="tag-row">
                  {parsedViewerLog.command ? (
                    <span className="mini-pill">命令已记录</span>
                  ) : null}
                  {parsedViewerLog.stdoutPreview.length > 0 ? (
                    <span className="mini-pill">stdout {parsedViewerLog.stdoutPreview.length} 条摘要</span>
                  ) : null}
                  {parsedViewerLog.stderrPreview.length > 0 ? (
                    <span className="mini-pill">stderr {parsedViewerLog.stderrPreview.length} 条摘要</span>
                  ) : null}
                </div>
              </article>

              <div className="log-section-grid">
                <article className="report-summary-card">
                  <div className="card-title small">stdout 摘要</div>
                  {parsedViewerLog.stdoutPreview.length === 0 ? (
                    <div className="empty-state compact-empty">
                      <strong>没有关键 stdout</strong>
                      <p>这次标准输出没有留下有效摘要。</p>
                    </div>
                  ) : (
                    <div className="stack compact">
                      {parsedViewerLog.stdoutPreview.map((line, index) => (
                        <div className="highlight-row" key={`${index}-${line}`}>
                          <strong>{index + 1}. 输出片段</strong>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="report-summary-card">
                  <div className="card-title small">stderr 摘要</div>
                  {parsedViewerLog.stderrPreview.length === 0 ? (
                    <div className="empty-state compact-empty">
                      <strong>没有 stderr 提醒</strong>
                      <p>这次标准错误里没有发现关键报错。</p>
                    </div>
                  ) : (
                    <div className="stack compact">
                      {parsedViewerLog.stderrPreview.map((line, index) => (
                        <div className="highlight-row" key={`${index}-${line}`}>
                          <strong>{index + 1}. 错误片段</strong>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              </div>

              {parsedViewerLog.command ? (
                <article className="report-summary-card">
                  <div className="card-title small">执行命令</div>
                  <pre className="code-view compact-code">{parsedViewerLog.command}</pre>
                </article>
              ) : null}

              <details className="tool-details" open>
                <summary>原始日志</summary>
                <div className="tool-details-content">
                  <pre className="code-view">{viewer.content}</pre>
                </div>
              </details>
            </>
          ) : (
            <pre className="code-view">{viewer.content}</pre>
          )}
        </article>
      ) : null}
    </section>
  );
}
