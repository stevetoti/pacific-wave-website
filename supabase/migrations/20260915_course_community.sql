BEGIN;
CREATE TABLE IF NOT EXISTS public.pwd_lms_channels (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_id uuid NOT NULL REFERENCES public.pwd_lms_courses(id),
 name text NOT NULL CHECK(length(name) BETWEEN 2 AND 80), description text NOT NULL DEFAULT '',
 private boolean NOT NULL DEFAULT false, announcements boolean NOT NULL DEFAULT false,
 is_default boolean NOT NULL DEFAULT false, created_by uuid REFERENCES auth.users(id), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(course_id,name)
);
CREATE TABLE IF NOT EXISTS public.pwd_lms_channel_members (
 channel_id uuid NOT NULL REFERENCES public.pwd_lms_channels(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, PRIMARY KEY(channel_id,user_id)
);
CREATE TABLE IF NOT EXISTS public.pwd_lms_messages (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, channel_id uuid NOT NULL REFERENCES public.pwd_lms_channels(id) ON DELETE CASCADE,
 user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, author_name text NOT NULL, instructor boolean NOT NULL DEFAULT false,
 body text NOT NULL CHECK(length(body) BETWEEN 1 AND 2000), deleted boolean NOT NULL DEFAULT false,
 client_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,client_id)
);
CREATE INDEX IF NOT EXISTS pwd_lms_channels_course ON public.pwd_lms_channels(course_id);
CREATE INDEX IF NOT EXISTS pwd_lms_members_user ON public.pwd_lms_channel_members(user_id,channel_id);
CREATE INDEX IF NOT EXISTS pwd_lms_messages_channel ON public.pwd_lms_messages(channel_id,id DESC);
CREATE TABLE IF NOT EXISTS public.pwd_lms_account_emails (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL, purpose text NOT NULL,
 provider_id text, state text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pwd_lms_account_emails_created ON public.pwd_lms_account_emails(created_at DESC);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['pwd_lms_channels','pwd_lms_channel_members','pwd_lms_messages','pwd_lms_account_emails'] LOOP
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON public.%I FROM anon,authenticated',t);
 EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
 END LOOP;
END $$;
GRANT USAGE,SELECT ON SEQUENCE public.pwd_lms_messages_id_seq TO service_role;
INSERT INTO public.pwd_lms_channels(course_id,name,description,is_default)
SELECT id,'Course lounge','Meet your classmates, share progress and ask your instructor questions.',true FROM public.pwd_lms_courses WHERE NOT private_sessions
ON CONFLICT(course_id,name) DO NOTHING;
INSERT INTO public.pwd_lms_channels(course_id,name,description,is_default,announcements)
SELECT id,'Instructor announcements','Course updates and important notices from your instructors.',true,true FROM public.pwd_lms_courses WHERE NOT private_sessions
ON CONFLICT(course_id,name) DO NOTHING;
CREATE OR REPLACE FUNCTION public.pwd_lms_create_community() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NOT NEW.private_sessions THEN
 INSERT INTO pwd_lms_channels(course_id,name,description,is_default,announcements) VALUES
 (NEW.id,'Course lounge','Meet your classmates, share progress and ask your instructor questions.',true,false),
 (NEW.id,'Instructor announcements','Course updates and important notices from your instructors.',true,true)
 ON CONFLICT(course_id,name) DO NOTHING;
 END IF; RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS pwd_lms_create_community ON public.pwd_lms_courses;
CREATE TRIGGER pwd_lms_create_community AFTER INSERT ON public.pwd_lms_courses FOR EACH ROW EXECUTE FUNCTION public.pwd_lms_create_community();
CREATE OR REPLACE FUNCTION public.pwd_lms_set_group_members(group_id uuid,member_ids uuid[]) RETURNS void LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 DELETE FROM pwd_lms_channel_members WHERE channel_id=group_id;
 INSERT INTO pwd_lms_channel_members(channel_id,user_id) SELECT group_id,unnest(member_ids) ON CONFLICT DO NOTHING;
END $$;
REVOKE ALL ON FUNCTION public.pwd_lms_set_group_members(uuid,uuid[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pwd_lms_set_group_members(uuid,uuid[]) TO service_role;
COMMIT;
