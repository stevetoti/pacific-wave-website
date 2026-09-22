import { readFile, mkdir, writeFile } from 'node:fs/promises';

const ref = 'rndegttgwtpkbjtvjgnc';
if (new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://invalid').hostname !== `${ref}.supabase.co`) throw new Error('Wrong database target');
if (!process.env.SUPABASE_ACCESS_TOKEN) throw new Error('SUPABASE_ACCESS_TOKEN is required');
const endpoint = `https://api.supabase.com/v1/projects/${ref}/database/query`;
async function query(sql) {
  const response = await fetch(endpoint, {
    method: 'POST', signal: AbortSignal.timeout(60000),
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) throw new Error(`Supabase management request failed (${response.status}); migration not confirmed`);
  return response.json();
}
const schema = await query(`SELECT table_name,column_name,data_type FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position`);
const policies = await query(`SELECT schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check FROM pg_policies WHERE schemaname='public' ORDER BY tablename,policyname`);
const constraints = await query(`SELECT conrelid::regclass::text AS table_name,conname,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE connamespace='public'::regnamespace ORDER BY conrelid,conname`);
await mkdir('.deployment', { recursive: true });
const snapshot = `.deployment/schema-${Date.now()}.json`;
await writeFile(snapshot, JSON.stringify({ schema, policies, constraints }, null, 2));
console.log(`Verified target and saved schema/policy/constraint snapshot: ${snapshot}`);
if (!process.argv.includes('--apply')) {
  console.log('Read-only preflight complete. No database changes made.');
} else {
  const sql = await readFile(new URL('../supabase/migrations/20260915_readiness_hardening.sql', import.meta.url), 'utf8');
  await query(sql);
  const result = await query(`SELECT to_regclass('public.integration_secrets') IS NOT NULL AS secrets_ready,to_regclass('public.pwd_newsletter_subscribers') IS NOT NULL AS newsletter_ready,to_regclass('public.pwd_transcripts') IS NOT NULL AS transcripts_ready`);
  console.log('Migration completed:', JSON.stringify(result));
}
