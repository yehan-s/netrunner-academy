# ADR 0004：Reqable HTTP 抓包与 Composer 基础教学关卡

## 状态

Accepted（已采纳，待后续扩展更多关卡）

## 背景

现有 case_01 关卡已经围绕“登录 API 故障 + 抓包 + 构造请求”设计，但教学文档不够系统，也没有明确与 Reqable 官方文档对齐。根据项目原则：必须先有基于最新官方文档的教学内容，再有对应关卡，且关卡应帮助玩家在真实 Reqable 中可以“如法炮制”。

## 参考文档来源

- Reqable 官方文档：Compose 功能说明（https://reqable.com/en-US/docs/capture/compose/），用于指导“从流量列表发送到 Composer 并编辑请求”操作。
- Chrome DevTools 官方文档：Network 面板教程（https://developer.chrome.com/docs/devtools/network），用于讲解浏览器内基础网络请求观察方法。

## 决策

- 为 Reqable 抓包与 Composer 的初级使用，新增一份教学文档 `docs/lessons/reqable-http-compose-basics.md`，内容基于上述官方文档提炼，覆盖：
  - 使用 Chrome DevTools Network 面板确认请求是否发出、状态码及基本信息；
  - 在 Reqable 中从流量列表选择记录，右键/快捷键发送到 Composer；
  - 在 Composer 中编辑 Method、URL、Headers、Body 并重新发送请求。
- 将现有 case_01 的引导文案对齐该教学文档的步骤顺序，确保“文档先教，关卡后练”，避免关卡出现未教学的操作。

## 影响

- 玩家完成本关后，应能在真实 Reqable 与 Chrome DevTools 中完成同样的抓包与构造请求流程。
- 后续所有与 Reqable/Chrome 相关的关卡都必须先有对应官方文档驱动的教学文档，再添加或修改关卡逻辑。

