
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Award, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Honor } from '../types';

// Cast motion component
const MotionDiv = motion.div as any;

const HonorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [honor, setHonor] = useState<Honor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        const honors = await storageService.getHonors();
        const item = honors.find(h => h.id === id);
        if (item) {
          setHonor(item);
        } else {
          navigate('/honors');
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading || !honor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 pt-20">
         <div className="container mx-auto px-6 py-4">
            <Link to="/honors" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
               <ArrowLeft size={16} className="mr-1" /> 返回荣誉列表
            </Link>
         </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 max-w-5xl">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left: Image */}
            <MotionDiv 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100"
            >
                <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-[3/4] flex items-center justify-center relative">
                    {honor.imageUrl ? (
                        <img src={honor.imageUrl} alt={honor.title} className="w-full h-full object-contain" />
                    ) : (
                        <Award size={64} className="text-gray-300"/>
                    )}
                </div>
            </MotionDiv>

            {/* Right: Content */}
            <MotionDiv 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{honor.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center"><Calendar size={16} className="mr-2"/> 颁发日期: <span className="font-bold text-gray-800 ml-1">{honor.issueDate}</span></span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="text-accent" size={24}/>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">颁发机构</h3>
                    </div>
                    <p className="text-xl font-black text-primary">{honor.issuingAuthority}</p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3">详细介绍</h3>
                    <div className="prose prose-blue text-gray-600 leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: honor.content || '<p class="text-gray-400 italic">暂无更多详细描述。</p>' }} />
                    </div>
                </div>

                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl text-sm font-medium">
                    <CheckCircle size={18} />
                    <span>该证书/荣誉经官方核实有效</span>
                </div>
            </MotionDiv>
         </div>
      </div>
    </div>
  );
};

export default HonorDetail;
