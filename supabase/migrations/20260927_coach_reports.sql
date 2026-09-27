begin;
create table public.pwd_lms_coach_preferences(user_id uuid primary key references auth.users(id) on delete cascade,consent_version text not null,accepted_at timestamptz not null default now());
alter table public.pwd_lms_coach_sessions add column title text check(length(title)<=160);
create table public.pwd_lms_coach_research(id uuid primary key default gen_random_uuid(),session_id uuid not null references public.pwd_lms_coach_sessions(id) on delete cascade,topic text not null check(length(topic)<=1200),result jsonb,status text not null default 'pending',created_at timestamptz not null default now());
create table public.pwd_lms_coach_reports(session_id uuid primary key references public.pwd_lms_coach_sessions(id) on delete cascade,state text not null default 'queued' check(state in ('queued','processing','ready','failed')),report jsonb,attempts integer not null default 0,locked_until timestamptz,next_at timestamptz not null default now(),error text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),email_state text not null default 'pending',email_payload jsonb,email_attempts integer not null default 0,email_started_at timestamptz,provider_id text);
create index on public.pwd_lms_coach_reports(state,next_at);
create index on public.pwd_lms_coach_research(session_id);
alter table public.pwd_lms_coach_preferences enable row level security;
alter table public.pwd_lms_coach_research enable row level security;
alter table public.pwd_lms_coach_reports enable row level security;
revoke all on public.pwd_lms_coach_preferences,public.pwd_lms_coach_research,public.pwd_lms_coach_reports from public,anon,authenticated;
grant all on public.pwd_lms_coach_preferences,public.pwd_lms_coach_research,public.pwd_lms_coach_reports to service_role;
create function public.pwd_coach_queue_report() returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.state='ended' and old.state<>'ended' then insert into public.pwd_lms_coach_reports(session_id) values(new.id) on conflict do nothing;end if;return new;end$$;
create trigger pwd_coach_session_report after update on public.pwd_lms_coach_sessions for each row execute function public.pwd_coach_queue_report();
revoke all on function public.pwd_coach_queue_report() from public,anon,authenticated;
create function public.pwd_coach_claim_report(p_id uuid default null) returns setof public.pwd_lms_coach_reports language plpgsql security definer set search_path='' as $$begin
 return query update public.pwd_lms_coach_reports set state=case when report is null then 'processing' else 'ready' end,locked_until=now()+interval '6 minutes',attempts=attempts+case when report is null then 1 else 0 end,updated_at=now()
 where session_id in(select session_id from public.pwd_lms_coach_reports where (p_id is null or session_id=p_id) and next_at<=now() and (locked_until is null or locked_until<now()) and ((report is null and attempts<3 and state in ('queued','processing')) or (report is not null and email_state in ('pending','sending') and email_attempts<3)) order by created_at for update skip locked limit 1) returning *;
end$$;
create function public.pwd_coach_reserve_research(p_user uuid,p_session uuid,p_topic text) returns uuid language plpgsql security definer set search_path='' as $$declare rid uuid;begin
 perform pg_advisory_xact_lock(hashtextextended('pwd-research:'||p_session::text,0));
 if not exists(select 1 from public.pwd_lms_coach_sessions where id=p_session and user_id=p_user and state='active' and expires_at>now()) then raise exception 'inactive_session';end if;
 if (select count(*) from public.pwd_lms_coach_research where session_id=p_session)>=6 then raise exception 'research_limit';end if;
 insert into public.pwd_lms_coach_research(session_id,topic) values(p_session,p_topic) returning id into rid;return rid;
end$$;
revoke all on function public.pwd_coach_claim_report(uuid),public.pwd_coach_reserve_research(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.pwd_coach_claim_report(uuid),public.pwd_coach_reserve_research(uuid,uuid,text) to service_role;
-- Keep private mentorship isolation while allowing enrolled cohorts to replay a shared recording.
create or replace function public.pwd_lms_validate_private_lesson() returns trigger language plpgsql set search_path=public as $$
begin
 if new.order_id is not null and not exists(select 1 from pwd_lms_orders where id=new.order_id and course_id=new.course_id) then raise exception 'Session enrolment must match course';end if;
 if exists(select 1 from pwd_lms_courses where id=new.course_id and private_sessions) and (new.order_id is null or new.youtube_id<>'') then raise exception 'Mentorship requires an assigned student and private recording storage';end if;
 if new.recording_path<>'' and new.recording_path not like coalesce(new.order_id,new.course_id)::text || '/%' then raise exception 'Recording must belong to this course or assigned enrolment';end if;
 return new;
end $$;
commit;
