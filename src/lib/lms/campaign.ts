import { z } from 'zod';
import { trainingTemplate, escapeHtml } from '../email/training-template';
export const campaignSchema = z.object({
 id:z.uuid().optional(), revision:z.uuid().optional(), name:z.string().trim().min(2).max(120), subject:z.string().trim().min(3).max(180).regex(/^[^\r\n]+$/),
 body:z.string().trim().min(10).max(15000), button_text:z.string().trim().min(1).max(60), button_url:z.url().refine(v=>v.startsWith('https://'),'Use an HTTPS link'),
 audience:z.enum(['all','no_enrolment','unpaid','paid','not_in_course','leads']), course_id:z.union([z.uuid(),z.literal('')]).default('')
}).refine(v=>v.audience!=='not_in_course'||!!v.course_id,'Choose a course');
export type CampaignDraft=z.infer<typeof campaignSchema>;
export type Campaign=CampaignDraft & {id:string;revision:string;status:string;prepared:boolean;sandbox:boolean;created_at:string};
export function campaignContent(c:CampaignDraft,name='Student',unsubscribe?:string){
 const paragraphs=c.body.replaceAll('{{first_name}}',name.split(' ')[0]||'Student').split(/\n\s*\n/);
 const message=trainingTemplate({title:c.subject,intro:paragraphs[0],details:paragraphs.slice(1),action:c.button_text,url:c.button_url});
 if(unsubscribe){const footer=`<p style="text-align:center;font:12px Arial;padding:20px"><a href="${escapeHtml(unsubscribe)}">Unsubscribe from training campaign emails</a></p>`;message.html=message.html.replace('</body>',footer+'</body>');message.text+='\n\nUnsubscribe from training campaign emails: '+unsubscribe;}
 return message;
}
export const audiences={all:'All student accounts',no_enrolment:'Accounts with no course registration',unpaid:'Payment incomplete / awaiting review',paid:'Paid / enrolled students',not_in_course:'Students not registered for a selected course',leads:'October leads who opted into future training'};
