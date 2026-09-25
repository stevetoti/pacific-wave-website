-- Expand roles without changing existing sessions, privacy or per-student quotas.
begin;
alter table public.pwd_lms_coach_sessions drop constraint pwd_lms_coach_sessions_role_check;
alter table public.pwd_lms_coach_sessions add constraint pwd_lms_coach_sessions_role_check
 check (role in ('onboarding','class_assistant','business','branding','sales_practice','marketing_content','project_review'));
commit;
