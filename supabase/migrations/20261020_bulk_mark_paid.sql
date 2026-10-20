begin;

-- Suppress only the explicitly requested bulk operation's email side effect.
-- All existing signup, payment and approval notifications retain their behavior.
create or replace function public.pwd_lms_queue_email() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if current_setting('pwd_lms.suppress_status_email',true) = 'on' then return new; end if;
 if TG_OP='INSERT' or new.status is distinct from old.status then
  insert into pwd_lms_emails(order_id,status) values(new.id,new.status);
 end if;
 return new;
end $$;

create or replace function public.pwd_lms_bulk_mark_paid(
 p_course uuid, p_orders uuid[], p_actor uuid, p_note text
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 ids uuid[]; changed uuid[]; old_suppress text;
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
 return jsonb_build_object('updated_count',cardinality(changed),'updated_ids',changed,
  'skipped_count',cardinality(ids)-cardinality(changed));
end $$;
revoke all on function public.pwd_lms_bulk_mark_paid(uuid,uuid[],uuid,text) from public,anon,authenticated;
grant execute on function public.pwd_lms_bulk_mark_paid(uuid,uuid[],uuid,text) to service_role;
commit;
