-- In-app notifications with batched branded emails (messages, mentions, announcements, connections). Additive.
begin;
create table if not exists public.pwd_lms_notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('message','connection_request','connection_accepted','mention','announcement')),
 actor uuid references auth.users(id) on delete set null,
 group_key text not null, title text not null check(char_length(title)<=200),
 body text not null default '' check(char_length(body)<=600), link text not null default '',
 count integer not null default 1,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), read_at timestamptz,
 email_state text not null default 'pending' check(email_state in ('pending','sending','sent','skipped','failed')),
 email_due_at timestamptz not null default now(), email_attempts integer not null default 0, emailed_at timestamptz
);
create index if not exists pwd_lms_notifications_user on public.pwd_lms_notifications(user_id,updated_at desc);
create index if not exists pwd_lms_notifications_due on public.pwd_lms_notifications(email_due_at) where email_state in ('pending','sending');
create index if not exists pwd_lms_notifications_group on public.pwd_lms_notifications(user_id,group_key) where read_at is null;
alter table public.pwd_lms_notifications enable row level security;
revoke all on public.pwd_lms_notifications from anon,authenticated;
grant all on public.pwd_lms_notifications to service_role;
-- Adds a notification, or folds it into the still-unsent one for the same conversation so bursts become one email.
create or replace function public.pwd_lms_notify(p_users uuid[],p_kind text,p_actor uuid,p_group text,p_title text,p_body text,p_link text,p_delay_seconds int)
returns integer language plpgsql security definer set search_path=public as $$
declare u uuid; n integer:=0; existing uuid;
begin
 foreach u in array coalesce(p_users,'{}') loop
  continue when u is null or u=p_actor;
  select id into existing from pwd_lms_notifications
   where user_id=u and group_key=p_group and read_at is null and email_state='pending' order by created_at desc limit 1 for update;
  if existing is not null then
   update pwd_lms_notifications set count=count+1,body=left(coalesce(p_body,''),600),title=left(p_title,200),actor=p_actor,updated_at=now() where id=existing;
  else
   insert into pwd_lms_notifications(user_id,kind,actor,group_key,title,body,link,email_due_at)
   values(u,p_kind,p_actor,p_group,left(p_title,200),left(coalesce(p_body,''),600),p_link,now()+make_interval(secs=>greatest(p_delay_seconds,0)));
  end if;
  n:=n+1;
 end loop;
 return n;
end $$;
-- Claims due emails for one worker; stale claims are retried, and each notification is tried at most three times.
create or replace function public.pwd_lms_claim_notification_emails(p_limit int default 40)
returns setof public.pwd_lms_notifications language sql security definer set search_path=public as $$
 update pwd_lms_notifications set email_state='sending',email_attempts=email_attempts+1,email_due_at=now()+interval '5 minutes'
 where id in (select id from pwd_lms_notifications
  where email_due_at<=now() and email_attempts<3 and (email_state='pending' or email_state='sending')
  order by email_due_at limit p_limit for update skip locked)
 returning *;
$$;
revoke all on function public.pwd_lms_notify(uuid[],text,uuid,text,text,text,text,int),public.pwd_lms_claim_notification_emails(int) from public,anon,authenticated;
grant execute on function public.pwd_lms_notify(uuid[],text,uuid,text,text,text,text,int),public.pwd_lms_claim_notification_emails(int) to service_role;
commit;
