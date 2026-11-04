"use client";
import {useEffect,useState} from "react";
import {authFetch} from "@/lib/auth-fetch";
type Session={id:string;created_at:string;transcript:{role:string;content:string}[];summary:string|null};
export default function OnboardingHistory({courseId,studentId,name,onClose}:{courseId:string;studentId:string;name:string;onClose:()=>void}) {
 const [rows,setRows]=useState<Session[]|null>(null),[error,setError]=useState("");
 useEffect(()=>{let active=true;authFetch(`/api/lms-onboarding?${new URLSearchParams({course:courseId,student:studentId})}`).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"Could not load onboarding conversations.");if(active)setRows(d.sessions);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[courseId,studentId]);
 return <div className="sr-modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-history-title" onKeyDown={e=>{if(e.key==="Escape")onClose();}}>
  <div className="sr-modal-card" style={{width:"min(800px,100%)"}}>
   <div className="sr-actions"><h3 id="onboarding-history-title">Onboarding · {name}</h3><button autoFocus type="button" className="lms-text" onClick={onClose}>Close</button></div>
   <p>Only onboarding conversations the student agreed to share with this course’s teaching team appear here. Their statements help you tailor support and are not assessments.</p>
   {error?<p className="lms-error" role="alert">{error}</p>:rows===null?<p role="status">Loading onboarding conversations…</p>:rows.length===0?<p>No shared onboarding conversation has been saved yet.</p>:rows.map(row=><article key={row.id} className="lms-panel">
    <h4>{new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Pacific/Efate"}).format(new Date(row.created_at))} · Vanuatu time</h4>
    {row.summary&&<p style={{whiteSpace:"pre-wrap"}}>{row.summary}</p>}
    <details><summary>Read motivation, expectations and conversation</summary>{row.transcript.length?row.transcript.map((line,i)=><p key={i} style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}><strong>{line.role==="user"?name:"Onboarding Tutor"}:</strong> {line.content}</p>):<p>No conversation text was captured.</p>}</details>
   </article>)}
  </div>
 </div>;
}
