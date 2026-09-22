import 'server-only';
import {unstable_cache} from 'next/cache';
import {getSupabaseAdmin} from './clients';
import {checked} from './lms';
import type {Course} from '../lms/types';
// Only published public course fields enter this shared cache. No sessions or student data.
export const publicTrainingCourses=unstable_cache(async()=>checked(await getSupabaseAdmin().from('pwd_lms_courses').select('id,slug,title,description,introduction,kind,amount,currency,published,enrollment_open,private_sessions,cohort_id').eq('published',true).order('created_at')) as Course[],['pwd-public-training-courses'],{revalidate:60});
