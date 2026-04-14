import { exec, execFile, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BrowserWindow, Menu, Notification, Tray, app, clipboard, dialog, globalShortcut, ipcMain, nativeImage, screen, shell } from 'electron';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, '../..');
const toggleWindowShortcut = 'Alt+Shift+D';
const toggleCounterLockShortcut = 'Alt+Shift+L';
function getBuildAssetPath(...segments) {
    return join(workspaceRoot, 'build', ...segments);
}
function getWindowIconPath() {
    return getBuildAssetPath(process.platform === 'win32' ? 'icon.ico' : 'icon.png');
}
function getPythonRuntimeRoot() {
    if (app.isPackaged) {
        const unpackedRuntimeRoot = join(process.resourcesPath, 'app.asar.unpacked', 'automation', 'python_runtime');
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
const reportPreviewRoot = () => join(app.getPath('userData'), 'd2-pet', 'report-previews');
const managedPythonRoot = () => join(app.getPath('userData'), 'd2-pet', 'python-runtime');
const runCounterUserTemplateRoot = () => join(app.getPath('userData'), 'd2-pet', 'run-counter');
const runCounterUserCaptureRoot = () => join(runCounterUserTemplateRoot(), 'captures');
const runCounterUserRoutesRoot = () => join(runCounterUserTemplateRoot(), 'routes');
const runCounterUserSceneTemplateRoot = () => join(runCounterUserTemplateRoot(), 'scene-templates');
const runCounterUserManifestPath = () => join(runCounterUserTemplateRoot(), 'route_templates.json');
const runCounterUserExampleManifestPath = () => join(runCounterUserTemplateRoot(), 'route_templates.example.json');
const runtimeRequirementsPath = () => join(pythonRuntimeRoot, 'requirements.txt');
const runtimeReadmePath = () => join(pythonRuntimeRoot, 'README.md');
const runCounterScriptPath = () => join(pythonRuntimeRoot, 'tasks', 'run_counter_monitor.py');
const captureRouteSnapshotScriptPath = () => join(pythonRuntimeRoot, 'tasks', 'capture_route_snapshot.py');
const generateRouteTemplateDraftScriptPath = () => join(pythonRuntimeRoot, 'tasks', 'generate_route_template_drafts.py');
const runCounterTemplateRoot = () => join(pythonRuntimeRoot, 'assets', 'run_counter');
const runCounterTemplateExamplePath = () => join(runCounterTemplateRoot(), 'route_templates.example.json');
function getProjectBundledPythonRoot() {
    return join(workspaceRoot, 'vendor', 'python-runtime', 'win32-x64');
}
function getPackagedPythonRoot() {
    return join(process.resourcesPath, 'python');
}
function getPythonExecutablesFromRoot(rootPath) {
    return [join(rootPath, 'Scripts', 'python.exe'), join(rootPath, 'python.exe')];
}
function getFastLauncherExecutablePath() {
    if (app.isPackaged) {
        return join(process.resourcesPath, 'bin', 'fast-launcher.exe');
    }
    return join(workspaceRoot, 'resources', 'fast-launcher', 'target', 'release', 'fast-launcher.exe');
}
function callFastLauncher(command, args = []) {
    return new Promise((resolve, reject) => {
        const exePath = getFastLauncherExecutablePath();
        execFile(exePath, [command, ...args], (error, stdout, stderr) => {
            if (error) {
                console.error(`FastLauncher error: ${stderr || error.message}`);
                return reject(new Error(stderr || error.message));
            }
            try {
                const result = JSON.parse(stdout.trim());
                if (result.status === 'success') {
                    resolve(result.data);
                }
                else {
                    reject(new Error(result.message || 'Unknown error from fast launcher'));
                }
            }
            catch (parseError) {
                console.error(`FastLauncher parse error. Output: ${stdout}`);
                reject(new Error(`Invalid response from fast launcher: ${stdout}`));
            }
        });
    });
}
let mainWindow = null;
let tray = null;
let isQuitting = false;
let hasShownTrayHint = false;
let resolvedPythonCommand = null;
let activeWindowMode = 'panel';
let suppressWindowStateCaptureUntil = 0;
let persistWindowStateTimer = null;
let pythonEnvironmentProbeCache = null;
let runCounterMonitorProcess = null;
let runCounterMonitorExpectedExit = false;
let runCounterMonitorEventChain = Promise.resolve();
let runCounterMonitorIntervalSeconds = null;
function getWindowMetrics(mode) {
    if (mode === 'floating') {
        return {
            width: 248,
            height: 396,
            minWidth: 248,
            minHeight: 396,
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
const floatingSnapDistance = 22;
const windowStatePersistDelayMs = 220;
const counterMarkerMinRunSeconds = 20;
function sanitizeWindowBounds(input) {
    if (!input ||
        !Number.isFinite(input.x) ||
        !Number.isFinite(input.y) ||
        !Number.isFinite(input.width) ||
        !Number.isFinite(input.height)) {
        return null;
    }
    const x = Number(input.x);
    const y = Number(input.y);
    const width = Number(input.width);
    const height = Number(input.height);
    return {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height))
    };
}
function getDisplayForBounds(bounds) {
    const centerPoint = {
        x: Math.round(bounds.x + bounds.width / 2),
        y: Math.round(bounds.y + bounds.height / 2)
    };
    return screen.getDisplayNearestPoint(centerPoint);
}
function getCenteredBounds(mode, workArea = screen.getPrimaryDisplay().workArea) {
    const metrics = getWindowMetrics(mode);
    const width = mode === 'floating' ? metrics.width : Math.min(metrics.width, workArea.width);
    const height = mode === 'floating' ? metrics.height : Math.min(metrics.height, workArea.height);
    return {
        x: Math.round(workArea.x + (workArea.width - width) / 2),
        y: Math.round(workArea.y + (workArea.height - height) / 2),
        width,
        height
    };
}
function clampBoundsToWorkArea(bounds, mode) {
    const metrics = getWindowMetrics(mode);
    const workArea = getDisplayForBounds(bounds).workArea;
    const width = mode === 'floating'
        ? metrics.width
        : Math.min(Math.max(bounds.width, metrics.minWidth), workArea.width);
    const height = mode === 'floating'
        ? metrics.height
        : Math.min(Math.max(bounds.height, metrics.minHeight), workArea.height);
    const maxX = workArea.x + Math.max(0, workArea.width - width);
    const maxY = workArea.y + Math.max(0, workArea.height - height);
    return {
        x: Math.min(Math.max(bounds.x, workArea.x), maxX),
        y: Math.min(Math.max(bounds.y, workArea.y), maxY),
        width,
        height
    };
}
function snapFloatingBounds(bounds) {
    const clamped = clampBoundsToWorkArea(bounds, 'floating');
    const workArea = getDisplayForBounds(clamped).workArea;
    const snapped = { ...clamped };
    const rightEdge = workArea.x + workArea.width - clamped.width;
    const bottomEdge = workArea.y + workArea.height - clamped.height;
    if (Math.abs(clamped.x - workArea.x) <= floatingSnapDistance) {
        snapped.x = workArea.x;
    }
    else if (Math.abs(clamped.x - rightEdge) <= floatingSnapDistance) {
        snapped.x = rightEdge;
    }
    if (Math.abs(clamped.y - workArea.y) <= floatingSnapDistance) {
        snapped.y = workArea.y;
    }
    else if (Math.abs(clamped.y - bottomEdge) <= floatingSnapDistance) {
        snapped.y = bottomEdge;
    }
    return snapped;
}
function getFloatingSnapPreview(bounds) {
    const clamped = clampBoundsToWorkArea(bounds, 'floating');
    const workArea = getDisplayForBounds(clamped).workArea;
    const rightEdge = workArea.x + workArea.width - clamped.width;
    const bottomEdge = workArea.y + workArea.height - clamped.height;
    const candidates = [
        { edge: 'left', distance: Math.abs(clamped.x - workArea.x) },
        { edge: 'right', distance: Math.abs(clamped.x - rightEdge) },
        { edge: 'top', distance: Math.abs(clamped.y - workArea.y) },
        { edge: 'bottom', distance: Math.abs(clamped.y - bottomEdge) }
    ];
    const nearest = candidates
        .filter((item) => item.distance <= floatingSnapDistance)
        .sort((left, right) => left.distance - right.distance)[0];
    if (!nearest) {
        return {
            visible: false,
            snapped: false
        };
    }
    return {
        visible: true,
        edge: nearest.edge,
        snapped: nearest.distance === 0
    };
}
function getResolvedWindowBounds(data, mode) {
    const storedBounds = sanitizeWindowBounds(data.settings.windowPlacement?.[mode]);
    if (!storedBounds) {
        return getCenteredBounds(mode);
    }
    return clampBoundsToWorkArea(storedBounds, mode);
}
function areWindowBoundsEqual(left, right) {
    return (left?.x === right?.x &&
        left?.y === right?.y &&
        left?.width === right?.width &&
        left?.height === right?.height);
}
function suppressWindowStateCapture(durationMs = 260) {
    suppressWindowStateCaptureUntil = Date.now() + durationMs;
}
function isWindowStateCaptureSuppressed() {
    return Date.now() < suppressWindowStateCaptureUntil;
}
function emitFloatingSnapPreview(bounds) {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }
    if (activeWindowMode !== 'floating' || !mainWindow.webContents) {
        mainWindow.webContents.send('window:floating-snap-preview', {
            visible: false,
            snapped: false
        });
        return;
    }
    const targetBounds = bounds ?? sanitizeWindowBounds(mainWindow.getBounds());
    if (!targetBounds) {
        mainWindow.webContents.send('window:floating-snap-preview', {
            visible: false,
            snapped: false
        });
        return;
    }
    mainWindow.webContents.send('window:floating-snap-preview', getFloatingSnapPreview(targetBounds));
}
function getPythonCandidates() {
    const home = app.getPath('home');
    return Array.from(new Set([
        ...getPythonExecutablesFromRoot(managedPythonRoot()),
        ...getPythonExecutablesFromRoot(getPackagedPythonRoot()),
        ...getPythonExecutablesFromRoot(getProjectBundledPythonRoot()),
        join(process.resourcesPath, 'python', 'python.exe'),
        join(getProjectBundledPythonRoot(), 'python.exe'),
        join(getProjectBundledPythonRoot(), 'Scripts', 'python.exe'),
        join(home, 'AppData', 'Local', 'Python', 'bin', 'python.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python314', 'python.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python313', 'python.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'python.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python310', 'python.exe'),
        'python'
    ]));
}
function getUtf8ChildEnv() {
    return {
        ...process.env,
        PYTHONUTF8: '1',
        PYTHONIOENCODING: 'utf-8'
    };
}
function getBootstrapPythonCandidates() {
    const home = app.getPath('home');
    return [
        join(home, 'AppData', 'Local', 'Python', 'bin', 'python.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python314', 'python.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python313', 'python.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'python.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python310', 'python.exe'),
        'python'
    ];
}
function resolvePythonCommand() {
    if (resolvedPythonCommand) {
        return resolvedPythonCommand;
    }
    const candidate = getPythonCandidates().find((item) => {
        return item === 'python' || existsSync(item);
    });
    resolvedPythonCommand = candidate ?? 'python';
    return resolvedPythonCommand;
}
function resolveBootstrapPythonCommand() {
    const candidate = getBootstrapPythonCandidates().find((item) => {
        return item === 'python' || existsSync(item);
    });
    return candidate ?? 'python';
}
function normalizeWindowsPath(input) {
    return input.replace(/\//g, '\\').toLowerCase();
}
function getPythonSourceStatus(command) {
    if (!isAbsolute(command)) {
        return {
            level: 'warning',
            detail: `当前使用系统 Python：${command}`
        };
    }
    const normalizedCommand = normalizeWindowsPath(command);
    const managedRoot = normalizeWindowsPath(managedPythonRoot());
    const packagedRoot = normalizeWindowsPath(getPackagedPythonRoot());
    const projectBundledRoot = normalizeWindowsPath(getProjectBundledPythonRoot());
    if (normalizedCommand.startsWith(managedRoot)) {
        return {
            level: 'ok',
            detail: `当前使用桌宠私有 Runtime：${command}`
        };
    }
    if (normalizedCommand.startsWith(packagedRoot) || normalizedCommand.startsWith(projectBundledRoot)) {
        return {
            level: 'ok',
            detail: `当前使用桌宠内置 Runtime：${command}`
        };
    }
    return {
        level: 'warning',
        detail: `当前仍在使用系统 Python：${command}`
    };
}
const pythonDependencyModules = [
    { module: 'keyboard', package: 'keyboard' },
    { module: 'pyautogui', package: 'pyautogui' },
    { module: 'pygetwindow', package: 'pygetwindow' },
    { module: 'cv2', package: 'opencv-python' },
    { module: 'numpy', package: 'numpy' },
    { module: 'PIL', package: 'pillow' },
    { module: 'pytesseract', package: 'pytesseract' },
    { module: 'rapidocr_onnxruntime', package: 'rapidocr_onnxruntime' }
];
function invalidatePythonEnvironmentProbe() {
    pythonEnvironmentProbeCache = null;
}
function buildDependencyProbeScript() {
    return [
        'import importlib.metadata, importlib.util, json',
        `modules = ${JSON.stringify(pythonDependencyModules)}`,
        'result = []',
        'for item in modules:',
        "    module_name = item['module']",
        "    package_name = item['package']",
        '    installed = importlib.util.find_spec(module_name) is not None',
        "    version = ''",
        '    if installed:',
        '        try:',
        '            version = importlib.metadata.version(package_name)',
        '        except Exception:',
        "            version = 'unknown'",
        '    result.append({',
        "        'module': module_name,",
        "        'package': package_name,",
        "        'installed': installed,",
        "        'version': version,",
        '    })',
        'print(json.dumps(result))'
    ].join('\n');
}
function buildOcrEngineProbeScript() {
    return [
        'import json',
        'from common.ocr_utils import get_available_ocr_engine',
        "print(json.dumps({'engine': get_available_ocr_engine()}))"
    ].join('\n');
}
function getDayKey(input) {
    const year = input.getFullYear();
    const month = String(input.getMonth() + 1).padStart(2, '0');
    const day = String(input.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function getTimestamp(input) {
    const hours = String(input.getHours()).padStart(2, '0');
    const minutes = String(input.getMinutes()).padStart(2, '0');
    const seconds = String(input.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
}
function buildId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
async function ensureRouteTemplateWorkspace() {
    await mkdir(runCounterUserTemplateRoot(), { recursive: true });
    await mkdir(runCounterUserCaptureRoot(), { recursive: true });
    await mkdir(runCounterUserRoutesRoot(), { recursive: true });
    await mkdir(runCounterUserSceneTemplateRoot(), { recursive: true });
    await mkdir(join(runCounterUserRoutesRoot(), '3c'), { recursive: true });
    await mkdir(join(runCounterUserRoutesRoot(), 'cow'), { recursive: true });
    await mkdir(join(runCounterUserRoutesRoot(), 'baal'), { recursive: true });
    if (existsSync(runCounterTemplateExamplePath()) &&
        !existsSync(runCounterUserExampleManifestPath())) {
        const exampleContent = await readFile(runCounterTemplateExamplePath(), 'utf8');
        await writeFile(runCounterUserExampleManifestPath(), exampleContent, 'utf8');
    }
}
function buildRouteTemplateReadme() {
    return [
        '# 路线模板助手',
        '',
        '这个目录用于给桌宠的全自动计数提供路线识别模板。',
        '',
        '推荐顺序：',
        '1. 在游戏内切到目标路线场景，比如 3C。',
        '2. 在桌宠里点“抓当前游戏截图”。',
        '3. 先点“为当前路线生成候选图”，让桌宠从最新截图里自动切 3 张候选模板。',
        '4. 打开 routes 目录，必要时替换成你自己裁的更稳定小图。',
        '5. 回桌宠点“测试当前识别”，确认已经命中目标路线。',
        '',
        '建议模板特征：',
        '- 尽量选固定不变的 UI 角落或文本',
        '- 不要选怪物、人物动作、地形阴影这类容易变化的内容',
        '- 小图即可，越稳定越好',
        '',
        '常用文件：',
        `- 当前生效清单：${runCounterUserManifestPath()}`,
        `- 示例清单：${runCounterUserExampleManifestPath()}`,
        `- 截图目录：${runCounterUserCaptureRoot()}`,
        `- 模板目录：${runCounterUserRoutesRoot()}`,
        ''
    ].join('\n');
}
async function readRouteTemplateManifestJson() {
    if (!existsSync(runCounterUserManifestPath())) {
        return {};
    }
    try {
        const content = await readFile(runCounterUserManifestPath(), 'utf8');
        const parsed = JSON.parse(content);
        return parsed && typeof parsed === 'object' ? parsed : {};
    }
    catch {
        return {};
    }
}
async function writeRouteTemplateManifestJson(manifest) {
    await writeFile(runCounterUserManifestPath(), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}
async function upsertRouteTemplateEntries(routeName, entries) {
    await ensureRouteTemplateWorkspace();
    if (!existsSync(runCounterUserManifestPath())) {
        const sourcePath = existsSync(runCounterUserExampleManifestPath())
            ? runCounterUserExampleManifestPath()
            : runCounterTemplateExamplePath();
        if (existsSync(sourcePath)) {
            const content = await readFile(sourcePath, 'utf8');
            await writeFile(runCounterUserManifestPath(), content, 'utf8');
        }
    }
    const manifest = await readRouteTemplateManifestJson();
    manifest[routeName] = entries;
    await writeRouteTemplateManifestJson(manifest);
}
async function readRouteTemplateManifestDetail() {
    if (!existsSync(runCounterUserManifestPath())) {
        return {
            routeNames: [],
            templateFiles: []
        };
    }
    try {
        const manifestContent = await readFile(runCounterUserManifestPath(), 'utf8');
        const parsed = JSON.parse(manifestContent);
        const routeNames = Object.keys(parsed).filter((key) => key.trim().length > 0);
        const templateFiles = [];
        for (const entries of Object.values(parsed)) {
            if (!Array.isArray(entries)) {
                continue;
            }
            for (const entry of entries) {
                if (!entry || typeof entry !== 'object') {
                    continue;
                }
                const filename = String(entry.filename ?? '').trim();
                if (filename) {
                    templateFiles.push(filename);
                }
            }
        }
        return {
            routeNames,
            templateFiles
        };
    }
    catch {
        return {
            routeNames: [],
            templateFiles: []
        };
    }
}
async function getCounterRouteTemplateStatus() {
    await ensureRouteTemplateWorkspace();
    const manifestDetail = await readRouteTemplateManifestDetail();
    const missingTemplateFiles = manifestDetail.templateFiles.filter((relativePath) => !existsSync(join(runCounterUserTemplateRoot(), relativePath)));
    return {
        rootPath: runCounterUserTemplateRoot(),
        capturesPath: runCounterUserCaptureRoot(),
        routesPath: runCounterUserRoutesRoot(),
        manifestPath: runCounterUserManifestPath(),
        exampleManifestPath: runCounterUserExampleManifestPath(),
        hasActiveManifest: existsSync(runCounterUserManifestPath()),
        configuredRouteCount: manifestDetail.routeNames.length,
        readyTemplateCount: manifestDetail.templateFiles.length - missingTemplateFiles.length,
        missingTemplateCount: missingTemplateFiles.length,
        missingTemplateFiles,
        routeNames: manifestDetail.routeNames
    };
}
async function initializeCounterRouteTemplates() {
    await ensureRouteTemplateWorkspace();
    const readmePath = join(runCounterUserTemplateRoot(), 'README.md');
    await writeFile(readmePath, buildRouteTemplateReadme(), 'utf8');
    if (!existsSync(runCounterUserManifestPath())) {
        const sourcePath = existsSync(runCounterUserExampleManifestPath())
            ? runCounterUserExampleManifestPath()
            : runCounterTemplateExamplePath();
        if (!existsSync(sourcePath)) {
            throw new Error('未找到路线模板示例文件。');
        }
        const content = await readFile(sourcePath, 'utf8');
        await writeFile(runCounterUserManifestPath(), content, 'utf8');
    }
    return getCounterRouteTemplateStatus();
}
async function captureCounterRouteSnapshot() {
    await ensureRouteTemplateWorkspace();
    const scriptPath = captureRouteSnapshotScriptPath();
    if (!existsSync(scriptPath)) {
        throw new Error(`未找到路线截图脚本：${scriptPath}`);
    }
    const pythonCommand = resolvePythonCommand();
    const result = await executeFileCommand(pythonCommand, [scriptPath, '--output-dir', runCounterUserCaptureRoot()], pythonRuntimeRoot);
    if (!result.success) {
        throw new Error(result.stderr || result.stdout || '抓取路线模板截图失败。');
    }
    return parseJsonOutput(result);
}
async function generateCounterRouteDrafts(routeName) {
    await initializeCounterRouteTemplates();
    const scriptPath = generateRouteTemplateDraftScriptPath();
    if (!existsSync(scriptPath)) {
        throw new Error(`未找到路线候选图脚本：${scriptPath}`);
    }
    const pythonCommand = resolvePythonCommand();
    const result = await executeFileCommand(pythonCommand, [
        scriptPath,
        '--capture-dir',
        runCounterUserCaptureRoot(),
        '--template-root',
        runCounterUserTemplateRoot(),
        '--route-name',
        routeName
    ], pythonRuntimeRoot);
    if (!result.success) {
        throw new Error(result.stderr || result.stdout || '生成路线候选图失败。');
    }
    const parsed = parseJsonOutput(result);
    await upsertRouteTemplateEntries(parsed.routeName, parsed.entries);
    return parsed;
}
async function probeCounterRouteDetection() {
    await ensureRouteTemplateWorkspace();
    const scriptPath = runCounterScriptPath();
    if (!existsSync(scriptPath)) {
        throw new Error(`未找到自动计数脚本：${scriptPath}`);
    }
    const pythonCommand = resolvePythonCommand();
    const result = await executeFileCommand(pythonCommand, [
        scriptPath,
        '--once',
        '--template-root',
        runCounterTemplateRoot(),
        '--route-template-root',
        runCounterUserTemplateRoot()
    ], pythonRuntimeRoot);
    if (!result.success) {
        throw new Error(result.stderr || result.stdout || '测试当前路线识别失败。');
    }
    const lines = result.stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith('{'));
    const stateLine = [...lines]
        .reverse()
        .find((line) => {
        try {
            const parsed = JSON.parse(line);
            return parsed.type === 'state';
        }
        catch {
            return false;
        }
    });
    if (!stateLine) {
        throw new Error('没有拿到当前路线识别结果。');
    }
    return JSON.parse(stateLine);
}
function sanitizeFileName(value) {
    const trimmed = value.trim().replace(/[\\/:*?"<>|]/g, '-');
    return trimmed.length > 0 ? trimmed.slice(0, 40) : 'file';
}
function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
function formatExportDateTime(input) {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(new Date(input));
}
function renderVisualList(items, emptyTitle, emptyDetail) {
    if (items.length === 0) {
        return `
      <div class="empty">
        <strong>${escapeHtml(emptyTitle)}</strong>
        <span>${escapeHtml(emptyDetail)}</span>
      </div>
    `;
    }
    return items
        .map((item) => `
        <div class="list-item ${item.highlighted ? 'highlighted' : ''}">
          <strong>${escapeHtml(item.title)}</strong>
          <div class="meta">${escapeHtml(item.meta)}</div>
          <div class="detail">${escapeHtml(item.detail)}</div>
        </div>
      `)
        .join('');
}
function buildVisualReportHtml(report) {
    const metricsHtml = report.metrics
        .map((metric) => `
        <article class="metric">
          <span>${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
        </article>
      `)
        .join('');
    return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(report.title)}</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
        --bg: #0d0706;
        --panel: rgba(29, 16, 11, 0.9);
        --panel-soft: rgba(45, 25, 17, 0.86);
        --border: rgba(244, 188, 96, 0.22);
        --text: #f8ecd2;
        --muted: #cfb38a;
        --accent: #f0b360;
        --accent-soft: rgba(240, 179, 96, 0.12);
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        background:
          radial-gradient(circle at top right, rgba(242, 174, 88, 0.2), transparent 28%),
          radial-gradient(circle at left center, rgba(82, 148, 171, 0.12), transparent 32%),
          var(--bg);
        color: var(--text);
      }

      .page {
        width: 1100px;
        margin: 0 auto;
        padding: 44px;
      }

      .hero {
        position: relative;
        overflow: hidden;
        padding: 28px 30px;
        border-radius: 28px;
        border: 1px solid var(--border);
        background:
          radial-gradient(circle at top right, rgba(242, 174, 88, 0.18), transparent 32%),
          linear-gradient(180deg, rgba(76, 33, 18, 0.92), rgba(25, 13, 10, 0.96));
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid rgba(255, 220, 163, 0.18);
        background: rgba(255, 248, 230, 0.05);
        color: #ffdba6;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        font-size: 12px;
      }

      h1 {
        margin: 18px 0 10px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 42px;
        line-height: 1.12;
      }

      .subtitle,
      .hero-meta,
      .section-intro,
      .meta,
      .detail,
      footer {
        color: var(--muted);
      }

      .subtitle {
        margin: 0;
        font-size: 16px;
        line-height: 1.65;
      }

      .hero-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
      }

      .hero-meta span {
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255, 216, 150, 0.14);
        background: rgba(255, 255, 255, 0.04);
      }

      .metric-grid,
      .content-grid {
        display: grid;
        gap: 16px;
        margin-top: 16px;
      }

      .metric-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .content-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .metric,
      .card,
      .timeline-card {
        border-radius: 22px;
        border: 1px solid var(--border);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)),
          var(--panel);
        box-shadow:
          inset 0 1px 0 rgba(255, 229, 180, 0.06),
          0 16px 40px rgba(0, 0, 0, 0.18);
      }

      .metric {
        padding: 18px 20px;
      }

      .metric span {
        display: block;
        color: var(--muted);
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .metric strong {
        display: block;
        margin-top: 12px;
        color: #fff4d7;
        font-size: 28px;
        font-family: Georgia, "Times New Roman", serif;
      }

      .card,
      .timeline-card {
        padding: 24px;
        page-break-inside: avoid;
      }

      .timeline-card {
        margin-top: 16px;
      }

      h2 {
        margin: 0 0 8px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 24px;
      }

      .section-intro {
        margin: 0 0 18px;
        line-height: 1.6;
      }

      .list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .list-item,
      .empty {
        padding: 16px;
        border-radius: 18px;
        border: 1px solid rgba(247, 209, 140, 0.12);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)),
          var(--panel-soft);
      }

      .list-item.highlighted {
        border-color: rgba(255, 212, 127, 0.28);
        background:
          radial-gradient(circle at top right, rgba(242, 174, 88, 0.12), transparent 34%),
          linear-gradient(180deg, rgba(94, 44, 20, 0.72), rgba(30, 15, 10, 0.92));
      }

      .list-item strong,
      .empty strong {
        display: block;
        font-size: 18px;
        color: #fff3d7;
      }

      .meta {
        margin-top: 8px;
        font-size: 13px;
        line-height: 1.55;
      }

      .detail {
        margin-top: 8px;
        font-size: 14px;
        line-height: 1.65;
        white-space: pre-wrap;
      }

      footer {
        margin-top: 20px;
        text-align: right;
        font-size: 13px;
        line-height: 1.65;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="hero">
        <div class="eyebrow">${escapeHtml(report.badge)}</div>
        <h1>${escapeHtml(report.title)}</h1>
        <p class="subtitle">${escapeHtml(report.subtitle)}</p>
        <div class="hero-meta">
          <span>${escapeHtml(report.periodLabel)}</span>
          <span>导出时间 ${escapeHtml(formatExportDateTime(report.generatedAt))}</span>
        </div>
      </section>

      <section class="metric-grid">${metricsHtml}</section>

      <section class="content-grid">
        <article class="card">
          <h2>高亮战利品</h2>
          <p class="section-intro">优先展示当前周期里最值得记住的战果。</p>
          <div class="list">
            ${renderVisualList(report.highlights, '还没有高亮战利品', '继续刷图后，这里会优先亮出关键掉落。')}
          </div>
        </article>

        <article class="card">
          <h2>场景热区</h2>
          <p class="section-intro">最近最热的地图和你最常出货的区域。</p>
          <div class="list">
            ${renderVisualList(report.hotspots, '还没有形成热区', '再多记录几轮掉落后，这里会开始形成地图热度。')}
          </div>
        </article>
      </section>

      <article class="timeline-card">
        <h2>关键时间线</h2>
        <p class="section-intro">按最近记录整理的战利品时间线，适合回看节奏和收益。</p>
        <div class="list">
          ${renderVisualList(report.timeline, '当前区间没有战利品记录', '先继续记录几条战利品，这里就会长出来。')}
        </div>
      </article>

      <footer>${escapeHtml(report.footer)}</footer>
    </main>
  </body>
</html>`;
}
function getVisualReportHeight(report) {
    return Math.min(2400, Math.max(1440, 960 + report.timeline.length * 88));
}
async function exportVisualReportFile(payload) {
    const suggestedBase = sanitizeFileName(payload.suggestedName.replace(/\.[^.]+$/, ''));
    const extension = payload.format;
    const saveDialogOptions = {
        title: payload.format === 'pdf' ? '导出战报 PDF' : '导出战报海报',
        defaultPath: join(app.getPath('documents'), `${suggestedBase}.${extension}`),
        filters: [
            {
                name: payload.format === 'pdf' ? 'PDF 文件' : 'PNG 图片',
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
    await mkdir(reportPreviewRoot(), { recursive: true });
    const previewFilePath = join(reportPreviewRoot(), `${suggestedBase}-${Date.now()}.html`);
    await writeFile(previewFilePath, buildVisualReportHtml(payload.report), 'utf8');
    const previewWindow = new BrowserWindow({
        show: false,
        width: 1180,
        height: getVisualReportHeight(payload.report),
        backgroundColor: '#0d0706',
        webPreferences: {
            sandbox: false
        }
    });
    try {
        await previewWindow.loadFile(previewFilePath);
        await previewWindow.webContents.executeJavaScript('document.fonts?.ready ? document.fonts.ready.then(() => true) : Promise.resolve(true)');
        await new Promise((resolve) => setTimeout(resolve, 180));
        if (payload.format === 'pdf') {
            const pdfBuffer = await previewWindow.webContents.printToPDF({
                printBackground: true,
                pageSize: 'A4',
                landscape: false
            });
            await writeFile(saveResult.filePath, pdfBuffer);
        }
        else {
            const capturedImage = await previewWindow.webContents.capturePage();
            await writeFile(saveResult.filePath, capturedImage.toPNG());
        }
        return {
            canceled: false,
            path: saveResult.filePath
        };
    }
    finally {
        if (!previewWindow.isDestroyed()) {
            previewWindow.destroy();
        }
        await rm(previewFilePath, { force: true });
    }
}
function resolveMaybeAbsolutePath(inputPath) {
    if (isAbsolute(inputPath)) {
        return inputPath;
    }
    return resolve(workspaceRoot, inputPath);
}
function formatDurationText(durationSeconds) {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${minutes} 分 ${seconds} 秒`;
}
function getRuntimeScriptPath(id) {
    switch (id) {
        case 'rune-cube':
            return join(pythonRuntimeRoot, 'tasks', 'rune_cubing.py');
        case 'gem-cube':
            return join(pythonRuntimeRoot, 'tasks', 'gem_cubing.py');
        case 'drop-shared-gold':
            return join(pythonRuntimeRoot, 'tasks', 'gold_drop.py');
    }
}
function getDropOcrScriptPath() {
    return join(pythonRuntimeRoot, 'tasks', 'drop_ocr.py');
}
function getDefaultProfilePath(id) {
    switch (id) {
        case 'rune-cube':
            return join(pythonRuntimeRoot, 'config', 'rune_profile.json');
        case 'gem-cube':
            return join(pythonRuntimeRoot, 'config', 'gem_profile.json');
        case 'drop-shared-gold':
            return join(pythonRuntimeRoot, 'config', 'gold_drop_profile.json');
    }
}
function getDefaultLegacyConfigPath(id) {
    switch (id) {
        case 'rune-cube':
            return 'E:\\Diablo2Tools\\rune_cubing\\rune_config.json';
        case 'gem-cube':
            return 'E:\\Diablo2Tools\\gem_cubing\\gem_config.json';
        case 'drop-shared-gold':
            return undefined;
    }
}
function defaultIntegrations() {
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
function defaultAutomationDrafts() {
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
function createDefaultData() {
    return {
        counterSession: null,
        activeRun: null,
        runHistory: [],
        drops: [],
        integrations: defaultIntegrations(),
        automationDrafts: defaultAutomationDrafts(),
        settings: {
            alwaysOnTop: true,
            launchOnStartup: false,
            notificationsEnabled: true,
            autoCounterEnabled: false,
            counterLockEnabled: false,
            counterRecognitionIntervalSeconds: 2,
            counterSceneTemplatePath: '',
            counterSceneMatchThreshold: 0.82,
            defaultRunMapName: '3C',
            windowMode: 'panel',
            setupGuideCompleted: false,
            windowPlacement: {}
        }
    };
}
function mergeIntegrations(existing) {
    const current = existing ?? [];
    return defaultIntegrations().map((item) => ({
        ...item,
        ...current.find((integration) => integration.id === item.id)
    }));
}
function normalizeData(input) {
    const fallback = createDefaultData();
    const normalized = {
        counterSession: input?.counterSession ?? fallback.counterSession,
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
            launchOnStartup: input?.settings?.launchOnStartup ?? fallback.settings.launchOnStartup,
            notificationsEnabled: input?.settings?.notificationsEnabled ?? fallback.settings.notificationsEnabled,
            autoCounterEnabled: input?.settings?.autoCounterEnabled ?? fallback.settings.autoCounterEnabled,
            counterLockEnabled: input?.settings?.counterLockEnabled ?? fallback.settings.counterLockEnabled,
            counterRecognitionIntervalSeconds: normalizeCounterRecognitionIntervalSeconds(input?.settings?.counterRecognitionIntervalSeconds),
            counterSceneTemplatePath: typeof input?.settings?.counterSceneTemplatePath === 'string'
                ? input.settings.counterSceneTemplatePath.trim()
                : fallback.settings.counterSceneTemplatePath,
            counterSceneMatchThreshold: normalizeCounterSceneMatchThreshold(input?.settings?.counterSceneMatchThreshold),
            defaultRunMapName: input?.settings?.defaultRunMapName?.trim() || fallback.settings.defaultRunMapName,
            windowMode: input?.settings?.windowMode ?? fallback.settings.windowMode,
            setupGuideCompleted: input?.settings?.setupGuideCompleted ?? fallback.settings.setupGuideCompleted,
            windowPlacement: {
                panel: sanitizeWindowBounds(input?.settings?.windowPlacement?.panel) ?? undefined,
                floating: sanitizeWindowBounds(input?.settings?.windowPlacement?.floating) ?? undefined
            }
        }
    };
    if (hasRecoverableCounterSession(normalized)) {
        normalized.counterSession = null;
    }
    return normalized;
}
function getLaunchOnStartupOptions() {
    if (app.isPackaged) {
        return { path: process.execPath, args: [] };
    }
    return {
        path: process.execPath,
        args: [app.getAppPath()]
    };
}
function getLaunchOnStartupState() {
    try {
        const options = getLaunchOnStartupOptions();
        return app.getLoginItemSettings(options).openAtLogin;
    }
    catch {
        return false;
    }
}
function applyLaunchOnStartupState(value) {
    try {
        const options = getLaunchOnStartupOptions();
        app.setLoginItemSettings({
            openAtLogin: value,
            path: options.path,
            args: options.args
        });
        return getLaunchOnStartupState();
    }
    catch {
        return false;
    }
}
async function ensureFile() {
    const targetPath = dataFilePath();
    await mkdir(dirname(targetPath), { recursive: true });
    if (!existsSync(targetPath)) {
        await writeFile(targetPath, JSON.stringify(createDefaultData(), null, 2), 'utf8');
    }
}
async function readDataStore() {
    await ensureFile();
    const content = await readFile(dataFilePath(), 'utf8');
    const parsed = JSON.parse(content);
    const normalized = normalizeData(parsed);
    if (app.isReady()) {
        normalized.settings.launchOnStartup = getLaunchOnStartupState();
    }
    return normalized;
}
async function writeDataStore(data, options) {
    await ensureFile();
    const normalized = normalizeData(data);
    await writeFile(dataFilePath(), JSON.stringify(normalized, null, 2), 'utf8');
    if (options?.broadcast !== false && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('data:changed', normalized);
    }
    if (options?.refreshTray !== false) {
        void refreshTrayMenu(normalized);
    }
    return normalized;
}
function buildCounterSession(mapName, routeMeta) {
    const startedAt = new Date().toISOString();
    return {
        id: buildId('counter-session'),
        mapName,
        startedAt,
        state: 'waiting-for-game',
        completedRuns: 0,
        totalDurationSeconds: 0,
        lastEventAt: startedAt,
        lastDetectedState: 'booting',
        lastDetail: '自动统计刚刚开始，等待识别游戏状态。',
        routeSource: routeMeta?.source,
        routeConfidence: routeMeta?.confidence,
        routeDetail: routeMeta?.detail,
        recognitionHistory: []
    };
}
function pushCounterRecognitionEvent(session, event) {
    const current = Array.isArray(session.recognitionHistory) ? session.recognitionHistory : [];
    current.unshift(event);
    session.recognitionHistory = current.slice(0, 12);
}
function normalizeDefaultRunMapName(mapName) {
    const normalized = mapName?.trim();
    return normalized && normalized.length > 0 ? normalized : '3C';
}
function normalizeCounterRecognitionIntervalSeconds(input) {
    const parsed = typeof input === 'number'
        ? input
        : typeof input === 'string'
            ? Number.parseFloat(input)
            : Number.NaN;
    if (!Number.isFinite(parsed)) {
        return 5;
    }
    return Math.min(30, Math.max(1, Math.round(parsed)));
}
function normalizeCounterSceneMatchThreshold(input) {
    const parsed = typeof input === 'number'
        ? input
        : typeof input === 'string'
            ? Number.parseFloat(input)
            : Number.NaN;
    if (!Number.isFinite(parsed)) {
        return 0.82;
    }
    return Math.min(0.98, Math.max(0.5, parsed));
}
function shouldKeepRunCounterMonitorAlive(data) {
    return Boolean(data.settings.autoCounterEnabled || data.counterSession || data.activeRun);
}
function isCounterInGameState(state) {
    return state === 'in-game' || state === 'in-game-menu';
}
function isCounterLobbyState(state) {
    return state === 'lobby';
}
function getCounterRouteSourceLabel(source) {
    switch (source) {
        case 'template':
            return '模板识别';
        case 'history':
            return '历史推断';
        case 'manual':
            return '手动指定';
        case 'default':
        default:
            return '默认路线';
    }
}
function inferPreferredCounterRouteFromHistory(data) {
    const recentRuns = data.runHistory.slice(0, 8);
    if (recentRuns.length === 0) {
        return null;
    }
    const stats = new Map();
    for (const run of recentRuns) {
        const current = stats.get(run.mapName) ?? { count: 0, latestEndedAt: 0 };
        current.count += 1;
        current.latestEndedAt = Math.max(current.latestEndedAt, new Date(run.endedAt).getTime());
        stats.set(run.mapName, current);
    }
    const sorted = Array.from(stats.entries())
        .map(([mapName, value]) => ({
        mapName,
        count: value.count,
        latestEndedAt: value.latestEndedAt
    }))
        .sort((left, right) => {
        if (right.count !== left.count) {
            return right.count - left.count;
        }
        return right.latestEndedAt - left.latestEndedAt;
    });
    const top = sorted[0];
    const second = sorted[1];
    if (!top) {
        return null;
    }
    if (top.count >= 2 && (!second || top.count >= second.count + 1)) {
        return {
            mapName: top.mapName,
            source: 'history',
            confidence: Math.min(0.92, 0.55 + top.count * 0.08),
            detail: `最近 ${recentRuns.length} 把里，${top.mapName} 出现了 ${top.count} 次，先按这条主刷路线接管。`
        };
    }
    return null;
}
function resolveCounterRoute(data, event, currentMapName) {
    const routeName = event.routeName?.trim();
    if (routeName) {
        return {
            mapName: routeName,
            source: 'template',
            confidence: event.routeConfidence,
            detail: event.routeDetail?.trim() ||
                `已自动识别为 ${routeName}。`
        };
    }
    const inferred = inferPreferredCounterRouteFromHistory(data);
    if (inferred) {
        return inferred;
    }
    const fallbackMapName = normalizeDefaultRunMapName(event.preferredFallbackMapName || currentMapName || data.settings.defaultRunMapName);
    return {
        mapName: fallbackMapName,
        source: currentMapName ? 'manual' : 'default',
        confidence: undefined,
        detail: event.routeDetail?.trim() ||
            `当前还没有路线模板命中，先沿用${currentMapName ? '当前会话' : '默认'}路线 ${fallbackMapName}。`
    };
}
function finalizeActiveRunRecord(data, endedAt) {
    if (!data.activeRun) {
        return null;
    }
    const finishedRun = data.activeRun;
    const durationSeconds = Math.max(1, Math.round((endedAt.getTime() - new Date(finishedRun.startedAt).getTime()) / 1000));
    data.runHistory.unshift({
        ...finishedRun,
        endedAt: endedAt.toISOString(),
        durationSeconds,
        dayKey: getDayKey(endedAt)
    });
    data.runHistory = data.runHistory.slice(0, 1000);
    data.activeRun = null;
    return {
        mapName: finishedRun.mapName,
        durationSeconds,
        endedAt: endedAt.toISOString()
    };
}
function enqueueRunCounterMonitorUpdate(task) {
    runCounterMonitorEventChain = runCounterMonitorEventChain
        .then(task)
        .catch((error) => {
        console.error('Run counter monitor update failed:', error);
    });
}
async function stopRunCounterMonitor() {
    if (!runCounterMonitorProcess) {
        return;
    }
    runCounterMonitorExpectedExit = true;
    const processRef = runCounterMonitorProcess;
    runCounterMonitorProcess = null;
    runCounterMonitorIntervalSeconds = null;
    try {
        processRef.kill();
    }
    catch {
        return;
    }
}
async function handleRunCounterStateEvent(event) {
    const data = await readDataStore();
    const detectedAt = event.detectedAt ? new Date(event.detectedAt) : new Date();
    const detectedState = (event.state || 'unknown');
    if (!data.counterSession &&
        data.settings.autoCounterEnabled &&
        detectedState === 'route-marker') {
        const route = resolveCounterRoute(data, {
            routeName: event.routeName,
            routeConfidence: event.routeConfidence,
            routeDetail: event.routeDetail
        });
        data.counterSession = buildCounterSession(route.mapName, route);
        data.counterSession.lastEventAt = detectedAt.toISOString();
        data.counterSession.lastDetectedState = detectedState;
        data.counterSession.routeSource = route.source;
        data.counterSession.routeConfidence = route.confidence;
        data.counterSession.routeDetail = route.detail;
        data.counterSession.lastDetail =
            event.detail?.trim() || `已命中 ${route.mapName} 地图名截图，全自动整轮会话已接管。`;
        await writeDataStore(data);
        void sendDesktopNotification('全自动整轮已接管', data.counterSession.lastDetail);
    }
    if (!data.counterSession &&
        data.settings.autoCounterEnabled &&
        (isCounterLobbyState(event.state) ||
            isCounterInGameState(event.state) ||
            detectedState === 'route-marker')) {
        const route = resolveCounterRoute(data, {
            routeName: event.routeName,
            routeConfidence: event.routeConfidence,
            routeDetail: event.routeDetail
        });
        data.counterSession = buildCounterSession(route.mapName, route);
        data.counterSession.lastEventAt = detectedAt.toISOString();
        data.counterSession.lastDetectedState = detectedState;
        data.counterSession.routeSource = route.source;
        data.counterSession.routeConfidence = route.confidence;
        data.counterSession.routeDetail = route.detail;
        data.counterSession.lastDetail = isCounterInGameState(event.state)
            ? `已识别到你正在 ${route.mapName} 游戏内，自动整轮会话已接管并开始计时。`
            : `已识别到大厅，${route.mapName} 全自动整轮会话已待命。进入游戏后会自动起表。`;
        await writeDataStore(data);
        void sendDesktopNotification(isCounterInGameState(event.state) ? '全自动整轮已接管' : '全自动整轮已待命', data.counterSession.lastDetail);
    }
    if (!data.counterSession) {
        return;
    }
    const session = data.counterSession;
    session.lastEventAt = detectedAt.toISOString();
    session.lastDetectedState = detectedState;
    session.lastDetail = event.detail?.trim() || session.lastDetail;
    session.lastTemplate = event.template?.trim() || '';
    session.lastTemplateConfidence = event.confidence;
    session.lastTemplateThreshold = event.requiredConfidence;
    session.lastRouteTemplate = event.routeTemplate?.trim() || '';
    session.lastRouteThreshold = event.routeRequiredConfidence;
    const route = resolveCounterRoute(data, {
        routeName: event.routeName,
        routeConfidence: event.routeConfidence,
        routeDetail: event.routeDetail,
        preferredFallbackMapName: session.mapName
    }, session.mapName);
    session.routeSource = route.source;
    session.routeConfidence = route.confidence;
    session.routeDetail = route.detail;
    pushCounterRecognitionEvent(session, {
        detectedAt: detectedAt.toISOString(),
        state: detectedState,
        detail: session.lastDetail,
        template: session.lastTemplate,
        confidence: session.lastTemplateConfidence,
        requiredConfidence: session.lastTemplateThreshold,
        routeName: session.mapName,
        routeSource: session.routeSource,
        routeDetail: session.routeDetail,
        routeConfidence: event.routeConfidence,
        routeTemplate: session.lastRouteTemplate,
        routeRequiredConfidence: session.lastRouteThreshold
    });
    if (detectedState === 'route-marker') {
        if (route.mapName && route.mapName !== session.mapName) {
            session.mapName = route.mapName;
        }
        session.state = 'in-game';
        if (!data.activeRun) {
            data.activeRun = {
                id: buildId('run'),
                mapName: session.mapName,
                startedAt: detectedAt.toISOString()
            };
            session.lastDetail =
                event.detail?.trim() || `已命中 ${session.mapName} 的地图名截图，开始记录这一把。`;
            await writeDataStore(data);
            void sendDesktopNotification('3C 已开始计时', `${session.mapName} 地图名已出现，这一把开始计时。`);
            return;
        }
        const activeRunStartedAt = new Date(data.activeRun.startedAt).getTime();
        const elapsedSeconds = (detectedAt.getTime() - activeRunStartedAt) / 1000;
        if (elapsedSeconds < counterMarkerMinRunSeconds) {
            session.lastDetail =
                event.detail?.trim() ||
                    `再次命中 ${session.mapName} 地图名，但距离上一把仅 ${formatDurationText(elapsedSeconds)}，本次忽略为重复识别。`;
            await writeDataStore(data);
            return;
        }
        const finalized = finalizeActiveRunRecord(data, detectedAt);
        if (finalized) {
            session.completedRuns += 1;
            session.totalDurationSeconds += finalized.durationSeconds;
            session.lastRunDurationSeconds = finalized.durationSeconds;
            session.lastRunEndedAt = finalized.endedAt;
        }
        data.activeRun = {
            id: buildId('run'),
            mapName: session.mapName,
            startedAt: detectedAt.toISOString()
        };
        session.lastDetail =
            event.detail?.trim() ||
                `再次命中 ${session.mapName} 地图名，已结算上一把并开始下一把。`;
        await writeDataStore(data);
        if (finalized) {
            void sendDesktopNotification(`第 ${session.completedRuns} 把已记录`, `${finalized.mapName} 用时 ${formatDurationText(finalized.durationSeconds)}，下一把已自动开始。`);
        }
        return;
    }
    if (!data.activeRun && route.mapName && route.mapName !== session.mapName) {
        session.mapName = route.mapName;
        session.lastDetail = `${session.lastDetail} 当前路线已切换为 ${route.mapName}（${getCounterRouteSourceLabel(route.source)}）。`;
    }
    if (isCounterInGameState(event.state)) {
        session.state = 'in-game';
        if (!data.activeRun) {
            data.activeRun = {
                id: buildId('run'),
                mapName: session.mapName,
                startedAt: detectedAt.toISOString()
            };
            const nextData = await writeDataStore(data);
            void sendDesktopNotification('已识别进游戏', `${session.mapName} 已开始自动计时。`);
            return void nextData;
        }
        await writeDataStore(data);
        return;
    }
    if (isCounterLobbyState(event.state)) {
        const finalized = finalizeActiveRunRecord(data, detectedAt);
        session.state = finalized ? 'waiting-next-game' : 'waiting-for-game';
        if (finalized) {
            session.completedRuns += 1;
            session.totalDurationSeconds += finalized.durationSeconds;
            session.lastRunDurationSeconds = finalized.durationSeconds;
            session.lastRunEndedAt = finalized.endedAt;
        }
        await writeDataStore(data);
        if (finalized) {
            void sendDesktopNotification(`第 ${session.completedRuns} 把已记录`, `${finalized.mapName} 用时 ${formatDurationText(finalized.durationSeconds)}，累计 ${session.completedRuns} 把。`);
        }
        return;
    }
    if (!data.activeRun) {
        session.state = session.completedRuns > 0 ? 'waiting-next-game' : 'waiting-for-game';
    }
    await writeDataStore(data);
}
function buildCounterSessionV2(mapName, routeMeta) {
    const startedAt = new Date().toISOString();
    return {
        id: buildId('counter-session'),
        mapName,
        startedAt,
        state: 'waiting-for-game',
        completedRuns: 0,
        totalDurationSeconds: 0,
        lastEventAt: startedAt,
        lastDetectedState: 'booting',
        lastDetail: '自动统计刚刚开始，等待识别游戏状态。',
        routeSource: routeMeta?.source,
        routeConfidence: routeMeta?.confidence,
        routeDetail: routeMeta?.detail,
        recognitionHistory: []
    };
}
function hasCounterSceneTemplateV2(data) {
    return Boolean(data.settings.counterSceneTemplatePath.trim());
}
function getCounterRouteSourceLabelV2(source) {
    switch (source) {
        case 'template':
            return '模板识别';
        case 'history':
            return '历史推断';
        case 'manual':
            return '手动指定';
        case 'default':
        default:
            return '默认路线';
    }
}
function inferPreferredCounterRouteFromHistoryV2(data) {
    const recentRuns = data.runHistory.slice(0, 8);
    if (recentRuns.length === 0) {
        return null;
    }
    const stats = new Map();
    for (const run of recentRuns) {
        const current = stats.get(run.mapName) ?? { count: 0, latestEndedAt: 0 };
        current.count += 1;
        current.latestEndedAt = Math.max(current.latestEndedAt, new Date(run.endedAt).getTime());
        stats.set(run.mapName, current);
    }
    const sorted = Array.from(stats.entries())
        .map(([mapName, value]) => ({
        mapName,
        count: value.count,
        latestEndedAt: value.latestEndedAt
    }))
        .sort((left, right) => {
        if (right.count !== left.count) {
            return right.count - left.count;
        }
        return right.latestEndedAt - left.latestEndedAt;
    });
    const top = sorted[0];
    const second = sorted[1];
    if (!top) {
        return null;
    }
    if (top.count >= 2 && (!second || top.count >= second.count + 1)) {
        return {
            mapName: top.mapName,
            source: 'history',
            confidence: Math.min(0.92, 0.55 + top.count * 0.08),
            detail: `最近 ${recentRuns.length} 把里，${top.mapName} 出现了 ${top.count} 次，先按这条路线接管。`
        };
    }
    return null;
}
function resolveCounterRouteV2(data, event, currentMapName) {
    const routeName = event.routeName?.trim();
    if (routeName) {
        return {
            mapName: routeName,
            source: 'template',
            confidence: event.routeConfidence,
            detail: event.routeDetail?.trim() || `已自动识别为 ${routeName}。`
        };
    }
    const inferred = inferPreferredCounterRouteFromHistoryV2(data);
    if (inferred) {
        return inferred;
    }
    const fallbackMapName = normalizeDefaultRunMapName(event.preferredFallbackMapName || currentMapName || data.settings.defaultRunMapName);
    return {
        mapName: fallbackMapName,
        source: currentMapName ? 'manual' : 'default',
        confidence: undefined,
        detail: event.routeDetail?.trim() ||
            `当前还没有命中路线模板，先沿用${currentMapName ? '当前会话' : '默认'}路线 ${fallbackMapName}。`
    };
}
async function handleRunCounterStateEventV2(event) {
    const data = await readDataStore();
    const detectedAt = event.detectedAt ? new Date(event.detectedAt) : new Date();
    const detectedState = (event.state || 'unknown');
    const sceneMarkerRequired = hasCounterSceneTemplateV2(data);
    if (!data.counterSession &&
        data.settings.autoCounterEnabled &&
        detectedState === 'route-marker') {
        const route = resolveCounterRouteV2(data, {
            routeName: event.routeName,
            routeConfidence: event.routeConfidence,
            routeDetail: event.routeDetail
        });
        data.counterSession = buildCounterSessionV2(route.mapName, route);
        data.counterSession.lastEventAt = detectedAt.toISOString();
        data.counterSession.lastDetectedState = detectedState;
        data.counterSession.routeSource = route.source;
        data.counterSession.routeConfidence = route.confidence;
        data.counterSession.routeDetail = route.detail;
        data.counterSession.lastDetail =
            event.detail?.trim() || `已命中 ${route.mapName} 地图名截图，自动计数开始接管。`;
    }
    if (!data.counterSession &&
        data.settings.autoCounterEnabled &&
        !sceneMarkerRequired &&
        (isCounterLobbyState(event.state) || isCounterInGameState(event.state))) {
        const route = resolveCounterRouteV2(data, {
            routeName: event.routeName,
            routeConfidence: event.routeConfidence,
            routeDetail: event.routeDetail
        });
        data.counterSession = buildCounterSessionV2(route.mapName, route);
        data.counterSession.lastEventAt = detectedAt.toISOString();
        data.counterSession.lastDetectedState = detectedState;
        data.counterSession.routeSource = route.source;
        data.counterSession.routeConfidence = route.confidence;
        data.counterSession.routeDetail = route.detail;
        if (isCounterInGameState(event.state)) {
            data.counterSession.state = 'in-game';
            data.counterSession.lastDetail =
                event.detail?.trim() || `已识别你正在 ${route.mapName} 游戏内，自动计数已开始。`;
            data.activeRun = {
                id: buildId('run'),
                mapName: route.mapName,
                startedAt: detectedAt.toISOString()
            };
            await writeDataStore(data);
            void sendDesktopNotification('自动计数已开始', data.counterSession.lastDetail);
            return;
        }
        data.counterSession.state = 'waiting-for-game';
        data.counterSession.lastDetail =
            event.detail?.trim() || `已识别大厅，${route.mapName} 自动计数已待命。进游戏后会自动起表。`;
        await writeDataStore(data);
        void sendDesktopNotification('自动计数已待命', data.counterSession.lastDetail);
        return;
    }
    if (!data.counterSession) {
        return;
    }
    const session = data.counterSession;
    session.lastEventAt = detectedAt.toISOString();
    session.lastDetectedState = detectedState;
    session.lastDetail = event.detail?.trim() || session.lastDetail;
    session.lastTemplate = event.template?.trim() || '';
    session.lastTemplateConfidence = event.confidence;
    session.lastTemplateThreshold = event.requiredConfidence;
    session.lastRouteTemplate = event.routeTemplate?.trim() || '';
    session.lastRouteThreshold = event.routeRequiredConfidence;
    const route = resolveCounterRouteV2(data, {
        routeName: event.routeName,
        routeConfidence: event.routeConfidence,
        routeDetail: event.routeDetail,
        preferredFallbackMapName: session.mapName
    }, session.mapName);
    session.routeSource = route.source;
    session.routeConfidence = route.confidence;
    session.routeDetail = route.detail;
    pushCounterRecognitionEvent(session, {
        detectedAt: detectedAt.toISOString(),
        state: detectedState,
        detail: session.lastDetail,
        template: session.lastTemplate,
        confidence: session.lastTemplateConfidence,
        requiredConfidence: session.lastTemplateThreshold,
        routeName: session.mapName,
        routeSource: session.routeSource,
        routeDetail: session.routeDetail,
        routeConfidence: event.routeConfidence,
        routeTemplate: session.lastRouteTemplate,
        routeRequiredConfidence: session.lastRouteThreshold
    });
    if (detectedState === 'route-marker') {
        if (route.mapName && route.mapName !== session.mapName) {
            session.mapName = route.mapName;
        }
        session.state = 'in-game';
        if (!data.activeRun) {
            data.activeRun = {
                id: buildId('run'),
                mapName: session.mapName,
                startedAt: detectedAt.toISOString()
            };
            session.lastDetail =
                event.detail?.trim() || `已命中 ${session.mapName} 地图名截图，开始记录这一把。`;
            await writeDataStore(data);
            void sendDesktopNotification('3C 已开始计时', `${session.mapName} 地图名已出现，这一把开始计时。`);
            return;
        }
        const activeRunStartedAt = new Date(data.activeRun.startedAt).getTime();
        const elapsedSeconds = (detectedAt.getTime() - activeRunStartedAt) / 1000;
        if (elapsedSeconds < counterMarkerMinRunSeconds) {
            session.lastDetail =
                event.detail?.trim() ||
                    `再次命中 ${session.mapName} 地图名，但距离上一把仅 ${formatDurationText(elapsedSeconds)}，本次忽略为重复识别。`;
            await writeDataStore(data);
            return;
        }
        const finalized = finalizeActiveRunRecord(data, detectedAt);
        if (finalized) {
            session.completedRuns += 1;
            session.totalDurationSeconds += finalized.durationSeconds;
            session.lastRunDurationSeconds = finalized.durationSeconds;
            session.lastRunEndedAt = finalized.endedAt;
        }
        data.activeRun = {
            id: buildId('run'),
            mapName: session.mapName,
            startedAt: detectedAt.toISOString()
        };
        session.lastDetail =
            event.detail?.trim() ||
                `再次命中 ${session.mapName} 地图名，已结算上一把并开始下一把。`;
        await writeDataStore(data);
        if (finalized) {
            void sendDesktopNotification(`第 ${session.completedRuns} 把已记录`, `${finalized.mapName} 用时 ${formatDurationText(finalized.durationSeconds)}，下一把已自动开始。`);
        }
        return;
    }
    if (!data.activeRun && route.mapName && route.mapName !== session.mapName) {
        session.mapName = route.mapName;
        session.lastDetail = `${session.lastDetail} 当前路线已切换为 ${route.mapName}（${getCounterRouteSourceLabelV2(route.source)}）。`;
    }
    if (isCounterInGameState(event.state)) {
        session.state = 'in-game';
        if (!data.activeRun) {
            if (sceneMarkerRequired) {
                session.lastDetail =
                    event.detail?.trim() || `已进入游戏，等待 ${session.mapName} 地图名截图后再起表。`;
                await writeDataStore(data);
                return;
            }
            data.activeRun = {
                id: buildId('run'),
                mapName: session.mapName,
                startedAt: detectedAt.toISOString()
            };
            session.lastDetail = event.detail?.trim() || `${session.mapName} 已开始自动计时。`;
            await writeDataStore(data);
            void sendDesktopNotification('已识别进入游戏', `${session.mapName} 已开始自动计时。`);
            return;
        }
        await writeDataStore(data);
        return;
    }
    if (isCounterLobbyState(event.state)) {
        const finalized = finalizeActiveRunRecord(data, detectedAt);
        session.state = finalized ? 'waiting-next-game' : 'waiting-for-game';
        if (finalized) {
            session.completedRuns += 1;
            session.totalDurationSeconds += finalized.durationSeconds;
            session.lastRunDurationSeconds = finalized.durationSeconds;
            session.lastRunEndedAt = finalized.endedAt;
            session.lastDetail =
                event.detail?.trim() || `${finalized.mapName} 已结算，当前累计 ${session.completedRuns} 把。`;
        }
        else {
            session.lastDetail = event.detail?.trim()
                || (sceneMarkerRequired
                    ? `已回到大厅，继续等待 ${session.mapName} 地图名截图。`
                    : '已回到大厅，等待下一把。');
        }
        await writeDataStore(data);
        if (finalized) {
            void sendDesktopNotification(`第 ${session.completedRuns} 把已记录`, `${finalized.mapName} 用时 ${formatDurationText(finalized.durationSeconds)}，累计 ${session.completedRuns} 把。`);
        }
        return;
    }
    if (!data.activeRun) {
        session.state = session.completedRuns > 0 ? 'waiting-next-game' : 'waiting-for-game';
    }
    await writeDataStore(data);
}
async function ensureRunCounterMonitor() {
    const data = await readDataStore();
    const monitorIntervalSeconds = normalizeCounterRecognitionIntervalSeconds(data.settings.counterRecognitionIntervalSeconds);
    if (runCounterMonitorProcess && !runCounterMonitorProcess.killed) {
        if (runCounterMonitorIntervalSeconds === monitorIntervalSeconds) {
            return;
        }
        await stopRunCounterMonitor();
    }
    const pythonCommand = resolvePythonCommand();
    const scriptPath = runCounterScriptPath();
    const templateRoot = runCounterTemplateRoot();
    const sceneTemplatePath = data.settings.counterSceneTemplatePath.trim();
    const sceneThreshold = normalizeCounterSceneMatchThreshold(data.settings.counterSceneMatchThreshold);
    if (!existsSync(scriptPath)) {
        throw new Error(`自动计数脚本不存在：${scriptPath}`);
    }
    if (!existsSync(templateRoot)) {
        throw new Error(`自动计数模板目录不存在：${templateRoot}`);
    }
    await ensureRouteTemplateWorkspace();
    runCounterMonitorExpectedExit = false;
    const monitorArgs = [
        scriptPath,
        '--template-root',
        templateRoot,
        '--route-template-root',
        runCounterUserTemplateRoot(),
        '--interval',
        String(monitorIntervalSeconds)
    ];
    if (sceneTemplatePath && existsSync(sceneTemplatePath)) {
        monitorArgs.push('--scene-template', sceneTemplatePath, '--scene-name', normalizeDefaultRunMapName(data.settings.defaultRunMapName), '--scene-threshold', String(sceneThreshold));
    }
    const child = spawn(pythonCommand, monitorArgs, {
        cwd: pythonRuntimeRoot,
        env: getUtf8ChildEnv(),
        windowsHide: true
    });
    runCounterMonitorProcess = child;
    runCounterMonitorIntervalSeconds = monitorIntervalSeconds;
    let stdoutBuffer = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
        stdoutBuffer += chunk;
        const lines = stdoutBuffer.split(/\r?\n/);
        stdoutBuffer = lines.pop() ?? '';
        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith('{')) {
                continue;
            }
            try {
                const payload = JSON.parse(line);
                if (payload.type !== 'state' || !payload.state) {
                    continue;
                }
                enqueueRunCounterMonitorUpdate(() => handleRunCounterStateEventV2(payload));
            }
            catch (error) {
                console.error('Failed to parse run counter monitor payload:', line, error);
            }
        }
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
        const message = chunk.trim();
        if (!message) {
            return;
        }
        console.error('run_counter_monitor stderr:', message);
    });
    child.on('exit', (code, signal) => {
        runCounterMonitorProcess = null;
        runCounterMonitorIntervalSeconds = null;
        const expectedExit = runCounterMonitorExpectedExit;
        runCounterMonitorExpectedExit = false;
        if (expectedExit) {
            return;
        }
        enqueueRunCounterMonitorUpdate(async () => {
            const data = await readDataStore();
            if (!data.counterSession) {
                if (data.settings.autoCounterEnabled || data.activeRun) {
                    try {
                        await ensureRunCounterMonitor();
                    }
                    catch (restartError) {
                        console.error('Failed to restart run counter monitor:', restartError);
                    }
                }
                return;
            }
            data.counterSession.state = 'error';
            data.counterSession.lastDetectedState = 'stopped';
            data.counterSession.lastEventAt = new Date().toISOString();
            data.counterSession.lastDetail = `自动计数监控已退出（code=${code ?? 'null'}, signal=${signal ?? 'null'}）。`;
            await writeDataStore(data);
            void sendDesktopNotification('自动计数已中断', '后台监控进程意外退出了，请重新开始一次陪刷统计。');
        });
    });
}
async function syncRunCounterMonitor(data) {
    if (shouldKeepRunCounterMonitorAlive(data)) {
        await ensureRunCounterMonitor();
        return;
    }
    await stopRunCounterMonitor();
}
function applyAlwaysOnTopState(value) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setAlwaysOnTop(value, 'screen-saver');
    }
}
function applyCounterLockState(value) {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }
    mainWindow.setIgnoreMouseEvents(value, { forward: value });
}
async function persistWindowPlacement(mode = activeWindowMode) {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }
    const currentBounds = sanitizeWindowBounds(mainWindow.getBounds());
    if (!currentBounds) {
        return;
    }
    const nextBounds = mode === 'floating'
        ? snapFloatingBounds(currentBounds)
        : clampBoundsToWorkArea(currentBounds, mode);
    if (!areWindowBoundsEqual(currentBounds, nextBounds)) {
        suppressWindowStateCapture();
        mainWindow.setBounds(nextBounds, false);
    }
    emitFloatingSnapPreview(nextBounds);
    const data = await readDataStore();
    const currentPlacement = data.settings.windowPlacement ?? {};
    if (areWindowBoundsEqual(currentPlacement[mode], nextBounds)) {
        return;
    }
    data.settings.windowPlacement = {
        ...currentPlacement,
        [mode]: nextBounds
    };
    await writeDataStore(data, { broadcast: false, refreshTray: false });
}
function scheduleWindowPlacementPersist(mode = activeWindowMode) {
    if (!mainWindow || mainWindow.isDestroyed() || isWindowStateCaptureSuppressed()) {
        return;
    }
    if (persistWindowStateTimer) {
        clearTimeout(persistWindowStateTimer);
    }
    persistWindowStateTimer = setTimeout(() => {
        persistWindowStateTimer = null;
        void persistWindowPlacement(mode);
    }, windowStatePersistDelayMs);
}
async function flushWindowPlacementPersist(mode = activeWindowMode) {
    if (persistWindowStateTimer) {
        clearTimeout(persistWindowStateTimer);
        persistWindowStateTimer = null;
    }
    await persistWindowPlacement(mode);
}
async function applyWindowModeState(mode, data) {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }
    const currentData = data ?? (await readDataStore());
    const metrics = getWindowMetrics(mode);
    const bounds = getResolvedWindowBounds(currentData, mode);
    activeWindowMode = mode;
    mainWindow.setSkipTaskbar(mode === 'floating');
    mainWindow.setResizable(metrics.resizable);
    mainWindow.setMinimumSize(metrics.minWidth, metrics.minHeight);
    if (metrics.resizable) {
        mainWindow.setMaximumSize(10000, 10000);
    }
    else {
        mainWindow.setMaximumSize(metrics.width, metrics.height);
    }
    suppressWindowStateCapture();
    mainWindow.setBounds(bounds, true);
    emitFloatingSnapPreview(bounds);
}
async function ensureFolderAndOpen(targetPath) {
    await mkdir(targetPath, { recursive: true });
    return shell.openPath(targetPath);
}
async function pickCounterSceneTemplateFile() {
    await ensureRouteTemplateWorkspace();
    const dialogOptions = {
        title: '选择 3C 地图名截图',
        properties: ['openFile'],
        filters: [
            {
                name: '图片文件',
                extensions: ['png', 'jpg', 'jpeg', 'bmp', 'webp']
            }
        ]
    };
    const result = mainWindow
        ? await dialog.showOpenDialog(mainWindow, dialogOptions)
        : await dialog.showOpenDialog(dialogOptions);
    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }
    const sourcePath = result.filePaths[0];
    const extension = sourcePath.split('.').pop()?.toLowerCase() || 'png';
    const targetPath = join(runCounterUserSceneTemplateRoot(), `3c-map-name.${extension}`);
    await copyFile(sourcePath, targetPath);
    return {
        path: targetPath,
        fileName: targetPath.split(/[/\\]/).pop() ?? targetPath
    };
}
function createTrayImage() {
    const trayIconPath = getBuildAssetPath('tray-icon.png');
    const trayImage = nativeImage.createFromPath(trayIconPath);
    if (!trayImage.isEmpty()) {
        return trayImage.resize({ width: 16, height: 16 });
    }
    const fallbackImage = nativeImage.createFromPath(getWindowIconPath());
    if (!fallbackImage.isEmpty()) {
        return fallbackImage.resize({ width: 16, height: 16 });
    }
    return nativeImage.createEmpty();
}
function showMainWindow() {
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
function hideMainWindow() {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }
    mainWindow.hide();
    void refreshTrayMenu();
    if (!hasShownTrayHint) {
        hasShownTrayHint = true;
        void sendDesktopNotification('桌宠已收起到托盘', `按 ${toggleWindowShortcut} 可以重新显示桌宠。`);
    }
}
function toggleMainWindowVisibility() {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }
    if (mainWindow.isVisible()) {
        hideMainWindow();
    }
    else {
        showMainWindow();
    }
}
async function sendDesktopNotification(title, body) {
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
async function toggleAlwaysOnTopFromTray() {
    const data = await readDataStore();
    data.settings.alwaysOnTop = !data.settings.alwaysOnTop;
    const nextData = await writeDataStore(data);
    applyAlwaysOnTopState(nextData.settings.alwaysOnTop);
}
async function toggleLaunchOnStartupFromTray() {
    const data = await readDataStore();
    data.settings.launchOnStartup = applyLaunchOnStartupState(!data.settings.launchOnStartup);
    await writeDataStore(data);
}
async function toggleNotificationsFromTray() {
    const data = await readDataStore();
    data.settings.notificationsEnabled = !data.settings.notificationsEnabled;
    const nextData = await writeDataStore(data);
    if (nextData.settings.notificationsEnabled) {
        void sendDesktopNotification('系统通知已开启', '后续刷图、掉落和自动化结果会在这里提醒你。');
    }
}
async function toggleCounterLockState() {
    const data = await readDataStore();
    data.settings.counterLockEnabled = !data.settings.counterLockEnabled;
    const nextData = await writeDataStore(data);
    applyCounterLockState(nextData.settings.counterLockEnabled);
    if (nextData.settings.notificationsEnabled) {
        void sendDesktopNotification(nextData.settings.counterLockEnabled ? '计数器已锁定' : '计数器已解锁', nextData.settings.counterLockEnabled
            ? `当前窗口已进入防误触模式，按 ${toggleCounterLockShortcut} 可解锁。`
            : '当前窗口已经恢复可点击和拖动。');
    }
    return nextData;
}
async function toggleWindowModeFromTray() {
    const data = await readDataStore();
    await flushWindowPlacementPersist(data.settings.windowMode);
    data.settings.windowMode =
        data.settings.windowMode === 'floating' ? 'panel' : 'floating';
    const nextData = await writeDataStore(data);
    await applyWindowModeState(nextData.settings.windowMode, nextData);
    applyAlwaysOnTopState(nextData.settings.alwaysOnTop);
    applyCounterLockState(nextData.settings.counterLockEnabled);
}
async function refreshTrayMenu(data) {
    if (!tray) {
        return;
    }
    const currentData = data ?? (await readDataStore());
    const template = [
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
            label: '锁定计数器',
            type: 'checkbox',
            checked: currentData.settings.counterLockEnabled,
            click: () => {
                void toggleCounterLockState();
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
            label: currentData.settings.windowMode === 'floating'
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
function createTray() {
    if (tray) {
        return;
    }
    tray = new Tray(createTrayImage());
    tray.on('click', () => showMainWindow());
    tray.on('double-click', () => toggleMainWindowVisibility());
    void refreshTrayMenu();
}
function registerGlobalShortcuts() {
    globalShortcut.unregisterAll();
    globalShortcut.register(toggleWindowShortcut, () => {
        toggleMainWindowVisibility();
    });
    globalShortcut.register(toggleCounterLockShortcut, () => {
        void toggleCounterLockState();
    });
}
async function savePngFromDataUrl(payload) {
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
function executeCommand(commandLine, cwd) {
    return new Promise((resolveResult) => {
        exec(commandLine, {
            cwd: cwd || undefined,
            env: getUtf8ChildEnv(),
            windowsHide: true,
            encoding: 'utf8',
            maxBuffer: 4 * 1024 * 1024
        }, (error, stdout, stderr) => {
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
        });
    });
}
function executeFileCommand(command, args, cwd, windowsHide = true) {
    return new Promise((resolveResult) => {
        execFile(command, args, {
            cwd: cwd || undefined,
            env: getUtf8ChildEnv(),
            windowsHide,
            encoding: 'utf8',
            maxBuffer: 4 * 1024 * 1024
        }, (error, stdout, stderr) => {
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
        });
    });
}
function emitAutomationRecordProgress(payload) {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }
    mainWindow.webContents.send('automation:record-progress', payload);
}
function getRecordProfileStepCount(id) {
    switch (id) {
        case 'rune-cube':
            return 5;
        case 'gem-cube':
            return 9;
        case 'drop-shared-gold':
            return 4;
    }
}
function getRecordProfileStepIndex(id, line) {
    const normalized = line.toLowerCase();
    switch (id) {
        case 'rune-cube':
            if (normalized.includes('capture the cube output slot')) {
                return 0;
            }
            if (normalized.includes('capture the transmute button')) {
                return 1;
            }
            if (normalized.includes('capture the top-left rune slot')) {
                return 2;
            }
            if (normalized.includes('capture the top-right rune slot')) {
                return 3;
            }
            if (normalized.includes('capture the bottom-left rune slot')) {
                return 4;
            }
            return null;
        case 'gem-cube':
            if (normalized.includes('capture cube input slot #1')) {
                return 0;
            }
            if (normalized.includes('capture cube input slot #2')) {
                return 1;
            }
            if (normalized.includes('capture cube input slot #3')) {
                return 2;
            }
            if (normalized.includes('capture the cube output slot')) {
                return 3;
            }
            if (normalized.includes('capture the transmute button')) {
                return 4;
            }
            if (normalized.includes('capture a result destination slot')) {
                return 5;
            }
            if (normalized.includes('capture the top-left gem stack anchor')) {
                return 6;
            }
            if (normalized.includes('capture the top-right gem stack anchor')) {
                return 7;
            }
            if (normalized.includes('capture the bottom-left gem stack anchor')) {
                return 8;
            }
            return null;
        case 'drop-shared-gold':
            if (normalized.includes('capture the stash object in the world')) {
                return 0;
            }
            if (normalized.includes('capture the shared stash tab')) {
                return 1;
            }
            if (normalized.includes('capture the stash gold button')) {
                return 2;
            }
            if (normalized.includes('capture the inventory gold button')) {
                return 3;
            }
            return null;
    }
}
function executeFileCommandWithProgress(integration, command, args, cwd) {
    const totalSteps = getRecordProfileStepCount(integration.id);
    const updatedAt = () => new Date().toISOString();
    emitAutomationRecordProgress({
        id: integration.id,
        action: 'record-profile',
        kind: 'status',
        line: 'Recording started.',
        updatedAt: updatedAt(),
        totalSteps
    });
    return new Promise((resolveResult) => {
        const stdoutLines = [];
        const stderrLines = [];
        let stdoutBuffer = '';
        let stderrBuffer = '';
        let finished = false;
        let lastStepIndex;
        const child = spawn(command, args, {
            cwd: cwd || undefined,
            env: getUtf8ChildEnv(),
            windowsHide: false,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        child.stdout?.setEncoding('utf8');
        child.stderr?.setEncoding('utf8');
        const emitLine = (kind, rawLine) => {
            const cleanLine = rawLine.replace(/\u001b\[[0-9;]*m/g, '').trim();
            if (!cleanLine) {
                return;
            }
            if (kind === 'stdout') {
                stdoutLines.push(cleanLine);
            }
            else {
                stderrLines.push(cleanLine);
            }
            const stepIndex = getRecordProfileStepIndex(integration.id, cleanLine);
            if (typeof stepIndex === 'number') {
                lastStepIndex = stepIndex;
            }
            emitAutomationRecordProgress({
                id: integration.id,
                action: 'record-profile',
                kind,
                line: cleanLine,
                updatedAt: updatedAt(),
                stepIndex: stepIndex ?? undefined,
                totalSteps
            });
        };
        const flushBuffer = (kind, final = false) => {
            const source = kind === 'stdout' ? stdoutBuffer : stderrBuffer;
            const normalized = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const lines = normalized.split('\n');
            const remainder = final ? '' : (lines.pop() ?? '');
            for (const line of lines) {
                emitLine(kind, line);
            }
            if (final && remainder) {
                emitLine(kind, remainder);
            }
            if (kind === 'stdout') {
                stdoutBuffer = remainder;
            }
            else {
                stderrBuffer = remainder;
            }
        };
        child.stdout?.on('data', (chunk) => {
            stdoutBuffer += chunk.toString();
            flushBuffer('stdout');
        });
        child.stderr?.on('data', (chunk) => {
            stderrBuffer += chunk.toString();
            flushBuffer('stderr');
        });
        child.on('error', (error) => {
            if (finished) {
                return;
            }
            finished = true;
            const message = error.message.trim() || 'Failed to launch profile recorder.';
            stderrLines.push(message);
            emitAutomationRecordProgress({
                id: integration.id,
                action: 'record-profile',
                kind: 'status',
                line: message,
                updatedAt: updatedAt(),
                stepIndex: lastStepIndex,
                totalSteps,
                finished: true,
                success: false
            });
            resolveResult({
                success: false,
                code: null,
                stdout: stdoutLines.join('\n').trim(),
                stderr: stderrLines.join('\n').trim()
            });
        });
        child.on('close', (code) => {
            if (finished) {
                return;
            }
            flushBuffer('stdout', true);
            flushBuffer('stderr', true);
            finished = true;
            const success = code === 0;
            const finalLine = success
                ? stdoutLines.at(-1) || 'Profile recording finished.'
                : stderrLines.at(-1) || stdoutLines.at(-1) || 'Profile recording failed.';
            emitAutomationRecordProgress({
                id: integration.id,
                action: 'record-profile',
                kind: 'status',
                line: finalLine,
                updatedAt: updatedAt(),
                stepIndex: success ? Math.max(0, totalSteps - 1) : lastStepIndex,
                totalSteps,
                finished: true,
                success
            });
            resolveResult({
                success,
                code: code ?? null,
                stdout: stdoutLines.join('\n').trim(),
                stderr: stderrLines.join('\n').trim()
            });
        });
    });
}
async function extractRuntimeInstallerScript() {
    const sourcePath = join(workspaceRoot, 'scripts', 'prepare-python-runtime.ps1');
    const targetDirectory = join(app.getPath('temp'), 'd2-pet-runtime');
    const targetPath = join(targetDirectory, 'prepare-python-runtime.ps1');
    const content = await readFile(sourcePath, 'utf8');
    await mkdir(targetDirectory, { recursive: true });
    await writeFile(targetPath, content, 'utf8');
    return targetPath;
}
async function installManagedPythonRuntime() {
    const bootstrapPython = resolveBootstrapPythonCommand();
    const scriptPath = await extractRuntimeInstallerScript();
    const command = 'powershell.exe';
    const args = [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        scriptPath,
        '-PythonCommand',
        bootstrapPython,
        '-RuntimeRoot',
        managedPythonRoot(),
        '-RequirementsPath',
        runtimeRequirementsPath()
    ];
    const result = await executeFileCommand(command, args, workspaceRoot);
    if (result.success) {
        resolvedPythonCommand = null;
        invalidatePythonEnvironmentProbe();
    }
    return {
        command,
        args,
        result
    };
}
function quoteArg(value) {
    return value.includes(' ') ? `"${value}"` : value;
}
function parseJsonOutput(result) {
    const content = result.stdout.trim();
    if (!content) {
        throw new Error(result.stderr || 'Python task did not return any JSON output.');
    }
    try {
        return JSON.parse(content);
    }
    catch (error) {
        throw new Error(`Failed to parse JSON output: ${error instanceof Error ? error.message : 'unknown parse error'}`);
    }
}
async function getPythonEnvironmentProbe() {
    const cached = pythonEnvironmentProbeCache;
    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }
    const pythonCommand = resolvePythonCommand();
    const pipVersionResult = await executeFileCommand(pythonCommand, ['-m', 'pip', '--version'], pythonRuntimeRoot);
    const dependencyResult = await executeFileCommand(pythonCommand, ['-c', buildDependencyProbeScript()], pythonRuntimeRoot);
    const ocrEngineResult = await executeFileCommand(pythonCommand, ['-c', buildOcrEngineProbeScript()], pythonRuntimeRoot);
    const value = {
        pipAvailable: pipVersionResult.success,
        pipVersion: (pipVersionResult.stdout || pipVersionResult.stderr).trim(),
        dependencies: dependencyResult.success
            ? parseJsonOutput(dependencyResult)
            : pythonDependencyModules.map((item) => ({
                ...item,
                installed: false,
                version: ''
            })),
        ocrEngine: ocrEngineResult.success
            ? parseJsonOutput(ocrEngineResult).engine
            : 'none'
    };
    pythonEnvironmentProbeCache = {
        expiresAt: Date.now() + 5_000,
        value
    };
    return value;
}
async function writeAutomationLog(id, actionLabel, command, args, result) {
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
function summarizeActionResult(actionLabel, result) {
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
function createCheck(key, level, label, detail) {
    return { key, level, label, detail };
}
function resolvePreflightStatus(checks) {
    if (checks.some((check) => check.level === 'error')) {
        return 'error';
    }
    if (checks.some((check) => check.level === 'warning')) {
        return 'warning';
    }
    return 'ready';
}
function buildPreflightSummary(taskTitle, status, checks) {
    const firstProblem = checks.find((check) => check.level !== 'ok');
    if (!firstProblem) {
        return `${taskTitle} 已通过预检，可以先试运行再决定是否正式执行。`;
    }
    if (status === 'error') {
        return `${taskTitle} 还有阻塞项：${firstProblem.detail}`;
    }
    return `${taskTitle} 可以继续，但建议先处理：${firstProblem.detail}`;
}
function parseNumberDraft(value) {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
        return null;
    }
    return Number(trimmed);
}
function buildRuneInputChecks(drafts) {
    const maxSlots = 36;
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
    if (tokens.length > maxSlots) {
        return [
            createCheck('rune-counts', 'error', '符文数量', `当前填写了 ${tokens.length} 个槽位，超过了符文工作台的 ${maxSlots} 个槽位。`)
        ];
    }
    return [
        createCheck('rune-counts', tokens.length === maxSlots ? 'ok' : 'warning', '符文数量', tokens.length === maxSlots
            ? '已填写完整的 36 个符文槽位。'
            : `当前填写了 ${tokens.length} 个槽位，桌宠会自动补齐剩余空槽为 0。`),
        createCheck('rune-wait', drafts.runeWaitSeconds <= 10 ? 'ok' : 'warning', '等待秒数', `执行前会等待 ${drafts.runeWaitSeconds} 秒。`)
    ];
}
function buildGemInputChecks(drafts, hasGemClipboardImage) {
    const checks = [
        createCheck('gem-mode', 'ok', '识别模式', drafts.gemInputMode === 'matrix' ? '当前使用矩阵输入。' : '当前使用截图识别。')
    ];
    if (drafts.gemInputMode === 'matrix') {
        const matrix = drafts.gemMatrix.trim();
        if (!matrix) {
            checks.push(createCheck('gem-matrix', 'error', '宝石矩阵', '还没有填写宝石矩阵。'));
        }
        else {
            const rows = matrix.split(';').map((item) => item.trim()).filter(Boolean);
            const invalidRow = rows.find((row) => row
                .split(/\s+/)
                .map((item) => item.trim())
                .filter(Boolean)
                .some((item) => !/^\d+$/.test(item)));
            if (invalidRow) {
                checks.push(createCheck('gem-matrix', 'error', '宝石矩阵', '矩阵里包含了非整数内容。'));
            }
            else if (rows.length > 7) {
                checks.push(createCheck('gem-matrix', 'error', '宝石矩阵', '宝石矩阵最多支持 7 个颜色列。'));
            }
            else {
                const longestColumn = rows.reduce((max, row) => {
                    const length = row.split(/\s+/).map((item) => item.trim()).filter(Boolean).length;
                    return Math.max(max, length);
                }, 0);
                const level = rows.length === 7 && longestColumn === 5 ? 'ok' : 'warning';
                checks.push(createCheck('gem-matrix', level, '宝石矩阵', level === 'ok'
                    ? '已填写完整的 7 色 x 5 阶矩阵。'
                    : `当前提供了 ${rows.length} 个颜色列，最长一列 ${longestColumn} 个等级，桌宠会自动补齐缺失的空位。`));
            }
        }
    }
    else {
        const imagePath = drafts.gemImagePath.trim();
        if (hasGemClipboardImage) {
            checks.push(createCheck('gem-screenshot', 'ok', '截图来源', '已检测到剪贴板截图，运行前会自动保存到本地。'));
        }
        else if (!imagePath) {
            checks.push(createCheck('gem-screenshot', 'error', '截图来源', '请先粘贴宝石截图，或填写一个现有截图路径。'));
        }
        else {
            const resolvedPath = resolveMaybeAbsolutePath(imagePath);
            checks.push(createCheck('gem-screenshot', existsSync(resolvedPath) ? 'ok' : 'error', '截图来源', existsSync(resolvedPath)
                ? `已找到截图：${resolvedPath}`
                : `未找到截图：${resolvedPath}`));
        }
    }
    checks.push(createCheck('gem-wait', drafts.gemWaitSeconds <= 10 ? 'ok' : 'warning', '等待秒数', `执行前会等待 ${drafts.gemWaitSeconds} 秒。`));
    return checks;
}
function buildGoldInputChecks(drafts) {
    const amount = parseNumberDraft(drafts.goldAmount);
    const level = parseNumberDraft(drafts.goldLevel);
    return [
        createCheck('gold-amount', amount === null ? 'error' : 'ok', '总金额', amount === null ? '总金额必须是整数。' : `当前计划处理 ${drafts.goldAmount.trim()} 金币。`),
        createCheck('gold-level', level === null ? 'error' : level < 75 ? 'warning' : 'ok', '角色等级', level === null
            ? '角色等级必须是整数。'
            : level < 75
                ? `当前等级 ${level}，建议确认角色能承受预期批次。`
                : `当前等级 ${level}。`),
        createCheck('gold-wait', drafts.goldWaitSeconds <= 10 ? 'ok' : 'warning', '等待秒数', `执行前会等待 ${drafts.goldWaitSeconds} 秒。`)
    ];
}
async function buildAutomationPreflight(payload) {
    const data = await readDataStore();
    const drafts = {
        ...defaultAutomationDrafts(),
        ...payload.drafts
    };
    const requirementsPath = runtimeRequirementsPath();
    const pythonCommand = resolvePythonCommand();
    const pythonVersion = await executeFileCommand(pythonCommand, ['--version'], pythonRuntimeRoot);
    let environmentProbe = null;
    if (pythonVersion.success) {
        try {
            environmentProbe = await getPythonEnvironmentProbe();
        }
        catch {
            environmentProbe = null;
        }
    }
    const missingPackages = environmentProbe
        ? environmentProbe.dependencies
            .filter((item) => !item.installed)
            .map((item) => item.package)
        : [];
    const globalChecks = [
        createCheck('runtime-root', existsSync(pythonRuntimeRoot) ? 'ok' : 'error', 'Python Runtime', existsSync(pythonRuntimeRoot)
            ? `已找到 runtime：${pythonRuntimeRoot}`
            : `未找到 runtime：${pythonRuntimeRoot}`),
        createCheck('python-command', pythonVersion.success ? 'ok' : 'error', 'Python 解释器', pythonVersion.success
            ? `${pythonCommand} 可用：${(pythonVersion.stdout || pythonVersion.stderr).trim()}`
            : `无法运行 ${pythonCommand}，请先安装 Python 或补齐打包运行时。`),
        createCheck('requirements-file', existsSync(requirementsPath) ? 'ok' : 'error', 'requirements.txt', existsSync(requirementsPath)
            ? `已找到依赖清单：${requirementsPath}`
            : `未找到依赖清单：${requirementsPath}`),
        createCheck('pip-command', environmentProbe?.pipAvailable ? 'ok' : pythonVersion.success ? 'error' : 'warning', 'pip 环境', environmentProbe?.pipAvailable
            ? environmentProbe.pipVersion
            : pythonVersion.success
                ? '当前 Python 缺少可用的 pip，无法在桌宠内直接安装运行时依赖。'
                : '等待 Python 解释器先通过预检。'),
        createCheck('python-dependencies', !environmentProbe
            ? 'warning'
            : missingPackages.length === 0
                ? 'ok'
                : 'error', 'Python 依赖', !environmentProbe
            ? '等待 Python 解释器先通过预检。'
            : missingPackages.length === 0
                ? `已检测到 ${environmentProbe.dependencies.length} 项运行时依赖。`
                : `缺少 ${missingPackages.length} 项：${missingPackages.join(', ')}`),
        createCheck('ocr-engine', !environmentProbe
            ? 'warning'
            : environmentProbe.ocrEngine === 'none'
                ? 'warning'
                : 'ok', 'OCR 引擎', !environmentProbe
            ? '等待 Python 解释器先通过预检。'
            : environmentProbe.ocrEngine === 'none'
                ? '当前没有可用 OCR 引擎，掉落识别和宝石截图识别会受影响。'
                : `当前可用 OCR：${environmentProbe.ocrEngine}`),
        ...(environmentProbe?.dependencies.map((item) => createCheck(`dependency-${item.package}`, item.installed ? 'ok' : 'error', item.package, item.installed
            ? item.version && item.version !== 'unknown'
                ? `已安装，版本 ${item.version}`
                : '已安装，但当前无法读取版本号。'
            : `未安装，对应模块 ${item.module} 当前不可用。`)) ?? [])
    ];
    if (pythonVersion.success) {
        const pythonSource = getPythonSourceStatus(pythonCommand);
        globalChecks.splice(2, 0, createCheck('python-source', pythonSource.level, 'Python 来源', pythonSource.detail));
    }
    else {
        globalChecks.splice(2, 0, createCheck('python-source', 'warning', 'Python 来源', '等待 Python 解释器先通过预检。'));
    }
    const tasks = data.integrations.map((integration) => {
        const taskChecks = [
            createCheck('task-enabled', integration.enabled ? 'ok' : 'error', '任务状态', integration.enabled ? '当前任务已启用。' : '当前任务处于停用状态。'),
            createCheck('script-path', existsSync(getRuntimeScriptPath(integration.id)) ? 'ok' : 'error', '运行脚本', existsSync(getRuntimeScriptPath(integration.id))
                ? `已找到脚本：${getRuntimeScriptPath(integration.id)}`
                : `未找到脚本：${getRuntimeScriptPath(integration.id)}`),
            createCheck('profile-path', existsSync(resolveMaybeAbsolutePath(integration.profilePath)) ? 'ok' : 'error', 'Profile', existsSync(resolveMaybeAbsolutePath(integration.profilePath))
                ? `已找到 profile：${resolveMaybeAbsolutePath(integration.profilePath)}`
                : `未找到 profile：${resolveMaybeAbsolutePath(integration.profilePath)}`)
        ];
        if (integration.supportsLegacyImport) {
            const legacyPath = integration.legacyConfigPath?.trim();
            const resolvedLegacyPath = legacyPath ? resolveMaybeAbsolutePath(legacyPath) : '';
            taskChecks.push(createCheck('legacy-config', legacyPath && existsSync(resolvedLegacyPath) ? 'ok' : 'warning', '旧配置', legacyPath && existsSync(resolvedLegacyPath)
                ? `已找到旧配置：${resolvedLegacyPath}`
                : '当前没有可直接导入的旧配置文件。'));
        }
        if (drafts.allowInactiveWindow) {
            taskChecks.push(createCheck('inactive-window', 'warning', '窗口焦点', '已允许窗口未置顶时继续点击，请确认不会误点到其他窗口。'));
        }
        else {
            taskChecks.push(createCheck('inactive-window', 'ok', '窗口焦点', '当前要求游戏窗口处于前台，更适合联调。'));
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
function buildRuntimeArgs(integration, payload) {
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
            }
            else {
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
function buildRuntimeArgsV2(integration, payload) {
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
            }
            else {
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
function buildAutomationAdminArgs(integration, payload) {
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
async function runBuiltinAutomation(integration, args, actionLabel) {
    const pythonCommand = resolvePythonCommand();
    const result = actionLabel === 'record-profile'
        ? await executeFileCommandWithProgress(integration, pythonCommand, args, integration.workingDirectory || pythonRuntimeRoot)
        : await executeFileCommand(pythonCommand, args, integration.workingDirectory || pythonRuntimeRoot, true);
    const logPath = await writeAutomationLog(integration.id, actionLabel, pythonCommand, args, result);
    return { result, logPath };
}
async function runEnvironmentAction(payload) {
    let command;
    let args;
    let result;
    switch (payload.action) {
        case 'install-python-runtime': {
            const runtimeInstall = await installManagedPythonRuntime();
            command = runtimeInstall.command;
            args = runtimeInstall.args;
            result = runtimeInstall.result;
            break;
        }
        case 'install-python-deps': {
            const pythonCommand = resolvePythonCommand();
            const requirementsPath = runtimeRequirementsPath();
            if (!existsSync(requirementsPath)) {
                throw new Error(`未找到依赖清单：${requirementsPath}`);
            }
            command = pythonCommand;
            args = ['-m', 'pip', 'install', '--disable-pip-version-check', '-r', requirementsPath];
            result = await executeFileCommand(pythonCommand, args, pythonRuntimeRoot);
            break;
        }
    }
    const logPath = await writeAutomationLog('environment', payload.action, command, args, result);
    resolvedPythonCommand = null;
    invalidatePythonEnvironmentProbe();
    return {
        result,
        log: {
            path: logPath,
            content: await readFile(logPath, 'utf8')
        }
    };
}
async function runDropOcr(imagePath) {
    const scriptPath = getDropOcrScriptPath();
    if (!existsSync(scriptPath)) {
        throw new Error(`未找到掉落 OCR 脚本：${scriptPath}`);
    }
    const pythonCommand = resolvePythonCommand();
    const result = await executeFileCommand(pythonCommand, [scriptPath, '--image', imagePath, '--json'], pythonRuntimeRoot);
    if (!result.success) {
        throw new Error(result.stderr || '掉落 OCR 执行失败。');
    }
    return parseJsonOutput(result);
}
async function createMainWindow() {
    const data = await readDataStore();
    const metrics = getWindowMetrics(data.settings.windowMode);
    const initialBounds = getResolvedWindowBounds(data, data.settings.windowMode);
    activeWindowMode = data.settings.windowMode;
    mainWindow = new BrowserWindow({
        x: initialBounds.x,
        y: initialBounds.y,
        width: initialBounds.width,
        height: initialBounds.height,
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
        backgroundColor: '#00000000',
        icon: existsSync(getWindowIconPath()) ? getWindowIconPath() : undefined,
        // On Windows, `frame: false` is enough to create a truly frameless window.
        // Mixing it with title bar APIs can still leave a visible caption strip.
        title: process.platform === 'win32' ? '' : '暗黑 2 桌宠助手',
        alwaysOnTop: data.settings.alwaysOnTop,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });
    applyAlwaysOnTopState(data.settings.alwaysOnTop);
    await applyWindowModeState(data.settings.windowMode, data);
    applyCounterLockState(data.settings.counterLockEnabled);
    mainWindow.setMenuBarVisibility(false);
    mainWindow.on('close', (event) => {
        if (isQuitting) {
            return;
        }
        event.preventDefault();
        void flushWindowPlacementPersist();
        hideMainWindow();
    });
    mainWindow.on('show', () => {
        emitFloatingSnapPreview();
        void refreshTrayMenu();
    });
    mainWindow.on('hide', () => {
        void flushWindowPlacementPersist();
        emitFloatingSnapPreview();
        void refreshTrayMenu();
    });
    mainWindow.on('move', () => {
        emitFloatingSnapPreview();
        scheduleWindowPlacementPersist();
    });
    mainWindow.on('resize', () => {
        if (activeWindowMode === 'panel') {
            scheduleWindowPlacementPersist();
        }
    });
    if (process.env.VITE_DEV_SERVER_URL) {
        await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    }
    else {
        await mainWindow.loadFile(join(__dirname, '../../dist/index.html'));
    }
}
app.whenReady().then(async () => {
    app.setAppUserModelId('d2-desktop-pet');
    await createMainWindow();
    await syncRunCounterMonitor(await readDataStore());
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
ipcMain.handle('run:start', async (_event, payload) => {
    const mapName = payload.mapName.trim();
    if (!mapName) {
        throw new Error('开始刷图前请先填写地图名称。');
    }
    const data = await readDataStore();
    if (data.counterSession) {
        throw new Error('自动统计已经在运行。进游戏后会自动开始计时。');
    }
    if (data.activeRun) {
        throw new Error('当前已经有一条进行中的刷图记录。');
    }
    data.counterSession = buildCounterSession(mapName, {
        source: 'manual',
        detail: `这轮由你手动指定为 ${mapName}。`
    });
    const nextData = await writeDataStore(data);
    try {
        await ensureRunCounterMonitor();
    }
    catch (error) {
        const rollbackData = await readDataStore();
        rollbackData.counterSession = null;
        await writeDataStore(rollbackData);
        throw error;
    }
    void sendDesktopNotification('自动计数已开启', `${mapName} 已进入等待识别状态。进游戏后会自动起表。`);
    return nextData;
});
ipcMain.handle('run:stop', async () => {
    const data = await readDataStore();
    if (!data.counterSession && !data.activeRun) {
        throw new Error('当前没有正在进行中的自动统计。');
    }
    await stopRunCounterMonitor();
    const now = new Date();
    const finalized = finalizeActiveRunRecord(data, now);
    if (data.counterSession && finalized) {
        data.counterSession.completedRuns += 1;
        data.counterSession.totalDurationSeconds += finalized.durationSeconds;
        data.counterSession.lastRunDurationSeconds = finalized.durationSeconds;
        data.counterSession.lastRunEndedAt = finalized.endedAt;
    }
    const session = data.counterSession;
    const sessionMapName = session?.mapName ?? finalized?.mapName ?? '本次陪刷';
    const completedRuns = session?.completedRuns ?? (finalized ? 1 : 0);
    const totalDurationSeconds = session?.totalDurationSeconds ?? finalized?.durationSeconds ?? 0;
    data.counterSession = null;
    const nextData = await writeDataStore(data);
    void sendDesktopNotification('自动计数已停止', `${sessionMapName} 共记录 ${completedRuns} 把，累计 ${formatDurationText(totalDurationSeconds)}。`);
    return nextData;
});
function hasRecoverableCounterSession(data) {
    return Boolean(data.counterSession &&
        !data.activeRun &&
        (data.counterSession.state === 'error' ||
            data.counterSession.lastDetectedState === 'stopped'));
}
function canRecycleIdleCounterSession(data) {
    return Boolean(data.counterSession &&
        !data.activeRun &&
        data.counterSession.state !== 'in-game');
}
ipcMain.removeHandler('run:start');
ipcMain.handle('run:start', async (_event, payload) => {
    const mapName = payload.mapName.trim();
    if (!mapName) {
        throw new Error('开始刷图前请先填写地图名称。');
    }
    const data = await readDataStore();
    if (hasRecoverableCounterSession(data)) {
        data.counterSession = null;
    }
    if (canRecycleIdleCounterSession(data) &&
        data.counterSession &&
        data.counterSession.mapName.trim().toLowerCase() === mapName.toLowerCase()) {
        data.counterSession.lastEventAt = new Date().toISOString();
        data.counterSession.lastDetail = `已经在等待 ${mapName} 的游戏状态识别。进游戏后会自动开始计时。`;
        const nextData = await writeDataStore(data);
        await ensureRunCounterMonitor();
        return nextData;
    }
    if (canRecycleIdleCounterSession(data)) {
        data.counterSession = null;
    }
    if (data.counterSession) {
        throw new Error('当前已经有一轮自动计数在进行中，请先结束本次统计。');
    }
    if (data.activeRun) {
        throw new Error('当前已经有一把正在计时，请先结束本次统计。');
    }
    data.counterSession = buildCounterSession(mapName, {
        source: 'manual',
        detail: `这轮由你手动指定为 ${mapName}。`
    });
    data.counterSession.lastDetail = '自动计数已启动，正在等待识别游戏状态。';
    const nextData = await writeDataStore(data);
    try {
        await ensureRunCounterMonitor();
    }
    catch (error) {
        const rollbackData = await readDataStore();
        rollbackData.counterSession = null;
        await writeDataStore(rollbackData);
        throw error;
    }
    void sendDesktopNotification('自动计数已开启', `${mapName} 已进入等待识别状态。进游戏后会自动起表。`);
    return nextData;
});
ipcMain.removeHandler('run:stop');
ipcMain.handle('run:stop', async () => {
    const data = await readDataStore();
    if (!data.counterSession && !data.activeRun) {
        throw new Error('当前没有正在进行中的自动统计。');
    }
    const now = new Date();
    const finalized = finalizeActiveRunRecord(data, now);
    if (data.counterSession && finalized) {
        data.counterSession.completedRuns += 1;
        data.counterSession.totalDurationSeconds += finalized.durationSeconds;
        data.counterSession.lastRunDurationSeconds = finalized.durationSeconds;
        data.counterSession.lastRunEndedAt = finalized.endedAt;
    }
    const session = data.counterSession;
    const sessionMapName = session?.mapName ?? finalized?.mapName ?? '本次陪刷';
    const completedRuns = session?.completedRuns ?? (finalized ? 1 : 0);
    const totalDurationSeconds = session?.totalDurationSeconds ?? finalized?.durationSeconds ?? 0;
    data.counterSession = null;
    const nextData = await writeDataStore(data);
    await syncRunCounterMonitor(nextData);
    void sendDesktopNotification(nextData.settings.autoCounterEnabled ? '本次统计已结束' : '自动计数已停止', nextData.settings.autoCounterEnabled
        ? `${sessionMapName} 共记录 ${completedRuns} 把，累计 ${formatDurationText(totalDurationSeconds)}。全自动待命仍然开启。`
        : `${sessionMapName} 共记录 ${completedRuns} 把，累计 ${formatDurationText(totalDurationSeconds)}。`);
    return nextData;
});
ipcMain.removeHandler('run:reset-history');
ipcMain.handle('run:reset-history', async () => {
    const data = await readDataStore();
    if (data.activeRun || data.counterSession?.state === 'in-game') {
        throw new Error('当前还有一把正在计时，请先结束本次统计，再执行重置。');
    }
    data.counterSession = null;
    data.activeRun = null;
    data.runHistory = [];
    const nextData = await writeDataStore(data);
    await syncRunCounterMonitor(nextData);
    void sendDesktopNotification('计数历史已重置', '3C 计数器已经清零，可以重新开始新一轮统计。');
    return nextData;
});
ipcMain.handle('drop:create', async (_event, payload) => {
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
    void sendDesktopNotification('掉落已保存', mapName ? `${itemName} 已记录到 ${mapName}。` : `${itemName} 已写入今日掉落记录。`);
    return nextData;
});
ipcMain.handle('image:save', async (_event, payload) => {
    const savedPath = await savePngFromDataUrl(payload);
    return { path: savedPath };
});
ipcMain.handle('drop:ocr-preview', async (_event, payload) => {
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
ipcMain.handle('settings:update', async (_event, payload) => {
    const data = await readDataStore();
    if (payload.patch.windowMode && payload.patch.windowMode !== data.settings.windowMode) {
        await flushWindowPlacementPersist(data.settings.windowMode);
    }
    const nextSettings = {
        ...data.settings,
        ...payload.patch
    };
    if (typeof payload.patch.launchOnStartup === 'boolean') {
        nextSettings.launchOnStartup = applyLaunchOnStartupState(payload.patch.launchOnStartup);
    }
    nextSettings.defaultRunMapName = normalizeDefaultRunMapName(nextSettings.defaultRunMapName);
    data.settings = nextSettings;
    const nextData = await writeDataStore(data);
    await syncRunCounterMonitor(nextData);
    applyAlwaysOnTopState(nextData.settings.alwaysOnTop);
    applyCounterLockState(nextData.settings.counterLockEnabled);
    if (payload.patch.windowMode) {
        await applyWindowModeState(nextData.settings.windowMode, nextData);
    }
    if (typeof payload.patch.notificationsEnabled === 'boolean' && nextData.settings.notificationsEnabled) {
        void sendDesktopNotification('系统通知已开启', '后续刷图、掉落和自动化结果会在这里提醒你。');
    }
    return nextData;
});
ipcMain.handle('integration:update', async (_event, payload) => {
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
ipcMain.handle('automation:run-task', async (_event, payload) => {
    const data = await readDataStore();
    const target = data.integrations.find((integration) => integration.id === payload.id);
    if (!target) {
        throw new Error('未找到对应的自动化任务。');
    }
    if (!target.enabled) {
        throw new Error('该自动化任务当前未启用。');
    }
    const drafts = {
        ...defaultAutomationDrafts(),
        ...payload.drafts
    };
    if (payload.id === 'gem-cube' &&
        drafts.gemInputMode === 'scan-image' &&
        payload.gemImageDataUrl?.trim()) {
        drafts.gemImagePath = await savePngFromDataUrl({
            dataUrl: payload.gemImageDataUrl,
            suggestedName: 'gem-cube-scan'
        });
    }
    data.automationDrafts = drafts;
    const { result, logPath } = await runBuiltinAutomation(target, buildRuntimeArgsV2(target, {
        ...payload,
        drafts
    }), payload.mode);
    target.lastRunAt = new Date().toISOString();
    target.lastStatus = result.success ? 'success' : 'error';
    target.lastMessage = summarizeActionResult(payload.mode, result);
    target.lastLogPath = logPath;
    const nextData = await writeDataStore(data);
    void sendDesktopNotification(result.success ? '自动化任务完成' : '自动化任务失败', `${target.title}：${target.lastMessage ?? (result.success ? '已完成。' : '执行失败。')}`);
    return {
        data: nextData,
        result
    };
});
ipcMain.handle('automation:run-admin', async (_event, payload) => {
    const data = await readDataStore();
    const target = data.integrations.find((integration) => integration.id === payload.id);
    if (!target) {
        throw new Error('未找到对应的自动化任务。');
    }
    const { result, logPath } = await runBuiltinAutomation(target, buildAutomationAdminArgs(target, payload), payload.action);
    target.lastRunAt = new Date().toISOString();
    target.lastStatus = result.success ? 'success' : 'error';
    target.lastMessage = summarizeActionResult(payload.action, result);
    target.lastLogPath = logPath;
    const nextData = await writeDataStore(data);
    void sendDesktopNotification(result.success ? '自动化工具操作完成' : '自动化工具操作失败', `${target.title}：${target.lastMessage ?? (result.success ? '已完成。' : '执行失败。')}`);
    return {
        data: nextData,
        result
    };
});
ipcMain.handle('automation:get-preflight', async (_event, payload) => {
    return buildAutomationPreflight(payload);
});
ipcMain.handle('automation:get-log', async (_event, id) => {
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
});
ipcMain.handle('environment:run-action', async (_event, payload) => {
    const response = await runEnvironmentAction(payload);
    const notificationBody = payload.action === 'install-python-runtime'
        ? response.result.success
            ? '内置 Python runtime 已经安装完成。'
            : '内置 Python runtime 安装失败，请查看日志。'
        : payload.action === 'install-python-deps'
            ? response.result.success
                ? 'Python 运行时依赖已经安装完成。'
                : 'Python 运行时依赖安装失败，请查看日志。'
            : response.result.success
                ? '环境修复动作已完成。'
                : '环境修复动作执行失败。';
    void sendDesktopNotification(response.result.success ? '环境修复完成' : '环境修复失败', payload.action === 'install-python-deps'
        ? response.result.success
            ? 'Python 运行时依赖已经安装完成。'
            : 'Python 运行时依赖安装失败，请查看日志。'
        : response.result.success
            ? '环境修复动作已完成。'
            : '环境修复动作执行失败。');
    return response;
});
ipcMain.handle('file:export-text', async (_event, payload) => {
    const extension = payload.defaultExtension.replace(/^\./, '');
    const suggestedBase = sanitizeFileName(payload.suggestedName.replace(/\.[^.]+$/, ''));
    const suggestedFileName = `${suggestedBase}.${extension}`;
    const saveDialogOptions = {
        title: '导出战报',
        defaultPath: join(app.getPath('documents'), suggestedFileName),
        filters: [
            {
                name: extension === 'md'
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
});
ipcMain.handle('clipboard:write-text', async (_event, payload) => {
    clipboard.writeText(payload.text);
});
ipcMain.handle('report:export-visual', async (_event, payload) => {
    return exportVisualReportFile(payload);
});
ipcMain.handle('integration:run', async (_event, id) => {
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
    target.lastLogPath = await writeAutomationLog(target.id, 'legacy-integration-run', target.commandLine, [], result);
    const nextData = await writeDataStore(data);
    void sendDesktopNotification(result.success ? '自动化任务完成' : '自动化任务失败', `${target.title}：${target.lastMessage ?? (result.success ? '已完成。' : '执行失败。')}`);
    return {
        data: nextData,
        result
    };
});
ipcMain.handle('shell:open-path', async (_event, targetPath) => {
    return shell.openPath(targetPath);
});
ipcMain.handle('counter:get-route-template-status', async () => {
    return getCounterRouteTemplateStatus();
});
ipcMain.handle('counter:pick-scene-template', async () => {
    return pickCounterSceneTemplateFile();
});
ipcMain.handle('counter:initialize-route-templates', async () => {
    return initializeCounterRouteTemplates();
});
ipcMain.handle('counter:capture-route-snapshot', async () => {
    const result = await captureCounterRouteSnapshot();
    void sendDesktopNotification('路线截图已保存', '已经抓取当前游戏窗口，你可以去模板目录里裁出 3C 或其他路线模板。');
    return result;
});
ipcMain.handle('counter:generate-route-drafts', async (_event, routeName) => {
    const result = await generateCounterRouteDrafts(routeName);
    void sendDesktopNotification('候选模板已生成', `${result.routeName} 已生成 ${result.entries.length} 张候选模板，下一步可以直接测试当前识别。`);
    return result;
});
ipcMain.handle('counter:probe-route-detection', async () => {
    return probeCounterRouteDetection();
});
ipcMain.handle('window:minimize', async () => {
    hideMainWindow();
});
ipcMain.handle('window:set-always-on-top', async (_event, value) => {
    const data = await readDataStore();
    data.settings.alwaysOnTop = value;
    const nextData = await writeDataStore(data);
    applyAlwaysOnTopState(value);
    return nextData;
});
ipcMain.handle('fast-launcher:get-path', async () => {
    return callFastLauncher('get_d2r_path');
});
ipcMain.handle('fast-launcher:kill-mutex', async () => {
    return callFastLauncher('kill_d2r_mutex');
});
ipcMain.handle('fast-launcher:launch', async (_event, payload) => {
    const args = [payload.path];
    if (payload.args) {
        args.push(...payload.args);
    }
    if (payload.username) {
        args.push('--user', payload.username);
    }
    if (payload.password) {
        args.push('--pass', payload.password);
    }
    return callFastLauncher('launch_d2r', args);
});
