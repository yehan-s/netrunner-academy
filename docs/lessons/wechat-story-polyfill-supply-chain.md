# Lesson：微信剧情 · Polyfill 供应链劫持长流程

> 真实背景：2024 年 6 月起，全球多家安全厂商（Cloudflare、阿里云、Google TAG）披露 `polyfill.io` 服务被接管并注入恶意脚本，导致依赖公共 CDN 的网站在加载 polyfill 资源时被植入数据窃取代码。大量国内 H5 运营落地页同样引用了该域名，引发真实的生产事故。

## 教学目标
1. 通过 Reqable 真实代理流量，定位第三方 CDN 被劫持后的异常返回内容，并输出证据给同事。
2. 使用 Chrome DevTools（Sources + Network 面板）对可疑 polyfill JS 进行快速去混淆与断点调试，确认攻击载荷的行为。
3. 将抓包结论写入剧情中的微信聊天，触发新的调查任务（例如缓存兜底、签名校验、线索回传），形成环环相扣的长流程。
4. 学会利用浏览器/Reqable 联动验证回滚方案（自建 CDN、SRI、Feature Flag），并把产线决策反馈到剧情中。

## 工具依赖（基于官方文档）
- Reqable 官方文档：《代理抓包基础》《Breakpoint 调试》《Scriptable Rules》。参考：https://reqable.com/docs/ （最新桌面版说明）
- Chrome DevTools 官方文档：《Network panel》《Sources panel》《Coverage》《Application Storage》。参考：https://developer.chrome.com/docs/devtools/
- Chrome 团队 2024 年 7 月安全公告：《Polyfill supply-chain attack mitigation》。（使用自托管 polyfill 的建议）

## 剧情概览
- Dock 里先点击微信 → 进入“剧情模式”标签 → 看到“Polyfill 供应链夜班”剧情入口并阅读介绍。
- 剧情现包含 12 个核心任务节点 + 8 条日常闲聊（scene-30~41 及 scene-30b/31b/32b/33a/34a/35a/37a/38a）。团队成员会聊王城下班计划、监控噪音、咖啡机排队等真实工作细节，增强沉浸感。全部消息都写入 `localStorage`（键 `netrunner_wechat_state_v3`），切换应用或刷新仍保留状态。
- 每次任务完成后，玩家需要把线索以微信消息形式反馈给指定同事，否则剧情按钮会提示“请先通过上一任务并同步线索”。

## 微信聊天脚本（12 场景）
1. **scene-30（群聊，安全负责人）**：引用 2024-06-25 Cloudflare 公告链接，提醒“polyfill.io 被接管，我们的微信 H5 活动页也直接引用了该域名，今晚别离线”。
2. **scene-30b（群聊，同事，闲聊）**：吐槽“本来准备开启周五 Happy Hour，现在只能把啤酒塞回冰箱”，大家互相抱怨值班计划被打乱。
3. **scene-31（群聊，同事）**：运营反馈“北京地区扫码异常，Chrome 小分队怀疑 JS 被篡改”。
4. **scene-31b（群聊，你，闲聊）**：安抚同事“别骂运营了，今晚先撑住”；同时提醒大家别在群里刷表情包以免冲掉报警截图。
5. **scene-32（私聊，你→前端）**：确认 polyfill 还没自托管，对方说“沿用旧脚手架，今晚只能兜底”。
6. **scene-32b（私聊，同事，闲聊）**：前端小伙伴自嘲“刚买的喜茶还没喝就要写 Nginx 配置”，真实还原夜班碎碎念。
7. **scene-32c（私聊，你→同事，闲聊）**：顺口说“周末原本约了去怀柔徒步，现在只能‘徒步日志’”，聊聊工作之外的计划。
7. **scene-33（群聊，安全负责人）**：要求你用 Reqable 抓 `https://cdn.polyfill.io/v3/polyfill.min.js`，查 IOC 并截图。→ `targetCaseId: story_polyfill_ioc_capture`。
8. **scene-33a（群聊，同事，闲聊）**：数据团队提醒“抓包完记得把 pcap 传到证据盘，明天复盘要用”，顺便问你咖啡机队伍有多长。
9. **scene-33b（群聊，同事，闲聊）**：大家热烈讨论夜宵要点卤味还是麻辣烫，顺便把报销链接甩在群里，营造“边救火边订餐”的氛围。
10. **scene-34（群聊，你）**：分享 Reqable 截图，指出脚本里有 `fetch("https://analytics.polyfill.io/v1/collect")`，这是 Google TAG 公告中的 IOC。
11. **scene-34a（群聊，安全负责人，闲聊）**：表扬“截图跟 TAG 公告一致”，并调侃“今晚可能又要写一篇《我们是怎么熬过周五夜班》的周报”。
12. **scene-34b（群聊，你，闲聊）**：回“等问题解决了我请大家去新开的台州菜馆，别老是熬夜吃外卖”，给团队一点期待。
11. **scene-35（群聊，同事）**：监控爆出 TLS 握手错误，怀疑 force-h2 导致老 Android 全挂。→ `targetCaseId: story_polyfill_tls_fallback`。
12. **scene-35a（群聊，你，闲聊）**：提议“抓完 polyfill 先顺手加一条自测脚本”，顺带吐槽“Android 团队已经在群里@到屏幕发烫”。
13. **scene-36（私聊，你→安全负责人）**：强调 TLS 兼容与 polyfill backdoor 是两条线，避免沟通混乱。
14. **scene-37（群聊，安全负责人）**：要求写 Reqable Scriptable Rule 拦截恶意域名并同步到事件速记。→ `story_polyfill_reqable_rule`。
15. **scene-37a（群聊，同事，闲聊）**：运营同事问“临时拦截会不会误伤埋点？”你们讨论要不要在第二天把配置写进正式 SOP。
16. **scene-37b（群聊，同事，闲聊）**：另一个同事感慨“本来想周末去厦门看海，现在看的是日志海”，继续拉回日常话题。
17. **scene-38（群聊，同事）**：前端已切自托管 polyfill，但 CDN 缓存不一致，需要你抓包确认 `Cache-Control`。→ `story_polyfill_cdn_validation`。
18. **scene-38a（群聊，安全负责人，闲聊）**：提醒“别忘了把 purge 过程写在 OpsLog 里”，并调侃“咖啡机的咖啡被你们喝空了”。
19. **scene-38b（群聊，同事，闲聊）**：有人自告奋勇“明天去城南那家日料店排队，给大家当慰问品”，顺便拉群友一起约饭。
20. **scene-39（群聊，你）**：用 Chrome Coverage / Sources 证明只剩自托管脚本，并把截图挂群公告。
19. **scene-40（群聊，安全负责人）**：要求剧情 UI 中写 `polyfillIncident.status="Mitigated"`，同步线索后才可解锁下一条。
21. **scene-40a（群聊，同事，闲聊）**：有人问“等问题回滚了要不要去马路对面新开的烤串摊庆祝”，并约好带上值班狗牌。
22. **scene-41（群聊，同事）**：提醒“任务全过后要开复盘会，把过程写进 playbook，退出剧情会清空状态”。

## 关卡映射（供后续实现）
| targetCaseId | 场景 | 教学焦点 |
| --- | --- | --- |
| `story_polyfill_ioc_capture` | scene-33 | 使用 Reqable 抓取被劫持的 polyfill.js，并在虚拟浏览器中定位恶意 JS 片段 |
| `story_polyfill_tls_fallback` | scene-35 | 分析 TLS 握手失败日志，排查强制 HTTP/2 导致的老端兼容问题 |
| `story_polyfill_reqable_rule` | scene-37 | 在 Reqable Scriptable Rules 中写过滤器/替换规则并把结果回传微信 |
| `story_polyfill_cdn_validation` | scene-38 | 使用浏览器 + Reqable 验证 CDN Purge 生效、Cache-Control 合理 |

## 实施注意
1. 剧情消息与关卡描述必须保持一一对应，关卡 UI 不得复用旧模板。虚拟浏览器需要提供真实可点击的按钮或输入框，与剧情描述匹配（如“下载 polyfill”“同步线索”等）。
2. 玩家在完成关卡前，微信里的“下一条消息”按钮需要禁用并提示“请先完成 polyfill 任务并同步线索”。完成关卡后，要引导玩家在剧情中发送线索（可通过 `sendClueToChat()` 之类的 UI）才会写入 localStorage。
3. 所有剧情状态写入 `localStorage`，包括当前选中的剧情线程、scene index、每个关卡的完成情况、线索同步标记。切换应用或刷新不应丢失。
4. 每个 targetCase 都要补 Playwright 端到端测试，包括“Dock → 微信 → 剧情 → 打开关卡 → 在虚拟浏览器/Reqable 中操作 → 成功提示 → 返回剧情继续”的完整链路。

## 参考资料
1. Cloudflare Blog，《Protecting customers from the compromised polyfill.io service》，2024-06-25。
2. Google Threat Analysis Group (TAG)，《Polyfill supply chain attack details》，2024-07-01。
3. Reqable 官方文档：https://reqable.com/docs/
4. Chrome DevTools 官方文档：https://developer.chrome.com/docs/devtools/
