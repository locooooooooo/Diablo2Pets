import { contextBridge, ipcRenderer } from 'electron';
import type {
  AppData,
  AutomationPreflightInput,
  AutomationPreflightResponse,
  AutomationLogDocument,
  CreateDropInput,
  DropOcrPreviewInput,
  DropOcrResult,
  IntegrationId,
  IntegrationRunResponse,
  RunAutomationAdminInput,
  RunAutomationTaskInput,
  SaveImageInput,
  SaveImageResult,
  StartRunInput,
  UpdateSettingsInput,
  UpdateIntegrationInput
} from '../src/types.js';

const api = {
  getData: () => ipcRenderer.invoke('data:get') as Promise<AppData>,
  startRun: (payload: StartRunInput) =>
    ipcRenderer.invoke('run:start', payload) as Promise<AppData>,
  stopRun: () => ipcRenderer.invoke('run:stop') as Promise<AppData>,
  createDrop: (payload: CreateDropInput) =>
    ipcRenderer.invoke('drop:create', payload) as Promise<AppData>,
  previewDropOcr: (payload: DropOcrPreviewInput) =>
    ipcRenderer.invoke('drop:ocr-preview', payload) as Promise<DropOcrResult>,
  updateSettings: (payload: UpdateSettingsInput) =>
    ipcRenderer.invoke('settings:update', payload) as Promise<AppData>,
  updateIntegration: (payload: UpdateIntegrationInput) =>
    ipcRenderer.invoke('integration:update', payload) as Promise<AppData>,
  runIntegration: (id: IntegrationId) =>
    ipcRenderer.invoke('integration:run', id) as Promise<IntegrationRunResponse>,
  runAutomationTask: (payload: RunAutomationTaskInput) =>
    ipcRenderer.invoke('automation:run-task', payload) as Promise<IntegrationRunResponse>,
  runAutomationAdmin: (payload: RunAutomationAdminInput) =>
    ipcRenderer.invoke('automation:run-admin', payload) as Promise<IntegrationRunResponse>,
  getAutomationPreflight: (payload: AutomationPreflightInput) =>
    ipcRenderer.invoke('automation:get-preflight', payload) as Promise<AutomationPreflightResponse>,
  getAutomationLog: (id: IntegrationId) =>
    ipcRenderer.invoke('automation:get-log', id) as Promise<AutomationLogDocument>,
  onDataChanged: (listener: (data: AppData) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, data: AppData) => {
      listener(data);
    };
    ipcRenderer.on('data:changed', wrapped);
    return () => {
      ipcRenderer.removeListener('data:changed', wrapped);
    };
  },
  saveImage: (payload: SaveImageInput) =>
    ipcRenderer.invoke('image:save', payload) as Promise<SaveImageResult>,
  openPath: (targetPath: string) =>
    ipcRenderer.invoke('shell:open-path', targetPath) as Promise<string>,
  minimize: () => ipcRenderer.invoke('window:minimize') as Promise<void>,
  setAlwaysOnTop: (value: boolean) =>
    ipcRenderer.invoke('window:set-always-on-top', value) as Promise<AppData>
};

contextBridge.exposeInMainWorld('d2Pet', api);
