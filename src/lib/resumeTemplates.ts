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

// 解析简历内容
export function parseResumeContent(content: string): ParsedResume {
  const lines = content.split('\n').filter(line => line.trim());
  
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
  let currentEdu: ParsedResume['education'][0] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测段落标题
    if (line.includes('工作经历') || line.includes('工作经验') || line.toLowerCase().includes('experience')) {
      currentSection = 'experience';
      continue;
    }
    if (line.includes('教育') || line.toLowerCase().includes('education') || line.includes('学历')) {
      currentSection = 'education';
      continue;
    }
    if (line.includes('技能') || line.toLowerCase().includes('skills') || line.includes('专业技能')) {
      currentSection = 'skills';
      continue;
    }
    if (line.includes('个人简介') || line.toLowerCase().includes('summary') || line.includes('自我评价') || line.includes('简介')) {
      currentSection = 'summary';
      continue;
    }
    if (line.includes('项目') || line.toLowerCase().includes('project')) {
      currentSection = 'projects';
      continue;
    }

    // 第一行通常是名字
    if (!result.name && i < 3) {
      if (line.length <= 10 && !line.includes('@') && !line.includes('http')) {
        result.name = line;
        continue;
      }
    }

    // 邮箱
    const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      result.email = emailMatch[0];
    }

    // 电话
    const phoneMatch = line.match(/1[3-9]\d{9}|(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch) {
      result.phone = phoneMatch[0];
    }

    // GitHub/LinkedIn 链接
    if (line.includes('github.com') || line.includes('linkedin.com')) {
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        result.links.push({
          label: line.includes('github') ? 'GitHub' : 'LinkedIn',
          url: urlMatch[0],
        });
      }
    }

    // 根据当前段落处理内容
    switch (currentSection) {
      case 'experience':
        if (line.includes('20') && (line.includes('-') || line.includes('至今') || line.toLowerCase().includes('present'))) {
          if (currentExp) {
            result.experience.push(currentExp);
          }
          currentExp = {
            company: lines[i - 1]?.trim() || '',
            role: '',
            period: line.match(/\d{4}.*?(至今|Present|\d{4})/i)?.[0] || line,
            highlights: [],
          };
        } else if (currentExp) {
          if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
            currentExp.highlights.push(line.replace(/^[-•*]\s*/, ''));
          } else if (!currentExp.role && line.length < 30) {
            currentExp.role = line;
          } else if (line.length > 10) {
            currentExp.highlights.push(line);
          }
        }
        break;

      case 'education':
        if (line.includes('大学') || line.includes('学院') || line.toLowerCase().includes('university') || line.toLowerCase().includes('college')) {
          if (currentEdu) {
            result.education.push(currentEdu);
          }
          currentEdu = {
            school: line,
            degree: '',
            period: '',
          };
        } else if (currentEdu) {
          if (line.includes('20') || line.includes('19')) {
            currentEdu.period = line;
          } else if (line.includes('学士') || line.includes('硕士') || line.includes('博士') || 
                     line.toLowerCase().includes('bachelor') || line.toLowerCase().includes('master') || line.toLowerCase().includes('phd')) {
            currentEdu.degree = line;
          }
        }
        break;

      case 'skills':
        if (line.includes('、') || line.includes(',') || line.includes('/')) {
          const skillItems = line.split(/[、,\/]/).map(s => s.trim()).filter(Boolean);
          result.skills.push(...skillItems);
        } else if (line.length < 50) {
          result.skills.push(line);
        }
        break;

      case 'summary':
        result.summary += (result.summary ? ' ' : '') + line;
        break;

      default:
        if (!result.title && i < 5 && line.length <= 20) {
          result.title = line;
        }
        break;
    }
  }

  // 保存最后的记录
  if (currentExp) result.experience.push(currentExp);
  if (currentEdu) result.education.push(currentEdu);

  // 智能默认值
  if (!result.name) result.name = '张三';
  if (!result.title) result.title = '高级软件工程师';
  if (!result.email) result.email = 'example@email.com';
  if (!result.phone) result.phone = '138-0000-0000';
  
  if (result.experience.length === 0) {
    result.experience.push({
      company: '某科技公司',
      role: '高级工程师',
      period: '2021.06 - 至今',
      location: '北京',
      highlights: [
        '主导核心业务系统重构，服务 QPS 提升 300%，P99 延迟降低 60%',
        '设计并实现分布式缓存方案，系统可用性达到 99.99%',
        '带领 5 人团队完成新业务上线，日活用户突破 100 万',
      ],
    });
  }
  
  if (result.education.length === 0) {
    result.education.push({
      school: '清华大学',
      degree: '计算机科学与技术',
      major: '硕士',
      period: '2017.09 - 2021.06',
    });
  }
  
  if (result.skills.length === 0) {
    result.skills = ['Java', 'Go', 'Python', 'React', 'TypeScript', 'Kubernetes', 'Redis', 'MySQL'];
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
];
