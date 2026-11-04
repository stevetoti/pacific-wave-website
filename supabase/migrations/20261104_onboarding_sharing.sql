begin;
-- Explicit session-level sharing. Historical/private coaching stays unshared.
alter table public.pwd_lms_coach_sessions add column if not exists onboarding_shared_at timestamptz;
do $$ begin
 if not exists(select 1 from pg_constraint where conname='pwd_onboarding_only_shared') then
  alter table public.pwd_lms_coach_sessions add constraint pwd_onboarding_only_shared check(onboarding_shared_at is null or role='onboarding');
 end if;
end $$;
create index if not exists pwd_lms_shared_onboarding on public.pwd_lms_coach_sessions(course_id,user_id,created_at desc)
where role='onboarding' and onboarding_shared_at is not null;
commit;
