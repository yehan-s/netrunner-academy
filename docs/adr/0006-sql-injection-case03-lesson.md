# ADR 0006：SQL 注入基础（case_03）教学关卡

## 状态

Accepted（已采纳，待补测试）

## 背景

case_03 关卡模拟经典 SQL 注入场景：通过在搜索框中输入 `'<space>OR<space>'1'='1` 这类 payload，绕过原有筛选条件，获取更多数据。根据项目约束，必须先基于官方文档（OWASP）整理教学，再让关卡引导玩家用浏览器和抓包工具完成相同操作。

## 参考文档来源

- OWASP 官方文档：SQL Injection（https://owasp.org/www-community/attacks/SQL_Injection），说明 SQL 注入的原理、风险和典型 payload（例如 `OR 'a'='a'`）。

## 决策

- 新增教学文档 `docs/lessons/sql-injection-case03.md`，基于 OWASP SQL Injection 页面整理：
  - 动态拼接 SQL 语句 + 未验证输入的危险性；
  - `' OR '1'='1` 这类 payload 如何把 WHERE 子句变成永真表达式；
  - 正确防御方向（参数化查询而不是字符串拼接）。
- 对现有 case_03 的 `guideSteps` 做轻微补充，让文案明确提到“SQL 注入”和“WHERE 条件被永真化”的概念。
- 后续为 case_03 添加 Playwright e2e 测试，用真实 UI/Reqable 模拟注入请求，并检查关卡通关。

## 影响

- 学员在游戏中掌握的攻击思路与 OWASP 文档一致，未来在真实环境中可以识别类似的搜索/登录接口注入风险。
- 教学内容强调防御思路，避免只停留在“如何打穿”的层面。

