import test from 'node:test';
import assert from 'node:assert/strict';
import { blpSlug, workshopRecordingPending } from '../src/lib/lms/blp-workshop';
test('BLP completion stays locked until an uploaded or linked recording exists; other courses are unchanged',()=>{
  const blp={slug:blpSlug};
  assert.equal(workshopRecordingPending(blp,{has_recording:false,youtube_id:''}),true);
  assert.equal(workshopRecordingPending(blp,{has_recording:true}),false);
  assert.equal(workshopRecordingPending(blp,{recording_path:'private/lesson.mp4'}),false);
  assert.equal(workshopRecordingPending(blp,{youtube_id:'published-id'}),false);
  assert.equal(workshopRecordingPending({slug:'public-course'},{}),false);
});
test('progress API rejects completing a BLP preview without writing progress',async()=>{
  process.env.NEXT_PUBLIC_SUPABASE_URL='https://blp-preview-tests.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='fixture-key';
  const {POST}=await import('../src/app/api/lms/[action]/route');
  const original=globalThis.fetch;const paths:string[]=[];
  globalThis.fetch=async(url)=>{
    const path=String(url);paths.push(path);
    let data:unknown={};
    if(path.includes('/auth/v1/user'))data={id:'22222222-2222-4222-8222-222222222222',email:'test@example.com',email_confirmed_at:new Date().toISOString()};
    else if(path.includes('/pwd_lms_lessons'))data={id:'11111111-1111-4111-8111-111111111111',course_id:'33333333-3333-4333-8333-333333333333',quiz:[],recording_path:null,youtube_id:'',pwd_lms_courses:{slug:blpSlug}};
    else if(path.includes('/pwd_lms_orders'))data={id:'44444444-4444-4444-8444-444444444444'};
    else throw Error('Unexpected request: '+path);
    return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
  };
  try{
    const response=await POST(new Request('https://example.com/api/lms/progress',{method:'POST',headers:{authorization:'Bearer fixture-token','Content-Type':'application/json'},body:JSON.stringify({lesson_id:'11111111-1111-4111-8111-111111111111',answers:[]})}),{params:Promise.resolve({action:'progress'})});
    assert.equal(response.status,409);assert.match((await response.json()).error,/cannot be marked complete yet/);
    assert.ok(!paths.some(path=>path.includes('/pwd_lms_progress')));
  }finally{globalThis.fetch=original;}
});
