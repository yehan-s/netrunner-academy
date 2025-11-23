# 逻辑漏洞：价格篡改（case_02）教学

## 学习目标

- 理解 OWASP 所描述的 Web Parameter Tampering 攻击：通过修改客户端传给服务器的参数（如价格）来获取不当利益。
- 学会在 Reqable 的 Body 编辑器中修改 JSON 请求体中的价格字段，并重新发送请求。
- 能够通过 Chrome DevTools 和 Reqable 验证篡改前后的请求与响应差异。

## 前置知识

- 已掌握 Reqable 抓包与 Composer 的基础使用（见 `reqable-http-compose-basics` 教学）。
- 对 HTTP 请求结构有基本概念：URL、方法、Headers、Body。

## 步骤一：通过 Chrome DevTools 观察原始请求

1. 打开测试环境电商页面，使用 Chrome DevTools 的 **Network** 面板。
2. 点击“立即支付”，在 Network 列表中找到对应的支付请求，注意：
   - 请求方法通常为 `POST`；
   - 请求体中包含商品价格字段，例如 `price`。
3. 记住当前的价格值和返回的响应状态码（通常会是拒绝或错误状态）。

## 步骤二：在 Reqable 中捕获并编辑请求体

1. 确保浏览器流量已经通过 Reqable 代理，重复点击“立即支付”，在 Reqable 流量列表中找到相同请求。
2. 将该请求发送到 Reqable 的 Compose/Body 编辑器：
   - 确认 Content Type 为 `application/json`（参考 Reqable Body 官方文档中对 JSON 类型的描述）；
   - 在 Body 编辑区查看当前 JSON 请求体。
3. 将 `price` 字段修改为更低的金额（例如 1），保持 JSON 语法正确。

## 步骤三：重放请求并验证结果

1. 在 Reqable 中点击发送按钮重放修改后的请求。
2. 观察响应状态码和响应体：
   - 如果服务端对客户端价格缺乏校验，响应可能会变为成功，返回订单确认信息；
   - 这正是 Web Parameter Tampering 所描述的逻辑漏洞。
3. 返回 Chrome DevTools 验证新的请求和响应记录，确认价格确实被修改并被服务器接受。

通过本关，你应当能够将 OWASP Web Parameter Tampering 中的理论与 Reqable Body 编辑功能结合起来，识别并利用价格篡改类逻辑漏洞，同时也理解为什么**正确的修复方式是在服务端重新计算价格，而不是信任客户端传入的值**。

