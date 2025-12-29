
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, History as HistoryIcon, Calendar } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { HistoryEvent } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion components to resolve missing prop errors
const MotionDiv = motion.div as any;

const HistoryManager: React.FC = () => {
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HistoryEvent | null>(null);

  const [formData, setFormData] = useState<Partial<HistoryEvent>>({
    year: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await storageService.getHistory();
    const sorted = data.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    setHistory(sorted);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该里程碑事件吗？此操作不可恢复。')) {
      const updated = history.filter(h => h.id !== id);
      await storageService.saveHistory(updated);
      setHistory(updated);
    }
  };

  const handleEdit = (item: HistoryEvent) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      year: new Date().getFullYear().toString(),
      title: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    if (editingItem) {
      updated = history.map(h => h.id === editingItem.id ? { ...h, ...formData } as HistoryEvent : h);
    } else {
      const newItem: HistoryEvent = { ...formData as HistoryEvent, id: Date.now().toString() };
      updated = [...history, newItem];
    }
    
    // 强制排序并保存
    updated.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    await storageService.saveHistory(updated);
    setHistory(updated);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">发展历程管理</h1>
           <p className="text-sm text-gray-500 mt-1">记录公司从诞生至今的重要时间节点与突破</p>
        </div>
        <button onClick={handleAddNew} className="bg-primary text-white px-6 py-2.5 rounded-xl flex items-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 font-bold">
          <Plus size={18} className="mr-2" /> 新增里程碑
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">年份</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">关键事件</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">详细背景描述</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">管理操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm font-black rounded-lg">
                      {event.year}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-gray-900">{event.title}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-gray-500 text-sm line-clamp-1 max-w-sm">{event.description}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleEdit(event)} className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200">
                          <Edit size={16}/>
                       </button>
                       <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200">
                          <Trash2 size={16}/>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <MotionDiv initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-50 text-primary rounded-2xl">
                     <HistoryIcon size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-gray-900">{editingItem ? '编辑历程节点' : '定义新里程碑'}</h2>
                     <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Timeline Milestone</p>
                  </div>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                     <div className="col-span-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">事件年份</label>
                        <input type="number" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                     </div>
                     <div className="col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">事件主标题</label>
                        <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="例如：公司正式成立" />
                     </div>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">历程详细描述 (将展示在时间轴中)</label>
                     <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="简要描述该阶段的重大突破或发展背景..." />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors">取消</button>
                     <button type="submit" className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">同步至官网</button>
                  </div>
               </form>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryManager;
