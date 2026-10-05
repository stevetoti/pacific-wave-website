BEGIN;
ALTER TABLE public.pwd_lms_lessons ADD COLUMN IF NOT EXISTS youtube_ids text[] NOT NULL DEFAULT '{}';
-- Preserve the legacy first-video field for older clients; new clients explicitly send the list.
CREATE OR REPLACE FUNCTION public.pwd_lms_sync_youtube_recordings() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW.youtube_ids IS NOT DISTINCT FROM OLD.youtube_ids AND NEW.youtube_id IS DISTINCT FROM OLD.youtube_id THEN
   NEW.youtube_ids := CASE WHEN NEW.youtube_id='' THEN '{}'::text[] ELSE ARRAY[NEW.youtube_id] || COALESCE(OLD.youtube_ids[2:20], '{}'::text[]) END;
  END IF;
 ELSIF cardinality(NEW.youtube_ids)=0 AND NEW.youtube_id<>'' THEN
  NEW.youtube_ids := ARRAY[NEW.youtube_id];
 END IF;
 IF cardinality(NEW.youtube_ids)>20 OR EXISTS(SELECT 1 FROM unnest(NEW.youtube_ids) v WHERE v IS NULL OR v !~ '^[A-Za-z0-9_-]{11}$') THEN
  RAISE EXCEPTION 'Use up to 20 valid YouTube video IDs';
 END IF;
 NEW.youtube_id := COALESCE(NEW.youtube_ids[1], '');
 IF cardinality(NEW.youtube_ids)>0 AND EXISTS(SELECT 1 FROM pwd_lms_courses WHERE id=NEW.course_id AND private_sessions) THEN
  RAISE EXCEPTION 'Mentorship recordings must use private storage';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS pwd_lms_a_youtube_recordings ON public.pwd_lms_lessons;
CREATE TRIGGER pwd_lms_a_youtube_recordings BEFORE INSERT OR UPDATE ON public.pwd_lms_lessons FOR EACH ROW EXECUTE FUNCTION public.pwd_lms_sync_youtube_recordings();
UPDATE public.pwd_lms_lessons SET youtube_ids=ARRAY[youtube_id] WHERE youtube_id<>'' AND cardinality(youtube_ids)=0;
COMMIT;
