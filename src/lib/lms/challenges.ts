import { z } from 'zod';
export const challengeSchema = z.object({
 id:z.uuid().optional(), course_id:z.uuid(), title:z.string().trim().min(4).max(120),
 description:z.string().trim().min(20).max(3000), proof_instructions:z.string().trim().min(10).max(1500),
 prize:z.string().trim().min(4).max(300), max_winners:z.number().int().min(1).max(100),
 opens_at:z.iso.datetime({offset:true}), closes_at:z.iso.datetime({offset:true}), published:z.boolean(),
}).refine(v=>Date.parse(v.closes_at)>Date.parse(v.opens_at),'Closing time must follow opening time');
export const claimSchema=z.object({challenge_id:z.uuid(),evidence:z.string().trim().min(20).max(4000),evidence_url:z.union([z.literal(''),z.url().max(1000).refine(v=>new URL(v).protocol==='https:','Use an HTTPS evidence link')]),achieved_at:z.iso.datetime({offset:true})});
export type Challenge=z.infer<typeof challengeSchema>&{id:string;created_at:string};
export type Claim={id:string;challenge_id:string;user_id:string;evidence:string;evidence_url:string;achieved_at:string;submitted_at:string;status:'pending'|'verified'|'rejected'|'winner'|'delivered';review_note:string;student_name?:string;student_email?:string};
export const challengeDate=(v:string)=>new Date(v).toLocaleString('en-GB',{timeZone:'Pacific/Efate',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
export function challengePhase(c:Pick<Challenge,'opens_at'|'closes_at'>,now=Date.now()) {return now<Date.parse(c.opens_at)?'Upcoming':now>=Date.parse(c.closes_at)?'Closed':'Open';}
export const challengeIdeas=[
 {title:'Week 1 · Your first affiliate income',description:'Earn your first genuine affiliate commission during week 1. The earliest verified earning wins. A real customer must have paid; clicks, signups, self-referrals and cancelled or refunded sales do not qualify.',prize:'1 extra month of Digi Assist Pro',proof_instructions:'Share the affiliate platform, transaction reference, earning date and commission amount, plus an HTTPS link to redacted proof. Hide customer details, passwords and bank information.'},
 {title:'Week 2 · Your first affiliate income',description:'A fresh opportunity for students who have not yet earned an affiliate commission. Earn your first genuine affiliate income during week 2. The earliest verified earning wins. Previous affiliate earners, self-referrals and cancelled or refunded sales do not qualify.',prize:'1 extra month of Digi Assist Pro',proof_instructions:'Confirm this is your first affiliate commission. Share the platform, earning date, transaction reference and an HTTPS link to redacted proof.'},
 {title:'Launch your business page',description:'Publish a clear business page with your offer, contact details and a way for customers to enquire. The earliest verified qualifying launch during this challenge wins.',prize:'1 extra month of Digi Assist Pro',proof_instructions:'Share your live page link, launch date and a short explanation of the customer you serve and the offer you created.'},
 {title:'Win your first paying customer',description:'Apply your course skills to deliver a real product or service to your first paying customer during this challenge. The earliest verified qualifying payment wins. Self-purchases and refunded payments do not qualify.',prize:'Cash prize — set the approved amount before publishing',proof_instructions:'Describe your offer and first sale. Include a redacted receipt link, payment date and amount. Hide all customer personal details.'},
];
