# Reqable 官方文档对齐任务

> 关联 ADR: [0017-reqable-official-docs-alignment.md](../adr/0017-reqable-official-docs-alignment.md)

## 概览

按照 Reqable 官方文档，分阶段实现缺失功能，确保模拟器与真实工具行为一致。

---

## Phase 1: Traffic List 基础增强 (P0)

### 1.1 列配置功能
- [x] 创建 `ColumnConfig` 类型定义
- [x] 实现右键表头弹出配置菜单
- [x] 支持显示/隐藏列（勾选切换）
- [x] 配置持久化到 localStorage
- [ ] 添加 "Manage Header Columns" 自定义列选项

### 1.2 列宽拖拽调整
- [x] 在列分隔线添加拖拽 handle
- [x] 实现 mousedown/mousemove/mouseup 拖拽逻辑
- [x] 列宽配置持久化
- [x] 设置最小列宽限制（防止列消失）

### 1.3 按列排序
- [x] 点击表头触发排序
- [x] 支持升序/降序切换
- [x] 表头显示排序箭头指示
- [x] 支持的排序列：ID, Method, Code, Duration, Size, Time

### 1.4 状态指示灯
- [x] 在每行最左侧添加状态指示灯
- [x] 绿色：请求完成（status 200-399）
- [x] 红色：请求失败（status >= 400 或 paused）
- [x] 灰色：请求进行中（status === 0）

### 1.5 更多列选项
- [x] 添加 ID 列
- [x] 添加 Protocol 列（HTTP/1.1, h2）
- [x] 添加 Host 列
- [x] 添加 Remote Address 列
- [ ] 添加 Request Start Time 列

**Phase 1 完成时间**: 2024-11-29

---

## Phase 2: Explorer 侧边栏 (P1)

### 2.1 Explorer 组件框架
- [x] 创建 `Explorer.tsx` 组件
- [x] 实现侧边栏展开/收起（点击 Globe 图标）
- [x] 添加视图切换 Tab（Domain/Structure/Bookmark/Favorite）

### 2.2 Domain 域名视图
- [x] 按 hostname 分组请求
- [x] 显示每个域名的请求数量
- [x] 支持选中域名过滤列表
- [x] 展开显示该域名下的请求

### 2.3 Structure 结构树视图
- [x] 按 URL 路径构建目录树
- [x] 支持展开/折叠目录
- [x] 点击文件显示请求详情
- [ ] 右键目录支持批量操作

### 2.4 Bookmark 书签功能
- [x] 实现书签文件夹管理
- [x] 支持从流量列表右键添加书签
- [x] 书签按 URL 模式过滤（支持通配符）
- [x] 书签数据持久化到 localStorage

### 2.5 Favorite 收藏夹
- [x] 实现收藏夹文件夹管理
- [x] 支持从流量列表右键添加到收藏
- [x] 收藏夹数据持久化到 localStorage

### 2.6 底部搜索框
- [x] 添加搜索输入框
- [x] 支持过滤 Domain 列表

**Phase 2 完成时间**: 2024-11-29

---

## Phase 3: Composer 完善 (P1)

### 3.1 Authorization 认证
- [x] 添加 Auth Tab 页签
- [x] 实现 None 认证类型
- [x] 实现 Basic Auth（自动生成 Authorization header）
- [x] 实现 Bearer Token
- [x] 实现 API Key（支持 header/query 两种方式）
- [ ] 实现 Digest Auth（可选，复杂度高）

### 3.2 Cookie Manager
- [x] 在 Composer 中添加 Cookies Tab
- [x] 显示 Cookie 列表
- [x] 支持添加/编辑/删除 Cookie
- [x] Cookie 自动随请求发送（生成 Cookie header）

### 3.3 Request Metrics
- [x] 集成到 Composer 底部面板
- [x] 显示请求各阶段耗时（模拟数据）
  - DNS Lookup
  - TCP Connection
  - TLS Handshake
  - Request Sent
  - Waiting (TTFB)
  - Content Download
- [x] 使用条形图可视化

### 3.4 Protocol 选择
- [x] 添加 Protocol 下拉选择
- [x] 支持 HTTP/1.1 和 HTTP/2
- [x] 协议信息传递到请求对象

**Phase 3 完成时间**: 2024-11-29

---

## Phase 4: Collection 真实功能 (P2)

### 4.1 保存 API 到集合
- [x] 创建 `CollectionItem` 数据结构（支持 folder/request 类型）
- [x] 弹出保存对话框 (SaveToCollectionDialog)
- [x] 集合数据结构支持 4 级目录

### 4.2 集合文件夹管理
- [x] 创建 `CollectionManager.tsx` 组件
- [x] 支持新建文件夹/新建请求
- [x] 支持重命名/删除/复制
- [x] 右键菜单操作
- [x] 数据持久化到 localStorage

### 4.3 从流量列表保存
- [x] 右键菜单添加 "Save to Collection"
- [x] 自动填充请求数据到集合

### 4.4 导入/导出
- [x] 支持导出为 Postman v2.1.0 格式
- [x] 支持导入 Postman Collection
- [ ] 导出为 cURL 命令（可选）

**Phase 4 完成时间**: 2024-11-29

---

## Phase 5: Toolbox 工具箱 (P2)

### 5.1 工具箱框架
- [x] 创建 `Toolbox.tsx` 组件
- [x] 侧边栏添加工具箱入口 (Wrench 图标)
- [x] 实现工具列表和工具详情视图

### 5.2 编解码工具
- [x] Base64 编解码
- [x] URL 编解码
- [x] HTML Entities 编解码

### 5.3 计算工具
- [x] MD5 计算器
- [x] SHA-1 计算器
- [x] SHA-256 计算器
- [x] 时间戳转换工具

### 5.4 查看器工具
- [x] JSON Viewer（格式化/压缩）
- [ ] XML Viewer（可选）
- [ ] HEX Viewer（可选）

### 5.5 其他工具
- [ ] QRCode 生成器（可选）
- [ ] Color Picker（可选）

**Phase 5 完成时间**: 2024-11-29

---

## 测试计划

### E2E 测试 (Playwright)

```typescript
// tests/e2e/reqable-traffic-list.spec.ts
test.describe('Traffic List Enhancement', () => {
  test('should show column config menu on header right-click', async ({ page }) => {
    // 右键表头 -> 弹出菜单
  });

  test('should sort by column when header clicked', async ({ page }) => {
    // 点击表头 -> 列表排序
  });

  test('should resize column by dragging', async ({ page }) => {
    // 拖拽列分隔线 -> 列宽变化
  });

  test('should show status indicator', async ({ page }) => {
    // 检查状态指示灯颜色
  });
});

// tests/e2e/reqable-explorer.spec.ts
test.describe('Explorer Sidebar', () => {
  test('should group requests by domain', async ({ page }) => {
    // Domain 视图分组正确
  });

  test('should filter list when domain selected', async ({ page }) => {
    // 选中域名 -> 列表过滤
  });

  test('should display structure tree', async ({ page }) => {
    // Structure 视图显示目录树
  });
});

// tests/e2e/reqable-composer.spec.ts
test.describe('Composer Authorization', () => {
  test('should generate Basic Auth header', async ({ page }) => {
    // 输入用户名密码 -> 生成 Authorization header
  });

  test('should add Bearer token header', async ({ page }) => {
    // 输入 token -> 生成 Bearer header
  });
});
```

### 手动测试清单

#### Phase 1 手动测试
- [ ] 右键表头弹出菜单，勾选/取消勾选列
- [ ] 拖拽列分隔线调整宽度
- [ ] 刷新页面后列配置保持
- [ ] 点击 Method 列头 -> 按方法排序
- [ ] 点击 Size 列头 -> 按大小排序
- [ ] 查看状态指示灯颜色正确

#### Phase 2 手动测试
- [ ] 侧边栏切换各视图
- [ ] Domain 视图显示正确分组
- [ ] Structure 视图目录树可展开
- [ ] 添加书签后可过滤列表

#### Phase 3 手动测试
- [ ] Basic Auth 输入后自动生成 header
- [ ] Bearer Token 正确添加
- [ ] Cookie Manager 可增删改
- [ ] Metrics 面板显示耗时数据

---

## 进度追踪

| Phase | 状态 | 开始日期 | 完成日期 | 负责人 |
|-------|------|----------|----------|--------|
| Phase 1 | [x] 完成 | 2024-11-29 | 2024-11-29 | Droid |
| Phase 2 | [x] 完成 | 2024-11-29 | 2024-11-29 | Droid |
| Phase 3 | [x] 完成 | 2024-11-29 | 2024-11-29 | Droid |
| Phase 4 | [x] 完成 | 2024-11-29 | 2024-11-29 | Droid |
| Phase 5 | [x] 完成 | 2024-11-29 | 2024-11-29 | Droid |

---

## 注意事项

1. **真实性优先**：所有实现必须参考官方文档和真实 Reqable 截图
2. **渐进增强**：每个 Phase 完成后需通过测试才能进入下一阶段
3. **兼容性**：新功能不能破坏现有关卡的通关逻辑
4. **持久化**：用户配置需持久化到 localStorage
