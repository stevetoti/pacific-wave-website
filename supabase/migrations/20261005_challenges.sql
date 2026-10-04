create table if not exists public.pwd_lms_challenges (
 id uuid primary key default gen_random_uuid(), course_id uuid not null references public.pwd_lms_courses(id) on delete cascade,
 title text not null, description text not null, proof_instructions text not null, prize text not null,
 max_winners integer not null default 1 check(max_winners between 1 and 100),
 opens_at timestamptz not null, closes_at timestamptz not null, published boolean not null default false,
 created_at timestamptz not null default now(), check(closes_at>opens_at)
);
create index if not exists pwd_lms_challenges_course on public.pwd_lms_challenges(course_id,opens_at);
create table if not exists public.pwd_lms_challenge_claims (
 id uuid primary key default gen_random_uuid(), challenge_id uuid not null references public.pwd_lms_challenges(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, evidence text not null, evidence_url text not null default '',
 achieved_at timestamptz not null, submitted_at timestamptz not null default now(),
 status text not null default 'pending' check(status in ('pending','verified','rejected','winner','delivered')),
 review_note text not null default '', reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 unique(challenge_id,user_id)
);
create index if not exists pwd_lms_challenge_claims_user on public.pwd_lms_challenge_claims(user_id);
alter table public.pwd_lms_challenges enable row level security;
alter table public.pwd_lms_challenge_claims enable row level security;
revoke all on public.pwd_lms_challenges,public.pwd_lms_challenge_claims from anon,authenticated;
grant all on public.pwd_lms_challenges,public.pwd_lms_challenge_claims to service_role;
-- All transitions serialize on the challenge row. Only the scoped server API may call this function.
create or replace function public.pwd_challenge_review(p_claim uuid,p_status text,p_note text,p_reviewer uuid)
returns void language plpgsql security definer set search_path=public as $$
declare c public.pwd_lms_challenges; r public.pwd_lms_challenge_claims; used integer;
begin
 select * into r from public.pwd_lms_challenge_claims where id=p_claim;
 if not found then raise exception 'Submission not found'; end if;
 select * into c from public.pwd_lms_challenges where id=r.challenge_id for update;
 select * into r from public.pwd_lms_challenge_claims where id=p_claim for update;
 if p_status in ('verified','winner') and not exists(select 1 from public.pwd_lms_orders where course_id=c.course_id and user_id=r.user_id and status in ('paid','granted')) then raise exception 'Student no longer has course access'; end if;
 if p_status in ('verified','rejected') then
  if r.status not in ('pending','verified','rejected') then raise exception 'Awarded submissions cannot be changed'; end if;
 elsif p_status='winner' then
  if now()<c.closes_at then raise exception 'Award winners after the challenge closes'; end if;
  if r.status<>'verified' then raise exception 'Verify proof before awarding'; end if;
  if exists(select 1 from public.pwd_lms_challenge_claims where challenge_id=c.id and status='pending') then raise exception 'Review every pending submission before awarding'; end if;
  if exists(select 1 from public.pwd_lms_challenge_claims where challenge_id=c.id and status='verified' and (achieved_at,submitted_at,id)<(r.achieved_at,r.submitted_at,r.id)) then raise exception 'Award the earliest verified earning or achievement first'; end if;
  select count(*) into used from public.pwd_lms_challenge_claims where challenge_id=c.id and status in ('winner','delivered');
  if used>=c.max_winners then raise exception 'All prize places have been awarded'; end if;
 elsif p_status='delivered' then
  if r.status<>'winner' or length(trim(p_note))<4 then raise exception 'Select a winner and record fulfilment details first'; end if;
 else raise exception 'Invalid review action'; end if;
 update public.pwd_lms_challenge_claims set status=p_status,review_note=p_note,reviewed_by=p_reviewer,reviewed_at=now() where id=p_claim;
end $$;
revoke all on function public.pwd_challenge_review(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.pwd_challenge_review(uuid,text,text,uuid) to service_role;
-- Serialize submissions with award decisions and enforce the deadline in the database.
create or replace function public.pwd_challenge_submission_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare c public.pwd_lms_challenges;
begin
 select * into c from public.pwd_lms_challenges where id=new.challenge_id for update;
 if not found or not c.published or clock_timestamp()<c.opens_at or clock_timestamp()>=c.closes_at then raise exception 'Challenge is not open for submissions'; end if;
 if new.achieved_at<c.opens_at or new.achieved_at>=c.closes_at or new.achieved_at>clock_timestamp() then raise exception 'Achievement must be within the challenge window'; end if;
 if not exists(select 1 from public.pwd_lms_orders where course_id=c.course_id and user_id=new.user_id and status in ('paid','granted')) then raise exception 'Approved course access required'; end if;
 new.submitted_at=clock_timestamp();new.status='pending';new.review_note='';new.reviewed_by=null;new.reviewed_at=null;
 return new;
end $$;
revoke all on function public.pwd_challenge_submission_guard() from public,anon,authenticated;
drop trigger if exists pwd_challenge_submission_guard on public.pwd_lms_challenge_claims;
create trigger pwd_challenge_submission_guard before insert on public.pwd_lms_challenge_claims for each row execute function public.pwd_challenge_submission_guard();
