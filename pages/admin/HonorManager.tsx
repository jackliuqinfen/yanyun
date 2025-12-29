
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderOpen, Award, ArrowUp, ArrowDown, X } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Honor, HonorCategory } from '../../types';
import ImageUpload from '../../components/ImageUpload';
import RichTextEditor from '../../components/RichTextEditor';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const HonorManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'certificates' | 'categories'>('certificates');
  const [honors, setHonors] = useState<Honor[]>([]);
  const [categories, setCategories] = useState<HonorCategory[]>([]);
  
  // Modal States
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  
  // Editing Items
  const [editingCert, setEditingCert] = useState<Honor | null>(null);
  const [editingCat, setEditingCat] = useState<HonorCategory | null>(null);

  // Forms
  const [certForm, setCertForm] = useState<Partial<Honor>>({
    title: '',
    issueDate: '',
    issuingAuthority: '',
    imageUrl: '',
    categoryId: '',
    content: ''
  });
  
  const [catForm, setCatForm] = useState<Partial<HonorCategory>>({
    name: '',
    order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [h, c] = await Promise.all([
      storageService.getHonors(),
      storageService.getHonorCategories()
    ]);
    setHonors(h);
    setCategories(c.sort((a, b) => a.order - b.order));
  };

  // --- Category Logic ---
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCat) {
       const updated = categories.map(c => c.id === editingCat.id ? { ...c, ...catForm } as HonorCategory : c);
       await storageService.saveHonorCategories(updated);
       setCategories(updated.sort((a, b) => a.order - b.order));
    } else {
       const newCat = { 
          ...catForm, 
          id: `cat_${Date.now()}`, 
          order: categories.length + 1 
       } as HonorCategory;
       const updated = [...categories, newCat];
       await storageService.saveHonorCategories(updated);
       setCategories(updated);
    }
    setIsCatModalOpen(false);
  };

  const deleteCategory = async (id: string) => {
     if (honors.some(h => h.categoryId === id)) {
        alert("无法删除：该分类下仍有证书。请先删除或移动证书。");
        return;
     }
     if (window.confirm("确定删除此分类吗？")) {
        const updated = categories.filter(c => c.id !== id);
        await storageService.saveHonorCategories(updated);
        setCategories(updated);
     }
  };

  // --- Certificate Logic ---
  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.categoryId) {
       alert("请选择一个所属分类");
       return;
    }
    if (editingCert) {
       const updated = honors.map(h => h.id === editingCert.id ? { ...h, ...certForm } as Honor : h);
       await storageService.saveHonors(updated);
       setHonors(updated);
    } else {
       const newCert = { ...certForm, id: Date.now().toString() } as Honor;
       const updated = [...honors, newCert];
       await storageService.saveHonors(updated);
       setHonors(updated);
    }
    setIsCertModalOpen(false);
  };

  const deleteHonor = async (id: string) => {
    if (window.confirm("确定删除此荣誉证书吗？")) {
       const updated = honors.filter(h => h.id !== id);
       await storageService.saveHonors(updated);
       setHonors(updated);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">荣誉资质管理</h1>
           <p className="text-sm text-gray-500">管理企业证书、奖项及分类结构</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
         <button 
           onClick={() => setActiveTab('certificates')}
           className={`px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'certificates' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <Award size={16} /> 证书列表
         </button>
         <button 
           onClick={() => setActiveTab('categories')}
           className={`px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'categories' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <FolderOpen size={16} /> 板块分类设置
         </button>
      </div>

      {activeTab === 'certificates' && (
         <div className="space-y-4">
            <div className="flex justify-end">
               <button 
                  onClick={() => {
                     setEditingCert(null);
                     setCertForm({ title: '', issueDate: new Date().toISOString().split('T')[0], issuingAuthority: '', imageUrl: '', categoryId: categories[0]?.id || '', content: '' });
                     setIsCertModalOpen(true);
                  }} 
                  className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition-colors"
               >
                  <Plus size={18} className="mr-2" /> 上传证书
               </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {honors.map(honor => {
                  const catName = categories.find(c => c.id === honor.categoryId)?.name || '未分类';
                  return (
                     <div key={honor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all relative">
                        <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded">
                           {catName}
                        </div>
                        <div className="aspect-[3/4] bg-gray-100 relative">
                           <img src={honor.imageUrl} alt={honor.title} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button onClick={() => { setEditingCert(honor); setCertForm(honor); setIsCertModalOpen(true); }} className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50"><Edit size={20}/></button>
                              <button onClick={() => deleteHonor(honor.id)} className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"><Trash2 size={20}/></button>
                           </div>
                        </div>
                        <div className="p-4">
                           <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[3rem] mb-2">{honor.title}</h3>
                           <div className="text-xs text-gray-500 space-y-1">
                              <p>颁发机构: {honor.issuingAuthority}</p>
                              <p>颁发时间: {honor.issueDate}</p>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      )}

      {activeTab === 'categories' && (
         <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-primary"><FolderOpen size={20} /></div>
                  <div>
                     <h3 className="font-bold text-gray-900">板块管理</h3>
                     <p className="text-xs text-gray-500">定义前台展示的证书分类Tab，支持拖拽排序逻辑</p>
                  </div>
               </div>
               <button 
                  onClick={() => { setEditingCat(null); setCatForm({ name: '', order: categories.length + 1 }); setIsCatModalOpen(true); }}
                  className="bg-white text-primary border border-primary/20 px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-sm"
               >
                  + 新建分类
               </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
               {categories.map((cat) => (
                  <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                           {cat.order}
                        </div>
                        <span className="font-bold text-gray-800">{cat.name}</span>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                           包含 {honors.filter(h => h.categoryId === cat.id).length} 个证书
                        </span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingCat(cat); setCatForm(cat); setIsCatModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                        <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Certificate Modal */}
      {isCertModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-hidden flex flex-col">
               <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold">{editingCert ? '编辑证书' : '上传新证书'}</h2>
                  <button onClick={() => setIsCertModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
               </div>
               <form onSubmit={handleCertSubmit} className="space-y-4 overflow-y-auto custom-scrollbar flex-1 p-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">证书名称</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={certForm.title} onChange={e => setCertForm({...certForm, title: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">所属板块</label>
                        <select 
                           required 
                           className="w-full px-3 py-2 border rounded-lg bg-white" 
                           value={certForm.categoryId} 
                           onChange={e => setCertForm({...certForm, categoryId: e.target.value})}
                        >
                           <option value="" disabled>请选择分类</option>
                           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">颁发机构</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={certForm.issuingAuthority} onChange={e => setCertForm({...certForm, issuingAuthority: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">颁发日期</label>
                        <input type="month" required className="w-full px-3 py-2 border rounded-lg" value={certForm.issueDate} onChange={e => setCertForm({...certForm, issueDate: e.target.value})} />
                     </div>
                  </div>

                  <ImageUpload label="证书扫描件" value={certForm.imageUrl} onChange={b64 => setCertForm({...certForm, imageUrl: b64})} />
                  
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">详细介绍 (用于内页展示)</label>
                     <RichTextEditor 
                        value={certForm.content || ''} 
                        onChange={val => setCertForm({...certForm, content: val})} 
                        placeholder="请输入证书背景、获奖原因或重要性说明..."
                        className="min-h-[250px]"
                     />
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                     <button type="button" onClick={() => setIsCertModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">取消</button>
                     <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">保存</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
               <h2 className="text-xl font-bold mb-6">{editingCat ? '编辑分类' : '新建分类'}</h2>
               <form onSubmit={handleCatSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">分类名称</label>
                     <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="例如：AAA信用证书" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">显示顺序</label>
                     <input type="number" required className="w-full px-3 py-2 border rounded-lg" value={catForm.order} onChange={e => setCatForm({...catForm, order: parseInt(e.target.value)})} />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                     <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button>
                     <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">保存</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default HonorManager;
