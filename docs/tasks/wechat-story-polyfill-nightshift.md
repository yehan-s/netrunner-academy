# 微信剧情：Polyfill 供应链夜班（任务列表）

- [x] Lesson：`docs/lessons/wechat-story-polyfill-supply-chain.md`（涵盖真实事件、工具步骤、12 条微信聊天脚本）。
- [x] ADR：`docs/adr/0013-wechat-story-polyfill.md`（定义剧情线程、story_08~11、gating、测试策略）。
- [x] `storylines.ts`：新增 `wechat-polyfill-nightshift` 线程（scene-30~41），并在 Dock → 微信 → 剧情列表中展示，支持介绍页 + 选择/退出逻辑。
- [x] LocalStorage：扩展 `netrunner_wechat_state_v3` 结构，记录 `activeThreadId`、`progressByThreadId`、`clueSyncState`，避免刷新或切应用丢失进度。
- [x] 微信 UI：
  - 聊天消息展示真实微信风格（头像、群聊提示、私聊标签）。
  - “同步线索”按钮在完成关卡后出现，未同步时禁止解锁下一条消息。
  - Dock → 微信 → 剧情模式入口保留剧情介绍和状态标签。
- [x] Story 关卡：
  - `story_polyfill_ioc_capture`：虚拟浏览器加载 polyfill 页，按钮触发恶意请求，Reqable 面板提供抓包日志。
  - `story_polyfill_tls_fallback`：模拟 TLS 握手日志与 HTTP/2/1.1 切换按钮。
  - `story_polyfill_reqable_rule`：在 UI 中填写拦截脚本，并演示请求被阻断后如何把线索回传聊天。
  - `story_polyfill_cdn_validation`：展示 CDN purge 检查工具，按钮触发响应头校验。
- [x] 网络引擎：`engine/networkEngine.ts` 添加对应请求/响应模拟，确保按钮或 Reqable 脚本执行触发成功条件，且数据与剧情描述一致。
- [x] 测试：为 story_08~story_11 编写 Playwright E2E（`tests/e2e/story-mode-wechat-story08/09/10/11.spec.ts`），并新增剧情线程持久化用例 `tests/e2e/story-mode-wechat-polyfill-thread.spec.ts`。
- [x] 文档回写：剧情开发完成后，把 Lesson/ADR/Task 的“实施状态”“关卡 ID”“测试路径”补充，并在 README/AGENTS 如有引用处更新（ADR 0013 已标记 Accepted，任务清单补充测试路径）。
