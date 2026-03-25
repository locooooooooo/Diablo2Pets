import type { ActiveRun } from '../types';

interface PetShellProps {
  activeRun: ActiveRun | null;
  todayCount: number;
  liveDurationText: string;
  alwaysOnTop: boolean;
  launchOnStartup: boolean;
  notificationsEnabled: boolean;
  onToggleAlwaysOnTop: () => void;
  onToggleLaunchOnStartup: () => void;
  onToggleNotifications: () => void;
  onMinimize: () => void;
}

export function PetShell(props: PetShellProps) {
  return (
    <section className="pet-shell">
      <div className="drag-strip">
        <div>
          <p className="eyebrow">Horadric Desktop Pet</p>
          <h1>暗黑 2 桌宠助手</h1>
        </div>
        <div className="window-actions no-drag">
          <button
            className={`icon-button ${props.alwaysOnTop ? 'active' : ''}`}
            onClick={props.onToggleAlwaysOnTop}
            type="button"
          >
            {props.alwaysOnTop ? '取消置顶' : '置顶'}
          </button>
          <button className="icon-button" onClick={props.onMinimize} type="button">
            收起
          </button>
        </div>
      </div>

      <div className="pet-stage">
        <div className="pet-avatar" aria-hidden="true">
          <div className="pet-ring pet-ring-outer" />
          <div className="pet-ring pet-ring-inner" />
          <div className="pet-core" />
          <div className="pet-eyes">
            <span />
            <span />
          </div>
        </div>

        <div className="pet-status">
          <span className="status-chip">{props.activeRun ? '刷图进行中' : '待命中'}</span>
          <h2>{props.activeRun ? props.activeRun.mapName : '赫拉迪姆桌面助手'}</h2>
          <p>
            {props.activeRun
              ? `本次已耗时 ${props.liveDurationText}`
              : `今天已记录 ${props.todayCount} 次刷图`}
          </p>
          <p className="secondary-text">托盘常驻，快捷键 `Alt+Shift+D` 可随时显示或隐藏。</p>

          <div className="quick-toggle-row no-drag">
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
        </div>
      </div>
    </section>
  );
}
