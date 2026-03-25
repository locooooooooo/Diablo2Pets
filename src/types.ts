export type IntegrationId = 'rune-cube' | 'gem-cube' | 'drop-shared-gold';
export type AutomationRunMode = 'dry-run' | 'execute';
export type GemInputMode = 'matrix' | 'scan-image';
export type AutomationAdminAction =
  | 'record-profile'
  | 'print-profile'
  | 'import-legacy-config';

export interface ActiveRun {
  id: string;
  mapName: string;
  startedAt: string;
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

export interface AppSettings {
  alwaysOnTop: boolean;
  launchOnStartup: boolean;
  notificationsEnabled: boolean;
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
