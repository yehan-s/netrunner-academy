# 第八课：真实场景调试案例

## 前言

本课汇集开发者日常遇到的真实调试场景，展示如何用抓包工具快速定位和解决问题。

**核心思路**：

```
问题 → 抓包 → 分析 → 定位 → 解决
```

---

## 场景 1：登录失败排查

### 问题描述

用户反馈："输入正确的用户名密码，但登录一直失败"

### 抓包分析

**步骤 1：捕获登录请求**

```http
POST /api/auth/login HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"username": "alice", "password": "Test@123"}
```

**步骤 2：检查响应**

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": "invalid_credentials", "message": "用户名或密码错误"}
```

**步骤 3：深入分析**

检查请求头，发现：

```http
Content-Type: application/x-www-form-urlencoded  ← 错误！
```

后端期望 `application/json`，但前端发送了表单格式。

### 解决方案

```javascript
// 错误写法
fetch('/api/auth/login', {
  method: 'POST',
  body: 'username=alice&password=Test@123'  // 表单格式
});

// 正确写法
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({username: 'alice', password: 'Test@123'})
});
```

---

## 场景 2：接口 CORS 跨域问题

### 问题描述

前端调用 API 时，浏览器控制台显示：

```
Access to fetch at 'https://api.example.com/data'
from origin 'https://www.example.com'
has been blocked by CORS policy
```

### 抓包分析

**步骤 1：找到预检请求（OPTIONS）**

```http
OPTIONS /api/data HTTP/1.1
Host: api.example.com
Origin: https://www.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

**步骤 2：检查响应**

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://api.example.com  ← 错误！
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type
```

**问题定位**：

- `Access-Control-Allow-Origin` 配置错误（应该是前端域名）
- 缺少 `Authorization` 在 `Allow-Headers` 中

### 解决方案

**后端配置（以 Node.js Express 为例）**：

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.example.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

---

## 场景 3：分页数据不正确

### 问题描述

商品列表分页显示异常：第 2 页和第 1 页显示相同内容。

### 抓包分析

**第 1 页请求**：

```http
GET /api/products?page=1&size=20 HTTP/1.1

响应:
{
  "data": [{"id": 1}, {"id": 2}, ...{"id": 20}],
  "total": 100,
  "page": 1
}
```

**第 2 页请求**：

```http
GET /api/products?page=1&size=20 HTTP/1.1  ← page 仍然是 1！

响应:
{
  "data": [{"id": 1}, {"id": 2}, ...{"id": 20}],  ← 相同数据
  "total": 100,
  "page": 1
}
```

**问题定位**：前端分页组件未正确传递 `page` 参数。

### 解决方案

```javascript
// 错误写法：硬编码 page=1
const fetchProducts = async () => {
  const response = await fetch('/api/products?page=1&size=20');
  // ...
};

// 正确写法：使用动态 page 值
const fetchProducts = async (page = 1) => {
  const response = await fetch(`/api/products?page=${page}&size=20`);
  // ...
};
```

---

## 场景 4：文件上传失败

### 问题描述

用户上传头像时，服务器返回 400 Bad Request。

### 抓包分析

**步骤 1：检查请求**

```http
POST /api/upload/avatar HTTP/1.1
Content-Type: application/json  ← 错误！

{"file": "data:image/png;base64,iVBORw0KGgo..."}
```

**问题 1**：文件上传应使用 `multipart/form-data`，而非 JSON。

**步骤 2：修复后重试**

```http
POST /api/upload/avatar HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="avatar"; filename="photo.png"
Content-Type: image/png

(二进制数据)
------WebKitFormBoundary--
```

**响应**：

```http
HTTP/1.1 413 Payload Too Large
{"error": "File size exceeds limit (2MB)"}
```

**问题 2**：文件超过大小限制。

### 解决方案

```javascript
// 前端：压缩图片再上传
const compressImage = (file, maxSize = 2 * 1024 * 1024) => {
  // 使用 canvas 压缩
  // ...
};

// 前端：使用正确的 Content-Type
const formData = new FormData();
formData.append('avatar', file);

fetch('/api/upload/avatar', {
  method: 'POST',
  body: formData  // 浏览器自动设置正确的 Content-Type
});
```

---

## 场景 5：Token 过期处理

### 问题描述

用户使用一段时间后，所有 API 请求突然返回 401。

### 抓包分析

**请求**：

```http
GET /api/user/profile HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**：

```http
HTTP/1.1 401 Unauthorized
{
  "error": "token_expired",
  "message": "Token has expired",
  "expired_at": "2024-01-15T10:00:00Z"
}
```

**问题定位**：JWT Token 过期，前端未处理刷新逻辑。

### 解决方案

**方案 1：Token 刷新机制**

```javascript
// 响应拦截器
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 &&
        error.response?.data?.error === 'token_expired') {
      // 刷新 Token
      const newToken = await refreshToken();
      // 重试原请求
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

**方案 2：滑动过期**

```javascript
// 每次请求成功后，检查 Token 剩余时间
// 如果不足 10 分钟，静默刷新
```

---

## 场景 6：接口响应慢

### 问题描述

商品详情页加载需要 5 秒以上。

### 抓包分析

**步骤 1：查看请求耗时**

在 Reqable 中查看 Time 列：

```
GET /api/product/123           ← 200ms ✅
GET /api/product/123/reviews   ← 4500ms ❌ 慢！
GET /api/product/123/related   ← 300ms ✅
```

**步骤 2：分析慢请求**

```http
GET /api/product/123/reviews HTTP/1.1

响应:
{
  "reviews": [...],  // 包含 1000 条评论
  "total": 5000
}
```

**问题定位**：评论接口返回了过多数据。

### 解决方案

**方案 1：分页加载**

```http
GET /api/product/123/reviews?page=1&size=10
```

**方案 2：后端优化**

- 添加数据库索引
- 使用缓存（Redis）
- 异步加载（先返回商品，再加载评论）

**方案 3：前端优化**

```javascript
// 并行请求代替串行
const [product, reviews, related] = await Promise.all([
  fetch('/api/product/123'),
  fetch('/api/product/123/reviews?size=10'),
  fetch('/api/product/123/related')
]);
```

---

## 场景 7：移动端 App 调试

### 问题描述

iOS App 无法获取用户数据，但 Web 端正常。

### 抓包分析

**步骤 1：配置手机代理**

- iPhone 设置 → Wi-Fi → 配置代理 → 手动
- 服务器：电脑 IP，端口：8888

**步骤 2：捕获 App 请求**

```http
GET /api/v2/user/profile HTTP/1.1
Host: api.example.com
User-Agent: MyApp/1.0 (iPhone; iOS 17.0)
Authorization: Bearer mobile_token_xxx
```

**响应**：

```http
HTTP/1.1 200 OK
{
  "id": 1001,
  "name": "Alice",
  "avatar": "http://cdn.example.com/avatar.jpg"  ← HTTP！
}
```

**步骤 3：发现问题**

App 在 iOS 14+ 上默认阻止 HTTP 请求（ATS - App Transport Security）。

头像 URL 使用了 HTTP 而非 HTTPS。

### 解决方案

**方案 1：后端修复**

```json
{
  "avatar": "https://cdn.example.com/avatar.jpg"
}
```

**方案 2：App 端临时解决（不推荐）**

```xml
<!-- Info.plist -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

---

## 场景 8：WebSocket 连接问题

### 问题描述

实时聊天功能连接不稳定，频繁断开。

### 抓包分析

**步骤 1：捕获 WebSocket 握手**

```http
GET /ws/chat HTTP/1.1
Host: api.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
```

**响应**：

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

**步骤 2：观察消息**

```
[发送] {"type": "ping"}
[接收] {"type": "pong"}
[发送] {"type": "ping"}
[超时] 无响应
[断开] Connection closed
```

**问题定位**：心跳超时导致连接断开。

### 解决方案

```javascript
// 客户端：缩短心跳间隔
const heartbeat = () => {
  ws.send(JSON.stringify({type: 'ping'}));
  setTimeout(heartbeat, 15000);  // 15 秒一次心跳
};

// 服务端：设置超时时间
ws.on('connection', (socket) => {
  socket.isAlive = true;
  socket.on('pong', () => { socket.isAlive = true; });
});

// 每 30 秒检查连接
setInterval(() => {
  wss.clients.forEach((socket) => {
    if (!socket.isAlive) return socket.terminate();
    socket.isAlive = false;
    socket.ping();
  });
}, 30000);
```

---

## 场景 9：缓存问题排查

### 问题描述

更新了用户资料，但刷新页面后显示旧数据。

### 抓包分析

**第一次请求**：

```http
GET /api/user/profile HTTP/1.1

响应:
HTTP/1.1 200 OK
Cache-Control: max-age=3600  ← 缓存 1 小时
ETag: "abc123"

{"name": "Alice"}
```

**第二次请求（更新后）**：

```http
GET /api/user/profile HTTP/1.1
If-None-Match: "abc123"

响应:
HTTP/1.1 304 Not Modified  ← 使用缓存！
```

**问题定位**：浏览器缓存了旧数据，ETag 未更新。

### 解决方案

**方案 1：更新后清除缓存**

```javascript
// 更新资料后强制获取最新数据
await fetch('/api/user/profile', {
  headers: { 'Cache-Control': 'no-cache' }
});
```

**方案 2：后端正确设置缓存头**

```http
Cache-Control: no-cache, must-revalidate
```

**方案 3：使用时间戳或版本号**

```javascript
fetch(`/api/user/profile?v=${Date.now()}`);
```

---

## 场景 10：第三方 API 集成问题

### 问题描述

调用支付接口返回签名验证失败。

### 抓包分析

**请求**：

```http
POST /api/pay/create HTTP/1.1
Content-Type: application/json

{
  "order_id": "20240115001",
  "amount": 99.99,
  "timestamp": 1705305600,
  "sign": "a1b2c3d4e5f6..."
}
```

**响应**：

```http
HTTP/1.1 400 Bad Request
{"error": "invalid_signature", "message": "签名验证失败"}
```

**步骤：对比本地签名计算**

```
待签名字符串: order_id=20240115001&amount=99.99&timestamp=1705305600
本地计算签名: a1b2c3d4e5f6...
请求中签名:   a1b2c3d4e5f6...

看起来一样？检查细节：
amount 在请求中是 99.99（浮点数）
文档要求 amount 单位是"分"，应该是 9999（整数）
```

**问题定位**：金额单位错误，应为分而非元。

### 解决方案

```javascript
// 错误写法
const params = {
  order_id: '20240115001',
  amount: 99.99,  // 元
};

// 正确写法
const params = {
  order_id: '20240115001',
  amount: 9999,  // 分
};
```

---

## 调试技巧总结

### 快速定位问题的方法

```
1. 先看状态码
   - 4xx: 客户端问题（参数错误、权限不足）
   - 5xx: 服务端问题（后端 bug、服务挂了）

2. 再看响应体
   - 错误信息通常包含问题线索
   - error code 可以对照文档查询

3. 对比正常请求
   - 找一个成功的请求
   - 逐项对比 Headers、Body、参数

4. 检查时序
   - 请求顺序是否正确？
   - 是否有依赖的前置请求？
```

### 常见问题检查清单

```
□ Content-Type 是否正确？
□ Authorization Token 是否有效？
□ 请求参数格式是否符合文档？
□ URL 路径是否正确？
□ HTTP 方法是否正确？
□ 是否存在缓存问题？
□ 是否是 CORS 跨域问题？
□ 网络是否连通？
```

---

## 小结

✅ 你已经掌握：

- 登录、跨域、分页等常见问题的排查方法
- 文件上传、Token 刷新的最佳实践
- 性能问题的定位与优化
- 移动端、WebSocket、缓存问题的处理
- 第三方 API 集成的调试技巧

**核心理念**：

> "调试是找出代码为什么这样做，而不是为什么不那样做。"

---

## 课程总结

恭喜你完成了 **NetRunner 抓包教程** 全部 8 课！

### 学习回顾

| 课程 | 主题 | 核心技能 |
|------|------|----------|
| 第 1 课 | 抓包基础概念 | HTTP 协议、代理原理 |
| 第 2 课 | Reqable 快速入门 | 工具操作、界面熟悉 |
| 第 3 课 | HTTP 协议深度分析 | 方法、状态码、Headers |
| 第 4 课 | 高级过滤与搜索 | 快速定位目标请求 |
| 第 5 课 | 流量拦截与修改 | 断点、请求篡改 |
| 第 6 课 | HTTPS 证书配置 | 解密 HTTPS 流量 |
| 第 7 课 | 安全测试入门 | 漏洞发现与防护 |
| 第 8 课 | 真实场景案例 | 问题排查方法论 |

### 下一步学习建议

1. **多练习**：在自己的项目中实践抓包调试
2. **参加 CTF**：通过安全竞赛提升实战能力
3. **阅读文档**：深入学习 HTTP/2、WebSocket 等协议
4. **贡献开源**：参与 Reqable 等工具的开发和反馈

---

## 延伸阅读

- [HTTP 权威指南](https://www.oreilly.com/library/view/http-the-definitive/1565925092/)
- [Web 性能权威指南](https://hpbn.co/)
- [Reqable 官方文档](https://reqable.com/docs)
- [Chrome DevTools 文档](https://developer.chrome.com/docs/devtools/)

---

**感谢学习！祝你在网络调试和安全领域不断进步！** 🚀
