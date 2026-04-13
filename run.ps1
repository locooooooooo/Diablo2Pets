try {
  $content = Get-Content -Path "E:\暗黑2桌宠\src\components\DropPanel.tsx" -Raw
  $content = $content.Replace('<div className="list-row" key={drop.id}>', '<div className={`list-row ${drop.highlighted ? ''highlight-drop-row'' : ''''}`} key={drop.id}>')
  Set-Content -Path "E:\暗黑2桌宠\src\components\DropPanel.tsx" -Value $content -Encoding UTF8 -ErrorAction Stop
  Set-Content -Path "E:\暗黑2桌宠\log.txt" -Value "Success"
} catch {
  Set-Content -Path "E:\暗黑2桌宠\log.txt" -Value "Error: $_"
}
