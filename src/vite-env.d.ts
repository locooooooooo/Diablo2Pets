/// <reference types="vite/client" />

import type {
  AppData,
  AutomationRecordProgressEvent,
  AutomationPreflightInput,
  AutomationPreflightResponse,
  AutomationLogDocument,
  CounterSceneTemplatePickResult,
  CounterRouteCaptureResult,
  CounterRouteDraftResult,
  CounterRouteProbeResult,
  CounterRouteTemplateStatus,
  CopyTextInput,
  CreateDropInput,
  DropOcrPreviewInput,
  DropOcrResult,
  EnvironmentActionResponse,
  ExportTextFileInput,
  ExportTextFileResult,
  ExportVisualReportInput,
  ExportVisualReportResult,
  FloatingSnapPreview,
  IntegrationId,
  IntegrationRunResponse,
  RunAutomationAdminInput,
  RunEnvironmentActionInput,
  RunAutomationTaskInput,
  SaveImageInput,
  SaveImageResult,
  StartRunInput,
  UpdateSettingsInput,
  UpdateIntegrationInput,
  FastLauncherLaunchInput
} from './types';

declare global {
  interface Window {
    d2Pet: {
      getData: () => Promise<AppData>;
      startRun: (payload: StartRunInput) => Promise<AppData>;
      stopRun: () => Promise<AppData>;
      resetCounterHistory: () => Promise<AppData>;
      pickCounterSceneTemplate: () => Promise<CounterSceneTemplatePickResult | null>;
      createDrop: (payload: CreateDropInput) => Promise<AppData>;
      previewDropOcr: (payload: DropOcrPreviewInput) => Promise<DropOcrResult>;
      updateSettings: (payload: UpdateSettingsInput) => Promise<AppData>;
      updateIntegration: (payload: UpdateIntegrationInput) => Promise<AppData>;
      runIntegration: (id: IntegrationId) => Promise<IntegrationRunResponse>;
      runAutomationTask: (payload: RunAutomationTaskInput) => Promise<IntegrationRunResponse>;
      runAutomationAdmin: (payload: RunAutomationAdminInput) => Promise<IntegrationRunResponse>;
      getAutomationPreflight: (
        payload: AutomationPreflightInput
      ) => Promise<AutomationPreflightResponse>;
      getAutomationLog: (id: IntegrationId) => Promise<AutomationLogDocument>;
      runEnvironmentAction: (
        payload: RunEnvironmentActionInput
      ) => Promise<EnvironmentActionResponse>;
      exportTextFile: (payload: ExportTextFileInput) => Promise<ExportTextFileResult>;
      copyText: (payload: CopyTextInput) => Promise<void>;
      exportVisualReport: (
        payload: ExportVisualReportInput
      ) => Promise<ExportVisualReportResult>;
      getCounterRouteTemplateStatus: () => Promise<CounterRouteTemplateStatus>;
      initializeCounterRouteTemplates: () => Promise<CounterRouteTemplateStatus>;
      captureCounterRouteSnapshot: () => Promise<CounterRouteCaptureResult>;
      generateCounterRouteDrafts: (routeName: string) => Promise<CounterRouteDraftResult>;
      probeCounterRouteDetection: () => Promise<CounterRouteProbeResult>;
      onDataChanged: (listener: (data: AppData) => void) => () => void;
      onFloatingSnapPreview: (
        listener: (preview: FloatingSnapPreview) => void
      ) => () => void;
      onAutomationRecordProgress: (
        listener: (event: AutomationRecordProgressEvent) => void
      ) => () => void;
      saveImage: (payload: SaveImageInput) => Promise<SaveImageResult>;
      openPath: (targetPath: string) => Promise<string>;
      minimize: () => Promise<void>;
      setAlwaysOnTop: (value: boolean) => Promise<AppData>;
      fastLauncherGetPath: () => Promise<string>;
      fastLauncherKillMutex: () => Promise<string>;
      fastLauncherLaunch: (payload: FastLauncherLaunchInput) => Promise<string>;
    };
  }
}

export {};
