
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Briefcase, Settings, Users, Image, LogOut, Building, Globe, Award, Hexagon, Compass, Layout, History, UserCheck, ShieldCheck, ChevronRight, Clock, Menu, X, Megaphone, Lock, Loader2, AlertTriangle, Cloud, HardDrive, WifiOff, FileCheck, RefreshCw, Sun, Moon } from 'lucide-react';
import { storageService } from '../services/storageService';
import { SiteSettings, ResourceType, User, Role } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionAside = motion.aside as any;

// 侧边栏分组数据配置
const NAV_GROUPS = [
  {
    label: '概览',
    items: [{ name: '控制台', path: '/admin/dashboard', icon: LayoutDashboard }]
  },
  {
    label: '内容管理',
    items: [
      { name: '页面文案', path: '/admin/pages', icon: Layout, resource: 'pages' as ResourceType },
      { name: '新闻动态', path: '/admin/news', icon: FileText, resource: 'news' as ResourceType },
      { name: '招标公告', path: '/admin/tenders', icon: Megaphone, resource: 'tenders' as ResourceType },
      { name: '企业业绩', path: '/admin/performances', icon: FileCheck, resource: 'performances' as ResourceType }, 
      { name: '项目案例', path: '/admin/projects', icon: Briefcase, resource: 'projects' as ResourceType },
      { name: '业务领域', path: '/admin/services', icon: Hexagon, resource: 'services' as ResourceType },
    ]
  },
  {
    label: '品牌资产',
    items: [
      { name: '核心团队', path: '/admin/team', icon: UserCheck, resource: 'team' as ResourceType },
      { name: '发展历程', path: '/admin/history', icon: History, resource: 'history' as ResourceType },
      { name: '荣誉资质', path: '/admin/honors', icon: Award, resource: 'honors' as ResourceType },
      { name: '分支机构', path: '/admin/branches', icon: Building, resource: 'branches' as ResourceType },
      { name: '合作伙伴', path: '/admin/partners', icon: Users, resource: 'partners' as ResourceType },
    ]
  },
  {
    label: '系统资源',
    items: [
      { name: '媒体库', path: '/admin/media', icon: Image, resource: 'media' as ResourceType },
      { name: '导航管理', path: '/admin/navigation', icon: Compass, resource: 'navigation' as ResourceType },
      { name: '用户与角色', path: '/admin/users', icon: Users, resource: 'users' as ResourceType }, 
      { name: '安全审计', path: '/admin/security', icon: ShieldCheck, resource: 'security' as ResourceType }, 
      { name: '设计规范', path: '/admin/design-system', icon: Layout, resource: 'settings' as ResourceType }, 
      { name: '系统设置', path: '/admin/settings', icon: Settings, resource: 'settings' as ResourceType },
    ]
  }
];

interface SidebarContentProps {
  currentUser: User | null;
  currentRole: Role | null;
  currentPath: string;
  onLogout: () => void;
  logoUrl?: string; 
  onNavigate?: () => void; 
}

const SidebarContent: React.FC<SidebarContentProps> = ({ currentUser, currentRole, currentPath, onLogout, logoUrl, onNavigate }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 text-slate-300 dark:bg-gray-950 border-r border-slate-800 dark:border-gray-800">
      <div className="p-6 flex-shrink-0 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden p-1.5 transition-transform hover:scale-105">
             <img src="/image/logo/tuxing.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
             <h2 className="text-base font-bold text-white tracking-tight leading-none">江苏盐韵</h2>
             <p className="text-[10px] text-slate-500 mt-1 font-medium tracking-wide">企业管理系统</p>
          </div>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
           {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        {!currentRole && (
           <div className="mx-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
              <p className="text-xs text-red-400 flex items-center gap-2 font-medium"><AlertTriangle size={14}/> Role Config Error</p>
           </div>
        )}

        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h3 className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{group.label}</h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                let hasPermission = false;
                
                if (!item.resource) {
                   hasPermission = true; 
                } else if (currentRole) {
                   const perm = currentRole.permissions[item.resource];
                   if (perm) {
                      hasPermission = perm.read;
                   } else {
                      hasPermission = currentRole.isSystem || false;
                   }
                }
                
                if (!hasPermission) return null;
                
                const Icon = item.icon;
                const isActive = currentPath.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20 font-medium' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                    }`}
                  >
                    <Icon size={18} className={`flex-shrink-0 transition-colors ${isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="text-sm">{item.name}</span>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-r-full"></div>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 p-[2px] flex-shrink-0 shadow-lg">
            <img src={currentUser?.avatar || 'https://placehold.co/100'} className="w-full h-full object-cover rounded-[6px] bg-slate-800" alt="user" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{currentUser?.name}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate">
               {currentUser?.mfaEnabled ? <Lock size={10} className="text-emerald-500" /> : <ShieldCheck size={10} className="text-slate-600"/>}
               {currentRole?.name || 'Unknown Role'}
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="w-full py-2.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-slate-400">
          <LogOut size={14} /> 安全退出
        </button>
      </div>
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(storageService.getSettingsSync());
  const [logo, setLogo] = useState(settings.graphicLogoUrl);
  const [storageStatus, setStorageStatus] = useState(storageService.getSystemStatus());
  
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const user = storageService.getCurrentUser();
      
      if (!user || !storageService.isAuthenticated()) {
        if (mounted) navigate('/admin/login');
        return;
      }

      if (mounted) setCurrentUser(user);

      try {
        const rolePromise = storageService.getCurrentUserRole();
        const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 2000));
        
        const role = await Promise.race([rolePromise, timeoutPromise]);
        
        if (mounted) {
          setCurrentRole(role); 
          setIsAuthorized(true);
        }
      } catch (e) {
        console.error("Failed to load role", e);
        if (mounted) setIsAuthorized(true);
      }
    };

    initAuth();

    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    
    const handleSettingsUpdate = () => {
       const newSettings = storageService.getSettingsSync();
       setSettings(newSettings);
       setLogo(newSettings.graphicLogoUrl);
    };
    
    const handleStorageUpdate = () => {
       setStorageStatus(storageService.getSystemStatus());
    };

    window.addEventListener('settingsChanged', handleSettingsUpdate);
    window.addEventListener('storageStatusChanged', handleStorageUpdate);

    return () => {
       mounted = false;
       clearInterval(timer);
       window.removeEventListener('settingsChanged', handleSettingsUpdate);
       window.removeEventListener('storageStatusChanged', handleStorageUpdate);
    };
  }, [navigate]);

  useEffect(() => {
    const updateFavicon = (url: string) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = url;
    };
    if (settings.faviconUrl || settings.graphicLogoUrl) {
      updateFavicon(settings.faviconUrl || settings.graphicLogoUrl);
    }
  }, [settings.faviconUrl, settings.graphicLogoUrl]);

  const handleLogout = () => {
    if (window.confirm('确定要退出管理系统吗？')) {
      storageService.logout();
      navigate('/admin/login');
    }
  };

  const handleHealthCheck = async () => {
    if (isCheckingHealth) return;
    setIsCheckingHealth(true);
    const result = await storageService.checkHealth();
    setIsCheckingHealth(false);
    
    // Simple alert for result (could be a modal in future)
    if (result.status === 'ok') {
        alert("✅ " + result.message);
    } else {
        alert("❌ 连接失败\n\n原因: " + result.message);
    }
  };

  const getBreadcrumbs = () => {
    const path = location.pathname.split('/').filter(Boolean);
    return path.map((p, i) => {
      const allItems = NAV_GROUPS.flatMap(g => g.items);
      const matchedItem = allItems.find(item => item.path === `/${path.slice(0, i + 1).join('/')}` || item.path.endsWith(p));
      return {
        name: p === 'admin' ? '管理中枢' : (matchedItem?.name || p),
        path: '/' + path.slice(0, i + 1).join('/')
      };
    });
  };

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-gray-400">
         <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
         </div>
         <p className="mt-6 text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">Initializing System Core...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col shadow-2xl z-20 flex-shrink-0">
        <SidebarContent 
          currentUser={currentUser} 
          currentRole={currentRole} 
          currentPath={location.pathname}
          onLogout={handleLogout}
          logoUrl={logo}
        />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <MotionDiv 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <MotionAside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <SidebarContent 
                currentUser={currentUser} 
                currentRole={currentRole} 
                currentPath={location.pathname}
                onLogout={handleLogout}
                logoUrl={logo}
                onNavigate={() => setIsMobileMenuOpen(false)} 
              />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </MotionAside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="p-2 -ml-2 text-gray-500 lg:hidden hover:bg-gray-100 rounded-lg active:scale-90 transition-transform"
             >
               <Menu size={24} />
             </button>

             <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                {getBreadcrumbs().map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight size={12} />}
                    <Link to={crumb.path} className={`hover:text-primary transition-colors py-2 px-1 ${idx === getBreadcrumbs().length - 1 ? 'text-gray-900 font-bold' : ''}`}>
                      {crumb.name}
                    </Link>
                  </React.Fragment>
                ))}
             </div>
             <div className="sm:hidden text-sm font-bold text-gray-900">
                {getBreadcrumbs().pop()?.name || '管理系统'}
             </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
             {/* Storage Status Indicator - Now Interactive */}
             <button 
               onClick={handleHealthCheck}
               disabled={isCheckingHealth}
               className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95 hover:shadow-sm ${
                 storageStatus.mode === 'CLOUD_SYNC' 
                   ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                   : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
               }`}
               title="点击检测服务器连接"
             >
                {isCheckingHealth ? <Loader2 size={12} className="animate-spin" /> : storageStatus.mode === 'CLOUD_SYNC' ? <Cloud size={12} /> : <HardDrive size={12} />}
                {isCheckingHealth ? 'Checking...' : storageStatus.mode === 'CLOUD_SYNC' ? 'Cloud Sync Active' : 'Local Storage Only'}
                {storageStatus.mode === 'LOCAL_ONLY' && <RefreshCw size={10} className="ml-1 opacity-50" />}
             </button>

             <div className="hidden xl:flex items-center gap-2 text-xs font-bold text-gray-400 border-r pr-6 border-gray-100">
                <Clock size={14} className="text-primary" /> {currentTime}
             </div>
             <Link to="/" target="_blank" className="flex items-center gap-2 text-xs font-bold text-primary hover:bg-blue-50 px-3 py-2.5 rounded-lg transition-all active:scale-95">
                <Globe size={16} /> <span className="hidden xs:inline">访问官网</span>
             </Link>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 custom-scrollbar bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
