import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Cloud, FileText, Image, Loader2, Megaphone, RefreshCw, WifiOff } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { NewsItem, TenderItem } from '../../types';

type Overview = { news: NewsItem[]; tenders: TenderItem[]; projects: number; honors: number; media: number };

const shortcuts = [
  { label: '发布新闻', description: '维护官网动态', path: '/admin/news', icon: FileText },
  { label: '管理公告', description: '更新招标信息', path: '/admin/tenders', icon: Megaphone },
  { label: '上传素材', description: '集中管理图片和文件', path: '/admin/media', icon: Image },
  { label: '编辑页面', description: '调整官网展示内容', path: '/admin/pages', icon: Briefcase },
];

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [healthMessage, setHealthMessage] = useState('');
  const [cloudMode, setCloudMode] = useState(storageService.getSystemStatus().mode);

  const loadOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const [news, tenders, projects, honors, media] = await Promise.all([
        storageService.getNews(), storageService.getTenders(), storageService.getProjects(),
        storageService.getHonors(), storageService.getMedia(),
      ]);
      setOverview({ news, tenders, projects: projects.length, honors: honors.length, media: media.length });
      setCloudMode(storageService.getSystemStatus().mode);
    } catch {
      setError('概览数据暂时无法加载，请重试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
    const onStatus = () => setCloudMode(storageService.getSystemStatus().mode);
    window.addEventListener('storageStatusChanged', onStatus);
    return () => window.removeEventListener('storageStatusChanged', onStatus);
  }, []);

  const checkConnection = async () => {
    setChecking(true);
    const result = await storageService.checkHealth();
    setHealthMessage(result.message);
    setCloudMode(storageService.getSystemStatus().mode);
    setChecking(false);
  };

  const recentNews = [...(overview?.news || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const recentTenders = [...(overview?.tenders || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const cards = [
    { label: '新闻动态', count: overview?.news.length, path: '/admin/news', icon: FileText, tone: 'bg-blue-50 text-blue-700' },
    { label: '招标公告', count: overview?.tenders.length, path: '/admin/tenders', icon: Megaphone, tone: 'bg-amber-50 text-amber-700' },
    { label: '项目案例', count: overview?.projects, path: '/admin/projects', icon: Briefcase, tone: 'bg-emerald-50 text-emerald-700' },
    { label: '媒体素材', count: overview?.media, path: '/admin/media', icon: Image, tone: 'bg-violet-50 text-violet-700' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-700">江苏盐韵 · 官网管理</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">工作台</h1>
          <p className="mt-2 text-sm text-slate-500">查看当前内容，继续处理官网更新。</p>
        </div>
        <button type="button" onClick={() => void loadOverview()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700 disabled:opacity-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 刷新数据
        </button>
      </div>

      <section aria-label="数据连接状态" className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${cloudMode === 'CLOUD_SYNC' ? 'border-emerald-200 bg-emerald-50/70' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${cloudMode === 'CLOUD_SYNC' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {cloudMode === 'CLOUD_SYNC' ? <Cloud size={20} /> : <WifiOff size={20} />}
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{cloudMode === 'CLOUD_SYNC' ? '云端数据已连接' : '当前仅使用本地数据'}</h2>
            <p className="mt-0.5 text-xs text-slate-600">{healthMessage || (cloudMode === 'CLOUD_SYNC' ? '页面内容从云端读取。' : '请检查连接；此时修改内容可能无法同步到其他设备。')}</p>
          </div>
        </div>
        <button type="button" onClick={() => void checkConnection()} disabled={checking} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          {checking ? <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" />检测中</span> : '检测连接'}
        </button>
      </section>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section aria-label="内容概览" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ label, count, path, icon: Icon, tone }) => (
          <Link key={label} to={path} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
            <div className={`inline-flex rounded-xl p-2.5 ${tone}`}><Icon size={19} /></div>
            <div className="mt-5 flex items-end justify-between gap-2">
              <div><p className="text-3xl font-semibold tabular-nums text-slate-900">{loading ? '—' : count ?? 0}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>
              <ArrowRight size={17} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>
          </Link>
        ))}
      </section>

      <section aria-labelledby="shortcuts-heading">
        <div className="mb-3 flex items-center justify-between"><h2 id="shortcuts-heading" className="text-lg font-semibold text-slate-900">常用操作</h2><span className="text-xs text-slate-400">选择一项开始</span></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map(({ label, description, path, icon: Icon }) => (
            <Link key={path} to={path} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
              <span className="rounded-xl bg-slate-100 p-3 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700"><Icon size={20} /></span>
              <span className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">{label}</strong><small className="mt-1 block text-xs text-slate-500">{description}</small></span>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600" />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <RecentContent title="最近新闻" path="/admin/news" items={recentNews.map(item => ({ id: item.id, title: item.title, date: item.date, status: item.published ? '已发布' : '草稿' }))} loading={loading} />
        <RecentContent title="最近公告" path="/admin/tenders" items={recentTenders.map(item => ({ id: item.id, title: item.title, date: item.date, status: item.status }))} loading={loading} />
      </div>
      <p className="text-xs text-slate-400">荣誉资质共 {loading ? '—' : overview?.honors ?? 0} 项。统计来自当前内容数据，不包含访问量。</p>
    </div>
  );
};

const RecentContent: React.FC<{ title: string; path: string; items: { id: string; title: string; date: string; status: string }[]; loading: boolean }> = ({ title, path, items, loading }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">{title}</h2><Link to={path} className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">查看全部 <ArrowRight size={13} /></Link></div>
    {loading ? <p className="p-5 text-sm text-slate-500">正在读取内容…</p> : items.length === 0 ? <p className="p-5 text-sm text-slate-500">暂无内容，可从上方常用操作开始添加。</p> : (
      <ul className="divide-y divide-slate-100">{items.map(item => <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3.5"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.date}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{item.status}</span></li>)}</ul>
    )}
  </section>
);

export default Dashboard;
