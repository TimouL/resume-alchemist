/**
 * 数据库工厂
 * 根据环境变量创建对应的数据库适配器
 */

import { DatabaseType, type IDatabase } from "./types.ts";
import { SQLiteAdapter } from "./sqlite-adapter.ts";
import { SupabaseAdapter } from "./supabase-adapter.ts";

// 单例实例
let instance: IDatabase | null = null;

/**
 * 获取数据库类型
 */
export function getDatabaseType(): DatabaseType {
  const dbType = Deno.env.get("DATABASE_TYPE") || "sqlite";
  return dbType.toLowerCase() === "supabase"
    ? DatabaseType.SUPABASE
    : DatabaseType.SQLITE;
}

/**
 * 创建数据库实例（单例模式）
 */
export function createDatabase(): IDatabase {
  if (instance) {
    return instance;
  }

  const dbType = getDatabaseType();

  switch (dbType) {
    case DatabaseType.SUPABASE:
      instance = new SupabaseAdapter();
      break;
    case DatabaseType.SQLITE:
    default:
      instance = new SQLiteAdapter();
      break;
  }

  return instance;
}

/**
 * 重置数据库实例（用于测试）
 */
export function resetDatabase(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}

/**
 * 检查是否使用 SQLite
 */
export function isSQLite(): boolean {
  return getDatabaseType() === DatabaseType.SQLITE;
}

/**
 * 检查是否使用 Supabase
 */
export function isSupabase(): boolean {
  return getDatabaseType() === DatabaseType.SUPABASE;
}
