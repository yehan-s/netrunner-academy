# SQL 注入基础（case_03）教学

## 学习目标

- 了解 OWASP 所定义的 SQL 注入攻击：攻击者将恶意 SQL 片段注入到应用程序构造的查询中。
- 通过构造 `' OR '1'='1` 等 payload，理解“WHERE 条件永真”导致数据越权泄露的原理。
- 在浏览器和抓包工具中观察注入前后的请求差异。

## 前置知识

- 能使用浏览器访问带搜索框的页面。
- 对 SQL 的基本结构有直观认识：`SELECT ... FROM ... WHERE ...`。

## 步骤一：正常搜索并观察请求

1. 打开员工搜索页面，在搜索框中输入正常关键字（例如 `Alice`）。
2. 打开浏览器的 DevTools Network 面板，观察请求 URL 中的查询参数，如 `q=Alice`。
3. 理解此时后台执行的语句类似于：`SELECT * FROM employees WHERE name = 'Alice'`。

## 步骤二：构造 SQL 注入 payload

1. 将搜索内容改为 `'<space>OR<space>'1'='1`，例如：`' OR '1'='1`。
2. 再次触发搜索，在 Network 面板中观察新的请求 URL，注意参数形如：`q=' OR '1'='1`。
3. 结合 OWASP 示例，理解此时后台可能执行的语句变成：  
   `SELECT * FROM employees WHERE name = '' OR '1'='1'`  
   由于 `OR '1'='1'` 永远为真，WHERE 条件失效，可能返回整张表。

## 步骤三：在游戏中验证注入效果

1. 在游戏中执行上述 payload（通过虚拟浏览器或 Reqable 模拟请求），观察返回结果。
2. 如果关卡设计正确，当 URL 中包含 `' OR` 这类注入片段时，会触发“mission accomplished”，表示注入成功利用。
3. 结合 OWASP 的防御建议，记住真实系统中的修复方向是使用参数化查询和严格输入验证，而不是简单过滤单引号。

