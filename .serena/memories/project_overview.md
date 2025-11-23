# NetRunner Academy - 项目概述

## 项目目的

NetRunner Academy 是一个交互式的网络安全教学游戏，采用"黑客模拟器"风格，用于教学：
- 网络抓包技术（模拟 Reqable 工具）
- JavaScript 逆向工程
- HTTP/HTTPS 流量分析
- Web 安全漏洞利用（SQL 注入、XSS、IDOR 等）

**核心设计理念**：游戏内工具必须一比一还原真实工具（Reqable、Chrome DevTools），让用户在游戏中学到的技能可以直接迁移到真实工具。

## 技术栈

### 前端框架
- **Next.js 14.2.0**（App Router 架构）
- **React 18.2.0**
- **TypeScript 5.2.2**

### UI 与样式
- **Tailwind CSS**（通过 CDN 注入）
- **Lucide React**（图标库）
- 自定义组件库（赛博朋克风格）

### 开发工具
- **pnpm 10.21.0**（强制使用，通过 packageManager 锁定）
- **Node.js 20.x**（推荐）

### 外部服务
- **Gemini API**（AI 教学辅助，通过 `services/geminiService.ts` 封装）

## 关键特性

1. **关卡系统**：34+ 个渐进式关卡，涵盖基础到高级安全主题
2. **工具模拟**：
   - Reqable 抓包工具（断点、Composer、规则引擎）
   - Chrome DevTools（Network、Console、Sources 面板）
3. **实时反馈**：真实的 HTTP 请求模拟与后端逻辑判定
4. **文档中心**：内置教学材料与操作指南
5. **视觉风格**：macOS 风格 Dock 栏 + 赛博朋克主题

## 项目状态

- **版本**：0.0.1（早期开发阶段）
- **测试覆盖**：无自动化测试（手动验证）
- **部署目标**：AI Studio 平台
