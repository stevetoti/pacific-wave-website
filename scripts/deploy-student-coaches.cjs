const {spawnSync}=require('child_process');
const fs=require('fs');
require('@next/env').loadEnvConfig(process.cwd());
(async()=>{
 const e=process.env,p=JSON.parse(fs.readFileSync('.vercel/project.json','utf8'));
 if(p.projectId!=='prj_DuwpSNfiGkHmLB2n5dJLaWmoZKde')throw Error('Wrong project');
 const keys=['ANAM_API_KEY','ANAM_PERSONA_ONBOARDING','ANAM_PERSONA_TECH_SUPPORT','ANAM_PERSONA_STRATEGY_COACH'];
 for(const k of keys)if(!e[k])throw Error('Missing '+k);
 const token=e.VERCEL_TOKEN;if(!token)throw Error('Missing Vercel token');
 const r=await fetch(`https://api.vercel.com/v10/projects/${p.projectId}/env?teamId=${p.orgId}&upsert=true`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(keys.map(key=>({key,value:e[key],type:'encrypted',target:['production']})))});
 if(!r.ok)throw Error('Vercel environment HTTP '+r.status);
 console.log('PWD-only Anam production settings stored; existing payment/email settings preserved.');
 const d=spawnSync('vercel',['deploy','--prod','--skip-domain','--yes','--token',token],{env:e,encoding:'utf8',maxBuffer:10*1024*1024});
 let output=d.stdout+'\n'+d.stderr;for(const key of [...keys,'VERCEL_TOKEN'])output=output.replaceAll(e[key],'[redacted]');
 fs.mkdirSync('.deployment',{recursive:true});fs.writeFileSync('.deployment/student-coaches-release.log',output);console.log(output);
 if(d.status!==0)throw Error('Deployment failed');
})();
