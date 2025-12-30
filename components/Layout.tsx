
import React, { useState, useEffect } from 'react';
// Fix react-router-dom export errors by ensuring standard v6 imports
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, ChevronRight, ArrowRight, ChevronDown, Monitor, ShieldCheck, ExternalLink, ArrowUp, UserCircle, Briefcase, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';
import { SiteSettings, PageContent, TopNavLink } from '../types';
import AnniversaryPopup from './AnniversaryPopup'; // Import the new popup

// Cast motion components to any to resolve property 'animate'/'initial' etc. missing errors in current type environment
const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;
const MotionNav = motion.nav as any;
const MotionButton = motion.button as any;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(storageService.getSettingsSync());
  const [pageContent, setPageContent] = useState<PageContent>(storageService.getPageContent());
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 400);
    };
    
    // Listen for settings/content changes from Admin panel
    const handleSettingsUpdate = () => {
      setSettings(storageService.getSettingsSync());
      setPageContent(storageService.getPageContent());
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('settingsChanged', handleSettingsUpdate);
    
    // Refresh settings on route change too
    setSettings(storageService.getSettingsSync());
    setPageContent(storageService.getPageContent());

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('settingsChanged', handleSettingsUpdate);
    };
  }, [location.pathname]);

  // Update Favicon based on settings
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
    
    if (settings.faviconUrl) {
      updateFavicon(settings.faviconUrl);
    } else if (settings.graphicLogoUrl) {
      // Fallback to graphic logo if no specific favicon is set
      updateFavicon(settings.graphicLogoUrl);
    }
  }, [settings.faviconUrl, settings.graphicLogoUrl]);

  // 禁止移动端菜单开启时背景滚动
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Process dynamic nav links
  const navLinks = pageContent.topNav
    ? pageContent.topNav.filter(link => link.isVisible).sort((a, b) => a.order - b.order)
    : [];

  const footerConfig = pageContent.footer;

  // Dynamic Footer Links
  const quickLinks = footerConfig?.quickLinks?.filter(l => l.isVisible) || [];

  const isAtHome = location.pathname === '/';
  const isLightHeader = scrolled || !isAtHome;

  // Don't show anniversary popup on admin pages OR inner pages. Only show on Homepage.
  const showPopup = location.pathname === '/' && !location.pathname.startsWith('/admin');

  // Helper function to check if link is active
  const isActive = (path: string, currentPath: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-surface">
      
      {showPopup && <AnniversaryPopup />}

      {/* Top Bar - Desktop Only */}
      <MotionDiv 
        animate={{ opacity: scrolled ? 0 : 1, y: scrolled ? -40 : 0 }}
        className="bg-gray-950 text-gray-400 py-2.5 text-xs font-medium tracking-wide hidden xl:block z-50 relative border-b border-white/5"
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex space-x-8">
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
              <Phone size={13} className="text-blue-400 group-hover:text-white transition-colors" /> 
              <span className="font-mono tracking-wider">{settings.contactPhone}</span>
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
              <Mail size={13} className="text-blue-400 group-hover:text-white transition-colors" /> 
              {settings.contactEmail}
            </span>
          </div>
          
          {/* Employee Entrance - Redesigned */}
          <div className="flex space-x-6 items-center">
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 hover:border-white/20 transition-all duration-300 focus:outline-none">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                   <UserCircle size={10} className="text-blue-400" />
                </div>
                <span className="text-gray-300 group-hover:text-white text-[10px] font-bold uppercase tracking-wider">员工通道</span>
                <ChevronDown size={10} className="text-gray-500 group-hover:text-white transition-transform duration-300 group-hover:rotate-180" />
              </button>
              
              {/* Invisible bridge to prevent menu closing */}
              <div className="absolute top-full right-0 w-full h-2 bg-transparent"></div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-xl shadow-2xl shadow-black/20 py-2 hidden group-hover:block z-[60] border border-gray-100 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Internal Systems</span>
                </div>
                
                <a href="http://106.14.157.201:8088/login" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors group/item">
                   <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center group-hover/item:bg-primary group-hover/item:text-white transition-all duration-300 shadow-sm">
                      <Briefcase size={14} />
                   </div>
                   <div>
                      <span className="block text-xs font-bold text-gray-800 group-hover/item:text-primary">OA 协同办公</span>
                      <span className="block text-[10px] text-gray-400 transform scale-90 origin-left">日常审批与考勤</span>
                   </div>
                </a>

                <Link to="/admin/login" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors group/item">
                   <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover/item:bg-orange-500 group-hover/item:text-white transition-all duration-300 shadow-sm">
                      <ShieldCheck size={14} />
                   </div>
                   <div>
                      <span className="block text-xs font-bold text-gray-800 group-hover/item:text-orange-600">后台管理中枢</span>
                      <span className="block text-[10px] text-gray-400 transform scale-90 origin-left">网站内容维护</span>
                   </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
          isLightHeader ? 'bg-white/90 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-6'
        } ${scrolled ? 'md:top-0' : 'xl:top-[40px]'}`}
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 md:space-x-3 group h-10 md:h-12 relative z-50">
              {/* Graphic Logo - Always visible, scales slightly */}
              <MotionImg 
                src="/image/logo/tuxing.png" 
                alt="江苏盐韵图形标识" 
                className="h-full w-auto object-contain"
                animate={{
                  filter: isLightHeader 
                    ? 'brightness(1) drop-shadow(0 0 0 rgba(0,0,0,0))' 
                    : 'brightness(1.1) drop-shadow(0 0 8px rgba(255,255,255,0.4))'
                }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Text Logo - Visible on all devices now */}
              <img 
                src="/image/logo/wenzi.png" 
                alt="江苏盐韵文字标识" 
                className={`h-[120%] w-auto object-contain transition-all duration-500 ${
                  isLightHeader 
                    ? 'brightness-0 opacity-80' // Dark text (black) with slight opacity
                    : 'brightness-0 invert' // White text
                } ${scrolled ? 'scale-95' : 'scale-100'} block`}
              />
            </Link>

            {/* Desktop Nav - Optimized for Visibility */}
            <div className="hidden xl:flex items-center space-x-2">
              <nav className="flex items-center mr-4">
                {navLinks.map((link) => {
                  const active = isActive(link.path, location.pathname);
                  // Logic for active state visuals based on header background
                  let activeClass = '';
                  let inactiveClass = '';

                  if (isLightHeader) {
                    // White Background Header
                    activeClass = 'bg-primary text-white shadow-lg shadow-primary/30';
                    inactiveClass = 'text-gray-600 hover:text-primary hover:bg-gray-100';
                  } else {
                    // Transparent Dark Background Header (Hero)
                    activeClass = 'bg-white text-gray-900 shadow-xl';
                    inactiveClass = 'text-white/80 hover:text-white hover:bg-white/10';
                  }

                  return (
                    <Link
                      key={link.id}
                      to={link.path}
                      className={`px-3 2xl:px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                        active ? activeClass : inactiveClass
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <Link 
                to="/contact" 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 flex-shrink-0 whitespace-nowrap ${
                  isLightHeader 
                    ? 'bg-gray-900 text-white hover:bg-black shadow-gray-900/20' 
                    : 'bg-white text-primary hover:shadow-white/20'
                }`}
              >
                <span>联系我们</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden flex items-center relative z-50">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${isLightHeader || isMobileMenuOpen ? 'text-gray-800' : 'text-white'}`}
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MotionDiv
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-white xl:hidden flex flex-col pt-24 px-6 pb-6"
          >
            <nav className="flex flex-col space-y-6 flex-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-xl font-bold ${
                    isActive(link.path, location.pathname) ? 'text-primary' : 'text-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20"
              >
                联系我们 <ArrowRight size={18} className="ml-2" />
              </Link>
            </nav>
            
            <div className="mt-auto space-y-4 pt-8 border-t border-gray-100">
               <div className="flex items-center text-gray-500 text-sm">
                  <Phone size={16} className="mr-3 text-primary"/> {settings.contactPhone}
               </div>
               <div className="flex items-center text-gray-500 text-sm">
                  <Mail size={16} className="mr-3 text-primary"/> {settings.contactEmail}
               </div>
               {/* Mobile Internal Links */}
               <div className="grid grid-cols-2 gap-4 mt-6">
                  <a href="http://106.14.157.201:8088/login" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-primary rounded-lg text-sm font-bold">
                     <Briefcase size={16} /> OA办公
                  </a>
                  <Link to="/admin/login" className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">
                     <ShieldCheck size={16} /> 后台管理
                  </Link>
               </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <main className="flex-grow pt-0">
        {children}
      </main>

      {/* Footer with Upward Shadow Seam Sealer */}
      <footer className="bg-gray-950 text-white pt-24 pb-12 relative z-10 shadow-[0_-5px_0_0_#030712] -mt-1">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
                    <img src="/image/logo/tuxing.png" alt="江苏盐韵图形标识" className="w-full h-full object-contain" />
                 </div>
                 <span className="text-xl font-bold tracking-tight">{settings.siteName}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                专业的工程项目管理咨询服务商，为您提供全过程、全方位的工程咨询解决方案。
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">快速导航</h4>
              <ul className="space-y-4 text-sm text-gray-300">
                {quickLinks.map(link => (
                   <li key={link.id}>
                      <Link to={link.path} className="hover:text-white transition-colors">{link.name}</Link>
                   </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">业务领域</h4>
              <ul className="space-y-4 text-sm text-gray-300">
                <li><Link to="/services" className="hover:text-white transition-colors">工程监理</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">项目管理</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">造价咨询</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">招标代理</Link></li>
              </ul>
            </div>

            {footerConfig?.showContactInfo && (
              <div>
                <h4 className="text-lg font-bold mb-6">联系方式</h4>
                <ul className="space-y-4 text-sm text-gray-300">
                  <li className="flex items-start">
                    <MapPin size={16} className="mr-3 mt-1 flex-shrink-0 text-blue-400" />
                    <span>{settings.contactAddress}</span>
                  </li>
                  <li className="flex items-center">
                    <Phone size={16} className="mr-3 flex-shrink-0 text-blue-400" />
                    <span>{settings.contactPhone}</span>
                  </li>
                  <li className="flex items-center">
                    <Mail size={16} className="mr-3 flex-shrink-0 text-blue-400" />
                    <span>{settings.contactEmail}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            {footerConfig?.showCopyright && (
               <p>{settings.copyrightText}</p>
            )}
            <div className="flex items-center gap-6 mt-4 md:mt-0">
               <Link to="/privacy" className="hover:text-white transition-colors">隐私政策</Link>
               <Link to="/terms" className="hover:text-white transition-colors">服务条款</Link>
               <a href="http://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">苏ICP备12345678号</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <MotionButton
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors z-40"
          >
            <ArrowUp size={20} />
          </MotionButton>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
