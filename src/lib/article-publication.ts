import { createHash } from 'node:crypto';
export interface PublicationPost { id:string; site_id:string; title:string; slug:string; content:string; excerpt:string|null; focus_keyword:string|null; keywords:unknown; image_url:string|null; image_alt:string|null; published:boolean; updated_at?:string|null }
export interface PublicationAction { id:string; action_type:string; status:string; company_id:string; payload:Record<string,unknown> }
export const PUBLICATION_SITES = {
 pwd:{kind:'pwd_weekly_review_v1',company:'030ff2e6-aefd-4c88-acc5-18c69e526c55',origin:'https://pacificwavedigital.com'},
 gdp:{kind:'gdp_weekly_review_v1',company:'31aad8d2-bc59-4f92-8529-41b87e0da3de',origin:'https://www.globaldigitalprime.com'},
 digiassist:{kind:'digiassist_weekly_review_v1',company:'31aad8d2-bc59-4f92-8529-41b87e0da3de',origin:'https://digiassistai.com'},
 visareadypro:{kind:'visareadypro_weekly_review_v1',company:'31aad8d2-bc59-4f92-8529-41b87e0da3de',origin:'https://www.visareadypro.com'},
 vanuconnect:{kind:'vanuconnect_weekly_review_v1',company:'48d9de65-206c-497b-ad56-be229a445bfa',origin:'https://vanuconnect.com'},
 edusmartassist:{kind:'edusmartassist_weekly_review_v1',company:'31aad8d2-bc59-4f92-8529-41b87e0da3de',origin:'https://edusmartassist.com'},
} as const;
export type PublicationSite = keyof typeof PUBLICATION_SITES;
export interface PublicationRun { state:'publishing'|'retry'|'blocked'|'published'; attempt:number; updatedAt:string; nextAttempt?:string; error?:string; url?:string; fingerprint?:string }
export function fingerprint(post:PublicationPost):string {
 const value=post.site_id==='pwd' ? [post.site_id,post.id,post.title,post.content,post.excerpt,post.slug,post.focus_keyword,post.image_url,post.image_alt] : Object.fromEntries(['content','excerpt','focus_keyword','id','image_alt','image_url','keywords','site_id','slug','title'].map(key=>[key,post[key as keyof PublicationPost]??null]));
 return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
export function approvedPublication(action:PublicationAction,post:PublicationPost) {
 const site=post.site_id as PublicationSite;const config=PUBLICATION_SITES[site];
 if(!config || action.status!=='approved' || action.action_type!=='custom' || action.company_id!==config.company || action.id!==post.id || action.payload.post_id!==post.id || action.payload.site_id!==site || action.payload.kind!==config.kind) throw new Error('Approval identity or business does not match; review required');
 if(action.payload.fingerprint!==fingerprint(post) || action.payload.content!==post.content || action.payload.title!==post.title) throw new Error('Article changed after approval; a refreshed approval is required');
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug))throw new Error('Invalid article slug');
 return {site,...config,url:config.origin+'/blog/'+post.slug};
}
export function canClaim(run:PublicationRun|undefined,now:Date) {
 if(!run)return true;
 if(run.state==='published'||run.state==='blocked'||run.attempt>=8)return false;
 if(run.state==='publishing')return now.getTime()-Date.parse(run.updatedAt)>15*60*1000;
 return !run.nextAttempt||Date.parse(run.nextAttempt)<=now.getTime();
}
export function articleImages(post:PublicationPost):string[]{
 const inline=[...Array.from(post.content.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi),m=>m[1]),...Array.from(post.content.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g),m=>m[1])];
 const images=Array.from(new Set([post.image_url||'',...inline].filter(Boolean)));
 if(images.length<3)throw new Error('Three distinct article images are required before publication');
 const origin=PUBLICATION_SITES[post.site_id as PublicationSite]?.origin;
 for(const value of images){
  const url=new URL(value,origin);
  const owned=url.origin===origin&&(url.pathname.startsWith('/images/')||(post.site_id==='visareadypro'&&url.pathname.startsWith('/media/')));
  const stored=url.origin==='https://rndegttgwtpkbjtvjgnc.supabase.co'&&url.pathname.startsWith('/storage/v1/object/public/site-assets/'+post.site_id+'/');
  if(url.protocol!=='https:'||url.username||url.password||(!owned&&!stored))throw new Error('Article image is outside the approved business assets');
 }
 return images;
}
export function assertLiveArticle(html:string,url:string,title:string) {
 const links=Array.from(html.matchAll(/<link\b[^>]*>/gi),m=>m[0]);
 const canonical=links.filter(tag=>/rel=["']canonical["']/i.test(tag)).map(tag=>tag.match(/href=["']([^"']+)["']/i)?.[1]);
 if(canonical.length!==1||canonical[0]!==url)throw new Error('Waiting for the intended live canonical');
 if(/<meta[^>]+(?:name=["']robots["'])[^>]+content=["'][^"']*noindex/i.test(html))throw new Error('Published page is noindex');
 const normalize=(s:string)=>s.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#x27;|&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
 const headings=Array.from(html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi),m=>normalize(m[1]));
 if(headings.length!==1||headings[0]!==normalize(title))throw new Error('Waiting for the approved article title on the live page');
}
