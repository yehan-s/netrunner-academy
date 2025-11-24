# wechat-story-feature-hotfix

- [x] 编写 Lesson：介绍特性开关热补丁（Chrome DevTools Console）与灰度 API 回退（Reqable Composer），引用官方文档并列出目标/步骤。
- [x] 更新 `storylines.ts`：在 `wechat-incident-friday-night` 中加入特性开关与灰度回退剧情，对应线索、闲聊与 `targetCaseId`。
- [x] 新增 Story 关卡 `story_incident_feature_flag_patch`、`story_incident_gray_release`，补齐 `constants.ts`、UI、network engine 与成功判定逻辑。
- [x] 调整 `VirtualBrowser` 与 `App.handleConsoleCommand`，实现热补丁状态反馈、Reqable 请求提示，以及线索同步提示文案。
- [x] 为两个新关卡各写一份 Playwright E2E（含剧情 gating 与任务完成验证）。
- [ ] 运行 `pnpm test:e2e`，确认所有既有 Story 流程与新增用例通过。
