# 第三课：HTTP 协议深度分析

## HTTP 请求结构

### 完整的 HTTP 请求示例

```http
POST /api/login HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
User-Agent: Mozilla/5.0
Accept: application/json

{"username":"alice","password":"secret123"}
```

**结构分解**:

```
┌─ 请求行 ─────────────────────────────────┐
│ POST /api/login HTTP/1.1                │  ← 方法 路径 协议版本
├─ 请求头 ─────────────────────────────────┤
│ Host: api.example.com                   │  ← 目标服务器
│ Content-Type: application/json          │  ← 数据格式
│ Authorization: Bearer ...               │  ← 身份认证
│ User-Agent: Mozilla/5.0                 │  ← 客户端标识
│ Accept: application/json                │  ← 期望的响应格式
├─ 空行 ───────────────────────────────────┤
│                                         │  ← 必须有空行分隔
├─ 请求体 ─────────────────────────────────┤
│ {"username":"alice","password":"..."}  │  ← 实际数据
└─────────────────────────────────────────┘
```

---

## HTTP 方法详解

### GET - 获取资源

**特点**:
- ✅ 参数在 URL 中（查询字符串）
- ✅ 可被缓存
- ✅ 可被收藏为书签
- ❌ 不应用于敏感数据（URL 会被记录）
- ❌ URL 长度有限制（约 2048 字符）

**示例**:
```http
GET /api/users?page=1&size=20&sort=desc HTTP/1.1
Host: api.example.com
```

**常见用途**:
- 获取用户列表
- 搜索功能
- 页面加载

### POST - 创建资源/提交数据

**特点**:
- ✅ 数据在请求体中，更安全
- ✅ 无长度限制
- ✅ 支持多种数据格式（JSON、表单、文件上传）
- ❌ 不可缓存
- ❌ 不可收藏

**示例**:
```http
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin"
}
```

**常见用途**:
- 用户注册/登录
- 提交表单
- 文件上传

### PUT - 完整更新资源

**特点**:
- ✅ 幂等性：多次执行结果相同
- ✅ 必须包含完整的资源数据

**示例**:
```http
PUT /api/users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "id": 123,
  "name": "Alice Updated",
  "email": "alice_new@example.com",
  "role": "admin",
  "status": "active"
}
```

### PATCH - 部分更新资源

**特点**:
- ✅ 只需发送要修改的字段
- ✅ 节省带宽

**示例**:
```http
PATCH /api/users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "email": "alice_new@example.com"
}
```

### DELETE - 删除资源

**示例**:
```http
DELETE /api/users/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer token123
```

---

## HTTP 响应结构

### 完整的 HTTP 响应示例

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 1234
Set-Cookie: session_id=abc123; Path=/; HttpOnly
Cache-Control: max-age=3600
Access-Control-Allow-Origin: *

{
  "status": "success",
  "data": {
    "id": 123,
    "name": "Alice"
  }
}
```

**结构分解**:

```
┌─ 状态行 ─────────────────────────────────┐
│ HTTP/1.1 200 OK                         │  ← 协议版本 状态码 状态描述
├─ 响应头 ─────────────────────────────────┤
│ Content-Type: application/json          │  ← 响应数据格式
│ Content-Length: 1234                    │  ← 响应体长度
│ Set-Cookie: session_id=abc123           │  ← 设置 Cookie
│ Cache-Control: max-age=3600             │  ← 缓存策略
├─ 空行 ───────────────────────────────────┤
│                                         │
├─ 响应体 ─────────────────────────────────┤
│ {"status":"success","data":{...}}      │  ← 实际数据
└─────────────────────────────────────────┘
```

---

## 状态码详解

### 2xx 成功

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| `200 OK` | 请求成功 | GET/POST/PUT 成功 |
| `201 Created` | 资源已创建 | POST 创建新用户 |
| `204 No Content` | 成功但无返回内容 | DELETE 成功 |

### 3xx 重定向

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| `301 Moved Permanently` | 永久重定向 | 域名迁移 |
| `302 Found` | 临时重定向 | 登录后跳转 |
| `304 Not Modified` | 缓存有效 | 浏览器缓存 |

### 4xx 客户端错误

| 状态码 | 说明 | 常见原因 |
|--------|------|----------|
| `400 Bad Request` | 请求格式错误 | JSON 格式错误 |
| `401 Unauthorized` | 未授权 | 未登录 |
| `403 Forbidden` | 禁止访问 | 权限不足 |
| `404 Not Found` | 资源不存在 | URL 错误 |
| `405 Method Not Allowed` | 方法不允许 | GET 请求到只支持 POST 的接口 |
| `429 Too Many Requests` | 请求过多 | 触发限流 |

### 5xx 服务器错误

| 状态码 | 说明 | 常见原因 |
|--------|------|----------|
| `500 Internal Server Error` | 服务器内部错误 | 后端代码 bug |
| `502 Bad Gateway` | 网关错误 | 后端服务挂了 |
| `503 Service Unavailable` | 服务不可用 | 服务器维护 |
| `504 Gateway Timeout` | 网关超时 | 后端响应太慢 |

---

## 重要的 HTTP Headers

### 请求头

#### Content-Type（指定请求体格式）

```
Content-Type: application/json
Content-Type: application/x-www-form-urlencoded
Content-Type: multipart/form-data
Content-Type: text/plain
```

**示例对比**:

**JSON 格式** (推荐用于 API):
```http
POST /api/login HTTP/1.1
Content-Type: application/json

{"username":"alice","password":"123"}
```

**表单格式** (传统网页表单):
```http
POST /api/login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=alice&password=123
```

**文件上传**:
```http
POST /api/upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

(二进制文件数据)
------WebKitFormBoundary--
```

#### Authorization（身份认证）

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

**Bearer Token（最常见）**:
```http
GET /api/user/profile HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

**Basic Auth（不推荐，不安全）**:
```
用户名:密码 → Base64 编码 → 放在 Header
username:password → dXNlcm5hbWU6cGFzc3dvcmQ=
```

#### User-Agent（客户端标识）

```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
User-Agent: curl/7.68.0
User-Agent: MyApp/1.0.0 (iPhone; iOS 14.5)
```

**作用**:
- 服务器识别客户端类型（浏览器、手机、爬虫）
- 反爬虫检测（缺少 User-Agent 会被拦截）

#### Referer（来源页面）

```
Referer: https://www.example.com/page1
```

**作用**:
- 防盗链（图片/视频防止外站引用）
- 统计分析（用户从哪个页面跳转过来）

### 响应头

#### Set-Cookie（设置 Cookie）

```
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure
Set-Cookie: user_pref=dark_mode; Max-Age=31536000
```

**参数说明**:
- `HttpOnly` - 禁止 JavaScript 访问（防 XSS）
- `Secure` - 仅 HTTPS 传输
- `Max-Age` - 过期时间（秒）
- `Path` - 生效路径
- `Domain` - 生效域名

#### Cache-Control（缓存控制）

```
Cache-Control: max-age=3600              # 缓存 1 小时
Cache-Control: no-cache                  # 每次验证
Cache-Control: no-store                  # 禁止缓存
Cache-Control: public, max-age=31536000  # 公共缓存 1 年
```

#### Access-Control-Allow-Origin（跨域）

```
Access-Control-Allow-Origin: *                      # 允许所有域
Access-Control-Allow-Origin: https://app.example.com  # 指定域
```

**CORS 跨域请求完整示例**:

**预检请求（OPTIONS）**:
```http
OPTIONS /api/data HTTP/1.1
Host: api.example.com
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

**服务器响应**:
```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

---

## 实战分析案例

### 案例 1：分析登录流程

**第一步：发送登录请求**
```http
POST /api/login HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"username":"alice","password":"secret123"}
```

**第二步：服务器返回 Token**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session_id=abc123; HttpOnly

{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**第三步：后续请求携带 Token**
```http
GET /api/user/profile HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**安全问题检查清单**:
- ✅ 使用 HTTPS（否则密码明文传输）
- ✅ Token 有过期时间
- ✅ Cookie 设置 HttpOnly（防 XSS）
- ✅ Cookie 设置 Secure（仅 HTTPS）

### 案例 2：分析分页请求

**请求**:
```http
GET /api/users?page=2&size=20&sort=created_at&order=desc HTTP/1.1
Host: api.example.com
```

**响应**:
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Total-Count: 156
X-Page-Count: 8

{
  "data": [...],
  "pagination": {
    "current_page": 2,
    "per_page": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

**分析**:
- `X-Total-Count` 响应头告诉前端总数
- 分页参数在 URL 查询字符串中
- 响应体包含当前页数据 + 分页元信息

---

## 实战练习

### 练习 1：修复 Content-Type 错误

**场景**: 后端 API 只接受 JSON，但你发送了表单数据

**错误请求**:
```http
POST /api/login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=alice&password=123
```

**错误响应**:
```http
HTTP/1.1 400 Bad Request

{"error": "Invalid JSON format"}
```

**正确请求**:
```http
POST /api/login HTTP/1.1
Content-Type: application/json

{"username":"alice","password":"123"}
```

### 练习 2：解码 Base64 Authorization

**任务**: 解码以下 Basic Auth 头

```
Authorization: Basic YWxpY2U6c2VjcmV0MTIz
```

**步骤**:
1. 提取 Base64 部分: `YWxpY2U6c2VjcmV0MTIz`
2. Base64 解码
3. 得到: `alice:secret123`

**在 Reqable 中验证**:
- 右键请求 → 复制 → 查看 Headers
- 或使用在线工具: https://www.base64decode.org/

### 练习 3：分析重定向链

**任务**: 访问 `http://example.com`，观察重定向过程

**预期抓包结果**:
```
1. GET http://example.com
   → 301 Moved Permanently
   Location: https://example.com

2. GET https://example.com
   → 301 Moved Permanently
   Location: https://www.example.com

3. GET https://www.example.com
   → 200 OK
```

---

## 小结

✅ 你已经掌握:
- HTTP 请求/响应的完整结构
- 各种 HTTP 方法的使用场景
- 状态码的含义
- 关键 HTTP Headers 的作用

下一课:
- 📘 [第四课：高级过滤与搜索技巧](./04-advanced-filtering.md)
- 📘 [第五课：流量拦截与修改](./05-breakpoint-and-modification.md)
