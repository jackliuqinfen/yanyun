import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { Users, FileText, Briefcase, Award, ArrowUpRight, Activity, TrendingUp, Clock, MousePointer2, Settings, Megaphone, Shield, MessageSquare, MoreHorizontal, Download, Printer, Filter, Calendar, Target, Zap } from 'lucide-react';
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
    { name: '市政工程', count: 4, color: '#4F46E5' },
    { name: '住宅工程', count: 8, color: '#10B981' },
    { name: '商业综合', count: 3, color: '#F59E0B' },
    { name: '工业厂房', count: 5, color: '#6366F1' },
  ];

  const statCards = [
    { title: '新闻动态', value: stats.newsCount, icon: FileText, color: 'text-indigo-600 bg-indigo-50', trend: '+12%', label: '较上月' },
    { title: '进行中项目', value: stats.projectCount, icon: Briefcase, color: 'text-emerald-600 bg-emerald-50', trend: '+5', label: '本月新增' },
    { title: '招标公告', value: stats.tenderCount, icon: Megaphone, color: 'text-amber-600 bg-amber-50', trend: '稳定', label: '进行中' },
    { title: '企业荣誉', value: stats.honorCount, icon: Award, color: 'text-rose-600 bg-rose-50', trend: '+2', label: '资质认证' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">控制台概览</h1>
           <p className="text-slate-500 text-sm mt-1">欢迎回来，{storageService.getCurrentUser()?.name}。今日系统运行状态良好。</p>
        </div>
        
        {/* Quick Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
           <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm">
              <Activity size={14} /> 实时监控
           </button>
           <div className="w-px h-6 bg-slate-200 mx-1"></div>
           <button className="flex items-center gap-2 px-3 py-2 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">
              <Download size={14} /> 导出报表
           </button>
           <button className="flex items-center gap-2 px-3 py-2 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">
              <Printer size={14} /> 打印视图
           </button>
           <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50">
              <Filter size={16} />
           </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <MotionDiv 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
               <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                     <Icon size={22} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                     {stat.trend}
                  </span>
               </div>
               <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
               </div>
               <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={12} /> {stat.label}
               </div>
            </MotionDiv>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <MotionDiv 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100"
        >
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-lg font-bold text-slate-900">流量分析</h3>
                <p className="text-xs text-slate-500 mt-1">周访问量与用户参与度统计</p>
             </div>
             <select className="bg-slate-50 border-none text-xs font-semibold text-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500/20">
                <option>最近7天</option>
                <option>最近30天</option>
                <option>本年度</option>
             </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontWeight: 500}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)',
                    padding: '12px'
                  }} 
                  cursor={{stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="visits" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>

        {/* Side Stats */}
        <div className="space-y-6">
           {/* Project Distribution */}
           <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">项目分布</h3>
              <div className="h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {projectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-2xl font-bold text-slate-900">{stats.projectCount}</span>
                   <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">项目总数</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                 {projectData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                          <span className="text-slate-600 font-medium">{item.name}</span>
                       </div>
                       <span className="font-bold text-slate-900">{Math.round((item.count / stats.projectCount) * 100)}%</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Quick Task */}
           <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="relative z-10">
                 <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                    <Zap size={20} className="text-white" />
                 </div>
                 <h3 className="text-lg font-bold mb-1">系统状态</h3>
                 <p className="text-indigo-100 text-xs mb-4">所有服务运行正常，未检测到异常。</p>
                 <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
                    运行诊断
                 </button>
              </div>
           </div>
        </div>
      </div>
      
      {/* Recent Activity Table (Mock) */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">最近动态</h3>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">查看全部</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                  <tr>
                     <th className="px-6 py-3 font-semibold">用户</th>
                     <th className="px-6 py-3 font-semibold">操作</th>
                     <th className="px-6 py-3 font-semibold">目标</th>
                     <th className="px-6 py-3 font-semibold">时间</th>
                     <th className="px-6 py-3 font-semibold">状态</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {[
                     { user: 'Admin', action: '创建项目', target: '盐城大桥', time: '2分钟前', status: 'Success' },
                     { user: '张伟', action: '更新设置', target: '站点配置', time: '1小时前', status: 'Success' },
                     { user: 'System', action: '备份数据', target: '数据库', time: '4小时前', status: 'Processing' },
                     { user: '李娜', action: '上传文件', target: '合同副本.pdf', time: '5小时前', status: 'Success' },
                  ].map((row, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{row.user}</td>
                        <td className="px-6 py-4 text-slate-600">{row.action}</td>
                        <td className="px-6 py-4 text-slate-600">{row.target}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs">{row.time}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              row.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                           }`}>
                              {row.status === 'Success' ? '成功' : '进行中'}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
