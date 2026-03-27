import { formatCompactDateTime } from './date';
import type {
  PetHabitat,
  PetHabitatExhibitState
} from './petHabitat';
import type {
  PetProgression,
  PetReward,
  PetRewardTrack,
  PetRoom,
  PetRoomItemState
} from './petWorld';
import type { DropRecord } from '../types';

export type PetCodexChapterId = 'relics' | 'rewards' | 'chamber' | 'chronicle';
export type PetCodexEntryState = 'glory' | 'ready' | 'warming' | 'locked';

export interface PetCodexMetric {
  label: string;
  value: string;
  detail: string;
}

export interface PetCodexEntry {
  id: string;
  chapterId: PetCodexChapterId;
  title: string;
  subtitle: string;
  detail: string;
  meta: string;
  accent: string;
  state: PetCodexEntryState;
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
}

interface RareDropPattern {
  accent: string;
  keywords: string[];
  detail: (itemName: string) => string;
}

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
      `${itemName} 已经被记入高阶符文卷宗，这类掉落会长期停留在桌宠的终局收藏线里。`
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
      `${itemName} 会被当成传奇暗金记录，桌宠会把它视作可以反复翻看的战果故事。`
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
      `${itemName} 已经被收进底材珍品页，提醒你它值得继续筛选、打孔或后续制作。`
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
    tone: 'glory'
  };
}

function buildRelicEntries(habitat: PetHabitat): PetCodexEntry[] {
  return habitat.exhibits.map((exhibit) => ({
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
    state: mapHabitatState(exhibit.state)
  }));
}

function buildRewardEntries(
  progression: PetProgression,
  rewards: PetRewardTrack
): PetCodexEntry[] {
  return rewards.rewards.map((reward) => ({
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
    state: mapRewardState(reward, rewards)
  }));
}

function buildChamberEntries(room: PetRoom): PetCodexEntry[] {
  return room.items.map((item) => ({
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
    state: mapRoomState(item.state)
  }));
}

function buildChronicleEntries(drops: DropRecord[]): PetCodexEntry[] {
  return drops.slice(0, 12).map((drop, index) => {
    const rare = detectRareDrop(drop);
    const hasManualNote = Boolean(drop.note.trim());
    const subtitle = drop.mapName
      ? `${drop.mapName} · ${formatCompactDateTime(drop.createdAt)}`
      : formatCompactDateTime(drop.createdAt);

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
      state: rare?.tone ?? (index === 0 ? 'ready' : 'warming')
    };
  });
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
  const highlightedChronicle = chronicleEntries.find((entry) => entry.state === 'glory');
  const highlightedRelic = relicEntries.find((entry) => entry.state === 'glory');
  const activeReward = rewardEntries.find((entry) => entry.state === 'glory');
  const featuredEntryId =
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
        detail:
          chronicleEntries.find((entry) => entry.state === 'glory')?.accent ?? '战利品条目'
      }
    ]
  };
}
