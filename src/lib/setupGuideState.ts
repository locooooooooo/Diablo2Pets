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
  action:
    | 'open-guide'
    | 'open-workshop-task'
    | 'enable-floating'
    | 'install-runtime'
    | 'install-deps'
    | 'complete-guide';
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
      badge: '待读取状态',
      title: '先读取当前可用性',
      detail: '我会先检查环境、依赖和三条 Profile，再明确告诉你哪一步没补齐。',
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
  const pythonSourceCheck = findGlobalCheck(globalChecks, 'python-source');
  const runtimeBaseReady =
    runtimeChecks.length > 0 && runtimeChecks.every((check) => check.level === 'ok');
  const runtimeReady = runtimeBaseReady && pythonSourceCheck?.level === 'ok';

  if (!runtimeReady) {
    return {
      badge: '第 1 步',
      title: runtimeBaseReady ? '切到内置 Python runtime' : '先装内置 Python runtime',
      detail: runtimeBaseReady
        ? '当前还能跑，但还在用系统 Python。装到桌宠自己的 runtime 后，后面的自动化和打包都会更稳。'
        : '桌宠要先有自己的 Python、pip 和运行时目录，后面的自动化任务才会真正开箱即用。',
      actionLabel: '安装内置 Runtime',
      action: 'install-runtime',
      stepKey: 'runtime'
    };
  }

  const dependencyCheck = findGlobalCheck(globalChecks, 'python-dependencies');
  const ocrCheck = findGlobalCheck(globalChecks, 'ocr-engine');
  const dependencyReady = dependencyCheck?.level === 'ok' && ocrCheck?.level === 'ok';

  if (!dependencyReady) {
    return {
      badge: '第 2 步',
      title: '先安装 Python 依赖',
      detail: '依赖和 OCR 没到位前，工坊任务和掉落识别都不会完整可用。',
      actionLabel: '一键安装依赖',
      action: 'install-deps',
      stepKey: 'deps'
    };
  }

  if (tasks.length === 0) {
    return {
      badge: '待读取工坊',
      title: '还在确认三条任务线状态',
      detail: '我还没拿到符文、宝石、金币三条任务线的预检结果，先打开完整引导或工坊刷新一次。',
      actionLabel: '打开引导',
      action: 'open-guide',
      stepKey: 'profiles'
    };
  }

  const missingProfileTasks = tasks.filter((task) => !isTaskProfileReady(task));
  if (missingProfileTasks.length > 0) {
    const task = missingProfileTasks[0];
    const label = getIntegrationLabel(task.id);

    return {
      badge: '第 3 步',
      title: `先录 ${label} Profile`,
      detail: '录完这一项后，工坊预检会立刻更接近全绿，你也能更快开始试跑。',
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
      badge: '已经可用',
      title: '功能已经能用了，桌宠形态只是可选优化',
      detail: '环境、依赖和 Profile 都齐了。现在就能去工坊执行任务；悬浮态和通知只是让陪刷体验更完整。',
      actionLabel: '完成引导，开始使用',
      action: 'complete-guide',
      stepKey: 'finish'
    };
  }

  return {
    badge: '已经可用',
    title: '桌宠已经准备好，可以正式开用了',
    detail: '运行环境、依赖和 Profile 都已经准备好了，现在只差把这段首启流程正式收尾。',
    actionLabel: '完成引导，开始使用',
    action: 'complete-guide',
    stepKey: 'finish'
  };
}
