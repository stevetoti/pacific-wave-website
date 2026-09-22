BEGIN;

-- Scope every policy to PWD rows. Other websites in this shared database retain
-- their current policies. Service-role APIs still enforce role/site in code.
CREATE OR REPLACE FUNCTION public.pwd_has_role(allowed_roles text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users a JOIN auth.users u ON lower(u.email) = lower(a.email)
    WHERE u.id = (SELECT auth.uid()) AND a.site_id = 'pacific-wave-digital'
      AND a.is_active = true AND a.role = ANY(allowed_roles)
  );
$$;
REVOKE ALL ON FUNCTION public.pwd_has_role(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pwd_has_role(text[]) TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.integration_secrets (
  site_id text NOT NULL, key text NOT NULL, value text NOT NULL,
  PRIMARY KEY (site_id, key)
);
ALTER TABLE public.integration_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.integration_secrets FROM anon, authenticated;
GRANT ALL ON public.integration_secrets TO service_role;

-- Copy existing PWD credentials before removing them from public settings.
INSERT INTO public.integration_secrets (site_id,key,value)
SELECT site_id,key,coalesce(value,'') FROM public.site_settings
WHERE site_id='pwd' AND key IN ('google_client_id','google_client_secret','google_refresh_token','google_access_token','google_token_expires_at')
ON CONFLICT (site_id,key) DO NOTHING;
DELETE FROM public.site_settings WHERE site_id='pwd'
AND key IN ('google_client_id','google_client_secret','google_refresh_token','google_access_token','google_token_expires_at');

CREATE TABLE IF NOT EXISTS public.oauth_states (
 state text PRIMARY KEY, site_id text NOT NULL, user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.oauth_states FROM anon, authenticated;
GRANT ALL ON public.oauth_states TO service_role;

ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS site_id text NOT NULL DEFAULT 'pwd';
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS notification_status text NOT NULL DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS public.pwd_newsletter_subscribers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), site_id text NOT NULL DEFAULT 'pwd',
 email text NOT NULL, consent_at timestamptz NOT NULL DEFAULT now(), UNIQUE(site_id,email)
);
ALTER TABLE public.pwd_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pwd_newsletter_subscribers FROM anon, authenticated;
GRANT ALL ON public.pwd_newsletter_subscribers TO service_role;

CREATE TABLE IF NOT EXISTS public.server_errors (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), site_id text NOT NULL DEFAULT 'pwd',
 route text NOT NULL, error_name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.server_errors ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.server_errors FROM anon, authenticated;
GRANT SELECT ON public.server_errors TO authenticated;
GRANT ALL ON public.server_errors TO service_role;
DROP POLICY IF EXISTS pwd_read_errors ON public.server_errors;
CREATE POLICY pwd_read_errors ON public.server_errors FOR SELECT TO authenticated
USING (site_id='pwd' AND public.pwd_has_role(ARRAY['super_admin','admin']));

CREATE TABLE IF NOT EXISTS public.pwd_request_limits (
 key text PRIMARY KEY, window_start timestamptz NOT NULL, requests integer NOT NULL
);
ALTER TABLE public.pwd_request_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pwd_request_limits FROM anon, authenticated;
GRANT ALL ON public.pwd_request_limits TO service_role;
CREATE OR REPLACE FUNCTION public.pwd_rate_limit(bucket_key text,max_requests integer,window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE current_count integer;
BEGIN
 IF max_requests < 1 OR max_requests > 1000 OR window_seconds < 1 OR window_seconds > 86400 THEN RETURN false; END IF;
 DELETE FROM public.pwd_request_limits WHERE window_start < now() - interval '1 day';
 INSERT INTO public.pwd_request_limits AS limits(key,window_start,requests)
 VALUES(bucket_key,now(),1)
 ON CONFLICT(key) DO UPDATE SET
   requests=CASE WHEN limits.window_start < now()-make_interval(secs=>window_seconds) THEN 1 ELSE limits.requests+1 END,
   window_start=CASE WHEN limits.window_start < now()-make_interval(secs=>window_seconds) THEN now() ELSE limits.window_start END
 RETURNING requests INTO current_count;
 RETURN current_count <= max_requests;
END;
$$;
REVOKE ALL ON FUNCTION public.pwd_rate_limit(text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pwd_rate_limit(text,integer,integer) TO service_role;

CREATE TABLE IF NOT EXISTS public.pwd_transcripts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), site_id text NOT NULL DEFAULT 'pwd', title text NOT NULL,
 client text NOT NULL DEFAULT '', type text NOT NULL CHECK(type IN ('call','meeting','notes')),
 date text NOT NULL, duration text NOT NULL DEFAULT '—', summary text NOT NULL DEFAULT '', content text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pwd_transcripts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pwd_transcripts FROM anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.pwd_transcripts TO authenticated,service_role;
DROP POLICY IF EXISTS pwd_transcripts_admin ON public.pwd_transcripts;
CREATE POLICY pwd_transcripts_admin ON public.pwd_transcripts FOR ALL TO authenticated
USING(site_id='pwd' AND public.pwd_has_role(ARRAY['super_admin','admin']))
WITH CHECK(site_id='pwd' AND public.pwd_has_role(ARRAY['super_admin','admin']));

-- Restrictive policies override legacy broad grants for PWD without deleting
-- policies belonging to the other applications using these tables.
DO $$
DECLARE t text; can_read text; can_write text; site text;
BEGIN
 FOREACH t IN ARRAY ARRAY['blog_posts','help_articles','help_searches','site_settings','project_submissions','admin_users',
 'seo_target_keywords','seo_rankings_history','seo_tasks','seo_memory','seo_content_opportunities','seo_competitors',
 'seo_gmb_profiles','seo_settings','seo_brand_mentions','seo_platform_targets','seo_llms_txt','seo_citability_analyses'] LOOP
  IF to_regclass('public.'||t) IS NULL THEN CONTINUE; END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t AND column_name='site_id') THEN
    RAISE EXCEPTION 'Missing site_id on %; review schema before hardening',t;
  END IF;
  site := CASE WHEN t='admin_users' THEN 'pacific-wave-digital' ELSE 'pwd' END;
  can_write := 'public.pwd_has_role(ARRAY[''super_admin'',''admin''])';
  can_read := can_write;
  IF t IN ('blog_posts','help_articles') THEN
    can_write := 'public.pwd_has_role(ARRAY[''super_admin'',''admin'',''editor''])';
    can_read := CASE WHEN t='blog_posts' THEN 'published = true' ELSE 'is_published = true' END
      || ' OR public.pwd_has_role(ARRAY[''super_admin'',''admin'',''editor'',''viewer''])';
  ELSIF t='site_settings' THEN
    can_read := 'key NOT IN (''google_client_id'',''google_client_secret'',''google_refresh_token'',''google_access_token'',''google_token_expires_at'')';
    can_write := can_write || ' AND ' || can_read;
  ELSIF t='admin_users' THEN
    can_write := 'public.pwd_has_role(ARRAY[''super_admin''])';
    can_read := can_write || ' OR lower(email)=lower((SELECT auth.jwt()->>''email''))';
  END IF;
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('DROP POLICY IF EXISTS pwd_read_guard ON public.%I',t);
  EXECUTE format('DROP POLICY IF EXISTS pwd_insert_guard ON public.%I',t);
  EXECUTE format('DROP POLICY IF EXISTS pwd_update_guard ON public.%I',t);
  EXECUTE format('DROP POLICY IF EXISTS pwd_delete_guard ON public.%I',t);
  EXECUTE format('DROP POLICY IF EXISTS pwd_read_allow ON public.%I',t);
  EXECUTE format('DROP POLICY IF EXISTS pwd_write_allow ON public.%I',t);
  EXECUTE format('CREATE POLICY pwd_read_guard ON public.%I AS RESTRICTIVE FOR SELECT TO anon,authenticated USING (site_id IS DISTINCT FROM %L OR (%s))',t,site,can_read);
  EXECUTE format('CREATE POLICY pwd_insert_guard ON public.%I AS RESTRICTIVE FOR INSERT TO anon,authenticated WITH CHECK (site_id IS DISTINCT FROM %L OR (%s))',t,site,can_write);
  EXECUTE format('CREATE POLICY pwd_update_guard ON public.%I AS RESTRICTIVE FOR UPDATE TO anon,authenticated USING (site_id IS DISTINCT FROM %L OR (%s)) WITH CHECK (site_id IS DISTINCT FROM %L OR (%s))',t,site,can_write,site,can_write);
  EXECUTE format('CREATE POLICY pwd_delete_guard ON public.%I AS RESTRICTIVE FOR DELETE TO anon,authenticated USING (site_id IS DISTINCT FROM %L OR (%s))',t,site,can_write);
  EXECUTE format('CREATE POLICY pwd_read_allow ON public.%I FOR SELECT TO anon,authenticated USING (site_id=%L AND (%s))',t,site,can_read);
  EXECUTE format('CREATE POLICY pwd_write_allow ON public.%I FOR ALL TO authenticated USING (site_id=%L AND (%s)) WITH CHECK (site_id=%L AND (%s))',t,site,can_write,site,can_write);
 END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
COMMIT;
