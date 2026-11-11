alter table public.pwd_lms_course_instructors
  add column if not exists can_follow_up_unpaid boolean not null default false;

comment on column public.pwd_lms_course_instructors.can_follow_up_unpaid is
  'Allows this instructor to see pending and rejected registrations and follow up by email or SMS for this course.';
