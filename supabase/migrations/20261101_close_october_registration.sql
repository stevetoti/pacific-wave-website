-- Preserve existing enrolments, lesson access and published history.
begin;
update public.pwd_lms_courses set enrollment_open = false
where slug = 'vanuatu-october-2026';
update public.pwd_training_cohorts
set config = jsonb_set(config, '{registrationState}', '"closed"'::jsonb)
where id = 'vanuatu-2026-10';
commit;
