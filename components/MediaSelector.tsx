
import React, { useState } from 'react';
import { Image as ImageIcon, Plus, X, Eye, RefreshCw } from 'lucide-react';
import MediaLibrary from './MediaLibrary';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion component to avoid type mismatch on 'animate' or 'initial' properties
const MotionDiv = motion.div as any;

interface MediaSelectorProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  allowedTypes?: ('image' | 'video')[];
}

const MediaSelector: React.FC<MediaSelectorProps> = ({ 
  label, 
  value, 
  onChange, 
  className,
  allowedTypes = ['image'] 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={className}>
      {label && <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>}
      
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50 flex items-center justify-center">
          <img src={value} alt="Preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
             <button 
               type="button"
               onClick={() => setIsModalOpen(true)}
               className="p-2.5 bg-white rounded-full text-gray-700 hover:text-primary transition-colors shadow-lg"
               title="从媒体库更换"
             >
               <RefreshCw size={18} />
             </button>
             <button 
               type="button"
               onClick={() => onChange('')}
               className="p-2.5 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors shadow-lg"
               title="移除素材"
             >
               <X size={18} />
             </button>
          </div>
        </div>
      ) : (
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
             <Plus size={24} />
          </div>
          <p className="text-sm font-bold text-gray-700">从媒体库挑选素材</p>
          <p className="text-xs text-gray-400 mt-1">支持图片和视频，上传后自动保存至云库</p>
        </button>
      )}

      {/* Media Library Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <MotionDiv 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <MotionDiv 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl text-white">
                       <ImageIcon size={20} />
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-gray-900">选择媒体素材</h2>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cloud Media Selection</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                   <X size={20} className="text-gray-400" />
                 </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <MediaLibrary 
                  mode="select" 
                  allowedTypes={allowedTypes}
                  onSelect={(url) => {
                    // Logic: Auto-close after selection for better UX in "Select" mode
                    onChange(url);
                    setIsModalOpen(false);
                  }}
                />
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaSelector;
