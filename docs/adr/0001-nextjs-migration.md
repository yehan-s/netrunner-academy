# ADR 0001：将前端架构迁移到 Next.js

## 状态

Accepted（已采纳并完成初始迁移）

## 背景

当前项目使用 Vite + React 作为前端构建工具，入口为 `index.html` + `index.tsx`，整体是单页应用架构。随着关卡与 UI 复杂度增加，需要更清晰的页面结构、路由与服务端扩展能力，同时用户要求统一采用 Next.js 架构。

## 决策

- 选择 Next.js（App Router）作为新的前端框架，保留 TypeScript + React 技术栈。
- 使用 `app/layout.tsx` + `app/page.tsx` 作为入口，将现有 `App.tsx` 作为主 UI 组件复用，而不是重写 UI。
- 保留 `components/` 与 `services/` 目录结构不变，仅调整导入路径以适配 Next.js。
- 将构建脚本迁移为 Next.js 标准命令：`next dev` / `next build` / `next start`。
- 使用 `next/script` 引入 `https://cdn.tailwindcss.com`，并通过 `globals.css` 迁移原 `index.html` 中的全局样式，保证视觉效果尽量一致。

## 影响

- Vite 相关文件（如 `vite.config.ts`、`index.html`、`index.tsx`）已从构建路径中移除，由 Next.js 接管入口与路由。
- 本次迁移保持了现有 `App.tsx` 与组件层级，关卡逻辑、网络请求模拟与 UI 行为在新的入口下保持一致。
- 后续所有功能需求应基于 Next.js 目录结构设计，并在 `docs/adr/` 中追加新的架构决策记录。
