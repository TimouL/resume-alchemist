/**
 * 独立 Deno HTTP 服务器
 * 用于本地开发和自托管环境，不依赖 Supabase Edge Functions
 *
 * 使用方法：
 *   deno run --allow-net --allow-read --allow-write --allow-env --allow-ffi server/main.ts
 *
 * 或使用启动脚本：
 *   ./server/start.sh
 */

const PORT = parseInt(Deno.env.get("PORT") || "8000");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// 动态导入 Edge Functions 处理器
async function handleResumeAI(req: Request): Promise<Response> {
  // 导入处理逻辑（复用 Edge Function 代码）
  const module = await import("../supabase/functions/resume-ai/index.ts");
  // Edge Function 使用 serve() 包装，这里需要直接调用处理逻辑
  // 由于 serve() 是入口点，我们需要重构或直接处理请求

  // 简化方案：直接转发到处理逻辑
  return await handleRequest(req, "resume-ai");
}

async function handleResumeAIStream(req: Request): Promise<Response> {
  return await handleRequest(req, "resume-ai-stream");
}

async function handleRequest(req: Request, endpoint: string): Promise<Response> {
  // 加载环境变量
  const SILICONFLOW_API_KEY = Deno.env.get("SILICONFLOW_API_KEY");
  const SILICONFLOW_MODEL = Deno.env.get("SILICONFLOW_MODEL") || "Qwen/Qwen3-8B";

  if (!SILICONFLOW_API_KEY) {
    return new Response(JSON.stringify({ error: "SILICONFLOW_API_KEY is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { type, content, industry, jd, style } = body;

    // 加载行业配置
    const { INDUSTRY_CONFIG } = await import("../supabase/functions/_shared/industry-config.ts");
    const config = INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.programmer;

    // 构建 prompt
    let systemPrompt = "";
    let userPrompt = "";
    const isStream = endpoint === "resume-ai-stream";

    if (type === "roast") {
      const roastOpener = config.roastOpeners[Math.floor(Math.random() * config.roastOpeners.length)];
      systemPrompt = buildRoastPrompt(config, roastOpener);
      userPrompt = `请分析以下简历：\n\n${content}`;
    } else if (type === "polish_full") {
      systemPrompt = buildPolishFullPrompt(config, isStream);
      userPrompt = `请优化以下简历：\n\n${content}`;
    } else if (type === "polish_sentence") {
      systemPrompt = buildPolishSentencePrompt(config, style, isStream);
      userPrompt = `请优化这句话：${content}`;
    } else if (type === "jd_match") {
      systemPrompt = buildJDMatchPrompt(config);
      userPrompt = `职位描述：\n${jd}\n\n简历内容：\n${content}`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown request type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 调用 AI API
    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SILICONFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: SILICONFLOW_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        stream: isStream,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI 服务暂时不可用" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isStream) {
      // 流式响应
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // 非流式响应
      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content;

      // 解析 JSON
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ error: "AI 响应解析失败" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
  } catch (error) {
    console.error("Request error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "未知错误" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Prompt 构建函数
function buildRoastPrompt(config: any, roastOpener: string): string {
  return `你是一位资深HR面试官，拥有15年招聘经验。你的任务是用犀利、幽默、略带刻薄但不失专业的视角点评简历。
你需要针对${config.name}岗位进行分析。

【重要】开场白必须使用以下这句话作为 roast 的开头，然后再进行具体分析：
"${roastOpener}"

你必须返回JSON格式，包含以下字段：
{
  "score": 0-100的综合评分,
  "roast": "以上面的开场白开始，用犀利幽默的语气写一段150字左右的毒舌点评，要戳中痛点但不失专业",
  "dimensions": {
    "${config.dimensions[0]}": 0-100,
    "${config.dimensions[1]}": 0-100,
    "${config.dimensions[2]}": 0-100,
    "${config.dimensions[3]}": 0-100,
    "${config.dimensions[4]}": 0-100,
    "${config.dimensions[5]}": 0-100
  },
  "ats_score": 0-100的ATS友好度评分,
  "highlights": ["3个简历亮点"],
  "weaknesses": ["3个需要改进的地方"],
  "keywords_missing": ["可能缺少的3-5个行业关键词"]
}

只返回JSON，不要有其他内容。所有回复必须使用中文。`;
}

function buildPolishFullPrompt(config: any, isStream: boolean): string {
  const outputFormat = isStream
    ? "直接输出优化后的完整简历文本，不要包含任何JSON格式或额外说明。"
    : `返回JSON格式：
{
  "polished": "完整优化后的简历文本",
  "changes": ["主要改动说明列表，3-5条"]
}

只返回JSON，`;

  return `你是一位专业的简历优化专家，精通STAR法则。你需要为${config.name}岗位优化简历。

优化原则：
1. 使用STAR法则（Situation情境、Task任务、Action行动、Result结果）重构每段经历
2. 语气专业自信，避免谦虚和模糊表达
3. 量化成果，使用具体数据，可参考这些占位符格式：${config.dataPlaceholders.join("、")}
4. 突出${config.expertStrategy}

${outputFormat}所有回复必须使用中文。`;
}

function buildPolishSentencePrompt(config: any, style: string, isStream: boolean): string {
  let styleInstruction = "";

  if (style === "standard") {
    styleInstruction = "语言简练专业，突出核心能力，避免冗余表达";
  } else if (style === "data") {
    styleInstruction = `【数据驱动模式】你是一个数据狂魔。用户给你的这句话缺乏说服力。请重写它，并**强制**插入量化数据占位符。

必须使用的占位符格式（从中选择1-2个最合适的）：
${config.dataPlaceholders.join("、")}

占位符必须用方括号 [] 包裹，这是强制要求！重写后的句子必须包含至少一个数据占位符。`;
  } else if (style === "expert") {
    styleInstruction = `【${config.expertModeName}】
${config.expertStrategy}
强调技术深度和行业影响力，体现战略思维和专家视角。使用更高级的专业术语和商业语言。`;
  }

  const outputFormat = isStream
    ? "直接输出优化后的句子，不要包含任何JSON格式、引号或额外说明。"
    : `返回JSON格式：
{
  "result": "优化后的句子"
}

只返回JSON，`;

  return `你是一位专业的简历文案专家，针对${config.name}岗位优化简历语句。

${styleInstruction}

${outputFormat}所有回复必须使用中文。`;
}

function buildJDMatchPrompt(config: any): string {
  return `你是一位资深招聘专家，擅长分析简历与职位描述的匹配度。请针对${config.name}岗位进行分析。

返回JSON格式：
{
  "match_score": 0-100的匹配度评分,
  "analysis": "100字左右的匹配度分析，指出主要差距和优势",
  "matched_keywords": ["简历中已有的匹配关键词，5-8个"],
  "missing_keywords": ["简历中缺少的重要关键词，5-8个"],
  "suggestions": ["5条具体的简历优化建议，针对这个职位"]
}

只返回JSON，所有回复必须使用中文。`;
}

// 路由处理
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // CORS 预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 路由匹配
  if (url.pathname === "/functions/v1/resume-ai" || url.pathname === "/resume-ai") {
    return await handleRequest(req, "resume-ai");
  }

  if (url.pathname === "/functions/v1/resume-ai-stream" || url.pathname === "/resume-ai-stream") {
    return await handleRequest(req, "resume-ai-stream");
  }

  // 健康检查
  if (url.pathname === "/health" || url.pathname === "/") {
    return new Response(JSON.stringify({
      status: "ok",
      database: Deno.env.get("DATABASE_TYPE") || "sqlite",
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 404
  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// 启动服务器
console.log(`🚀 Resume Alchemist Server starting on http://localhost:${PORT}`);
console.log(`📦 Database: ${Deno.env.get("DATABASE_TYPE") || "sqlite"}`);

Deno.serve({ port: PORT }, handler);
