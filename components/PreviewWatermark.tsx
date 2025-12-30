import React from 'react';

interface PreviewWatermarkProps {
  text?: string;
  className?: string;
}

const PreviewWatermark: React.FC<PreviewWatermarkProps> = ({ 
  text = "此图片仅用于盐韵官网展示使用 其他使用非法无效", 
  className = ""
}) => {
  // Create an array of 6 rows as requested
  const rows = Array.from({ length: 6 });

  return (
    <div 
      className={`absolute inset-0 z-20 pointer-events-none overflow-hidden select-none flex flex-col justify-center items-center ${className}`}
      style={{
        willChange: 'opacity', // Hardware acceleration hint
      }}
    >
      <div className="w-[150%] h-[150%] grid grid-rows-6 place-items-center transform -rotate-45">
        {rows.map((_, i) => (
          <div 
            key={i} 
            className="w-full text-center whitespace-nowrap text-white/40 text-lg md:text-xl lg:text-2xl font-bold tracking-widest drop-shadow-md"
            style={{
               textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            {/* Repeat text horizontally to ensure coverage after rotation */}
            <span className="mx-8">{text}</span>
            <span className="mx-8">{text}</span>
            <span className="mx-8">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewWatermark;