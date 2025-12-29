import React, { useState } from 'react';
import { Globe } from 'lucide-react';

interface FaviconProps {
  domain: string;
  size?: number;
  className?: string;
}

const Favicon: React.FC<FaviconProps> = ({ domain, size = 128, className = "w-full h-full object-contain" }) => {
  const [errorCount, setErrorCount] = useState(0);

  // Fallback chain: Google -> DuckDuckGo -> UI Avatars -> Default Icon
  const sources = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://ui-avatars.com/api/?name=${domain.substring(0, 2)}&background=random&color=fff&size=${size}`
  ];

  const handleError = () => {
    setErrorCount(prev => prev + 1);
  };

  // If all image sources fail, show the default Lucide icon
  if (errorCount >= sources.length) {
    return <Globe className={`text-gray-400 ${className}`} />;
  }

  return (
    <img
      src={sources[errorCount]}
      alt={`${domain} favicon`}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default Favicon;
