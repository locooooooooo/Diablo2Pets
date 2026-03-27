import { useEffect, useState, type FormEvent } from 'react';
import { formatCompactDateTime, formatDuration } from '../lib/date';
import type { TodayStats } from '../lib/stats';
import type { ActiveRun, DropRecord, RunRecord } from '../types';

const routePresets = ['混沌避难所', '牛场', '巴尔', '古代通道', '恐怖地带'];

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
    return '今天还没有完成的刷图记录。';
  }

  return `${recentRuns[0].mapName} 路 ${formatDuration(recentRuns[0].durationSeconds)}`;
}

function getTopRouteText(stats: TodayStats): string {
  const topRoute = stats.mapBreakdown[0];
  if (!topRoute) {
    return '还没形成主刷路线';
  }

  return `${topRoute.mapName} · ${topRoute.count} 次`;
}

function getLatestDropText(recentDrops: DropRecord[]): string {
  const latestDrop = recentDrops[0];
  if (!latestDrop) {
    return '等你贴第一张战利品截图';
  }

  return latestDrop.mapName
    ? `${latestDrop.itemName} · ${latestDrop.mapName}`
    : latestDrop.itemName;
}

function getNextActionText(activeRun: ActiveRun | null, recentDrops: DropRecord[]): string {
  if (activeRun) {
    return '刷完这一轮就点结束，然后去战报贴图收口。';
  }

  if (recentDrops.length > 0) {
    return '今天已经有战果了，可以直接回工坊做下一步自动化。';
  }

  return '先开一轮，或者先去战报页贴一张截图把今天的账本立起来。';
}

export function CounterPanel(props: CounterPanelProps) {
  const [mapName, setMapName] = useState(props.activeRun?.mapName ?? '混沌避难所');
  const hasRuns = props.recentRuns.length > 0;
  const hasDrops = props.recentDrops.length > 0;
  const topRouteText = getTopRouteText(props.stats);
  const latestDropText = getLatestDropText(props.recentDrops);
  const nextActionText = getNextActionText(props.activeRun, props.recentDrops);

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
          <span className="status-pill warm">陪刷中 · {props.activeDurationText}</span>
        ) : (
          <span className="status-pill">待命中</span>
        )}
      </div>

      <div className="companion-hero">
        <article className="card hero-card hero-banner">
          <div className="integration-head">
            <div>
              <div className="card-title">当前狩猎状态</div>
              <p className="secondary-text">
                在这里开始或收口一轮刷图，再把掉落和自动化分流到后续页面。
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
                placeholder="例如：世界之石、混沌避难所、牛场"
                value={mapName}
              />
            </label>

            <div className="preset-strip">
              <span className="preset-label">常用路线</span>
              <div className="tag-row">
                {routePresets.map((preset) => (
                  <button
                    className={mapName === preset ? 'preset-button active' : 'preset-button'}
                    disabled={Boolean(props.activeRun)}
                    key={preset}
                    onClick={() => setMapName(preset)}
                    type="button"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="inline-actions">
              <button className="primary-button" disabled={props.busy} type="submit">
                {props.busy
                  ? props.activeRun
                    ? '正在结算...'
                    : '正在开始...'
                  : props.activeRun
                    ? '完成本次刷图'
                    : '开始记录本次刷图'}
              </button>
              <button className="ghost-button" onClick={props.onGoToDrops} type="button">
                去记掉落
              </button>
              <button className="ghost-button" onClick={props.onGoToWorkshop} type="button">
                打开工坊
              </button>
            </div>
          </form>

          <div className="summary-list">
            <div className="summary-row">
              <span>桌宠定位</span>
              <strong>先陪你刷，再替你记，再帮你跑自动化。</strong>
            </div>
            <div className="summary-row">
              <span>当前建议</span>
              <strong>
                {props.activeRun
                  ? '刷完就点结束，然后去战报贴图保存战果。'
                  : '先开始一轮，让桌宠先把节奏和耗时记起来。'}
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

      <div className="insight-grid">
        <article className="insight-card">
          <span className="eyebrow">Route Pulse</span>
          <strong>{topRouteText}</strong>
          <p>
            {props.stats.mapBreakdown[0]
              ? `平均 ${formatDuration(props.stats.mapBreakdown[0].averageDurationSeconds)}`
              : '等你完成第一轮后自动生成节奏画像'}
          </p>
        </article>
        <article className="insight-card">
          <span className="eyebrow">Latest Loot</span>
          <strong>{latestDropText}</strong>
          <p>{hasDrops ? '最近战利品会优先在首页抬头。' : '战报页贴图后，这里会变成今天的热区。'}</p>
        </article>
        <article className="insight-card">
          <span className="eyebrow">Next Step</span>
          <strong>{props.activeRun ? '先收口，再记账' : '让桌宠先开跑'}</strong>
          <p>{nextActionText}</p>
        </article>
      </div>

      <div className="quick-grid">
        <article className="action-tile">
          <span className="eyebrow">Quick Flow</span>
          <strong>战利品账本</strong>
          <p>截图、OCR、备注和保存都在一页完成，适合刷图结束后立刻收口。</p>
          <button className="text-button" onClick={props.onGoToDrops} type="button">
            现在去记一条
          </button>
        </article>

        <article className="action-tile">
          <span className="eyebrow">Workshop</span>
          <strong>赫拉迪姆工坊</strong>
          <p>符文、宝石、金币三条任务线集中管理，适合试运行和联调。</p>
          <button className="text-button" onClick={props.onGoToWorkshop} type="button">
            进入工坊
          </button>
        </article>
      </div>

      <div className="split-grid">
        <article className="card">
          <div className="card-title">地图分布</div>
          {props.stats.mapBreakdown.length === 0 ? (
            <div className="empty-state">
              <strong>今天还没有地图统计</strong>
              <p>开始第一轮刷图后，这里会显示各个场景的次数和平均耗时。</p>
            </div>
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
          {!hasRuns ? (
            <div className="empty-state">
              <strong>还没有最近刷图数据</strong>
              <p>完成一次刷图后，这里会显示最近几轮的路线和完成时间。</p>
            </div>
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
        <div className="panel-header">
          <div>
            <div className="card-title">今日战果预览</div>
            <p className="secondary-text">最近的掉落会先在这里出现，再决定是否去战报页继续整理。</p>
          </div>
          <span className="status-pill">
            {hasDrops ? `${props.recentDrops.length} 条战果` : '等待第一条掉落'}
          </span>
        </div>

        {!hasDrops ? (
          <div className="empty-state">
            <strong>战果区还是空的</strong>
            <p>去战报页贴一张截图，桌宠就能帮你开始记账。</p>
          </div>
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
