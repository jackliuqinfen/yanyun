
import React, { useState, useEffect } from 'react';
// Added missing 'X' icon to the imports from lucide-react
import { Plus, Search, Edit, Trash2, MapPin, Calendar, Award, Loader2, X } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ProjectCase } from '../../types';
import MediaSelector from '../../components/MediaSelector';
import RichTextEditor from '../../components/RichTextEditor';

const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<ProjectCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectCase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<ProjectCase>>({
    title: '',
    category: '市政工程',
    description: '',
    content: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    isFeatured: false,
    imageUrl: ''
  });

  useEffect(() => {
    storageService.getProjects().then(setProjects);
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个项目吗？此操作不可逆。')) {
      const updated = projects.filter(p => p.id !== id);
      await storageService.saveProjects(updated);
      setProjects(updated);
    }
  };

  const handleEdit = (item: ProjectCase) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: '市政工程',
      description: '',
      content: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      isFeatured: false,
      imageUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // QA Logic: Form Validation
    if (!formData.title?.trim()) return alert("项目名称不能为空");
    if (!formData.imageUrl) return alert("请选择项目展示图");

    setIsSubmitting(true);
    
    let updated;
    if (editingItem) {
      updated = projects.map(p => p.id === editingItem.id ? { ...p, ...formData } as ProjectCase : p);
    } else {
      const newItem: ProjectCase = { ...formData as ProjectCase, id: Date.now().toString() };
      updated = [newItem, ...projects];
    }
    await storageService.saveProjects(updated);
    setProjects(updated);
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">项目案例管理</h1>
           <p className="text-sm text-gray-500 mt-1">管理公司过往的成功案例与工程业绩</p>
        </div>
        <button onClick={handleAddNew} className="bg-primary text-white px-6 py-2.5 rounded-xl flex items-center hover:bg-primary-dark transition-all font-bold shadow-lg shadow-primary/20">
          <Plus size={18} className="mr-2" /> 新增案例
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
               type="text" 
               placeholder="搜索项目名称..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group">
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              {project.imageUrl ? (
                 <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">无图片</div>
              )}
              {project.isFeatured && (
                 <div className="absolute top-3 right-3 bg-accent text-white p-1.5 rounded-full shadow-lg">
                    <Award size={16} />
                 </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                 {project.category}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 line-clamp-1 h-6">{project.title}</h3>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
                 <button onClick={() => handleEdit(project)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"><Edit size={18} /></button>
                 <button onClick={() => handleDelete(project.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
             <div className="p-8 border-b flex justify-between items-center bg-gray-50">
                <div>
                   <h2 className="text-xl font-bold text-gray-900">{editingItem ? '编辑项目详情' : '登记新项目案例'}</h2>
                   <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Project Documentation</p>
                </div>
                <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                   <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="col-span-1 md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">项目完整名称</label>
                      <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                   </div>
                   
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">工程品类</label>
                      <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none bg-white font-medium" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                         <option>市政工程</option>
                         <option>工业厂房</option>
                         <option>住宅工程</option>
                         <option>基础设施</option>
                         <option>公共建筑</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">竣工/交付日期</label>
                      <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-medium" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                   </div>
                   <div className="col-span-1 md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">项目地点</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="例如：盐城市盐都区" />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">简介摘要 (列表页展示)</label>
                   <textarea rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="space-y-4">
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">项目详细介绍 (内页富文本)</label>
                   <RichTextEditor 
                      value={formData.content || ''} 
                      onChange={val => setFormData({...formData, content: val})} 
                      placeholder="请详细描述项目概况、技术难点及建设成果..."
                      className="min-h-[300px]"
                   />
                </div>

                <MediaSelector label="项目全景/效果图" value={formData.imageUrl} onChange={url => setFormData({...formData, imageUrl: url})} />

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                   <div className="flex items-center gap-3">
                      <input 
                         type="checkbox" 
                         id="featured-check"
                         className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                         checked={formData.isFeatured} 
                         onChange={e => setFormData({...formData, isFeatured: e.target.checked})} 
                      />
                      <label htmlFor="featured-check" className="text-sm font-bold text-primary select-none cursor-pointer">设为精选案例 (展示在首页及推荐位)</label>
                   </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                   <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors">取消操作</button>
                   <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-10 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center"
                   >
                      {isSubmitting ? <><Loader2 className="mr-2 animate-spin" size={18}/> 处理中</> : '确认并同步'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
