BEGIN;
CREATE TABLE IF NOT EXISTS public.pwd_lms_courses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE NOT NULL,
 title text NOT NULL, description text NOT NULL DEFAULT '', introduction text NOT NULL DEFAULT '',
 kind text NOT NULL CHECK(kind IN ('live','recorded')), amount integer NOT NULL CHECK(amount>0),
 currency text NOT NULL DEFAULT 'VUV' CHECK(currency IN ('VUV','USD','AUD')),
 published boolean NOT NULL DEFAULT false, enrollment_open boolean NOT NULL DEFAULT true,
 cohort_id text REFERENCES public.pwd_training_cohorts(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.pwd_lms_lessons (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_id uuid NOT NULL REFERENCES public.pwd_lms_courses(id),
 title text NOT NULL, position integer NOT NULL DEFAULT 0, starts_at timestamptz,
 content text NOT NULL DEFAULT '', youtube_id text NOT NULL DEFAULT '', meeting_url text NOT NULL DEFAULT '',
 published boolean NOT NULL DEFAULT false, quiz jsonb NOT NULL DEFAULT '[]',
 CHECK(youtube_id='' OR youtube_id ~ '^[a-zA-Z0-9_-]{11}$')
);
CREATE INDEX IF NOT EXISTS pwd_lms_lessons_course ON public.pwd_lms_lessons(course_id,position);
CREATE TABLE IF NOT EXISTS public.pwd_lms_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id),
 course_id uuid NOT NULL REFERENCES public.pwd_lms_courses(id), email text NOT NULL, name text NOT NULL,
 phone text NOT NULL, attendance text NOT NULL DEFAULT 'online',
 amount integer NOT NULL CHECK(amount>0), currency text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','review','paid','rejected','refunded')),
 method text CHECK(method IN ('bank','stripe')), proof_path text, bank text,
 stripe_session text UNIQUE, checkout_lock_until timestamptz, reviewed_by uuid, review_note text NOT NULL DEFAULT '',
 acknowledged_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,course_id)
);
CREATE INDEX IF NOT EXISTS pwd_lms_orders_course ON public.pwd_lms_orders(course_id,status);
CREATE TABLE IF NOT EXISTS public.pwd_lms_progress (
 user_id uuid NOT NULL REFERENCES auth.users(id), lesson_id uuid NOT NULL REFERENCES public.pwd_lms_lessons(id),
 completed_at timestamptz NOT NULL DEFAULT now(), score integer CHECK(score BETWEEN 0 AND 100),
 PRIMARY KEY(user_id,lesson_id)
);
CREATE INDEX IF NOT EXISTS pwd_lms_progress_lesson ON public.pwd_lms_progress(lesson_id);
CREATE TABLE IF NOT EXISTS public.pwd_lms_settings (id text PRIMARY KEY, value jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS public.pwd_lms_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid, action text NOT NULL, target_id uuid,
 created_at timestamptz NOT NULL DEFAULT now()
);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['pwd_lms_courses','pwd_lms_lessons','pwd_lms_orders','pwd_lms_progress','pwd_lms_settings','pwd_lms_audit'] LOOP
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON public.%I FROM anon,authenticated',t);
 EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
 END LOOP;
END $$;
INSERT INTO public.pwd_lms_settings VALUES('banks','[]') ON CONFLICT DO NOTHING;
INSERT INTO public.pwd_lms_courses(slug,title,description,introduction,kind,amount,cohort_id,published)
VALUES('vanuatu-october-2026','Build Your Online Business in 30 Days','A practical October cohort for Vanuatu. 12 live sessions, 24 teaching hours, and a guided business launch.','Welcome to your October learning space. Bring a laptop, a business idea and your willingness to practise. Live classes run Mondays, Thursdays and Saturdays, 3–5 pm Vanuatu time, at Yumiwork Nambatu or online. Recordings will appear after each class. Your course includes three free months of Digi Assist AI Pro and one additional month of mentorship. Continued Pro use after the free period requires a paid subscription. No income or sales results are guaranteed.','live',35000,'vanuatu-2026-10',true) ON CONFLICT(slug) DO NOTHING;
INSERT INTO public.pwd_lms_lessons(course_id,title,position,starts_at)
SELECT c.id,'Live class '|| ordinality,ordinality,(d||'T15:00:00+11:00')::timestamptz
FROM public.pwd_lms_courses c, unnest(ARRAY['2026-10-05','2026-10-08','2026-10-10','2026-10-12','2026-10-15','2026-10-17','2026-10-19','2026-10-22','2026-10-24','2026-10-26','2026-10-29','2026-10-31']) WITH ORDINALITY AS dates(d,ordinality)
WHERE c.slug='vanuatu-october-2026' AND NOT EXISTS(SELECT 1 FROM public.pwd_lms_lessons l WHERE l.course_id=c.id);
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('pwd-training-proofs','pwd-training-proofs',false,3145728,ARRAY['image/jpeg','image/png','application/pdf']) ON CONFLICT(id) DO NOTHING;
CREATE OR REPLACE FUNCTION public.pwd_lms_lock_order(order_id uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 WITH claimed AS(UPDATE pwd_lms_orders SET checkout_lock_until=now()+interval '2 minutes' WHERE id=order_id AND (checkout_lock_until IS NULL OR checkout_lock_until<now()) RETURNING id) SELECT EXISTS(SELECT 1 FROM claimed);
$$;
REVOKE ALL ON FUNCTION public.pwd_lms_lock_order(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pwd_lms_lock_order(uuid) TO service_role;
CREATE TABLE IF NOT EXISTS public.pwd_lms_emails (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.pwd_lms_orders(id) ON DELETE CASCADE,
 status text NOT NULL, state text NOT NULL DEFAULT 'pending', locked_until timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pwd_lms_emails ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pwd_lms_emails FROM anon,authenticated;
GRANT ALL ON public.pwd_lms_emails TO service_role;
CREATE INDEX IF NOT EXISTS pwd_lms_emails_pending ON public.pwd_lms_emails(state,created_at);
CREATE OR REPLACE FUNCTION public.pwd_lms_queue_email() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF TG_OP='INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN INSERT INTO pwd_lms_emails(order_id,status) VALUES(NEW.id,NEW.status); END IF; RETURN NEW; END $$;
DROP TRIGGER IF EXISTS pwd_lms_order_email ON public.pwd_lms_orders;
CREATE TRIGGER pwd_lms_order_email AFTER INSERT OR UPDATE OF status ON public.pwd_lms_orders FOR EACH ROW EXECUTE FUNCTION public.pwd_lms_queue_email();
CREATE OR REPLACE FUNCTION public.pwd_lms_claim_emails() RETURNS SETOF public.pwd_lms_emails LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 UPDATE pwd_lms_emails SET locked_until=now()+interval '2 minutes' WHERE id IN(SELECT id FROM pwd_lms_emails WHERE state='pending' AND (locked_until IS NULL OR locked_until<now()) ORDER BY created_at LIMIT 10 FOR UPDATE SKIP LOCKED) RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.pwd_lms_queue_email(),public.pwd_lms_claim_emails() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pwd_lms_claim_emails() TO service_role;
COMMIT;
