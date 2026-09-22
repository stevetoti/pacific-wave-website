import {readFile} from 'node:fs/promises';
const ref='rndegttgwtpkbjtvjgnc';
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname!==`${ref}.supabase.co`)throw Error('Wrong project');
async function query(query){const r=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query}),signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`Management API ${r.status}`);return r.json();}
const before=await query("SELECT slug,amount,enrollment_open FROM public.pwd_lms_courses WHERE slug IN ('vanuatu-october-2026','how-to-start-a-profitable-business','one-on-one-mentorship')");console.log('Course preflight:',JSON.stringify(before));
if(process.argv.includes('--apply')){await query(await readFile('supabase/migrations/20260915_mentorship.sql','utf8'));console.log('Additive mentorship migration applied');}
console.log(JSON.stringify(await query("SELECT slug,amount,enrollment_open,private_sessions FROM public.pwd_lms_courses WHERE published ORDER BY created_at")));
