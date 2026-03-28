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
      badge: '等待诊断',
      title: '先读取当前可用状态',
      detail: '我会先检查 Python 运行环境、依赖和三条坐标配置，再明确告诉你当前卡在哪一步。',
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
      title: runtimeBaseReady ? '切换到内置 Python 运行环境' : '先安装内置 Python 运行环境',
      detail: runtimeBaseReady
        ? '当前还能跑，但还在使用系统 Python。切到桌宠自带的运行环境后，后面的自动化和打包都会更稳。'
        : '桌宠需要先准备好自己的 Python、pip 和运行环境目录，后面的自动化任务才会真正开箱即用。',
      actionLabel: '安装内置 Python 运行环境',
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
      detail: '依赖和图像识别还没到位前，工坊任务和掉落识别都不会完整可用。',
      actionLabel: '一键安装依赖',
      action: 'install-deps',
      stepKey: 'deps'
    };
  }

  if (tasks.length === 0) {
    return {
      badge: '等待工坊状态',
      title: '还在读取三条任务线状态',
      detail: '我还没拿到符文、宝石、金币三条任务线的预检结果。先打开完整引导，或者去工坊刷新一次。',
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
      title: `先录 ${label} 坐标配置`,
      detail: '录完这一条后，工坊预检会马上更新，你也能更快进入试运行。',
      actionLabel: `去录 ${label} 坐标配置`,
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
      title: '核心功能已经能用了',
      detail: '环境、依赖和坐标配置都齐了。现在就能去工坊执行任务；悬浮态和通知只是额外增强。',
      actionLabel: '完成引导',
      action: 'complete-guide',
      stepKey: 'finish'
    };
  }

  return {
    badge: '已经可用',
    title: '桌宠已经准备好了',
    detail: 'Python 运行环境、依赖和坐标配置都齐了，悬浮态和通知也已经就位，可以正式开始用了。',
    actionLabel: '完成引导',
    action: 'complete-guide',
    stepKey: 'finish'
  };
}
