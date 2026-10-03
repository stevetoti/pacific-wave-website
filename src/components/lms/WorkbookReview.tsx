'use client';
import { useEffect,useState } from 'react';
import { authFetch } from '@/lib/auth-fetch';
import { workbook } from '@/lib/lms/workbook-schema';
import type { WorkbookRow } from '@/lib/lms/workbook-context';
import styles from './workbook.module.css';
export default function WorkbookReview({courses}:{courses:{id:string;slug:string;title:string}[]}){
 const available=courses.filter(c=>c.slug===workbook.courseSlug);
 const courseId=available[0]?.id;
 const [students,setStudents]=useState<{id:string;name:string}[]>([]),[student,setStudent]=useState(''),[rows,setRows]=useState<WorkbookRow[]>([]),[lessonIndex,setLessonIndex]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[refresh,setRefresh]=useState(0);
 useEffect(()=>{let active=true;setStudent('');setStudents([]);if(!courseId)return;
  setBusy(true);setError('');authFetch(`/api/lms-workbook/review?course=${courseId}`).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to load students');if(active)setStudents(d.students);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};
 },[courseId]);
 useEffect(()=>{let active=true;setRows([]);if(!student||!courseId)return;
  setBusy(true);setError('');authFetch(`/api/lms-workbook/review?course=${courseId}&student=${student}`).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to load workbook');if(active)setRows(d.rows);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};
 },[courseId,student,refresh]);
 const lesson=workbook.lessons[lessonIndex],row=rows.find(r=>r.lesson_key===lesson.id);
 return <section className={`lms-panel ${styles.workbook}`}><p className="lms-eyebrow">TEACHING SUPPORT</p><h2>Student workbooks</h2><p>Review saved activities to understand each participant’s plans and where they need help. This view is read-only. Use course messages to offer guidance; students keep ownership of their answers.</p>{!courseId?<p>No interactive workbook is available for your assigned courses.</p>:<><h3>{available[0].title}</h3><div className={styles.reviewControls}><label>Participant<select aria-label="Workbook participant" value={student} onChange={e=>setStudent(e.target.value)}><option value="">Choose a participant</option>{students.map(s=><option key={s.id} value={s.id}>{s.name} · {s.id.slice(-6)}</option>)}</select></label><label>Class<select aria-label="Workbook class" value={lessonIndex} onChange={e=>setLessonIndex(Number(e.target.value))}>{workbook.lessons.map((l,i)=><option key={l.id} value={i}>{l.number}. {l.date} — {l.title}</option>)}</select></label></div>{error&&<p role="alert">{error}</p>}{busy?<p role="status">Loading workbook…</p>:student&&!error?<><button className="lms-button secondary" onClick={()=>setRefresh(x=>x+1)}>Refresh saved answers</button><h3>{lesson.title}</h3><p>{row?`Last saved: ${new Date(row.updated_at).toLocaleString('en-GB',{timeZone:'Pacific/Efate'})} (Vanuatu time)`:'No answers saved for this class yet.'}</p>{lesson.fields.map(f=><div key={f.id}><h3>{f.label}</h3><p className={styles.reviewAnswer}>{typeof row?.answers[f.id]==='string'&&String(row.answers[f.id]).trim()?String(row.answers[f.id]):'Not answered yet'}</p></div>)}<h3>Student self-checks</h3>{lesson.checks.map((c,i)=><p key={c}>{row?.answers[`${lesson.id}-check-${i}`]===true?'✓ Checked':'○ Not checked'} — {c}</p>)}</>:!students.length&&!error?<p>No participants with active access yet.</p>:null}</>}</section>;
}
