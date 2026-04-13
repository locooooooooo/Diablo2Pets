# Python Runtime 拆分说明

这里预留给从 `E:\Diablo2Tools` 迁入的自动化内核。

规划中的结构如下：

```text
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
```

迁移策略：

- `common/` 先迁 `d2_actions.py` 和 `ocr_utils.py`
- `tasks/` 先迁 `rune_cubing`
- `gem_cubing` 先拆后迁
- `gold_drop` 参考旧逻辑重写

当前桌宠前端通过 Electron 调用外部命令，后续可以改成直接调用这里的 Python 任务入口。

## 当前已迁入

- `common/game_actions.py`
- `tasks/rune_cubing.py`
- `config/rune_profile.json`

## 先跑符文迁移版

安装运行时依赖：

```bash
python -m pip install -r automation/python_runtime/requirements.txt
```

现在也可以直接在桌宠“赫拉迪姆工坊”的“环境修复站”里点“一键安装 Python 依赖”。

查看当前 profile：

```bash
python automation/python_runtime/tasks/rune_cubing.py --print-profile
```

只做计划演算，不点击游戏：

```bash
python automation/python_runtime/tasks/rune_cubing.py --counts "12 6 0 0 0 0 0 0 0" --dry-run
```

从旧项目导入配置：

```bash
python automation/python_runtime/tasks/rune_cubing.py --import-legacy-config
```

重新录制符文合成坐标：

```bash
python automation/python_runtime/tasks/rune_cubing.py --record-profile
```

## 宝石命令

查看当前 gem profile：

```bash
python automation/python_runtime/tasks/gem_scan.py --print-profile
```

只做宝石合成计划演算：

```bash
python automation/python_runtime/tasks/gem_cubing.py --matrix "10 5 2 0 0; 8 4 1 0 0" --dry-run
```

从截图扫描宝石数量：

```bash
python automation/python_runtime/tasks/gem_scan.py --image E:\screenshots\gems.png
```

从旧项目导入 gem 配置：

```bash
python automation/python_runtime/tasks/gem_scan.py --import-legacy-config
```

## 金币命令

查看当前 gold profile：

```bash
python automation/python_runtime/tasks/gold_drop.py --print-profile
```

只做金币批次演算：

```bash
python automation/python_runtime/tasks/gold_drop.py --amount 20000000 --level 90 --dry-run
```

重新录制金币坐标：

```bash
python automation/python_runtime/tasks/gold_drop.py --record-profile
```
