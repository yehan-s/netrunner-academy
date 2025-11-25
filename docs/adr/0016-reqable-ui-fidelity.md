# ADR-016: Reqable UI 真实性还原方案

## 状态
已接受 (Accepted) - 2025-01-24 完成实施

## 日期
2025-01-24

## 背景 (Context)

### 问题陈述

当前 ReqableSimulator 组件的 UI 设计与真实 Reqable 应用存在显著差异，违背了项目核心原则：

> **"游戏中学会的操作 = 真实工具中的操作"**

用户在模拟器中学习的界面布局、交互方式无法直接迁移到真实 Reqable 工具，降低了教学价值。

### 真实 Reqable UI 参考

基于官方截图 (https://reqable.com/en-US/docs/introduction/) 分析：

**整体布局**:
```
┌─────────────────────────────────────────────────────────────┐
│ [图标栏]  ● Proxying on 192.168.1.3:9000 [复制][编辑]  [...工具图标...]  [Start] │
├─────────────────────────────────────────────────────────────┤
│ [📡Recording(52)] [📧httpbin.org] [+]                        │
├─────────────────────────────────────────────────────────────┤
│ All|Http|Https|Websocket|HTTP1|HTTP2|JSON|XML|...|1xx|2xx|3xx|4xx|5xx [🔍] │
├────────────────────────────┬────────────────────────────────┤
│ ID^ | Icon | Method | URL  │ Summary | Headers(16) | Body   │
├────────────────────────────┤────────────────────────────────┤
│ 334  📄  GET  https://...  │ Name          Value            │
│ 335  🌐  GET  https://...  │ URL           https://...      │
│ 336  #   GET  https://...  │ Status        Completed        │
│ ...                        │ Method        GET              │
│                            │ Protocol      h2               │
│                            │ Code          200              │
│                            ├────────────────────────────────┤
│                            │ Headers(14)  Body              │
│                            │ [Raw] [Hex]                    │
│                            │ ┌──────────────────────────┐   │
│                            │ │ <!doctype html>          │   │
│                            │ │ <html lang="en-US"...    │   │
│                            │ └──────────────────────────┘   │
├────────────────────────────┴────────────────────────────────┤
│ 52 items (1 selected)                            [状态栏图标] │
└─────────────────────────────────────────────────────────────┘
```

**配色方案**:
- 背景: #1e1e1e (深灰)
- 侧边栏: #252526
- 选中行: #37373d 带左侧绿色边框
- 强调色: 绿色 (#4ec9b0) 用于 Start 按钮和状态指示
- URL 高亮: 域名绿色，路径橙色

### 当前实现问题

| 问题 | 影响 |
|------|------|
| 赛博朋克配色 (#1a1a2e, 青色边框) | 与真实工具视觉差异大 |
| 工具栏图标过多且无分组 | 用户找不到对应功能 |
| 缺少顶部代理状态栏 | 无法学习代理配置概念 |
| 过滤器为下拉选择 | 真实是水平标签页 |
| 详情面板布局不同 | Summary/Headers/Body 切换方式不同 |
| 缺少 Start/Stop 录制按钮 | 无法理解录制概念 |
| 底部状态栏缺失 | 缺少请求计数等信息 |

## 决策 (Decision)

### 采用方案: 渐进式 UI 重构

分 4 个阶段逐步将 UI 还原为真实 Reqable 风格，每阶段可独立交付和测试。

### Phase 1: 配色系统重构 (预计 1 天)

**目标**: 统一视觉风格

1. **创建 Reqable 主题变量**
   ```css
   :root {
     --reqable-bg-primary: #1e1e1e;
     --reqable-bg-secondary: #252526;
     --reqable-bg-tertiary: #2d2d30;
     --reqable-border: #3c3c3c;
     --reqable-text-primary: #cccccc;
     --reqable-text-secondary: #858585;
     --reqable-accent-green: #4ec9b0;
     --reqable-accent-orange: #ce9178;
     --reqable-accent-blue: #569cd6;
     --reqable-selected-bg: #37373d;
     --reqable-selected-border: #4ec9b0;
   }
   ```

2. **替换所有组件配色**
   - 移除赛博朋克青色 (#00ffff, #1a1a2e)
   - 应用 Reqable 深灰色系
   - 更新边框和高亮颜色

### Phase 2: 顶部栏重构 (预计 1 天)

**目标**: 还原代理状态栏和标签页系统

1. **代理状态栏**
   ```
   ● Proxying on 127.0.0.1:8888 [📋] [✏️]  |  [工具图标组...]  | [🟢 Start]
   ```
   - 绿点表示代理运行中
   - 显示代理地址和端口
   - Start/Stop 切换按钮

2. **标签页系统**
   ```
   [📡 Recording(52)] [📧 httpbin.org ●] [+]
   ```
   - Recording 标签显示请求数量
   - 支持多标签页
   - 未保存标记 (●)

### Phase 3: 过滤器和列表重构 (预计 1.5 天)

**目标**: 还原流量过滤和列表显示

1. **水平过滤器标签页**
   ```
   All | Http | Https | Websocket | HTTP1 | HTTP2 | JSON | XML | Text | HTML | JS | Image | Media | Binary | 1xx | 2xx | 3xx | 4xx | 5xx [🔍]
   ```
   - 可滚动的标签页
   - 选中态下划线
   - 右侧搜索图标

2. **流量列表列**
   - ID (可排序)
   - Icon (请求类型图标)
   - Method (彩色标签)
   - URL (域名绿色 + 路径默认色)
   - 选中行: 深色背景 + 左侧绿色边框

### Phase 4: 详情面板重构 (预计 1.5 天)

**目标**: 还原请求详情展示

1. **Summary 面板**
   ```
   Name          Value
   ─────────────────────────
   URL           https://...
   Status        Completed
   Method        GET
   Protocol      h2
   Code          200
   Remote Address 116.153.64.158:443
   ```

2. **Headers/Body 切换**
   - `Headers(14)` `Body` 标签页
   - Body 内: `Raw | Hex` 切换
   - 代码语法高亮

3. **底部状态栏**
   ```
   52 items (1 selected)                    [h2] [200] [...]
   ```

## 验收标准

### 功能验收
- [ ] Phase 1: 配色完全替换，无赛博朋克元素
- [ ] Phase 2: 顶部栏与真实 Reqable 布局一致
- [ ] Phase 3: 过滤器和列表样式还原
- [ ] Phase 4: 详情面板格式还原

### 视觉验收
- [ ] 截图对比：模拟器 vs 真实 Reqable 相似度 > 85%
- [ ] 用户可直接将模拟器操作迁移到真实工具

### 测试验收
- [ ] 所有现有 E2E 测试通过
- [ ] 新增 UI 回归测试

## 备选方案 (Alternatives Considered)

### 方案 A: 完全重写 ReqableSimulator

**优势**: 代码更干净
**劣势**: 工作量大，可能引入新 bug，现有功能需全部重测
**结论**: 不采用，风险过高

### 方案 B: 仅调整配色，保持布局

**优势**: 改动小
**劣势**: 布局差异仍会影响学习迁移
**结论**: 不采用，不符合教学真实性原则

### 方案 C: 提供"真实模式"切换

**优势**: 保留现有风格作为可选
**劣势**: 维护两套 UI，增加复杂度
**结论**: 可作为后续增强，但优先还原真实 UI

## 后果 (Consequences)

### 正面影响

1. **教学价值提升**: 用户学到的操作可直接迁移
2. **专业度提升**: 模拟器更像真实工具
3. **用户信任**: 证明项目重视真实性

### 负面影响与缓解

1. **改动量大**
   - 缓解: 分 4 阶段渐进实施
   - 每阶段独立可测试

2. **可能破坏现有功能**
   - 缓解: 保持功能逻辑不变，仅修改样式
   - 每阶段完成后运行全部 E2E 测试

3. **开发时间**
   - 预计: 5 个工作日
   - 缓解: 优先完成 Phase 1-2，快速提升视觉一致性

## 技术债务

当前 `ReqableSimulator.tsx` 已达 900+ 行，建议在 Phase 3/4 时进一步拆分组件。

## 参考资料

- Reqable 官方文档: https://reqable.com/en-US/docs/introduction/
- Reqable 截图: https://reqable.com/en-US/assets/images/capture-*.png
- VS Code 配色参考: https://code.visualstudio.com/docs/getstarted/themes
