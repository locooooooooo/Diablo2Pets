import type { AppSettings, AutomationCheckItem, AutomationPreflightResponse } from '../types';

interface SetupGuideProps {
  preflight: AutomationPreflightResponse | null;
  loading: boolean;
  error: string;
  busyKey: string | null;
  settings: AppSettings;
  onRefresh: () => void;
  onInstallDependencies: () => Promise<void>;
  onOpenWorkshop: () => void;
  onEnableFloating: () => void;
  onEnableNotifications: () => void;
  onComplete: () => void;
  onDismiss: () => void;
}

type StepTone = 'success' | 'attention' | 'error';

interface SetupStepAction {
  label: string;
  kind: 'primary' | 'secondary';
  busy?: boolean;
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

function findTaskProfileReady(task: AutomationPreflightResponse['tasks'][number]): boolean {
  return task.checks.some((check) => check.key === 'profile-path' && check.level === 'ok');
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
  const runtimeReady = runtimeChecks.length > 0 && runtimeChecks.every((check) => check.level === 'ok');
  const dependencySummaryCheck =
    findGlobalCheck(globalChecks, 'python-dependencies') ??
    findGlobalCheck(globalChecks, 'ocr-engine');
  const dependencyReady =
    findGlobalCheck(globalChecks, 'python-dependencies')?.level === 'ok' &&
    findGlobalCheck(globalChecks, 'ocr-engine')?.level === 'ok';
  const recordedProfiles = tasks.filter((task) => findTaskProfileReady(task)).length;
  const profilesReady = tasks.length > 0 && recordedProfiles === tasks.length;
  const desktopReady = props.settings.windowMode === 'floating' || props.settings.notificationsEnabled;
  const completedSteps = [runtimeReady, dependencyReady, profilesReady, desktopReady].filter(Boolean).length;
  const installBusy = props.busyKey === 'env-install-python-deps';

  const steps: SetupStep[] = [
    {
      key: 'runtime',
      title: '运行环境到位',
      summary: runtimeReady ? 'Python、runtime 和 requirements 都已经就绪。' : '先确认这台机器能正常跑 runtime。',
      detail:
        runtimeBlockingCheck?.detail ??
        '桌宠已经能找到 Python runtime、requirements 和 pip，后面的自动化会更稳。',
      tone: runtimeReady ? 'success' : runtimeBlockingCheck?.level === 'error' ? 'error' : 'attention',
      chips: runtimeChecks.map((check) => `${check.label}:${check.level === 'ok' ? '正常' : check.level === 'warning' ? '提醒' : '阻塞'}`),
      actions: [
        {
          label: props.loading ? '刷新中...' : '刷新诊断',
          kind: 'secondary',
          busy: props.loading,
          disabled: props.loading || props.busyKey !== null,
          onClick: props.onRefresh
        }
      ]
    },
    {
      key: 'deps',
      title: '依赖与 OCR',
      summary: dependencyReady ? '自动化依赖和 OCR 能力都已经可用。' : '把 Python 依赖补齐后，工坊和掉落识别才会完整运转。',
      detail:
        dependencySummaryCheck?.detail ??
        `当前已安装 ${installedDependencyCount}/${dependencyChecks.length || 0} 个运行时依赖。`,
      tone: dependencyReady ? 'success' : findGlobalCheck(globalChecks, 'python-dependencies')?.level === 'error' ? 'error' : 'attention',
      chips: [
        `依赖 ${installedDependencyCount}/${dependencyChecks.length || 0}`,
        findGlobalCheck(globalChecks, 'ocr-engine')?.level === 'ok' ? 'OCR 已就绪' : 'OCR 待补齐'
      ],
      actions: dependencyReady
        ? []
        : [
            {
              label: installBusy ? '安装中...' : '安装 Python 依赖',
              kind: 'primary',
              busy: installBusy,
              disabled: props.busyKey !== null && !installBusy,
              onClick: () => void props.onInstallDependencies()
            }
          ]
    },
    {
      key: 'profiles',
      title: '录好三条 Profile',
      summary: profilesReady ? '符文、宝石、金币的 profile 都已经录制完成。' : '还需要把工坊的坐标 profile 录好，执行才能闭环。',
      detail:
        profilesReady
          ? '三条任务线都已经能直接进入试运行或正式执行。'
          : '进入工坊后先点“录 Profile”，录完马上就能看到预检状态变绿。',
      tone: profilesReady ? 'success' : recordedProfiles === 0 ? 'error' : 'attention',
      chips:
        tasks.length > 0
          ? tasks.map((task) => `${task.id === 'rune-cube' ? '符文' : task.id === 'gem-cube' ? '宝石' : '金币'}:${findTaskProfileReady(task) ? '已录制' : '待录制'}`)
          : ['等待预检返回 profile 状态'],
      actions: profilesReady
        ? []
        : [
            {
              label: '前往工坊录制',
              kind: 'primary',
              disabled: props.busyKey !== null,
              onClick: props.onOpenWorkshop
            }
          ]
    },
    {
      key: 'desktop',
      title: '切到陪刷形态',
      summary: desktopReady ? '桌宠形态已经更像真正的常驻伙伴。' : '建议至少开启悬浮态或系统通知，让桌宠更像陪刷助手。',
      detail:
        props.settings.windowMode === 'floating'
          ? '当前已经是悬浮宠物形态，适合边刷边盯状态。'
          : props.settings.notificationsEnabled
            ? '当前虽然还是面板态，但已经会主动推送关键通知。'
            : '切到悬浮态或打开通知后，桌宠会更接近桌面常驻体验。',
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
            把 runtime、依赖、profile 和桌宠形态按顺序收好，后面就能稳定进入陪刷状态。
          </p>
        </div>
        <div className="setup-guide-meta">
          <span className="status-pill warm">
            {completedSteps}/4 已就绪
          </span>
          <button className="ghost-button" onClick={props.onDismiss} type="button">
            稍后再说
          </button>
          <button className="primary-button" onClick={props.onComplete} type="button">
            标记引导完成
          </button>
        </div>
      </div>

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
          <strong>{recordedProfiles}/{tasks.length || 3}</strong>
          <p>三条工坊任务线都录好 profile 后，预检会整体变绿。</p>
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
    </article>
  );
}
