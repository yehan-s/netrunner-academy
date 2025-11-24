# 第七课：安全测试入门

## 前言：什么是安全测试？

**安全测试**是验证系统能否正确保护数据、抵御攻击的过程。

**核心理念**：

```
"安全不是产品，是过程。" - Bruce Schneier

"攻击者只需找到一个漏洞，防御者需要堵住所有漏洞。"
```

**重要声明**：

- ✅ 本课程仅用于**授权环境**（自己的项目、CTF 比赛、Bug Bounty）
- ❌ 未经授权的安全测试是**违法行为**
- ⚠️ 学习安全知识是为了**更好地防御**，而非攻击

---

## OWASP Top 10 简介

**OWASP**（开放 Web 应用程序安全项目）每年发布 Web 安全风险排名：

| 排名 | 风险类型 | 抓包可检测 |
|------|----------|------------|
| 1 | **注入攻击**（SQL/XSS/命令注入） | ✅ |
| 2 | **身份认证失效** | ✅ |
| 3 | **敏感数据泄露** | ✅ |
| 4 | **XML 外部实体（XXE）** | ✅ |
| 5 | **访问控制失效** | ✅ |
| 6 | **安全配置错误** | ✅ |
| 7 | **跨站脚本（XSS）** | ✅ |
| 8 | **不安全的反序列化** | ⚠️ 部分 |
| 9 | **已知漏洞组件** | ⚠️ 部分 |
| 10 | **日志与监控不足** | ❌ 无法检测 |

**结论**：抓包能发现大部分 Web 安全问题。

---

## 安全测试方法论

### 测试流程

```
1. 信息收集     - 了解目标系统的功能和接口
2. 请求分析     - 捕获并分析所有 HTTP 请求
3. 参数测试     - 修改参数，观察系统反应
4. 漏洞验证     - 确认是否存在安全问题
5. 报告编写     - 记录发现和修复建议
```

### 测试重点

```
┌─────────────────────────────────────────────┐
│           HTTP 请求安全检查清单             │
├─────────────────────────────────────────────┤
│ 认证相关                                    │
│ □ Token 是否在 URL 中泄露？                 │
│ □ Cookie 是否设置 HttpOnly/Secure？         │
│ □ 是否存在弱密码策略？                       │
├─────────────────────────────────────────────┤
│ 授权相关                                    │
│ □ 能否访问其他用户的数据？                   │
│ □ 是否仅通过前端隐藏敏感功能？               │
│ □ API 是否验证用户权限？                     │
├─────────────────────────────────────────────┤
│ 数据传输                                    │
│ □ 敏感数据是否加密传输？                     │
│ □ 是否使用 HTTPS？                          │
│ □ 响应中是否泄露敏感信息？                   │
├─────────────────────────────────────────────┤
│ 输入验证                                    │
│ □ 后端是否验证输入长度/格式？                │
│ □ 是否防止 SQL 注入？                       │
│ □ 是否防止 XSS 攻击？                       │
└─────────────────────────────────────────────┘
```

---

## 实战案例：通过抓包发现漏洞

### 案例 1：越权访问（IDOR - Insecure Direct Object Reference）

**漏洞描述**：用户 A 能访问用户 B 的私有数据。

**发现过程**：

1. **正常请求**：
   ```http
   GET /api/user/orders?userId=1001 HTTP/1.1
   Authorization: Bearer token_of_user_1001

   响应:
   {"orders": [{"id": 5001, "item": "iPhone"}]}
   ```

2. **篡改参数**：
   ```http
   GET /api/user/orders?userId=1002 HTTP/1.1   ← 改为别人的 userId
   Authorization: Bearer token_of_user_1001     ← 仍用自己的 Token

   响应:
   {"orders": [{"id": 5002, "item": "MacBook"}]}  ← 竟然返回了！
   ```

**漏洞原因**：后端只验证了 Token 有效性，没有验证 userId 是否属于当前用户。

**修复建议**：

```python
# 错误写法
def get_orders(user_id):
    return db.query(f"SELECT * FROM orders WHERE user_id = {user_id}")

# 正确写法
def get_orders(current_user):
    return db.query(f"SELECT * FROM orders WHERE user_id = {current_user.id}")
```

---

### 案例 2：敏感信息泄露

**漏洞描述**：API 响应中包含不应该返回的敏感数据。

**发现过程**：

1. **正常登录**：
   ```http
   POST /api/login HTTP/1.1
   Content-Type: application/json

   {"username": "alice", "password": "secret123"}
   ```

2. **检查响应**：
   ```json
   {
     "status": "success",
     "user": {
       "id": 1001,
       "username": "alice",
       "email": "alice@example.com",
       "password_hash": "e10adc3949ba59abbe56e057f20f883e",  ← 敏感！
       "credit_card": "4111-1111-1111-1111",                 ← 敏感！
       "ssn": "123-45-6789"                                   ← 敏感！
     },
     "token": "eyJhbGciOiJIUzI1NiIs..."
   }
   ```

**漏洞原因**：后端直接返回了数据库完整对象，未过滤敏感字段。

**修复建议**：

```python
# 使用 DTO（数据传输对象）只返回必要字段
class UserResponse:
    id: int
    username: str
    email: str
    # 不包含 password_hash, credit_card, ssn
```

---

### 案例 3：缺失的权限验证

**漏洞描述**：普通用户能调用管理员接口。

**发现过程**：

1. **以普通用户身份抓包**：
   ```http
   GET /api/user/profile HTTP/1.1
   Authorization: Bearer normal_user_token
   ```

2. **尝试调用管理员接口**：
   ```http
   GET /api/admin/users HTTP/1.1        ← 管理员接口
   Authorization: Bearer normal_user_token  ← 普通用户 Token

   响应:
   {"users": [{"id": 1, "role": "admin"}, {"id": 2, "role": "user"}...]}
   ```

**漏洞原因**：管理员接口未验证用户角色。

**修复建议**：

```python
@app.route('/api/admin/users')
@require_role('admin')  # 添加权限装饰器
def get_all_users():
    return db.query("SELECT * FROM users")
```

---

### 案例 4：不安全的直接对象引用

**场景**：下载文件功能存在路径遍历漏洞。

**发现过程**：

1. **正常下载**：
   ```http
   GET /api/download?file=report_2024.pdf HTTP/1.1

   响应: [PDF 文件内容]
   ```

2. **路径遍历攻击**：
   ```http
   GET /api/download?file=../../../etc/passwd HTTP/1.1

   响应:
   root:x:0:0:root:/root:/bin/bash
   www-data:x:33:33:www-data:/var/www:/bin/bash
   ...
   ```

**漏洞原因**：后端直接拼接文件路径，未过滤 `../`。

**修复建议**：

```python
import os

def download_file(filename):
    # 验证文件名，禁止路径遍历
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    # 确保路径在允许的目录内
    if not file_path.startswith(UPLOAD_DIR):
        raise SecurityException("Invalid file path")

    return open(file_path, 'rb')
```

---

### 案例 5：CSRF（跨站请求伪造）

**漏洞描述**：攻击者能构造恶意链接，诱骗用户执行敏感操作。

**发现过程**：

1. **分析转账请求**：
   ```http
   POST /api/transfer HTTP/1.1
   Cookie: session_id=abc123
   Content-Type: application/x-www-form-urlencoded

   to=attacker_account&amount=10000
   ```

2. **检查缺失项**：
   - ❌ 无 CSRF Token
   - ❌ 无 Referer 验证
   - ❌ 无二次确认

**攻击方式**：

```html
<!-- 攻击者在恶意网站放置 -->
<img src="https://bank.com/api/transfer?to=attacker&amount=10000">
```

当用户访问恶意页面时，浏览器会自动发送带 Cookie 的请求。

**修复建议**：

```html
<!-- 表单中添加 CSRF Token -->
<form action="/api/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="random_token_123">
  <input type="text" name="to">
  <input type="number" name="amount">
  <button type="submit">转账</button>
</form>
```

---

## 安全测试清单

### 登录/注册功能

```
□ 密码是否加密传输？（HTTPS + 前端哈希）
□ 是否存在用户枚举？（"用户不存在" vs "密码错误"）
□ 登录失败是否有频率限制？
□ 是否支持二次验证（2FA）？
□ Session/Token 是否设置合理过期时间？
□ 登出是否真正销毁 Session？
```

### API 接口

```
□ 所有敏感操作是否需要认证？
□ 是否存在越权访问（IDOR）？
□ 响应是否泄露敏感数据？
□ 错误信息是否泄露系统细节？
□ 是否有请求频率限制？
□ 输入是否经过后端验证？
```

### 数据传输

```
□ 是否全站 HTTPS？
□ HSTS 是否启用？
□ Cookie 是否设置 Secure 和 HttpOnly？
□ 是否存在混合内容（HTTP + HTTPS）？
```

### 业务逻辑

```
□ 价格等关键数据是否由后端计算？
□ 优惠券/积分是否可重复使用？
□ 订单状态是否可被篡改？
□ 支付流程是否可绕过？
```

---

## 漏洞报告模板

```markdown
## 漏洞标题
越权访问他人订单信息

## 漏洞类型
IDOR (Insecure Direct Object Reference)

## 风险等级
高危

## 影响范围
所有已注册用户的订单数据

## 复现步骤
1. 使用账号 A 登录系统
2. 访问 /api/orders?userId=1001 获取自己的订单
3. 修改参数为 userId=1002
4. 成功获取用户 1002 的订单数据

## 相关请求
```http
GET /api/orders?userId=1002 HTTP/1.1
Authorization: Bearer token_of_user_1001
```

## 修复建议
1. 后端不应依赖前端传递的 userId
2. 应从 Token 中解析当前用户 ID
3. 添加权限验证逻辑

## 参考资料
- OWASP IDOR: https://owasp.org/www-community/attacks/Insecure_Direct_Object_Reference
```

---

## 实战练习

### 练习 1：检查自己项目的安全性

**任务**：对自己开发的项目进行安全自检。

**步骤**：

1. 启动项目，配置 Reqable 抓包
2. 完成一次完整的用户流程（注册 → 登录 → 核心功能）
3. 逐一检查上述"安全测试清单"
4. 记录发现的问题并修复

### 练习 2：分析 API 响应

**任务**：检查 API 响应是否泄露敏感信息。

**步骤**：

1. 抓取登录后的用户信息 API
2. 检查响应中是否包含：
   - 密码哈希
   - 手机号完整显示
   - 身份证号
   - 银行卡号
3. 如发现泄露，记录并修复

### 练习 3：测试访问控制

**任务**：验证 API 的权限控制是否正确。

**步骤**：

1. 使用普通用户 A 的 Token
2. 尝试访问用户 B 的数据（修改 URL 中的 ID 参数）
3. 尝试访问管理员接口
4. 记录能够越权访问的接口

---

## 小结

✅ 你已经掌握：

- OWASP Top 10 常见安全风险
- 通过抓包发现安全漏洞的方法
- IDOR、敏感信息泄露、CSRF 等漏洞的识别
- 安全测试清单和报告模板

**重要提醒**：

- 安全测试必须在**授权范围**内进行
- 发现漏洞应**负责任地披露**
- 学习安全知识是为了**更好地防护**

下一课：

- 📘 [第八课：真实场景调试案例](./08-real-world-scenarios.md)

---

## 延伸阅读

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [Bug Bounty 入门指南](https://www.hackerone.com/resources/hacker-101)
- [负责任的漏洞披露指南](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html)
