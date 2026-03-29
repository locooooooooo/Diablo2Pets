interface PanelStateAction {
  label: string;
  kind?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
}

interface PanelStateCardProps {
  eyebrow?: string;
  title: string;
  detail: string;
  tone: 'success' | 'attention' | 'error';
  meta?: string;
  actions?: PanelStateAction[];
}

export function PanelStateCard(props: PanelStateCardProps) {
  return (
    <article className={`card panel-state-card tone-${props.tone}`}>
      <div className="panel-state-head">
        <div>
          <p className="eyebrow">{props.eyebrow ?? '当前状态'}</p>
          <div className="card-title">{props.title}</div>
          <p className="secondary-text">{props.detail}</p>
        </div>
        <span className={`status-pill ${props.tone}`}>{getToneLabel(props.tone)}</span>
      </div>

      {props.meta ? <div className="panel-state-meta">{props.meta}</div> : null}

      {props.actions?.length ? (
        <div className="tool-row">
          {props.actions.map((action) => (
            <button
              className={action.kind === 'primary' ? 'primary-button' : 'ghost-button'}
              disabled={action.disabled}
              key={action.label}
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function getToneLabel(tone: PanelStateCardProps['tone']): string {
  switch (tone) {
    case 'success':
      return '已就绪';
    case 'attention':
      return '处理中';
    case 'error':
      return '待处理';
  }
}
