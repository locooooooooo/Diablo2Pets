import type { PetProgression, PetRewardTrack } from './petWorld';

export type PetCeremonyKind = 'level-up' | 'unlock' | 'mastery';

export interface PetCeremonySnapshot {
  level: number;
  title: string;
  unlockedCount: number;
  totalCount: number;
  unlockedIds: string[];
  activeRewardId: string | null;
  activeRewardLabel: string | null;
}

export interface PetCeremony {
  id: number;
  kind: PetCeremonyKind;
  level: number;
  badge: string;
  title: string;
  detail: string;
  scripts: string[];
  rewardIds: string[];
  roomIds: string[];
}

function mapRewardToRoomIds(rewardId: string): string[] {
  switch (rewardId) {
    case 'camp-hearth':
      return ['hearth'];
    case 'route-banner':
      return ['route-map'];
    case 'ledger-lamp':
      return ['ledger-rack'];
    case 'cube-bench':
      return ['cube-plinth'];
    case 'triumph-alcove':
    case 'astral-vault':
      return ['trophy'];
    default:
      return [];
  }
}

function makeCeremonyId() {
  return Date.now() + Math.floor(Math.random() * 10_000);
}

export function createPetCeremonySnapshot(
  progression: PetProgression,
  rewards: PetRewardTrack
): PetCeremonySnapshot {
  const unlockedIds = rewards.rewards
    .filter((reward) => reward.state === 'unlocked')
    .map((reward) => reward.id);

  return {
    level: progression.level,
    title: progression.title,
    unlockedCount: rewards.unlockedCount,
    totalCount: rewards.totalCount,
    unlockedIds,
    activeRewardId: rewards.activeReward?.id ?? null,
    activeRewardLabel: rewards.activeReward?.label ?? null
  };
}

export function buildPetCeremony(
  previous: PetCeremonySnapshot,
  progression: PetProgression,
  rewards: PetRewardTrack
): PetCeremony | null {
  const current = createPetCeremonySnapshot(progression, rewards);
  const newlyUnlockedIds = current.unlockedIds.filter((id) => !previous.unlockedIds.includes(id));
  const primaryReward =
    rewards.rewards.find((reward) => newlyUnlockedIds.includes(reward.id)) ?? rewards.activeReward;
  const roomIds = newlyUnlockedIds.flatMap((id) => mapRewardToRoomIds(id));

  if (current.unlockedCount === current.totalCount && previous.unlockedCount < current.totalCount) {
    return {
      id: makeCeremonyId(),
      kind: 'mastery',
      level: progression.level,
      badge: '满阶点亮',
      title: `Lv.${progression.level} ${progression.title}`,
      detail: `${primaryReward?.label ?? '终局陈列'} 已经完成最终陈列，这只桌宠现在真正拥有一整间收藏室了。`,
      scripts: [
        '这一刻不是普通升级，而是整套房间终于完整亮起。',
        '接下来每次高亮掉落，都会像在完整收藏室里添一件新战果。',
        '你养起来的已经不只是工具，而是一只真正有世界感的桌宠。'
      ],
      rewardIds: newlyUnlockedIds.length > 0 ? newlyUnlockedIds : current.unlockedIds,
      roomIds: roomIds.length > 0 ? roomIds : ['trophy']
    };
  }

  if (current.level > previous.level) {
    const rewardLabel = primaryReward?.label ? `，并点亮了 ${primaryReward.label}` : '';
    return {
      id: makeCeremonyId(),
      kind: 'level-up',
      level: progression.level,
      badge: '称号晋升',
      title: `Lv.${progression.level} ${progression.title}`,
      detail: `桌宠晋升到了新的称号${rewardLabel}。这次成长已经从数字，变成了桌边真正能看见的变化。`,
      scripts: [
        '新的称号已经刻到桌边铭牌上了，今天这份陪刷进度被正式记住了。',
        primaryReward?.label
          ? `${primaryReward.label} 也跟着这次晋升一起亮起来了。`
          : '这一阶虽然低调，但房间的气质已经和刚开始不一样了。',
        '继续刷下去，下一件陈列很快就会跟着被点亮。'
      ],
      rewardIds: newlyUnlockedIds,
      roomIds
    };
  }

  if (newlyUnlockedIds.length > 0 && primaryReward) {
    return {
      id: makeCeremonyId(),
      kind: 'unlock',
      level: progression.level,
      badge: '家具点亮',
      title: `${primaryReward.label} 已解锁`,
      detail: `${primaryReward.label} 已经搬进桌宠房间，${primaryReward.bonus}`,
      scripts: [
        `${primaryReward.label} 已经点亮，这只桌宠的房间又多了一件真正会说话的陈列。`,
        '这类解锁不会打断你刷图，但会把成长的反馈实实在在留在桌边。',
        '继续积累下去，房间会一点点从陪刷工具变成完整的收藏空间。'
      ],
      rewardIds: newlyUnlockedIds,
      roomIds
    };
  }

  return null;
}
