-- Rich course posts: video and audio attachments in course conversations. Additive.
-- Media goes to its own private bucket through one-time signed upload links (browsers cannot read or write it directly).
begin;
alter table public.pwd_lms_chat_files drop constraint if exists pwd_lms_chat_files_size_check;
alter table public.pwd_lms_chat_files add constraint pwd_lms_chat_files_size_check check(size between 1 and 209715200);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('pwd-community-media','pwd-community-media',false,209715200,
 array['video/mp4','video/webm','video/quicktime','audio/mpeg','audio/mp4','audio/x-m4a','audio/aac','audio/webm','audio/ogg','audio/wav'])
on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists pwd_community_media_deny_direct on storage.objects;
create policy pwd_community_media_deny_direct on storage.objects as restrictive for all to anon,authenticated
 using(bucket_id<>'pwd-community-media') with check(bucket_id<>'pwd-community-media');
commit;
