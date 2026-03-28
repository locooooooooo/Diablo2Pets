import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent
} from 'react';
import { formatCompactDateTime } from '../lib/date';
import { parseAutomationLog } from '../lib/automationLog';
import {
  getIntegrationLabel,
  isTaskProfileReady
} from '../lib/setupGuideState';
import type {
  AutomationAdminAction,
  AutomationCheckItem,
  AutomationDrafts,
  AutomationLogDocument,
  AutomationRecordProgressEvent,
  AutomationPreflightInput,
  AutomationPreflightResponse,
  AutomationPreflightStatus,
  AutomationPreflightTask,
  AutomationRunMode,
  EnvironmentAction,
  EnvironmentActionResponse,
  ExportTextFileInput,
  ExportTextFileResult,
  GemInputMode,
  IntegrationConfig,
  IntegrationId,
  IntegrationRunResponse,
  RunAutomationAdminInput,
  RunEnvironmentActionInput,
  RunAutomationTaskInput
} from '../types';

interface AutomationPanelProps {
  integrations: IntegrationConfig[];
  initialDrafts: AutomationDrafts;
  busyKey: string | null;
  highlightedTaskId?: IntegrationId | null;
  onCopyText: (text: string) => Promise<void>;
  onExportText: (payload: ExportTextFileInput) => Promise<ExportTextFileResult>;
  onRunTask: (payload: RunAutomationTaskInput) => Promise<IntegrationRunResponse>;
  onRunAdmin: (payload: RunAutomationAdminInput) => Promise<IntegrationRunResponse>;
  onRunEnvironmentAction: (payload: RunEnvironmentActionInput) => Promise<EnvironmentActionResponse>;
  onGetPreflight: (payload: AutomationPreflightInput) => Promise<AutomationPreflightResponse>;
  onGetLog: (id: IntegrationId) => Promise<AutomationLogDocument>;
  onOpenPath: (targetPath: string) => Promise<void>;
}

interface ViewerState {
  id?: IntegrationId;
  title: string;
  path?: string;
  content: string;
}

interface EnvironmentTimelineEntry {
  id: string;
  time: string;
  tone: DiagnosisTone;
  title: string;
  detail: string;
  meta: string;
}

type DiagnosisTone = 'success' | 'attention' | 'error';

interface QuickFixAction {
  key: string;
  label: string;
  kind:
    | 'admin'
    | 'environment-action'
    | 'open-path'
    | 'set-gem-mode'
    | 'set-allow-inactive'
    | 'set-wait'
    | 'clear-gem-path'
    | 'refresh';
  adminAction?: AutomationAdminAction;
  environmentAction?: EnvironmentAction;
  path?: string;
  mode?: GemInputMode;
  value?: boolean | number;
}

interface TaskDiagnosis {
  tone: DiagnosisTone;
  title: string;
  description: string;
  actions: QuickFixAction[];
}

interface ProfileGuideStep {
  id: IntegrationId;
  title: string;
  ready: boolean;
  summary: string;
  detail: string;
}

type RecordingGuideStatus = 'recording' | 'success' | 'error';

interface RecordingGuideState {
  taskId: IntegrationId;
  stepIndex: number;
  status: RecordingGuideStatus;
  detail: string;
  updatedAt: string;
  lastLine?: string;
  live: boolean;
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

function getEnvironmentBusyKey(action: EnvironmentAction): string {
  return `env-${action}`;
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

function getTaskMetaText(id: IntegrationId): { title: string; description: string } {
  switch (id) {
    case 'rune-cube':
      return {
        title: '自动合成低级符文',
        description: '先根据库存生成合成计划，再切回游戏执行，会比直接硬跑更稳。'
      };
    case 'gem-cube':
      return {
        title: '自动合成宝石',
        description: '支持矩阵输入和截图识别两种方式，适合共享仓库联调。'
      };
    case 'drop-shared-gold':
      return {
        title: '共享仓库丢金币',
        description: '根据总额和角色等级自动拆批执行，减少重复手工操作。'
      };
  }
}

function getModeLabelText(mode: AutomationRunMode): string {
  return mode === 'dry-run' ? '试运行' : '立即执行';
}

function getStatusTextText(item: IntegrationConfig): string {
  return item.lastRunAt ? `上次执行 ${formatCompactDateTime(item.lastRunAt)}` : '还没有执行过';
}

function getInputModeLabelText(mode: GemInputMode): string {
  return mode === 'matrix' ? '矩阵输入' : '截图识别';
}

function getAdminLabelText(action: AutomationAdminAction): string {
  switch (action) {
    case 'record-profile':
      return '录 Profile';
    case 'print-profile':
      return '看 Profile';
    case 'import-legacy-config':
      return '导入旧配置';
  }
}

function getReadableRecordStepsText(id: IntegrationId): string[] {
  switch (id) {
    case 'rune-cube':
      return ['方块输出格', 'Transmute 按钮', '左上符文格', '右上符文格', '左下符文格'];
    case 'gem-cube':
      return [
        '输入格 1',
        '输入格 2',
        '输入格 3',
        '输出格',
        'Transmute 按钮',
        '结果落点',
        '左上宝石堆',
        '右上宝石堆',
        '左下宝石堆'
      ];
    case 'drop-shared-gold':
      return ['仓库点击点', '共享标签', '仓库金币按钮', '背包金币按钮'];
  }
}

function getProfileNoteText(item: IntegrationConfig): string {
  if (item.supportsLegacyImport && item.legacyConfigPath) {
    return `默认旧配置路径：${item.legacyConfigPath}`;
  }

  return '这条任务线没有独立旧配置，建议直接录新的 Profile。';
}

function getTaskHintText(message?: string): string {
  if (!message) {
    return '先看预检，再决定是试运行还是正式执行。';
  }

  const normalized = message.toLowerCase();

  if (message.includes('未找到') || normalized.includes('not found')) {
    return '通常是脚本、Profile、旧配置或截图路径不存在，先看预检里哪一项变红了。';
  }

  if (message.includes('整数')) {
    return '检查数量、金额、等级这些输入是不是都填成了整数。';
  }

  if (message.includes('截图')) {
    return '先粘贴截图，或者把现有截图路径填完整。';
  }

  if (message.includes('停用')) {
    return '这条任务当前被停用了，先确认任务状态。';
  }

  if (message.includes('执行失败')) {
    return '先点“看日志”，再对照预检判断是环境问题还是输入问题。';
  }

  return '如果这次结果不符合预期，优先看预检和日志。';
}

function getTaskSpotlightLabelText(id: IntegrationId): string {
  switch (id) {
    case 'rune-cube':
      return '符文任务';
    case 'gem-cube':
      return '宝石任务';
    case 'drop-shared-gold':
      return '金币任务';
  }
}

function getProfileGuideDetailText(id: IntegrationId): string {
  switch (id) {
    case 'rune-cube':
      return '先录方块输出格、Transmute 和符文关键点，后面填数量就能跑。';
    case 'gem-cube':
      return '先录输入格、输出格、结果落点和宝石堆关键点，矩阵和截图识别都会用到。';
    case 'drop-shared-gold':
      return '先录共享仓库标签、金币按钮和点击点，后面才能自动拆批丢金币。';
  }
}

function getPreflightStatusLabelText(status?: AutomationPreflightStatus): string {
  switch (status) {
    case 'ready':
      return '可以开跑';
    case 'warning':
      return '先看提醒';
    case 'error':
      return '先补条件';
    default:
      return '等待预检';
  }
}
function buildTaskDiagnosisText(
  item: IntegrationConfig,
  task: AutomationPreflightTask | null,
  drafts: AutomationDrafts,
  hasGemClipboardImage: boolean
): TaskDiagnosis {
  const actions: QuickFixAction[] = [];

  if (!task) {
    return {
      tone: 'attention',
      title: '诊断准备中',
      description: '正在重新扫描这条任务线的环境、Profile 和输入条件。',
      actions: [{ key: 'refresh', label: '立即刷新', kind: 'refresh' }]
    };
  }

  const profileCheck = findCheck(task, 'profile-path');
  const legacyCheck = findCheck(task, 'legacy-config');
  const scriptCheck = findCheck(task, 'script-path');
  const pythonCheck = findCheck(task, 'python-global');
  const screenshotCheck = findCheck(task, 'gem-screenshot');
  const matrixCheck = findCheck(task, 'gem-matrix');
  const inactiveCheck = findCheck(task, 'inactive-window');
  const waitCheck =
    findCheck(task, 'rune-wait') ?? findCheck(task, 'gem-wait') ?? findCheck(task, 'gold-wait');

  if (pythonCheck?.level === 'error' || scriptCheck?.level === 'error') {
    pushAction(actions, {
      key: 'open-runtime',
      label: '打开运行时目录',
      kind: 'open-path',
      path: item.workingDirectory
    });

    return {
      tone: 'error',
      title: '运行环境还没到位',
      description: pythonCheck?.detail ?? scriptCheck?.detail ?? task.summary,
      actions
    };
  }

  if (profileCheck?.level === 'error') {
    pushAction(actions, {
      key: 'record-profile',
      label: '重录 Profile',
      kind: 'admin',
      adminAction: 'record-profile'
    });
    pushAction(actions, {
      key: 'open-profile-dir',
      label: '打开 Profile 目录',
      kind: 'open-path',
      path: getParentPath(item.profilePath)
    });

    if (item.supportsLegacyImport && legacyCheck?.level === 'ok') {
      pushAction(actions, {
        key: 'import-legacy',
        label: '导入旧配置',
        kind: 'admin',
        adminAction: 'import-legacy-config'
      });
    }

    return {
      tone: 'error',
      title: 'Profile 还没准备好',
      description: profileCheck.detail,
      actions
    };
  }

  if (screenshotCheck?.level === 'error') {
    if (drafts.gemMatrix.trim()) {
      pushAction(actions, {
        key: 'switch-gem-matrix',
        label: '改用矩阵模式',
        kind: 'set-gem-mode',
        mode: 'matrix'
      });
    }

    if (drafts.gemImagePath.trim()) {
      pushAction(actions, {
        key: 'open-image-dir',
        label: '打开截图目录',
        kind: 'open-path',
        path: getParentPath(drafts.gemImagePath)
      });
      pushAction(actions, {
        key: 'clear-image-path',
        label: '清空截图路径',
        kind: 'clear-gem-path'
      });
    }

    if (!hasGemClipboardImage && !drafts.gemImagePath.trim()) {
      pushAction(actions, { key: 'refresh', label: '刷新诊断', kind: 'refresh' });
    }

    return {
      tone: 'error',
      title: '宝石截图来源未就绪',
      description: screenshotCheck.detail,
      actions
    };
  }

  if (matrixCheck?.level === 'error') {
    if (hasGemClipboardImage || drafts.gemImagePath.trim()) {
      pushAction(actions, {
        key: 'switch-gem-scan',
        label: '改用截图识别',
        kind: 'set-gem-mode',
        mode: 'scan-image'
      });
    }

    return {
      tone: 'error',
      title: '宝石矩阵还没填好',
      description: matrixCheck.detail,
      actions
    };
  }

  if (inactiveCheck?.level === 'warning') {
    pushAction(actions, {
      key: 'focus-window',
      label: '改回前台执行',
      kind: 'set-allow-inactive',
      value: false
    });

    return {
      tone: 'attention',
      title: '当前允许后台点击',
      description: inactiveCheck.detail,
      actions
    };
  }

  if (waitCheck?.level === 'warning') {
    const waitRepair = getWaitRepair(item.id);
    pushAction(actions, {
      key: `repair-${waitRepair.draftKey}`,
      label: `恢复为 ${waitRepair.value} 秒等待`,
      kind: 'set-wait',
      value: waitRepair.value
    });

    return {
      tone: 'attention',
      title: '等待时间偏长',
      description: waitCheck.detail,
      actions
    };
  }

  if (task.status === 'ready') {
    pushAction(actions, {
      key: 'print-profile',
      label: '查看当前 Profile',
      kind: 'admin',
      adminAction: 'print-profile'
    });

    if (item.lastLogPath) {
      pushAction(actions, {
        key: 'open-last-log',
        label: '打开最新日志',
        kind: 'open-path',
        path: item.lastLogPath
      });
    }

    return {
      tone: 'success',
      title: '这条任务已经可以开跑',
      description: '环境和输入都通过诊断了，建议先试运行，再决定是否正式执行。',
      actions
    };
  }

  const focusCheck =
    task.checks.find((check) => check.level === 'error') ??
    task.checks.find((check) => check.level === 'warning') ??
    null;

  return {
    tone: task.status === 'error' ? 'error' : 'attention',
    title: task.status === 'error' ? '还有阻塞项待处理' : '还有提醒项待处理',
    description: focusCheck?.detail ?? task.summary,
    actions
  };
}

function translateRecordConsoleLine(id: IntegrationId, line: string): string {
  const normalized = line.trim().toLowerCase();

  if (normalized.startsWith('recording ')) {
    return `${getIntegrationLabel(id)} 录制已开始，请保持暗黑 2 和目标界面可见。`;
  }

  if (normalized.includes('make sure the diablo ii inventory and cube ui are visible')) {
    return '请保持背包和赫拉迪姆方块界面可见，然后按步骤按 F10 捕获位置。';
  }

  if (normalized.includes('now capture the rune grid anchors')) {
    return '基础点位已经完成，下一步开始录符文网格锚点。';
  }

  if (normalized.startsWith('saved recorded')) {
    return `${getIntegrationLabel(id)} Profile 已保存，预检会自动刷新。`;
  }

  return line;
}

function describeRecordingProgress(event: AutomationRecordProgressEvent): string {
  const translatedLine = translateRecordConsoleLine(event.id, event.line);

  if (event.finished) {
    return event.success ? translatedLine : `录制失败：${translatedLine}`;
  }

  if (typeof event.stepIndex === 'number') {
    const stepLabel =
      getReadableRecordStepsText(event.id)[event.stepIndex] ?? `步骤 ${event.stepIndex + 1}`;
    return `当前目标：${stepLabel}。切回游戏后把鼠标对准这里，再按 F10。`;
  }

  if (event.kind === 'stderr') {
    return `录制器提示：${translatedLine}`;
  }

  return translatedLine;
}

function getReadableRecordSteps(id: IntegrationId): string[] {
  switch (id) {
    case 'rune-cube':
      return ['方块输出格', 'Transmute 按钮', '左上符文格', '右上符文格', '左下符文格'];
    case 'gem-cube':
      return [
        '输入格 1',
        '输入格 2',
        '输入格 3',
        '输出格',
        'Transmute 按钮',
        '结果落点',
        '左上宝石堆',
        '右上宝石堆',
        '左下宝石堆'
      ];
    case 'drop-shared-gold':
      return ['仓库点击点', '共享标签', '仓库金币按钮', '背包金币按钮'];
  }
}

function getRecordingFailureSummary(rawText: string): string {
  const text = rawText.trim();
  const normalized = text.toLowerCase();

  if (!text) {
    return '录制中断了，但没有返回更多信息。建议先看日志，再重新录一次。';
  }

  if (
    normalized.includes('stopped by user') ||
    normalized.includes('cancelled') ||
    normalized.includes('canceled') ||
    normalized.includes('stop key')
  ) {
    return '录制被提前结束了。通常是按了 F12，或者主动中止了录制。';
  }

  if (
    normalized.includes('access is denied') ||
    normalized.includes('permission') ||
    normalized.includes('administrator')
  ) {
    return '录制权限不足。请尝试以管理员身份运行桌宠，再重新录制。';
  }

  if (
    normalized.includes('not found') ||
    normalized.includes('no such file') ||
    normalized.includes('找不到')
  ) {
    return '录制依赖的脚本或配置没有找到。建议先看日志确认缺的是哪一项。';
  }

  if (
    normalized.includes('keyboard') ||
    normalized.includes('hotkey') ||
    normalized.includes('f10')
  ) {
    return '热键监听没有正常工作。请确认没有别的程序占用 F10 / F12。';
  }

  if (
    normalized.includes('window') ||
    normalized.includes('inventory') ||
    normalized.includes('cube')
  ) {
    return '游戏窗口可能没有准备好。请把背包、方块或仓库界面摆好后再录。';
  }

  return `录制失败：${text}`;
}

function getRecordingSuccessSummary(id: IntegrationId): string {
  return `${getIntegrationLabel(id)} 的 Profile 已经录好。下一步建议先试运行，确认点击点和流程都对。`;
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

function findCheck(task: AutomationPreflightTask | null, key: string): AutomationCheckItem | null {
  return task?.checks.find((check) => check.key === key) ?? null;
}

function findGlobalCheck(checks: AutomationCheckItem[], key: string): AutomationCheckItem | null {
  return checks.find((check) => check.key === key) ?? null;
}

function getDependencyChecks(checks: AutomationCheckItem[]): AutomationCheckItem[] {
  return checks.filter((check) => check.key.startsWith('dependency-'));
}

function getVisibleGlobalChecks(checks: AutomationCheckItem[]): AutomationCheckItem[] {
  return checks.filter((check) => !check.key.startsWith('dependency-'));
}

function getParentPath(targetPath: string): string {
  const normalized = targetPath.trim().replace(/[\\/]+$/, '');
  const match = normalized.match(/^(.*)[\\/][^\\/]+$/);
  return match?.[1] ?? normalized;
}

function pushAction(actions: QuickFixAction[], action: QuickFixAction) {
  if (!actions.some((item) => item.key === action.key)) {
    actions.push(action);
  }
}

function buildSiblingPath(basePath: string, childName: string): string {
  return `${basePath.replace(/[\\/]+$/, '')}\\${childName}`;
}

function getWaitRepair(
  id: IntegrationId
): { draftKey: 'runeWaitSeconds' | 'gemWaitSeconds' | 'goldWaitSeconds'; value: number } {
  switch (id) {
    case 'rune-cube':
      return { draftKey: 'runeWaitSeconds', value: 3 };
    case 'gem-cube':
      return { draftKey: 'gemWaitSeconds', value: 3 };
    case 'drop-shared-gold':
      return { draftKey: 'goldWaitSeconds', value: 5 };
  }
}

function buildTaskDiagnosis(
  item: IntegrationConfig,
  task: AutomationPreflightTask | null,
  drafts: AutomationDrafts,
  hasGemClipboardImage: boolean
): TaskDiagnosis {
  const actions: QuickFixAction[] = [];

  if (!task) {
    return {
      tone: 'attention',
      title: '诊断准备中',
      description: '我还在重新扫描这条任务的环境、Profile 和输入条件。',
      actions: [{ key: 'refresh', label: '立即刷新', kind: 'refresh' }]
    };
  }

  const profileCheck = findCheck(task, 'profile-path');
  const legacyCheck = findCheck(task, 'legacy-config');
  const scriptCheck = findCheck(task, 'script-path');
  const pythonCheck = findCheck(task, 'python-global');
  const screenshotCheck = findCheck(task, 'gem-screenshot');
  const matrixCheck = findCheck(task, 'gem-matrix');
  const inactiveCheck = findCheck(task, 'inactive-window');
  const waitCheck =
    findCheck(task, 'rune-wait') ?? findCheck(task, 'gem-wait') ?? findCheck(task, 'gold-wait');

  if (pythonCheck?.level === 'error' || scriptCheck?.level === 'error') {
    pushAction(actions, {
      key: 'open-runtime',
      label: '打开运行时目录',
      kind: 'open-path',
      path: item.workingDirectory
    });

    return {
      tone: 'error',
      title: '运行环境还没就绪',
      description: pythonCheck?.detail ?? scriptCheck?.detail ?? task.summary,
      actions
    };
  }

  if (profileCheck?.level === 'error') {
    pushAction(actions, {
      key: 'record-profile',
      label: '重录 Profile',
      kind: 'admin',
      adminAction: 'record-profile'
    });
    pushAction(actions, {
      key: 'open-profile-dir',
      label: '打开 Profile 目录',
      kind: 'open-path',
      path: getParentPath(item.profilePath)
    });

    if (item.supportsLegacyImport && legacyCheck?.level === 'ok') {
      pushAction(actions, {
        key: 'import-legacy',
        label: '导入旧配置',
        kind: 'admin',
        adminAction: 'import-legacy-config'
      });
    }

    return {
      tone: 'error',
      title: 'Profile 还没就位',
      description: profileCheck.detail,
      actions
    };
  }

  if (screenshotCheck?.level === 'error') {
    if (drafts.gemMatrix.trim()) {
      pushAction(actions, {
        key: 'switch-gem-matrix',
        label: '改用矩阵模式',
        kind: 'set-gem-mode',
        mode: 'matrix'
      });
    }

    if (drafts.gemImagePath.trim()) {
      pushAction(actions, {
        key: 'open-image-dir',
        label: '打开截图目录',
        kind: 'open-path',
        path: getParentPath(drafts.gemImagePath)
      });
      pushAction(actions, {
        key: 'clear-image-path',
        label: '清空截图路径',
        kind: 'clear-gem-path'
      });
    }

    if (!hasGemClipboardImage && !drafts.gemImagePath.trim()) {
      pushAction(actions, { key: 'refresh', label: '刷新诊断', kind: 'refresh' });
    }

    return {
      tone: 'error',
      title: '宝石截图来源未就绪',
      description: screenshotCheck.detail,
      actions
    };
  }

  if (matrixCheck?.level === 'error') {
    if (hasGemClipboardImage || drafts.gemImagePath.trim()) {
      pushAction(actions, {
        key: 'switch-gem-scan',
        label: '改用截图识别',
        kind: 'set-gem-mode',
        mode: 'scan-image'
      });
    }

    return {
      tone: 'error',
      title: '宝石矩阵还没填好',
      description: matrixCheck.detail,
      actions
    };
  }

  if (inactiveCheck?.level === 'warning') {
    pushAction(actions, {
      key: 'focus-window',
      label: '改回前台执行',
      kind: 'set-allow-inactive',
      value: false
    });

    return {
      tone: 'attention',
      title: '当前允许后台点击',
      description: inactiveCheck.detail,
      actions
    };
  }

  if (waitCheck?.level === 'warning') {
    const waitRepair = getWaitRepair(item.id);
    pushAction(actions, {
      key: `repair-${waitRepair.draftKey}`,
      label: `恢复 ${waitRepair.value} 秒等待`,
      kind: 'set-wait',
      value: waitRepair.value
    });

    return {
      tone: 'attention',
      title: '等待时间偏长',
      description: waitCheck.detail,
      actions
    };
  }

  if (task.status === 'ready') {
    pushAction(actions, {
      key: 'print-profile',
      label: '查看当前 Profile',
      kind: 'admin',
      adminAction: 'print-profile'
    });

    if (item.lastLogPath) {
      pushAction(actions, {
        key: 'open-last-log',
        label: '打开最新日志',
        kind: 'open-path',
        path: item.lastLogPath
      });
    }

    return {
      tone: 'success',
      title: '这条任务已经可以开跑',
      description: '环境和输入已经通过诊断，建议先试运行，再决定是否正式执行。',
      actions
    };
  }

  const focusCheck =
    task.checks.find((check) => check.level === 'error') ??
    task.checks.find((check) => check.level === 'warning') ??
    null;

  return {
    tone: task.status === 'error' ? 'error' : 'attention',
    title: task.status === 'error' ? '还有阻塞项待处理' : '还有提醒项建议处理',
    description: focusCheck?.detail ?? task.summary,
    actions
  };
}

function buildEnvironmentDiagnosis(
  globalChecks: AutomationCheckItem[],
  runtimeRoot: string
): TaskDiagnosis {
  const actions: QuickFixAction[] = [];
  const runtimeCheck = findGlobalCheck(globalChecks, 'runtime-root');
  const pythonCheck = findGlobalCheck(globalChecks, 'python-command');
  const requirementsCheck = findGlobalCheck(globalChecks, 'requirements-file');
  const pipCheck = findGlobalCheck(globalChecks, 'pip-command');
  const dependencyCheck = findGlobalCheck(globalChecks, 'python-dependencies');
  const ocrCheck = findGlobalCheck(globalChecks, 'ocr-engine');
  const requirementsPath = buildSiblingPath(runtimeRoot, 'requirements.txt');
  const readmePath = buildSiblingPath(runtimeRoot, 'README.md');

  pushAction(actions, {
    key: 'open-runtime-readme',
    label: '打开 Runtime 说明',
    kind: 'open-path',
    path: readmePath
  });
  pushAction(actions, {
    key: 'open-requirements',
    label: '打开 requirements',
    kind: 'open-path',
    path: requirementsPath
  });
  pushAction(actions, {
    key: 'refresh-environment',
    label: '刷新环境诊断',
    kind: 'refresh'
  });

  if (runtimeCheck?.level === 'error') {
    pushAction(actions, {
      key: 'open-runtime-root',
      label: '打开 Runtime 目录',
      kind: 'open-path',
      path: runtimeRoot
    });
    return {
      tone: 'error',
      title: 'Python Runtime 缺失',
      description: runtimeCheck.detail,
      actions
    };
  }

  if (pythonCheck?.level === 'error') {
    return {
      tone: 'error',
      title: 'Python 解释器还没就位',
      description: pythonCheck.detail,
      actions
    };
  }

  if (requirementsCheck?.level === 'error') {
    pushAction(actions, {
      key: 'open-runtime-root',
      label: '打开 Runtime 目录',
      kind: 'open-path',
      path: runtimeRoot
    });
    return {
      tone: 'error',
      title: '依赖清单缺失',
      description: requirementsCheck.detail,
      actions
    };
  }

  if (pipCheck?.level === 'error') {
    return {
      tone: 'error',
      title: 'pip 当前不可用',
      description: pipCheck.detail,
      actions
    };
  }

  if (dependencyCheck?.level === 'error') {
    pushAction(actions, {
      key: 'install-python-deps',
      label: '安装 Python 依赖',
      kind: 'environment-action',
      environmentAction: 'install-python-deps'
    });
    return {
      tone: 'error',
      title: '运行时依赖还没装齐',
      description: dependencyCheck.detail,
      actions
    };
  }

  if (ocrCheck?.level === 'warning') {
    pushAction(actions, {
      key: 'install-python-deps',
      label: '补装 OCR 相关依赖',
      kind: 'environment-action',
      environmentAction: 'install-python-deps'
    });
    return {
      tone: 'attention',
      title: 'OCR 识别还没准备好',
      description: ocrCheck.detail,
      actions
    };
  }

  return {
    tone: 'success',
    title: '环境已经就绪',
    description: 'Python、依赖清单、运行时包和 OCR 能力都已经通过检查。',
    actions
  };
}

function getDependencyTitle(check: AutomationCheckItem): string {
  return check.label === 'pillow' ? 'Pillow' : check.label;
}

function getParsedTaskLabel(task: string): string {
  if (task === 'rune-cube' || task === 'gem-cube' || task === 'drop-shared-gold') {
    return getTaskMetaText(task).title;
  }

  if (task === 'environment') {
    return '环境修复站';
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
    case 'install-python-deps':
      return '安装 Python 依赖';
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

function getCheckLevelLabel(level: AutomationCheckItem['level']): string {
  switch (level) {
    case 'ok':
      return '正常';
    case 'warning':
      return '提醒';
    case 'error':
      return '阻塞';
  }
}

function getDiagnosisToneLabel(tone: DiagnosisTone): string {
  switch (tone) {
    case 'success':
      return '已就绪';
    case 'attention':
      return '建议处理';
    case 'error':
      return '需要修复';
  }
}

function getTaskStatusLabel(status: AutomationPreflightStatus | undefined): string {
  switch (status) {
    case 'ready':
      return '可以开跑';
    case 'warning':
      return '先看提醒';
    case 'error':
      return '先补条件';
    default:
      return '等待预检';
  }
}

function getTaskSpotlightLabel(id: IntegrationId): string {
  switch (id) {
    case 'rune-cube':
      return '符文任务';
    case 'gem-cube':
      return '宝石任务';
    case 'drop-shared-gold':
      return '金币任务';
  }
}

function getProfileGuideDetail(id: IntegrationId): string {
  switch (id) {
    case 'rune-cube':
      return '先录方块输出格、Transmute 和符文起始格，后面填数量就能跑。';
    case 'gem-cube':
      return '先录输入格、输出格和宝石堆起点，矩阵和截图识别都会靠这套坐标。';
    case 'drop-shared-gold':
      return '先录共享仓库、金币按钮和背包金币位，后面才能自动分批丢金币。';
  }
}

export function AutomationPanel(props: AutomationPanelProps) {
  const [drafts, setDrafts] = useState<AutomationDrafts>(props.initialDrafts);
  const [gemImageDataUrl, setGemImageDataUrl] = useState('');
  const [gemPasteHint, setGemPasteHint] = useState(
    '切到“截图识别”后，截图后直接按 Ctrl+V，下一次运行会自动保存到本地。'
  );
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [environmentLog, setEnvironmentLog] = useState<AutomationLogDocument | null>(null);
  const [environmentTimeline, setEnvironmentTimeline] = useState<EnvironmentTimelineEntry[]>([]);
  const [logBusyId, setLogBusyId] = useState<IntegrationId | null>(null);
  const [preflight, setPreflight] = useState<AutomationPreflightResponse | null>(null);
  const [preflightBusy, setPreflightBusy] = useState(false);
  const [preflightError, setPreflightError] = useState('');
  const [preflightTick, setPreflightTick] = useState(0);
  const [recordingGuide, setRecordingGuide] = useState<RecordingGuideState | null>(null);
  const environmentSnapshotRef = useRef('');
  const runeCardRef = useRef<HTMLElement | null>(null);
  const gemCardRef = useRef<HTMLElement | null>(null);
  const goldCardRef = useRef<HTMLElement | null>(null);

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
  }, [drafts, gemImageDataUrl, props.integrations, preflightTick]);

  useEffect(() => {
    return window.d2Pet.onAutomationRecordProgress((event) => {
      setRecordingGuide((current) => {
        if (!current || current.taskId !== event.id) {
          return current;
        }

        const stepCount = getReadableRecordStepsText(event.id).length;
        const nextStepIndex =
          typeof event.stepIndex === 'number'
            ? Math.min(Math.max(event.stepIndex, 0), Math.max(stepCount - 1, 0))
            : current.stepIndex;

        return {
          ...current,
          stepIndex: nextStepIndex,
          status: event.finished ? (event.success ? 'success' : 'error') : 'recording',
          detail: describeRecordingProgress(event),
          updatedAt: event.updatedAt,
          lastLine: translateRecordConsoleLine(event.id, event.line),
          live: true
        };
      });
    });
  }, []);

  const runeTask = getIntegration(props.integrations, 'rune-cube');
  const gemTask = getIntegration(props.integrations, 'gem-cube');
  const goldTask = getIntegration(props.integrations, 'drop-shared-gold');
  const taskItems = useMemo(() => [runeTask, gemTask, goldTask], [runeTask, gemTask, goldTask]);
  const preflightMap = useMemo(() => {
    return new Map((preflight?.tasks ?? []).map((task) => [task.id, task]));
  }, [preflight]);
  const parsedViewerLog = useMemo(() => {
    return viewer ? parseAutomationLog(viewer.content) : null;
  }, [viewer]);
  const viewerIntegration = useMemo(() => {
    return viewer?.id ? props.integrations.find((item) => item.id === viewer.id) ?? null : null;
  }, [props.integrations, viewer]);
  const globalChecks = preflight?.globalChecks ?? [];
  const dependencyChecks = useMemo(() => getDependencyChecks(globalChecks), [globalChecks]);
  const installedDependencies = dependencyChecks.filter((check) => check.level === 'ok').length;
  const environmentDiagnosis = useMemo(() => {
    return buildEnvironmentDiagnosis(globalChecks, runeTask.workingDirectory);
  }, [globalChecks, runeTask.workingDirectory]);
  const parsedEnvironmentLog = useMemo(() => {
    return environmentLog ? parseAutomationLog(environmentLog.content) : null;
  }, [environmentLog]);
  const pythonCheck = useMemo(
    () => findGlobalCheck(globalChecks, 'python-command'),
    [globalChecks]
  );
  const pythonSourceCheck = useMemo(
    () => findGlobalCheck(globalChecks, 'python-source'),
    [globalChecks]
  );
  const pipCheck = useMemo(
    () => findGlobalCheck(globalChecks, 'pip-command'),
    [globalChecks]
  );
  const dependencyCheck = useMemo(
    () => findGlobalCheck(globalChecks, 'python-dependencies'),
    [globalChecks]
  );
  const ocrCheck = useMemo(
    () => findGlobalCheck(globalChecks, 'ocr-engine'),
    [globalChecks]
  );
  const needsEmbeddedRuntime =
    pythonCheck?.level === 'error' || pythonSourceCheck?.level === 'warning';
  const needsDependencyInstall =
    dependencyCheck?.level === 'error' || ocrCheck?.level === 'warning';
  const environmentPrimaryAction = useMemo(() => {
    if (needsEmbeddedRuntime) {
      return {
        action: 'install-python-runtime' as const,
        label: props.busyKey === getEnvironmentBusyKey('install-python-runtime')
          ? '安装内置 Runtime 中...'
          : '安装内置 Runtime',
        detail:
          pythonSourceCheck?.level === 'warning'
            ? '当前还在使用系统 Python，切到桌宠自己的 runtime 会更稳。'
            : '先把桌宠自己的 Python runtime 装好，再继续后面的自动化。'
      };
    }

    if (needsDependencyInstall) {
      return {
        action: 'install-python-deps' as const,
        label: props.busyKey === getEnvironmentBusyKey('install-python-deps')
          ? '安装依赖中...'
          : '安装 Python 依赖',
        detail: '依赖和 OCR 补齐后，工坊任务与截图识别才会完整可用。'
      };
    }

    return {
      action: null,
      label: preflightBusy ? '刷新诊断中...' : '刷新环境诊断',
      detail: '当前环境已经基本就绪，随时可以重新做一次预检。'
    };
  }, [
    needsEmbeddedRuntime,
    needsDependencyInstall,
    ocrCheck?.level,
    preflightBusy,
    props.busyKey,
    pythonSourceCheck?.level
  ]);
  const profileGuideSteps = useMemo<ProfileGuideStep[]>(() => {
    return taskItems.map((item) => {
      const task = preflightMap.get(item.id) ?? null;
      const ready = task ? isTaskProfileReady(task) : false;
      return {
        id: item.id,
        title: `${getIntegrationLabel(item.id)} Profile`,
        ready,
        summary: ready ? '这条坐标已经录好。' : '还没录制，当前不能稳定执行这条任务。',
        detail: ready
          ? '可以直接试运行，或者点“看 Profile”确认当前配置。'
          : task
            ? getProfileGuideDetailText(item.id)
            : '我还在等预检返回这条任务的 Profile 状态。'
      };
    });
  }, [preflightMap, taskItems]);
  const readyProfileCount = profileGuideSteps.filter((step) => step.ready).length;
  const nextProfileStep = profileGuideSteps.find((step) => !step.ready) ?? null;

  useEffect(() => {
    if (!props.highlightedTaskId) {
      return;
    }

    const target =
      props.highlightedTaskId === 'rune-cube'
        ? runeCardRef.current
        : props.highlightedTaskId === 'gem-cube'
          ? gemCardRef.current
          : goldCardRef.current;

    if (!target) {
      return;
    }

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, [props.highlightedTaskId]);

  useEffect(() => {
    if (!preflight || globalChecks.length === 0) {
      return;
    }

    const signature = JSON.stringify({
      tone: environmentDiagnosis.tone,
      title: environmentDiagnosis.title,
      description: environmentDiagnosis.description,
      dependencies: dependencyChecks.map((check) => `${check.key}:${check.detail}`),
      global: globalChecks.map((check) => `${check.key}:${check.level}:${check.detail}`)
    });

    if (environmentSnapshotRef.current === signature) {
      return;
    }

    environmentSnapshotRef.current = signature;
    appendEnvironmentTimeline({
      time: preflight.generatedAt,
      tone: environmentDiagnosis.tone,
      title: `环境快照 · ${environmentDiagnosis.title}`,
      detail: `${environmentDiagnosis.description} 依赖 ${installedDependencies}/${dependencyChecks.length || 0}，OCR ${
        findGlobalCheck(globalChecks, 'ocr-engine')?.level === 'ok' ? '已就绪' : '待补齐'
      }。`,
      meta: '自动预检'
    });
  }, [
    preflight,
    globalChecks,
    dependencyChecks,
    environmentDiagnosis,
    installedDependencies
  ]);

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

  function requestPreflightRefresh() {
    setPreflightTick((current) => current + 1);
  }

  function scrollToTask(id: IntegrationId) {
    const target =
      id === 'rune-cube'
        ? runeCardRef.current
        : id === 'gem-cube'
          ? gemCardRef.current
          : goldCardRef.current;

    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openRecordingGuide(item: IntegrationConfig) {
    setRecordingGuide({
      taskId: item.id,
      stepIndex: 0,
      status: 'recording',
      detail: 'Python 录制窗口已经打开。请看弹出的控制台，按顺序对准游戏界面并按 F10 捕获当前点位。',
      updatedAt: new Date().toISOString(),
      lastLine: 'Waiting for the first recorder hint...',
      live: false
    });
    scrollToTask(item.id);
  }

  function appendEnvironmentTimeline(
    entry: Omit<EnvironmentTimelineEntry, 'id'>
  ) {
    setEnvironmentTimeline((current) => {
      const duplicate = current[0];
      if (
        duplicate &&
        duplicate.title === entry.title &&
        duplicate.detail === entry.detail &&
        duplicate.meta === entry.meta
      ) {
        return current;
      }

      return [
        {
          ...entry,
          id: `${entry.time}-${Math.random().toString(36).slice(2, 8)}`
        },
        ...current
      ].slice(0, 8);
    });
  }

  function buildEnvironmentReport(): string {
    const generatedAt = new Date().toISOString();
    const ocrReady = findGlobalCheck(globalChecks, 'ocr-engine')?.level === 'ok';
    const globalSection =
      globalChecks.length > 0
        ? globalChecks
            .map(
              (check) =>
                `- [${getCheckLevelLabel(check.level)}] ${check.label}: ${check.detail}`
            )
            .join('\n')
        : '- 暂无全局预检结果';
    const dependencySection =
      dependencyChecks.length > 0
        ? dependencyChecks
            .map(
              (check) =>
                `- ${getDependencyTitle(check)}: ${check.detail}`
            )
            .join('\n')
        : '- 暂无依赖诊断结果';
    const taskSection =
      (preflight?.tasks ?? []).length > 0
        ? (preflight?.tasks ?? [])
            .map((task) => {
              const taskLines =
                task.checks.length > 0
                  ? task.checks
                      .map(
                        (check) =>
                          `  - [${getCheckLevelLabel(check.level)}] ${check.label}: ${check.detail}`
                      )
                      .join('\n')
                  : '  - 暂无细分检查';

              return [
                `### ${getTaskMetaText(task.id).title}`,
                `- 状态：${getTaskStatusLabel(task.status)}`,
                `- 摘要：${task.summary}`,
                taskLines
              ].join('\n');
            })
            .join('\n\n')
        : '### 暂无任务预检结果\n- 当前还没有生成任务级诊断';
    const timelineSection =
      environmentTimeline.length > 0
        ? environmentTimeline
            .map(
              (entry, index) =>
                `${index + 1}. ${entry.title} (${formatCompactDateTime(entry.time)})\n   ${entry.detail}\n   ${entry.meta}`
            )
            .join('\n')
        : '1. 还没有环境事件记录';
    const latestLogSection = environmentLog
      ? [
          `- 日志路径：${environmentLog.path}`,
          parsedEnvironmentLog?.headline
            ? `- 结果摘要：${parsedEnvironmentLog.headline}`
            : '- 结果摘要：暂无摘要',
          parsedEnvironmentLog?.guidance
            ? `- 处理建议：${parsedEnvironmentLog.guidance}`
            : '- 处理建议：请查看原始日志'
        ].join('\n')
      : '- 暂无环境修复日志';

    return [
      '# 暗黑2桌宠 环境诊断报告',
      `生成时间：${formatCompactDateTime(generatedAt)}`,
      '',
      '## 当前结论',
      `- 诊断：${environmentDiagnosis.title}`,
      `- 状态：${getDiagnosisToneLabel(environmentDiagnosis.tone)}`,
      `- 说明：${environmentDiagnosis.description}`,
      `- 依赖安装：${installedDependencies}/${dependencyChecks.length || 0}`,
      `- OCR：${ocrReady ? '已就绪' : '待补齐'}`,
      `- Runtime 目录：${runeTask.workingDirectory}`,
      '',
      '## 全局预检',
      globalSection,
      '',
      '## 依赖矩阵',
      dependencySection,
      '',
      '## 任务状态',
      taskSection,
      '',
      '## 最近环境时间线',
      timelineSection,
      '',
      '## 最近一次环境日志',
      latestLogSection
    ].join('\n');
  }

  async function copyEnvironmentReport() {
    await props.onCopyText(buildEnvironmentReport());
  }

  async function exportEnvironmentReport() {
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    await props.onExportText({
      suggestedName: `environment-diagnostic-${stamp}`,
      defaultExtension: 'md',
      content: buildEnvironmentReport()
    });
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
        id,
        title,
        path: log.path,
        content: log.content
      });
    } catch (error) {
      setViewer({
        id,
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
        await openLogViewer(id, `${getTaskMetaText(id).title} / ${getModeLabelText(mode)}日志`);
      }
      requestPreflightRefresh();
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

      if (action === 'record-profile') {
        setRecordingGuide({
          taskId: item.id,
          stepIndex: Math.max(0, getReadableRecordStepsText(item.id).length - 1),
          status: response.result.success ? 'success' : 'error',
          detail: response.result.success
            ? `${getIntegrationLabel(item.id)} Profile 录制完成，预检会自动刷新。你现在可以看 Profile，或者直接试运行这条任务。`
            : response.result.stderr || 'Profile 录制失败，请查看日志或重新录制。',
          updatedAt: new Date().toISOString(),
          lastLine: response.result.stderr || response.result.stdout || '录制流程已结束。',
          live: true
        });

        setRecordingGuide((current) =>
          current
            ? {
                ...current,
                detail: response.result.success
                  ? getRecordingSuccessSummary(item.id)
                  : getRecordingFailureSummary(response.result.stderr || response.result.stdout),
                updatedAt: new Date().toISOString()
              }
            : current
        );

        if (response.result.success) {
          scrollToTask(item.id);
        }
      }

      if (response.result.success) {
        await openLogViewer(item.id, `${getTaskMetaText(item.id).title} / ${getAdminLabelText(action)}日志`);
      }
      requestPreflightRefresh();
    } catch (error) {
      if (action === 'record-profile') {
        setRecordingGuide({
          taskId: item.id,
          stepIndex: 0,
          status: 'error',
          detail: getErrorMessage(error),
          updatedAt: new Date().toISOString(),
          lastLine: getErrorMessage(error),
          live: false
        });

        setRecordingGuide((current) =>
          current
            ? {
                ...current,
                detail: getRecordingFailureSummary(getErrorMessage(error)),
                updatedAt: new Date().toISOString()
              }
            : current
        );
      }
      return;
    }
  }

  async function runEnvironmentAction(action: EnvironmentAction) {
    try {
      const response = await props.onRunEnvironmentAction({ action });
      const nextParsedLog = parseAutomationLog(response.log.content);
      setEnvironmentLog(response.log);
      setViewer({
        title:
          action === 'install-python-runtime'
            ? '环境修复 / 安装内置 Runtime 日志'
            : action === 'install-python-deps'
              ? '环境修复 / 安装 Python 依赖日志'
              : '环境修复日志',
        path: response.log.path,
        content: response.log.content
      });
      appendEnvironmentTimeline({
        time: new Date().toISOString(),
        tone: response.result.success ? 'success' : 'error',
        title:
          action === 'install-python-runtime'
            ? '安装内置 Runtime'
            : action === 'install-python-deps'
              ? '安装 Python 依赖'
              : '执行环境修复动作',
        detail: response.result.success
          ? nextParsedLog?.headline || '环境修复动作已经完成。'
          : nextParsedLog?.headline || response.result.stderr || '环境修复动作执行失败。',
        meta:
          response.result.code !== null
            ? `退出码 ${response.result.code}`
            : '日志已写入'
      });
      requestPreflightRefresh();
    } catch {
      return;
    }
  }

  async function handleQuickFix(item: IntegrationConfig, action: QuickFixAction) {
    switch (action.kind) {
      case 'admin':
        if (action.adminAction) {
          if (action.adminAction === 'record-profile') {
            openRecordingGuide(item);
          }
          await runAdmin(item, action.adminAction);
        }
        return;
      case 'environment-action':
        if (action.environmentAction) {
          await runEnvironmentAction(action.environmentAction);
        }
        return;
      case 'open-path':
        if (action.path) {
          await props.onOpenPath(action.path);
        }
        return;
      case 'set-gem-mode':
        if (action.mode) {
          updateDraft('gemInputMode', action.mode);
        }
        return;
      case 'set-allow-inactive':
        updateDraft('allowInactiveWindow', Boolean(action.value));
        return;
      case 'set-wait': {
        const waitRepair = getWaitRepair(item.id);
        updateDraft(waitRepair.draftKey, Number(action.value ?? waitRepair.value));
        return;
      }
      case 'clear-gem-path':
        updateDraft('gemImagePath', '');
        clearGemImage();
        return;
      case 'refresh':
        requestPreflightRefresh();
        return;
    }
  }

  function getTaskCardTone(id: IntegrationId): 'spotlight' | 'recording' | 'next-step' | 'idle' {
    if (recordingGuide?.taskId === id) {
      if (recordingGuide.status === 'recording') {
        return 'recording';
      }

      if (recordingGuide.status === 'success') {
        return 'next-step';
      }
    }

    if (props.highlightedTaskId === id) {
      return 'spotlight';
    }

    return 'idle';
  }

  function renderTaskLiveGuide(item: IntegrationConfig) {
    const preflightTask = preflightMap.get(item.id) ?? null;
    const profileReady = isTaskProfileReady(item);
    const tone = getTaskCardTone(item.id);
    const currentStepLabel =
      recordingGuide && recordingGuide.taskId === item.id
        ? getReadableRecordStepsText(item.id)[
            Math.min(recordingGuide.stepIndex, getReadableRecordStepsText(item.id).length - 1)
          ]
        : null;

    if (recordingGuide?.taskId === item.id && recordingGuide.status === 'recording') {
      return (
        <article className="task-live-guide recording">
          <div>
            <p className="eyebrow">Live Recording</p>
            <strong>这张任务卡正在录 Profile</strong>
            <p>
              当前步骤：{currentStepLabel ?? '等待同步'}。把鼠标对到目标位置后，回到录制窗口按
              <code> F10</code>。
            </p>
          </div>
          <div className="task-live-actions">
            <span className="mini-pill warm">录制中</span>
            <button
              className="ghost-button"
              disabled={props.busyKey !== null}
              onClick={() => setRecordingGuide((current) => (current ? { ...current } : current))}
              type="button"
            >
              看顶部助手
            </button>
          </div>
        </article>
      );
    }

    if (recordingGuide?.taskId === item.id && recordingGuide.status === 'success') {
      return (
        <article className="task-live-guide success">
          <div>
            <p className="eyebrow">Next Move</p>
            <strong>Profile 已录好，直接试运行这条线</strong>
            <p>{getRecordingSuccessSummary(item.id)}</p>
          </div>
          <div className="task-live-actions">
            <button
              className="primary-button"
              disabled={props.busyKey !== null}
              onClick={() => void runTask(item.id, 'dry-run')}
              type="button"
            >
              立即试运行
            </button>
            <button
              className="ghost-button"
              disabled={props.busyKey !== null}
              onClick={() => void runAdmin(item, 'print-profile')}
              type="button"
            >
              看 Profile
            </button>
          </div>
        </article>
      );
    }

    if (recordingGuide?.taskId === item.id && recordingGuide.status === 'error') {
      return (
        <article className="task-live-guide error">
          <div>
            <p className="eyebrow">Retry Suggested</p>
            <strong>这条任务线刚刚录制失败了</strong>
            <p>{recordingGuide.detail}</p>
          </div>
          <div className="task-live-actions">
            <button
              className="primary-button"
              disabled={props.busyKey !== null}
              onClick={() => {
                openRecordingGuide(item);
                void runAdmin(item, 'record-profile');
              }}
              type="button"
            >
              重新录 Profile
            </button>
            <button
              className="ghost-button"
              disabled={props.busyKey !== null}
              onClick={() => void openLogViewer(item.id, `${getTaskMetaText(item.id).title} / 执行日志`)}
              type="button"
            >
              看失败日志
            </button>
          </div>
        </article>
      );
    }

    if (props.highlightedTaskId === item.id) {
      return (
        <article className={`task-live-guide ${tone === 'spotlight' ? 'focus' : 'soft'}`}>
          <div>
            <p className="eyebrow">当前引导焦点</p>
            <strong>
              {profileReady
                ? '这条任务线已经就绪，下一步可以直接试运行'
                : '这条任务线是当前推荐入口，先把 Profile 录好'}
            </strong>
            <p>
              {profileReady
                ? preflightTask?.status === 'ready'
                  ? '预检也已经通过了，先跑一遍试运行最稳。'
                  : 'Profile 已有了，但还有别的条件没补齐，先看诊断卡。'
                : '顺着这张卡往下点，先录 Profile，再试运行。'}
            </p>
          </div>
          <div className="task-live-actions">
            {profileReady ? (
              <button
                className="primary-button"
                disabled={props.busyKey !== null}
                onClick={() => void runTask(item.id, 'dry-run')}
                type="button"
              >
                试运行这条线
              </button>
            ) : (
              <button
                className="primary-button"
                disabled={props.busyKey !== null}
                onClick={() => {
                  openRecordingGuide(item);
                  void runAdmin(item, 'record-profile');
                }}
                type="button"
              >
                先录 Profile
              </button>
            )}
          </div>
        </article>
      );
    }

    return null;
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
              {busy ? `${getModeLabelText(mode)}中...` : getModeLabelText(mode)}
            </button>
          );
        })}
      </>
    );
  }

  function renderRecordingGuideCard() {
    if (!recordingGuide) {
      return null;
    }

    const item = getIntegration(props.integrations, recordingGuide.taskId);
    const steps = getReadableRecordStepsText(recordingGuide.taskId);
    const currentStep = steps[Math.min(recordingGuide.stepIndex, steps.length - 1)] ?? steps[0];
    const busy =
      props.busyKey === getAdminBusyKey(recordingGuide.taskId, 'record-profile') ||
      recordingGuide.status === 'recording';

    return (
      <article className={`card recording-guide-card ${recordingGuide.status}`}>
        <div className="integration-head">
          <div>
            <p className="eyebrow">录制助手</p>
            <div className="card-title">正在录 {getIntegrationLabel(recordingGuide.taskId)} Profile</div>
            <p className="secondary-text">
              录制助手会跟着控制台提示自动推进。你只需要切回游戏，把鼠标对到目标位置后按
              <code> F10</code>。
            </p>
          </div>
          <div className="tool-row">
            <span className={`status-pill ${recordingGuide.live ? 'success' : 'warm'}`}>
              {recordingGuide.live ? '实时同步' : '预置步骤'}
            </span>
            <span
              className={`status-pill ${
                recordingGuide.status === 'success'
                  ? 'success'
                  : recordingGuide.status === 'error'
                    ? 'error'
                    : 'warm'
              }`}
            >
              {recordingGuide.status === 'success'
                ? '录制完成'
                : recordingGuide.status === 'error'
                  ? '录制失败'
                  : '录制中'}
            </span>
            <button
              className="ghost-button"
              onClick={() => setRecordingGuide(null)}
              type="button"
            >
              收起助手
            </button>
          </div>
        </div>

        <article className={`recording-guide-focus ${recordingGuide.status}`}>
          <div>
            <p className="eyebrow">当前步骤</p>
            <strong>{currentStep}</strong>
            <p>{recordingGuide.detail}</p>
            <p className="recording-guide-console-line">
              最近一条录制提示：{recordingGuide.lastLine ?? '等待录制提示...'}
            </p>
            <span className="helper-text">
              热键：按 <code>F10</code> 捕获当前位置，按 <code>F12</code> 提前结束录制。时间：
              {formatCompactDateTime(recordingGuide.updatedAt)}
            </span>
          </div>
          <div className="tool-row">
            <button
              className="ghost-button"
              disabled={busy || recordingGuide.stepIndex <= 0}
              onClick={() =>
                setRecordingGuide((current) =>
                  current
                    ? { ...current, stepIndex: Math.max(0, current.stepIndex - 1) }
                    : current
                )
              }
              type="button"
            >
              上一步提示
            </button>
            <button
              className="primary-button"
              disabled={busy || recordingGuide.stepIndex >= steps.length - 1}
              onClick={() =>
                setRecordingGuide((current) =>
                  current
                    ? {
                        ...current,
                        stepIndex: Math.min(steps.length - 1, current.stepIndex + 1),
                        updatedAt: new Date().toISOString()
                      }
                    : current
                )
              }
              type="button"
            >
              下一步提示
            </button>
            <button
              className="ghost-button"
              onClick={() => scrollToTask(recordingGuide.taskId)}
              type="button"
            >
              回到任务卡
            </button>
          </div>
        </article>

        <div className="recording-guide-step-grid">
          {steps.map((step, index) => {
            const state =
              index < recordingGuide.stepIndex
                ? 'done'
                : index === recordingGuide.stepIndex
                  ? 'current'
                  : 'upcoming';

            return (
              <article
                className={`recording-guide-step ${state}`}
                key={`${recordingGuide.taskId}-${step}`}
              >
                <span className="mini-pill">步骤 {index + 1}</span>
                <strong>{step}</strong>
                <p>
                  {state === 'done'
                    ? '这一格已经录完了，可以继续往后走。'
                    : state === 'current'
                      ? '把鼠标对准当前目标，回到录制窗口后按 F10。'
                      : '先不用急，录完当前高亮步骤再继续。'}
                </p>
              </article>
            );
          })}
        </div>

        <div className="recording-guide-footer">
          <span className="helper-text">
            {busy
              ? `录制窗口仍在运行：${getTaskMetaText(item.id).title}`
              : recordingGuide.status === 'success'
                ? 'Profile 已录好。建议现在先试运行一次，确认点击点和流程都对。'
                : '录制已中断或失败。先看日志，再重新录一次会更稳。'}
          </span>
          <div className="tool-row">
            {recordingGuide.status === 'success' ? (
              <button
                className="primary-button"
                disabled={props.busyKey !== null}
                onClick={() => void runTask(item.id, 'dry-run')}
                type="button"
              >
                立即试运行
              </button>
            ) : null}
            <button
              className="ghost-button"
              disabled={props.busyKey !== null}
              onClick={() => void runAdmin(item, 'print-profile')}
              type="button"
            >
              查看 Profile
            </button>
            <button
              className="ghost-button"
              disabled={props.busyKey !== null}
              onClick={() => void openLogViewer(item.id, `${getTaskMetaText(item.id).title} / 执行日志`)}
              type="button"
            >
              查看日志
            </button>
          </div>
        </div>
      </article>
    );
  }

  function renderAdminButtons(item: IntegrationConfig) {
    const recordingState =
      recordingGuide?.taskId === item.id ? recordingGuide.status : null;

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
          className={recordingState === 'recording' ? 'primary-button' : 'ghost-button'}
          disabled={props.busyKey !== null}
          onClick={() => {
            openRecordingGuide(item);
            void runAdmin(item, 'record-profile');
          }}
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
          onClick={() => void openLogViewer(item.id, `${getTaskMetaText(item.id).title} / 执行日志`)}
          type="button"
        >
          {logBusyId === item.id ? '读取日志中...' : '看日志'}
        </button>
      </>
    );
  }

  function renderAdminButtonsSmart(item: IntegrationConfig) {
    const recordingState =
      recordingGuide?.taskId === item.id ? recordingGuide.status : null;

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
          className={recordingState === 'recording' ? 'primary-button' : 'ghost-button'}
          disabled={props.busyKey !== null}
          onClick={() => {
            openRecordingGuide(item);
            void runAdmin(item, 'record-profile');
          }}
          type="button"
        >
          {props.busyKey === getAdminBusyKey(item.id, 'record-profile')
            ? '录制中...'
            : recordingState === 'success' || recordingState === 'error'
              ? '重录 Profile'
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
          onClick={() => void openLogViewer(item.id, `${getTaskMetaText(item.id).title} / 执行日志`)}
          type="button"
        >
          {logBusyId === item.id ? '读取日志中...' : '看日志'}
        </button>
      </>
    );
  }

  function renderGlobalChecks() {
    const visibleChecks = getVisibleGlobalChecks(preflight?.globalChecks ?? []);

    return (
      <article className="card preflight-banner">
        <div className="integration-head">
          <div>
            <div className="card-title">工坊预检</div>
            <p className="secondary-text">
              这里会实时检查 Python、runtime、依赖包、Profile 和当前输入条件，先扫雷再执行。
            </p>
          </div>
          <div className="tool-row">
            <span className="status-pill">{preflightBusy ? '预检更新中' : '实时联调'}</span>
            <button
              className="ghost-button"
              disabled={preflightBusy || props.busyKey !== null}
              onClick={requestPreflightRefresh}
              type="button"
            >
              {preflightBusy ? '刷新中...' : '立即刷新'}
            </button>
          </div>
        </div>

        {preflightError ? (
          <div className="empty-state compact-empty">
            <strong>预检暂时失败</strong>
            <p>{preflightError}</p>
          </div>
        ) : (
          <div className="preflight-grid">
            {visibleChecks.map((check) => (
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

  function renderEnvironmentStation() {
    const diagnosis = environmentDiagnosis;
    return (
      <article className={`card environment-card environment-card-${environmentDiagnosis.tone}`}>
        <div className="integration-head">
          <div>
            <div className="card-title">环境修复站</div>
            <p className="secondary-text">
              把 Python 解释器、requirements、运行时依赖和 OCR 能力收进一个地方管理。
            </p>
          </div>
          <span className={`status-pill ${diagnosis.tone}`}>
            {diagnosis.tone === 'success'
              ? '环境就绪'
              : diagnosis.tone === 'error'
                ? '需要修复'
                : '建议处理'}
          </span>
        </div>

        <div className="environment-summary">
          <strong>{diagnosis.title}</strong>
          <p>{diagnosis.description}</p>
          <div className="tag-row">
            <span className="mini-pill">依赖已安装 {installedDependencies}/{dependencyChecks.length || 0}</span>
            {findGlobalCheck(globalChecks, 'ocr-engine')?.level === 'ok' ? (
              <span className="mini-pill">OCR 已就绪</span>
            ) : (
              <span className="mini-pill">OCR 待补齐</span>
            )}
          </div>
        </div>

        <article className="environment-entry-banner">
          <div>
            <p className="eyebrow">先录 Profile</p>
            <strong>{environmentPrimaryAction.label.replace('中...', '').replace('...', '')}</strong>
            <p className="secondary-text">{environmentPrimaryAction.detail}</p>
          </div>
          <div className="tool-row">
            <button
              className="primary-button"
              disabled={
                props.busyKey !== null ||
                (environmentPrimaryAction.action === null && preflightBusy)
              }
              onClick={() => {
                if (environmentPrimaryAction.action) {
                  void runEnvironmentAction(environmentPrimaryAction.action);
                  return;
                }

                requestPreflightRefresh();
              }}
              type="button"
            >
              {environmentPrimaryAction.label}
            </button>
            <button
              className="ghost-button"
              disabled={props.busyKey !== null || preflightBusy}
              onClick={requestPreflightRefresh}
              type="button"
            >
              {preflightBusy ? '刷新中...' : '刷新诊断'}
            </button>
          </div>
        </article>

        <div className="diagnosis-actions">
          {diagnosis.actions.map((action, index) => (
            <button
              className={index === 0 ? 'primary-button' : 'ghost-button'}
              disabled={
                props.busyKey !== null ||
                (action.kind === 'refresh' && preflightBusy) ||
                (action.kind === 'environment-action' &&
                  props.busyKey === getEnvironmentBusyKey(action.environmentAction as EnvironmentAction))
              }
              key={action.key}
              onClick={() => void handleQuickFix(runeTask, action)}
              type="button"
            >
              {action.kind === 'refresh' && preflightBusy
                ? '刷新中...'
                : action.kind === 'environment-action' &&
                    props.busyKey === getEnvironmentBusyKey(action.environmentAction as EnvironmentAction)
                  ? '处理中...'
                  : action.label}
            </button>
          ))}
        </div>

        <div className="environment-dependency-grid">
          {dependencyChecks.map((check) => (
            <article className={`dependency-card ${getCheckToneClass(check.level)}`} key={check.key}>
              <div className="dependency-card-head">
                <strong>{getDependencyTitle(check)}</strong>
                <span>{check.level === 'ok' ? '已安装' : '缺失'}</span>
              </div>
              <p>{check.detail}</p>
            </article>
          ))}
        </div>
      </article>
    );
  }

  function renderEnvironmentStationModern() {
    return (
      <article className={`card environment-card environment-card-${environmentDiagnosis.tone}`}>
        <div className="integration-head">
          <div>
            <div className="card-title">环境修复站</div>
            <p className="secondary-text">
              把 Python 解释器、requirements、运行时依赖和 OCR 能力收进一个地方管理。
            </p>
          </div>
          <span className={`status-pill ${environmentDiagnosis.tone}`}>
            {getDiagnosisToneLabel(environmentDiagnosis.tone)}
          </span>
        </div>

        <div className="environment-summary">
          <strong>{environmentDiagnosis.title}</strong>
          <p>{environmentDiagnosis.description}</p>
          <div className="tag-row">
            <span className="mini-pill">
              依赖已安装 {installedDependencies}/{dependencyChecks.length || 0}
            </span>
            {findGlobalCheck(globalChecks, 'ocr-engine')?.level === 'ok' ? (
              <span className="mini-pill">OCR 已就绪</span>
            ) : (
              <span className="mini-pill">OCR 待补齐</span>
            )}
            {environmentLog?.path ? <span className="mini-pill">最近修复日志已留存</span> : null}
          </div>
        </div>

        <div className="diagnosis-actions">
          {environmentDiagnosis.actions.map((action, index) => (
            <button
              className={index === 0 ? 'primary-button' : 'ghost-button'}
              disabled={
                props.busyKey !== null ||
                (action.kind === 'refresh' && preflightBusy) ||
                (action.kind === 'environment-action' &&
                  props.busyKey === getEnvironmentBusyKey(action.environmentAction as EnvironmentAction))
              }
              key={action.key}
              onClick={() => void handleQuickFix(runeTask, action)}
              type="button"
            >
              {action.kind === 'refresh' && preflightBusy
                ? '刷新中...'
                : action.kind === 'environment-action' &&
                    props.busyKey === getEnvironmentBusyKey(action.environmentAction as EnvironmentAction)
                  ? '处理中...'
                  : action.label}
            </button>
          ))}
        </div>

        <div className="environment-utility-row">
          <button
            className="ghost-button"
            disabled={props.busyKey !== null || !preflight}
            onClick={() => void copyEnvironmentReport()}
            type="button"
          >
            复制诊断报告
          </button>
          <button
            className="ghost-button"
            disabled={props.busyKey !== null || !preflight}
            onClick={() => void exportEnvironmentReport()}
            type="button"
          >
            导出诊断报告
          </button>
          {environmentLog?.path ? (
            <button
              className="ghost-button"
              disabled={props.busyKey !== null}
              onClick={() => void props.onOpenPath(environmentLog.path)}
              type="button"
            >
              打开最新修复日志
            </button>
          ) : null}
        </div>

        <div className="environment-detail-grid">
          <div className="environment-dependency-grid">
            {dependencyChecks.map((check) => (
              <article className={`dependency-card ${getCheckToneClass(check.level)}`} key={check.key}>
                <div className="dependency-card-head">
                  <strong>{getDependencyTitle(check)}</strong>
                  <span>{check.level === 'ok' ? '已安装' : '缺失'}</span>
                </div>
                <p>{check.detail}</p>
              </article>
            ))}
          </div>

          <article className="report-summary-card environment-timeline-card">
            <div className="integration-head">
              <div>
                <div className="card-title small">修复时间线</div>
                <p className="secondary-text">记录最近的预检变化和环境修复动作。</p>
              </div>
              <span className="mini-pill">{environmentTimeline.length} 条</span>
            </div>

            {environmentTimeline.length === 0 ? (
              <div className="empty-state compact-empty">
                <strong>还没有环境事件</strong>
                <p>等一次预检快照或环境修复动作完成后，这里就会开始留痕。</p>
              </div>
            ) : (
              <div className="environment-timeline">
                {environmentTimeline.map((entry) => (
                  <article className={`timeline-entry ${entry.tone}`} key={entry.id}>
                    <div className="timeline-entry-head">
                      <strong>{entry.title}</strong>
                      <span>{formatCompactDateTime(entry.time)}</span>
                    </div>
                    <p>{entry.detail}</p>
                    <span className="helper-text">{entry.meta}</span>
                  </article>
                ))}
              </div>
            )}

            {parsedEnvironmentLog ? (
              <div className="environment-log-note">
                <strong>最近一次修复怎么看</strong>
                <p>{parsedEnvironmentLog.headline}</p>
                <span>{parsedEnvironmentLog.guidance}</span>
              </div>
            ) : null}
          </article>
        </div>
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
            <strong>{getTaskMetaText(item.id).title}</strong>
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
        <p>{task?.summary ?? getTaskMetaText(item.id).description}</p>
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
        <summary>更多信息</summary>
        <div className="tool-details-content">
          <p className="helper-text">{getProfileNoteText(item)}</p>
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
            {getReadableRecordStepsText(item.id).map((step) => (
              <span className="mini-pill" key={step}>
                {step}
              </span>
            ))}
          </div>
          <p className="helper-text">录制时按 <code>F10</code> 捕获当前位置，按 <code>F12</code> 结束录制。</p>
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
          <p>输入变化后会自动刷新，不需要手动重复点检测。</p>
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
  function renderTaskDiagnosis(item: IntegrationConfig, compact = false) {
    const diagnosis = buildTaskDiagnosisText(
      item,
      preflightMap.get(item.id) ?? null,
      drafts,
      Boolean(gemImageDataUrl)
    );

    return (
      <article className={`diagnosis-card ${diagnosis.tone} ${compact ? 'compact' : ''}`}>
        <div className="integration-head">
          <div>
            <div className="card-title small">{diagnosis.title}</div>
            <p className="secondary-text">{diagnosis.description}</p>
          </div>
          <span className={`status-pill ${diagnosis.tone}`}>
            {diagnosis.tone === 'success'
              ? '已诊断'
              : diagnosis.tone === 'error'
                ? '需要修复'
                : '建议处理'}
          </span>
        </div>

        <div className="diagnosis-actions">
          {diagnosis.actions.length > 0 ? (
            diagnosis.actions.map((action, index) => (
              <button
                className={index === 0 ? 'primary-button' : 'ghost-button'}
                disabled={
                  props.busyKey !== null ||
                  (action.kind === 'refresh' && preflightBusy)
                }
                key={action.key}
                onClick={() => void handleQuickFix(item, action)}
                type="button"
              >
                {action.kind === 'refresh' && preflightBusy ? '刷新中...' : action.label}
              </button>
            ))
          ) : (
            <span className="helper-text">当前没有可自动处理的动作，先按诊断提示检查输入和环境。</span>
          )}
        </div>
      </article>
    );
  }
  function renderTaskFooter(item: IntegrationConfig) {
    return (
      <>
        <div className="result-line">
          <span className={`status-dot status-${item.lastStatus ?? 'idle'}`} />
          <span>{getStatusTextText(item)}</span>
        </div>
        <p className="secondary-text">{item.lastMessage || '执行结果摘要会显示在这里。'}</p>
        <p className="helper-text">{getTaskHintText(item.lastMessage)}</p>
      </>
    );
  }
  function renderProfileGuide() {
    return (
      <article className="card profile-guide-card">
        <div className="integration-head">
          <div>
            <p className="eyebrow">先录 Profile</p>
            <div className="card-title">Profile 录制向导</div>
            <p className="secondary-text">
              先把三条任务线的坐标录好，工坊才会从“能看”变成“能跑”。录制时按 <code>F10</code> 捕获点位，按 <code>F12</code> 结束。
            </p>
          </div>
          <span className={`status-pill ${readyProfileCount === profileGuideSteps.length ? 'success' : 'warm'}`}>
            {readyProfileCount}/{profileGuideSteps.length} 已录制
          </span>
        </div>

        <article className={`profile-guide-focus ${nextProfileStep ? 'attention' : 'success'}`}>
          <div>
            <p className="eyebrow">下一步</p>
            <strong>
              {nextProfileStep
                ? `先录 ${getIntegrationLabel(nextProfileStep.id)} Profile`
                : '三条 Profile 都已经就绪'}
            </strong>
            <p>
              {nextProfileStep
                ? `${nextProfileStep.detail} 录完后我会自动刷新预检，并把最新日志显示出来。`
                : '现在已经可以直接试运行三条任务线了，建议先从符文或金币开始。'}
            </p>
          </div>
          {nextProfileStep ? (
            <div className="tool-row">
              <button
                className="primary-button"
                disabled={props.busyKey !== null}
                onClick={() => {
                  scrollToTask(nextProfileStep.id);
                  const targetItem = getIntegration(props.integrations, nextProfileStep.id);
                  openRecordingGuide(targetItem);
                  void runAdmin(targetItem, 'record-profile');
                }}
                type="button"
              >
                {props.busyKey === getAdminBusyKey(nextProfileStep.id, 'record-profile')
                  ? '录制中...'
                  : `开始录 ${getIntegrationLabel(nextProfileStep.id)}`}
              </button>
              <button
                className="ghost-button"
                disabled={props.busyKey !== null}
                onClick={() => scrollToTask(nextProfileStep.id)}
                type="button"
              >
                先定位到任务卡
              </button>
            </div>
          ) : (
            <div className="tool-row">
              <button
                className="primary-button"
                disabled={props.busyKey !== null}
                onClick={() => void runTask('rune-cube', 'dry-run')}
                type="button"
              >
                试运行符文任务
              </button>
            </div>
          )}
        </article>

        <div className="profile-guide-grid">
          {profileGuideSteps.map((step, index) => {
            const item = getIntegration(props.integrations, step.id);
            const task = preflightMap.get(step.id) ?? null;
            const statusLabel = step.ready ? '已录制' : task ? '待录制' : '等待读取';
            return (
              <article
                className={`profile-guide-step ${step.ready ? 'ready' : 'pending'} ${
                  props.highlightedTaskId === step.id ? 'spotlight' : ''
                }`}
                key={step.id}
              >
                <div className="profile-guide-step-head">
                  <span className="mini-pill">步骤 {index + 1}</span>
                  <span className={`status-pill ${step.ready ? 'success' : 'attention'}`}>
                    {statusLabel}
                  </span>
                </div>
                <strong>{step.title}</strong>
                <p>{step.summary}</p>
                <span className="helper-text">{step.detail}</span>
                <div className="sequence-chips compact">
                  {getReadableRecordStepsText(step.id).slice(0, 4).map((recordStep) => (
                    <span className="mini-pill" key={recordStep}>
                      {recordStep}
                    </span>
                  ))}
                </div>
                <div className="profile-guide-actions">
                  {!step.ready ? (
                    <button
                      className="primary-button"
                      disabled={props.busyKey !== null}
                      onClick={() => {
                        scrollToTask(step.id);
                        openRecordingGuide(item);
                        void runAdmin(item, 'record-profile');
                      }}
                      type="button"
                    >
                      {props.busyKey === getAdminBusyKey(step.id, 'record-profile')
                        ? '录制中...'
                        : '录 Profile'}
                    </button>
                  ) : (
                    <button
                      className="ghost-button"
                      disabled={props.busyKey !== null}
                      onClick={() => void runAdmin(item, 'print-profile')}
                      type="button"
                    >
                      看 Profile
                    </button>
                  )}
                  <button
                    className="ghost-button"
                    disabled={props.busyKey !== null}
                    onClick={() => scrollToTask(step.id)}
                    type="button"
                  >
                    查看任务卡
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </article>
    );
  }
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">工坊</p>
          <h3>赫拉迪姆工坊</h3>
        </div>
        <span className="status-pill">预检、执行、维护和日志同屏闭环</span>
      </div>

      {props.highlightedTaskId ? (
        <article className="card workshop-spotlight-banner">
          <div>
            <p className="eyebrow">当前引导焦点</p>
            <strong>{getTaskSpotlightLabelText(props.highlightedTaskId)} 已为你定位</strong>
            <p className="secondary-text">我已经把本轮引导最相关的任务卡高亮出来了，直接沿着这张卡继续即可。</p>
          </div>
          <span className="status-pill warm">继续当前引导</span>
        </article>
      ) : null}

      {renderProfileGuide()}
      {renderRecordingGuideCard()}

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

      {renderEnvironmentStationModern()}
      {renderGlobalChecks()}

      <div className="overview-grid">
        {[runeTask, gemTask, goldTask].map((item) => renderTaskOverviewCard(item))}
      </div>

      <div className="workshop-grid">
        <article
          className={`card workshop-card task-tone-${getTaskCardTone('rune-cube')} ${props.highlightedTaskId === 'rune-cube' ? 'spotlight' : ''}`}
          ref={runeCardRef}
        >
          <div className="workshop-topbar">
            <div>
              <p className="eyebrow">builtin:rune_cubing</p>
              <div className="card-title">{getTaskMetaText(runeTask.id).title}</div>
              <p className="secondary-text">{getTaskMetaText(runeTask.id).description}</p>
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

          {renderTaskLiveGuide(runeTask)}

          <div className="task-section">
            <span className="task-section-label">运行</span>
            <div className="task-toolbar">{renderRunButtons('rune-cube')}</div>
          </div>
          <div className="task-section">
            <span className="task-section-label">维护</span>
            <div className="task-toolbar secondary">{renderAdminButtonsSmart(runeTask)}</div>
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
          {renderTaskDiagnosis(runeTask)}
          {renderTaskChecks('rune-cube')}
          {renderAdvancedDetails(runeTask)}
          {renderTaskFooter(runeTask)}
        </article>

        <article
          className={`card workshop-card task-tone-${getTaskCardTone('gem-cube')} ${props.highlightedTaskId === 'gem-cube' ? 'spotlight' : ''}`}
          ref={gemCardRef}
        >
          <div className="workshop-topbar">
            <div>
              <p className="eyebrow">builtin:gem_cubing</p>
              <div className="card-title">{getTaskMetaText(gemTask.id).title}</div>
              <p className="secondary-text">{getTaskMetaText(gemTask.id).description}</p>
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

          {renderTaskLiveGuide(gemTask)}

          <div className="task-section">
            <span className="task-section-label">运行</span>
            <div className="task-toolbar">{renderRunButtons('gem-cube')}</div>
          </div>
          <div className="task-section">
            <span className="task-section-label">维护</span>
            <div className="task-toolbar secondary">{renderAdminButtonsSmart(gemTask)}</div>
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
                {getInputModeLabelText(mode)}
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
          {renderTaskDiagnosis(gemTask)}
          {renderTaskChecks('gem-cube')}
          {renderAdvancedDetails(gemTask)}
          {renderTaskFooter(gemTask)}
        </article>

        <article
          className={`card workshop-card task-tone-${getTaskCardTone('drop-shared-gold')} ${props.highlightedTaskId === 'drop-shared-gold' ? 'spotlight' : ''}`}
          ref={goldCardRef}
        >
          <div className="workshop-topbar">
            <div>
              <p className="eyebrow">builtin:gold_drop</p>
              <div className="card-title">{getTaskMetaText(goldTask.id).title}</div>
              <p className="secondary-text">{getTaskMetaText(goldTask.id).description}</p>
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

          {renderTaskLiveGuide(goldTask)}

          <div className="task-section">
            <span className="task-section-label">运行</span>
            <div className="task-toolbar">{renderRunButtons('drop-shared-gold')}</div>
          </div>
          <div className="task-section">
            <span className="task-section-label">维护</span>
            <div className="task-toolbar secondary">{renderAdminButtonsSmart(goldTask)}</div>
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
          {renderTaskDiagnosis(goldTask)}
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
              {viewerIntegration ? renderTaskDiagnosis(viewerIntegration, true) : null}

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
                    <span className="mini-pill">标准输出 {parsedViewerLog.stdoutPreview.length} 条摘要</span>
                  ) : null}
                  {parsedViewerLog.stderrPreview.length > 0 ? (
                    <span className="mini-pill">标准错误 {parsedViewerLog.stderrPreview.length} 条摘要</span>
                  ) : null}
                </div>
              </article>

              <div className="log-section-grid">
                <article className="report-summary-card">
                  <div className="card-title small">标准输出摘要</div>
                  {parsedViewerLog.stdoutPreview.length === 0 ? (
                    <div className="empty-state compact-empty">
                      <strong>没有关键标准输出</strong>
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
                  <div className="card-title small">标准错误摘要</div>
                  {parsedViewerLog.stderrPreview.length === 0 ? (
                    <div className="empty-state compact-empty">
                      <strong>没有标准错误提醒</strong>
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
