// 简历模板配置
export interface ResumeTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  style: 'minimal' | 'elite' | 'geek';
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'minimal',
    name: '极简主义版',
    nameEn: 'The Minimalist',
    description: 'Apple 风格 · 大量留白 · 适合产品/设计/运营',
    style: 'minimal',
  },
  {
    id: 'elite',
    name: '大厂精英版',
    nameEn: 'The Elite',
    description: '哈佛/麦肯锡风格 · 权威感 · 适合程序员/金融/咨询',
    style: 'elite',
  },
  {
    id: 'geek',
    name: '极客黑客版',
    nameEn: 'The Geek',
    description: 'VS Code 风格 · 代码感 · 适合技术极客',
    style: 'geek',
  },
];

export interface ParsedResume {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: { label: string; url: string }[];
  summary: string;
  experience: {
    company: string;
    role: string;
    period: string;
    location?: string;
    highlights: string[];
  }[];
  education: {
    school: string;
    degree: string;
    major?: string;
    period: string;
    gpa?: string;
  }[];
  skills: string[];
  projects?: {
    name: string;
    description: string;
    tech?: string[];
  }[];
}

// 清理 Markdown 标记以提取纯文本（用于检测）
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // **bold**
    .replace(/\*(.*?)\*/g, '$1')       // *italic*
    .replace(/【(.*?)】/g, '$1')       // 【标题】
    .replace(/\[(.*?)\]/g, '$1')       // [text]
    .replace(/`(.*?)`/g, '$1')         // `code`
    .trim();
}

// 检测段落标题
function detectSection(line: string): string | null {
  const cleanLine = stripMarkdown(line).toLowerCase();
  
  if (/工作经[历验]|experience|employment/i.test(cleanLine)) return 'experience';
  if (/教育|education|学[历位]背景/i.test(cleanLine)) return 'education';
  if (/技能|skills|专业技能|技术栈/i.test(cleanLine)) return 'skills';
  if (/个人[简总]结|summary|自我评价|简介|about/i.test(cleanLine)) return 'summary';
  if (/项目|project/i.test(cleanLine)) return 'projects';
  
  return null;
}

// 检测日期时间线（如 2023.07 - 至今）
function extractPeriod(line: string): string | null {
  // 匹配 YYYY.MM - YYYY.MM 或 YYYY.MM - 至今 等格式
  const periodMatch = line.match(/(\d{4}[.\-/年]\d{1,2}[月]?\s*[-–—~到至]\s*(?:\d{4}[.\-/年]\d{1,2}[月]?|至今|present|now|current))/i);
  if (periodMatch) return periodMatch[1];
  
  // 匹配单独的年份范围
  const yearMatch = line.match(/(\d{4}\s*[-–—~到至]\s*(?:\d{4}|至今|present))/i);
  if (yearMatch) return yearMatch[1];
  
  return null;
}

// 判断是否是工作经历的标题行（包含公司名 + 职位 + 时间）
function parseExperienceHeader(line: string): { company: string; role: string; period: string } | null {
  const period = extractPeriod(line);
  if (!period) return null;
  
  // 移除日期部分，剩下的是公司和职位信息
  let remaining = line.replace(period, '').trim();
  // 清理分隔符
  remaining = remaining.replace(/^\||\|$/g, '').replace(/\s*\|\s*/g, ' | ').trim();
  
  // 尝试按 | 分割
  const parts = remaining.split(/\s*\|\s*/).filter(p => p.trim());
  
  if (parts.length >= 2) {
    return {
      company: stripMarkdown(parts[0]).trim(),
      role: stripMarkdown(parts[1]).trim(),
      period: period.trim(),
    };
  } else if (parts.length === 1) {
    return {
      company: stripMarkdown(parts[0]).trim(),
      role: '',
      period: period.trim(),
    };
  }
  
  return null;
}

// 判断是否是教育背景的条目
function parseEducationLine(line: string): ParsedResume['education'][0] | null {
  const period = extractPeriod(line);
  if (!period) return null;
  
  // 检查是否包含学校相关关键词
  const hasSchoolKeyword = /大学|学院|university|college|institute/i.test(line);
  if (!hasSchoolKeyword) return null;
  
  let remaining = line.replace(period, '').trim();
  remaining = remaining.replace(/^[-•*]\s*/, '').replace(/^\||\|$/g, '').trim();
  
  const parts = remaining.split(/\s*\|\s*/).filter(p => p.trim());
  
  return {
    school: stripMarkdown(parts[0] || '').trim(),
    major: stripMarkdown(parts[1] || '').trim(),
    degree: stripMarkdown(parts[2] || parts[1] || '').trim(),
    period: period.trim(),
  };
}

// 解析简历内容
export function parseResumeContent(content: string): ParsedResume {
  // 保留原始换行，但分割成段落
  const rawLines = content.split('\n');
  
  const result: ParsedResume = {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    links: [],
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
  };

  let currentSection = '';
  let currentExp: ParsedResume['experience'][0] | null = null;
  let summaryLines: string[] = [];
  let headerProcessed = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmedLine = line.trim();
    
    // 跳过空行
    if (!trimmedLine) continue;
    
    // 检测段落标题
    const section = detectSection(trimmedLine);
    if (section) {
      // 保存当前工作经历
      if (currentExp && currentSection === 'experience') {
        result.experience.push(currentExp);
        currentExp = null;
      }
      // 保存摘要
      if (currentSection === 'summary' && summaryLines.length > 0) {
        result.summary = summaryLines.join('\n');
        summaryLines = [];
      }
      currentSection = section;
      continue;
    }

    // 解析头部信息（前几行）
    if (!headerProcessed && i < 10) {
      // 第一行通常是名字（可能带职位）
      if (!result.name) {
        // 格式: #### 张三 - Java 初级开发工程师
        const nameMatch = trimmedLine.match(/^#{1,6}\s*(.+?)\s*[-–—]\s*(.+)$/);
        if (nameMatch) {
          result.name = stripMarkdown(nameMatch[1]).trim();
          result.title = stripMarkdown(nameMatch[2]).trim();
          continue;
        }
        // 只有名字
        if (trimmedLine.length <= 15 && !trimmedLine.includes('@') && !trimmedLine.includes('http')) {
          result.name = stripMarkdown(trimmedLine);
          continue;
        }
      }
      
      // 联系方式行：**联系方式**：138-xxxx-xxxx | email
      if (trimmedLine.includes('联系方式') || trimmedLine.includes('Contact')) {
        const emailMatch = trimmedLine.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) result.email = emailMatch[0];
        
        const phoneMatch = trimmedLine.match(/1[3-9]\d[\d-]{8,}/);
        if (phoneMatch) result.phone = phoneMatch[0].replace(/-/g, '');
        continue;
      }
      
      // 求职意向行
      if (trimmedLine.includes('求职意向') || trimmedLine.includes('Objective')) {
        const intentMatch = trimmedLine.match(/[：:]\s*(.+)$/);
        if (intentMatch && !result.title) {
          result.title = stripMarkdown(intentMatch[1]).trim();
        }
        continue;
      }
    }

    // 提取邮箱和电话（可能出现在任意位置）
    if (!result.email) {
      const emailMatch = trimmedLine.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) result.email = emailMatch[0];
    }
    if (!result.phone) {
      const phoneMatch = trimmedLine.match(/1[3-9]\d[\d-]{8,}/);
      if (phoneMatch) result.phone = phoneMatch[0].replace(/-/g, '');
    }

    // GitHub/LinkedIn 链接
    if (trimmedLine.includes('github.com') || trimmedLine.includes('linkedin.com')) {
      const urlMatch = trimmedLine.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        result.links.push({
          label: trimmedLine.includes('github') ? 'GitHub' : 'LinkedIn',
          url: urlMatch[0],
        });
      }
    }

    // 根据当前段落处理内容
    switch (currentSection) {
      case 'experience': {
        // 检测工作经历标题行 (包含日期)
        const expHeader = parseExperienceHeader(trimmedLine);
        if (expHeader) {
          // 保存之前的工作经历
          if (currentExp) {
            result.experience.push(currentExp);
          }
          currentExp = {
            company: expHeader.company,
            role: expHeader.role,
            period: expHeader.period,
            highlights: [],
          };
        } else if (currentExp) {
          // 工作内容条目（以 - 或 • 开头，或者是包含 **标题**: 格式的行）
          const cleanLine = trimmedLine.replace(/^[-•*]\s*/, '');
          if (cleanLine) {
            // 保留原始 Markdown 格式
            currentExp.highlights.push(cleanLine);
          }
        }
        break;
      }

      case 'education': {
        const eduEntry = parseEducationLine(trimmedLine);
        if (eduEntry) {
          result.education.push(eduEntry);
        } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
          // 处理列表格式的教育背景
          const cleanLine = trimmedLine.replace(/^[-•*]\s*/, '');
          const period = extractPeriod(cleanLine);
          if (period) {
            const parts = cleanLine.replace(period, '').split(/\s*\|\s*/).filter(p => p.trim());
            result.education.push({
              school: stripMarkdown(parts[0] || '').trim(),
              major: stripMarkdown(parts[1] || '').trim(),
              degree: stripMarkdown(parts[2] || '本科').trim(),
              period: period.trim(),
            });
          }
        }
        break;
      }

      case 'skills': {
        // 处理技能列表
        const cleanLine = trimmedLine.replace(/^[-•*]\s*/, '');
        // 如果是完整的句子描述技能，保持原样
        if (cleanLine.length > 30) {
          // 按逗号、顿号分割
          const skillItems = cleanLine.split(/[、,，]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 100);
          if (skillItems.length > 1) {
            result.skills.push(...skillItems);
          } else {
            result.skills.push(cleanLine);
          }
        } else if (cleanLine.includes('、') || cleanLine.includes(',')) {
          const skillItems = cleanLine.split(/[、,，\/]/).map(s => s.trim()).filter(Boolean);
          result.skills.push(...skillItems);
        } else if (cleanLine) {
          result.skills.push(cleanLine);
        }
        break;
      }

      case 'summary': {
        // 收集摘要内容，保留换行
        const cleanLine = trimmedLine.replace(/^[-•*]\s*/, '');
        if (cleanLine) {
          summaryLines.push(cleanLine);
        }
        break;
      }

      default: {
        // 尝试解析职位
        if (!result.title && i < 10 && trimmedLine.length <= 30) {
          if (trimmedLine.includes('工程师') || trimmedLine.includes('开发') || 
              trimmedLine.includes('设计') || trimmedLine.includes('经理') ||
              trimmedLine.toLowerCase().includes('engineer') || 
              trimmedLine.toLowerCase().includes('developer')) {
            result.title = stripMarkdown(trimmedLine);
          }
        }
        break;
      }
    }
  }

  // 保存最后的记录
  if (currentExp) result.experience.push(currentExp);
  if (summaryLines.length > 0) result.summary = summaryLines.join('\n');

  // 智能默认值
  if (!result.name) result.name = '张三';
  if (!result.title) result.title = '软件工程师';
  if (!result.email) result.email = 'example@email.com';
  if (!result.phone) result.phone = '138-0000-0000';
  
  if (result.experience.length === 0) {
    result.experience.push({
      company: '某科技公司',
      role: '高级工程师',
      period: '2021.06 - 至今',
      location: '北京',
      highlights: [
        '主导核心业务系统重构，服务 QPS 提升 300%',
        '设计并实现分布式缓存方案，系统可用性达到 99.99%',
      ],
    });
  }
  
  if (result.education.length === 0) {
    result.education.push({
      school: '某某大学',
      degree: '本科',
      major: '计算机科学与技术',
      period: '2017.09 - 2021.06',
    });
  }
  
  if (result.skills.length === 0) {
    result.skills = ['Java', 'Spring Boot', 'MySQL', 'Redis'];
  }

  return result;
}

// 技术关键词列表，用于高亮
export const TECH_KEYWORDS = [
  'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Node.js',
  'Python', 'Java', 'Go', 'Rust', 'C++', 'Swift', 'Kotlin',
  'Redis', 'MySQL', 'PostgreSQL', 'MongoDB', 'Elasticsearch',
  'Kubernetes', 'Docker', 'AWS', 'GCP', 'Azure',
  'GraphQL', 'REST', 'gRPC', 'Kafka', 'RabbitMQ',
  'TensorFlow', 'PyTorch', 'Spark', 'Hadoop',
  'Spring Boot', 'MyBatis', 'JVM', 'HTML', 'CSS',
];
