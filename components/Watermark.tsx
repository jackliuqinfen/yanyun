import React, { useEffect, useRef, useState } from 'react';

interface WatermarkProps {
  children: React.ReactNode;
  text?: string;
  logoUrl?: string;
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  layout?: 'tiled' | 'corner' | 'center';
}

const Watermark: React.FC<WatermarkProps> = ({ 
  children, 
  text = "此图片仅用于盐韵官网展示使用 其他使用非法无效", 
  logoUrl = "/image/logo/tuxing.png",
  className = "",
  variant = 'dark',
  size = 'medium',
  layout = 'tiled'
}) => {
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration
    // Increased canvas size for sharper rendering on high DPI screens
    const scale = 2; 
    // Increased tile size slightly to accommodate single line text
    const width = (layout === 'tiled' ? 300 : 800) * scale;
    const height = (layout === 'tiled' ? 300 : 800) * scale;
    const opacity = 0.4; // Reduced opacity for subtlety
    const rotate = layout === 'tiled' ? -25 * Math.PI / 180 : 0; 
    
    // Size logic (scaled)
    let fontSize = 12 * scale;
    let logoSize = 28 * scale;
    let separatorSpace = 12 * scale;

    if (size === 'small') {
      fontSize = 10 * scale;
      logoSize = 24 * scale;
      separatorSpace = 10 * scale;
    } else if (size === 'large') {
      fontSize = 16 * scale;
      logoSize = 36 * scale;
      separatorSpace = 16 * scale;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.scale(scale, scale); 

    // Theme logic
    const textColor = variant === 'dark' ? '#1a1a1a' : '#ffffff';
    const shadowColor = variant === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.6)';
    const separatorColor = variant === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.4)';

    // Load logo
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = logoUrl;

    const drawContent = () => {
      const logicalWidth = width / scale;
      const logicalHeight = height / scale;

      ctx.globalAlpha = opacity;
      ctx.translate(logicalWidth / 2, logicalHeight / 2);
      ctx.rotate(rotate);
      ctx.translate(-logicalWidth / 2, -logicalHeight / 2);
      
      let x = 0;
      let y = 0;

      // Draw Logo
      const displayedLogoSize = logoSize / scale;
      
      // Calculate text width to center the block
      const displayedFontSize = fontSize / scale;
      ctx.font = `700 ${displayedFontSize}px "Inter", "system-ui", sans-serif`;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      
      const totalContentWidth = displayedLogoSize + (separatorSpace / scale) + textWidth;
      
      if (layout === 'tiled') {
        x = (logicalWidth - totalContentWidth) / 2;
        y = logicalHeight / 2;
      } else if (layout === 'corner') {
         x = logicalWidth - totalContentWidth - 40;
         y = logicalHeight - 40;
      } else if (layout === 'center') {
         x = (logicalWidth - totalContentWidth) / 2;
         y = logicalHeight / 2;
      }

      ctx.drawImage(logo, x, y - displayedLogoSize/2, displayedLogoSize, displayedLogoSize);

      // Draw Separator Line
      const sepX = x + displayedLogoSize + (separatorSpace / scale / 2);
      ctx.beginPath();
      ctx.moveTo(sepX, y - displayedLogoSize/2 + 2);
      ctx.lineTo(sepX, y + displayedLogoSize/2 - 2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = separatorColor;
      ctx.stroke();

      // Draw Text
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';
      
      // Add text shadow
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      
      const textX = x + displayedLogoSize + (separatorSpace / scale);
      ctx.fillText(text, textX, y); // Single line render

      setWatermarkUrl(canvas.toDataURL('image/png'));
    };

    logo.onload = drawContent;

    // Fallback
    logo.onerror = () => {
      ctx.globalAlpha = opacity;
      ctx.rotate(rotate);
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.fillStyle = textColor;
      
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(text, 0, 100);
      setWatermarkUrl(canvas.toDataURL('image/png'));
    };

  }, [text, logoUrl, variant, size, layout]);

  // Anti-tamper protection
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          // Reset styles if tampered
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('watermark-overlay')) {
             target.style.display = 'block';
             target.style.opacity = '1';
             target.style.visibility = 'visible';
          }
        }
        if (mutation.type === 'childList') {
           // Re-add overlay if removed
           const overlay = containerRef.current?.querySelector('.watermark-overlay');
           if (!overlay && containerRef.current) {
              // Force reload/rerender component logic if critical part removed
              // For now, simpler approach: rely on React state to keep it consistent
           }
        }
      });
    });

    observer.observe(containerRef.current, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative group overflow-hidden select-none ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      draggable={false}
    >
      {/* Content Layer */}
      {children}

      {/* Watermark Overlay Layer */}
      <div 
        className="watermark-overlay absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `url(${watermarkUrl})`,
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
        }}
      />

      {/* Interaction Protection Layer (Transparent Shield) */}
      <div className="absolute inset-0 z-20 bg-transparent" />
    </div>
  );
};

export default Watermark;
