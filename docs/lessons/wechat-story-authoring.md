# 微信剧情模式关卡创建指南

> 适用范围：为 WeChat 剧情模式新增/修改剧情线与对应 Story 关卡的所有改动。

## 1. 先有教学文档，再有剧情与关卡

1. **选题来源**：必须来自真实的生产事故或安全案例（可做适度脱敏与改编，不得虚构不存在的技术问题）。
2. **教学文档**：在 `docs/lessons/` 下新增一篇 Lesson（如 `wechat-cdn-login-outage.md`），内容需基于最新官方文档与权威资料（Reqable / Chrome DevTools / OWASP 等），包含：
   - 场景简介与风险说明；
   - 工具使用步骤（抓包、改包、观察响应等）；
   - 预期现象与常见误区。
3. **ADR 与 Tasks**：
   - 在 `docs/adr/` 中写 ADR（如 `00xx-wechat-story-new-incident.md`），明确该剧情要解决的教学目标和架构改动点；
   - 在 `docs/tasks/` 中写任务列表（如 `wechat-story-new-incident.md`），拆分为：文档、剧情文案、Story 关卡实现、Playwright 测试等，并在实现过程中维护 `[ ]/[-]/[x]` 状态。

## 2. 剧情文案与数据结构

> 严格流程：**先写完整剧情草案 → 与产品/教学负责人评审通过 → 再允许进入 Story 关卡设计与实现阶段**。任何跳过剧情评审、直接写关卡的改动，一律视为流程违规。

1. **故事线结构**（`storylines.ts`）：
   - 剧情模式不是单点训练，而是**环环相扣的长流程**：每个任务节点都必须依赖前面消息提供的线索，不允许“任意顺序刷任务”；
   - 整条 Story 至少覆盖 2 个以上不同的知识点或工具能力（例如 CDN + 抓包 + JS 逆向），难度与复杂度要明显高于普通 `case_XX` 单关；
   - 使用 `StoryThread` 描述整条剧情，至少包含 10 条以上消息，允许群聊与私聊穿插；
   - `StoryMessage.text` 必须是正常微信聊天语气，不出现“关卡 / 玩家”等出戏用语，可写日常闲聊，任务从聊天中自然冒出来。
2. **任务节点标记**：
   - 每个真正要求玩家“去做一件事”的消息必须带 `targetCaseId`，指向一个 **Story 专用关卡**（如 `story_01_login_outage`），不要直接指向 `case_XX`；
   - 文案里描述的 URL、接口、工具操作必须与关卡里实现的一致（例如 CDN 缓存、0.01 元下单、SQL 注入、IDOR）。

## 3. Story 关卡实现与真实性要求

1. **关卡元数据**（`constants.ts`）：
   - 为每条剧情任务增加 `Story` 类别关卡（`story_XX_*`），描述和 `initialUrl` 要与微信文案一一对应；
   - `learningObjectives` 与 `guideSteps` 必须逐条对齐 Lesson 中的知识点，做到“先教再考”。
2. **UI 与行为**：
   - `VirtualBrowser` 中为 Story 关卡提供与剧情匹配的页面（如微信投放落地页 + 静态 JS 版本号展示、搜索页面、订单详情页等）；
   - `engine/networkEngine` 中模拟的请求/响应应体现真实工具可观察到的线索（响应头、Body 片段、版本号、价格字段等），禁止用硬编码假反馈欺骗用户。
3. **工具一致性**：
   - 游戏内抓包工具统一模拟 Reqable，浏览器统一模拟 Chrome，交互风格尽量贴近真实 UI（标签、面板名称、操作顺序）。

## 4. 剧情推进与本地进度

1. **进度持久化**：
   - 剧情进度通过 `localStorage` 键 `netrunner_wechat_state_v3` 持久化，字段为：`activeThreadId` 与 `progressByThreadId[threadId]`；
   - 避免在组件初始化后再用“空状态”覆盖本地存储，初始化时应优先从 `localStorage` 读取已有状态。
2. **任务 gating 规则**：
   - 当最新一条已读消息带有 `targetCaseId`，且对应 Story 关卡不在 `completedCases` 中时：
     - 微信底部按钮文案必须为“请先完成上一个任务”，并禁用点击；
     - 只有当 Story 关卡通关（`completedCases` 更新）后，按钮才能恢复为“下一条消息”；
   - 切换应用或刷新页面后，必须从本地状态恢复到上次的剧情位置，不能退回到第一条消息。

## 5. 测试与交付

1. **Playwright 测试**：
   - 每条 Story 关卡至少要有一条端到端测试，覆盖从桌面进入关卡 → 使用 Reqable/浏览器完成关键操作 → 看到成功弹窗；
   - 对于剧情模式，推荐增加完整链路测试（参考 `tests/e2e/story-mode-wechat-story01.spec.ts`）：剧情推进到任务 → 跳转 Story 关卡通关 → 返回微信验证 gating 状态恢复。
2. **命令与校验**：
   - 提交前至少保证 `pnpm build` 与 `pnpm test:e2e` 通过；
   - 回写 ADR 与 Tasks，将实际实现的 Story ID、测试用例路径、关键技术决策记录清楚，方便后续扩展新的剧情线。