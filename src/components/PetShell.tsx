import type { ActiveRun, WindowMode } from '../types';

interface PetShellProps {
  activeRun: ActiveRun | null;
  todayCount: number;
  todayDropCount: number;
  liveDurationText: string;
  alwaysOnTop: boolean;
  launchOnStartup: boolean;
  notificationsEnabled: boolean;
  onToggleAlwaysOnTop: () => void;
  onToggleLaunchOnStartup: () => void;
  onToggleNotifications: () => void;
  onToggleWindowMode: (mode: WindowMode) => void;
  onMinimize: () => void;
}

export function PetShell(props: PetShellProps) {
  const headline = props.activeRun
    ? `${props.activeRun.mapName} 路 ${props.liveDurationText}`
    : `今天 ${props.todayCount} 次刷图 / ${props.todayDropCount} 条掉落`;

  return (
    <section className="pet-shell compact-pet-shell">
      <div className="compact-header drag-strip">
        <div className="compact-brand">
          <div className="compact-avatar" aria-hidden="true">
            <div className="pet-ring pet-ring-outer" />
            <div className="pet-ring pet-ring-inner" />
            <div className="pet-core" />
            <div className="pet-eyes">
              <span />
              <span />
            </div>
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
            className={`icon-button ${props.alwaysOnTop ? 'active' : ''}`}
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
        <span className="mini-pill">{props.activeRun ? '陪刷中' : '面板模式'}</span>
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
    </section>
  );
}
