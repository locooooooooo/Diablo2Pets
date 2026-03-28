import type {
  AppSettings,
  AutomationCheckItem,
  AutomationPreflightResponse,
  AutomationPreflightTask,
  IntegrationId
} from '../types';

export interface SetupGuideHint {
  badge: string;
  title: string;
  detail: string;
  actionLabel: string;
  action: 'open-guide' | 'open-workshop-task' | 'enable-floating';
  stepKey: 'runtime' | 'deps' | 'profiles' | 'desktop' | 'finish';
  integrationId?: IntegrationId;
}

function findGlobalCheck(
  checks: AutomationCheckItem[],
  key: string
): AutomationCheckItem | null {
  return checks.find((check) => check.key === key) ?? null;
}

export function getIntegrationLabel(id: IntegrationId): string {
  switch (id) {
    case 'rune-cube':
      return '符文';
    case 'gem-cube':
      return '宝石';
    case 'drop-shared-gold':
      return '金币';
  }
}

export function isTaskProfileReady(task: AutomationPreflightTask): boolean {
  return task.checks.some((check) => check.key === 'profile-path' && check.level === 'ok');
}

export function buildSetupGuideHint(
  preflight: AutomationPreflightResponse | null,
  settings: AppSettings
): SetupGuideHint {
  if (!preflight) {
    return {
      badge: '下一步',
      title: '先打开完整引导',
      detail: '我会把环境、依赖和 Profile 的缺口列出来，你只要从第一步往下补就行。',
      actionLabel: '打开引导',
      action: 'open-guide',
      stepKey: 'runtime'
    };
  }

  const globalChecks = preflight.globalChecks ?? [];
  const tasks = preflight.tasks ?? [];
  const runtimeChecks = [
    findGlobalCheck(globalChecks, 'runtime-root'),
    findGlobalCheck(globalChecks, 'python-command'),
    findGlobalCheck(globalChecks, 'requirements-file'),
    findGlobalCheck(globalChecks, 'pip-command')
  ].filter(Boolean) as AutomationCheckItem[];
  const runtimeReady =
    runtimeChecks.length > 0 && runtimeChecks.every((check) => check.level === 'ok');

  if (!runtimeReady) {
    return {
      badge: '先补环境',
      title: '先确认 Python runtime',
      detail: '桌宠要先找到 Python、pip 和 runtime 目录，后面的自动化才能稳定跑起来。',
      actionLabel: '打开引导看环境',
      action: 'open-guide',
      stepKey: 'runtime'
    };
  }

  const dependencyCheck = findGlobalCheck(globalChecks, 'python-dependencies');
  const ocrCheck = findGlobalCheck(globalChecks, 'ocr-engine');
  const dependencyReady = dependencyCheck?.level === 'ok' && ocrCheck?.level === 'ok';

  if (!dependencyReady) {
    return {
      badge: '先补依赖',
      title: '先安装 Python 依赖',
      detail: '依赖和 OCR 没到位前，工坊任务和掉落识别都不会完整可用。',
      actionLabel: '打开引导装依赖',
      action: 'open-guide',
      stepKey: 'deps'
    };
  }

  const missingProfileTasks = tasks.filter((task) => !isTaskProfileReady(task));
  if (missingProfileTasks.length > 0) {
    const task = missingProfileTasks[0];
    const label = getIntegrationLabel(task.id);

    return {
      badge: '先录坐标',
      title: `先录 ${label} Profile`,
      detail: '录完这一项后，工坊预检会马上更接近全绿，你也能更快试跑。',
      actionLabel: `去录 ${label} Profile`,
      action: 'open-workshop-task',
      stepKey: 'profiles',
      integrationId: task.id
    };
  }

  const desktopReady =
    settings.windowMode === 'floating' || settings.notificationsEnabled;
  if (!desktopReady) {
    return {
      badge: '进入陪刷态',
      title: '把桌宠切成常驻陪刷',
      detail: '开悬浮态或通知后，它才会像真正的桌面助手一样一直跟着你。',
      actionLabel: '切到悬浮态',
      action: 'enable-floating',
      stepKey: 'desktop'
    };
  }

  return {
    badge: '最后收口',
    title: '回到引导完成收尾',
    detail: '环境、依赖和 Profile 已经都准备好了，现在只差把这段首启流程正式收口。',
    actionLabel: '打开引导收尾',
    action: 'open-guide',
    stepKey: 'finish'
  };
}
