export type CourseLanguage='en'|'bi'|'fr';
export function parseCourseLanguage(value:unknown):CourseLanguage{return value==='bi'||value==='fr'?value:'en';}
export function translateCourseText(text:string,language:CourseLanguage,dictionaries:Partial<Record<CourseLanguage,Record<string,string>>>){
 return language==='en'?text:dictionaries[language]?.[text.replace(/\s+/g,' ').trim()]||text;
}
