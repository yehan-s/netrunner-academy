# 第二课：Reqable 快速入门

## Reqable 界面概览

Reqable 是一款现代化的 HTTP 抓包工具，界面简洁高效。

### 主界面布局

```
┌─────────────────────────────────────────────────────┐
│ [代理状态] Proxying on 127.0.0.1:8888     [停止]   │  ← 顶部栏
├─────────────────────────────────────────────────────┤
│ 调试(125) | 我的收藏 | 未命名              [+]     │  ← 标签页
├─────────────────────────────────────────────────────┤
│ All | Http | Https | JSON | XML | ...     [搜索]   │  ← 过滤器
├──────────────────┬──────────────────────────────────┤
│  请求列表        │          详情面板                │
│                  │  ┌──────────────────────────┐    │
│  #  方法   URL   │  │ 请求详情                  │    │
│  1  GET    /api  │  │ URL: https://...         │    │
│  2  POST   /auth │  │ Method: GET              │    │
│  ...             │  │ Status: 200 OK           │    │
│                  │  └──────────────────────────┘    │
│                  │  ┌──────────────────────────┐    │
│                  │  │ 响应详情                  │    │
│                  │  │ HTTP/2 200               │    │
│                  │  │ content-type: json       │    │
│                  │  └──────────────────────────┘    │
└──────────────────┴──────────────────────────────────┘
│ 共 125/128 项 (选择 1 项)            代理运行中 ●  │  ← 状态栏
└─────────────────────────────────────────────────────┘
```

---

## 基础操作

### 1. 启动/停止抓包

**快捷键**: `Ctrl/Cmd + R`

```
🟢 开始  → 开始记录网络流量
🔴 停止  → 暂停记录（已捕获的流量保留）
```

**使用技巧**:
- 访问目标网站前先点"停止"
- 清空列表（垃圾桶图标）
- 点"开始"，然后操作目标
- 抓到关键请求后点"停止"，避免无关流量干扰

### 2. 查看请求详情

**点击请求列表中的任意一行** → 右侧显示详情

#### 请求（上半部分）

标签页：
- **Overview（总览）** - 请求的基本信息
  ```
  URL: https://api.example.com/users/123
  Method: GET
  Protocol: h2 (HTTP/2)
  Status: 200 OK
  ```

- **Primitive（原始）** - 完整的 HTTP 原始报文
  ```http
  GET /users/123 HTTP/2
  Host: api.example.com
  User-Agent: Mozilla/5.0
  Accept: application/json
  ```

- **Params（参数）** - URL 查询参数表格
  ```
  page  = 1
  size  = 20
  sort  = desc
  ```

- **Headers（请求头）** - 键值对展示
  ```
  Content-Type: application/json
  Authorization: Bearer eyJhbGc...
  ```

- **Body（请求体）** - POST/PUT 的数据
  ```json
  {
    "username": "alice",
    "password": "******"
  }
  ```

#### 响应（下半部分）

标签页：
- **Primitive（原始）** - HTTP 响应原始报文
  ```http
  HTTP/2 200
  content-type: application/json

  {"status": "success", "data": {...}}
  ```

- **Headers（响应头）**
  ```
  Content-Type: application/json
  Set-Cookie: session_id=abc123
  Cache-Control: max-age=3600
  ```

- **Body（响应体）** - 自动格式化 JSON/XML
  ```json
  {
    "status": "success",
    "data": {
      "id": 123,
      "name": "Alice"
    }
  }
  ```

---

## 过滤器使用

### 内容类型过滤

```
All      - 显示所有请求
Http     - 只显示 HTTP 请求
Https    - 只显示 HTTPS 请求
JSON     - 只显示 JSON 响应
XML      - 只显示 XML 响应
HTML     - 只显示 HTML 页面
图片     - 只显示图片资源
```

**实战场景**:
- 调试 API → 选择 **JSON**
- 爬虫开发 → 选择 **HTML**
- 性能分析 → 选择 **图片** 查看图片加载

### 搜索功能

在搜索框输入关键词可以过滤：
- URL 路径: `login`
- 域名: `api.example.com`
- 方法: `POST`

**技巧**:
```
login          → 找到所有包含 "login" 的请求
api.example    → 找到特定域名的请求
POST           → 找到所有 POST 请求
```

---

## 常用快捷操作

### 右键菜单

在请求列表中**右键点击**任意请求：

- **在 Composer 中编辑** - 复制请求到编辑器修改后重发
- **添加到收藏** - 标记常用的请求
- **复制 URL** - 复制完整链接
- **复制为 cURL** - 生成命令行命令
  ```bash
  curl -X POST 'https://api.example.com/login' \
    -H 'Content-Type: application/json' \
    -d '{"username":"alice","password":"123456"}'
  ```

### 双击操作

**双击请求行** → 自动跳转到 Composer 编辑器

---

## Composer（请求构造器）

### 什么是 Composer？

手动构造和发送 HTTP 请求的工具，类似 Postman。

### 基本使用

1. 点击左侧栏 **Composer** 图标
2. 选择 **HTTP 方法**: GET / POST / PUT / DELETE
3. 输入 **URL**: `https://api.example.com/users`
4. 设置 **Headers**（可选）:
   ```
   Content-Type: application/json
   Authorization: Bearer token123
   ```
5. 填写 **Body**（POST/PUT）:
   ```json
   {
     "name": "Alice",
     "email": "alice@example.com"
   }
   ```
6. 点击 **发送**
7. 查看 **Response** 标签页的响应结果

### 实战案例：测试登录接口

```
Method: POST
URL: https://api.example.com/login
Headers:
  Content-Type: application/json
Body:
  {
    "username": "test",
    "password": "123456"
  }
```

点击发送后，在 Response 查看：
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 实战练习

### 练习 1：捕获登录请求

**目标**: 抓取网站登录时的 HTTP 请求

**步骤**:
1. 打开 Reqable，点击"开始"
2. 打开目标网站的登录页面
3. 输入用户名密码，点击登录
4. 在 Reqable 中找到 `/login` 或 `/auth` 请求
5. 查看请求体中是否包含明文密码（安全问题！）

**问题**:
- 密码是明文还是加密传输？
- 返回的 Token 存储在哪里？（Cookie？响应体？）

### 练习 2：使用过滤器

**任务**: 访问一个新闻网站，只查看 API 请求

**步骤**:
1. 打开 Reqable，清空列表
2. 访问 `https://news.ycombinator.com`
3. 点击过滤器 → 选择 **JSON**
4. 观察有哪些 API 调用

### 练习 3：重放请求

**任务**: 修改搜索参数后重新发送请求

**步骤**:
1. 访问某个网站的搜索页面
2. 在 Reqable 中找到搜索请求（通常包含 `?q=` 参数）
3. 双击该请求，进入 Composer
4. 修改 URL 中的搜索关键词
5. 点击"发送"，查看新的搜索结果

---

## 小结

✅ 你已经学会：
- Reqable 界面布局和基本操作
- 如何查看请求/响应详情
- 使用过滤器快速定位请求
- 用 Composer 手动构造请求

下一课将深入学习：
- 📘 [第三课：HTTP 协议深度分析](./03-http-protocol-analysis.md)
- 📘 [第四课：高级过滤技巧](./04-advanced-filtering.md)

---

## 常见问题

### Q: 为什么看不到任何流量？
**A**: 检查：
1. 是否点击了"开始"按钮
2. 系统代理是否设置为 `127.0.0.1:8888`
3. 目标应用是否支持系统代理

### Q: 抓包后列表太多怎么办？
**A**: 使用过滤器和搜索功能：
- 过滤器选择 `JSON` 只看 API
- 搜索框输入域名或路径关键词

### Q: 如何保存抓包记录？
**A**: Reqable 支持导出会话（HAR 格式），可用于分享或后续分析
