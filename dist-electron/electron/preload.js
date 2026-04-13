import { contextBridge, ipcRenderer } from 'electron';
const api = {
    getData: () => ipcRenderer.invoke('data:get'),
    startRun: (payload) => ipcRenderer.invoke('run:start', payload),
    stopRun: () => ipcRenderer.invoke('run:stop'),
    resetCounterHistory: () => ipcRenderer.invoke('run:reset-history'),
    pickCounterSceneTemplate: () => ipcRenderer.invoke('counter:pick-scene-template'),
    createDrop: (payload) => ipcRenderer.invoke('drop:create', payload),
    previewDropOcr: (payload) => ipcRenderer.invoke('drop:ocr-preview', payload),
    updateSettings: (payload) => ipcRenderer.invoke('settings:update', payload),
    updateIntegration: (payload) => ipcRenderer.invoke('integration:update', payload),
    runIntegration: (id) => ipcRenderer.invoke('integration:run', id),
    runAutomationTask: (payload) => ipcRenderer.invoke('automation:run-task', payload),
    runAutomationAdmin: (payload) => ipcRenderer.invoke('automation:run-admin', payload),
    getAutomationPreflight: (payload) => ipcRenderer.invoke('automation:get-preflight', payload),
    getAutomationLog: (id) => ipcRenderer.invoke('automation:get-log', id),
    runEnvironmentAction: (payload) => ipcRenderer.invoke('environment:run-action', payload),
    exportTextFile: (payload) => ipcRenderer.invoke('file:export-text', payload),
    copyText: (payload) => ipcRenderer.invoke('clipboard:write-text', payload),
    exportVisualReport: (payload) => ipcRenderer.invoke('report:export-visual', payload),
    getCounterRouteTemplateStatus: () => ipcRenderer.invoke('counter:get-route-template-status'),
    initializeCounterRouteTemplates: () => ipcRenderer.invoke('counter:initialize-route-templates'),
    captureCounterRouteSnapshot: () => ipcRenderer.invoke('counter:capture-route-snapshot'),
    generateCounterRouteDrafts: (routeName) => ipcRenderer.invoke('counter:generate-route-drafts', routeName),
    probeCounterRouteDetection: () => ipcRenderer.invoke('counter:probe-route-detection'),
    onDataChanged: (listener) => {
        const wrapped = (_event, data) => {
            listener(data);
        };
        ipcRenderer.on('data:changed', wrapped);
        return () => {
            ipcRenderer.removeListener('data:changed', wrapped);
        };
    },
    onFloatingSnapPreview: (listener) => {
        const wrapped = (_event, preview) => {
            listener(preview);
        };
        ipcRenderer.on('window:floating-snap-preview', wrapped);
        return () => {
            ipcRenderer.removeListener('window:floating-snap-preview', wrapped);
        };
    },
    onAutomationRecordProgress: (listener) => {
        const wrapped = (_event, progressEvent) => {
            listener(progressEvent);
        };
        ipcRenderer.on('automation:record-progress', wrapped);
        return () => {
            ipcRenderer.removeListener('automation:record-progress', wrapped);
        };
    },
    saveImage: (payload) => ipcRenderer.invoke('image:save', payload),
    openPath: (targetPath) => ipcRenderer.invoke('shell:open-path', targetPath),
    minimize: () => ipcRenderer.invoke('window:minimize'),
    setAlwaysOnTop: (value) => ipcRenderer.invoke('window:set-always-on-top', value),
    fastLauncherGetPath: () => ipcRenderer.invoke('fast-launcher:get-path'),
    fastLauncherKillMutex: () => ipcRenderer.invoke('fast-launcher:kill-mutex'),
    fastLauncherLaunch: (payload) => ipcRenderer.invoke('fast-launcher:launch', payload)
};
contextBridge.exposeInMainWorld('d2Pet', api);
