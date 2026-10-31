import { authorize,ADMIN_ROLES } from '@/lib/server/auth';
import { processPublication } from '@/lib/server/article-publications';
import { rateLimit } from '@/lib/server/rate-limit';
import { z } from 'zod';
export const maxDuration=300;
export const dynamic='force-dynamic';
const origin='https://totiroom.pacificwavedigital.com';
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Cache-Control':'no-store',Vary:'Origin'};
export function OPTIONS(request:Request){return new Response(null,{status:request.headers.get('origin')===origin?204:403,headers});}
export async function POST(request:Request){if(request.headers.get('origin')&&request.headers.get('origin')!==origin)return Response.json({error:'Origin not allowed'},{status:403,headers});const access=await authorize(request,ADMIN_ROLES);if(access.response)return new Response(access.response.body,{status:access.response.status,headers});const operator=await access.db.from('toti_operator_access').select('user_id').eq('user_id',access.user.id).maybeSingle();if(operator.error||!operator.data)return Response.json({error:'Toti Room owner access required'},{status:403,headers});try{await rateLimit(request,'article-publication',10);const {id,retry}=z.object({id:z.string().uuid(),retry:z.boolean().optional()}).strict().parse(await request.json());return Response.json(await processPublication(id,retry===true),{headers});}catch{return Response.json({error:'Publication queued for recovery; check Toti Room status'},{status:503,headers});}}
