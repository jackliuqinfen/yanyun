
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Filter, X, Save, ExternalLink, List, Settings, CheckCircle2, Layout, Type, Calendar, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { TenderItem, TenderCategory, TenderStatus, PageHeaderConfig } from '../../types';
import RichTextEditor from '../../components/RichTextEditor';
import MediaSelector from '../../components/MediaSelector';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion to avoid TS strict errors
const MotionDiv = motion.div as any;

const TenderManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
  
  // List Data
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  
  // Page Settings Data
  const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig>(storageService.getPageContent().headers.tenders);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TenderItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<TenderItem>>({
    title: '',
    projectNo: '',
    category: '招标公告',
    region: '盐城市',
    date: new Date().toISOString().split('T')[0],
    deadline: '',
    status: '报名中',
    content: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await storageService.getTenders();
    // Sort by date desc
    const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTenders(sorted);
    // Refresh header config
    setHeaderConfig(storageService.getPageContent().headers.tenders);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      projectNo: '',
      category: '招标公告',
      region: '盐城市',
      date: new Date().toISOString().split('T')[0],
      deadline: '',
      status: '报名中',
      content: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: TenderItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除此条招标信息吗？')) {
      const updated = tenders.filter(t => t.id !== id);
      await storageService.saveTenders(updated);
      setTenders(updated);
    }
  };

  const handleDeleteFromModal = async () => {
    if (editingItem && window.confirm('确定要删除此条招标信息吗？此操作无法撤销。')) {
      const updated = tenders.filter(t => t.id !== editingItem.id);
      await storageService.saveTenders(updated);
      setTenders(updated);
      setIsModalOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectNo) {
      alert("标题和项目编号为必填项");
      return;
    }

    setIsSubmitting(true);
    let updated;
    if (editingItem) {
      updated = tenders.map(t => t.id === editingItem.id ? { ...t, ...formData } as TenderItem : t);
    } else {
      const newItem: TenderItem = { ...formData as TenderItem, id: Date.now().toString() };
      updated = [newItem, ...tenders];
    }
    
    // Sort again
    updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await storageService.saveTenders(updated);
    setTenders(updated);
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleSaveSettings = () => {
    const content = storageService.getPageContent();
    content.headers.tenders = headerConfig;
    storageService.savePageContent(content);
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 2000);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterDate('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '报名中': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case '进行中': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '公示中': return 'bg-amber-100 text-amber-700 border-amber-200';
      case '已截止': return 'bg-gray-100 text-gray-500 border-gray-200';
      case '已结束': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  // Filter Logic
  const filteredTenders = tenders.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.projectNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'all' || t.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesDate = !filterDate || t.date === filterDate;
    return matchesSearch && matchesCat && matchesStatus && matchesDate;
  });

  const hasActiveFilters = searchTerm !== '' || filterCategory !== 'all' || filterStatus !== 'all' || filterDate !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">招标信息管理</h1>
           <p className="text-gray-500 text-sm mt-1">发布公告、管理中标结果及配置频道页面</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
         <button 
           onClick={() => setActiveTab('list')}
           className={`px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'list' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <List size={16} /> 公告列表
         </button>
         <button 
           onClick={() => setActiveTab('settings')}
           className={`px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <Settings size={16} /> 页面设置
         </button>
      </div>

      {/* TAB: LIST */}
      {activeTab === 'list' && (
        <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Enhanced Filters Bar */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto flex-1">
                    {/* Search */}
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="搜索项目编号或名称..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                    />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm appearance-none bg-white cursor-pointer"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="all">所有公告类型</option>
                        <option value="招标公告">招标公告</option>
                        <option value="中标公告">中标公告</option>
                        <option value="其他公告">其他公告</option>
                    </select>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm appearance-none bg-white cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">所有状态</option>
                        <option value="报名中">报名中</option>
                        <option value="进行中">进行中</option>
                        <option value="公示中">公示中</option>
                        <option value="已截止">已截止</option>
                        <option value="已结束">已结束</option>
                    </select>
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="date"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white cursor-pointer placeholder-gray-400"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        placeholder="按发布日期筛选"
                    />
                    {filterDate && (
                        <button 
                            onClick={() => setFilterDate('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={14}/>
                        </button>
                    )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 w-full xl:w-auto">
                    {hasActiveFilters && (
                        <button 
                            onClick={resetFilters} 
                            className="px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all text-sm font-medium flex items-center"
                        >
                            <RotateCcw size={14} className="mr-2" /> 重置
                        </button>
                    )}
                    <button onClick={handleAddNew} className="flex-1 xl:flex-none bg-primary text-white px-6 py-2.5 rounded-xl flex items-center justify-center hover:bg-primary-dark transition-all font-bold shadow-lg shadow-primary/20 whitespace-nowrap">
                        <Plus size={18} className="mr-2" /> 发布信息
                    </button>
                </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">项目编号 / 名称</th>
                    <th className="px-6 py-4 font-bold w-28">公告类型</th>
                    <th className="px-6 py-4 font-bold w-24">区域</th>
                    <th className="px-6 py-4 font-bold w-28">当前状态</th>
                    <th className="px-6 py-4 font-bold w-32">发布日期</th>
                    <th className="px-6 py-4 font-bold w-32 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredTenders.length > 0 ? filteredTenders.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-mono text-[10px] text-gray-400 mb-1">{item.projectNo}</div>
                        <div className="font-bold text-gray-900 line-clamp-1 max-w-sm group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(item)}>{item.title}</div>
                        {item.deadline && (
                           <div className="text-[10px] text-orange-600 mt-1 flex items-center bg-orange-50 w-fit px-2 py-0.5 rounded border border-orange-100">
                              <Clock size={10} className="mr-1"/> 截止: {item.deadline}
                           </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium text-xs border border-gray-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.region}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono">{item.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Link to={`/tenders/${item.id}`} target="_blank" className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors" title="前台预览">
                              <ExternalLink size={16} />
                          </Link>
                          <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="编辑">
                              <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                              <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center">
                           <Search size={32} className="mb-3 opacity-20"/>
                           <p>没有找到符合条件的招标信息</p>
                           <button onClick={resetFilters} className="mt-2 text-primary text-xs hover:underline">清除所有筛选</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </MotionDiv>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === 'settings' && (
        <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                       <Layout size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-gray-900">频道页面配置</h2>
                       <p className="text-sm text-gray-500">配置前台“招标信息”列表页的视觉元素</p>
                    </div>
                 </div>
                 {isSettingsSaved && (
                    <span className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-sm font-bold">
                       <CheckCircle2 size={16} className="mr-2"/> 已保存
                    </span>
                 )}
              </div>

              <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                             <Type size={16} className="text-gray-400"/> 主标题文案
                          </label>
                          <input 
                             type="text" 
                             className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                             value={headerConfig.title}
                             onChange={e => setHeaderConfig({...headerConfig, title: e.target.value})}
                          />
                       </div>
                       <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                             <Type size={16} className="text-gray-400"/> 副标题文案
                          </label>
                          <input 
                             type="text" 
                             className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                             value={headerConfig.subtitle}
                             onChange={e => setHeaderConfig({...headerConfig, subtitle: e.target.value})}
                          />
                       </div>
                    </div>
                    <div>
                       <MediaSelector 
                          label="顶部 Banner 背景图" 
                          value={headerConfig.backgroundImage} 
                          onChange={url => setHeaderConfig({...headerConfig, backgroundImage: url})} 
                       />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                       onClick={handleSaveSettings} 
                       className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center"
                    >
                       <Save size={18} className="mr-2" /> 保存配置
                    </button>
                 </div>
              </div>
           </div>
        </MotionDiv>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <MotionDiv 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
              onClick={() => !isSubmitting && setIsModalOpen(false)} 
            />
            <MotionDiv 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            >
               {/* Modal Header */}
               <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <div>
                     <h2 className="text-xl font-bold text-gray-900">{editingItem ? '编辑招标公告' : '发布新公告'}</h2>
                     <p className="text-xs text-gray-400 mt-1">请确保信息准确，发布后即时生效。</p>
                  </div>
                  <div className="flex items-center gap-4">
                     {editingItem && (
                        <Link to={`/tenders/${editingItem.id}`} target="_blank" className="flex items-center text-xs font-bold text-primary hover:underline">
                           <ExternalLink size={14} className="mr-1"/> 查看当前版本
                        </Link>
                     )}
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={24}/>
                     </button>
                  </div>
               </div>

               {/* Modal Body */}
               <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gray-50/30">
                  <div className="p-8 space-y-8 max-w-4xl mx-auto">
                     {/* Section 1: Basic Info */}
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold text-gray-900 border-l-4 border-primary pl-3 uppercase tracking-wider">基本信息</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="col-span-1 md:col-span-2">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">公告标题 <span className="text-red-500">*</span></label>
                              <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-800 text-lg" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="例如：盐城市XX工程施工招标公告" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">项目编号 <span className="text-red-500">*</span></label>
                              <input type="text" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none font-mono" value={formData.projectNo} onChange={e => setFormData({...formData, projectNo: e.target.value})} placeholder="YC-2024-XXX" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">所属区域</label>
                              <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
                           </div>
                        </div>
                     </div>

                     {/* Section 2: Classification & Status */}
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold text-gray-900 border-l-4 border-accent pl-3 uppercase tracking-wider">分类与状态</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">公告类型</label>
                              <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as TenderCategory})}>
                                 <option value="招标公告">招标公告</option>
                                 <option value="中标公告">中标公告</option>
                                 <option value="其他公告">其他公告</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">当前状态</label>
                              <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as TenderStatus})}>
                                 <option value="报名中">报名中 (绿色)</option>
                                 <option value="进行中">进行中 (蓝色)</option>
                                 <option value="公示中">公示中 (橙色)</option>
                                 <option value="已截止">已截止 (灰色)</option>
                                 <option value="已结束">已结束 (灰色)</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                 <Calendar size={12}/> 发布日期
                              </label>
                              <input type="date" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                 <Clock size={12}/> 截止日期 (可选)
                              </label>
                              <input type="date" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                           </div>
                        </div>
                     </div>

                     {/* Section 3: Content */}
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-l-4 border-blue-500 pl-3 uppercase tracking-wider">公告正文详情</h3>
                        <RichTextEditor 
                           value={formData.content || ''} 
                           onChange={val => setFormData({...formData, content: val})} 
                           placeholder="在此输入公告正文，支持排版..."
                           className="min-h-[500px]"
                        />
                     </div>
                  </div>
               </form>

               {/* Modal Footer */}
               <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-between gap-3 z-10">
                  <div>
                     {editingItem && (
                        <button 
                           type="button" 
                           onClick={handleDeleteFromModal}
                           className="text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center text-sm"
                        >
                           <Trash2 size={16} className="mr-2"/> 删除此公告
                        </button>
                     )}
                  </div>
                  <div className="flex gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">取消</button>
                     <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center">
                        <Save size={18} className="mr-2" /> 确认发布
                     </button>
                  </div>
               </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenderManager;
