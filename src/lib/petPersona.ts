import type {
  ActiveRun,
  AutomationPreflightResponse,
  DropRecord,
  RunRecord
} from '../types';

export type PetEmotion =
  | 'idle'
  | 'curious'
  | 'focused'
  | 'alert'
  | 'proud'
  | 'celebrate';

export interface PetPersonaInput {
  activeRun: ActiveRun | null;
  recentRuns: RunRecord[];
  recentDrops: DropRecord[];
  todayCount: number;
  todayDropCount: number;
  liveDurationText: string;
  setupGuideCompleted: boolean;
  preflight: AutomationPreflightResponse | null;
  highlightDropName: string;
}

export interface PetPersona {
  emotion: PetEmotion;
  emotionLabel: string;
  headline: string;
  statusLine: string;
  scripts: string[];
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

export function buildPetPersona(input: PetPersonaInput): PetPersona {
  const tasks = input.preflight?.tasks ?? [];
  const blockingTask = tasks.find((task) => task.status === 'error');
  const warningTask = tasks.find((task) => task.status === 'warning');
  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp(
    input.recentRuns,
    input.recentDrops
  );

  if (input.highlightDropName) {
    return {
      emotion: 'celebrate',
      emotionLabel: '爆金时刻',
      headline: `${input.highlightDropName} 出现了`,
      statusLine: '刚刚那条高亮战果值得立刻收口。',
      scripts: [
        '去战报页记下来，这会是今天情绪最高的一笔。',
        '我已经把这条掉落挂到最前面了。',
        '如果继续刷，今天的战果脉冲会更漂亮。'
      ]
    };
  }

  if (input.activeRun) {
    return {
      emotion: 'focused',
      emotionLabel: '专注陪刷',
      headline: `${input.activeRun.mapName} · ${input.liveDurationText}`,
      statusLine: '这一轮正在计时里，我会替你盯着节奏。',
      scripts: [
        '刷完记得回来点完成，我会继续接住今天的节奏。',
        '如果中途掉了好货，直接去战报页收口就好。',
        '当前这条路线已经被我记成今天的主线之一了。'
      ]
    };
  }

  if (!input.setupGuideCompleted) {
    return {
      emotion: 'curious',
      emotionLabel: '等你安家',
      headline: '先把首启闭环走完',
      statusLine: '把环境、Profile 和桌宠形态安顿好，后面就能一直陪你刷。',
      scripts: [
        '我现在更像一只还没安家的宠物，先带我把引导收完。',
        '引导结束后，我就会从工具面板变成真正的桌面陪刷助手。',
        '先补这一段，后面每天打开就能直接继续。'
      ]
    };
  }

  if (blockingTask) {
    return {
      emotion: 'alert',
      emotionLabel: '工坊告警',
      headline: '自动化还有条件没补齐',
      statusLine: blockingTask.summary,
      scripts: [
        '先去工坊补掉阻塞项，再开自动化会稳很多。',
        '我已经替你盯住最关键的那一条了，不用自己翻日志找。',
        '今天的主流程还在，补完这一项就能无缝接回去。'
      ]
    };
  }

  if (latestRunNeedingWrapUp) {
    return {
      emotion: 'curious',
      emotionLabel: '等你收口',
      headline: `${latestRunNeedingWrapUp.mapName} 那一轮刚刷完`,
      statusLine: '上一轮已经结束，但战报里还没有新的掉落记录。',
      scripts: [
        '先记掉落，或者直接沿用这条路线继续开下一轮都行。',
        '我已经帮你把中断点留在这里了，回来时不会断节奏。',
        '这种小收口最适合交给我盯着。'
      ]
    };
  }

  if (warningTask) {
    return {
      emotion: 'curious',
      emotionLabel: '工坊提醒',
      headline: '今天的联调条件基本齐了',
      statusLine: warningTask.summary,
      scripts: [
        '你可以先继续刷，也可以顺手去工坊看一眼提醒项。',
        '我不急着催你修，只是把风险放到你眼前。',
        '现在的整体状态已经接近可直接开跑。'
      ]
    };
  }

  if (input.todayDropCount > 0) {
    return {
      emotion: 'proud',
      emotionLabel: '今天有战果',
      headline: `今天已经收了 ${input.todayDropCount} 条战果`,
      statusLine: '桌宠账本已经热起来了，继续刷会越来越像一份完整战报。',
      scripts: [
        '最近那条战利品我还记着，随时都能带你回去看。',
        '今天已经不是空账本了，气氛到位了。',
        '如果再多刷几轮，周报会变得很好看。'
      ]
    };
  }

  if (input.todayCount > 0) {
    return {
      emotion: 'focused',
      emotionLabel: '节奏已起',
      headline: `今天已经刷了 ${input.todayCount} 轮`,
      statusLine: '路线节奏已经起来了，最顺手的做法就是继续沿用最近那条线。',
      scripts: [
        '我已经记住你今天的节奏了，再开一轮会非常顺。',
        '现在切去战报或工坊，我也能把上下文接住。',
        '这种时候最适合把桌宠留在桌边盯状态。'
      ]
    };
  }

  return {
    emotion: 'idle',
    emotionLabel: '桌边待命',
    headline: '我在桌面等你开刷',
    statusLine: '先开第一轮，我就能开始记录路线、时间和战果。',
    scripts: [
      '从一张熟图热身最舒服，我会把今天的节奏慢慢养起来。',
      '如果你只是想看状态，我会一直在这里待命。',
      '我现在像一只安静蹲在桌边的小宠物，等你发出第一条指令。'
    ]
  };
}
