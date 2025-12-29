
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ArrowUpRight, ShieldCheck, Activity, BarChart3, PieChart, Database, CheckCircle2, Server, Award, MapPin, Calendar, Star, ChevronLeft, ChevronRight, ClipboardCheck, Briefcase, Calculator, Gavel, HardHat, Kanban, Landmark, Scale } from 'lucide-react';
import { storageService } from '../services/storageService';
import { PageContent } from '../types';

const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;

const Home: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carousel States
  const [currentProjectIdx, setCurrentProjectIdx] = useState(0);
  const [currentHonorIdx, setCurrentHonorIdx] = useState(0);
  const [itemsPerView, setItemsPerView] = useState({ project: 3, honor: 4 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partners, services, content, projects, honors, honorCategories] = await Promise.all([
          storageService.getPartners(),
          storageService.getServices(),
          storageService.getPageContent(),
          storageService.getProjects(),
          storageService.getHonors(),
          storageService.getHonorCategories()
        ]);
        
        // 筛选精选项目 (增加数量上限以支持轮播)
        const featuredProjects = projects.filter((p: any) => p.isFeatured).slice(0, 9);
        
        // 智能筛选荣誉
        const sortedCategories = honorCategories.sort((a, b) => a.order - b.order);
        let topHonors: any[] = [];
        
        for (const cat of sortedCategories) {
            if (topHonors.length >= 12) break; // 增加数量上限
            const catHonors = honors.filter((h: any) => h.categoryId === cat.id);
            topHonors = [...topHonors, ...catHonors];
        }
        
        if (topHonors.length < 12) {
            const remaining = honors.filter((h: any) => !topHonors.includes(h));
            topHonors = [...topHonors, ...remaining];
        }
        
        topHonors = topHonors.slice(0, 12);

        setData({ 
          partners, 
          services, 
          content,
          featuredProjects,
          topHonors
        });
      } catch (error) {
        console.error("Failed to load home data:", error);
        // Fallback to empty data to prevent crash, though layout might look empty
        setData({
          partners: [],
          services: [],
          content: storageService.getPageContent(), // synchronous fallback
          featuredProjects: [],
          topHonors: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Responsive Handler
    const handleResize = () => {
       const width = window.innerWidth;
       if (width < 640) {
          setItemsPerView({ project: 1, honor: 1 });
       } else if (width < 1024) {
          setItemsPerView({ project: 2, honor: 2 });
       } else {
          setItemsPerView({ project: 3, honor: 4 });
       }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
           <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
           <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">正在同步数据节点...</p>
        </div>
      </div>
    );
  }

  const { content, partners, services, featuredProjects, topHonors } = data;
  const homeContent = content.home; // Shortcut

  // Carousel Logic
  const nextSlide = (current: number, total: number, view: number, setter: any) => {
     const maxIndex = total - view;
     setter((prev: number) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = (current: number, total: number, view: number, setter: any) => {
     const maxIndex = total - view;
     setter((prev: number) => (prev <= 0 ? (maxIndex > 0 ? maxIndex : 0) : prev - 1));
  };

  const ArrowButton = ({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-[40] w-14 h-14 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-2xl hover:bg-primary hover:text-white transition-all duration-300 group cursor-pointer border border-gray-100 ${direction === 'left' ? 'left-2 md:-left-4' : 'right-2 md:-right-4'}`}
    >
      {direction === 'left' ? <ChevronLeft size={28} className="group-hover:-translate-x-0.5 transition-transform"/> : <ChevronRight size={28} className="group-hover:translate-x-0.5 transition-transform"/>}
    </button>
  );

  // Icon Mapper
  const getServiceIcon = (iconName: string) => {
     switch (iconName) {
        case 'hard-hat': return HardHat;
        case 'kanban': return Kanban;
        case 'landmark': return Landmark;
        case 'gavel': return Gavel;
        case 'calculator': return Calculator;
        case 'scale': return Scale;
        case 'clipboard-check': return ClipboardCheck;
        case 'briefcase': return Briefcase;
        default: return Zap; // Default fallback
     }
  };

  // --- Render Sections Dynamically ---
  
  const renderHero = () => (
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MotionImg 
             initial={{ scale: 1.1 }}
             animate={{ scale: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             src={homeContent.hero.bgImage} 
             className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/90 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <MotionDiv className="max-w-3xl pt-32 md:pt-20">
             <MotionDiv
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 mb-10"
             >
                <div className="w-2 h-2 bg-accent rounded-full animate-ping mr-3"></div>
                <span className="text-white text-xs font-black uppercase tracking-widest">{homeContent.hero.badge}</span>
             </MotionDiv>

             <MotionH1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight mb-8"
             >
                <span className="block mb-2 sm:mb-4">{homeContent.hero.titleLine1}</span>
                <span className="relative inline-block py-1 md:py-2 pb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-accent italic drop-shadow-sm">
                  {homeContent.hero.titleHighlight}
                </span>
             </MotionH1>

             <MotionP 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 font-medium"
             >
                {homeContent.hero.description}
             </MotionP>

             <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-5"
             >
                <Link to={homeContent.hero.buttonLink} className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary-light transition-all active:scale-95 flex items-center gap-3 group">
                   {homeContent.hero.buttonText} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to={homeContent.hero.secondaryButtonLink} className="px-10 py-5 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all flex items-center gap-3">
                   {homeContent.hero.secondaryButtonText}
                </Link>
             </MotionDiv>
          </MotionDiv>
          
          {/* SmartSearch Removed - Keeping structure empty to preserve left alignment of text */}
          <div className="hidden lg:block"></div>
        </div>
      </section>
  );

  const renderProcess = () => (
      <section className="py-16 md:py-24 bg-surface overflow-hidden relative">
         <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
               <div className="lg:col-span-5">
                  <div className="p-3 bg-primary text-white rounded-2xl inline-block mb-6 shadow-xl shadow-primary/20"><Activity size={24}/></div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-6 leading-tight whitespace-pre-line">{homeContent.process.title}</h2>
                  <p className="text-gray-500 leading-relaxed font-medium mb-10">
                     {homeContent.process.description}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-6">
                     {homeContent.process.steps.map((item: any, i: number) => (
                        <div key={i} className="flex gap-4 group">
                           <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white transition-colors duration-300 font-bold text-lg">
                              {i + 1}
                           </div>
                           <div>
                              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                              <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="lg:col-span-7">
                  <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden border border-white/10 group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                     
                     <div className="relative z-10 flex flex-col gap-8">
                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">实时管控中心</span>
                           </div>
                           <div className="flex gap-2">
                              <div className="w-1 h-3 bg-white/10 rounded-full"></div>
                              <div className="w-1 h-3 bg-white/30 rounded-full"></div>
                              <div className="w-1 h-3 bg-white/10 rounded-full"></div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                              <PieChart className="text-blue-400 mb-4" size={24} />
                              <p className="text-[10px] text-white/40 font-bold uppercase mb-1">成本控制</p>
                              <p className="text-2xl font-black text-white">98.2%</p>
                           </div>
                           <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                              <BarChart3 className="text-accent mb-4" size={24} />
                              <p className="text-[10px] text-white/40 font-bold uppercase mb-1">安全指数</p>
                              <p className="text-2xl font-black text-white">评分: 99</p>
                           </div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-2xl border border-white/5">
                           <div className="flex justify-between items-center mb-6">
                              <p className="text-xs font-bold text-white">全省项目覆盖密度</p>
                              <span className="text-[10px] text-emerald-400 font-black">同比 +15.4%</span>
                           </div>
                           <div className="space-y-4">
                              {[80, 65, 90].map((w, i) => (
                                 <div key={i} className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <MotionDiv 
                                       initial={{ width: 0 }}
                                       whileInView={{ width: `${w}%` }}
                                       transition={{ duration: 1.5, delay: i * 0.2 }}
                                       className="h-full bg-gradient-to-r from-primary to-blue-400"
                                    />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                     
                     <div className="mt-10 flex justify-center">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic group-hover:text-white/40 transition-colors">盐韵智能引擎</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
  );

  const renderProjects = () => (
      <section className="py-20 md:py-32 bg-white">
         <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-10 md:mb-16">
               <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full mb-4">
                     <Star size={14} className="text-accent" fill="currentColor"/>
                     <span className="text-[10px] font-black text-accent uppercase tracking-widest">精选案例</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">筑造城市<br/>永恒的坐标</h2>
               </div>
               <Link to="/cases" className="group flex items-center gap-3 text-sm font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors">
                  查看全部案例 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
               </Link>
            </div>

            <div className="relative">
               {featuredProjects.length > itemsPerView.project && (
                  <>
                     <ArrowButton direction="left" onClick={() => prevSlide(currentProjectIdx, featuredProjects.length, itemsPerView.project, setCurrentProjectIdx)} />
                     <ArrowButton direction="right" onClick={() => nextSlide(currentProjectIdx, featuredProjects.length, itemsPerView.project, setCurrentProjectIdx)} />
                  </>
               )}
               
               <div className="overflow-hidden -mx-4 px-4 py-4">
                  <MotionDiv 
                     className="flex gap-8"
                     animate={{ x: `calc(-${currentProjectIdx * (100 / itemsPerView.project)}% - ${currentProjectIdx * (32 / itemsPerView.project)}px)` }}
                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                     {featuredProjects.map((project: any, i: number) => (
                        <MotionDiv 
                           key={project.id}
                           className="flex-shrink-0 w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-21.33px)]"
                        >
                           <div className="group relative bg-gray-50 rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-soft hover:shadow-2xl transition-all duration-700 border border-gray-100">
                              <img src={project.imageUrl} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-80"></div>
                              
                              <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col justify-end h-full">
                                 <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-lg mb-4 inline-block">{project.category}</span>
                                    <h3 className="text-2xl font-black text-white mb-4 leading-tight">{project.title}</h3>
                                    <div className="flex items-center gap-4 text-white/60 text-xs font-medium mb-6">
                                       <span className="flex items-center gap-1"><MapPin size={12}/> {project.location}</span>
                                       <span className="flex items-center gap-1"><Calendar size={12}/> {project.date}</span>
                                    </div>
                                 </div>
                                 
                                 <div className="h-0 group-hover:h-24 opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-500 border-t border-white/10 pt-6">
                                    <p className="text-xs text-white/70 leading-relaxed mb-6 line-clamp-2">{project.description}</p>
                                    <Link to={`/cases/${project.id}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-accent tracking-[0.2em]">查看项目详情 <ArrowUpRight size={14}/></Link>
                                 </div>
                              </div>
                           </div>
                        </MotionDiv>
                     ))}
                  </MotionDiv>
               </div>
            </div>
         </div>
      </section>
  );

  const renderHonors = () => (
      <section className="py-16 md:py-24 bg-surface relative overflow-hidden">
         <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-20">
               <h3 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">权威认证</h3>
               <h2 className="text-4xl font-black text-gray-900 tracking-tighter">国家级专业背书</h2>
               <div className="mt-8">
                  <Link to="/honors" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-sm hover:shadow-md border border-gray-200 transition-all text-sm">
                     查看完整荣誉墙 <ArrowRight size={16} />
                  </Link>
               </div>
            </div>
            
            <div className="relative">
               {topHonors.length > itemsPerView.honor && (
                  <>
                     <ArrowButton direction="left" onClick={() => prevSlide(currentHonorIdx, topHonors.length, itemsPerView.honor, setCurrentHonorIdx)} />
                     <ArrowButton direction="right" onClick={() => nextSlide(currentHonorIdx, topHonors.length, itemsPerView.honor, setCurrentHonorIdx)} />
                  </>
               )}

               <div className="overflow-hidden -mx-4 px-4 py-4">
                  <MotionDiv 
                     className="flex gap-8"
                     animate={{ x: `calc(-${currentHonorIdx * (100 / itemsPerView.honor)}% - ${currentHonorIdx * (32 / itemsPerView.honor)}px)` }}
                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                     {topHonors.map((honor: any, i: number) => (
                        <MotionDiv 
                           key={honor.id}
                           className="flex-shrink-0 w-full sm:w-[calc(50%-16px)] lg:w-[calc(25%-24px)]"
                        >
                           <div className="bg-white rounded-[2rem] border border-gray-100 shadow-soft hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col overflow-hidden h-full group">
                              <div className="aspect-[3/4] w-full bg-gray-50 relative overflow-hidden border-b border-gray-50">
                                 {honor.imageUrl ? (
                                    <img src={honor.imageUrl} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={honor.title} />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                       <Award className="text-gray-300" size={64} />
                                    </div>
                                 )}
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </div>
                              <div className="p-6 flex flex-col flex-grow">
                                 <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">{honor.title}</h4>
                                 <div className="mt-auto flex justify-between items-end border-t border-gray-100 pt-4">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{honor.issuingAuthority}</div>
                                    <div className="text-[10px] text-primary font-black bg-blue-50 px-2 py-1 rounded">{honor.issueDate}</div>
                                 </div>
                              </div>
                           </div>
                        </MotionDiv>
                     ))}
                  </MotionDiv>
               </div>
            </div>
         </div>
      </section>
  );

  const renderServices = () => (
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6">
           <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-12 md:mb-20">
              <div className="max-w-2xl">
                 <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">超越传统的<br/>工程咨询标准</h2>
                 <p className="text-gray-500 font-medium">我们将数字化双胞胎与标准化现场管理相结合，确保每一个交付件都经得起时间的考验。</p>
              </div>
              <Link to="/services" className="px-8 py-3 bg-gray-50 text-gray-900 rounded-xl font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-colors flex items-center gap-2">
                 探索服务体系 <ArrowUpRight size={18} />
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {services.map((s: any, i: number) => {
                 const ServiceIcon = getServiceIcon(s.icon);
                 return (
                    <MotionDiv 
                       key={s.id}
                       whileHover={{ y: -15 }}
                       className="p-8 md:p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-primary hover:border-primary cursor-pointer shadow-soft flex flex-col"
                    >
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-lg transition-transform group-hover:rotate-12 group-hover:scale-110">
                          <ServiceIcon className="text-primary" size={28} />
                       </div>
                       <h3 className="text-xl font-black text-gray-900 group-hover:text-white mb-4 tracking-tight leading-snug">{s.title}</h3>
                       <p className="text-sm text-gray-500 group-hover:text-blue-100 leading-relaxed font-medium mb-10">{s.description}</p>
                       <Link 
                          to={`/services#service-${s.id}`} 
                          className="pt-6 border-t border-gray-200 group-hover:border-white/20 block mt-auto"
                       >
                          <span className="text-xs font-black text-primary group-hover:text-white uppercase tracking-widest flex items-center justify-between">
                             了解服务详情 <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </span>
                       </Link>
                    </MotionDiv>
                 );
              })}
           </div>
        </div>
      </section>
  );

  const renderPartners = () => {
      // Split partners into two rows for the marquee
      const midPoint = Math.ceil(partners.length / 2);
      const row1 = partners.slice(0, midPoint);
      const row2 = partners.slice(midPoint);

      return (
      <section className="py-20 bg-gray-950 relative">
         <div className="container mx-auto px-6 mb-12 flex justify-between items-center">
            <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">值得信赖的伙伴</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">合作客户</p>
         </div>
         
         <div className="space-y-12">
             {/* Row 1: Right to Left (Standard) */}
             <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <MotionDiv 
                   animate={{ x: ["0%", "-50%"] }}
                   transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                   className="flex gap-20 items-center whitespace-nowrap pr-20"
                >
                   {/* Quadrupling the list to ensure smooth infinite loop without gaps on wider screens */}
                   {[...row1, ...row1, ...row1, ...row1].map((p: any, i: number) => (
                      <div key={`r1-${i}`} className="flex-shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                         <span className="text-2xl font-black text-white tracking-tighter select-none">{p.name}</span>
                      </div>
                   ))}
                </MotionDiv>
             </div>

             {/* Row 2: Left to Right */}
             <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <MotionDiv 
                   animate={{ x: ["-50%", "0%"] }}
                   transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                   className="flex gap-20 items-center whitespace-nowrap pr-20"
                >
                   {[...row2, ...row2, ...row2, ...row2].map((p: any, i: number) => (
                      <div key={`r2-${i}`} className="flex-shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                         <span className="text-2xl font-black text-white tracking-tighter select-none">{p.name}</span>
                      </div>
                   ))}
                </MotionDiv>
             </div>
         </div>
      </section>
  );
  };

  const renderCTA = () => (
    <section className="py-16 md:py-24 bg-surface relative overflow-hidden">
       {/* Decorative blob */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-[120px] pointer-events-none"></div>
       
       <div className="container mx-auto px-6 relative z-10">
          <div className="bg-white rounded-[3rem] p-8 md:p-20 shadow-2xl border border-gray-100 text-center relative overflow-hidden">
             <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">{homeContent.cta.title}</h2>
                <p className="text-lg text-gray-500 mb-10 leading-relaxed">{homeContent.cta.description}</p>
                <Link 
                   to={homeContent.cta.buttonLink} 
                   className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 hover:bg-primary-dark transition-all"
                >
                   {homeContent.cta.buttonText} <ArrowRight size={20}/>
                </Link>
             </div>
             
             {/* Background Mesh */}
             <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#2C388B 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          </div>
       </div>
    </section>
  );

  // Layout Rendering Logic
  const layout = homeContent.layout || [];
  const sortedLayout = [...layout].sort((a, b) => a.order - b.order);

  return (
    <div>
      {sortedLayout.map(section => {
         if (!section.isVisible) return null;
         switch(section.type) {
            case 'hero': return <React.Fragment key={section.id}>{renderHero()}</React.Fragment>;
            case 'process': return <React.Fragment key={section.id}>{renderProcess()}</React.Fragment>;
            case 'projects': return <React.Fragment key={section.id}>{renderProjects()}</React.Fragment>;
            case 'honors': return <React.Fragment key={section.id}>{renderHonors()}</React.Fragment>;
            case 'services': return <React.Fragment key={section.id}>{renderServices()}</React.Fragment>;
            case 'partners': return <React.Fragment key={section.id}>{renderPartners()}</React.Fragment>;
            case 'cta': return <React.Fragment key={section.id}>{renderCTA()}</React.Fragment>;
            default: return null;
         }
      })}
    </div>
  );
};

export default Home;