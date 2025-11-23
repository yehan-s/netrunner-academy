#!/bin/bash
set -e

echo "🚀 NetRunner Academy - GitHub 推送脚本"
echo "========================================"
echo ""

# 检查是否已配置远程仓库
if git remote | grep -q "^origin$"; then
    echo "⚠️  已检测到远程仓库 origin:"
    git remote get-url origin
    echo ""
    read -p "是否要覆盖? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        echo "❌ 取消操作"
        exit 1
    fi
fi

# 添加远程仓库
echo "📝 添加远程仓库..."
git remote add origin https://github.com/yehan/netrunner-academy.git

# 确保在 main 分支
echo "🔀 切换到 main 分支..."
git branch -M main

# 推送到 GitHub
echo "⬆️  推送到 GitHub..."
git push -u origin main

echo ""
echo "✅ 推送成功!"
echo "🔗 访问仓库: https://github.com/yehan/netrunner-academy"
