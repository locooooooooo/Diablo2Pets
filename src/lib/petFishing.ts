import type {
  PetEmotion,
  PetInteractionCue,
  PetPersonaInput
} from './petPersona';

export type PetFishingTier = 'ember' | 'glow' | 'mythic' | 'prime';

export interface PetFishingCatch {
  id: number;
  tier: PetFishingTier;
  runeId: string;
  runeLabel: string;
  runeShort: string;
  badge: string;
  blessing: string;
  miniBlessing: string;
  scripts: string[];
  emotion: PetEmotion;
}

interface FishingRuneDefinition {
  id: string;
  label: string;
  short: string;
  tier: PetFishingTier;
  weight: number;
}

const FISHING_RUNES: FishingRuneDefinition[] = [
  { id: 'el', label: '艾尔 El', short: 'El', tier: 'ember', weight: 14 },
  { id: 'eld', label: '艾德 Eld', short: 'Eld', tier: 'ember', weight: 12 },
  { id: 'tir', label: '提尔 Tir', short: 'Tir', tier: 'ember', weight: 12 },
  { id: 'nef', label: '奈夫 Nef', short: 'Nef', tier: 'ember', weight: 11 },
  { id: 'tal', label: '塔尔 Tal', short: 'Tal', tier: 'ember', weight: 11 },
  { id: 'ort', label: '欧特 Ort', short: 'Ort', tier: 'ember', weight: 9 },
  { id: 'amn', label: '安姆 Amn', short: 'Amn', tier: 'glow', weight: 8 },
  { id: 'sol', label: '索尔 Sol', short: 'Sol', tier: 'glow', weight: 7 },
  { id: 'lem', label: '蓝姆 Lem', short: 'Lem', tier: 'glow', weight: 6 },
  { id: 'pul', label: '普尔 Pul', short: 'Pul', tier: 'glow', weight: 5 },
  { id: 'ist', label: '伊斯特 Ist', short: 'Ist', tier: 'mythic', weight: 4 },
  { id: 'gul', label: '古尔 Gul', short: 'Gul', tier: 'mythic', weight: 3 },
  { id: 'vex', label: '伐克斯 Vex', short: 'Vex', tier: 'mythic', weight: 3 },
  { id: 'ohm', label: '欧姆 Ohm', short: 'Ohm', tier: 'mythic', weight: 2 },
  { id: 'lo', label: '罗 Lo', short: 'Lo', tier: 'mythic', weight: 2 },
  { id: 'sur', label: '瑟 Sur', short: 'Sur', tier: 'mythic', weight: 2 },
  { id: 'ber', label: '贝 Ber', short: 'Ber', tier: 'prime', weight: 1 },
  { id: 'jah', label: '乔 Jah', short: 'Jah', tier: 'prime', weight: 1 },
  { id: 'cham', label: '查姆 Cham', short: 'Cham', tier: 'prime', weight: 1 },
  { id: 'zod', label: '萨德 Zod', short: 'Zod', tier: 'prime', weight: 1 }
];

const BADGE_BY_TIER: Record<PetFishingTier, string> = {
  ember: '熔火小吉',
  glow: '鱼线发亮',
  mythic: '地狱上钩',
  prime: '乔贝大运'
};

const MINI_BLESSINGS_BY_TIER: Record<PetFishingTier, string[]> = {
  ember: ['今天鱼钩开张', '先给你暖暖手', '好运开始冒头'],
  glow: ['这一钩有点发光', '后半程会更顺', '今晚手气在升温'],
  mythic: ['地狱深水有货', '这钩很像好兆头', '今天适合追高亮'],
  prime: ['乔贝气息上来了', '高阶好运已挂钩', '今晚值得多刷几轮']
};

const BLESSING_TEMPLATES: Record<PetFishingTier, string[]> = {
  ember: [
    '先替你钓起 {rune}，愿你接下来每一趟都顺手出光。',
    '{rune} 已经挂上鱼线，今天的好运会慢慢热起来。',
    '小迪先把 {rune} 捞上来，愿你这局一路平稳有收成。'
  ],
  glow: [
    '{rune} 已经开始发亮，愿你今晚刷图节奏越来越顺。',
    '这一钩带上来的是 {rune}，愿你下一趟就接着见财。',
    '鱼漂一沉就是 {rune}，愿你后半场继续有惊喜。'
  ],
  mythic: [
    '{rune} 都被钓上来了，愿你下一轮直接迎面见高亮。',
    '这次起钩就是 {rune}，愿你今天的地图一路发光。',
    '{rune} 在鱼线上晃了一下，愿你今晚战报越写越厚。'
  ],
  prime: [
    '{rune} 都肯上钩，愿你今晚真的见乔贝同桌。',
    '这一钩捞出 {rune}，愿你下一趟混沌直接大亮。',
    '{rune} 从火湖里翻出来了，愿你今天一路高阶相迎。'
  ]
};

const FOLLOWUP_SCRIPTS_BY_TIER: Record<PetFishingTier, string[]> = {
  ember: [
    '先把桌边的好运点燃，后面慢慢追高阶也来得及。',
    '今天的第一份祝福不一定最贵，但一定是个好开头。',
    '火湖有动静时，通常说明今天不会空手。'
  ],
  glow: [
    '鱼漂开始发亮的时候，通常也是掉落开始顺的时候。',
    '这种钓感最适合再多开几轮，把节奏拉满。',
    '我先替你把手气往上拱一点，剩下的交给地图。'
  ],
  mythic: [
    '再往后刷几轮，说不定就轮到真正的高阶星光了。',
    '这钩已经有传奇味道了，今天别太早收工。',
    '当火湖开始认真回礼，战报通常会很好看。'
  ],
  prime: [
    '乔贝味道都已经飘出来了，今晚真的该多刷一会儿。',
    '这种钓感像是地狱在偷偷给你开绿灯。',
    '把这份好运接住，下一轮说不定就是桌宠要开庆典的时候。'
  ]
};

function makeCatchId() {
  return Date.now() + Math.floor(Math.random() * 10_000);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function pickWeightedRune(): FishingRuneDefinition {
  const totalWeight = FISHING_RUNES.reduce((sum, rune) => sum + rune.weight, 0);
  let threshold = Math.random() * totalWeight;

  for (const rune of FISHING_RUNES) {
    threshold -= rune.weight;
    if (threshold <= 0) {
      return rune;
    }
  }

  return FISHING_RUNES[FISHING_RUNES.length - 1];
}

function getEmotionByTier(tier: PetFishingTier): PetEmotion {
  switch (tier) {
    case 'ember':
      return 'curious';
    case 'glow':
      return 'focused';
    case 'mythic':
      return 'proud';
    case 'prime':
      return 'celebrate';
  }
}

export function createPetFishingCatch(input: PetPersonaInput): PetFishingCatch {
  const rune = pickWeightedRune();
  const routeName = input.recentRuns[0]?.mapName ?? '下一轮';
  const totalRuns = input.todayCount;
  const totalDrops = input.todayDropCount;
  const template = pickRandom(BLESSING_TEMPLATES[rune.tier]);
  const blessing =
    template.replace('{rune}', rune.label) +
    (totalDrops > 0
      ? ` 今天已经收了 ${totalDrops} 条战果，愿 ${routeName} 再补一条亮的。`
      : totalRuns > 0
        ? ` 今天已经刷了 ${totalRuns} 轮，愿下一轮就有惊喜。`
        : ' 等你开第一轮时，我会继续替你盯着好运。');

  return {
    id: makeCatchId(),
    tier: rune.tier,
    runeId: rune.id,
    runeLabel: rune.label,
    runeShort: rune.short,
    badge: BADGE_BY_TIER[rune.tier],
    blessing,
    miniBlessing: pickRandom(MINI_BLESSINGS_BY_TIER[rune.tier]),
    emotion: getEmotionByTier(rune.tier),
    scripts: [
      `迪亚波罗把 ${rune.label} 从火湖里钓出来了，今晚的桌边气氛已经热起来了。`,
      pickRandom(FOLLOWUP_SCRIPTS_BY_TIER[rune.tier]),
      totalDrops > 0
        ? `今天的战报已经开张，再来一条亮的，账本会更像一场凯旋巡礼。`
        : `等你把下一轮刷完回来，我会继续把今天的好运气挂在桌边。`
    ]
  };
}

export function buildPetFishingInteractionCue(
  fishingCatch: PetFishingCatch
): PetInteractionCue {
  return {
    id: fishingCatch.id,
    kind: 'idle-play',
    emotion: fishingCatch.emotion,
    emotionLabel: fishingCatch.badge,
    headline: `迪宝钓起了 ${fishingCatch.runeLabel}`,
    statusLine: fishingCatch.blessing,
    scripts: fishingCatch.scripts,
    durationMs: fishingCatch.tier === 'prime' ? 6400 : 5600
  };
}
