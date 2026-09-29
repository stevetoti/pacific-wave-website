-- Course affiliate programme: approved affiliates share /go/CODE links; paid referred orders earn a commission.
-- Additive only. Commissions are created by trigger so every paid path (Stripe, bank review, coupon) is covered.
begin;
create table if not exists public.pwd_lms_affiliates (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
 code text not null unique check(code ~ '^[A-Z0-9]{4,20}$'),
 status text not null default 'pending' check(status in ('pending','approved','rejected','suspended')),
 commission_rate numeric(5,2) not null default 15 check(commission_rate > 0 and commission_rate <= 100),
 full_name text not null, email text not null, phone text not null default '',
 payout_method text not null check(payout_method in ('bank','mobile_money','other')), payout_details text not null default '',
 promotion_plan text not null default '', admin_note text not null default '',
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.pwd_lms_affiliate_clicks (
 id bigint generated always as identity primary key,
 affiliate_id uuid not null references public.pwd_lms_affiliates(id) on delete cascade,
 path text not null default '/training-center', created_at timestamptz not null default now()
);
create index if not exists pwd_aff_clicks_affiliate on public.pwd_lms_affiliate_clicks(affiliate_id,created_at desc);
alter table public.pwd_lms_orders add column if not exists affiliate_id uuid references public.pwd_lms_affiliates(id);
alter table public.pwd_lms_orders add column if not exists referred_at timestamptz;
create index if not exists pwd_lms_orders_affiliate on public.pwd_lms_orders(affiliate_id) where affiliate_id is not null;
create table if not exists public.pwd_lms_affiliate_commissions (
 id uuid primary key default gen_random_uuid(),
 affiliate_id uuid not null references public.pwd_lms_affiliates(id),
 order_id uuid not null unique references public.pwd_lms_orders(id),
 course_id uuid not null references public.pwd_lms_courses(id),
 currency text not null check(currency in ('VUV','USD','AUD')),
 order_amount integer not null check(order_amount > 0), rate numeric(5,2) not null,
 amount integer not null check(amount >= 0),
 status text not null default 'pending' check(status in ('pending','approved','paid','void')),
 payout_reference text not null default '', note text not null default '',
 order_refunded_at timestamptz, paid_at timestamptz, paid_by uuid references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists pwd_aff_commissions_affiliate on public.pwd_lms_affiliate_commissions(affiliate_id,status);
do $$ declare t text; begin
 foreach t in array array['pwd_lms_affiliates','pwd_lms_affiliate_clicks','pwd_lms_affiliate_commissions'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
-- Attach a referral to an unpaid order once. Self-referral and non-approved affiliates are ignored.
create or replace function public.pwd_lms_attach_affiliate(p_order uuid,p_code text) returns boolean language plpgsql security definer set search_path=public as $$
declare a pwd_lms_affiliates;
begin
 select * into a from pwd_lms_affiliates where code=upper(p_code) and status='approved';
 if a.id is null then return false; end if;
 update pwd_lms_orders set affiliate_id=a.id,referred_at=now()
 where id=p_order and affiliate_id is null and user_id<>a.user_id and status in ('pending','rejected');
 return found;
end $$;
revoke all on function public.pwd_lms_attach_affiliate(uuid,text) from public,anon,authenticated;
grant execute on function public.pwd_lms_attach_affiliate(uuid,text) to service_role;
create or replace function public.pwd_lms_affiliate_commission() returns trigger language plpgsql security definer set search_path=public as $$
declare a pwd_lms_affiliates;
begin
 if new.affiliate_id is null or new.status is not distinct from old.status then return new; end if;
 if new.status='paid' and new.amount>0 then
  select * into a from pwd_lms_affiliates where id=new.affiliate_id and status='approved';
  if a.id is null then return new; end if;
  insert into pwd_lms_affiliate_commissions(affiliate_id,order_id,course_id,currency,order_amount,rate,amount)
  values(a.id,new.id,new.course_id,new.currency,new.amount,a.commission_rate,floor(new.amount::numeric*a.commission_rate/100)::integer)
  on conflict(order_id) do update set status='pending',order_amount=excluded.order_amount,rate=excluded.rate,amount=excluded.amount,
   order_refunded_at=null,note='',updated_at=now() where pwd_lms_affiliate_commissions.status='void';
 elsif new.status in ('refunded','revoked') then
  update pwd_lms_affiliate_commissions set order_refunded_at=now(),updated_at=now(),
   status=case when status='paid' then 'paid' else 'void' end,
   note=case when status='paid' then 'Order refunded after payout — recover manually' else 'Order refunded' end
  where order_id=new.id and status<>'void';
 end if;
 return new;
end $$;
revoke all on function public.pwd_lms_affiliate_commission() from public,anon,authenticated;
drop trigger if exists pwd_lms_affiliate_commission on public.pwd_lms_orders;
create trigger pwd_lms_affiliate_commission after update of status on public.pwd_lms_orders
 for each row execute function public.pwd_lms_affiliate_commission();
commit;
