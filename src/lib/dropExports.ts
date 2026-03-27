import { formatCompactDateTime, formatDateTime } from './date';
import {
  getDropCategoryLabel,
  type DailyDropSummary,
  type DropCategory,
  type PreparedDropRecord
} from './dropReport';
import type { VisualReportListItem, VisualReportPayload } from '../types';

export interface DropHotspot {
  mapName: string;
  totalCount: number;
  highlightedCount: number;
}

export interface DropExportPayload {
  title: string;
  periodLabel: string;
  generatedAt: string;
  items: PreparedDropRecord[];
  summary: DailyDropSummary;
  hotspots: DropHotspot[];
}

const categoryOrder: DropCategory[] = [
  'rune',
  'gem',
  'charm',
  'jewel',
  'key',
  'base',
  'equipment',
  'other'
];

export function buildDropHotspots(drops: PreparedDropRecord[]): DropHotspot[] {
  const mapCounts = new Map<string, { count: number; highlightedCount: number }>();

  for (const drop of drops) {
    const mapName = drop.mapName.trim() || '未填写场景';
    const current = mapCounts.get(mapName) ?? { count: 0, highlightedCount: 0 };
    current.count += 1;
    if (drop.highlighted) {
      current.highlightedCount += 1;
    }
    mapCounts.set(mapName, current);
  }

  return Array.from(mapCounts.entries())
    .map(([mapName, value]) => ({
      mapName,
      totalCount: value.count,
      highlightedCount: value.highlightedCount
    }))
    .sort((left, right) => {
      if (right.highlightedCount !== left.highlightedCount) {
        return right.highlightedCount - left.highlightedCount;
      }

      return right.totalCount - left.totalCount;
    })
    .slice(0, 5);
}

function formatNoteLine(drop: PreparedDropRecord): string {
  if (drop.note.trim()) {
    return drop.note.trim();
  }

  if (drop.ocrText?.trim()) {
    return `OCR：${drop.ocrText.trim()}`;
  }

  return '无备注';
}

function buildDropListItem(drop: PreparedDropRecord): VisualReportListItem {
  return {
    title: drop.itemName,
    meta: `${getDropCategoryLabel(drop.category)} · ${drop.mapName || '未填写场景'} · ${formatCompactDateTime(drop.createdAt)}`,
    detail: formatNoteLine(drop),
    highlighted: drop.highlighted
  };
}

function buildCategoryBreakdown(summary: DailyDropSummary): string[] {
  return categoryOrder
    .filter((category) => summary.categoryCounts[category] > 0)
    .map((category) => `- ${getDropCategoryLabel(category)}：${summary.categoryCounts[category]} 条`);
}

export function buildDropReportMarkdown(payload: DropExportPayload): string {
  const lines: string[] = [
    `# ${payload.title}`,
    '',
    `- 报表区间：${payload.periodLabel}`,
    `- 导出时间：${formatDateTime(payload.generatedAt)}`,
    `- 总掉落：${payload.summary.totalCount} 条`,
    `- 高亮战利品：${payload.summary.highlightedCount} 条`,
    `- 覆盖场景：${payload.summary.mapCount} 个`,
    `- 主类目：${
      payload.summary.topCategory
        ? `${getDropCategoryLabel(payload.summary.topCategory)} ${payload.summary.topCategoryCount} 条`
        : '尚未形成'
    }`,
    ''
  ];

  lines.push('## 类别分布', '');
  if (payload.summary.totalCount === 0) {
    lines.push('- 当前区间没有战利品记录。', '');
  } else {
    lines.push(...buildCategoryBreakdown(payload.summary), '');
  }

  lines.push('## 高亮战利品', '');
  if (payload.summary.highlights.length === 0) {
    lines.push('- 当前区间没有高亮战利品。', '');
  } else {
    payload.summary.highlights.forEach((drop, index) => {
      lines.push(
        `${index + 1}. ${drop.itemName}｜${drop.mapName || '未填写场景'}｜${formatCompactDateTime(drop.createdAt)}`
      );
      lines.push(`   ${formatNoteLine(drop)}`);
    });
    lines.push('');
  }

  lines.push('## 场景热区', '');
  if (payload.hotspots.length === 0) {
    lines.push('- 当前区间还没有形成场景热区。', '');
  } else {
    payload.hotspots.forEach((spot, index) => {
      lines.push(
        `${index + 1}. ${spot.mapName}｜${spot.totalCount} 条掉落${
          spot.highlightedCount > 0 ? `｜高亮 ${spot.highlightedCount}` : ''
        }`
      );
    });
    lines.push('');
  }

  lines.push('## 明细', '');
  if (payload.items.length === 0) {
    lines.push('- 当前区间没有战利品记录。');
  } else {
    categoryOrder.forEach((category) => {
      const items = payload.items.filter((item) => item.category === category);
      if (items.length === 0) {
        return;
      }

      lines.push(`### ${getDropCategoryLabel(category)}（${items.length}）`, '');
      for (const item of items) {
        lines.push(
          `- ${formatCompactDateTime(item.createdAt)}｜${item.itemName}｜${item.mapName || '未填写场景'}${
            item.highlighted ? '｜高亮' : ''
          }`
        );
        lines.push(`  ${formatNoteLine(item)}`);
      }
      lines.push('');
    });
  }

  return lines.join('\n').trim();
}

export function buildDropReportJson(payload: DropExportPayload): string {
  return JSON.stringify(
    {
      title: payload.title,
      periodLabel: payload.periodLabel,
      generatedAt: payload.generatedAt,
      summary: payload.summary,
      hotspots: payload.hotspots,
      items: payload.items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        mapName: item.mapName,
        category: item.category,
        highlighted: item.highlighted,
        createdAt: item.createdAt,
        note: item.note,
        screenshotPath: item.screenshotPath,
        ocrEngine: item.ocrEngine,
        ocrItemName: item.ocrItemName
      }))
    },
    null,
    2
  );
}

export function buildVisualDropReportPayload(
  payload: DropExportPayload,
  options: {
    subtitle: string;
    badge: string;
    footer: string;
    maxTimeline: number;
  }
): VisualReportPayload {
  return {
    title: payload.title,
    subtitle: options.subtitle,
    periodLabel: payload.periodLabel,
    generatedAt: payload.generatedAt,
    badge: options.badge,
    metrics: [
      { label: '总掉落', value: `${payload.summary.totalCount} 条` },
      { label: '高亮战利品', value: `${payload.summary.highlightedCount} 条` },
      { label: '覆盖场景', value: `${payload.summary.mapCount} 个` },
      {
        label: '主类目',
        value: payload.summary.topCategory
          ? `${getDropCategoryLabel(payload.summary.topCategory)} ${payload.summary.topCategoryCount}`
          : '尚未形成'
      }
    ],
    highlights: payload.summary.highlights.map((drop) => buildDropListItem(drop)),
    hotspots: payload.hotspots.map((spot) => ({
      title: spot.mapName,
      meta: `${spot.totalCount} 条掉落`,
      detail: spot.highlightedCount > 0 ? `高亮 ${spot.highlightedCount} 条` : '暂无高亮掉落',
      highlighted: spot.highlightedCount > 0
    })),
    timeline: payload.items.slice(0, options.maxTimeline).map((drop) => buildDropListItem(drop)),
    footer: options.footer
  };
}
