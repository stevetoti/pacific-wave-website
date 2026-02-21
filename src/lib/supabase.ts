import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our blog system
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  keywords: string[];
  read_time: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  created_at: string;
}

// Types for site settings
export interface SiteSetting {
  id: string;
  site_id: string;
  key: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

// Settings keys enum for type safety
export const SETTINGS_KEYS = {
  // Branding
  SITE_NAME: 'site_name',
  TAGLINE: 'tagline',
  FAVICON_URL: 'favicon_url',
  LOGO_URL: 'logo_url',
  // Contact
  EMAIL: 'contact_email',
  PHONE: 'contact_phone',
  ADDRESS: 'contact_address',
  BUSINESS_HOURS: 'business_hours',
  // Social Media
  FACEBOOK_URL: 'facebook_url',
  LINKEDIN_URL: 'linkedin_url',
  TWITTER_URL: 'twitter_url',
  INSTAGRAM_URL: 'instagram_url',
  // Footer
  COPYRIGHT_TEXT: 'copyright_text',
  FOOTER_LINKS: 'footer_links',
} as const;

// Helper function to get a setting
export async function getSetting(key: string, siteId: string = 'pwd'): Promise<string | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('site_id', siteId)
    .eq('key', key)
    .single();

  if (error || !data) return null;
  return data.value;
}

// Helper function to get all settings for a site
export async function getAllSettings(siteId: string = 'pwd'): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('site_id', siteId);

  if (error || !data) return {};
  
  return data.reduce((acc, item) => {
    acc[item.key] = item.value || '';
    return acc;
  }, {} as Record<string, string>);
}

// Helper function to upsert a setting
export async function upsertSetting(key: string, value: string, siteId: string = 'pwd'): Promise<boolean> {
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { site_id: siteId, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'site_id,key' }
    );

  return !error;
}

// Helper function to upsert multiple settings
export async function upsertSettings(settings: Record<string, string>, siteId: string = 'pwd'): Promise<boolean> {
  const records = Object.entries(settings).map(([key, value]) => ({
    site_id: siteId,
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('site_settings')
    .upsert(records, { onConflict: 'site_id,key' });

  return !error;
}

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  bucket: string = 'site-assets',
  folder: string = ''
): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return urlData.publicUrl;
}
