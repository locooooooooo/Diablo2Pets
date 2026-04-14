import { Component, type ErrorInfo, type ReactNode } from 'react';

type FallbackTone = 'attention' | 'error';

interface PanelErrorBoundaryProps {
  panelLabel: string;
  resetKey: string;
  onReset?: () => void;
  children: ReactNode;
}

interface PanelErrorBoundaryState {
  hasError: boolean;
  message: string;
  tone: FallbackTone;
}

export class PanelErrorBoundary extends Component<
  PanelErrorBoundaryProps,
  PanelErrorBoundaryState
> {
  state: PanelErrorBoundaryState = {
    hasError: false,
    message: '',
    tone: 'error'
  };

  static getDerivedStateFromError(error: unknown): PanelErrorBoundaryState {
    return {
      hasError: true,
      message:
        error instanceof Error && error.message
          ? error.message
          : '这个页面刚刚渲染失败了。',
      tone: 'error'
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(`[PanelErrorBoundary:${this.props.panelLabel}]`, error, info);
  }

  componentDidUpdate(prevProps: PanelErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({
        hasError: false,
        message: '',
        tone: 'attention'
      });
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      message: '',
      tone: 'attention'
    });
    this.props.onReset?.();
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <article className={`card panel-fallback panel-fallback-${this.state.tone}`}>
        <div className="panel-fallback-head">
          <div>
            <p className="eyebrow">页面保护</p>
            <h3>{this.props.panelLabel} 暂时没有正常显示出来</h3>
            <p className="secondary-text">
              我先把整页保护住了，避免你直接看到白屏。可以先重试当前页面，或者刷新整个桌宠。
            </p>
          </div>
          <span className="status-pill error">已拦截异常</span>
        </div>

        <div className="empty-state">
          <strong>这次异常信息</strong>
          <p>{this.state.message}</p>
        </div>

        <div className="tool-row">
          <button className="primary-button" onClick={this.handleReset} type="button">
            重试当前页面
          </button>
          <button className="ghost-button" onClick={this.handleReload} type="button">
            刷新整个桌宠
          </button>
        </div>
      </article>
    );
  }
}
