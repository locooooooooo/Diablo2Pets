import type { ClipboardEvent as ReactClipboardEvent, ReactNode } from 'react';
import type { AutomationDrafts, GemInputMode } from '../types';
import {
  GEM_COLUMN_DEFINITIONS,
  GEM_ROW_DEFINITIONS,
  buildGemCraftPreview,
  buildRuneCraftPreview,
  getFilledGemFamilies,
  getHighestFilledRune,
  getRuneSlotDefinitions,
  parseGemMatrix,
  parseRuneCounts,
  updateGemCountAt,
  updateRuneCountAt
} from '../lib/cubingWorkbench';

interface RuneCubingWorkbenchProps {
  drafts: AutomationDrafts;
  liveGuide?: ReactNode;
  runButtons: ReactNode;
  adminButtons: ReactNode;
  onRuneCountsChange: (value: string) => void;
  onWaitChange: (value: string) => void;
}

interface GemCubingWorkbenchProps {
  drafts: AutomationDrafts;
  liveGuide?: ReactNode;
  runButtons: ReactNode;
  adminButtons: ReactNode;
  gemImageDataUrl: string;
  gemPasteHint: string;
  onGemModeChange: (value: GemInputMode) => void;
  onGemMatrixChange: (value: string) => void;
  onGemImagePathChange: (value: string) => void;
  onWaitChange: (value: string) => void;
  onGemPaste: (event: ReactClipboardEvent<HTMLDivElement>) => Promise<void>;
  onClearGemImage: () => void;
  onOpenPath: (targetPath: string) => Promise<void>;
}

function clampCount(value: string): number {
  const nextValue = Number.parseInt(value, 10);
  if (!Number.isFinite(nextValue) || nextValue < 0) {
    return 0;
  }
  return nextValue;
}

function renderCubeGraphic(modeLabel: string) {
  return (
    <div className="horadric-cube-graphic" aria-hidden="true">
      <div className="horadric-cube-header">
        <span>{modeLabel}</span>
      </div>
      <div className="horadric-cube-grid">
        {Array.from({ length: 12 }, (_value, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="horadric-cube-transmute">Transmute</div>
    </div>
  );
}

function renderPlanLines(lines: string[]) {
  return (
    <div className="horadric-plan-list">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export function RuneCubingWorkbench(props: RuneCubingWorkbenchProps) {
  const runeSlots = getRuneSlotDefinitions(props.drafts.runeCounts);
  const runePreview = buildRuneCraftPreview(props.drafts.runeCounts);
  const runeCounts = parseRuneCounts(props.drafts.runeCounts);
  const highestRune = getHighestFilledRune(props.drafts.runeCounts);
  const filledSlots = runeCounts.filter((count) => count > 0).length;
  const planLines =
    runePreview.steps.length > 0
      ? runePreview.steps.slice(0, 4).map((step) => {
          const slot = runeSlots[step.rowIndex * 9 + step.colIndex];
          const target = runeSlots[step.rowIndex * 9 + step.colIndex + 1];
          return `${slot?.code ?? '—'} -> ${target?.code ?? '—'} x ${step.craftCount}`;
        })
      : ['当前数量不足以自动推进任何槽位。'];

  return (
    <div className="horadric-workbench horadric-workbench-rune">
      <section className="horadric-frame horadric-stash-frame">
        <div className="horadric-frame-head">
          <div>
            <p className="eyebrow">符文仓</p>
            <div className="horadric-frame-title">共享仓库排布 / 4 x 9</div>
            <p className="secondary-text">按仓库顺序填数量，桌宠会先预排计划，再决定是否正式执行。</p>
          </div>
          <div className="horadric-metric-strip">
            <div className="horadric-metric-chip">
              <span>已填槽位</span>
              <strong>{filledSlots}</strong>
            </div>
            <div className="horadric-metric-chip accent-fire">
              <span>预计合成</span>
              <strong>{runePreview.totalCrafts}</strong>
            </div>
            <div className="horadric-metric-chip accent-ice">
              <span>当前最高</span>
              <strong>{highestRune ?? '无'}</strong>
            </div>
          </div>
        </div>

        <div className="horadric-grid-shell">
          <div className="horadric-grid horadric-rune-grid">
            {runeSlots.map((slot) => (
              <label
                className={`horadric-slot horadric-slot-rune tone-${slot.tone} ${
                  slot.craftable ? 'craftable' : 'locked'
                } ${slot.filled ? 'filled' : ''}`}
                key={`${slot.row}-${slot.col}`}
              >
                <span className="horadric-slot-meta">
                  <span>{slot.index + 1}</span>
                  <span>{slot.craftable ? '可推' : '保留'}</span>
                </span>
                <strong>{slot.code}</strong>
                <input
                  min={0}
                  onChange={(event) =>
                    props.onRuneCountsChange(
                      updateRuneCountAt(props.drafts.runeCounts, slot.index, clampCount(event.target.value))
                    )
                  }
                  type="number"
                  value={runeCounts[slot.index]}
                />
              </label>
            ))}
          </div>
        </div>

        <label className="field horadric-raw-field">
          <span>原始数量串</span>
          <textarea
            onChange={(event) => props.onRuneCountsChange(event.target.value)}
            placeholder="例如：12 6 0 0 0 0 0 0 0"
            rows={3}
            value={props.drafts.runeCounts}
          />
        </label>
      </section>

      <section className="horadric-frame horadric-cube-frame">
        {renderCubeGraphic('符文合成')}
        <div className="task-section">
          <span className="task-section-label">运行</span>
          <div className="task-toolbar">{props.runButtons}</div>
        </div>
        <div className="task-section">
          <span className="task-section-label">维护</span>
          <div className="task-toolbar secondary">{props.adminButtons}</div>
        </div>
        <label className="field horadric-field-compact">
          <span>等待秒数</span>
          <input
            min={0}
            onChange={(event) => props.onWaitChange(event.target.value)}
            type="number"
            value={props.drafts.runeWaitSeconds}
          />
        </label>
        <p className="helper-text">
          仅前 7 列会自动推进，右侧保留槽位方便你观察成品和高阶结果。
        </p>
      </section>

      <aside className="horadric-frame horadric-sidecar">
        <div className="horadric-side-head">
          <p className="eyebrow">当前计划</p>
          <div className="horadric-frame-title compact">低级符文链路</div>
        </div>
        {renderPlanLines(planLines)}
        <div className="horadric-tip-stack">
          <div className="horadric-tip-card">
            <strong>执行节奏</strong>
            <p>建议先试运行看计划，再正式执行；执行前会给你切回游戏的缓冲时间。</p>
          </div>
          <div className="horadric-tip-card">
            <strong>录制坐标</strong>
            <p>F10 捕获当前点位，F12 紧急停止。重新录一次后，当前分辨率会自动记成新档案。</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function GemCubingWorkbench(props: GemCubingWorkbenchProps) {
  const gemMatrix = parseGemMatrix(props.drafts.gemMatrix);
  const gemPreview = buildGemCraftPreview(props.drafts.gemMatrix);
  const filledFamilies = getFilledGemFamilies(props.drafts.gemMatrix);
  const screenshotReady = Boolean(props.gemImageDataUrl || props.drafts.gemImagePath.trim());
  const planLines =
    props.drafts.gemInputMode === 'matrix'
      ? gemPreview.steps.length > 0
        ? gemPreview.steps.slice(0, 4).map((step) => {
            const family = GEM_COLUMN_DEFINITIONS[step.colIndex];
            const source = GEM_ROW_DEFINITIONS[step.rowIndex];
            const target = GEM_ROW_DEFINITIONS[step.rowIndex + 1];
            return `${family?.label ?? '宝石'} ${source?.label ?? '当前'} -> ${
              target?.label ?? '下一阶'
            } x ${step.craftCount}`;
          })
        : ['当前矩阵不足以生成可执行的合成计划。']
      : [
          screenshotReady
            ? '下次运行会先从截图识别库存，再自动生成合成计划。'
            : '先粘贴共享仓库截图，或填一个现成图片路径。'
        ];

  return (
    <div className="horadric-workbench horadric-workbench-gem">
      <section className="horadric-frame horadric-stash-frame">
        <div className="horadric-frame-head">
          <div>
            <p className="eyebrow">宝石仓</p>
            <div className="horadric-frame-title">材料页布局 / 5 x 7</div>
            <p className="secondary-text">左侧矩阵按颜色列和等级行铺开，和共享仓库的视觉结构保持一致。</p>
          </div>
          <div className="horadric-metric-strip">
            <div className="horadric-metric-chip">
              <span>已填家族</span>
              <strong>{filledFamilies.length}</strong>
            </div>
            <div className="horadric-metric-chip accent-fire">
              <span>预计合成</span>
              <strong>{props.drafts.gemInputMode === 'matrix' ? gemPreview.totalCrafts : '--'}</strong>
            </div>
            <div className="horadric-metric-chip accent-ice">
              <span>识别模式</span>
              <strong>{props.drafts.gemInputMode === 'matrix' ? '矩阵' : '截图'}</strong>
            </div>
          </div>
        </div>

        <div className="horadric-gem-board">
          <div className="horadric-gem-row-rail">
            {GEM_ROW_DEFINITIONS.map((row) => (
              <div className="horadric-rail-tag" key={row.key}>
                <span>{row.short}</span>
                <strong>{row.label}</strong>
              </div>
            ))}
          </div>

          <div className="horadric-gem-grid-wrap">
            <div className="horadric-gem-head">
              {GEM_COLUMN_DEFINITIONS.map((column) => (
                <div className="horadric-gem-head-cell" key={column.key}>
                  <span>{column.short}</span>
                  <strong>{column.label}</strong>
                </div>
              ))}
            </div>

            <div className="horadric-grid horadric-gem-grid">
              {GEM_ROW_DEFINITIONS.map((row, rowIndex) =>
                GEM_COLUMN_DEFINITIONS.map((column, colIndex) => (
                  <label
                    className={`horadric-slot horadric-slot-gem ${
                      rowIndex < GEM_ROW_DEFINITIONS.length - 1 ? 'craftable' : 'locked'
                    }`}
                    key={`${row.key}-${column.key}`}
                    style={{ ['--slot-accent' as string]: column.accent }}
                  >
                    <span className="horadric-slot-meta">
                      <span>{row.short}</span>
                      <span>{column.short}</span>
                    </span>
                    <strong>{column.label}</strong>
                    <input
                      disabled={props.drafts.gemInputMode !== 'matrix'}
                      min={0}
                      onChange={(event) =>
                        props.onGemMatrixChange(
                          updateGemCountAt(
                            props.drafts.gemMatrix,
                            rowIndex,
                            colIndex,
                            clampCount(event.target.value)
                          )
                        )
                      }
                      type="number"
                      value={gemMatrix[rowIndex][colIndex]}
                    />
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="horadric-frame horadric-cube-frame">
        {renderCubeGraphic('宝石合成')}
        <div className="task-section">
          <span className="task-section-label">运行</span>
          <div className="task-toolbar">{props.runButtons}</div>
        </div>
        <div className="task-section">
          <span className="task-section-label">维护</span>
          <div className="task-toolbar secondary">{props.adminButtons}</div>
        </div>
        <div className="mode-switch horadric-mode-switch">
          {(['matrix', 'scan-image'] as GemInputMode[]).map((mode) => (
            <button
              className={props.drafts.gemInputMode === mode ? 'mode-button active' : 'mode-button'}
              key={mode}
              onClick={() => props.onGemModeChange(mode)}
              type="button"
            >
              {mode === 'matrix' ? '矩阵录入' : '截图识别'}
            </button>
          ))}
        </div>
        <label className="field horadric-field-compact">
          <span>等待秒数</span>
          <input
            min={0}
            onChange={(event) => props.onWaitChange(event.target.value)}
            type="number"
            value={props.drafts.gemWaitSeconds}
          />
        </label>
        <p className="helper-text">
          矩阵模式会直接按左侧库存排计划；截图模式会在运行时按当前截图结果实时识别。
        </p>
      </section>

      <aside className="horadric-frame horadric-sidecar">
        <div className="horadric-side-head">
          <p className="eyebrow">输入源</p>
          <div className="horadric-frame-title compact">
            {props.drafts.gemInputMode === 'matrix' ? '库存矩阵' : '截图识别'}
          </div>
        </div>

        {props.drafts.gemInputMode === 'matrix' ? (
          <label className="field horadric-raw-field">
            <span>原始矩阵</span>
            <textarea
              onChange={(event) => props.onGemMatrixChange(event.target.value)}
              placeholder="例如：10 5 2 0 0; 8 4 1 0 0"
              rows={4}
              value={props.drafts.gemMatrix}
            />
          </label>
        ) : (
          <div className="horadric-scan-stack">
            <div
              className={`paste-zone compact-zone horadric-paste-zone ${
                props.gemImageDataUrl ? 'ready' : ''
              }`}
              onPaste={props.onGemPaste}
              tabIndex={0}
            >
              <div>
                <strong>共享仓库截图</strong>
                <p>{props.gemPasteHint}</p>
              </div>
              {props.gemImageDataUrl ? (
                <img alt="宝石截图预览" className="paste-preview" src={props.gemImageDataUrl} />
              ) : (
                <span className="paste-empty">聚焦这里后直接 Ctrl+V，也可以填本地路径。</span>
              )}
            </div>

            <label className="field horadric-field-compact">
              <span>现有截图路径</span>
              <input
                onChange={(event) => props.onGemImagePathChange(event.target.value)}
                placeholder="例如：E:\\screenshots\\gems.png"
                value={props.drafts.gemImagePath}
              />
            </label>

            <div className="tool-row">
              <button className="ghost-button" onClick={props.onClearGemImage} type="button">
                清空截图
              </button>
              <button
                className="ghost-button"
                disabled={!props.drafts.gemImagePath.trim()}
                onClick={() => void props.onOpenPath(props.drafts.gemImagePath)}
                type="button"
              >
                打开当前截图
              </button>
            </div>
          </div>
        )}

        {renderPlanLines(planLines)}
      </aside>
    </div>
  );
}
