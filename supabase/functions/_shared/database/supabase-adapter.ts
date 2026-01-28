/**
 * Supabase PostgreSQL 数据库适配器
 * 用于云端部署（Supabase Edge Functions）
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { IDatabase, RateLimitResult, UsageStats } from "./types.ts";

export class SupabaseAdapter implements IDatabase {
  private supabase: SupabaseClient;

  constructor(url?: string, key?: string) {
    const supabaseUrl = url || Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = key || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase adapter");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
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

    try {
      // 查询当前窗口的请求计数
      const { data: existing, error: selectError } = await this.supabase
        .from("rate_limits")
        .select("request_count")
        .eq("ip_address", ip)
        .eq("endpoint", endpoint)
        .eq("minute_window", minuteWindow)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        console.error("Rate limit check error:", selectError);
        // 出错时允许请求通过，避免误杀
        return { allowed: true, remaining: maxRequests };
      }

      if (existing) {
        // 记录已存在，检查是否超限
        if (existing.request_count >= maxRequests) {
          return { allowed: false, remaining: 0 };
        }

        // 更新计数
        await this.supabase
          .from("rate_limits")
          .update({ request_count: existing.request_count + 1 })
          .eq("ip_address", ip)
          .eq("endpoint", endpoint)
          .eq("minute_window", minuteWindow);

        return { allowed: true, remaining: maxRequests - existing.request_count - 1 };
      } else {
        // 新记录
        await this.supabase.from("rate_limits").insert({
          ip_address: ip,
          endpoint: endpoint,
          minute_window: minuteWindow,
          request_count: 1,
        });

        return { allowed: true, remaining: maxRequests - 1 };
      }
    } catch (error) {
      console.error("Rate limit error:", error);
      // 出错时允许请求通过
      return { allowed: true, remaining: maxRequests };
    }
  }

  async incrementUsageStats(date: string): Promise<void> {
    try {
      // 尝试更新现有记录
      const { data: existing } = await this.supabase
        .from("usage_stats")
        .select("id, polish_count")
        .eq("date", date)
        .single();

      if (existing) {
        await this.supabase
          .from("usage_stats")
          .update({
            polish_count: existing.polish_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await this.supabase.from("usage_stats").insert({
          date: date,
          polish_count: 1,
          dau: 1,
        });
      }
    } catch (error) {
      console.error("Usage stats error:", error);
    }
  }

  async getUsageStats(dateRange?: {
    start: string;
    end: string;
  }): Promise<UsageStats[]> {
    try {
      let query = this.supabase
        .from("usage_stats")
        .select("id, date, polish_count, dau, updated_at");

      if (dateRange) {
        query = query.gte("date", dateRange.start).lte("date", dateRange.end);
      }

      const { data, error } = await query.order("date", { ascending: false });

      if (error) {
        console.error("Get usage stats error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Get usage stats error:", error);
      return [];
    }
  }

  async cleanup(minutesAgo: number = 5): Promise<void> {
    try {
      // 计算截止时间窗口
      const cutoffDate = new Date(Date.now() - minutesAgo * 60 * 1000);
      const cutoffWindow = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, "0")}-${String(cutoffDate.getDate()).padStart(2, "0")}-${String(cutoffDate.getHours()).padStart(2, "0")}-${String(cutoffDate.getMinutes()).padStart(2, "0")}`;

      await this.supabase
        .from("rate_limits")
        .delete()
        .lt("minute_window", cutoffWindow);
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }

  async close(): Promise<void> {
    // Supabase 客户端不需要显式关闭
  }
}
