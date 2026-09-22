BEGIN;
ALTER TABLE public.pwd_lms_courses ADD COLUMN IF NOT EXISTS private_sessions boolean NOT NULL DEFAULT false;
ALTER TABLE public.pwd_lms_lessons ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.pwd_lms_orders(id);
ALTER TABLE public.pwd_lms_lessons ADD COLUMN IF NOT EXISTS recording_path text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS pwd_lms_lessons_order ON public.pwd_lms_lessons(order_id) WHERE order_id IS NOT NULL;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('pwd-mentorship-recordings','pwd-mentorship-recordings',false,524288000,ARRAY['video/mp4','video/webm']) ON CONFLICT(id) DO NOTHING;
-- Restrictive policies also deny unrelated permissive policies on this shared project's storage.
DROP POLICY IF EXISTS pwd_mentorship_deny_direct ON storage.objects;
CREATE POLICY pwd_mentorship_deny_direct ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated USING (bucket_id <> 'pwd-mentorship-recordings') WITH CHECK (bucket_id <> 'pwd-mentorship-recordings');
-- Only the assigned enrolment can receive a private session. Keep cross-course assignments invalid.
CREATE OR REPLACE FUNCTION public.pwd_lms_validate_private_lesson() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.order_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM pwd_lms_orders WHERE id=NEW.order_id AND course_id=NEW.course_id) THEN RAISE EXCEPTION 'Session enrolment must match course'; END IF;
 IF EXISTS(SELECT 1 FROM pwd_lms_courses WHERE id=NEW.course_id AND private_sessions) AND (NEW.order_id IS NULL OR NEW.youtube_id<>'') THEN RAISE EXCEPTION 'Mentorship requires an assigned student and private recording storage'; END IF;
 IF NEW.recording_path<>'' AND (NEW.order_id IS NULL OR NEW.recording_path NOT LIKE NEW.order_id::text || '/%') THEN RAISE EXCEPTION 'Recording must belong to assigned enrolment'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS pwd_lms_private_lesson_guard ON public.pwd_lms_lessons;
CREATE TRIGGER pwd_lms_private_lesson_guard BEFORE INSERT OR UPDATE ON public.pwd_lms_lessons FOR EACH ROW EXECUTE FUNCTION public.pwd_lms_validate_private_lesson();
INSERT INTO public.pwd_lms_courses(slug,title,description,introduction,kind,amount,currency,published,enrollment_open,private_sessions)
VALUES
('how-to-start-a-profitable-business','How To Start A Profitable Business','A practical guide to finding your business idea, understanding customers and building a launch plan with AI. Coming soon.','Learn how to research an opportunity, shape a clear offer, price your work and prepare your business for launch. The course is being prepared; dates, format and pricing will be announced before enrolment opens.','recorded',1,'VUV',true,false,false),
('one-on-one-mentorship','One on One Mentorship Program','Three months of personal guidance to build your business with AI, websites, ecommerce, WordPress and AI-assisted software development.','Welcome to your personal mentorship. After payment confirmation, contact the training team to arrange your start date and session times. Together we will build a learning plan around your business idea and experience. Your mentor will add your individual sessions, project notes and private recordings here. Replay your sessions after training as you continue practising. The VUV 25,000 fee covers all three months of mentorship; third-party tools, domains and hosting are separate.','live',25000,'VUV',true,true,true)
ON CONFLICT(slug) DO NOTHING;
CREATE OR REPLACE FUNCTION public.pwd_lms_mentorship_journey() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM pwd_lms_courses WHERE id=NEW.course_id AND private_sessions) THEN
  INSERT INTO pwd_lms_lessons(course_id,order_id,title,position,content)
  SELECT NEW.course_id,NEW.id,title,position,'Your mentor will arrange your sessions and publish notes and recordings here.' FROM (VALUES (1,'Month 1 · Business foundations & AI'),(2,'Month 2 · Websites, WordPress & ecommerce'),(3,'Month 3 · AI coding, software & launch')) AS roadmap(position,title);
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS pwd_lms_mentorship_journey ON public.pwd_lms_orders;
CREATE TRIGGER pwd_lms_mentorship_journey AFTER INSERT ON public.pwd_lms_orders FOR EACH ROW EXECUTE FUNCTION public.pwd_lms_mentorship_journey();
INSERT INTO public.pwd_lms_lessons(course_id,order_id,title,position)
SELECT o.course_id,o.id,r.title,r.position FROM public.pwd_lms_orders o JOIN public.pwd_lms_courses c ON c.id=o.course_id CROSS JOIN (VALUES (1,'Month 1 · Business foundations & AI'),(2,'Month 2 · Websites, WordPress & ecommerce'),(3,'Month 3 · AI coding, software & launch')) AS r(position,title)
WHERE c.private_sessions AND NOT EXISTS(SELECT 1 FROM public.pwd_lms_lessons l WHERE l.order_id=o.id);
COMMIT;
