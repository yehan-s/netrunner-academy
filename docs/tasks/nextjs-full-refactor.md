# Next.js 完整架构重构与 pnpm 统一 - 任务列表

- [x] 在 `package.json` 中声明 `packageManager`，并确认使用 pnpm 作为唯一推荐包管理工具。
- [x] 明确 Next.js 客户端边界（为入口页面或根组件添加 `use client` 标记），确保不再出现在 Server Component 中误用浏览器 API 的情况。
- [x] 清理和整理与 Vite 相关的残余配置或假定，确保项目只依赖 Next.js 架构。
- [x] 更新 `AGENTS.md` 与 `README.md`，将所有 npm 命令替换为 pnpm 命令，并说明运行流程。
- [x] 使用 `pnpm install` + `pnpm build` 验证项目在全新环境下可以成功安装与构建。

