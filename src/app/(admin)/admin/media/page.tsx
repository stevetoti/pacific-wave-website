'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { supabase, uploadFile } from '@/lib/supabase';

interface SiteImage {
  id: string;
  name: string;
  path: string;
  description: string;
  dimensions?: string;
  section: string;
}

// All images used on the website, organized by section
const websiteImages: Record<string, SiteImage[]> = {
  'Hero & Branding': [
    { id: 'hero-bg', name: 'Hero Background', path: '/images/hero-digital-innovation.jpg', description: 'Main homepage hero background image', dimensions: '1920x1080', section: 'Homepage Hero' },
    { id: 'hero-og', name: 'Social Share Image', path: '/images/hero-og-share.jpg', description: 'Image shown when sharing on social media (og:image)', dimensions: '1200x630', section: 'SEO/Social' },
    { id: 'logo', name: 'Main Logo', path: '/images/logo.jpg', description: 'Company logo for light backgrounds', dimensions: '400x100', section: 'Header/Footer' },
    { id: 'logo-icon', name: 'Logo Icon', path: '/images/logo-icon.jpg', description: 'Square logo icon for small displays', dimensions: '200x200', section: 'Favicon/Icons' },
  ],
  'Services Page': [
    { id: 'ai-tech', name: 'AI Technology', path: '/images/ai-technology.jpg', description: 'AI Solutions service image', dimensions: '800x600', section: 'Services Grid' },
    { id: 'coding-screen', name: 'Coding Screen', path: '/images/coding-screen.jpg', description: 'Web Development service image', dimensions: '800x600', section: 'Services Grid' },
    { id: 'mobile-app', name: 'Mobile App', path: '/images/mobile-app.jpg', description: 'Mobile Apps service image', dimensions: '800x600', section: 'Services Grid' },
    { id: 'digital-marketing', name: 'Digital Marketing', path: '/images/digital-marketing.jpg', description: 'Digital Marketing service image', dimensions: '800x600', section: 'Services Grid' },
    { id: 'cloud-server', name: 'Cloud Server', path: '/images/cloud-server.jpg', description: 'Cloud & Hosting service image', dimensions: '800x600', section: 'Services Grid' },
  ],
  'About Page': [
    { id: 'about-team', name: 'Team Photo', path: '/images/about-team.jpg', description: 'Team/office image on About page', dimensions: '600x400', section: 'About Section' },
    { id: 'diverse-team', name: 'Diverse Team', path: '/images/diverse-team.jpg', description: 'Diverse team collaboration image', dimensions: '600x400', section: 'About Section' },
    { id: 'team-meeting', name: 'Team Meeting', path: '/images/team-meeting.jpg', description: 'Team meeting/collaboration image', dimensions: '600x400', section: 'About Section' },
    { id: 'tech-office', name: 'Tech Office', path: '/images/tech-office.jpg', description: 'Modern office environment', dimensions: '600x400', section: 'About Section' },
  ],
  'Contact & Location': [
    { id: 'port-vila', name: 'Port Vila', path: '/images/port-vila.jpg', description: 'Port Vila, Vanuatu location image', dimensions: '800x600', section: 'Contact Page' },
    { id: 'business-handshake', name: 'Business Handshake', path: '/images/business-handshake.jpg', description: 'Partnership/collaboration image', dimensions: '600x400', section: 'Contact/CTA' },
  ],
  'Partner Logos': [
    { id: 'pwd-logo', name: 'PWD Logo', path: '/images/logos/pwd-logo.jpg', description: 'Pacific Wave Digital logo', dimensions: '200x200', section: 'Footer/Partners' },
    { id: 'gdp-logo', name: 'GDP Logo', path: '/images/logos/gdp-logo.jpg', description: 'Global Digital Prime logo', dimensions: '200x200', section: 'Footer/Partners' },
    { id: 'rapid-logo', name: 'Rapid Logo', path: '/images/logos/rapid-logo.jpg', description: 'Rapid Entrepreneurs logo', dimensions: '200x200', section: 'Footer/Partners' },
  ],
  'Backgrounds & Decorative': [
    { id: 'pacific-sunset', name: 'Pacific Sunset', path: '/images/pacific-sunset.jpg', description: 'Decorative Pacific sunset image', dimensions: '1920x1080', section: 'Backgrounds' },
    { id: 'tropical-beach', name: 'Tropical Beach', path: '/images/tropical-beach.jpg', description: 'Tropical beach scene', dimensions: '1920x1080', section: 'Backgrounds' },
    { id: 'laptop-work', name: 'Laptop Work', path: '/images/laptop-work.jpg', description: 'Person working on laptop', dimensions: '800x600', section: 'General Use' },
    { id: 'phone-user', name: 'Phone User', path: '/images/phone-user.jpg', description: 'Person using smartphone', dimensions: '600x400', section: 'General Use' },
  ],
};

export default function MediaPage() {
  const [uploadedItems, setUploadedItems] = useState<Array<{name: string; url: string; created_at: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [replacingImage, setReplacingImage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('Hero & Branding');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('site-assets')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (!error && data) {
        const items = data.map(item => ({
          name: item.name,
          url: supabase.storage.from('site-assets').getPublicUrl(item.name).data.publicUrl,
          created_at: item.created_at || '',
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
    try {
      for (const file of Array.from(files)) {
        await uploadFile(file, 'site-assets', 'uploads');
      }
      await fetchMedia();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReplacingImage(imageId);
    try {
      // Upload to Supabase with a specific path
      const url = await uploadFile(file, 'site-assets', `website-images/${imageId}`);
      if (url) {
        alert(`Image uploaded! To fully replace the static image, update the path in the code or contact your developer.\n\nNew image URL:\n${url}`);
        await fetchMedia();
      }
    } catch (err) {
      console.error('Replace error:', err);
      alert('Failed to upload replacement image.');
    } finally {
      setReplacingImage(null);
      e.target.value = '';
    }
  };

  const copyUrl = (url: string) => {
    const fullUrl = url.startsWith('/') ? `https://pacificwavedigital.com${url}` : url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const sectionIcons: Record<string, string> = {
    'Hero & Branding': '🏠',
    'Services Page': '⚙️',
    'About Page': '👥',
    'Contact & Location': '📍',
    'Partner Logos': '🤝',
    'Backgrounds & Decorative': '🎨',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-blue font-heading">Media Library</h1>
          <p className="text-gray-500 mt-1">All images used on the website, organized by section</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-vibrant-orange text-white font-bold px-6 py-3 rounded-lg hover:bg-soft-orange transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <span>📤</span> Upload Files
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-deep-blue">{Object.values(websiteImages).flat().length}</div>
          <div className="text-gray-500 text-sm">Site Images</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-vibrant-orange">{uploadedItems.length}</div>
          <div className="text-gray-500 text-sm">Uploaded</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{Object.keys(websiteImages).length}</div>
          <div className="text-gray-500 text-sm">Sections</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">🖼️</div>
          <div className="text-gray-500 text-sm">Media Library</div>
        </div>
      </div>

      {/* Website Images by Section */}
      <div className="space-y-4">
        {Object.entries(websiteImages).map(([section, images]) => (
          <div key={section} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Section Header - Clickable */}
            <button
              onClick={() => setExpandedSection(expandedSection === section ? null : section)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{sectionIcons[section] || '📁'}</span>
                <div className="text-left">
                  <h2 className="text-lg font-bold text-deep-blue">{section}</h2>
                  <p className="text-sm text-gray-500">{images.length} images</p>
                </div>
              </div>
              <div className={`transform transition-transform ${expandedSection === section ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Section Content */}
            {expandedSection === section && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-shadow">
                      {/* Image Preview */}
                      <div className="relative aspect-video bg-gray-100">
                        <Image
                          src={image.path}
                          alt={image.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                          }}
                        />
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => copyUrl(image.path)}
                            className="bg-white text-deep-blue px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100"
                          >
                            {copiedUrl === image.path ? '✓ Copied!' : '📋 Copy URL'}
                          </button>
                          <label className="bg-vibrant-orange text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-soft-orange cursor-pointer">
                            {replacingImage === image.id ? '...' : '🔄 Replace'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleReplaceImage(e, image.id)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Image Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{image.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{image.description}</p>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                          <span>📐 {image.dimensions}</span>
                          <span>📍 {image.section}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Uploaded Files Section */}
      {uploadedItems.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📤</span>
              <div>
                <h2 className="text-lg font-bold text-deep-blue">Uploaded Files</h2>
                <p className="text-sm text-gray-500">{uploadedItems.length} files in storage</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {uploadedItems.map((item) => (
                <div key={item.name} className="border border-gray-200 rounded-lg overflow-hidden group">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={item.url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate" title={item.name}>{item.name}</p>
                    <button
                      onClick={() => copyUrl(item.url)}
                      className="text-xs text-vibrant-orange hover:underline mt-1"
                    >
                      {copiedUrl === item.url ? '✓ Copied!' : 'Copy URL'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="font-bold text-deep-blue mb-2">💡 How to Replace Images</h3>
        <ol className="text-sm text-gray-600 space-y-2">
          <li>1. <strong>Hover</strong> over any image to see the Replace button</li>
          <li>2. Click <strong>&quot;🔄 Replace&quot;</strong> and select your new image</li>
          <li>3. The new image will be uploaded to storage</li>
          <li>4. For immediate site updates, go to <strong>Settings → Branding</strong> for logos/favicons</li>
        </ol>
      </div>
    </div>
  );
}
