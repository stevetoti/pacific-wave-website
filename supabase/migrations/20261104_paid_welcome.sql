begin;
-- Dedicated, durable welcome outbox. Never backfill historical paid students implicitly.
alter table public.pwd_lms_emails add column if not exists attempts integer not null default 0;
alter table public.pwd_lms_emails add column if not exists last_error text;
alter table public.pwd_lms_emails add column if not exists provider_id text;
alter table public.pwd_lms_emails add column if not exists accepted_at timestamptz;
alter table public.pwd_lms_emails add column if not exists first_attempt_at timestamptz;
alter table public.pwd_lms_emails add column if not exists payload jsonb;
create unique index if not exists pwd_lms_one_welcome_per_order on public.pwd_lms_emails(order_id) where status='welcome';
-- Old application instances and generic status notifications cannot claim welcomes.
create or replace function public.pwd_lms_claim_emails() returns setof public.pwd_lms_emails
language sql security definer set search_path=public,pg_temp as $$
 update pwd_lms_emails set locked_until=now()+interval '2 minutes' where id in
 (select id from pwd_lms_emails where state='pending' and status<>'welcome'
 and (locked_until is null or locked_until<now()) order by created_at limit 10 for update skip locked) returning *;
$$;
create or replace function public.pwd_lms_claim_welcomes(p_orders uuid[] default null) returns setof public.pwd_lms_emails
language sql security definer set search_path=public,pg_temp as $$
 update pwd_lms_emails set state='failed',last_error=coalesce(last_error,'Welcome email retries exhausted'),locked_until=null
 where status='welcome' and state='pending' and attempts>=6 and (locked_until is null or locked_until<now()) and (p_orders is null or order_id=any(p_orders));
 update pwd_lms_emails set locked_until=now()+interval '3 minutes',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()) where id in
 (select id from pwd_lms_emails where status='welcome' and state='pending' and attempts<6
 and (p_orders is null or order_id=any(p_orders))
 and (locked_until is null or locked_until<now()) order by created_at limit 10 for update skip locked) returning *;
$$;
revoke all on function public.pwd_lms_claim_welcomes(uuid[]) from public,anon,authenticated;
grant execute on function public.pwd_lms_claim_welcomes(uuid[]) to service_role;
create or replace function public.pwd_lms_bulk_mark_paid(
 p_course uuid, p_orders uuid[], p_actor uuid, p_note text
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 ids uuid[]; changed uuid[]; old_suppress text; queued integer;
begin
 if not exists(select 1 from auth.users u join admin_users a on a.email=u.email
   where u.id=p_actor and a.site_id='pacific-wave-digital' and a.is_active
   and a.role in ('admin','super_admin')) then
  raise exception 'Admin access required' using errcode='42501';
 end if;
 if p_orders is null or cardinality(p_orders)<1 or cardinality(p_orders)>1000
   or length(trim(coalesce(p_note,'')))<3 or length(p_note)>500 then
  raise exception 'Invalid bulk payment request' using errcode='22023';
 end if;
 select array_agg(distinct x) into ids from unnest(p_orders) x;
 perform 1 from pwd_lms_courses where id=p_course for share;
 if not found then raise exception 'Course not found' using errcode='22023'; end if;
 -- Reject a forged or stale cross-course snapshot without changing any rows.
 if (select count(*) from pwd_lms_orders where course_id=p_course and id=any(ids))<>cardinality(ids) then
  raise exception 'Registrations changed or do not belong to this course. Refresh and try again.' using errcode='22023';
 end if;
 old_suppress := current_setting('pwd_lms.suppress_status_email',true);
 perform set_config('pwd_lms.suppress_status_email','on',true);
 with updated as (
  update pwd_lms_orders set status='paid', reviewed_by=p_actor,
   review_note='Bulk mark paid: '||trim(p_note),
   package_label=case when amount=0 and method='grant' then 'Approved workshop participant (no fee)' else package_label end
  where course_id=p_course and id=any(ids) and status='pending'
   -- A checkout still payable at Stripe needs its own payment reconciliation.
   and stripe_session is null and (checkout_lock_until is null or checkout_lock_until<now())
  returning id
 ) select coalesce(array_agg(id),'{}'::uuid[]) into changed from updated;
 perform set_config('pwd_lms.suppress_status_email',coalesce(old_suppress,''),true);
 insert into pwd_lms_audit(actor_id,action,target_id)
 select p_actor,'bulk_mark_paid',id from unnest(changed) id;
 insert into pwd_lms_emails(order_id,status) select id,'welcome' from unnest(changed) id
 on conflict(order_id) where status='welcome' do nothing;
 get diagnostics queued = row_count;
 return jsonb_build_object('welcome_queued_count',queued,'updated_count',cardinality(changed),'updated_ids',changed,
  'skipped_count',cardinality(ids)-cardinality(changed));
end $$;
commit;
