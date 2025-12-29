
import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Link as LinkIcon, RemoveFormatting, Image as ImageIcon, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className, placeholder }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync value to contentEditable div only when value changes externally and is different
  useEffect(() => {
    if (contentRef.current) {
      const isFocused = document.activeElement === contentRef.current;
      const currentHTML = contentRef.current.innerHTML;
      
      if (!isFocused && currentHTML !== value) {
         if (value === '' && currentHTML === '<br>') return;
         contentRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    handleInput();
    if (contentRef.current) contentRef.current.focus();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload to Cloud KV
      const url = await storageService.uploadAsset(file);
      
      // 2. Insert Image to Editor
      // We restore focus to ensure image goes where cursor was (mostly)
      if (contentRef.current) contentRef.current.focus();
      document.execCommand('insertImage', false, url);
      
      handleInput();
    } catch (err) {
      alert('图片上传失败，请重试');
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const ToolbarButton = ({ icon: Icon, cmd, arg, title, onClick, active }: { icon: any, cmd?: string, arg?: string, title?: string, onClick?: () => void, active?: boolean }) => (
    <button
      type="button"
      onClick={onClick || (() => cmd && execCmd(cmd, arg))}
      className={`p-2 rounded transition-colors ${active ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
      title={title}
      disabled={isUploading}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50">
        <ToolbarButton icon={Heading1} cmd="formatBlock" arg="H3" title="标题" />
        <ToolbarButton icon={Heading2} cmd="formatBlock" arg="H4" title="副标题" />
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <ToolbarButton icon={Bold} cmd="bold" title="加粗" />
        <ToolbarButton icon={Italic} cmd="italic" title="斜体" />
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <ToolbarButton icon={List} cmd="insertUnorderedList" title="列表" />
        <ToolbarButton icon={AlignLeft} cmd="justifyLeft" title="左对齐" />
        <ToolbarButton icon={AlignCenter} cmd="justifyCenter" title="居中" />
        <ToolbarButton icon={AlignRight} cmd="justifyRight" title="右对齐" />
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        
        {/* Fixed Link Button: Prompt inside onClick */}
        <ToolbarButton 
          icon={LinkIcon} 
          title="插入链接" 
          onClick={() => {
            const url = window.prompt('请输入链接地址:');
            if (url) execCmd('createLink', url);
          }}
        />
        
        {/* Cloud Image Upload Button */}
        <ToolbarButton 
            icon={isUploading ? Loader2 : ImageIcon} 
            title="插入云端图片" 
            onClick={handleImageClick} 
            active={isUploading}
        />
        
        <ToolbarButton icon={RemoveFormatting} cmd="removeFormat" title="清除格式" />
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*" 
      />

      {/* Editable Area */}
      <div
        ref={contentRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 p-4 outline-none prose prose-sm max-w-none overflow-y-auto min-h-[300px] [&>img]:max-w-full [&>img]:rounded-lg [&>img]:my-4 [&>img]:shadow-sm"
        style={{ whiteSpace: 'pre-wrap' }} 
        data-placeholder={placeholder}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        /* Spinner animation for the button */
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
