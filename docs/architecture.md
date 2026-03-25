# 暗黑 2 桌宠助手技术方案

## 1. 目标

围绕暗黑 2 公益 Mod 的日常刷图场景，提供一个像 QQ 宠物那样常驻桌面的轻量级工具，优先解决这 5 类能力：

1. 自动合成低级符文
2. 自动合成宝石
3. 自动从共享仓库丢弃金币
4. 刷图计数器：记录每日重复次数与耗时
5. 掉落记录：支持截图后 `Ctrl + V` 粘贴并保存在本地

其中 1/2/3 已由你本地实现，因此当前工程重点是把这些能力整合到统一的桌宠壳中，并补齐 4/5 的产品能力。

## 2. 为什么先选 Electron

Electron 对这个项目很适合，原因有 4 个：

- 对 Windows 支持成熟，适合桌面常驻工具
- 透明窗口、置顶、无边框、拖动等“桌宠形态”实现成本低
- 能直接访问本地文件系统，方便截图落盘与日志记录
- 后续接入你已有的本地自动化脚本/程序非常直接

## 3. 系统拆分

建议按下面 4 层拆：

### 3.1 展示层

负责桌宠形态与交互：

- 透明窗口
- 常驻置顶
- 宠物造型与状态展示
- 计数面板 / 掉落面板 / 自动化面板

### 3.2 业务层

负责产品逻辑：

- 开始一次刷图
- 结束一次刷图并计算耗时
- 记录今日统计
- 创建掉落日志
- 保存截图
- 执行自动化动作

### 3.3 持久化层

当前使用本地 JSON，后续可以平滑升级到 SQLite。

当前建议存储内容：

- 正在进行中的刷图记录
- 历史刷图记录
- 每日掉落记录
- 自动化命令配置
- 桌宠窗口偏好配置

### 3.4 接入层

作为 1/2/3 的统一适配层，不把你已有逻辑直接写死在 UI 中。

初版采用“外部命令调用”的方式：

- 支持 `exe`
- 支持 `bat`
- 支持 `cmd`
- 支持 `ahk`

这样你现有的本地实现无需重写，只要接入命令行即可。

## 4. 数据模型

### 4.1 刷图记录 `RunRecord`

```ts
type RunRecord = {
  id: string;
  mapName: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  dayKey: string;
};
```

### 4.2 当前运行中的刷图 `ActiveRun`

```ts
type ActiveRun = {
  id: string;
  mapName: string;
  startedAt: string;
};
```

### 4.3 掉落记录 `DropRecord`

```ts
type DropRecord = {
  id: string;
  itemName: string;
  mapName: string;
  note: string;
  createdAt: string;
  dayKey: string;
  screenshotPath?: string;
};
```

### 4.4 自动化配置 `IntegrationConfig`

```ts
type IntegrationConfig = {
  id: 'rune-cube' | 'gem-cube' | 'drop-shared-gold';
  title: string;
  description: string;
  commandLine: string;
  workingDirectory: string;
  enabled: boolean;
  lastRunAt?: string;
  lastStatus?: 'idle' | 'success' | 'error';
  lastMessage?: string;
};
```

## 5. 关键流程

### 5.1 刷图计数流程

1. 用户输入地图名并点击“开始刷图”
2. 系统写入 `activeRun`
3. 用户结束时点击“完成本次”
4. 系统自动计算秒数并写入 `runHistory`
5. 前端基于今日数据实时汇总总次数、总时长、平均耗时

### 5.2 掉落截图流程

1. 用户截图
2. 回到桌宠掉落页
3. 在粘贴区按 `Ctrl + V`
4. 渲染层拿到图片数据
5. 主进程保存为本地 PNG
6. 创建掉落记录并关联图片路径

### 5.3 自动化接入流程

1. 用户在自动化面板配置命令行
2. 点击保存
3. 点击执行动作
4. 主进程启动本地命令
5. 记录执行时间与结果摘要

## 6. 目录建议

```text
electron/
  main.ts          # 桌面窗口、IPC、文件系统、命令执行
  preload.ts       # 安全桥接
src/
  components/      # UI 组件
  lib/             # 日期、统计等通用函数
  App.tsx          # 主界面
  main.tsx         # 前端入口
  styles.css       # 视觉样式
  types.ts         # 类型定义
docs/
  architecture.md
  roadmap.md
```

## 7. 后续可演进方向

第一阶段先保证“可用”，第二阶段再补“更像桌宠”和“更像游戏伴侣”。

建议的后续迭代：

- 增加托盘图标与显示/隐藏快捷键
- 支持宠物待机、说话、情绪状态
- 支持掉落条目分类与检索
- 支持按 Boss / 地图维度统计
- 升级存储到 SQLite
- 接入 OCR，自动识别截图中的掉落名称
- 增加刷图日报导出

## 8. 风险点

### 8.1 自动化与游戏版本耦合

你已有的 1/2/3 功能大概率和分辨率、窗口位置、游戏 UI 资源有关，因此强烈建议把它们留在独立脚本/程序中，不要直接塞进桌宠主工程。

### 8.2 桌宠透明窗口与游戏抢焦点

如果后续要做悬浮在游戏上的半透明助手，需要额外处理穿透、焦点和快捷键冲突；当前版本先以桌面常驻辅助为主。

### 8.3 剪贴板图片大小

截图直接转 Base64 会放大数据体积，所以当前实现只在保存前临时保留预览，真正落盘后只存路径。
