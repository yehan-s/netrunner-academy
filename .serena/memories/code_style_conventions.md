# 代码风格与约定

## TypeScript 规范

### 命名约定
- **组件名**：PascalCase（例：`NetworkMonitor`、`VirtualBrowser`）
- **函数/变量**：camelCase（例：`handleRefresh`、`activeCaseId`）
- **常量**：UPPER_SNAKE_CASE（例：`CASE_STUDIES`）
  - 常量应集中在 `constants.ts` 或专用常量模块

### 代码结构
- **缩进**：2 空格（不使用 Tab）
- **复杂度限制**：避免超过 3 层嵌套，复杂逻辑拆分为小函数
- **组件类型**：优先使用函数式组件（React Hooks）

### 类型定义
- 所有类型定义集中在 `types.ts`
- 导出的接口使用 `export interface`
- 关键类型：
  - `NetworkRequest`：网络请求数据结构
  - `CaseStudy`：关卡定义
  - `ScriptRule`：Reqable 规则配置

## 文档与注释

### 注释语言
- **所有代码注释与技术文档统一使用中文**
- 保持简短直接，避免冗长解释

### 文档类型
1. **ADR**（架构决策记录）
   - 位置：`docs/adr/`
   - 命名：`XXXX-feature-name.md`（例：`0001-nextjs-migration.md`）
   - 时机：重大技术/架构变更前必须编写

2. **Tasks**（任务文档）
   - 位置：`docs/tasks/`
   - 格式：使用 `[ ]` 待办、`[-]` 进行中、`[x]` 完成
   - 命名：kebab-case（例：`nextjs-full-refactor.md`）

3. **Lessons**（教学文档）
   - 位置：`docs/lessons/`（待创建）
   - 要求：基于官方文档编写，禁止杜撰
   - 原则：先写教学文档，再设计关卡（"先教再考"）

## Git 提交规范

采用简化的 Conventional Commits：
- `feat:` - 新功能
- `fix:` - Bug 修复
- `refactor:` - 重构（不改变功能）
- `docs:` - 文档更新
- `chore:` - 构建/工具/依赖更新

**示例**：
```
feat: add JWT token analysis level
fix: resolve DevTools resize bug
refactor: extract network logic to service
docs: update AGENTS.md with new guidelines
```

## 设计原则（Linus 风格）

1. **简化数据结构 > 增加条件分支**
   - 优先通过重构数据结构消除特殊情况
   - 避免过多的 if/else 逻辑

2. **不破坏现有行为**
   - 任何导致玩家体验退化的改动都视为缺陷
   - 向后兼容性是铁律

3. **真实性优先**
   - 禁止"杜撰界面"或声称已实现但代码中不存在的功能
   - 工具模拟器必须有真实代码支持

4. **组件复用 > 重复造轮子**
   - 新功能应复用现有 UI 组件
   - 保持整体视觉与交互风格一致
