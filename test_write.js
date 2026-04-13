const fs = require('fs');
try {
  let content = fs.readFileSync('E:/暗黑2桌宠/src/components/DropPanel.tsx', 'utf8');

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
    fs.writeFileSync('E:/暗黑2桌宠/src/components/DropPanel2.tsx', lines.join('\n'), 'utf8');
  }
} catch(err) {
  fs.writeFileSync('E:/暗黑2桌宠/error.txt', err.toString());
}
