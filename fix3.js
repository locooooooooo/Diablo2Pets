const fs = require('fs');

try {
  let content = fs.readFileSync('E:/暗黑2桌宠/src/components/DropPanel.tsx', 'utf8');

  // Define renderDropRow
  const renderDropRowFn = `
function renderDropRow(drop: PreparedDropRecord, onOpenPath: (targetPath: string) => Promise<void>) {
  return (
    <div className={\`list-row \${drop.highlighted ? 'highlight-drop-row' : ''}\`} key={drop.id}>
      <div>
        <div className="report-title-row">
          <strong>{drop.itemName}</strong>
          {drop.highlighted ? (
            <span className="mini-pill mini-pill-highlight">高亮</span>
          ) : null}
        </div>
        <span>
          {drop.mapName || '未填写场景'} · {formatCompactDateTime(drop.createdAt)}
        </span>
        <div className="tag-row">
          <span className="mini-pill">{getDropCategoryLabel(drop.category)}</span>
          {drop.ocrEngine ? (
            <span className="mini-pill">OCR {drop.ocrEngine}</span>
          ) : null}
          {drop.screenshotPath ? <span className="mini-pill">有截图</span> : null}
        </div>
        {drop.note ? (
          <span className="secondary-text">{drop.note}</span>
        ) : drop.ocrText ? (
          <span className="secondary-text">{drop.ocrText}</span>
        ) : null}
      </div>
      <div className="list-row-side">
        {drop.screenshotPath ? (
          <button
            className="text-button"
            onClick={() => void onOpenPath(drop.screenshotPath as string)}
            type="button"
          >
            打开截图
          </button>
        ) : (
          <span className="secondary-text">无截图</span>
        )}
      </div>
    </div>
  );
}
`;

  // Insert renderDropRow before the DropPanel function
  content = content.replace('export function DropPanel(props: DropPanelProps) {', renderDropRowFn + '\\nexport function DropPanel(props: DropPanelProps) {');

  // Replace inline mapping in the second place
  const inlineMappingRegex = /<div className="list-card">\\s*\\{group\\.items\\.map\\(\\(drop\\) => \\([\\s\\S]*?<\\/div>\\s*\\)\\)\\}\\s*<\\/div>/;
  const replacement = \`<div className="list-card">
                  {group.items.map((drop) => renderDropRow(drop, props.onOpenPath))}
                </div>\`;
  
  content = content.replace(inlineMappingRegex, replacement);

  fs.writeFileSync('E:/暗黑2桌宠/src/components/DropPanel2.tsx', content, 'utf8');
  console.log("Successfully wrote DropPanel2.tsx");
} catch (e) {
  console.error(e);
}
