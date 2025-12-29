
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ArrowUpRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { storageService } from '../services/storageService';
import { ProjectCase } from '../types';

// Cast motion component to bypass layout prop and animate prop missing errors
const MotionDiv = motion.div as any;

const Cases: React.FC = () => {
  const [filter, setFilter] = useState('全部');
  const [projects, setProjects] = useState<ProjectCase[]>([]);
  const header = storageService.getPageContent().headers.cases;

  useEffect(() => {
    storageService.getProjects().then(setProjects);
  }, []);

  const categories = ['全部', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = filter === '全部' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={header.title} 
        subtitle={header.subtitle}
        backgroundImage={header.backgroundImage}
      />

      <div className="container mx-auto px-6 py-20">
        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((cat) => (
            <button
              key={cat as string}
              onClick={() => setFilter(cat as string)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              {cat as string}
            </button>
          ))}
        </div>

        {/* Grid */}
        <MotionDiv 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredProjects.map((project: ProjectCase) => (
              <MotionDiv
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={project.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gray-900/20 z-10 group-hover:bg-gray-900/10 transition-colors"></div>
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 z-20">
                     <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-primary text-xs font-bold rounded-md shadow-sm">
                       {project.category}
                     </span>
                  </div>
                  {project.isFeatured && (
                    <div className="absolute top-4 right-4 z-20 bg-accent text-white p-1.5 rounded-full shadow-lg" title="精选案例">
                       <Award size={16} />
                    </div>
                  )}
                  
                  {/* Minimized Interaction Overlay */}
                  <Link to={`/cases/${project.id}`} className="absolute inset-0 bg-primary/80 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm cursor-pointer">
                      <button className="w-16 h-16 bg-white text-primary rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
                          <ArrowUpRight size={32} />
                      </button>
                  </Link>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <Link to={`/cases/${project.id}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  </Link>
                  <div className="flex items-center text-gray-500 text-xs mb-4">
                    <MapPin size={12} className="mr-1" />
                    <span className="mr-4">{project.location}</span>
                    <Calendar size={12} className="mr-1" />
                    <span>{project.date} 交付</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
                    {project.description}
                  </p>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center group/btn">
                     <Link to={`/cases/${project.id}`} className="flex items-center justify-between w-full">
                        <span className="text-xs text-gray-400 font-medium group-hover:text-primary transition-colors">查看完整案例</span>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowUpRight size={16} />
                        </div>
                     </Link>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </AnimatePresence>
        </MotionDiv>
      </div>
    </div>
  );
};

export default Cases;
