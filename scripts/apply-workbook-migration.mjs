import {readFile} from 'node:fs/promises';
const ref='rndegttgwtpkbjtvjgnc';
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname!==`${ref}.supabase.co`)throw Error('Wrong database');
const r=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query:await readFile('supabase/migrations/20261003_digital_workbook.sql','utf8')}),signal:AbortSignal.timeout(60000)});
if(!r.ok)throw Error(`Migration failed ${r.status}`);
console.log('Private workbook table and concurrency function applied. No learner responses or course records changed.');
