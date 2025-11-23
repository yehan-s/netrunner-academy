# ADR 0002：AI Studio 代码重构为优雅的 Next.js 架构并统一使用 pnpm

## 状态

Accepted（已采纳，已完成当前阶段重构）

## 背景

本项目最初由 AI Studio 自动生成，采用 Vite + 单页应用结构，入口和依赖管理较为随意，不利于长期维护和扩展。用户要求：

- 使用 Next.js 进行“完全架构重构”，而不是简单包一下入口。
- 保证代码结构清晰、模块边界明确、组件职责单一。
- 包管理工具统一使用 pnpm，保证安装与构建流程稳定可复现。

## 决策

- 使用 Next.js App Router 作为唯一前端框架入口，所有页面从 `app/` 目录组织。
- 将游戏主逻辑封装为 `App` 客户端组件，由 `app/page.tsx` 负责渲染，并显式标记客户端边界，避免混乱的 SSR/CSR 混用。
- 保留 `components/`、`constants.ts`、`types.ts` 等领域模块，但按需要拆分过长组件，减少嵌套和重复逻辑。
- 包管理统一使用 pnpm，在文档中用 `pnpm install` / `pnpm dev` / `pnpm build` 作为唯一推荐命令，并在 `package.json` 中声明 `packageManager`。

## 影响

- 旧的 Vite 入口和命令不再使用，所有开发与构建统一走 Next.js + pnpm。
- 架构更清晰后，后续新增关卡与教学模块可以按页面/模块维度扩展，而不是继续堆积在单一入口文件。
- 所有后续改动都需要先补齐 ADR 和任务文档，并遵守新的 Next.js + pnpm 约束。
