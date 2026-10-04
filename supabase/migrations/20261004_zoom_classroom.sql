-- Plain Zoom passcode is for the authorized join endpoint and instructor lesson editor only.
ALTER TABLE public.pwd_lms_lessons ADD COLUMN IF NOT EXISTS zoom_passcode text NOT NULL DEFAULT '';
ALTER TABLE public.pwd_lms_lessons ADD CONSTRAINT pwd_lms_zoom_passcode_length CHECK (length(zoom_passcode) <= 100);
