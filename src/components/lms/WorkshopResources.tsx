'use client';
import { useEffect, useState } from 'react';
import { Download, Eye, X } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';
import { workshopResources } from '@/lib/lms/workshop-resources';
export default function WorkshopResources() {
  const [busy,setBusy] = useState(false), [error,setError] = useState('');
  const [preview,setPreview] = useState<{url:string;title:string}|null>(null);
  useEffect(() => () => { if(preview) URL.revokeObjectURL(preview.url); }, [preview]);
  async function open(key: keyof typeof workshopResources, download: boolean) {
    setBusy(true); setError('');
    try {
      const r = await authFetch(`/api/lms-workshop-resources?resource=${key}`);
      if (!r.ok) throw Error((await r.json()).error || 'Resource unavailable.');
      const url = URL.createObjectURL(await r.blob());
      if(download) {
        const a = document.createElement('a');a.href=url;a.download=workshopResources[key].file;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      } else setPreview({url,title:workshopResources[key].title});
    } catch(e) {setError(e instanceof Error ? e.message : 'Please try again.');} finally {setBusy(false);}
  }
  return <section className="lms-panel"><h2>Your workshop resources</h2><p>Read or download your approved participant workbook, course outline and facilitator guide. Session recordings will appear in each lesson when your instructor publishes them.</p>
    <div className="blp-resource-grid">{(Object.keys(workshopResources) as (keyof typeof workshopResources)[]).map(key=><article key={key}><h3>{workshopResources[key].title}</h3><p>Approved workshop PDF</p><div className="blp-resource-actions"><button className="lms-button" disabled={busy} aria-label={`View ${workshopResources[key].title}`} onClick={()=>open(key,false)}><Eye size={18}/>View</button><button className="lms-text" disabled={busy} aria-label={`Download ${workshopResources[key].title}`} onClick={()=>open(key,true)}><Download size={18}/>Download</button></div></article>)}</div>
    {error && <p role="alert" className="lms-alert">{error}</p>}
    {preview && <section aria-label="Document preview"><div className="blp-resource-actions"><h3>{preview.title}</h3><a href={preview.url} target="_blank" rel="noreferrer">Open PDF in new tab</a><button className="lms-text" onClick={()=>setPreview(null)}><X size={18}/>Close preview</button></div><iframe title={preview.title} src={preview.url} style={{width:'100%',height:640,border:'1px solid #dbe2ec',borderRadius:12}} /></section>}
  </section>;
}
