export interface ParsedAutomationLog {
  time: string;
  task: string;
  action: string;
  success: boolean | null;
  exitCode: string;
  command: string;
  stdout: string;
  stderr: string;
  stdoutPreview: string[];
  stderrPreview: string[];
  headline: string;
  guidance: string;
}

function normalizeValue(value: string): string {
  return value.trim();
}

function pickPreviewLines(block: string, count = 4): string[] {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line !== '(empty)')
    .slice(0, count);
}

function getFirstMeaningfulLine(...blocks: string[]): string {
  for (const block of blocks) {
    const line = block
      .split('\n')
      .map((item) => item.trim())
      .find((item) => item.length > 0 && item !== '(empty)');

    if (line) {
      return line;
    }
  }

  return '';
}

function buildSuccessHeadline(action: string, stdout: string): string {
  if (action.includes('dry-run')) {
    return '试运行完成，计划已经生成。';
  }

  if (action.includes('execute')) {
    return '正式执行完成，建议确认游戏内结果。';
  }

  if (action.includes('record-profile')) {
    return 'Profile 录制完成，关键坐标已经更新。';
  }

  if (action.includes('print-profile')) {
    return '当前 Profile 已输出到日志。';
  }

  if (action.includes('import-legacy-config')) {
    return '旧配置导入完成，建议再跑一次试运行。';
  }

  const firstStdoutLine = getFirstMeaningfulLine(stdout);
  return firstStdoutLine || '本次任务执行完成。';
}

function buildGuidance(success: boolean | null, action: string, stderr: string, stdout: string): string {
  const text = `${stderr}\n${stdout}`.toLowerCase();

  if (success) {
    if (action.includes('dry-run')) {
      return '先核对计划里的格位、次数和等待秒数，确认无误后再正式执行。';
    }

    if (action.includes('execute')) {
      return '建议回到游戏确认合成、金币或仓库状态是否和日志一致。';
    }

    if (action.includes('record-profile')) {
      return '如果后续点击偏位，优先重新录制本任务的关键坐标。';
    }

    if (action.includes('import-legacy-config')) {
      return '旧配置迁入后，最好立刻做一次试运行，确认新 runtime 解释没有偏差。';
    }

    return '这次结果看起来正常，如需深挖细节可以继续展开原始日志。';
  }

  if (text.includes('no module named') || text.includes('modulenotfounderror')) {
    return '当前更像是 Python 依赖没装全，先检查 OCR 或自动化运行时依赖。';
  }

  if (text.includes('not found') || text.includes('未找到') || text.includes('不存在')) {
    return '这次更像路径或文件缺失，优先检查脚本、Profile、旧配置和截图路径。';
  }

  if (text.includes('permission') || text.includes('denied')) {
    return '这次更像权限问题，先确认日志目录、导出目录或外部运行环境是否可写。';
  }

  if (text.includes('整数') || text.includes('invalid literal') || text.includes('valueerror')) {
    return '这次更像输入格式问题，优先回头检查数量、金额、等级和矩阵内容。';
  }

  return '这次执行没有成功，建议先看 stderr 摘要，再回到预检确认是哪一项先变红了。';
}

export function parseAutomationLog(content: string): ParsedAutomationLog | null {
  const normalized = content.replace(/\r\n/g, '\n');
  const stdoutMarker = '\n[stdout]\n';
  const stderrMarker = '\n[stderr]\n';
  const stdoutIndex = normalized.indexOf(stdoutMarker);
  const stderrIndex = normalized.indexOf(stderrMarker);

  if (stdoutIndex === -1 || stderrIndex === -1) {
    return null;
  }

  const header = normalized.slice(0, stdoutIndex).trim();
  const stdout = normalized.slice(stdoutIndex + stdoutMarker.length, stderrIndex).trim();
  const stderr = normalized.slice(stderrIndex + stderrMarker.length).trim();
  const meta = new Map<string, string>();

  for (const line of header.split('\n')) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = normalizeValue(line.slice(0, separatorIndex));
    const value = normalizeValue(line.slice(separatorIndex + 1));
    meta.set(key, value);
  }

  if (!meta.has('Task') && !meta.has('Action') && !meta.has('Command')) {
    return null;
  }

  const successText = meta.get('Success');
  const success =
    successText === 'true' ? true : successText === 'false' ? false : null;
  const action = meta.get('Action') ?? '';
  const headline = success
    ? buildSuccessHeadline(action, stdout)
    : getFirstMeaningfulLine(stderr, stdout) || '本次执行失败，请查看日志细节。';

  return {
    time: meta.get('Time') ?? '',
    task: meta.get('Task') ?? '',
    action,
    success,
    exitCode: meta.get('Exit Code') ?? '',
    command: meta.get('Command') ?? '',
    stdout,
    stderr,
    stdoutPreview: pickPreviewLines(stdout),
    stderrPreview: pickPreviewLines(stderr),
    headline,
    guidance: buildGuidance(success, action, stderr, stdout)
  };
}
