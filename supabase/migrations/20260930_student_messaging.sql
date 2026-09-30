-- Student directory, connection requests and private 1:1 messages. Additive; service-role access only.
begin;
alter table public.pwd_lms_profiles add column if not exists directory_visible boolean not null default true;
alter table public.pwd_lms_profiles add column if not exists message_emails boolean not null default true;
-- One row per pair of people, whoever asked first. Ignored requests stay "pending" to the sender.
create table if not exists public.pwd_lms_connections (
 id uuid primary key default gen_random_uuid(),
 requester uuid not null references auth.users(id) on delete cascade,
 addressee uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted','ignored')),
 note text not null default '' check(char_length(note)<=300),
 created_at timestamptz not null default now(), responded_at timestamptz,
 check(requester<>addressee)
);
create unique index if not exists pwd_lms_connections_pair on public.pwd_lms_connections(least(requester,addressee),greatest(requester,addressee));
create index if not exists pwd_lms_connections_addressee on public.pwd_lms_connections(addressee,status);
create index if not exists pwd_lms_connections_requester on public.pwd_lms_connections(requester,created_at desc);
create table if not exists public.pwd_lms_blocks (
 blocker uuid not null references auth.users(id) on delete cascade,
 blocked uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(blocker,blocked), check(blocker<>blocked)
);
create index if not exists pwd_lms_blocks_blocked on public.pwd_lms_blocks(blocked);
-- A 1:1 conversation; user_a < user_b so each pair has exactly one thread.
create table if not exists public.pwd_lms_dm_threads (
 id uuid primary key default gen_random_uuid(),
 user_a uuid not null references auth.users(id) on delete cascade,
 user_b uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), last_message_at timestamptz,
 unique(user_a,user_b), check(user_a<user_b)
);
create index if not exists pwd_lms_dm_threads_b on public.pwd_lms_dm_threads(user_b);
create table if not exists public.pwd_lms_dm_messages (
 id bigint generated always as identity primary key,
 thread_id uuid not null references public.pwd_lms_dm_threads(id) on delete cascade,
 sender uuid not null references auth.users(id) on delete cascade,
 body text not null default '' check(char_length(body)<=2000),
 file_id uuid, deleted boolean not null default false,
 client_id uuid, created_at timestamptz not null default now(),
 unique(sender,client_id)
);
create index if not exists pwd_lms_dm_messages_thread on public.pwd_lms_dm_messages(thread_id,id desc);
create table if not exists public.pwd_lms_dm_files (
 id uuid primary key, thread_id uuid not null references public.pwd_lms_dm_threads(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 path text not null, name text not null, mime text not null, size integer not null,
 created_at timestamptz not null default now()
);
create table if not exists public.pwd_lms_dm_reads (
 thread_id uuid not null references public.pwd_lms_dm_threads(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 last_read_id bigint not null default 0, reminded_id bigint not null default 0,
 primary key(thread_id,user_id)
);
create table if not exists public.pwd_lms_dm_reports (
 id uuid primary key default gen_random_uuid(),
 thread_id uuid not null references public.pwd_lms_dm_threads(id) on delete cascade,
 message_id bigint references public.pwd_lms_dm_messages(id) on delete set null,
 reporter uuid not null references auth.users(id) on delete cascade,
 reason text not null check(char_length(reason) between 3 and 500),
 created_at timestamptz not null default now(), resolved_at timestamptz, resolved_by uuid
);
create index if not exists pwd_lms_dm_reports_open on public.pwd_lms_dm_reports(created_at desc) where resolved_at is null;
do $$ declare t text; begin
 foreach t in array array['pwd_lms_connections','pwd_lms_blocks','pwd_lms_dm_threads','pwd_lms_dm_messages','pwd_lms_dm_files','pwd_lms_dm_reads','pwd_lms_dm_reports'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
-- Students = anyone with a paid or granted enrolment.
create or replace function public.pwd_lms_is_student(p_user uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from pwd_lms_orders where user_id=p_user and status in ('paid','granted'));
$$;
-- True when one person teaches a course the other is enrolled in (admins teach every course).
create or replace function public.pwd_lms_teaches(p_teacher uuid,p_student uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from pwd_lms_orders o where o.user_id=p_student and o.status in ('paid','granted')
   and (exists(select 1 from pwd_lms_course_instructors ci where ci.user_id=p_teacher and ci.course_id=o.course_id)
     or exists(select 1 from admin_users a join auth.users u on lower(u.email)=lower(a.email)
       where u.id=p_teacher and a.site_id='pacific-wave-digital' and a.is_active and a.role in ('admin','super_admin'))));
$$;
-- Whether two people may exchange direct messages right now.
create or replace function public.pwd_lms_can_message(p_a uuid,p_b uuid) returns boolean language sql stable security definer set search_path=public as $$
 select p_a<>p_b
  and not exists(select 1 from pwd_lms_blocks where (blocker=p_a and blocked=p_b) or (blocker=p_b and blocked=p_a))
  and (exists(select 1 from pwd_lms_connections where status='accepted' and least(requester,addressee)=least(p_a,p_b) and greatest(requester,addressee)=greatest(p_a,p_b))
   or pwd_lms_teaches(p_a,p_b) or pwd_lms_teaches(p_b,p_a));
$$;
-- Directory of visible students (anyone with a paid/granted enrolment) with course titles and my connection state.
create or replace function public.pwd_lms_directory(p_me uuid,p_search text default '',p_limit int default 30,p_offset int default 0)
returns table(user_id uuid,full_name text,occupation text,organization text,city text,country text,bio text,avatar_path text,courses text[],connection text,requested_by_me boolean)
language sql stable security definer set search_path=public as $$
 with s as (
  select o.user_id,(array_agg(o.name order by o.created_at desc))[1] as order_name,array_agg(distinct c.title) as courses
  from pwd_lms_orders o join pwd_lms_courses c on c.id=o.course_id where o.status in ('paid','granted') group by o.user_id
 )
 select s.user_id,coalesce(nullif(p.full_name,''),s.order_name),coalesce(p.occupation,''),coalesce(p.organization,''),coalesce(p.city,''),coalesce(p.country,''),coalesce(p.bio,''),coalesce(p.avatar_path,''),
  s.courses,
  case when k.status='accepted' then 'connected' when k.id is null then 'none'
   when k.requester=p_me then 'sent' when k.status='pending' then 'received' else 'none' end,
  coalesce(k.requester=p_me,false)
 from s left join pwd_lms_profiles p on p.user_id=s.user_id
 left join pwd_lms_connections k on least(k.requester,k.addressee)=least(s.user_id,p_me) and greatest(k.requester,k.addressee)=greatest(s.user_id,p_me)
 where s.user_id<>p_me and coalesce(p.directory_visible,true)
  and not exists(select 1 from pwd_lms_blocks b where (b.blocker=p_me and b.blocked=s.user_id) or (b.blocker=s.user_id and b.blocked=p_me))
  and (p_search='' or coalesce(nullif(p.full_name,''),s.order_name) ilike '%'||p_search||'%' or p.city ilike '%'||p_search||'%' or p.occupation ilike '%'||p_search||'%' or p.organization ilike '%'||p_search||'%'
   or array_to_string(s.courses,' ') ilike '%'||p_search||'%')
 order by 2 limit least(greatest(p_limit,1),50) offset greatest(p_offset,0);
$$;
-- Send or re-send a connection request. Returns the resulting state for the requester.
create or replace function public.pwd_lms_request_connection(p_from uuid,p_to uuid,p_note text) returns text language plpgsql security definer set search_path=public as $$
declare k pwd_lms_connections;
begin
 if p_from=p_to then raise exception 'You cannot connect with yourself'; end if;
 if not pwd_lms_is_student(p_to) then raise exception 'This person is not available'; end if;
 if exists(select 1 from pwd_lms_blocks where (blocker=p_from and blocked=p_to) or (blocker=p_to and blocked=p_from)) then raise exception 'This person is not available'; end if;
 if (select count(*) from pwd_lms_connections where requester=p_from and created_at>now()-interval '1 day')>=20 then raise exception 'Daily request limit reached. Try again tomorrow.'; end if;
 select * into k from pwd_lms_connections where least(requester,addressee)=least(p_from,p_to) and greatest(requester,addressee)=greatest(p_from,p_to) for update;
 if k.id is null then
  insert into pwd_lms_connections(requester,addressee,note) values(p_from,p_to,coalesce(p_note,''));
  return 'sent';
 end if;
 if k.status='accepted' then return 'connected'; end if;
 -- They already asked me: accept instead of creating a second request.
 if k.requester=p_to and k.status='pending' then
  update pwd_lms_connections set status='accepted',responded_at=now() where id=k.id; return 'connected';
 end if;
 if k.requester=p_from and (k.status='pending' or k.responded_at>now()-interval '30 days') then return 'sent'; end if;
 update pwd_lms_connections set requester=p_from,addressee=p_to,status='pending',note=coalesce(p_note,''),created_at=now(),responded_at=null where id=k.id;
 return 'sent';
end $$;
-- Unread direct messages and pending requests for navigation badges.
create or replace function public.pwd_lms_message_counts(p_user uuid) returns table(unread bigint,requests bigint) language sql stable security definer set search_path=public as $$
 select (select count(*) from pwd_lms_dm_messages m join pwd_lms_dm_threads t on t.id=m.thread_id
   left join pwd_lms_dm_reads r on r.thread_id=t.id and r.user_id=p_user
   where (t.user_a=p_user or t.user_b=p_user) and m.sender<>p_user and not m.deleted and m.id>coalesce(r.last_read_id,0)
   and not exists(select 1 from pwd_lms_blocks b where b.blocker=p_user and b.blocked=m.sender)),
  (select count(*) from pwd_lms_connections where addressee=p_user and status='pending');
$$;
-- Recipients owed one reminder: unread messages older than an hour that were not reminded yet.
create or replace function public.pwd_lms_due_message_reminders(p_limit int default 50)
returns table(thread_id uuid,user_id uuid,last_id bigint,sender uuid) language sql stable security definer set search_path=public as $$
 select t.id,x.uid,max(m.id),(array_agg(m.sender order by m.id desc))[1]
 from pwd_lms_dm_threads t cross join lateral (values(t.user_a),(t.user_b)) x(uid)
 join pwd_lms_dm_messages m on m.thread_id=t.id and m.sender<>x.uid and not m.deleted
 left join pwd_lms_dm_reads r on r.thread_id=t.id and r.user_id=x.uid
 left join pwd_lms_profiles p on p.user_id=x.uid
 where coalesce(p.message_emails,true) and m.id>greatest(coalesce(r.last_read_id,0),coalesce(r.reminded_id,0)) and m.created_at<now()-interval '1 hour' and m.created_at>now()-interval '7 days'
 group by t.id,x.uid limit p_limit;
$$;
revoke all on function public.pwd_lms_is_student(uuid),public.pwd_lms_teaches(uuid,uuid),public.pwd_lms_can_message(uuid,uuid),public.pwd_lms_directory(uuid,text,int,int),public.pwd_lms_request_connection(uuid,uuid,text),public.pwd_lms_message_counts(uuid),public.pwd_lms_due_message_reminders(int) from public,anon,authenticated;
grant execute on function public.pwd_lms_is_student(uuid),public.pwd_lms_teaches(uuid,uuid),public.pwd_lms_can_message(uuid,uuid),public.pwd_lms_directory(uuid,text,int,int),public.pwd_lms_request_connection(uuid,uuid,text),public.pwd_lms_message_counts(uuid),public.pwd_lms_due_message_reminders(int) to service_role;
commit;
