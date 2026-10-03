begin;
create table if not exists public.pwd_lms_workbook_answers (
 user_id uuid not null references auth.users(id) on delete cascade,
 course_id uuid not null references public.pwd_lms_courses(id) on delete cascade,
 lesson_key text not null,
 answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
 revision integer not null default 1 check (revision > 0),
 updated_at timestamptz not null default now(),
 primary key(user_id,course_id,lesson_key)
);
alter table public.pwd_lms_workbook_answers enable row level security;
revoke all on public.pwd_lms_workbook_answers from public, anon, authenticated;
grant all on public.pwd_lms_workbook_answers to service_role;
create or replace function public.pwd_save_workbook(p_user uuid,p_course uuid,p_lesson text,p_answers jsonb,p_revision integer)
returns table(revision integer,updated_at timestamptz)
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not exists(select 1 from public.pwd_lms_orders o where o.user_id=p_user and o.course_id=p_course and o.status in ('paid','granted')) then
  raise exception 'Enrollment required';
 end if;
 if p_revision=0 then
  return query insert into public.pwd_lms_workbook_answers as w(user_id,course_id,lesson_key,answers)
   values(p_user,p_course,p_lesson,p_answers) on conflict do nothing returning w.revision,w.updated_at;
 else
  return query update public.pwd_lms_workbook_answers w set answers=p_answers,revision=w.revision+1,updated_at=now()
   where w.user_id=p_user and w.course_id=p_course and w.lesson_key=p_lesson and w.revision=p_revision
   returning w.revision,w.updated_at;
 end if;
end $$;
revoke all on function public.pwd_save_workbook(uuid,uuid,text,jsonb,integer) from public,anon,authenticated;
grant execute on function public.pwd_save_workbook(uuid,uuid,text,jsonb,integer) to service_role;
commit;
