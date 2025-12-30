import React, { useState } from 'react';
import { Globe } from 'lucide-react';

interface FaviconProps {
  domain: string;
  size?: number;
  className?: string;
}

const Favicon: React.FC<FaviconProps> = ({ domain, size = 128, className = "w-full h-full object-contain" }) => {
  const [error, setError] = useState(false);

  // 1. Try local cache (downloaded by fetch_favicons_v2.js)
  // Assuming the file is named as domain.png or domain.ico
  // We prioritize png as our script converts most to it
  const localIcon = `/image/favicons/${domain}.png`;

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return <Globe className={`text-gray-400 ${className}`} />;
  }

  return (
    <img
      src={localIcon}
      alt={`${domain} favicon`}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default Favicon;
