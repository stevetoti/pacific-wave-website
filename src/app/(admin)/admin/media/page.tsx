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
}

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('site-assets')
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const items = (data || []).map(item => ({
        ...item,
        url: supabase.storage.from('site-assets').getPublicUrl(item.name).data.publicUrl,
      }));

      setMediaItems(items);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError('Failed to load media library');
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

  const handleDelete = async (name: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const { error } = await supabase.storage
        .from('site-assets')
        .remove([name]);

      if (error) throw error;
      setMediaItems(items => items.filter(item => item.name !== name));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete file');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
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

  const isImage = (mimetype: string) => mimetype?.startsWith('image/');

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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Upload and manage your media files</p>
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

      {/* Media Grid */}
      {mediaItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🖼️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No media files yet</h3>
          <p className="text-gray-500">Upload images, videos, or documents to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden group"
            >
              <div className="aspect-square relative bg-gray-100">
                {isImage(getMimetype(item.metadata)) ? (
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {getMimetype(item.metadata).includes('video') ? '🎬' :
                     getMimetype(item.metadata).includes('pdf') ? '📄' : '📁'}
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
                  <button
                    onClick={() => handleDelete(item.name)}
                    className="p-2 bg-white rounded-lg hover:bg-red-100"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatSize(getSize(item.metadata))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
