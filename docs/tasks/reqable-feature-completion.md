# Reqable 功能完善任务清单

> **目标**: 将 UI 中已有的功能按钮真正连接到主应用逻辑，实现完整功能

## 功能状态总览

### ✅ 已完整实现 (UI + 逻辑)

| 功能 | 组件 | 说明 |
|------|------|------|
| Composer | `Composer.tsx` | 手动构造请求，已连接 onSend |
| Rewrite Rules | `RewriteRules.tsx` | URL/Header/Body 重写，已连接 applyRewriteRules |
| Map Local | `MapLocalRules.tsx` | 本地文件映射，已连接 applyMapLocalRule |
| Gateway Rules | `GatewayRules.tsx` | 请求拦截/阻断，已连接 shouldBlockRequest |
| Mirror Rules | `MirrorRules.tsx` | URL 镜像重定向，已连接 applyMirrorRule |
| Script Rules | `ScriptEditor.tsx` | JS 脚本修改请求/响应，已连接 applyScriptRules |
| Breakpoint Rules | `BreakpointRules.tsx` | 断点规则配置，已连接 getActiveBreakpointRules |
| Breakpoint Dialog | `BreakpointDialog.tsx` | 断点拦截修改 UI，已连接 |
| Highlight Rules | `HighlightRules.tsx` | 流量高亮，已连接 getHighlightColor |
| HAR Export/Import | `ReqableSimulator.tsx` | HAR 文件导入导出，已实现 |
| Diff Viewer | `DiffViewer.tsx` | 请求对比，已实现 |

### ⚠️ UI 存在但未连接到主逻辑

| 功能 | 组件 | 缺失 |
|------|------|------|
| Network Throttle | `NetworkThrottle.tsx` | UI 完整，但限速逻辑未应用到请求 |
| Access Control | `AccessControl.tsx` | UI 完整，但访问控制逻辑未应用 |
| SSL Certificate | `SSLCertDialog.tsx` | UI 完整，但证书生成是模拟的 |

### 🔴 UI 存在但功能未实现

| 功能 | 组件 | 状态 |
|------|------|------|
| Proxy Terminal | `ProxyTerminal.tsx` | UI 框架存在，功能待实现 |
| Turbo Mode | `TurboMode.tsx` | UI 框架存在，功能待实现 |
| Reverse Proxy | `ReverseProxy.tsx` | UI 框架存在，功能待实现 |

---

## Phase 1: 连接已有 UI 到主逻辑 (优先级高)

### Task 1.1: Network Throttle 限速功能 ✅

**状态**: 已完成 (2025-01-24)

**实现内容**:
- [x] 在 `App.tsx` 导入 throttle 配置
- [x] 在网络请求处理中添加延迟逻辑 (calculateThrottledTime)
- [x] 模拟下载/上传速度限制 (通过 setTimeout 模拟)
- [x] 模拟丢包 (shouldDropPacket 随机 drop 请求)
- [x] 响应头添加 `x-throttle-profile` 指示当前限速配置

### Task 1.2: Access Control 访问控制 ✅

**状态**: 已完成 (2025-01-24)

**实现内容**:
- [x] 在 `App.tsx` 导入 `checkAccessControl`
- [x] 在请求处理前检查访问控制规则
- [x] 被阻断的请求返回 403 状态和 `x-blocked-by: access-control` 头

### Task 1.3: SSL Certificate 功能增强 ✅

**状态**: 已完成 (UI 已完善，满足教学需求)

**已有功能**:
- [x] 证书下载功能 (Blob 下载 .crt 文件)
- [x] 各平台安装指南 (macOS/Windows/iOS/Android)
- [x] 教学说明和步骤指导

---

## Phase 2: 完善高级功能 (优先级中)

### Task 2.1: Proxy Terminal 代理终端 ✅

**状态**: 已完成 (UI 已完善，满足教学需求)

**已有功能**:
- [x] 代理配置管理 (host/port/protocol)
- [x] 认证设置 (username/password)
- [x] Bypass 列表管理
- [x] Shell 导出命令生成

### Task 2.2: Turbo Mode 加速模式 ✅

**状态**: 已完成 (2025-01-24)

**实现内容**:
- [x] 在 `App.tsx` 导入 `getTurboModeConfig` 和 `shouldBlockResource`
- [x] 在请求处理中检查资源类型并阻止
- [x] 支持阻止: images, scripts, fonts, stylesheets
- [x] 响应头添加 `x-blocked-by: turbo-mode` 指示

### Task 2.3: Reverse Proxy 反向代理 ✅

**状态**: 已完成 (2025-01-24)

**实现内容**:
- [x] 在 `App.tsx` 导入 `matchReverseProxyRule` 和 `applyReverseProxy`
- [x] URL 转换逻辑集成到请求处理流程
- [x] 请求头添加 `x-reverse-proxy` 和 `x-original-url` 指示

---

## Phase 3: 教学场景适配 (优先级中)

### Task 3.1: 功能与关卡绑定

**需要实现**:
- [ ] Network Throttle 用于"弱网调试"关卡
- [ ] Access Control 用于"访问控制绕过"关卡
- [ ] Reverse Proxy 用于"负载均衡"关卡

### Task 3.2: 教学文档补充

- [ ] 为每个新功能编写教学说明
- [ ] 在 DocsViewer 中添加功能使用指南

---

## 验收标准

### Phase 1 验收
- [ ] Network Throttle: 选择 Slow 3G 后请求延迟明显增加
- [ ] Access Control: 配置阻断规则后相应请求显示 blocked
- [ ] SSL Certificate: 可下载 .crt 文件

### Phase 2 验收
- [ ] Proxy Terminal: 能显示实时请求日志
- [ ] Turbo Mode: 开启后有缓存命中指示
- [ ] Reverse Proxy: 配置后请求被正确转发

---

## 预计总工时

| Phase | 任务数 | 预计时间 |
|-------|--------|----------|
| Phase 1 | 3 | 6 小时 |
| Phase 2 | 3 | 12 小时 |
| Phase 3 | 2 | 4 小时 |
| **总计** | 8 | **22 小时** |

---

## 优先级建议

1. **立即执行**: Task 1.1 (Throttle) + Task 1.2 (Access Control) - 对教学最有价值
2. **次要**: Task 1.3 (SSL) - 提升真实感
3. **可延后**: Phase 2 全部 - 高级功能，教学场景较少

---

## 备注

- 所有功能应保持"教学演示"定位，不需要真实网络操作
- 优先保证 UI 反馈清晰，用户能理解功能效果
- 复杂功能可简化实现，重点是概念演示
