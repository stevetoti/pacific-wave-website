BEGIN;
CREATE TABLE IF NOT EXISTS public.pwd_owner_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_key text UNIQUE NOT NULL, subject text NOT NULL, body text NOT NULL,
 sandbox boolean NOT NULL DEFAULT true, state text NOT NULL DEFAULT 'pending', attempts integer NOT NULL DEFAULT 0,
 first_attempt_at timestamptz, lock_until timestamptz, provider_id text, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pwd_owner_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pwd_owner_notifications FROM anon,authenticated;
GRANT ALL ON public.pwd_owner_notifications TO service_role;
CREATE OR REPLACE FUNCTION public.pwd_claim_owner_notification(test_mode boolean)
RETURNS SETOF public.pwd_owner_notifications LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 UPDATE pwd_owner_notifications SET attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),lock_until=now()+interval '2 minutes'
 WHERE id=(SELECT id FROM pwd_owner_notifications WHERE sandbox=test_mode AND state='pending' AND (lock_until IS NULL OR lock_until<now()) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.pwd_claim_owner_notification(boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pwd_claim_owner_notification(boolean) TO service_role;
COMMIT;
