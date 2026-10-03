import { z } from 'zod';
import workbook from './october-workbook.json';
export { workbook };
export const workbookSaveSchema=z.object({courseId:z.uuid(),lessonKey:z.string(),revision:z.number().int().min(0).max(2147483646),answers:z.record(z.string(),z.union([z.string().max(6000),z.boolean()]))}).strict().superRefine((v,ctx)=>{
 const lesson=workbook.lessons.find(l=>l.id===v.lessonKey);
 if(!lesson){ctx.addIssue({code:'custom',message:'Unknown lesson'});return;}
 const strings=new Set(lesson.fields.map(f=>f.id));
 const checks=new Set(lesson.checks.map((_,i)=>`${lesson.id}-check-${i}`));
 for(const [key,value] of Object.entries(v.answers)){
  if(!((strings.has(key)&&typeof value==='string')||(checks.has(key)&&typeof value==='boolean')))ctx.addIssue({code:'custom',message:'Invalid workbook answer'});
 }
});
