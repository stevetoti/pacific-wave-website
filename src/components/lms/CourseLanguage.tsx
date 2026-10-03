'use client';
import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import bi from '@/lib/lms/locales/bi.json';
import fr from '@/lib/lms/locales/fr.json';
import {type CourseLanguage, parseCourseLanguage, translateCourseText} from '@/lib/lms/course-language';
const dictionaries:Record<string,Record<string,string>>={bi,fr};
const Context=createContext({language:'en' as CourseLanguage,setLanguage:(_value:CourseLanguage)=>{},t:(text:string)=>text});
export function CourseLanguageProvider({children,enabled=true}:{children:ReactNode;enabled?:boolean}){
 const [language,setValue]=useState<CourseLanguage>('en');
 useEffect(()=>{if(!enabled)return;try{const saved=localStorage.getItem('pwd-course-language');if(saved==='bi'||saved==='fr')setValue(saved);}catch{}},[enabled]);
 const setLanguage=useCallback((value:CourseLanguage)=>{setValue(value);try{localStorage.setItem('pwd-course-language',value);}catch{}},[]);
 const active=enabled?language:'en';
 const t=useCallback((text:string)=>translateCourseText(text,active,dictionaries),[active]);
 return <Context.Provider value={{language:active,setLanguage,t}}><div lang={active}>{children}</div></Context.Provider>;
}
export const useCourseLanguage=()=>useContext(Context);
export function CourseText({text}:{text:string}){const {t}=useCourseLanguage();return <> {t(text)} </>;}
export function CourseLanguagePicker(){const {language,setLanguage,t}=useCourseLanguage();return <div style={{display:'flex',justifyContent:'flex-end',gap:12,alignItems:'center',flexWrap:'wrap',padding:'12px 0 20px'}}><label htmlFor="course-language">Language / Lanwis / Langue</label><select id="course-language" aria-label="Course language" value={language} onChange={e=>setLanguage(parseCourseLanguage(e.target.value))} style={{padding:'10px 14px',border:'1px solid #aebdd2',borderRadius:8,background:'white',color:'#233c6f'}}><option value="en">English</option><option value="bi">Bislama</option><option value="fr">Français</option></select><p style={{width:'100%',textAlign:'right',margin:0,fontSize:13,color:'#52617a'}}>{t('Choose your reading language. Your answers stay as you wrote them.')}</p></div>;}
