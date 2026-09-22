import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
const project=JSON.parse(await readFile('.vercel/project.json','utf8'));
if(project.projectId!=='prj_DuwpSNfiGkHmLB2n5dJLaWmoZKde')throw new Error('Wrong Vercel project');
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname!=='rndegttgwtpkbjtvjgnc.supabase.co')throw new Error('Wrong database');
const keys=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY'];
const args=['deploy','--yes','--env','TRAINING_EMAIL_MODE=sandbox'];
for(const key of keys){if(!process.env[key])throw new Error(`Missing ${key}`);args.push('--env',`${key}=${process.env[key]}`);if(key.startsWith('NEXT_PUBLIC_'))args.push('--build-env',`${key}=${process.env[key]}`);}
// These overrides apply only to this deployment, never all preview environments.
// This script cannot promote production or enable real training recipients.
const child=spawn('vercel',args,{stdio:['ignore','pipe','pipe']});
function output(chunk){let value=chunk.toString();for(const key of keys)value=value.replaceAll(process.env[key],'[redacted]');process.stdout.write(value);}
child.stdout.on('data',output);child.stderr.on('data',output);child.on('error',()=>{console.error('Unable to launch Vercel CLI');process.exitCode=1;});child.on('exit',code=>process.exit(code??1));
