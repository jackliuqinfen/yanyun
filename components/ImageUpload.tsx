
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = "上传图片", className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = async (file?: File) => {
    if (!file) return;
    setError(null);

    // 1. Size Validation (Client Side)
    // EdgeOne KV limits values (usually 10MB-25MB), keeping it under 5MB is safe for web assets
    if (file.size > 5 * 1024 * 1024) {
      setError("图片过大，请上传 5MB 以内的图片");
      return;
    }

    // 2. Type Validation
    if (!file.type.startsWith('image/')) {
      setError("仅支持图片格式 (JPG, PNG, GIF, WEBP)");
      return;
    }

    setIsUploading(true);

    try {
      // 3. Upload to Cloud KV (Object Storage Pattern)
      const url = await storageService.uploadAsset(file);
      onChange(url); // Return the Cloud URL, not Base64
    } catch (err: any) {
      console.error("Upload failed", err);
      setError("上传失败，请检查网络或重试");
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const triggerFileSelect = () => {
    if (isUploading) return;
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50 flex items-center justify-center">
          <img src={value} alt="Preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
             <button 
               type="button"
               onClick={triggerFileSelect}
               className="p-2 bg-white rounded-full text-gray-700 hover:text-primary transition-colors"
               title="更换图片"
             >
               <Upload size={18} />
             </button>
             <button 
               type="button"
               onClick={() => onChange('')}
               className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
               title="移除图片"
             >
               <X size={18} />
             </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
               <Loader2 className="animate-spin text-primary mb-2" size={32} />
               <span className="text-xs font-bold text-primary">正在替换...</span>
            </div>
          )}
        </div>
      ) : (
        <div 
          onClick={triggerFileSelect}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          } ${isUploading ? 'cursor-not-allowed bg-gray-50' : ''}`}
        >
          {isUploading ? (
             <>
               <Loader2 className="animate-spin text-primary mb-3" size={32} />
               <p className="text-sm font-bold text-gray-600">正在上传至云端...</p>
             </>
          ) : (
             <>
               <div className="p-3 bg-blue-50 text-primary rounded-full mb-3">
                  <ImageIcon size={24} />
               </div>
               <p className="text-sm font-medium text-gray-700">点击上传或拖拽图片</p>
               <p className="text-xs text-gray-400 mt-1">自动存入 KV 云存储</p>
             </>
          )}
          
          {error && (
             <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className="inline-flex items-center text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                   <AlertCircle size={10} className="mr-1"/> {error}
                </span>
             </div>
          )}
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
        disabled={isUploading}
      />
    </div>
  );
};

export default ImageUpload;
