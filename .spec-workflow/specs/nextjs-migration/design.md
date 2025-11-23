# Next.js 架构迁移 - 技术设计

## 总体架构

- 使用 Next.js App Router，入口为 `app/layout.tsx` 与 `app/page.tsx`。
- 保留 `App.tsx` 作为主界面组件，在 `app/page.tsx` 中直接渲染 `<App />`，避免重复实现 UI。
- 保持 `components/`、`services/`、`constants.ts`、`types.ts` 目录结构不变，仅调整为相对导入。

## 构建与配置

- 新增 `next.config.mjs` 作为 Next.js 配置，采用默认配置，仅在需要时加小范围调整。
- 更新 `tsconfig.json` 为 Next.js 推荐配置，包含 `next` 插件与 `next-env.d.ts`。
- 删除或废弃 `vite.config.ts`、`index.html`、`index.tsx`，由 Next.js 接管入口与路由。

## UI 与样式

- 在 `app/layout.tsx` 中：
  - 使用 `next/script` 引入 `https://cdn.tailwindcss.com`，保持 Tailwind class 行为。
  - 通过 `globals.css` 迁移原 `index.html` 的 `body` 和滚动条样式。
- 不改变现有组件的 DOM 结构和 className，确保视觉与交互尽量一致。

## 运行命令与环境

- `npm run dev`：映射为 `next dev`。
- `npm run build`：映射为 `next build`。
- `npm run start`：新增生产启动命令 `next start`。
- `.env.local` 继续存放如 `GEMINI_API_KEY` 等环境变量，Next.js 使用默认加载机制读取。

