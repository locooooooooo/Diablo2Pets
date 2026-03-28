import type {
  AppSettings,
  AutomationCheckItem,
  AutomationPreflightResponse,
  IntegrationId
} from '../types';
import {
  getIntegrationLabel,
  isTaskProfileReady,
  type SetupGuideHint
} from '../lib/setupGuideState';

interface SetupGuideProps {
  preflight: AutomationPreflightResponse | null;
  loading: boolean;
  error: string;
  busyKey: string | null;
  settings: AppSettings;
  nextAction: SetupGuideHint;
  latestActivity: {
    title: string;
    detail: string;
    tone: StepTone;
    timestampLabel: string;
    logPreview?: string;
  } | null;
  onRefresh: () => void;
  onInstallRuntime: () => Promise<void>;
  onInstallDependencies: () => Promise<void>;
  onNextAction: () => void;
  onOpenWorkshop: () => void;
  onOpenWorkshopTask: (id: IntegrationId) => void;
  onEnableFloating: () => void;
  onEnableNotifications: () => void;
  onComplete: () => void;
  onDismiss: () => void;
}

type StepTone = 'success' | 'attention' | 'error';

interface SetupStepAction {
  label: string;
  kind: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
}

interface SetupStep {
  key: string;
  title: string;
  summary: string;
  detail: string;
  tone: StepTone;
  chips: string[];
  actions: SetupStepAction[];
}

function findGlobalCheck(
  checks: AutomationCheckItem[],
  key: string
): AutomationCheckItem | null {
  return checks.find((check) => check.key === key) ?? null;
}

function getToneLabel(tone: StepTone): string {
  switch (tone) {
    case 'success':
      return '已完成';
    case 'attention':
      return '建议处理';
    case 'error':
      return '需要修复';
  }
}

export function SetupGuide(props: SetupGuideProps) {
  const globalChecks = props.preflight?.globalChecks ?? [];
  const tasks = props.preflight?.tasks ?? [];
  const dependencyChecks = globalChecks.filter((check) => check.key.startsWith('dependency-'));
  const installedDependencyCount = dependencyChecks.filter((check) => check.level === 'ok').length;
  const runtimeChecks = [
    findGlobalCheck(globalChecks, 'runtime-root'),
    findGlobalCheck(globalChecks, 'python-command'),
    findGlobalCheck(globalChecks, 'requirements-file'),
    findGlobalCheck(globalChecks, 'pip-command')
  ].filter(Boolean) as AutomationCheckItem[];
  const runtimeBlockingCheck =
    runtimeChecks.find((check) => check.level === 'error') ??
    runtimeChecks.find((check) => check.level === 'warning') ??
    null;
  const pythonSourceCheck = findGlobalCheck(globalChecks, 'python-source');
  const runtimeBaseReady =
    runtimeChecks.length > 0 && runtimeChecks.every((check) => check.level === 'ok');
  const runtimeReady = runtimeBaseReady && pythonSourceCheck?.level === 'ok';
  const dependencyCheck = findGlobalCheck(globalChecks, 'python-dependencies');
  const ocrCheck = findGlobalCheck(globalChecks, 'ocr-engine');
  const dependencyReady = dependencyCheck?.level === 'ok' && ocrCheck?.level === 'ok';
  const missingProfileTasks = tasks.filter((task) => !isTaskProfileReady(task));
  const profilesReady = tasks.length > 0 && missingProfileTasks.length === 0;
  const coreReady = runtimeReady && dependencyReady && profilesReady;
  const desktopReady =
    props.settings.windowMode === 'floating' || props.settings.notificationsEnabled;
  const completedSteps = [runtimeReady, dependencyReady, profilesReady, desktopReady].filter(Boolean).length;
  const requiredCompletedSteps = [runtimeReady, dependencyReady, profilesReady].filter(Boolean).length;
  const installRuntimeBusy = props.busyKey === 'env-install-python-runtime';
  const installDepsBusy = props.busyKey === 'env-install-python-deps';
  const busyText = installRuntimeBusy
    ? '正在准备内置 Python runtime。首次执行可能需要几十秒，请先不要关闭桌宠。'
    : installDepsBusy
      ? '正在安装 Python 依赖和 OCR 组件。完成后我会自动重新诊断。'
      : '';
  const blockingSummary = [
    !runtimeReady ? '内置 runtime 还没到位' : null,
    !dependencyReady ? '依赖和 OCR 还没装齐' : null,
    !profilesReady ? '三条 Profile 还没录完' : null
  ].filter(Boolean) as string[];

  const steps: SetupStep[] = [
    {
      key: 'runtime',
      title: '让桌宠用上自己的 runtime',
      summary: runtimeReady
        ? '桌宠已经在使用内置 Python runtime。'
        : runtimeBaseReady
          ? '当前还能跑，但还在使用系统 Python。切到内置 runtime 后会更稳。'
          : '先把桌宠自带的 Python runtime 装好，后面的自动化才能真正开箱即用。',
      detail:
        runtimeBlockingCheck?.detail ??
        pythonSourceCheck?.detail ??
        '桌宠已经能稳定找到 Python、pip 和运行时目录。',
      tone: runtimeReady ? 'success' : runtimeBlockingCheck?.level === 'error' ? 'error' : 'attention',
      chips:
        [
          ...runtimeChecks.map((check) => {
            const label =
              check.level === 'ok' ? '正常' : check.level === 'warning' ? '提醒' : '阻塞';
            return `${check.label} · ${label}`;
          }),
          pythonSourceCheck
            ? `来源 · ${pythonSourceCheck.level === 'ok' ? '内置 runtime' : '系统 Python'}`
            : '来源 · 待识别'
        ].filter(Boolean),
      actions: runtimeReady
        ? [
            {
              label: props.loading ? '刷新中...' : '刷新诊断',
              kind: 'secondary',
              disabled: props.loading || props.busyKey !== null,
              onClick: props.onRefresh
            }
          ]
        : [
            {
              label: installRuntimeBusy ? '安装中...' : '安装内置 Runtime',
              kind: 'primary',
              disabled: props.busyKey !== null && !installRuntimeBusy,
              onClick: () => void props.onInstallRuntime()
            },
            {
              label: props.loading ? '刷新中...' : '刷新诊断',
              kind: 'secondary',
              disabled: props.loading || props.busyKey !== null,
              onClick: props.onRefresh
            }
          ]
    },
    {
      key: 'deps',
      title: '补齐依赖和 OCR',
      summary: dependencyReady
        ? '自动化依赖和 OCR 已经可以正常工作。'
        : '先把 Python 依赖装齐，工坊任务和掉落识别才会完整可用。',
      detail:
        dependencyCheck?.detail ??
        `当前已安装 ${installedDependencyCount}/${dependencyChecks.length || 0} 项运行时依赖。`,
      tone: dependencyReady ? 'success' : dependencyCheck?.level === 'error' ? 'error' : 'attention',
      chips: [
        `依赖 ${installedDependencyCount}/${dependencyChecks.length || 0}`,
        ocrCheck?.level === 'ok' ? 'OCR 已就绪' : 'OCR 待补齐'
      ],
      actions: dependencyReady
        ? []
        : [
            {
              label: installDepsBusy ? '安装中...' : '一键安装依赖',
              kind: 'primary',
              disabled: props.busyKey !== null && !installDepsBusy,
              onClick: () => void props.onInstallDependencies()
            }
          ]
    },
    {
      key: 'profiles',
      title: '录好三条 Profile',
      summary:
        tasks.length === 0
          ? '我还在读取工坊三条任务线的状态。'
          : profilesReady
            ? '符文、宝石、金币三条任务线都能直接开跑了。'
            : '继续把缺的 Profile 录完，工坊预检就会更接近全绿。',
      detail:
        tasks.length === 0
          ? '如果这里长时间不更新，先点刷新诊断，或者直接进入工坊查看完整预检。'
          : profilesReady
            ? '后面只要填数量、贴截图或输入金额，就可以直接试运行。'
            : '点下面缺的那一项，我会直接带你跳到工坊对应任务卡并高亮它。',
      tone:
        tasks.length === 0
          ? 'attention'
          : profilesReady
            ? 'success'
            : missingProfileTasks.length === tasks.length
              ? 'error'
              : 'attention',
      chips:
        tasks.length > 0
          ? tasks.map(
              (task) =>
                `${getIntegrationLabel(task.id)} · ${isTaskProfileReady(task) ? '已录制' : '待录制'}`
            )
          : ['等待工坊预检结果'],
      actions: profilesReady
        ? []
        : missingProfileTasks.map((task) => ({
            label: `去录 ${getIntegrationLabel(task.id)} Profile`,
            kind: missingProfileTasks.length === 1 ? 'primary' : 'secondary',
            disabled: props.busyKey !== null,
            onClick: () => props.onOpenWorkshopTask(task.id)
          }))
    },
    {
      key: 'desktop',
      title: '切到更像桌宠的形态',
      summary: desktopReady
        ? '桌宠现在已经像真正的桌面陪刷助手了。'
        : '这一步只是体验增强，不会影响核心功能是否可用。',
      detail: props.settings.windowMode === 'floating'
        ? '当前已经切到悬浮态，适合一边刷图一边盯状态。'
        : props.settings.notificationsEnabled
          ? '当前还是面板态，但关键动作已经会主动弹系统通知。'
          : '你可以开启悬浮态或系统通知，让桌宠更像常驻助手。',
      tone: desktopReady ? 'success' : 'attention',
      chips: [
        props.settings.windowMode === 'floating' ? '悬浮态已开启' : '当前是面板态',
        props.settings.notificationsEnabled ? '通知已开启' : '通知未开启'
      ],
      actions: [
        ...(props.settings.windowMode === 'floating'
          ? []
          : [
              {
                label: '切到悬浮态',
                kind: 'secondary' as const,
                disabled: props.busyKey !== null,
                onClick: props.onEnableFloating
              }
            ]),
        ...(props.settings.notificationsEnabled
          ? []
          : [
              {
                label: '打开系统通知',
                kind: 'secondary' as const,
                disabled: props.busyKey !== null,
                onClick: props.onEnableNotifications
              }
            ])
      ]
    }
  ];

  return (
    <article className="card setup-guide">
      <div className="setup-guide-head">
        <div>
          <p className="eyebrow">First Launch</p>
          <h3>首次启动引导</h3>
          <p className="secondary-text">
            我会明确告诉你现在能不能用、卡在哪一步、下一步该点什么。
          </p>
        </div>
        <div className="setup-guide-meta">
          <span className="status-pill warm">{completedSteps}/4 已完成</span>
          <button className="ghost-button" onClick={props.onDismiss} type="button">
            稍后再说
          </button>
          <button className="primary-button" onClick={props.onComplete} type="button">
            标记引导完成
          </button>
        </div>
      </div>

      <article className={`setup-guide-status ${coreReady ? 'success' : 'attention'}`}>
        <div>
          <p className="eyebrow">{coreReady ? 'Ready' : 'Not Ready Yet'}</p>
          <strong>
            {coreReady ? '现在已经能用了' : `还差 ${3 - requiredCompletedSteps} 步才能正式开用`}
          </strong>
          <p>
            {coreReady
              ? desktopReady
                ? '环境、依赖、Profile 和桌宠形态都已经齐了，可以直接去工坊或开始陪刷。'
                : '环境、依赖和 Profile 已经齐了，现在就能用；悬浮态和通知只是额外增强。'
              : `当前阻塞项：${blockingSummary.join(' / ')}。`}
          </p>
        </div>
        <div className="setup-guide-status-side">
          <span className="status-pill warm">{requiredCompletedSteps}/3 核心可用项</span>
          <span className="helper-text">
            runtime、依赖和 Profile 这三项齐了，就已经能正式开用了。
          </span>
        </div>
      </article>

      <article className="setup-guide-next">
        <div>
          <p className="eyebrow">Next Step</p>
          <strong>{props.nextAction.title}</strong>
          <p>{props.nextAction.detail}</p>
        </div>
        <button className="primary-button" onClick={props.onNextAction} type="button">
          {props.nextAction.actionLabel}
        </button>
      </article>

      {busyText ? (
        <article className="setup-guide-activity attention busy">
          <div className="setup-guide-activity-head">
            <strong>正在执行当前步骤</strong>
            <span className="status-pill warm">处理中</span>
          </div>
          <p>{busyText}</p>
        </article>
      ) : null}

      {props.latestActivity ? (
        <article className={`setup-guide-activity ${props.latestActivity.tone}`}>
          <div className="setup-guide-activity-head">
            <strong>{props.latestActivity.title}</strong>
            <span className={`status-pill ${props.latestActivity.tone}`}>
              {props.latestActivity.timestampLabel}
            </span>
          </div>
          <p>{props.latestActivity.detail}</p>
          {props.latestActivity.logPreview ? (
            <pre className="setup-guide-log-preview">{props.latestActivity.logPreview}</pre>
          ) : null}
        </article>
      ) : null}

      {props.error ? (
        <div className="empty-state compact-empty">
          <strong>引导诊断暂时失败</strong>
          <p>{props.error}</p>
        </div>
      ) : null}

      <div className="setup-progress-row">
        <article className="setup-progress-card">
          <span>核心可用度</span>
          <strong>{requiredCompletedSteps}/3</strong>
          <p>只看 runtime、依赖和 Profile，这三项齐了就已经能正式开用。</p>
        </article>
        <article className="setup-progress-card">
          <span>工坊任务线</span>
          <strong>{tasks.length - missingProfileTasks.length}/{tasks.length || 3}</strong>
          <p>三条任务线都录好 Profile 后，试运行和正式执行才会更顺。</p>
        </article>
        <article className="setup-progress-card">
          <span>依赖状态</span>
          <strong>{installedDependencyCount}/{dependencyChecks.length || 0}</strong>
          <p>缺依赖时可以直接在这里一键补齐，不需要手动敲命令。</p>
        </article>
      </div>

      <div className="setup-step-grid">
        {steps.map((step) => (
          <article className={`setup-step-card ${step.tone}`} key={step.key}>
            <div className="setup-step-head">
              <div>
                <span className="eyebrow">{step.key}</span>
                <strong>{step.title}</strong>
              </div>
              <span className={`status-pill ${step.tone}`}>{getToneLabel(step.tone)}</span>
            </div>

            <p className="setup-step-summary">{step.summary}</p>
            <p className="secondary-text">{step.detail}</p>

            <div className="tag-row">
              {step.chips.map((chip) => (
                <span className="mini-pill" key={chip}>
                  {chip}
                </span>
              ))}
            </div>

            {step.actions.length > 0 ? (
              <div className="setup-step-actions">
                {step.actions.map((action) => (
                  <button
                    className={action.kind === 'primary' ? 'primary-button' : 'ghost-button'}
                    disabled={action.disabled}
                    key={action.label}
                    onClick={action.onClick}
                    type="button"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="helper-text">这一项已经准备好了，可以继续下一步。</div>
            )}
          </article>
        ))}
      </div>

      <div className="setup-guide-footer">
        <button className="text-button" onClick={props.onOpenWorkshop} type="button">
          直接进入工坊查看完整预检
        </button>
      </div>
    </article>
  );
}
