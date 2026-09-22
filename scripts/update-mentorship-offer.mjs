import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
const c=await check(db.from('pwd_lms_courses').select('id').eq('slug','one-on-one-mentorship').single());
const orders=await check(db.from('pwd_lms_orders').select('amount,status').eq('course_id',c.id));
console.log('Existing order amounts/statuses:',JSON.stringify(orders));
await check(db.from('pwd_lms_courses').update({amount:250000,description:'Three months of personal mentorship to build your business with AI, websites and ecommerce. Build one software project during the programme, with three free months of Digi Assist AI Pro.',introduction:'Welcome to your personal mentorship. The total fee is VUV 250,000 for all three months. With your mentor, you will build one software project during the programme and receive three free months of Digi Assist AI Pro. Continued Pro use after the free period requires a paid subscription. After payment confirmation, contact the training team to arrange your start date and session times. Your learning plan is tailored to your business idea and experience. Your mentor will publish your individual sessions, project notes and private recordings here for replay during and after training. Domains, hosting and other third-party tools are separate.'}).eq('id',c.id));
console.log('Mentorship fee and inclusions updated. Existing orders preserved.');
