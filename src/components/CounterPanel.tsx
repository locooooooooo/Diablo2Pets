import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { formatCompactDateTime, formatDuration } from '../lib/date';
import type { TodayStats } from '../lib/stats';
import type {
  ActiveRun,
  AutomationPreflightResponse,
  DropRecord,
  RunRecord
} from '../types';

const routePresets = ['混沌避难所', '牛场', '巴尔', '古代通道', '恐怖地带'];

interface CounterPanelProps {
  activeRun: ActiveRun | null;
  activeDurationText: string;
  stats: TodayStats;
  recentRuns: RunRecord[];
  recentDrops: DropRecord[];
  busy: boolean;
  preflight: AutomationPreflightResponse | null;
  preflightBusy: boolean;
  setupGuideCompleted: boolean;
  onStartRun: (mapName: string) => Promise<void>;
  onStopRun: () => Promise<void>;
  onGoToDrops: () => void;
  onGoToWorkshop: () => void;
  onOpenSetupGuide: () => void;
}

type CommandTone = 'success' | 'attention' | 'error';

interface ReadinessItem {
  label: string;
  ready: boolean;
  detail: string;
}

interface SuggestedAction {
  badge: string;
  title: string;
  detail: string;
  label: string;
  kind: 'primary' | 'secondary';
  onClick: () => void;
}

function getLatestRunText(recentRuns: RunRecord[]): string {
  if (recentRuns.length === 0) {
    return '今天还没有完成的刷图记录。';
  }

  return `${recentRuns[0].mapName} · ${formatDuration(recentRuns[0].durationSeconds)}`;
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

function buildReadiness(
  preflight: AutomationPreflightResponse | null,
  setupGuideCompleted: boolean,
  activeRun: ActiveRun | null,
  recentRuns: RunRecord[],
  recentDrops: DropRecord[]
): ReadinessItem[] {
  const tasks = preflight?.tasks ?? [];
  const allTasksReady = tasks.length > 0 && tasks.every((task) => task.status === 'ready');
  const environmentReady =
    (preflight?.globalChecks ?? []).some((check) => check.key === 'python-dependencies' && check.level === 'ok') &&
    (preflight?.globalChecks ?? []).some((check) => check.key === 'ocr-engine' && check.level === 'ok');

  return [
    {
      label: '引导',
      ready: setupGuideCompleted,
      detail: setupGuideCompleted ? '已收口' : '还没完成'
    },
    {
      label: '环境',
      ready: Boolean(environmentReady),
      detail: environmentReady ? '工坊可联调' : '还需补条件'
    },
    {
      label: '路线',
      ready: Boolean(activeRun || recentRuns.length > 0),
      detail: activeRun ? '正在进行' : recentRuns.length > 0 ? '已有最近路线' : '等待开第一轮'
    },
    {
      label: '战报',
      ready: recentDrops.length > 0,
      detail: recentDrops.length > 0 ? '今日已开账' : '等待首条掉落'
    },
    {
      label: '工坊',
      ready: allTasksReady,
      detail: allTasksReady ? '预检全绿' : tasks.length > 0 ? '还没全绿' : '等待预检'
    }
  ];
}

function getCommandTone(items: ReadinessItem[]): CommandTone {
  const readyCount = items.filter((item) => item.ready).length;
  if (readyCount >= 4) {
    return 'success';
  }

  if (readyCount >= 2) {
    return 'attention';
  }

  return 'error';
}

export function CounterPanel(props: CounterPanelProps) {
  const [mapName, setMapName] = useState(props.activeRun?.mapName ?? '混沌避难所');

  useEffect(() => {
    if (props.activeRun) {
      setMapName(props.activeRun.mapName);
    }
  }, [props.activeRun]);

  const readinessItems = useMemo(
    () =>
      buildReadiness(
        props.preflight,
        props.setupGuideCompleted,
        props.activeRun,
        props.recentRuns,
        props.recentDrops
      ),
    [
      props.activeRun,
      props.preflight,
      props.recentDrops,
      props.recentRuns,
      props.setupGuideCompleted
    ]
  );
  const readinessReadyCount = readinessItems.filter((item) => item.ready).length;
  const readinessTone = getCommandTone(readinessItems);
  const topRouteText = getTopRouteText(props.stats);
  const latestDropText = getLatestDropText(props.recentDrops);
  const latestRunText = getLatestRunText(props.recentRuns);
  const missingGuide = !props.setupGuideCompleted;
  const preflightTasks = props.preflight?.tasks ?? [];
  const blockingTask = preflightTasks.find((task) => task.status === 'error');
  const warningTask = preflightTasks.find((task) => task.status === 'warning');

  const suggestedAction = useMemo<SuggestedAction>(() => {
    if (props.activeRun) {
      return {
        badge: '当前动作',
        title: `正在刷 ${props.activeRun.mapName}`,
        detail: '这一轮结束后，建议立刻去战报页记录掉落并收口。',
        label: props.busy ? '结算中...' : '完成本轮刷图',
        kind: 'primary',
        onClick: () => void props.onStopRun()
      };
    }

    if (!props.setupGuideCompleted) {
      return {
        badge: '今日待办',
        title: '先把首启引导走完',
        detail: '引导会帮你把 runtime、依赖、profile 和悬浮形态收好，后面每天就能直接开刷。',
        label: '继续首启引导',
        kind: 'primary',
        onClick: props.onOpenSetupGuide
      };
    }

    if (blockingTask) {
      return {
        badge: '当前待办',
        title: '工坊还有阻塞项',
        detail: `${blockingTask.summary} 先补齐这条，再去执行自动化会更稳。`,
        label: '前往工坊补条件',
        kind: 'primary',
        onClick: props.onGoToWorkshop
      };
    }

    if (warningTask) {
      return {
        badge: '当前待办',
        title: '工坊还有提醒项',
        detail: `${warningTask.summary} 可以先看一眼，再决定是否直接开跑。`,
        label: '查看工坊预检',
        kind: 'secondary',
        onClick: props.onGoToWorkshop
      };
    }

    if (props.recentRuns.length > 0 && props.recentDrops.length === 0) {
      return {
        badge: '今日待办',
        title: '去开今天的战利品账本',
        detail: '今天已经有刷图节奏了，再记下第一条掉落，首页战报和趋势就会完整很多。',
        label: '去记录掉落',
        kind: 'primary',
        onClick: props.onGoToDrops
      };
    }

    if (props.recentRuns.length > 0) {
      const latestRoute = props.recentRuns[0].mapName;
      return {
        badge: '一键继续',
        title: `沿用 ${latestRoute} 再开一轮`,
        detail: '直接复用最近一次的路线开跑，最适合每天上线后的第一步。',
        label: props.busy ? '启动中...' : `继续 ${latestRoute}`,
        kind: 'primary',
        onClick: () => void props.onStartRun(latestRoute)
      };
    }

    return {
      badge: '一键开始',
      title: '开启今天的第一轮',
      detail: '路线还没跑起来，先从一张熟图开局，桌宠就能开始记录节奏和战果。',
      label: props.busy ? '启动中...' : `开始 ${mapName.trim() || '混沌避难所'}`,
      kind: 'primary',
      onClick: () => void props.onStartRun(mapName.trim() || '混沌避难所')
    };
  }, [
    blockingTask,
    mapName,
    props.activeRun,
    props.busy,
    props.onGoToDrops,
    props.onGoToWorkshop,
    props.onOpenSetupGuide,
    props.onStartRun,
    props.onStopRun,
    props.recentDrops.length,
    props.recentRuns,
    props.setupGuideCompleted,
    warningTask
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (props.activeRun) {
      await props.onStopRun();
      return;
    }

    await props.onStartRun(mapName.trim() || '混沌避难所');
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

      <div className="companion-command-grid">
        <article className={`card command-card command-card-${readinessTone}`}>
          <div className="integration-head">
            <div>
              <div className="card-title">今日就绪度</div>
              <p className="secondary-text">
                把引导、环境、路线、战报和工坊预检收在一眼就能看完的地方。
              </p>
            </div>
            <span className={`status-pill ${readinessTone}`}>
              {readinessReadyCount}/{readinessItems.length} 已就绪
            </span>
          </div>

          <div className="readiness-grid">
            {readinessItems.map((item) => (
              <article className={`readiness-item ${item.ready ? 'ready' : 'pending'}`} key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.ready ? '已就绪' : '待处理'}</span>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="card command-card command-card-action">
          <div className="integration-head">
            <div>
              <div className="card-title">当前待办</div>
              <p className="secondary-text">
                用桌宠帮你判断现在最值得做的那一步，而不是自己来回切页。
              </p>
            </div>
            <span className="status-chip">{suggestedAction.badge}</span>
          </div>

          <div className="command-focus">
            <strong>{suggestedAction.title}</strong>
            <p>{suggestedAction.detail}</p>
          </div>

          <div className="inline-actions">
            <button
              className={suggestedAction.kind === 'primary' ? 'primary-button' : 'ghost-button'}
              disabled={props.busy}
              onClick={suggestedAction.onClick}
              type="button"
            >
              {suggestedAction.label}
            </button>
            <button className="ghost-button" onClick={props.onGoToWorkshop} type="button">
              看工坊
            </button>
            <button className="ghost-button" onClick={props.onGoToDrops} type="button">
              看战报
            </button>
          </div>

          <div className="summary-list">
            <div className="summary-row">
              <span>最近路线</span>
              <strong>{latestRunText}</strong>
            </div>
            <div className="summary-row">
              <span>最近掉落</span>
              <strong>{latestDropText}</strong>
            </div>
            <div className="summary-row">
              <span>工坊状态</span>
              <strong>
                {props.preflightBusy
                  ? '正在更新预检'
                  : blockingTask
                    ? '还有阻塞项'
                    : warningTask
                      ? '还有提醒项'
                      : props.preflight
                        ? '预检稳定'
                        : '等待预检'}
              </strong>
            </div>
          </div>
        </article>
      </div>

      <div className="companion-hero">
        <article className="card hero-card hero-banner">
          <div className="integration-head">
            <div>
              <div className="card-title">当前狩猎状态</div>
              <p className="secondary-text">
                在这里开始或收口一轮刷图，然后把掉落和自动化分流到后续页面。
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
              <strong>先陪你刷，再替你记，最后帮你接上工坊自动化。</strong>
            </div>
            <div className="summary-row">
              <span>今日建议</span>
              <strong>
                {props.activeRun
                  ? '刷完就点完成，然后顺手去战报页把今天的掉落收口。'
                  : missingGuide
                    ? '先把首启引导补齐，后面每天上线就能直接开跑。'
                    : '可以直接沿用最近路线开跑，或者去工坊看今天的自动化预检。'}
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
              <strong>{latestRunText}</strong>
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
              : '等你完成第一轮后，桌宠会开始画出今天的路线节奏。'}
          </p>
        </article>
        <article className="insight-card">
          <span className="eyebrow">Latest Loot</span>
          <strong>{latestDropText}</strong>
          <p>
            {props.recentDrops.length > 0
              ? '最近战利品会优先挂在首页抬头，方便随手回看。'
              : '去战报页贴图后，这里就会变成今天的战果热区。'}
          </p>
        </article>
        <article className="insight-card">
          <span className="eyebrow">Next Step</span>
          <strong>{suggestedAction.title}</strong>
          <p>{suggestedAction.detail}</p>
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
          <p>符文、宝石、金币三条任务线集中管理，适合试运行、联调和查看日志。</p>
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
          {props.recentRuns.length === 0 ? (
            <div className="empty-state">
              <strong>还没有最近刷图数据</strong>
              <p>完成一轮后，这里会按时间显示最近几次路线和时长。</p>
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
            <p className="secondary-text">最近掉落会先在这里出现，再决定要不要去战报页继续整理。</p>
          </div>
          <span className="status-pill">
            {props.recentDrops.length > 0 ? `${props.recentDrops.length} 条战果` : '等待第一条掉落'}
          </span>
        </div>

        {props.recentDrops.length === 0 ? (
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
