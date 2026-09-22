import {sendOwnerNotifications} from '@/lib/server/owner-notifications';
import {processCampaigns} from '@/lib/server/lms-campaigns';
import {apiError} from '@/lib/server/http';
export const maxDuration=120;export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!process.env.CRON_SECRET||request.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`)return new Response('Unauthorized',{status:401});
 try{await sendOwnerNotifications();await processCampaigns();return Response.json({ok:true});}catch(e){return apiError(e,'campaign-cron');}
}
