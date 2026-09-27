begin;
create or replace function public.pwd_coach_claim_report(p_id uuid default null) returns setof public.pwd_lms_coach_reports language plpgsql security definer set search_path='' as $$begin
 -- A terminated function cannot execute its catch block. Mark exhausted expired leases explicitly.
 update public.pwd_lms_coach_reports set state='failed',error='Report preparation timed out repeatedly; please contact the training team',locked_until=null,updated_at=now() where (p_id is null or session_id=p_id) and report is null and attempts>=3 and state in ('queued','processing') and (locked_until is null or locked_until<now());
 update public.pwd_lms_coach_reports set email_state='failed',error='Email delivery needs review after repeated interruptions',locked_until=null,updated_at=now() where (p_id is null or session_id=p_id) and report is not null and email_attempts>=3 and email_state in ('pending','sending') and (locked_until is null or locked_until<now());
 return query update public.pwd_lms_coach_reports set state=case when report is null then 'processing' else 'ready' end,locked_until=now()+interval '6 minutes',attempts=attempts+case when report is null then 1 else 0 end,updated_at=now()
 where session_id in(select session_id from public.pwd_lms_coach_reports where (p_id is null or session_id=p_id) and next_at<=now() and (locked_until is null or locked_until<now()) and ((report is null and attempts<3 and state in ('queued','processing')) or (report is not null and email_state in ('pending','sending') and email_attempts<3)) order by created_at for update skip locked limit 1) returning *;
end$$;
commit;
