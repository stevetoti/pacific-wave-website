BEGIN;
CREATE TABLE IF NOT EXISTS public.pwd_training_cohorts (id text PRIMARY KEY, config jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS public.pwd_training_registrations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference uuid NOT NULL UNIQUE,
 cohort_id text NOT NULL REFERENCES public.pwd_training_cohorts(id), cohort_snapshot jsonb NOT NULL,
 full_name text NOT NULL CHECK(length(full_name) BETWEEN 2 AND 120), email text NOT NULL, email_normalized text NOT NULL,
 phone_raw text NOT NULL, phone_normalized text NOT NULL, location_code text NOT NULL, location_other text NOT NULL DEFAULT '', area_optional text NOT NULL DEFAULT '',
 attendance_preference text NOT NULL CHECK(attendance_preference IN ('in_person','online','mixed')),
 business_direction text NOT NULL DEFAULT '', question text NOT NULL DEFAULT '' CHECK(length(question)<=500),
 acknowledged_at timestamptz NOT NULL DEFAULT now(), privacy_version text NOT NULL,
 future_training_opt_in boolean NOT NULL DEFAULT false, future_training_opt_in_at timestamptz,
 currency text NOT NULL CHECK(currency='VUV'), fee integer NOT NULL CHECK(fee>=0),
 status text NOT NULL DEFAULT 'received' CHECK(status IN ('received','contacted','payment_pending','enrolled','cancelled')),
 private_notes text NOT NULL DEFAULT '' CHECK(length(private_notes)<=2000),
 student_email_state text NOT NULL DEFAULT 'pending' CHECK(student_email_state IN ('pending','accepted','test_accepted')),
 internal_email_state text NOT NULL DEFAULT 'pending' CHECK(internal_email_state IN ('pending','accepted','test_accepted')),
 email_attempts integer NOT NULL DEFAULT 0, email_last_attempt_at timestamptz, email_lock_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(cohort_id,email_normalized)
);
CREATE TABLE IF NOT EXISTS public.pwd_training_receipts (
 reference uuid PRIMARY KEY, registration_id uuid NOT NULL REFERENCES public.pwd_training_registrations(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pwd_training_filter_idx ON public.pwd_training_registrations(cohort_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS pwd_training_location_idx ON public.pwd_training_registrations(cohort_id,location_code,attendance_preference);
CREATE INDEX IF NOT EXISTS pwd_training_receipt_registration_idx ON public.pwd_training_receipts(registration_id);
ALTER TABLE public.pwd_training_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pwd_training_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pwd_training_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pwd_training_cohorts, public.pwd_training_registrations, public.pwd_training_receipts FROM anon,authenticated;
GRANT ALL ON public.pwd_training_cohorts, public.pwd_training_registrations, public.pwd_training_receipts TO service_role;
-- All admin access goes through existing server-side active/site/role checks.
CREATE OR REPLACE FUNCTION public.pwd_register_training(input jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c jsonb; rid uuid; inserted boolean; receipt uuid := (input->>'request_id')::uuid;
BEGIN
 SELECT config INTO c FROM public.pwd_training_cohorts WHERE id=input->>'cohort_id' FOR SHARE;
 IF c IS NULL OR c->>'registrationState'<>'open' OR now()>(c->>'teachingEnd')::timestamptz THEN
  RETURN jsonb_build_object('closed',true);
 END IF;
 -- A retry has the same receipt. Never overwrite an existing registration.
 SELECT registration_id INTO rid FROM public.pwd_training_receipts WHERE reference=receipt;
 IF rid IS NOT NULL THEN RETURN jsonb_build_object('id',rid,'created',false); END IF;
 INSERT INTO public.pwd_training_registrations(reference,cohort_id,cohort_snapshot,full_name,email,email_normalized,phone_raw,phone_normalized,location_code,location_other,area_optional,attendance_preference,business_direction,question,privacy_version,future_training_opt_in,future_training_opt_in_at,currency,fee)
 VALUES(receipt,input->>'cohort_id',c,input->>'full_name',input->>'email',lower(input->>'email'),input->>'phone',input->>'phone_normalized',input->>'location_code',input->>'location_other',input->>'area_optional',input->>'attendance_preference',input->>'business_direction',input->>'question',c->>'privacyVersion',(input->>'future_training_opt_in')::boolean,CASE WHEN (input->>'future_training_opt_in')::boolean THEN now() ELSE NULL END,c->>'currency',(c->>'fee')::integer)
 ON CONFLICT DO NOTHING RETURNING id INTO rid;
 inserted := rid IS NOT NULL;
 IF rid IS NULL THEN SELECT id INTO rid FROM public.pwd_training_registrations WHERE cohort_id=input->>'cohort_id' AND email_normalized=lower(input->>'email'); END IF;
 IF rid IS NULL THEN RAISE EXCEPTION 'Receipt conflict'; END IF;
 INSERT INTO public.pwd_training_receipts(reference,registration_id) VALUES(receipt,rid) ON CONFLICT DO NOTHING;
 RETURN jsonb_build_object('id',rid,'created',inserted);
END $$;
REVOKE ALL ON FUNCTION public.pwd_register_training(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pwd_register_training(jsonb) TO service_role;
CREATE OR REPLACE FUNCTION public.pwd_claim_training_email(registration_id uuid)
RETURNS SETOF public.pwd_training_registrations LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 UPDATE public.pwd_training_registrations SET email_lock_until=now()+interval '2 minutes',email_attempts=email_attempts+1,email_last_attempt_at=now()
 WHERE id=registration_id AND (email_lock_until IS NULL OR email_lock_until<now())
 AND (student_email_state NOT IN ('accepted','test_accepted') OR internal_email_state NOT IN ('accepted','test_accepted')) RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.pwd_claim_training_email(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pwd_claim_training_email(uuid) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
