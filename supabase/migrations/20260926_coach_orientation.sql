begin;
alter table public.pwd_lms_courses add column coaching_ends_on date;
alter table public.pwd_lms_coach_notes add column onboarding_completed_at timestamptz;
create or replace function public.pwd_lms_coach_reserve(p_user uuid,p_course uuid,p_lesson uuid,p_role text)
returns uuid language plpgsql security definer set search_path='' as $$
declare sid uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended('pwd-coach:'||p_user::text,0));
 if p_role='onboarding' and exists(select 1 from public.pwd_lms_coach_notes where user_id=p_user and course_id=p_course and onboarding_completed_at is not null) then raise exception 'onboarding_completed'; end if;
 if exists(select 1 from public.pwd_lms_coach_sessions where user_id=p_user and state in ('starting','active') and expires_at>now()) then
  raise exception 'active_session';
 end if;
 if (select count(*) from public.pwd_lms_coach_sessions where user_id=p_user and created_at>now()-interval '24 hours' and state<>'failed')>=8 then
  raise exception 'daily_limit';
 end if;
 insert into public.pwd_lms_coach_sessions(user_id,course_id,lesson_id,role) values(p_user,p_course,p_lesson,p_role) returning id into sid;
 return sid;
end $$;
revoke all on function public.pwd_lms_coach_reserve(uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.pwd_lms_coach_reserve(uuid,uuid,uuid,text) to service_role;

create or replace function public.pwd_lms_coach_finish(p_user uuid,p_course uuid,p_session uuid,p_transcript jsonb,p_complete boolean default false)
returns boolean language plpgsql security definer set search_path='' as $$
declare r text;
begin
 perform pg_advisory_xact_lock(hashtextextended('pwd-coach:'||p_user::text,0));
 select role into r from public.pwd_lms_coach_sessions where id=p_session and user_id=p_user and course_id=p_course and state in ('starting','active') for update;
 if r is null then return false; end if;
 if p_complete and (r<>'onboarding' or not exists(select 1 from jsonb_array_elements(p_transcript) x where x->>'role'='user' and length(trim(x->>'content'))>0) or not exists(select 1 from jsonb_array_elements(p_transcript) x where x->>'role'='persona' and length(trim(x->>'content'))>0)) then raise exception 'onboarding_not_ready'; end if;
 update public.pwd_lms_coach_sessions set state='ended',ended_at=now(),transcript=p_transcript where id=p_session;
 if p_complete then
  insert into public.pwd_lms_coach_notes(user_id,course_id,onboarding_completed_at) values(p_user,p_course,now())
  on conflict(user_id,course_id) do update set onboarding_completed_at=excluded.onboarding_completed_at;
 end if;
 return true;
end $$;
revoke all on function public.pwd_lms_coach_finish(uuid,uuid,uuid,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.pwd_lms_coach_finish(uuid,uuid,uuid,jsonb,boolean) to service_role;
commit;
