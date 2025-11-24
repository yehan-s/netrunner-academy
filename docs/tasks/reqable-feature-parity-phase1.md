# Reqable 功能完整性 - Phase 1 任务清单

> **目标**: 补全教学文档依赖的 P0 功能，确保 8 节课程可完整演示

## 前置任务

### [ ] Task 0: 组件重构（必须先完成）

**问题**: `ReqableSimulator.tsx` 已达 2000+ 行，继续添加功能会导致不可维护

**方案**: 拆分为模块化组件

```
components/reqable/
├── ReqableSimulator.tsx (主容器，300 行)
├── TrafficList.tsx (流量列表)
├── TrafficDetail.tsx (详情面板)
├── Composer.tsx (请求编辑器)
├── ScriptEditor.tsx (脚本编辑器)
├── ContextMenu.tsx (右键菜单 - 已独立)
├── dialogs/
│   ├── SSLCertDialog.tsx (证书管理)
│   ├── BreakpointDialog.tsx (断点修改)
│   └── RewriteRuleDialog.tsx (重写规则)
└── settings/
    ├── GatewayRules.tsx (网关规则)
    ├── MirrorRules.tsx (镜像规则)
    └── HighlightRules.tsx (高亮规则)
```

**验收标准**:
- [ ] 原有功能完全保留（通过现有测试）
- [ ] 每个组件不超过 300 行
- [ ] 组件间通过 props/callback 通信

---

## P0-1: SSL 证书管理

### [ ] Task 1.1: 创建证书管理对话框 UI

**关联课程**: 第6课 HTTPS证书配置

**UI 需求**:
- 模态对话框，参考 Reqable 官方截图
- 显示当前证书状态（已安装/未安装）
- 导出证书按钮（下载 .crt 文件）
- 重新生成证书按钮
- 证书信息展示（有效期、指纹）

**代码位置**: `components/reqable/dialogs/SSLCertDialog.tsx`

### [ ] Task 1.2: 模拟证书安装流程

**功能**:
- 点击"导出证书"生成模拟 .crt 文件（Blob 下载）
- 显示各平台安装指南（macOS/Windows/iOS/Android）
- 模拟证书信任状态切换

**注意**: 这是教学演示，不涉及真实加密

### [ ] Task 1.3: 集成到主界面

- 在顶部工具栏添加"证书"按钮
- 连接到 `SSLCertDialog` 组件

---

## P0-2: 断点增强

### [ ] Task 2.1: 断点修改对话框 UI

**关联课程**: 第5课 流量拦截与修改

**UI 需求**:
- 双面板布局（Request / Response）
- 支持修改：
  - URL
  - Method
  - Headers（Key-Value 编辑器）
  - Body（文本编辑器 + JSON 美化）
- 操作按钮：
  - Continue（继续并应用修改）
  - Continue without changes（继续不修改）
  - Block（阻止请求）

**代码位置**: `components/reqable/dialogs/BreakpointDialog.tsx`

### [ ] Task 2.2: 断点拦截逻辑

**当前状态**: `breakpointActive` 状态存在，但未实现拦截逻辑

**需要**:
- 在 `App.tsx` 中添加断点规则匹配
- 当请求匹配断点时，暂停并弹出 `BreakpointDialog`
- 用户修改后，将修改后的数据传递给后端逻辑

### [ ] Task 2.3: 断点规则配置

**UI**:
- 断点规则列表（URL 模式匹配）
- 支持：
  - Request 断点
  - Response 断点
  - 全局断点（所有请求）

**存储**: LocalStorage

---

## P0-3: 重写规则

### [ ] Task 3.1: 重写规则配置面板

**关联课程**: 第5课 流量拦截与修改

**UI 需求**:
- 规则列表（可增删改）
- 每条规则包含：
  - 名称
  - 触发条件（URL 匹配）
  - 动作类型：
    - Redirect（重定向到新 URL）
    - Modify Request Header
    - Modify Response Header
    - Replace Response Body
  - 启用/禁用开关

**代码位置**: `components/reqable/settings/RewriteRules.tsx`

### [ ] Task 3.2: 重写规则执行引擎

**在 `App.tsx` 或 `networkEngine.ts` 中实现**:

```typescript
function applyRewriteRules(request: NetworkRequest, rules: RewriteRule[]): NetworkRequest {
  let modifiedRequest = request;
  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (urlMatches(request.url, rule.urlPattern)) {
      modifiedRequest = applyRewriteAction(modifiedRequest, rule.action);
    }
  }
  return modifiedRequest;
}
```

### [ ] Task 3.3: 集成到主界面

- 侧边栏添加"重写"图标
- 点击打开重写规则面板

---

## P0-4: HAR 支持

### [ ] Task 4.1: HAR 导出功能

**关联课程**: 第8课 真实场景调试

**功能**:
- 右键菜单添加"Export as HAR"
- 将当前会话所有请求导出为符合 HAR 1.2 规范的 JSON
- 下载为 `.har` 文件

**参考**: [HAR 规范](http://www.softwareishard.com/blog/har-12-spec/)

### [ ] Task 4.2: HAR 导入功能

**功能**:
- 文件菜单添加"Import HAR"
- 解析 `.har` 文件
- 将历史流量导入到 `requests` 数组
- 显示在流量列表中（标记为"历史"）

### [ ] Task 4.3: HAR 验证与兼容性

**测试**:
- 导入 Chrome DevTools 导出的 HAR
- 导入 Reqable 导出的 HAR（如果能获取样本）
- 验证往返（export → import → export）一致性

---

## 验收标准（Phase 1 整体）

### 功能验收
- [ ] 所有 P0 任务的子任务完成
- [ ] 教学文档第 5/6/8 课所有操作可在模拟器演示
- [ ] 无明显 Bug（通过手动测试清单）

### 代码质量
- [ ] 所有新组件代码审查通过
- [ ] 无 TypeScript 编译错误
- [ ] 至少 1 个 P0 功能有 E2E 测试

### 文档
- [ ] 更新 `docs/adr/0010-reqable-feature-parity.md` 状态为 "Accepted"
- [ ] 在教学文档中添加模拟器功能使用说明

---

## 预计工作量

| 任务 | 预计时间 | 优先级 |
|-----|---------|--------|
| Task 0: 组件重构 | 2 天 | P0 |
| Task 1: SSL 证书管理 | 1 天 | P0 |
| Task 2: 断点增强 | 2 天 | P0 |
| Task 3: 重写规则 | 2 天 | P0 |
| Task 4: HAR 支持 | 1 天 | P0 |
| **总计** | **8 工作日** | - |

---

## 风险与缓解

### 风险 1: 组件重构可能引入 Bug
- **缓解**: 重构前确保现有功能有测试覆盖
- **缓解**: 使用 Git 分支，重构完成后再合并

### 风险 2: HAR 规范复杂，实现时间可能超预期
- **缓解**: 优先实现导出功能（比导入简单）
- **缓解**: 只支持核心字段，忽略可选字段

### 风险 3: 断点逻辑与现有关卡冲突
- **缓解**: 断点仅在特定关卡激活
- **缓解**: 添加"调试模式"开关，普通关卡不显示断点功能

---

## 下一步行动

1. 阅读此文档并确认理解
2. 执行 Task 0（组件重构）
3. 每完成一个 Task，更新此文档的完成状态
4. Phase 1 全部完成后，进行 Phase 2 规划
