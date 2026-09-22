-- Include manually granted students in enrolled-class updates. Existing suppression rules remain.
CREATE OR REPLACE FUNCTION public.pwd_campaign_audience(segment text, selected_course uuid)
RETURNS TABLE(email text,name text) LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 WITH contacts AS (
 SELECT lower(u.email) email, coalesce(nullif(p.full_name,''),(SELECT o.name FROM pwd_lms_orders o WHERE o.user_id=u.id ORDER BY o.created_at LIMIT 1),'Student') name
 FROM auth.users u LEFT JOIN pwd_lms_profiles p ON p.user_id=u.id
 WHERE u.email_confirmed_at IS NOT NULL AND (p.user_id IS NOT NULL OR EXISTS(SELECT 1 FROM pwd_lms_orders o WHERE o.user_id=u.id) OR EXISTS(SELECT 1 FROM pwd_lms_account_emails a WHERE lower(a.email)=lower(u.email)))
 ), eligible AS (
 SELECT c.email,c.name FROM contacts c WHERE segment <> 'leads' AND (
 segment='all' OR
 (segment='no_enrolment' AND NOT EXISTS(SELECT 1 FROM pwd_lms_orders o WHERE lower(o.email)=c.email)) OR
 (segment='not_in_course' AND selected_course IS NOT NULL AND NOT EXISTS(SELECT 1 FROM pwd_lms_orders o WHERE lower(o.email)=c.email AND o.course_id=selected_course)) OR
 (segment='unpaid' AND EXISTS(SELECT 1 FROM pwd_lms_orders o WHERE lower(o.email)=c.email AND o.status IN ('pending','review','rejected') AND (selected_course IS NULL OR o.course_id=selected_course))) OR
 (segment='paid' AND EXISTS(SELECT 1 FROM pwd_lms_orders o WHERE lower(o.email)=c.email AND o.status IN ('paid','granted') AND (selected_course IS NULL OR o.course_id=selected_course))))
 UNION ALL SELECT lower(r.email),r.full_name FROM pwd_training_registrations r WHERE segment='leads' AND r.future_training_opt_in=true
 ) SELECT DISTINCT ON (e.email) e.email,e.name FROM eligible e WHERE NOT EXISTS(SELECT 1 FROM pwd_lms_email_suppressions s WHERE s.email=e.email) ORDER BY e.email,e.name;
$$;
