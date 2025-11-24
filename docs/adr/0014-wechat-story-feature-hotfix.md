# ADR 0014：WeChat 剧情模式扩展（Feature Flag 与灰度回退）

## 背景
- 现有的“周五晚高峰”剧情已经覆盖 CDN 缓存、SQL 注入、IDOR、埋点偏差、WAF 拦截等典型网络问题，但在真实事故中，经常还需要应对 **特性开关错误** 与 **灰度管控失灵**。
- 2023 年多起营销投放事故（典型案例：运营误把实验版本推向 100% 用户，导致 JS bundle 访问旧域名）要求安全/研发同学快速在终端上“热补丁” JS，全程依赖 Chrome DevTools 与 Reqable 的抓包结果。
- 用户反馈 WeChat 剧情模式应继续强调“JS 逆向 + 抓包”的真实操作链路，并把线索同步回微信群，让玩家知道如何把调查结果变成协同动作。

## 决策
1. **新增两段剧情节点**：在 `wechat-incident-friday-night` 中补充特性开关失控与灰度回退场景，提供更多闲聊与真实线索。
2. **新增 Story 关卡**：
   - `story_incident_feature_flag_patch`：引导玩家用 Chrome DevTools Console 热补丁 `featureFlags`（数据来自官方 DevTools 文档流程）。
   - `story_incident_gray_release`：要求玩家用 Reqable Composer 调用内部灰度 API，模拟真实事故中的“回滚脚本”。
3. **教学文档优先**：在 `docs/lessons/` 下新增专题 lesson，引用 Chrome DevTools 官方文档与 Reqable Composer 官方指南，确保“先教再考”。
4. **测试与持久化**：为新 Story 关卡补充 Playwright E2E，用同样的 gating / 线索同步流程验证剧情进度，防止回归。

## 影响
- WeChat 剧情模式文本量与本地存档结构保持不变，但 `INCIDENT_STORY_THREAD` 需要新增场景计数与线索 key。
- `VirtualBrowser`、`networkEngine`、`App.handleConsoleCommand` 等需要支持新的关卡逻辑，前端新增两套 UI。
- `constants.ts`、`storylines.ts`、Playwright 测试文件数量增加，需同步更新维护成本。
- 玩家能在剧情里学到“如何用 DevTools 控制 Feature Flag、如何用 Reqable 手工回滚灰度”这两类真实技能，符合“JS 逆向 + 抓包”定位。