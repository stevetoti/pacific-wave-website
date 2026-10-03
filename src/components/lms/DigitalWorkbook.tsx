'use client';
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {authFetch} from '@/lib/auth-fetch';
import workbook from '@/lib/lms/october-workbook.json';
import styles from './workbook.module.css';
type Answers=Record<string,string|boolean>;
type Row={lesson_key:string;answers:Answers;revision:number};
export default function DigitalWorkbook({courseId}:{courseId:string}){
 const [open,setOpen]=useState(false),[loaded,setLoaded]=useState(false),[index,setIndex]=useState(0);
 const [answers,setAnswers]=useState<Answers>({}),[status,setStatus]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const rows=useRef<Record<string,Row>>({}),current=useRef<Answers>({}),lessonIndex=useRef(0),dirty=useRef(false),generation=useRef(0),conflict=useRef(false),pending=useRef<Promise<boolean>|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const lesson=workbook.lessons[index];
 async function load(){
  setBusy(true);setError('');
  try{const r=await authFetch(`/api/lms-workbook?course=${courseId}`);const data=await r.json();if(!r.ok)throw Error(data.error||'Unable to load workbook');
   rows.current=Object.fromEntries((data.rows as Row[]).map(row=>[row.lesson_key,row]));
   current.current=rows.current[workbook.lessons[lessonIndex.current].id]?.answers||{};setAnswers(current.current);dirty.current=false;conflict.current=false;setLoaded(true);setStatus('Saved answers loaded');
  }catch(e){setError(e instanceof Error?e.message:'Unable to load');}finally{setBusy(false);}
 }
 async function save():Promise<boolean>{
  if(timer.current)clearTimeout(timer.current);
  if(pending.current){const ok=await pending.current;if(!ok)return false;return save();}
  if(!dirty.current)return true;if(conflict.current)return false;
  const key=workbook.lessons[lessonIndex.current].id,snapshot={...current.current},version=generation.current;
  setStatus('Saving…');setError('');
  const operation=(async()=>{try{
   const r=await authFetch('/api/lms-workbook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({courseId,lessonKey:key,revision:rows.current[key]?.revision||0,answers:snapshot})});
   const data=await r.json();if(!r.ok){if(r.status===409)conflict.current=true;throw Error(data.error||'Unable to save');}
   rows.current[key]={lesson_key:key,answers:snapshot,revision:data.revision};
   if(generation.current===version){dirty.current=false;setStatus('All changes saved');}else setStatus('New changes waiting to save');return true;
  }catch(e){setStatus('Not saved');setError(e instanceof Error?e.message:'Unable to save');return false;}})();
  pending.current=operation;const ok=await operation;pending.current=null;if(ok&&dirty.current)return save();return ok;
 }
 function change(key:string,value:string|boolean){
  current.current={...current.current,[key]:value};setAnswers(current.current);generation.current++;dirty.current=true;setStatus('Unsaved changes');
  if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{void save();},1100);
 }
 async function select(next:number){setBusy(true);if(await save()){lessonIndex.current=next;setIndex(next);current.current=rows.current[workbook.lessons[next].id]?.answers||{};setAnswers(current.current);setStatus('Saved answers loaded');}setBusy(false);}
 async function download(kind:'blank'|'completed'){
  setBusy(true);if(kind==='completed'&&!(await save())){setBusy(false);return;}
  try{const r=await authFetch(`/api/lms-workbook?course=${courseId}&pdf=${kind}`);if(!r.ok)throw Error((await r.json()).error||'Download failed');const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download=kind==='blank'?'PWD-October-Workbook.pdf':'PWD-Workbook-With-My-Answers.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){setError(e instanceof Error?e.message:'Download failed');}finally{setBusy(false);}
 }
 function backup(){const url=URL.createObjectURL(new Blob([JSON.stringify({lesson:lesson.title,answers:current.current},null,2)],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='my-unsaved-workbook-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 useEffect(()=>{
  const before=(e:BeforeUnloadEvent)=>{if(dirty.current){e.preventDefault();e.returnValue='';}};
  const link=(e:MouseEvent)=>{if(dirty.current&&(e.target as HTMLElement)?.closest?.('a[href]')&&!window.confirm('Your workbook has unsaved changes. Leave this page?')){e.preventDefault();e.stopPropagation();}};
  window.addEventListener('beforeunload',before);document.addEventListener('click',link,true);
  return()=>{window.removeEventListener('beforeunload',before);document.removeEventListener('click',link,true);if(timer.current)clearTimeout(timer.current);};
 },[]);
 return <section className={`lms-panel ${styles.workbook}`} aria-label="Interactive participant workbook">
  <div className={styles.top}><button className={styles.coverButton} aria-label="Open participant workbook" aria-expanded={open} onClick={()=>{setOpen(!open);if(!loaded&&!open)void load();}}><Image className={styles.cover} src="/images/training/october-workbook/cover.jpg" alt="Pacific Wave Digital participant workbook cover: Build Your Online Business in 30 Days, with Ni-Vanuatu entrepreneurs learning together" width={700} height={990}/><span>{open?'Close workbook':'Explore your workbook →'}</span></button><div><p className="lms-eyebrow">YOUR INTERACTIVE PARTICIPANT WORKBOOK</p><h2>Your business starts taking shape here.</h2><p>Turn every class into practical progress. Follow 12 dated lessons, plan your business, develop your online presence and record what you build.</p><ul><li>Type directly into the activities — your answers save automatically.</li><li>Return on any device, or download the workbook PDF with your saved answers.</li><li>Use your work to get tailored help from your instructors and AI faculty.</li></ul><p className={styles.note}>Your course instructors and authorised administrators can review saved answers to support you. Your AI faculty uses your saved workbook when you start a coaching session. Other students cannot see it.</p><button className="lms-button" aria-expanded={open} onClick={()=>{setOpen(!open);if(!loaded&&!open)void load();}}>{open?'Close workbook':'Open workbook'}</button></div></div>
  {open&&<><div className={styles.actions}><button disabled={busy} onClick={()=>void download('blank')}>Download blank PDF</button><button disabled={busy||!loaded} onClick={()=>void download('completed')}>Download workbook with my answers</button><span role="status" aria-live="polite">{status}</span></div>
   <p className={styles.note}>Your answers are shared with your course teaching team and your AI faculty for learning support, never with other students. Do not enter passwords or sensitive customer information. PDF downloads are snapshots; editing a PDF does not change your saved answers.</p>
   {error&&<div role="alert" className={styles.error}><p>{error}</p><button onClick={()=>void save()} disabled={busy||conflict.current}>Retry save</button> <button onClick={backup}>Download my unsaved notes</button> <button onClick={()=>{if(!dirty.current||window.confirm('Discard unsaved edits and load the saved version?'))void load();}} disabled={busy}>Reload saved version</button></div>}
   {!loaded?<p>{busy?'Loading your workbook…':'Use Reload saved version to try again.'}</p>:<>
    <label className={styles.select}>Choose a class<select aria-label="Choose a class" value={index} disabled={busy} onChange={e=>void select(Number(e.target.value))}>{workbook.lessons.map((l,i)=><option key={l.id} value={i}>{l.number}. {l.date.slice(8)} Oct — {l.title}</option>)}</select></label>
    <Image className={styles.hero} src={`/images/training/october-workbook/${lesson.image}`} alt="Illustration of fictional Ni-Vanuatu entrepreneurs learning practical business skills" width={1600} height={905}/>
    <p className="lms-eyebrow">LIVE CLASS {lesson.number} · {new Date(lesson.date+'T12:00:00+11:00').toLocaleDateString('en-GB',{timeZone:'Pacific/Efate',weekday:'long',day:'numeric',month:'long'})} · 3–5 PM VANUATU</p>
    <h2>{lesson.title}</h2><p>{lesson.outcome}</p>
    <div className={styles.reading}>{lesson.learn.map(([heading,text])=><div key={heading}><h3>{heading}</h3><p>{text}</p></div>)}</div>
    <h3>A business example</h3><p>{lesson.example}</p><h3>Build it step by step</h3><ol>{lesson.steps.map(step=><li key={step}>{step}</li>)}</ol>
    <h3>AI prompt to adapt</h3><p>{lesson.prompt}</p>
    <h3>Your business activities</h3><p>Answers save automatically. Each response can contain up to 6,000 characters.</p>
    <div className={styles.fields}>{lesson.fields.map(f=><label key={f.id} htmlFor={f.id}><strong>{f.label}</strong><textarea aria-label={f.label} id={f.id} value={typeof answers[f.id]==='string'?String(answers[f.id]):''} maxLength={6000} rows={4} onChange={e=>change(f.id,e.target.value)}/></label>)}</div>
    <h3>Check your work</h3>{lesson.checks.map((c,i)=>{const key=`${lesson.id}-check-${i}`;return <label className={styles.check} key={key}><input type="checkbox" checked={answers[key]===true} onChange={e=>change(key,e.target.checked)}/>{c}</label>;})}
    <h3>Before the next class</h3><p>{lesson.homework}</p>
    <div className={styles.actions}><button disabled={busy} onClick={()=>void save()}>Save now</button><button disabled={busy||index===0} onClick={()=>void select(index-1)}>Previous class</button><button disabled={busy||index===11} onClick={()=>void select(index+1)}>Next class</button></div>
   </>}
  </>}
 </section>;
}
