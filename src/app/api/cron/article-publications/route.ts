import { processApprovedPublications } from '@/lib/server/article-publications';
export const maxDuration=300;
export const dynamic='force-dynamic';
export async function GET(request:Request){if(!process.env.CRON_SECRET||request.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`)return Response.json({error:'Unauthorized'},{status:401});if(process.env.VERCEL_ENV!=='production')return Response.json({error:'Production only'},{status:403});try{return Response.json({results:await processApprovedPublications()});}catch{return Response.json({error:'Publication queue unavailable; approved records retained'},{status:503});}}
