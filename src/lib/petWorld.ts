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
}

export interface PetWorldInput extends PetPersonaInput {
  now: number;
}

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

export function buildPetScene(input: PetWorldInput): PetScene {
  const hour = new Date(input.now).getHours();
  const ambientPrefix = getAmbientPrefix(hour);
  const blockingTask = getBlockingTask(input.preflight);
  const warningTask = getWarningTask(input.preflight);

  if (input.highlightDropName) {
    return {
      id: 'altar',
      label: '凯旋祭台',
      propLabel: '高亮战利品',
      auraLabel: '庆祝中',
      ambientLine: `${ambientPrefix}，这条高亮战果正被摆在最醒目的位置。`,
      detail: '最适合收口、截图、记战报的高光时刻。'
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

export function createPetEvent(input: PetWorldInput): PetEvent {
  const blockingTask = getBlockingTask(input.preflight);
  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp(
    input.recentRuns,
    input.recentDrops
  );

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
        detail: '现在补掉 Python、Profile 和悬浮态配置，后面每天上线都能更顺。',
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
        detail: '账本现在已经有内容感了，再看一眼今天的高亮和场景热区，会很像成品战报。',
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
