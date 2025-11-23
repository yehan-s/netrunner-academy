# ADR 0005：逻辑漏洞 - 价格篡改（case_02）教学关卡

## 状态

Accepted（已采纳，待完善测试）

## 背景

case_02 关卡描述了一个典型的“价格参数篡改”场景：后端信任前端提交的价格，导致用户可以以 1 元买下昂贵商品。根据本项目原则，需要先基于权威安全文档和工具官方文档整理教学，再让关卡引导玩家在 Chrome DevTools + Reqable 中完成相同操作。

## 参考文档来源

- OWASP 官方文档：Web Parameter Tampering（https://owasp.org/www-community/attacks/Web_Parameter_Tampering），说明通过篡改客户端参数（包括价格）来攻击应用的通用原理。
- Reqable 官方 Body 编辑文档：Body（https://reqable.com/en-US/docs/rest/body/），说明如何在 Reqable 中编辑 JSON 请求体和 Content-Type 头。

## 决策

- 新增教学文档 `docs/lessons/price-tampering-case02.md`，基于上述两个官方来源，总结：
  - 价格篡改属于 Web Parameter Tampering 的一种，危害与成因；
  - 如何在 Reqable Compose/Body 编辑器中安全地修改 JSON 请求体；
  - 如何结合 Chrome DevTools 确认请求和响应行为变化。
- 对现有 case_02 的 `guideSteps` 做微调，使其执行顺序和术语与教学文档保持一致，不虚构 Reqable 功能。
- 为 case_02 后续添加 Playwright e2e 测试用例，验证通过 Reqable 模拟器篡改价格参数后关卡可以通关。

## 影响

- 玩家完成本关后，应能在真实 Reqable 中使用 JSON Body 编辑功能对请求参数进行控制，理解客户端参数篡改的风险。
- 教学内容与 OWASP 官方和 Reqable 官方文档保持一致，避免误导用户。

