create table if not exists public.pwd_lms_coach_notes (
 user_id uuid not null references auth.users(id) on delete cascade,
 course_id uuid not null references public.pwd_lms_courses(id) on delete cascade,
 notes text not null default '' check(length(notes)<=4000), updated_at timestamptz not null default now(),
 primary key(user_id,course_id)
);
create table if not exists public.pwd_lms_coach_sessions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 course_id uuid not null references public.pwd_lms_courses(id) on delete cascade,
 lesson_id uuid references public.pwd_lms_lessons(id) on delete set null,
 role text not null check(role in ('onboarding','class_assistant','business','branding')),
 state text not null default 'starting' check(state in ('starting','active','ended','failed')),
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '15 minutes',
 ended_at timestamptz, transcript jsonb not null default '[]' check(jsonb_typeof(transcript)='array' and jsonb_array_length(transcript)<=160)
);
create index if not exists pwd_lms_coach_user_time on public.pwd_lms_coach_sessions(user_id,created_at desc);
alter table public.pwd_lms_coach_notes enable row level security;
alter table public.pwd_lms_coach_sessions enable row level security;
revoke all on public.pwd_lms_coach_notes,public.pwd_lms_coach_sessions from public,anon,authenticated;
grant all on public.pwd_lms_coach_notes,public.pwd_lms_coach_sessions to service_role;
create or replace function public.pwd_lms_coach_reserve(p_user uuid,p_course uuid,p_lesson uuid,p_role text)
returns uuid language plpgsql security definer set search_path='' as $$
declare sid uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended('pwd-coach:'||p_user::text,0));
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
