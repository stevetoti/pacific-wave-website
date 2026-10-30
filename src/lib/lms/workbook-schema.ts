import { z } from 'zod';
import workbook from './october-workbook.json';
import novemberWorkbook from './november-workbook.json';
import { blpWorkbook } from './blp-workbook';
export { workbook };
export type Workbook = Omit<typeof workbook, 'lessons' | 'sources'> & {
 format?: 'workshop'; venue?: string; sources?: typeof workbook.sources;
 lessons: (typeof workbook.lessons[number] & {time?: string})[];
};
export function getWorkbook(slug: string): Workbook | undefined {
 return slug === workbook.courseSlug ? workbook : slug === novemberWorkbook.courseSlug ? novemberWorkbook : slug === blpWorkbook.courseSlug ? blpWorkbook : undefined;
}
export const workbooks: Workbook[] = [workbook, novemberWorkbook, blpWorkbook];
export function workbookFile(value: Workbook): string {
 return value.courseSlug === novemberWorkbook.courseSlug ? 'november-workbook.pdf' : value.format === 'workshop' ? 'blp-workbook.pdf' : 'october-workbook.pdf';
}
export const workbookSaveSchema=z.object({courseId:z.uuid(),lessonKey:z.string(),revision:z.number().int().min(0).max(2147483646),answers:z.record(z.string(),z.union([z.string().max(6000),z.boolean()]))}).strict().superRefine((v,ctx)=>{
 const lesson=workbooks.flatMap(w=>w.lessons).find(l=>l.id===v.lessonKey);
 if(!lesson){ctx.addIssue({code:'custom',message:'Unknown lesson'});return;}
 const strings=new Set(lesson.fields.map(f=>f.id));
 const checks=new Set(lesson.checks.map((_,i)=>`${lesson.id}-check-${i}`));
 for(const [key,value] of Object.entries(v.answers)){
  if(!((strings.has(key)&&typeof value==='string')||(checks.has(key)&&typeof value==='boolean')))ctx.addIssue({code:'custom',message:'Invalid workbook answer'});
 }
});
