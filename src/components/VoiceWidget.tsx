'use client';

import { useState } from 'react';

export default function VoiceWidget() {
  const [isActive, setIsActive] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-16 right-0 bg-deep-blue text-white text-xs px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
          Voice Assistant — Coming Soon
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-deep-blue transform rotate-45"></div>
        </div>
      )}

      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => !isActive && setShowTooltip(false)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isActive ? 'bg-deep-blue animate-pulse' : 'bg-deep-blue/80'
        }`}
        aria-label="Voice Assistant"
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
    </div>
  );
}
