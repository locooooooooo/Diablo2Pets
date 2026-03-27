import {
  useEffect,
  useMemo,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type FormEvent
} from 'react';
import { formatCompactDateTime } from '../lib/date';
import {
  buildDropHotspots,
  buildDropReportJson,
  buildDropReportMarkdown
} from '../lib/dropExports';
import {
  buildDailyDropSummary,
  buildDailySummaryLine,
  classifyDropRecord,
  getCategoryOptions,
  getDropCategoryLabel,
  prepareDropRecords,
  type DropCategory,
  type PreparedDropRecord
} from '../lib/dropReport';
import type {
  DropOcrResult,
  DropRecord,
  ExportTextFileInput,
  ExportTextFileResult
} from '../types';

interface DropPanelProps {
  drops: DropRecord[];
  todayKey: string;
  busy: boolean;
  onCreateDrop: (payload: {
    itemName: string;
    mapName: string;
    note: string;
    screenshotPath?: string;
    imageDataUrl?: string;
    ocrText?: string;
    ocrEngine?: string;
    ocrItemName?: string;
  }) => Promise<void>;
  onExportText: (payload: ExportTextFileInput) => Promise<ExportTextFileResult>;
  onPreviewOcr: (payload: {
    dataUrl: string;
    suggestedName: string;
  }) => Promise<DropOcrResult>;
  onOpenPath: (targetPath: string) => Promise<void>;
}

type CategoryFilter = 'all' | DropCategory;

function getRecentDayKeys(todayKey: string, count: number): string[] {
  const [year, month, day] = todayKey.split('-').map(Number);
  const baseDate = new Date(year, (month ?? 1) - 1, day ?? 1);

  return Array.from({ length: count }, (_item, index) => {
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() - index);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    const nextDay = String(nextDate.getDate()).padStart(2, '0');
    return `${nextYear}-${nextMonth}-${nextDay}`;
  });
}

function getMonthKey(dayKey: string): string {
  return dayKey.slice(0, 7);
}

function readImageDataFromItems(items: DataTransferItemList): Promise<string | null> {
  const imageItem = Array.from(items).find((item) => item.type.startsWith('image/'));
  const imageFile = imageItem?.getAsFile();

  if (!imageFile) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('截图读取失败，请重新截图后再试。'));
    reader.readAsDataURL(imageFile);
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return '发生了未知错误。';
}

function categoryMatches(categoryFilter: CategoryFilter, category: DropCategory): boolean {
  return categoryFilter === 'all' || categoryFilter === category;
}

export function DropPanel(props: DropPanelProps) {
  const [itemName, setItemName] = useState('');
  const [mapName, setMapName] = useState('');
  const [note, setNote] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [preparedScreenshotPath, setPreparedScreenshotPath] = useState('');
  const [ocrResult, setOcrResult] = useState<DropOcrResult | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [pasteHint, setPasteHint] = useState(
    '截图后直接按 Ctrl+V，我会自动保存图片、跑 OCR，并帮你预填一条掉落记录。'
  );
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [mapFilter, setMapFilter] = useState('all');
  const [highlightOnly, setHighlightOnly] = useState(false);
  const [exportBusyKey, setExportBusyKey] = useState('');
  const [exportNote, setExportNote] = useState(
    '周报会导出最近 7 天，月报会导出当前自然月，适合直接归档或发给队友。'
  );

  const preparedDrops = useMemo(() => prepareDropRecords(props.drops), [props.drops]);
  const todayDrops = useMemo(
    () => preparedDrops.filter((drop) => drop.dayKey === props.todayKey),
    [preparedDrops, props.todayKey]
  );
  const weeklyDayKeys = useMemo(() => new Set(getRecentDayKeys(props.todayKey, 7)), [props.todayKey]);
  const monthKey = useMemo(() => getMonthKey(props.todayKey), [props.todayKey]);
  const weeklyDrops = useMemo(
    () => preparedDrops.filter((drop) => weeklyDayKeys.has(drop.dayKey)),
    [preparedDrops, weeklyDayKeys]
  );
  const monthlyDrops = useMemo(
    () => preparedDrops.filter((drop) => drop.dayKey.startsWith(monthKey)),
    [monthKey, preparedDrops]
  );
  const dailySummary = useMemo(() => buildDailyDropSummary(todayDrops), [todayDrops]);
  const weeklySummary = useMemo(() => buildDailyDropSummary(weeklyDrops), [weeklyDrops]);
  const monthlySummary = useMemo(() => buildDailyDropSummary(monthlyDrops), [monthlyDrops]);
  const weeklyHotspots = useMemo(() => buildDropHotspots(weeklyDrops), [weeklyDrops]);
  const monthlyHotspots = useMemo(() => buildDropHotspots(monthlyDrops), [monthlyDrops]);
  const categoryOptions = useMemo(() => getCategoryOptions(todayDrops), [todayDrops]);
  const mapOptions = useMemo(() => {
    return Array.from(
      new Set(
        todayDrops
          .map((drop) => drop.mapName.trim())
          .filter((value) => value.length > 0)
      )
    ).sort((left, right) => left.localeCompare(right, 'zh-CN'));
  }, [todayDrops]);

  const filteredDrops = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return todayDrops.filter((drop) => {
      const fullText = `${drop.itemName} ${drop.mapName} ${drop.note} ${drop.ocrText ?? ''}`.toLowerCase();
      return (
        (!keyword || fullText.includes(keyword)) &&
        categoryMatches(categoryFilter, drop.category) &&
        (mapFilter === 'all' || drop.mapName === mapFilter) &&
        (!highlightOnly || drop.highlighted)
      );
    });
  }, [categoryFilter, highlightOnly, mapFilter, todayDrops, searchText]);

  const groupedDrops = useMemo(() => {
    const order: DropCategory[] = [
      'rune',
      'gem',
      'charm',
      'jewel',
      'key',
      'base',
      'equipment',
      'other'
    ];

    return order
      .map((category) => ({
        category,
        items: filteredDrops.filter((drop) => drop.category === category)
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredDrops]);

  const currentCategory = useMemo(() => {
    return classifyDropRecord({
      itemName: itemName || ocrResult?.suggestedItemName || '',
      note,
      ocrText: ocrResult?.text
    });
  }, [itemName, note, ocrResult]);
  const canAdoptSuggestedItem =
    Boolean(ocrResult?.suggestedItemName) && itemName !== (ocrResult?.suggestedItemName ?? '');
  const canAdoptSuggestedNote =
    Boolean(ocrResult?.suggestedNote) && note !== (ocrResult?.suggestedNote ?? '');

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      if (!event.clipboardData) {
        return;
      }

      const hasImage = Array.from(event.clipboardData.items).some((item) =>
        item.type.startsWith('image/')
      );
      if (!hasImage) {
        return;
      }

      event.preventDefault();
      void readImageDataFromItems(event.clipboardData.items)
        .then((value) => {
          if (!value) {
            return;
          }

          return applyPastedImage(value);
        })
        .catch((error) => {
          setPasteHint(getErrorMessage(error));
        });
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [itemName, note, ocrResult]);

  function resetDraft() {
    setItemName('');
    setMapName('');
    setNote('');
    setImageDataUrl('');
    setPreparedScreenshotPath('');
    setOcrResult(null);
    setOcrBusy(false);
    setPasteHint('截图后直接按 Ctrl+V，我会自动保存图片、跑 OCR，并帮你预填一条掉落记录。');
  }

  async function runOcrForImage(dataUrl: string) {
    setOcrBusy(true);
    setPasteHint('截图已收到，正在进行 OCR 识别和战利品预判...');

    try {
      const result = await props.onPreviewOcr({
        dataUrl,
        suggestedName: itemName.trim() || 'drop-ocr'
      });

      setPreparedScreenshotPath(result.imagePath);
      setOcrResult(result);

      if (result.suggestedItemName && !itemName.trim()) {
        setItemName(result.suggestedItemName);
      }

      if (result.suggestedNote && !note.trim()) {
        setNote(result.suggestedNote);
      }

      if (result.success) {
        setPasteHint(
          result.warning
            ? `截图已保存，OCR 已完成：${result.warning}`
            : '截图已保存，OCR 已完成，结果已经回填到记录表单。'
        );
      } else {
        setPasteHint(result.warning || '截图已保存，但当前环境没有可用的 OCR 引擎。');
      }
    } catch (error) {
      setPasteHint(`截图已收到，但 OCR 失败：${getErrorMessage(error)}`);
    } finally {
      setOcrBusy(false);
    }
  }

  async function applyPastedImage(dataUrl: string) {
    setImageDataUrl(dataUrl);
    await runOcrForImage(dataUrl);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const finalItemName = itemName.trim() || ocrResult?.suggestedItemName || '';
    const finalNote = note.trim() || ocrResult?.suggestedNote || '';

    if (!finalItemName) {
      setPasteHint('请先填写物品名称，或先贴一张掉落截图。');
      return;
    }

    await props.onCreateDrop({
      itemName: finalItemName,
      mapName,
      note: finalNote,
      screenshotPath: preparedScreenshotPath || undefined,
      imageDataUrl: preparedScreenshotPath ? undefined : imageDataUrl || undefined,
      ocrText: ocrResult?.text || undefined,
      ocrEngine: ocrResult?.engine || undefined,
      ocrItemName: ocrResult?.suggestedItemName || undefined
    });

    resetDraft();
  }

  async function handlePasteZone(event: ReactClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    try {
      const value = await readImageDataFromItems(event.clipboardData.items);
      if (!value) {
        return;
      }
      await applyPastedImage(value);
    } catch (error) {
      setPasteHint(getErrorMessage(error));
    }
  }

  function clearFilters() {
    setSearchText('');
    setCategoryFilter('all');
    setMapFilter('all');
    setHighlightOnly(false);
  }

  function applySuggestedItem() {
    if (ocrResult?.suggestedItemName) {
      setItemName(ocrResult.suggestedItemName);
    }
  }

  function applySuggestedNote() {
    if (ocrResult?.suggestedNote) {
      setNote(ocrResult.suggestedNote);
    }
  }

  async function exportReport(
    mode: 'weekly-markdown' | 'monthly-markdown' | 'monthly-json'
  ) {
    const isWeekly = mode === 'weekly-markdown';
    const isJson = mode === 'monthly-json';
    const title = isWeekly ? '暗黑 2 桌宠助手周报' : '暗黑 2 桌宠助手月报';
    const items = isWeekly ? weeklyDrops : monthlyDrops;
    const summary = isWeekly ? weeklySummary : monthlySummary;
    const hotspots = isWeekly ? weeklyHotspots : monthlyHotspots;
    const weeklyDayRange = getRecentDayKeys(props.todayKey, 7);
    const periodLabel = isWeekly
      ? `${weeklyDayRange[weeklyDayRange.length - 1]} 至 ${props.todayKey}`
      : `${monthKey} 月`;

    setExportBusyKey(mode);
    setExportNote(
      isWeekly ? '正在整理最近 7 天的战报...' : '正在整理本月战报，明细会一并带出去。'
    );

    try {
      const content = isJson
        ? buildDropReportJson({
            title,
            periodLabel,
            generatedAt: new Date().toISOString(),
            items,
            summary,
            hotspots
          })
        : buildDropReportMarkdown({
            title,
            periodLabel,
            generatedAt: new Date().toISOString(),
            items,
            summary,
            hotspots
          });

      const result = await props.onExportText({
        suggestedName: isWeekly
          ? `d2-weekly-report-${props.todayKey}`
          : `d2-monthly-report-${monthKey}`,
        defaultExtension: isJson ? 'json' : 'md',
        content
      });

      if (result.canceled) {
        setExportNote('这次取消了导出，报表内容还在这里，随时可以再导一次。');
      } else {
        setExportNote(
          isWeekly
            ? '周报已经导出完成，可以直接发给队友或留档。'
            : isJson
              ? '本月 JSON 已导出，适合后续统计或二次分析。'
              : '月报已经导出完成，适合做本月复盘。'
        );
      }
    } catch (error) {
      setExportNote(`导出失败：${getErrorMessage(error)}`);
    } finally {
      setExportBusyKey('');
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Drops</p>
          <h3>战利品账本</h3>
        </div>
        <span className="status-pill">
          {ocrBusy ? 'OCR 识别中' : dailySummary.totalCount > 0 ? `今日 ${dailySummary.totalCount} 条记录` : '等待第一条战果'}
        </span>
      </div>

      <div className="report-hero">
        <article className="card hero-card">
          <div className="integration-head">
            <div>
              <div className="card-title">今日战报</div>
              <p className="secondary-text">{buildDailySummaryLine(dailySummary)}</p>
            </div>
            <span className="status-chip">
              {dailySummary.highlightedCount > 0
                ? `高亮 ${dailySummary.highlightedCount} 条`
                : '等待第一条高亮'}
            </span>
          </div>

          <div className="metric-grid">
            <article className="metric-card">
              <span>今日掉落</span>
              <strong>{dailySummary.totalCount}</strong>
            </article>
            <article className="metric-card">
              <span>覆盖场景</span>
              <strong>{dailySummary.mapCount}</strong>
            </article>
            <article className="metric-card">
              <span>高亮条目</span>
              <strong>{dailySummary.highlightedCount}</strong>
            </article>
          </div>

          <div className="report-summary-grid">
            <article className="report-summary-card">
              <div className="card-title small">类别分布</div>
              <div className="tag-row">
                {categoryOptions.length === 0 ? (
                  <span className="secondary-text">还没有足够的掉落记录来形成分布。</span>
                ) : (
                  categoryOptions.map((category) => (
                    <span className="status-pill" key={category}>
                      {getDropCategoryLabel(category)} {dailySummary.categoryCounts[category]}
                    </span>
                  ))
                )}
              </div>
            </article>

            <article className="report-summary-card">
              <div className="card-title small">高亮速记</div>
              {dailySummary.highlights.length === 0 ? (
                <div className="empty-state compact-empty">
                  <strong>还没有高亮战利品</strong>
                  <p>掉到高符、精品底材或重点物品后，这里会优先展示。</p>
                </div>
              ) : (
                <div className="stack compact">
                  {dailySummary.highlights.map((drop) => (
                    <div className="highlight-row" key={drop.id}>
                      <strong>{drop.itemName}</strong>
                      <span>
                        {getDropCategoryLabel(drop.category)}
                        {drop.mapName ? ` · ${drop.mapName}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>

          <div className="report-pulse">
            <span className="mini-pill">
              主类目：
              {dailySummary.topCategory
                ? `${getDropCategoryLabel(dailySummary.topCategory)} ${dailySummary.topCategoryCount} 件`
                : '尚未形成'}
            </span>
            <span className="mini-pill">
              最新高亮：
              {dailySummary.highlights[0]?.itemName ?? '等待下一件重点掉落'}
            </span>
          </div>

          <div className="report-trend-grid">
            <article className="report-summary-card">
              <div className="card-title small">近 7 日博览</div>
              <div className="stack compact">
                <div className="summary-row compact">
                  <span>总掉落</span>
                  <strong>{weeklySummary.totalCount || 0} 条</strong>
                </div>
                <div className="summary-row compact">
                  <span>高亮数</span>
                  <strong>{weeklySummary.highlightedCount || 0} 条</strong>
                </div>
                <div className="summary-row compact">
                  <span>覆盖场景</span>
                  <strong>{weeklySummary.mapCount || 0} 个</strong>
                </div>
              </div>
            </article>

            <article className="report-summary-card">
              <div className="card-title small">场景热区榜</div>
              {weeklyHotspots.length === 0 ? (
                <div className="empty-state compact-empty">
                  <strong>近 7 日还没有场景热区</strong>
                  <p>继续记录几轮掉落后，这里会显示你最近最热的地图。</p>
                </div>
              ) : (
                <div className="stack compact">
                  {weeklyHotspots.map((spot, index) => (
                    <div className="highlight-row" key={spot.mapName}>
                      <strong>
                        {index + 1}. {spot.mapName}
                      </strong>
                      <span>
                        {spot.totalCount} 条掉落
                        {spot.highlightedCount > 0 ? ` · 高亮 ${spot.highlightedCount}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="report-summary-card report-export-card">
              <div className="card-title small">本月归档</div>
              <div className="stack compact">
                <div className="summary-row compact">
                  <span>本月掉落</span>
                  <strong>{monthlySummary.totalCount || 0} 条</strong>
                </div>
                <div className="summary-row compact">
                  <span>本月高亮</span>
                  <strong>{monthlySummary.highlightedCount || 0} 条</strong>
                </div>
                <div className="summary-row compact">
                  <span>主类目</span>
                  <strong>
                    {monthlySummary.topCategory
                      ? `${getDropCategoryLabel(monthlySummary.topCategory)} ${monthlySummary.topCategoryCount}`
                      : '尚未形成'}
                  </strong>
                </div>
              </div>
              <p className="helper-text">{exportNote}</p>
              <div className="inline-actions report-export-actions">
                <button
                  className="ghost-button"
                  disabled={exportBusyKey !== ''}
                  onClick={() => void exportReport('weekly-markdown')}
                  type="button"
                >
                  {exportBusyKey === 'weekly-markdown' ? '导出中...' : '导出周报'}
                </button>
                <button
                  className="ghost-button"
                  disabled={exportBusyKey !== ''}
                  onClick={() => void exportReport('monthly-markdown')}
                  type="button"
                >
                  {exportBusyKey === 'monthly-markdown' ? '导出中...' : '导出月报'}
                </button>
                <button
                  className="ghost-button"
                  disabled={exportBusyKey !== ''}
                  onClick={() => void exportReport('monthly-json')}
                  type="button"
                >
                  {exportBusyKey === 'monthly-json' ? '导出中...' : '导出 JSON'}
                </button>
              </div>
            </article>
          </div>
        </article>

        <form className="card hero-card" onSubmit={handleSubmit}>
          <div className="integration-head">
            <div>
              <div className="card-title">记录一条战利品</div>
              <p className="secondary-text">先贴图，再补场景和备注，这样最快。</p>
            </div>
            <span className="status-pill">当前分类建议：{getDropCategoryLabel(currentCategory)}</span>
          </div>

          <div className="tag-row">
            <span className="mini-pill">{ocrBusy ? 'OCR 识别中' : '可随时 Ctrl+V 粘贴截图'}</span>
            {preparedScreenshotPath ? <span className="mini-pill">截图已落盘</span> : null}
            {ocrResult?.engine ? <span className="mini-pill">OCR {ocrResult.engine}</span> : null}
          </div>

          <div className="split-grid">
            <label className="field">
              <span>物品名称</span>
              <input
                onChange={(event) => setItemName(event.target.value)}
                placeholder="例如：破隐法杖、乔丹之石、Ber"
                value={itemName}
              />
            </label>
            <label className="field">
              <span>掉落场景</span>
              <input
                onChange={(event) => setMapName(event.target.value)}
                placeholder="例如：巴尔、牛场、A4 超市"
                value={mapName}
              />
            </label>
          </div>

          <label className="field">
            <span>备注</span>
            <textarea
              onChange={(event) => setNote(event.target.value)}
              placeholder="可选：角色、MF、层数、孔数、无形、队伍信息等"
              rows={3}
              value={note}
            />
          </label>

          <div
            className={`paste-zone ${imageDataUrl ? 'ready' : ''}`}
            onPaste={handlePasteZone}
            tabIndex={0}
          >
            <div>
              <strong>截图粘贴区</strong>
              <p>{pasteHint}</p>
            </div>
            {imageDataUrl ? (
              <img alt="截图预览" className="paste-preview" src={imageDataUrl} />
            ) : (
              <span className="paste-empty">点这里后也可以直接 Ctrl+V 粘贴截图</span>
            )}
          </div>

          {ocrResult ? (
            <article className="card ocr-card">
              <div className="integration-head">
                <div>
                  <div className="card-title">OCR 识别结果</div>
                  <p className="secondary-text">
                    引擎：{ocrResult.engine || 'unknown'}
                    {ocrResult.warning ? ` · ${ocrResult.warning}` : ''}
                  </p>
                </div>
                {preparedScreenshotPath ? (
                  <button
                    className="text-button"
                    onClick={() => void props.onOpenPath(preparedScreenshotPath)}
                    type="button"
                  >
                    打开截图
                  </button>
                ) : null}
              </div>

              <div className="ocr-meta">
                <span className="status-pill">
                  建议物品：{ocrResult.suggestedItemName || '未识别'}
                </span>
                <span className="status-pill">文本行数：{ocrResult.lines.length}</span>
                <span className="status-pill">
                  建议分类：{getDropCategoryLabel(currentCategory)}
                </span>
              </div>

              <div className="ocr-actions">
                <button
                  className="ghost-button"
                  disabled={!canAdoptSuggestedItem}
                  onClick={applySuggestedItem}
                  type="button"
                >
                  采用建议物品
                </button>
                <button
                  className="ghost-button"
                  disabled={!canAdoptSuggestedNote}
                  onClick={applySuggestedNote}
                  type="button"
                >
                  采用建议备注
                </button>
                <button
                  className="ghost-button"
                  disabled={ocrBusy || !imageDataUrl}
                  onClick={() => void runOcrForImage(imageDataUrl)}
                  type="button"
                >
                  重新识别
                </button>
              </div>

              {ocrResult.suggestedNote ? (
                <p className="helper-text">建议备注：{ocrResult.suggestedNote}</p>
              ) : null}

              {ocrResult.text ? <pre className="ocr-preview">{ocrResult.text}</pre> : null}
            </article>
          ) : null}

          <div className="inline-actions">
            <button className="primary-button" disabled={props.busy || ocrBusy} type="submit">
              {props.busy ? '保存中...' : '保存战利品记录'}
            </button>
            <button className="ghost-button" onClick={resetDraft} type="button">
              清空草稿
            </button>
          </div>
        </form>
      </div>

      <article className="card">
        <div className="panel-header">
          <div>
            <div className="card-title">战报筛选</div>
            <p className="secondary-text">按关键词、类别、场景和高亮状态快速回看今天的战果。</p>
          </div>
          <span className="status-pill">当前结果 {filteredDrops.length}</span>
        </div>

        <div className="filter-grid">
          <label className="field">
            <span>关键词</span>
            <input
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="搜索物品名、备注或 OCR 文本"
              value={searchText}
            />
          </label>

          <label className="field">
            <span>类别</span>
            <select
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
              value={categoryFilter}
            >
              <option value="all">全部类别</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {getDropCategoryLabel(category)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>场景</span>
            <select onChange={(event) => setMapFilter(event.target.value)} value={mapFilter}>
              <option value="all">全部场景</option>
              {mapOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-actions">
          <label className="checkbox-row">
            <input
              checked={highlightOnly}
              onChange={(event) => setHighlightOnly(event.target.checked)}
              type="checkbox"
            />
            <span>只看高亮战利品</span>
          </label>
          <button className="text-button" onClick={clearFilters} type="button">
            清空筛选
          </button>
        </div>
      </article>

      <article className="card">
        <div className="card-title">今日战报明细</div>
        {groupedDrops.length === 0 ? (
          <div className="empty-state">
            <strong>当前筛选下还没有内容</strong>
            <p>你可以清空筛选，或者先贴一张截图开始记账。</p>
          </div>
        ) : (
          <div className="stack">
            {groupedDrops.map((group) => (
              <section className="report-group" key={group.category}>
                <div className="report-group-head">
                  <strong>{getDropCategoryLabel(group.category)}</strong>
                  <span>{group.items.length} 条</span>
                </div>

                <div className="list-card">
                  {group.items.map((drop) => (
                    <div className="list-row" key={drop.id}>
                      <div>
                        <div className="report-title-row">
                          <strong>{drop.itemName}</strong>
                          {drop.highlighted ? (
                            <span className="mini-pill mini-pill-highlight">高亮</span>
                          ) : null}
                        </div>
                        <span>
                          {drop.mapName || '未填写场景'} · {formatCompactDateTime(drop.createdAt)}
                        </span>
                        <div className="tag-row">
                          <span className="mini-pill">{getDropCategoryLabel(drop.category)}</span>
                          {drop.ocrEngine ? (
                            <span className="mini-pill">OCR {drop.ocrEngine}</span>
                          ) : null}
                          {drop.screenshotPath ? <span className="mini-pill">有截图</span> : null}
                        </div>
                        {drop.note ? (
                          <span className="secondary-text">{drop.note}</span>
                        ) : drop.ocrText ? (
                          <span className="secondary-text">{drop.ocrText}</span>
                        ) : null}
                      </div>
                      <div className="list-row-side">
                        {drop.screenshotPath ? (
                          <button
                            className="text-button"
                            onClick={() => void props.onOpenPath(drop.screenshotPath as string)}
                            type="button"
                          >
                            打开截图
                          </button>
                        ) : (
                          <span className="secondary-text">无截图</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
