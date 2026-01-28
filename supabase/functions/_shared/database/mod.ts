/**
 * 数据库模块入口
 * 导出所有公共 API
 */

// 类型导出
export type {
  IDatabase,
  RateLimitResult,
  RateLimitRecord,
  UsageStats,
  DatabaseConfig,
} from "./types.ts";

export { DatabaseType } from "./types.ts";

// 工厂函数导出
export {
  createDatabase,
  resetDatabase,
  getDatabaseType,
  isSQLite,
  isSupabase,
} from "./factory.ts";

// 适配器导出（高级用法）
export { SQLiteAdapter } from "./sqlite-adapter.ts";
export { SupabaseAdapter } from "./supabase-adapter.ts";
