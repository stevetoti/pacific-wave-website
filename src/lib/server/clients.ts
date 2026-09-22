import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

let admin: SupabaseClient | undefined;
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server database is not configured');
  return admin ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('AI service is not configured');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000, maxRetries: 1 });
}
