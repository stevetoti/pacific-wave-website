import 'server-only';
import type { z } from 'zod';
import { signupSchema } from '../lms/signup';
import { getSupabaseAdmin } from './clients';
import { checked } from './lms';
import { HttpError } from './http';

// Opt out of confirmation only for NEW training accounts. Never confirm, reset,
// or change an existing account in this database shared with other applications.
export async function createTrainingAccount(input: z.infer<typeof signupSchema>) {
  const db = getSupabaseAdmin();
  const course = input.course ? checked(await db.from('pwd_lms_courses').select('*')
    .or(`id.eq.${/^[0-9a-f-]{36}$/.test(input.course) ? input.course : '00000000-0000-0000-0000-000000000000'},slug.eq.${input.course}`)
    .eq('published', true).maybeSingle()) : null;
  if (input.course && (!course || !course.enrollment_open)) throw new HttpError(409, 'This course is not accepting registrations. Please choose an available course.');
  if (course?.cohort_id) {
    const cohort = checked(await db.from('pwd_training_cohorts').select('config').eq('id', course.cohort_id).single());
    if (!cohort || cohort.config.registrationState !== 'open' || Date.now() > Date.parse(cohort.config.teachingEnd)) throw new HttpError(409, 'Registration for this class is closed.');
  }
  const result = await db.auth.admin.createUser({
    email: input.email, password: input.password, email_confirm: true,
    user_metadata: { full_name: input.name, training_signup: true, attendance: input.attendance, training_privacy_accepted_at: new Date().toISOString(), training_email_confirmation_skipped: true },
  });
  if (result.error) {
    if (['email_exists', 'user_already_exists'].includes(result.error.code || '')) throw new HttpError(409, 'An account already uses this email. Choose “Already a student? Sign in” to continue, or reset your password.');
    throw result.error;
  }
  const user = result.data.user;
  if (!user) throw new Error('Student account unavailable');
  try {
    checked(await db.from('pwd_lms_profiles').insert({ user_id: user.id, full_name: input.name, phone: input.phone, city: input.location }));
    if (course) checked(await db.from('pwd_lms_orders').insert({ user_id: user.id, course_id: course.id, email: input.email, name: input.name, phone: input.phone, attendance: input.attendance, amount: course.amount, currency: course.currency }));
  } catch {
    // Keep the new account recoverable. Never delete it or override existing records.
    throw new HttpError(503, 'Your account was created, but registration could not finish. Please sign in to complete your course registration.');
  }
  return { courseId: course?.id || null };
}
