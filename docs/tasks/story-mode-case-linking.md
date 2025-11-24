# 微信剧情模式与训练关卡联动 - 任务列表

- [x] 扩展 `storylines.ts` 中的 `StoryMessage` 结构，增加可选字段 `targetCaseId`，并为关键任务场景标注关卡映射（如登录 500 → `case_01`，价格篡改 → `case_02`，SQL 注入 → `case_03`，IDOR → `case_04`）。
- [x] 修改 `components/WeChatStoryApp.tsx`，在出现带 `targetCaseId` 的消息时，显示“进入任务”按钮，并通过回调将关卡 ID 传递到顶层。
- [x] 修改 `App.tsx`，给 `WeChatStoryApp` 传入 `onOpenCase` 回调，用于切换到 `split` 模式并设置 `activeCaseId`，同时重置请求与成功弹窗状态。
- [x] 运行 `pnpm build` 确认修改不会破坏现有构建。
