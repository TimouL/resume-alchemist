export const INDUSTRIES = [
  { id: 'programmer', label: '程序员', icon: 'Code2', description: 'Java/Go/前端/全栈' },
  { id: 'pm', label: '产品经理', icon: 'Lightbulb', description: '产品规划/用户研究' },
  { id: 'designer', label: 'UI/UX设计师', icon: 'Palette', description: '视觉/交互设计' },
  { id: 'analyst', label: '数据分析师', icon: 'BarChart3', description: '数据分析/BI' },
  { id: 'marketing', label: '市场/运营', icon: 'Megaphone', description: '品牌/增长/内容' },
  { id: 'sales', label: '销售', icon: 'Handshake', description: '客户开发/商务' },
  { id: 'hr', label: 'HR', icon: 'Users', description: '招聘/组织发展' },
] as const;

export type IndustryId = typeof INDUSTRIES[number]['id'];

// 完整的行业深度配置
export interface IndustryConfig {
  id: IndustryId;
  name: string;
  dimensions: string[];
  expertModeName: string;
  expertStrategy: string;
  dataPlaceholders: string[];
  roastOpeners: string[];
}

export const INDUSTRY_CONFIG: Record<IndustryId, IndustryConfig> = {
  programmer: {
    id: 'programmer',
    name: '技术/程序员',
    dimensions: ['算法基础', '系统架构', '工程质量', '技术广度', '业务理解', '影响力'],
    expertModeName: '架构思维与技术壁垒版',
    expertStrategy: '强调高并发处理、系统稳定性、源码级理解、技术选型决策。突出对底层原理的掌握和架构设计的经验。',
    dataPlaceholders: [
      '[QPS 提升了 X%]',
      '[延迟降低了 Yms]',
      '[Crash率降低至 Z%]',
      '[节省服务器成本 W%]',
      '[代码覆盖率提升至 X%]',
      '[系统可用性达到 99.X%]',
    ],
    roastOpeners: [
      '你的简历堆砌了一堆技术名词，像个报菜名的服务员，看不出任何深度。',
      '这项目经历写得像记流水账，你是个打字员吗？',
      '看完你的简历，我只记住了你会用 CRUD，这就是你的核心竞争力？',
      '技术栈罗列了一整页，但我看不到任何一个你真正精通的。',
    ],
  },
  pm: {
    id: 'pm',
    name: '产品经理',
    dimensions: ['商业洞察', '用户体验', '数据分析', '项目管理', '沟通协调', '战略规划'],
    expertModeName: '商业闭环与产品战略版',
    expertStrategy: '强调 ROI（投资回报率）、GTM（上市策略）、Roadmap 规划、从 0 到 1 的破局能力。体现商业思维和战略视野。',
    dataPlaceholders: [
      '[DAU 提升了 X%]',
      '[用户留存率 +Y%]',
      '[转化率提升 Z%]',
      '[带来营收 W万]',
      '[NPS 提升 X 分]',
      '[功能使用率达到 Y%]',
    ],
    roastOpeners: [
      '我看不到任何商业思考，你只是个画原型的工具人吗？',
      "全是'参与了'、'协助了'，你的个人贡献在哪里？",
      '这简历像是在写工作日志，不是在证明你的产品能力。',
      '你的项目成果呢？我只看到了过程，没看到结果。',
    ],
  },
  designer: {
    id: 'designer',
    name: 'UI/UX设计师',
    dimensions: ['视觉表现', '交互逻辑', '用户同理心', '设计规范', '品牌理解', '工具效率'],
    expertModeName: '设计思维与用户体验版',
    expertStrategy: '强调 Design System（设计系统）的搭建、全链路设计、品牌一致性、设计对数据的赋能。体现从用户洞察到设计落地的闭环能力。',
    dataPlaceholders: [
      '[点击率 (CTR) 提升 X%]',
      '[改稿效率提升 Y%]',
      '[用户满意度 (NPS) +Z]',
      '[任务完成时间缩短 W%]',
      '[设计规范覆盖率达到 X%]',
      '[跳出率降低 Y%]',
    ],
    roastOpeners: [
      '这排版乱得像我在地铁上挤出来的。',
      '你的作品集看起来像是 5 年前的 Dribbble 练习稿，毫无落地性。',
      '我看不到任何用户思维，你确定你不是美工？',
      '设计好看有什么用，你能证明它有效吗？',
    ],
  },
  analyst: {
    id: 'analyst',
    name: '数据分析师',
    dimensions: ['统计学基础', '建模能力', '业务洞察', '数据可视化', 'SQL/Python', '决策支持'],
    expertModeName: '商业智能与决策驱动版',
    expertStrategy: '强调从数据中发现机会、归因分析、预测模型精准度、对战略决策的直接支撑。体现数据驱动业务增长的能力。',
    dataPlaceholders: [
      '[预测准确率达到 X%]',
      '[发现潜在营收机会 Y万]',
      '[报表自动化节约 Z小时/周]',
      '[数据异常检出率提升 W%]',
      '[分析效率提升 X%]',
      '[决策周期缩短 Y天]',
    ],
    roastOpeners: [
      '你只是个人肉取数机吗？我只看到了数字，没看到观点 (Insights)。',
      '这图表选得比我的午餐还随便。',
      'SQL 写得 6 有什么用，你的业务理解在哪里？',
      '分析了半天，结论就是"数据有待进一步观察"？',
    ],
  },
  marketing: {
    id: 'marketing',
    name: '市场/运营',
    dimensions: ['获客能力', '内容创意', '活动策划', '数据复盘', '渠道管理', '品牌建设'],
    expertModeName: '增长黑客与品牌操盘版',
    expertStrategy: '强调低成本获客、漏斗转化优化、私域流量运营、品牌声量引爆。体现增长思维和全链路运营能力。',
    dataPlaceholders: [
      '[ROI 达到 1:X]',
      '[获客成本 (CAC) 降低 Y%]',
      '[全网曝光量 Z万+]',
      '[GMV 增长 W%]',
      '[粉丝/用户增长 X万]',
      '[活动参与率达到 Y%]',
    ],
    roastOpeners: [
      '全是自嗨型的文案，我看不到任何转化逻辑。',
      '这简历像是在烧老板的钱，完全没有 ROI 意识。',
      '做了那么多活动，效果呢？数据呢？',
      '我看你很擅长"参与"，但不擅长"负责"。',
    ],
  },
  sales: {
    id: 'sales',
    name: '销售',
    dimensions: ['客户开发', '谈判技巧', '业绩达成', '渠道拓展', '客户维系', '销售管理'],
    expertModeName: '销冠策略与大客攻坚版',
    expertStrategy: '强调 KA 大客户攻单、销售漏斗管理、超额完成率、年度复合增长。体现销售策略思维和大客户经营能力。',
    dataPlaceholders: [
      '[业绩达成率 X%]',
      '[年度销售额 Y万]',
      '[签约行业头部客户 Z家]',
      '[回款率 W%]',
      '[客户续约率达到 X%]',
      '[新客户开发 Y家]',
    ],
    roastOpeners: [
      '你在写简历还是在写小说？我要看数字，不是看过程。',
      '连业绩目标都没写，你打算进去养老吗？',
      '这简历像在写工作汇报，不是在证明你能卖货。',
      '客户资源呢？成单周期呢？客单价呢？全是空话。',
    ],
  },
  hr: {
    id: 'hr',
    name: '人力资源',
    dimensions: ['招聘配置', '组织发展', '薪酬绩效', '员工关系', '企业文化', '流程合规'],
    expertModeName: '组织效能与人才战略版',
    expertStrategy: '强调 OD（组织发展）、人才梯队建设、人效提升、合规风险控制。体现战略人力资源管理能力。',
    dataPlaceholders: [
      '[招聘周期缩短 X天]',
      '[员工满意度提升 Y%]',
      '[核心人才流失率降低 Z%]',
      '[人效提升 W%]',
      '[招聘完成率达到 X%]',
      '[培训覆盖率达到 Y%]',
    ],
    roastOpeners: [
      '你看起来像个只会发通知的行政，而不是懂业务的 HRBP。',
      '我看不到你对组织效率的任何贡献。',
      '招了多少人？留存率多少？成本多少？数据呢？',
      '这简历像 HR 部门的工作说明书，不是你的能力证明。',
    ],
  },
};

// 获取行业配置的辅助函数
export function getIndustryConfig(industryId: string): IndustryConfig {
  return INDUSTRY_CONFIG[industryId as IndustryId] || INDUSTRY_CONFIG.programmer;
}

// 获取随机毒舌开场白
export function getRandomRoastOpener(industryId: string): string {
  const config = getIndustryConfig(industryId);
  const index = Math.floor(Math.random() * config.roastOpeners.length);
  return config.roastOpeners[index];
}
