'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase, uploadFile } from '@/lib/supabase';

interface MediaItem {
  name: string;
  id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  url: string;
  bucket_id?: string;
  owner?: string;
  updated_at?: string;
  last_accessed_at?: string;
  isStatic?: boolean;
  category?: string;
}

// Static site images - these are in /public/images/ and used across the website
const staticSiteImages: MediaItem[] = [
  // Hero & Branding
  { id: 'hero-pacific', name: 'hero-pacific.jpg', url: '/images/hero-pacific.jpg', created_at: '', metadata: null, category: 'Hero & Branding', isStatic: true },
  { id: 'logo-icon', name: 'logo-icon.jpg', url: '/images/logo-icon.jpg', created_at: '', metadata: null, category: 'Hero & Branding', isStatic: true },
  
  // Services
  { id: 'ai-solutions', name: 'ai-solutions.jpg', url: '/images/services/ai-solutions.jpg', created_at: '', metadata: null, category: 'Services', isStatic: true },
  { id: 'web-dev', name: 'web-dev.jpg', url: '/images/services/web-dev.jpg', created_at: '', metadata: null, category: 'Services', isStatic: true },
  { id: 'mobile-apps', name: 'mobile-apps.jpg', url: '/images/services/mobile-apps.jpg', created_at: '', metadata: null, category: 'Services', isStatic: true },
  { id: 'digital-marketing', name: 'digital-marketing.jpg', url: '/images/services/digital-marketing.jpg', created_at: '', metadata: null, category: 'Services', isStatic: true },
  { id: 'automation', name: 'automation.jpg', url: '/images/services/automation.jpg', created_at: '', metadata: null, category: 'Services', isStatic: true },
  { id: 'cloud', name: 'cloud.jpg', url: '/images/services/cloud.jpg', created_at: '', metadata: null, category: 'Services', isStatic: true },
  
  // About
  { id: 'about-team', name: 'about-team.jpg', url: '/images/about/team.jpg', created_at: '', metadata: null, category: 'About', isStatic: true },
  { id: 'about-office', name: 'about-office.jpg', url: '/images/about/office.jpg', created_at: '', metadata: null, category: 'About', isStatic: true },
  
  // Portfolio
  { id: 'portfolio-1', name: 'portfolio-1.jpg', url: '/images/portfolio/project-1.jpg', created_at: '', metadata: null, category: 'Portfolio', isStatic: true },
  { id: 'portfolio-2', name: 'portfolio-2.jpg', url: '/images/portfolio/project-2.jpg', created_at: '', metadata: null, category: 'Portfolio', isStatic: true },
  { id: 'portfolio-3', name: 'portfolio-3.jpg', url: '/images/portfolio/project-3.jpg', created_at: '', metadata: null, category: 'Portfolio', isStatic: true },
];

export default function MediaPage() {
  const [uploadedItems, setUploadedItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'uploaded' | 'static'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('site-assets')
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.warn('Supabase storage not configured:', error);
        // Don't show error if bucket doesn't exist - just show static images
      } else {
        const items = (data || []).map(item => ({
          ...item,
          url: supabase.storage.from('site-assets').getPublicUrl(item.name).data.publicUrl,
          isStatic: false,
          category: 'Uploaded',
        }));
        setUploadedItems(items);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');

    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        if (!url) {
          setError(`Failed to upload ${file.name}`);
        }
      }
      await fetchMedia();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (name: string, isStatic?: boolean) => {
    if (isStatic) {
      alert('Static images cannot be deleted from here. They are part of the website codebase.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const { error } = await supabase.storage
        .from('site-assets')
        .remove([name]);

      if (error) throw error;
      setUploadedItems(items => items.filter(item => item.name !== name));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete file');
    }
  };

  const copyUrl = (url: string) => {
    // If it's a relative URL, make it absolute
    const fullUrl = url.startsWith('/') ? `https://pacificwavedigital.com${url}` : url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getMimetype = (metadata: Record<string, unknown> | null): string => {
    return (metadata?.mimetype as string) || '';
  };

  const getSize = (metadata: Record<string, unknown> | null): number => {
    return (metadata?.size as number) || 0;
  };

  const isImage = (url: string, mimetype?: string) => {
    if (mimetype?.startsWith('image/')) return true;
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  // Get all items based on active tab
  const allItems = [...uploadedItems, ...staticSiteImages];
  
  const filteredItems = allItems.filter(item => {
    if (activeTab === 'uploaded' && item.isStatic) return false;
    if (activeTab === 'static' && !item.isStatic) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    return true;
  });

  // Get unique categories
  const categories = Array.from(new Set(allItems.map(item => item.category).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage all images and media used on the website</p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-vibrant-orange text-white font-bold rounded-lg hover:bg-soft-orange transition-colors cursor-pointer">
          <span>{isUploading ? '⏳' : '📤'}</span>
          {isUploading ? 'Uploading...' : 'Upload Files'}
          <input
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-deep-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({allItems.length})
          </button>
          <button
            onClick={() => setActiveTab('uploaded')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'uploaded'
                ? 'bg-deep-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Uploaded ({uploadedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('static')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'static'
                ? 'bg-deep-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Site Images ({staticSiteImages.length})
          </button>
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Info Box for Static Images */}
      {activeTab === 'static' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>ℹ️ Site Images</strong> are bundled with the website code. To replace them, upload a new image with the same dimensions and let Toti update the code.
          </p>
        </div>
      )}

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🖼️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No media files found</h3>
          <p className="text-gray-500">
            {activeTab === 'uploaded' 
              ? 'Upload images to get started.' 
              : 'No files match your current filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden group ${
                item.isStatic ? 'ring-2 ring-blue-100' : ''
              }`}
            >
              <div className="aspect-square relative bg-gray-100">
                {isImage(item.url, getMimetype(item.metadata)) ? (
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized={item.isStatic}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {getMimetype(item.metadata)?.includes('video') ? '🎬' :
                     getMimetype(item.metadata)?.includes('pdf') ? '📄' : '📁'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="Copy URL"
                  >
                    {copiedUrl === item.url ? '✓' : '📋'}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="Open"
                  >
                    🔗
                  </a>
                  {!item.isStatic && (
                    <button
                      onClick={() => handleDelete(item.name, item.isStatic)}
                      className="p-2 bg-white rounded-lg hover:bg-red-100"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                {item.isStatic && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Static
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.isStatic ? item.category : formatSize(getSize(item.metadata))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
