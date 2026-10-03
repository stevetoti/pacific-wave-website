-- Mini CRM: private staff notes live in the same per-student contact timeline. Additive.
begin;
alter table public.pwd_lms_contact_log drop constraint if exists pwd_lms_contact_log_channel_check;
alter table public.pwd_lms_contact_log add constraint pwd_lms_contact_log_channel_check check(channel in ('email','sms','whatsapp','note'));
alter table public.pwd_lms_contact_log drop constraint if exists pwd_lms_contact_log_status_check;
alter table public.pwd_lms_contact_log add constraint pwd_lms_contact_log_status_check check(status in ('sent','test_sent','failed','opened','skipped','saved'));
commit;
