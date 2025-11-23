# 任务完成后的验证流程

## 强制性检查（每次改动必做）

### 1. TypeScript 编译检查
```bash
pnpm build
```
**要求**：必须通过，无类型错误

### 2. 浏览器手动验证

启动开发服务器：
```bash
pnpm dev
```

**验证清单**：
- [ ] 页面正常加载，无白屏/崩溃
- [ ] 关卡列表正常显示
- [ ] 核心交互功能：
  - [ ] 终端输入与命令执行
  - [ ] 网络监控面板（Network/Console）
  - [ ] Reqable 工具（流量捕获、Composer）
  - [ ] Docs 文档查看
  - [ ] 关卡切换与解锁逻辑

### 3. 关卡验证（如涉及关卡改动）

**新增关卡**：
- [ ] 在 `constants.ts` 中定义关卡数据
- [ ] 在 `App.tsx` 中实现通关逻辑
- [ ] 手动通关验证（确保关卡可完成）
- [ ] 编写 Playwright E2E 测试（`tests/e2e/level-XX.spec.ts`）

**修改现有关卡**：
- [ ] 原有通关路径仍然有效
- [ ] 未破坏其他关卡的依赖逻辑

### 4. 文档更新

**ADR 流程**：
- [ ] 重大变更前已编写 ADR（`docs/adr/XXXX-feature.md`）
- [ ] ADR 状态已更新（Proposed → Accepted）

**Tasks 流程**：
- [ ] 相关任务标记为 `[x]` 完成
- [ ] 任务文档路径：`docs/tasks/{feature-name}.md`

### 5. Git 提交检查

- [ ] 提交信息遵循 Conventional Commits 格式
- [ ] 单次提交聚焦单一改动
- [ ] 无敏感信息泄露（检查 `.env.local` 未提交）

## 可选检查（视情况而定）

### 性能验证
- [ ] Chrome DevTools Performance 面板检查（无明显卡顿）
- [ ] 网络请求数量合理（无重复请求）

### 可访问性
- [ ] 键盘导航可用（Tab、Enter）
- [ ] 色彩对比度符合 WCAG 标准

### 兼容性（如涉及浏览器 API）
- [ ] Chrome/Edge 测试通过
- [ ] Safari 测试通过（macOS）

## 未来自动化计划

**待引入工具**：
- [ ] Playwright（E2E 测试框架）
- [ ] Vitest（单元测试）
- [ ] Prettier（代码格式化）
- [ ] ESLint（代码质量检查）

**测试文件规范**：
- E2E 测试：`tests/e2e/level-{id}.spec.ts`
- 单元测试：`components/ComponentName.test.tsx`（与被测文件同目录）

## 失败处理

**TypeScript 错误**：
- 检查 `tsconfig.json` 配置
- 使用 `tsc --noEmit` 查看详细错误

**运行时错误**：
- 检查浏览器 Console
- 检查 Next.js 终端输出
- 使用 React DevTools 查看组件状态

**关卡无法通关**：
- 检查 `App.tsx` 中的 `processBackendLogic()` 逻辑
- 检查 `handleConsoleCommand()` 逻辑（如为 Reverse 关卡）
- 在 Console 中调用 `triggerSuccess()` 调试
