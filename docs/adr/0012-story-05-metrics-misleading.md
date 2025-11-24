# ADR 0012：剧情关卡 story_05_metrics_misleading（埋点误报与监控偏差）

## 状态

Accepted（已采纳）

## 背景

在现有微信剧情中，scene-20~22 描述了一个典型场景：
- 监控大盘上的“下单成功率”几乎贴地；
- 但通过抓包/日志看到的真实失败率只是平时的两倍，并非完全挂掉；
- 进一步排查发现，埋点逻辑把“重试一次支付”也算成一次失败事件，导致图表夸大了问题严重性。

为了把这一段从“聊天描述”落到可操作的教学关卡，需要一个专门的 Story 关卡来承载“监控 vs 真实日志 vs 埋点逻辑”的对比过程。

## 决策

- 在 `constants.ts` 中新增 `story_05_metrics_misleading`，作为 WeChat 剧情模式的第五个 Story 关卡，入口 URL 指向一个监控大屏（模拟内部 dashboard）。
- 在 `VirtualBrowser` 中为 `story_05_metrics_misleading` 渲染一个简化的监控视图：
  - 显示“下单成功率”大号红色数字以及其他正常指标；
  - 提供触发业务日志接口和埋点原始数据接口的按钮（例如 `/api/logs/orders` 和 `/metrics/raw`），方便在 Reqable 中抓取比较。
- 在 `engine/networkEngine.ts` 中为 `story_05_metrics_misleading` 添加专用逻辑：
  - 模拟 `/api/logs/orders` 返回真实成功/失败比例；
  - 模拟 `/metrics/raw` 返回把重试也算成失败的埋点统计；
  - 当玩家在 Reqable 中成功请求到 `/metrics/raw`（或满足一定条件）时标记关卡通关。
- 在 `storylines.ts` 中将 scene-20（“监控几乎归零但日志没那么惨”）标记为 `targetCaseId: 'story_05_metrics_misleading'`，沿用 WeChat 剧情的 gating 规则：读到该消息后必须先完成 Story 关卡才能继续推进剧情。

## 影响

- 玩家可以在统一的故事上下文中，体验“监控看起来很吓人，但真实业务影响需要用抓包和日志验证”的完整过程，而不是只学单点抓包技巧。
- 通过将监控大盘、业务日志接口和埋点上报接口串起来，强化了对“观测数据的可信度”这一现实工程问题的认知，有助于避免团队在事故中被图表牵着走。
- 新增 Story 关卡不会影响既有 `case_02/03/04` 等关卡逻辑，仅在 Story 模式下生效；E2E 测试将确保其行为稳定。