import { workbook } from './workbook-schema';
export type WorkbookRow = {lesson_key:string;answers:Record<string,string|boolean>;updated_at:string};
// Bound provider context while retaining an excerpt of every recorded activity.
export function workbookContext(rows:WorkbookRow[]) {
 return {source:'Student-saved workbook; unverified drafts; snapshot at session start',lessons:workbook.lessons.map(lesson=>{
  const row=rows.find(r=>r.lesson_key===lesson.id);
  return {lesson:lesson.number,title:lesson.title,date:lesson.date,updated_at:row?.updated_at||null,activities:lesson.fields.map(f=>{
   const value=typeof row?.answers[f.id]==='string'?String(row.answers[f.id]):'';
   return {activity:f.label,answer:value.slice(0,400),truncated:value.length>400};
  }),checks:lesson.checks.map((label,i)=>({label,checked:row?.answers[`${lesson.id}-check-${i}`]===true}))};
 })};
}
