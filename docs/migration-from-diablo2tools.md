# 从 `E:\Diablo2Tools` 迁移到桌宠项目的拆分方案

## 结论先行

不建议把 `E:\Diablo2Tools` 整个项目原样搬进当前桌宠工程。

更合适的策略是：

- 保留旧项目里已经验证过的自动化能力内核
- 丢掉旧的 Tk 启动器和杂糅式工程结构
- 在桌宠项目里按“桌面壳 + 自动化运行时 + 配置数据”重新分层

一句话总结：

- `桌宠 UI` 重写
- `符文合成` 迁移并轻量重构
- `宝石合成` 迁移核心逻辑，拆分重构
- `丢金币` 建议重写
- `物品栏/仓库清理` 暂缓，只保留为后续能力

## 1. 旧项目结构分析

`E:\Diablo2Tools` 本质上不是单一产品，而是一个“大杂烩工作区”。

和当前桌宠直接相关的部分主要有：

- `common/`
- `rune_cubing/`
- `gem_cubing/`
- `gold_drop/`
- `item_manager/`
- `d2_tool_launcher.py`

其余大块如：

- `market_analysis/`
- `combat/`
- `botty/`
- `project_delivery/`

和桌宠 MVP 关系不大，当前不建议迁入。

## 2. 各模块价值判断

### 2.1 `common/d2_actions.py`

文件位置：

- `E:\Diablo2Tools\common\d2_actions.py`

职责：

- 获取游戏窗口
- 紧急停止
- 相对/绝对坐标转换
- 安全点击
- 批量转移
- 拖动物品
- 网格坐标计算
- 录制坐标

价值判断：

- 这是旧项目里最值得保留的“自动化底层动作库”
- `rune_cubing` 和 `item_manager` 已经依赖它
- 说明它已经具备一定复用价值

迁移建议：

- 迁入
- 但不要原样直接暴露给桌宠前端
- 应拆到新的 Python 自动化运行时里，作为纯运行时依赖

建议新位置：

```text
automation/python_runtime/common/game_actions.py
```

### 2.2 `common/ocr_utils.py`

文件位置：

- `E:\Diablo2Tools\common\ocr_utils.py`

职责：

- OCR 引擎检测
- 剪贴板图片读取
- 图像预处理
- 数字识别
- RapidOCR / Tesseract 双通道支持

价值判断：

- 对宝石合成的网格识别非常关键
- 这部分如果重写，风险和时间成本都会偏高
- 旧实现已经做了多套预处理和回退逻辑，值得保留

迁移建议：

- 迁入
- 保留 OCR 能力，但把“打印式脚本逻辑”和“OCR 工具函数”继续解耦

建议新位置：

```text
automation/python_runtime/common/ocr_utils.py
```

### 2.3 `rune_cubing/rune_synthesizer.py`

文件位置：

- `E:\Diablo2Tools\rune_cubing\rune_synthesizer.py`

特点：

- 核心逻辑相对清晰
- 配置结构简单，只有输出位、合成按钮、网格锚点
- 业务规则集中在 `synthesize_runes(counts)`

价值判断：

- 适合迁移
- 不值得从零重写
- 但应把 CLI 菜单、交互输入、打印输出剥离掉

迁移建议：

- 保留核心合成算法
- 去掉内嵌菜单
- 改成“命令式任务入口”

建议拆分为：

```text
automation/python_runtime/tasks/rune_cubing.py
automation/python_runtime/config/rune_profile.json
```

### 2.4 `gem_cubing/gem_synthesizer.py`

文件位置：

- `E:\Diablo2Tools\gem_cubing\gem_synthesizer.py`

特点：

- 文件非常大，接近一个“单文件子系统”
- 里面同时包含：
  - 游戏动作
  - 坐标录制
  - 网格计算
  - OCR 识别
  - grid/manual 两套模式
  - CLI 参数解析
  - 菜单交互

价值判断：

- 不适合原样迁移
- 但也不建议完全推倒重写
- 真正有价值的是它的 OCR 驱动合成逻辑，而不是这个 900+ 行单文件结构

迁移建议：

- 保留核心业务
- 强制拆分
- 先重构再接入桌宠

建议拆分为：

```text
automation/python_runtime/tasks/gem_cubing.py
automation/python_runtime/tasks/gem_scan.py
automation/python_runtime/config/gem_profile.json
automation/python_runtime/common/ocr_utils.py
automation/python_runtime/common/game_actions.py
```

建议拆分边界：

- `gem_scan.py` 负责网格识别、OCR 结果读取
- `gem_cubing.py` 负责合成流程编排
- `game_actions.py` 负责点击/拖拽/批量转移
- 配置录制能力单独做，不再混进主合成脚本

### 2.5 `gold_drop/gold_dropper.py`

文件位置：

- `E:\Diablo2Tools\gold_drop\gold_dropper.py`

特点：

- 代码量不大
- 逻辑简单
- 但对固定坐标依赖很强
- 配置设计明显落后于符文/宝石模块

一个很关键的问题是：

- 启动器里有 `run_gold_config()`，会传 `--config`
- 但 `gold_dropper.py` 本身没有实现配置菜单或 `--config` 参数

这说明它当前更像“能跑的专项脚本”，而不是一个结构稳定的模块。

价值判断：

- 不建议直接迁移
- 更适合按当前桌宠需求重新实现

迁移建议：

- 重写
- 只参考旧脚本的流程顺序和坐标语义
- 新版要补齐配置录制和 profile 化

建议新位置：

```text
automation/python_runtime/tasks/gold_drop.py
automation/python_runtime/config/gold_drop_profile.json
```

### 2.6 `item_manager/inventory_dropper.py`

文件位置：

- `E:\Diablo2Tools\item_manager\inventory_dropper.py`

职责：

- Ctrl+点击移动物品
- 背包丢地
- 仓库列清理

价值判断：

- 这是独立能力，不属于当前桌宠 MVP 的核心
- 它和你现在的 1/2/3 目标不完全重合

迁移建议：

- 当前先不迁
- 只保留为未来能力池

### 2.7 `d2_tool_launcher.py`

文件位置：

- `E:\Diablo2Tools\d2_tool_launcher.py`

特点：

- Tkinter + ttkbootstrap 启动器
- 本质是一个多工具分发台
- 通过 `subprocess.Popen(...)` 启动各个子脚本/EXE

价值判断：

- 这部分不应迁移
- 当前 Electron 桌宠已经在替代它

迁移建议：

- 重写
- 旧启动器只保留“能力映射”参考，不保留代码

## 3. 推荐的新项目拆分

当前桌宠项目建议演进为下面这个结构：

```text
src/
  components/
  lib/
  App.tsx
electron/
  main.ts
  preload.ts
automation/
  python_runtime/
    common/
      game_actions.py
      ocr_utils.py
    tasks/
      rune_cubing.py
      gem_scan.py
      gem_cubing.py
      gold_drop.py
    config/
      rune_profile.json
      gem_profile.json
      gold_drop_profile.json
docs/
  migration-from-diablo2tools.md
```

其中分工应该是：

- Electron/React：桌宠窗口、数据展示、按钮操作、记录系统
- Python runtime：真正和游戏窗口、鼠标、键盘、OCR 打交道
- JSON profile：坐标和模式配置

## 4. 迁移取舍表

| 旧模块 | 作用 | 是否迁移 | 方式 |
| --- | --- | --- | --- |
| `common/d2_actions.py` | 自动化底层动作 | 是 | 迁移并整理 |
| `common/ocr_utils.py` | OCR 工具 | 是 | 迁移并整理 |
| `rune_cubing/rune_synthesizer.py` | 符文合成 | 是 | 迁移并轻改 |
| `gem_cubing/gem_synthesizer.py` | 宝石合成 + OCR | 是 | 拆分重构 |
| `gold_drop/gold_dropper.py` | 丢金币 | 否，建议重写 | 保留流程参考 |
| `item_manager/inventory_dropper.py` | 物品栏/仓库清理 | 暂缓 | 后续再议 |
| `d2_tool_launcher.py` | 老启动器 UI | 否 | 用 Electron 替代 |
| `.spec / build_release.py` | PyInstaller 打包 | 暂缓 | 后续再决定 |

## 5. 为什么不是“一把梭全搬”

原因很明确：

- 旧项目耦合太重，一个脚本里常常同时混着 UI、配置、业务和游戏动作
- 有重复实现，例如 `gem_synthesizer.py` 自己又实现了一套点击和网格逻辑
- 启动器和子脚本之间的能力边界不清晰
- 部分模块存在接口不一致问题，比如丢金币模块和启动器的 `--config` 约定就不匹配

如果直接整仓迁入，桌宠工程很快会被拖回旧结构。

## 6. 建议迁移顺序

### 第一阶段

先接入能稳定复用的内容：

1. `common/d2_actions.py`
2. `rune_cubing/rune_synthesizer.py`
3. `common/ocr_utils.py`

### 第二阶段

拆分宝石合成：

1. 把 `gem_synthesizer.py` 拆成 OCR 扫描和合成编排两部分
2. 去掉 CLI 菜单
3. 让 Electron 通过命令或 profile 调用

### 第三阶段

重写丢金币：

1. 补配置录制
2. 改成 profile 驱动
3. 和桌宠按钮直接联动

## 7. 对当前桌宠项目的直接影响

当前桌宠工程已经有“自动化接入”页，所以短期内最省事的办法是：

- 先不直接拷代码
- 先把旧脚本作为外部命令接进来
- 等功能稳定后，再把真正值得保留的 Python 内核迁入当前仓库

这能避免一上来就做高风险搬家。

## 8. 我的建议

如果你希望效率最高，我建议下一步按这个顺序干：

1. 先把 `rune_cubing` 和 `gem_cubing` 做成当前桌宠可调用的命令配置
2. 然后把 `common/d2_actions.py` 和 `common/ocr_utils.py` 迁入当前仓库
3. 最后重写 `gold_drop`

也就是说：

- `符文`：迁
- `宝石`：拆后迁
- `金币`：已按新 runtime 方式重写首版
- `旧启动器`：废弃
