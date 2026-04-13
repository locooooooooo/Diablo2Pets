export const RUNE_ROWS = 4;
export const RUNE_COLS = 9;
export const RUNE_LAST_CRAFTABLE_COL = 6;
export const GEM_ROWS = 5;
export const GEM_COLS = 7;
export const GEM_SOURCE_ROWS = 4;

const RUNE_CODES = [
  'El',
  'Eld',
  'Tir',
  'Nef',
  'Eth',
  'Ith',
  'Tal',
  'Ral',
  'Ort',
  'Thul',
  'Amn',
  'Sol',
  'Shael',
  'Dol',
  'Hel',
  'Io',
  'Lum',
  'Ko',
  'Fal',
  'Lem',
  'Pul',
  'Um',
  'Mal',
  'Ist',
  'Gul',
  'Vex',
  'Ohm',
  'Lo',
  'Sur',
  'Ber',
  'Jah',
  'Cham',
  'Zod'
] as const;

export interface RuneSlotDefinition {
  index: number;
  row: number;
  col: number;
  code: string;
  craftable: boolean;
  filled: boolean;
  tone: 'low' | 'mid' | 'high' | 'mythic' | 'empty';
}

export interface GemColumnDefinition {
  key: string;
  short: string;
  label: string;
  accent: string;
}

export interface GemRowDefinition {
  key: string;
  short: string;
  label: string;
}

export interface RuneCraftStep {
  rowIndex: number;
  colIndex: number;
  craftCount: number;
  inputCount: number;
}

export interface GemCraftStep {
  rowIndex: number;
  colIndex: number;
  craftCount: number;
  inputCount: number;
}

export interface RuneCraftPreview {
  totalCrafts: number;
  activeSlots: number;
  resultingCounts: number[];
  steps: RuneCraftStep[];
}

export interface GemCraftPreview {
  totalCrafts: number;
  activeSlots: number;
  resultingCounts: number[][];
  steps: GemCraftStep[];
}

export const GEM_COLUMN_DEFINITIONS: GemColumnDefinition[] = [
  { key: 'amethyst', short: '紫', label: '紫宝石', accent: '#b26af4' },
  { key: 'topaz', short: '黄', label: '黄宝石', accent: '#f2c84c' },
  { key: 'sapphire', short: '蓝', label: '蓝宝石', accent: '#58a4ff' },
  { key: 'emerald', short: '绿', label: '绿宝石', accent: '#43d77d' },
  { key: 'ruby', short: '红', label: '红宝石', accent: '#f15e5b' },
  { key: 'diamond', short: '白', label: '钻石', accent: '#e3e7ef' },
  { key: 'skull', short: '颅', label: '骷髅', accent: '#d5d2cc' }
];

export const GEM_ROW_DEFINITIONS: GemRowDefinition[] = [
  { key: 'chipped', short: '碎', label: '碎裂' },
  { key: 'flawed', short: '裂', label: '裂开' },
  { key: 'normal', short: '普', label: '普通' },
  { key: 'flawless', short: '瑕', label: '无瑕' },
  { key: 'perfect', short: '完', label: '完美' }
];

function sanitizeCount(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value ?? 0));
}

function getRuneTone(index: number): RuneSlotDefinition['tone'] {
  if (index >= RUNE_CODES.length) {
    return 'empty';
  }
  if (index >= 30) {
    return 'mythic';
  }
  if (index >= 24) {
    return 'high';
  }
  if (index >= 12) {
    return 'mid';
  }
  return 'low';
}

export function parseRuneCounts(text: string): number[] {
  const tokens = text
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => sanitizeCount(Number.parseInt(item, 10)));

  return Array.from({ length: RUNE_ROWS * RUNE_COLS }, (_value, index) => tokens[index] ?? 0);
}

export function serializeRuneCounts(counts: number[]): string {
  return Array.from({ length: RUNE_ROWS * RUNE_COLS }, (_value, index) =>
    String(sanitizeCount(counts[index]))
  ).join(' ');
}

export function updateRuneCountAt(countsText: string, index: number, nextValue: number): string {
  const counts = parseRuneCounts(countsText);
  counts[index] = sanitizeCount(nextValue);
  return serializeRuneCounts(counts);
}

export function getRuneSlotDefinitions(countsText: string): RuneSlotDefinition[] {
  const counts = parseRuneCounts(countsText);

  return Array.from({ length: RUNE_ROWS * RUNE_COLS }, (_value, index) => {
    const row = Math.floor(index / RUNE_COLS);
    const col = index % RUNE_COLS;
    const code = RUNE_CODES[index] ?? '—';

    return {
      index,
      row,
      col,
      code,
      craftable: col <= RUNE_LAST_CRAFTABLE_COL && index < RUNE_CODES.length - 1,
      filled: counts[index] > 0,
      tone: getRuneTone(index)
    };
  });
}

export function getHighestFilledRune(countsText: string): string | null {
  const counts = parseRuneCounts(countsText);

  for (let index = Math.min(RUNE_CODES.length, counts.length) - 1; index >= 0; index -= 1) {
    if (counts[index] > 0) {
      return RUNE_CODES[index];
    }
  }

  return null;
}

export function buildRuneCraftPreview(countsText: string): RuneCraftPreview {
  const currentCounts = parseRuneCounts(countsText);
  const nextCounts = [...currentCounts];
  const steps: RuneCraftStep[] = [];

  for (let rowIndex = 0; rowIndex < RUNE_ROWS; rowIndex += 1) {
    for (let colIndex = 0; colIndex <= RUNE_LAST_CRAFTABLE_COL; colIndex += 1) {
      const currentIndex = rowIndex * RUNE_COLS + colIndex;
      const nextIndex = currentIndex + 1;
      const count = nextCounts[currentIndex] ?? 0;
      const craftCount = Math.floor(count / 3);

      if (craftCount <= 0) {
        continue;
      }

      steps.push({
        rowIndex,
        colIndex,
        craftCount,
        inputCount: count
      });

      nextCounts[currentIndex] -= craftCount * 3;
      nextCounts[nextIndex] = (nextCounts[nextIndex] ?? 0) + craftCount;
    }
  }

  return {
    totalCrafts: steps.reduce((total, step) => total + step.craftCount, 0),
    activeSlots: steps.length,
    resultingCounts: nextCounts,
    steps
  };
}

export function parseGemMatrix(text: string): number[][] {
  const matrix = Array.from({ length: GEM_ROWS }, () =>
    Array.from({ length: GEM_COLS }, () => 0)
  );
  const columns = text
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);

  for (let colIndex = 0; colIndex < Math.min(columns.length, GEM_COLS); colIndex += 1) {
    const values = columns[colIndex]
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => sanitizeCount(Number.parseInt(item, 10)));

    for (let rowIndex = 0; rowIndex < GEM_ROWS; rowIndex += 1) {
      matrix[rowIndex][colIndex] = values[rowIndex] ?? 0;
    }
  }

  return matrix;
}

export function serializeGemMatrix(matrix: number[][]): string {
  return Array.from({ length: GEM_COLS }, (_value, colIndex) =>
    Array.from({ length: GEM_ROWS }, (_inner, rowIndex) =>
      String(sanitizeCount(matrix[rowIndex]?.[colIndex]))
    ).join(' ')
  ).join('; ');
}

export function updateGemCountAt(
  matrixText: string,
  rowIndex: number,
  colIndex: number,
  nextValue: number
): string {
  const matrix = parseGemMatrix(matrixText);
  matrix[rowIndex][colIndex] = sanitizeCount(nextValue);
  return serializeGemMatrix(matrix);
}

export function buildGemCraftPreview(matrixText: string): GemCraftPreview {
  const current = parseGemMatrix(matrixText);
  const next = current.map((row) => [...row]);
  const steps: GemCraftStep[] = [];

  for (let colIndex = 0; colIndex < GEM_COLS; colIndex += 1) {
    for (let rowIndex = 0; rowIndex < GEM_SOURCE_ROWS; rowIndex += 1) {
      const count = next[rowIndex][colIndex] ?? 0;
      const craftCount = Math.floor(count / 3);

      if (craftCount <= 0) {
        continue;
      }

      steps.push({
        rowIndex,
        colIndex,
        craftCount,
        inputCount: count
      });

      next[rowIndex][colIndex] -= craftCount * 3;
      next[rowIndex + 1][colIndex] += craftCount;
    }
  }

  return {
    totalCrafts: steps.reduce((total, step) => total + step.craftCount, 0),
    activeSlots: steps.length,
    resultingCounts: next,
    steps
  };
}

export function getFilledGemFamilies(matrixText: string): string[] {
  const matrix = parseGemMatrix(matrixText);
  const families: string[] = [];

  for (let colIndex = 0; colIndex < GEM_COLS; colIndex += 1) {
    const total = matrix.reduce((sum, row) => sum + (row[colIndex] ?? 0), 0);
    if (total > 0) {
      families.push(GEM_COLUMN_DEFINITIONS[colIndex]?.label ?? `第 ${colIndex + 1} 列`);
    }
  }

  return families;
}
