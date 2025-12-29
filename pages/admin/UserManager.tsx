
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, User, Check, X, Lock, Eye, EyeOff } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { User as UserType, Role, ResourceType } from '../../types';
import { RESOURCES, INITIAL_ROLES } from '../../constants';
import ImageUpload from '../../components/ImageUpload';
import { maskEmail, maskPhone, validatePassword } from '../../utils/security'; // Import security utils

const UserManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Forms
  const [userForm, setUserForm] = useState<Partial<UserType>>({ username: '', name: '', roleId: '', email: '', phone: '' });
  const [newPassword, setNewPassword] = useState(''); // Only for new/update
  const [roleForm, setRoleForm] = useState<Role>({ ...INITIAL_ROLES[2], id: '', name: '', description: '', isSystem: false });

  // Security UI State
  const [showMasked, setShowMasked] = useState(true);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const u = await storageService.getUsers();
    const r = await storageService.getRoles();
    setUsers(u);
    setRoles(r);
  };

  // --- User Logic ---
  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setUserForm(user);
    setNewPassword(''); // Don't show existing password
    setIsUserModalOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', name: '', roleId: roles[0]?.id || '', email: '', phone: '' });
    setNewPassword('');
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('确定要删除此用户吗？')) {
      const newUsers = users.filter(u => u.id !== id);
      await storageService.saveUsers(newUsers);
      refreshData();
    }
  };

  const submitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password Strength Check if setting a new password
    if (newPassword) {
       const check = validatePassword(newPassword);
       if (!check.valid) {
          alert(`密码强度不足: ${check.message}`);
          return;
       }
    } else if (!editingUser) {
       // Creating new user requires password
       alert("新用户必须设置初始密码");
       return;
    }

    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...u, ...userForm } as UserType : u);
      await storageService.saveUsers(updated);
    } else {
      // In a real app, password would be hashed here
      const newUser = { ...userForm, id: Date.now().toString() } as UserType;
      await storageService.saveUsers([...users, newUser]);
    }
    setIsUserModalOpen(false);
    refreshData();
  };

  // --- Role Logic ---
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm(JSON.parse(JSON.stringify(role)));
    setIsRoleModalOpen(true);
  };

  const handleAddRole = () => {
    setEditingRole(null);
    const emptyPerms = {} as any;
    RESOURCES.forEach(r => emptyPerms[r.id] = { read: false, write: false, delete: false });
    
    setRoleForm({
      id: '',
      name: '',
      description: '',
      isSystem: false,
      permissions: emptyPerms
    });
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = async (id: string) => {
    if (users.some(u => u.roleId === id)) {
      alert('无法删除：仍有用户分配了此角色。请先修改用户角色。');
      return;
    }
    if (window.confirm('确定要删除此角色配置吗？')) {
      const newRoles = roles.filter(r => r.id !== id);
      await storageService.saveRoles(newRoles);
      refreshData();
    }
  };

  const togglePermission = (resource: ResourceType, type: 'read' | 'write' | 'delete') => {
    const newPerms = { ...roleForm.permissions };
    newPerms[resource] = { ...newPerms[resource], [type]: !newPerms[resource][type] };
    
    if ((type === 'write' || type === 'delete') && newPerms[resource][type]) {
       newPerms[resource].read = true;
    }
    if (type === 'read' && !newPerms[resource].read) {
       newPerms[resource].write = false;
       newPerms[resource].delete = false;
    }

    setRoleForm({ ...roleForm, permissions: newPerms });
  };

  const submitRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      const updated = roles.map(r => r.id === editingRole.id ? { ...roleForm } : r);
      await storageService.saveRoles(updated);
    } else {
      const newRole = { ...roleForm, id: `role_${Date.now()}` };
      await storageService.saveRoles([...roles, newRole]);
    }
    setIsRoleModalOpen(false);
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">用户与权限管理</h1>
           <p className="text-sm text-gray-500">RBAC 角色控制与 PII 数据保护</p>
        </div>
        <div className="flex gap-2">
           {activeTab === 'users' && (
              <button 
                onClick={() => setShowMasked(!showMasked)} 
                className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors text-sm font-bold"
              >
                {showMasked ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                {showMasked ? '显示敏感数据' : '脱敏显示'}
              </button>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
         <button 
           onClick={() => setActiveTab('users')}
           className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
         >
           用户列表
         </button>
         <button 
           onClick={() => setActiveTab('roles')}
           className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'roles' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
         >
           角色与权限定义
         </button>
      </div>

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div className="space-y-4">
           <div className="flex justify-end">
              <button onClick={handleAddUser} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition-colors">
                <Plus size={18} className="mr-2" /> 新增用户
              </button>
           </div>
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-gray-50 border-b">
                    <tr>
                       <th className="px-6 py-4 font-semibold text-gray-700">用户</th>
                       <th className="px-6 py-4 font-semibold text-gray-700">联系方式 (PII)</th>
                       <th className="px-6 py-4 font-semibold text-gray-700">所属角色</th>
                       <th className="px-6 py-4 font-semibold text-gray-700">MFA</th>
                       <th className="px-6 py-4 font-semibold text-gray-700 text-right">操作</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {users.map(user => {
                       const roleName = roles.find(r => r.id === user.roleId)?.name || '未知角色';
                       return (
                          <tr key={user.id} className="hover:bg-gray-50">
                             <td className="px-6 py-4 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                                   {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt={user.name}/> : <User size={16}/>}
                                </div>
                                <div>
                                   <div className="font-bold text-gray-900">{user.name}</div>
                                   <div className="text-xs text-gray-400">@{user.username}</div>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                <div><span className="text-gray-400 w-8 inline-block">Tel:</span> {showMasked ? maskPhone(user.phone) : (user.phone || '-')}</div>
                                <div><span className="text-gray-400 w-8 inline-block">Mail:</span> {showMasked ? maskEmail(user.email) : (user.email || '-')}</div>
                             </td>
                             <td className="px-6 py-4"><span className="bg-blue-50 text-primary px-2 py-1 rounded text-xs font-bold">{roleName}</span></td>
                             <td className="px-6 py-4">
                                {user.mfaEnabled ? <span className="text-green-600 text-xs font-bold flex items-center"><Shield size={12} className="mr-1"/> ON</span> : <span className="text-gray-400 text-xs">OFF</span>}
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:bg-red-50 p-2 rounded ml-2"><Trash2 size={16}/></button>
                             </td>
                          </tr>
                       )
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Roles Tab Content */}
      {activeTab === 'roles' && (
         <div className="space-y-4">
            <div className="flex justify-end">
               <button onClick={handleAddRole} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition-colors">
                 <Plus size={18} className="mr-2" /> 新增角色
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {roles.map(role => (
                  <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-gray-900">{role.name}</h3>
                              {role.isSystem && <span title="系统内置角色"><Lock size={14} className="text-gray-400" /></span>}
                           </div>
                           <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                        </div>
                        <div className="p-2 bg-blue-50 text-primary rounded-lg">
                           <Shield size={20} />
                        </div>
                     </div>
                     
                     <div className="flex-1 space-y-2 mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">权限概览</p>
                        <div className="flex flex-wrap gap-2">
                           {RESOURCES.map(r => {
                              const p = role.permissions[r.id];
                              if (!p?.read) return null;
                              return (
                                 <span key={r.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200" title={`R:${p.read} W:${p.write} D:${p.delete}`}>
                                    {r.label}
                                    {p.write && <span className="text-blue-500 ml-1 font-bold">W</span>}
                                    {p.delete && <span className="text-red-500 ml-1 font-bold">D</span>}
                                 </span>
                              )
                           })}
                        </div>
                     </div>

                     <div className="border-t pt-4 flex justify-end gap-2">
                        <button onClick={() => handleEditRole(role)} className="text-sm text-gray-600 hover:text-primary px-3 py-1.5 rounded hover:bg-gray-50">配置权限</button>
                        {!role.isSystem && (
                           <button onClick={() => handleDeleteRole(role.id)} className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded">删除</button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
               <h2 className="text-xl font-bold mb-6">{editingUser ? '编辑用户' : '新增用户'}</h2>
               <form onSubmit={submitUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">显示名称</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">登录账号</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">手机号</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">邮箱</label>
                        <input type="email" className="w-full px-3 py-2 border rounded-lg" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">{editingUser ? '重置密码 (留空不修改)' : '初始密码'}</label>
                     <input 
                        type="password" 
                        className="w-full px-3 py-2 border rounded-lg" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        placeholder={editingUser ? '••••••' : '至少8位，包含大小写和数字'}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">分配角色</label>
                     <select className="w-full px-3 py-2 border rounded-lg bg-white" value={userForm.roleId} onChange={e => setUserForm({...userForm, roleId: e.target.value})}>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                     </select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                     <input type="checkbox" id="mfa" checked={userForm.mfaEnabled || false} onChange={e => setUserForm({...userForm, mfaEnabled: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                     <label htmlFor="mfa" className="text-sm font-bold text-gray-700">启用 MFA 双重认证</label>
                  </div>

                  <ImageUpload label="头像" value={userForm.avatar} onChange={b64 => setUserForm({...userForm, avatar: b64})} />
                  <div className="flex justify-end gap-3 mt-6">
                     <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button>
                     <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">保存</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Role Matrix Modal */}
      {isRoleModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{editingRole ? '配置角色权限' : '创建新角色'}</h2>
                  <button onClick={() => setIsRoleModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
               </div>
               
               <form onSubmit={submitRole} className="flex-1 flex flex-col overflow-hidden">
                  {/* ... Same Role Form Content as before ... */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">角色名称</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">描述</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg" value={roleForm.description} onChange={e => setRoleForm({...roleForm, description: e.target.value})} />
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto border rounded-lg">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                           <tr>
                              <th className="px-6 py-3 border-b text-sm font-bold text-gray-700">资源模块</th>
                              <th className="px-6 py-3 border-b text-sm font-bold text-gray-700 text-center w-32">读取 (Read)</th>
                              <th className="px-6 py-3 border-b text-sm font-bold text-gray-700 text-center w-32">写入 (Create/Edit)</th>
                              <th className="px-6 py-3 border-b text-sm font-bold text-gray-700 text-center w-32">删除 (Delete)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {RESOURCES.map(resource => (
                              <tr key={resource.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 font-medium text-gray-900">{resource.label}</td>
                                 <td className="px-6 py-4 text-center">
                                    <input 
                                       type="checkbox" 
                                       checked={roleForm.permissions[resource.id]?.read || false}
                                       onChange={() => togglePermission(resource.id, 'read')}
                                       className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                                    />
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <input 
                                       type="checkbox" 
                                       checked={roleForm.permissions[resource.id]?.write || false}
                                       onChange={() => togglePermission(resource.id, 'write')}
                                       className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                                    />
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <input 
                                       type="checkbox" 
                                       checked={roleForm.permissions[resource.id]?.delete || false}
                                       onChange={() => togglePermission(resource.id, 'delete')}
                                       className="w-5 h-5 text-red-500 rounded focus:ring-red-500 cursor-pointer"
                                    />
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                     <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">取消</button>
                     <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark shadow-lg">保存配置</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default UserManager;
