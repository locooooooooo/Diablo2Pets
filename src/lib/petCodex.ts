import { formatCompactDateTime } from './date';
import type { PetHabitat, PetHabitatExhibitState } from './petHabitat';
import type {
  PetProgression,
  PetReward,
  PetRewardTrack,
  PetRoom,
  PetRoomItemState
} from './petWorld';
import type { DropRecord } from '../types';

export type PetCodexChapterId = 'atlas' | 'relics' | 'rewards' | 'chamber' | 'chronicle';
export type PetCodexEntryState = 'glory' | 'ready' | 'warming' | 'locked';
export type PetCodexRarity = 'ember' | 'trophy' | 'artifact' | 'legend' | 'mythic';

export interface PetCodexMetric {
  label: string;
  value: string;
  detail: string;
}

export interface PetCodexFact {
  label: string;
  value: string;
}

export interface PetCodexIllustration {
  monogram: string;
  title: string;
  orbitLabels: string[];
}

export type PetCodexVisualTone = 'gold' | 'mythic' | 'artifact' | 'ember';

export interface PetCodexVisualItem {
  label: string;
  value: number;
  displayValue?: string;
  detail?: string;
  tone?: PetCodexVisualTone;
  target?: PetCodexJumpTarget;
}

export interface PetCodexVisualBlock {
  id: string;
  kind: 'meter' | 'bars' | 'segments';
  title: string;
  subtitle: string;
  value?: number;
  total?: number;
  items?: PetCodexVisualItem[];
  tone?: PetCodexVisualTone;
  footnote?: string;
  target?: PetCodexJumpTarget;
}

export interface PetCodexJumpTarget {
  chapterId: PetCodexChapterId;
  entryId?: string;
  mapName?: string;
  typeLabel?: string;
  highlightOnly?: boolean;
  rarity?: 'all' | PetCodexRarity;
}

export interface PetCodexEntry {
  id: string;
  chapterId: PetCodexChapterId;
  title: string;
  subtitle: string;
  detail: string;
  meta: string;
  accent: string;
  categoryLabel: string;
  groupLabel: string;
  state: PetCodexEntryState;
  rarity: PetCodexRarity;
  sigil: string;
  storyTitle: string;
  storyLead: string;
  chips: string[];
  badges: string[];
  facts: PetCodexFact[];
  searchableText: string;
  illustration: PetCodexIllustration;
  mapName?: string;
  capturedAt?: string;
  note?: string;
  ocrText?: string;
  ocrEngine?: string;
  screenshotPath?: string;
  visuals?: PetCodexVisualBlock[];
}

export interface PetCodexChapter {
  id: PetCodexChapterId;
  label: string;
  title: string;
  summary: string;
  entries: PetCodexEntry[];
  readyCount: number;
}

export interface PetCodex {
  badge: string;
  title: string;
  subtitle: string;
  featuredEntryId: string;
  chapters: PetCodexChapter[];
  metrics: PetCodexMetric[];
}

interface PetCodexInput {
  drops: DropRecord[];
  progression: PetProgression;
  rewards: PetRewardTrack;
  room: PetRoom;
  habitat: PetHabitat;
}

interface RareDropStory {
  accent: string;
  detail: string;
  tone: PetCodexEntryState;
  rarity: PetCodexRarity;
  sigil: string;
  chips: string[];
  badges: string[];
  storyTitle: (itemName: string) => string;
  storyLead: (drop: DropRecord) => string;
}

interface RareDropPattern {
  accent: string;
  keywords: string[];
  detail: (itemName: string) => string;
  rarity: PetCodexRarity;
  sigil: string;
  chips: string[];
  badges: string[];
  storyTitle: (itemName: string) => string;
  storyLead: (drop: DropRecord) => string;
}

const DAY_LABEL = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric'
});

const RARE_DROP_PATTERNS: RareDropPattern[] = [
  {
    accent: '高阶符文',
    keywords: [
      'jah',
      'ber',
      'sur',
      'cham',
      'zod',
      'lo rune',
      'ohm rune',
      'vex rune',
      '乔',
      '贝',
      '瑟',
      '查姆',
      '萨德'
    ],
    detail: (itemName) =>
      `${itemName} 已经被记入高阶符文卷宗，这类掉落会长期停留在桌宠的终局收藏线里。`,
    rarity: 'mythic',
    sigil: 'Rune',
    chips: ['终局收藏', '高阶符文'],
    badges: ['神话级', '终局战果', '收藏墙核心'],
    storyTitle: (itemName) => `${itemName} 点亮了符文星盘`,
    storyLead: (drop) =>
      `${drop.itemName} 来自 ${drop.mapName || '未知场景'}，这是足以把整面收藏墙推向终局阶段的掉落。`
  },
  {
    accent: '传奇暗金',
    keywords: [
      'griffon',
      "death's web",
      'death fathom',
      'tyrael',
      'coa',
      '年纪之冠',
      '格利风',
      '死亡之网',
      '死亡深度',
      '泰瑞尔'
    ],
    detail: (itemName) =>
      `${itemName} 会被当成传奇暗金记录，桌宠会把它视作可以反复翻看的战果故事。`,
    rarity: 'legend',
    sigil: 'Unique',
    chips: ['传奇暗金', '陈列级'],
    badges: ['传奇级', '凯旋陈列', '战果故事'],
    storyTitle: (itemName) => `${itemName} 进入凯旋陈列厅`,
    storyLead: (drop) =>
      `${drop.itemName} 这类掉落不会只停留在战报里，它会被当成真正的奖杯陈列进房间。`
  },
  {
    accent: '底材珍品',
    keywords: [
      'monarch',
      'archon plate',
      'sacred armor',
      'giant thresher',
      '统治者大盾',
      '君主盾',
      '执政官铠甲',
      '神圣盔甲'
    ],
    detail: (itemName) =>
      `${itemName} 已经被收进底材珍品页，提醒你它值得继续筛选、打孔或后续制作。`,
    rarity: 'artifact',
    sigil: 'Base',
    chips: ['底材珍品', '后续制作'],
    badges: ['珍品级', '底材档案', '待处理'],
    storyTitle: (itemName) => `${itemName} 被挂上底材陈列架`,
    storyLead: (drop) =>
      `${drop.itemName} 这类底材会在收藏册里保留位置，提醒你它可能对应一条后续制作路线。`
  }
];

export function createPetCodexEntryId(
  chapterId: PetCodexChapterId,
  rawId: string
): string {
  return `${chapterId}:${rawId}`;
}

function mapHabitatState(state: PetHabitatExhibitState): PetCodexEntryState {
  return state;
}

function mapRewardState(
  reward: PetReward,
  rewards: PetRewardTrack
): PetCodexEntryState {
  if (rewards.activeReward?.id === reward.id) {
    return 'glory';
  }

  if (reward.state === 'unlocked') {
    return 'ready';
  }

  if (reward.state === 'next') {
    return 'warming';
  }

  return 'locked';
}

function mapRoomState(state: PetRoomItemState): PetCodexEntryState {
  return state;
}

function buildSearchableText(parts: Array<string | undefined>): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function buildIllustration(
  monogram: string,
  title: string,
  orbitLabels: string[]
): PetCodexIllustration {
  return {
    monogram,
    title,
    orbitLabels: orbitLabels.slice(0, 3)
  };
}

function toDayLabel(input: string): string {
  return DAY_LABEL.format(new Date(input));
}

function detectRareDrop(drop: DropRecord): RareDropStory | null {
  const text = `${drop.itemName} ${drop.note} ${drop.ocrItemName ?? ''}`.toLowerCase();
  const pattern = RARE_DROP_PATTERNS.find((candidate) =>
    candidate.keywords.some((keyword) => text.includes(keyword.toLowerCase()))
  );

  if (!pattern) {
    return null;
  }

  return {
    accent: pattern.accent,
    detail: pattern.detail(drop.itemName),
    tone: 'glory',
    rarity: pattern.rarity,
    sigil: pattern.sigil,
    chips: pattern.chips,
    badges: pattern.badges,
    storyTitle: pattern.storyTitle,
    storyLead: pattern.storyLead
  };
}

function buildRelicEntries(habitat: PetHabitat): PetCodexEntry[] {
  return habitat.exhibits.map((exhibit) => {
    const stateText =
      exhibit.state === 'glory'
        ? '高亮陈列'
        : exhibit.state === 'ready'
          ? '稳定陈列'
          : exhibit.state === 'warming'
            ? '即将点亮'
            : '尚未解锁';

    return {
      id: createPetCodexEntryId('relics', exhibit.id),
      chapterId: 'relics',
      title: exhibit.label,
      subtitle: `${habitat.title} · ${habitat.collectionTitle}`,
      detail: exhibit.detail,
      meta:
        exhibit.state === 'glory'
          ? '当前正处于高亮陈列位，会优先出现在桌宠收藏墙。'
          : exhibit.state === 'ready'
            ? '已经正式点亮，可随时从收藏册回看。'
            : exhibit.state === 'warming'
              ? '离正式陈列只差最后一点成长或联调进度。'
              : '还没有满足点亮条件，先继续陪刷和补工坊进度。',
      accent: exhibit.accent,
      categoryLabel: stateText,
      groupLabel: stateText,
      state: mapHabitatState(exhibit.state),
      rarity:
        exhibit.state === 'glory' ? 'legend' : exhibit.state === 'ready' ? 'artifact' : 'ember',
      sigil: exhibit.state === 'glory' ? 'Relic' : 'Wall',
      storyTitle:
        exhibit.state === 'glory'
          ? `${exhibit.label} 正在收藏墙中央发亮`
          : `${exhibit.label} 正在进入收藏墙`,
      storyLead: `这件陈列属于 ${habitat.collectionTitle}，会和桌宠成长阶段一起改变房间气氛。`,
      chips: [habitat.crest, exhibit.accent],
      badges: [stateText, habitat.aura],
      facts: [
        { label: '所属主题', value: habitat.title },
        { label: '当前阶段', value: stateText },
        { label: '收藏线', value: habitat.collectionTitle }
      ],
      searchableText: buildSearchableText([
        exhibit.label,
        exhibit.detail,
        exhibit.accent,
        habitat.title,
        habitat.collectionTitle,
        habitat.crest,
        stateText
      ]),
      illustration: buildIllustration(
        exhibit.state === 'glory' ? 'RL' : 'WL',
        habitat.collectionTitle,
        [habitat.crest, exhibit.accent, stateText]
      )
    };
  });
}

function buildRewardEntries(
  progression: PetProgression,
  rewards: PetRewardTrack
): PetCodexEntry[] {
  return rewards.rewards.map((reward) => {
    const stateText =
      reward.state === 'unlocked' ? '已解锁' : reward.state === 'next' ? '下一件' : '待解锁';

    return {
      id: createPetCodexEntryId('rewards', reward.id),
      chapterId: 'rewards',
      title: reward.label,
      subtitle: `Lv.${reward.level} 解锁 · 当前羁绊 Lv.${progression.level}`,
      detail: reward.state === 'unlocked' ? reward.bonus : reward.detail,
      meta:
        reward.state === 'unlocked'
          ? '这条奖励已经影响到桌宠当前的展示和交互。'
          : reward.state === 'next'
            ? '这是距离最近的一条奖励轨道，继续刷图和记账就会点亮。'
            : '还在后续成长线中，先让前面的奖励稳定亮起来。',
      accent: reward.shortLabel,
      categoryLabel: stateText,
      groupLabel: stateText,
      state: mapRewardState(reward, rewards),
      rarity:
        rewards.activeReward?.id === reward.id
          ? 'legend'
          : reward.state === 'unlocked'
            ? 'artifact'
            : reward.state === 'next'
              ? 'trophy'
              : 'ember',
      sigil: reward.state === 'unlocked' ? 'Bond' : 'Track',
      storyTitle:
        reward.state === 'unlocked'
          ? `${reward.label} 已经进入当前桌宠形态`
          : `${reward.label} 仍在成长轨道上等待点亮`,
      storyLead:
        reward.state === 'unlocked'
          ? '奖励一旦点亮，就会真正改变桌宠的房间、演出或信息结构。'
          : '成长线不是纯数字，它会在桌宠房间里变成具体陈列和新的交互表达。',
      chips: [`Lv.${reward.level}`, reward.shortLabel],
      badges: [stateText, reward.state === 'unlocked' ? '已生效' : '成长中'],
      facts: [
        { label: '当前状态', value: stateText },
        { label: '奖励效果', value: reward.bonus },
        { label: '当前等级', value: `Lv.${progression.level}` }
      ],
      searchableText: buildSearchableText([
        reward.label,
        reward.detail,
        reward.bonus,
        reward.shortLabel,
        `lv${reward.level}`,
        stateText
      ]),
      illustration: buildIllustration(reward.shortLabel, reward.label, [
        `Lv.${reward.level}`,
        stateText,
        reward.shortLabel
      ])
    };
  });
}

function buildChamberEntries(room: PetRoom): PetCodexEntry[] {
  return room.items.map((item) => {
    const stateText =
      item.state === 'glory'
        ? '主陈列'
        : item.state === 'ready'
          ? '已入驻'
          : item.state === 'warming'
            ? '预热中'
            : '未入驻';

    return {
      id: createPetCodexEntryId('chamber', item.id),
      chapterId: 'chamber',
      title: item.label,
      subtitle: `${room.title} · ${item.shortLabel}`,
      detail: item.detail,
      meta:
        item.state === 'glory'
          ? '这是房间里最醒目的陈列位，会跟着升级演出一起点亮。'
          : item.state === 'ready'
            ? '已经是稳定陈列的一部分，会持续出现在桌宠房间里。'
            : item.state === 'warming'
              ? '已经开始显影，但还没进入最终的完整形态。'
              : '目前仍在预留位置，等后续成长再真正入驻。',
      accent: item.shortLabel,
      categoryLabel: stateText,
      groupLabel: stateText,
      state: mapRoomState(item.state),
      rarity:
        item.state === 'glory'
          ? 'legend'
          : item.state === 'ready'
            ? 'artifact'
            : item.state === 'warming'
              ? 'trophy'
              : 'ember',
      sigil: item.state === 'glory' ? 'Room' : 'Slot',
      storyTitle:
        item.state === 'glory'
          ? `${item.label} 已经成为房间的主陈列`
          : `${item.label} 正在慢慢进入房间布局`,
      storyLead: `这件房间陈列属于 ${room.title}，会跟着桌宠成长和陪刷节奏逐步丰富起来。`,
      chips: [room.title, item.shortLabel],
      badges: [stateText, '房间陈列'],
      facts: [
        { label: '所属房间', value: room.title },
        { label: '当前阶段', value: stateText },
        { label: '布置标签', value: item.label }
      ],
      searchableText: buildSearchableText([
        item.label,
        item.detail,
        room.title,
        item.shortLabel,
        stateText
      ]),
      illustration: buildIllustration(item.shortLabel, room.title, [
        room.title,
        item.shortLabel,
        stateText
      ])
    };
  });
}

function buildChronicleEntries(drops: DropRecord[]): PetCodexEntry[] {
  return drops.slice(0, 12).map((drop, index) => {
    const rare = detectRareDrop(drop);
    const hasManualNote = Boolean(drop.note.trim());
    const subtitle = drop.mapName
      ? `${drop.mapName} · ${formatCompactDateTime(drop.createdAt)}`
      : formatCompactDateTime(drop.createdAt);
    const state = rare?.tone ?? (index === 0 ? 'ready' : 'warming');
    const stateText =
      state === 'glory' ? '高亮战果' : state === 'ready' ? '已入编年' : '待补故事';

    return {
      id: createPetCodexEntryId('chronicle', drop.id),
      chapterId: 'chronicle',
      title: drop.itemName,
      subtitle,
      detail:
        drop.note.trim() ||
        rare?.detail ||
        (drop.ocrItemName
          ? `OCR 曾建议记录为 ${drop.ocrItemName}。`
          : '这条战利品已经收入编年记录，等待你继续补充更多故事。'),
      meta: hasManualNote
        ? '这条记录带有你亲自补写的备注。'
        : drop.ocrEngine
          ? `由 ${drop.ocrEngine} OCR 辅助识别后入账。`
          : index === 0
            ? '这是当前最新的一条战果记录。'
            : '这条记录来自历史掉落档案。',
      accent: rare?.accent ?? (index === 0 ? '最新战果' : '战利品'),
      categoryLabel: rare?.accent ?? '战利品',
      groupLabel: toDayLabel(drop.createdAt),
      state,
      rarity: rare?.rarity ?? (index === 0 ? 'trophy' : 'ember'),
      sigil: rare?.sigil ?? (drop.screenshotPath ? 'Drop' : 'Log'),
      storyTitle: rare?.storyTitle(drop.itemName) ?? `${drop.itemName} 已经被写入今日卷宗`,
      storyLead:
        rare?.storyLead(drop) ??
        `${drop.itemName} 于 ${drop.mapName || '未知场景'} 掉落，已经被桌宠收入编年册。`,
      chips: [
        rare?.accent ?? '战利品',
        drop.mapName || '未标注地图',
        hasManualNote ? '手写备注' : drop.ocrEngine ? 'OCR 入账' : '基础记录'
      ],
      badges: [...(rare?.badges ?? []), stateText],
      facts: [
        { label: '掉落时间', value: formatCompactDateTime(drop.createdAt) },
        { label: '掉落场景', value: drop.mapName || '未标注地图' },
        { label: '记录来源', value: hasManualNote ? '手动补充' : drop.ocrEngine ? drop.ocrEngine : '直接记账' }
      ],
      searchableText: buildSearchableText([
        drop.itemName,
        drop.note,
        drop.mapName,
        drop.ocrItemName,
        drop.ocrText,
        rare?.accent,
        ...(rare?.badges ?? [])
      ]),
      illustration: buildIllustration(
        rare?.sigil ?? 'Drop',
        drop.itemName,
        [
          drop.mapName || '未知场景',
          rare?.accent ?? '战利品',
          formatCompactDateTime(drop.createdAt)
        ]
      ),
      mapName: drop.mapName,
      capturedAt: drop.createdAt,
      note: drop.note,
      ocrText: drop.ocrText,
      ocrEngine: drop.ocrEngine,
      screenshotPath: drop.screenshotPath
    };
  });
}

function countReadyEntries(entries: PetCodexEntry[]): number {
  return entries.filter((entry) => entry.state === 'glory' || entry.state === 'ready').length;
}

function buildAtlasEntries(
  input: PetCodexInput,
  relicEntries: PetCodexEntry[],
  rewardEntries: PetCodexEntry[],
  chamberEntries: PetCodexEntry[],
  chronicleEntries: PetCodexEntry[]
): PetCodexEntry[] {
  const archiveEntries = [
    ...relicEntries,
    ...rewardEntries,
    ...chamberEntries,
    ...chronicleEntries
  ];
  const readyCount = countReadyEntries(archiveEntries);
  const totalCount = archiveEntries.length;
  const completionPercent =
    totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;
  const rareEntries = archiveEntries.filter(
    (entry) => entry.rarity === 'mythic' || entry.rarity === 'legend'
  );
  const mapCounts = new Map<string, number>();

  input.drops.forEach((drop) => {
    const key = drop.mapName.trim();
    if (!key) {
      return;
    }

    mapCounts.set(key, (mapCounts.get(key) ?? 0) + 1);
  });

  const topMaps = Array.from(mapCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);
  const uniqueMapCount = mapCounts.size;
  const rarityBands: Array<{ label: string; count: number; rarity: PetCodexRarity }> = [
    {
      label: '神话',
      count: archiveEntries.filter((entry) => entry.rarity === 'mythic').length,
      rarity: 'mythic'
    },
    {
      label: '传奇',
      count: archiveEntries.filter((entry) => entry.rarity === 'legend').length,
      rarity: 'legend'
    },
    {
      label: '珍品',
      count: archiveEntries.filter((entry) => entry.rarity === 'artifact').length,
      rarity: 'artifact'
    },
    {
      label: '战果',
      count: archiveEntries.filter((entry) => entry.rarity === 'trophy').length,
      rarity: 'trophy'
    },
    {
      label: '基石',
      count: archiveEntries.filter((entry) => entry.rarity === 'ember').length,
      rarity: 'ember'
    }
  ];
  const chapterBoards = [
    {
      chapterId: 'relics' as const,
      label: '收藏墙',
      ready: countReadyEntries(relicEntries),
      total: relicEntries.length
    },
    {
      chapterId: 'rewards' as const,
      label: '成长轨',
      ready: countReadyEntries(rewardEntries),
      total: rewardEntries.length
    },
    {
      chapterId: 'chamber' as const,
      label: '房间陈列',
      ready: countReadyEntries(chamberEntries),
      total: chamberEntries.length
    },
    {
      chapterId: 'chronicle' as const,
      label: '战果编年',
      ready: countReadyEntries(chronicleEntries),
      total: chronicleEntries.length
    }
  ];
  const topMapLine =
    topMaps.length > 0
      ? topMaps.map(([mapName, count]) => `${mapName} ${count}次`).join(' · ')
      : '等待第一张地图写入档案馆';
  const rareLine =
    rareEntries.length > 0
      ? `${rareEntries.length} 项高阶条目已经进入收藏序列`
      : '目前还没有神话或传奇条目进入总览层';

  return [
    {
      id: createPetCodexEntryId('atlas', 'overview'),
      chapterId: 'atlas',
      title: '档案总览',
      subtitle: `Lv.${input.progression.level} · ${readyCount}/${totalCount} 已点亮`,
      detail: '总览页会把收藏墙、成长轨、房间陈列和战果编年压成一页，先看全局，再决定往哪条线继续翻。',
      meta: `当前总完成度 ${completionPercent}% ，地图覆盖 ${uniqueMapCount} 张，稀有条目 ${rareEntries.length} 项。`,
      accent: '总览',
      categoryLabel: '统计总览',
      groupLabel: '档案总览',
      state: readyCount > 0 ? 'glory' : 'warming',
      rarity: rareEntries.length > 0 ? 'legend' : 'artifact',
      sigil: 'Atlas',
      storyTitle: '档案馆已经长出可回看的总览层',
      storyLead: '这张总览会把今日掉落、长期收藏和成长进度压进同一页，让你先看到全局节奏。',
      chips: [`完成度 ${completionPercent}%`, `地图 ${uniqueMapCount} 张`, `稀有 ${rareEntries.length} 项`],
      badges: ['总览首页', '档案馆', input.progression.title],
      facts: [
        { label: '当前等级', value: `Lv.${input.progression.level}` },
        { label: '点亮条目', value: `${readyCount}/${totalCount}` },
        { label: '地图覆盖', value: `${uniqueMapCount} 张` },
        { label: '稀有条目', value: `${rareEntries.length} 项` }
      ],
      searchableText: buildSearchableText([
        '档案总览',
        '统计总览',
        input.progression.title,
        `lv${input.progression.level}`,
        topMapLine,
        rareLine
      ]),
      illustration: buildIllustration('AT', 'Codex Atlas', [
        `Lv.${input.progression.level}`,
        `${completionPercent}%`,
        `${uniqueMapCount} Maps`
      ]),
      visuals: [
        {
          id: 'overview-meter',
          kind: 'meter',
          title: '档案点亮率',
          subtitle: `${readyCount}/${totalCount} 已点亮`,
          value: readyCount,
          total: totalCount,
          tone: rareEntries.length > 0 ? 'gold' : 'artifact',
          footnote: '总览会把所有长期收藏、成长奖励和战果编年压成一个总体完成度。'
        },
        {
          id: 'overview-boards',
          kind: 'bars',
          title: '四条主线',
          subtitle: '收藏墙、成长轨、房间陈列和战果编年的当前进度',
          items: chapterBoards.map((item) => ({
            label: item.label,
            value: item.ready,
            displayValue: `${item.ready}/${item.total}`,
            detail: item.total > 0 ? `${Math.round((item.ready / item.total) * 100)}%` : '0%',
            target: {
              chapterId: item.chapterId
            },
            tone:
              item.ready === item.total
                ? 'gold'
                : item.ready > 0
                  ? 'artifact'
                  : 'ember'
          })),
          footnote: '先看哪一条主线拖后腿，再决定继续刷、补联调还是回房间收陈列。'
        }
      ]
    },
    {
      id: createPetCodexEntryId('atlas', 'maps'),
      chapterId: 'atlas',
      title: '地图热区',
      subtitle: uniqueMapCount > 0 ? `覆盖 ${uniqueMapCount} 张地图` : '等待地图样本写入',
      detail: topMapLine,
      meta:
        uniqueMapCount > 0
          ? '地图热区会按掉落记录自动滚动更新。'
          : '先记下第一条掉落后，这里就会开始形成热区榜。',
      accent: '热区',
      categoryLabel: '地图分布',
      groupLabel: '路线图谱',
      state: uniqueMapCount > 0 ? 'ready' : 'warming',
      rarity: topMaps.length >= 3 ? 'artifact' : 'trophy',
      sigil: 'Map',
      storyTitle: '桌宠已经开始理解你的主刷路线',
      storyLead: '同一张地图反复出现时，它会被提升到总览层，帮助你识别今天的热区节奏。',
      chips: topMaps.length > 0 ? topMaps.map(([mapName]) => mapName) : ['等待样本'],
      badges: ['路线图谱', uniqueMapCount > 0 ? '已形成热区' : '等待首条记录'],
      facts:
        topMaps.length > 0
          ? topMaps.map(([mapName, count], index) => ({
              label: `热区 ${index + 1}`,
              value: `${mapName} · ${count}次`
            }))
          : [{ label: '当前状态', value: '还没有足够的地图记录' }],
      searchableText: buildSearchableText([
        '地图热区',
        '路线图谱',
        ...topMaps.map(([mapName]) => mapName)
      ]),
      illustration: buildIllustration('MP', 'Route Atlas', [
        topMaps[0]?.[0] ?? 'No Route',
        `${uniqueMapCount} Maps`,
        `${input.drops.length} Drops`
      ]),
      visuals: [
        {
          id: 'map-hotspots',
          kind: 'bars',
          title: '热区排行',
          subtitle: uniqueMapCount > 0 ? '按掉落记录排序的当前热点地图' : '等待地图数据写入',
          items:
            topMaps.length > 0
              ? topMaps.map(([mapName, count], index) => ({
                  label: mapName,
                  value: count,
                  displayValue: `${count}次`,
                  detail: index === 0 ? '当前最热路线' : `热区 ${index + 1}`,
                  target: {
                    chapterId: 'chronicle',
                    mapName
                  },
                  tone: index === 0 ? 'gold' : index === 1 ? 'artifact' : 'ember'
                }))
              : [
                  {
                    label: '暂无热区',
                    value: 0,
                    displayValue: '0次',
                    detail: '写入第一条掉落后这里会开始形成地图脉络',
                    tone: 'ember'
                  }
                ],
          footnote:
            uniqueMapCount > 0
              ? `当前已经覆盖 ${uniqueMapCount} 张地图。`
              : '还没有足够的样本形成地图热区。'
        }
      ]
    },
    {
      id: createPetCodexEntryId('atlas', 'rarity'),
      chapterId: 'atlas',
      title: '稀有层级',
      subtitle: `神话 ${rarityBands[0].count} · 传奇 ${rarityBands[1].count} · 珍品 ${rarityBands[2].count}`,
      detail: rarityBands.map((band) => `${band.label} ${band.count} 项`).join(' · '),
      meta: rareLine,
      accent: '层级',
      categoryLabel: '稀有层级',
      groupLabel: '稀有层级',
      state: rareEntries.length > 0 ? 'glory' : 'ready',
      rarity: rareEntries.length > 0 ? 'mythic' : 'artifact',
      sigil: 'Rare',
      storyTitle: '稀有度已经不再只是单条高亮',
      storyLead: '总览层会把神话、传奇、珍品和基础条目拆开看，方便你判断今天的掉落质量。',
      chips: rarityBands.map((band) => `${band.label} ${band.count}`),
      badges: ['稀有层级', rareEntries.length > 0 ? '高阶条目已入列' : '等待高阶条目'],
      facts: rarityBands.map((band) => ({
        label: band.label,
        value: `${band.count} 项`
      })),
      searchableText: buildSearchableText([
        '稀有层级',
        ...rarityBands.map((band) => `${band.label} ${band.count}`)
      ]),
      illustration: buildIllustration('RR', 'Rarity Ladder', [
        `Mythic ${rarityBands[0].count}`,
        `Legend ${rarityBands[1].count}`,
        `Artifact ${rarityBands[2].count}`
      ]),
      visuals: [
        {
          id: 'rarity-ladder',
          kind: 'segments',
          title: '稀有分层',
          subtitle: '按稀有度拆看当前档案馆的条目结构',
          items: rarityBands.map((band, index) => ({
            label: band.label,
            value: band.count,
            displayValue: `${band.count} 项`,
            detail: index === 0 ? '最高阶条目' : index === 1 ? '高价值收藏' : undefined,
            target: archiveEntries.find((entry) => entry.rarity === band.rarity)
              ? {
                  chapterId: archiveEntries.find((entry) => entry.rarity === band.rarity)!.chapterId,
                  entryId: archiveEntries.find((entry) => entry.rarity === band.rarity)!.id,
                  rarity: band.rarity
                }
              : undefined,
            tone:
              band.label === '神话'
                ? 'mythic'
                : band.label === '传奇'
                  ? 'gold'
                  : band.label === '珍品'
                    ? 'artifact'
                    : 'ember'
          })),
          footnote: '稀有层级越往上，越值得进入收藏墙和专属故事页。'
        }
      ]
    },
    {
      id: createPetCodexEntryId('atlas', 'completion'),
      chapterId: 'atlas',
      title: '完成度总表',
      subtitle: `${chapterBoards.filter((item) => item.ready === item.total).length}/${chapterBoards.length} 条主线已收口`,
      detail: chapterBoards.map((item) => `${item.label} ${item.ready}/${item.total}`).join(' · '),
      meta: '这张总表会告诉你当前更该继续刷、去工坊补联调，还是回房间收陈列。',
      accent: '总表',
      categoryLabel: '完成度总表',
      groupLabel: '完成度总表',
      state: chapterBoards.every((item) => item.ready === item.total) ? 'glory' : 'ready',
      rarity: chapterBoards.every((item) => item.ready === item.total) ? 'legend' : 'trophy',
      sigil: 'Board',
      storyTitle: '四条主线已经被压成一张完成度总表',
      storyLead: '当你想快速决定下一步时，总表会比单条详情更快告诉你现在最缺哪一块。',
      chips: chapterBoards.map((item) => `${item.label} ${item.ready}/${item.total}`),
      badges: ['完成度总表', `${completionPercent}% 已点亮`],
      facts: chapterBoards.map((item) => ({
        label: item.label,
        value: `${item.ready}/${item.total}`
      })),
      searchableText: buildSearchableText([
        '完成度总表',
        ...chapterBoards.map((item) => `${item.label} ${item.ready}/${item.total}`)
      ]),
      illustration: buildIllustration('BD', 'Completion Board', [
        chapterBoards[0] ? `${chapterBoards[0].ready}/${chapterBoards[0].total}` : '0/0',
        chapterBoards[1] ? `${chapterBoards[1].ready}/${chapterBoards[1].total}` : '0/0',
        `${completionPercent}%`
      ]),
      visuals: [
        {
          id: 'completion-bars',
          kind: 'bars',
          title: '主线完成度',
          subtitle: '四条主线当前的收口情况',
          items: chapterBoards.map((item) => ({
            label: item.label,
            value: item.ready,
            displayValue: `${item.ready}/${item.total}`,
            detail: item.ready === item.total ? '已收口' : '仍可继续推进',
            target: {
              chapterId: item.chapterId
            },
            tone:
              item.ready === item.total
                ? 'gold'
                : item.ready > 0
                  ? 'artifact'
                  : 'ember'
          })),
          footnote: '这张表更适合用来决定下一步做什么，而不是看单条故事。'
        },
        {
          id: 'completion-meter',
          kind: 'meter',
          title: '全局收口率',
          subtitle: `${completionPercent}% 已点亮`,
          value: readyCount,
          total: totalCount,
          tone: chapterBoards.every((item) => item.ready === item.total) ? 'gold' : 'artifact',
          footnote: '当全局收口率抬高时，桌宠房间和收藏墙也会越来越完整。'
        }
      ]
    }
  ];
}

function buildChapter(
  id: PetCodexChapterId,
  label: string,
  title: string,
  summary: string,
  entries: PetCodexEntry[]
): PetCodexChapter {
  return {
    id,
    label,
    title,
    summary,
    entries,
    readyCount: entries.filter((entry) => entry.state === 'glory' || entry.state === 'ready').length
  };
}

export function buildPetCodex(input: PetCodexInput): PetCodex {
  const relicEntries = buildRelicEntries(input.habitat);
  const rewardEntries = buildRewardEntries(input.progression, input.rewards);
  const chamberEntries = buildChamberEntries(input.room);
  const chronicleEntries = buildChronicleEntries(input.drops);
  const atlasEntries = buildAtlasEntries(
    input,
    relicEntries,
    rewardEntries,
    chamberEntries,
    chronicleEntries
  );
  const highlightedChronicle = chronicleEntries.find((entry) => entry.state === 'glory');
  const highlightedRelic = relicEntries.find((entry) => entry.state === 'glory');
  const activeReward = rewardEntries.find((entry) => entry.state === 'glory');
  const featuredEntryId =
    atlasEntries[0]?.id ??
    highlightedChronicle?.id ??
    highlightedRelic?.id ??
    activeReward?.id ??
    chronicleEntries[0]?.id ??
    relicEntries[0]?.id ??
    rewardEntries[0]?.id ??
    chamberEntries[0]?.id ??
    createPetCodexEntryId('relics', 'empty');

  const chapters = [
    buildChapter(
      'atlas',
      '总览图谱',
      '档案总览',
      '先看地图热区、稀有层级和完成度总表，再决定往哪条线继续翻。',
      atlasEntries
    ),
    buildChapter(
      'relics',
      '收藏墙',
      input.habitat.collectionTitle,
      input.habitat.collectionSummary,
      relicEntries
    ),
    buildChapter(
      'rewards',
      '成长轨道',
      '奖励解锁册',
      input.rewards.summary,
      rewardEntries
    ),
    buildChapter(
      'chamber',
      '房间陈列',
      input.room.title,
      input.room.subtitle,
      chamberEntries
    ),
    buildChapter(
      'chronicle',
      '战果编年',
      '掉落卷宗',
      chronicleEntries.length > 0
        ? `当前已经记下 ${chronicleEntries.length} 条战果，最新条目会优先出现在桌宠编年册。`
        : '掉落记录还没开始，贴上第一张截图后这里就会慢慢长成完整卷宗。',
      chronicleEntries
    )
  ];

  return {
    badge: input.progression.level >= 6 ? '终局藏品册' : '桌宠藏品册',
    title: '赫拉迪姆收藏册',
    subtitle: '把成长奖励、房间陈列和战利品编年收成一套可翻看的桌边卷册。',
    featuredEntryId,
    chapters,
    metrics: [
      {
        label: '当前等级',
        value: `Lv.${input.progression.level}`,
        detail: input.progression.title
      },
      {
        label: '已点亮陈列',
        value: `${input.habitat.exhibits.filter((item) => item.state !== 'locked').length}/${
          input.habitat.exhibits.length
        }`,
        detail: input.habitat.collectionTitle
      },
      {
        label: '房间布置',
        value: `${input.room.items.filter((item) => item.state !== 'locked').length}/${
          input.room.items.length
        }`,
        detail: input.room.title
      },
      {
        label: '编年记录',
        value: String(input.drops.length),
        detail: highlightedChronicle?.accent ?? chronicleEntries[0]?.accent ?? '战利品条目'
      }
    ]
  };
}
