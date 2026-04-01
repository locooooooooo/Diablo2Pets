export type IntegrationId = 'rune-cube' | 'gem-cube' | 'drop-shared-gold';
export type AutomationRunMode = 'dry-run' | 'execute';
export type GemInputMode = 'matrix' | 'scan-image';
export type WindowMode = 'panel' | 'floating';
export type AutomationAdminAction =
  | 'record-profile'
  | 'print-profile'
  | 'import-legacy-config';
export type EnvironmentAction = 'install-python-runtime' | 'install-python-deps';

export interface ActiveRun {
  id: string;
  mapName: string;
  startedAt: string;
}

export type CounterSessionState =
  | 'waiting-for-game'
  | 'in-game'
  | 'waiting-next-game'
  | 'error';

export type CounterDetectedState =
  | 'booting'
  | 'window-missing'
  | 'unknown'
  | 'lobby'
  | 'in-game'
  | 'in-game-menu'
  | 'stopped';

export interface CounterSession {
  id: string;
  mapName: string;
  startedAt: string;
  state: CounterSessionState;
  completedRuns: number;
  totalDurationSeconds: number;
  lastEventAt: string;
  lastDetectedState: CounterDetectedState;
  lastDetail: string;
  lastRunDurationSeconds?: number;
  lastRunEndedAt?: string;
}

export interface RunRecord extends ActiveRun {
  endedAt: string;
  durationSeconds: number;
  dayKey: string;
}

export interface DropRecord {
  id: string;
  itemName: string;
  mapName: string;
  note: string;
  createdAt: string;
  dayKey: string;
  screenshotPath?: string;
  ocrText?: string;
  ocrEngine?: string;
  ocrItemName?: string;
}

export interface IntegrationConfig {
  id: IntegrationId;
  title: string;
  description: string;
  commandLine: string;
  workingDirectory: string;
  profilePath: string;
  legacyConfigPath?: string;
  supportsLegacyImport: boolean;
  enabled: boolean;
  lastRunAt?: string;
  lastStatus?: 'idle' | 'success' | 'error';
  lastMessage?: string;
  lastLogPath?: string;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowPlacementSettings {
  panel?: WindowBounds;
  floating?: WindowBounds;
}

export type SnapEdge = 'left' | 'right' | 'top' | 'bottom';

export interface FloatingSnapPreview {
  visible: boolean;
  edge?: SnapEdge;
  snapped: boolean;
}

export interface AppSettings {
  alwaysOnTop: boolean;
  launchOnStartup: boolean;
  notificationsEnabled: boolean;
  windowMode: WindowMode;
  setupGuideCompleted: boolean;
  windowPlacement: WindowPlacementSettings;
}

export interface AutomationDrafts {
  runeCounts: string;
  runeWaitSeconds: number;
  gemInputMode: GemInputMode;
  gemMatrix: string;
  gemImagePath: string;
  gemWaitSeconds: number;
  goldAmount: string;
  goldLevel: string;
  goldWaitSeconds: number;
  allowInactiveWindow: boolean;
}

export interface AppData {
  counterSession: CounterSession | null;
  activeRun: ActiveRun | null;
  runHistory: RunRecord[];
  drops: DropRecord[];
  integrations: IntegrationConfig[];
  automationDrafts: AutomationDrafts;
  settings: AppSettings;
}

export interface StartRunInput {
  mapName: string;
}

export interface CreateDropInput {
  itemName: string;
  mapName: string;
  note: string;
  screenshotPath?: string;
  ocrText?: string;
  ocrEngine?: string;
  ocrItemName?: string;
}

export interface UpdateIntegrationInput {
  id: IntegrationId;
  patch: Pick<IntegrationConfig, 'commandLine' | 'workingDirectory' | 'enabled'>;
}

export interface UpdateSettingsInput {
  patch: Partial<AppSettings>;
}

export interface RunAutomationTaskInput {
  id: IntegrationId;
  mode: AutomationRunMode;
  drafts: AutomationDrafts;
  gemImageDataUrl?: string;
}

export interface RunAutomationAdminInput {
  id: IntegrationId;
  action: AutomationAdminAction;
}

export interface SaveImageInput {
  dataUrl: string;
  suggestedName: string;
}

export interface SaveImageResult {
  path: string;
}

export interface DropOcrPreviewInput {
  dataUrl: string;
  suggestedName: string;
}

export interface DropOcrResult {
  success: boolean;
  imagePath: string;
  text: string;
  lines: string[];
  suggestedItemName: string;
  suggestedNote: string;
  engine: string;
  warning?: string;
}

export interface AutomationLogDocument {
  path: string;
  content: string;
}

export interface ExportTextFileInput {
  suggestedName: string;
  defaultExtension: 'md' | 'json' | 'txt';
  content: string;
}

export interface ExportTextFileResult {
  canceled: boolean;
  path?: string;
}

export interface CopyTextInput {
  text: string;
}

export type VisualReportFormat = 'png' | 'pdf';

export interface VisualReportMetric {
  label: string;
  value: string;
}

export interface VisualReportListItem {
  title: string;
  meta: string;
  detail: string;
  highlighted?: boolean;
}

export interface VisualReportPayload {
  title: string;
  subtitle: string;
  periodLabel: string;
  generatedAt: string;
  badge: string;
  metrics: VisualReportMetric[];
  highlights: VisualReportListItem[];
  hotspots: VisualReportListItem[];
  timeline: VisualReportListItem[];
  footer: string;
}

export interface ExportVisualReportInput {
  suggestedName: string;
  format: VisualReportFormat;
  report: VisualReportPayload;
}

export interface ExportVisualReportResult {
  canceled: boolean;
  path?: string;
}

export interface RunEnvironmentActionInput {
  action: EnvironmentAction;
}

export interface EnvironmentActionResponse {
  result: IntegrationRunResult;
  log: AutomationLogDocument;
}

export interface IntegrationRunResult {
  success: boolean;
  code: number | string | null;
  stdout: string;
  stderr: string;
}

export interface IntegrationRunResponse {
  data: AppData;
  result: IntegrationRunResult;
}

export type AutomationRecordProgressKind = 'status' | 'stdout' | 'stderr';

export interface AutomationRecordProgressEvent {
  id: IntegrationId;
  action: 'record-profile';
  kind: AutomationRecordProgressKind;
  line: string;
  updatedAt: string;
  stepIndex?: number;
  totalSteps?: number;
  finished?: boolean;
  success?: boolean;
}

export type AutomationCheckLevel = 'ok' | 'warning' | 'error';
export type AutomationPreflightStatus = 'ready' | 'warning' | 'error';

export interface AutomationCheckItem {
  key: string;
  level: AutomationCheckLevel;
  label: string;
  detail: string;
}

export interface AutomationPreflightTask {
  id: IntegrationId;
  status: AutomationPreflightStatus;
  summary: string;
  checks: AutomationCheckItem[];
}

export interface AutomationPreflightInput {
  drafts: AutomationDrafts;
  hasGemClipboardImage: boolean;
}

export interface AutomationPreflightResponse {
  generatedAt: string;
  globalChecks: AutomationCheckItem[];
  tasks: AutomationPreflightTask[];
}
