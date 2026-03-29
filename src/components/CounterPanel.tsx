import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { formatCompactDateTime, formatDuration } from '../lib/date';
import { PanelStateCard } from './PanelStateCard';
import type { SetupGuideHint } from '../lib/setupGuideState';
import type { TodayStats } from '../lib/stats';
import type {
  ActiveRun,
  AutomationPreflightResponse,
  DropRecord,
  RunRecord
} from '../types';

const routePresets = ['混沌避难所', '牛场', '巴尔', '远古通道', '恐怖地带'];

interface CounterPanelProps {
  activeRun: ActiveRun | null;
  activeDurationText: string;
  stats: TodayStats;
  recentRuns: RunRecord[];
  recentDrops: DropRecord[];
  busy: boolean;
  preflight: AutomationPreflightResponse | null;
  preflightBusy: boolean;
  setupGuideHint: SetupGuideHint;
  setupGuideCompleted: boolean;
  onStartRun: (mapName: string) => Promise<void>;
  onStopRun: () => Promise<void>;
  onFollowSetupGuideHint: () => void;
  onGoToDrops: () => void;
  onGoToWorkshop: () => void;
  onOpenSetupGuide: () => void;
  onSurfaceNotice?: (notice: {
    title: string;
    detail: string;
    tone: 'neutral' | 'success' | 'attention' | 'error';
  }) => void;
}

type CommandTone = 'success' | 'attention' | 'error';

interface ReadinessItem {
  label: string;
  ready: boolean;
  detail: string;
}

interface SuggestedAction {
  badge: string;
  title: string;
  detail: string;
  label: string;
  kind: 'primary' | 'secondary';
  onClick: () => void;
}

interface RecoveryAction {
  label: string;
  kind: 'primary' | 'secondary';
  onClick: () => void;
}

interface RecoveryState {
  badge: string;
  title: string;
  detail: string;
  meta: string;
  actions: RecoveryAction[];
}

interface BattlePulseItem {
  id: string;
  label: string;
  value: string;
  detail: string;
}

interface CompanionStateCard {
  tone: 'success' | 'attention' | 'error';
  title: string;
  detail: string;
  meta: string;
}

function getLatestRunText(recentRuns: RunRecord[]): string {
  if (recentRuns.length === 0) {
    return '今天还没有完成的刷图记录。';
  }

  return `${recentRuns[0].mapName} · ${formatDuration(recentRuns[0].durationSeconds)}`;
}

function getTopRouteText(stats: TodayStats): string {
  const topRoute = stats.mapBreakdown[0];
  if (!topRoute) {
    return '还没形成主刷路线';
  }

  return `${topRoute.mapName} · ${topRoute.count} 次`;
}

function getLatestDropText(recentDrops: DropRecord[]): string {
  const latestDrop = recentDrops[0];
  if (!latestDrop) {
    return '等你贴上今天的第一张战利品截图';
  }

  return latestDrop.mapName
    ? `${latestDrop.itemName} · ${latestDrop.mapName}`
    : latestDrop.itemName;
}

function buildReadiness(
  preflight: AutomationPreflightResponse | null,
  setupGuideCompleted: boolean,
  activeRun: ActiveRun | null,
  recentRuns: RunRecord[],
  recentDrops: DropRecord[]
): ReadinessItem[] {
  const tasks = preflight?.tasks ?? [];
  const allTasksReady = tasks.length > 0 && tasks.every((task) => task.status === 'ready');
  const environmentReady =
    (preflight?.globalChecks ?? []).some(
      (check) => check.key === 'python-dependencies' && check.level === 'ok'
    ) &&
    (preflight?.globalChecks ?? []).some(
      (check) => check.key === 'ocr-engine' && check.level === 'ok'
    );

  return [
    {
      label: '引导',
      ready: setupGuideCompleted,
      detail: setupGuideCompleted ? '已完成首启闭环' : '还有首启步骤待补齐'
    },
    {
      label: '环境',
      ready: Boolean(environmentReady),
      detail: environmentReady ? 'runtime 与 OCR 可用' : '还需要补环境条件'
    },
    {
      label: '路线',
      ready: Boolean(activeRun || recentRuns.length > 0),
      detail: activeRun ? '当前正在记录' : recentRuns.length > 0 ? '已有最近路线' : '等待第一轮开跑'
    },
    {
      label: '战报',
      ready: recentDrops.length > 0,
      detail: recentDrops.length > 0 ? '今天已经开账' : '等待首条掉落'
    },
    {
      label: '工坊',
      ready: allTasksReady,
      detail: allTasksReady ? '三条任务线都已就绪' : tasks.length > 0 ? '还有预检项待补' : '等待预检返回'
    }
  ];
}

function getCommandTone(items: ReadinessItem[]): CommandTone {
  const readyCount = items.filter((item) => item.ready).length;
  if (readyCount >= 4) {
    return 'success';
  }

  if (readyCount >= 2) {
    return 'attention';
  }

  return 'error';
}

function getLatestRunNeedingWrapUp(
  recentRuns: RunRecord[],
  recentDrops: DropRecord[]
): RunRecord | null {
  const latestRun = recentRuns[0];
  if (!latestRun) {
    return null;
  }

  const runEndedAt = new Date(latestRun.endedAt).getTime();
  const hasFollowupDrop = recentDrops.some(
    (drop) => new Date(drop.createdAt).getTime() >= runEndedAt - 90_000
  );

  return hasFollowupDrop ? null : latestRun;
}

export function CounterPanel(props: CounterPanelProps) {
  const [mapName, setMapName] = useState(props.activeRun?.mapName ?? '混沌避难所');
  const [pulseIndex, setPulseIndex] = useState(0);
  const [showAdvancedCompanion, setShowAdvancedCompanion] = useState(false);
  const advancedCardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (props.activeRun) {
      setMapName(props.activeRun.mapName);
    }
  }, [props.activeRun]);

  function toggleAdvancedCompanion(nextExpanded = !showAdvancedCompanion) {
    setShowAdvancedCompanion(nextExpanded);
    props.onSurfaceNotice?.({
      tone: nextExpanded ? 'attention' : 'success',
      title: nextExpanded ? '今日详细面板已展开' : '今日详细面板已收起',
      detail: nextExpanded
        ? '就绪度、地图分布和更多快捷入口已经放到下方，继续往下看就行。'
        : '首页已经回到精简模式，只保留当前动作、上次中断点和当前狩猎状态。'
    });

    window.requestAnimationFrame(() => {
      advancedCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const readinessItems = useMemo(
    () =>
      buildReadiness(
        props.preflight,
        props.setupGuideCompleted,
        props.activeRun,
        props.recentRuns,
        props.recentDrops
      ),
    [
      props.activeRun,
      props.preflight,
      props.recentDrops,
      props.recentRuns,
      props.setupGuideCompleted
    ]
  );

  const readinessReadyCount = readinessItems.filter((item) => item.ready).length;
  const readinessTone = getCommandTone(readinessItems);
  const topRouteText = getTopRouteText(props.stats);
  const latestDropText = getLatestDropText(props.recentDrops);
  const latestRunText = getLatestRunText(props.recentRuns);
  const missingGuide = !props.setupGuideCompleted;
  const preflightTasks = props.preflight?.tasks ?? [];
  const blockingTask = preflightTasks.find((task) => task.status === 'error');
  const warningTask = preflightTasks.find((task) => task.status === 'warning');
  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp(
    props.recentRuns,
    props.recentDrops
  );

  const suggestedAction = useMemo<SuggestedAction>(() => {
    if (props.activeRun) {
      return {
        badge: '当前动作',
        title: `正在记录 ${props.activeRun.mapName}`,
        detail: '刷完回来点完成，再去战报记掉落。',
        label: props.busy ? '结算中...' : '完成这一轮',
        kind: 'primary',
        onClick: () => void props.onStopRun()
      };
    }

    if (!props.setupGuideCompleted) {
      return {
        badge: props.setupGuideHint.badge,
        title: props.setupGuideHint.title,
        detail: props.setupGuideHint.detail,
        label: props.setupGuideHint.actionLabel,
        kind: 'primary',
        onClick: props.onFollowSetupGuideHint
      };
    }

    if (blockingTask) {
      return {
        badge: '当前待办',
        title: '先补工坊阻塞项',
        detail: `${blockingTask.summary}。先补这一项。`,
        label: '去工坊处理',
        kind: 'primary',
        onClick: props.onGoToWorkshop
      };
    }

    if (warningTask) {
      return {
        badge: '当前待办',
        title: '工坊有提醒',
        detail: `${warningTask.summary}。先看一下就行。`,
        label: '看工坊提醒',
        kind: 'secondary',
        onClick: props.onGoToWorkshop
      };
    }

    if (props.recentRuns.length > 0 && props.recentDrops.length === 0) {
      return {
        badge: '今日待办',
        title: '先记第一条掉落',
        detail: '记完这条，战报和首页才会完整。',
        label: '去记录掉落',
        kind: 'primary',
        onClick: props.onGoToDrops
      };
    }

    if (props.recentRuns.length > 0) {
      const latestRoute = props.recentRuns[0].mapName;
      return {
        badge: '一键继续',
        title: `继续 ${latestRoute}`,
        detail: '直接沿用上一条路线最省事。',
        label: props.busy ? '启动中...' : `继续 ${latestRoute}`,
        kind: 'primary',
        onClick: () => void props.onStartRun(latestRoute)
      };
    }

    return {
      badge: '一键开局',
      title: '开始今天第一轮',
      detail: '先开一轮熟图，后面数据才会热起来。',
      label: props.busy ? '启动中...' : `开始 ${mapName.trim() || '混沌避难所'}`,
      kind: 'primary',
      onClick: () => void props.onStartRun(mapName.trim() || '混沌避难所')
    };
  }, [
    blockingTask,
    mapName,
    props.activeRun,
    props.busy,
    props.onFollowSetupGuideHint,
    props.onGoToDrops,
    props.onGoToWorkshop,
    props.onOpenSetupGuide,
    props.onStartRun,
    props.onStopRun,
    props.recentDrops.length,
    props.recentRuns,
    props.setupGuideHint,
    props.setupGuideCompleted,
    warningTask
  ]);

  const recoveryState = useMemo<RecoveryState>(() => {
    if (props.activeRun) {
      return {
        badge: '正在陪刷',
        title: `当前停在 ${props.activeRun.mapName}`,
        detail: '刷完回来点完成，再去战报记掉落。',
        meta: `当前计时 ${props.activeDurationText}`,
        actions: [
          {
            label: props.busy ? '结算中...' : '完成这一轮',
            kind: 'primary',
            onClick: () => void props.onStopRun()
          },
          {
            label: '打开战报',
            kind: 'secondary',
            onClick: props.onGoToDrops
          }
        ]
      };
    }

    if (!props.setupGuideCompleted) {
      return {
        badge: props.setupGuideHint.badge,
        title: props.setupGuideHint.title,
        detail: `先做完这一步，首页就会回到日常模式。`,
        meta: '引导完成后，首页会自动切回纯日常模式。',
        actions: [
          {
            label: props.setupGuideHint.actionLabel,
            kind: 'primary',
            onClick: props.onFollowSetupGuideHint
          },
          {
            label: '先看工坊',
            kind: 'secondary',
            onClick: props.onGoToWorkshop
          }
        ]
      };
    }

    if (latestRunNeedingWrapUp) {
      return {
        badge: '上次中断点',
        title: `${latestRunNeedingWrapUp.mapName} 还没收口`,
        detail: '先记掉落，或者直接沿用这条路线继续。',
        meta: `上次结束于 ${formatCompactDateTime(latestRunNeedingWrapUp.endedAt)} · 用时 ${formatDuration(latestRunNeedingWrapUp.durationSeconds)}`,
        actions: [
          {
            label: '先记掉落',
            kind: 'primary',
            onClick: props.onGoToDrops
          },
          {
            label: `继续 ${latestRunNeedingWrapUp.mapName}`,
            kind: 'secondary',
            onClick: () => void props.onStartRun(latestRunNeedingWrapUp.mapName)
          }
        ]
      };
    }

    if (props.recentRuns.length > 0) {
      const latestRun = props.recentRuns[0];
      return {
        badge: '上次中断点',
        title: `继续 ${latestRun.mapName}`,
        detail: '上一轮已经收口，直接沿用这条路线最顺。',
        meta: `最近一次完成于 ${formatCompactDateTime(latestRun.endedAt)} · 用时 ${formatDuration(latestRun.durationSeconds)}`,
        actions: [
          {
            label: props.busy ? '启动中...' : `继续 ${latestRun.mapName}`,
            kind: 'primary',
            onClick: () => void props.onStartRun(latestRun.mapName)
          },
          {
            label: '看今日战报',
            kind: 'secondary',
            onClick: props.onGoToDrops
          }
        ]
      };
    }

    return {
      badge: '今日开局',
      title: '先开一轮熟图',
      detail: '开局后首页和战报就会开始记录。',
      meta: '建议先选一条最熟的路线做热身。',
      actions: [
        {
          label: props.busy ? '启动中...' : `开始 ${mapName.trim() || '混沌避难所'}`,
          kind: 'primary',
          onClick: () => void props.onStartRun(mapName.trim() || '混沌避难所')
        },
        {
          label: '先看工坊',
          kind: 'secondary',
          onClick: props.onGoToWorkshop
        }
      ]
    };
  }, [
    latestRunNeedingWrapUp,
    mapName,
    props.activeDurationText,
    props.activeRun,
    props.busy,
    props.onFollowSetupGuideHint,
    props.onGoToDrops,
    props.onGoToWorkshop,
    props.onOpenSetupGuide,
    props.onStartRun,
    props.onStopRun,
    props.recentRuns,
    props.setupGuideHint,
    props.setupGuideCompleted
  ]);

  const pulseItems = useMemo<BattlePulseItem[]>(() => {
    const workshopValue = props.preflightBusy
      ? '预检刷新中'
      : blockingTask
        ? '还有阻塞项'
        : warningTask
          ? '还有提醒项'
          : props.preflight
            ? '今天可联调'
            : '等待首轮预检';

    return [
      {
        id: 'count',
        label: '今日总次数',
        value: `${props.stats.totalCount} 轮`,
        detail:
          props.stats.totalCount > 0
            ? `总耗时 ${formatDuration(props.stats.totalDurationSeconds)}，平均单次 ${formatDuration(props.stats.averageDurationSeconds)}。`
            : '今天还没开刷，先起第一轮，战况脉冲就会亮起来。'
      },
      {
        id: 'route',
        label: '主刷路线',
        value: topRouteText,
        detail:
          props.stats.mapBreakdown[0]
            ? `当前最热的是 ${props.stats.mapBreakdown[0].mapName}，平均 ${formatDuration(props.stats.mapBreakdown[0].averageDurationSeconds)} 一轮。`
            : '还没形成主刷路线，桌宠会在你完成几轮后自动归纳。'
      },
      {
        id: 'loot',
        label: '最近战果',
        value: latestDropText,
        detail:
          props.recentDrops.length > 0
            ? '最近这条战利品会挂在首页前排，方便你随时回看今天的战果温度。'
            : '先去战报页贴一张截图，首页就会开始出现真正的战果脉冲。'
      },
      {
        id: 'workshop',
        label: '工坊状态',
        value: workshopValue,
        detail:
          blockingTask
            ? `${blockingTask.summary}。先补齐它，再跑自动化会稳得多。`
            : warningTask
              ? `${warningTask.summary}。你可以先看一眼，再决定是不是现在就开跑。`
              : '今天的自动化联调条件已经收得比较齐了，需要时可以随时切去工坊。'
      }
    ];
  }, [
    blockingTask,
    latestDropText,
    props.preflight,
    props.preflightBusy,
    props.recentDrops.length,
    props.stats.averageDurationSeconds,
    props.stats.mapBreakdown,
    props.stats.totalCount,
    props.stats.totalDurationSeconds,
    topRouteText,
    warningTask
  ]);

  useEffect(() => {
    setPulseIndex(0);
  }, [pulseItems.length, props.activeRun?.id, props.recentDrops.length, props.stats.totalCount]);

  useEffect(() => {
    if (pulseItems.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setPulseIndex((current) => (current + 1) % pulseItems.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [pulseItems]);

  const activePulse = pulseItems[pulseIndex] ?? pulseItems[0];
  const companionIssues = useMemo(() => {
    const pending = readinessItems.filter((item) => !item.ready).slice(0, 2);

    if (pending.length === 0) {
      return [
        {
          title: '核心条件已经就绪',
          detail: '今天可以直接开刷、记战报，自动化联调也能随时接上。',
          tone: 'success' as const
        },
        {
          title: '最近路线已经留下来了',
          detail: latestRunText,
          tone: 'attention' as const
        }
      ];
    }

    return pending.map((item) => ({
      title: `${item.label} 还没收好`,
      detail: item.detail,
      tone: 'attention' as const
    }));
  }, [latestRunText, readinessItems]);
  const companionStateCard = useMemo<CompanionStateCard>(() => {
    if (props.busy) {
      return {
        tone: 'attention',
        title: props.activeRun ? '正在结算' : '正在开始记录',
        detail: props.activeRun
          ? '本轮结束后，统计会立即刷新。'
          : '开始成功后，今天的数据就会动起来。',
        meta: props.activeRun ? `当前计时 ${props.activeDurationText}` : '请先等本次动作完成'
      };
    }

    if (props.preflightBusy) {
      return {
        tone: 'attention',
        title: '正在刷新状态',
        detail: '我在重新读取环境、依赖和工坊预检。',
        meta: '完成后会直接告诉你还能不能开跑'
      };
    }

    if (!props.preflight) {
      return {
        tone: 'attention',
        title: '还在读取可用状态',
        detail: '桌宠已经打开，预检结果还没回来。',
        meta: '稍等一下，或直接开始第一轮也可以'
      };
    }

    if (!props.setupGuideCompleted) {
      return {
        tone: 'attention',
        title: props.setupGuideHint.title,
        detail: '先做完这一步，首页就会回到日常模式。',
        meta: '现在先跟着引导做就行'
      };
    }

    if (blockingTask) {
      return {
        tone: 'error',
        title: '工坊有阻塞项',
        detail: `${blockingTask.summary}。建议先补这一项。`,
        meta: '不处理这条，后面的自动化会不稳'
      };
    }

    if (warningTask) {
      return {
        tone: 'attention',
        title: '工坊有提醒',
        detail: `${warningTask.summary}。最好先看一下。`,
        meta: '它不会完全挡住你'
      };
    }

    if (props.activeRun) {
      return {
        tone: 'success',
        title: `已开始记录 ${props.activeRun.mapName}`,
        detail: '刷完回来点完成，再去战报记掉落。',
        meta: `当前计时 ${props.activeDurationText}`
      };
    }

    if (props.stats.totalCount === 0) {
      return {
        tone: 'success',
        title: '可以开始第一轮了',
        detail: '先开一轮熟图，今天的数据就会热起来。',
        meta: '建议从你最熟的路线开局'
      };
    }

    return {
      tone: 'success',
      title: '今天已进入日常模式',
      detail: '现在可以继续路线、记掉落，或切去工坊。',
      meta: `今天已完成 ${props.stats.totalCount} 轮，已记录 ${props.recentDrops.length} 条掉落`
    };
  }, [
    blockingTask,
    props.activeDurationText,
    props.activeRun,
    props.busy,
    props.preflight,
    props.preflightBusy,
    props.recentDrops.length,
    props.setupGuideCompleted,
    props.setupGuideHint.detail,
    props.setupGuideHint.title,
    props.stats.totalCount,
    warningTask
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (props.activeRun) {
      await props.onStopRun();
      return;
    }

    await props.onStartRun(mapName.trim() || '混沌避难所');
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Companion</p>
          <h3>陪刷首页</h3>
        </div>
        {props.activeRun ? (
          <span className="status-pill warm">陪刷中 · {props.activeDurationText}</span>
        ) : (
          <span className="status-pill">待命中</span>
        )}
      </div>

      <PanelStateCard
        detail={companionStateCard.detail}
        eyebrow="当前状态"
        meta={companionStateCard.meta}
        title={companionStateCard.title}
        tone={companionStateCard.tone}
      />

      <article className="card companion-focus-card">
        <div className="integration-head">
          <div>
            <div className="card-title">现在该做什么</div>
            <p className="secondary-text">首页默认只保留当前动作、关键阻塞和两个常用入口。</p>
          </div>
          <span className={`status-pill ${readinessTone}`}>
            {readinessReadyCount}/{readinessItems.length} 已就绪
          </span>
        </div>

        <div className="command-focus">
          <strong>{suggestedAction.title}</strong>
          <p>{suggestedAction.detail}</p>
        </div>

        <div className="companion-issue-grid">
          {companionIssues.map((item) => (
            <article className={`companion-issue-card tone-${item.tone}`} key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>

        <div className="summary-list">
          <div className="summary-row">
            <span>最近路线</span>
            <strong>{latestRunText}</strong>
          </div>
          <div className="summary-row">
            <span>最近掉落</span>
            <strong>{latestDropText}</strong>
          </div>
          <div className="summary-row">
            <span>工坊状态</span>
            <strong>
              {props.preflightBusy
                ? '正在刷新预检'
                : blockingTask
                  ? '还有阻塞项'
                  : warningTask
                    ? '还有提醒项'
                    : props.preflight
                      ? '预检稳定'
                      : '等待预检'}
            </strong>
          </div>
        </div>

        <div className="inline-actions">
          <button
            className={suggestedAction.kind === 'primary' ? 'primary-button' : 'ghost-button'}
            disabled={props.busy}
            onClick={suggestedAction.onClick}
            type="button"
          >
            {suggestedAction.label}
          </button>
          <button className="ghost-button" onClick={props.onGoToDrops} type="button">
            战报
          </button>
          <button className="ghost-button" onClick={props.onGoToWorkshop} type="button">
            工坊
          </button>
          <button
            className={showAdvancedCompanion ? 'ghost-button active' : 'ghost-button'}
            onClick={() => toggleAdvancedCompanion()}
            type="button"
          >
            {showAdvancedCompanion ? '收起详情' : '今日详情'}
          </button>
        </div>
      </article>

      {showAdvancedCompanion ? (
        <div className="companion-recovery-grid">
        <article className="card recovery-card">
          <div className="integration-head">
            <div>
              <div className="card-title">上次中断点</div>
              <p className="secondary-text">
                我把你上一次停下来的位置和最顺手的续跑方式收在这里，打开桌宠就知道先做哪一步。
              </p>
            </div>
            <span className="status-chip">{recoveryState.badge}</span>
          </div>

          <div className="recovery-stage">
            <strong>{recoveryState.title}</strong>
            <p>{recoveryState.detail}</p>
          </div>

          <div className="recovery-meta">{recoveryState.meta}</div>

          <div className="inline-actions">
            {recoveryState.actions.map((action) => (
              <button
                className={action.kind === 'primary' ? 'primary-button' : 'ghost-button'}
                disabled={props.busy}
                key={action.label}
                onClick={action.onClick}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        </article>

        <article className="card hero-card warm-card">
          <div className="card-title">今日战况</div>
          <div className="metric-grid">
            <article className="metric-card">
              <span>今日次数</span>
              <strong>{props.stats.totalCount}</strong>
            </article>
            <article className="metric-card">
              <span>总耗时</span>
              <strong>{formatDuration(props.stats.totalDurationSeconds)}</strong>
            </article>
            <article className="metric-card">
              <span>平均单次</span>
              <strong>{formatDuration(props.stats.averageDurationSeconds)}</strong>
            </article>
          </div>

          <div className="summary-list">
            <div className="summary-row">
              <span>战果脉冲</span>
              <strong>{activePulse.value}</strong>
            </div>
            <div className="summary-row">
              <span>当前信号</span>
              <strong>{activePulse.label}</strong>
            </div>
            <div className="summary-row">
              <span>今日掉落</span>
              <strong>{props.recentDrops.length} 条记录</strong>
            </div>
          </div>
        </article>
        </div>
      ) : null}

      <div className="companion-hero companion-hero-compact">
        <article className="card hero-card hero-banner">
          <div className="integration-head">
            <div>
              <div className="card-title">当前狩猎状态</div>
              <p className="secondary-text">
                在这里开始或收口一轮刷图，然后把掉落和自动化分流到后续页面。
              </p>
            </div>
            <span className="status-chip">
              {props.activeRun ? `进行中：${props.activeRun.mapName}` : '准备下一轮'}
            </span>
          </div>

          <form className="stack compact" onSubmit={handleSubmit}>
            <label className="field">
              <span>地图 / 场景</span>
              <input
                disabled={Boolean(props.activeRun)}
                onChange={(event) => setMapName(event.target.value)}
                placeholder="例如：世界之石、混沌避难所、牛场"
                value={mapName}
              />
            </label>

            <div className="preset-strip">
              <span className="preset-label">常用路线</span>
              <div className="tag-row">
                {routePresets.map((preset) => (
                  <button
                    className={mapName === preset ? 'preset-button active' : 'preset-button'}
                    disabled={Boolean(props.activeRun)}
                    key={preset}
                    onClick={() => setMapName(preset)}
                    type="button"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="inline-actions">
              <button className="primary-button" disabled={props.busy} type="submit">
                {props.busy
                  ? props.activeRun
                    ? '正在结算...'
                    : '正在开始...'
                  : props.activeRun
                    ? '完成本次刷图'
                    : '开始记录本次刷图'}
              </button>
              <button className="ghost-button" onClick={props.onGoToDrops} type="button">
                去记掉落
              </button>
              <button className="ghost-button" onClick={props.onGoToWorkshop} type="button">
                打开工坊
              </button>
            </div>
          </form>

          <div className="summary-list">
            <div className="summary-row">
              <span>桌宠定位</span>
              <strong>先陪你刷，再替你记，最后帮你把工坊自动化接上。</strong>
            </div>
            <div className="summary-row">
              <span>今日建议</span>
              <strong>
                {props.activeRun
                  ? '刷完就点完成，然后顺手去战报页把今天的掉落收口。'
                  : missingGuide
                    ? `${props.setupGuideHint.title}，后面每天上线就能直接开跑。`
                    : '可以直接沿用最近路线开刷，或者先去工坊看今天的自动化预检。'}
              </strong>
            </div>
          </div>
        </article>
      </div>

      <article
        className={`card companion-advanced-card ${showAdvancedCompanion ? 'expanded' : ''}`}
        ref={advancedCardRef}
      >
        <div className="integration-head">
          <div>
            <div className="card-title">今日详细面板</div>
            <p className="secondary-text">把就绪度、战果脉冲、地图分布和战果预览都收在这里。</p>
          </div>
          <button
            className="ghost-button"
            onClick={() => toggleAdvancedCompanion()}
            type="button"
          >
            {showAdvancedCompanion ? '收起详情' : '展开详情'}
          </button>
        </div>

        {!showAdvancedCompanion ? (
          <div className="companion-focus-grid">
            <article className="focus-step-card">
              <strong>就绪度</strong>
              <p>{readinessReadyCount}/{readinessItems.length} 项已经就绪。</p>
            </article>
            <article className="focus-step-card">
              <strong>战果脉冲</strong>
              <p>{activePulse.label} · {activePulse.value}</p>
            </article>
            <article className="focus-step-card">
              <strong>详细页内容</strong>
              <p>展开后可以看地图分布、最近刷图、完整战果和更多快捷入口。</p>
            </article>
          </div>
        ) : (
          <div className="companion-command-grid">
            <article className={`card command-card command-card-${readinessTone}`}>
              <div className="integration-head">
                <div>
                  <div className="card-title">今日就绪度</div>
                  <p className="secondary-text">引导、环境、路线、战报和工坊预检都集中在这里。</p>
                </div>
                <span className={`status-pill ${readinessTone}`}>
                  {readinessReadyCount}/{readinessItems.length} 已就绪
                </span>
              </div>

              <div className="readiness-grid">
                {readinessItems.map((item) => (
                  <article
                    className={`readiness-item ${item.ready ? 'ready' : 'pending'}`}
                    key={item.label}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.ready ? '已就绪' : '待处理'}</span>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
            </article>

            <article className="card pulse-card">
              <div className="integration-head">
                <div>
                  <div className="card-title">今日战果脉冲</div>
                  <p className="secondary-text">让首页自己轮播今天最值得盯住的信号。</p>
                </div>
                <span className="status-pill warm">
                  {pulseIndex + 1}/{pulseItems.length}
                </span>
              </div>

              <div className="pulse-stage">
                <span className="pulse-label">{activePulse.label}</span>
                <strong>{activePulse.value}</strong>
                <p>{activePulse.detail}</p>
              </div>

              <div className="pulse-mini-list">
                {pulseItems.map((item, index) => (
                  <article
                    className={`pulse-mini-item ${index === pulseIndex ? 'active' : ''}`}
                    key={item.id}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>

              <div className="pulse-dots" aria-label="battle pulse progression">
                {pulseItems.map((item, index) => (
                  <span
                    className={index === pulseIndex ? 'pulse-dot active' : 'pulse-dot'}
                    key={item.id}
                  />
                ))}
              </div>
            </article>
          </div>
        )}
      </article>

      {showAdvancedCompanion ? (
        <>
          <div className="insight-grid">
            <article className="insight-card">
              <span className="eyebrow">Route Pulse</span>
              <strong>{topRouteText}</strong>
              <p>
                {props.stats.mapBreakdown[0]
                  ? `平均 ${formatDuration(props.stats.mapBreakdown[0].averageDurationSeconds)} 一轮。`
                  : '等你完成第一轮后，桌宠就会开始画出今天的路线节奏。'}
              </p>
            </article>
            <article className="insight-card">
              <span className="eyebrow">Latest Loot</span>
              <strong>{latestDropText}</strong>
              <p>
                {props.recentDrops.length > 0
                  ? '最近战利品会优先挂在首页前排，方便你随手回看。'
                  : '去战报页贴图后，这里就会变成今天的战果热区。'}
              </p>
            </article>
            <article className="insight-card">
              <span className="eyebrow">Next Step</span>
              <strong>{suggestedAction.title}</strong>
              <p>{suggestedAction.detail}</p>
            </article>
          </div>

          <div className="quick-grid">
            <article className="action-tile">
              <span className="eyebrow">Quick Flow</span>
              <strong>战利品账本</strong>
              <p>截图、OCR、备注和保存都在一页完成，适合刷图结束后立刻收口。</p>
              <button className="text-button" onClick={props.onGoToDrops} type="button">
                现在去记一条
              </button>
            </article>

            <article className="action-tile">
              <span className="eyebrow">Workshop</span>
              <strong>赫拉迪姆工坊</strong>
              <p>符文、宝石、金币三条任务线集中管理，适合试运行、联调和查看日志。</p>
              <button className="text-button" onClick={props.onGoToWorkshop} type="button">
                进入工坊
              </button>
            </article>
          </div>

          <div className="split-grid">
            <article className="card">
              <div className="card-title">地图分布</div>
              {props.stats.mapBreakdown.length === 0 ? (
                <div className="empty-state">
                  <strong>今天还没有地图统计</strong>
                  <p>开始第一轮刷图后，这里会显示各个场景的次数和平均耗时。</p>
                </div>
              ) : (
                <div className="list-card">
                  {props.stats.mapBreakdown.map((item) => (
                    <div className="list-row" key={item.mapName}>
                      <div>
                        <strong>{item.mapName}</strong>
                        <span>{item.count} 次</span>
                      </div>
                      <div className="list-row-side">
                        <strong>{formatDuration(item.totalDurationSeconds)}</strong>
                        <span>均值 {formatDuration(item.averageDurationSeconds)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="card">
              <div className="card-title">最近刷图</div>
              {props.recentRuns.length === 0 ? (
                <div className="empty-state">
                  <strong>还没有最近刷图数据</strong>
                  <p>完成一轮后，这里会按时间显示最近几次路线和时长。</p>
                </div>
              ) : (
                <div className="list-card">
                  {props.recentRuns.map((run) => (
                    <div className="list-row" key={run.id}>
                      <div>
                        <strong>{run.mapName}</strong>
                        <span>{formatCompactDateTime(run.endedAt)}</span>
                      </div>
                      <div className="list-row-side">
                        <strong>{formatDuration(run.durationSeconds)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>

          <article className="card">
            <div className="panel-header">
              <div>
                <div className="card-title">今日战果预览</div>
                <p className="secondary-text">最近掉落会先在这里出现，再决定要不要去战报页继续整理。</p>
              </div>
              <span className="status-pill">
                {props.recentDrops.length > 0 ? `${props.recentDrops.length} 条战果` : '等待第一条掉落'}
              </span>
            </div>

            {props.recentDrops.length === 0 ? (
              <div className="empty-state">
                <strong>战果区还是空的</strong>
                <p>去战报页贴一张截图，桌宠就能帮你开始记账。</p>
              </div>
            ) : (
              <div className="list-card">
                {props.recentDrops.map((drop) => (
                  <div className="list-row" key={drop.id}>
                    <div>
                      <strong>{drop.itemName}</strong>
                      <span>{drop.mapName || '未填写场景'}</span>
                      {drop.note ? <span className="secondary-text">{drop.note}</span> : null}
                    </div>
                    <div className="list-row-side">
                      <span>{formatCompactDateTime(drop.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </>
      ) : null}
    </section>
  );
}
