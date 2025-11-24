# 剧情关卡 story_05_metrics_misleading - 任务列表

- [x] 编写 ADR `docs/adr/0012-story-05-metrics-misleading.md`，明确监控与埋点偏差场景、Story 关卡边界以及与 WeChat 剧情的绑定方式。
- [ ] `storylines.ts`：将 scene-20 标记为 `targetCaseId: 'story_05_metrics_misleading'`，使其成为新的剧情任务节点，并遵循现有 gating 规则。
- [ ] `constants.ts`：完善 `story_05_metrics_misleading` 的文案、学习目标和步骤（已创建骨架，后续如有需要可补充更多细节）。
- [ ] `components/VirtualBrowser.tsx`：为 `story_05_metrics_misleading` 实现监控大盘 UI（下单成功率图表 + 触发业务日志接口/埋点接口的按钮）。
- [ ] `engine/networkEngine.ts`：
  - 在 `buildInitialRequests` 中为 story_05 构造一到两条初始请求（如加载 dashboard 页面时触发基础指标接口）；
  - 在 `buildBackendResponse` 中模拟 `/api/logs/orders` 和 `/metrics/raw` 的不同数据，满足 Story 文案描述；
  - 在合适条件下设置 `shouldTriggerSuccess = true`，完成关卡通关判定。
- [ ] 测试：新增 Playwright E2E 用例（例如 `tests/e2e/story-mode-wechat-story05.spec.ts` 或 `story-05-metrics.spec.ts`），至少验证：
  - 可以从 Mission Select 或 WeChat 剧情中进入 `story_05_metrics_misleading`；
  - 使用 Reqable 请求 `/metrics/raw` 后关卡可以正常通关（或至少行为稳定、无错误）。