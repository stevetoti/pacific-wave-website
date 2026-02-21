'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import FadeInView from './animations/FadeInView';

const codeLines = [
  { text: 'const', color: '#C586C0' },
  { text: ' app', color: '#9CDCFE' },
  { text: ' = ', color: '#D4D4D4' },
  { text: 'createApp', color: '#DCDCAA' },
  { text: '({', color: '#D4D4D4' },
  { text: '\n  ', color: '#D4D4D4' },
  { text: 'name', color: '#9CDCFE' },
  { text: ': ', color: '#D4D4D4' },
  { text: '"Pacific Wave Digital"', color: '#CE9178' },
  { text: ',', color: '#D4D4D4' },
  { text: '\n  ', color: '#D4D4D4' },
  { text: 'features', color: '#9CDCFE' },
  { text: ': [', color: '#D4D4D4' },
  { text: '\n    ', color: '#D4D4D4' },
  { text: '"AI Solutions"', color: '#CE9178' },
  { text: ',', color: '#D4D4D4' },
  { text: '\n    ', color: '#D4D4D4' },
  { text: '"Web Development"', color: '#CE9178' },
  { text: ',', color: '#D4D4D4' },
  { text: '\n    ', color: '#D4D4D4' },
  { text: '"Mobile Apps"', color: '#CE9178' },
  { text: '\n  ]', color: '#D4D4D4' },
  { text: '\n});', color: '#D4D4D4' },
];

export default function CodeShowcase() {
  const [displayedCode, setDisplayedCode] = useState<typeof codeLines>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < codeLines.length) {
      const timer = setTimeout(() => {
        setDisplayedCode(prev => [...prev, codeLines[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <FadeInView>
      <div className="relative">
        {/* Browser window frame */}
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-gray-400 text-sm font-mono">app.tsx</span>
            </div>
          </div>
          
          {/* Code area */}
          <div className="p-6 font-mono text-sm md:text-base min-h-[280px]">
            <pre className="whitespace-pre-wrap">
              {displayedCode.map((segment, i) => (
                <span key={i} style={{ color: segment.color }}>
                  {segment.text}
                </span>
              ))}
              <motion.span
                className="inline-block w-2 h-5 bg-vibrant-orange ml-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </pre>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-vibrant-orange/20 to-deep-blue/20 rounded-2xl blur-2xl -z-10" />
      </div>
    </FadeInView>
  );
}
