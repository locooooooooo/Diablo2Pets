import { useEffect, useMemo, useState } from 'react';
import {
  buildPetPersona,
  type PetInteractionCue
} from '../lib/petPersona';
import type { PetCeremony } from '../lib/petCeremony';
import type {
  PetEvent,
  PetProgression,
  PetRewardTrack,
  PetRoom,
  PetScene
} from '../lib/petWorld';
import type {
  ActiveRun,
  AutomationPreflightResponse,
  DropRecord,
  FloatingSnapPreview,
  RunRecord,
  WindowMode
} from '../types';

interface FloatingPetProps {
  activeRun: ActiveRun | null;
  recentRuns: RunRecord[];
  recentDrops: DropRecord[];
  todayCount: number;
  todayDropCount: number;
  liveDurationText: string;
  highlightDropName: string;
  interactionCue: PetInteractionCue | null;
  progression: PetProgression;
  rewards: PetRewardTrack;
  room: PetRoom;
  scene: PetScene;
  ceremony: PetCeremony | null;
  event: PetEvent | null;
  eventBusy: boolean;
  alwaysOnTop: boolean;
  busy: boolean;
  setupGuideCompleted: boolean;
  preflight: AutomationPreflightResponse | null;
  preflightBusy: boolean;
  snapPreview: FloatingSnapPreview;
  onPetHeadpat: () => void;
  onPetCheer: () => void;
  onEventAction: () => void;
  onStartRun: (mapName: string) => void;
  onStopRun: () => void;
  onOpenPanel: () => void;
  onOpenDrops: () => void;
  onOpenWorkshop: () => void;
  onOpenSetupGuide: () => void;
  onToggleWindowMode: (mode: WindowMode) => void;
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

function getSnapHint(preview: FloatingSnapPreview): string {
  if (!preview.visible || !preview.edge) {
    return '拖到屏幕边缘时会自动吸附。';
  }

  const edgeLabel =
    preview.edge === 'left'
      ? '左侧'
      : preview.edge === 'right'
        ? '右侧'
        : preview.edge === 'top'
          ? '顶部'
          : '底部';

  return preview.snapped
    ? `已经吸附到${edgeLabel}。`
    : `松手后会吸附到${edgeLabel}。`;
}

export function FloatingPet(props: FloatingPetProps) {
  const [pulseIndex, setPulseIndex] = useState(0);
  const [scriptIndex, setScriptIndex] = useState(0);

  const persona = useMemo(
    () =>
      buildPetPersona({
        activeRun: props.activeRun,
        highlightDropName: props.highlightDropName,
        interactionCue: props.interactionCue,
        liveDurationText: props.liveDurationText,
        preflight: props.preflight,
        recentDrops: props.recentDrops,
        recentRuns: props.recentRuns,
        setupGuideCompleted: props.setupGuideCompleted,
        todayCount: props.todayCount,
        todayDropCount: props.todayDropCount
      }),
    [
      props.activeRun,
      props.highlightDropName,
      props.interactionCue,
      props.liveDurationText,
      props.preflight,
      props.recentDrops,
      props.recentRuns,
      props.setupGuideCompleted,
      props.todayCount,
      props.todayDropCount
    ]
  );

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
        badge: '本轮进行中',
        title: `本轮停在 ${props.activeRun.mapName}`,
        detail: '刷完以后点这里就能直接结算，悬浮态不会丢掉今天的节奏。',
        label: props.busy ? '结算中…' : '完成本轮',
        action: props.onStopRun
      };
    }

    if (!props.setupGuideCompleted) {
      return {
        badge: '继续引导',
        title: '首启闭环还没走完',
        detail: '先把引导补齐，后面的陪刷和工坊体验都会更稳。',
        label: '继续引导',
        action: props.onOpenSetupGuide
      };
    }

    if (latestRunNeedingWrapUp) {
      return {
        badge: '先去收口',
        title: `${latestRunNeedingWrapUp.mapName} 刚刷完`,
        detail: '上一轮结束了，但战报还没写进新的掉落，现在去收口最顺。',
        label: '去记掉落',
        action: props.onOpenDrops
      };
    }

    if (blockingTask) {
      return {
        badge: '工坊阻塞',
        title: '自动化还有条件没补齐',
        detail: `${blockingTask.summary}，先去工坊处理掉它。`,
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
          ? `${warningTask.summary}。如果你先不处理，也可以继续今天主刷路线。`
          : '继续最近一轮的路线，是每天上线后最顺手的开始方式。',
        label: props.busy ? '启动中…' : `继续 ${latestRoute}`,
        action: () => props.onStartRun(latestRoute)
      };
    }

    return {
      badge: '今日开局',
      title: '从熟图开始热身',
      detail: '先开第一轮，桌宠就会开始认真陪你盯节奏。',
      label: props.busy ? '启动中…' : '开始今天',
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
          ? '刚刚有高亮掉落，最适合顺手去战报页收口。'
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
            : '符文、宝石、金币三条线都能从这里接回去。'
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
    setScriptIndex(0);
  }, [persona.headline, persona.statusLine]);

  useEffect(() => {
    if (pulseItems.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setPulseIndex((current) => (current + 1) % pulseItems.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [pulseItems]);

  useEffect(() => {
    if (persona.scripts.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setScriptIndex((current) => (current + 1) % persona.scripts.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [persona.scripts]);

  const activePulse = pulseItems[pulseIndex] ?? pulseItems[0];
  const activeScript = persona.scripts[scriptIndex] ?? persona.scripts[0] ?? '';
  const bubbleTitle = props.interactionCue
    ? persona.headline
    : props.highlightDropName
      ? `高亮战果 · ${props.highlightDropName}`
      : props.activeRun
        ? `${props.activeRun.mapName} · ${props.liveDurationText}`
        : persona.headline;
  const bubbleDetail = props.interactionCue
    ? persona.statusLine
    : props.highlightDropName
      ? '这条掉落刚刚触发了桌宠高亮，适合顺手去战报页收口。'
      : activeScript;
  const snapHint = getSnapHint(props.snapPreview);
  const interactionClass = props.interactionCue
    ? `interaction-${props.interactionCue.kind}`
    : '';
  const rewardSpotlightIds = new Set(props.ceremony?.rewardIds ?? []);
  const roomSpotlightIds = new Set(props.ceremony?.roomIds ?? []);

  return (
    <section className="floating-shell">
      <div
        className={`floating-card floating-card-${persona.emotion} scene-${props.scene.id} ${
          props.interactionCue ? 'floating-card-interaction' : ''
        } ${interactionClass} ${
          props.snapPreview.visible && props.snapPreview.edge
            ? `snap-preview snap-${props.snapPreview.edge}`
            : ''
        } ${props.snapPreview.snapped ? 'snap-locked' : ''} drag-strip`}
      >
        <div className="pet-scene-orbs" aria-hidden="true">
          <span className="pet-scene-orb orb-a" />
          <span className="pet-scene-orb orb-b" />
          <span className="pet-scene-orb orb-c" />
        </div>

        {props.snapPreview.visible && props.snapPreview.edge ? (
          <div
            aria-hidden="true"
            className={`floating-snap-glow ${props.snapPreview.edge} ${
              props.snapPreview.snapped ? 'locked' : ''
            }`}
          />
        ) : null}

        <div className="floating-top">
          <button
            aria-label="摸头互动，双击庆祝"
            className={`pet-avatar pet-avatar-${persona.emotion} floating-avatar pet-avatar-trigger no-drag ${interactionClass}`}
            onClick={props.onPetHeadpat}
            onDoubleClick={(event) => {
              event.preventDefault();
              props.onPetCheer();
            }}
            title="摸头互动，双击庆祝"
            type="button"
          >
            <div className="pet-ring pet-ring-outer" />
            <div className="pet-ring pet-ring-inner" />
            <div className="pet-core" />
            <div className="pet-eyes">
              <span />
              <span />
            </div>
            <span className="pet-prop-badge floating-prop-badge">{props.scene.propLabel}</span>
            {props.highlightDropName ? <div className="pet-spark" /> : null}
          </button>

          <div
            className="floating-bubble no-drag"
            onDoubleClick={() => props.onToggleWindowMode('panel')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                props.onToggleWindowMode('panel');
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="floating-bubble-head">
              <span className={`emotion-pill emotion-${persona.emotion}`}>
                {persona.emotionLabel}
              </span>
              <div className="floating-bubble-chips">
                <span className="mini-pill pet-gesture-hint">摸头像互动</span>
                <span className="floating-toggle-chip">双击展开</span>
              </div>
            </div>
            <strong>{bubbleTitle}</strong>
            <p>{bubbleDetail}</p>
            <span className="floating-script-line">{activeScript}</span>
          </div>
        </div>

        <div className="floating-scene-strip no-drag">
          <span className="pet-stage-chip strong">{props.scene.label}</span>
          <span className="pet-stage-chip">{props.scene.auraLabel}</span>
          <span className="pet-stage-ambient">{props.scene.ambientLine}</span>
        </div>

        {props.ceremony ? (
          <article
            className={`pet-ceremony-banner floating-ceremony-banner no-drag ceremony-${props.ceremony.kind}`}
          >
            <div className="pet-ceremony-head">
              <span className="pet-ceremony-badge">{props.ceremony.badge}</span>
              <span className="mini-pill">Lv.{props.ceremony.level}</span>
            </div>
            <strong>{props.ceremony.title}</strong>
            <p>{props.ceremony.detail}</p>
          </article>
        ) : null}

        <article className="pet-progress-card floating-progress-card no-drag">
          <div className="pet-progress-head">
            <div>
              <p className="eyebrow">Bond</p>
              <strong>
                Lv.{props.progression.level} {props.progression.title}
              </strong>
            </div>
            <span className="mini-pill">{props.progression.nextMilestone}</span>
          </div>

          <div aria-hidden="true" className="pet-progress-bar">
            <span
              className="pet-progress-fill"
              style={{ width: `${Math.round(props.progression.progress * 100)}%` }}
            />
          </div>

          <div className="pet-progress-meta">
            <span>{props.progression.sceneLine}</span>
            <span>{props.progression.progressLabel}</span>
          </div>
        </article>

        <article className="pet-reward-card floating-reward-card no-drag">
          <div className="pet-reward-head">
            <div className="pet-reward-copy">
              <p className="eyebrow">Unlocks</p>
              <strong>{props.rewards.activeReward?.label ?? props.rewards.headline}</strong>
              <p>
                {props.rewards.nextReward
                  ? `下一件：Lv.${props.rewards.nextReward.level} ${props.rewards.nextReward.label}`
                  : '终局陈列已经全部点亮'}
              </p>
            </div>
            <span className="mini-pill">
              {props.rewards.unlockedCount}/{props.rewards.totalCount}
            </span>
          </div>

          {props.rewards.activeReward ? (
            <div className="pet-reward-spotlight compact">
              <strong>{props.rewards.activeReward.detail}</strong>
              <span>{props.rewards.activeReward.bonus}</span>
            </div>
          ) : null}

          <div className="pet-reward-mini-grid">
            {props.rewards.rewards.map((reward) => (
              <span
                className={`pet-reward-pill state-${reward.state} ${
                  rewardSpotlightIds.has(reward.id) ? 'is-spotlight' : ''
                }`}
                key={reward.id}
              >
                Lv.{reward.level} {reward.shortLabel}
              </span>
            ))}
          </div>
        </article>

        <article className="pet-room-card floating-room-card no-drag">
          <div className="pet-room-copy">
            <p className="eyebrow">Pet Room</p>
            <strong>{props.room.title}</strong>
            <p>{props.room.subtitle}</p>
          </div>

          <div className="pet-room-grid compact">
            {props.room.items.map((item) => (
              <article
                className={`pet-room-item state-${item.state} ${
                  roomSpotlightIds.has(item.id) ? 'is-spotlight' : ''
                }`}
                key={item.id}
              >
                <span className="pet-room-kicker">{item.shortLabel}</span>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </article>

        {props.event ? (
          <article className={`pet-event-card floating-event-card event-${props.event.tone} no-drag`}>
            <div className="pet-event-copy">
              <div className="pet-event-head">
                <p className="eyebrow">Random Event</p>
                {props.event.storyLabel ? (
                  <span className="mini-pill story-pill">{props.event.storyLabel}</span>
                ) : null}
              </div>
              <strong>{props.event.title}</strong>
              <p>{props.event.detail}</p>
            </div>
            <button
              className="floating-action primary pet-event-button"
              disabled={props.eventBusy}
              onClick={props.onEventAction}
              type="button"
            >
              {props.event.ctaLabel}
            </button>
          </article>
        ) : null}

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

        <div className="floating-snap-note no-drag">
          <span className="mini-pill">{props.snapPreview.snapped ? '已吸附' : '可吸附'}</span>
          <p>{snapHint}</p>
        </div>

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
