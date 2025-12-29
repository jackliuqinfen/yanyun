
import React, { useState, useEffect } from 'react';
import { Building, Phone, User, MapPin, CheckCircle2, Building2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { storageService } from '../services/storageService';
import { Branch, BranchCategory } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<BranchCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  const header = storageService.getPageContent().headers.branches;

  useEffect(() => {
    const fetchData = async () => {
      const [b, c] = await Promise.all([
        storageService.getBranches(),
        storageService.getBranchCategories()
      ]);
      setBranches(b);
      setCategories(c.sort((a, b) => a.order - b.order));
      setLoading(false);
    };
    fetchData();
  }, []);

  const renderBranchCard = (branch: Branch) => (
    <MotionDiv
        key={branch.id}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
    >
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{branch.name}</h3>
            <div className="p-2 bg-blue-50 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                <Building size={20} />
            </div>
        </div>
        
        <div className="space-y-4">
            <div className="flex items-start space-x-3 text-gray-600">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-gray-400" />
                <span className="text-sm leading-relaxed">{branch.address}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
                <User size={16} className="flex-shrink-0 text-gray-400" />
                <span className="text-sm">负责人：<span className="font-bold text-gray-800">{branch.manager}</span></span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
                <Phone size={16} className="flex-shrink-0 text-gray-400" />
                <span className="text-sm font-medium">{branch.phone}</span>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
            <a 
                href={`https://map.baidu.com/search/${encodeURIComponent(branch.address)}`} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full py-2 text-center border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-bold"
            >
                查看地图定位
            </a>
        </div>
    </MotionDiv>
  );

  if (loading) {
    return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
       <PageHeader 
        title={header.title} 
        subtitle={header.subtitle}
        backgroundImage={header.backgroundImage}
      />

      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-24">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center mb-1 ${
                            activeCategory === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        全省网点分布
                        {activeCategory === 'all' && <CheckCircle2 size={16} />}
                    </button>
                    <div className="h-px bg-gray-100 my-2 mx-2"></div>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center mb-1 ${
                                activeCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {cat.name}
                            {activeCategory === cat.id && <CheckCircle2 size={16} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {activeCategory === 'all' ? (
                    <div className="space-y-16">
                        {categories.map(cat => {
                            const catBranches = branches.filter(b => b.categoryId === cat.id);
                            if (catBranches.length === 0) return null;
                            return (
                                <div key={cat.id}>
                                    <div className="mb-6 flex items-center gap-4">
                                        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-3 flex items-center">
                                            {cat.name}
                                            <span className="text-xs font-normal text-gray-400 ml-3 bg-gray-100 px-2 py-0.5 rounded-full">{catBranches.length} 个服务点</span>
                                        </h2>
                                        <div className="h-px flex-1 bg-gray-200"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {catBranches.map(renderBranchCard)}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Uncategorized fallback */}
                        {branches.filter(b => !b.categoryId || !categories.find(c => c.id === b.categoryId)).length > 0 && (
                             <div>
                                <div className="mb-6 flex items-center gap-4">
                                    <h2 className="text-xl font-bold text-gray-900 border-l-4 border-gray-400 pl-3">其他网点</h2>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {branches.filter(b => !b.categoryId || !categories.find(c => c.id === b.categoryId)).map(renderBranchCard)}
                                </div>
                            </div>
                        )}

                        {branches.length === 0 && (
                            <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                                <p>暂无分支机构数据</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="mb-8 flex items-end gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {categories.find(c => c.id === activeCategory)?.name}
                            </h2>
                            <div className="h-px flex-1 bg-gray-200 mb-2"></div>
                            <span className="text-sm font-medium text-gray-400 mb-1">
                                共 {branches.filter(b => b.categoryId === activeCategory).length} 个网点
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {branches.filter(b => b.categoryId === activeCategory).map(renderBranchCard)}
                        </div>
                        
                        {branches.filter(b => b.categoryId === activeCategory).length === 0 && (
                            <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                                <p>该区域下暂无网点数据</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Branches;
