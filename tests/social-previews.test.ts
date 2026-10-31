import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import sharp from "sharp";
import {affiliatePreview,isPreviewCrawler} from "../src/lib/seo/affiliate-preview";
import {socialCards,socialImage} from "../src/lib/seo/social-cards";
import {socialMetadata} from "../src/lib/seo/social-metadata";
import {affiliateLink} from "../src/lib/lms/affiliate-guide";

test("share crawlers get course HTML without a redirect or referral cookie",async()=>{
 for(const agent of ["WhatsApp/2.26.1 A","facebookexternalhit/1.1","Twitterbot/1.0","TelegramBot","LinkedInBot"]){
  const response=affiliatePreview(new Request('https://pacificwavedigital.com/go/TESTCODE?to=/vanuatu-training',{headers:{'user-agent':agent}}),'TESTCODE','/vanuatu-training')!;
  assert.equal(response.status,200);assert.equal(response.headers.get('set-cookie'),null);assert.equal(response.headers.get('location'),null);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('vary'),'User-Agent');
  const html=await response.text();assert.match(html,/<meta property="og:title" content="Build Your Business in 30 Days with AI"/);assert.ok(html.includes(socialImage('/vanuatu-training')));assert.match(html,/property="og:url" content="https:\/\/pacificwavedigital.com\/go\/TESTCODE\?to=%2Fvanuatu-training&amp;v=20261031"/);assert.ok(html.indexOf('property="og:image"')<html.indexOf('</head>'));
 }
 const human=new Request('https://x.test/go/TESTCODE',{headers:{'user-agent':'Mozilla/5.0 Chrome/140'}});assert.equal(affiliatePreview(human,'TESTCODE','/training-center'),null);assert.equal(isPreviewCrawler('Mozilla/5.0 Chrome/140'),false);
 const privateHtml=await affiliatePreview(new Request('https://x.test',{headers:{'user-agent':'WhatsApp'}}),'TESTCODE','/training-center/programs/blp-digital-skills-workshop')!.text();assert.ok(privateHtml.includes(socialImage('/training-center')));assert.ok(!privateHtml.includes('Business Link Pacific'));
 const unsafe=await affiliatePreview(new Request('https://x.test',{headers:{'user-agent':'WhatsApp'}}),'TEST<CODE','/training-center')!.text();assert.ok(!unsafe.includes('TEST<CODE'));
});
test("all public share cards have complete metadata and a small real1200x630JPEG",async()=>{
 assert.equal(new Set(socialCards.map(c=>c.path)).size,socialCards.length);
 for(const c of socialCards){const m=socialMetadata(c.path);assert.ok(m.twitter && 'card' in m.twitter);assert.equal(m.twitter.card,'summary_large_image');assert.ok(m.openGraph?.images);const bytes=await readFile(new URL('../public'+new URL(socialImage(c.path)).pathname,import.meta.url));const info=await sharp(bytes).metadata();assert.equal(info.width,1200);assert.equal(info.height,630);assert.equal(info.format,'jpeg');assert.ok(bytes.length<300000,c.path);}
 const link=new URL(affiliateLink('https://pacificwavedigital.com','TESTCODE','/vanuatu-training'));assert.equal(link.pathname,'/go/TESTCODE');assert.equal(link.searchParams.get('to'),'/vanuatu-training');assert.equal(link.searchParams.get('v'),'20261031');
});
