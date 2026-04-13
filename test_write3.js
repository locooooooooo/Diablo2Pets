const fs = require('fs');
try {
  let content = fs.readFileSync('E:/暗黑2桌宠/src/components/DropPanel.tsx', 'utf8');
  let lines = content.split(/\r?\n/);
  let s = -1, e = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('className="list-card"')) {
      s = i;
      break;
    }
  }
  
  if (s !== -1) {
    for (let i = s + 1; i < lines.length; i++) {
      if (lines[i].includes('</div>') && lines[i-1] && lines[i-1].includes('))}')) {
        e = i;
        break;
      }
    }
  }

  fs.writeFileSync('E:/暗黑2桌宠/out4.txt', "s: " + s + ", e: " + e);

  if (s !== -1 && e !== -1) {
    lines.splice(s, e - s + 1,
      '                <div className="list-card">',
      '                  {group.items.map((drop) => renderDropRow(drop, props.onOpenPath))}',
      '                </div>'
    );
    fs.writeFileSync('E:/暗黑2桌宠/src/components/DropPanel.tsx', lines.join('\n'), 'utf8');
    fs.appendFileSync('E:/暗黑2桌宠/out4.txt', "\nDone writing DropPanel.tsx");
  }
} catch(err) {
  fs.writeFileSync('E:/暗黑2桌宠/out4.txt', "Error: " + err);
}
