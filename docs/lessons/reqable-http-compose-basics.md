# Reqable HTTP 抓包与 Composer 基础教学

## 学习目标

- 理解在 Chrome DevTools Network 面板中查看请求状态、类型、发起方等基础信息。
- 学会在 Reqable 中从流量列表选中请求并发送到 Composer（编辑器）。
- 能够在 Composer 中修改 URL、Headers、Body 后重新发送请求，观察服务器响应。

## 前置知识

- 已安装现代浏览器（推荐 Chrome），能打开 DevTools 并切换到 Network 面板。
- 已安装 Reqable，并按照官方指南配置好系统代理或抓包证书，使浏览器流量可以被 Reqable 捕获。

## 步骤一：在 Chrome 中确认请求发出

1. 打开目标页面（例如出问题的登录页）。
2. 打开 Chrome DevTools，切换到 **Network** 面板。
3. 确保 Network 面板是打开状态，然后点击页面中的“登录”按钮。
4. 在请求列表中找到对应的登录请求，关注以下信息：
   - **Status**：HTTP 状态码，例如 `200`、`403`、`500`。
   - **Type**：资源类型，一般是 `fetch` 或 `xhr`。
   - **Initiator**：谁触发了这个请求（脚本、点击操作等）。

这些概念与 Chrome DevTools 官方文档中对 Network 面板的介绍保持一致。

## 步骤二：在 Reqable 中找到同一个请求

1. 保证 Reqable 已经处于抓包状态（HTTP/S 代理已配置好）。
2. 在浏览器点击“登录”后，切换到 Reqable，找到刚才的登录请求：
   - 确认 URL、Method 与 Chrome 中看到的一致；
   - 检查 **Status** 与 **Size** 等字段。
3. 这一步的目标是建立“浏览器 Network 面板”与“Reqable 流量列表”之间的一一对应关系。

## 步骤三：使用 Compose 重新构造请求

根据 Reqable 官方 Compose 文档，支持在流量列表中选中一个请求，右键选择 **Compose**（或使用官方文档说明的快捷键）创建一个新的 API 会话，并自动导入：

- Method / 协议；
- Path 与查询参数；
- Headers；
- Body。

推荐练习流程：

1. 在流量列表中选中登录请求，使用“Compose”操作打开编辑器。
2. 在编辑器中检查自动导入的 Method、URL、Headers、Body 是否符合预期。
3. 根据关卡提示修改 Body 或 URL，例如更换接口路径或调整请求体字段。
4. 点击 Send 发送请求，观察 Response：
   - 检查状态码是否从错误变为成功；
   - 在 Body 中确认是否出现预期字段（如 token 或提示信息）。

完成以上步骤后，你应能在真实 Reqable 中复现本游戏关卡中的所有抓包与 API 构造操作。未来关卡会在此基础上引入更复杂的场景（重放攻击、签名参数逆向等），但基本操作流程保持一致。

