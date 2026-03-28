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

export type PetInteractionKind = 'headpat' | 'cheer' | 'idle-play';

export interface PetInteractionCue {
  id: number;
  kind: PetInteractionKind;
  emotion: PetEmotion;
  emotionLabel: string;
  headline: string;
  statusLine: string;
  scripts: string[];
  durationMs: number;
}

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
  interactionCue?: PetInteractionCue | null;
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

function makeInteractionId() {
  return Date.now() + Math.floor(Math.random() * 10_000);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

export function createPetInteractionCue(
  kind: PetInteractionKind,
  input: PetPersonaInput
): PetInteractionCue {
  const tasks = input.preflight?.tasks ?? [];
  const blockingTask = tasks.find((task) => task.status === 'error');
  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp(
    input.recentRuns,
    input.recentDrops
  );

  if (kind === 'headpat') {
    if (input.highlightDropName) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: 'celebrate',
        emotionLabel: '被你夸到了',
        headline: `${input.highlightDropName} 这条真的亮`,
        statusLine: '我已经把这条高亮战果抱紧了，等你回账本里把它记漂亮。',
        scripts: [
          '这一下摸头我收到了，今天这条掉落值得多看两眼。',
          '继续刷也行，先去战报收口也行，我会把高亮留在最前面。',
          '像这种时刻，桌宠就该跟你一起得意一下。'
        ],
        durationMs: 3600
      };
    }

    if (input.activeRun) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: 'focused',
        emotionLabel: '收到招呼',
        headline: '我还在陪你盯这一轮',
        statusLine: `${input.activeRun.mapName} 已经刷了 ${input.liveDurationText}，你继续推图，我来记节奏。`,
        scripts: [
          '摸到我了，我就继续替你看着这轮时长和收口点。',
          '如果这一轮中途爆货，回来记一笔就行，我还在这里。',
          '专注是我的事，你只管刷图。'
        ],
        durationMs: 3200
      };
    }

    if (!input.setupGuideCompleted) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: 'curious',
        emotionLabel: '待完成引导',
        headline: '我在，先把引导走完',
        statusLine: '再给我一点准备时间，等环境和 Profile 补齐之后，我就能更稳地陪刷。',
        scripts: [
          '摸头这种互动我很喜欢，顺手把引导也带我走完吧。',
          '等我安家完成，悬浮态和工坊闭环都会更顺。',
          '现在先把底子打牢，后面每天上线都能直接开刷。'
        ],
        durationMs: 3400
      };
    }

    if (latestRunNeedingWrapUp) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: 'curious',
        emotionLabel: '等你收口',
        headline: `${latestRunNeedingWrapUp.mapName} 那轮我还记着`,
        statusLine: '上次刷完的中断点还在，先去补掉落，或者直接沿用那条路线继续都行。',
        scripts: [
          '我会把收口点守住，不会让今天的节奏断掉。',
          '你点我一下，我就提醒你最该做的下一步。',
          '这种细碎收尾很适合交给桌宠盯着。'
        ],
        durationMs: 3200
      };
    }

    return {
      id: makeInteractionId(),
      kind,
      emotion: input.todayDropCount > 0 ? 'proud' : 'idle',
      emotionLabel: input.todayDropCount > 0 ? '今天有战果' : '桌边待命',
      headline: '我一直都在桌边',
      statusLine:
        input.todayDropCount > 0
          ? `今天已经收了 ${input.todayDropCount} 条战果，我会继续帮你把账本看紧。`
          : '先开一轮，我就能开始记路线、时长和掉落了。',
      scripts: [
        '摸头收到，今天这份陪刷状态我会继续稳稳接住。',
        '如果你只是想确认我还在，我当然在。',
        '桌宠最重要的事情，就是让你回来时上下文还在。'
      ],
      durationMs: 3000
    };
  }

  if (kind === 'cheer') {
    if (input.highlightDropName) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: 'celebrate',
        emotionLabel: '高亮庆祝',
        headline: `${input.highlightDropName} 值得放烟花`,
        statusLine: '这条高亮够今天整份战报提气了，记完它，首页都会更有成就感。',
        scripts: [
          '双击这一下很对味，今天的好运气我先替你喊出来。',
          '去战报写下它，这会是今天最亮的一行。',
          '像这种掉落，桌宠就该陪你一起庆祝。'
        ],
        durationMs: 4200
      };
    }

    if (input.todayDropCount > 0) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: 'proud',
        emotionLabel: '继续冲',
        headline: '今天已经有战果了',
        statusLine: '气势已经起来了，再多刷几轮，周报和月报都会更像一份完整战报。',
        scripts: [
          '我替你把今天的运气再往上拱一把。',
          '现在最适合沿着今天的主路线再推几轮。',
          '这声庆祝不是结束，是继续冲。'
        ],
        durationMs: 3800
      };
    }

    if (input.activeRun) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: 'focused',
        emotionLabel: '这轮加油',
        headline: `${input.activeRun.mapName} 这轮冲一把`,
        statusLine: '计时我盯着，情绪我也给你抬起来，回来时直接点完成本轮就行。',
        scripts: [
          '这一轮回来，说不定就能把今天的第一条高亮带回来。',
          '你专心刷，我专心把桌面的仪式感撑起来。',
          '双击已生效，今天这轮就当成好运加持。'
        ],
        durationMs: 3400
      };
    }

    return {
      id: makeInteractionId(),
      kind,
      emotion: 'celebrate',
      emotionLabel: '先热个场',
      headline: '把今天的气势先拉满',
      statusLine: '第一轮还没开也没关系，先把氛围点起来，接下来更容易进入节奏。',
      scripts: [
        'QQ 宠物那种桌边陪伴感，现在就是这个味道。',
        '先给今天打一声气，等第一条掉落出来时会更有仪式感。',
        '准备好了就去开一轮，我会把今天的故事记下来。'
      ],
      durationMs: 3600
    };
  }

  const idleVariants: Array<Omit<PetInteractionCue, 'id' | 'kind'>> = [
    {
      emotion: 'idle',
      emotionLabel: '桌边晃一圈',
      headline: '我在桌边轻轻巡逻',
      statusLine: '刚才顺手看了一眼今天的节奏，没有新动作时我会自己小幅活动一下。',
      scripts: [
        '不用管我，我只是在桌边转一圈，确认今天的状态都还在。',
        '这种小动作会让桌宠更像一直陪着你，而不是静止控件。',
        '你回来时，我会像刚刚一直都在这里一样。'
      ],
      durationMs: 3200
    },
    {
      emotion: 'curious',
      emotionLabel: '偷看战报',
      headline: '我刚翻了一眼战利品账本',
      statusLine:
        input.todayDropCount > 0
          ? `今天已经有 ${input.todayDropCount} 条记录了，账本开始有点战报味了。`
          : '账本今天还挺干净，等你下一条掉落把它点亮。',
      scripts: [
        '我会偶尔自己看一眼账本，确认掉落和截图都还在。',
        '如果待会儿出货，我会第一时间把情绪切到庆祝态。',
        '桌宠闲着时也该有点小动作，而不是完全没反应。'
      ],
      durationMs: 3600
    },
    {
      emotion: 'focused',
      emotionLabel: '整理符文',
      headline: '我在脑内排了一遍工坊按钮',
      statusLine:
        blockingTask?.summary ??
        '符文、宝石和金币三条线我都还记得，下次点进工坊时会更顺手。',
      scripts: [
        '工坊扁平化之后，我会一直帮你记得哪个入口最常用。',
        '闲着的时候整理一下工坊，是桌宠该做的背景工作。',
        '等你切过去时，应该能一眼看到最想点的按钮。'
      ],
      durationMs: 3400
    }
  ];

  if (latestRunNeedingWrapUp) {
    idleVariants.push({
      emotion: 'curious',
      emotionLabel: '盯着收口点',
      headline: `${latestRunNeedingWrapUp.mapName} 那轮还挂着`,
      statusLine: '我刚又确认了一次中断点，想继续刷的时候可以直接沿用，不会丢上下文。',
      scripts: [
        '我会偶尔自己回头看一下上次停在哪，确保你回来就能接着刷。',
        '收口点没丢，节奏也就没丢。',
        '这类“记住你停在哪”的细节，正是桌宠该负责的事。'
      ],
      durationMs: 3600
    });
  }

  if (input.todayDropCount > 0) {
    idleVariants.push({
      emotion: 'proud',
      emotionLabel: '战果回味',
      headline: '我在回味今天的高光时刻',
      statusLine: `今天已经收了 ${input.todayDropCount} 条掉落，战报看起来比刚开机时有生命力多了。`,
      scripts: [
        '这种静静回味今天战果的小动作，会让桌宠更像活的。',
        '如果再出一条高亮，我会立刻切成庆祝态。',
        '周报海报会喜欢这种有内容的一天。'
      ],
      durationMs: 3800
    });
  }

  const selected = pickRandom(idleVariants);
  return {
    id: makeInteractionId(),
    kind,
    ...selected
  };
}

export function buildPetPersona(input: PetPersonaInput): PetPersona {
  if (input.interactionCue) {
    return {
      emotion: input.interactionCue.emotion,
      emotionLabel: input.interactionCue.emotionLabel,
      headline: input.interactionCue.headline,
      statusLine: input.interactionCue.statusLine,
      scripts: input.interactionCue.scripts
    };
  }

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
      statusLine: '刚刚那条高亮战果值得立刻收口，写进战报会特别有成就感。',
      scripts: [
        '去战报页记下来吧，这会是今天最亮的一行。',
        '我已经把这条掉落挂到最前排了。',
        '如果继续刷，今天的战果脉冲会更好看。'
      ]
    };
  }

  if (input.activeRun) {
    return {
      emotion: 'focused',
      emotionLabel: '专注陪刷',
      headline: `${input.activeRun.mapName} 路 ${input.liveDurationText}`,
      statusLine: '这一轮正在计时，我会继续替你盯着节奏和收口点。',
      scripts: [
        '刷完记得回来点完成本轮，我会继续接住今天的节奏。',
        '如果中途爆货，直接去战报页收口就行。',
        '当前这条路线已经被我记成今天的主线之一了。'
      ]
    };
  }

  if (!input.setupGuideCompleted) {
    return {
      emotion: 'curious',
      emotionLabel: '待完成引导',
      headline: '还差几步就能正式开用',
      statusLine: '先把环境、依赖和 Profile 补齐，我会明确告诉你下一步该点什么。',
      scripts: [
        '现在不是“安家中”这种抽象状态了，你只要照着下一步补就行。',
        '引导结束后，我会从工具面板变成真正能直接用的桌面陪刷助手。',
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
        '你可以先继续刷，也可以顺手去工坊看一下提醒项。',
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
      statusLine: '路线节奏已经起来了，最顺手的做法就是继续沿用最近那条路线。',
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
      '如果你只是想看看状态，我会一直在这里待命。',
      '我现在像一只安静蹲在桌边的小宠物，等你发出第一条指令。'
    ]
  };
}
