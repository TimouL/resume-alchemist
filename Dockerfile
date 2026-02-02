# ============================================
# Stage 1: 前端构建
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# 复制依赖配置文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci --prefer-offline --no-audit

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# ============================================
# Stage 2: 生产运行时
# ============================================
FROM denoland/deno:alpine-2.1.4 AS production

WORKDIR /app

# 安装 tini 作为 init 进程和 sqlite 运行时库
RUN apk add --no-cache tini sqlite-libs

# 创建非 root 用户
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

# 复制前端构建产物
COPY --from=frontend-builder /app/dist ./dist

# 复制后端代码
COPY server ./server
COPY supabase ./supabase

# 创建数据目录并设置权限
RUN mkdir -p /app/data && \
    chown -R appuser:appgroup /app

# 预缓存 Deno 依赖（加速启动）
RUN deno cache server/main.ts

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查（使用 Deno fetch，无需额外安装 wget）
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD deno eval "const r = await fetch('http://localhost:8000/health'); if (!r.ok) Deno.exit(1);" || exit 1

# 数据卷
VOLUME ["/app/data"]

# 使用 tini 作为入口点
ENTRYPOINT ["/sbin/tini", "--"]

# 启动服务器
CMD ["deno", "run", \
     "--allow-net", \
     "--allow-read", \
     "--allow-write", \
     "--allow-env", \
     "--allow-ffi", \
     "--unstable-ffi", \
     "server/main.ts"]
