import Stripe from 'stripe';
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY,{timeout:15000,maxNetworkRetries:1});
const account=await stripe.accounts.retrieve();
const spec=await stripe.countrySpecs.retrieve(account.country);
const endpoints=await stripe.webhookEndpoints.list({limit:100});
console.log(JSON.stringify({country:account.country,charges_enabled:account.charges_enabled,payouts_enabled:account.payouts_enabled,business_name:account.business_profile?.name,vuv_supported:spec.supported_payment_currencies.includes('vuv'),pwd_endpoint:endpoints.data.filter(e=>e.url==='https://pacificwavedigital.com/api/lms/stripe-webhook').map(e=>({id:e.id,status:e.status,events:e.enabled_events}))}));
