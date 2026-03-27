import { useEffect, useMemo, useState } from 'react';
import {
  buildPetPersona,
  type PetInteractionCue
} from '../lib/petPersona';
import type { PetEvent, PetRoom, PetScene } from '../lib/petWorld';
import type {
  ActiveRun,
  AutomationPreflightResponse,
  DropRecord,
  RunRecord,
  WindowMode
} from '../types';

interface PetShellProps {
  activeRun: ActiveRun | null;
  recentRuns: RunRecord[];
  recentDrops: DropRecord[];
  todayCount: number;
  todayDropCount: number;
  liveDurationText: string;
  highlightDropName: string;
  preflight: AutomationPreflightResponse | null;
  interactionCue: PetInteractionCue | null;
  room: PetRoom;
  scene: PetScene;
  event: PetEvent | null;
  eventBusy: boolean;
  alwaysOnTop: boolean;
  launchOnStartup: boolean;
  notificationsEnabled: boolean;
  setupGuideCompleted: boolean;
  onPetHeadpat: () => void;
  onPetCheer: () => void;
  onEventAction: () => void;
  onToggleAlwaysOnTop: () => void;
  onToggleLaunchOnStartup: () => void;
  onToggleNotifications: () => void;
  onToggleWindowMode: (mode: WindowMode) => void;
  onOpenSetupGuide: () => void;
  onMinimize: () => void;
}

export function PetShell(props: PetShellProps) {
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

  useEffect(() => {
    setScriptIndex(0);
  }, [persona.headline, persona.statusLine]);

  useEffect(() => {
    if (persona.scripts.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setScriptIndex((current) => (current + 1) % persona.scripts.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [persona.scripts]);

  const activeScript = persona.scripts[scriptIndex] ?? persona.scripts[0] ?? '';
  const headline = props.activeRun
    ? `${props.activeRun.mapName} 路 ${props.liveDurationText}`
    : `今天 ${props.todayCount} 次刷图 / ${props.todayDropCount} 条掉落`;
  const interactionClass = props.interactionCue
    ? `interaction-${props.interactionCue.kind}`
    : '';

  return (
    <section
      className={`pet-shell compact-pet-shell pet-shell-${persona.emotion} scene-${props.scene.id} ${
        props.interactionCue ? 'pet-shell-interaction' : ''
      } ${interactionClass}`}
    >
      <div className="pet-scene-orbs" aria-hidden="true">
        <span className="pet-scene-orb orb-a" />
        <span className="pet-scene-orb orb-b" />
        <span className="pet-scene-orb orb-c" />
      </div>

      <div className="compact-header drag-strip">
        <div className="compact-brand">
          <button
            aria-label="摸头互动，双击庆祝"
            className={`compact-avatar compact-avatar-trigger no-drag pet-avatar-mini pet-avatar-${persona.emotion} ${interactionClass}`}
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
            <span className="pet-prop-badge">{props.scene.propLabel}</span>
            {props.highlightDropName ? <div className="pet-spark" /> : null}
          </button>

          <div>
            <p className="eyebrow">Horadric Desktop Pet</p>
            <h1>暗黑 2 桌宠助手</h1>
            <p className="compact-subtitle">{headline}</p>
          </div>
        </div>

        <div className="compact-actions no-drag">
          <button
            className="icon-button"
            onClick={() => props.onToggleWindowMode('floating')}
            type="button"
          >
            悬浮
          </button>
          <button
            className={props.alwaysOnTop ? 'icon-button active' : 'icon-button'}
            onClick={props.onToggleAlwaysOnTop}
            type="button"
          >
            置顶
          </button>
          <button className="icon-button" onClick={props.onMinimize} type="button">
            收起
          </button>
        </div>
      </div>

      <div className="compact-meta no-drag">
        <span className={`emotion-pill emotion-${persona.emotion}`}>{persona.emotionLabel}</span>
        <span className="mini-pill">{props.activeRun ? '陪刷中' : '面板模式'}</span>
        <span className="mini-pill pet-gesture-hint">摸头像回应 / 双击庆祝</span>
        {!props.setupGuideCompleted ? (
          <button className="quick-toggle active" onClick={props.onOpenSetupGuide} type="button">
            继续引导
          </button>
        ) : null}
        <button
          className={props.launchOnStartup ? 'quick-toggle active' : 'quick-toggle'}
          onClick={props.onToggleLaunchOnStartup}
          type="button"
        >
          开机自启
        </button>
        <button
          className={props.notificationsEnabled ? 'quick-toggle active' : 'quick-toggle'}
          onClick={props.onToggleNotifications}
          type="button"
        >
          系统通知
        </button>
      </div>

      <div className="pet-stage-band no-drag">
        <span className="pet-stage-chip strong">{props.scene.label}</span>
        <span className="pet-stage-chip">{props.scene.auraLabel}</span>
        <span className="pet-stage-ambient">{props.scene.ambientLine}</span>
      </div>

      <article className="pet-room-card no-drag">
        <div className="pet-room-copy">
          <p className="eyebrow">Pet Room</p>
          <strong>{props.room.title}</strong>
          <p>{props.room.subtitle}</p>
        </div>

        <div className="pet-room-grid">
          {props.room.items.map((item) => (
            <article className={`pet-room-item state-${item.state}`} key={item.id}>
              <span className="pet-room-kicker">{item.shortLabel}</span>
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </article>

      <div className="compact-script-strip no-drag">
        <div className="compact-thought">
          <strong>{persona.headline}</strong>
          <p>{persona.statusLine}</p>
          <span>{activeScript}</span>
        </div>

        <div className="compact-script-dots" aria-label="pet script progression">
          {persona.scripts.map((script, index) => (
            <span
              className={index === scriptIndex ? 'compact-script-dot active' : 'compact-script-dot'}
              key={script}
            />
          ))}
        </div>
      </div>

      {props.event ? (
        <article className={`pet-event-card event-${props.event.tone} no-drag`}>
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
    </section>
  );
}
