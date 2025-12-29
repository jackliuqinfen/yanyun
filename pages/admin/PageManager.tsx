
import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Trash2, Plus, Layout, Type, Image as ImageIcon, MessageSquare, ArrowUp, ArrowDown, Eye, EyeOff, Layers, Link as LinkIcon, Settings2, GripVertical, Activity, Sparkles, PieChart, Compass } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { PageContent, PageHeaderConfig, HomeSectionConfig, FooterLink, TopNavLink } from '../../types';
import MediaSelector from '../../components/MediaSelector';
import { motion } from 'framer-motion';

// Cast motion component to bypass strict type errors for framer-motion props
const MotionDiv = motion.div as any;

const PageManager: React.FC = () => {
  const [content, setContent] = useState<PageContent>(storageService.getPageContent());
  const [activeTab, setActiveTab] = useState<'home' | 'navigation' | 'footer' | 'about' | 'services' | 'headers'>('home');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    storageService.savePageContent(content);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const updateContent = (path: string[], value: any) => {
    setContent(prev => {
       const newContent = JSON.parse(JSON.stringify(prev));
       let current = newContent;
       for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]];
       }
       current[path[path.length - 1]] = value;
       return newContent;
    });
  };

  // --- Home Layout Helpers ---
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...content.home.layout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newLayout.length) {
      [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
      // Update orders
      newLayout.forEach((sec, idx) => sec.order = idx + 1);
      updateContent(['home', 'layout'], newLayout);
    }
  };

  const toggleSectionVisibility = (index: number) => {
    const newLayout = [...content.home.layout];
    newLayout[index].isVisible = !newLayout[index].isVisible;
    updateContent(['home', 'layout'], newLayout);
  };

  // --- Navigation Helpers ---
  const moveNavLink = (index: number, direction: 'up' | 'down') => {
    const newNav = [...(content.topNav || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newNav.length) {
      [newNav[index], newNav[targetIndex]] = [newNav[targetIndex], newNav[index]];
      // Update orders
      newNav.forEach((link, idx) => link.order = idx + 1);
      updateContent(['topNav'], newNav);
    }
  };

  const toggleNavLinkVisibility = (index: number) => {
    const newNav = [...(content.topNav || [])];
    newNav[index].isVisible = !newNav[index].isVisible;
    updateContent(['topNav'], newNav);
  };

  const updateNavLinkLabel = (index: number, label: string) => {
    const newNav = [...(content.topNav || [])];
    newNav[index].label = label;
    updateContent(['topNav'], newNav);
  };

  // --- Footer Helpers ---
  const addFooterLink = () => {
    const newLink: FooterLink = { 
        id: Date.now().toString(), 
        name: '新链接', 
        path: '/', 
        isVisible: true 
    };
    updateContent(['footer', 'quickLinks'], [...content.footer.quickLinks, newLink]);
  };

  const updateFooterLink = (index: number, key: keyof FooterLink, value: any) => {
    const newLinks = [...content.footer.quickLinks];
    newLinks[index] = { ...newLinks[index], [key]: value };
    updateContent(['footer', 'quickLinks'], newLinks);
  };

  const removeFooterLink = (index: number) => {
    const newLinks = content.footer.quickLinks.filter((_, i) => i !== index);
    updateContent(['footer', 'quickLinks'], newLinks);
  };

  const tabs = [
    { id: 'home', label: '首页配置', icon: Layout },
    { id: 'navigation', label: '导航菜单', icon: Compass },
    { id: 'footer', label: '动态页脚', icon: Layers },
    { id: 'about', label: '关于我们', icon: Type },
    { id: 'services', label: '业务/问答', icon: MessageSquare },
    { id: 'headers', label: '全局页头', icon: ImageIcon },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">页面内容管理系统</h1>
           <p className="text-sm text-gray-500 mt-1">控制全站 90% 以上的静态文案、图片及板块显示</p>
        </div>
        <button 
           onClick={handleSave} 
           className={`flex items-center space-x-2 px-8 py-3 rounded-xl transition-all font-black shadow-xl ${
             isSaved ? 'bg-success text-white' : 'bg-primary text-white hover:bg-primary-dark shadow-primary/20'
           }`}
        >
           {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />}
           <span>{isSaved ? '配置已同步' : '立即发布更改'}</span>
        </button>
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-2 p-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
         {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
         })}
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200 space-y-12">
         
         {activeTab === 'home' && (
            <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               
               {/* 1. Layout Manager */}
               <section className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-2 bg-blue-500 text-white rounded-xl"><Layers size={20}/></div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">首页板块编排引擎</h3>
                        <p className="text-xs text-gray-500 font-medium">拖拽排序或控制板块显隐，实时决定首页结构</p>
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                     {content.home.layout.map((section, index) => (
                        <div key={section.id} className={`flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm transition-all ${section.isVisible ? 'border-gray-200' : 'border-gray-100 opacity-60 bg-gray-50'}`}>
                           <div className="flex items-center gap-4">
                              <span className="text-gray-300 cursor-move"><GripVertical size={20}/></span>
                              <div className={`px-3 py-1 rounded text-xs font-bold uppercase w-20 text-center ${section.isVisible ? 'bg-blue-50 text-primary' : 'bg-gray-200 text-gray-500'}`}>{section.type}</div>
                              <span className="font-bold text-gray-800">{section.label}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-2 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"><ArrowUp size={16}/></button>
                              <button onClick={() => moveSection(index, 'down')} disabled={index === content.home.layout.length - 1} className="p-2 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"><ArrowDown size={16}/></button>
                              <div className="w-px h-6 bg-gray-200 mx-2"></div>
                              <button onClick={() => toggleSectionVisibility(index)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${section.isVisible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                                 {section.isVisible ? <Eye size={14}/> : <EyeOff size={14}/>}
                                 {section.isVisible ? '显示中' : '已隐藏'}
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               {/* 2. Content Editing */}
               <section className="space-y-6 pt-6 border-t border-dashed">
                  <div className="flex items-center gap-4 mb-4">
                     <span className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center font-bold">01</span>
                     <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Hero 首屏文案 & 交互</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">浮动勋章文案</label>
                        <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none" value={content.home.hero.badge} onChange={e => updateContent(['home', 'hero', 'badge'], e.target.value)} />
                        
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">主标题 (Line 1)</label>
                        <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none" value={content.home.hero.titleLine1} onChange={e => updateContent(['home', 'hero', 'titleLine1'], e.target.value)} />
                        
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">高亮关键词</label>
                        <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none text-primary font-bold" value={content.home.hero.titleHighlight} onChange={e => updateContent(['home', 'hero', 'titleHighlight'], e.target.value)} />
                        
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">描述段落</label>
                        <textarea rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none resize-none" value={content.home.hero.description} onChange={e => updateContent(['home', 'hero', 'description'], e.target.value)} />
                     </div>
                     <div className="space-y-4">
                        <MediaSelector label="Hero 背景视觉图" value={content.home.hero.bgImage} onChange={v => updateContent(['home', 'hero', 'bgImage'], v)} />
                        <div className="grid grid-cols-2 gap-4 pt-2">
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">主按钮文字</label>
                              <input type="text" className="w-full px-3 py-2 border rounded-lg" value={content.home.hero.buttonText} onChange={e => updateContent(['home', 'hero', 'buttonText'], e.target.value)} />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">跳转链接</label>
                              <input type="text" className="w-full px-3 py-2 border rounded-lg bg-gray-50" value={content.home.hero.buttonLink} onChange={e => updateContent(['home', 'hero', 'buttonLink'], e.target.value)} />
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* Process / Management System Section */}
               <section className="space-y-6 pt-10 border-t">
                  <div className="flex items-center gap-4 mb-4">
                     <span className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center font-bold">02</span>
                     <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">管理系统流程 (Process)</h3>
                  </div>
                  <div className="space-y-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">板块标题</label>
                           <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={content.home.process.title} onChange={e => updateContent(['home', 'process', 'title'], e.target.value)} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">板块描述</label>
                           <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={content.home.process.description} onChange={e => updateContent(['home', 'process', 'description'], e.target.value)} />
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">核心步骤 (3项)</label>
                        {content.home.process.steps.map((step, i) => (
                           <div key={i} className="flex gap-4 items-start">
                              <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full font-bold text-xs text-gray-500 shrink-0">{i+1}</div>
                              <input type="text" className="w-1/3 px-3 py-2 border rounded-lg bg-white" placeholder="步骤标题" value={step.title} onChange={e => {
                                 const newSteps = [...content.home.process.steps];
                                 newSteps[i].title = e.target.value;
                                 updateContent(['home', 'process', 'steps'], newSteps);
                              }} />
                              <input type="text" className="flex-1 px-3 py-2 border rounded-lg bg-white" placeholder="步骤描述" value={step.desc} onChange={e => {
                                 const newSteps = [...content.home.process.steps];
                                 newSteps[i].desc = e.target.value;
                                 updateContent(['home', 'process', 'steps'], newSteps);
                              }} />
                           </div>
                        ))}
                     </div>
                  </div>
               </section>

               <section className="space-y-6 pt-10 border-t">
                  <div className="flex items-center gap-4 mb-4">
                     <span className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center font-bold">03</span>
                     <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">关键数据统计栏</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                     {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                           <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">数值</label>
                              <input type="text" className="w-full px-3 py-2 bg-white border rounded-lg text-lg font-black text-primary" value={(content.home.stats as any)[`stat${i}`].value} onChange={e => updateContent(['home', 'stats', `stat${i}`, 'value'], e.target.value)} />
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">描述</label>
                              <input type="text" className="w-full px-3 py-2 bg-white border rounded-lg text-xs" value={(content.home.stats as any)[`stat${i}`].label} onChange={e => updateContent(['home', 'stats', `stat${i}`, 'label'], e.target.value)} />
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               {/* CTA Section */}
               <section className="space-y-6 pt-10 border-t">
                  <div className="flex items-center gap-4 mb-4">
                     <span className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center font-bold">04</span>
                     <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">底部行动号召 (CTA)</h3>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">主标题</label>
                        <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={content.home.cta.title} onChange={e => updateContent(['home', 'cta', 'title'], e.target.value)} />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">副标题 / 描述</label>
                        <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={content.home.cta.description} onChange={e => updateContent(['home', 'cta', 'description'], e.target.value)} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">按钮文字</label>
                           <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={content.home.cta.buttonText} onChange={e => updateContent(['home', 'cta', 'buttonText'], e.target.value)} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">按钮链接</label>
                           <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={content.home.cta.buttonLink} onChange={e => updateContent(['home', 'cta', 'buttonLink'], e.target.value)} />
                        </div>
                     </div>
                  </div>
               </section>
            </MotionDiv>
         )}

         {activeTab === 'navigation' && (
            <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Compass size={20}/></div>
                  <div>
                     <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">顶部导航配置</h3>
                     <p className="text-xs text-gray-500 font-medium">自定义主菜单的排序、名称和显示状态</p>
                  </div>
               </div>

               <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
                     <div className="col-span-1 text-center">排序</div>
                     <div className="col-span-4">导航名称</div>
                     <div className="col-span-4">跳转路径 (Path)</div>
                     <div className="col-span-3 text-right">操作</div>
                  </div>
                  <div className="divide-y divide-gray-100">
                     {(content.topNav || []).map((link, index) => (
                        <div key={link.id} className={`grid grid-cols-12 gap-4 p-4 items-center bg-white transition-colors ${link.isVisible ? '' : 'opacity-60 bg-gray-50'}`}>
                           <div className="col-span-1 flex justify-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
                                 {index + 1}
                              </div>
                           </div>
                           <div className="col-span-4">
                              <input 
                                 type="text" 
                                 className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-gray-800" 
                                 value={link.label} 
                                 onChange={e => updateNavLinkLabel(index, e.target.value)}
                              />
                           </div>
                           <div className="col-span-4">
                              <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-500 font-mono truncate">
                                 {link.path}
                              </div>
                           </div>
                           <div className="col-span-3 flex items-center justify-end gap-2">
                              <button onClick={() => moveNavLink(index, 'up')} disabled={index === 0} className="p-2 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"><ArrowUp size={16}/></button>
                              <button onClick={() => moveNavLink(index, 'down')} disabled={index === (content.topNav?.length || 0) - 1} className="p-2 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"><ArrowDown size={16}/></button>
                              <div className="w-px h-6 bg-gray-200 mx-2"></div>
                              <button onClick={() => toggleNavLinkVisibility(index)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${link.isVisible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                                 {link.isVisible ? <Eye size={14}/> : <EyeOff size={14}/>}
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </MotionDiv>
         )}

         {activeTab === 'footer' && (
            <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-gray-800 text-white rounded-xl"><Settings2 size={20}/></div>
                  <div>
                     <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">页脚全局配置</h3>
                     <p className="text-xs text-gray-500 font-medium">管理全站底部的快速导航链接与显示项</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                     <span className="font-bold text-gray-700">显示联系方式列</span>
                     <button 
                        onClick={() => updateContent(['footer', 'showContactInfo'], !content.footer.showContactInfo)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${content.footer.showContactInfo ? 'bg-primary' : 'bg-gray-300'}`}
                     >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${content.footer.showContactInfo ? 'translate-x-6' : 'translate-x-0'}`} />
                     </button>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                     <span className="font-bold text-gray-700">显示版权信息</span>
                     <button 
                        onClick={() => updateContent(['footer', 'showCopyright'], !content.footer.showCopyright)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${content.footer.showCopyright ? 'bg-primary' : 'bg-gray-300'}`}
                     >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${content.footer.showCopyright ? 'translate-x-6' : 'translate-x-0'}`} />
                     </button>
                  </div>
               </div>

               <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                     <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">快速导航链接池</h4>
                     <button onClick={addFooterLink} className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 font-bold flex items-center">
                        <Plus size={14} className="mr-1"/> 添加链接
                     </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                     {content.footer.quickLinks.map((link, idx) => (
                        <div key={link.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                           <div className="w-8 flex justify-center text-gray-400 font-mono text-xs">{idx + 1}</div>
                           <input 
                              type="text" 
                              className="flex-1 px-3 py-2 border rounded text-sm" 
                              placeholder="链接名称" 
                              value={link.name} 
                              onChange={e => updateFooterLink(idx, 'name', e.target.value)} 
                           />
                           <input 
                              type="text" 
                              className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50 font-mono text-gray-600" 
                              placeholder="跳转路径 /path" 
                              value={link.path} 
                              onChange={e => updateFooterLink(idx, 'path', e.target.value)} 
                           />
                           <button 
                              onClick={() => updateFooterLink(idx, 'isVisible', !link.isVisible)}
                              className={`p-2 rounded hover:bg-gray-200 ${link.isVisible ? 'text-green-600' : 'text-gray-400'}`}
                              title="切换可见性"
                           >
                              {link.isVisible ? <Eye size={16}/> : <EyeOff size={16}/>}
                           </button>
                           <button onClick={() => removeFooterLink(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                              <Trash2 size={16}/>
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </MotionDiv>
         )}

         {activeTab === 'about' && (
            <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <section className="space-y-8">
                  <div className="flex items-center gap-4">
                     <span className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center font-bold">01</span>
                     <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">公司概览配置</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                     <div className="md:col-span-7 space-y-6">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">板块主标题</label>
                           <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all" value={content.about.intro.title} onChange={e => updateContent(['about', 'intro', 'title'], e.target.value)} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">介绍段落一</label>
                           <textarea rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none leading-loose" value={content.about.intro.content1} onChange={e => updateContent(['about', 'intro', 'content1'], e.target.value)} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">介绍段落二</label>
                           <textarea rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none leading-loose" value={content.about.intro.content2} onChange={e => updateContent(['about', 'intro', 'content2'], e.target.value)} />
                        </div>
                     </div>
                     <div className="md:col-span-5">
                        <MediaSelector label="简介板块插图" value={content.about.intro.imageUrl} onChange={v => updateContent(['about', 'intro', 'imageUrl'], v)} />
                     </div>
                  </div>
               </section>

               <section className="pt-10 border-t space-y-8">
                  <div className="flex items-center gap-4">
                     <span className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center font-bold">02</span>
                     <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">企业文化内核</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {['mission', 'values', 'management'].map((key) => (
                        <div key={key} className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                              {key === 'mission' ? '企业使命' : key === 'values' ? '核心价值观' : '管理理念'}
                           </label>
                           <textarea rows={4} className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none" value={(content.about.culture as any)[key]} onChange={e => updateContent(['about', 'culture', key], e.target.value)} />
                        </div>
                     ))}
                  </div>
               </section>
            </MotionDiv>
         )}

         {activeTab === 'services' && (
            <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               {/* Intro Stats Editor */}
               <section className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                        <Activity size={24} />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">服务页核心指标 (Intro Stats)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {content.services.introStats.map((stat, idx) => (
                        <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3 relative group">
                           <div className="absolute top-2 right-2 opacity-20 text-xs font-bold">{idx + 1}</div>
                           <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">图标名称 (Lucide)</label>
                              <select 
                                 className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
                                 value={stat.icon} 
                                 onChange={e => {
                                    const newStats = [...content.services.introStats];
                                    newStats[idx].icon = e.target.value;
                                    updateContent(['services', 'introStats'], newStats);
                                 }}
                              >
                                 <option value="Shield">Shield (资质)</option>
                                 <option value="Clock">Clock (效率)</option>
                                 <option value="TrendingUp">TrendingUp (成本)</option>
                                 <option value="Users">Users (团队)</option>
                                 <option value="Award">Award (奖项)</option>
                                 <option value="Zap">Zap (快速)</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">标题</label>
                              <input type="text" className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-bold" value={stat.label} onChange={e => {
                                 const newStats = [...content.services.introStats];
                                 newStats[idx].label = e.target.value;
                                 updateContent(['services', 'introStats'], newStats);
                              }} />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">描述</label>
                              <input type="text" className="w-full px-3 py-2 bg-white border rounded-lg text-sm" value={stat.desc} onChange={e => {
                                 const newStats = [...content.services.introStats];
                                 newStats[idx].desc = e.target.value;
                                 updateContent(['services', 'introStats'], newStats);
                              }} />
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               <div className="border-t border-dashed pt-8">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                           <MessageSquare size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">FAQ 常见问题库</h3>
                     </div>
                     <button 
                        onClick={() => updateContent(['services', 'faqs'], [...content.services.faqs, { q: '', a: '' }])}
                        className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                     >
                        <Plus size={14} className="inline-block mr-1" /> 新增问答条目
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                     {content.services.faqs.map((faq, idx) => (
                        <div key={idx} className="group relative bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl hover:border-gray-200 transition-all">
                           <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => updateContent(['services', 'faqs'], content.services.faqs.filter((_, i) => i !== idx))} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                 <Trash2 size={18} />
                              </button>
                           </div>
                           <div className="space-y-4">
                              <div>
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">问题 0{idx + 1}</label>
                                 <input type="text" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none font-bold" value={faq.q} onChange={e => {
                                    const newFaqs = [...content.services.faqs];
                                    newFaqs[idx].q = e.target.value;
                                    updateContent(['services', 'faqs'], newFaqs);
                                 }} />
                              </div>
                              <div>
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">标准回答内容</label>
                                 <textarea rows={3} className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none" value={faq.a} onChange={e => {
                                    const newFaqs = [...content.services.faqs];
                                    newFaqs[idx].a = e.target.value;
                                    updateContent(['services', 'faqs'], newFaqs);
                                 }} />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </MotionDiv>
         )}

         {activeTab === 'headers' && (
            <div className="grid grid-cols-1 gap-12">
               {(Object.entries(content.headers) as [string, PageHeaderConfig][]).map(([key, header]) => (
                  <MotionDiv key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center font-black text-primary capitalize">{key.charAt(0)}</div>
                        <div>
                           <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">{key} 页面视觉配置</h3>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Banner Section Configuration</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        <div className="md:col-span-7 space-y-6">
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">主标题文案</label>
                              <input type="text" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none" value={header.title} onChange={e => updateContent(['headers', key, 'title'], e.target.value)} />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">副标题文案</label>
                              <input type="text" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none" value={header.subtitle} onChange={e => updateContent(['headers', key, 'subtitle'], e.target.value)} />
                           </div>
                        </div>
                        <div className="md:col-span-5">
                           <MediaSelector label="Banner 背景底图" value={header.backgroundImage} onChange={v => updateContent(['headers', key, 'backgroundImage'], v)} />
                        </div>
                     </div>
                  </MotionDiv>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};

export default PageManager;
