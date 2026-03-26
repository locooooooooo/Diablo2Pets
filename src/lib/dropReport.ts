import type { DropRecord } from '../types';

export type DropCategory =
  | 'rune'
  | 'gem'
  | 'charm'
  | 'jewel'
  | 'key'
  | 'base'
  | 'equipment'
  | 'other';

export interface PreparedDropRecord extends DropRecord {
  category: DropCategory;
  highlighted: boolean;
}

export interface DailyDropSummary {
  totalCount: number;
  mapCount: number;
  topCategory: DropCategory | null;
  topCategoryCount: number;
  highlightedCount: number;
  highlights: PreparedDropRecord[];
  categoryCounts: Record<DropCategory, number>;
}

const allRunes = [
  'el',
  'eld',
  'tir',
  'nef',
  'eth',
  'ith',
  'tal',
  'ral',
  'ort',
  'thul',
  'amn',
  'sol',
  'shael',
  'dol',
  'hel',
  'io',
  'lum',
  'ko',
  'fal',
  'lem',
  'pul',
  'um',
  'mal',
  'ist',
  'gul',
  'vex',
  'ohm',
  'lo',
  'sur',
  'ber',
  'jah',
  'cham',
  'zod'
];

const highRunes = new Set(['vex', 'ohm', 'lo', 'sur', 'ber', 'jah', 'cham', 'zod']);
const highlightKeywords = [
  '无形',
  'eth',
  '4孔',
  '5孔',
  '6孔',
  '45抗',
  '技能',
  '超大护身符',
  '小护身符',
  '毁灭',
  '火炬',
  '年纪',
  '高亮',
  '极品',
  '毕业'
];

function normalizeText(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function containsWholeRuneWord(text: string): string | null {
  const match = text.match(/\b(el|eld|tir|nef|eth|ith|tal|ral|ort|thul|amn|sol|shael|dol|hel|io|lum|ko|fal|lem|pul|um|mal|ist|gul|vex|ohm|lo|sur|ber|jah|cham|zod)\b/);
  return match ? match[1] : null;
}

export function getDropCategoryLabel(category: DropCategory): string {
  switch (category) {
    case 'rune':
      return '符文';
    case 'gem':
      return '宝石';
    case 'charm':
      return '护身符';
    case 'jewel':
      return '珠宝';
    case 'key':
      return '钥匙 / 材料';
    case 'base':
      return '底材';
    case 'equipment':
      return '装备';
    case 'other':
      return '其他';
  }
}

export function classifyDropRecord(drop: Pick<DropRecord, 'itemName' | 'note' | 'ocrText'>): DropCategory {
  const text = normalizeText(`${drop.itemName} ${drop.note} ${drop.ocrText ?? ''}`);

  if (!text) {
    return 'other';
  }

  const runeWord = containsWholeRuneWord(text);
  if (runeWord || text.includes('符文')) {
    return 'rune';
  }

  if (
    includesAny(text, [
      '宝石',
      '完美',
      '无瑕',
      '裂开',
      '碎裂',
      'perfect',
      'flawless',
      'chipped',
      'gem'
    ])
  ) {
    return 'gem';
  }

  if (includesAny(text, ['护身符', 'small charm', 'grand charm', 'charm'])) {
    return 'charm';
  }

  if (includesAny(text, ['珠宝', 'jewel'])) {
    return 'jewel';
  }

  if (includesAny(text, ['钥匙', '精华', 'token', 'key'])) {
    return 'key';
  }

  if (
    includesAny(text, [
      '底材',
      '无形',
      'eth',
      'socket',
      '孔',
      '统御',
      '幻化',
      '神圣',
      '权冠',
      '巨神',
      '君主盾'
    ])
  ) {
    return 'base';
  }

  return 'equipment';
}

export function isHighlightedDrop(drop: Pick<DropRecord, 'itemName' | 'note' | 'ocrText'>): boolean {
  const text = normalizeText(`${drop.itemName} ${drop.note} ${drop.ocrText ?? ''}`);
  const runeWord = containsWholeRuneWord(text);

  if (runeWord && highRunes.has(runeWord)) {
    return true;
  }

  return includesAny(text, highlightKeywords);
}

export function prepareDropRecords(drops: DropRecord[]): PreparedDropRecord[] {
  return drops.map((drop) => ({
    ...drop,
    category: classifyDropRecord(drop),
    highlighted: isHighlightedDrop(drop)
  }));
}

export function buildDailyDropSummary(drops: PreparedDropRecord[]): DailyDropSummary {
  const categoryCounts: Record<DropCategory, number> = {
    rune: 0,
    gem: 0,
    charm: 0,
    jewel: 0,
    key: 0,
    base: 0,
    equipment: 0,
    other: 0
  };

  const mapNames = new Set<string>();
  for (const drop of drops) {
    categoryCounts[drop.category] += 1;
    if (drop.mapName.trim()) {
      mapNames.add(drop.mapName.trim());
    }
  }

  const sortedCategories = Object.entries(categoryCounts).sort((left, right) => {
    return right[1] - left[1];
  }) as Array<[DropCategory, number]>;

  const [topCategory, topCategoryCount] = sortedCategories[0] ?? [null, 0];
  const highlights = drops.filter((drop) => drop.highlighted).slice(0, 3);

  return {
    totalCount: drops.length,
    mapCount: mapNames.size,
    topCategory: topCategoryCount > 0 ? topCategory : null,
    topCategoryCount,
    highlightedCount: drops.filter((drop) => drop.highlighted).length,
    highlights,
    categoryCounts
  };
}

export function buildDailySummaryLine(summary: DailyDropSummary): string {
  if (summary.totalCount === 0) {
    return '今天还没有记录战利品，先贴一张截图让我开始记账。';
  }

  const topCategoryText = summary.topCategory
    ? `${getDropCategoryLabel(summary.topCategory)} ${summary.topCategoryCount} 件`
    : '类别尚未形成主峰';

  return `今天共记录 ${summary.totalCount} 条掉落，覆盖 ${summary.mapCount} 个场景，当前最多的是 ${topCategoryText}。`;
}

export function getCategoryOptions(preparedDrops: PreparedDropRecord[]): DropCategory[] {
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

  return order.filter((category) =>
    preparedDrops.some((drop) => drop.category === category)
  );
}

export function getRuneNames(): string[] {
  return allRunes;
}
