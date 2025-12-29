
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Filter, ExternalLink, Globe } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { NavigationLink } from '../../types';
import PermissionGate from '../../components/PermissionGate';

const NavigationManager: React.FC = () => {
  const [links, setLinks] = useState<NavigationLink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationLink | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<NavigationLink>>({
    title: '',
    url: '',
    category: '政府机构',
    description: ''
  });

  useEffect(() => {
    storageService.getLinks().then(setLinks);
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除此链接吗？')) {
      const updated = links.filter(l => l.id !== id);
      await storageService.saveLinks(updated);
      setLinks(updated);
    }
  };

  const handleEdit = (item: NavigationLink) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      url: '',
      category: '政府机构',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const updated = links.map(l => l.id === editingItem.id ? { ...l, ...formData } as NavigationLink : l);
      await storageService.saveLinks(updated);
      setLinks(updated);
    } else {
      const newItem: NavigationLink = { ...formData as NavigationLink, id: Date.now().toString() };
      const updated = [...links, newItem];
      await storageService.saveLinks(updated);
      setLinks(updated);
    }
    setIsModalOpen(false);
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(links.map(l => l.category)));

  const filteredLinks = links.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">网址导航管理</h1>
           <p className="text-gray-500 text-sm">管理常用的行业网站链接和重要办事入口</p>
        </div>
        <PermissionGate resource="navigation" action="write">
          <button 
            onClick={handleAddNew}
            className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm"
          >
            <Plus size={18} className="mr-2" /> 新增链接
          </button>
        </PermissionGate>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索链接名称..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
           <Filter size={18} className="text-gray-400" />
           <select 
              className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none bg-white text-gray-700 cursor-pointer"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
           >
              <option value="all">所有分类</option>
              {categories.map(cat => (
                 <option key={cat} value={cat}>{cat}</option>
              ))}
           </select>
        </div>
      </div>

      {/* Links List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredLinks.map(link => (
            <div key={link.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col h-full">
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <span className="bg-blue-50 text-primary text-xs font-bold px-2 py-1 rounded">
                        {link.category}
                     </span>
                  </div>
                  <div className="flex items-center gap-2">
                     <PermissionGate resource="navigation" action="write">
                        <button onClick={() => handleEdit(link)} className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"><Edit size={16}/></button>
                     </PermissionGate>
                     <PermissionGate resource="navigation" action="delete">
                        <button onClick={() => handleDelete(link.id)} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"><Trash2 size={16}/></button>
                     </PermissionGate>
                  </div>
               </div>

               <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <Globe size={16} className="text-gray-400" />
                  {link.title}
               </h3>
               
               <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-2">
                  {link.description || '暂无描述'}
               </p>

               <div className="mt-auto pt-4 border-t border-gray-100">
                  <a 
                     href={link.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-sm text-primary hover:underline flex items-center truncate"
                  >
                     <ExternalLink size={14} className="mr-1 flex-shrink-0" />
                     {link.url}
                  </a>
               </div>
            </div>
         ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
               <h2 className="text-xl font-bold mb-6">{editingItem ? '编辑链接' : '新增链接'}</h2>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">链接标题</label>
                     <input 
                        type="text" 
                        required 
                        className="w-full px-3 py-2 border rounded-lg" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">URL 地址</label>
                     <input 
                        type="url" 
                        required 
                        className="w-full px-3 py-2 border rounded-lg" 
                        value={formData.url} 
                        onChange={e => setFormData({...formData, url: e.target.value})}
                        placeholder="http://"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">分类</label>
                     <div className="relative">
                        <input 
                           type="text" 
                           required 
                           list="category-suggestions"
                           className="w-full px-3 py-2 border rounded-lg" 
                           value={formData.category} 
                           onChange={e => setFormData({...formData, category: e.target.value})}
                           placeholder="输入或选择分类"
                        />
                        <datalist id="category-suggestions">
                           <option value="政府机构" />
                           <option value="招投标" />
                           <option value="行业协会" />
                           <option value="常用工具" />
                        </datalist>
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">描述 (可选)</label>
                     <textarea 
                        rows={3} 
                        className="w-full px-3 py-2 border rounded-lg" 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                     />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">取消</button>
                     <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">保存</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default NavigationManager;
