#!/bin/bash

# Resume Alchemist - 独立服务器启动脚本
# 使用方法: ./server/start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 加载环境变量
if [ -f .env.server ]; then
  echo "📦 加载配置文件: .env.server"
  export $(cat .env.server | grep -v '^#' | xargs)
else
  echo "⚠️  未找到 .env.server 文件"
  echo "   请复制 .env.server.example 为 .env.server 并填写配置"
  echo ""
  echo "   cp .env.server.example .env.server"
  exit 1
fi

# 检查必要配置
if [ -z "$SILICONFLOW_API_KEY" ] || [ "$SILICONFLOW_API_KEY" = "your-api-key-here" ]; then
  echo "❌ 错误: 请在 .env.server 中配置 SILICONFLOW_API_KEY"
  exit 1
fi

# 创建数据目录（SQLite 模式）
if [ "${DATABASE_TYPE:-sqlite}" = "sqlite" ]; then
  mkdir -p ./data
  echo "💾 数据库: SQLite (${SQLITE_DB_PATH:-./data/resume-alchemist.db})"
else
  echo "💾 数据库: Supabase PostgreSQL"
fi

echo "🚀 启动服务器..."
echo "   端口: ${PORT:-8000}"
echo "   模型: ${SILICONFLOW_MODEL:-Qwen/Qwen3-8B}"
echo ""

# 启动 Deno 服务器
deno run \
  --allow-net \
  --allow-read \
  --allow-write \
  --allow-env \
  --allow-ffi \
  --unstable-ffi \
  server/main.ts
