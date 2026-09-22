import {createClient} from '@supabase/supabase-js';import {randomUUID} from 'node:crypto';import assert from 'node:assert/strict';import {chromium} from '@playwright/test';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,db=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}),check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
const users=[],orders=[];let course,other,browser;
async function api(user,body,query=''){const r=await fetch('http://localhost:3100/api/lms-community'+query,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${user?.session?.access_token||''}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
try{
 for(let i=0;i<3;i++){const email=`community-qa-${randomUUID()}@example.com`,password=`QA-${randomUUID()}!`;const u=await check(db.auth.admin.createUser({email,password,email_confirm:true}));const client=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});const session=(await check(client.auth.signInWithPassword({email,password}))).session;users.push({id:u.user.id,email,session});}
 await check(db.from('admin_users').insert({email:users[2].email,name:'QA Instructor',role:'admin',site_id:'pacific-wave-digital',is_active:true}));
 for(let i=0;i<2;i++){const c=await check(db.from('pwd_lms_courses').insert({slug:`community-qa-${randomUUID()}`,title:'Community QA course',kind:'live',amount:100,currency:'VUV',published:false,private_sessions:false}).select().single());if(i===0)course=c;else other=c;}
 for(let i=0;i<2;i++){const o=await check(db.from('pwd_lms_orders').insert({user_id:users[i].id,course_id:course.id,email:users[i].email,name:`QA Student ${i+1}`,phone:'1234567',amount:100,currency:'VUV',status:'paid'}).select().single());orders.push(o);await check(db.from('pwd_lms_emails').delete().eq('order_id',o.id));}
 let list=await api(users[0],null,`?course=${course.id}`);assert.equal(list.status,200);assert.equal(list.data.channels.length,2);
 assert.equal((await api(null,null,`?course=${course.id}`)).status,401);
 assert.equal((await api(users[0],null,`?course=${other.id}`)).status,403);
 const lounge=list.data.channels.find(c=>!c.announcements),announcements=list.data.channels.find(c=>c.announcements);
 const send={action:'send',course:course.id,channel:lounge.id,body:'Hello classmates — my project is a local business website.',client_id:randomUUID()};assert.equal((await api(users[0],send)).status,200);assert.equal((await api(users[0],send)).status,200);
 let msgs=await api(users[1],null,`?course=${course.id}&channel=${lounge.id}`);assert.equal(msgs.data.messages.length,1);assert.equal(msgs.data.messages[0].author_name,'QA Student 1');
 assert.equal((await api(users[1],{action:'delete',course:course.id,channel:lounge.id,id:msgs.data.messages[0].id})).status,403);
 assert.equal((await api(users[0],{...send,channel:announcements.id,client_id:randomUUID()})).status,403);
 assert.equal((await api(users[2],{...send,channel:announcements.id,body:'Welcome! Bring your project questions to our next class.',client_id:randomUUID()})).status,200);
 const create={action:'create',course:course.id,name:'Website project team',description:'A private space to work on our website project.',private:true,members:[users[0].id]};assert.equal((await api(users[0],create)).status,403);const group=await api(users[2],create);assert.equal(group.status,200);
 assert.equal((await api(users[1],null,`?course=${course.id}&channel=${group.data.id}`)).status,403);
 assert.ok(!(await api(users[1],null,`?course=${course.id}`)).data.channels.some(c=>c.id===group.data.id));
 assert.equal((await api(users[0],{...send,channel:group.data.id,body:'Private project notes',client_id:randomUUID()})).status,200);
 assert.equal((await api(users[2],{action:'members',course:course.id,channel:group.data.id,members:[users[1].id]})).status,200);
 assert.equal((await api(users[0],null,`?course=${course.id}&channel=${group.data.id}`)).status,403);
 assert.equal((await api(users[1],null,`?course=${course.id}&channel=${group.data.id}`)).status,200);
 await api(users[2],{...send,body:'Great starting point. Define your ideal customer and the problem you are solving.',client_id:randomUUID()});
 browser=await chromium.launch();
 const adminPage=await browser.newPage({viewport:{width:1440,height:950}});
 await adminPage.addInitScript(({key,session})=>localStorage.setItem(key,JSON.stringify(session)),{key:`sb-${new URL(url).hostname.split('.')[0]}-auth-token`,session:users[2].session});
 await adminPage.goto('http://localhost:3100/admin/training-center');
 await adminPage.getByRole('button',{name:'Community',exact:true}).click();
 await adminPage.getByLabel('Choose a group course').selectOption(course.id);
 await adminPage.getByRole('button',{name:'Create group',exact:true}).click();
 await adminPage.getByLabel('Group name',{exact:true}).fill('UI project team');
 await adminPage.getByLabel('Description',{exact:true}).fill('Created using instructor controls');
 await adminPage.getByLabel('QA Student 1',{exact:true}).check();
 await adminPage.getByRole('button',{name:'Save group',exact:true}).click();
 await adminPage.getByRole('heading',{name:'UI project team',exact:true}).waitFor();
 await adminPage.getByRole('button',{name:'Manage members',exact:true}).click();
 await adminPage.getByLabel('QA Student 2',{exact:true}).check();
 await adminPage.getByRole('button',{name:'Save group',exact:true}).click();
 await adminPage.getByText('Group saved.',{exact:true}).waitFor();
 await adminPage.locator('.lms-community').screenshot({path:'.deployment/community-instructor.png'});
 await adminPage.close();
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:950}});
  await page.addInitScript(({key,session})=>localStorage.setItem(key,JSON.stringify(session)),{key:`sb-${new URL(url).hostname.split('.')[0]}-auth-token`,session:users[0].session});
  // Prevent background email dispatch while testing the visual student dashboard.
  await page.route('**/api/lms/dashboard',route=>route.fulfill({json:{orders:[orders[0]],progress:[]}}));
  await page.goto(`http://localhost:3100/training-center/course/${course.id}`);await page.getByRole('button',{name:'Community & groups'}).click();await page.getByRole('heading',{name:'Your course community'}).waitFor();await page.getByText('Hello classmates — my project is a local business website.',{exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('.lms-community').screenshot({path:`.deployment/community-${width}.png`});
  await page.getByLabel('Message Course lounge',{exact:true}).fill(`UI message at ${width}px`);await page.getByRole('button',{name:'Send message',exact:true}).click();await page.getByText(`UI message at ${width}px`,{exact:true}).waitFor();await page.close();
 }
 await check(db.from('pwd_lms_orders').update({status:'refunded'}).eq('id',orders[0].id));await check(db.from('pwd_lms_emails').delete().eq('order_id',orders[0].id));assert.equal((await api(users[0],null,`?course=${course.id}`)).status,403);
 console.log('PASS: student chat, instructor announcements, deduplication, moderation permissions, private groups, membership removal, course isolation, refunded denial, desktop/mobile UI sends.');
}finally{
 if(browser)await browser.close();
 for(const c of [course,other].filter(Boolean)){await check(db.from('pwd_lms_channels').delete().eq('course_id',c.id));await check(db.from('pwd_lms_lessons').delete().eq('course_id',c.id));await check(db.from('pwd_lms_orders').delete().eq('course_id',c.id));await check(db.from('pwd_lms_courses').delete().eq('id',c.id));}
 for(const u of users){await check(db.from('admin_users').delete().eq('email',u.email));await check(db.auth.admin.deleteUser(u.id));}console.log('Removed all synthetic courses, users, groups and messages. No notifications sent.');
}
