# 暗黑 2 桌宠助手

一个面向暗黑 2 公益 Mod 场景的桌面级常驻工具，目标是把自动化能力、刷图计数、掉落记录、截图留档和 OCR 识别整合进一个像 QQ 宠物一样可长期挂在桌面的助手里。

## 当前已落地

- 透明置顶、无边框的桌宠窗口
- 托盘常驻，关闭窗口后默认收起到托盘
- 全局快捷键 `Alt+Shift+D` 显示或隐藏桌宠
- 桌宠头部快捷开关：置顶、开机自启、系统通知
- 关键事件系统通知：收起到托盘、刷图完成、掉落保存、自动化任务结果
- 每日刷图计数与耗时统计
- 掉落记录与 `Ctrl+V` 截图保存
- 掉落截图 OCR 自动识别，自动回填物品名称与备注建议
- 符文、宝石、金币三类自动化任务卡
- 宝石 `Ctrl+V` 粘贴截图识别
- Profile 录制、旧配置导入、执行日志查看
- 工坊环境修复站：检查 Python、requirements、依赖包和 OCR 引擎，并支持一键安装依赖
- 本地 `data.json` 持久化
- Python runtime 与旧仓库能力拆分迁移

## 技术栈

- 桌面容器：Electron
- 前端界面：React + TypeScript + Vite
- 本地数据：JSON
- 自动化运行时：Python

## 开发启动

```powershell
npm.cmd install
npm.cmd run dev
```

## 构建

```powershell
npm.cmd run build
```

## 自动化能力

当前桌宠内置了三类任务：

- 自动合成低级符文
- 自动合成宝石
- 从共享仓库丢弃金币

每个任务都支持：

- `试运行`
- `立即执行`
- `查看 Profile`
- `录制 Profile`
- `查看执行日志`

工坊还提供：

- 全局环境预检
- 一键安装 Python runtime 依赖
- requirements / Runtime README 快速打开

其中：

- 符文、宝石支持从 `E:\Diablo2Tools` 导入旧配置
- 金币任务没有独立旧配置文件，建议直接录制新的 Profile

## 掉落 OCR 流程

- 在“掉落”页直接 `Ctrl+V` 粘贴截图
- 桌宠会先把截图保存到本地
- 然后自动调用 `drop_ocr.py` 做 OCR
- 识别结果会自动回填“物品名称”和“备注”建议
- 保存掉落记录时会把 OCR 原文、建议物品名和截图路径一起写入本地数据

## 桌面常驻

- 点击窗口右上角“收起”会隐藏到托盘
- 点击托盘图标可以呼出桌宠
- 托盘菜单支持：
  - 显示/隐藏桌宠
  - 切换始终置顶
  - 切换开机自启
  - 切换系统通知
  - 打开截图目录
  - 打开自动化日志目录
  - 退出程序

> `开机自启` 在开发模式下可能受 Electron 启动方式影响，打包后更适合做最终验证。

## Python Runtime 验证

```powershell
python automation/python_runtime/tasks/rune_cubing.py --print-profile
python automation/python_runtime/tasks/rune_cubing.py --counts "12 6 0 0 0 0 0 0 0" --dry-run
python automation/python_runtime/tasks/gem_cubing.py --print-profile
python automation/python_runtime/tasks/gem_cubing.py --matrix "10 5 2 0 0; 8 4 1 0 0" --dry-run
python automation/python_runtime/tasks/gold_drop.py --print-profile
python automation/python_runtime/tasks/gold_drop.py --amount 20000000 --level 90 --dry-run
python automation/python_runtime/tasks/drop_ocr.py --image "path\\to\\drop.png" --json
```

## 数据目录

程序数据会写到 Electron 的 `userData` 目录下，典型路径类似：

```text
C:\Users\<你的用户名>\AppData\Roaming\d2-desktop-pet\d2-pet\
```

其中：

- `data.json`：刷图记录、掉落记录、自动化配置
- `screenshots\YYYY-MM-DD\`：粘贴保存的截图
- `automation-logs\YYYY-MM-DD\`：每次任务运行或工具操作的日志

## 相关文档

- [docs/architecture.md](/E:/暗黑2桌宠/docs/architecture.md)
- [docs/roadmap.md](/E:/暗黑2桌宠/docs/roadmap.md)
- [docs/migration-from-diablo2tools.md](/E:/暗黑2桌宠/docs/migration-from-diablo2tools.md)
- [automation/python_runtime/README.md](/E:/暗黑2桌宠/automation/python_runtime/README.md)
