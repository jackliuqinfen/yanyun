
import React from 'react';
import MediaLibrary from '../../components/MediaLibrary';

const MediaManager: React.FC = () => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">媒体资产库</h1>
           <p className="text-gray-500 text-sm">全站统一图床系统：分类管理、云端存储、全场景复用</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
         <MediaLibrary mode="manage" />
      </div>
    </div>
  );
};

export default MediaManager;
