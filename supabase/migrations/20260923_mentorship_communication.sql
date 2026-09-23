BEGIN;
ALTER TABLE public.pwd_lms_channels ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.pwd_lms_orders(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS pwd_lms_channels_order ON public.pwd_lms_channels(order_id) WHERE order_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.pwd_lms_mentorship_chat() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE room uuid;
BEGIN
 IF NEW.status IN ('paid','granted') AND EXISTS(SELECT 1 FROM pwd_lms_courses WHERE id=NEW.course_id AND private_sessions) THEN
  INSERT INTO pwd_lms_channels(course_id,name,description,private,is_default,order_id)
  VALUES(NEW.course_id,'Mentorship · ' || left(NEW.name,24) || ' · ' || NEW.id::text,'Your private conversation with the training team. Share questions, project updates and session plans here.',true,true,NEW.id)
  ON CONFLICT(order_id) WHERE order_id IS NOT NULL DO NOTHING;
  SELECT id INTO room FROM pwd_lms_channels WHERE order_id=NEW.id;
  INSERT INTO pwd_lms_channel_members(channel_id,user_id) VALUES(room,NEW.user_id) ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.pwd_lms_mentorship_chat() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pwd_lms_mentorship_chat() TO service_role;
DROP TRIGGER IF EXISTS pwd_lms_mentorship_chat ON public.pwd_lms_orders;
CREATE TRIGGER pwd_lms_mentorship_chat AFTER INSERT OR UPDATE OF status ON public.pwd_lms_orders FOR EACH ROW EXECUTE FUNCTION public.pwd_lms_mentorship_chat();
-- Backfill without updating orders or triggering payment/email workflows.
INSERT INTO public.pwd_lms_channels(course_id,name,description,private,is_default,order_id)
SELECT o.course_id,'Mentorship · ' || left(o.name,24) || ' · ' || o.id::text,'Your private conversation with the training team. Share questions, project updates and session plans here.',true,true,o.id
FROM public.pwd_lms_orders o JOIN public.pwd_lms_courses c ON c.id=o.course_id WHERE c.private_sessions AND o.status IN ('paid','granted')
ON CONFLICT(order_id) WHERE order_id IS NOT NULL DO NOTHING;
INSERT INTO public.pwd_lms_channel_members(channel_id,user_id)
SELECT ch.id,o.user_id FROM public.pwd_lms_channels ch JOIN public.pwd_lms_orders o ON o.id=ch.order_id ON CONFLICT DO NOTHING;
COMMIT;
