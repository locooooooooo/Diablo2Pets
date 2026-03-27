import { useEffect, useMemo, useState } from 'react';
import { formatDuration } from '../lib/date';
import type {
  ActiveRun,
  AutomationPreflightResponse,
  DropRecord,
  RunRecord
} from '../types';

interface FloatingPetProps {
  activeRun: ActiveRun | null;
  recentRuns: RunRecord[];
  recentDrops: DropRecord[];
  todayCount: number;
  todayDropCount: number;
  liveDurationText: string;
  highlightDropName: string;
  alwaysOnTop: boolean;
  busy: boolean;
  setupGuideCompleted: boolean;
  preflight: AutomationPreflightResponse | null;
  preflightBusy: boolean;
  onStartRun: (mapName: string) => void;
  onStopRun: () => void;
  onOpenPanel: () => void;
  onOpenDrops: () => void;
  onOpenWorkshop: () => void;
  onOpenSetupGuide: () => void;
  onToggleAlwaysOnTop: () => void;
  onMinimize: () => void;
}

interface FloatingActionState {
  badge: string;
  title: string;
  detail: string;
  label: string;
  action: () => void;
}

interface FloatingPulseItem {
  id: string;
  label: string;
  value: string;
  detail: string;
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

export function FloatingPet(props: FloatingPetProps) {
  const [pulseIndex, setPulseIndex] = useState(0);

  const mood = useMemo(() => {
    if (props.highlightDropName) {
      return 'celebrate';
    }

    if (props.activeRun) {
      return 'hunting';
    }

    if (props.todayDropCount > 0) {
      return 'satisfied';
    }

    return 'idle';
  }, [props.activeRun, props.highlightDropName, props.todayDropCount]);

  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp(
    props.recentRuns,
    props.recentDrops
  );
  const preflightTasks = props.preflight?.tasks ?? [];
  const blockingTask = preflightTasks.find((task) => task.status === 'error');
  const warningTask = preflightTasks.find((task) => task.status === 'warning');

  const primaryAction = useMemo<FloatingActionState>(() => {
    if (props.activeRun) {
      return {
        badge: '正在陪刷',
        title: `本轮停在 ${props.activeRun.mapName}`,
        detail: '刷完以后点这里就能直接结算，保持悬浮态也不会断掉今天的节奏。',
        label: props.busy ? '结算中...' : '完成本轮',
        action: props.onStopRun
      };
    }

    if (!props.setupGuideCompleted) {
      return {
        badge: '继续引导',
        title: '首启闭环还没走完',
        detail: '先把引导补齐，后面的工坊和陪刷体验都会稳定很多。',
        label: '继续引导',
        action: props.onOpenSetupGuide
      };
    }

    if (latestRunNeedingWrapUp) {
      return {
        badge: '待收口',
        title: `${latestRunNeedingWrapUp.mapName} 刚刷完`,
        detail: '我看到上一轮已经结束，但战报里还没有新的掉落记录，先去收一下今天的账。',
        label: '去记掉落',
        action: props.onOpenDrops
      };
    }

    if (blockingTask) {
      return {
        badge: '工坊阻塞',
        title: '自动化还有条件没补齐',
        detail: `${blockingTask.summary}，先去工坊补掉这一项，后面运行会更稳。`,
        label: '去工坊处理',
        action: props.onOpenWorkshop
      };
    }

    if (props.recentRuns.length > 0) {
      const latestRoute = props.recentRuns[0].mapName;
      return {
        badge: warningTask ? '工坊提醒' : '一键继续',
        title: `沿用 ${latestRoute} 再开一轮`,
        detail: warningTask
          ? `${warningTask.summary}。如果先不处理，也可以直接继续今天的主刷路线。`
          : '最顺手的继续方式，就是沿用最近一轮路线直接开刷。',
        label: props.busy ? '启动中...' : `继续 ${latestRoute}`,
        action: () => props.onStartRun(latestRoute)
      };
    }

    return {
      badge: '今日开局',
      title: '从熟图开始热身',
      detail: '先开第一轮，悬浮态就会开始有真正的陪刷状态和战果反馈。',
      label: props.busy ? '启动中...' : '开始今天',
      action: () => props.onStartRun('混沌避难所')
    };
  }, [
    blockingTask,
    latestRunNeedingWrapUp,
    props.activeRun,
    props.busy,
    props.onOpenDrops,
    props.onOpenSetupGuide,
    props.onOpenWorkshop,
    props.onStartRun,
    props.onStopRun,
    props.recentRuns,
    props.setupGuideCompleted,
    warningTask
  ]);

  const pulseItems = useMemo<FloatingPulseItem[]>(() => {
    return [
      {
        id: 'count',
        label: '今日次数',
        value: `${props.todayCount} 轮`,
        detail:
          props.todayCount > 0
            ? '今天的刷图节奏已经跑起来了。'
            : '今天还没开刷，先起第一轮。'
      },
      {
        id: 'drop',
        label: '今日战果',
        value: props.highlightDropName || `${props.todayDropCount} 条`,
        detail: props.highlightDropName
          ? '刚刚有高亮掉落，桌宠已经记住它了。'
          : props.todayDropCount > 0
            ? '今天已经有战利品入账。'
            : '还在等第一条掉落出现。'
      },
      {
        id: 'workshop',
        label: '工坊状态',
        value: props.preflightBusy
          ? '预检刷新中'
          : blockingTask
            ? '还有阻塞项'
            : warningTask
              ? '还有提醒项'
              : props.preflight
                ? '联调可用'
                : '等待预检',
        detail: blockingTask
          ? blockingTask.summary
          : warningTask
            ? warningTask.summary
            : '符文、宝石、金币三条线都能从这里衔接。'
      }
    ];
  }, [
    blockingTask,
    props.highlightDropName,
    props.preflight,
    props.preflightBusy,
    props.todayCount,
    props.todayDropCount,
    warningTask
  ]);

  useEffect(() => {
    setPulseIndex(0);
  }, [props.highlightDropName, props.todayCount, props.todayDropCount, props.activeRun?.id]);

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
  const bubbleTitle = props.highlightDropName
    ? `高亮战果 · ${props.highlightDropName}`
    : props.activeRun
      ? `${props.activeRun.mapName} · ${props.liveDurationText}`
      : primaryAction.title;
  const bubbleDetail = props.highlightDropName
    ? '这条掉落刚刚触发了桌宠高亮，适合顺手去战报页收口。'
    : props.activeRun
      ? '悬浮态会持续盯着这一轮的计时和状态。'
      : primaryAction.detail;

  return (
    <section className="floating-shell">
      <div className={`floating-card floating-card-${mood} drag-strip`}>
        <div className="floating-top">
          <div className={`pet-avatar pet-avatar-${mood} floating-avatar`} aria-hidden="true">
            <div className="pet-ring pet-ring-outer" />
            <div className="pet-ring pet-ring-inner" />
            <div className="pet-core" />
            <div className="pet-eyes">
              <span />
              <span />
            </div>
            {props.highlightDropName ? <div className="pet-spark" /> : null}
          </div>

          <div className="floating-bubble">
            <div className="floating-bubble-head">
              <span className="status-chip">
                {props.activeRun ? '陪刷中' : '悬浮待命'}
              </span>
              <span className="mini-pill">{primaryAction.badge}</span>
            </div>
            <strong>{bubbleTitle}</strong>
            <p>{bubbleDetail}</p>
          </div>
        </div>

        <article className="floating-brief no-drag">
          <span className="eyebrow">Resume</span>
          <strong>{primaryAction.title}</strong>
          <p>{primaryAction.detail}</p>
          <button
            className="floating-action primary floating-primary-action"
            disabled={props.busy}
            onClick={primaryAction.action}
            type="button"
          >
            {primaryAction.label}
          </button>
        </article>

        <article className="floating-pulse-card no-drag">
          <div className="floating-pulse-head">
            <span className="eyebrow">Pulse</span>
            <span className="mini-pill">
              {pulseIndex + 1}/{pulseItems.length}
            </span>
          </div>

          <strong>{activePulse.value}</strong>
          <p>
            {activePulse.label} · {activePulse.detail}
          </p>

          <div className="floating-pulse-dots" aria-label="floating pulse">
            {pulseItems.map((item, index) => (
              <span
                className={index === pulseIndex ? 'floating-pulse-dot active' : 'floating-pulse-dot'}
                key={item.id}
              />
            ))}
          </div>
        </article>

        <div className="floating-dock no-drag">
          <button className="floating-action" onClick={props.onOpenPanel} type="button">
            展开
          </button>
          <button className="floating-action" onClick={props.onOpenDrops} type="button">
            战报
          </button>
          <button className="floating-action" onClick={props.onOpenWorkshop} type="button">
            工坊
          </button>
          <button
            className={props.alwaysOnTop ? 'floating-action active' : 'floating-action'}
            onClick={props.onToggleAlwaysOnTop}
            type="button"
          >
            置顶
          </button>
          <button className="floating-action" onClick={props.onMinimize} type="button">
            收起
          </button>
          <button
            className="floating-action"
            disabled={props.busy || Boolean(props.activeRun)}
            onClick={() => props.onStartRun(props.recentRuns[0]?.mapName ?? '混沌避难所')}
            type="button"
          >
            快开
          </button>
        </div>
      </div>
    </section>
  );
}
