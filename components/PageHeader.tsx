
import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

// Cast motion component to bypass type issues with animate/initial props
const MotionDiv = motion.div as any;

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, backgroundImage }) => {
  return (
    <section className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage}
          alt={title}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gray-900/60 mix-blend-multiply"></div>
      </div>
      <div className="container mx-auto px-6 relative z-10 text-center">
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-light max-w-2xl mx-auto">
            {subtitle}
          </p>
        </MotionDiv>
      </div>
    </section>
  );
};

export default PageHeader;
