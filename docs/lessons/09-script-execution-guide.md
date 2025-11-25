# 第9课：脚本执行功能使用指南

## 学习目标

完成本课后，你将能够：
1. 理解脚本规则的工作原理
2. 创建和管理脚本规则
3. 使用内置 API 修改请求和响应
4. 调试脚本执行问题

## 功能概述

脚本执行功能允许你在请求发送前或响应返回后执行自定义 JavaScript 代码，实现：
- 自动添加认证头
- 修改请求/响应体
- 记录调试信息
- 动态改变响应状态码

## 打开脚本编辑器

1. 切换到 **Reqable** 视图
2. 点击左侧边栏的 **Script** 图标 (代码图标)
3. 点击 **Manage Scripts** 按钮

## 创建脚本规则

### 基本配置

| 字段 | 说明 | 示例 |
|------|------|------|
| Rule Name | 规则名称 | "Add Auth Header" |
| URL Pattern | URL 匹配模式（支持 `*` 通配符） | `https://api.example.com/*` |
| Trigger On | 触发时机 | Request / Response / Both |
| Description | 描述（可选） | "为所有 API 请求添加认证" |
| Code | JavaScript 代码 | 见下文 |

### URL 模式匹配

```
https://api.example.com/*     匹配 api.example.com 下所有路径
https://*.example.com/api/*   匹配所有子域名的 /api/ 路径
*login*                       匹配包含 "login" 的所有 URL
```

## 内置 API 参考

### 日志输出

```javascript
console.log("普通日志");
console.info("信息日志");
console.warn("警告日志");
console.error("错误日志");
```

### 请求/响应头操作

```javascript
// 设置头
setHeader("Authorization", "Bearer your-token");
setHeader("X-Custom-Header", "value");

// 获取头
const auth = getHeader("Authorization");
console.log("Current auth:", auth);
```

### Body 操作

```javascript
// 获取当前 Body
const body = getBody();
console.log("Current body:", body);

// 设置新 Body
setBody(JSON.stringify({ modified: true }));
```

### 状态码操作

```javascript
// 设置响应状态码
setStatus(200, "OK");
setStatus(404, "Not Found");
setStatus(500, "Internal Server Error");
```

### 访问请求信息

```javascript
// request 对象包含完整请求信息
console.log("URL:", request.url);
console.log("Method:", request.method);
console.log("Headers:", request.requestHeaders);
console.log("Body:", request.requestBody);
```

## 示例脚本

### 1. 添加认证头

```javascript
// 为所有请求添加 Bearer Token
console.log("Adding auth token to request");
setHeader("Authorization", "Bearer test-token-12345");
```

**使用场景**: API 调试时自动注入认证信息

### 2. 修改响应数据

```javascript
// 替换响应体为 Mock 数据
console.log("Original body:", getBody());
const mockData = {
  success: true,
  message: "Modified by script",
  data: { id: 1, name: "Mock User" }
};
setBody(JSON.stringify(mockData));
```

**使用场景**: 前端开发时 Mock 后端响应

### 3. 记录请求详情

```javascript
// 详细记录请求信息用于调试
console.log("=== Request Details ===");
console.log("URL:", request.url);
console.log("Method:", request.method);
console.log("Headers:", JSON.stringify(request.requestHeaders, null, 2));
if (request.requestBody) {
  console.log("Body:", request.requestBody);
}
```

**使用场景**: 调试复杂请求流程

### 4. 修改响应状态码

```javascript
// 模拟服务器错误
console.log("Changing status to 500");
setStatus(500, "Internal Server Error");
setBody(JSON.stringify({ error: "Simulated server error" }));
```

**使用场景**: 测试前端错误处理逻辑

### 5. 条件修改

```javascript
// 根据请求路径执行不同逻辑
if (request.url.includes('/api/users')) {
  setHeader("X-User-Service", "true");
  console.log("Added user service header");
} else if (request.url.includes('/api/orders')) {
  setHeader("X-Order-Service", "true");
  console.log("Added order service header");
}
```

**使用场景**: 针对不同 API 执行不同处理

## 触发时机说明

| 类型 | 说明 | 典型用途 |
|------|------|----------|
| Request | 请求发送前触发 | 添加头、修改请求体 |
| Response | 响应返回后触发 | 修改响应、Mock 数据 |
| Both | 请求和响应都触发 | 完整的请求/响应处理 |

## 规则管理

### 启用/禁用规则

- 点击规则卡片上的 **Play** 按钮切换启用状态
- 禁用的规则不会执行

### 编辑规则

1. 点击规则卡片上的 **Edit** 按钮
2. 修改配置后点击 **Update Rule**

### 删除规则

- 点击 **Delete** 按钮，确认后删除

## 调试技巧

### 1. 善用 console.log

```javascript
console.log("Step 1: Getting original body");
const body = getBody();
console.log("Step 2: Body content:", body);
console.log("Step 3: Modifying...");
// ... 修改逻辑
console.log("Step 4: Done!");
```

### 2. 检查脚本执行日志

- 脚本执行结果会在 Scripting Console 面板显示
- 错误会以红色显示

### 3. 逐步验证

先用简单脚本验证规则匹配：

```javascript
console.log("Script triggered for:", request.url);
```

确认匹配正确后再添加复杂逻辑。

## 常见问题

### Q: 脚本没有执行？

检查：
1. URL 模式是否正确匹配目标请求
2. 规则是否已启用（显示 ENABLED 标签）
3. 触发类型是否正确（Request/Response/Both）

### Q: 修改没有生效？

检查：
1. `setHeader`/`setBody` 是否在正确的触发时机调用
2. Request 触发时只能修改请求，Response 触发时只能修改响应

### Q: 脚本报错？

- 查看 Console 中的错误信息
- 确保 JavaScript 语法正确
- 避免使用浏览器特定 API（如 `document`、`window`）

## 安全注意事项

⚠️ **重要提醒**:
- 脚本在沙盒环境中执行，但仍需谨慎
- 不要在脚本中硬编码真实的生产环境密钥
- 仅用于开发和测试目的

## 实践练习

### 练习 1: 添加自定义头
创建一个脚本，为所有 `/api/*` 请求添加 `X-Debug-Mode: true` 头。

### 练习 2: Mock 响应
创建一个脚本，将 `/api/user/profile` 的响应替换为自定义用户数据。

### 练习 3: 请求日志
创建一个脚本，记录所有 POST 请求的 URL 和 Body 内容。

---

## 下一步

- 第10课：[待补充] 高级调试技巧
- 返回 [课程目录](./README.md)
