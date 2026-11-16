import type { CourseLanguage } from './course-language';
const weekdays: Record<string,string> = {Sunday:'Sande',Monday:'Mande',Tuesday:'Tusde',Wednesday:'Wenesde',Thursday:'Tasde',Friday:'Fraede',Saturday:'Sarede',Sun:'Sande',Mon:'Mande',Tue:'Tusde',Wed:'Wenesde',Thu:'Tasde',Fri:'Fraede',Sat:'Sarede'};
const months: Record<string,string> = {January:'Januware',February:'Februware',March:'Maj',April:'Eprel',May:'Mei',June:'Jun',July:'Julae',August:'Ogis',September:'Septemba',October:'Oktoba',November:'Novemba',December:'Disemba',Jan:'Januware',Feb:'Februware',Mar:'Maj',Apr:'Eprel',Jun:'Jun',Jul:'Julae',Aug:'Ogis',Sep:'Septemba',Sept:'Septemba',Oct:'Oktoba',Nov:'Novemba',Dec:'Disemba'};
export function formatCourseDate(value: string|Date, language: CourseLanguage, options: Intl.DateTimeFormatOptions): string {
  const formatter = new Intl.DateTimeFormat(language==='fr'?'fr-FR':'en-GB',options);
  return formatter.formatToParts(new Date(value)).map(part => language==='bi' ? (part.type==='weekday'?weekdays[part.value]:part.type==='month'?months[part.value]:undefined) || part.value : part.value).join('');
}
