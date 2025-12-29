
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { Users, FileText, Briefcase, Award, ArrowUpRight, Activity, TrendingUp, Clock, MousePointer2, Settings, Megaphone, Shield, MessageSquare } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { motion } from 'framer-motion';

// Cast motion components to bypass strict type errors on animate/initial props
const MotionDiv = motion.div as any;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    newsCount: 0,
    projectCount: 0,
    serviceCount: 0,
    honorCount: 0,
    tenderCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [news, projects, services, honors, tenders] = await Promise.all([
        storageService.getNews(),
        storageService.getProjects(),
        storageService.getServices(),
        storageService.getHonors(),
        storageService.getTenders()
      ]);
      setStats({
        newsCount: news.length,
        projectCount: projects.length,
        serviceCount: services.length,
        honorCount: honors.length,
        tenderCount: tenders.length
      });
    };
    fetchStats();
  }, []);
  
  const visitData = [
    { name: 'Mon', visits: 120, revenue: 400 },
    { name: 'Tue', visits: 132, revenue: 450 },
    { name: 'Wed', visits: 101, revenue: 420 },
    { name: 'Thu', visits: 134, revenue: 500 },
    { name: 'Fri', visits: 190, revenue: 620 },
    { name: 'Sat', visits: 230, revenue: 800 },
    { name: 'Sun', visits: 210, revenue: 750 },
  ];

  const projectData = [
    { name: '市政工程', count: 4, color: '#2C388B' },
    { name: '住宅工程', count: 8, color: '#4a5ed1' },
    { name: '商业综合', count: 3, color: '#faad14' },
    { name: '工业厂房', count: 5, color: '#52c41a' },
  ];

  const statCards = [
    { title: '发布动态', value: stats.newsCount, icon: FileText, color: 'bg-indigo-600', trend: '+12%', label: '本月新增' },
    { title: '管理项目', value: stats.projectCount, icon: Briefcase, color: 'bg-blue-600', trend: '+2', label: '进行中' },
    { title: '招标公告', value: stats.tenderCount, icon: Megaphone, color: 'bg-amber-500', trend: '活跃', label: '信息发布' },
    { title: '品牌荣誉', value: stats.honorCount, icon: Award, color: 'bg-emerald-600', trend: '持续增加', label: '资质认证' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">管理中心仪表盘</h1>
           <p className="text-gray-500 text-sm mt-1 font-medium">System Node Status: <span className="text-emerald-500">Active</span> · 欢迎回来，{storageService.getCurrentUser()?.name}</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
           <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">实时模式</button>
           <button className="px-4 py-2 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50">历史回顾</button>
        </div>
      </div>
      
      {/* Dynamic Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <MotionDiv 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
               <div className="relative z-10">
                  <div className={`${stat.color} w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-gray-200 mb-6 group-hover:rotate-12 transition-transform`}>
                     <Icon size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                     <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-gray-900 leading-none">{stat.value}</h3>
                        <span className="text-xs font-bold text-emerald-500">{stat.trend}</span>
                     </div>
                  </div>
               </div>
               <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </div>
            </MotionDiv>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Traffic Chart */}
        <MotionDiv 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200"
        >
          <div className="flex justify-between items-center mb-10">
             <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <TrendingUp size={20} className="text-primary" /> 全站流量监测
                </h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">Traffic & Engagement Metrics</p>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Live Updates</span>
             </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2C388B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2C388B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    padding: '16px'
                  }} 
                />
                <Area type="monotone" dataKey="visits" stroke="#2C388B" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>

        {/* Sidebar Mini-Stats & Activity */}
        <div className="lg:col-span-4 space-y-8">
           {/* Project Mix */}
           <MotionDiv initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-8">项目类型配比</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 700}} width={70} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20}>
                      {projectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </MotionDiv>

           {/* Recent Feed */}
           <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold flex items-center gap-2"><Activity size={18} className="text-blue-400" /> 最近动态</h3>
                 <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">查看全部</button>
              </div>
              <div className="space-y-4">
                 {[
                   { user: 'Admin', act: '发布了新案例', time: '2分钟前', icon: MousePointer2 },
                   { user: '张伟', act: '更新了全站设置', time: '1小时前', icon: Settings },
                   { user: 'System', act: '自动备份已完成', time: '4小时前', icon: Clock },
                   { user: '李娜', act: '审核了新的资质文件', time: '5小时前', icon: FileText },
                   { user: 'Admin', act: '修改了首页轮播图', time: '6小时前', icon: MousePointer2 },
                   { user: '王强', act: '上传了项目现场照片', time: '1天前', icon: Briefcase },
                   { user: 'System', act: '检测到异常登录尝试', time: '1天前', icon: Shield },
                   { user: '赵敏', act: '回复了客户咨询', time: '2天前', icon: MessageSquare },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                         <item.icon size={16} className="text-white/40 group-hover:text-white" />
                      </div>
                      <div className="min-w-0">
                         <p className="text-xs font-bold">{item.user} <span className="text-white/40 font-normal">{item.act}</span></p>
                         <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest">{item.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </MotionDiv>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
