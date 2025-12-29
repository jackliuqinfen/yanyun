
import React, { useEffect, useState } from 'react';
// Fix react-router-dom export errors
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowLeft, Share2, Clock, ChevronRight } from 'lucide-react';
import { storageService } from '../services/storageService';
import { NewsItem } from '../types';

// Cast motion component to bypass type issues
const MotionDiv = motion.div as any;

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when ID changes
    window.scrollTo(0, 0);

    const fetchData = async () => {
      if (id) {
        setLoading(true);
        const item = await storageService.getNewsById(id);
        if (item) {
          setNewsItem(item);
          const related = await storageService.getRelatedNews(id);
          setRelatedNews(related);
        } else {
          // Handle not found
          navigate('/news');
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  if (loading || !newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-2 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header Section */}
      <section className="bg-white pt-32 pb-12 border-b border-gray-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <Link 
            to="/news" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            返回列表
          </Link>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <span className="px-3 py-1 bg-blue-50 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                {newsItem.category}
              </span>
              <span className="flex items-center text-gray-500 text-sm">
                <Calendar size={14} className="mr-2" />
                {newsItem.date}
              </span>
              <span className="flex items-center text-gray-500 text-sm">
                <Clock size={14} className="mr-2" />
                3 分钟阅读
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-8">
              {newsItem.title}
            </h1>

            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                   盐
                 </div>
                 <div>
                   <p className="text-sm font-bold text-gray-900">江苏盐韵</p>
                   <p className="text-xs text-gray-500">官方发布</p>
                 </div>
               </div>
               <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                 <Share2 size={20} />
               </button>
            </div>
          </MotionDiv>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-6xl mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <MotionDiv 
            className="lg:col-span-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {newsItem.imageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-soft mb-10">
                <img 
                  src={newsItem.imageUrl} 
                  alt={newsItem.title} 
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-loose">
              <p className="lead text-xl text-gray-600 mb-8 font-light">
                {newsItem.summary}
              </p>
              
              {/* Simulating rich text content blocks */}
              <div className="space-y-6">
                <p>
                  近日，在全省范围内的工程质量评比中，我司再次凭借严谨的管理体系和卓越的技术实力脱颖而出。这不仅是对过去一年工作的肯定，更是对未来发展的鞭策。
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">追求卓越，止于至善</h3>
                <p>
                  作为行业内的领军企业，江苏盐韵始终坚持“质量第一，安全至上”的原则。在本项目中，我们采用了最新的BIM技术进行全过程模拟，有效规避了施工风险，提高了管理效率。
                </p>
                <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600 my-8 bg-blue-50/50 p-4 rounded-r-lg">
                  "工程质量是企业的生命线，我们必须以工匠精神对待每一个细节。" —— 公司总经理
                </blockquote>
                <p>
                  未来，我们将 continue 加大技术创新投入，引进更多高素质人才，为客户提供更加优质、高效的工程项目管理服务，为江苏省的城市建设贡献更多力量。
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 flex items-center gap-2">
              <Tag size={16} className="text-gray-400" />
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 cursor-pointer transition-colors">工程管理</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 cursor-pointer transition-colors">企业荣誉</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 cursor-pointer transition-colors">盐城</span>
              </div>
            </div>
          </MotionDiv>

          {/* Sidebar - Related News */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-32">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1 h-6 bg-accent rounded-full mr-3"></span>
                相关阅读
              </h3>
              
              <div className="space-y-6">
                {relatedNews.map((item) => (
                  <Link 
                    key={item.id} 
                    to={`/news/${item.id}`}
                    className="block group"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-400">
                           <Calendar size={12} className="mr-1" />
                           {item.date}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link 
                  to="/news" 
                  className="flex items-center justify-center w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                >
                  查看所有新闻 <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
