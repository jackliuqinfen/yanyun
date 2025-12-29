
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Phone, X, Loader2, Building2, FolderOpen, User } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Branch, BranchCategory } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

const BranchManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'branches' | 'categories'>('branches');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<BranchCategory[]>([]);
  
  // Modal States
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingCat, setEditingCat] = useState<BranchCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [branchForm, setBranchForm] = useState<Partial<Branch>>({
    name: '',
    address: '',
    phone: '',
    manager: '',
    categoryId: '',
    coordinates: { lat: 33.347, lng: 120.163 }
  });

  const [catForm, setCatForm] = useState<Partial<BranchCategory>>({
    name: '',
    order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [b, c] = await Promise.all([
        storageService.getBranches(),
        storageService.getBranchCategories()
    ]);
    setBranches(b);
    setCategories(c.sort((a, b) => a.order - b.order));
  };

  // --- Category Logic ---
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCat) {
       const updated = categories.map(c => c.id === editingCat.id ? { ...c, ...catForm } as BranchCategory : c);
       await storageService.saveBranchCategories(updated);
       setCategories(updated.sort((a, b) => a.order - b.order));
    } else {
       const newCat = { 
          ...catForm, 
          id: `cat_${Date.now()}`, 
          order: categories.length + 1 
       } as BranchCategory;
       const updated = [...categories, newCat];
       await storageService.saveBranchCategories(updated);
       setCategories(updated);
    }
    setIsCatModalOpen(false);
  };

  const deleteCategory = async (id: string) => {
     if (branches.some(b => b.categoryId === id)) {
        alert("无法删除：该区域下仍有网点。请先删除或移动网点。");
        return;
     }
     if (window.confirm("确定删除此区域板块吗？")) {
        const updated = categories.filter(c => c.id !== id);
        await storageService.saveBranchCategories(updated);
        setCategories(updated);
     }
  };

  // --- Branch Logic ---
  const handleDeleteBranch = async (id: string, name: string) => {
    if (window.confirm(`确认删除 [${name}] 分支机构吗？`)) {
      const updated = branches.filter(b => b.id !== id);
      await storageService.saveBranches(updated);
      setBranches(updated);
    }
  };

  const handleEditBranch = (item: Branch) => {
    setEditingBranch(item);
    setBranchForm(item);
    setIsBranchModalOpen(true);
  };

  const handleAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      address: '',
      phone: '',
      manager: '',
      categoryId: categories[0]?.id || '',
      coordinates: { lat: 33.347, lng: 120.163 }
    });
    setIsBranchModalOpen(true);
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name?.trim()) return alert("机构名称必填");
    if (!branchForm.categoryId) return alert("请选择所属区域");
    
    setIsSubmitting(true);
    let updated;
    if (editingBranch) {
      updated = branches.map(b => b.id === editingBranch.id ? { ...b, ...branchForm } as Branch : b);
    } else {
      const newItem: Branch = { ...branchForm as Branch, id: Date.now().toString() };
      updated = [...branches, newItem];
    }
    await storageService.saveBranches(updated);
    setBranches(updated);
    setIsSubmitting(false);
    setIsBranchModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">分支机构管理</h1>
           <p className="text-sm text-gray-500 mt-1">管理公司在各省市的组织架构与服务网点</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
         <button 
           onClick={() => setActiveTab('branches')}
           className={`px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'branches' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <Building2 size={16} /> 网点列表
         </button>
         <button 
           onClick={() => setActiveTab('categories')}
           className={`px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'categories' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <FolderOpen size={16} /> 区域/城市设置
         </button>
      </div>

      {/* Branches List Tab */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={handleAddBranch} className="bg-primary text-white px-6 py-2.5 rounded-xl flex items-center hover:bg-primary-dark transition-all font-bold shadow-lg shadow-primary/20">
                    <Plus size={18} className="mr-2" /> 新增网点
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map(branch => {
                    const catName = categories.find(c => c.id === branch.categoryId)?.name || '未分类';
                    return (
                        <div key={branch.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-primary/20 transition-all group relative">
                            <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                {catName}
                            </div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-50 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Building2 size={24} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 pr-12">{branch.name}</h3>
                            <div className="space-y-4 text-sm text-gray-500">
                                <div className="flex items-start">
                                    <MapPin size={16} className="mr-3 mt-0.5 flex-shrink-0 text-gray-400" />
                                    <span className="leading-relaxed">{branch.address}</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone size={16} className="mr-3 flex-shrink-0 text-gray-400" />
                                    <span className="font-bold text-gray-700">{branch.phone}</span>
                                </div>
                                <div className="pl-7 text-xs flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    负责人: <span className="font-bold text-gray-900">{branch.manager}</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end gap-3">
                                <button onClick={() => handleEditBranch(branch)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">编辑</button>
                                <button onClick={() => handleDeleteBranch(branch.id, branch.name)} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">删除</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
         <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-primary"><FolderOpen size={20} /></div>
                  <div>
                     <h3 className="font-bold text-gray-900">区域板块管理</h3>
                     <p className="text-xs text-gray-500">定义分公司所属的城市或大区，支持总部置顶</p>
                  </div>
               </div>
               <button 
                  onClick={() => { setEditingCat(null); setCatForm({ name: '', order: categories.length + 1 }); setIsCatModalOpen(true); }}
                  className="bg-white text-primary border border-primary/20 px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-sm"
               >
                  + 新增区域
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
                           下辖 {branches.filter(b => b.categoryId === cat.id).length} 个网点
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

      {/* Branch Edit Modal */}
      {isBranchModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsBranchModalOpen(false)}></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-10 overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900">{editingBranch ? '编辑网点' : '开设新网点'}</h2>
                     <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">Branch Identity Management</p>
                  </div>
                  <button onClick={() => !isSubmitting && setIsBranchModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24}/></button>
               </div>
               
               <form onSubmit={handleBranchSubmit} className="space-y-6">
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">所属区域/城市</label>
                     <select 
                        required 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                        value={branchForm.categoryId}
                        onChange={e => setBranchForm({...branchForm, categoryId: e.target.value})}
                     >
                        <option value="" disabled>请选择所属板块</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">分支机构全称</label>
                     <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} placeholder="例如：南京分公司" />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">办公详细地址</label>
                     <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={branchForm.address} onChange={e => setBranchForm({...branchForm, address: e.target.value})} placeholder="省 市 区 街道/写字楼 房号" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">服务热线</label>
                        <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold" value={branchForm.phone} onChange={e => setBranchForm({...branchForm, phone: e.target.value})} placeholder="0515-XXXXXXX" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">驻点总负责人</label>
                        <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" value={branchForm.manager} onChange={e => setBranchForm({...branchForm, manager: e.target.value})} />
                     </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-8">
                     <button type="button" disabled={isSubmitting} onClick={() => setIsBranchModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors">取消</button>
                     <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : '保存配置'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
               <h2 className="text-xl font-bold mb-6">{editingCat ? '编辑区域' : '新增区域'}</h2>
               <form onSubmit={handleCatSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">区域名称</label>
                     <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="例如：盐城大区" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">显示顺序</label>
                     <input type="number" required className="w-full px-3 py-2 border rounded-lg" value={catForm.order} onChange={e => setCatForm({...catForm, order: parseInt(e.target.value)})} />
                     <p className="text-xs text-gray-400 mt-1">0 通常预留给总部</p>
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

export default BranchManager;
