import { useEffect, useMemo, useState } from 'react';
import { buildPetPersona } from '../lib/petPersona';
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
  alwaysOnTop: boolean;
  launchOnStartup: boolean;
  notificationsEnabled: boolean;
  setupGuideCompleted: boolean;
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
    ? `${props.activeRun.mapName} · ${props.liveDurationText}`
    : `今天 ${props.todayCount} 次刷图 / ${props.todayDropCount} 条掉落`;

  return (
    <section className={`pet-shell compact-pet-shell pet-shell-${persona.emotion}`}>
      <div className="compact-header drag-strip">
        <div className="compact-brand">
          <div
            className={`compact-avatar pet-avatar-mini pet-avatar-${persona.emotion}`}
            aria-hidden="true"
          >
            <div className="pet-ring pet-ring-outer" />
            <div className="pet-ring pet-ring-inner" />
            <div className="pet-core" />
            <div className="pet-eyes">
              <span />
              <span />
            </div>
            {props.highlightDropName ? <div className="pet-spark" /> : null}
          </div>

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
    </section>
  );
}
