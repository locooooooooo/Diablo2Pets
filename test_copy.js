const fs = require('fs');
try {
  let content = fs.readFileSync('E:/暗黑2桌宠/src/components/DropPanel.tsx', 'utf8');
  content = content.replace(
    '<div className="list-row" key={drop.id}>',
    '<div className={`list-row ${drop.highlighted ? \\"highlight-drop-row\\" : \\"\\"}`} key={drop.id}>'
  );
  fs.writeFileSync('E:/暗黑2桌宠/src/components/DropPanel2.tsx', content, 'utf8');
  fs.writeFileSync('E:/暗黑2桌宠/test_copy.log', 'Success', 'utf8');
} catch (e) {
  fs.writeFileSync('E:/暗黑2桌宠/test_copy.log', e.toString(), 'utf8');
}
