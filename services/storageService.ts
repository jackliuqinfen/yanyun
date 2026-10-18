
import { 
  INITIAL_BRANCHES, 
  INITIAL_LINKS, 
  INITIAL_NEWS, 
  INITIAL_PROJECTS, 
  INITIAL_SERVICES, 
  INITIAL_PARTNERS, 
  INITIAL_HONORS, 
  INITIAL_HONOR_CATEGORIES,
  INITIAL_BRANCH_CATEGORIES,
  DEFAULT_SITE_SETTINGS,
  INITIAL_ROLES,
  INITIAL_USERS,
  INITIAL_MEDIA,
  INITIAL_PAGE_CONTENT,
  INITIAL_TEAM,
  COMPANY_HISTORY,
  INITIAL_TENDERS,
  INITIAL_PERFORMANCES,
  DEFAULT_SECURITY_CONFIG
} from '../constants';
import { 
  Branch, 
  BranchCategory,
  NavigationLink, 
  NewsItem, 
  ProjectCase, 
  Service, 
  User, 
  Partner, 
  Honor, 
  HonorCategory,
  SiteSettings,
  Role,
  MediaItem,
  MediaCategory,
  PageContent,
  TeamMember,
  HistoryEvent,
  TenderItem,
  PerformanceItem,
  AuditLog,
  LoginAttempt,
  SecurityConfig
} from '../types';
import { createAuditLogEntry } from '../utils/security';
import JSZip from 'jszip';
import { assetUrl } from '../utils/assetUrl';

function withAssetUrls<T>(value: T): T {
  if (typeof value === 'string') return assetUrl(value) as T;
  if (Array.isArray(value)) return value.map(withAssetUrls) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withAssetUrls(item)])) as T;
  }
  return value;
}

const KEYS = {
  NEWS: 'yanyun_news_v4',
  PROJECTS: 'yanyun_projects_v4',
  SERVICES: 'yanyun_services_v4',
  BRANCHES: 'yanyun_branches_v4',
  BRANCH_CATEGORIES: 'yanyun_branch_categories_v4',
  LINKS: 'yanyun_links_v4',
  PARTNERS: 'yanyun_partners_v4',
  HONORS: 'yanyun_honors_v4',
  HONOR_CATEGORIES: 'yanyun_honor_categories_v4',
  AUTH_TOKEN: 'yanyun_auth_token_v4',
  CURRENT_USER: 'yanyun_current_user_v4',
  USERS: 'yanyun_users_v4',
  ROLES: 'yanyun_roles_v4',
  SETTINGS: 'yanyun_settings_v4',
  MEDIA: 'yanyun_media_v4',
  PAGE_CONTENT: 'yanyun_page_content_v4',
  TEAM: 'yanyun_team_v4',
  HISTORY: 'yanyun_history_v4',
  TENDERS: 'yanyun_tenders_v4',
  PERFORMANCES: 'yanyun_performances_v4',
  AUDIT_LOGS: 'yanyun_audit_logs_v4', 
  LOGIN_ATTEMPTS: 'yanyun_login_attempts_v4', 
  SECURITY_CONFIG: 'yanyun_security_config_v4' 
};

// Map keys to initial data
const INITIAL_DATA_MAP: Record<string, any> = {
  [KEYS.NEWS]: INITIAL_NEWS,
  [KEYS.PROJECTS]: INITIAL_PROJECTS,
  [KEYS.SERVICES]: INITIAL_SERVICES,
  [KEYS.BRANCHES]: INITIAL_BRANCHES,
  [KEYS.BRANCH_CATEGORIES]: INITIAL_BRANCH_CATEGORIES,
  [KEYS.LINKS]: INITIAL_LINKS,
  [KEYS.PARTNERS]: INITIAL_PARTNERS,
  [KEYS.HONORS]: INITIAL_HONORS,
  [KEYS.HONOR_CATEGORIES]: INITIAL_HONOR_CATEGORIES,
  [KEYS.ROLES]: INITIAL_ROLES,
  [KEYS.USERS]: INITIAL_USERS,
  [KEYS.MEDIA]: INITIAL_MEDIA,
  [KEYS.PAGE_CONTENT]: INITIAL_PAGE_CONTENT,
  [KEYS.TEAM]: INITIAL_TEAM,
  [KEYS.HISTORY]: COMPANY_HISTORY,
  [KEYS.TENDERS]: INITIAL_TENDERS,
  [KEYS.PERFORMANCES]: INITIAL_PERFORMANCES,
  [KEYS.SETTINGS]: DEFAULT_SITE_SETTINGS,
  [KEYS.SECURITY_CONFIG]: DEFAULT_SECURITY_CONFIG,
  [KEYS.AUDIT_LOGS]: [],
  [KEYS.LOGIN_ATTEMPTS]: {}
};

// Using relative path to allow Nginx to proxy
const API_ENDPOINT = '/api/kv';
// 媒体上传走 Node.js 云函数直传阿里云 OSS
const FILE_API_ENDPOINT = '/api/upload';
const HEALTH_ENDPOINT = '/api/health';

let isCloudAvailable = false;
let initialHealthCheck: Promise<void> | null = null;
const ensureCloudChecked = () => {
  if (!initialHealthCheck) {
    initialHealthCheck = storageService.checkHealth().then(() => undefined);
  }
  return initialHealthCheck;
};

const markCloudUnavailable = (reason?: string) => {
  if (isCloudAvailable) {
    isCloudAvailable = false;
    window.dispatchEvent(new Event('storageStatusChanged'));
    console.error(`[Storage] ⚠️ Cloud Disconnected: ${reason}`);
  }
};

export const storageService = {
  getSystemStatus: () => ({
    mode: isCloudAvailable ? 'CLOUD_SYNC' : 'LOCAL_ONLY',
    isOnline: navigator.onLine,
  }),

  // 手动健康检查：在 AdminLayout 中调用
  checkHealth: async (): Promise<{ status: 'ok' | 'error', message: string }> => {
    try {
        // 尝试连接后端健康检查接口
        const response = await fetch(HEALTH_ENDPOINT, { method: 'GET', cache: 'no-store' });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok') {
                isCloudAvailable = true;
                window.dispatchEvent(new Event('storageStatusChanged'));
                return { status: 'ok', message: '数据库连接正常，系统运行中。' };
            } else {
                markCloudUnavailable('Health check returned an error');
                return { status: 'error', message: `数据库连接失败: ${data.db_error}` };
            }
        } else {
            markCloudUnavailable(`Health check HTTP ${response.status}`);
            return { status: 'error', message: `后端服务异常 (HTTP ${response.status})` };
        }
    } catch (e: any) {
        markCloudUnavailable(e.message);
        return { status: 'error', message: `无法连接后端服务: ${e.message}` };
    }
  },

  async get<T>(key: string): Promise<T[]> {
    await ensureCloudChecked();
    // 默认回退到本地数据
    const getFallback = () => {
        const local = localStorage.getItem(key);
        return withAssetUrls(local ? JSON.parse(local) : (INITIAL_DATA_MAP[key] || []));
    };

    if (!isCloudAvailable) return getFallback();

    try {
      const response = await fetch(`${API_ENDPOINT}?key=${key}&t=${Date.now()}`, { 
        method: 'GET',
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
         if (response.status !== 404) markCloudUnavailable(`Fetch Error ${response.status}`);
         return getFallback();
      }

      const data = await response.json();
      if (data === null) return getFallback();
      
      // 更新本地缓存以备不时之需
      const resolved = withAssetUrls(data);
      localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    } catch (error: any) {
      markCloudUnavailable(`Network Error: ${error.message}`);
      return getFallback();
    }
  },

  async save<T>(key: string, items: T[]): Promise<void> {
    await ensureCloudChecked();
    // 1. 总是先存本地，保证 UI 响应快
    localStorage.setItem(key, JSON.stringify(items));

    // 2. 尝试同步到云端
    if (isCloudAvailable) {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ key, value: items }),
            });

            if (!response.ok) {
                console.error(`[Storage] Save Failed (${response.status})`);
                markCloudUnavailable(`Save failed: ${response.statusText}`);
                alert("⚠️ 数据保存到服务器失败！请检查数据库连接。当前数据仅保存在浏览器本地。");
            }
        } catch (err: any) {
            console.error("[Storage] Network Error:", err);
            markCloudUnavailable(`Network error: ${err.message}`);
        }
    } else {
        console.warn("[Storage] Offline mode, data saved locally only.");
    }
    return Promise.resolve();
  },

  // 核心：上传文件
  async uploadAsset(file: File): Promise<string> {
    await ensureCloudChecked();
    // 严格模式：如果不在线，直接报错，不给转 Base64 的机会
    if (!isCloudAvailable) {
        throw new Error("服务器未连接，无法上传文件。请检查后端状态。");
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(FILE_API_ENDPOINT, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData,
            });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server Upload Error: ${response.status} ${errText}`);
        }
        
        const res = await response.json();
        // 返回已绑定的 OSS 资源域名地址
        return res.url; 
    } catch (error: any) {
        console.error("Upload Asset Error", error);
        throw error;
    }
  },

  // ... (保留导出/导入/登录等其他方法不变) ...
  exportSystemData: async () => {
    const data: Record<string, any> = {};
    for (const key of Object.values(KEYS)) {
        if (key !== KEYS.AUTH_TOKEN) {
            data[key] = await storageService.get(key);
        }
    }
    return JSON.stringify(data, null, 2);
  },

  createFullBackup: async (onProgress?: (msg: string) => void) => {
    const zip = new JSZip();
    const dataFolder = zip.folder("data");
    const assetsFolder = zip.folder("assets");
    
    onProgress?.("正在聚合结构化数据...");
    const systemData: Record<string, any> = {};
    for (const key of Object.values(KEYS)) {
       if (key !== KEYS.AUTH_TOKEN) systemData[key] = await storageService.get(key);
    }
    dataFolder?.file("database.json", JSON.stringify(systemData, null, 2));

    const assetRegex = /\/files\/([a-zA-Z0-9_.-]+)/g; 
    const assets = new Set<string>();
    const fullJson = JSON.stringify(systemData);
    let match;
    while ((match = assetRegex.exec(fullJson)) !== null) assets.add(match[1]);

    const assetKeys = Array.from(assets);
    onProgress?.(`正在下载 ${assetKeys.length} 个媒体文件...`);

    for (let i = 0; i < assetKeys.length; i++) {
       try {
          const res = await fetch(`/files/${assetKeys[i]}`);
          if (res.ok) assetsFolder?.file(assetKeys[i], await res.blob());
          onProgress?.(`备份进度: ${i+1}/${assetKeys.length}`);
       } catch (e) {}
    }

    onProgress?.("正在生成 ZIP 压缩包...");
    return await zip.generateAsync({ type: "blob" });
  },

  importSystemData: async (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      for (const key in data) {
         if (Object.values(KEYS).includes(key)) await storageService.save(key, data[key]);
      }
      return { success: true };
    } catch (e) {
      return { success: false, message: "文件格式无效" };
    }
  },

  getStorageUsage: () => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) total += (localStorage[key].length + key.length) * 2;
    }
    return (total / 1024).toFixed(2);
  },

  getSecurityConfig: async (): Promise<SecurityConfig> => {
    const s = await storageService.get<SecurityConfig>(KEYS.SECURITY_CONFIG);
    return Array.isArray(s) ? (s[0] || DEFAULT_SECURITY_CONFIG) : (s || DEFAULT_SECURITY_CONFIG);
  },

  saveSecurityConfig: async (config: SecurityConfig) => {
    await storageService.save(KEYS.SECURITY_CONFIG, [config] as any);
  },

  logAction: async (action: string, resource: string, details: string, status: 'SUCCESS' | 'FAILURE') => {
    const user = storageService.getCurrentUser();
    const log = createAuditLogEntry(user?.id || 'sys', user?.name || 'Guest', action, resource, details, status);
    storageService.getAuditLogs().then(logs => {
        storageService.save(KEYS.AUDIT_LOGS, [log, ...logs].slice(0, 1000));
    });
  },

  getAuditLogs: () => storageService.get<AuditLog>(KEYS.AUDIT_LOGS),

  login: async (u: string, p: string): Promise<{ success: boolean; message?: string; mfaRequired?: boolean }> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      const result = await response.json();
      if (!response.ok) return { success: false, message: result.error || '登录失败' };
      const user = { ...INITIAL_USERS[0], username: result.username, name: result.username };
      sessionStorage.setItem(KEYS.AUTH_TOKEN, 'active');
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true, mfaRequired: false };
    } catch {
      return { success: false, message: '登录服务暂时不可用' };
    }
  },

  verifyMfa: async (username: string, code: string): Promise<{ success: boolean; message?: string }> => {
    return { success: false, message: '当前未启用动态验证码，请使用账号密码登录' };
  },

  logout: () => {
    void fetch('/api/auth?action=logout', { method: 'POST', credentials: 'same-origin' });
    sessionStorage.removeItem(KEYS.AUTH_TOKEN);
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  isAuthenticated: () => !!sessionStorage.getItem(KEYS.AUTH_TOKEN),
  checkSession: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return false;
      const result = await response.json();
      return result.authenticated === true;
    } catch { return false; }
  },
  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  },

  getCurrentUserRole: async (): Promise<Role | null> => {
    const user = storageService.getCurrentUser();
    if (!user) return null;
    const roles = await storageService.getRoles();
    return roles.find(r => r.id === user.roleId) || INITIAL_ROLES[0];
  },

  getNews: () => storageService.get<NewsItem>(KEYS.NEWS),
  saveNews: (items: NewsItem[]) => storageService.save(KEYS.NEWS, items),
  getNewsById: async (id: string) => (await storageService.getNews()).find(n => n.id === id),
  getRelatedNews: async (id: string) => {
    const news = await storageService.getNews();
    return news.filter(n => n.id !== id).slice(0, 3);
  },
  
  getProjects: () => storageService.get<ProjectCase>(KEYS.PROJECTS),
  saveProjects: (items: ProjectCase[]) => storageService.save(KEYS.PROJECTS, items),

  getServices: () => storageService.get<Service>(KEYS.SERVICES),
  saveServices: (items: Service[]) => storageService.save(KEYS.SERVICES, items),
  
  getSettings: async (): Promise<SiteSettings> => {
    const s = await storageService.get<SiteSettings>(KEYS.SETTINGS);
    return Array.isArray(s) ? (s[0] || DEFAULT_SITE_SETTINGS) : (s || DEFAULT_SITE_SETTINGS);
  },
  getSettingsSync: (): SiteSettings => {
     const s = localStorage.getItem(KEYS.SETTINGS);
     return withAssetUrls(s ? JSON.parse(s) : DEFAULT_SITE_SETTINGS);
  },
  saveSettings: async (s: SiteSettings) => {
    await storageService.save(KEYS.SETTINGS, [s] as any);
    window.dispatchEvent(new Event('settingsChanged'));
  },

  getPageContent: (): PageContent => {
    const c = localStorage.getItem(KEYS.PAGE_CONTENT);
    return withAssetUrls(c ? JSON.parse(c) : INITIAL_PAGE_CONTENT);
  },
  savePageContent: (c: PageContent) => storageService.save(KEYS.PAGE_CONTENT, c as any),

  getPartners: () => storageService.get<Partner>(KEYS.PARTNERS),
  savePartners: (items: Partner[]) => storageService.save(KEYS.PARTNERS, items),
  getHistory: () => storageService.get<HistoryEvent>(KEYS.HISTORY),
  saveHistory: (items: HistoryEvent[]) => storageService.save(KEYS.HISTORY, items),
  getTeamMembers: () => storageService.get<TeamMember>(KEYS.TEAM),
  saveTeam: (items: TeamMember[]) => storageService.save(KEYS.TEAM, items),
  getHonors: () => storageService.get<Honor>(KEYS.HONORS),
  saveHonors: (items: Honor[]) => storageService.save(KEYS.HONORS, items),
  getHonorCategories: () => storageService.get<HonorCategory>(KEYS.HONOR_CATEGORIES),
  saveHonorCategories: (items: HonorCategory[]) => storageService.save(KEYS.HONOR_CATEGORIES, items),
  getLinks: () => storageService.get<NavigationLink>(KEYS.LINKS),
  saveLinks: (items: NavigationLink[]) => storageService.save(KEYS.LINKS, items),
  getMedia: () => storageService.get<MediaItem>(KEYS.MEDIA),
  saveMedia: (items: MediaItem[]) => storageService.save(KEYS.MEDIA, items),
  getMediaCategories: () => [
    { id: 'all', name: '全部', count: 0 },
    { id: 'site', name: '站点', count: 0 },
    { id: 'news', name: '新闻', count: 0 },
    { id: 'project', name: '项目', count: 0 },
    { id: 'honor', name: '资质荣誉', count: 0 },
    { id: 'document', name: '文件资料', count: 0 },
  ],
  getBranches: () => storageService.get<Branch>(KEYS.BRANCHES),
  saveBranches: (items: Branch[]) => storageService.save(KEYS.BRANCHES, items),
  getBranchCategories: () => storageService.get<BranchCategory>(KEYS.BRANCH_CATEGORIES),
  saveBranchCategories: (items: BranchCategory[]) => storageService.save(KEYS.BRANCH_CATEGORIES, items),
  getUsers: () => storageService.get<User>(KEYS.USERS),
  saveUsers: (items: User[]) => storageService.save(KEYS.USERS, items),
  getRoles: () => storageService.get<Role>(KEYS.ROLES),
  saveRoles: (items: Role[]) => storageService.save(KEYS.ROLES, items),
  getTenders: () => storageService.get<TenderItem>(KEYS.TENDERS),
  saveTenders: (items: TenderItem[]) => storageService.save(KEYS.TENDERS, items),
  getTenderById: async (id: string) => (await storageService.getTenders()).find(t => t.id === id),
  getPerformances: () => storageService.get<PerformanceItem>(KEYS.PERFORMANCES),
  savePerformances: (items: PerformanceItem[]) => storageService.save(KEYS.PERFORMANCES, items),
  getPerformanceById: async (id: string) => (await storageService.getPerformances()).find(p => p.id === id),
};
