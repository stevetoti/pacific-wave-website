-- Per-course instructors. Additive: admins keep full access; assigned instructors get teaching access to their courses only.
begin;
create table if not exists public.pwd_lms_course_instructors (
 course_id uuid not null references public.pwd_lms_courses(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 added_by uuid references auth.users(id), created_at timestamptz not null default now(),
 primary key(course_id,user_id)
);
create index if not exists pwd_lms_course_instructors_user on public.pwd_lms_course_instructors(user_id);
alter table public.pwd_lms_course_instructors enable row level security;
revoke all on public.pwd_lms_course_instructors from anon,authenticated;
grant all on public.pwd_lms_course_instructors to service_role;
-- Public instructor profile shown on course pages and in chat.
alter table public.pwd_lms_profiles add column if not exists instructor_title text not null default '' check(char_length(instructor_title)<=120);
alter table public.pwd_lms_profiles add column if not exists expertise text not null default '' check(char_length(expertise)<=300);
-- Chat people: enrolled students plus this course's instructors and active admins (admins keep moderation).
create or replace function public.pwd_lms_chat_people(p_course uuid,p_channel uuid default null)
returns table(user_id uuid,name text,instructor boolean) language sql stable security definer set search_path=public,pg_temp as $$
 with staff as (
  select ci.user_id,coalesce(nullif(p.full_name,''),'Instructor') as name from pwd_lms_course_instructors ci
   left join pwd_lms_profiles p on p.user_id=ci.user_id where ci.course_id=p_course
  union
  select u.id,coalesce(nullif(a.name,''),'Instructor') from admin_users a join auth.users u on lower(u.email)=lower(a.email)
   where a.site_id='pacific-wave-digital' and a.is_active and a.role in ('admin','super_admin')
 )
 select o.user_id,o.name,false from pwd_lms_orders o where o.course_id=p_course and o.status in ('paid','granted')
  and (p_channel is null or exists(select 1 from pwd_lms_channels c where c.id=p_channel and c.course_id=p_course and (not c.private or exists(select 1 from pwd_lms_channel_members cm where cm.channel_id=c.id and cm.user_id=o.user_id))))
  and not exists(select 1 from staff s where s.user_id=o.user_id)
 union all
 select distinct on (s.user_id) s.user_id,s.name,true from staff s;
$$;
revoke all on function public.pwd_lms_chat_people(uuid,uuid) from public,anon,authenticated;
grant execute on function public.pwd_lms_chat_people(uuid,uuid) to service_role;
-- Account lookup by email and instructor listing for the admin Instructors tab (service role only).
create or replace function public.pwd_lms_user_by_email(p_email text)
returns table(id uuid,email text) language sql stable security definer set search_path=public,pg_temp as $$
 select u.id,u.email::text from auth.users u where lower(u.email)=lower(p_email) limit 1;
$$;
create or replace function public.pwd_lms_instructor_list()
returns table(user_id uuid,email text,full_name text,instructor_title text,expertise text,bio text,avatar_path text,course_ids uuid[],last_sign_in_at timestamptz)
language sql stable security definer set search_path=public,pg_temp as $$
 select ci.user_id,u.email::text,coalesce(p.full_name,''),coalesce(p.instructor_title,''),coalesce(p.expertise,''),coalesce(p.bio,''),coalesce(p.avatar_path,''),
  array_agg(ci.course_id order by ci.created_at),u.last_sign_in_at
 from pwd_lms_course_instructors ci join auth.users u on u.id=ci.user_id left join pwd_lms_profiles p on p.user_id=ci.user_id
 group by ci.user_id,u.email,p.full_name,p.instructor_title,p.expertise,p.bio,p.avatar_path,u.last_sign_in_at
 order by coalesce(p.full_name,u.email::text);
$$;
revoke all on function public.pwd_lms_user_by_email(text),public.pwd_lms_instructor_list() from public,anon,authenticated;
grant execute on function public.pwd_lms_user_by_email(text),public.pwd_lms_instructor_list() to service_role;
commit;
