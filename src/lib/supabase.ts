import { createClient, User, Session, AuthError } from '@supabase/supabase-js';

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

// Updated AdminUser type to match database schema
export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  avatar_url: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  site_id: string;
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
  APPLE_TOUCH_ICON_URL: 'apple_touch_icon_url',
  OG_IMAGE_URL: 'og_image_url',
  ICON_URL: 'icon_url',
  LOGO_WHITE_URL: 'logo_white_url',
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

// ==========================================
// AUTH HELPER FUNCTIONS
// ==========================================

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data.user, error };
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Get current session
export async function getCurrentSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/reset-password`,
  });
  return { error };
}

// Update password
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
}

// Send magic link for passwordless login
export async function sendMagicLink(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/admin`,
    },
  });
  return { error };
}

// Invite user (creates auth user and sends invite email)
export async function inviteUser(email: string): Promise<{ error: Error | null }> {
  // Note: This requires the service role key, so we call an API route
  try {
    const response = await fetch('/api/admin/invite-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const data = await response.json();
      return { error: new Error(data.error || 'Failed to invite user') };
    }
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

// ==========================================
// ADMIN USER CRUD FUNCTIONS
// ==========================================

// Get admin user by email
export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return null;
  return data as AdminUser;
}

// Get admin user by ID
export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as AdminUser;
}

// Get all admin users
export async function getAllAdminUsers(siteId: string = 'pacific-wave-digital'): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as AdminUser[];
}

// Create admin user
export async function createAdminUser(user: Partial<AdminUser>): Promise<{ data: AdminUser | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      email: user.email,
      name: user.name,
      role: user.role || 'viewer',
      is_active: user.is_active ?? true,
      site_id: user.site_id || 'pacific-wave-digital',
      created_by: user.created_by,
    })
    .select()
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as AdminUser, error: null };
}

// Update admin user
export async function updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<{ data: AdminUser | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('admin_users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as AdminUser, error: null };
}

// Update last login
export async function updateLastLogin(email: string): Promise<void> {
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('email', email);
}

// Delete admin user
export async function deleteAdminUser(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', id);

  if (error) return { error: new Error(error.message) };
  return { error: null };
}

// ==========================================
// ROLE CHECKING FUNCTIONS
// ==========================================

// Check if user has specific role
export async function hasRole(email: string, role: string): Promise<boolean> {
  const user = await getAdminUserByEmail(email);
  return user?.role === role;
}

// Check if user is super admin
export async function isSuperAdmin(email: string): Promise<boolean> {
  return hasRole(email, 'super_admin');
}

// Check if user is at least admin level
export async function isAdminOrHigher(email: string): Promise<boolean> {
  const user = await getAdminUserByEmail(email);
  return user?.role === 'super_admin' || user?.role === 'admin';
}

// Check if user is active
export async function isUserActive(email: string): Promise<boolean> {
  const user = await getAdminUserByEmail(email);
  return user?.is_active ?? false;
}

// Get user role
export async function getUserRole(email: string): Promise<string | null> {
  const user = await getAdminUserByEmail(email);
  return user?.role ?? null;
}

// ==========================================
// SETTINGS FUNCTIONS
// ==========================================

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
