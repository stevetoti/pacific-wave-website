import bi from '@/lib/lms/locales/bi.json';
import fr from '@/lib/lms/locales/fr.json';
import {translateCourseText} from '@/lib/lms/course-language';
import {coaches,type CoachRole} from './catalog';
export function coachGreeting(role:CoachRole,name:string,language?:string){
 const locale=language==='Bislama'?'bi':language==='French'?'fr':'en';
 const t=(text:string)=>translateCourseText(text,locale,{bi,fr});
 const greeting=t("Hello {name}! I am your {coach}.").replace('{name}',name.split(' ')[0]||'').replace('{coach}',t(coaches[role].title));
 return greeting+' '+t(role==='onboarding'?'Welcome to your course. Let us explore the course outline, class timetable and how to use your coaches. Shall we start with your course journey?':'What would you like to work on together today?');
}
