
import { Branch, BranchCategory, HistoryEvent, Honor, HonorCategory, NavigationLink, NewsItem, Partner, ProjectCase, Role, Service, SiteSettings, TeamMember, Testimonial, User, ResourceType, MediaItem, PageContent, TenderItem, SecurityConfig, FooterLink, HomeSectionConfig, PageHeaderConfig, PerformanceItem } from './types';

// Helper to create full permissions
const fullAccess = { read: true, write: true, delete: true };
const readOnly = { read: true, write: false, delete: false };
const noAccess = { read: false, write: false, delete: false };

export const RESOURCES: {id: ResourceType, label: string}[] = [
  { id: 'pages', label: '页面内容' },
  { id: 'news', label: '新闻动态' },
  { id: 'tenders', label: '招标信息' },
  { id: 'performances', label: '企业业绩' }, 
  { id: 'projects', label: '项目案例' },
  { id: 'services', label: '业务服务' },
  { id: 'branches', label: '分支机构' },
  { id: 'partners', label: '合作伙伴' },
  { id: 'honors', label: '荣誉资质' },
  { id: 'team', label: '核心团队' },
  { id: 'history', label: '发展历程' },
  { id: 'navigation', label: '网址导航' },
  { id: 'media', label: '媒体资源' },
  { id: 'users', label: '用户与权限' },
  { id: 'settings', label: '系统设置' },
  { id: 'security', label: '安全合规审计' },
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role_admin',
    name: '超级管理员',
    description: '拥有系统所有功能的操作权限',
    isSystem: true,
    permissions: {
      pages: fullAccess,
      news: fullAccess,
      tenders: fullAccess,
      performances: fullAccess,
      projects: fullAccess,
      services: fullAccess,
      branches: fullAccess,
      partners: fullAccess,
      honors: fullAccess,
      team: fullAccess,
      history: fullAccess,
      media: fullAccess,
      navigation: fullAccess,
      users: fullAccess,
      settings: fullAccess,
      security: fullAccess,
    }
  },
  {
    id: 'role_editor',
    name: '内容编辑',
    description: '可以管理除系统设置和用户以外的所有内容',
    isSystem: false,
    permissions: {
      pages: fullAccess,
      news: fullAccess,
      tenders: fullAccess,
      performances: fullAccess,
      projects: fullAccess,
      services: fullAccess,
      branches: fullAccess,
      partners: fullAccess,
      honors: fullAccess,
      team: fullAccess,
      history: fullAccess,
      media: fullAccess,
      navigation: fullAccess,
      users: noAccess,
      settings: noAccess,
      security: noAccess,
    }
  },
  {
    id: 'role_viewer',
    name: '访客/只读',
    description: '只能查看后台数据，无法修改',
    isSystem: false,
    permissions: {
      pages: readOnly,
      news: readOnly,
      tenders: readOnly,
      performances: readOnly,
      projects: readOnly,
      services: readOnly,
      branches: readOnly,
      partners: readOnly,
      honors: readOnly,
      team: readOnly,
      history: readOnly,
      media: readOnly,
      navigation: readOnly,
      users: noAccess,
      settings: noAccess,
      security: noAccess,
    }
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    name: '系统管理员',
    roleId: 'role_admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    lastLogin: '2023-12-01 09:00',
    mfaEnabled: false,
    email: 'admin@yanyun.com',
    phone: '138****8888'
  }
];

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  mfaEnabled: false,
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  sessionTimeoutMinutes: 30
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: '江苏盐韵工程项目管理有限公司',
  logoUrl: '', 
  // 使用在线图标替代本地路径 - Updated per request
  graphicLogoUrl: '/image/logo/tuxing.png', 
  textLogoUrl: '/image/logo/wenzi.png', 
  faviconUrl: '/image/logo/tuxing.png', 
  themeColor: '#2C388B',
  contactPhone: '0515-88888888',
  contactEmail: 'office@jsyanyun.com',
  contactAddress: '江苏省盐城市盐都区世纪大道99号金融城5号楼12F',
  copyrightText: '© 2025 江苏盐韵工程项目管理有限公司 版权所有 苏ICP备12345678号',
  enableAnniversary: true, 
  anniversaryTitle: '盐韵八载 · 匠心传诚',
  anniversarySubtitle: '感恩一路同行，共鉴品质工程',
  anniversaryBadgeLabel: 'Est. 2017',
  anniversaryTemplate: 'fireworks'
};

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'm1',
    name: 'Logo - Graphics',
    url: '/image/logo/tuxing.png',
    type: 'image',
    category: 'site',
    uploadDate: '2025-01-01',
    size: '1.2 MB'
  },
  {
    id: 'm2',
    name: 'Logo - Text',
    url: '/image/logo/wenzi.png',
    type: 'image',
    category: 'site',
    uploadDate: '2025-01-01',
    size: '1.0 MB'
  },
  // Domain Certificates
  { id: 'm3', name: 'yanyun.cn Domain Cert', url: '/image/rongyu/yuming/yanyun.cn.jpg', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  { id: 'm4', name: 'yysjzx.com Domain Cert', url: '/image/rongyu/yuming/yysjzx.com.jpg', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  { id: 'm5', name: 'yanyun.wangzhi Domain Cert', url: '/image/rongyu/yuming/yanyun.wangzhi(1).png', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  { id: 'm6', name: 'yanyun.zhongguo Domain Cert', url: '/image/rongyu/yuming/yanyun.zhongguo.jpg', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  
  // ISO Certificates
  { id: 'm7', name: 'ISO9001 Quality Cert', url: '/image/rongyu/iso/zhiliang/江苏盐韵工程项目管理有限公司-QES证书【合并6张】_01.png', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '3 MB' },
  { id: 'm8', name: 'ISO14001 Env Cert', url: '/image/rongyu/iso/huanjing/江苏盐韵工程项目管理有限公司-QES证书【合并6张】_03.png', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '3 MB' },
  { id: 'm9', name: 'ISO45001 Health Cert', url: '/image/rongyu/iso/zhiye/江苏盐韵工程项目管理有限公司-QES证书【合并6张】_05.png', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '3 MB' },

  // Credit Certificates (AAA)
  { id: 'm10', name: 'AAA Credit Enterprise', url: '/image/rongyu/chengxin/江苏盐韵工程项目管理有限公司_AAA级信用企业_中文版_电子版.jpg', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  { id: 'm11', name: 'AAA Honest Supplier', url: '/image/rongyu/chengxin/江苏盐韵工程项目管理有限公司_AAA级诚信供应商_中文版_电子版.jpg', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  { id: 'm12', name: 'AAA Credit Enterprise (Plaque)', url: '/image/rongyu/chengxin/江苏盐韵工程项目管理有限公司_AAA级信用企业_牌匾版_电子版.jpg', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  { id: 'm13', name: 'AAA Contract Credit', url: '/image/rongyu/chengxin/江苏盐韵工程项目管理有限公司_AAA级重合同守信用企业_中文版_电子版.jpg', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },

  // Trademarks & Copyrights
  { id: 'm14', name: 'Software Copyright 1', url: '/image/rongyu/ruanzhu/企业管理信息安全维护平台V1.0证书文件-江苏盐韵工程项目管理有限公司(1)_01.png', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  { id: 'm15', name: 'Software Copyright 2', url: '/image/rongyu/ruanzhu/咨询管理综合服务软件V1.0证书文件-江苏盐韵工程项目管理有限公司_01.png', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  { id: 'm16', name: 'Trademark Class 37', url: '/image/rongyu/shangbiao/图形-37类-商标注册证_68004650_江苏盐韵工程项目管理有限公司_01.png', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  { id: 'm17', name: 'Trademark Class 35', url: '/image/rongyu/shangbiao/图形，商标注册证，35类，82529457，江苏盐韵工程项目管理有限公司_01.png', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  { id: 'm18', name: 'Yanyun Trademark 37', url: '/image/rongyu/shangbiao/盐韵-37类-商标注册证_68020680_江苏盐韵工程项目管理有限公司_01.png', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  
  // Other Honors
  { id: 'm19', name: 'Jiangsu Supervision Assoc Member', url: '/image/rongyu/rongyu/江苏监理协会会元单位【2023年8月】_01(1)(1).png', type: 'image', category: 'honor', uploadDate: '2024-01-01', size: '2 MB' },
  
  // Project Images (from 'any' folder)
  { id: 'm20', name: 'Project Site 1', url: '/image/any/微信图片_20220620172130.jpg', type: 'image', category: 'project', uploadDate: '2022-06-20', size: '3 MB' },
  { id: 'm21', name: 'Project Site 2', url: '/image/any/微信图片_20220620172142.jpg', type: 'image', category: 'project', uploadDate: '2022-06-20', size: '3 MB' },
  { id: 'm22', name: 'Project Site 3', url: '/image/any/微信图片_20220620172146.jpg', type: 'image', category: 'project', uploadDate: '2022-06-20', size: '3 MB' }
];

export const INITIAL_TENDERS: TenderItem[] = [
  {
    id: '1',
    title: '盐城市2024年度市政道路改造工程施工招标',
    projectNo: 'YC-2024-SZ001',
    category: '招标公告',
    region: '盐城市亭湖区',
    date: '2024-03-10',
    deadline: '2024-03-30',
    status: '报名中',
    content: '<h3>招标条件</h3><p>本招标项目盐城市2024年度市政道路改造工程已由盐城市发展和改革委员会批准建设...</p>'
  },
  {
    id: '2',
    title: '滨海县人民医院新院区医疗设备采购项目中标结果公示',
    projectNo: 'BH-2024-CG015',
    category: '中标公告',
    region: '盐城市滨海县',
    date: '2024-03-05',
    deadline: undefined,
    status: '公示中',
    content: '<h3>中标结果</h3><p>中标单位：江苏XX医疗器械有限公司...</p>'
  },
  {
    id: '3',
    title: '关于推迟大丰港物流园二期工程开标时间的通知',
    projectNo: 'DF-2024-GC008',
    category: '其他公告',
    region: '盐城市大丰区',
    date: '2024-03-08',
    deadline: undefined,
    status: '进行中',
    content: '<p>各投标人：</p><p>因招标文件技术参数调整，现决定推迟原定于...</p>'
  }
];

// Initial Performance Data
export const INITIAL_PERFORMANCES: PerformanceItem[] = [
  {
    id: '1',
    title: '盐城市快速路网三期工程招标代理',
    category: '招标代理',
    client: '盐城市市政公用投资有限公司',
    amount: '35.8 亿元',
    date: '2023-05-20',
    content: '<p>本项目为盐城市重点交通基础设施工程，我司负责全过程招标代理服务，包括施工、监理、检测等多个标段。</p>',
    isPublished: true
  },
  {
    id: '2',
    title: '江苏省沿海开发集团办公大楼装修工程监理',
    category: '监理服务',
    client: '江苏省沿海开发集团',
    amount: '1.2 亿元',
    date: '2023-08-15',
    content: '<p>对办公大楼内部精装修、智能化系统及消防工程进行全过程监理。</p>',
    isPublished: true
  },
  {
    id: '3',
    title: '亭湖区2023年度老旧小区改造项目全过程跟踪审计',
    category: '造价咨询',
    client: '亭湖区住房和城乡建设局',
    amount: '4.5 亿元',
    date: '2023-03-10',
    content: '<p>提供从预算编制、进度款审核到竣工结算的全过程造价控制服务。</p>',
    isPublished: true
  },
  {
    id: '4',
    title: '大丰港经济开发区产业规划咨询',
    category: '其他咨询服务',
    client: '大丰港经济开发区管委会',
    amount: '-',
    date: '2023-11-01',
    content: '<p>为开发区未来5年的产业布局提供可行性研究及战略咨询。</p>',
    isPublished: true
  },
  {
    id: '5',
    title: '射阳县人民医院新院区医疗设备采购招标',
    category: '招标代理',
    client: '射阳县人民医院',
    amount: '8000 万元',
    date: '2024-01-15',
    content: '<p>包含核磁共振、CT等大型医疗设备的国际招标代理。</p>',
    isPublished: true
  }
];

export const INITIAL_PAGE_CONTENT: PageContent = {
  topNav: [
    { id: 'nav_home', label: '首页', path: '/', isVisible: true, order: 1 },
    { id: 'nav_about', label: '关于盐韵', path: '/about', isVisible: true, order: 2 },
    { id: 'nav_honors', label: '荣誉资质', path: '/honors', isVisible: true, order: 3 },
    { id: 'nav_services', label: '业务领域', path: '/services', isVisible: true, order: 4 },
    { id: 'nav_cases', label: '经典案例', path: '/cases', isVisible: true, order: 5 },
    { id: 'nav_perf', label: '企业业绩', path: '/performances', isVisible: true, order: 6 },
    { id: 'nav_tenders', label: '招标信息', path: '/tenders', isVisible: true, order: 7 },
    { id: 'nav_news', label: '新闻动态', path: '/news', isVisible: true, order: 8 },
    { id: 'nav_nav', label: '网址导航', path: '/navigation', isVisible: true, order: 9 },
    { id: 'nav_branches', label: '分支机构', path: '/branches', isVisible: true, order: 10 },
  ],
  headers: {
    // 使用在线 Unsplash 图片替换本地 Banner
    about: { title: '品牌溯源', subtitle: '深耕工程管理八载，致力于成为卓越的资产全生命周期守护者', backgroundImage: 'https://youke2.picui.cn/s1/2025/12/26/694ea19144c6f.jpg' },
    services: { title: '核心业务', subtitle: '全过程工程咨询服务，以数字化技术赋能传统工程管理模式', backgroundImage: 'https://images.unsplash.com/photo-1581094794329-cd1096a7a2e8?q=80&w=2070&auto=format&fit=crop' },
    cases: { title: '经典案例', subtitle: '每一个精品工程，都是我们对“质量生命线”的庄严承诺', backgroundImage: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop' },
    news: { title: '行业动态', subtitle: '把握行业脉搏，传递盐韵声音', backgroundImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop' },
    branches: { title: '服务网络', subtitle: '立足江苏，辐射长三角，构建全方位的即时响应体系', backgroundImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop' },
    contact: { title: '联系我们', subtitle: '期待与您携手，共创价值。咨询热线：0515-88888888', backgroundImage: 'https://images.unsplash.com/photo-1423666639041-f140481d836a?q=80&w=2074&auto=format&fit=crop' },
    navigation: { title: '行业导航', subtitle: '为您整合行业政策及招投标入口', backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop' },
    honors: { title: '资质荣誉', subtitle: '权威认证是对专业主义的最佳背书', backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop' },
    tenders: { title: '招采频道', subtitle: '发布项目实时招标与中标讯息', backgroundImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop' },
    performances: { title: '企业业绩', subtitle: '用数据说话，见证每一次交付的承诺', backgroundImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop' }
  },
  home: {
    layout: [
      { id: 'hero', type: 'hero', label: '首屏视觉', isVisible: true, order: 1 },
      { id: 'stats', type: 'stats', label: '核心成就', isVisible: true, order: 2 },
      { id: 'process', type: 'process', label: '管理方法论', isVisible: true, order: 3 },
      { id: 'projects', type: 'projects', label: '精选案例', isVisible: true, order: 4 },
      { id: 'services', type: 'services', label: '核心业务', isVisible: true, order: 5 },
      { id: 'honors', type: 'honors', label: '荣誉资质', isVisible: true, order: 6 },
      { id: 'partners', type: 'partners', label: '合作伙伴', isVisible: true, order: 7 },
    ],
    hero: {
      badge: 'Smart Construction Management Expert',
      titleLine1: '数智化赋能',
      titleHighlight: '工程全生命周期管理',
      description: '江苏盐韵致力于打造“咨询+科技+运营”三位一体的工程管理新范式，为基建项目提供全闭环顾问服务。',
      // Hero Image
      bgImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
      buttonText: '探索服务体系',
      buttonLink: '/services',
      secondaryButtonText: '查看业绩库',
      secondaryButtonLink: '/cases'
    },
    stats: {
      stat1: { value: '8+', label: '载行业深耕' },
      stat2: { value: '500+', label: '标杆项目沉淀' },
      stat3: { value: '1000亿+', label: '咨询造价总额' },
      stat4: { value: '100%', label: '审计通过率' }
    },
    process: {
      title: '基于 Yy-PMS 的管理方法论',
      description: '我们将传统的工程监理、造价控制与现代数字化技术深度融合，实现从“事后纠偏”向“事前预警”的范式转变。',
      steps: [
        { title: '全景策划', desc: '基于大数据进行投资测算，识别法规红线。' },
        { title: '动态管控', desc: '应用现场 5D 实时监控，实现成本与进度的毫米级对齐。' },
        { title: '数字化移交', desc: '全套数字资产云端交付，无缝衔接后期运营。' }
      ]
    },
    cta: {
      title: '正在寻找专业的工程管理顾问？',
      description: '无论是全过程工程咨询还是专项代建管理，盐韵团队随时待命。',
      buttonText: '预约专家访谈',
      buttonLink: '/contact'
    }
  },
  about: {
    intro: {
      title: '不仅仅是监理，更是您的资产管家',
      content1: '江苏盐韵工程项目管理有限公司成立于2017年，是江苏省内成长速度最快的综合型工程咨询服务商之一。',
      content2: '我们不满足于传统的“三控三管一协调”，更在全行业率先推广“数智化工地”模型，为业主的每一分投资护航。',
      imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop'
    },
    culture: { mission: '为客户创造价值', values: '诚信、专业、创新', management: '基于客观数据的精准决策' }
  },
  services: {
    introStats: [
      { icon: 'Shield', label: '双甲级资质', desc: '国家级监理标准' },
      { icon: 'Clock', label: '4小时响应', desc: '全省即时部署' },
      { icon: 'TrendingUp', label: '降本增效', desc: '优化投资约5.2%' },
      { icon: 'Users', label: '专家智库', desc: '注师领衔团队' }
    ],
    faqs: [
      { q: '全过程工程咨询能为业主带来什么核心价值？', a: '消除信息孤岛，通过单一责任主体实现从立项到结算的闭环管控，通常能缩短工期10-15%，降低成本5-8%。' }
    ]
  },
  footer: {
    quickLinks: [
      { id: '1', name: '品牌故事', path: '/about', isVisible: true },
      { id: '2', name: '核心业务', path: '/services', isVisible: true },
      { id: '3', name: '经典案例', path: '/cases', isVisible: true },
      { id: '4', name: '招才纳士', path: '/careers', isVisible: true },
    ],
    showContactInfo: true,
    showCopyright: true
  }
};

export const INITIAL_NEWS: NewsItem[] = [
  { 
    id: '1', 
    title: '盐韵参与编制的《江苏省智慧工地管理标准》正式发布', 
    summary: '作为行业领先的数智化管理专家，标志着公司技术实力获得官方认可。', 
    content: '<p>近日...</p>', 
    date: '2025-01-20', 
    category: '公司新闻', 
    published: true, 
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop' 
  }
];

export const INITIAL_BRANCH_CATEGORIES: BranchCategory[] = [{ id: 'cat_hq', name: '总部及研发中心', order: 0 }];
export const INITIAL_BRANCHES: Branch[] = [{ id: '1', name: '盐韵总部', address: '盐城市金融城5号楼12F', phone: '0515-88888888', manager: '张总经理', coordinates: { lat: 33.347, lng: 120.163 }, categoryId: 'cat_hq' }];

export const INITIAL_LINKS: NavigationLink[] = [
  // 一、政府监管平台
  { id: '1', title: '江苏省住房和城乡建设厅', url: 'http://jsszfhcxjst.jiangsu.gov.cn/', category: '政府监管', description: '全省住建政策发布、企业资质查询、人员资格管理' },
  { id: '2', title: '盐城市住房和城乡建设局', url: 'http://zfhcxjsj.yancheng.gov.cn/', category: '政府监管', description: '本地住建政策、工程审批、市场监管、安全质量监督' },
  { id: '3', title: '江苏省公共资源交易网', url: 'http://jsggzy.jszwfw.gov.cn/', category: '政府监管', description: '全省工程招投标、政府采购、土地出让信息发布与交易' },
  { id: '4', title: '盐城市公共资源交易中心', url: 'https://ggzy.yancheng.gov.cn/', category: '政府监管', description: '本地工程招投标、政府采购信息发布与交易' },
  { id: '5', title: '江苏省建筑市场监管与诚信信息一体化平台', url: 'http://49.77.204.6:17001/Website/#/', category: '政府监管', description: '企业资质、人员注册、项目业绩、信用记录查询' },
  { id: '6', title: '盐城市交通运输局', url: 'https://ycjtj.yancheng.gov.cn/', category: '政府监管', description: '交通工程招投标、工程建设管理、公路水运工程监管' },
  { id: '7', title: '盐城市水利局', url: 'http://slj.yancheng.gov.cn/', category: '政府监管', description: '水利工程招投标、水利建设项目监管、水利工程质量监督' },
  { id: '8', title: '盐城市自然资源和规划局', url: 'http://zrzy.jiangsu.gov.cn/yc/', category: '政府监管', description: '土地出让、规划许可、不动产登记、地质勘察监管' },
  { id: '9', title: '江苏省建设工程质量监督网', url: 'http://www.jszljd.com', category: '政府监管', description: '工程质量监督、检测机构管理、质量事故通报' },
  { id: '10', title: '江苏省建设工程安全监督网', url: 'http://www.jscin.gov.cn/jsaj', category: '政府监管', description: '工程安全监管、安全生产许可证管理、安全事故通报' },

  // 二、招投标与采购平台
  { id: '11', title: '江苏建设工程招标网', url: 'http://www.jszb.com.cn/', category: '招投标采购', description: '全省建设工程招投标信息发布、招标文件下载、中标公示' },
  { id: '12', title: '江苏政府采购网', url: 'http://www.ccgp-jiangsu.gov.cn/', category: '招投标采购', description: '政府投资项目采购信息发布、采购文件下载、合同备案' },
  { id: '13', title: '盐城市建设工程招投标网', url: 'https://ycggzy.jszwfw.gov.cn/gb-web/#/login', category: '招投标采购', description: '盐城市建设工程招投标信息发布、投标、开标、评标' },
  { id: '14', title: '中国招标投标公共服务平台', url: 'http://gjpt.ahtba.org.cn/', category: '招投标采购', description: '全国招投标信息汇总、跨区域项目查询、行业监管' },
  { id: '15', title: '全国公共资源交易平台', url: 'https://www.ggzy.gov.cn/', category: '招投标采购', description: '全国公共资源交易信息集中发布、跨区域交易查询' },
  { id: '16', title: '云筑网', url: 'https://www.yzw.cn/', category: '招投标采购', description: '建筑行业招投标、供应链管理、企业采购服务' },
  { id: '17', title: '筑材网', url: 'https://www.zhucai.com/', category: '招投标采购', description: '建筑材料招投标采购、供应商管理、合同管理' },
  { id: '18', title: '中国通用招标网', url: 'https://www.china-tender.com.cn/', category: '招投标采购', description: '工程、货物、服务招标代理，招投标全流程服务' },
  { id: '19', title: '江苏省水利工程建设招标投标监督服务平台', url: 'https://jswater.jiangsu.gov.cn/col/col80020/', category: '招投标采购', description: '全省水利工程招投标信息发布与监管' },
  { id: '20', title: '盐城市政府采购网', url: 'http://zfcg.yancheng.gov.cn/', category: '招投标采购', description: '盐城市政府采购信息发布、采购文件下载、合同备案' },

  // 三、工程造价与材料信息
  { id: '21', title: '江苏省工程造价信息网', url: 'http://www.jszj.com.cn/', category: '造价与材料', description: '全省工程计价依据、材料价格信息、造价政策发布' },
  { id: '22', title: '盐城市工程造价信息网', url: 'https://www.costku.com/yancheng/', category: '造价与材料', description: '盐城市材料价格信息、工程造价政策、信息价查询下载' },
  { id: '23', title: '造价通(江苏站)', url: 'http://js.zjtcn.com', category: '造价与材料', description: '材料价格查询、询价、云造价服务、工程造价咨询' },
  { id: '24', title: '江苏省工程材料价格信息平台', url: 'https://jiangsu.gxzjxh.cn/', category: '造价与材料', description: '全省建材价格信息发布、价格指数查询、历史价格对比' },
  { id: '25', title: '盐城市建设工程材料价格信息平台', url: 'https://www.costku.com/36001.html', category: '造价与材料', description: '盐城市建材价格发布、价格动态监测、材料价格查询' },
  { id: '26', title: '江苏省交通工程定额站', url: 'http://jtyst.jiangsu.gov.cn/', category: '造价与材料', description: '交通工程造价依据、公路水运工程材料价格发布' },
  { id: '27', title: '江苏省水利工程造价管理网', url: 'https://jswater.jiangsu.gov.cn/col/col80021/', category: '造价与材料', description: '水利工程造价依据、水利工程材料价格发布' },
  { id: '28', title: '江苏造价信息网(速得材价)', url: 'https://www.jszjxh.com/', category: '造价与材料', description: '全省材料价格查询系统、"速得"材价APP下载' },

  // 四、工程技术资料与标准
  { id: '29', title: '建标知网', url: 'https://www.kscecs.com/', category: '技术资料', description: '工程建设法律法规、标准规范检索、在线阅读、下载' },
  { id: '30', title: '中国建筑标准设计研究院', url: 'http://www.cbsd.cn/', category: '技术资料', description: '国家标准图集、设计规范、施工标准发布与下载' },
  { id: '31', title: '江苏省工程建设标准网', url: 'https://pan.clooo.cn/%E8%B5%84%E6%96%99/000-%E8%A1%8C%E4%B8%9A%E8%A7%84%E8%8C%83%E5%9B%BE%E9%9B%86%E5%A4%A7%E5%85%A8/3-%E7%9C%81%E6%A0%87/13%E6%B1%9F%E8%8B%8F%E7%9C%81%E6%A0%87/', category: '技术资料', description: '江苏省工程建设地方标准发布、下载、查询' },
  { id: '32', title: '筑龙网', url: 'https://www.zhulong.com/', category: '技术资料', description: '工程资料下载、施工方案、技术交底、行业论坛交流' },
  { id: '33', title: '建库网', url: 'https://www.jianku.com/', category: '技术资料', description: '建筑图纸、设计方案、施工组织设计免费下载' },
  { id: '34', title: '中国建筑技术网', url: 'https://www.building.hc360.com/', category: '技术资料', description: '建筑技术资料、施工工艺、工程案例、技术标准查询' },

  // 五、BIM与工程技术应用
  { id: '35', title: '中国BIM门户', url: 'https://www.bimcn.org/', category: 'BIM与技术', description: 'BIM技术资讯、软件教程、应用案例、行业标准发布' },
  { id: '36', title: 'BIM建筑网', url: 'https://www.bimii.com/', category: 'BIM与技术', description: 'BIM技术推广、软件培训、项目咨询、行业交流平台' },
  { id: '37', title: '广联达BIM平台', url: 'https://bim.glodon.com/', category: 'BIM与技术', description: 'BIM软件下载、培训、项目协同、造价一体化解决方案' },
  { id: '38', title: '鲁班工程管理数字平台', url: 'https://www.luban.com/', category: 'BIM与技术', description: 'BIM模型管理、施工模拟、碰撞检测、进度控制' },
  { id: '39', title: '万间云-BIM数字建造平台', url: 'https://www.vanjian.com/', category: 'BIM与技术', description: 'BIM+IoT全生命周期管理、智慧工地、数字孪生应用' },

  // 六、工程人才与企业服务
  { id: '40', title: '江苏建设人才网', url: 'https://www.jsjsrc.com/', category: '人才与服务', description: '建筑人才招聘、求职、培训、证书挂靠、猎头服务' },
  { id: '41', title: '盐城市建筑人才网', url: 'https://www.ycjsrc.com/', category: '人才与服务', description: '盐城市本地建筑人才招聘、求职信息发布' },
  { id: '42', title: '江苏省人才服务云平台', url: 'https://www.jssrcfwypt.org.cn/', category: '人才与服务', description: '全省建筑人才招聘、人事代理、职称评定服务' },
  { id: '43', title: '建筑英才网(江苏站)', url: 'https://www.buildhr.com/jiangsu/', category: '人才与服务', description: '建筑行业专业人才招聘、求职、人才测评服务' },
  { id: '44', title: '江苏省工程咨询中心', url: 'https://www.cnjecc.com/', category: '人才与服务', description: '工程咨询、造价咨询、招标代理、项目管理、评估咨询' },
  { id: '45', title: '江苏省规划设计集团', url: 'https://www.jspdg.com/', category: '人才与服务', description: '规划设计、建筑设计、市政设计、工程总承包服务' },

  // 七、工程管理与施工服务
  { id: '46', title: '乐建宝工程项目管理平台', url: 'https://www.gcb365.com/', category: '工程管理', description: '施工项目管理、移动办公、智慧工地、劳务管理、数据分析' },
  { id: '47', title: '斗栱云工程管理系统', url: 'https://www.dougongyun.com/', category: '工程管理', description: '建筑总包、装饰、电力工程全流程管理解决方案' },
  { id: '48', title: '筑云科技-BIMCC数字建造平台', url: 'https://www.bimcc.net/', category: '工程管理', description: 'BIM+GIS+BIMVR多引擎技术、智慧工地、进度质量安全管理' },
  { id: '49', title: '江苏省工程档案资料管理系统', url: 'http://www.jsgcda.com/', category: '工程管理', description: '工程资料编制、归档、查询、档案验收服务' },
  { id: '50', title: '盐城市工程建设项目审批管理系统', url: 'https://yc.jszwfw.gov.cn/col/col181563/index.html', category: '工程管理', description: '工程建设项目一站式审批、在线申报、进度查询' },
];

// Use online logos for partners
export const INITIAL_PARTNERS: Partner[] = [
  // 一、市级国有投资平台
  { id: '101', name: '盐城城投集团', logoUrl: 'https://ui-avatars.com/api/?name=CT&background=random&size=128' },
  { id: '102', name: '盐城国投集团', logoUrl: 'https://ui-avatars.com/api/?name=GT&background=random&size=128' },
  { id: '103', name: '盐城交投集团', logoUrl: 'https://ui-avatars.com/api/?name=JT&background=random&size=128' },
  { id: '104', name: '盐城城镇化集团', logoUrl: 'https://ui-avatars.com/api/?name=CZ&background=random&size=128' },
  { id: '105', name: '盐城海兴集团', logoUrl: 'https://ui-avatars.com/api/?name=HX&background=random&size=128' },
  { id: '106', name: '悦达集团', logoUrl: 'https://ui-avatars.com/api/?name=YD&background=random&size=128' },
  { id: '107', name: '盐城东方集团', logoUrl: 'https://ui-avatars.com/api/?name=DF&background=random&size=128' },
  { id: '108', name: '盐城世纪新城集团', logoUrl: 'https://ui-avatars.com/api/?name=SJ&background=random&size=128' },
  { id: '109', name: '盐城高新区集团', logoUrl: 'https://ui-avatars.com/api/?name=GX&background=random&size=128' },
  { id: '110', name: '盐城港集团', logoUrl: 'https://ui-avatars.com/api/?name=YG&background=random&size=128' },

  // 二、县区级国有投资平台
  { id: '201', name: '亭湖城投集团', logoUrl: 'https://ui-avatars.com/api/?name=TH&background=random&size=128' },
  { id: '202', name: '盐都国资集团', logoUrl: 'https://ui-avatars.com/api/?name=YD&background=random&size=128' },
  { id: '203', name: '射阳城投公司', logoUrl: 'https://ui-avatars.com/api/?name=SY&background=random&size=128' },
  { id: '204', name: '阜宁投资集团', logoUrl: 'https://ui-avatars.com/api/?name=FN&background=random&size=128' },
  { id: '205', name: '滨海灌江集团', logoUrl: 'https://ui-avatars.com/api/?name=BH&background=random&size=128' },
  { id: '206', name: '响水灌江集团', logoUrl: 'https://ui-avatars.com/api/?name=XS&background=random&size=128' },
  { id: '207', name: '大丰城投集团', logoUrl: 'https://ui-avatars.com/api/?name=DF&background=random&size=128' },
  { id: '208', name: '大丰港开发集团', logoUrl: 'https://ui-avatars.com/api/?name=DG&background=random&size=128' },
  { id: '209', name: '建湖城投集团', logoUrl: 'https://ui-avatars.com/api/?name=JH&background=random&size=128' },
  { id: '210', name: '东台城投集团', logoUrl: 'https://ui-avatars.com/api/?name=DT&background=random&size=128' },

  // 三、专业领域投资主体
  { id: '301', name: '盐城水务集团', logoUrl: 'https://ui-avatars.com/api/?name=SW&background=random&size=128' },
  { id: '302', name: '盐城水利建设中心', logoUrl: 'https://ui-avatars.com/api/?name=SL&background=random&size=128' },
  { id: '303', name: '盐城公路中心', logoUrl: 'https://ui-avatars.com/api/?name=GL&background=random&size=128' },
  { id: '304', name: '盐城教育投资公司', logoUrl: 'https://ui-avatars.com/api/?name=JY&background=random&size=128' },
  { id: '305', name: '盐城卫健委', logoUrl: 'https://ui-avatars.com/api/?name=WJ&background=random&size=128' },
  { id: '306', name: '盐城资规局', logoUrl: 'https://ui-avatars.com/api/?name=ZG&background=random&size=128' },
  { id: '307', name: '盐城海关', logoUrl: 'https://ui-avatars.com/api/?name=HG&background=random&size=128' },
  { id: '308', name: '盐城机场', logoUrl: 'https://ui-avatars.com/api/?name=JC&background=random&size=128' },
  { id: '309', name: '盐城邮政局', logoUrl: 'https://ui-avatars.com/api/?name=YZ&background=random&size=128' },
  { id: '310', name: '盐城城北开投', logoUrl: 'https://ui-avatars.com/api/?name=CB&background=random&size=128' },

  // 四、央企及省属国企在盐分支机构
  { id: '401', name: '华润置地盐城公司', logoUrl: 'https://ui-avatars.com/api/?name=HR&background=random&size=128' },
  { id: '402', name: '中建一局盐城分公司', logoUrl: 'https://ui-avatars.com/api/?name=ZJ&background=random&size=128' },
  { id: '403', name: '中交二航局盐城公司', logoUrl: 'https://ui-avatars.com/api/?name=ZJ&background=random&size=128' },
  { id: '404', name: '中铁建工盐城分公司', logoUrl: 'https://ui-avatars.com/api/?name=ZT&background=random&size=128' },
  { id: '405', name: '中冶华天盐城分公司', logoUrl: 'https://ui-avatars.com/api/?name=ZY&background=random&size=128' },
  { id: '406', name: '中国十九冶盐城分公司', logoUrl: 'https://ui-avatars.com/api/?name=SY&background=random&size=128' },
  { id: '407', name: '中电建核电盐城分公司', logoUrl: 'https://ui-avatars.com/api/?name=ZD&background=random&size=128' },
  { id: '408', name: '中核华兴盐城分公司', logoUrl: 'https://ui-avatars.com/api/?name=ZH&background=random&size=128' },
  { id: '409', name: '江苏鸿源盐城分公司', logoUrl: 'https://ui-avatars.com/api/?name=HY&background=random&size=128' },
  { id: '410', name: '省交建局盐城指挥部', logoUrl: 'https://ui-avatars.com/api/?name=JJ&background=random&size=128' },

  // 五、产业园区及功能区开发主体
  { id: '501', name: '盐城经开区管委会', logoUrl: 'https://ui-avatars.com/api/?name=JK&background=random&size=128' },
  { id: '502', name: '盐城盐南高新区管委会', logoUrl: 'https://ui-avatars.com/api/?name=YN&background=random&size=128' },
  { id: '503', name: '盐城环保科技城管委会', logoUrl: 'https://ui-avatars.com/api/?name=HB&background=random&size=128' },
  { id: '504', name: '盐城黄海新区管委会', logoUrl: 'https://ui-avatars.com/api/?name=HH&background=random&size=128' },
  { id: '505', name: '常盐工业园管委会', logoUrl: 'https://ui-avatars.com/api/?name=CY&background=random&size=128' },

  // 六、知名房地产开发企业
  { id: '601', name: '宝龙地产盐城公司', logoUrl: 'https://ui-avatars.com/api/?name=BL&background=random&size=128' },
  { id: '602', name: '绿地盐城公司', logoUrl: 'https://ui-avatars.com/api/?name=LD&background=random&size=128' },
  { id: '603', name: '金地商置盐城公司', logoUrl: 'https://ui-avatars.com/api/?name=JD&background=random&size=128' },
  { id: '604', name: '碧桂园盐城公司', logoUrl: 'https://ui-avatars.com/api/?name=BG&background=random&size=128' },
  { id: '605', name: '江苏华兴集团', logoUrl: 'https://ui-avatars.com/api/?name=HX&background=random&size=128' }
];
export const INITIAL_TESTIMONIALS: Testimonial[] = [];
export const INITIAL_HONOR_CATEGORIES: HonorCategory[] = [
  { id: 'cat_domain', name: '域名证书', order: 1 },
  { id: 'cat_trademark', name: '商标著作', order: 2 },
  { id: 'cat_honor', name: '公司荣誉', order: 3 },
  { id: 'cat_qual', name: '资格证书', order: 4 },
  { id: 'cat_iso', name: 'ISO证书', order: 5 },
  { id: 'cat_aaa', name: 'AAA证书', order: 6 },
  { id: 'cat_grid', name: '国家电网服务类资信', order: 7 },
  { id: 'cat_other', name: '其他资质', order: 8 }
];

export const INITIAL_HONORS: Honor[] = [
  {
    id: '8',
    title: 'yanyun.cn 域名证书',
    issueDate: '2024',
    issuingAuthority: 'CNNIC',
    imageUrl: '/image/rongyu/yuming/yanyun.cn.jpg',
    categoryId: 'cat_domain'
  },
  {
    id: '9',
    title: 'yysjzx.com 域名证书',
    issueDate: '2024',
    issuingAuthority: 'CNNIC',
    imageUrl: '/image/rongyu/yuming/yysjzx.com.jpg',
    categoryId: 'cat_domain'
  },
  {
    id: '10',
    title: 'yanyun.wangzhi 域名证书',
    issueDate: '2024',
    issuingAuthority: 'CNNIC',
    imageUrl: '/image/rongyu/yuming/yanyun.wangzhi(1).png',
    categoryId: 'cat_domain'
  },
  {
    id: '11',
    title: 'yanyun.zhongguo 域名证书',
    issueDate: '2024',
    issuingAuthority: 'CNNIC',
    imageUrl: '/image/rongyu/yuming/yanyun.zhongguo.jpg',
    categoryId: 'cat_domain'
  },
  {
    id: '12',
    title: '江苏省建设监理与招投标协会年度会员',
    issueDate: '2024',
    issuingAuthority: '江苏省建设监理与招投标协会',
    imageUrl: '/image/rongyu/rongyu/江苏监理协会会元单位【2023年8月】_01(1)(1).png',
    categoryId: 'cat_honor'
  },
  {
    id: '13',
    title: '企业管理信息安全维护平台V1.0',
    issueDate: '2024',
    issuingAuthority: '国家版权局',
    imageUrl: '/image/rongyu/ruanzhu/企业管理信息安全维护平台V1.0证书文件-江苏盐韵工程项目管理有限公司(1)_01.png',
    categoryId: 'cat_trademark'
  },
  {
    id: '14',
    title: '咨询管理综合服务软件V1.0',
    issueDate: '2024',
    issuingAuthority: '国家版权局',
    imageUrl: '/image/rongyu/ruanzhu/咨询管理综合服务软件V1.0证书文件-江苏盐韵工程项目管理有限公司_01.png',
    categoryId: 'cat_trademark'
  },
  {
    id: '15',
    title: '商标注册证-37类',
    issueDate: '2024',
    issuingAuthority: '国家知识产权局',
    imageUrl: '/image/rongyu/shangbiao/图形-37类-商标注册证_68004650_江苏盐韵工程项目管理有限公司_01.png',
    categoryId: 'cat_trademark'
  },
  {
    id: '16',
    title: '商标注册证-35类',
    issueDate: '2024',
    issuingAuthority: '国家知识产权局',
    imageUrl: '/image/rongyu/shangbiao/图形，商标注册证，35类，82529457，江苏盐韵工程项目管理有限公司_01.png',
    categoryId: 'cat_trademark'
  },
  {
    id: '17',
    title: '商标注册证-39类',
    issueDate: '2024',
    issuingAuthority: '国家知识产权局',
    imageUrl: '/image/rongyu/shangbiao/图形，商标注册证，39类，82538229，江苏盐韵工程项目管理有限公司_01.png',
    categoryId: 'cat_trademark'
  },
  {
    id: '18',
    title: '商标注册证-41类',
    issueDate: '2024',
    issuingAuthority: '国家知识产权局',
    imageUrl: '/image/rongyu/shangbiao/图形，商标注册证，41类，82547186，江苏盐韵工程项目管理有限公司_01.png',
    categoryId: 'cat_trademark'
  },
  {
    id: '19',
    title: '商标注册证-42类',
    issueDate: '2024',
    issuingAuthority: '国家知识产权局',
    imageUrl: '/image/rongyu/shangbiao/图形，商标注册证，42类，82526056，江苏盐韵工程项目管理有限公司_01.png',
    categoryId: 'cat_trademark'
  },
  {
    id: '20',
    title: '盐韵-37类-商标注册证',
    issueDate: '2024',
    issuingAuthority: '国家知识产权局',
    imageUrl: '/image/rongyu/shangbiao/盐韵-37类-商标注册证_68020680_江苏盐韵工程项目管理有限公司_01.png',
    categoryId: 'cat_trademark'
  },
  {
    id: '21',
    title: '盐韵-45类-商标注册证',
    issueDate: '2024',
    issuingAuthority: '国家知识产权局',
    imageUrl: '/image/rongyu/shangbiao/盐韵，商标注册证，45类，82439577，江苏盐韵工程项目管理有限公司_01.png',
    categoryId: 'cat_trademark'
  },
  {
    id: '23',
    title: 'ISO9001 质量管理体系认证证书',
    issueDate: '2024',
    issuingAuthority: '认证中心',
    imageUrl: '/image/rongyu/iso/zhiliang/江苏盐韵工程项目管理有限公司-QES证书【合并6张】_01.png',
    categoryId: 'cat_iso'
  },
  {
    id: '24',
    title: 'ISO14001 环境管理体系认证证书',
    issueDate: '2024',
    issuingAuthority: '认证中心',
    imageUrl: '/image/rongyu/iso/huanjing/江苏盐韵工程项目管理有限公司-QES证书【合并6张】_03.png',
    categoryId: 'cat_iso'
  },
  {
    id: '25',
    title: 'ISO45001 职业健康安全管理体系认证证书',
    issueDate: '2024',
    issuingAuthority: '认证中心',
    imageUrl: '/image/rongyu/iso/zhiye/江苏盐韵工程项目管理有限公司-QES证书【合并6张】_05.png',
    categoryId: 'cat_iso'
  },
  {
    id: '26',
    title: 'AAA级信用企业',
    issueDate: '2024',
    issuingAuthority: '中国企业信用等级评价中心',
    imageUrl: '/image/rongyu/chengxin/江苏盐韵工程项目管理有限公司_AAA级信用企业_中文版_电子版.jpg',
    categoryId: 'cat_aaa'
  },
  {
    id: '27',
    title: 'AAA级诚信供应商',
    issueDate: '2024',
    issuingAuthority: '中国企业信用等级评价中心',
    imageUrl: '/image/rongyu/chengxin/江苏盐韵工程项目管理有限公司_AAA级诚信供应商_中文版_电子版.jpg',
    categoryId: 'cat_aaa'
  },
  {
    id: '28',
    title: 'AAA级资信企业',
    issueDate: '2024',
    issuingAuthority: '中国企业信用等级评价中心',
    imageUrl: '/image/rongyu/chengxin/江苏盐韵工程项目管理有限公司_AAA级资信企业_中文版_电子版.jpg',
    categoryId: 'cat_aaa'
  },
  {
    id: '29',
    title: 'AAA级重合同守信用企业',
    issueDate: '2024',
    issuingAuthority: '中国企业信用等级评价中心',
    imageUrl: '/image/rongyu/chengxin/江苏盐韵工程项目管理有限公司_AAA级重合同守信用企业_中文版_电子版.jpg',
    categoryId: 'cat_aaa'
  }
];

export const INITIAL_SERVICES: Service[] = [
  { 
    id: '1', 
    title: '建设工程监理服务', 
    description: '提供房屋建筑与市政公用工程的全方位现场监理。通过“四控两管一协调”，确保工程质量、安全、进度与投资控制符合国家规范与合同要求。', 
    features: ['施工全过程旁站监督', '隐蔽工程严格验收', '安全隐患排查治理', '工程档案同步管理'], 
    icon: 'hard-hat', 
    order: 1 
  },
  { 
    id: '2', 
    title: '工程项目管理服务', 
    description: '为业主提供从项目立项、报批、设计管理、施工管理到竣工验收交付的全生命周期代建与管理服务（PMC），实现真正的“交钥匙”工程。', 
    features: ['全生命周期策划', '报批报建一站式服务', '设计施工一体化协调', '投资进度双重控制'], 
    icon: 'kanban', 
    order: 2 
  },
  { 
    id: '3', 
    title: '政府采购代理服务', 
    description: '依据《政府采购法》为各级国家机关、事业单位及团体组织提供货物、工程和服务的采购代理服务，确保采购过程规范、透明、高效。', 
    features: ['采购需求合规性审查', '采购文件标准化编制', '全流程电子化交易', '履约验收协助服务'], 
    icon: 'landmark', 
    order: 3 
  },
  { 
    id: '4', 
    title: '工程招标代理服务', 
    description: '为各类土木工程、建筑工程、线路管道及设备安装工程提供专业的勘察、设计、施工、监理及重要设备材料的招标代理服务。', 
    features: ['招标方案科学策划', '招标文件严谨编制', '开评标过程严密组织', '异议质疑专业处理'], 
    icon: 'gavel', 
    order: 4 
  },
  { 
    id: '5', 
    title: '工程造价咨询服务', 
    description: '提供投资估算、设计概算、施工图预算、工程量清单编制、招标控制价编制、工程结算审核及全过程造价跟踪咨询服务。', 
    features: ['投资估算精准编制', '工程量清单复核', '全过程造价动态监控', '竣工结算严格审计'], 
    icon: 'calculator', 
    order: 5 
  },
  { 
    id: '6', 
    title: '工程司法鉴定服务', 
    description: '接受人民法院或仲裁机构委托，对建设工程纠纷中的工程质量缺陷、造价争议、工期延误等专门性问题进行检测、鉴别和判断并提供鉴定意见。', 
    features: ['工程质量缺陷鉴定', '工程造价争议鉴定', '工程修复方案评估', '权威客观鉴定报告'], 
    icon: 'scale', 
    order: 6 
  }
];

export const INITIAL_PROJECTS: ProjectCase[] = [
  { 
    id: '1', 
    title: '盐城大数据中心三期扩建项目', 
    category: '公共建筑', 
    description: '省重点基建工程，总投资超15亿元，应用 BIM+IoT 技术实现数智化移交。', 
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef526bca4852?q=80&w=2068&auto=format&fit=crop', 
    location: '盐城市城南新区', 
    date: '2024-12', 
    isFeatured: true 
  },
  { 
    id: '2', 
    title: '南通金融城超高层综合体监理', 
    category: '综合商业', 
    description: '200米级超高层建筑，包含复杂钢结构及深基坑作业，盐韵负责全过程监理。', 
    imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070&auto=format&fit=crop', 
    location: '南通市崇川区', 
    date: '2023-11', 
    isFeatured: true 
  },
  {
    id: '3',
    title: '悦达起亚三工厂智能车间改造',
    category: '工业厂房',
    description: '涉及高精度设备基础施工与钢结构大跨度吊装，工期紧任务重。',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
    location: '盐城经济开发区',
    date: '2023-08',
    isFeatured: true
  },
  {
    id: '4',
    title: '盐城高铁站综合交通枢纽',
    category: '基础设施',
    description: '集高铁、长途客运、公交、出租于一体的城市交通核心，获鲁班奖提名。',
    imageUrl: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?q=80&w=2070&auto=format&fit=crop',
    location: '盐城市亭湖区',
    date: '2022-05',
    isFeatured: true
  },
  {
    id: '5',
    title: '中韩(盐城)产业园未来科技城',
    category: '公共建筑',
    description: '园区地标性建筑群，包含研发中心、展示中心及人才公寓，采用绿色建筑三星标准。',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop',
    location: '盐城河东新区',
    date: '2023-01',
    isFeatured: true
  },
  {
    id: '6',
    title: '大丰港深水航道整治工程',
    category: '基础设施',
    description: '省重点水运工程，监理团队克服海上作业恶劣环境，确保工程按期完工。',
    imageUrl: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=2009&auto=format&fit=crop',
    location: '盐城市大丰区',
    date: '2021-12',
    isFeatured: true
  },
  {
    id: '7',
    title: '射阳县人民医院异地新建项目',
    category: '公共建筑',
    description: '三级甲等综合医院标准建设，包含门诊楼、住院楼及感染楼，总建筑面积18万平米。',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop',
    location: '盐城市射阳县',
    date: '2024-02',
    isFeatured: true
  }
];

export const COMPANY_HISTORY: HistoryEvent[] = [
  { id: '1', year: '2017', title: '品牌创立', description: '江苏盐韵在盐城金融城正式启航，确立“以专业求生存”的发展理念。' },
  { id: '2', year: '2019', title: '资质跨越', description: '成功获批国家房屋建筑工程监理甲级资质，开启全省化布局。' },
  { id: '3', year: '2021', title: '数智转型', description: '全面上线 Yy-PMS 智慧工程管理系统，实现监理作业数字化、云端化。' },
  { id: '4', year: '2025', title: '八载辉煌', description: '累计咨询项目总造价突破1000亿元，正式迈入全过程工程咨询2.0时代。' }
];

export const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: '张伟', role: '总经理 / 国家注册监理工程师', description: '25年基建管理经验，曾主导多项省优、部优工程项目。', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop' },
  { id: '2', name: '李静', role: '技术总监 / 国家注册造价工程师', description: '精通全过程造价管控，主持过超过50个大型项目的预决算审计。', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop' }
];
