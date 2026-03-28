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
  onRefresh: () => void;
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
  const runtimeReady =
    runtimeChecks.length > 0 && runtimeChecks.every((check) => check.level === 'ok');
  const dependencyCheck = findGlobalCheck(globalChecks, 'python-dependencies');
  const ocrCheck = findGlobalCheck(globalChecks, 'ocr-engine');
  const dependencyReady = dependencyCheck?.level === 'ok' && ocrCheck?.level === 'ok';
  const missingProfileTasks = tasks.filter((task) => !isTaskProfileReady(task));
  const profilesReady = tasks.length > 0 && missingProfileTasks.length === 0;
  const desktopReady =
    props.settings.windowMode === 'floating' || props.settings.notificationsEnabled;
  const completedSteps = [
    runtimeReady,
    dependencyReady,
    profilesReady,
    desktopReady
  ].filter(Boolean).length;
  const installBusy = props.busyKey === 'env-install-python-deps';

  const steps: SetupStep[] = [
    {
      key: 'runtime',
      title: '运行环境到位',
      summary: runtimeReady ? 'Python、runtime 和 pip 都已经准备好。' : '先确认这台机器能稳定跑 Python runtime。',
      detail:
        runtimeBlockingCheck?.detail ??
        '桌宠已经能找到 Python 解释器、runtime 目录和 requirements 清单，后面的自动化会更稳。',
      tone: runtimeReady ? 'success' : runtimeBlockingCheck?.level === 'error' ? 'error' : 'attention',
      chips:
        runtimeChecks.length > 0
          ? runtimeChecks.map((check) => {
              const label =
                check.level === 'ok' ? '正常' : check.level === 'warning' ? '提醒' : '阻塞';
              return `${check.label} · ${label}`;
            })
          : ['等待预检返回运行环境状态'],
      actions: [
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
      title: '依赖与 OCR',
      summary: dependencyReady ? '自动化依赖和 OCR 能力都已经可用。' : '先把依赖补齐，工坊和掉落识别才会完整运转。',
      detail:
        dependencyCheck?.detail ??
        `当前已安装 ${installedDependencyCount}/${dependencyChecks.length || 0} 个运行时依赖。`,
      tone: dependencyReady ? 'success' : dependencyCheck?.level === 'error' ? 'error' : 'attention',
      chips: [
        `依赖 ${installedDependencyCount}/${dependencyChecks.length || 0}`,
        ocrCheck?.level === 'ok' ? 'OCR 已就绪' : 'OCR 待补齐'
      ],
      actions: dependencyReady
        ? []
        : [
            {
              label: installBusy ? '安装中...' : '安装 Python 依赖',
              kind: 'primary',
              disabled: props.busyKey !== null && !installBusy,
              onClick: () => void props.onInstallDependencies()
            }
          ]
    },
    {
      key: 'profiles',
      title: '录好三条 Profile',
      summary: profilesReady ? '符文、宝石、金币三条任务线都能直接开跑。' : '继续把缺失的 profile 录完，工坊预检就会更接近全绿。',
      detail:
        profilesReady
          ? '后面只需要根据实际库存输入数量或截图，就可以试运行或正式执行。'
          : '点下面的缺失任务，桌宠会直接带你跳到工坊对应卡片，并高亮那一项。',
      tone: profilesReady ? 'success' : missingProfileTasks.length === tasks.length ? 'error' : 'attention',
      chips:
        tasks.length > 0
          ? tasks.map((task) => `${getIntegrationLabel(task.id)} · ${isTaskProfileReady(task) ? '已录制' : '待录制'}`)
          : ['等待预检返回 profile 状态'],
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
      title: '切到陪刷形态',
      summary: desktopReady ? '桌宠已经更像真正的桌面陪刷伙伴。' : '建议至少开启悬浮态或系统通知，让桌宠更像常驻助手。',
      detail:
        props.settings.windowMode === 'floating'
          ? '当前已经切到悬浮态，适合一边刷图一边盯状态。'
          : props.settings.notificationsEnabled
            ? '当前还是面板态，但已经会主动推送关键通知。'
            : '切到悬浮态或打开通知后，桌宠的陪刷感会明显更完整。',
      tone: desktopReady ? 'success' : 'attention',
      chips: [
        props.settings.windowMode === 'floating' ? '悬浮态已启用' : '当前是面板态',
        props.settings.notificationsEnabled ? '通知已开启' : '通知未开启'
      ],
      actions: [
        ...(props.settings.windowMode === 'floating'
          ? []
          : [
              {
                label: '切换悬浮态',
                kind: 'secondary' as const,
                disabled: props.busyKey !== null,
                onClick: props.onEnableFloating
              }
            ]),
        ...(props.settings.notificationsEnabled
          ? []
          : [
              {
                label: '开启通知',
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
            把 runtime、依赖、profile 和桌宠形态收好，后面就能稳定进入陪刷状态。
          </p>
        </div>
        <div className="setup-guide-meta">
          <span className="status-pill warm">{completedSteps}/4 已就绪</span>
          <button className="ghost-button" onClick={props.onDismiss} type="button">
            稍后再说
          </button>
          <button className="primary-button" onClick={props.onComplete} type="button">
            标记引导完成
          </button>
        </div>
      </div>

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

      {props.error ? (
        <div className="empty-state compact-empty">
          <strong>引导诊断暂时失败</strong>
          <p>{props.error}</p>
        </div>
      ) : null}

      <div className="setup-progress-row">
        <article className="setup-progress-card">
          <span>核心准备</span>
          <strong>{completedSteps}/4</strong>
          <p>覆盖运行环境、依赖、profile 和桌面陪刷形态。</p>
        </article>
        <article className="setup-progress-card">
          <span>自动化任务</span>
          <strong>{tasks.length - missingProfileTasks.length}/{tasks.length || 3}</strong>
          <p>三条工坊任务线都录好 profile 后，预检会更容易整体变绿。</p>
        </article>
        <article className="setup-progress-card">
          <span>依赖状态</span>
          <strong>{installedDependencyCount}/{dependencyChecks.length || 0}</strong>
          <p>缺依赖时可以直接在这里一键补装。</p>
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
          直接进入工坊查看全量预检
        </button>
      </div>
    </article>
  );
}
