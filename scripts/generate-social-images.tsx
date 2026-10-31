import React from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { socialCards, socialVersion } from "../src/lib/seo/social-cards";
async function main(){
const root=process.cwd(),out=join(root,"public/images/social",socialVersion);
await mkdir(out,{recursive:true});
const logo=`data:image/png;base64,${(await readFile(join(root,"public/images/training/pwd-logo.png"))).toString("base64")}`;
for(const c of socialCards){
 const photo=await sharp(join(root,"public",c.photo)).resize(450,630,{fit:"cover"}).png().toBuffer();
 const image=new ImageResponse(<div style={{display:"flex",width:1200,height:630,background:"#132b50",color:"white",fontFamily:"sans-serif"}}><div style={{display:"flex",flexDirection:"column",width:790,padding:"44px 46px",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:15}}><img alt="" src={logo} width={60} height={60}/><div style={{display:"flex",fontSize:21,fontWeight:700}}>PACIFIC WAVE DIGITAL</div></div><div style={{display:"flex",flexDirection:"column"}}><div style={{display:"flex",color:"#ffb49d",fontSize:18,letterSpacing:2,marginBottom:20}}>{c.label}</div><div style={{display:"flex",fontSize:c.title.length>65?45:c.title.length>42?51:63,fontWeight:700,lineHeight:1.13,letterSpacing:-1.6}}>{c.title}</div><div style={{display:"flex",fontSize:21,lineHeight:1.5,marginTop:23,color:"#e1e8f2"}}>{c.detail}</div></div><div style={{display:"flex",alignItems:"center",gap:15}}><div style={{display:"flex",width:48,height:5,background:"#ef5e33"}}/><div style={{display:"flex",fontSize:18,color:"#d7e1ee"}}>pacificwavedigital.com</div></div></div><div style={{display:"flex",width:410,position:"relative",borderLeft:"8px solid #ef5e33"}}><img alt="" src={`data:image/png;base64,${photo.toString("base64")}`} width={410} height={630} style={{objectFit:"cover"}}/></div></div>,{width:1200,height:630});
 const buffer=await sharp(Buffer.from(await image.arrayBuffer())).jpeg({quality:87,mozjpeg:true}).toBuffer();await writeFile(join(out,c.key+".jpg"),buffer);
}
console.log(`Generated ${socialCards.length} public1200×630 JPEG share cards.`);

}
main().catch(error=>{console.error(error);process.exitCode=1;});
