begin;
alter table public.pwd_lms_lessons add column if not exists zoom_recording_url text not null default '';
alter table public.pwd_lms_lessons add column if not exists zoom_recording_passcode text not null default '';
alter table public.pwd_lms_lessons add constraint pwd_lms_zoom_recording_length check(length(zoom_recording_url)<=2048 and length(zoom_recording_passcode)<=100);
alter table public.pwd_lms_lessons add constraint pwd_lms_zoom_recording_passcode_link check(zoom_recording_url<>'' or zoom_recording_passcode='');
create or replace function public.pwd_lms_guard_zoom_recording() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if new.zoom_recording_url<>'' then
  if new.zoom_recording_url !~ '^https://([a-z0-9-]+\.)?zoom\.us/rec/(share|play)/[A-Za-z0-9_.~-]+/?(\?[^[:space:]]*)?$' then raise exception 'Use a Zoom cloud recording share or play link'; end if;
  if exists(select 1 from pwd_lms_courses where id=new.course_id and private_sessions) then raise exception 'Mentorship requires private recording storage'; end if;
 end if;
 return new;
end $$;
create trigger pwd_lms_zoom_recording_guard before insert or update on public.pwd_lms_lessons for each row execute function public.pwd_lms_guard_zoom_recording();
commit;
