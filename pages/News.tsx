
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
// Fix react-router-dom export error
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { storageService } from '../services/storageService';
import { NewsItem } from '../types';

// Cast motion component to bypass property missing errors
const MotionDiv = motion.div as any;

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const header = storageService.getPageContent().headers.news;

  useEffect(() => {
    storageService.getNews().then(setNews);
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      <PageHeader 
        title={header.title} 
        subtitle={header.subtitle}
        backgroundImage={header.backgroundImage}
      />

      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={item.id}
            >
              <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full">
                <div className="h-56 overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                  />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-4">
                     <span className="px-3 py-1 bg-blue-50 text-primary text-xs font-bold rounded-full">
                       {item.category}
                     </span>
                     <div className="flex items-center text-gray-400 text-xs">
                        <Calendar size={12} className="mr-1" />
                        {item.date}
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors cursor-pointer">
                    <Link to={`/news/${item.id}`}>{item.title}</Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                    {item.summary}
                  </p>
                  <Link to={`/news/${item.id}`} className="inline-flex items-center text-primary font-bold text-sm hover:underline">
                    阅读更多 <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </article>
            </MotionDiv>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
