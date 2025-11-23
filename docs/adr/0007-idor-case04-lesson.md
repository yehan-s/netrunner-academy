# ADR 0007：越权访问 (IDOR)（case_04）教学关卡

## 状态

Accepted（已采纳，待补 e2e 测试）

## 背景

case_04 模拟的是典型的 Insecure Direct Object Reference（IDOR）场景：订单详情接口通过 URL 中的数值 ID 区分用户订单，如果服务器端没有做权限校验，攻击者只需改动 ID 就可能访问其他用户的数据。根据项目原则，需要先基于 OWASP/MDN 等权威文档整理教学，再让关卡引导玩家用 Reqable/浏览器完成相同操作。

## 参考文档来源

- OWASP Insecure Direct Object Reference Prevention Cheat Sheet（https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html）——说明 IDOR 的定义和示例。
- MDN Security: IDOR（https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/IDOR）——说明攻击模型和缺失访问控制的危害。

## 决策

- 新增教学文档 `docs/lessons/idor-case04.md`，基于上述官方文档讲解：
  - 通过 URL 中的订单 ID 直接访问对象时，如果不做用户身份校验，就可能出现 IDOR；
  - 修改 `/orders/1001` 为 `/orders/1002` 的风险；
  - 正确防御方式：按当前登录用户的订单集合做查询，而不是信任客户端传入的 ID。
- 保留现有 case_04 的指南结构，但在教学中明确标注这是 IDOR 漏洞，并强调访问控制校验的重要性。
- 为 case_04 新增 Playwright e2e 测试，用 Reqable 模拟修改订单 ID 并验证关卡通关。

## 影响

- 玩家在游戏中理解的“改 URL ID 看别人订单”的攻击场景，与 OWASP/MDN 定义的 IDOR 完全一致。
- 教学同时强调服务器端访问控制的重要性，避免误导成“只教怎么绕过，而不讲怎么修”。

