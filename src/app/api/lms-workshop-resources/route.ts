import { student, checked } from '@/lib/server/lms';
import { apiError, HttpError } from '@/lib/server/http';
import { blpSlug } from '@/lib/lms/blp-workshop';
import { workshopResources } from '@/lib/lms/workshop-resources';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const {db,user} = await student(request);
    const key = new URL(request.url).searchParams.get('resource');
    if (key !== 'workbook' && key !== 'outline' && key !== 'guide') throw new HttpError(404, 'Resource not found.');
    const course = checked(await db.from('pwd_lms_courses').select('id').eq('slug',blpSlug).single());
    const order = checked(await db.from('pwd_lms_orders').select('id').eq('course_id',course!.id).eq('user_id',user.id).in('status',['paid','granted']).maybeSingle());
    if (!order) throw new HttpError(403, 'Workshop approval is required before downloading resources.');
    const resource = workshopResources[key];
    const file = checked(await db.storage.from('pwd-workshop-resources').download(`${blpSlug}/${resource.file}`));
    return new Response(file, {headers: {'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${resource.file}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  } catch(e) { return apiError(e, 'lms/workshop-resource'); }
}
