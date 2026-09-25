
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, Trash2, FileText, Image as ImageIcon, Video, Link as LinkIcon, Check, FolderOpen, Upload, Grid, List as ListIcon, X, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { MediaItem, MediaCategory } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion components to resolve missing prop errors in TSX
const MotionDiv = motion.div as any;

interface MediaLibraryProps {
  mode?: 'manage' | 'select';
  onSelect?: (url: string) => void;
  allowedTypes?: MediaItem['type'][];
  initialCategory?: string;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ 
  mode = 'manage', 
  onSelect, 
  allowedTypes = ['image', 'video', 'document'],
  initialCategory = 'all'
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'image' as MediaItem['type'],
    category: 'site',
    url: '',
    file: null as File | null // Store raw file object
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allMedia = await storageService.getMedia();
    const allCats = storageService.getMediaCategories();
    
    // Update counts
    const updatedCats = allCats.map(cat => ({
      ...cat,
      count: cat.id === 'all' 
        ? allMedia.length 
        : allMedia.filter(m => m.category === cat.id).length
    }));

    setMedia(allMedia);
    setCategories(updatedCats);
  };

  const filteredMedia = useMemo(() => {
    return media.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesType = allowedTypes.includes(item.type);
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [media, searchTerm, activeCategory, allowedTypes]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定从媒体库移除此记录吗？对象存储中的原文件仍会保留。')) {
      const updated = media.filter(m => m.id !== id);
      await storageService.saveMedia(updated);
      loadData();
    }
  };

  const handleCopy = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerFileSelect = () => {
    if (isUploading) return;
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('文件不能超过 5 MB');
      return;
    }
    const expected = uploadForm.type === 'document' ? 'application/pdf' : uploadForm.type + '/';
    if (!(uploadForm.type === 'document' ? file.type === expected : file.type.startsWith(expected))) {
      setUploadError('所选文件与素材类型不匹配');
      return;
    }
    if (uploadForm.type === 'image') {
      const reader = new FileReader();
      reader.onload = event => setUploadForm(prev => ({
        ...prev, url: event.target?.result as string, name: prev.name || file.name.replace(/\.[^.]+$/, ''), file,
      }));
      reader.readAsDataURL(file);
    } else {
      setUploadForm(prev => ({ ...prev, url: '', name: prev.name || file.name.replace(/\.[^.]+$/, ''), file }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) {
      setUploadError('请先选择文件');
      return;
    }

    setUploadError('');
    setIsUploading(true);
    try {
      const finalUrl = await storageService.uploadAsset(uploadForm.file);

      const newItem: MediaItem = {
        id: Date.now().toString(),
        name: uploadForm.name || '未命名资源',
        type: uploadForm.type,
        category: uploadForm.category,
        url: finalUrl,
        uploadDate: new Date().toISOString().split('T')[0],
        size: uploadForm.file ? (Math.round(uploadForm.file.size / 1024) + ' KB') : 'External'
      };

      const currentMedia = await storageService.getMedia();
      const updated = [newItem, ...currentMedia];
      await storageService.saveMedia(updated);
      await loadData();
      
      setIsUploadModalOpen(false);
      setActiveCategory('all'); 
      setUploadForm({ name: '', type: 'image', category: 'site', url: '', file: null });

      if (mode === 'select' && onSelect) {
        onSelect(newItem.url);
      }
    } catch (err: any) {
      setUploadError(err.message || '上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleItemClick = (item: MediaItem) => {
    if (mode === 'select') {
      setSelectedId(item.id);
      if (onSelect) onSelect(item.url);
    }
  };

  return (
    <div className="flex h-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* Left Sidebar: Categories */}
      <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
            <FolderOpen size={14} className="mr-2" /> 素材分类
          </h3>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              aria-current={activeCategory === cat.id ? 'true' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-primary text-white font-bold' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </nav>
        <div className="p-4 bg-white border-t border-gray-200">
           <button 
             onClick={() => setIsUploadModalOpen(true)}
             className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-primary-dark transition-colors"
           >
             <Plus size={16} className="mr-2" /> 上传素材
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索素材名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-lg flex">
               <button 
                 onClick={() => setViewMode('grid')}
                 className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <Grid size={18} />
               </button>
               <button 
                 onClick={() => setViewMode('list')}
                 className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <ListIcon size={18} />
               </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
          {filteredMedia.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredMedia.map(item => {
                  const isLocal = item.url.startsWith('data:');
                  return (
                    <MotionDiv 
                      layout
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`group relative aspect-square bg-white rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                        selectedId === item.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {/* Warning for local images */}
                      {isLocal && (
                        <div className="absolute top-2 left-2 z-20 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center">
                          <AlertTriangle size={10} className="mr-1" /> 仅本地
                        </div>
                      )}

                      {item.type === 'image' ? (
                        <img 
                          src={item.url} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                      ) : item.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                          <Video size={32} />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-rose-50 text-rose-700">
                          <FileText size={32} /><span className="text-xs font-semibold">PDF 文件</span>
                        </div>
                      )}

                      {/* Checkmark for selection */}
                      {selectedId === item.id && (
                        <div className="absolute top-2 right-2 z-20 text-primary bg-white rounded-full">
                          <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                        </div>
                      )}

                      {/* Overlay for Management Mode */}
                      {mode === 'manage' && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            onClick={(e) => handleCopy(item.url, item.id, e)}
                            className="p-2 bg-white rounded-full text-gray-700 hover:text-primary transition-colors"
                            title="复制链接"
                          >
                            {copiedId === item.id ? <CheckCircle2 size={18} className="text-green-500"/> : <LinkIcon size={18} />}
                          </button>
                          <button 
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                            title="从媒体库移除"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                      
                      {/* Caption */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-[10px] text-white font-medium truncate">{item.name}</p>
                      </div>
                    </MotionDiv>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 divide-y overflow-hidden">
                {filteredMedia.map(item => {
                  const isLocal = item.url.startsWith('data:');
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedId === item.id ? 'bg-blue-50' : ''}`}
                    >
                       <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-4 flex-shrink-0 relative">
                          {item.type === 'image' ? (
                            <img 
                              src={item.url} 
                              className="w-full h-full object-cover" 
                              loading="lazy"
                              alt={item.name}
                            />
                          ) : item.type === 'video' ? (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
                              <Video size={20}/>
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-rose-50 text-rose-700"><FileText size={20}/></div>
                          )}
                          {isLocal && (
                            <div className="absolute bottom-0 left-0 right-0 bg-amber-500 h-1" title="仅存储于本地，未上云"></div>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate flex items-center">
                             {item.name}
                             {isLocal && <span className="ml-2 text-[10px] text-amber-600 bg-amber-50 px-1.5 rounded border border-amber-100">未上云</span>}
                          </h4>
                          <p className="text-xs text-gray-400">{item.uploadDate} · {item.size}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          {mode === 'manage' && (
                             <>
                                <button onClick={(e) => handleCopy(item.url, item.id, e)} className="p-2 text-gray-400 hover:text-primary"><LinkIcon size={16}/></button>
                                <button onClick={(e) => handleDelete(item.id, e)} className="p-2 text-gray-400 hover:text-red-500" title="从媒体库移除"><Trash2 size={16}/></button>
                             </>
                          )}
                          {selectedId === item.id && <Check className="text-primary" size={20} />}
                       </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon size={32} />
              </div>
              <p className="text-sm">暂无符合条件的素材</p>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-4 text-primary font-bold hover:underline"
              >
                立即上传新素材
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <MotionDiv 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !isUploading && setIsUploadModalOpen(false)}
            />
            <MotionDiv 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-gray-900">上传至云库</h2>
                 <button onClick={() => !isUploading && setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">素材名称</label>
                    <input 
                      type="text" 
                      required 
                      disabled={isUploading}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-400" 
                      value={uploadForm.name} 
                      onChange={e => setUploadForm({...uploadForm, name: e.target.value})}
                      placeholder="取个好名字方便搜索"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">素材类型</label>
                      <select 
                        disabled={isUploading}
                        className="w-full px-3 py-2 border rounded-lg bg-white outline-none disabled:bg-gray-50"
                        value={uploadForm.type}
                        onChange={e => {
                          const type = e.target.value as MediaItem['type'];
                          setUploadError('');
                          setUploadForm(prev => ({ ...prev, type, file: null, url: '', category: type === 'document' ? 'document' : 'site' }));
                        }}
                      >
                         <option value="image">图片</option>
                         <option value="video">视频文件</option>
                         <option value="document">PDF 文件</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">存入分类</label>
                      <select 
                        disabled={isUploading}
                        className="w-full px-3 py-2 border rounded-lg bg-white outline-none disabled:bg-gray-50"
                        value={uploadForm.category}
                        onChange={e => setUploadForm({...uploadForm, category: e.target.value})}
                      >
                         {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">选择文件</label>
                   <button type="button" onClick={triggerFileSelect} disabled={isUploading} className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-primary hover:bg-blue-50/30 disabled:cursor-not-allowed disabled:opacity-60">
                     {uploadForm.url && uploadForm.type === 'image' ? <img src={uploadForm.url} className="mb-3 h-32 w-full object-contain" alt="待上传图片预览" /> : isUploading ? <Loader2 className="mb-3 animate-spin text-primary" size={30} /> : <Upload className="mb-3 text-slate-400" size={30} />}
                     <span className="text-sm font-medium text-slate-700">{isUploading ? '正在上传到阿里云 OSS…' : uploadForm.file ? uploadForm.file.name : '点击选择文件'}</span>
                     <span className="mt-1 text-xs text-slate-400">支持 JPG、PNG、WEBP、GIF、PDF、MP4 等格式，单个文件不超过 5 MB</span>
                   </button>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={uploadForm.type === 'image' ? 'image/jpeg,image/png,image/gif,image/webp,image/bmp,image/x-icon' : uploadForm.type === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'application/pdf'} />
                   {uploadError && <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</p>}
                 </div>

                 <div className="flex justify-end gap-3 mt-8">
                    <button type="button" disabled={isUploading} onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">取消</button>
                    <button 
                      type="submit" 
                      disabled={isUploading || !uploadForm.file}
                      className="px-8 py-2 bg-primary text-white rounded-lg font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
                    >
                      {isUploading && <Loader2 size={16} className="animate-spin" />}
                      {isUploading ? '正在存储...' : '确认上传并存库'}
                    </button>
                 </div>
              </form>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaLibrary;
