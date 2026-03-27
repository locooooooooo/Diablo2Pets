import type { PetProgression, PetRewardTrack, PetWorldInput } from './petWorld';

export type PetHabitatTier =
  | 'campfire'
  | 'routehall'
  | 'archive'
  | 'forgehall'
  | 'triumph'
  | 'vault';

export type PetHabitatExhibitState = 'glory' | 'ready' | 'warming' | 'locked';

export interface PetHabitatExhibit {
  id: string;
  label: string;
  detail: string;
  accent: string;
  state: PetHabitatExhibitState;
}

export interface PetHabitat {
  tier: PetHabitatTier;
  crest: string;
  aura: string;
  title: string;
  subtitle: string;
  collectionTitle: string;
  collectionSummary: string;
  exhibits: PetHabitatExhibit[];
}

interface HabitatDefinition {
  tier: PetHabitatTier;
  minLevel: number;
  crest: string;
  aura: string;
  title: string;
  subtitle: string;
  collectionTitle: string;
}

const HABITATS: HabitatDefinition[] = [
  {
    tier: 'vault',
    minLevel: 6,
    crest: 'Astral Vault',
    aura: '终局收藏室',
    title: '星盘藏品库',
    subtitle: '桌边房间已经不再只是陪刷角落，而是一整间会记住故事的藏品室。',
    collectionTitle: '终局收藏墙'
  },
  {
    tier: 'triumph',
    minLevel: 5,
    crest: 'Triumph Hall',
    aura: '凯旋陈列厅',
    title: '凯旋陈列厅',
    subtitle: '亮眼掉落开始拥有正式陈列位，桌宠的房间已经具备完整战果展厅的气质。',
    collectionTitle: '凯旋陈列墙'
  },
  {
    tier: 'forgehall',
    minLevel: 4,
    crest: 'Horadric Forge',
    aura: '工坊长驻',
    title: '赫拉迪姆工坊厅',
    subtitle: '自动化不再只是功能按钮，而是被真正搬进了桌宠房间的一整张工作台。',
    collectionTitle: '工坊陈列墙'
  },
  {
    tier: 'archive',
    minLevel: 3,
    crest: 'Loot Archive',
    aura: '战报成形',
    title: '战果档案间',
    subtitle: '战利品账本和掉落灯箱开始成形，桌边空间已经出现“战报房”的感觉。',
    collectionTitle: '档案陈列墙'
  },
  {
    tier: 'routehall',
    minLevel: 2,
    crest: 'Route Gallery',
    aura: '路线成厅',
    title: '路线挂图廊',
    subtitle: '常用路线不再只是数据，而是会被挂进桌宠房间的第一批真家具。',
    collectionTitle: '路线收藏墙'
  },
  {
    tier: 'campfire',
    minLevel: 1,
    crest: 'Camp Ember',
    aura: '安家初成',
    title: '营地火痕室',
    subtitle: '桌宠刚刚安家，炉火和第一批桌边摆设正在把整个空间慢慢点亮。',
    collectionTitle: '营地筹备墙'
  }
];

function toExhibitState(state: string): PetHabitatExhibitState {
  if (state === 'glory') {
    return 'glory';
  }

  if (state === 'ready' || state === 'unlocked') {
    return 'ready';
  }

  if (state === 'warming' || state === 'next') {
    return 'warming';
  }

  return 'locked';
}

export function buildPetHabitat(
  input: PetWorldInput,
  progression: PetProgression,
  rewards: PetRewardTrack
): PetHabitat {
  const habitat =
    HABITATS.find((candidate) => progression.level >= candidate.minLevel) ?? HABITATS[HABITATS.length - 1];
  const rareDrop = input.highlightDropName || input.recentDrops[0]?.itemName || '';

  const exhibits: PetHabitatExhibit[] = [
    ...(rareDrop
      ? [
          {
            id: 'latest-trophy',
            label: input.highlightDropName ? `今日高亮 · ${rareDrop}` : `最近战果 · ${rareDrop}`,
            detail: input.highlightDropName
              ? '这件战利品正被摆在收藏墙正中，代表今天最有仪式感的一刻。'
              : '这件战利品是最近一次被桌宠记住的代表战果。',
            accent: input.highlightDropName ? '高亮陈列' : '最近入藏',
            state: input.highlightDropName ? 'glory' : 'ready'
          }
        ]
      : []),
    ...rewards.rewards.map((reward) => ({
      id: reward.id,
      label: reward.label,
      detail:
        reward.state === 'unlocked'
          ? reward.bonus
          : reward.state === 'next'
            ? `即将解锁 · ${reward.detail}`
            : reward.detail,
      accent: reward.state === 'unlocked' ? '已入陈列' : reward.state === 'next' ? '下一件' : '待点亮',
      state: toExhibitState(reward.state)
    }))
  ];

  return {
    tier: habitat.tier,
    crest: habitat.crest,
    aura: habitat.aura,
    title: habitat.title,
    subtitle: habitat.subtitle,
    collectionTitle: habitat.collectionTitle,
    collectionSummary:
      rewards.nextReward
        ? `当前已解锁 ${rewards.unlockedCount}/${rewards.totalCount} 件核心陈列，下一件是 ${rewards.nextReward.label}。`
        : `当前全套 ${rewards.totalCount} 件核心陈列都已亮起，桌宠房间已经进入终局收藏态。`,
    exhibits
  };
}
