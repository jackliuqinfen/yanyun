
import React from 'react';
import { MapPin, Phone, Mail, Clock, Globe, Navigation, ExternalLink, MessageCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { storageService } from '../services/storageService';

const Contact: React.FC = () => {
  const settings = storageService.getSettingsSync();
  const header = storageService.getPageContent().headers.contact;

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHeader 
        title={header.title} 
        subtitle={header.subtitle}
        backgroundImage={header.backgroundImage}
      />

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-20">
          
          {/* Header Section */}
          <div className="text-center space-y-4">
             <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">联系方式</h2>
             <p className="text-slate-500 max-w-2xl mx-auto">
                无论您有项目咨询需求，还是寻求商务合作，我们都随时准备为您提供帮助。
             </p>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {/* Phone */}
             <a href={`tel:${settings.contactPhone}`} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center cursor-pointer">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Phone size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">咨询热线</h3>
                <p className="text-slate-500 text-sm mb-4">周一至周五 9:00 - 18:00</p>
                <span className="text-indigo-600 font-bold text-lg group-hover:underline decoration-2 underline-offset-4">{settings.contactPhone}</span>
             </a>

             {/* Email */}
             <a href={`mailto:${settings.contactEmail}`} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center cursor-pointer">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Mail size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">电子邮箱</h3>
                <p className="text-slate-500 text-sm mb-4">商务合作与咨询</p>
                <span className="text-emerald-600 font-bold text-sm break-all group-hover:underline decoration-2 underline-offset-4">{settings.contactEmail}</span>
             </a>

             {/* Address */}
             <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center cursor-default">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <MapPin size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">公司总部</h3>
                <p className="text-slate-500 text-sm mb-4">江苏省盐城市</p>
                <span className="text-slate-700 font-medium text-sm px-4">{settings.contactAddress}</span>
             </div>

             {/* Social / Other */}
             <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <MessageCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">关注我们</h3>
                <p className="text-slate-500 text-sm mb-4">获取最新行业动态</p>
                <div className="flex gap-4">
                   <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-green-500 hover:text-white transition-colors">
                      <MessageCircle size={18} />
                   </button>
                   <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-500 hover:text-white transition-colors">
                      <Globe size={18} />
                   </button>
                </div>
             </div>
          </div>

          {/* Map Section */}
          <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/50 group h-[400px] bg-slate-100">
             <img 
               src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" 
               alt="Map Location"
               className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none"></div>
             
             <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
                <div className="text-white">
                   <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <MapPin className="text-amber-400" /> 江苏盐韵工程项目管理有限公司
                   </h3>
                   <p className="text-white/80 max-w-lg">{settings.contactAddress}</p>
                </div>
                <a 
                  href="https://ditu.amap.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-indigo-600 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 group/btn"
                >
                   <Navigation size={20} />
                   <span>导航前往</span>
                   <ExternalLink size={16} className="opacity-50 group-hover/btn:opacity-100" />
                </a>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
