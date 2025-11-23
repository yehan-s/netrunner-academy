# 代码库结构

## 目录组织

```
net-runner/
├── app/                      # Next.js App Router 入口
│   ├── layout.tsx           # 全局布局（注入 Tailwind CDN）
│   ├── page.tsx             # 主页面（渲染 App 组件）
│   └── globals.css          # 全局样式（赛博朋克主题）
├── components/              # UI 组件库
│   ├── VirtualBrowser.tsx   # Chrome 浏览器模拟器
│   ├── NetworkMonitor.tsx   # DevTools Network/Console
│   ├── ReqableSimulator.tsx # Reqable 抓包工具
│   ├── TaskSidebar.tsx      # 关卡列表侧边栏
│   ├── DocsViewer.tsx       # 文档中心
│   ├── CodeViewer.tsx       # 代码查看器（Sources 面板）
│   ├── GameTerminal.tsx     # 游戏终端组件
│   └── ObjectExplorer.tsx   # 对象浏览器
├── services/                # 外部服务封装
│   └── geminiService.ts     # Gemini API 集成
├── docs/                    # 项目文档
│   ├── adr/                 # 架构决策记录
│   │   ├── 0001-nextjs-migration.md
│   │   └── 0002-nextjs-full-refactor.md
│   ├── tasks/               # 任务文档
│   │   └── nextjs-full-refactor.md
│   └── lessons/             # 教学文档（待创建）
├── App.tsx                  # 应用主入口与状态管理
├── constants.ts             # 关卡数据与常量定义
├── types.ts                 # TypeScript 类型定义
├── package.json             # 依赖与脚本
├── tsconfig.json            # TypeScript 配置
├── next.config.mjs          # Next.js 配置
├── .env.local               # 环境变量（GEMINI_API_KEY）
├── AGENTS.md                # 开发指南（代码库约定）
├── CLAUDE.md                # Claude Code 指南
└── README.md                # 项目说明
```

## 核心文件职责

### 状态管理层（App.tsx）
**作用**：应用的单一事实来源
- 管理全局状态：
  - `activeApp`：当前视图（browser/reqable/split/docs）
  - `activeCaseId`：当前关卡 ID
  - `requests`：网络请求历史
  - `completedCases`：已完成关卡列表
- 包含核心业务逻辑：
  - `processBackendLogic()`：模拟后端响应与通关判定
  - `handleConsoleCommand()`：处理 Console 命令（Reverse 关卡）
  - `triggerInitialTraffic()`：关卡初始化时的流量模拟

### 数据定义层
- **constants.ts**：
  - `CASE_STUDIES` 数组：所有关卡的完整定义
  - 包含：标题、描述、学习目标、操作步骤、源代码（Reverse 关卡）
- **types.ts**：
  - `NetworkRequest`：网络请求数据结构
  - `CaseStudy`：关卡类型定义
  - `ScriptRule`：Reqable 规则类型

### UI 组件层

**浏览器模拟器**（VirtualBrowser.tsx）
- 渲染关卡页面（根据 `activeCaseId` 条件渲染）
- 处理用户交互（表单提交、按钮点击）
- 生成 NetworkRequest 对象

**DevTools 模拟器**（NetworkMonitor.tsx）
- 展示网络请求列表（Network 面板）
- Console 交互（执行 JavaScript 命令）
- Sources 面板（查看源代码）
- 支持 Dock 位置切换（bottom/right）

**Reqable 模拟器**（ReqableSimulator.tsx）
- 流量捕获与展示
- 断点功能（拦截请求）
- Composer 构造器（手动发送请求）
- 规则引擎（Rewrite/Script/Map Local）

**其他组件**
- **TaskSidebar**：关卡导航与任务描述
- **DocsViewer**：教学文档查看器
- **CodeViewer**：代码高亮显示（用于 Reverse 关卡）

## 数据流架构

```
用户交互（VirtualBrowser）
    ↓
生成 NetworkRequest
    ↓
App.tsx 的 handleNavigate()
    ↓
断点检查（breakpointActive?）
    ├─ Yes → 暂停请求（ReqableSimulator 拦截）
    └─ No  → processBackendLogic()
              ↓
         模拟后端响应
              ↓
         通关条件判断
              ↓
         triggerSuccess()（如满足）
```

## 关卡扩展指南

### 添加新关卡的三步流程

1. **定义关卡数据**（constants.ts）
   ```typescript
   {
     id: 'case_35',
     title: '新关卡标题',
     category: 'Security',
     difficulty: 'Advanced',
     description: '...',
     learningObjectives: [...],
     guideSteps: [...]
   }
   ```

2. **实现通关逻辑**（App.tsx → processBackendLogic）
   ```typescript
   else if (activeCaseId === 'case_35' && req.url.includes('/target')) {
     triggerSuccess();
   }
   ```

3. **自定义页面 UI**（VirtualBrowser.tsx → 条件渲染）
   ```typescript
   {activeCase.id === 'case_35' && (
     <div>自定义页面内容</div>
   )}
   ```

## 配置文件说明

### tsconfig.json
- **target**: es5（兼容性）
- **lib**: dom, esnext
- **strict**: true（严格模式）
- **jsx**: preserve（Next.js 处理）

### next.config.mjs
- 基础配置（无特殊自定义）

### .env.local
```env
GEMINI_API_KEY=your_key_here  # 必需
```

## 版本控制忽略（.gitignore）
- `node_modules/`
- `.next/`
- `.env.local`
- `pnpm-lock.yaml` 的变更（如仅依赖版本微调）
