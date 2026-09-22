BEGIN;
ALTER TABLE public.pwd_lms_lessons ADD COLUMN IF NOT EXISTS thumbnail_path text NOT NULL DEFAULT '';
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('pwd-lesson-thumbnails','pwd-lesson-thumbnails',false,3145728,ARRAY['image/webp']) ON CONFLICT(id) DO NOTHING;
COMMIT;
