# 微信剧情模式 - 任务列表

- [x] 编写 ADR `docs/adr/0008-story-mode-wechat.md`，明确微信剧情模式的目标与本地存储策略。
- [x] 定义 `storylines.ts` 中的 `StoryThread` 结构与至少一个包含 10+ 场景消息的剧情线（不复用现有 case_XX）。
- [x] 新增 `components/WeChatStoryApp.tsx` 组件，实现：
  - 左侧简化版微信会话列表（包含“剧情模式”会话）；
  - 右侧剧情列表与剧情详情视图；
  - 使用 `localStorage` 持久化当前选中剧情与进度，并提供“退出剧情”操作清空状态。
- [x] 修改 `App.tsx`：
  - 在 Dock 中加入 “WeChat” 图标按钮，扩展 `activeApp` 类型为 `'wechat'`；
  - 当 `activeApp === 'wechat'` 时，在桌面区域渲染 `WeChatStoryApp`，并隐藏原有 TaskSidebar；
  - 使用 `pnpm build` 验证编译通过。
