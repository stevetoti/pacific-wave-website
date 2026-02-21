'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  glowColor?: string;
}

export default function AnimatedCard({ 
  children, 
  className = '',
  hoverScale = 1.02,
  glowColor = 'rgba(239, 94, 51, 0.15)'
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      whileHover={{ 
        scale: hoverScale,
        boxShadow: `0 20px 40px ${glowColor}`,
      }}
      transition={{ 
        duration: 0.3,
        ease: 'easeOut'
      }}
    >
      {/* Gradient border effect */}
      <motion.div
        className="absolute inset-0 opacity-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #EF5E33 0%, #233C6F 100%)',
          padding: '2px',
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative bg-white rounded-2xl h-full">
        {children}
      </div>
    </motion.div>
  );
}
