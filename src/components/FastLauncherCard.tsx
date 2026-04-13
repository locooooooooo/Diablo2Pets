import { useState, type FormEvent } from 'react';

interface FastLauncherCardProps {
  onSurfaceNotice?: (notice: {
    title: string;
    detail: string;
    tone: 'neutral' | 'success' | 'attention' | 'error';
  }) => void;
}

export function FastLauncherCard({ onSurfaceNotice }: FastLauncherCardProps) {
  const [d2rPath, setD2rPath] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleAutoDetect() {
    setIsBusy(true);
    try {
      const path = await window.d2Pet.fastLauncherGetPath();
      setD2rPath(path);
      onSurfaceNotice?.({
        title: '检测成功',
        detail: `已找到游戏路径: ${path}`,
        tone: 'success'
      });
    } catch (error) {
      onSurfaceNotice?.({
        title: '检测失败',
        detail: error instanceof Error ? error.message : String(error),
        tone: 'error'
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleKillMutex() {
    setIsBusy(true);
    try {
      const result = await window.d2Pet.fastLauncherKillMutex();
      onSurfaceNotice?.({
        title: '多开处理',
        detail: result,
        tone: 'success'
      });
    } catch (error) {
      onSurfaceNotice?.({
        title: '处理失败',
        detail: error instanceof Error ? error.message : String(error),
        tone: 'error'
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLaunch(e: FormEvent) {
    e.preventDefault();
    if (!d2rPath) {
      onSurfaceNotice?.({
        title: '缺少路径',
        detail: '请先自动检测或手动输入游戏路径。',
        tone: 'attention'
      });
      return;
    }

    setIsBusy(true);
    try {
      const result = await window.d2Pet.fastLauncherLaunch({
        path: d2rPath,
        username: username.trim() || undefined,
        password: password.trim() || undefined
      });
      onSurfaceNotice?.({
        title: '启动成功',
        detail: result,
        tone: 'success'
      });
    } catch (error) {
      onSurfaceNotice?.({
        title: '启动失败',
        detail: error instanceof Error ? error.message : String(error),
        tone: 'error'
      });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <article className={`card companion-advanced-card ${expanded ? 'expanded' : ''}`} style={{ marginBottom: '16px' }}>
      <div className="integration-head">
        <div>
          <div className="card-title">快速启动器</div>
          <p className="secondary-text">支持游戏路径自动检测、清理互斥体（多开）和自动输入账号密码。</p>
        </div>
        <button
          className="ghost-button"
          onClick={() => setExpanded(!expanded)}
          type="button"
        >
          {expanded ? '收起面板' : '展开面板'}
        </button>
      </div>

      {expanded && (
        <form onSubmit={handleLaunch} className="integration-form" style={{ marginTop: '16px' }}>
          <div className="field-group">
            <label htmlFor="launcher-d2r-path">
              <strong>游戏安装路径</strong>
              <span>D2R.exe 所在的文件夹</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="launcher-d2r-path"
                type="text"
                value={d2rPath}
                onChange={(e) => setD2rPath(e.target.value)}
                placeholder="例如: C:\Program Files (x86)\Diablo II Resurrected"
                style={{ flex: 1 }}
                disabled={isBusy}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={handleAutoDetect}
                disabled={isBusy}
              >
                自动检测
              </button>
            </div>
          </div>

          <div className="field-group" style={{ marginTop: '12px' }}>
            <label>
              <strong>多开支持</strong>
              <span>清理现有的游戏互斥体，允许启动多个客户端</span>
            </label>
            <button
              type="button"
              className="secondary-button"
              onClick={handleKillMutex}
              disabled={isBusy}
              style={{ alignSelf: 'flex-start' }}
            >
              清理游戏互斥体
            </button>
          </div>

          <div className="field-group" style={{ marginTop: '12px' }}>
            <label htmlFor="launcher-username">
              <strong>战网账号（可选）</strong>
              <span>启动后自动输入账号（仅在进入登录界面时有效）</span>
            </label>
            <input
              id="launcher-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入你的战网邮箱"
              disabled={isBusy}
            />
          </div>

          <div className="field-group" style={{ marginTop: '12px' }}>
            <label htmlFor="launcher-password">
              <strong>战网密码（可选）</strong>
              <span>启动后自动输入密码</span>
            </label>
            <input
              id="launcher-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入你的战网密码"
              disabled={isBusy}
            />
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="submit" className="primary-button" disabled={isBusy || !d2rPath}>
              {isBusy ? '处理中...' : '启动游戏'}
            </button>
          </div>
        </form>
      )}
    </article>
  );
}