
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ChevronDown, ChevronUp, Shield, Clock, TrendingUp, Users, HardHat, Kanban, Landmark, Gavel, Calculator, Scale, Briefcase } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { storageService } from '../services/storageService';
import { Service } from '../types';

// Cast motion component to avoid type errors on framer-motion props
const MotionDiv = motion.div as any;

const Services: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [services, setServices] = useState<Service[]>([]);
  const content = storageService.getPageContent().services;
  const header = storageService.getPageContent().headers.services;
  const location = useLocation();

  useEffect(() => {
    storageService.getServices().then(setServices);
  }, []);

  // Handle Anchor Scrolling
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Delay slightly to ensure DOM is rendered
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 100; // Fixed header height
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    }
  }, [location, services]);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const getServiceIcon = (iconName: string) => {
     switch (iconName) {
        case 'hard-hat': return HardHat;
        case 'kanban': return Kanban;
        case 'landmark': return Landmark;
        case 'gavel': return Gavel;
        case 'calculator': return Calculator;
        case 'scale': return Scale;
        case 'briefcase': return Briefcase;
        default: return Shield;
     }
  };

  const getIcon = (iconName: string) => {
     switch(iconName) {
        case 'Shield': return Shield;
        case 'Clock': return Clock;
        case 'TrendingUp': return TrendingUp;
        case 'Users': return Users;
        default: return Shield;
     }
  };

  return (
    <div className="bg-white">
      <PageHeader 
        title={header.title} 
        subtitle={header.subtitle}
        backgroundImage={header.backgroundImage}
      />

      {/* Intro Stats - Dynamic */}
      <section className="py-16 bg-white border-b border-gray-100">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {content.introStats.map((item, i) => {
                  const Icon = getIcon(item.icon);
                  return (
                     <div key={i} className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-4">
                           <Icon size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900">{item.label}</h4>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                     </div>
                  );
               })}
            </div>
         </div>
      </section>

      {/* Main Services List */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="space-y-16 md:space-y-32">
          {services.map((service, idx) => (
            <MotionDiv 
              key={service.id}
              id={`service-${service.id}`} // Added ID for anchor linking
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Image Side */}
              <div className="w-full md:w-1/2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 transform translate-x-4 translate-y-4 rounded-2xl transition-transform group-hover:translate-x-6 group-hover:translate-y-6 hidden md:block"></div>
                  <img 
                    src={`https://images.unsplash.com/photo-${idx % 2 === 0 ? '1541888946425-d81bb19240f5' : '1504307651254-35680f356dfd'}?q=80&w=1000&auto=format&fit=crop`}
                    alt={service.title}
                    className="rounded-2xl shadow-xl w-full h-64 md:h-[400px] object-cover relative z-10"
                    loading="lazy"
                  />
                  {/* Floating Badge */}
                  <div className="absolute bottom-8 left-8 z-20 bg-white/90 backdrop-blur shadow-lg py-3 px-5 rounded-lg border-l-4 border-primary">
                     <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">核心优势</div>
                     <div className="font-bold text-gray-900">数字化全过程管控</div>
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full md:w-1/2">
                <div className="flex items-center space-x-3 mb-4">
                   <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      {(() => {
                        const Icon = getServiceIcon(service.icon);
                        return <Icon size={24} />;
                      })()}
                   </div>
                   <span className="text-sm font-bold text-primary uppercase tracking-widest">专业服务 0{idx + 1}</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">{service.title}</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {service.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                        <Check size={12} />
                      </div>
                      <span className="text-gray-700 font-medium text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>

      {/* FAQ Section - Dynamic */}
      <section className="py-20 bg-surface">
         <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-gray-900">常见问题解答</h2>
               <p className="text-gray-500 mt-2">解决您的顾虑，是合作的第一步</p>
            </div>
            <div className="space-y-4">
               {content.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                     <button 
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                     >
                        <span className="font-bold text-gray-800 text-lg">{faq.q}</span>
                        {openFaq === idx ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-gray-400" />}
                     </button>
                     <AnimatePresence>
                        {openFaq === idx && (
                           <MotionDiv 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-gray-50 border-t border-gray-100"
                           >
                              <div className="p-6 text-gray-600 leading-relaxed">
                                 {faq.a}
                              </div>
                           </MotionDiv>
                        )}
                     </AnimatePresence>
                  </div>
               ))}
            </div>
         </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-gray-900 py-20 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6">不仅是服务，更是承诺</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10">
            无论您的项目规模大小，我们都将全力以赴，为您提供最优质的专业服务。
          </p>
          <a href="#/contact" className="inline-block px-10 py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transition-colors border border-primary hover:border-primary-dark">
            联系我们获取方案
          </a>
        </div>
      </section>
    </div>
  );
};

export default Services;
