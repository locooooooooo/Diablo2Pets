import { useMemo } from 'react';
import type { ActiveRun } from '../types';

interface FloatingPetProps {
  activeRun: ActiveRun | null;
  todayCount: number;
  todayDropCount: number;
  liveDurationText: string;
  highlightDropName: string;
  alwaysOnTop: boolean;
  onOpenPanel: () => void;
  onOpenDrops: () => void;
  onOpenWorkshop: () => void;
  onToggleAlwaysOnTop: () => void;
  onMinimize: () => void;
}

export function FloatingPet(props: FloatingPetProps) {
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

  const bubbleText = props.highlightDropName
    ? `掉落高亮：${props.highlightDropName}`
    : props.activeRun
      ? `${props.activeRun.mapName} 路 ${props.liveDurationText}`
      : `今天 ${props.todayCount} 次 / ${props.todayDropCount} 条`;

  return (
    <section className="floating-shell">
      <div className="floating-card drag-strip">
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
          <span className="status-chip">{props.activeRun ? '陪刷中' : '悬浮待命'}</span>
          <strong>{bubbleText}</strong>
        </div>

        <div className="floating-dock no-drag">
          <button className="floating-action primary" onClick={props.onOpenPanel} type="button">
            展开
          </button>
          <button className="floating-action" onClick={props.onOpenDrops} type="button">
            掉落
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
        </div>
      </div>
    </section>
  );
}
