import { exec, execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BrowserWindow,
  Menu,
  Notification,
  Tray,
  app,
  dialog,
  globalShortcut,
  ipcMain,
  nativeImage,
  shell,
  type MenuItemConstructorOptions
} from 'electron';
import type {
  AppData,
  AutomationAdminAction,
  AutomationCheckItem,
  AutomationDrafts,
  AutomationLogDocument,
  AutomationPreflightInput,
  AutomationPreflightResponse,
  AutomationPreflightStatus,
  CreateDropInput,
  DropOcrPreviewInput,
  DropOcrResult,
  ExportTextFileInput,
  ExportTextFileResult,
  IntegrationConfig,
  IntegrationId,
  IntegrationRunResult,
  RunAutomationAdminInput,
  RunAutomationTaskInput,
  SaveImageInput,
  StartRunInput,
  UpdateIntegrationInput,
  UpdateSettingsInput,
  WindowMode
} from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, '../..');
const toggleWindowShortcut = 'Alt+Shift+D';

function getPythonRuntimeRoot(): string {
  if (app.isPackaged) {
    const unpackedRuntimeRoot = join(
      process.resourcesPath,
      'app.asar.unpacked',
      'automation',
      'python_runtime'
    );

    if (existsSync(unpackedRuntimeRoot)) {
      return unpackedRuntimeRoot;
    }
  }

  return join(workspaceRoot, 'automation', 'python_runtime');
}

const pythonRuntimeRoot = getPythonRuntimeRoot();

const dataFilePath = () => join(app.getPath('userData'), 'd2-pet', 'data.json');
const screenshotRoot = () => join(app.getPath('userData'), 'd2-pet', 'screenshots');
const automationLogRoot = () => join(app.getPath('userData'), 'd2-pet', 'automation-logs');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let hasShownTrayHint = false;
let resolvedPythonCommand: string | null = null;

function getWindowMetrics(mode: WindowMode): {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  resizable: boolean;
} {
  if (mode === 'floating') {
    return {
      width: 230,
      height: 280,
      minWidth: 230,
      minHeight: 280,
      resizable: false
    };
  }

  return {
    width: 420,
    height: 760,
    minWidth: 380,
    minHeight: 640,
    resizable: true
  };
}

function getPythonCandidates(): string[] {
  const home = app.getPath('home');

  return [
    join(process.resourcesPath, 'python', 'python.exe'),
    join(home, 'AppData', 'Local', 'Python', 'bin', 'python.exe'),
    join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python314', 'python.exe'),
    join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python313', 'python.exe'),
    join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'python.exe'),
    join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe'),
    join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python310', 'python.exe'),
    'python'
  ];
}

function resolvePythonCommand(): string {
  if (resolvedPythonCommand) {
    return resolvedPythonCommand;
  }

  const candidate = getPythonCandidates().find((item) => {
    return item === 'python' || existsSync(item);
  });

  resolvedPythonCommand = candidate ?? 'python';
  return resolvedPythonCommand;
}

function getDayKey(input: Date): string {
  const year = input.getFullYear();
  const month = String(input.getMonth() + 1).padStart(2, '0');
  const day = String(input.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTimestamp(input: Date): string {
  const hours = String(input.getHours()).padStart(2, '0');
  const minutes = String(input.getMinutes()).padStart(2, '0');
  const seconds = String(input.getSeconds()).padStart(2, '0');
  return `${hours}${minutes}${seconds}`;
}

function buildId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeFileName(value: string): string {
  const trimmed = value.trim().replace(/[\\/:*?"<>|]/g, '-');
  return trimmed.length > 0 ? trimmed.slice(0, 40) : 'file';
}

function resolveMaybeAbsolutePath(inputPath: string): string {
  if (isAbsolute(inputPath)) {
    return inputPath;
  }

  return resolve(workspaceRoot, inputPath);
}

function formatDurationText(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${minutes} 分 ${seconds} 秒`;
}

function getRuntimeScriptPath(id: IntegrationId): string {
  switch (id) {
    case 'rune-cube':
      return join(pythonRuntimeRoot, 'tasks', 'rune_cubing.py');
    case 'gem-cube':
      return join(pythonRuntimeRoot, 'tasks', 'gem_cubing.py');
    case 'drop-shared-gold':
      return join(pythonRuntimeRoot, 'tasks', 'gold_drop.py');
  }
}

function getDropOcrScriptPath(): string {
  return join(pythonRuntimeRoot, 'tasks', 'drop_ocr.py');
}

function getDefaultProfilePath(id: IntegrationId): string {
  switch (id) {
    case 'rune-cube':
      return join(pythonRuntimeRoot, 'config', 'rune_profile.json');
    case 'gem-cube':
      return join(pythonRuntimeRoot, 'config', 'gem_profile.json');
    case 'drop-shared-gold':
      return join(pythonRuntimeRoot, 'config', 'gold_drop_profile.json');
  }
}

function getDefaultLegacyConfigPath(id: IntegrationId): string | undefined {
  switch (id) {
    case 'rune-cube':
      return 'E:\\Diablo2Tools\\rune_cubing\\rune_config.json';
    case 'gem-cube':
      return 'E:\\Diablo2Tools\\gem_cubing\\gem_config.json';
    case 'drop-shared-gold':
      return undefined;
  }
}

function defaultIntegrations(): IntegrationConfig[] {
  return [
    {
      id: 'rune-cube',
      title: '自动合成低级符文',
      description: '读取符文数量后直接调用新的 Python runtime，支持试运行、录制 profile 和导入旧配置。',
      commandLine: 'builtin:rune_cubing',
      workingDirectory: pythonRuntimeRoot,
      profilePath: getDefaultProfilePath('rune-cube'),
      legacyConfigPath: getDefaultLegacyConfigPath('rune-cube'),
      supportsLegacyImport: true,
      enabled: true,
      lastStatus: 'idle'
    },
    {
      id: 'gem-cube',
      title: '自动合成宝石',
      description: '支持矩阵输入、截图识别、profile 录制和旧配置导入，方便把旧 OCR 能力接回桌宠。',
      commandLine: 'builtin:gem_cubing',
      workingDirectory: pythonRuntimeRoot,
      profilePath: getDefaultProfilePath('gem-cube'),
      legacyConfigPath: getDefaultLegacyConfigPath('gem-cube'),
      supportsLegacyImport: true,
      enabled: true,
      lastStatus: 'idle'
    },
    {
      id: 'drop-shared-gold',
      title: '共享仓库丢金币',
      description: '按总额和角色等级计算分批方案，支持试运行、profile 录制和日志查看。',
      commandLine: 'builtin:gold_drop',
      workingDirectory: pythonRuntimeRoot,
      profilePath: getDefaultProfilePath('drop-shared-gold'),
      supportsLegacyImport: false,
      enabled: true,
      lastStatus: 'idle'
    }
  ];
}

function defaultAutomationDrafts(): AutomationDrafts {
  return {
    runeCounts: '12 6 0 0 0 0 0 0 0',
    runeWaitSeconds: 3,
    gemInputMode: 'matrix',
    gemMatrix: '10 5 2 0 0; 8 4 1 0 0',
    gemImagePath: '',
    gemWaitSeconds: 3,
    goldAmount: '20000000',
    goldLevel: '90',
    goldWaitSeconds: 5,
    allowInactiveWindow: false
  };
}

function createDefaultData(): AppData {
  return {
    activeRun: null,
    runHistory: [],
    drops: [],
    integrations: defaultIntegrations(),
    automationDrafts: defaultAutomationDrafts(),
    settings: {
      alwaysOnTop: true,
      launchOnStartup: false,
      notificationsEnabled: true,
      windowMode: 'panel'
    }
  };
}

function mergeIntegrations(existing: IntegrationConfig[] | undefined): IntegrationConfig[] {
  const current = existing ?? [];
  return defaultIntegrations().map((item) => ({
    ...item,
    ...current.find((integration) => integration.id === item.id)
  }));
}

function normalizeData(input: Partial<AppData> | undefined): AppData {
  const fallback = createDefaultData();
  return {
    activeRun: input?.activeRun ?? fallback.activeRun,
    runHistory: Array.isArray(input?.runHistory) ? input.runHistory : fallback.runHistory,
    drops: Array.isArray(input?.drops) ? input.drops : fallback.drops,
    integrations: mergeIntegrations(input?.integrations),
    automationDrafts: {
      ...fallback.automationDrafts,
      ...input?.automationDrafts
    },
    settings: {
      alwaysOnTop: input?.settings?.alwaysOnTop ?? fallback.settings.alwaysOnTop,
      launchOnStartup:
        input?.settings?.launchOnStartup ?? fallback.settings.launchOnStartup,
      notificationsEnabled:
        input?.settings?.notificationsEnabled ?? fallback.settings.notificationsEnabled,
      windowMode: input?.settings?.windowMode ?? fallback.settings.windowMode
    }
  };
}

function getLaunchOnStartupOptions(): { path: string; args: string[] } {
  if (app.isPackaged) {
    return { path: process.execPath, args: [] };
  }

  return {
    path: process.execPath,
    args: [app.getAppPath()]
  };
}

function getLaunchOnStartupState(): boolean {
  try {
    const options = getLaunchOnStartupOptions();
    return app.getLoginItemSettings(options).openAtLogin;
  } catch {
    return false;
  }
}

function applyLaunchOnStartupState(value: boolean): boolean {
  try {
    const options = getLaunchOnStartupOptions();
    app.setLoginItemSettings({
      openAtLogin: value,
      path: options.path,
      args: options.args
    });
    return getLaunchOnStartupState();
  } catch {
    return false;
  }
}

async function ensureFile(): Promise<void> {
  const targetPath = dataFilePath();
  await mkdir(dirname(targetPath), { recursive: true });

  if (!existsSync(targetPath)) {
    await writeFile(targetPath, JSON.stringify(createDefaultData(), null, 2), 'utf8');
  }
}

async function readDataStore(): Promise<AppData> {
  await ensureFile();
  const content = await readFile(dataFilePath(), 'utf8');
  const parsed = JSON.parse(content) as Partial<AppData>;
  const normalized = normalizeData(parsed);
  if (app.isReady()) {
    normalized.settings.launchOnStartup = getLaunchOnStartupState();
  }
  return normalized;
}

async function writeDataStore(data: AppData): Promise<AppData> {
  await ensureFile();
  const normalized = normalizeData(data);
  await writeFile(dataFilePath(), JSON.stringify(normalized, null, 2), 'utf8');
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('data:changed', normalized);
  }
  void refreshTrayMenu(normalized);
  return normalized;
}

function applyAlwaysOnTopState(value: boolean): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(value, 'screen-saver');
  }
}

async function applyWindowModeState(mode: WindowMode): Promise<void> {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const metrics = getWindowMetrics(mode);
  mainWindow.setSkipTaskbar(mode === 'floating');
  mainWindow.setResizable(metrics.resizable);
  mainWindow.setMinimumSize(metrics.minWidth, metrics.minHeight);

  if (metrics.resizable) {
    mainWindow.setMaximumSize(10000, 10000);
  } else {
    mainWindow.setMaximumSize(metrics.width, metrics.height);
  }

  mainWindow.setSize(metrics.width, metrics.height, true);
  mainWindow.center();
}

async function ensureFolderAndOpen(targetPath: string): Promise<string> {
  await mkdir(targetPath, { recursive: true });
  return shell.openPath(targetPath);
}

function createTrayImage() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <defs>
        <radialGradient id="core" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffe9b2"/>
          <stop offset="22%" stop-color="#ffb866"/>
          <stop offset="55%" stop-color="#bf451f"/>
          <stop offset="100%" stop-color="#2d0805"/>
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#170a08"/>
      <circle cx="32" cy="32" r="21" fill="url(#core)"/>
      <circle cx="32" cy="32" r="26" fill="none" stroke="#f3c575" stroke-width="2.5" opacity="0.9"/>
      <circle cx="32" cy="32" r="29" fill="none" stroke="#7a2b18" stroke-width="2" opacity="0.7"/>
      <circle cx="24" cy="28" r="3.3" fill="#fff2c7"/>
      <circle cx="40" cy="28" r="3.3" fill="#fff2c7"/>
    </svg>
  `.trim();

  return nativeImage
    .createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`)
    .resize({ width: 16, height: 16 });
}

function showMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
  void refreshTrayMenu();
}

function hideMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.hide();
  void refreshTrayMenu();
  if (!hasShownTrayHint) {
    hasShownTrayHint = true;
    void sendDesktopNotification(
      '桌宠已收起到托盘',
      `按 ${toggleWindowShortcut} 可以重新显示桌宠。`
    );
  }
}

function toggleMainWindowVisibility(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (mainWindow.isVisible()) {
    hideMainWindow();
  } else {
    showMainWindow();
  }
}

async function sendDesktopNotification(title: string, body: string): Promise<void> {
  if (!Notification.isSupported()) {
    return;
  }

  const data = await readDataStore();
  if (!data.settings.notificationsEnabled) {
    return;
  }

  const notification = new Notification({
    title,
    body,
    silent: false
  });

  notification.on('click', () => {
    showMainWindow();
  });

  notification.show();
}

async function toggleAlwaysOnTopFromTray(): Promise<void> {
  const data = await readDataStore();
  data.settings.alwaysOnTop = !data.settings.alwaysOnTop;
  const nextData = await writeDataStore(data);
  applyAlwaysOnTopState(nextData.settings.alwaysOnTop);
}

async function toggleLaunchOnStartupFromTray(): Promise<void> {
  const data = await readDataStore();
  data.settings.launchOnStartup = applyLaunchOnStartupState(
    !data.settings.launchOnStartup
  );
  await writeDataStore(data);
}

async function toggleNotificationsFromTray(): Promise<void> {
  const data = await readDataStore();
  data.settings.notificationsEnabled = !data.settings.notificationsEnabled;
  const nextData = await writeDataStore(data);
  if (nextData.settings.notificationsEnabled) {
    void sendDesktopNotification('系统通知已开启', '后续刷图、掉落和自动化结果会在这里提醒你。');
  }
}

async function toggleWindowModeFromTray(): Promise<void> {
  const data = await readDataStore();
  data.settings.windowMode =
    data.settings.windowMode === 'floating' ? 'panel' : 'floating';
  const nextData = await writeDataStore(data);
  await applyWindowModeState(nextData.settings.windowMode);
  applyAlwaysOnTopState(nextData.settings.alwaysOnTop);
}

async function refreshTrayMenu(data?: AppData): Promise<void> {
  if (!tray) {
    return;
  }

  const currentData = data ?? (await readDataStore());
  const template: MenuItemConstructorOptions[] = [
    {
      label: mainWindow?.isVisible() ? '隐藏桌宠' : '显示桌宠',
      click: () => toggleMainWindowVisibility()
    },
    {
      label: '始终置顶',
      type: 'checkbox',
      checked: currentData.settings.alwaysOnTop,
      click: () => {
        void toggleAlwaysOnTopFromTray();
      }
    },
    {
      label: '开机自启',
      type: 'checkbox',
      checked: currentData.settings.launchOnStartup,
      click: () => {
        void toggleLaunchOnStartupFromTray();
      }
    },
    {
      label: '系统通知',
      type: 'checkbox',
      checked: currentData.settings.notificationsEnabled,
      click: () => {
        void toggleNotificationsFromTray();
      }
    },
    {
      label:
        currentData.settings.windowMode === 'floating'
          ? '切换为面板模式'
          : '切换为悬浮模式',
      click: () => {
        void toggleWindowModeFromTray();
      }
    },
    { type: 'separator' },
    {
      label: '打开截图目录',
      click: () => {
        void ensureFolderAndOpen(screenshotRoot());
      }
    },
    {
      label: '打开自动化日志目录',
      click: () => {
        void ensureFolderAndOpen(automationLogRoot());
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ];

  tray.setToolTip(`暗黑 2 桌宠助手\n${toggleWindowShortcut} 显示/隐藏`);
  tray.setContextMenu(Menu.buildFromTemplate(template));
}

function createTray(): void {
  if (tray) {
    return;
  }

  tray = new Tray(createTrayImage());
  tray.on('click', () => showMainWindow());
  tray.on('double-click', () => toggleMainWindowVisibility());
  void refreshTrayMenu();
}

function registerGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
  globalShortcut.register(toggleWindowShortcut, () => {
    toggleMainWindowVisibility();
  });
}

async function savePngFromDataUrl(payload: SaveImageInput): Promise<string> {
  const matches = payload.dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!matches) {
    throw new Error('当前只支持 PNG 截图粘贴保存。');
  }

  const now = new Date();
  const folder = join(screenshotRoot(), getDayKey(now));
  const filename = `${getTimestamp(now)}-${sanitizeFileName(payload.suggestedName)}.png`;
  const fullPath = join(folder, filename);

  await mkdir(folder, { recursive: true });
  await writeFile(fullPath, Buffer.from(matches[1], 'base64'));
  return fullPath;
}

function executeCommand(commandLine: string, cwd?: string): Promise<IntegrationRunResult> {
  return new Promise((resolveResult) => {
    exec(
      commandLine,
      {
        cwd: cwd || undefined,
        windowsHide: true,
        encoding: 'utf8',
        maxBuffer: 4 * 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (error) {
          resolveResult({
            success: false,
            code: typeof error.code === 'undefined' ? null : error.code,
            stdout: stdout.trim(),
            stderr: stderr.trim() || error.message
          });
          return;
        }

        resolveResult({
          success: true,
          code: 0,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      }
    );
  });
}

function executeFileCommand(
  command: string,
  args: string[],
  cwd?: string,
  windowsHide = true
): Promise<IntegrationRunResult> {
  return new Promise((resolveResult) => {
    execFile(
      command,
      args,
      {
        cwd: cwd || undefined,
        windowsHide,
        encoding: 'utf8',
        maxBuffer: 4 * 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (error) {
          resolveResult({
            success: false,
            code: typeof error.code === 'undefined' ? null : error.code,
            stdout: stdout.trim(),
            stderr: stderr.trim() || error.message
          });
          return;
        }

        resolveResult({
          success: true,
          code: 0,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      }
    );
  });
}

function quoteArg(value: string): string {
  return value.includes(' ') ? `"${value}"` : value;
}

function parseJsonOutput<T>(result: IntegrationRunResult): T {
  const content = result.stdout.trim();
  if (!content) {
    throw new Error(result.stderr || 'Python task did not return any JSON output.');
  }

  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON output: ${
        error instanceof Error ? error.message : 'unknown parse error'
      }`
    );
  }
}

async function writeAutomationLog(
  id: IntegrationId,
  actionLabel: string,
  command: string,
  args: string[],
  result: IntegrationRunResult
): Promise<string> {
  const now = new Date();
  const folder = join(automationLogRoot(), getDayKey(now));
  const filename = `${getTimestamp(now)}-${id}-${sanitizeFileName(actionLabel)}.log`;
  const fullPath = join(folder, filename);
  const commandText = [command, ...args].map(quoteArg).join(' ');
  const content = [
    `Time: ${now.toISOString()}`,
    `Task: ${id}`,
    `Action: ${actionLabel}`,
    `Success: ${result.success}`,
    `Exit Code: ${String(result.code ?? '')}`,
    `Command: ${commandText}`,
    '',
    '[stdout]',
    result.stdout || '(empty)',
    '',
    '[stderr]',
    result.stderr || '(empty)'
  ].join('\n');

  await mkdir(folder, { recursive: true });
  await writeFile(fullPath, content, 'utf8');
  return fullPath;
}

function summarizeActionResult(
  actionLabel: 'dry-run' | 'execute' | AutomationAdminAction,
  result: IntegrationRunResult
): string {
  if (!result.success) {
    return (result.stderr || result.stdout || '执行失败。').slice(0, 160);
  }

  switch (actionLabel) {
    case 'dry-run':
      return '试运行完成，可查看日志里的计划和输出。';
    case 'execute':
      return '执行完成，可查看日志确认细节。';
    case 'record-profile':
      return 'Profile 录制完成。';
    case 'print-profile':
      return '当前 profile 已写入日志。';
    case 'import-legacy-config':
      return '旧配置导入完成。';
  }
}

function createCheck(
  key: string,
  level: AutomationCheckItem['level'],
  label: string,
  detail: string
): AutomationCheckItem {
  return { key, level, label, detail };
}

function resolvePreflightStatus(checks: AutomationCheckItem[]): AutomationPreflightStatus {
  if (checks.some((check) => check.level === 'error')) {
    return 'error';
  }

  if (checks.some((check) => check.level === 'warning')) {
    return 'warning';
  }

  return 'ready';
}

function buildPreflightSummary(
  taskTitle: string,
  status: AutomationPreflightStatus,
  checks: AutomationCheckItem[]
): string {
  const firstProblem = checks.find((check) => check.level !== 'ok');
  if (!firstProblem) {
    return `${taskTitle} 已通过预检，可以先试运行再决定是否正式执行。`;
  }

  if (status === 'error') {
    return `${taskTitle} 还有阻塞项：${firstProblem.detail}`;
  }

  return `${taskTitle} 可以继续，但建议先处理：${firstProblem.detail}`;
}

function parseNumberDraft(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  return Number(trimmed);
}

function buildRuneInputChecks(drafts: AutomationDrafts): AutomationCheckItem[] {
  const tokens = drafts.runeCounts
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return [createCheck('rune-counts', 'error', '符文数量', '还没有填写符文数量。')];
  }

  if (tokens.some((item) => !/^\d+$/.test(item))) {
    return [
      createCheck('rune-counts', 'error', '符文数量', '符文数量里包含了非整数内容。')
    ];
  }

  return [
    createCheck(
      'rune-counts',
      tokens.length === 9 ? 'ok' : 'warning',
      '符文数量',
      tokens.length === 9
        ? '已填写 9 个槽位。'
        : `当前填写了 ${tokens.length} 个槽位，建议按 9 个槽位填写。`
    ),
    createCheck(
      'rune-wait',
      drafts.runeWaitSeconds <= 10 ? 'ok' : 'warning',
      '等待秒数',
      `执行前会等待 ${drafts.runeWaitSeconds} 秒。`
    )
  ];
}

function buildGemInputChecks(
  drafts: AutomationDrafts,
  hasGemClipboardImage: boolean
): AutomationCheckItem[] {
  const checks: AutomationCheckItem[] = [
    createCheck(
      'gem-mode',
      'ok',
      '识别模式',
      drafts.gemInputMode === 'matrix' ? '当前使用矩阵输入。' : '当前使用截图识别。'
    )
  ];

  if (drafts.gemInputMode === 'matrix') {
    const matrix = drafts.gemMatrix.trim();
    if (!matrix) {
      checks.push(createCheck('gem-matrix', 'error', '宝石矩阵', '还没有填写宝石矩阵。'));
    } else {
      const rows = matrix.split(';').map((item) => item.trim()).filter(Boolean);
      checks.push(
        createCheck(
          'gem-matrix',
          rows.length > 0 ? 'ok' : 'warning',
          '宝石矩阵',
          `已提供 ${rows.length} 行库存矩阵。`
        )
      );
    }
  } else {
    const imagePath = drafts.gemImagePath.trim();
    if (hasGemClipboardImage) {
      checks.push(
        createCheck(
          'gem-screenshot',
          'ok',
          '截图来源',
          '已检测到剪贴板截图，运行前会自动保存到本地。'
        )
      );
    } else if (!imagePath) {
      checks.push(
        createCheck(
          'gem-screenshot',
          'error',
          '截图来源',
          '请先粘贴宝石截图，或填写一个现有截图路径。'
        )
      );
    } else {
      const resolvedPath = resolveMaybeAbsolutePath(imagePath);
      checks.push(
        createCheck(
          'gem-screenshot',
          existsSync(resolvedPath) ? 'ok' : 'error',
          '截图来源',
          existsSync(resolvedPath)
            ? `已找到截图：${resolvedPath}`
            : `未找到截图：${resolvedPath}`
        )
      );
    }
  }

  checks.push(
    createCheck(
      'gem-wait',
      drafts.gemWaitSeconds <= 10 ? 'ok' : 'warning',
      '等待秒数',
      `执行前会等待 ${drafts.gemWaitSeconds} 秒。`
    )
  );

  return checks;
}

function buildGoldInputChecks(drafts: AutomationDrafts): AutomationCheckItem[] {
  const amount = parseNumberDraft(drafts.goldAmount);
  const level = parseNumberDraft(drafts.goldLevel);

  return [
    createCheck(
      'gold-amount',
      amount === null ? 'error' : 'ok',
      '总金额',
      amount === null ? '总金额必须是整数。' : `当前计划处理 ${drafts.goldAmount.trim()} 金币。`
    ),
    createCheck(
      'gold-level',
      level === null ? 'error' : level < 75 ? 'warning' : 'ok',
      '角色等级',
      level === null
        ? '角色等级必须是整数。'
        : level < 75
          ? `当前等级 ${level}，建议确认角色能承受预期批次。`
          : `当前等级 ${level}。`
    ),
    createCheck(
      'gold-wait',
      drafts.goldWaitSeconds <= 10 ? 'ok' : 'warning',
      '等待秒数',
      `执行前会等待 ${drafts.goldWaitSeconds} 秒。`
    )
  ];
}

async function buildAutomationPreflight(
  payload: AutomationPreflightInput
): Promise<AutomationPreflightResponse> {
  const data = await readDataStore();
  const drafts: AutomationDrafts = {
    ...defaultAutomationDrafts(),
    ...payload.drafts
  };
  const pythonCommand = resolvePythonCommand();
  const pythonVersion = await executeFileCommand(
    pythonCommand,
    ['--version'],
    pythonRuntimeRoot
  );

  const globalChecks: AutomationCheckItem[] = [
    createCheck(
      'runtime-root',
      existsSync(pythonRuntimeRoot) ? 'ok' : 'error',
      'Python Runtime',
      existsSync(pythonRuntimeRoot)
        ? `已找到 runtime：${pythonRuntimeRoot}`
        : `未找到 runtime：${pythonRuntimeRoot}`
    ),
    createCheck(
      'python-command',
      pythonVersion.success ? 'ok' : 'error',
      'Python 解释器',
      pythonVersion.success
        ? `${pythonCommand} 可用：${(pythonVersion.stdout || pythonVersion.stderr).trim()}`
        : `无法运行 ${pythonCommand}，请先安装 Python 或补齐打包运行时。`
    )
  ];

  const tasks = data.integrations.map((integration) => {
    const taskChecks: AutomationCheckItem[] = [
      createCheck(
        'task-enabled',
        integration.enabled ? 'ok' : 'error',
        '任务状态',
        integration.enabled ? '当前任务已启用。' : '当前任务处于停用状态。'
      ),
      createCheck(
        'script-path',
        existsSync(getRuntimeScriptPath(integration.id)) ? 'ok' : 'error',
        '运行脚本',
        existsSync(getRuntimeScriptPath(integration.id))
          ? `已找到脚本：${getRuntimeScriptPath(integration.id)}`
          : `未找到脚本：${getRuntimeScriptPath(integration.id)}`
      ),
      createCheck(
        'profile-path',
        existsSync(resolveMaybeAbsolutePath(integration.profilePath)) ? 'ok' : 'error',
        'Profile',
        existsSync(resolveMaybeAbsolutePath(integration.profilePath))
          ? `已找到 profile：${resolveMaybeAbsolutePath(integration.profilePath)}`
          : `未找到 profile：${resolveMaybeAbsolutePath(integration.profilePath)}`
      )
    ];

    if (integration.supportsLegacyImport) {
      const legacyPath = integration.legacyConfigPath?.trim();
      const resolvedLegacyPath = legacyPath ? resolveMaybeAbsolutePath(legacyPath) : '';
      taskChecks.push(
        createCheck(
          'legacy-config',
          legacyPath && existsSync(resolvedLegacyPath) ? 'ok' : 'warning',
          '旧配置',
          legacyPath && existsSync(resolvedLegacyPath)
            ? `已找到旧配置：${resolvedLegacyPath}`
            : '当前没有可直接导入的旧配置文件。'
        )
      );
    }

    if (drafts.allowInactiveWindow) {
      taskChecks.push(
        createCheck(
          'inactive-window',
          'warning',
          '窗口焦点',
          '已允许窗口未置顶时继续点击，请确认不会误点到其他窗口。'
        )
      );
    } else {
      taskChecks.push(
        createCheck(
          'inactive-window',
          'ok',
          '窗口焦点',
          '当前要求游戏窗口处于前台，更适合联调。'
        )
      );
    }

    switch (integration.id) {
      case 'rune-cube':
        taskChecks.push(...buildRuneInputChecks(drafts));
        break;
      case 'gem-cube':
        taskChecks.push(...buildGemInputChecks(drafts, payload.hasGemClipboardImage));
        break;
      case 'drop-shared-gold':
        taskChecks.push(...buildGoldInputChecks(drafts));
        break;
    }

    const relevantChecks = [
      ...taskChecks,
      ...(globalChecks.some((check) => check.level === 'error')
        ? [createCheck('python-global', 'error', '全局环境', '全局 Python 环境还未通过预检。')]
        : [])
    ];
    const status = resolvePreflightStatus(relevantChecks);

    return {
      id: integration.id,
      status,
      summary: buildPreflightSummary(integration.title, status, relevantChecks),
      checks: relevantChecks
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    globalChecks,
    tasks
  };
}

function buildRuntimeArgs(
  integration: IntegrationConfig,
  payload: RunAutomationTaskInput
): string[] {
  const scriptPath = getRuntimeScriptPath(payload.id);
  const profilePath = resolveMaybeAbsolutePath(integration.profilePath);
  const args = [scriptPath, '--profile', profilePath];

  if (!existsSync(scriptPath)) {
    throw new Error(`未找到运行时脚本：${scriptPath}`);
  }

  switch (payload.id) {
    case 'rune-cube': {
      const counts = payload.drafts.runeCounts.trim();
      if (!counts) {
        throw new Error('请先填写符文数量。');
      }

      args.push('--counts', counts);
      args.push('--wait-seconds', String(payload.drafts.runeWaitSeconds));
      break;
    }
    case 'gem-cube': {
      if (payload.drafts.gemInputMode === 'scan-image') {
        const imagePath = payload.drafts.gemImagePath.trim();
        if (!imagePath) {
          throw new Error('请先粘贴或填写宝石截图。');
        }

        const resolvedImagePath = resolveMaybeAbsolutePath(imagePath);
        if (!existsSync(resolvedImagePath)) {
          throw new Error(`未找到截图文件：${resolvedImagePath}`);
        }

        args.push('--scan-image', resolvedImagePath);
      } else {
        const matrix = payload.drafts.gemMatrix.trim();
        if (!matrix) {
          throw new Error('请先填写宝石矩阵。');
        }

        args.push('--matrix', matrix);
      }

      args.push('--wait-seconds', String(payload.drafts.gemWaitSeconds));
      break;
    }
    case 'drop-shared-gold': {
      const amount = payload.drafts.goldAmount.trim();
      const level = payload.drafts.goldLevel.trim();

      if (!/^\d+$/.test(amount)) {
        throw new Error('金币总额必须是整数。');
      }

      if (!/^\d+$/.test(level)) {
        throw new Error('角色等级必须是整数。');
      }

      args.push('--amount', amount);
      args.push('--level', level);
      args.push('--wait-seconds', String(payload.drafts.goldWaitSeconds));
      break;
    }
  }

  if (payload.drafts.allowInactiveWindow) {
    args.push('--allow-inactive-window');
  }

  if (payload.mode === 'dry-run') {
    args.push('--dry-run');
  }

  return args;
}

function buildAutomationAdminArgs(
  integration: IntegrationConfig,
  payload: RunAutomationAdminInput
): string[] {
  const scriptPath = getRuntimeScriptPath(payload.id);
  const profilePath = resolveMaybeAbsolutePath(integration.profilePath);
  const args = [scriptPath, '--profile', profilePath];

  if (!existsSync(scriptPath)) {
    throw new Error(`未找到运行时脚本：${scriptPath}`);
  }

  switch (payload.action) {
    case 'record-profile':
      args.push('--record-profile');
      return args;
    case 'print-profile':
      args.push('--print-profile');
      return args;
    case 'import-legacy-config': {
      if (!integration.supportsLegacyImport) {
        throw new Error('这个任务没有可导入的旧配置。');
      }

      const legacyPath = integration.legacyConfigPath?.trim();
      if (!legacyPath) {
        throw new Error('当前没有配置旧配置路径。');
      }

      const resolvedLegacyPath = resolveMaybeAbsolutePath(legacyPath);
      if (!existsSync(resolvedLegacyPath)) {
        throw new Error(`未找到旧配置文件：${resolvedLegacyPath}`);
      }

      args.push('--import-legacy-config', resolvedLegacyPath);
      return args;
    }
  }
}

async function runBuiltinAutomation(
  integration: IntegrationConfig,
  args: string[],
  actionLabel: 'dry-run' | 'execute' | AutomationAdminAction
): Promise<{ result: IntegrationRunResult; logPath: string }> {
  const pythonCommand = resolvePythonCommand();
  const result = await executeFileCommand(
    pythonCommand,
    args,
    integration.workingDirectory || pythonRuntimeRoot,
    actionLabel !== 'record-profile'
  );

  const logPath = await writeAutomationLog(
    integration.id,
    actionLabel,
    pythonCommand,
    args,
    result
  );

  return { result, logPath };
}

async function runDropOcr(imagePath: string): Promise<DropOcrResult> {
  const scriptPath = getDropOcrScriptPath();
  if (!existsSync(scriptPath)) {
    throw new Error(`未找到掉落 OCR 脚本：${scriptPath}`);
  }

  const pythonCommand = resolvePythonCommand();
  const result = await executeFileCommand(
    pythonCommand,
    [scriptPath, '--image', imagePath, '--json'],
    pythonRuntimeRoot
  );

  if (!result.success) {
    throw new Error(result.stderr || '掉落 OCR 执行失败。');
  }

  return parseJsonOutput<DropOcrResult>(result);
}

async function createMainWindow(): Promise<void> {
  const data = await readDataStore();
  const metrics = getWindowMetrics(data.settings.windowMode);

  mainWindow = new BrowserWindow({
    width: metrics.width,
    height: metrics.height,
    minWidth: metrics.minWidth,
    minHeight: metrics.minHeight,
    transparent: true,
    frame: false,
    thickFrame: false,
    hasShadow: false,
    roundedCorners: false,
    skipTaskbar: data.settings.windowMode === 'floating',
    resizable: metrics.resizable,
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    backgroundColor: '#00000000',
    title: '暗黑 2 桌宠助手',
    alwaysOnTop: data.settings.alwaysOnTop,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  applyAlwaysOnTopState(data.settings.alwaysOnTop);
  await applyWindowModeState(data.settings.windowMode);
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('close', (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    hideMainWindow();
  });

  mainWindow.on('show', () => {
    void refreshTrayMenu();
  });

  mainWindow.on('hide', () => {
    void refreshTrayMenu();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(join(__dirname, '../../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  app.setAppUserModelId('d2-desktop-pet');
  await createMainWindow();
  createTray();
  registerGlobalShortcuts();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
      createTray();
      registerGlobalShortcuts();
      return;
    }

    showMainWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('data:get', async () => readDataStore());

ipcMain.handle('run:start', async (_event, payload: StartRunInput) => {
  const mapName = payload.mapName.trim();
  if (!mapName) {
    throw new Error('开始刷图前请先填写地图名称。');
  }

  const data = await readDataStore();
  if (data.activeRun) {
    throw new Error('当前已经有一条进行中的刷图记录。');
  }

  data.activeRun = {
    id: buildId('run'),
    mapName,
    startedAt: new Date().toISOString()
  };

  return writeDataStore(data);
});

ipcMain.handle('run:stop', async () => {
  const data = await readDataStore();
  if (!data.activeRun) {
    throw new Error('当前没有正在进行中的刷图。');
  }

  const now = new Date();
  const completedMapName = data.activeRun.mapName;
  const startedAt = new Date(data.activeRun.startedAt);
  const durationSeconds = Math.max(
    1,
    Math.round((now.getTime() - startedAt.getTime()) / 1000)
  );

  data.runHistory.unshift({
    ...data.activeRun,
    endedAt: now.toISOString(),
    durationSeconds,
    dayKey: getDayKey(now)
  });
  data.runHistory = data.runHistory.slice(0, 1000);
  data.activeRun = null;

  const nextData = await writeDataStore(data);
  void sendDesktopNotification(
    '刷图记录已完成',
    `${completedMapName} 已记录，耗时 ${formatDurationText(durationSeconds)}。`
  );
  return nextData;
});

ipcMain.handle('drop:create', async (_event, payload: CreateDropInput) => {
  const itemName = payload.itemName.trim();
  if (!itemName) {
    throw new Error('掉落记录至少需要填写物品名称。');
  }

  const now = new Date();
  const mapName = payload.mapName.trim();
  const data = await readDataStore();

  data.drops.unshift({
    id: buildId('drop'),
    itemName,
    mapName,
    note: payload.note.trim(),
    createdAt: now.toISOString(),
    dayKey: getDayKey(now),
    screenshotPath: payload.screenshotPath?.trim() || undefined,
    ocrText: payload.ocrText?.trim() || undefined,
    ocrEngine: payload.ocrEngine?.trim() || undefined,
    ocrItemName: payload.ocrItemName?.trim() || undefined
  });
  data.drops = data.drops.slice(0, 1000);

  const nextData = await writeDataStore(data);
  void sendDesktopNotification(
    '掉落已保存',
    mapName ? `${itemName} 已记录到 ${mapName}。` : `${itemName} 已写入今日掉落记录。`
  );
  return nextData;
});

ipcMain.handle('image:save', async (_event, payload: SaveImageInput) => {
  const savedPath = await savePngFromDataUrl(payload);
  return { path: savedPath };
});

ipcMain.handle('drop:ocr-preview', async (_event, payload: DropOcrPreviewInput) => {
  const savedPath = await savePngFromDataUrl({
    dataUrl: payload.dataUrl,
    suggestedName: payload.suggestedName
  });

  const result = await runDropOcr(savedPath);
  return {
    ...result,
    imagePath: savedPath
  };
});

ipcMain.handle('settings:update', async (_event, payload: UpdateSettingsInput) => {
  const data = await readDataStore();
  const nextSettings = {
    ...data.settings,
    ...payload.patch
  };

  if (typeof payload.patch.launchOnStartup === 'boolean') {
    nextSettings.launchOnStartup = applyLaunchOnStartupState(
      payload.patch.launchOnStartup
    );
  }

  data.settings = nextSettings;
  const nextData = await writeDataStore(data);
  applyAlwaysOnTopState(nextData.settings.alwaysOnTop);
  if (payload.patch.windowMode) {
    await applyWindowModeState(nextData.settings.windowMode);
  }

  if (typeof payload.patch.notificationsEnabled === 'boolean' && nextData.settings.notificationsEnabled) {
    void sendDesktopNotification('系统通知已开启', '后续刷图、掉落和自动化结果会在这里提醒你。');
  }

  return nextData;
});

ipcMain.handle('integration:update', async (_event, payload: UpdateIntegrationInput) => {
  const data = await readDataStore();
  const target = data.integrations.find((integration) => integration.id === payload.id);

  if (!target) {
    throw new Error('未找到对应的自动化动作。');
  }

  target.commandLine = payload.patch.commandLine.trim();
  target.workingDirectory = payload.patch.workingDirectory.trim();
  target.enabled = payload.patch.enabled;

  return writeDataStore(data);
});

ipcMain.handle('automation:run-task', async (_event, payload: RunAutomationTaskInput) => {
  const data = await readDataStore();
  const target = data.integrations.find((integration) => integration.id === payload.id);

  if (!target) {
    throw new Error('未找到对应的自动化任务。');
  }

  if (!target.enabled) {
    throw new Error('该自动化任务当前未启用。');
  }

  const drafts: AutomationDrafts = {
    ...defaultAutomationDrafts(),
    ...payload.drafts
  };

  data.automationDrafts = drafts;

  const { result, logPath } = await runBuiltinAutomation(
    target,
    buildRuntimeArgs(target, {
      ...payload,
      drafts
    }),
    payload.mode
  );

  target.lastRunAt = new Date().toISOString();
  target.lastStatus = result.success ? 'success' : 'error';
  target.lastMessage = summarizeActionResult(payload.mode, result);
  target.lastLogPath = logPath;

  const nextData = await writeDataStore(data);
  void sendDesktopNotification(
    result.success ? '自动化任务完成' : '自动化任务失败',
    `${target.title}：${target.lastMessage ?? (result.success ? '已完成。' : '执行失败。')}`
  );

  return {
    data: nextData,
    result
  };
});

ipcMain.handle('automation:run-admin', async (_event, payload: RunAutomationAdminInput) => {
  const data = await readDataStore();
  const target = data.integrations.find((integration) => integration.id === payload.id);

  if (!target) {
    throw new Error('未找到对应的自动化任务。');
  }

  const { result, logPath } = await runBuiltinAutomation(
    target,
    buildAutomationAdminArgs(target, payload),
    payload.action
  );

  target.lastRunAt = new Date().toISOString();
  target.lastStatus = result.success ? 'success' : 'error';
  target.lastMessage = summarizeActionResult(payload.action, result);
  target.lastLogPath = logPath;

  const nextData = await writeDataStore(data);
  void sendDesktopNotification(
    result.success ? '自动化工具操作完成' : '自动化工具操作失败',
    `${target.title}：${target.lastMessage ?? (result.success ? '已完成。' : '执行失败。')}`
  );

  return {
    data: nextData,
    result
  };
});

ipcMain.handle(
  'automation:get-preflight',
  async (_event, payload: AutomationPreflightInput): Promise<AutomationPreflightResponse> => {
    return buildAutomationPreflight(payload);
  }
);

ipcMain.handle(
  'automation:get-log',
  async (_event, id: IntegrationId): Promise<AutomationLogDocument> => {
    const data = await readDataStore();
    const target = data.integrations.find((integration) => integration.id === id);

    if (!target) {
      throw new Error('未找到对应的自动化任务。');
    }

    if (!target.lastLogPath) {
      throw new Error('这个任务还没有可查看的日志。');
    }

    const logPath = resolveMaybeAbsolutePath(target.lastLogPath);
    if (!existsSync(logPath)) {
      throw new Error(`日志文件不存在：${logPath}`);
    }

    return {
      path: logPath,
      content: await readFile(logPath, 'utf8')
    };
  }
);

ipcMain.handle(
  'file:export-text',
  async (_event, payload: ExportTextFileInput): Promise<ExportTextFileResult> => {
    const extension = payload.defaultExtension.replace(/^\./, '');
    const suggestedBase = sanitizeFileName(payload.suggestedName.replace(/\.[^.]+$/, ''));
    const suggestedFileName = `${suggestedBase}.${extension}`;
    const saveDialogOptions = {
      title: '导出战报',
      defaultPath: join(app.getPath('documents'), suggestedFileName),
      filters: [
        {
          name:
            extension === 'md'
              ? 'Markdown 文件'
              : extension === 'json'
                ? 'JSON 文件'
                : '文本文件',
          extensions: [extension]
        }
      ]
    };
    const saveResult = mainWindow
      ? await dialog.showSaveDialog(mainWindow, saveDialogOptions)
      : await dialog.showSaveDialog(saveDialogOptions);

    if (saveResult.canceled || !saveResult.filePath) {
      return { canceled: true };
    }

    await mkdir(dirname(saveResult.filePath), { recursive: true });
    await writeFile(saveResult.filePath, payload.content, 'utf8');
    return {
      canceled: false,
      path: saveResult.filePath
    };
  }
);

ipcMain.handle('integration:run', async (_event, id: IntegrationId) => {
  const data = await readDataStore();
  const target = data.integrations.find((integration) => integration.id === id);

  if (!target) {
    throw new Error('未找到要执行的自动化动作。');
  }

  if (!target.enabled) {
    throw new Error('该自动化动作当前未启用。');
  }

  if (!target.commandLine.trim()) {
    throw new Error('请先配置命令行。');
  }

  const result = await executeCommand(target.commandLine, target.workingDirectory);
  target.lastRunAt = new Date().toISOString();
  target.lastStatus = result.success ? 'success' : 'error';
  target.lastMessage = summarizeActionResult('execute', result);
  target.lastLogPath = await writeAutomationLog(
    target.id,
    'legacy-integration-run',
    target.commandLine,
    [],
    result
  );

  const nextData = await writeDataStore(data);
  void sendDesktopNotification(
    result.success ? '自动化任务完成' : '自动化任务失败',
    `${target.title}：${target.lastMessage ?? (result.success ? '已完成。' : '执行失败。')}`
  );

  return {
    data: nextData,
    result
  };
});

ipcMain.handle('shell:open-path', async (_event, targetPath: string) => {
  return shell.openPath(targetPath);
});

ipcMain.handle('window:minimize', async () => {
  hideMainWindow();
});

ipcMain.handle('window:set-always-on-top', async (_event, value: boolean) => {
  const data = await readDataStore();
  data.settings.alwaysOnTop = value;
  const nextData = await writeDataStore(data);
  applyAlwaysOnTopState(value);
  return nextData;
});
