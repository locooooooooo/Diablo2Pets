const fs = require('fs');
const path = 'src/components/DropPanel.tsx';
let lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div className="list-card">') && lines[i+1] && lines[i+1].includes('group.items.map((drop) => (')) {
    start = i;
  }
  if (start !== -1 && i > start && lines[i].includes('</div>') && lines[i-1] && lines[i-1].includes('))}')) {
    end = i;
    break;
  }
}
if (start !== -1 && end !== -1) {
  lines.splice(start, end - start + 1,
    '                <div className="list-card">',
    '                  {group.items.map((drop) => renderDropRow(drop, props.onOpenPath))}',
    '                </div>'
  );
  fs.writeFileSync(path, lines.join('\n'), 'utf8');
  console.log('Replaced lines ' + start + ' to ' + end);
} else {
  console.log('Could not find start/end. start: ' + start + ' end: ' + end);
}
