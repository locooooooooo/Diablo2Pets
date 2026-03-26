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
          <span className="status-chip">{props.activeRun ? '陪刷中' : '待命中'}</span>
          <h2>{props.activeRun ? props.activeRun.mapName : '赫拉迪姆陪刷助手'}</h2>
          <p>
            {props.activeRun
              ? `本次已经陪跑 ${props.liveDurationText}`
              : `今天已经记录 ${props.todayCount} 次刷图`}
          </p>
          <p className="secondary-text">
            桌宠首页负责状态和快捷动作，掉落账本与工坊负责沉淀战果和自动化。
          </p>

          <div className="tag-row no-drag">
            <span className="mini-pill">陪刷首页</span>
            <span className="mini-pill">战利品账本</span>
            <span className="mini-pill">赫拉迪姆工坊</span>
          </div>

          <p className="secondary-text">
            托盘常驻，快捷键 <code>Alt+Shift+D</code> 可随时显示或隐藏。
          </p>

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
