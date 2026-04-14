import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { formatCompactDateTime } from '../lib/date';
import type { RunHistoryStats } from '../lib/stats';
import type { ActiveRun, CounterDetectedState, CounterSession, RunRecord } from '../types';

type CounterView = 'stats' | 'settings';

interface CounterPanelProps {
  counterSession: CounterSession | null;
  activeRun: ActiveRun | null;
  autoCounterEnabled: boolean;
  counterLocked: boolean;
  counterRecognitionIntervalSeconds: number;
  counterSceneTemplatePath: string;
  defaultRouteName: string;
  activeDurationText: string;
  historyStats: RunHistoryStats;
  recentRuns: RunRecord[];
  busy: boolean;
  setupGuideCompleted: boolean;
  onPickCounterSceneTemplate: () => Promise<void>;
  onSaveDefaultRouteName: (mapName: string) => Promise<void>;
  onSaveCounterRecognitionInterval: (seconds: number) => Promise<void>;
  onStartRun: (mapName: string) => Promise<void>;
  onStopRun: () => Promise<void>;
  onResetCounterHistory: () => Promise<void>;
  onToggleCounterLock: (enabled: boolean) => Promise<void>;
  onToggleAutoCounter: (enabled: boolean) => Promise<void>;
}

function formatRunSeconds(seconds?: number): string {
  if (typeof seconds !== 'number' || Number.isNaN(seconds) || seconds <= 0) {
    return '--';
  }

  return `${seconds.toFixed(2)}s`;
}

function getDetectedStateLabel(state?: CounterDetectedState): string {
  switch (state) {
    case 'booting':
      return '监控启动中';
    case 'window-missing':
      return '未找到游戏窗口';
    case 'lobby':
      return '已识别大厅';
    case 'in-game':
      return '已识别游戏内';
    case 'in-game-menu':
      return '已识别游戏菜单';
    case 'route-marker':
      return '已命中 3C 地图名';
    case 'stopped':
      return '监控已停止';
    case 'unknown':
    default:
      return '等待识别';
  }
}

function getRouteSourceLabel(session: CounterSession | null): string {
  switch (session?.routeSource) {
    case 'template':
      return '截图模板';
    case 'history':
      return '历史推断';
    case 'manual':
      return '手动指定';
    case 'default':
    default:
      return '默认路线';
  }
}

function getFileName(filePath: string): string {
  const trimmed = filePath.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed.split(/[/\\]/).pop() ?? trimmed;
}

function getPrimaryStatus(
  session: CounterSession | null,
  activeRun: ActiveRun | null,
  autoCounterEnabled: boolean,
  sceneTemplatePath: string,
  setupGuideCompleted: boolean
): { title: string; detail: string; tone: 'success' | 'attention' | 'error' } {
  if (!sceneTemplatePath.trim()) {
    return {
      title: '先接入 3C 截图',
      detail: '选择一张只包含 3C 地图名的截图，自动计数才会按它起表。',
      tone: 'attention'
    };
  }

  if (activeRun) {
    return {
      title: '这一把正在计时',
      detail: '再次识别到 3C 地图名时，会自动结算上一把并开始下一把。',
      tone: 'success'
    };
  }

  if (autoCounterEnabled || session) {
    return {
      title: '自动计数已待命',
      detail: '现在只盯 3C 地图名，命中后才会开始或续表。',
      tone: 'success'
    };
  }

  if (!setupGuideCompleted) {
    return {
      title: '先把 3C 跑通',
      detail: '不用等全部初始化完成，接好截图后就可以先开自动。',
      tone: 'attention'
    };
  }

  return {
    title: '还没开始统计',
    detail: '点“开启自动”后，进游戏等 3C 地图名出现即可自动起表。',
    tone: 'attention'
  };
}

export function CounterPanel({
  counterSession,
  activeRun,
  autoCounterEnabled,
  counterLocked,
  counterRecognitionIntervalSeconds,
  counterSceneTemplatePath,
  defaultRouteName,
  activeDurationText,
  historyStats,
  recentRuns,
  busy,
  setupGuideCompleted,
  onPickCounterSceneTemplate,
  onSaveDefaultRouteName,
  onSaveCounterRecognitionInterval,
  onStartRun,
  onStopRun,
  onResetCounterHistory,
  onToggleCounterLock,
  onToggleAutoCounter
}: CounterPanelProps) {
  const [activeView, setActiveView] = useState<CounterView>('stats');
  const [routeNameInput, setRouteNameInput] = useState(defaultRouteName || '3C');
  const [intervalInput, setIntervalInput] = useState(String(counterRecognitionIntervalSeconds));

  useEffect(() => {
    setRouteNameInput(defaultRouteName || '3C');
  }, [defaultRouteName]);

  useEffect(() => {
    setIntervalInput(String(counterRecognitionIntervalSeconds));
  }, [counterRecognitionIntervalSeconds]);

  const trackedRouteName = (counterSession?.mapName || routeNameInput || '3C').trim() || '3C';
  const routeRuns = useMemo(() => {
    const matched = recentRuns.filter((run) => run.mapName === trackedRouteName);
    return (matched.length > 0 ? matched : recentRuns).slice(0, 5);
  }, [recentRuns, trackedRouteName]);

  const recentAverageSeconds = useMemo(() => {
    if (routeRuns.length === 0) {
      return 0;
    }

    return routeRuns.reduce((sum, run) => sum + run.durationSeconds, 0) / routeRuns.length;
  }, [routeRuns]);

  const fastestSeconds = useMemo(() => {
    if (routeRuns.length === 0) {
      return historyStats.fastestDurationSeconds;
    }

    return routeRuns.reduce(
      (fastest, run) => Math.min(fastest, run.durationSeconds),
      routeRuns[0].durationSeconds
    );
  }, [historyStats.fastestDurationSeconds, routeRuns]);

  const displayCount = (counterSession?.completedRuns ?? 0) + (activeRun ? 1 : 0);
  const latestFinishedRun = routeRuns[0];
  const lastDurationText = formatRunSeconds(
    counterSession?.lastRunDurationSeconds ?? latestFinishedRun?.durationSeconds
  );
  const recentAverageText = formatRunSeconds(recentAverageSeconds);
  const totalAverageText = formatRunSeconds(historyStats.averageDurationSeconds);
  const fastestText = formatRunSeconds(fastestSeconds);
  const currentDurationText = activeRun ? activeDurationText : '--';
  const templateReady = Boolean(counterSceneTemplatePath.trim());
  const status = getPrimaryStatus(
    counterSession,
    activeRun,
    autoCounterEnabled,
    counterSceneTemplatePath,
    setupGuideCompleted
  );

  async function handleSaveRouteName(event: FormEvent) {
    event.preventDefault();
    const normalized = routeNameInput.trim() || '3C';
    setRouteNameInput(normalized);
    await onSaveDefaultRouteName(normalized);
  }

  async function handleSaveInterval(event: FormEvent) {
    event.preventDefault();
    const parsed = Number.parseFloat(intervalInput);
    const normalized = Number.isFinite(parsed)
      ? Math.min(15, Math.max(1, Math.round(parsed)))
      : counterRecognitionIntervalSeconds;
    setIntervalInput(String(normalized));
    await onSaveCounterRecognitionInterval(normalized);
  }

  async function handlePrimaryAction() {
    if (!templateReady) {
      setActiveView('settings');
      return;
    }

    if (autoCounterEnabled) {
      await onToggleAutoCounter(false);
      return;
    }

    await onSaveDefaultRouteName(trackedRouteName);
    await onToggleAutoCounter(true);
  }

  async function handleManualAction() {
    if (activeRun || counterSession) {
      await onStopRun();
      return;
    }

    await onStartRun(trackedRouteName);
  }

  const primaryButtonLabel = !templateReady
    ? '先接截图'
    : autoCounterEnabled
      ? '关闭自动'
      : '开启自动';
  const manualButtonLabel = activeRun || counterSession ? '结束本轮' : '手动开始';
  const statusClassName = `counter-mini-status tone-${status.tone}`;

  return (
    <section className="counter-mini-shell">
      <header className="counter-mini-header">
        <div>
          <p className="counter-mini-brand">3C COUNTER</p>
          <h2>3C 自动计数</h2>
        </div>
        <div className="counter-mini-tab-row">
          <button
            className={activeView === 'stats' ? 'is-active' : ''}
            onClick={() => setActiveView('stats')}
            type="button"
          >
            面板
          </button>
          <button
            className={activeView === 'settings' ? 'is-active' : ''}
            onClick={() => setActiveView('settings')}
            type="button"
          >
            设置
          </button>
        </div>
      </header>

      {activeView === 'stats' ? (
        <div className="counter-mini-panel">
          <div className={statusClassName}>
            <strong>{status.title}</strong>
            <p>{status.detail}</p>
          </div>

          <div className="counter-mini-scene">
            <span>当前路线</span>
            <strong>{trackedRouteName}</strong>
          </div>

          <div className="counter-mini-count">{displayCount}</div>
          <p className="counter-mini-count-label">已记录场次</p>

          <div className="counter-mini-metrics">
            <div>
              <span>本把计时</span>
              <strong>{currentDurationText}</strong>
            </div>
            <div>
              <span>上把用时</span>
              <strong>{lastDurationText}</strong>
            </div>
            <div>
              <span>最近 5 把</span>
              <strong>{recentAverageText}</strong>
            </div>
            <div>
              <span>总平均</span>
              <strong>{totalAverageText}</strong>
            </div>
            <div>
              <span>最快一把</span>
              <strong>{fastestText}</strong>
            </div>
            <div>
              <span>识别状态</span>
              <strong>{getDetectedStateLabel(counterSession?.lastDetectedState)}</strong>
            </div>
          </div>

          <div className="counter-mini-meta">
            <span>路线来源：{getRouteSourceLabel(counterSession)}</span>
            <span>模板：{templateReady ? getFileName(counterSceneTemplatePath) : '未接入'}</span>
          </div>

          <div className="counter-mini-run-list">
            {routeRuns.length === 0 ? (
              <p className="counter-mini-empty">还没有已完成记录，先跑一把 3C 看看。</p>
            ) : (
              routeRuns.map((run, index) => {
                const runNumber = Math.max(
                  1,
                  (counterSession?.completedRuns ?? routeRuns.length) - index
                );

                return (
                  <div className="counter-mini-run-item" key={run.id}>
                    <span>第 {runNumber} 把</span>
                    <strong>{formatRunSeconds(run.durationSeconds)}</strong>
                    <em>{formatCompactDateTime(run.endedAt)}</em>
                  </div>
                );
              })
            )}
          </div>

          <div className="counter-mini-actions">
            <button
              className="counter-mini-primary"
              disabled={busy}
              onClick={() => void handlePrimaryAction()}
              type="button"
            >
              {busy ? '处理中...' : primaryButtonLabel}
            </button>
            <button
              className="counter-mini-secondary"
              disabled={busy}
              onClick={() => void handleManualAction()}
              type="button"
            >
              {busy ? '处理中...' : manualButtonLabel}
            </button>
            <button
              className="counter-mini-secondary"
              disabled={busy}
              onClick={() => void onResetCounterHistory()}
              type="button"
            >
              清空记录
            </button>
          </div>
        </div>
      ) : (
        <div className="counter-mini-panel">
          <div className="counter-mini-config-block">
            <span className="counter-config-label">默认路线</span>
            <form
              className="counter-mini-inline-form counter-mini-inline-form-two"
              onSubmit={handleSaveRouteName}
            >
              <input
                disabled={busy}
                onChange={(event) => setRouteNameInput(event.target.value)}
                placeholder="例如 3C"
                value={routeNameInput}
              />
              <button className="counter-mini-secondary" disabled={busy} type="submit">
                保存
              </button>
            </form>
          </div>

          <div className="counter-mini-config-block">
            <span className="counter-config-label">3C 截图模板</span>
            <div className="counter-mini-template-box">
              <strong>{templateReady ? getFileName(counterSceneTemplatePath) : '还没选择截图'}</strong>
              <p>推荐只保留地图名字样，画面越干净越容易命中。</p>
            </div>
            <button
              className="counter-mini-primary"
              disabled={busy}
              onClick={() => void onPickCounterSceneTemplate()}
              type="button"
            >
              选择截图
            </button>
          </div>

          <div className="counter-mini-config-block">
            <span className="counter-config-label">识别间隔</span>
            <form className="counter-mini-inline-form" onSubmit={handleSaveInterval}>
              <input
                disabled={busy}
                inputMode="numeric"
                onChange={(event) => setIntervalInput(event.target.value)}
                value={intervalInput}
              />
              <span className="counter-mini-unit">秒</span>
              <button className="counter-mini-secondary" disabled={busy} type="submit">
                保存
              </button>
            </form>
          </div>

          <div className="counter-mini-config-grid">
            <button
              className={counterLocked ? 'counter-mini-primary' : 'counter-mini-secondary'}
              disabled={busy}
              onClick={() => void onToggleCounterLock(!counterLocked)}
              type="button"
            >
              {counterLocked ? '已锁定面板' : '锁定计数器'}
            </button>
            <button
              className={autoCounterEnabled ? 'counter-mini-primary' : 'counter-mini-secondary'}
              disabled={busy || !templateReady}
              onClick={() => void onToggleAutoCounter(!autoCounterEnabled)}
              type="button"
            >
              {autoCounterEnabled ? '自动已开启' : '开启自动'}
            </button>
          </div>

          <div className="counter-mini-footnote">
            <p>当前识别：{getDetectedStateLabel(counterSession?.lastDetectedState)}</p>
            <p>{counterSession?.lastDetail?.trim() || '还没有新的识别记录。'}</p>
          </div>
        </div>
      )}
    </section>
  );
}
