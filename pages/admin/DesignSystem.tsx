import React from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Select } from '../../components/admin/Form';
import { Table } from '../../components/admin/Table';
import { FileText, MoreHorizontal } from 'lucide-react';

const MotionDiv = motion.div as any;

const DesignSystem: React.FC = () => {
  const tableData = [
    { id: 1, name: '项目 Alpha', status: 'Active', budget: '¥12,000' },
    { id: 2, name: '官网改版', status: 'Pending', budget: '¥5,000' },
    { id: 3, name: '移动端App', status: 'Completed', budget: '¥24,000' },
  ];

  const tableColumns = [
    { key: 'name', title: '项目名称' },
    { key: 'status', title: '状态', render: (val: string) => (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
        val === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
        val === 'Completed' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
      }`}>
        {val === 'Active' ? '进行中' : val === 'Completed' ? '已完成' : '待处理'}
      </span>
    )},
    { key: 'budget', title: '预算', align: 'right' as const },
    { key: 'actions', title: '操作', align: 'center' as const, width: '80px', render: () => (
      <button className="p-1 hover:bg-slate-100 rounded"><MoreHorizontal size={16} className="text-slate-400" /></button>
    )},
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-4xl">
         <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">江苏盐韵 设计规范系统</h1>
         <p className="text-xl text-slate-500">
           用于江苏盐韵后台管理系统的企业级组件库与视觉语言指南，确保设计的一致性、可访问性与高效性。
         </p>
      </div>

      {/* Color Palette */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
           <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">01</span>
           色彩体系
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <div className="space-y-3">
              <div className="h-32 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200"></div>
              <div>
                 <p className="font-bold text-slate-900">主色调 (Indigo)</p>
                 <p className="text-xs text-slate-400 font-mono">#4F46E5 · bg-indigo-600</p>
              </div>
           </div>
           <div className="space-y-3">
              <div className="h-32 rounded-2xl bg-slate-900 shadow-lg shadow-slate-200"></div>
              <div>
                 <p className="font-bold text-slate-900">中性深色 (Slate)</p>
                 <p className="text-xs text-slate-400 font-mono">#0F172A · bg-slate-900</p>
              </div>
           </div>
           <div className="space-y-3">
              <div className="h-32 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200"></div>
              <div>
                 <p className="font-bold text-slate-900">成功色 (Emerald)</p>
                 <p className="text-xs text-slate-400 font-mono">#10B981 · bg-emerald-500</p>
              </div>
           </div>
           <div className="space-y-3">
              <div className="h-32 rounded-2xl bg-amber-500 shadow-lg shadow-amber-200"></div>
              <div>
                 <p className="font-bold text-slate-900">警告色 (Amber)</p>
                 <p className="text-xs text-slate-400 font-mono">#F59E0B · bg-amber-500</p>
              </div>
           </div>
        </div>
      </section>

      {/* Interactive Components */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
           <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">02</span>
           交互组件
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Buttons */}
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">按钮组件</h3>
              <div className="flex flex-wrap gap-4 mb-8">
                 <Button variant="primary">主要按钮</Button>
                 <Button variant="secondary">次要按钮</Button>
                 <Button variant="outline">描边按钮</Button>
                 <Button variant="ghost">幽灵按钮</Button>
                 <Button variant="danger">危险操作</Button>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                 <Button size="sm">小号</Button>
                 <Button size="md">中号</Button>
                 <Button size="lg">大号</Button>
                 <Button loading>加载中</Button>
                 <Button icon={<FileText size={16} />}>带图标</Button>
              </div>
           </div>

           {/* Forms */}
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">表单元素</h3>
              <div className="space-y-4">
                 <Input label="电子邮箱" placeholder="name@company.com" />
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="姓氏" placeholder="张" />
                    <Input label="名字" placeholder="三" error="必填字段" />
                 </div>
                 <Select 
                    label="用户角色" 
                    options={[
                       { value: 'admin', label: '系统管理员' },
                       { value: 'editor', label: '内容编辑' },
                       { value: 'viewer', label: '访客' }
                    ]} 
                 />
              </div>
           </div>
        </div>
      </section>

      {/* Data Display */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
           <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">03</span>
           数据展示
        </h2>
        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
           <Table 
              columns={tableColumns}
              data={tableData}
              searchPlaceholder="搜索项目..."
              actions={<Button size="sm" icon={<FileText size={14} />}>导出数据</Button>}
           />
        </div>
      </section>
    </div>
  );
};

export default DesignSystem;
