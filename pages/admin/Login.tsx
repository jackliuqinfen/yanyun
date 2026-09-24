import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { storageService } from '../../services/storageService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await storageService.login(username.trim(), password);
    setLoading(false);
    if (result.success) navigate('/admin/dashboard');
    else setError(result.message || '登录失败，请重试');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <div className="flex min-h-64 flex-col justify-between bg-[#26367d] p-8 text-white md:min-h-[520px] md:p-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white"><ArrowLeft size={16} /> 返回官网</Link>
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><LockKeyhole size={27} /></div>
            <p className="text-sm font-medium text-blue-200">江苏盐韵工程项目管理有限公司</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight">官网内容管理</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100">登录后管理新闻、项目、公告和媒体素材。</p>
          </div>
          <p className="text-xs text-blue-200">请使用管理员提供的账号登录。</p>
        </div>
        <div className="flex flex-col justify-center p-8 md:p-12">
          <h2 className="text-2xl font-bold text-slate-900">管理员登录</h2>
          <p className="mt-2 text-sm text-slate-500">请输入账号和密码</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <div>
              <label htmlFor="admin-username" className="mb-2 block text-sm font-medium text-slate-700">账号</label>
              <input id="admin-username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60" />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-700">密码</label>
              <div className="relative">
                <input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? '隐藏密码' : '显示密码'} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2C388B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1e266d] disabled:opacity-60">
              {loading && <Loader2 size={17} className="animate-spin" />}{loading ? '正在登录…' : '登录管理系统'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login;
