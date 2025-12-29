
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Activity, AlertTriangle, Save, RefreshCw, Eye, EyeOff, Search } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { AuditLog, SecurityConfig } from '../../types';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const SecuritySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'policy' | 'logs'>('policy');
  const [config, setConfig] = useState<SecurityConfig>(storageService.getSecurityConfig());
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [logFilter, setLogFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLogsLoading(true);
    const data = await storageService.getAuditLogs();
    setLogs(data);
    setLogsLoading(false);
  };

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSecurityConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(logFilter.toLowerCase()) || 
    log.action.toLowerCase().includes(logFilter.toLowerCase()) ||
    log.details.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <ShieldCheck className="text-emerald-600" /> 安全合规审计
           </h1>
           <p className="text-gray-500 text-sm mt-1">ISO 27001 合规中心：管理安全策略与监控审计日志</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
         <button 
           onClick={() => setActiveTab('policy')}
           className={`px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'policy' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <Lock size={16} /> 安全策略配置
         </button>
         <button 
           onClick={() => setActiveTab('logs')}
           className={`px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <Activity size={16} /> 审计日志 (Audit Trail)
         </button>
      </div>

      {activeTab === 'policy' && (
        <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
           <form onSubmit={handleConfigSave} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">身份认证策略</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                       <div>
                          <p className="font-bold text-gray-800">强制 MFA 多因素认证</p>
                          <p className="text-xs text-gray-500">所有管理员登录时必须进行二次验证</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={config.mfaEnabled} onChange={e => setConfig({...config, mfaEnabled: e.target.checked})} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                       </label>
                    </div>

                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">密码最小长度</label>
                       <input type="number" min={8} max={32} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" value={config.passwordMinLength} onChange={e => setConfig({...config, passwordMinLength: parseInt(e.target.value)})} />
                       <p className="text-xs text-gray-400 mt-1">建议设置 12 位以上，包含大小写及符号</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">防护与风控</h3>
                    
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">最大登录失败尝试次数</label>
                       <input type="number" min={3} max={10} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" value={config.maxLoginAttempts} onChange={e => setConfig({...config, maxLoginAttempts: parseInt(e.target.value)})} />
                    </div>

                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">锁定账户时长 (分钟)</label>
                       <input type="number" min={5} max={1440} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" value={config.lockoutDurationMinutes} onChange={e => setConfig({...config, lockoutDurationMinutes: parseInt(e.target.value)})} />
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
                       <AlertTriangle className="text-orange-500 shrink-0" size={20} />
                       <p className="text-xs text-orange-700 leading-relaxed">
                          更改风控策略将立即生效。请确保已通知所有管理员关于 MFA 的变更，以免造成无法登录的情况。
                       </p>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                 <button type="submit" className="flex items-center bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all">
                    {isSaved ? <span className="flex items-center"><ShieldCheck className="mr-2"/> 策略已更新</span> : <span className="flex items-center"><Save className="mr-2"/> 保存安全配置</span>}
                 </button>
              </div>
           </form>
        </MotionDiv>
      )}

      {activeTab === 'logs' && (
         <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
               <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                     type="text" 
                     placeholder="搜索日志 (用户、动作、详情)..." 
                     value={logFilter}
                     onChange={e => setLogFilter(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
               </div>
               <button onClick={loadLogs} className="p-2 text-gray-500 hover:text-primary hover:bg-white rounded-lg transition-colors" title="刷新日志">
                  <RefreshCw size={18} className={logsLoading ? 'animate-spin' : ''} />
               </button>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                     <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">时间戳</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">操作人</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">资源/模块</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">动作</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">详情</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">IP来源</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">状态</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-sm">
                     {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                           <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                           <td className="px-6 py-3 font-bold text-gray-700">{log.userName}</td>
                           <td className="px-6 py-3"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">{log.resource}</span></td>
                           <td className="px-6 py-3 text-gray-800">{log.action}</td>
                           <td className="px-6 py-3 text-gray-500 max-w-xs truncate" title={log.details}>{log.details}</td>
                           <td className="px-6 py-3 text-gray-400 text-xs">{log.ipAddress}</td>
                           <td className="px-6 py-3 text-right">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                 {log.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                     {filteredLogs.length === 0 && (
                        <tr>
                           <td colSpan={7} className="px-6 py-12 text-center text-gray-400">暂无审计记录</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
            <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-2xl text-center text-[10px] text-gray-400">
               Audit logs are immutable and retained for compliance purposes.
            </div>
         </MotionDiv>
      )}
    </div>
  );
};

export default SecuritySettings;