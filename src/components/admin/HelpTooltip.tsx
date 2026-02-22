'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface HelpTooltipProps {
  title: string;
  description: string;
  articleSlug?: string;
}

export function HelpTooltip({ title, description, articleSlug }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2 w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs hover:bg-gray-300 transition-colors flex items-center justify-center font-semibold"
        title="Help"
        aria-label="Help"
      >
        ?
      </button>
      {isOpen && (
        <div className="absolute z-50 w-64 p-3 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 text-sm left-0 top-full">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-gray-600 text-xs mb-2">{description}</p>
          {articleSlug && (
            <Link 
              href={`/admin/help/${articleSlug}`}
              className="text-vibrant-orange text-xs hover:underline"
            >
              Learn more →
            </Link>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
