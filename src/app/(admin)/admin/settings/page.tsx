'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { supabase, getAllSettings, upsertSettings, uploadFile, SETTINGS_KEYS } from '@/lib/supabase';

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
}

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Branding
  const [siteName, setSiteName] = useState('');
  const [tagline, setTagline] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoWhiteUrl, setLogoWhiteUrl] = useState('');
  const [appleTouchIconUrl, setAppleTouchIconUrl] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoWhiteUploading, setLogoWhiteUploading] = useState(false);
  const [appleTouchIconUploading, setAppleTouchIconUploading] = useState(false);
  const [ogImageUploading, setOgImageUploading] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);
  
  // Contact
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  
  // Social Media
  const [facebookUrl, setFacebookUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  
  // Footer
  const [copyrightText, setCopyrightText] = useState('');
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  
  // Videos
  const [videos, setVideos] = useState<VideoItem[]>([
    { id: '1', title: 'Welcome to Pacific Wave Digital', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: '2', title: 'Our Services', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: '3', title: 'Client Success Stories', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: '4', title: 'Why Choose Us', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  ]);
  
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoWhiteInputRef = useRef<HTMLInputElement>(null);
  const appleTouchIconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getAllSettings('pwd');
      
      // Branding
      setSiteName(settings[SETTINGS_KEYS.SITE_NAME] || '');
      setTagline(settings[SETTINGS_KEYS.TAGLINE] || '');
      setFaviconUrl(settings[SETTINGS_KEYS.FAVICON_URL] || '');
      setLogoUrl(settings[SETTINGS_KEYS.LOGO_URL] || '');
      setLogoWhiteUrl(settings[SETTINGS_KEYS.LOGO_WHITE_URL] || '');
      setAppleTouchIconUrl(settings[SETTINGS_KEYS.APPLE_TOUCH_ICON_URL] || '');
      setOgImageUrl(settings[SETTINGS_KEYS.OG_IMAGE_URL] || '');
      setIconUrl(settings[SETTINGS_KEYS.ICON_URL] || '');
      
      // Contact
      setEmail(settings[SETTINGS_KEYS.EMAIL] || '');
      setPhone(settings[SETTINGS_KEYS.PHONE] || '');
      setAddress(settings[SETTINGS_KEYS.ADDRESS] || '');
      setBusinessHours(settings[SETTINGS_KEYS.BUSINESS_HOURS] || '');
      
      // Social Media
      setFacebookUrl(settings[SETTINGS_KEYS.FACEBOOK_URL] || '');
      setLinkedinUrl(settings[SETTINGS_KEYS.LINKEDIN_URL] || '');
      setTwitterUrl(settings[SETTINGS_KEYS.TWITTER_URL] || '');
      setInstagramUrl(settings[SETTINGS_KEYS.INSTAGRAM_URL] || '');
      
      // Footer
      setCopyrightText(settings[SETTINGS_KEYS.COPYRIGHT_TEXT] || '');
      try {
        const links = JSON.parse(settings[SETTINGS_KEYS.FOOTER_LINKS] || '[]');
        setFooterLinks(links);
      } catch {
        setFooterLinks([]);
      }
      
      // Videos
      try {
        const videosData = JSON.parse(settings[SETTINGS_KEYS.HOMEPAGE_VIDEOS] || '[]');
        if (videosData.length > 0) {
          setVideos(videosData);
        }
      } catch {
        // Keep default videos
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const settings: Record<string, string> = {
        // Branding
        [SETTINGS_KEYS.SITE_NAME]: siteName,
        [SETTINGS_KEYS.TAGLINE]: tagline,
        [SETTINGS_KEYS.FAVICON_URL]: faviconUrl,
        [SETTINGS_KEYS.LOGO_URL]: logoUrl,
        [SETTINGS_KEYS.LOGO_WHITE_URL]: logoWhiteUrl,
        [SETTINGS_KEYS.APPLE_TOUCH_ICON_URL]: appleTouchIconUrl,
        [SETTINGS_KEYS.OG_IMAGE_URL]: ogImageUrl,
        [SETTINGS_KEYS.ICON_URL]: iconUrl,
        // Contact
        [SETTINGS_KEYS.EMAIL]: email,
        [SETTINGS_KEYS.PHONE]: phone,
        [SETTINGS_KEYS.ADDRESS]: address,
        [SETTINGS_KEYS.BUSINESS_HOURS]: businessHours,
        // Social Media
        [SETTINGS_KEYS.FACEBOOK_URL]: facebookUrl,
        [SETTINGS_KEYS.LINKEDIN_URL]: linkedinUrl,
        [SETTINGS_KEYS.TWITTER_URL]: twitterUrl,
        [SETTINGS_KEYS.INSTAGRAM_URL]: instagramUrl,
        // Footer
        [SETTINGS_KEYS.COPYRIGHT_TEXT]: copyrightText,
        [SETTINGS_KEYS.FOOTER_LINKS]: JSON.stringify(footerLinks),
        // Videos
        [SETTINGS_KEYS.HOMEPAGE_VIDEOS]: JSON.stringify(videos),
      };
      
      const success = await upsertSettings(settings, 'pwd');
      
      if (success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const handleFileUpload = async (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (uploading: boolean) => void,
    folder: string
  ) => {
    setUploading(true);
    try {
      const url = await uploadFile(file, 'site-assets', folder);
      if (url) {
        setUrl(url);
      } else {
        alert('Failed to upload file. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred while uploading.');
    } finally {
      setUploading(false);
    }
  };

  const addFooterLink = () => {
    setFooterLinks([...footerLinks, { id: Date.now().toString(), label: '', url: '' }]);
  };

  const updateFooterLink = (id: string, field: 'label' | 'url', value: string) => {
    setFooterLinks(footerLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const removeFooterLink = (id: string) => {
    setFooterLinks(footerLinks.filter(link => link.id !== id));
  };

  const updateVideo = (id: string, field: 'title' | 'youtubeUrl', value: string) => {
    setVideos(videos.map(video => 
      video.id === id ? { ...video, [field]: value } : video
    ));
  };

  const getYoutubeEmbedUrl = (url: string) => {
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-blue font-heading">Site Settings</h1>
          <p className="text-gray-500 mt-1">Manage your website branding, contact info, and more</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-vibrant-orange text-white font-bold px-6 py-3 rounded-lg hover:bg-soft-orange transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <span>💾</span> Save All Settings
            </>
          )}
        </button>
      </div>

      {saveMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Branding Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-deep-blue mb-4 flex items-center gap-2">
          <span>🎨</span> Branding
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Favicon Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {faviconUrl ? (
                  <Image src={faviconUrl} alt="Favicon" width={48} height={48} className="object-contain" />
                ) : (
                  <span className="text-gray-400 text-2xl">🖼️</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept=".ico,.png,.jpg,.jpeg,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setFaviconUrl, setFaviconUploading, 'favicon');
                  }}
                />
                <button
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={faviconUploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  {faviconUploading ? 'Uploading...' : 'Upload Favicon'}
                </button>
                <p className="text-xs text-gray-500 mt-1">.ico, .png, .jpg, .svg (32x32 recommended)</p>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {logoUrl ? (
                  <Image src={logoUrl} alt="Logo" width={120} height={48} className="object-contain" />
                ) : (
                  <span className="text-gray-400 text-2xl">🖼️</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setLogoUrl, setLogoUploading, 'logo');
                  }}
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  {logoUploading ? 'Uploading...' : 'Upload Logo'}
                </button>
                <p className="text-xs text-gray-500 mt-1">.png, .jpg, .svg (400x100 recommended)</p>
              </div>
            </div>
          </div>

          {/* Logo White (for dark backgrounds) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo (White/Light)</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-800">
                {logoWhiteUrl ? (
                  <Image src={logoWhiteUrl} alt="Logo White" width={120} height={48} className="object-contain" />
                ) : (
                  <span className="text-gray-400 text-2xl">🖼️</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={logoWhiteInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setLogoWhiteUrl, setLogoWhiteUploading, 'logo-white');
                  }}
                />
                <button
                  onClick={() => logoWhiteInputRef.current?.click()}
                  disabled={logoWhiteUploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  {logoWhiteUploading ? 'Uploading...' : 'Upload White Logo'}
                </button>
                <p className="text-xs text-gray-500 mt-1">For dark backgrounds</p>
              </div>
            </div>
          </div>

          {/* Apple Touch Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apple Touch Icon</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {appleTouchIconUrl ? (
                  <Image src={appleTouchIconUrl} alt="Apple Touch Icon" width={48} height={48} className="object-contain" />
                ) : (
                  <span className="text-gray-400 text-2xl">📱</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={appleTouchIconInputRef}
                  type="file"
                  accept=".png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setAppleTouchIconUrl, setAppleTouchIconUploading, 'apple-touch-icon');
                  }}
                />
                <button
                  onClick={() => appleTouchIconInputRef.current?.click()}
                  disabled={appleTouchIconUploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  {appleTouchIconUploading ? 'Uploading...' : 'Upload Apple Icon'}
                </button>
                <p className="text-xs text-gray-500 mt-1">.png (180x180 recommended) - iOS home screen</p>
              </div>
            </div>
          </div>

          {/* Browser Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Browser Icon (PWA)</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {iconUrl ? (
                  <Image src={iconUrl} alt="Browser Icon" width={48} height={48} className="object-contain" />
                ) : (
                  <span className="text-gray-400 text-2xl">🌐</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={iconInputRef}
                  type="file"
                  accept=".png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setIconUrl, setIconUploading, 'icon');
                  }}
                />
                <button
                  onClick={() => iconInputRef.current?.click()}
                  disabled={iconUploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  {iconUploading ? 'Uploading...' : 'Upload Browser Icon'}
                </button>
                <p className="text-xs text-gray-500 mt-1">.png (192x192 or 512x512) - Modern browsers</p>
              </div>
            </div>
          </div>

          {/* OG Image (Social Share) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Social Share Image (OG Image)</label>
            <div className="flex items-center gap-4">
              <div className="w-48 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {ogImageUrl ? (
                  <Image src={ogImageUrl} alt="OG Image" width={180} height={90} className="object-cover" />
                ) : (
                  <span className="text-gray-400 text-2xl">🔗</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={ogImageInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setOgImageUrl, setOgImageUploading, 'og-image');
                  }}
                />
                <button
                  onClick={() => ogImageInputRef.current?.click()}
                  disabled={ogImageUploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  {ogImageUploading ? 'Uploading...' : 'Upload Social Image'}
                </button>
                <p className="text-xs text-gray-500 mt-1">.png, .jpg (1200x630 recommended) - Shows when sharing on social media</p>
              </div>
            </div>
          </div>

          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Pacific Wave Digital"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Innovative Digital Solutions"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            />
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-deep-blue mb-4 flex items-center gap-2">
          <span>📞</span> Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@pacificwavedigital.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+678 1234567"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Port Vila, Vanuatu"
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue resize-none"
            />
          </div>

          {/* Business Hours */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
            <input
              type="text"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              placeholder="Mon-Fri: 9am - 5pm (VUT)"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            />
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-deep-blue mb-4 flex items-center gap-2">
          <span>🌐</span> Social Media
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Facebook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2">📘</span> Facebook URL
            </label>
            <input
              type="url"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/pacificwavedigital"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2">💼</span> LinkedIn URL
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/pacificwavedigital"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            />
          </div>

          {/* Twitter/X */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2">🐦</span> Twitter/X URL
            </label>
            <input
              type="url"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://twitter.com/pacificwavedig"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2">📸</span> Instagram URL
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/pacificwavedigital"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            />
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-deep-blue mb-4 flex items-center gap-2">
          <span>📄</span> Footer Settings
        </h2>
        
        {/* Copyright Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
          <input
            type="text"
            value={copyrightText}
            onChange={(e) => setCopyrightText(e.target.value)}
            placeholder="© 2026 Pacific Wave Digital. All rights reserved."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
          />
        </div>

        {/* Footer Links */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">Footer Links</label>
            <button
              onClick={addFooterLink}
              className="text-vibrant-orange hover:text-soft-orange text-sm font-medium flex items-center gap-1"
            >
              <span>+</span> Add Link
            </button>
          </div>
          
          {footerLinks.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
              No footer links yet. Click &quot;Add Link&quot; to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {footerLinks.map((link, index) => (
                <div key={link.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateFooterLink(link.id, 'label', e.target.value)}
                    placeholder="Link Label"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue text-sm"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateFooterLink(link.id, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue text-sm"
                  />
                  <button
                    onClick={() => removeFooterLink(link.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Remove link"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Homepage Videos Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-deep-blue mb-4 flex items-center gap-2">
          <span>🎬</span> Homepage Videos
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Add YouTube video links to display on the homepage. Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video, index) => (
            <div key={video.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-deep-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-700">Video {index + 1}</span>
              </div>
              
              {/* Video Title */}
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={video.title}
                  onChange={(e) => updateVideo(video.id, 'title', e.target.value)}
                  placeholder="Enter video title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue text-sm"
                />
              </div>
              
              {/* YouTube URL */}
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={video.youtubeUrl}
                  onChange={(e) => updateVideo(video.id, 'youtubeUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue text-sm"
                />
              </div>
              
              {/* Video Preview */}
              {video.youtubeUrl && getYoutubeEmbedUrl(video.youtubeUrl) && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={getYoutubeEmbedUrl(video.youtubeUrl)}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-vibrant-orange text-white font-bold px-8 py-3 rounded-lg hover:bg-soft-orange transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <span>💾</span> Save All Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
