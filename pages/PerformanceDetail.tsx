
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Building2, Briefcase, FileText, ExternalLink, Download, Printer, Share2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { PerformanceItem } from '../types';

const MotionDiv = motion.div as any;

const PerformanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [performance, setPerformance] = useState<PerformanceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        const item = await storageService.getPerformanceById(id);
        if (item) {
          setPerformance(item);
        } else {
          navigate('/performances');
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center">
           <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
           <p className="text-gray-400 text-sm">正在加载业绩详情...</p>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
           <FileText size={48} className="mx-auto text-gray-300 mb-4" />
           <h2 className="text-xl font-bold text-gray-800 mb-2">未找到该业绩信息</h2>
           <Link to="/performances" className="text-primary hover:underline">返回列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen print:bg-white pb-20">
      {/* Header / Breadcrumb - Hidden on print */}
      <div className="bg-white border-b border-gray-200 print:hidden pt-20">
         <div className="container mx-auto px-6 py-4">
            <Link to="/performances" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
               <ArrowLeft size={16} className="mr-1" /> 返回业绩库
            </Link>
         </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl">
         <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none"
         >
            {/* Document Header */}
            <div className="p-8 md:p-12 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
               <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                     {performance.category}
                  </span>
                  {performance.amount && (
                     <span className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-100">
                        {performance.amount}
                     </span>
                  )}
               </div>

               <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-8">
                  {performance.title}
               </h1>

               <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-sm text-gray-500 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center">
                     <Calendar size={18} className="mr-2 text-primary" />
                     <span>时间：<span className="text-gray-900 font-bold">{performance.date}</span></span>
                  </div>
                  <div className="flex items-center">
                     <Building2 size={18} className="mr-2 text-primary" />
                     <span>业主：<span className="text-gray-900 font-bold">{performance.client}</span></span>
                  </div>
               </div>
            </div>

            {/* Actions Bar - Hidden on print */}
            <div className="px-8 py-4 bg-gray-50 flex flex-wrap justify-end gap-3 print:hidden border-b border-gray-100">
               <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                  <Printer size={16} /> 打印
               </button>
               {performance.pdfUrl && (
                  <a 
                    href={performance.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary hover:bg-primary-dark rounded-lg font-bold shadow-lg shadow-primary/20 transition-all"
                  >
                     <Download size={16} /> 下载相关附件 (PDF)
                  </a>
               )}
               {performance.linkUrl && (
                  <a 
                    href={performance.linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-primary bg-white border border-primary/20 hover:bg-blue-50 rounded-lg font-bold transition-all"
                  >
                     <ExternalLink size={16} /> 访问外部链接
                  </a>
               )}
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-12">
               <div 
                  className="prose prose-lg prose-blue max-w-none text-gray-700 leading-loose"
                  dangerouslySetInnerHTML={{ __html: performance.content || '<p class="text-gray-400 italic">暂无详细业绩描述。</p>' }}
               />
            </div>
         </MotionDiv>
      </div>
    </div>
  );
};

export default PerformanceDetail;
