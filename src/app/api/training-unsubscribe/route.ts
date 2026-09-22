import {getSupabaseAdmin} from '@/lib/server/clients';import {checked} from '@/lib/server/lms';import {z} from 'zod';import {apiError,HttpError} from '@/lib/server/http';
export async function POST(request:Request){try{
 const token=z.uuid().safeParse(new URL(request.url).searchParams.get('token'));if(!token.success)throw new HttpError(400,'Invalid preference link');
 const db=getSupabaseAdmin();const r=checked(await db.from('pwd_lms_campaign_recipients').select('email').eq('unsubscribe_token',token.data).maybeSingle());if(!r)throw new HttpError(404,'Preference link unavailable');
 checked(await db.from('pwd_lms_email_suppressions').upsert({email:r.email,reason:'unsubscribed'}));
 return new Response('<!doctype html><html><body style="font-family:Arial;padding:48px;color:#233c6f"><h1>You are unsubscribed</h1><p>You will no longer receive training campaign emails. Account verification, password resets and payment confirmations continue as usual.</p><a href="/training-center">Return to training centre</a></body></html>',{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}catch(e){return apiError(e,'training-unsubscribe');}}
