
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Megaphone, AlertCircle, ChevronRight, Calendar, MapPin, Tag, Clock } from 'lucide-react';
// Import Link for navigation
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { storageService } from '../services/storageService';
import { TenderItem, TenderCategory } from '../types';

// Cast motion component to bypass layout prop and animate prop missing errors
const MotionDiv = motion.div as any;

const Tenders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TenderCategory>('招标公告');
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const header = storageService.getPageContent().headers.tenders || {
    title: '招标信息',
    subtitle: '公开、公平、公正的信息发布平台',
    backgroundImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop'
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await storageService.getTenders();
      const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTenders(sorted);
      setLoading(false);
    };
    fetchData();
  }, []);

  const categories: { id: TenderCategory; label: string; icon: any }[] = [
    { id: '招标公告', label: '招标公告', icon: Megaphone },
    { id: '中标公告', label: '中标公告', icon: FileText },
    { id: '其他公告', label: '其他公告', icon: AlertCircle },
  ];

  const filteredTenders = tenders.filter(item => {
    const matchesTab = item.category === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.projectNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '报名中': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case '进行中': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '公示中': return 'bg-amber-100 text-amber-700 border-amber-200';
      case '已截止': return 'bg-gray-100 text-gray-500 border-gray-200';
      case '已结束': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <PageHeader 
        title={header.title} 
        subtitle={header.subtitle}
        backgroundImage={header.backgroundImage}
      />

      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
          {/* Top Bar with Tabs and Search */}
          <div className="flex flex-col md:flex-row border-b border-gray-100">
            {/* Left: Tabs */}
            <div className="flex-1 flex overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`flex items-center gap-2 px-8 py-6 font-bold text-sm transition-all whitespace-nowrap border-b-2 relative ${
                      isActive 
                        ? 'text-primary border-primary bg-primary/5' 
                        : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-400'} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Right: Search */}
            <div className="p-4 md:border-l border-gray-100 bg-gray-50/50 flex items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="输入项目名称或编号..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm">正在加载招标数据...</p>
              </div>
            ) : filteredTenders.length > 0 ? (
              <MotionDiv 
                layout
                className="space-y-4"
              >
                <AnimatePresence>
                  {filteredTenders.map((item, idx) => (
                    <MotionDiv
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: idx * 0.05 }}
                      key={item.id}
                    >
                      <Link 
                        to={`/tenders/${item.id}`}
                        className="block group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer relative"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                              <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">
                                {item.projectNo}
                              </span>
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin size={12} />
                                {item.region}
                              </div>
                              <div className="flex items-center gap-1">
                                <Tag size={12} />
                                {item.category}
                              </div>
                              {item.deadline && (
                                <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                  <Clock size={12} />
                                  截止: {item.deadline}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 min-w-[140px] border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                            <div className="text-right">
                              <div className="flex items-center text-gray-900 font-bold text-sm">
                                <Calendar size={14} className="mr-1.5 text-gray-400" />
                                {item.date}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1">发布时间</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all">
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </MotionDiv>
                  ))}
                </AnimatePresence>
              </MotionDiv>
            ) : (
              <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="inline-flex p-4 bg-white rounded-full text-gray-300 mb-4 shadow-sm">
                  <Search size={32} />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">未找到相关信息</h3>
                <p className="text-gray-500 text-sm">请尝试调整搜索关键词或切换分类</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tenders;
