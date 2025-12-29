
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Tag, Share2, Printer } from 'lucide-react';
import { storageService } from '../services/storageService';
import { ProjectCase } from '../types';

// Cast motion component
const MotionDiv = motion.div as any;

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        const projects = await storageService.getProjects();
        const item = projects.find(p => p.id === id);
        if (item) {
          setProject(item);
        } else {
          navigate('/cases');
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header / Breadcrumb */}
      <div className="bg-surface border-b border-gray-100 pt-20">
         <div className="container mx-auto px-6 py-4">
            <Link to="/cases" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
               <ArrowLeft size={16} className="mr-1" /> 返回案例列表
            </Link>
         </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
         <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
         >
            {/* Project Hero Image */}
            <div className="relative aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl mb-12">
               <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
               <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                  <div className="flex flex-wrap gap-3 mb-4">
                     <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold border border-white/10">
                        {project.category}
                     </span>
                     {project.isFeatured && (
                        <span className="px-3 py-1 bg-accent text-white rounded-lg text-xs font-bold">
                           精选案例
                        </span>
                     )}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">{project.title}</h1>
                  <div className="flex flex-wrap gap-6 text-sm text-white/80 font-medium">
                     <span className="flex items-center"><MapPin size={16} className="mr-2"/> {project.location}</span>
                     <span className="flex items-center"><Calendar size={16} className="mr-2"/> {project.date} 交付</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               {/* Main Content */}
               <div className="lg:col-span-8">
                  <div className="bg-surface p-8 rounded-2xl border border-gray-100 mb-10">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">项目简介</h3>
                     <p className="text-lg text-gray-700 leading-relaxed font-medium">{project.description}</p>
                  </div>

                  <div className="prose prose-lg prose-blue max-w-none text-gray-600 leading-loose">
                     <div dangerouslySetInnerHTML={{ __html: project.content || '<p class="text-gray-400 italic">暂无详细案例内容。</p>' }} />
                  </div>
               </div>

               {/* Sidebar */}
               <div className="lg:col-span-4 space-y-8">
                  <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 sticky top-32">
                     <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Tag size={18} className="mr-2 text-primary"/> 项目信息
                     </h3>
                     <div className="space-y-4 text-sm">
                        <div className="flex justify-between py-3 border-b border-gray-50">
                           <span className="text-gray-500">工程类别</span>
                           <span className="font-bold text-gray-800">{project.category}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-50">
                           <span className="text-gray-500">建设地点</span>
                           <span className="font-bold text-gray-800">{project.location}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-50">
                           <span className="text-gray-500">交付时间</span>
                           <span className="font-bold text-gray-800">{project.date}</span>
                        </div>
                     </div>
                     
                     <div className="mt-8 pt-6 flex gap-3">
                        <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-600 font-bold text-sm transition-colors">
                           <Printer size={16}/> 打印
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white hover:bg-primary-dark rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20">
                           <Share2 size={16}/> 分享
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </MotionDiv>
      </div>
    </div>
  );
};

export default CaseDetail;
