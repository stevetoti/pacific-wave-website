import { readFile } from 'node:fs/promises';
const ref='rndegttgwtpkbjtvjgnc';
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname!==`${ref}.supabase.co`) throw Error('Wrong project');
const query=await readFile('supabase/migrations/20261001_private_workshops.sql','utf8');
const r=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query}),signal:AbortSignal.timeout(60000)});
if(!r.ok) throw Error(`Migration failed: ${r.status} ${await r.text()}`);
console.log('Private workshop schema and messaging scope applied. No workshop published.');
