import {createClient} from '@supabase/supabase-js';
import Stripe from 'stripe';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY,{timeout:15000});
const check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
let uid,orderId,sessionId;
try{
 const c=await check(db.from('pwd_lms_courses').select('*').eq('slug','one-on-one-mentorship').single());
 assert.equal(c.amount,250000);assert.equal(c.enrollment_open,true);
 const email=`mentorship-checkout-${randomUUID()}@example.com`,password=`QA-${randomUUID()}!`;
 uid=(await check(db.auth.admin.createUser({email,password,email_confirm:true}))).user.id;
 const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
 const token=(await check(client.auth.signInWithPassword({email,password}))).session.access_token;
 orderId=(await check(db.from('pwd_lms_orders').insert({course_id:c.id,user_id:uid,name:'Unpaid mentorship checkout QA',email,phone:'1234567',amount:c.amount,currency:c.currency}).select('id').single())).id;
 await check(db.from('pwd_lms_emails').delete().eq('order_id',orderId));
 const r=await fetch('https://pacificwavedigital.com/api/lms/checkout',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({id:orderId})});
 assert.equal(r.status,200);const d=await r.json();assert.ok(d.url.startsWith('https://checkout.stripe.com/'));
 sessionId=(await check(db.from('pwd_lms_orders').select('stripe_session').eq('id',orderId).single())).stripe_session;
 const s=await stripe.checkout.sessions.retrieve(sessionId,{expand:['line_items.data.price.product']});
 assert.equal(s.amount_total,250000);assert.equal(s.currency,'vuv');assert.equal(s.payment_status,'unpaid');assert.equal(s.metadata.pwd_order_id,orderId);assert.equal(s.line_items.data[0].price.product.name,'One on One Mentorship Program');
 console.log('PASS: live application checkout creates an unpaid Stripe session for One on One Mentorship Program at VUV 250,000.');
}finally{
 if(sessionId){await stripe.checkout.sessions.expire(sessionId);}
 else if(orderId){const o=await check(db.from('pwd_lms_orders').select('stripe_session').eq('id',orderId).single());if(o?.stripe_session)await stripe.checkout.sessions.expire(o.stripe_session);}
 if(orderId){await check(db.from('pwd_lms_emails').delete().eq('order_id',orderId));await check(db.from('pwd_lms_lessons').delete().eq('order_id',orderId));await check(db.from('pwd_lms_orders').delete().eq('id',orderId));}
 if(uid)await check(db.auth.admin.deleteUser(uid));
 console.log('Unpaid session expired; all temporary records removed. No card charge or email sent.');
}
