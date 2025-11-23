# 越权访问 (IDOR)（case_04）教学

## 学习目标

- 理解 OWASP 所描述的 Insecure Direct Object Reference（IDOR）攻击：通过修改对象标识符（如订单 ID）访问他人数据。
- 学会在浏览器和 Reqable 中观察并修改订单 ID 请求，验证是否存在越权访问问题。
- 了解正确的防御方式：基于当前用户身份做访问控制，而不是单纯信任 URL 中的 ID。

## 前置知识

- 能使用浏览器访问订单详情页面并打开 DevTools Network 面板。
- 了解 RESTful 风格 URL 中 ID 段通常代表数据库主键或资源标识符。

## 步骤一：正常访问订单详情

1. 打开测试环境订单页面，例如 `https://shop.demo/orders/1001`。
2. 在 DevTools Network 面板中观察接口调用，如：`GET /api/orders/1001`。
3. 理解此时后端假设：当前登录用户拥有 ID 为 1001 的订单。

## 步骤二：在 Reqable 中修改订单 ID

1. 确保浏览器流量已通过 Reqable 代理，访问订单详情页面，捕获 `GET /api/orders/1001` 请求。
2. 将该请求发送到 Reqable 的 Compose/Composer 编辑器。
3. 仅修改 URL 中的订单 ID，将 `1001` 改为 `1002`，保持其它部分不变。

## 步骤三：重放请求并验证越权访问

1. 通过 Reqable 发送修改后的请求 `GET /api/orders/1002`。
2. 如果服务器没有做访问控制校验，你可能会看到另一个用户的订单信息，这是典型的 IDOR 漏洞。
3. 结合 OWASP Cheat Sheet，记住防御要点：
   - 服务器必须基于当前用户身份检查对象访问权限；
   - 不要仅凭客户端传来的 ID 决定返回哪个对象。

在游戏关卡中，当你成功通过修改 `/orders/1001` 为 `/orders/1002` 触发“任务完成”时，就相当于在一个受控环境中验证了 IDOR 漏洞的存在和危害。

