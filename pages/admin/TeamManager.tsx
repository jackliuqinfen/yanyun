
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { TeamMember } from '../../types';
import ImageUpload from '../../components/ImageUpload';

const TeamManager: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);

  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    storageService.getTeamMembers().then(setTeam);
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该成员吗？')) {
      const updated = team.filter(t => t.id !== id);
      await storageService.saveTeam(updated);
      setTeam(updated);
    }
  };

  const handleEdit = (item: TeamMember) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      role: '',
      description: '',
      imageUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const updated = team.map(t => t.id === editingItem.id ? { ...t, ...formData } as TeamMember : t);
      await storageService.saveTeam(updated);
      setTeam(updated);
    } else {
      const newItem: TeamMember = { ...formData as TeamMember, id: Date.now().toString() };
      const updated = [...team, newItem];
      await storageService.saveTeam(updated);
      setTeam(updated);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">核心团队管理</h1>
           <p className="text-sm text-gray-500">管理公司核心管理层与技术骨干信息</p>
        </div>
        <button onClick={handleAddNew} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition-colors">
          <Plus size={18} className="mr-2" /> 新增成员
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {team.map(member => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
               <div className="aspect-[4/3] bg-gray-100 relative">
                  <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                     <button onClick={() => handleEdit(member)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                     <button onClick={() => handleDelete(member.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                  </div>
               </div>
               <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-gray-500 text-sm line-clamp-2">{member.description}</p>
               </div>
            </div>
         ))}
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
               <h2 className="text-xl font-bold mb-6">{editingItem ? '编辑成员' : '新增成员'}</h2>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">姓名</label>
                     <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">职位</label>
                     <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                  </div>
                  <ImageUpload label="照片" value={formData.imageUrl} onChange={b64 => setFormData({...formData, imageUrl: b64})} />
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">简介</label>
                     <textarea rows={3} className="w-full px-3 py-2 border rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
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

export default TeamManager;
