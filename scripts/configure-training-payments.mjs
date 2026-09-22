import{readFile,writeFile}from'node:fs/promises';
import{createClient}from'@supabase/supabase-js';
import Stripe from 'stripe';
const banks=JSON.parse(await readFile('.deployment/pwd-vuv-banks.json','utf8'));
if(banks.length!==2||banks.some(b=>b.currency!=='VUV')||new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname!=='rndegttgwtpkbjtvjgnc.supabase.co')throw new Error('Bank/project validation failed');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const saved=await db.from('pwd_lms_settings').upsert({id:'banks',value:banks});if(saved.error)throw new Error('Unable to save bank details');
const check=await db.from('pwd_lms_settings').select('value').eq('id','banks').single();if(check.error||JSON.stringify(check.data.value)!==JSON.stringify(banks)){
 if(check.error||check.data.value.length!==2||check.data.value.some(b=>b.currency!=='VUV'||!banks.some(x=>x.bank===b.bank&&x.account_number===b.account_number)))throw new Error('Bank verification failed');
}
console.log('ANZ and BRED Vatu accounts saved and verified. USD excluded.');
if(!process.argv.includes('--stripe'))process.exit();
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY,{timeout:15000,maxNetworkRetries:1});const url='https://pacificwavedigital.com/api/lms/stripe-webhook';const list=await stripe.webhookEndpoints.list({limit:100});if(list.data.some(e=>e.url===url)){console.log('Training endpoint already exists; no duplicate created.');process.exit();}
const endpoint=await stripe.webhookEndpoints.create({url,description:'Pacific Wave Digital training centre — activate after production launch',enabled_events:['checkout.session.completed','checkout.session.async_payment_succeeded','charge.refunded'],metadata:{application:'pwd_training_center'}},{idempotencyKey:'pwd-training-webhook-20260915'});
// Persist the newly returned endpoint-specific secret before any subsequent API call.
const envPath='.env.production.local';let env=await readFile(envPath,'utf8');env=env.replace(/^STRIPE_WEBHOOK_SECRET=.*$/m,()=>`STRIPE_WEBHOOK_SECRET=${endpoint.secret}`);await writeFile(envPath,env,{mode:0o600});
await stripe.webhookEndpoints.update(endpoint.id,{disabled:true});
await writeFile('.deployment/pwd-stripe-endpoint.json',JSON.stringify({id:endpoint.id,url,status:'disabled'},null,2));console.log('Dedicated training webhook created and disabled until the live release. Secret saved locally; no charges made.');
