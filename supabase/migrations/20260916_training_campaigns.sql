BEGIN;
CREATE TABLE IF NOT EXISTS public.pwd_lms_campaigns (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, subject text NOT NULL, body text NOT NULL,
 button_text text NOT NULL DEFAULT 'Open training centre', button_url text NOT NULL,
 audience text NOT NULL CHECK(audience IN ('all','no_enrolment','unpaid','paid','not_in_course','leads')),
 course_id uuid REFERENCES public.pwd_lms_courses(id), status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','sending','completed','cancelled')),
 revision uuid NOT NULL DEFAULT gen_random_uuid(), prepared boolean NOT NULL DEFAULT false, sandbox boolean NOT NULL DEFAULT true,
 created_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.pwd_lms_campaign_recipients (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id uuid NOT NULL REFERENCES public.pwd_lms_campaigns(id) ON DELETE CASCADE,
 email text NOT NULL, name text NOT NULL DEFAULT '', state text NOT NULL DEFAULT 'pending', provider_id text,
 attempts int NOT NULL DEFAULT 0, first_attempt_at timestamptz, lock_until timestamptz, error text, updated_at timestamptz DEFAULT now(),
 unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(), UNIQUE(campaign_id,email), UNIQUE(unsubscribe_token)
);
CREATE INDEX IF NOT EXISTS pwd_campaign_pending ON public.pwd_lms_campaign_recipients(campaign_id,state);
CREATE TABLE IF NOT EXISTS public.pwd_lms_email_suppressions(email text PRIMARY KEY, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.pwd_lms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pwd_lms_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pwd_lms_email_suppressions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pwd_lms_campaigns,public.pwd_lms_campaign_recipients,public.pwd_lms_email_suppressions FROM anon,authenticated;
GRANT ALL ON public.pwd_lms_campaigns,public.pwd_lms_campaign_recipients,public.pwd_lms_email_suppressions TO service_role;
CREATE OR REPLACE FUNCTION public.pwd_campaign_audience(segment text, selected_course uuid)
RETURNS TABLE(email text,name text) LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 WITH contacts AS (
 SELECT lower(u.email) email, coalesce(nullif(p.full_name,''),(SELECT o.name FROM pwd_lms_orders o WHERE o.user_id=u.id ORDER BY o.created_at LIMIT 1),'Student') name
 FROM auth.users u LEFT JOIN pwd_lms_profiles p ON p.user_id=u.id
 WHERE u.email_confirmed_at IS NOT NULL AND (p.user_id IS NOT NULL OR EXISTS(SELECT 1 FROM pwd_lms_orders o WHERE o.user_id=u.id) OR EXISTS(SELECT 1 FROM pwd_lms_account_emails a WHERE lower(a.email)=lower(u.email)))
 ), eligible AS (
 SELECT c.email,c.name FROM contacts c WHERE segment <> 'leads' AND (
 segment='all' OR
 (segment='no_enrolment' AND NOT EXISTS(SELECT 1 FROM pwd_lms_orders o WHERE lower(o.email)=c.email)) OR
 (segment='not_in_course' AND selected_course IS NOT NULL AND NOT EXISTS(SELECT 1 FROM pwd_lms_orders o WHERE lower(o.email)=c.email AND o.course_id=selected_course)) OR
 (segment='unpaid' AND EXISTS(SELECT 1 FROM pwd_lms_orders o WHERE lower(o.email)=c.email AND o.status IN ('pending','review','rejected') AND (selected_course IS NULL OR o.course_id=selected_course))) OR
 (segment='paid' AND EXISTS(SELECT 1 FROM pwd_lms_orders o WHERE lower(o.email)=c.email AND o.status='paid' AND (selected_course IS NULL OR o.course_id=selected_course))))
 UNION ALL SELECT lower(r.email),r.full_name FROM pwd_training_registrations r WHERE segment='leads' AND r.future_training_opt_in=true
 ) SELECT DISTINCT ON (e.email) e.email,e.name FROM eligible e WHERE NOT EXISTS(SELECT 1 FROM pwd_lms_email_suppressions s WHERE s.email=e.email) ORDER BY e.email,e.name;
$$;
CREATE OR REPLACE FUNCTION public.pwd_save_campaign(input jsonb, actor uuid, test_mode boolean)
RETURNS public.pwd_lms_campaigns LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c pwd_lms_campaigns; cid uuid := coalesce((input->>'id')::uuid,gen_random_uuid());
BEGIN
 SELECT * INTO c FROM pwd_lms_campaigns WHERE id=cid FOR UPDATE;
 IF FOUND AND (c.status<>'draft' OR c.revision::text IS DISTINCT FROM input->>'revision') THEN RAISE EXCEPTION 'Draft changed; reload before saving'; END IF;
 INSERT INTO pwd_lms_campaigns(id,name,subject,body,button_text,button_url,audience,course_id,created_by,sandbox)
 VALUES(cid,input->>'name',input->>'subject',input->>'body',input->>'button_text',input->>'button_url',input->>'audience',nullif(input->>'course_id','')::uuid,actor,test_mode)
 ON CONFLICT(id) DO UPDATE SET name=excluded.name,subject=excluded.subject,body=excluded.body,button_text=excluded.button_text,button_url=excluded.button_url,audience=excluded.audience,course_id=excluded.course_id,revision=gen_random_uuid(),prepared=false,updated_at=now();
 DELETE FROM pwd_lms_campaign_recipients WHERE campaign_id=cid;
 SELECT * INTO c FROM pwd_lms_campaigns WHERE id=cid; RETURN c;
END $$;
CREATE OR REPLACE FUNCTION public.pwd_prepare_campaign(cid uuid, expected uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c pwd_lms_campaigns; n integer;
BEGIN
 SELECT * INTO c FROM pwd_lms_campaigns WHERE id=cid FOR UPDATE;
 IF NOT FOUND OR c.status<>'draft' OR c.revision<>expected THEN RAISE EXCEPTION 'Draft changed'; END IF;
 DELETE FROM pwd_lms_campaign_recipients WHERE campaign_id=cid;
 INSERT INTO pwd_lms_campaign_recipients(campaign_id,email,name) SELECT cid,a.email,a.name FROM pwd_campaign_audience(c.audience,c.course_id) a;
 GET DIAGNOSTICS n=ROW_COUNT; UPDATE pwd_lms_campaigns SET prepared=true WHERE id=cid; RETURN n;
END $$;
CREATE OR REPLACE FUNCTION public.pwd_claim_campaign_recipient(test_mode boolean)
RETURNS SETOF public.pwd_lms_campaign_recipients LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE rid uuid;
BEGIN
 SELECT r.id INTO rid FROM pwd_lms_campaign_recipients r JOIN pwd_lms_campaigns c ON c.id=r.campaign_id
 WHERE c.status='sending' AND c.sandbox=test_mode AND r.state IN ('pending','sending') AND (r.lock_until IS NULL OR r.lock_until<now())
 ORDER BY r.updated_at FOR UPDATE OF r SKIP LOCKED LIMIT 1;
 IF rid IS NOT NULL THEN RETURN QUERY UPDATE pwd_lms_campaign_recipients SET state='sending',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),lock_until=now()+interval '2 minutes',updated_at=now() WHERE id=rid RETURNING *; END IF;
END $$;
REVOKE ALL ON FUNCTION public.pwd_campaign_audience(text,uuid),public.pwd_save_campaign(jsonb,uuid,boolean),public.pwd_prepare_campaign(uuid,uuid),public.pwd_claim_campaign_recipient(boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pwd_campaign_audience(text,uuid),public.pwd_save_campaign(jsonb,uuid,boolean),public.pwd_prepare_campaign(uuid,uuid),public.pwd_claim_campaign_recipient(boolean) TO service_role;
COMMIT;
