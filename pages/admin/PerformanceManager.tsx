
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Filter, X, Save, ExternalLink, Loader2, FileText, Link as LinkIcon, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { PerformanceItem, PerformanceCategory } from '../../types';
import RichTextEditor from '../../components/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion to avoid TS strict errors
const MotionDiv = motion.div as any;

const PerformanceManager: React.FC = () => {
  const [performances, setPerformances] = useState<PerformanceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PerformanceItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<PerformanceItem>>({
    title: '',
    category: '招标代理',
    client: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    pdfUrl: '',
    linkUrl: '',
    isPublished: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await storageService.getPerformances();
    // Sort by date desc
    const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setPerformances(sorted);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: '招标代理',
      client: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      content: '',
      pdfUrl: '',
      linkUrl: '',
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: PerformanceItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除此条业绩吗？')) {
      const updated = performances.filter(t => t.id !== id);
      await storageService.savePerformances(updated);
      setPerformances(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      alert("业绩名称和分类为必填项");
      return;
    }

    setIsSubmitting(true);
    let updated;
    if (editingItem) {
      updated = performances.map(t => t.id === editingItem.id ? { ...t, ...formData } as PerformanceItem : t);
    } else {
      const newItem: PerformanceItem = { ...formData as PerformanceItem, id: Date.now().toString() };
      updated = [newItem, ...performances];
    }
    
    // Sort again
    updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await storageService.savePerformances(updated);
    setPerformances(updated);
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
        alert('仅支持上传 PDF 文件');
        return;
    }

    setIsUploadingPdf(true);
    try {
        const url = await storageService.uploadAsset(file);
        setFormData({ ...formData, pdfUrl: url });
    } catch (error) {
        alert('上传失败，请重试');
        console.error(error);
    } finally {
        setIsUploadingPdf(false);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // Filter Logic
  const filteredItems = performances.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">企业业绩管理</h1>
           <p className="text-gray-500 text-sm mt-1">管理公司的历史业绩、项目成果及相关文档</p>
        </div>
        <button onClick={handleAddNew} className="bg-primary text-white px-6 py-2.5 rounded-xl flex items-center justify-center hover:bg-primary-dark transition-all font-bold shadow-lg shadow-primary/20 whitespace-nowrap">
            <Plus size={18} className="mr-2" /> 新增业绩
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="搜索业绩名称或业主单位..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                />
            </div>
            
            <div className="relative w-full md:w-64">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm appearance-none bg-white cursor-pointer"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="all">所有业务板块</option>
                    <option value="招标代理">招标代理</option>
                    <option value="监理服务">监理服务</option>
                    <option value="造价咨询">造价咨询</option>
                    <option value="其他咨询服务">其他咨询服务</option>
                </select>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">业绩名称</th>
                <th className="px-6 py-4 font-bold w-32">业务板块</th>
                <th className="px-6 py-4 font-bold">业主单位</th>
                <th className="px-6 py-4 font-bold w-32">时间</th>
                <th className="px-6 py-4 font-bold w-32 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredItems.length > 0 ? filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 line-clamp-1 max-w-sm group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(item)}>{item.title}</div>
                    {item.pdfUrl && (
                        <div className="inline-flex items-center text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded mt-1 border border-red-100">
                            <FileText size={10} className="mr-1"/> 含PDF附件
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-xs border border-blue-100">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.client}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono">{item.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link to={`/performances/${item.id}`} target="_blank" className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors" title="前台预览">
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                       <Search size={32} className="mb-3 opacity-20"/>
                       <p>没有找到相关业绩信息</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
            >
               {/* Modal Header */}
               <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <div>
                     <h2 className="text-xl font-bold text-gray-900">{editingItem ? '编辑业绩' : '新增业绩'}</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                     <X size={24}/>
                  </button>
               </div>

               {/* Modal Body */}
               <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gray-50/30">
                  <div className="p-8 space-y-6 max-w-3xl mx-auto">
                     
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="col-span-1 md:col-span-2">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">业绩名称 <span className="text-red-500">*</span></label>
                              <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-800" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="例如：盐城市XX工程招标代理项目" />
                           </div>
                           
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">所属板块</label>
                              <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as PerformanceCategory})}>
                                 <option value="招标代理">招标代理</option>
                                 <option value="监理服务">监理服务</option>
                                 <option value="造价咨询">造价咨询</option>
                                 <option value="其他咨询服务">其他咨询服务</option>
                              </select>
                           </div>
                           
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">完成/签约时间</label>
                              <input type="date" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                           </div>

                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">业主单位</label>
                              <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
                           </div>

                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">项目金额 (选填)</label>
                              <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="例如：1.2 亿元" />
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold text-gray-900 border-l-4 border-primary pl-3 uppercase tracking-wider">扩展信息</h3>
                        
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">附件上传 (PDF)</label>
                           <div className="flex items-center gap-4">
                              <button 
                                type="button" 
                                onClick={() => pdfInputRef.current?.click()}
                                disabled={isUploadingPdf}
                                className="px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center gap-2 text-sm text-gray-600 bg-gray-50"
                              >
                                 {isUploadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                 {formData.pdfUrl ? '更换 PDF 文件' : '点击上传 PDF'}
                              </button>
                              <input type="file" ref={pdfInputRef} className="hidden" accept="application/pdf" onChange={handlePdfUpload} />
                              {formData.pdfUrl && (
                                 <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded border border-green-100">
                                    <FileText size={14} />
                                    <span className="truncate max-w-[200px]">已上传附件</span>
                                    <button type="button" onClick={() => setFormData({...formData, pdfUrl: ''})} className="ml-2 hover:text-red-500"><X size={14}/></button>
                                 </div>
                              )}
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">外部网页链接 (选填)</label>
                           <div className="relative">
                              <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input type="url" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} placeholder="https://..." />
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">详细说明</label>
                           <RichTextEditor 
                              value={formData.content || ''} 
                              onChange={val => setFormData({...formData, content: val})} 
                              placeholder="请输入项目背景、服务内容或成果描述..."
                              className="min-h-[300px]"
                           />
                        </div>
                     </div>
                  </div>
               </form>

               {/* Modal Footer */}
               <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-end gap-3 z-10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">取消</button>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center">
                     <Save size={18} className="mr-2" /> 保存业绩
                  </button>
               </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerformanceManager;
