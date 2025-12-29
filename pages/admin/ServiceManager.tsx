
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Service } from '../../types';

const ServiceManager: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  
  const [formData, setFormData] = useState<Partial<Service>>({
    title: '',
    description: '',
    features: [''],
    icon: 'briefcase',
    order: 0
  });

  useEffect(() => {
    storageService.getServices().then(data => {
      setServices(data.sort((a, b) => a.order - b.order));
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除此服务吗？')) {
      const updated = services.filter(s => s.id !== id);
      await storageService.saveServices(updated);
      setServices(updated);
    }
  };

  const handleEdit = (item: Service) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      features: [''],
      icon: 'briefcase',
      order: services.length + 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFeatures = formData.features?.filter(f => f.trim() !== '') || [];
    
    if (editingItem) {
      const updated = services.map(s => s.id === editingItem.id ? { ...s, ...formData, features: cleanFeatures } as Service : s);
      await storageService.saveServices(updated);
      setServices(updated);
    } else {
      const newItem: Service = { 
         ...formData as Service, 
         id: Date.now().toString(), 
         features: cleanFeatures 
      };
      const updated = [...services, newItem];
      await storageService.saveServices(updated);
      setServices(updated);
    }
    setIsModalOpen(false);
  };

  const handleFeatureChange = (index: number, value: string) => {
     const newFeatures = [...(formData.features || [])];
     newFeatures[index] = value;
     setFormData({ ...formData, features: newFeatures });
  };

  const addFeatureField = () => {
     setFormData({ ...formData, features: [...(formData.features || []), ''] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">业务服务管理</h1>
           <p className="text-sm text-gray-500">管理公司核心业务领域及服务内容</p>
        </div>
        <button onClick={handleAddNew} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition-colors">
          <Plus size={18} className="mr-2" /> 新增服务
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
               <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">排序</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">服务名称</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">描述</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">操作</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 text-gray-500">{service.order}</td>
                     <td className="px-6 py-4 font-bold text-gray-900">{service.title}</td>
                     <td className="px-6 py-4 text-gray-600 max-w-md truncate">{service.description}</td>
                     <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEdit(service)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
               <h2 className="text-xl font-bold mb-6">{editingItem ? '编辑服务' : '新增服务'}</h2>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">服务名称</label>
                     <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">简短描述</label>
                     <textarea required rows={3} className="w-full px-3 py-2 border rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">服务排序 (数字越小越靠前)</label>
                     <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">服务亮点 (列举式)</label>
                     <div className="space-y-2">
                        {formData.features?.map((feat, idx) => (
                           <input 
                              key={idx}
                              type="text" 
                              className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                              value={feat}
                              onChange={(e) => handleFeatureChange(idx, e.target.value)}
                              placeholder={`亮点 ${idx + 1}`}
                           />
                        ))}
                     </div>
                     <button type="button" onClick={addFeatureField} className="mt-2 text-sm text-primary hover:underline flex items-center">
                        <Plus size={14} className="mr-1"/> 添加亮点
                     </button>
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

export default ServiceManager;
