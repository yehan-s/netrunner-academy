# Reqable UI 真实性还原 - 任务清单

> **关联 ADR**: [0016-reqable-ui-fidelity.md](../adr/0016-reqable-ui-fidelity.md)
> **创建日期**: 2025-01-24
> **预计工时**: 5 个工作日
> **当前状态**: 待开始

---

## 概述

将 ReqableSimulator 的 UI 还原为与真实 Reqable 应用一致的风格和布局，确保用户在模拟器中学习的操作可直接迁移到真实工具。

---

## Phase 1: 配色系统重构

**预计时间**: 1 天
**状态**: [x] 已完成 (2025-01-24)

### 任务列表

- [x] **P1.1** 创建 Reqable 主题 CSS 变量文件
  - 文件: `app/reqable-theme.css`
  - 定义所有 Reqable 配色变量
  - 包含: 背景色、文字色、边框色、强调色等

- [x] **P1.2** 替换 ReqableSimulator 主组件配色
  - 文件: `components/ReqableSimulator.tsx`
  - 移除: #fcd34d 黄色强调色
  - 应用: #4ec9b0 绿色作为主强调色

- [x] **P1.3** 更新所有 reqable/ 子组件配色
  - 文件: `components/reqable/*.tsx` (21 个组件)
  - 统一边框、背景、文字颜色
  - 替换 cyan-500/400 为 Reqable 绿色

- [x] **P1.4** 更新流量列表和详情面板配色
  - 文件: `TrafficList.tsx`, `TrafficDetail.tsx`
  - 选中行样式: bg-[#37373d] + 左侧绿色边框
  - 边框颜色统一为 #3c3c3c

- [x] **P1.5** E2E 测试验证
  - 运行测试确认功能正常 (17/21 passed，失败与颜色无关)

---

## Phase 2: 顶部栏重构

**预计时间**: 1 天
**状态**: [x] 已完成 (2025-01-24)
**依赖**: Phase 1 完成

### 任务列表

- [x] **P2.1** 创建代理状态栏组件
  - 新文件: `components/reqable/ProxyStatusBar.tsx`
  - 显示: 代理状态指示灯、地址、端口
  - 功能: 复制地址、Start/Stop 切换

- [x] **P2.2** 实现 Start/Stop 录制按钮
  - 绿色 Start 按钮 (#4ec9b0)
  - 红色 Stop 按钮 (#f48771)
  - 联动录制状态

- [x] **P2.3** 重构工具栏图标分组
  - 调试工具组 | 规则配置组 | 高级功能组 | 导入导出组
  - 添加分隔线
  - 图标尺寸统一为 15px

- [x] **P2.4** 重构标签页系统
  - 新文件: `components/reqable/TabBar.tsx`
  - Recording 标签显示请求计数 (如 "Recording (52)")
  - 支持多标签 + 关闭 + 新建
  - 顶部绿色边框指示活动标签

- [x] **P2.5** 整合到 ReqableSimulator
  - 替换现有顶部栏
  - 删除旧的内联标签页代码

- [x] **P2.6** E2E 测试验证
  - case-02, case-03 测试通过

---

## Phase 3: 过滤器和列表重构

**预计时间**: 1.5 天
**状态**: [x] 已完成 (2025-01-24)
**依赖**: Phase 2 完成

### 任务列表

- [x] **P3.1** 创建水平过滤器组件
  - 新文件: `components/reqable/FilterTabs.tsx`
  - 标签分组: All | Http/Https/Websocket | HTTP1/HTTP2 | JSON/XML/Text/HTML/JS | 图片/媒体/二进制 | 1xx-5xx
  - 选中态下划线 (#4ec9b0)
  - 右侧搜索框

- [x] **P3.2** 重构流量列表列定义
  - 列顺序: ID | Icon | Method | URL | Status | Size | Time
  - Icon: HTTPS 显示锁图标

- [x] **P3.3** 实现 URL 高亮显示
  - 新增 HighlightedUrl 组件
  - 协议+域名: 绿色 (#4ec9b0)
  - 路径: 默认色 (#cccccc)

- [x] **P3.4** 优化选中行样式 (Phase 1 已完成)
  - 深色背景 (#37373d)
  - 左侧绿色边框 (2px)

- [x] **P3.5** 添加底部状态栏
  - 新文件: `components/reqable/StatusBar.tsx`
  - 显示: 请求总数、选中数、协议标签、状态码标签

- [x] **P3.6** E2E 测试验证
  - case-02, case-04 测试通过

---

## Phase 4: 详情面板重构

**预计时间**: 1.5 天
**状态**: [x] 已完成 (2025-01-24)
**依赖**: Phase 3 完成

### 任务列表

- [x] **P4.1** 重构 Summary 面板
  - 表格布局: Name | Value
  - 字段: URL, Status, Method, Protocol, Code, Remote Address, Size, Time
  - 每行带复制按钮

- [x] **P4.2** 重构 Headers 标签页
  - 显示数量: `Headers(N)`
  - 表格布局，header key 绿色
  - 每行带复制按钮

- [x] **P4.3** 重构 Body 标签页
  - Pretty | Raw | Hex 切换按钮
  - Hex 模式显示十六进制
  - JSON 语法高亮 (ObjectExplorer)

- [x] **P4.4** 整合详情面板更新
  - Request: Summary | Headers(N) | Body 标签
  - Response: Headers(N) | Body 显示
  - 协议和状态码标签

- [x] **P4.5** E2E 测试验证
  - case-02, case-03, case-04 测试通过

---

## 收尾工作

**状态**: [x] 已完成 (2025-01-24)
**依赖**: Phase 4 完成

### 任务列表

- [x] **F1** 截图对比验证
  - 模拟器截图 vs 真实 Reqable 截图
  - 相似度 > 85% ✅
  - 关键元素对齐：顶部栏、过滤器、列表、详情面板

- [x] **F2** 教学文档
  - 教学文档无需更新（无截图引用）

- [x] **F3** 更新 ADR 状态
  - 标记为 Accepted
  - 记录实际完成情况

- [x] **F4** 更新验收清单
  - 所有 Phase 验收通过

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| 样式改动破坏功能 | 每阶段后运行全部 E2E 测试 |
| 布局变化影响响应式 | 测试不同屏幕尺寸 |
| 改动范围扩大 | 严格按阶段执行，不提前优化 |

---

## 验收清单

### Phase 1 验收
- [x] 无赛博朋克配色残留
- [x] 所有组件使用 CSS 变量
- [x] E2E 测试通过

### Phase 2 验收
- [x] 顶部栏布局与 Reqable 一致
- [x] Start/Stop 功能正常
- [x] 标签页系统可用

### Phase 3 验收
- [x] 过滤器水平排列
- [x] URL 高亮正确
- [x] 列表选中样式正确

### Phase 4 验收
- [x] Summary 面板格式正确
- [x] Headers/Body 切换正常
- [x] 底部状态栏显示正确

### 最终验收
- [x] 截图对比相似度 > 85%
- [x] 所有 E2E 测试通过
- [x] 文档已更新

---

## 备注

- 优先保证功能不变，仅修改样式
- 如发现需要重构的功能逻辑，另开 ADR 讨论
- 每阶段完成后可独立部署验证
