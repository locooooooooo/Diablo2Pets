import {
  useEffect,
  useState,
  type ClipboardEvent as ReactClipboardEvent
} from 'react';
import { formatCompactDateTime } from '../lib/date';
import type {
  AutomationAdminAction,
  AutomationDrafts,
  AutomationLogDocument,
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
  return item.lastRunAt
    ? `上次执行 ${formatCompactDateTime(item.lastRunAt)}`
    : '尚未执行';
}

function getInputModeLabel(mode: GemInputMode): string {
  return mode === 'matrix' ? '输入矩阵' : '截图识别';
}

function getAdminLabel(action: AutomationAdminAction): string {
  switch (action) {
    case 'record-profile':
      return '录制 Profile';
    case 'print-profile':
      return '查看 Profile';
    case 'import-legacy-config':
      return '导入旧配置';
  }
}

function getRecordSteps(id: IntegrationId): string[] {
  switch (id) {
    case 'rune-cube':
      return [
        '方块输出格',
        'Transmute 按钮',
        '第一排第一列符文格',
        '第一排第九列符文格',
        '第四排第一列符文格'
      ];
    case 'gem-cube':
      return [
        '方块输入格 1',
        '方块输入格 2',
        '方块输入格 3',
        '方块输出格',
        'Transmute 按钮',
        '手动结果落点',
        '第一排第一列宝石堆',
        '第一排第七列宝石堆',
        '第五排第一列宝石堆'
      ];
    case 'drop-shared-gold':
      return ['仓库物体', '共享仓库页签', '仓库金币按钮', '背包金币按钮'];
  }
}

function getProfileNote(item: IntegrationConfig): string {
  if (item.supportsLegacyImport && item.legacyConfigPath) {
    return `默认旧配置路径：${item.legacyConfigPath}`;
  }

  return '这条任务线没有单独的旧配置文件，建议直接录制新的 profile。';
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

export function AutomationPanel(props: AutomationPanelProps) {
  const [drafts, setDrafts] = useState<AutomationDrafts>(props.initialDrafts);
  const [gemImageDataUrl, setGemImageDataUrl] = useState('');
  const [gemPasteHint, setGemPasteHint] = useState(
    '切到“截图识别”后，截图后直接按 Ctrl+V，下一次运行会自动保存到本地。'
  );
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [logBusyId, setLogBusyId] = useState<IntegrationId | null>(null);

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

  const runeTask = getIntegration(props.integrations, 'rune-cube');
  const gemTask = getIntegration(props.integrations, 'gem-cube');
  const goldTask = getIntegration(props.integrations, 'drop-shared-gold');

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
        await openLogViewer(
          id,
          `${getIntegration(props.integrations, id).title} / ${getModeLabel(mode)}日志`
        );
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
        await openLogViewer(item.id, `${item.title} / ${getAdminLabel(action)}日志`);
      }
    } catch {
      return;
    }
  }

  function renderTaskActions(id: IntegrationId) {
    return (
      <div className="task-actions">
        {(['dry-run', 'execute'] as AutomationRunMode[]).map((mode) => {
          const busy = props.busyKey === getBusyKey(id, mode);
          const disabled = props.busyKey !== null;

          return (
            <button
              className={mode === 'execute' ? 'primary-button' : 'ghost-button'}
              disabled={disabled}
              key={mode}
              onClick={() => void runTask(id, mode)}
              type="button"
            >
              {busy ? `${getModeLabel(mode)}中...` : getModeLabel(mode)}
            </button>
          );
        })}
      </div>
    );
  }

  function renderTools(item: IntegrationConfig) {
    return (
      <div className="tool-stack">
        <div className="tool-row">
          <button
            className="ghost-button"
            disabled={props.busyKey !== null}
            onClick={() => void runAdmin(item, 'print-profile')}
            type="button"
          >
            {props.busyKey === getAdminBusyKey(item.id, 'print-profile')
              ? '读取中...'
              : '查看 Profile'}
          </button>
          <button
            className="ghost-button"
            disabled={props.busyKey !== null}
            onClick={() => void runAdmin(item, 'record-profile')}
            type="button"
          >
            {props.busyKey === getAdminBusyKey(item.id, 'record-profile')
              ? '录制中...'
              : '录制 Profile'}
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
                : '导入旧配置'}
            </button>
          ) : null}
          <button
            className="ghost-button"
            disabled={props.busyKey !== null || logBusyId === item.id}
            onClick={() => void openLogViewer(item.id, `${item.title} / 执行日志`)}
            type="button"
          >
            {logBusyId === item.id ? '读取日志中...' : '查看执行日志'}
          </button>
        </div>

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

        <p className="helper-text">{getProfileNote(item)}</p>
        <p className="helper-text">当前 Profile：{item.profilePath}</p>

        <div className="sequence-block">
          <div className="sequence-title">录制顺序</div>
          <ol className="sequence-list">
            {getRecordSteps(item.id).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="helper-text">录制时按 `F10` 捕获当前鼠标位置，按 `F12` 可中止。</p>
        </div>
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
        <p className="secondary-text">
          {item.lastMessage || '执行结果摘要会显示在这里。'}
        </p>
      </>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Automation</p>
          <h3>自动化任务</h3>
        </div>
        <span className="status-pill">运行、配置、日志一页闭环</span>
      </div>

      <article className="card task-card">
        <div className="card-title">执行策略</div>
        <div className="stack compact">
          <label className="checkbox-row">
            <input
              checked={drafts.allowInactiveWindow}
              onChange={(event) => updateDraft('allowInactiveWindow', event.target.checked)}
              type="checkbox"
            />
            <span>允许在游戏窗口未置顶时继续点击</span>
          </label>
          <p className="helper-text">
            默认会先检查暗黑 2 是否在前台，避免误点。联调阶段建议先试运行，再做真实执行。
          </p>
        </div>
      </article>

      <div className="stack">
        <article className="card task-card">
          <div className="integration-head">
            <div>
              <div className="card-title">{runeTask.title}</div>
              <p className="secondary-text">{runeTask.description}</p>
            </div>
            <span className="status-pill warm">builtin:rune_cubing</span>
          </div>

          <label className="field">
            <span>符文数量</span>
            <textarea
              onChange={(event) => updateDraft('runeCounts', event.target.value)}
              placeholder="例如：12 6 0 0 0 0 0 0 0"
              rows={3}
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

          <p className="helper-text">
            支持空格分隔的一维数量列表。真实执行前会先等待几秒，方便你切回游戏窗口。
          </p>

          {renderTaskActions('rune-cube')}
          {renderTools(runeTask)}
          {renderTaskFooter(runeTask)}
        </article>

        <article className="card task-card">
          <div className="integration-head">
            <div>
              <div className="card-title">{gemTask.title}</div>
              <p className="secondary-text">{gemTask.description}</p>
            </div>
            <span className="status-pill warm">builtin:gem_cubing</span>
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
                rows={4}
                value={drafts.gemMatrix}
              />
            </label>
          ) : (
            <div className="stack compact">
              <div
                className={`paste-zone ${gemImageDataUrl ? 'ready' : ''}`}
                onPaste={handleGemPasteZone}
                tabIndex={0}
              >
                <div>
                  <strong>截图粘贴区</strong>
                  <p>{gemPasteHint}</p>
                </div>
                {gemImageDataUrl ? (
                  <img alt="宝石截图预览" className="paste-preview" src={gemImageDataUrl} />
                ) : (
                  <span className="paste-empty">点这里后也可以直接 Ctrl+V 粘贴截图</span>
                )}
              </div>

              <label className="field">
                <span>或使用已有本地截图路径</span>
                <input
                  onChange={(event) => updateDraft('gemImagePath', event.target.value)}
                  placeholder="例如：E:\\screenshots\\gems.png"
                  value={drafts.gemImagePath}
                />
              </label>

              <div className="tool-row">
                <button className="ghost-button" onClick={clearGemImage} type="button">
                  清空粘贴截图
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

              {drafts.gemImagePath ? (
                <p className="helper-text">当前将使用的本地截图：{drafts.gemImagePath}</p>
              ) : null}
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

          <p className="helper-text">
            矩阵模式适合手工录入库存；截图识别模式支持 Ctrl+V 粘贴截图，也保留手填路径作为兜底。
          </p>

          {renderTaskActions('gem-cube')}
          {renderTools(gemTask)}
          {renderTaskFooter(gemTask)}
        </article>

        <article className="card task-card">
          <div className="integration-head">
            <div>
              <div className="card-title">{goldTask.title}</div>
              <p className="secondary-text">{goldTask.description}</p>
            </div>
            <span className="status-pill warm">builtin:gold_drop</span>
          </div>

          <div className="task-grid">
            <label className="field">
              <span>总金币</span>
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

          <p className="helper-text">
            输入总额和角色等级后，runtime 会先计算分批方案；试运行会直接把计划打印到日志里。
          </p>

          {renderTaskActions('drop-shared-gold')}
          {renderTools(goldTask)}
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

          <pre className="code-view">{viewer.content}</pre>
        </article>
      ) : null}
    </section>
  );
}
