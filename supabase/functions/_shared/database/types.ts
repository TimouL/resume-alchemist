/**
 * 数据库抽象层 - 类型定义
 * 支持 SQLite（本地/自托管）和 Supabase PostgreSQL（云端）
 */

// 数据库类型枚举
export enum DatabaseType {
  SQLITE = 'sqlite',
  SUPABASE = 'supabase',
}

// 速率限制检查结果
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// 速率限制记录
export interface RateLimitRecord {
  ip_address: string;
  endpoint: string;
  minute_window: string;
  request_count: number;
}

// 使用统计记录
export interface UsageStats {
  id: string;
  date: string;
  polish_count: number;
  dau: number;
  updated_at: string;
}

// 统一数据库接口
export interface IDatabase {
  /**
   * 检查并更新速率限制
   * @param ip 客户端 IP 地址
   * @param endpoint API 端点名称
   * @param maxRequests 每分钟最大请求数
   * @returns 是否允许请求及剩余次数
   */
  checkRateLimit(
    ip: string,
    endpoint: string,
    maxRequests: number
  ): Promise<RateLimitResult>;

  /**
   * 增加使用统计计数
   * @param date 日期 (YYYY-MM-DD)
   */
  incrementUsageStats(date: string): Promise<void>;

  /**
   * 获取使用统计
   * @param dateRange 可选的日期范围
   */
  getUsageStats(dateRange?: {
    start: string;
    end: string;
  }): Promise<UsageStats[]>;

  /**
   * 清理过期记录（速率限制表）
   * @param minutesAgo 清理多少分钟前的记录
   */
  cleanup(minutesAgo?: number): Promise<void>;

  /**
   * 关闭数据库连接
   */
  close(): Promise<void>;
}

// 数据库配置
export interface DatabaseConfig {
  type: DatabaseType;
  // SQLite 配置
  sqlitePath?: string;
  // Supabase 配置
  supabaseUrl?: string;
  supabaseKey?: string;
}
