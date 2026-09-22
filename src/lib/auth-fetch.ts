import { supabase } from './supabase';

/** Attach the current session only to our own API or configured Supabase functions. */
export async function authFetch(input: string, init: RequestInit = {}) {
  const url = new URL(input, window.location.origin);
  const isLocal = url.origin === window.location.origin;
  const isFunction = url.origin === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin && url.pathname.startsWith('/functions/v1/');
  if (!isLocal && !isFunction) throw new Error('Invalid authenticated request destination');
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  headers.delete('Authorization');
  if (session) headers.set('Authorization', `Bearer ${session.access_token}`);
  if (isFunction) headers.set('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  return fetch(input, { ...init, headers });
}
