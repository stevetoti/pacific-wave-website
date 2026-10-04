begin;
alter table public.pwd_lms_challenges add column if not exists selection_mode text not null default 'first' check(selection_mode in ('first','participation'));
alter table public.pwd_lms_challenge_claims add column if not exists scores integer[] check(scores is null or (cardinality(scores)=4 and array_position(scores,null) is null and 0<=all(scores) and 5>=all(scores)));
create or replace function public.pwd_challenge_review_v2(p_claim uuid,p_status text,p_note text,p_reviewer uuid,p_scores integer[] default null)
returns void language plpgsql security definer set search_path=public as $$
declare c public.pwd_lms_challenges; r public.pwd_lms_challenge_claims; used integer; total integer;
begin
 select * into r from public.pwd_lms_challenge_claims where id=p_claim;
 if not found then raise exception 'Submission not found'; end if;
 select * into c from public.pwd_lms_challenges where id=r.challenge_id for update;
 select * into r from public.pwd_lms_challenge_claims where id=p_claim for update;
 if p_status in ('verified','winner') and not exists(select 1 from public.pwd_lms_orders where course_id=c.course_id and user_id=r.user_id and status in ('paid','granted')) then raise exception 'Student no longer has course access'; end if;
 if p_status in ('verified','rejected') then
  if r.status not in ('pending','verified','rejected') then raise exception 'Awarded submissions cannot be changed'; end if;
  if p_status='rejected' then r.scores=null; end if;
  if c.selection_mode='participation' and p_status='verified' then
   if p_scores is null or cardinality(p_scores)<>4 or array_position(p_scores,null) is not null or not(0<=all(p_scores) and 5>=all(p_scores)) then raise exception 'Score all four participation criteria from 0 to 5'; end if;
   r.scores=p_scores;
  end if;
 elsif p_status='winner' then
  if now()<c.closes_at then raise exception 'Award winners after the challenge closes'; end if;
  if r.status<>'verified' then raise exception 'Verify proof before awarding'; end if;
  if c.selection_mode='participation' then
   -- One participation award per student/course, including simultaneous weekly awards.
   perform id from public.pwd_lms_courses where id=c.course_id for update;
   if exists(select 1 from public.pwd_lms_challenge_claims x join public.pwd_lms_challenges y on y.id=x.challenge_id where y.course_id=c.course_id and y.selection_mode='participation' and x.user_id=r.user_id and x.status in ('winner','delivered')) then raise exception 'This student already won a participation prize in this course'; end if;
   if r.scores is null then raise exception 'Score all four criteria before awarding'; end if;
   total=r.scores[1]+r.scores[2]+r.scores[3]+r.scores[4];
   if total=0 then raise exception 'Participation requires a positive verified score'; end if;
   if exists(select 1 from public.pwd_lms_challenge_claims x where x.challenge_id=c.id and x.status='pending' and not exists(select 1 from public.pwd_lms_challenge_claims w join public.pwd_lms_challenges wc on wc.id=w.challenge_id where wc.course_id=c.course_id and wc.selection_mode='participation' and w.user_id=x.user_id and w.status in ('winner','delivered'))) then raise exception 'Review every eligible pending reflection before awarding'; end if;
   if exists(select 1 from public.pwd_lms_challenge_claims x where x.challenge_id=c.id and x.status='verified' and (x.scores[1]+x.scores[2]+x.scores[3]+x.scores[4],x.scores[2],x.scores[3])>(total,r.scores[2],r.scores[3]) and not exists(select 1 from public.pwd_lms_challenge_claims w join public.pwd_lms_challenges wc on wc.id=w.challenge_id where wc.course_id=c.course_id and wc.selection_mode='participation' and w.user_id=x.user_id and w.status in ('winner','delivered'))) then raise exception 'Award the highest eligible participation score first'; end if;
   if length(trim(p_note))<40 and exists(select 1 from public.pwd_lms_challenge_claims x where x.challenge_id=c.id and x.id<>r.id and x.status='verified' and (x.scores[1]+x.scores[2]+x.scores[3]+x.scores[4],x.scores[2],x.scores[3])=(total,r.scores[2],r.scores[3]) and not exists(select 1 from public.pwd_lms_challenge_claims w join public.pwd_lms_challenges wc on wc.id=w.challenge_id where wc.course_id=c.course_id and wc.selection_mode='participation' and w.user_id=x.user_id and w.status in ('winner','delivered'))) then raise exception 'Exact tie: explain your trainer tie-break decision in at least 40 characters'; end if;
  else
   if exists(select 1 from public.pwd_lms_challenge_claims where challenge_id=c.id and status='pending') then raise exception 'Review every pending submission before awarding'; end if;
   if exists(select 1 from public.pwd_lms_challenge_claims where challenge_id=c.id and status='verified' and (achieved_at,submitted_at,id)<(r.achieved_at,r.submitted_at,r.id)) then raise exception 'Award the earliest verified earning or achievement first'; end if;
  end if;
  select count(*) into used from public.pwd_lms_challenge_claims where challenge_id=c.id and status in ('winner','delivered');
  if used>=c.max_winners then raise exception 'All prize places have been awarded'; end if;
 elsif p_status='delivered' then
  if r.status<>'winner' or length(trim(p_note))<4 then raise exception 'Select a winner and record fulfilment details first'; end if;
 else raise exception 'Invalid review action'; end if;
 update public.pwd_lms_challenge_claims set status=p_status,scores=r.scores,review_note=p_note,reviewed_by=p_reviewer,reviewed_at=now() where id=p_claim;
end $$;
revoke all on function public.pwd_challenge_review_v2(uuid,text,text,uuid,integer[]) from public,anon,authenticated;
grant execute on function public.pwd_challenge_review_v2(uuid,text,text,uuid,integer[]) to service_role;
-- Keep the previous server deployment compatible and prevent old award calls bypassing scoring.
create or replace function public.pwd_challenge_review(p_claim uuid,p_status text,p_note text,p_reviewer uuid)
returns void language plpgsql security definer set search_path=public as $$
begin perform public.pwd_challenge_review_v2(p_claim,p_status,p_note,p_reviewer,null); end $$;
commit;
