import {
  useEffect,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type FormEvent
} from 'react';
import { formatCompactDateTime } from '../lib/date';
import type { DropOcrResult, DropRecord } from '../types';

interface DropPanelProps {
  drops: DropRecord[];
  busy: boolean;
  onCreateDrop: (payload: {
    itemName: string;
    mapName: string;
    note: string;
    screenshotPath?: string;
    imageDataUrl?: string;
    ocrText?: string;
    ocrEngine?: string;
    ocrItemName?: string;
  }) => Promise<void>;
  onPreviewOcr: (payload: {
    dataUrl: string;
    suggestedName: string;
  }) => Promise<DropOcrResult>;
  onOpenPath: (targetPath: string) => Promise<void>;
}

function readImageDataFromItems(items: DataTransferItemList): Promise<string | null> {
  const imageItem = Array.from(items).find((item) => item.type.startsWith('image/'));
  const imageFile = imageItem?.getAsFile();

  if (!imageFile) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('截图读取失败，请重新截图后再试。'));
    reader.readAsDataURL(imageFile);
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return '发生了未知错误。';
}

export function DropPanel(props: DropPanelProps) {
  const [itemName, setItemName] = useState('');
  const [mapName, setMapName] = useState('');
  const [note, setNote] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [preparedScreenshotPath, setPreparedScreenshotPath] = useState('');
  const [ocrResult, setOcrResult] = useState<DropOcrResult | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [pasteHint, setPasteHint] = useState(
    '截图后直接按 Ctrl+V，系统会自动保存截图并尝试识别物品名称。'
  );

  function resetDraft() {
    setItemName('');
    setMapName('');
    setNote('');
    setImageDataUrl('');
    setPreparedScreenshotPath('');
    setOcrResult(null);
    setOcrBusy(false);
    setPasteHint('截图后直接按 Ctrl+V，系统会自动保存截图并尝试识别物品名称。');
  }

  async function runOcrForImage(dataUrl: string) {
    setOcrBusy(true);
    setPasteHint('截图已收到，正在进行 OCR 识别...');

    try {
      const result = await props.onPreviewOcr({
        dataUrl,
        suggestedName: itemName.trim() || 'drop-ocr'
      });

      setPreparedScreenshotPath(result.imagePath);
      setOcrResult(result);

      if (result.suggestedItemName && !itemName.trim()) {
        setItemName(result.suggestedItemName);
      }

      if (result.suggestedNote && !note.trim()) {
        setNote(result.suggestedNote);
      }

      if (result.success) {
        setPasteHint(
          result.warning
            ? `截图已保存，OCR 已完成：${result.warning}`
            : '截图已保存，OCR 已完成，识别结果已回填到表单。'
        );
      } else {
        setPasteHint(
          result.warning || '截图已保存，但当前环境没有可用的 OCR 引擎。'
        );
      }
    } catch (error) {
      setPasteHint(`截图已收到，但 OCR 失败：${getErrorMessage(error)}`);
    } finally {
      setOcrBusy(false);
    }
  }

  async function applyPastedImage(dataUrl: string) {
    setImageDataUrl(dataUrl);
    await runOcrForImage(dataUrl);
  }

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      if (!event.clipboardData) {
        return;
      }

      const hasImage = Array.from(event.clipboardData.items).some((item) =>
        item.type.startsWith('image/')
      );
      if (!hasImage) {
        return;
      }

      event.preventDefault();
      void readImageDataFromItems(event.clipboardData.items)
        .then((value) => {
          if (!value) {
            return;
          }
          return applyPastedImage(value);
        })
        .catch((error) => {
          setPasteHint(getErrorMessage(error));
        });
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [itemName, note]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const finalItemName = itemName.trim() || ocrResult?.suggestedItemName || '';
    const finalNote = note.trim() || ocrResult?.suggestedNote || '';

    await props.onCreateDrop({
      itemName: finalItemName,
      mapName,
      note: finalNote,
      screenshotPath: preparedScreenshotPath || undefined,
      imageDataUrl: preparedScreenshotPath ? undefined : imageDataUrl || undefined,
      ocrText: ocrResult?.text || undefined,
      ocrEngine: ocrResult?.engine || undefined,
      ocrItemName: ocrResult?.suggestedItemName || undefined
    });

    resetDraft();
  }

  async function handlePasteZone(event: ReactClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    try {
      const value = await readImageDataFromItems(event.clipboardData.items);
      if (!value) {
        return;
      }
      await applyPastedImage(value);
    } catch (error) {
      setPasteHint(getErrorMessage(error));
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Drops</p>
          <h3>掉落记录</h3>
        </div>
        <span className="status-pill">支持 Ctrl + V 截图 OCR</span>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <div className="split-grid">
          <label className="field">
            <span>物品名称</span>
            <input
              onChange={(event) => setItemName(event.target.value)}
              placeholder="例如：乔丹之石 / 破隐法杖"
              value={itemName}
            />
          </label>
          <label className="field">
            <span>掉落场景</span>
            <input
              onChange={(event) => setMapName(event.target.value)}
              placeholder="例如：巴尔 / 牛场 / A4 超市"
              value={mapName}
            />
          </label>
        </div>

        <label className="field">
          <span>备注</span>
          <textarea
            onChange={(event) => setNote(event.target.value)}
            placeholder="可选：角色、MF、地图层数、队伍信息等"
            rows={3}
            value={note}
          />
        </label>

        <div
          className={`paste-zone ${imageDataUrl ? 'ready' : ''}`}
          onPaste={handlePasteZone}
          tabIndex={0}
        >
          <div>
            <strong>截图粘贴区</strong>
            <p>{pasteHint}</p>
          </div>
          {imageDataUrl ? (
            <img alt="截图预览" className="paste-preview" src={imageDataUrl} />
          ) : (
            <span className="paste-empty">点这里后也可以直接 Ctrl+V 粘贴截图</span>
          )}
        </div>

        {ocrResult ? (
          <article className="card ocr-card">
            <div className="integration-head">
              <div>
                <div className="card-title">OCR 识别结果</div>
                <p className="secondary-text">
                  引擎：{ocrResult.engine || 'unknown'}
                  {ocrResult.warning ? ` · ${ocrResult.warning}` : ''}
                </p>
              </div>
              {preparedScreenshotPath ? (
                <button
                  className="text-button"
                  onClick={() => void props.onOpenPath(preparedScreenshotPath)}
                  type="button"
                >
                  打开截图
                </button>
              ) : null}
            </div>

            <div className="ocr-meta">
              <span className="status-pill">建议物品：{ocrResult.suggestedItemName || '未识别'}</span>
              <span className="status-pill">
                文本行数：{ocrResult.lines.length}
              </span>
            </div>

            {ocrResult.suggestedNote ? (
              <p className="helper-text">建议备注：{ocrResult.suggestedNote}</p>
            ) : null}

            {ocrResult.text ? <pre className="ocr-preview">{ocrResult.text}</pre> : null}
          </article>
        ) : null}

        <div className="inline-actions">
          <button className="primary-button" disabled={props.busy || ocrBusy} type="submit">
            {props.busy ? '保存中...' : '保存掉落记录'}
          </button>
          <button
            className="ghost-button"
            onClick={resetDraft}
            type="button"
          >
            清空截图
          </button>
        </div>
      </form>

      <article className="card">
        <div className="card-title">最近掉落</div>
        {props.drops.length === 0 ? (
          <p className="empty-text">你保存的掉落记录会显示在这里。</p>
        ) : (
          <div className="list-card">
            {props.drops.map((drop) => (
              <div className="list-row" key={drop.id}>
                <div>
                  <strong>{drop.itemName}</strong>
                  <span>
                    {drop.mapName || '未填写场景'} · {formatCompactDateTime(drop.createdAt)}
                  </span>
                  <div className="tag-row">
                    {drop.ocrEngine ? (
                      <span className="mini-pill">OCR {drop.ocrEngine}</span>
                    ) : null}
                    {drop.screenshotPath ? (
                      <span className="mini-pill">有截图</span>
                    ) : null}
                  </div>
                  {drop.note ? <span className="secondary-text">{drop.note}</span> : null}
                  {!drop.note && drop.ocrText ? (
                    <span className="secondary-text">{drop.ocrText}</span>
                  ) : null}
                </div>
                <div className="list-row-side">
                  {drop.screenshotPath ? (
                    <button
                      className="text-button"
                      onClick={() => void props.onOpenPath(drop.screenshotPath as string)}
                      type="button"
                    >
                      打开截图
                    </button>
                  ) : (
                    <span className="secondary-text">无截图</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
