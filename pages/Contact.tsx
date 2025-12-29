
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { storageService } from '../services/storageService';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    type: '工程监理',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const settings = storageService.getSettingsSync();
  const header = storageService.getPageContent().headers.contact;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('留言已提交，我们的专家将在24小时内与您联系！');
      setFormState({ name: '', phone: '', email: '', type: '工程监理', message: '' });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white">
      <PageHeader 
        title={header.title} 
        subtitle={header.subtitle}
        backgroundImage={header.backgroundImage}
      />

      <div className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Info Side */}
          <div>
            <div className="mb-10">
               <h2 className="text-3xl font-bold text-gray-900 mb-4">让我们开始对话</h2>
               <p className="text-gray-600 text-lg">
                  无论您有项目咨询需求，还是寻求商务合作，我们都随时准备为您提供帮助。
               </p>
            </div>

            <div className="space-y-8 bg-surface p-8 rounded-2xl border border-gray-100">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-white border border-gray-200 text-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">公司总部</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{settings.contactAddress}</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-white border border-gray-200 text-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">咨询热线</h3>
                  <p className="text-primary font-bold text-xl">{settings.contactPhone}</p>
                  <p className="text-gray-500 text-sm mt-1 flex items-center">
                     <Clock size={12} className="mr-1" /> 周一至周五 9:00 - 18:00
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-white border border-gray-200 text-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">电子邮箱</h3>
                  <a href={`mailto:${settings.contactEmail}`} className="text-gray-600 hover:text-primary transition-colors block">{settings.contactEmail}</a>
                </div>
              </div>
            </div>

            {/* Simulated Map */}
            <div className="mt-8 rounded-2xl h-48 w-full flex items-center justify-center overflow-hidden relative border border-gray-200 group">
               <img 
                 src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" 
                 alt="Map"
                 className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500"
               />
               <a 
                 href="https://maps.google.com" 
                 target="_blank" 
                 rel="noreferrer"
                 className="bg-white px-4 py-2 rounded-full shadow-lg relative z-10 text-sm font-bold text-primary hover:scale-105 transition-transform flex items-center"
               >
                 <MapPin size={16} className="mr-2" /> 打开地图导航
               </a>
            </div>
          </div>

          {/* Contact Form Side */}
          <div className="bg-white p-10 rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8"></div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
               <MessageSquare className="mr-2 text-primary" /> 在线留言
            </h2>
            <p className="text-gray-500 mb-8 text-sm">请填写以下信息，我们的工程专家将尽快为您提供专业解答。</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">姓名 <span className="text-red-500">*</span></label>
                  <input 
                     type="text" 
                     name="name"
                     required
                     value={formState.name}
                     onChange={handleChange}
                     className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                     placeholder="您的姓名" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">电话 <span className="text-red-500">*</span></label>
                  <input 
                     type="tel" 
                     name="phone"
                     required
                     value={formState.phone}
                     onChange={handleChange}
                     className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                     placeholder="联系电话" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">电子邮箱</label>
                  <input 
                     type="email" 
                     name="email"
                     value={formState.email}
                     onChange={handleChange}
                     className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                     placeholder="example@email.com" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">咨询类型</label>
                  <div className="relative">
                     <select 
                        name="type"
                        value={formState.type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer"
                     >
                        <option>工程监理</option>
                        <option>项目管理</option>
                        <option>造价咨询</option>
                        <option>招标代理</option>
                        <option>商务合作</option>
                        <option>其他</option>
                     </select>
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">咨询内容</label>
                <textarea 
                  name="message"
                  rows={4} 
                  required
                  value={formState.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none" 
                  placeholder="请简要描述您的项目情况或需求..."
                ></textarea>
              </div>

              <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
               >
                {isSubmitting ? (
                   <span className="flex items-center"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span> 提交中...</span>
                ) : (
                   <span className="flex items-center"><Send size={18} className="mr-2" /> 提交留言</span>
                )}
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-4">
                 提交即表示您同意我们的隐私政策。您的信息将严格保密。
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
