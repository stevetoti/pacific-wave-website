-- Unlisted workshops and server-enforced messaging audience boundaries.
begin;
alter table public.pwd_lms_courses add column if not exists is_private boolean not null default false;
alter table public.pwd_lms_courses add column if not exists requires_approval boolean not null default false;
alter table public.pwd_lms_courses drop constraint if exists pwd_lms_courses_amount_check;
alter table public.pwd_lms_courses add constraint pwd_lms_courses_amount_check check(amount>=0);
-- Shared private course OR public students across courses. Private participation takes
-- precedence over public enrolment so a second enrolment cannot bridge private cohorts.
-- Assigned instructors/admins keep access to their own students.
create or replace function public.pwd_lms_peer_scope(p_a uuid,p_b uuid) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select p_a<>p_b and (
  pwd_lms_teaches(p_a,p_b) or pwd_lms_teaches(p_b,p_a)
  or exists(select 1 from pwd_lms_orders a join pwd_lms_orders b on b.course_id=a.course_id
    join pwd_lms_courses c on c.id=a.course_id
    where a.user_id=p_a and b.user_id=p_b and a.status in ('paid','granted') and b.status in ('paid','granted') and c.is_private)
  or (pwd_lms_is_student(p_a) and pwd_lms_is_student(p_b)
    and not exists(select 1 from pwd_lms_orders o join pwd_lms_courses c on c.id=o.course_id
      where o.user_id in (p_a,p_b) and o.status in ('paid','granted') and c.is_private))
 );
$$;
create or replace function public.pwd_lms_allowed_peers(p_me uuid,p_users uuid[]) returns table(user_id uuid)
language sql stable security definer set search_path=public,pg_temp as $$
 select distinct u from unnest(p_users) u where pwd_lms_peer_scope(p_me,u);
$$;
create or replace function public.pwd_lms_can_message(p_a uuid,p_b uuid) returns boolean language sql stable security definer set search_path=public as $$
 select pwd_lms_peer_scope(p_a,p_b)
  and not exists(select 1 from pwd_lms_blocks where (blocker=p_a and blocked=p_b) or (blocker=p_b and blocked=p_a))
  and (exists(select 1 from pwd_lms_connections where status='accepted' and least(requester,addressee)=least(p_a,p_b) and greatest(requester,addressee)=greatest(p_a,p_b))
   or pwd_lms_teaches(p_a,p_b) or pwd_lms_teaches(p_b,p_a));
$$;
create or replace function public.pwd_lms_directory(p_me uuid,p_search text default '',p_limit int default 30,p_offset int default 0)
returns table(user_id uuid,full_name text,occupation text,organization text,city text,country text,bio text,avatar_path text,courses text[],connection text,requested_by_me boolean)
language sql stable security definer set search_path=public as $$
 with s as (
  select o.user_id,(array_agg(o.name order by o.created_at desc))[1] as order_name,array_agg(distinct c.title) as courses
  from pwd_lms_orders o join pwd_lms_courses c on c.id=o.course_id where o.status in ('paid','granted')
   and (not c.is_private or exists(select 1 from pwd_lms_orders mine where mine.user_id=p_me and mine.course_id=c.id and mine.status in ('paid','granted'))
    or exists(select 1 from pwd_lms_course_instructors ci where ci.user_id=p_me and ci.course_id=c.id)) group by o.user_id
 )
 select s.user_id,coalesce(nullif(p.full_name,''),s.order_name),coalesce(p.occupation,''),coalesce(p.organization,''),coalesce(p.city,''),coalesce(p.country,''),coalesce(p.bio,''),coalesce(p.avatar_path,''),
  s.courses,
  case when k.status='accepted' then 'connected' when k.id is null then 'none'
   when k.requester=p_me then 'sent' when k.status='pending' then 'received' else 'none' end,
  coalesce(k.requester=p_me,false)
 from s left join pwd_lms_profiles p on p.user_id=s.user_id
 left join pwd_lms_connections k on least(k.requester,k.addressee)=least(s.user_id,p_me) and greatest(k.requester,k.addressee)=greatest(s.user_id,p_me)
 where pwd_lms_peer_scope(p_me,s.user_id) and coalesce(p.directory_visible,true)
  and not exists(select 1 from pwd_lms_blocks b where (b.blocker=p_me and b.blocked=s.user_id) or (b.blocker=s.user_id and b.blocked=p_me))
  and (p_search='' or coalesce(nullif(p.full_name,''),s.order_name) ilike '%'||p_search||'%' or p.city ilike '%'||p_search||'%' or p.occupation ilike '%'||p_search||'%' or p.organization ilike '%'||p_search||'%'
   or array_to_string(s.courses,' ') ilike '%'||p_search||'%')
 order by 2 limit least(greatest(p_limit,1),50) offset greatest(p_offset,0);
$$;
create or replace function public.pwd_lms_request_connection(p_from uuid,p_to uuid,p_note text) returns text language plpgsql security definer set search_path=public as $$
declare k pwd_lms_connections;
begin
 if p_from=p_to then raise exception 'You cannot connect with yourself'; end if;
 if not pwd_lms_is_student(p_from) or not pwd_lms_is_student(p_to) or not pwd_lms_peer_scope(p_from,p_to) then raise exception 'This person is not available'; end if;
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
create or replace function public.pwd_lms_message_counts(p_user uuid) returns table(unread bigint,requests bigint) language sql stable security definer set search_path=public as $$
 select (select count(*) from pwd_lms_dm_messages m join pwd_lms_dm_threads t on t.id=m.thread_id
   left join pwd_lms_dm_reads r on r.thread_id=t.id and r.user_id=p_user
   where (t.user_a=p_user or t.user_b=p_user) and pwd_lms_peer_scope(p_user,m.sender) and m.sender<>p_user and not m.deleted and m.id>coalesce(r.last_read_id,0)
   and not exists(select 1 from pwd_lms_blocks b where b.blocker=p_user and b.blocked=m.sender)),
  (select count(*) from pwd_lms_connections where addressee=p_user and status='pending' and pwd_lms_peer_scope(p_user,requester));
$$;
create or replace function public.pwd_lms_due_message_reminders(p_limit int default 50)
returns table(thread_id uuid,user_id uuid,last_id bigint,sender uuid) language sql stable security definer set search_path=public as $$
 select t.id,x.uid,max(m.id),(array_agg(m.sender order by m.id desc))[1]
 from pwd_lms_dm_threads t cross join lateral (values(t.user_a),(t.user_b)) x(uid)
 join pwd_lms_dm_messages m on m.thread_id=t.id and m.sender<>x.uid and not m.deleted
 left join pwd_lms_dm_reads r on r.thread_id=t.id and r.user_id=x.uid
 left join pwd_lms_profiles p on p.user_id=x.uid
 where pwd_lms_peer_scope(x.uid,m.sender) and coalesce(p.message_emails,true) and m.id>greatest(coalesce(r.last_read_id,0),coalesce(r.reminded_id,0)) and m.created_at<now()-interval '1 hour' and m.created_at>now()-interval '7 days'
 group by t.id,x.uid limit p_limit;
$$;
-- Guard existing accepted requests too: stale connections cannot bypass a new privacy boundary.
create or replace function public.pwd_lms_guard_connection() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not pwd_lms_peer_scope(new.requester,new.addressee) then raise exception 'This person is not available'; end if;
 return new;
end $$;
drop trigger if exists pwd_lms_connection_scope on public.pwd_lms_connections;
create trigger pwd_lms_connection_scope before insert or update on public.pwd_lms_connections for each row execute function public.pwd_lms_guard_connection();
revoke all on function public.pwd_lms_peer_scope(uuid,uuid),public.pwd_lms_allowed_peers(uuid,uuid[]),public.pwd_lms_guard_connection() from public,anon,authenticated;
grant execute on function public.pwd_lms_peer_scope(uuid,uuid),public.pwd_lms_allowed_peers(uuid,uuid[]) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('pwd-workshop-resources','pwd-workshop-resources',false,20971520,array['application/pdf']) on conflict(id) do nothing;
commit;
