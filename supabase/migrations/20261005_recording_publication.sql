BEGIN;
-- Keep existing published replays available; new editor explicitly saves drafts as false.
ALTER TABLE public.pwd_lms_lessons ADD COLUMN IF NOT EXISTS recordings_published boolean NOT NULL DEFAULT true;
COMMIT;
