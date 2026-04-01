import { useEffect, useMemo, useState } from 'react';
import type { PetCeremony } from '../lib/petCeremony';
import { createPetCodexEntryId } from '../lib/petCodex';
import type { PetFishingCatch } from '../lib/petFishing';
import {
  buildPetPersona,
  type PetInteractionCue
} from '../lib/petPersona';
import type { SetupGuideHint } from '../lib/setupGuideState';
import type { PetHabitat } from '../lib/petHabitat';
import { FishingDiabloPet } from './FishingDiabloPet';
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
  fishingCatch: PetFishingCatch | null;
  progression: PetProgression;
  rewards: PetRewardTrack;
  habitat: PetHabitat;
  room: PetRoom;
  scene: PetScene;
  ceremony: PetCeremony | null;
  event: PetEvent | null;
  eventBusy: boolean;
  alwaysOnTop: boolean;
  launchOnStartup: boolean;
  notificationsEnabled: boolean;
  setupGuideHint: SetupGuideHint;
  setupGuideCompleted: boolean;
  detailsExpanded: boolean;
  onPetHeadpat: () => void;
  onPetCheer: () => void;
  onEventAction: () => void;
  onOpenCodex: () => void;
  onOpenCodexEntry: (entryId: string) => void;
  onToggleAlwaysOnTop: () => void;
  onToggleLaunchOnStartup: () => void;
  onToggleNotifications: () => void;
  onToggleWindowMode: (mode: WindowMode) => void;
  onToggleDetails: () => void;
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
    ? `${props.activeRun.mapName} 路线中 · ${props.liveDurationText}`
    : `今天 ${props.todayCount} 次刷图 / ${props.todayDropCount} 条掉落`;
  const interactionClass = props.interactionCue
    ? `interaction-${props.interactionCue.kind}`
    : '';
  const rewardSpotlightIds = new Set(props.ceremony?.rewardIds ?? []);
  const roomSpotlightIds = new Set(props.ceremony?.roomIds ?? []);
  const readyTasks =
    props.preflight?.tasks.filter((task) => task.status === 'ready').length ?? 0;
  const totalTasks = props.preflight?.tasks.length ?? 0;
  const workshopSummary =
    totalTasks > 0 ? `工坊 ${readyTasks}/${totalTasks} 条就绪` : '工坊状态等待读取';
  const hasBlockingEnvironmentCheck = (props.preflight?.globalChecks ?? []).some(
    (check) => check.level === 'error'
  );
  const environmentSummary = hasBlockingEnvironmentCheck ? '环境待补条件' : '环境已就绪';

  return (
    <section
      className={`pet-shell compact-pet-shell pet-shell-${persona.emotion} scene-${props.scene.id} habitat-${props.habitat.tier} ${
        props.interactionCue ? 'pet-shell-interaction' : ''
      } ${interactionClass}`}
    >
      <div className="pet-scene-orbs" aria-hidden="true">
        <span className="pet-scene-orb orb-a" />
        <span className="pet-scene-orb orb-b" />
        <span className="pet-scene-orb orb-c" />
      </div>

      <div 
        className="compact-header drag-strip"
        onDoubleClick={() => props.onToggleWindowMode('floating')}
      >
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
            <FishingDiabloPet
              fishingCatch={props.fishingCatch}
              highlightDropName={props.highlightDropName}
              propLabel={props.scene.propLabel}
            />
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
        <span className="mini-pill">{environmentSummary}</span>
        <span className="mini-pill">{workshopSummary}</span>
        {!props.setupGuideCompleted ? (
          <button
            className="quick-toggle active"
            onClick={props.onOpenSetupGuide}
            title={props.setupGuideHint.title}
            type="button"
          >
            {props.setupGuideHint.actionLabel}
          </button>
        ) : null}
      </div>

      {props.ceremony ? (
        <article className={`pet-ceremony-banner no-drag ceremony-${props.ceremony.kind}`}>
          <div className="pet-ceremony-head">
            <span className="pet-ceremony-badge">{props.ceremony.badge}</span>
            <span className="mini-pill">Lv.{props.ceremony.level}</span>
          </div>
          <strong>{props.ceremony.title}</strong>
          <p>{props.ceremony.detail}</p>
        </article>
      ) : null}

      <div className="pet-shell-summary-strip no-drag">
        <button className="ghost-button pet-codex-launch compact" onClick={props.onOpenCodex} type="button">
          打开藏品册
        </button>
        <button
          aria-expanded={props.detailsExpanded}
          className={props.detailsExpanded ? 'ghost-button active' : 'ghost-button'}
          onClick={props.onToggleDetails}
          type="button"
        >
          {props.detailsExpanded ? '收起桌宠详情' : '展开桌宠详情'}
        </button>
      </div>

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

      {props.detailsExpanded ? (
        <>
          <article className="pet-shell-detail-overview no-drag">
            <div className="pet-stage-band">
              <span className="pet-stage-chip strong">{props.scene.label}</span>
              <span className="pet-stage-chip">{props.scene.auraLabel}</span>
              <span className="pet-stage-ambient">{props.scene.ambientLine}</span>
            </div>

            <article className="pet-progress-card">
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

            <div className="quick-toggle-row">
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
              <button className="quick-toggle" onClick={props.onOpenCodex} type="button">
                打开藏品册
              </button>
            </div>
          </article>

          <article className="pet-habitat-card no-drag">
            <div className="pet-habitat-head">
              <div className="pet-habitat-copy">
                <p className="eyebrow">Habitat</p>
                <strong>{props.habitat.title}</strong>
                <p>{props.habitat.subtitle}</p>
              </div>
              <div className="pet-habitat-crest">
                <button
                  className="ghost-button pet-codex-launch"
                  onClick={props.onOpenCodex}
                  type="button"
                >
                  翻收藏册
                </button>
                <span className="pet-habitat-crest-chip">{props.habitat.crest}</span>
                <span className="mini-pill">{props.habitat.aura}</span>
              </div>
            </div>

            <div className="pet-habitat-wall">
              <div className="pet-habitat-wall-copy">
                <strong>{props.habitat.collectionTitle}</strong>
                <p>{props.habitat.collectionSummary}</p>
              </div>

              <div className="pet-habitat-grid">
                {props.habitat.exhibits.slice(0, 6).map((exhibit) => (
                  <button
                    className={`pet-habitat-item pet-codex-card state-${exhibit.state}`}
                    key={exhibit.id}
                    onClick={() =>
                      props.onOpenCodexEntry(createPetCodexEntryId('relics', exhibit.id))
                    }
                    type="button"
                  >
                    <span className="pet-room-kicker">{exhibit.accent}</span>
                    <strong>{exhibit.label}</strong>
                    <p>{exhibit.detail}</p>
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className="pet-reward-card no-drag">
            <div className="pet-reward-head">
              <div className="pet-reward-copy">
                <p className="eyebrow">Unlocks</p>
                <strong>{props.rewards.headline}</strong>
                <p>{props.rewards.summary}</p>
              </div>
              <div className="pet-reward-stat">
                <span className="mini-pill">
                  {props.rewards.unlockedCount}/{props.rewards.totalCount} 已解锁
                </span>
                {props.rewards.activeReward ? (
                  <span className="status-chip">{props.rewards.activeReward.label}</span>
                ) : null}
              </div>
            </div>

            {props.rewards.activeReward ? (
              <div className="pet-reward-spotlight">
                <strong>{props.rewards.activeReward.label}</strong>
                <p>{props.rewards.activeReward.detail}</p>
                <span>{props.rewards.activeReward.bonus}</span>
              </div>
            ) : null}

            <div className="pet-reward-grid">
              {props.rewards.rewards.map((reward) => (
                <button
                  className={`pet-reward-item pet-codex-card state-${reward.state} ${
                    rewardSpotlightIds.has(reward.id) ? 'is-spotlight' : ''
                  }`}
                  key={reward.id}
                  onClick={() =>
                    props.onOpenCodexEntry(createPetCodexEntryId('rewards', reward.id))
                  }
                  type="button"
                >
                  <span className="pet-room-kicker">Lv.{reward.level}</span>
                  <strong>{reward.label}</strong>
                  <p>{reward.detail}</p>
                </button>
              ))}
            </div>
          </article>

          <article className="pet-room-card no-drag">
            <div className="pet-room-copy">
              <p className="eyebrow">Pet Room</p>
              <strong>{props.room.title}</strong>
              <p>{props.room.subtitle}</p>
            </div>

            <div className="pet-room-grid">
              {props.room.items.map((item) => (
                <button
                  className={`pet-room-item pet-codex-card state-${item.state} ${
                    roomSpotlightIds.has(item.id) ? 'is-spotlight' : ''
                  }`}
                  key={item.id}
                  onClick={() =>
                    props.onOpenCodexEntry(createPetCodexEntryId('chamber', item.id))
                  }
                  type="button"
                >
                  <span className="pet-room-kicker">{item.shortLabel}</span>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </button>
              ))}
            </div>
          </article>
        </>
      ) : null}

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
