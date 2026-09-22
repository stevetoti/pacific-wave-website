BEGIN;
-- Existing newsletter_subscribers belongs to the shared legacy schema.
-- Keep PWD subscriptions separate rather than altering existing subscriber rows.
CREATE TABLE IF NOT EXISTS public.pwd_newsletter_subscribers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), site_id text NOT NULL DEFAULT 'pwd',
 email text NOT NULL, consent_at timestamptz NOT NULL DEFAULT now(), UNIQUE(site_id,email)
);
ALTER TABLE public.pwd_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pwd_newsletter_subscribers FROM anon, authenticated;
GRANT ALL ON public.pwd_newsletter_subscribers TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
