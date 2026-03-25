import { useEffect, useState, type FormEvent } from 'react';
import { formatCompactDateTime, formatDuration } from '../lib/date';
import type { TodayStats } from '../lib/stats';
import type { ActiveRun, RunRecord } from '../types';

interface CounterPanelProps {
  activeRun: ActiveRun | null;
  activeDurationText: string;
  stats: TodayStats;
  recentRuns: RunRecord[];
  busy: boolean;
  onStartRun: (mapName: string) => Promise<void>;
  onStopRun: () => Promise<void>;
}

export function CounterPanel(props: CounterPanelProps) {
  const [mapName, setMapName] = useState(props.activeRun?.mapName ?? '混沌避难所');

  useEffect(() => {
    if (props.activeRun) {
      setMapName(props.activeRun.mapName);
    }
  }, [props.activeRun]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (props.activeRun) {
      await props.onStopRun();
      return;
    }

    await props.onStartRun(mapName);
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Counter</p>
          <h3>刷图计数器</h3>
        </div>
        {props.activeRun ? (
          <span className="status-pill warm">进行中 {props.activeDurationText}</span>
        ) : (
          <span className="status-pill">今日待命</span>
        )}
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>地图 / 场景</span>
          <input
            disabled={Boolean(props.activeRun)}
            onChange={(event) => setMapName(event.target.value)}
            placeholder="例如：世界之石要塞 / 混沌避难所"
            value={mapName}
          />
        </label>

        <button className="primary-button" disabled={props.busy} type="submit">
          {props.activeRun ? '完成本次刷图' : '开始刷图'}
        </button>
      </form>

      <div className="metric-grid">
        <article className="metric-card">
          <span>今日次数</span>
          <strong>{props.stats.totalCount}</strong>
        </article>
        <article className="metric-card">
          <span>总耗时</span>
          <strong>{formatDuration(props.stats.totalDurationSeconds)}</strong>
        </article>
        <article className="metric-card">
          <span>平均单次</span>
          <strong>{formatDuration(props.stats.averageDurationSeconds)}</strong>
        </article>
      </div>

      <div className="split-grid">
        <article className="card">
          <div className="card-title">地图分布</div>
          {props.stats.mapBreakdown.length === 0 ? (
            <p className="empty-text">今天还没有刷图记录。</p>
          ) : (
            <div className="list-card">
              {props.stats.mapBreakdown.map((item) => (
                <div className="list-row" key={item.mapName}>
                  <div>
                    <strong>{item.mapName}</strong>
                    <span>{item.count} 次</span>
                  </div>
                  <div className="list-row-side">
                    <strong>{formatDuration(item.totalDurationSeconds)}</strong>
                    <span>均值 {formatDuration(item.averageDurationSeconds)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="card">
          <div className="card-title">最近记录</div>
          {props.recentRuns.length === 0 ? (
            <p className="empty-text">这里会显示你最近完成的刷图。</p>
          ) : (
            <div className="list-card">
              {props.recentRuns.map((run) => (
                <div className="list-row" key={run.id}>
                  <div>
                    <strong>{run.mapName}</strong>
                    <span>{formatCompactDateTime(run.endedAt)}</span>
                  </div>
                  <div className="list-row-side">
                    <strong>{formatDuration(run.durationSeconds)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
