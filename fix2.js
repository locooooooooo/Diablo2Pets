const fs = require('fs');
const path = 'e:/暗黑2桌宠/src/components/DropPanel.tsx';
try {
  let content = fs.readFileSync(path, 'utf8');

  const oldStr = `                <div className="list-card">
                  {group.items.map((drop) => (
                    <div className="list-row" key={drop.id}>
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
                </div>`;

  const newStr = `                <div className="list-card">
                  {group.items.map((drop) => renderDropRow(drop, props.onOpenPath))}
                </div>`;

  const normalize = (str) => str.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
  const normalizedContent = normalize(content);
  const normalizedOld = normalize(oldStr);

  if (normalizedContent.includes(normalizedOld)) {
    console.log("Found match! Replacing by splitting...");
    // Find the exact line index based on search
    let lines = content.split(/\r?\n/);
    let s = -1, e = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('className="list-card"') && lines[i+1] && lines[i+1].includes('group.items.map')) {
        s = i;
      }
      if (s !== -1 && i > s && lines[i].includes('</div>') && lines[i-1] && lines[i-1].includes('))}')) {
        e = i;
        break;
      }
    }
    if (s !== -1 && e !== -1) {
      lines.splice(s, e - s + 1,
        '                <div className="list-card">',
        '                  {group.items.map((drop) => renderDropRow(drop, props.onOpenPath))}',
        '                </div>'
      );
      fs.writeFileSync(path, lines.join('\n'), 'utf8');
      console.log('Successfully written to file.');
    } else {
      console.log('Failed to find exact boundaries. s=' + s + ' e=' + e);
    }
  } else {
    console.log('String not found even with normalized whitespace.');
  }
} catch (err) {
  console.error('Error:', err);
}
