BEGIN;
ALTER TABLE public.pwd_lms_channels ADD COLUMN IF NOT EXISTS locked boolean NOT NULL DEFAULT false;
ALTER TABLE public.pwd_lms_channels ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.pwd_lms_messages ADD COLUMN IF NOT EXISTS reply_to bigint REFERENCES public.pwd_lms_messages(id) ON DELETE SET NULL;
ALTER TABLE public.pwd_lms_messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;
ALTER TABLE public.pwd_lms_messages ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;
ALTER TABLE public.pwd_lms_messages ADD COLUMN IF NOT EXISTS search_document tsvector GENERATED ALWAYS AS (to_tsvector('simple',body)) STORED;
CREATE INDEX IF NOT EXISTS pwd_chat_search ON public.pwd_lms_messages USING gin(search_document);
CREATE INDEX IF NOT EXISTS pwd_chat_replies ON public.pwd_lms_messages(channel_id,reply_to,id);
CREATE INDEX IF NOT EXISTS pwd_chat_pins ON public.pwd_lms_messages(channel_id,id DESC) WHERE pinned AND NOT deleted;
CREATE TABLE IF NOT EXISTS public.pwd_lms_chat_mentions (
 message_id bigint NOT NULL REFERENCES public.pwd_lms_messages(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, PRIMARY KEY(message_id,user_id)
);
CREATE INDEX IF NOT EXISTS pwd_chat_mentions_user ON public.pwd_lms_chat_mentions(user_id,message_id);
CREATE TABLE IF NOT EXISTS public.pwd_lms_chat_reactions (
 message_id bigint NOT NULL REFERENCES public.pwd_lms_messages(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 emoji text NOT NULL CHECK(emoji IN ('like','love','celebrate','idea','question')),
 PRIMARY KEY(message_id,user_id,emoji)
);
CREATE TABLE IF NOT EXISTS public.pwd_lms_chat_reads (
 channel_id uuid NOT NULL REFERENCES public.pwd_lms_channels(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 last_read_id bigint NOT NULL DEFAULT 0 CHECK(last_read_id>=0), PRIMARY KEY(channel_id,user_id)
);
CREATE TABLE IF NOT EXISTS public.pwd_lms_chat_files (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), channel_id uuid NOT NULL REFERENCES public.pwd_lms_channels(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 message_id bigint REFERENCES public.pwd_lms_messages(id) ON DELETE CASCADE,
 path text NOT NULL UNIQUE, name text NOT NULL, mime text NOT NULL, size integer NOT NULL CHECK(size BETWEEN 1 AND 10485760),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pwd_chat_files_message ON public.pwd_lms_chat_files(message_id);
CREATE TABLE IF NOT EXISTS public.pwd_lms_chat_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), message_id bigint NOT NULL REFERENCES public.pwd_lms_messages(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 reason text NOT NULL CHECK(length(reason) BETWEEN 5 AND 500), created_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz,
 UNIQUE(message_id,user_id)
);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['pwd_lms_chat_mentions','pwd_lms_chat_reactions','pwd_lms_chat_reads','pwd_lms_chat_files','pwd_lms_chat_reports'] LOOP
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON public.%I FROM anon,authenticated',t);
 EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
 END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.pwd_lms_chat_people(p_course uuid,p_channel uuid DEFAULT NULL)
RETURNS TABLE(user_id uuid,name text,instructor boolean) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT o.user_id,o.name,false FROM pwd_lms_orders o WHERE o.course_id=p_course AND o.status IN ('paid','granted')
 AND (p_channel IS NULL OR EXISTS(SELECT 1 FROM pwd_lms_channels c WHERE c.id=p_channel AND c.course_id=p_course AND (NOT c.private OR EXISTS(SELECT 1 FROM pwd_lms_channel_members cm WHERE cm.channel_id=c.id AND cm.user_id=o.user_id))))
 AND NOT EXISTS(SELECT 1 FROM admin_users a JOIN auth.users u ON lower(u.email)=lower(a.email) WHERE u.id=o.user_id AND a.site_id='pacific-wave-digital' AND a.is_active AND a.role IN ('admin','super_admin'))
 UNION ALL
 SELECT u.id,coalesce(nullif(a.name,''),'Instructor'),true FROM admin_users a JOIN auth.users u ON lower(u.email)=lower(a.email)
 WHERE a.site_id='pacific-wave-digital' AND a.is_active AND a.role IN ('admin','super_admin');
$$;
CREATE OR REPLACE FUNCTION public.pwd_lms_chat_counts(p_user uuid,p_channels uuid[])
RETURNS TABLE(channel_id uuid,unread bigint,mentions bigint) LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT c.id,count(m.id),count(t.message_id) FROM pwd_lms_channels c
 LEFT JOIN pwd_lms_chat_reads r ON r.channel_id=c.id AND r.user_id=p_user
 LEFT JOIN pwd_lms_messages m ON m.channel_id=c.id AND m.id>coalesce(r.last_read_id,0) AND NOT m.deleted AND m.user_id IS DISTINCT FROM p_user
 LEFT JOIN pwd_lms_chat_mentions t ON t.message_id=m.id AND t.user_id=p_user
 WHERE c.id=ANY(p_channels) GROUP BY c.id;
$$;
CREATE OR REPLACE FUNCTION public.pwd_lms_chat_read(p_user uuid,p_channel uuid,p_message bigint)
RETURNS void LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pwd_lms_messages WHERE id=p_message AND channel_id=p_channel) THEN RAISE EXCEPTION 'Message not in channel'; END IF;
 INSERT INTO pwd_lms_chat_reads(channel_id,user_id,last_read_id) VALUES(p_channel,p_user,p_message)
 ON CONFLICT(channel_id,user_id) DO UPDATE SET last_read_id=greatest(pwd_lms_chat_reads.last_read_id,EXCLUDED.last_read_id);
END $$;
CREATE OR REPLACE FUNCTION public.pwd_lms_chat_send(p_channel uuid,p_user uuid,p_name text,p_instructor boolean,p_body text,p_client uuid,p_reply bigint,p_mentions uuid[],p_files uuid[])
RETURNS bigint LANGUAGE plpgsql SET search_path=public AS $$ DECLARE mid bigint; BEGIN
 IF p_reply IS NOT NULL AND NOT EXISTS(SELECT 1 FROM pwd_lms_messages WHERE id=p_reply AND channel_id=p_channel AND NOT deleted) THEN RAISE EXCEPTION 'Invalid reply'; END IF;
 INSERT INTO pwd_lms_messages(channel_id,user_id,author_name,instructor,body,client_id,reply_to)
 VALUES(p_channel,p_user,p_name,p_instructor,p_body,p_client,p_reply) ON CONFLICT(user_id,client_id) DO NOTHING RETURNING id INTO mid;
 IF mid IS NULL THEN SELECT id INTO mid FROM pwd_lms_messages WHERE user_id=p_user AND client_id=p_client AND channel_id=p_channel; IF mid IS NULL THEN RAISE EXCEPTION 'Message retry channel mismatch'; END IF; RETURN mid; END IF;
 PERFORM id FROM pwd_lms_chat_files WHERE id=ANY(p_files) FOR UPDATE;
 IF (SELECT count(*) FROM pwd_lms_chat_files WHERE id=ANY(p_files) AND channel_id=p_channel AND user_id=p_user AND message_id IS NULL) <> cardinality(p_files) THEN RAISE EXCEPTION 'Invalid attachments'; END IF;
 UPDATE pwd_lms_chat_files SET message_id=mid WHERE id=ANY(p_files);
 INSERT INTO pwd_lms_chat_mentions(message_id,user_id) SELECT mid,unnest(p_mentions) ON CONFLICT DO NOTHING;
 RETURN mid;
END $$;
CREATE OR REPLACE FUNCTION public.pwd_lms_chat_edit(p_message bigint,p_channel uuid,p_user uuid,p_body text,p_mentions uuid[])
RETURNS void LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 UPDATE pwd_lms_messages SET body=p_body,edited_at=now() WHERE id=p_message AND channel_id=p_channel AND user_id=p_user AND NOT deleted;
 IF NOT FOUND THEN RAISE EXCEPTION 'Only the author can edit a message'; END IF;
 DELETE FROM pwd_lms_chat_mentions WHERE message_id=p_message;
 INSERT INTO pwd_lms_chat_mentions(message_id,user_id) SELECT p_message,unnest(p_mentions) ON CONFLICT DO NOTHING;
END $$;
REVOKE ALL ON FUNCTION public.pwd_lms_chat_people(uuid,uuid),public.pwd_lms_chat_counts(uuid,uuid[]),public.pwd_lms_chat_read(uuid,uuid,bigint),public.pwd_lms_chat_send(uuid,uuid,text,boolean,text,uuid,bigint,uuid[],uuid[]),public.pwd_lms_chat_edit(bigint,uuid,uuid,text,uuid[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pwd_lms_chat_people(uuid,uuid),public.pwd_lms_chat_counts(uuid,uuid[]),public.pwd_lms_chat_read(uuid,uuid,bigint),public.pwd_lms_chat_send(uuid,uuid,text,boolean,text,uuid,bigint,uuid[],uuid[]),public.pwd_lms_chat_edit(bigint,uuid,uuid,text,uuid[]) TO service_role;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('pwd-community-files','pwd-community-files',false,10485760,ARRAY['image/webp','application/pdf','text/plain']) ON CONFLICT(id) DO NOTHING;
DROP POLICY IF EXISTS pwd_community_files_deny_direct ON storage.objects;
CREATE POLICY pwd_community_files_deny_direct ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated USING(bucket_id <> 'pwd-community-files') WITH CHECK(bucket_id <> 'pwd-community-files');
COMMIT;
