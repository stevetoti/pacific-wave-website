import 'server-only';
import {unstable_cache} from 'next/cache';
import {getSupabaseAdmin} from './clients';
import {checked} from './lms';
import type {Course} from '../lms/types';
// Only published public course fields enter this shared cache. No sessions or student data.
export const publicTrainingCourses=unstable_cache(async()=>checked(await getSupabaseAdmin().from('pwd_lms_courses').select('id,slug,title,description,introduction,kind,amount,currency,published,enrollment_open,private_sessions,is_private,requires_approval,cohort_id').eq('published',true).eq('is_private',false).order('created_at')) as Course[],['pwd-public-training-courses'],{revalidate:60});

// An unlisted course is available by its shared link, never through enumeration.
export async function registrationCourse(key: string): Promise<Course | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(key)) return null;
  return checked(await getSupabaseAdmin().from('pwd_lms_courses').select('*')
    .eq(/^[0-9a-f-]{36}$/.test(key) ? 'id' : 'slug', key).eq('published', true).maybeSingle()) as Course | null;
}
