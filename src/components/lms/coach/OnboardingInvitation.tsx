"use client";
import { CourseText } from "@/components/lms/CourseLanguage";
import {useEffect,useRef} from "react";
import { onboardingPoster, onboardingVideo, onboardingShareNotice } from "@/lib/lms/onboarding";
export default function OnboardingInvitation({shared,onShared,onStart,ready,complete}:{shared:boolean;onShared:(value:boolean)=>void;onStart:()=>void;ready:boolean;complete:boolean}) {
 const section=useRef<HTMLElement>(null);
 useEffect(()=>{section.current?.scrollIntoView({block:"start"});section.current?.focus({preventScroll:true});},[]);
 return <section ref={section} tabIndex={-1} style={{scrollMarginTop:100}} className="lms-panel" aria-label="Meet your Onboarding Tutor">
  <p className="lms-eyebrow"><CourseText text={"YOUR FIRST CONVERSATION"} /></p><h2><CourseText text={"Meet your Onboarding Tutor"} /></h2>
  <video controls playsInline preload="metadata" poster={onboardingPoster} style={{width:"100%",maxWidth:760,borderRadius:16}} aria-label="Onboarding Tutor introduction">
   <source src={onboardingVideo} type="video/mp4"/><track kind="captions" src="/media/onboarding/introduction-v1.vtt" srcLang="en" label="English"/>
  </video>
  <p><CourseText text={"Your tutor will greet you by name, ask what motivated you to join and what you hope to achieve, then help you plan how to get the most from the class."} /></p>
  {complete?<p className="lms-notice"><CourseText text={"You have already completed onboarding for this course. Your conversation history and other coaches are available below."} /></p>:<>
   <p><CourseText text={"Think about your business or project idea, one goal for this course, and anything you would like help with. You can skip any question you prefer not to answer."} /></p>
   <label style={{display:"flex",gap:10,alignItems:"flex-start",margin:"18px 0"}}><input type="checkbox" checked={shared} onChange={e=>onShared(e.target.checked)}/><span><CourseText text={onboardingShareNotice} /></span></label>
   <button type="button" className="lms-button" disabled={!ready||!shared} onClick={onStart}><CourseText text={"Speak with your Onboarding Tutor"} /></button>
   {!ready&&<p><CourseText text={"Approve AI coaching below if prompted. Then allow microphone access when you start. Your camera is optional."} /></p>}
  </>}
 </section>;
}
