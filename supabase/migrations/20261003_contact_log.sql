-- Admin outreach log: every email, SMS or WhatsApp message sent to a student from the Students tab. Additive.
begin;
create table if not exists public.pwd_lms_contact_log (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 order_id uuid references public.pwd_lms_orders(id) on delete cascade,
 channel text not null check(channel in ('email','sms','whatsapp')),
 template text not null default 'custom',
 recipient text not null default '',
 subject text not null default '',
 body text not null default '' check(char_length(body)<=4000),
 status text not null check(status in ('sent','test_sent','failed','opened','skipped')),
 provider_id text not null default '', error text not null default '',
 sent_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index if not exists pwd_lms_contact_log_user on public.pwd_lms_contact_log(user_id,created_at desc);
alter table public.pwd_lms_contact_log enable row level security;
revoke all on public.pwd_lms_contact_log from anon,authenticated;
grant all on public.pwd_lms_contact_log to service_role;
commit;
