import { useEffect, useMemo, useState } from 'react';
import type { ActiveRun } from '../types';

interface PetShellProps {
  activeRun: ActiveRun | null;
  todayCount: number;
  todayDropCount: number;
  liveDurationText: string;
  alwaysOnTop: boolean;
  launchOnStartup: boolean;
  notificationsEnabled: boolean;
  latestDropName: string;
  highlightDropName: string;
  onToggleAlwaysOnTop: () => void;
  onToggleLaunchOnStartup: () => void;
  onToggleNotifications: () => void;
  onMinimize: () => void;
}

const idleLines = [
  '今天准备先刷哪条线？我来替你记节奏。',
  '截图直接 Ctrl+V 给我，我会帮你留档和 OCR。',
  '先在首页开一轮，刷图节奏会慢慢长出来。',
  '工坊已经待命，符文、宝石和金币都能接住。'
];

export function PetShell(props: PetShellProps) {
  const [idleIndex, setIdleIndex] = useState(0);

  useEffect(() => {
    if (props.activeRun || props.highlightDropName) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIdleIndex((current) => (current + 1) % idleLines.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [props.activeRun, props.highlightDropName]);

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

  const bubbleText = useMemo(() => {
    if (props.highlightDropName) {
      return `刚刚记下战利品：${props.highlightDropName}`;
    }

    if (props.activeRun) {
      return `继续推进 ${props.activeRun.mapName}，已经陪跑 ${props.liveDurationText}`;
    }

    if (props.todayDropCount > 0) {
      return `今天已经记下 ${props.todayCount} 次刷图和 ${props.todayDropCount} 条掉落。${
        props.latestDropName ? ` 最近一件是 ${props.latestDropName}。` : ''
      }`;
    }

    return idleLines[idleIndex];
  }, [
    idleIndex,
    props.activeRun,
    props.highlightDropName,
    props.latestDropName,
    props.liveDurationText,
    props.todayCount,
    props.todayDropCount
  ]);

  const moodLabel =
    mood === 'celebrate'
      ? '高亮反馈'
      : mood === 'hunting'
        ? '专注陪刷'
        : mood === 'satisfied'
          ? '战果稳定'
          : '待机巡场';

  return (
    <section className={`pet-shell pet-shell-${mood}`}>
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
        <div className={`pet-avatar pet-avatar-${mood}`} aria-hidden="true">
          <div className="pet-ring pet-ring-outer" />
          <div className="pet-ring pet-ring-inner" />
          <div className="pet-core" />
          <div className="pet-eyes">
            <span />
            <span />
          </div>
          {props.highlightDropName ? <div className="pet-spark" /> : null}
        </div>

        <div className="pet-status">
          <div className="pet-bubble">
            <span className={`emotion-pill emotion-${mood}`}>{moodLabel}</span>
            <p>{bubbleText}</p>
          </div>

          <span className="status-chip">{props.activeRun ? '陪刷中' : '待命中'}</span>
          <h2>{props.activeRun ? props.activeRun.mapName : '赫拉迪姆陪刷助手'}</h2>
          <p>
            {props.activeRun
              ? `本次已经陪跑 ${props.liveDurationText}`
              : `今天已经记录 ${props.todayCount} 次刷图 / ${props.todayDropCount} 条掉落`}
          </p>
          <p className="secondary-text">
            桌宠首页负责状态和反馈，战利品账本负责战报，工坊负责自动化联调。
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
