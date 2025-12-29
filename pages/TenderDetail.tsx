
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Printer, Share2, FileText, Clock, AlertCircle, Info } from 'lucide-react';
import { storageService } from '../services/storageService';
import { TenderItem } from '../types';

// Cast motion component
const MotionDiv = motion.div as any;

const TenderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tender, setTender] = useState<TenderItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        const item = await storageService.getTenderById(id);
        if (item) {
          setTender(item);
        } else {
          // If not found, imply redirect or show error
          // For now, let's render a not found state
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '报名中': return 'bg-emerald-600 text-white';
      case '进行中': return 'bg-blue-600 text-white';
      case '公示中': return 'bg-amber-500 text-white';
      case '已截止': return 'bg-gray-500 text-white';
      case '已结束': return 'bg-gray-800 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center">
           <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
           <p className="text-gray-400 text-sm">正在加载公告详情...</p>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
           <FileText size={48} className="mx-auto text-gray-300 mb-4" />
           <h2 className="text-xl font-bold text-gray-800 mb-2">未找到该公告</h2>
           <Link to="/tenders" className="text-primary hover:underline">返回列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen print:bg-white pb-20">
      {/* Header / Breadcrumb - Hidden on print */}
      <div className="bg-white border-b border-gray-200 print:hidden pt-20">
         <div className="container mx-auto px-6 py-4">
            <Link to="/tenders" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
               <ArrowLeft size={16} className="mr-1" /> 返回招标列表
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
                  <span className={`px-3 py-1 rounded-md text-xs font-bold ${getStatusColor(tender.status)}`}>
                     {tender.status}
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                     {tender.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-mono border border-gray-200">
                     {tender.projectNo}
                  </span>
               </div>

               <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-8">
                  {tender.title}
               </h1>

               <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-sm text-gray-500 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center">
                     <Calendar size={18} className="mr-2 text-primary" />
                     <span>发布日期：<span className="text-gray-900 font-bold">{tender.date}</span></span>
                  </div>
                  <div className="flex items-center">
                     <MapPin size={18} className="mr-2 text-primary" />
                     <span>所属区域：<span className="text-gray-900 font-bold">{tender.region}</span></span>
                  </div>
                  {tender.deadline && (
                     <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                        <Clock size={18} className="mr-2" />
                        <span>截止日期：<span className="font-bold">{tender.deadline}</span></span>
                     </div>
                  )}
               </div>
            </div>

            {/* Actions Bar - Hidden on print */}
            <div className="px-8 py-4 bg-gray-50 flex justify-end gap-3 print:hidden border-b border-gray-100">
               <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                  <Printer size={16} /> 打印本页
               </button>
               <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                  <Share2 size={16} /> 分享
               </button>
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-12">
               {/* HTML Content Injection */}
               <div 
                  className="prose prose-lg prose-blue max-w-none text-gray-700 leading-loose tender-content"
                  dangerouslySetInnerHTML={{ __html: tender.content || '<p class="text-gray-400 italic">暂无详细正文内容。</p>' }}
               />
               
               {/* Disclaimer */}
               <div className="mt-16 p-6 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                  <AlertCircle size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-500 leading-relaxed">
                     <p className="font-bold mb-1 text-gray-700">重要提示：</p>
                     <p>本平台发布的招标公告信息均来源于招标人或招标代理机构，信息的真实性、准确性和合法性由信息发布人负责。请投标人在投标前仔细核实相关信息。</p>
                  </div>
               </div>
            </div>
         </MotionDiv>
      </div>
      
      {/* Custom Styles for injected HTML content to ensure it looks good */}
      <style>{`
        .tender-content h1, .tender-content h2, .tender-content h3 {
           color: #111827;
           font-weight: 800;
           margin-top: 2em;
           margin-bottom: 1em;
        }
        .tender-content h3 {
           font-size: 1.25rem;
           border-left: 4px solid #2C388B;
           padding-left: 1rem;
        }
        .tender-content p {
           margin-bottom: 1.5em;
           line-height: 1.8;
        }
        .tender-content ul, .tender-content ol {
           margin-bottom: 1.5em;
           padding-left: 1.5rem;
        }
        .tender-content li {
           margin-bottom: 0.5em;
        }
        .tender-content table {
           width: 100%;
           border-collapse: collapse;
           margin: 2rem 0;
           font-size: 0.95rem;
        }
        .tender-content th, .tender-content td {
           border: 1px solid #e5e7eb;
           padding: 1rem;
           text-align: left;
        }
        .tender-content th {
           background-color: #f9fafb;
           font-weight: 700;
           color: #374151;
        }
        .tender-content strong {
           color: #111827;
           font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default TenderDetail;
