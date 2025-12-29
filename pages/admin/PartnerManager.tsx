
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Partner } from '../../types';
import ImageUpload from '../../components/ImageUpload';

const PartnerManager: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partner | null>(null);

  const [formData, setFormData] = useState<Partial<Partner>>({
    name: '',
    logoUrl: '',
    website: ''
  });

  useEffect(() => {
    storageService.getPartners().then(setPartners);
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该合作伙伴吗？')) {
      const updated = partners.filter(p => p.id !== id);
      await storageService.savePartners(updated);
      setPartners(updated);
    }
  };

  const handleEdit = (item: Partner) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      logoUrl: '',
      website: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const updated = partners.map(p => p.id === editingItem.id ? { ...p, ...formData } as Partner : p);
      await storageService.savePartners(updated);
      setPartners(updated);
    } else {
      const newItem: Partner = { ...formData as Partner, id: Date.now().toString() };
      const updated = [...partners, newItem];
      await storageService.savePartners(updated);
      setPartners(updated);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">合作伙伴管理</h1>
           <p className="text-sm text-gray-500">展示合作企业与客户Logo</p>
        </div>
        <button onClick={handleAddNew} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition-colors">
          <Plus size={18} className="mr-2" /> 新增伙伴
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
         {partners.map(partner => (
            <div key={partner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all relative">
               <div className="aspect-[3/2] p-4 flex items-center justify-center bg-gray-50">
                  <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
               </div>
               <div className="p-3 border-t border-gray-100 text-center">
                  <h4 className="font-bold text-sm text-gray-800 truncate">{partner.name}</h4>
               </div>
               <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                  <button onClick={() => handleEdit(partner)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14}/></button>
                  <button onClick={() => handleDelete(partner.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
               </div>
            </div>
         ))}
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
               <h2 className="text-xl font-bold mb-6">{editingItem ? '编辑伙伴' : '新增伙伴'}</h2>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">伙伴名称</label>
                     <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  
                  <ImageUpload label="Logo 图片" value={formData.logoUrl} onChange={b64 => setFormData({...formData, logoUrl: b64})} />

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">官方网站 (可选)</label>
                     <input type="text" className="w-full px-3 py-2 border rounded-lg" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button>
                     <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">保存</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default PartnerManager;
