-- Private LMS administration, discounts and assessment attempts.
begin;
alter table public.pwd_lms_orders drop constraint if exists pwd_lms_orders_status_check;
alter table public.pwd_lms_orders add constraint pwd_lms_orders_status_check check(status in ('pending','review','paid','rejected','refunded','granted','revoked'));
alter table public.pwd_lms_orders drop constraint if exists pwd_lms_orders_method_check;
alter table public.pwd_lms_orders add constraint pwd_lms_orders_method_check check(method in ('bank','stripe','grant','coupon'));
alter table public.pwd_lms_orders drop constraint if exists pwd_lms_orders_amount_check;
alter table public.pwd_lms_orders add constraint pwd_lms_orders_amount_check check(amount >= 0);
alter table public.pwd_lms_orders add column if not exists original_amount integer;
alter table public.pwd_lms_orders add column if not exists discount_amount integer not null default 0 check(discount_amount >= 0);
alter table public.pwd_lms_orders add column if not exists coupon_code text;
alter table public.pwd_lms_orders add column if not exists package_label text;
alter table public.pwd_lms_orders add column if not exists granted_by uuid references auth.users(id);
create table if not exists public.pwd_lms_coupons (
 id uuid primary key default gen_random_uuid(), code text unique not null check(code ~ '^[A-Z0-9][A-Z0-9_-]{2,39}$'),
 course_id uuid not null references public.pwd_lms_courses(id), kind text not null check(kind in ('percent','fixed','free')),
 value integer not null check(value > 0), active boolean not null default true,
 starts_at timestamptz, ends_at timestamptz, max_uses integer not null default 100 check(max_uses between 1 and 100000),
 per_student integer not null default 1 check(per_student between 1 and 100), email text,
 created_at timestamptz not null default now(), check(ends_at is null or starts_at is null or ends_at > starts_at),
 check(kind <> 'percent' or value <= 100)
);
alter table public.pwd_lms_coupons add column if not exists currency text not null default 'VUV' check(currency in ('VUV','USD','AUD'));
create table if not exists public.pwd_lms_coupon_uses (
 id uuid primary key default gen_random_uuid(), coupon_id uuid not null references public.pwd_lms_coupons(id),
 order_id uuid not null unique references public.pwd_lms_orders(id) on delete cascade,
 user_id uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create index if not exists pwd_coupon_use_lookup on public.pwd_lms_coupon_uses(coupon_id,user_id);
alter table public.pwd_lms_lessons add column if not exists section_title text not null default '';
alter table public.pwd_lms_lessons add column if not exists quiz_settings jsonb not null default '{"pass_mark":70,"max_attempts":0,"time_limit_minutes":0}';
create table if not exists public.pwd_lms_quiz_attempts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id uuid not null references public.pwd_lms_lessons(id) on delete cascade,
 questions jsonb not null, settings jsonb not null, answers jsonb,
 started_at timestamptz not null default now(), submitted_at timestamptz,
 state text not null default 'started' check(state in ('started','passed','failed','review','expired')),
 score integer check(score between 0 and 100), earned numeric, total numeric, feedback text not null default '',
 graded_by uuid references auth.users(id)
);
create index if not exists pwd_quiz_student_lesson on public.pwd_lms_quiz_attempts(user_id,lesson_id,started_at desc);
create unique index if not exists pwd_quiz_one_active on public.pwd_lms_quiz_attempts(user_id,lesson_id) where state='started';
create or replace function public.pwd_lms_apply_coupon(p_order uuid,p_user uuid,p_code text) returns jsonb language plpgsql security definer set search_path=public as $$
declare o pwd_lms_orders; c pwd_lms_coupons; base integer; discount integer;
begin
 select * into o from pwd_lms_orders where id=p_order and user_id=p_user for update;
 if o.id is null or o.status not in ('pending','rejected') then raise exception 'Order cannot be discounted'; end if;
 if o.coupon_code=p_code then return to_jsonb(o); end if;
 if o.coupon_code is not null then raise exception 'A coupon is already applied to this registration'; end if;
 select * into c from pwd_lms_coupons where code=p_code for update;
 if c.id is null or not c.active or c.course_id<>o.course_id or c.currency<>o.currency or (c.starts_at is not null and now()<c.starts_at) or (c.ends_at is not null and now()>c.ends_at) or (c.email is not null and lower(c.email)<>lower(o.email)) then raise exception 'Coupon is not available for this registration'; end if;
 if (select count(*) from pwd_lms_coupon_uses where coupon_id=c.id)>=c.max_uses or (select count(*) from pwd_lms_coupon_uses where coupon_id=c.id and user_id=p_user)>=c.per_student then raise exception 'Coupon usage limit reached'; end if;
 base:=coalesce(o.original_amount,o.amount);
 discount:=case c.kind when 'free' then base when 'percent' then floor(base::numeric*c.value/100)::integer else least(base,c.value) end;
 insert into pwd_lms_coupon_uses(coupon_id,order_id,user_id) values(c.id,o.id,p_user);
 update pwd_lms_orders set original_amount=base,discount_amount=discount,amount=base-discount,coupon_code=c.code,
 status=case when base=discount then 'paid' else status end,method=case when base=discount then 'coupon' else method end
 where id=o.id returning * into o;
 return to_jsonb(o);
end $$;
create or replace function public.pwd_lms_begin_quiz(p_user uuid,p_lesson uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare l pwd_lms_lessons; a pwd_lms_quiz_attempts; lim integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text||p_lesson::text,0));
 select * into l from pwd_lms_lessons where id=p_lesson and published;
 if l.id is null or not exists(select 1 from pwd_lms_orders where user_id=p_user and course_id=l.course_id and status in ('paid','granted') and (l.order_id is null or id=l.order_id)) then raise exception 'Course access required'; end if;
 if jsonb_array_length(l.quiz)=0 then raise exception 'No quiz in this lesson'; end if;
 update pwd_lms_quiz_attempts set state='expired',submitted_at=now() where user_id=p_user and lesson_id=p_lesson and state='started' and (settings->>'time_limit_minutes')::int>0 and started_at+make_interval(mins=>(settings->>'time_limit_minutes')::int)<now();
 select * into a from pwd_lms_quiz_attempts where user_id=p_user and lesson_id=p_lesson and state='started';
 if a.id is not null then return to_jsonb(a); end if;
 lim:=coalesce((l.quiz_settings->>'max_attempts')::int,0);
 if lim>0 and (select count(*) from pwd_lms_quiz_attempts where user_id=p_user and lesson_id=p_lesson)>=lim then raise exception 'Attempt limit reached. Contact your instructor.'; end if;
 insert into pwd_lms_quiz_attempts(user_id,lesson_id,questions,settings) values(p_user,p_lesson,l.quiz,l.quiz_settings) returning * into a;
 return to_jsonb(a);
end $$;
create or replace function public.pwd_lms_grant(p_email text,p_courses uuid[],p_label text,p_actor uuid) returns void language plpgsql security definer set search_path=public as $$
declare u auth.users; cid uuid; o pwd_lms_orders;
begin
 select * into u from auth.users where lower(email)=lower(p_email) and email_confirmed_at is not null;
 if u.id is null then raise exception 'Student must create and verify their account first'; end if;
 if not exists(select 1 from pwd_lms_account_emails where lower(email)=lower(p_email)) and not exists(select 1 from pwd_lms_orders where user_id=u.id) and not exists(select 1 from pwd_lms_profiles where user_id=u.id) then raise exception 'No training account found for this email'; end if;
 foreach cid in array (select array_agg(x order by x) from unnest(p_courses) x) loop
  perform pg_advisory_xact_lock(hashtextextended(u.id::text||cid::text,0));
  select * into o from pwd_lms_orders where user_id=u.id and course_id=cid for update;
  if o.status in ('paid','granted') then continue; end if;
  if o.id is not null and (o.stripe_session is not null or o.status in ('review','refunded') or o.checkout_lock_until>now()) then raise exception 'Student has a payment in progress. Resolve that payment before granting access.'; end if;
  insert into pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency,status,method,package_label,granted_by,original_amount)
  select u.id,cid,u.email,coalesce((select nullif(full_name,'') from pwd_lms_profiles where user_id=u.id),nullif(u.raw_user_meta_data->>'full_name',''),u.email),coalesce((select phone from pwd_lms_profiles where user_id=u.id),''),0,currency,'granted','grant',p_label,p_actor,amount from pwd_lms_courses where id=cid
  on conflict(user_id,course_id) do update set status='granted',method='grant',original_amount=coalesce(pwd_lms_orders.original_amount,pwd_lms_orders.amount),amount=0,package_label=p_label,granted_by=p_actor
  where pwd_lms_orders.status in ('pending','rejected','revoked') and pwd_lms_orders.stripe_session is null and (pwd_lms_orders.checkout_lock_until is null or pwd_lms_orders.checkout_lock_until<now()) returning * into o;
  if o.id is null then raise exception 'Course unavailable or registration changed. Refresh and review its payment.'; end if;
  insert into pwd_lms_audit(actor_id,action,target_id) values(p_actor,'grant: '||p_label,o.id);
 end loop;
end $$;
revoke all on function public.pwd_lms_grant(text,uuid[],text,uuid) from public,anon,authenticated;
grant execute on function public.pwd_lms_grant(text,uuid[],text,uuid) to service_role;
create or replace function public.pwd_lms_finish_quiz(p_id uuid,p_expected text,p_state text,p_answers jsonb,p_score integer,p_earned numeric,p_total numeric,p_feedback text,p_actor uuid) returns boolean language plpgsql security definer set search_path=public as $$
declare a pwd_lms_quiz_attempts;
begin
 if p_expected not in ('started','review') or p_state not in ('review','passed','failed') or p_earned<0 or p_total<=0 or p_earned>p_total then raise exception 'Invalid assessment result'; end if;
 select * into a from pwd_lms_quiz_attempts where id=p_id for update;
 if a.id is null or a.state<>p_expected then return false; end if;
 if p_expected='started' and coalesce((a.settings->>'time_limit_minutes')::int,0)>0 and a.started_at+make_interval(mins=>(a.settings->>'time_limit_minutes')::int)<now() then raise exception 'Time expired'; end if;
 update pwd_lms_quiz_attempts set state=p_state,answers=p_answers,score=p_score,earned=p_earned,total=p_total,feedback=p_feedback,graded_by=p_actor,submitted_at=coalesce(submitted_at,now()) where id=p_id;
 if p_state='passed' then
 insert into pwd_lms_progress(user_id,lesson_id,score) values(a.user_id,a.lesson_id,p_score)
 on conflict(user_id,lesson_id) do update set score=greatest(pwd_lms_progress.score,excluded.score);
 end if;
 return true;
end $$;
revoke all on function public.pwd_lms_finish_quiz(uuid,text,text,jsonb,integer,numeric,numeric,text,uuid) from public,anon,authenticated;
grant execute on function public.pwd_lms_finish_quiz(uuid,text,text,jsonb,integer,numeric,numeric,text,uuid) to service_role;
-- Only server-side service credentials may use the new data and RPCs.
alter table public.pwd_lms_coupons enable row level security;
alter table public.pwd_lms_coupon_uses enable row level security;
alter table public.pwd_lms_quiz_attempts enable row level security;
revoke all on public.pwd_lms_coupons,public.pwd_lms_coupon_uses,public.pwd_lms_quiz_attempts from anon,authenticated;
grant all on public.pwd_lms_coupons,public.pwd_lms_coupon_uses,public.pwd_lms_quiz_attempts to service_role;
revoke all on function public.pwd_lms_apply_coupon(uuid,uuid,text),public.pwd_lms_begin_quiz(uuid,uuid) from public,anon,authenticated;
grant execute on function public.pwd_lms_apply_coupon(uuid,uuid,text),public.pwd_lms_begin_quiz(uuid,uuid) to service_role;
commit;
