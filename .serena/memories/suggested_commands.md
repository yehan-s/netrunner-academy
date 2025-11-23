# NetRunner Academy - 常用开发命令

## 包管理

```bash
# 安装依赖（首次克隆或依赖变更后）
pnpm install

# 注意：项目强制使用 pnpm@10.21.0（通过 packageManager 字段锁定）
```

## 开发服务器

```bash
# 启动 Next.js 开发服务器（默认端口 3000）
pnpm dev

# 访问地址：http://localhost:3000
```

## 构建与验证

```bash
# 构建生产包（包含 TypeScript 类型检查）
pnpm build

# 运行生产构建（用于本地验证）
pnpm start
```

## 系统工具（macOS/Darwin）

```bash
# 文件列表（包含隐藏文件）
ls -la

# 搜索文件
find . -name "*.tsx"

# 搜索代码内容
grep -r "pattern" .

# 查看文件内容
cat filename.tsx

# 文件树结构
tree -L 2 -I 'node_modules|.next'
```

## Git 工作流

```bash
# 查看状态
git status

# 暂存变更
git add .

# 提交（使用 Conventional Commits 格式）
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "refactor: improve code structure"
git commit -m "docs: update documentation"

# 推送
git push
```

## 环境配置

```bash
# 复制环境变量模板（如果存在）
cp .env.example .env.local

# 编辑环境变量
vim .env.local
# 必需配置：GEMINI_API_KEY=your_api_key_here
```

## 当前项目无自动化工具

**注意**：项目当前未配置以下工具：
- ❌ 代码格式化工具（无 Prettier/ESLint 脚本）
- ❌ Linting 工具
- ❌ 自动化测试框架

手动验证流程见 `task_completion_checklist.md`
