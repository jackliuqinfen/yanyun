
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Target, CheckCircle, Calendar, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { storageService } from '../services/storageService';
import { Honor, TeamMember, HistoryEvent } from '../types';

// Cast motion components to resolve missing prop errors in the current type environment
const MotionDiv = motion.div as any;

const About: React.FC = () => {
  const [honors, setHonors] = useState<Honor[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const content = storageService.getPageContent().about;
  const header = storageService.getPageContent().headers.about;

  useEffect(() => {
    const fetchData = async () => {
      const [h, t, hist] = await Promise.all([
        storageService.getHonors(),
        storageService.getTeamMembers(),
        storageService.getHistory()
      ]);
      setHonors(h);
      setTeam(t);
      setHistory(hist);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white">
      <PageHeader 
        title={header.title} 
        subtitle={header.subtitle}
        backgroundImage={header.backgroundImage}
      />

      {/* Intro Section - Responsive Refinement */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <MotionDiv
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 flex items-center space-x-3">
                <div className="w-1 h-8 bg-primary rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{content.intro.title}</h2>
              </div>
              <div className="space-y-6 text-gray-600 leading-relaxed text-base md:text-lg">
                <p>{content.intro.content1}</p>
                <p>{content.intro.content2}</p>
              </div>
            </MotionDiv>
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-first lg:order-last"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl z-10 relative">
                <img 
                  src={content.intro.imageUrl} 
                  alt="Company Office" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-32 h-32 md:w-48 md:h-48 bg-gray-50 rounded-2xl -z-0"></div>
              <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-20 h-20 md:w-32 md:h-32 border-4 border-primary/10 rounded-full -z-0"></div>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Culture Section - Dynamic Grid */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Target, label: '企业使命', text: content.culture.mission },
              { icon: Award, label: '核心价值观', text: content.culture.values },
              { icon: ShieldCheck, label: '管理理念', text: content.culture.management }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 md:p-10 rounded-2xl shadow-soft text-center hover:-translate-y-2 transition-transform h-full flex flex-col border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">{item.label}</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honors Section - Improved Grid & Touch Targets */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
           <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">荣誉资质</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
              每一份荣誉都是对过去的肯定，更是对未来的激励。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {honors.map((honor, index) => (
              <MotionDiv 
                key={honor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-gray-100 flex flex-col cursor-pointer overflow-hidden transition-all duration-300"
              >
                 <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    <img 
                      src={honor.imageUrl} 
                      alt={honor.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 </div>
                 
                 <div className="p-6 relative flex-grow flex flex-col">
                    <div className="absolute -top-5 right-4 bg-accent text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1 group-hover:bg-primary transition-colors">
                      <Calendar size={10} />
                      {honor.issueDate}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base md:text-lg leading-snug mb-3 line-clamp-2 min-h-[3rem]">
                        {honor.title}
                    </h3>
                    <div className="mt-auto flex items-center text-xs md:text-sm text-gray-500 pt-4 border-t border-gray-100">
                       <CheckCircle size={14} className="text-primary mr-2 flex-shrink-0" />
                       <span className="truncate font-medium">{honor.issuingAuthority}</span>
                    </div>
                 </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline - Responsive Redesign */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">发展历程</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="max-w-4xl mx-auto relative px-4 md:px-0">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gray-200"></div>
            
            <div className="space-y-12">
              {history.map((event, idx) => (
                <MotionDiv 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex items-start md:items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Invisible spacer for desktop */}
                  <div className="hidden md:block md:w-1/2"></div>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 md:w-6 md:h-6 bg-white border-4 border-primary rounded-full z-10 shadow-sm"></div>
                  
                  {/* Content Container */}
                  <div className={`pl-12 md:pl-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-soft hover:shadow-md transition-shadow relative ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      {/* Arrow tail for desktop */}
                      <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45 ${idx % 2 === 0 ? '-right-1.5 rotate-[135deg]' : '-left-1.5 rotate-[-45deg]'}`}></div>
                      
                      <span className="text-xl md:text-2xl font-black text-primary block mb-1">{event.year}</span>
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Responsive Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">核心团队</h2>
            <p className="text-gray-500 text-sm md:text-base">汇聚行业精英，打造一流管理团队</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <MotionDiv 
                key={member.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full"
              >
                <div className="aspect-[4/5] md:aspect-[4/3] overflow-hidden">
                  <img 
                    src={member.imageUrl} 
                    alt={member.name} 
                    className="w-full h-full object-cover object-top" 
                    loading="lazy"
                  />
                </div>
                <div className="p-8 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary font-bold text-sm mb-4 tracking-wide">{member.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.description}</p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
