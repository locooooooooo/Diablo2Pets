import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

const bootDiagnostics: string[] = [];

function pushBootDiagnostic(level: 'error' | 'warn', args: unknown[]) {
  const formatted = args
    .map((value) => {
      if (value instanceof Error) {
        return value.stack || value.message;
      }

      if (typeof value === 'string') {
        return value;
      }

      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    })
    .join(' ');

  bootDiagnostics.push(`[${level}] ${formatted}`);
  if (bootDiagnostics.length > 12) {
    bootDiagnostics.shift();
  }
}

const originalConsoleError = window.console.error.bind(window.console);
window.console.error = (...args: unknown[]) => {
  pushBootDiagnostic('error', args);
  originalConsoleError(...args);
};

const originalConsoleWarn = window.console.warn.bind(window.console);
window.console.warn = (...args: unknown[]) => {
  pushBootDiagnostic('warn', args);
  originalConsoleWarn(...args);
};

function renderFatalBootError(error: unknown) {
  const root = document.getElementById('root');
  if (!root) {
    return;
  }

  const message =
    error instanceof Error ? `${error.message}\n\n${error.stack ?? ''}` : String(error);
  const diagnostics = bootDiagnostics.length
    ? `\n\n---- recent console diagnostics ----\n${bootDiagnostics.join('\n\n')}`
    : '';

  root.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background:
        radial-gradient(circle at top, rgba(221, 97, 40, 0.18), transparent 34%),
        linear-gradient(180deg, rgba(23, 11, 8, 0.92), rgba(38, 20, 11, 0.96));
      color: #f4e6c1;
      font-family: 'Microsoft YaHei UI', 'Segoe UI', sans-serif;
    ">
      <div style="
        width: min(560px, 100%);
        border-radius: 24px;
        border: 1px solid rgba(223, 171, 88, 0.4);
        background: rgba(18, 10, 8, 0.92);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        padding: 24px;
      ">
        <p style="margin: 0 0 10px; color: #d8b37a; letter-spacing: 0.12em; font-size: 12px;">BOOT ERROR</p>
        <h1 style="margin: 0 0 12px; font-size: 28px;">桌宠界面启动失败</h1>
        <p style="margin: 0 0 16px; color: #d7c7a4; line-height: 1.6;">
          渲染层在启动时发生异常。我已经把错误直接显示出来，方便继续定位。
        </p>
        <pre style="
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          border-radius: 16px;
          border: 1px solid rgba(255, 210, 140, 0.16);
          background: rgba(0, 0, 0, 0.32);
          padding: 16px;
          color: #ffe1b0;
          font-size: 12px;
          line-height: 1.55;
          max-height: 52vh;
          overflow: auto;
        ">${`${message}${diagnostics}`
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')}</pre>
      </div>
    </div>
  `;
}

window.addEventListener('error', (event) => {
  renderFatalBootError(event.error ?? event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  renderFatalBootError(event.reason);
});

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  renderFatalBootError(error);
}
