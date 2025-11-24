# ADR 0013：微信剧情“polyfill 供应链夜班”& story_08~11 关卡

## 状态
Accepted（已实现）

## 背景
- 2024 年 6 月，Cloudflare、Google TAG 等官方公告证实 `polyfill.io` CDN 被接管，在返回的 JS 中注入恶意载荷。这是一个真实、已被多家安全团队披露的供应链攻击。
- 我们的游戏定位是“教用户掌握 Reqable 抓包 + JS 逆向 + 真实安全排查流程”，而当前剧情只覆盖 CDN 缓存、参数篡改、SQL 注入等问题，缺少面向第三方脚本供应链的长流程案例。
- 用户方要求新增一个“至少 10 条消息、包含闲聊与任务、线索需要通过微信回传、关卡环环相扣”的剧情，并且必须先写教学/剧情文档，再写 ADR、Tasks，最后才允许开发。
- `docs/lessons/wechat-story-polyfill-supply-chain.md` 已整理：
  - 12 条微信聊天场景（scene-30~41），串联 polyfill backdoor → TLS 兼容 → Reqable Rule → CDN 验证。
  - 强调使用 Reqable + Chrome DevTools，对应官方文档操作流程。
  - 明确每个任务节点要绑定 Story 专用关卡，禁止复用旧 case。

## 决策
1. **新增剧情线程**：在 `storylines.ts` 中添加 `POLYFILL_SUPPLY_CHAIN_THREAD`（ID 例如 `wechat-polyfill-nightshift`），包含 lesson 中定义的 12 个场景，并在 Dock → 微信 → 剧情列表中作为新品类展示。剧情进度持续写入 `localStorage`。
2. **定义 Story 关卡**：在 `constants.ts` / `types.ts` 中新增 4 个 Story 关卡：
   - `story_polyfill_ioc_capture`
   - `story_polyfill_tls_fallback`
   - `story_polyfill_reqable_rule`
   - `story_polyfill_cdn_validation`
   每个关卡需提供真实 UI（虚拟浏览器 + Reqable 面板）与 `learningObjectives`，与剧情描述逐条对应。
3. **工具 + UI 真实性**：虚拟浏览器必须模拟 Chrome，抓包面板模拟 Reqable，且要支持真实的按钮/请求触发、响应展示、断点提示。不得使用硬编码“成功”提示来糊弄玩家。
4. **剧情 gating 与线索同步**：当剧情推进到带 `targetCaseId` 的消息时：
   - “下一条”按钮禁用并提示“请先完成上一任务并同步线索”。
   - 玩家完成关卡后，需要在微信界面中点击“同步线索”按钮（或发送消息）才算解锁下一条消息。线索同步状态要写进 `localStorage`。
5. **测试策略**：为 story_08~story_11 分别编写 Playwright 端到端测试，覆盖 Dock → 微信剧情 → 打开关卡 → 真实交互 → 成功提示 → 返回剧情继续的链路。同时增加一个剧情状态恢复测试，验证刷新后仍停留在当前场景。
6. **流程遵循**：任何与该剧情相关的开发改动，必须引用本 ADR 与对应 Task 文档，并在完成后更新两者状态（ADR 标记 Accepted，Task 列表写 `[x]`）。

## 影响
- 玩家将获得一个基于真实公开事件（polyfill.io 被接管）的完整教学流程，涵盖 JS 逆向、Reqable 抓包、TLS 调试、CDN 验证等多个知识点，符合“从文档到剧情再到关卡”的要求。
- WeChat 剧情系统需要增强：剧情线程列表、localStorage 结构、线索同步机制都要扩展以支持多个长流程线程。
- Story 关卡数量增加到 11 个，对虚拟浏览器和网络引擎的扩展提出更高要求，但也能复用已有组件。
- Playwright 测试矩阵扩大，需要关注运行时间与稳定性，但可以提前捕获剧情 gating 或本地持久化的回归问题。
