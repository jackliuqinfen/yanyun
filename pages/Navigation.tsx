
import React, { useState, useEffect } from 'react';
import { ExternalLink, Building2, Gavel, Globe, MapPin, Search, ChevronRight, Calculator, BookOpen, Layers, Users, Briefcase, Hash, Navigation as NavIcon } from 'lucide-react';
import { storageService } from '../services/storageService';
import { motion, AnimatePresence } from 'framer-motion';
import { NavigationLink } from '../types';
import Favicon from '../components/Favicon';

// Cast motion component to resolve property 'animate'/'initial' missing errors in TS
const MotionDiv = motion.div as any;
const MotionA = motion.a as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;

const Navigation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [links, setLinks] = useState<NavigationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    const fetchLinks = async () => {
      const data = await storageService.getLinks();
      setLinks(data);
      if (data.length > 0) {
         // Default active category (visual only for now)
         setActiveCategory(data[0].category);
      }
      setLoading(false);
    };
    fetchLinks();
  }, []);
  
  // Group logic
  const categories: string[] = Array.from(new Set(links.map(l => l.category)));
  
  // Filter logic
  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group filtered links by category for display
  const displayGroups = categories.map(cat => ({
    name: cat,
    items: filteredLinks.filter(l => l.category === cat)
  })).filter(group => group.items.length > 0);

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('政府') || cat.includes('监管')) return Building2;
    if (cat.includes('招投标') || cat.includes('采购')) return Gavel;
    if (cat.includes('造价') || cat.includes('材料')) return Calculator;
    if (cat.includes('标准') || cat.includes('资料')) return BookOpen;
    if (cat.includes('BIM') || cat.includes('技术')) return Layers;
    if (cat.includes('人才') || cat.includes('企业')) return Users;
    if (cat.includes('管理') || cat.includes('施工')) return Briefcase;
    return Globe;
  };

  const scrollToCategory = (catName: string) => {
    const element = document.getElementById(`cat-${catName}`);
    if (element) {
      const offset = 100; // Header height offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveCategory(catName);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
           <p className="text-gray-400 text-sm font-medium">正在加载资源库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200 pt-32 pb-16 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-60 pointer-events-none"></div>
         <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
               <MotionDiv 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-full mb-6"
               >
                  <NavIcon size={14} />
                  <span>INDUSTRY RESOURCES</span>
               </MotionDiv>
               <MotionH1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight"
               >
                  行业资源导航
               </MotionH1>
               <MotionP 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-gray-500 mb-10 leading-relaxed max-w-2xl"
               >
                  汇集政府监管、招投标、造价信息及BIM技术等全方位行业权威网站，
                  助您快速获取政策红利与商业机会。
               </MotionP>

               {/* Search Bar */}
               <MotionDiv 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative max-w-2xl group"
               >
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-colors"></div>
                  <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-lg shadow-gray-200/50 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                     <Search className="text-gray-400 mr-4" size={22} />
                     <input 
                        type="text" 
                        placeholder="搜索资源名称、关键词或描述..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-lg"
                     />
                     {searchTerm && (
                        <button 
                           onClick={() => setSearchTerm('')}
                           className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                        >
                           <ChevronRight size={18} className="rotate-90" /> {/* Using generic close/clear icon visually */}
                        </button>
                     )}
                  </div>
               </MotionDiv>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-6 py-12">
         <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Sidebar Navigation (Desktop) */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28">
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                     <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Hash size={12} /> 目录索引
                     </h3>
                  </div>
                  <nav className="p-2 space-y-1">
                     {categories.map((cat) => {
                        const Icon = getCategoryIcon(cat);
                        const isActive = activeCategory === cat;
                        return (
                           <button
                              key={cat}
                              onClick={() => scrollToCategory(cat)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left group ${
                                 isActive 
                                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                    : 'text-gray-600 hover:bg-gray-50'
                              }`}
                           >
                              <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary transition-colors'} />
                              <span>{cat}</span>
                              {isActive && <ChevronRight size={14} className="ml-auto" />}
                           </button>
                        );
                     })}
                  </nav>
               </div>

               {/* Quick Access Widget Removed */}
               
            </aside>

            {/* Mobile Horizontal Menu */}
            <div className="lg:hidden w-full overflow-x-auto pb-4 -mt-4 no-scrollbar sticky top-[72px] z-30 bg-[#F8FAFC]/95 backdrop-blur py-4">
               <div className="flex gap-3 px-1">
                  {categories.map((cat) => {
                     const Icon = getCategoryIcon(cat);
                     return (
                        <button
                           key={cat}
                           onClick={() => scrollToCategory(cat)}
                           className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 whitespace-nowrap shadow-sm active:scale-95 transition-transform"
                        >
                           <Icon size={14} className="text-primary"/>
                           {cat}
                        </button>
                     );
                  })}
               </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full min-w-0">
               {displayGroups.length > 0 ? (
                  <div className="space-y-16">
                     {displayGroups.map((group) => {
                        const Icon = getCategoryIcon(group.name);
                        return (
                           <section key={group.name} id={`cat-${group.name}`} className="scroll-mt-32">
                              <div className="flex items-center gap-4 mb-8">
                                 <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-primary">
                                    <Icon size={24} />
                                 </div>
                                 <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{group.name}</h2>
                                    <p className="text-sm text-gray-400 font-medium mt-1">收录 {group.items.length} 个精选资源</p>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                 {group.items.map((link) => {
                                    let hostname = '';
                                    try {
                                        hostname = new URL(link.url).hostname;
                                    } catch (e) {
                                        hostname = link.url;
                                    }

                                    return (
                                       <MotionA
                                          whileHover={{ y: -4 }}
                                          key={link.id}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col h-full relative overflow-hidden"
                                       >
                                          <div className="flex items-start gap-4 mb-3">
                                             <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 p-1.5 group-hover:bg-white transition-colors">
                                                <Favicon domain={hostname} />
                                             </div>
                                             <div className="flex-1 min-w-0 pt-0.5">
                                                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate text-base">
                                                   {link.title}
                                                </h3>
                                                <div className="text-[10px] text-gray-400 flex items-center mt-1 truncate group-hover:text-primary/60">
                                                   <Globe size={10} className="mr-1" /> {hostname}
                                                </div>
                                             </div>
                                          </div>
                                          
                                          {link.description && (
                                             <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2 flex-grow">
                                                {link.description}
                                             </p>
                                          )}

                                          <div className="absolute top-5 right-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                             <ExternalLink size={16} className="text-primary" />
                                          </div>
                                       </MotionA>
                                    );
                                 })}
                              </div>
                           </section>
                        );
                     })}
                  </div>
               ) : (
                  <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                     <div className="inline-flex p-4 bg-gray-50 rounded-full text-gray-300 mb-4">
                        <Search size={32} />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 mb-2">未找到相关资源</h3>
                     <p className="text-gray-500">请尝试更换关键词，或查看其他分类。</p>
                     <button 
                        onClick={() => setSearchTerm('')}
                        className="mt-6 px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
                     >
                        清除筛选
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Navigation;