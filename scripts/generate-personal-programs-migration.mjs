import{readFile,writeFile}from'node:fs/promises';
const d=JSON.parse(await readFile('src/lib/lms/personal-programs.json','utf8'));
const offers=[d.foundations,d.software,{...d.full,sessions:[...d.foundations.sessions,...d.software.sessions]}];
const q=s=>"'"+s.replaceAll("'","''")+"'";
const rows=offers.map(p=>{
 const description=`${p.sessions.length} private 90-minute lessons over ${p.teachingWeeks} weeks, three times a week. Then ${p.mentorshipMonths} month${p.mentorshipMonths===1?'':'s'} of follow-up mentorship${p.teachingWeeks===12?' after both phases':''}. ${p.headline}`;
 const introduction=`Welcome to ${p.title}. ${p.overview} ${p.projectDescription} VUV ${p.amount.toLocaleString('en-US')} is the one-time fee for ${p.sessions.length} scheduled one-on-one lessons (${p.sessions.length*1.5} teaching hours) over ${p.teachingWeeks} weeks, followed by ${p.mentorshipMonths} month${p.mentorshipMonths===1?'':'s'} of mentorship${p.teachingWeeks===12?' after both phases':''}. Meet Steve three times a week for 90-minute lessons, with practice between sessions. Afterwards, mentorship is project guidance, review and troubleshooting: meet about once a week or arrange help when needed during the included period. Meetings are arranged together. Your assigned session notes and private recordings are available in your own course space. Domains, hosting, advertising and external subscriptions are separate. ${p.slug!==d.foundations.slug?'Includes three free months of Digi Assist AI Pro; continued use after that requires a paid subscription. ':''}No income or sales results are guaranteed.`;
 return`(${[p.slug,p.title,description,introduction,'live'].map(q).join(',')},${p.amount},'VUV',true,true,true,false,false)`;
});
const plans=Object.fromEntries(offers.map(p=>[p.slug,p.sessions]));
const sql=`-- Owner-authorised PWD one-on-one options, 30 October 2026. VUV prices are local overrides.
-- Curriculum follows BuildProfitAI, with explicit coding/WordPress and owner-set mentorship periods.
BEGIN;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pwd_lms_courses WHERE slug='full-ai-business-program') AND EXISTS(
 SELECT 1 FROM pwd_lms_orders o JOIN pwd_lms_courses c ON c.id=o.course_id WHERE c.slug IN('how-to-start-a-profitable-business','one-on-one-mentorship')) THEN
 RAISE EXCEPTION 'Legacy enrolments appeared: preserve their offer before replacing the unbooked programmes'; END IF;
 IF EXISTS(SELECT 1 FROM pwd_lms_courses WHERE slug IN('how-to-start-a-profitable-business','one-on-one-mentorship') AND currency<>'VUV') THEN RAISE EXCEPTION 'Unexpected currency/project'; END IF;
END $$;
INSERT INTO pwd_lms_courses(slug,title,description,introduction,kind,amount,currency,published,enrollment_open,private_sessions,is_private,requires_approval)
VALUES ${rows.join(',\n')}
ON CONFLICT(slug) DO UPDATE SET title=excluded.title,description=excluded.description,introduction=excluded.introduction,kind=excluded.kind,amount=excluded.amount,currency=excluded.currency,published=true,enrollment_open=true,private_sessions=true,is_private=false,requires_approval=false;
CREATE OR REPLACE FUNCTION public.pwd_lms_mentorship_journey() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE course_slug text; plan jsonb;
BEGIN
 SELECT slug INTO course_slug FROM pwd_lms_courses WHERE id=NEW.course_id AND private_sessions;
 IF course_slug IS NULL THEN RETURN NEW; END IF;
 plan := $plans$${JSON.stringify(plans)}$plans$::jsonb -> course_slug;
 IF plan IS NOT NULL THEN
 INSERT INTO pwd_lms_lessons(course_id,order_id,title,position,content,section_title,published,recordings_published)
 SELECT NEW.course_id,NEW.id,lpad(n::text,2,'0')||' · '||(s->>'title'),n::int,
 (s->>'body')||E'\\n\\nScheduled private lesson: 90 minutes. Arrange the appointment with Steve. Notes and recordings are published to your own enrolment. Follow-up mentorship is a separate support stage after the scheduled training.',
 'Week '||(((n-1)/3)::int+1)::text,true,false
 FROM jsonb_array_elements(plan) WITH ORDINALITY AS v(s,n);
 ELSE
 INSERT INTO pwd_lms_lessons(course_id,order_id,title,position,content)
 SELECT NEW.course_id,NEW.id,title,position,'Your mentor will arrange your sessions and publish notes and recordings here.' FROM(VALUES(1,'Month 1 · Business foundations & AI'),(2,'Month 2 · Websites, WordPress & ecommerce'),(3,'Month 3 · AI coding, software & launch')) AS r(position,title);
 END IF;
 RETURN NEW;
END $$;
COMMIT;
`;
await writeFile(process.argv[2] || 'supabase/migrations/20261030_personal_training_options.sql',sql);
console.log('Generated programme migration from shared offer and lesson data.');
