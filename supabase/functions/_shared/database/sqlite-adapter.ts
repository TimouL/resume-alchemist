/**
 * SQLite 数据库适配器
 * 用于本地开发和自托管环境
 */

import { Database } from "https://deno.land/x/sqlite3@0.11.1/mod.ts";
import type { IDatabase, RateLimitResult, UsageStats } from "./types.ts";

// SQLite Schema - 速率限制表
const RATE_LIMITS_SCHEMA = `
CREATE TABLE IF NOT EXISTS rate_limits (
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  minute_window TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (ip_address, endpoint, minute_window)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
ON rate_limits(minute_window);
`;

// SQLite Schema - 使用统计表
const USAGE_STATS_SCHEMA = `
CREATE TABLE IF NOT EXISTS usage_stats (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  date TEXT NOT NULL UNIQUE,
  polish_count INTEGER DEFAULT 0,
  dau INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usage_stats_date
ON usage_stats(date);
`;

export class SQLiteAdapter implements IDatabase {
  private db: Database;

  constructor(dbPath?: string) {
    const path = dbPath || Deno.env.get("SQLITE_DB_PATH") || "./data/resume-alchemist.db";

    // 确保目录存在
    const dir = path.substring(0, path.lastIndexOf("/"));
    if (dir) {
      try {
        Deno.mkdirSync(dir, { recursive: true });
      } catch {
        // 目录已存在，忽略
      }
    }

    // 初始化数据库连接
    this.db = new Database(path);

    // 启用 WAL 模式（提高并发性能）
    this.db.exec("PRAGMA journal_mode=WAL");
    this.db.exec("PRAGMA busy_timeout=5000");

    // 初始化表结构
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(RATE_LIMITS_SCHEMA);
    this.db.exec(USAGE_STATS_SCHEMA);
  }

  /**
   * 获取当前分钟窗口标识
   */
  private getCurrentMinuteWindow(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
  }

  async checkRateLimit(
    ip: string,
    endpoint: string,
    maxRequests: number
  ): Promise<RateLimitResult> {
    const minuteWindow = this.getCurrentMinuteWindow();

    // 查询当前窗口的请求计数
    const stmt = this.db.prepare(
      `SELECT request_count FROM rate_limits
       WHERE ip_address = ? AND endpoint = ? AND minute_window = ?`
    );
    const row = stmt.get(ip, endpoint, minuteWindow) as { request_count: number } | undefined;

    if (row) {
      // 记录已存在，检查是否超限
      if (row.request_count >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }

      // 更新计数
      this.db.exec(
        `UPDATE rate_limits SET request_count = request_count + 1
         WHERE ip_address = ? AND endpoint = ? AND minute_window = ?`,
        [ip, endpoint, minuteWindow]
      );

      return { allowed: true, remaining: maxRequests - row.request_count - 1 };
    } else {
      // 新记录
      this.db.exec(
        `INSERT INTO rate_limits (ip_address, endpoint, minute_window, request_count)
         VALUES (?, ?, ?, 1)`,
        [ip, endpoint, minuteWindow]
      );

      return { allowed: true, remaining: maxRequests - 1 };
    }
  }

  async incrementUsageStats(date: string): Promise<void> {
    // 尝试更新现有记录
    const result = this.db.exec(
      `UPDATE usage_stats SET polish_count = polish_count + 1, updated_at = datetime('now')
       WHERE date = ?`,
      [date]
    );

    // 如果没有更新任何行，插入新记录
    if (this.db.changes === 0) {
      this.db.exec(
        `INSERT INTO usage_stats (date, polish_count, dau) VALUES (?, 1, 1)`,
        [date]
      );
    }
  }

  async getUsageStats(dateRange?: {
    start: string;
    end: string;
  }): Promise<UsageStats[]> {
    let sql = "SELECT id, date, polish_count, dau, updated_at FROM usage_stats";
    const params: string[] = [];

    if (dateRange) {
      sql += " WHERE date >= ? AND date <= ?";
      params.push(dateRange.start, dateRange.end);
    }

    sql += " ORDER BY date DESC";

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as UsageStats[];
    return rows;
  }

  async cleanup(minutesAgo: number = 5): Promise<void> {
    // 计算截止时间窗口
    const cutoffDate = new Date(Date.now() - minutesAgo * 60 * 1000);
    const cutoffWindow = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, "0")}-${String(cutoffDate.getDate()).padStart(2, "0")}-${String(cutoffDate.getHours()).padStart(2, "0")}-${String(cutoffDate.getMinutes()).padStart(2, "0")}`;

    this.db.exec(
      "DELETE FROM rate_limits WHERE minute_window < ?",
      [cutoffWindow]
    );
  }

  async close(): Promise<void> {
    this.db.close();
  }
}
