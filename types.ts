
export enum UserRole {
  ADMIN = 'ADMIN',
}

export type ResourceType = 
  | 'news' 
  | 'projects' 
  | 'services' 
  | 'branches' 
  | 'partners' 
  | 'honors' 
  | 'media' 
  | 'users' 
  | 'settings'
  | 'navigation'
  | 'team'
  | 'history'
  | 'tenders' 
  | 'performances' // Added performances resource
  | 'pages'
  | 'security';

export interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  permissions: Record<ResourceType, Permission>;
}

export interface User {
  id: string;
  username: string;
  name: string;
  roleId: string;
  avatar?: string;
  lastLogin?: string;
  // Security fields
  mfaEnabled?: boolean;
  phone?: string;
  email?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  imageUrl?: string;
  published: boolean;
}

export type TenderCategory = '招标公告' | '中标公告' | '其他公告';
export type TenderStatus = '报名中' | '进行中' | '已截止' | '公示中' | '已结束';

export interface TenderItem {
  id: string;
  title: string;
  projectNo: string;
  category: TenderCategory;
  region: string;
  date: string;
  deadline?: string;
  status: TenderStatus;
  content?: string;
}

// New Performance Types
export type PerformanceCategory = '招标代理' | '监理服务' | '造价咨询' | '其他咨询服务';

export interface PerformanceItem {
  id: string;
  title: string; // 项目名称
  category: PerformanceCategory;
  client: string; // 业主单位
  amount?: string; // 中标/合同金额
  date: string; // 时间
  content?: string; // 详细内容
  pdfUrl?: string; // PDF附件地址
  linkUrl?: string; // 外部网页链接
  isPublished: boolean;
}

export interface ProjectCase {
  id: string;
  title: string;
  category: string;
  description: string;
  content?: string; 
  imageUrl: string;
  location: string;
  date: string;
  isFeatured: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
  order: number;
}

export interface BranchCategory {
  id: string;
  name: string;
  order: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  coordinates: { lat: number; lng: number };
  categoryId: string;
}

export interface NavigationLink {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
}

export interface HistoryEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
}

export interface HonorCategory {
  id: string;
  name: string;
  order: number;
}

export interface Honor {
  id: string;
  title: string;
  issueDate: string;
  issuingAuthority: string;
  imageUrl: string;
  categoryId: string;
  content?: string; 
}

export interface Testimonial {
  id: string;
  content: string;
  author: string;
  position: string;
  company: string;
  avatarUrl: string;
}

export type AnimationTemplate = 'fireworks' | 'gold-rain' | 'confetti';

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  graphicLogoUrl: string;
  textLogoUrl: string;
  faviconUrl: string; 
  themeColor: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  copyrightText: string;
  // Anniversary Popup Settings
  enableAnniversary?: boolean; 
  anniversaryTitle?: string;
  anniversarySubtitle?: string;
  anniversaryBadgeLabel?: string;
  anniversaryTemplate?: AnimationTemplate; // New field
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  category: string;
  uploadDate: string;
  size?: string;
}

export interface MediaCategory {
  id: string;
  name: string;
  count: number;
}

export type SectionType = 'hero' | 'stats' | 'services' | 'projects' | 'honors' | 'process' | 'partners' | 'cta';

export interface HomeSectionConfig {
  id: string;
  type: SectionType;
  label: string;
  isVisible: boolean;
  order: number;
}

export interface FooterLink {
  id: string;
  name: string;
  path: string;
  isVisible: boolean;
}

// New Interface for Top Navigation
export interface TopNavLink {
  id: string;
  label: string;
  path: string;
  isVisible: boolean;
  order: number;
}

export interface PageContent {
  topNav: TopNavLink[]; // Added topNav
  headers: {
    about: PageHeaderConfig;
    services: PageHeaderConfig;
    cases: PageHeaderConfig;
    news: PageHeaderConfig;
    branches: PageHeaderConfig;
    contact: PageHeaderConfig;
    navigation: PageHeaderConfig;
    honors: PageHeaderConfig;
    tenders: PageHeaderConfig;
    performances: PageHeaderConfig;
  };
  footer: {
    quickLinks: FooterLink[];
    showContactInfo: boolean;
    showCopyright: boolean;
  };
  home: {
    layout: HomeSectionConfig[];
    hero: {
      badge: string;
      titleLine1: string;
      titleHighlight: string;
      description: string;
      bgImage: string;
      buttonText: string;
      buttonLink: string;
      secondaryButtonText: string;
      secondaryButtonLink: string;
    };
    stats: {
      stat1: { value: string; label: string };
      stat2: { value: string; label: string };
      stat3: { value: string; label: string };
      stat4: { value: string; label: string };
    };
    process: {
      title: string;
      description: string;
      steps: { title: string; desc: string }[];
    };
    cta: {
      title: string;
      description: string;
      buttonText: string;
      buttonLink: string;
    };
  };
  about: {
    intro: {
      title: string;
      content1: string;
      content2: string;
      imageUrl: string;
    };
    culture: {
      mission: string;
      values: string;
      management: string;
    };
  };
  services: {
    introStats: { icon: string; label: string; desc: string }[];
    faqs: { q: string; a: string }[];
  };
}

export interface PageHeaderConfig {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;      
  resource: string;    
  details: string;
  timestamp: string;
  ipAddress: string;   
  status: 'SUCCESS' | 'FAILURE';
}

export interface LoginAttempt {
  count: number;
  lastAttempt: number; 
  isLocked: boolean;
  lockUntil: number;   
}

export interface SecurityConfig {
  mfaEnabled: boolean;
  passwordMinLength: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
}
