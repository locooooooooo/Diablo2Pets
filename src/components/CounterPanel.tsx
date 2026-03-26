import { useEffect, useState, type FormEvent } from 'react';
import { formatCompactDateTime, formatDuration } from '../lib/date';
import type { TodayStats } from '../lib/stats';
import type { ActiveRun, DropRecord, RunRecord } from '../types';

interface CounterPanelProps {
  activeRun: ActiveRun | null;
  activeDurationText: string;
  stats: TodayStats;
  recentRuns: RunRecord[];
  recentDrops: DropRecord[];
  busy: boolean;
  onStartRun: (mapName: string) => Promise<void>;
  onStopRun: () => Promise<void>;
  onGoToDrops: () => void;
  onGoToWorkshop: () => void;
}

function getLatestRunText(recentRuns: RunRecord[]): string {
  if (recentRuns.length === 0) {
    return '今天还没有完成的刷图记录';
  }

  return `${recentRuns[0].mapName} · ${formatDuration(recentRuns[0].durationSeconds)}`;
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

    await props.onStartRun(mapName.trim() || '未命名路线');
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Companion</p>
          <h3>陪刷首页</h3>
        </div>
        {props.activeRun ? (
          <span className="status-pill warm">正在陪你刷图 · {props.activeDurationText}</span>
        ) : (
          <span className="status-pill">待命中</span>
        )}
      </div>

      <div className="companion-hero">
        <article className="card hero-card">
          <div className="integration-head">
            <div>
              <div className="card-title">当前狩猎状态</div>
              <p className="secondary-text">
                桌宠首页优先承接开始、结束、切页和节奏反馈。
              </p>
            </div>
            <span className="status-chip">
              {props.activeRun ? `进行中：${props.activeRun.mapName}` : '准备下一轮'}
            </span>
          </div>

          <form className="stack compact" onSubmit={handleSubmit}>
            <label className="field">
              <span>地图 / 场景</span>
              <input
                disabled={Boolean(props.activeRun)}
                onChange={(event) => setMapName(event.target.value)}
                placeholder="例如：世界之石要塞 / 混沌避难所 / 牛场"
                value={mapName}
              />
            </label>

            <div className="inline-actions">
              <button className="primary-button" disabled={props.busy} type="submit">
                {props.activeRun ? '完成本次刷图' : '开始记录本次刷图'}
              </button>
              <button
                className="ghost-button"
                onClick={props.onGoToDrops}
                type="button"
              >
                去记掉落
              </button>
              <button
                className="ghost-button"
                onClick={props.onGoToWorkshop}
                type="button"
              >
                打开工坊
              </button>
            </div>
          </form>

          <div className="summary-list">
            <div className="summary-row">
              <span>桌宠定位</span>
              <strong>陪刷伙伴优先，记录和自动化退到第二层</strong>
            </div>
            <div className="summary-row">
              <span>当前建议</span>
              <strong>
                {props.activeRun
                  ? '刷图结束后在这里一键收口，再去掉落页补战利品'
                  : '先开始一轮，再让桌宠帮你累计节奏和战果'}
              </strong>
            </div>
          </div>
        </article>

        <article className="card hero-card warm-card">
          <div className="card-title">今日战况</div>
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

          <div className="summary-list">
            <div className="summary-row">
              <span>最近完成</span>
              <strong>{getLatestRunText(props.recentRuns)}</strong>
            </div>
            <div className="summary-row">
              <span>今日掉落</span>
              <strong>{props.recentDrops.length} 条记录</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="quick-grid">
        <article className="action-tile">
          <span className="eyebrow">Quick Flow</span>
          <strong>掉落账本</strong>
          <p>截图、OCR、备注都在一页完成，适合刷图结束立刻记账。</p>
          <button className="text-button" onClick={props.onGoToDrops} type="button">
            现在去记录
          </button>
        </article>

        <article className="action-tile">
          <span className="eyebrow">Workshop</span>
          <strong>赫拉迪姆工坊</strong>
          <p>符文、宝石和金币任务保留完整 profile 和日志闭环。</p>
          <button className="text-button" onClick={props.onGoToWorkshop} type="button">
            打开工坊
          </button>
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
          <div className="card-title">最近刷图</div>
          {props.recentRuns.length === 0 ? (
            <p className="empty-text">这里会显示你最近完成的刷图节奏。</p>
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

      <article className="card">
        <div className="card-title">今日战利品预览</div>
        {props.recentDrops.length === 0 ? (
          <p className="empty-text">掉落记录会在这里形成今天的战果预览。</p>
        ) : (
          <div className="list-card">
            {props.recentDrops.map((drop) => (
              <div className="list-row" key={drop.id}>
                <div>
                  <strong>{drop.itemName}</strong>
                  <span>{drop.mapName || '未填写场景'}</span>
                  {drop.note ? <span className="secondary-text">{drop.note}</span> : null}
                </div>
                <div className="list-row-side">
                  <span>{formatCompactDateTime(drop.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
