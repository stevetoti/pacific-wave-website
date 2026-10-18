'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/auth-fetch';
interface Run { state: string; week: string; attempt: number; updatedAt: string; error?: string; keyword?: string; title?: string; postId?: string; targetUrl?: string }
interface Health { overdue: boolean; stalled: boolean; schedule: string; recovery: string; nextRun: string; current: Run | null; lastSuccess: Run | null; drafts: { id: string; title: string }[] }
export function WeeklyBlogHealth() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { let active = true; authFetch('/api/seo/weekly-blog').then(async r => { if (!r.ok) throw new Error(); const data: Health = await r.json(); if (active) setHealth(data); }).catch(() => { if (active) setError(true); }); return () => { active = false; }; }, []);
  const date = (value: string) => new Date(value).toLocaleString('en-GB', { timeZone: 'Pacific/Efate' });
  return <section aria-label="Weekly article publishing" className="mt-8 rounded-xl border border-deep-blue/20 bg-white p-6">
    <h2 className="text-xl font-semibold text-deep-blue">Weekly articles · approval required</h2>
    {error ? <p role="alert">Publishing health could not be loaded. Refresh to check again.</p> : !health ? <p>Checking actual publishing records…</p> : <>
      <p className="mt-2">{health.schedule}. One draft per week; you review and publish it.</p>
      <p className="mt-2 font-medium">This week: {health.overdue ? 'Scheduled draft overdue — investigate scheduler' : health.stalled ? 'Generation stalled — recovery or review required' : health.current?.state === 'ready' ? 'Draft prepared' : health.current?.state === 'failed' ? 'Generation failed — review required' : health.current?.state === 'running' ? 'Generation in progress; investigate if older than 15 minutes' : 'Awaiting scheduled run'}</p>
      {health.current?.error && <p role="alert" className="mt-2 text-red-700">{health.current.error} · Attempt {health.current.attempt} of 3</p>}
      {health.current?.keyword && <p>Target topic: {health.current.keyword}</p>}
      {health.current?.targetUrl && <p className="break-all">Supporting service: {health.current.targetUrl}</p>}
      <p className="mt-2 text-sm text-gray-600">Next weekly slot: {date(health.nextRun)} (Vanuatu). {health.recovery}.</p>
      <p className="text-sm text-gray-600">Last successful draft: {health.lastSuccess ? date(health.lastSuccess.updatedAt) : 'None recorded by the repaired system'}.</p>
      <p className="mt-3 font-medium">{health.drafts.length} weekly article{health.drafts.length === 1 ? '' : 's'} awaiting review</p>
      <ul className="mt-2 space-y-2">{health.drafts.map(d => <li key={d.id}><Link className="text-deep-blue underline" href={`/admin/blog/edit/${d.id}`}>Review: {d.title}</Link></li>)}</ul>
      <p className="mt-4 text-sm text-gray-600">Check facts, sources, provider eligibility, links and images before approving. No article is published automatically.</p>
      <Link href="/admin/blog" className="mt-3 inline-block text-deep-blue underline">Open articles for review</Link>
    </>}
  </section>;
}
