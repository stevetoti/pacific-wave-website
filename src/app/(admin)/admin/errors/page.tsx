 'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
type Event = { id: string; route: string; error_name: string; created_at: string };
export default function ServiceErrors() {
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] = useState('Loading...');
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('server_errors').select('id,route,error_name,created_at').eq('site_id','pwd').order('created_at', { ascending: false }).limit(50);
      setEvents(data || []);
      setStatus(error ? 'Unable to load service errors.' : data?.length ? '' : 'No recent service errors.');
    }
    void load();
  }, []);
  return <section><h1 className="text-2xl font-bold mb-4">Service Errors</h1><p role="status">{status}</p><ul className="space-y-3">{events.map(event => <li key={event.id} className="rounded border p-4"><strong>{event.route}</strong><p>{event.error_name} — {new Date(event.created_at).toLocaleString()}</p></li>)}</ul></section>;
}
