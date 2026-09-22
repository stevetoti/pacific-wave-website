BEGIN;
CREATE TABLE IF NOT EXISTS public.pwd_lms_profiles (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 full_name text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', city text NOT NULL DEFAULT '', country text NOT NULL DEFAULT '',
 occupation text NOT NULL DEFAULT '', organization text NOT NULL DEFAULT '', bio text NOT NULL DEFAULT '', learning_goals text NOT NULL DEFAULT '',
 website text NOT NULL DEFAULT '', timezone text NOT NULL DEFAULT 'Pacific/Efate', avatar_path text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pwd_lms_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pwd_lms_profiles FROM anon,authenticated;
GRANT ALL ON public.pwd_lms_profiles TO service_role;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('pwd-student-avatars','pwd-student-avatars',false,3145728,ARRAY['image/webp']) ON CONFLICT(id) DO NOTHING;
DROP POLICY IF EXISTS pwd_student_avatars_deny_direct ON storage.objects;
CREATE POLICY pwd_student_avatars_deny_direct ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated USING(bucket_id <> 'pwd-student-avatars') WITH CHECK(bucket_id <> 'pwd-student-avatars');
COMMIT;
