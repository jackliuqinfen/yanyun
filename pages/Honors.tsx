
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Calendar, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { storageService } from '../services/storageService';
import { Honor, HonorCategory } from '../types';

const MotionDiv = motion.div as any;

const Honors: React.FC = () => {
  const [honors, setHonors] = useState<Honor[]>([]);
  const [categories, setCategories] = useState<HonorCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const pageContent = storageService.getPageContent();
  const header = pageContent?.headers?.honors || {
    title: '荣誉资质',
    subtitle: '实力见证，载誉前行',
    backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop'
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [h, c] = await Promise.all([
        storageService.getHonors(),
        storageService.getHonorCategories()
      ]);
      setHonors(h);
      setCategories(c.sort((a, b) => a.order - b.order));
      setLoading(false);
    };
    fetchData();
  }, []);

  const openPreview = (e: React.MouseEvent, imageUrl: string) => {
     e.preventDefault();
     e.stopPropagation();
     setPreviewImage(imageUrl);
  };

  const closePreview = () => {
     setPreviewImage(null);
  };

  const renderHonorCard = (honor: Honor) => (
      <MotionDiv
         layout
         initial={{ opacity: 0, scale: 0.95 }}
         whileInView={{ opacity: 1, scale: 1 }}
         viewport={{ once: true, margin: "-50px" }}
         transition={{ duration: 0.4 }}
         key={honor.id}
         className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col h-full"
         onClick={(e: React.MouseEvent) => honor.imageUrl && openPreview(e, honor.imageUrl)}
      >
         <div className="relative aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden mb-4 border border-gray-100 flex items-center justify-center">
            {honor.imageUrl ? (
               <>
                  <img 
                     src={honor.imageUrl} 
                     alt={honor.title} 
                     className="max-w-full max-h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" 
                  />
                  {/* Overlay for Click Hint */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full shadow-sm text-gray-700">点击预览大图</span>
                  </div>
               </>
            ) : (
               <div className="text-gray-300">
                  <Award size={48} />
               </div>
            )}
         </div>
         
         <div className="flex flex-col flex-grow">
            <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">{honor.title}</h3>
            <div className="mt-auto pt-3 border-t border-gray-50 space-y-1">
                <p className="text-xs font-bold text-primary uppercase tracking-wider truncate" title={honor.issuingAuthority}>{honor.issuingAuthority}</p>
                <p className="text-xs text-gray-400 flex items-center">
                   <Calendar size={12} className="mr-1" /> {honor.issueDate}
                </p>
            </div>
         </div>
      </MotionDiv>
  );

  const renderEmptyState = () => (
    <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
       <Award size={48} className="mx-auto mb-4 opacity-20" />
       <p>该分类下暂无证书展示</p>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="bg-surface min-h-screen">
      <PageHeader 
        title={header.title} 
        subtitle={header.subtitle}
        backgroundImage={header.backgroundImage}
      />

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePreview}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          >
             <button 
                onClick={closePreview}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
             </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                   全部资质
                   {activeCategory === 'all' && <CheckCircle2 size={16} />}
                </button>
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
                      const catHonors = honors.filter(h => h.categoryId === cat.id);
                      if (catHonors.length === 0) return null;
                      return (
                         <div key={cat.id}>
                            <div className="mb-6 flex items-center gap-4">
                               <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-3">{cat.name}</h2>
                               <div className="h-px flex-1 bg-gray-200"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                               {catHonors.map(renderHonorCard)}
                            </div>
                         </div>
                      );
                   })}
                   {honors.length === 0 && renderEmptyState()}
                </div>
             ) : (
                <>
                   <div className="mb-8 flex items-end gap-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                         {categories.find(c => c.id === activeCategory)?.name}
                      </h2>
                      <div className="h-px flex-1 bg-gray-200 mb-2"></div>
                      <span className="text-sm font-medium text-gray-400 mb-1">
                         共 {honors.filter(h => h.categoryId === activeCategory).length} 项
                      </span>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {honors.filter(h => h.categoryId === activeCategory).map(renderHonorCard)}
                   </div>
                   
                   {honors.filter(h => h.categoryId === activeCategory).length === 0 && renderEmptyState()}
                </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Honors;
