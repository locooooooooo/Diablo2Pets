import type { AutomationPreflightResponse, DropRecord, RunRecord } from '../types';
import type { PetPersonaInput } from './petPersona';

export type PetSceneId = 'camp' | 'sanctuary' | 'forge' | 'ledger' | 'altar';
export type PetEventTone = 'warm' | 'alert' | 'bright';
export type PetEventAction =
  | 'open-companion'
  | 'open-drops'
  | 'open-workshop'
  | 'open-setup'
  | 'start-latest'
  | 'start-default';

export type PetRoomItemState = 'locked' | 'warming' | 'ready' | 'glory';

export interface PetScene {
  id: PetSceneId;
  label: string;
  propLabel: string;
  auraLabel: string;
  ambientLine: string;
  detail: string;
}

export interface PetEvent {
  id: number;
  tone: PetEventTone;
  title: string;
  detail: string;
  ctaLabel: string;
  action: PetEventAction;
  storyLabel?: string;
}

export interface PetRoomItem {
  id: string;
  label: string;
  shortLabel: string;
  state: PetRoomItemState;
  detail: string;
}

export interface PetRoom {
  title: string;
  subtitle: string;
  items: PetRoomItem[];
}

export interface PetProgression {
  level: number;
  title: string;
  progress: number;
  progressLabel: string;
  nextMilestone: string;
  sceneLine: string;
}

export interface PetWorldInput extends PetPersonaInput {
  now: number;
}

interface RareStory {
  storyLabel: string;
  title: string;
  detail: string;
  propLabel: string;
  dropName: string;
}

interface RareStoryTemplate {
  storyLabel: string;
  propLabel: string;
  keywords: string[];
  title: (dropName: string) => string;
  detail: (dropName: string) => string;
}

const RARE_STORY_TEMPLATES: RareStoryTemplate[] = [
  {
    storyLabel: '高阶符文',
    propLabel: '符文星盘',
    keywords: ['jah', 'ber', 'sur', 'cham', 'zod', 'lo rune', '贝', '乔', '萨德', '查姆', '罗'],
    title: (dropName) => `${dropName} 点亮了星盘`,
    detail: (dropName) =>
      `${dropName} 这种级别的掉落，会被我写进桌宠房间里的“符文星盘”故事卷轴。`
  },
  {
    storyLabel: '传奇暗金',
    propLabel: '传奇陈列柜',
    keywords: [
      'griffon',
      '格利风',
      'death\'s web',
      '死亡之网',
      'death fathom',
      '死亡深度',
      'tyrael',
      '泰瑞尔',
      'coa',
      '年纪之冠'
    ],
    title: (dropName) => `${dropName} 被送进传奇柜`,
    detail: (dropName) =>
      `${dropName} 已经不只是普通战果了，它会触发一段专属剧情并长期挂在陈列柜里。`
  },
  {
    storyLabel: '底材奇遇',
    propLabel: '底材架',
    keywords: [
      '统治者大盾',
      '君主盾',
      'monarch',
      'archon plate',
      '执政官铠甲',
      '神圣盔甲',
      'sacred armor'
    ],
    title: (dropName) => `${dropName} 被挂上底材架`,
    detail: (dropName) =>
      `${dropName} 这种底材会被单独摆进房间一角，提醒你它值得后续处理。`
  }
];

const PET_TITLES = [
  { level: 1, title: '营地见习生', threshold: 0 },
  { level: 2, title: '路线抄写员', threshold: 35 },
  { level: 3, title: '战果记事官', threshold: 80 },
  { level: 4, title: '方块看守人', threshold: 135 },
  { level: 5, title: '凯旋收藏家', threshold: 205 },
  { level: 6, title: '桌边大贤者', threshold: 290 }
];

function getLatestRunNeedingWrapUp(
  recentRuns: RunRecord[],
  recentDrops: DropRecord[]
): RunRecord | null {
  const latestRun = recentRuns[0];
  if (!latestRun) {
    return null;
  }

  const runEndedAt = new Date(latestRun.endedAt).getTime();
  const hasFollowupDrop = recentDrops.some(
    (drop) => new Date(drop.createdAt).getTime() >= runEndedAt - 90_000
  );

  return hasFollowupDrop ? null : latestRun;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function getAmbientPrefix(hour: number): string {
  if (hour < 6) {
    return '夜巡还没散去';
  }

  if (hour < 11) {
    return '晨光刚落在羊皮纸边';
  }

  if (hour < 17) {
    return '桌边火光正适合长时间连刷';
  }

  if (hour < 22) {
    return '傍晚的桌面气氛最适合开战报';
  }

  return '夜色把陪刷的仪式感抬起来了';
}

function getBlockingTask(preflight: AutomationPreflightResponse | null) {
  return preflight?.tasks.find((task) => task.status === 'error') ?? null;
}

function getWarningTask(preflight: AutomationPreflightResponse | null) {
  return preflight?.tasks.find((task) => task.status === 'warning') ?? null;
}

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function findRareStory(dropName: string): RareStory | null {
  const normalized = normalizeText(dropName);
  const template = RARE_STORY_TEMPLATES.find((candidate) =>
    candidate.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );

  if (!template) {
    return null;
  }

  return {
    storyLabel: template.storyLabel,
    propLabel: template.propLabel,
    title: template.title(dropName),
    detail: template.detail(dropName),
    dropName
  };
}

function getBestRareStory(input: PetWorldInput): RareStory | null {
  if (input.highlightDropName) {
    return findRareStory(input.highlightDropName);
  }

  for (const drop of input.recentDrops) {
    const match = findRareStory(drop.itemName);
    if (match) {
      return match;
    }
  }

  return null;
}

function getProgressScore(input: PetWorldInput) {
  const blockingTask = getBlockingTask(input.preflight);
  const rareStory = getBestRareStory(input);

  return (
    (input.setupGuideCompleted ? 18 : 0) +
    input.todayCount * 10 +
    input.todayDropCount * 18 +
    (input.highlightDropName ? 14 : 0) +
    (!blockingTask && input.setupGuideCompleted ? 16 : 0) +
    (rareStory ? 48 : 0)
  );
}

export function buildPetScene(input: PetWorldInput): PetScene {
  const hour = new Date(input.now).getHours();
  const ambientPrefix = getAmbientPrefix(hour);
  const blockingTask = getBlockingTask(input.preflight);
  const warningTask = getWarningTask(input.preflight);
  const rareStory = getBestRareStory(input);

  if (input.highlightDropName) {
    return {
      id: 'altar',
      label: rareStory ? '传奇陈列室' : '凯旋祭台',
      propLabel: rareStory?.propLabel ?? '高亮战利品',
      auraLabel: rareStory ? '剧情触发' : '庆祝中',
      ambientLine: rareStory
        ? `${ambientPrefix}，一段只属于 ${rareStory.dropName} 的剧情已经在桌边亮起来了。`
        : `${ambientPrefix}，这条高亮战果正被摆在最醒目的位置。`,
      detail: rareStory?.detail ?? '最适合收口、截图、记战报的高光时刻。'
    };
  }

  if (input.activeRun) {
    return {
      id: 'sanctuary',
      label: '火焰石阶',
      propLabel: '门钥徽记',
      auraLabel: '陪刷中',
      ambientLine: `${ambientPrefix}，当前路线正在计时里稳定推进。`,
      detail: '桌宠会优先展示当前刷图路线与返回时机。'
    };
  }

  if (!input.setupGuideCompleted) {
    return {
      id: 'camp',
      label: '营地桌角',
      propLabel: '凯恩手札',
      auraLabel: '安家中',
      ambientLine: `${ambientPrefix}，先把环境和 Profile 整理好。`,
      detail: '这是首启安家阶段，适合补完引导和基础环境。'
    };
  }

  if (blockingTask || warningTask) {
    return {
      id: 'forge',
      label: '赫拉迪姆工坊',
      propLabel: '赫拉迪姆方块',
      auraLabel: blockingTask ? '待修复' : '可联调',
      ambientLine: blockingTask
        ? `${ambientPrefix}，工坊里还有一项阻塞需要你点亮。`
        : `${ambientPrefix}，工坊状态基本就绪，只剩一些提醒项。`,
      detail: blockingTask?.summary ?? warningTask?.summary ?? '三条自动化链路都在这里收口。'
    };
  }

  if (rareStory) {
    return {
      id: 'altar',
      label: '传奇陈列室',
      propLabel: rareStory.propLabel,
      auraLabel: '故事常驻',
      ambientLine: `${ambientPrefix}，${rareStory.dropName} 还留在桌宠房间的荣誉位上。`,
      detail: rareStory.detail
    };
  }

  if (input.todayDropCount > 0) {
    return {
      id: 'ledger',
      label: '战果账室',
      propLabel: '战利品账册',
      auraLabel: '战报热身',
      ambientLine: `${ambientPrefix}，今天已经有 ${input.todayDropCount} 条战果入账。`,
      detail: '账本已经热起来了，适合继续积累周报和月报素材。'
    };
  }

  if (input.todayCount > 0) {
    return {
      id: 'sanctuary',
      label: '路线瞭望台',
      propLabel: '路线刻印',
      auraLabel: '节奏已起',
      ambientLine: `${ambientPrefix}，今天已经刷了 ${input.todayCount} 轮。`,
      detail: '继续沿用最近的主路线，会是最顺手的开始方式。'
    };
  }

  return {
    id: 'camp',
    label: '营地桌角',
    propLabel: '热身卷册',
    auraLabel: '待命中',
    ambientLine: `${ambientPrefix}，第一轮还没开始，桌宠正在安静待命。`,
    detail: '从这里起步最轻松，适合热身和进入节奏。'
  };
}

export function buildPetRoom(input: PetWorldInput): PetRoom {
  const blockingTask = getBlockingTask(input.preflight);
  const rareStory = getBestRareStory(input);
  const todayMomentum = input.todayCount > 0;
  const todayLooted = input.todayDropCount > 0;

  const items: PetRoomItem[] = [
    {
      id: 'hearth',
      label: '营地炉火',
      shortLabel: '炉火',
      state: input.setupGuideCompleted ? 'ready' : 'warming',
      detail: input.setupGuideCompleted
        ? '首启安家已经完成，桌边的基础氛围稳定点亮了。'
        : '把环境和引导补齐后，这盏炉火会从微光变成常亮。'
    },
    {
      id: 'route-map',
      label: '路线挂图',
      shortLabel: '挂图',
      state: todayMomentum ? 'ready' : input.setupGuideCompleted ? 'warming' : 'locked',
      detail: todayMomentum
        ? '今天的主刷路线已经挂到墙面上，回来时能直接续刷。'
        : '先开一轮，房间里才会出现今天的路线挂图。'
    },
    {
      id: 'ledger-rack',
      label: '战果陈列架',
      shortLabel: '账架',
      state: todayLooted ? 'ready' : input.todayCount > 0 ? 'warming' : 'locked',
      detail: todayLooted
        ? `今天的 ${input.todayDropCount} 条战果已经挂上陈列架了。`
        : '等第一条掉落出现之后，账架会开始被填满。'
    },
    {
      id: 'cube-plinth',
      label: '方块底座',
      shortLabel: '方块',
      state: blockingTask ? 'warming' : input.setupGuideCompleted ? 'ready' : 'locked',
      detail: blockingTask
        ? `${blockingTask.summary}，修好之后工坊底座会完整点亮。`
        : '工坊联调条件已经基本就绪，方块底座处于可用状态。'
    },
    {
      id: 'trophy',
      label: rareStory ? rareStory.storyLabel : '凯旋奖杯',
      shortLabel: rareStory ? '剧情' : '奖杯',
      state: rareStory
        ? 'glory'
        : input.highlightDropName || input.todayDropCount >= 2
          ? 'ready'
          : 'locked',
      detail: rareStory
        ? `${rareStory.dropName} 已经被收藏进房间的荣耀位。`
        : input.highlightDropName || input.todayDropCount >= 2
          ? '今天已经有足够亮眼的战果，奖杯位开始有存在感了。'
          : '等更亮眼的掉落出现，房间里的荣耀位就会被真正点亮。'
    }
  ];

  return {
    title: rareStory ? '传奇陈列室已点亮' : '桌宠房间正在生长',
    subtitle: rareStory
      ? `${rareStory.dropName} 触发了一段专属剧情，它已经成了房间里的常驻收藏。`
      : input.todayDropCount > 0
        ? '今天的掉落和路线会慢慢把这间房填满。'
        : '随着引导、刷图和战报推进，房间里的家具会一件件亮起来。',
    items
  };
}

export function buildPetProgression(input: PetWorldInput): PetProgression {
  const score = getProgressScore(input);
  const scene = buildPetScene(input);
  const rareStory = getBestRareStory(input);
  const currentTier =
    [...PET_TITLES].reverse().find((tier) => score >= tier.threshold) ?? PET_TITLES[0];
  const nextTier = PET_TITLES.find((tier) => tier.level === currentTier.level + 1) ?? currentTier;
  const span = Math.max(1, nextTier.threshold - currentTier.threshold);
  const progressValue =
    currentTier.level === nextTier.level ? 1 : (score - currentTier.threshold) / span;
  const progress = Math.max(0.08, Math.min(1, progressValue));

  let sceneLine = '我会继续在桌边待命，把今天的上下文接住。';
  if (scene.id === 'camp') {
    sceneLine = '我在替你把炉火和卷册整理好，等你回来时桌边还是热的。';
  } else if (scene.id === 'sanctuary') {
    sceneLine = '石阶旁的路线刻印已经压住了，下一轮回来不会断节奏。';
  } else if (scene.id === 'forge') {
    sceneLine = '我在给方块底座校准刻纹，等你切进工坊时就会更顺手。';
  } else if (scene.id === 'ledger') {
    sceneLine = '账册页角还在自己翻动，我会继续把今天的战果看紧。';
  } else if (scene.id === 'altar') {
    sceneLine = rareStory
      ? `${rareStory.dropName} 的收藏灯还亮着，这段剧情会在房间里常驻。`
      : '凯旋祭台上的光还没退，这种高亮时刻值得多停留一会儿。';
  }

  return {
    level: currentTier.level,
    title: currentTier.title,
    progress,
    progressLabel:
      currentTier.level === nextTier.level
        ? '当前已经达到本轮称号上限'
        : `距离 ${nextTier.title} 还差 ${Math.max(0, nextTier.threshold - score)} 点陪刷阅历`,
    nextMilestone:
      currentTier.level === nextTier.level
        ? '已点亮当前全部称号'
        : `下一称号：${nextTier.title}`,
    sceneLine
  };
}

export function createPetEvent(input: PetWorldInput): PetEvent {
  const blockingTask = getBlockingTask(input.preflight);
  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp(
    input.recentRuns,
    input.recentDrops
  );
  const rareStory = getBestRareStory(input);

  if (input.highlightDropName && rareStory) {
    return {
      id: Date.now(),
      tone: 'bright',
      title: rareStory.title,
      detail: rareStory.detail,
      ctaLabel: '去写战报',
      action: 'open-drops',
      storyLabel: rareStory.storyLabel
    };
  }

  if (input.highlightDropName) {
    return {
      id: Date.now(),
      tone: 'bright',
      title: '高亮战果入册',
      detail: `${input.highlightDropName} 这条正挂在高亮区，现在去战报页收口最有仪式感。`,
      ctaLabel: '去记战报',
      action: 'open-drops'
    };
  }

  if (rareStory) {
    return pickRandom([
      {
        id: Date.now(),
        tone: 'bright',
        title: `${rareStory.dropName} 的故事还在发光`,
        detail: '这类掉落不会马上退场，它会长期停留在桌宠房间的荣耀位上。',
        ctaLabel: '去看账本',
        action: 'open-drops',
        storyLabel: rareStory.storyLabel
      },
      {
        id: Date.now() + 1,
        tone: 'bright',
        title: '房间里新增了一件传奇收藏',
        detail: `${rareStory.dropName} 已经触发专属剧情，你现在回账本会看到它更像一段完整战报。`,
        ctaLabel: '查看剧情',
        action: 'open-drops',
        storyLabel: rareStory.storyLabel
      }
    ]);
  }

  if (!input.setupGuideCompleted) {
    return pickRandom([
      {
        id: Date.now(),
        tone: 'warm',
        title: '新居整理提醒',
        detail: '把引导继续走完，桌宠的悬浮态、工坊闭环和通知体验都会更稳。',
        ctaLabel: '继续引导',
        action: 'open-setup'
      },
      {
        id: Date.now() + 1,
        tone: 'warm',
        title: '先安家再开刷',
        detail: '现在补掉 Python、Profile 和悬浮态配置，后面每天上线都会更顺。',
        ctaLabel: '打开引导',
        action: 'open-setup'
      }
    ]);
  }

  if (blockingTask) {
    return {
      id: Date.now(),
      tone: 'alert',
      title: '工坊巡检事件',
      detail: `${blockingTask.summary}。这一步补上之后，自动化三条线会更稳。`,
      ctaLabel: '去工坊',
      action: 'open-workshop'
    };
  }

  if (latestRunNeedingWrapUp) {
    return {
      id: Date.now(),
      tone: 'warm',
      title: '收口点还在',
      detail: `${latestRunNeedingWrapUp.mapName} 那轮刚刷完，我还替你把掉落收口点留着。`,
      ctaLabel: '去战报',
      action: 'open-drops'
    };
  }

  if (input.todayDropCount > 0) {
    return pickRandom([
      {
        id: Date.now(),
        tone: 'bright',
        title: '账本翻页提醒',
        detail: `今天已经有 ${input.todayDropCount} 条战果，去战报页看看今天最亮的一条吧。`,
        ctaLabel: '翻看战报',
        action: 'open-drops'
      },
      {
        id: Date.now() + 1,
        tone: 'bright',
        title: '海报素材已更新',
        detail: '账本现在已经有内容感了，再看一眼今天的高亮和热区，会很像成品战报。',
        ctaLabel: '打开账本',
        action: 'open-drops'
      }
    ]);
  }

  if (input.recentRuns.length > 0) {
    const latestRoute = input.recentRuns[0].mapName;
    return pickRandom([
      {
        id: Date.now(),
        tone: 'warm',
        title: '继续上一条路线',
        detail: `${latestRoute} 还是今天最顺手的开局路线，桌宠建议直接沿用。`,
        ctaLabel: `继续 ${latestRoute}`,
        action: 'start-latest'
      },
      {
        id: Date.now() + 1,
        tone: 'warm',
        title: '路线回放完成',
        detail: `我刚在脑内又过了一遍 ${latestRoute} 的节奏，现在直接接着刷会很丝滑。`,
        ctaLabel: '一键续刷',
        action: 'start-latest'
      }
    ]);
  }

  return pickRandom([
    {
      id: Date.now(),
      tone: 'warm',
      title: '今日开局事件',
      detail: '桌宠已经把桌边状态准备好了，先开第一轮让今天的故事动起来。',
      ctaLabel: '开始今天',
      action: 'start-default'
    },
    {
      id: Date.now() + 1,
      tone: 'warm',
      title: '热身路线就绪',
      detail: '现在最适合从熟图热身，等今天第一条掉落出来时桌面气氛会更完整。',
      ctaLabel: '开第一轮',
      action: 'start-default'
    }
  ]);
}
