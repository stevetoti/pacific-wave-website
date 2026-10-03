import 'server-only';
import {readFile} from 'node:fs/promises';
import {PDFDocument,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {workbook} from '@/lib/lms/workbook-schema';
export async function workbookPdf(rows:{lesson_key:string;answers:Record<string,string|boolean>}[]){
 const doc=await PDFDocument.load(await readFile(process.cwd()+'/resources/october-workbook.pdf'));
 doc.registerFontkit(fontkit);
 const font=await doc.embedFont(await readFile(process.cwd()+'/resources/workbook-font.ttf'),{subset:true});
 const logo=await doc.embedPng(await readFile(process.cwd()+'/public/images/training/pwd-logo.png'));
 let page=doc.addPage([595,842]),y=735;
 const navy=rgb(35/255,60/255,111/255),orange=rgb(239/255,94/255,51/255);
 function header(){page.drawImage(logo,{x:42,y:779,width:35,height:35});page.drawText('PACIFIC WAVE DIGITAL',{x:90,y:798,font,size:13,color:navy});page.drawText('MY WORKBOOK ANSWERS',{x:90,y:780,font,size:9,color:navy});page.drawLine({start:{x:42,y:765},end:{x:553,y:765},thickness:2,color:orange});page.drawText(`Private export | ${new Date().toISOString().slice(0,10)}`,{x:42,y:30,font,size:8,color:navy});y=735;}
 function para(text:string,size=11){
  const lines:string[]=[];
  for(const block of text.replace(/\r/g,'').split('\n')){
   let line='';
   for(const word of block.split(/\s+/)){
    const candidate=line ? line+' '+word : word;
    if(font.widthOfTextAtSize(candidate,size)<=505){line=candidate;continue;}
    if(line){lines.push(line);line='';}
    for(const char of word){if(font.widthOfTextAtSize(line+char,size)>505&&line){lines.push(line);line=char;}else line+=char;}
   }lines.push(line);
  }
  for(const line of lines){if(y<55){page=doc.addPage([595,842]);header();}page.drawText(line,{x:44,y,font,size,color:navy});y-=size+6;}y-=9;
 }
 header();para('Your saved responses',20);para('The complete workbook comes first. This private answer section contains your saved activity responses and self-checks. Unsaved changes are not included.');
 for(const l of workbook.lessons){page=doc.addPage([595,842]);header();para(`Class ${l.number} | ${l.date} | 3–5 pm Vanuatu`,10);para(l.title,17);
  const answers=rows.find(r=>r.lesson_key===l.id)?.answers||{};
  for(const f of l.fields){para(f.label,12);para(typeof answers[f.id]==='string' ? String(answers[f.id])||'Not answered' : 'Not answered');}
  para('Self-checks',13);l.checks.forEach((c,i)=>para(`${answers[`${l.id}-check-${i}`]===true?'Completed':'Not checked'}: ${c}`));
 }
 return doc.save();
}
