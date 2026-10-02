-- Admin clean-up: delete one registration, or a whole student account, atomically.
-- Additive (functions only). Each call either removes everything it lists or nothing.
begin;
-- Removes one course registration and the learning records that belong to it.
-- Returns storage paths for the API to remove after the transaction commits.
create or replace function public.pwd_lms_delete_registration(p_order uuid) returns jsonb
language plpgsql security definer set search_path=public as $$
declare o pwd_lms_orders; recordings text[];
begin
 select * into o from pwd_lms_orders where id=p_order for update;
 if o.id is null then raise exception 'Registration not found'; end if;
 if exists(select 1 from pwd_lms_affiliate_commissions where order_id=o.id and status='paid') then
  raise exception 'An affiliate has already been paid commission for this registration, so it cannot be deleted.';
 end if;
 delete from pwd_lms_affiliate_commissions where order_id=o.id;
 -- Private (mentorship) lessons that exist only for this registration.
 select coalesce(array_agg(recording_path) filter (where recording_path<>''),'{}') into recordings from pwd_lms_lessons where order_id=o.id;
 delete from pwd_lms_progress where lesson_id in (select id from pwd_lms_lessons where order_id=o.id);
 delete from pwd_lms_lessons where order_id=o.id;
 -- This student's progress and quiz attempts in the course.
 delete from pwd_lms_progress where user_id=o.user_id and lesson_id in (select id from pwd_lms_lessons where course_id=o.course_id);
 delete from pwd_lms_quiz_attempts where user_id=o.user_id and lesson_id in (select id from pwd_lms_lessons where course_id=o.course_id);
 delete from pwd_lms_orders where id=o.id;
 return jsonb_build_object('user_id',o.user_id,'proofs',case when coalesce(o.proof_path,'')<>'' then jsonb_build_array(o.proof_path) else '[]'::jsonb end,'recordings',to_jsonb(recordings));
end $$;
-- Deletes a student account and everything linked to it. Refuses admins and instructors.
create or replace function public.pwd_lms_delete_student(p_user uuid) returns jsonb
language plpgsql security definer set search_path=public,auth as $$
declare u auth.users; r jsonb; proofs jsonb:='[]'; recordings jsonb:='[]'; aff uuid; avatar text; chat_files text[]; dm_files text[];
begin
 select * into u from auth.users where id=p_user for update;
 if u.id is null then raise exception 'Account not found'; end if;
 if exists(select 1 from admin_users where lower(email)=lower(u.email)) then
  raise exception 'This is an admin account and cannot be deleted here. Remove its registrations instead.';
 end if;
 if exists(select 1 from pwd_lms_course_instructors where user_id=p_user) then
  raise exception 'This person is an instructor. Remove them as an instructor first.';
 end if;
 select id into aff from pwd_lms_affiliates where user_id=p_user;
 if aff is not null and exists(select 1 from pwd_lms_affiliate_commissions where affiliate_id=aff and status='paid') then
  raise exception 'This person has been paid affiliate commission, so their account cannot be deleted.';
 end if;
 for r in select pwd_lms_delete_registration(id) from pwd_lms_orders where user_id=p_user loop
  proofs:=proofs||(r->'proofs'); recordings:=recordings||(r->'recordings');
 end loop;
 -- Affiliate history: their unpaid commissions go; referred orders simply lose the referral.
 if aff is not null then
  delete from pwd_lms_affiliate_commissions where affiliate_id=aff;
  update pwd_lms_orders set affiliate_id=null where affiliate_id=aff;
 end if;
 delete from pwd_lms_coupon_uses where user_id=p_user;
 delete from pwd_lms_progress where user_id=p_user;
 -- Keep other records intact if this account ever acted as staff.
 update pwd_lms_orders set granted_by=null where granted_by=p_user;
 update pwd_lms_channels set created_by=null where created_by=p_user;
 update pwd_lms_course_instructors set added_by=null where added_by=p_user;
 update pwd_lms_affiliates set reviewed_by=null where reviewed_by=p_user;
 update pwd_lms_affiliate_commissions set paid_by=null where paid_by=p_user;
 update pwd_lms_quiz_attempts set graded_by=null where graded_by=p_user;
 select nullif(avatar_path,'') into avatar from pwd_lms_profiles where user_id=p_user;
 select coalesce(array_agg(path),'{}') into chat_files from pwd_lms_chat_files where user_id=p_user;
 select coalesce(array_agg(f.path),'{}') into dm_files from pwd_lms_dm_files f join pwd_lms_dm_threads t on t.id=f.thread_id where t.user_a=p_user or t.user_b=p_user;
 -- Cascades remove the profile, messages, connections, notifications, coach data and affiliate record.
 delete from auth.users where id=p_user;
 return jsonb_build_object('email',u.email,'proofs',proofs,'recordings',recordings,
  'avatars',case when avatar is null then '[]'::jsonb else jsonb_build_array(avatar) end,
  'chat_files',to_jsonb(chat_files||dm_files));
end $$;
revoke all on function public.pwd_lms_delete_registration(uuid),public.pwd_lms_delete_student(uuid) from public,anon,authenticated;
grant execute on function public.pwd_lms_delete_registration(uuid),public.pwd_lms_delete_student(uuid) to service_role;
commit;
