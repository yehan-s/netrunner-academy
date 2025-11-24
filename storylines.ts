export interface StoryMessage {
  id: string;
  sender: '你' | '同事' | '安全负责人';
  channel: 'WeChat';
  text: string;
  targetCaseId?: string;
  requiresClueSync?: boolean;
  clueKey?: string;
}

export interface StoryThread {
  id: string;
  title: string;
  summary: string;
  intro: string;
  scenes: number;
  tags: string[];
  messages: StoryMessage[];
}

// 「周五晚高峰生产事故」长流程剧情示例（10+ 场景）
export const INCIDENT_STORY_THREAD: StoryThread = {
  id: 'wechat-incident-friday-night',
  title: '周五晚高峰 · 微信投放引发的连锁事故',
  summary:
    '一次看似成功的微信投放，把 CDN 缓存、TLS 兼容、WAF 白名单、特性开关和埋点问题全部炸了出来。这是一晚真实线上事故群的缩影。',
  intro:
    '真实事故群聊天记录，覆盖 CDN 缓存、参数篡改、SQL 注入、IDOR、监控误报、stacktrace 泄露、WAF 拦截等环节。所有任务都要用 Reqable/Chrome 完成，并把线索同步回群里。',
  scenes: 34,
  tags: ['CDN', '参数篡改', 'SQL 注入', 'IDOR', '埋点', 'Stacktrace', 'WAF'],
  messages: [
    {
      id: 'scene-01',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】在吗？我们刚开完周会准备下班，结果线上开始报警了，先别走，可能要麻烦你帮忙看下。',
    },
    {
      id: 'scene-02',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】监控这边看到 H5 落地页转化率从 19:02 开始断崖式下降，App 还好，主要是微信公众号和小程序的流量在掉。',
    },
    {
      id: 'scene-03',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】客服那边说，用户打开支付页经常卡在“加载中”，有的直接看到一行英文错误，具体看不太懂。',
    },
    {
      id: 'scene-04',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】先别慌，我这边先在桌面上模拟一笔 H5 流量，用开发者工具和代理看下前面到底挂在哪一层。',
    },
    {
      id: 'scene-05',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】刚刚合并了前端的改动，投放落地页走的是新域名，CDN 那边缓存规则刚调过一次，可能有影响。',
    },
    {
      id: 'scene-06',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】我看了一下，微信内置浏览器加载到的 JS 还是上周的老版本，估计是某个边缘节点没刷新，你们发版脚本有强制 purge 吗？',
    },
    {
      id: 'scene-07',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】先走临时止血：CDN 对这套静态资源做一次全量刷新，前端再确认版本号；你这边帮忙用抓包工具验证一下新 JS 是否按预期在加载。',
      targetCaseId: 'story_01_login_outage',
    },
    {
      id: 'scene-08',
      sender: '同事',
      channel: 'WeChat',
      text: '【私聊】刚才在群里没好意思说，发版脚本确实少了一个“强制刷新 CDN”的步骤，是我疏忽了，到时候复盘我会主动提。',
    },
    {
      id: 'scene-09',
      sender: '你',
      channel: 'WeChat',
      text: '【私聊】别太自责，先把现场稳住再说。发版流程问题都是系统性的，一起补上就好。',
    },
    {
      id: 'scene-10',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】另外补充一个，财务发了几笔异常订单过来，有用户以 0.01 元买走原价 299 的会员，怀疑有人在薅接口羊毛。',
    },
    {
      id: 'scene-11',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】这听起来像参数篡改。后端现在是不是直接信任前端传过来的 price？有没有在服务端根据商品 ID 再查一次单价？',
      targetCaseId: 'story_02_price_tampering',
    },
    {
      id: 'scene-12',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】我用代理抓了一笔支付请求，Body 里的 price 确实是前端算好的，后端只做了 `> 0` 校验，没有和商品原价比对。',
    },
    {
      id: 'scene-13',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】那这几笔“0.01 元买会员”的订单我们先标记为可疑，后续统一处理。你这边帮忙再多测几笔，确保问题路径搞清楚。',
    },
    {
      id: 'scene-14',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】搜索服务那边的监控也炸了，DB 节点 CPU 打满，慢查询日志刷屏，看着像在扫全表。',
      targetCaseId: 'story_03_sql_injection',
    },
    {
      id: 'scene-15',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】我复现了一下搜索接口，正常搜姓名只返回一条，换成一个比较奇怪的关键字后，URL 里多了一段 `\' OR \'1\'=\'1`，结果直接把整张员工表都列出来了。',
    },
    {
      id: 'scene-16',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】这已经是标准的 SQL 注入了。那段老代码应该还在用字符串拼接 SQL，我们后面得推动他们用参数化查询重写。',
    },
    {
      id: 'scene-17',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】客服又拉了一个新问题进来：有用户说在“订单详情”页里看到别人的名字和地址，截图都传给我们了。',
    },
    {
      id: 'scene-18',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】我看了下前端 URL，是 `/orders/1001` 这种形式，接口是 `GET /api/orders/1001`，没在请求里看到任何跟当前用户绑定的额外信息。',
    },
    {
      id: 'scene-19',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】这就是典型的 IDOR，只看 ID 不看权限。你在测试环境里抓一条自己的订单请求，改成别人的 ID 看看返回什么，确认一下风险级别。',
      targetCaseId: 'story_04_idor',
    },
    {
      id: 'scene-20',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】监控那边还有一个奇怪现象：我们看“下单成功率”图表几乎归零，但你这边抓的真实日志好像没那么惨，是不是埋点算错了？',
      targetCaseId: 'story_05_metrics_misleading',
    },
    {
      id: 'scene-21',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】查了一圈发现，埋点那边把“重试一次支付”也算成一次失败，图表夸大了问题。真实的失败率大概是平时的两倍，不是完全挂掉。',
    },
    {
      id: 'scene-22',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】怪不得产品刚才在群里说“是不是系统全跪了”，原来是图画得太吓人了。',
    },
    {
      id: 'scene-23',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】还有用户截图说页面上出现了一大段 SQL 报错，里面有内部表名和文件路径，看着像把异常栈直接吐给用户了。',
      targetCaseId: 'story_06_stacktrace_leak',
    },
    {
      id: 'scene-24a',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】支付团队说某些三方回调一直没到我们系统，排查后发现回调请求被 WAF 拦了，提示包含敏感字段。',
      targetCaseId: 'story_07_waf_callback',
    },
    {
      id: 'scene-24',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】这种“把 stacktrace 当提示语”的问题今晚修不完也得先记在账上，异常信息应该只出现在内部日志里，前端最多给个错误码和工单号。',
    },
    {
      id: 'scene-25',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】总结一下今晚：CDN 缓存漏刷、TLS 兼容问题、支付回调被 WAF 拦、价格参数被篡改、搜索 SQL 注入、订单 IDOR、埋点夸大错误、异常信息直出，基本能写一本“生产事故实录”了。',
    },
    {
      id: 'scene-26',
      sender: '你',
      channel: 'WeChat',
      text: '【私聊】现实比课堂上复杂太多了，中间各种沟通、甩锅、救火，好在日志和抓包还能帮我们还原真相。',
    },
    {
      id: 'scene-27',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【私聊】等这波稳下来，我们找个时间把你今晚用到的抓包技巧、排查顺序、临时止血方案和最终修复方案整理一下，写成团队自己的“线上事故应对手册”，以后新同事就不用踩同样的坑了。',
    },
    {
      id: 'scene-28',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】运营在观测面板里发现，A/B 实验 `wx-landing-ab` 突然把 5% 灰度推成了 100%，新版 JS 还在请求旧的 tracker 域名，微信内核直接把脚本拦了。',
    },
    {
      id: 'scene-28a',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】先在前端热补丁：用 Chrome DevTools Console 把 `featureFlags.forceLegacyFlow(true)`、`disablePromo(\'wx-landing-ab\')` 打进去，确保现场回退。抓到的输出记得同步到群里。',
      targetCaseId: 'story_incident_feature_flag_patch',
      requiresClueSync: true,
      clueKey: 'scene-28a',
    },
    {
      id: 'scene-28b',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】热补丁这活又落到我们手里了，我去把茶续上，顺便把 DevTools Console 拉到第二屏方便截图。',
    },
    {
      id: 'scene-29',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】Console 里已经把 legacy flow 拉回来了，旧版脚本重新加载，Reqable 也证实没有再去访问那个过期 tracker。截图我贴在群公告，方便运营复核。',
    },
    {
      id: 'scene-29a',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】Ops 那边提醒：灰度平台还在认为我们处于“实验进行中”，得用内部 API 强制 disable，不然凌晨重启服务又会推回新脚本。用 Reqable Composer 调 `POST https://ops.corp/api/gray-release/override`，把 `wechat-ab-992` 关掉并回报给群里。',
      targetCaseId: 'story_incident_gray_release',
      requiresClueSync: true,
      clueKey: 'scene-29a',
    },
    {
      id: 'scene-29b',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】API token 已经放到群文件，记得用 Reqable 加 `X-OPS-Token`。我顺手把执行脚本记在 runbook 里，免得每次都现写。',
    },
    {
      id: 'scene-29c',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】灰度 override 返回 `{"status":"ok","rollout":"disabled"}`，刷新页面后还是 legacy JS。我同步在线索面板里，待会儿把脚本交给值班 Ops。',
    },
  ],
};

export const POLYFILL_SUPPLY_CHAIN_THREAD: StoryThread = {
  id: 'wechat-polyfill-nightshift',
  title: 'Polyfill 供应链夜班',
  summary:
    'polyfill.io 被接管后，我们的微信投放落地页也遭殃。剧情覆盖抓包、TLS 兼容、临时规则止血、CDN 验证、线索同步与复盘。',
  intro:
    '依据 Cloudflare 与 Google TAG 2024 公告改编。剧情共 12 条消息，穿插群聊与私聊，强调“先教再考”：每个任务都要先在 Lesson 中掌握操作，再在剧情里落地并把线索通过微信回传。',
  scenes: 12,
  tags: ['polyfill', 'JS 逆向', 'Reqable', 'TLS', 'CDN'],
  messages: [
    {
      id: 'scene-30',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】Cloudflare 刚发公告：polyfill.io 域名被接管。我们今晚上线的微信 H5 也引用它，全员待命别下线。',
    },
    {
      id: 'scene-30b',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】我刚把啤酒打开准备周五小聚，结果报警一堆，大家把 Happy Hour 先收一收，回到电脑前。',
    },
    {
      id: 'scene-31',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】北京地区用户反映扫码后跳出奇怪英文，Chrome 小分队怀疑 JS 被篡改。',
    },
    {
      id: 'scene-31b',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】先别怪运营，截图和日志先留着，别让斗图把报警消息刷没了。',
    },
    {
      id: 'scene-32',
      sender: '你',
      channel: 'WeChat',
      text: '【私聊】确认下脚手架：polyfill 还没自托管，对吧？前端说没来得及，今晚先临时兜底。',
    },
    {
      id: 'scene-32b',
      sender: '同事',
      channel: 'WeChat',
      text: '【私聊】我茶都还没喝一口，Nginx 配置就排队到我笔记本上了，下次真得把自托管写进 checklist。',
    },
    {
      id: 'scene-32c',
      sender: '你',
      channel: 'WeChat',
      text: '【私聊】周末原本约了去怀柔徒步，现在改成徒步日志了，等这波过去再补假。',
    },
    {
      id: 'scene-33',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】你用 Reqable 接入微信内置浏览器，抓 `https://cdn.polyfill.io/v3/polyfill.min.js` 看有没有 `atob` / `analytics.polyfill` 之类 IOC，截图记得发群。',
      targetCaseId: 'story_polyfill_ioc_capture',
      requiresClueSync: true,
      clueKey: 'scene-33',
    },
    {
      id: 'scene-33a',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】抓包完记得把 pcap 丢证据盘，复盘要用，咖啡机如果没水了通知我去加。',
    },
    {
      id: 'scene-33b',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】夜宵点卤味还是麻辣烫？24 小时那家支持报销，我把下单链接放在群文件了。',
    },
    {
      id: 'scene-34',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】在 Reqable 里看到 polyfill 脚本会解码出一个 `fetch("https://analytics.polyfill.io/v1/collect")`，截图我放在群文件了，跟 Google TAG 公告一致。',
    },
    {
      id: 'scene-34a',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】截图和 IOC 对上了，辛苦。今晚的周报标题估计是《我们又在周五晚救火》。',
    },
    {
      id: 'scene-34b',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】等问题稳住我请大家去新开的台州菜馆，别老靠外卖撑夜班。',
    },
    {
      id: 'scene-35',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】监控还在爆 TLS 握手错误，老 Android 都挂。怀疑我们刚开的 force-h2 配置。帮忙排一下兼容问题。',
      targetCaseId: 'story_polyfill_tls_fallback',
      requiresClueSync: true,
      clueKey: 'scene-35',
    },
    {
      id: 'scene-35a',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】收到，我抓完 polyfill 顺手撸个自测脚本，Android 团队那边已经在群里 @ 了。',
    },
    {
      id: 'scene-36',
      sender: '你',
      channel: 'WeChat',
      text: '【私聊】我会把 TLS 兼容问题和 polyfill backdoor 分开同步，避免群里信息炸锅。',
    },
    {
      id: 'scene-37',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】force-h2 已回滚。你写一个 Reqable Scriptable Rule，先把恶意域名拦住，并把线索更新到事件速记。',
      targetCaseId: 'story_polyfill_reqable_rule',
      requiresClueSync: true,
      clueKey: 'scene-37',
    },
    {
      id: 'scene-37a',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】运营问临时拦截会不会误伤埋点，周末前能不能把脚本写进正式 SOP，别靠口口相传。',
    },
    {
      id: 'scene-37b',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】本来周末想去厦门看海，现在看的是日志海，下周补休记得一起申请。',
    },
    {
      id: 'scene-38',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】前端已经改成 self-host polyfill，但 CDN 节点缓存还没刷干净。帮忙刷新+抓包确认 200 和 Cache-Control。',
      targetCaseId: 'story_polyfill_cdn_validation',
      requiresClueSync: true,
      clueKey: 'scene-38',
    },
    {
      id: 'scene-38a',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】Purge 过程记得记在 OpsLog 里，顺便有人能给咖啡机续个水吗？',
    },
    {
      id: 'scene-38b',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】明天有人想去城南那家日料店吗？我可以先排队，给今晚值班的人买点慰问品。',
    },
    {
      id: 'scene-39',
      sender: '你',
      channel: 'WeChat',
      text: '【群聊】Chrome DevTools Coverage 里只剩我们自托管脚本，Sources 搜 `analytics.polyfill` 也搜不到了。我把截图挂在群公告。',
    },
    {
      id: 'scene-40',
      sender: '安全负责人',
      channel: 'WeChat',
      text: '【群聊】剧情模式里要保留线索备忘，localStorage 记得写 `polyfillIncident.status="Mitigated"`，并点“同步线索”再推进。',
    },
    {
      id: 'scene-40a',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】等恢复了去马路对面新开的烤串摊庆祝，我先把值班狗牌带上。',
    },
    {
      id: 'scene-41',
      sender: '同事',
      channel: 'WeChat',
      text: '【群聊】等你把剧情里的任务都通关，我们要开复盘会，把“从抓包到修复”的流程写进团队 playbook。退出剧情会清除状态，谨慎操作。',
    },
  ],
};

export const STORY_THREADS: StoryThread[] = [
  INCIDENT_STORY_THREAD,
  POLYFILL_SUPPLY_CHAIN_THREAD,
];
