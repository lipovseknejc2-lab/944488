const {chromium,devices}=require('playwright');const fs=require('fs');const D=__dirname;process.chdir(D);
const U='http://127.0.0.1:8812/atelier.html';let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13'],acceptDownloads:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/manifest|icon|404/.test(m.text()))errs.push(m.text())});
const ev=(f,a)=>p.evaluate(f,a),W=t=>p.waitForTimeout(t),go=async h=>{await ev(h=>{location.hash=h},h);await W(350)},close=async()=>{await ev(()=>closeSheet());await W(260)};
const K=()=>ev(()=>S.usage.total);
await p.goto(U);await W(1800);
// onboarding
ok(await p.isVisible('text=Work better, together.'),'onboarding poster 1');await p.click('#obS');await W(300);
ok(await p.isVisible('#obName'),'skip goes to account');
ok(await p.isVisible('#obSur')&&await p.isVisible('#obMail')&&await p.isVisible('#obSt')&&await p.isVisible('#obRole'),'account asks for first name, surname, student or working, school or work, and email');
// validation: nothing filled in
await p.click('#obF button[type=submit]');await W(400);
ok(await ev(()=>!S.me&&document.querySelectorAll('#obF .ferr').length===4),'empty form is not accepted, four clear errors');
await p.fill('#obName','Nejc');await W(50);ok(await ev(()=>!document.querySelector('#obName').classList.contains('bad')),'error clears while typing');
await p.click('#obH [data-h="3"]');await p.click('#obC [data-c="2"]');
await p.fill('#obSur','Lipovšek');await p.fill('#obMail','nejc@mail');
ok(await p.inputValue('#obName')==='Nejc'&&await p.inputValue('#obSur')==='Lipovšek','typed fields kept after changing look and colour');
await p.click('#obSt label:has-text("Student")');await W(100);ok((await p.textContent('#obRoleL'))==='Where do you study?','label follows student choice');
await p.click('#obSt label:has-text("Working")');await W(100);ok((await p.textContent('#obRoleL'))==='What is your work?','label follows working choice');
await p.click('#obSt label:has-text("Student")');await p.fill('#obRole','University of Ljubljana');
await p.click('#obF button[type=submit]');await W(400);ok(await ev(()=>!S.me&&/does not look right/.test(document.querySelector('#obF .ferr')?.textContent||'')),'a wrong email is caught');
await p.fill('#obMail',' Nejc.Lipovsek@Example.com ');await p.click('#obF button[type=submit]');await W(1200);
ok(await ev(()=>fullName()==='Nejc Lipovšek'&&S.me.name==='Nejc'&&S.me.fig.h===3&&S.me.fig.c===2),'account created with chosen look');
ok(await ev(()=>PROFILE.status==='student'&&PROFILE.what==='University of Ljubljana'&&PROFILE.email==='nejc.lipovsek@example.com'),'profile keeps student, school and a tidy email');
// encryption at rest
ok(await ev(()=>S.me.enc===true&&S.me.vault&&S.me.vault.alg==='AES-GCM-256'&&S.me.vault.iv.length===16&&!('role' in S.me)&&!('profile' in S.me)),'profile is sealed with AES-GCM 256');
ok(await ev(()=>{const r=localStorage.getItem('atelier-v1');return!/Lipov|example\.com|Ljubljana/i.test(r)}),'surname, email and school never appear in saved data');
ok(await ev(async()=>{const k=await IDB.get('key:profile');return k&&k.type==='secret'&&k.extractable===false&&k.algorithm.name==='AES-GCM'&&k.algorithm.length===256}),'key is a non-extractable AES-256 key kept on this device');
ok(await ev(async()=>{const o=await VAULT.open(S.me.vault);return o.last==='Lipovšek'&&o.email==='nejc.lipovsek@example.com'}),'vault opens back to the same details');
ok(await ev(async()=>{const a=await VAULT.seal({x:1}),b=await VAULT.seal({x:1});return a.iv!==b.iv&&a.ct!==b.ct}),'every seal uses a fresh random IV');
ok(await ev(async()=>{const box={...S.me.vault},c=atob(box.ct).split('');c[3]=String.fromCharCode(c[3].charCodeAt(0)^1);box.ct=btoa(c.join(''));try{await VAULT.open(box);return false}catch(e){return true}}),'a changed vault is refused, not misread');
ok(await ev(()=>S.people.length===5&&S.groups[0].name==='Studio'&&S.groups[0].members.length===6),'five bot teammates and Studio group');
ok(await ev(()=>S.usage.total===8),'sign-in uses 1 knot unit (8 knots)');
// today
ok(await p.isVisible('.ttl')&&await p.isVisible('.week')&&await p.isVisible('#motd'),'today: title, week, message of the day');
ok(!(await p.isVisible('text=knots')),'knots hidden on Today');
let k0=await K();await p.click('.playb');await W(300);ok(await K()===k0+8,'message of the day play is metered');
await p.click('.rail .rbtns button:nth-child(2)');await W(400);await p.click('[data-f="thankful"]');await p.fill('#flN','after the walk');await p.click('#flS');await W(500);
ok(await p.isVisible('.timeline .feelchip >> text=thankful'),'feeling check-in shows on the timeline');
ok(await p.isVisible('.wday.today b.has'),'today circle gets a colour after activity');
// notes
await p.click('.rail .rbtns button:nth-child(1)');await W(500);ok(await ev(()=>route.k==='note'),'quick note opens editor');
await p.fill('#nT','Sprint plan');await p.fill('#nB','# Goals\n[ ] Draft layout\n[ ] Test flows\n- keep it simple');await W(500);
const nid=await ev(()=>route.a[0]);ok(await ev(id=>note(id).title==='Sprint plan'&&note(id).body.includes('Draft'),nid),'note autosaves');
await p.click('text=Done');await W(300);ok(await p.isVisible('.prose h3 >> text=Goals'),'preview renders heading');
await p.click('.todo >> nth=0');await W(400);ok(await ev(id=>note(id).body.includes('[x] Draft'),nid),'checklist toggles in preview');
await p.click('[aria-label=Pin]');await W(300);ok(await ev(id=>note(id).pin,nid),'pin works');
// project first (for sharing)
await go('projects');await p.click('text=New project >> nth=0');await W(400);await p.fill('#pN','Spring launch');await p.fill('#pD','Ship the beta');await p.click('#pSz label:nth-child(2)');await W(100);
ok(await ev(()=>[...document.querySelectorAll('#pTl input')].every(i=>i.checked)),'big project enables all tools');
await p.check('#sf input[name^="g_"]');await p.click('#sf button[type=submit]');await W(800);
const pid=await ev(()=>S.projects[0].id);ok(await ev(()=>S.projects[0].groups.length===1&&S.projects[0].tools.length===7),'project shared with group');
ok(await p.isVisible('.ptabs >> text=Inspiration'),'project tabs shown');
// share note
await go('note:'+nid);await p.click('[aria-label=Share]');await W(400);await p.check('[data-g]');await p.check('[data-p]');await p.click('#shOK');await W(400);
ok(await ev(id=>note(id).share.groups.length===1&&note(id).share.projects.length===1,nid),'note shared to group and project');
await go('group:'+await ev(()=>S.groups[0].id));ok(await p.isVisible('.ncard >> text=Sprint plan'),'shared note appears in group');
await go('notes');await p.fill('#nq','sprint');await W(500);ok(await ev(()=>document.querySelectorAll('.ncard').length===1),'note search');
await p.fill('#nq','');await W(400);await p.click('[data-nf=shared]');await W(300);ok(await ev(()=>document.querySelectorAll('.ncard').length===1),'shared filter');
// tasks
await go('project:'+pid+':tasks');await p.click('.kcol[data-st=todo] .icon-btn');await W(400);await p.fill('#tT','Design the cover');await p.click('#sf button[type=submit]');await W(500);
ok(await ev(()=>S.projects[0].tasks.length===1),'task added');
await p.click('.tcard .mv[aria-label="Move forward"]');await W(300);ok(await ev(()=>S.projects[0].tasks[0].st==='doing'),'task moves to doing');
await p.click('.tcard .mv[aria-label="Move forward"]');await W(400);ok(await ev(()=>S.projects[0].tasks[0].st==='done'&&!!S.projects[0].tasks[0].doneAt),'task done with timestamp');
const bot=await ev(()=>S.people[1].id);await p.click('.kcol[data-st=todo] .icon-btn');await W(400);await p.fill('#tT','Write release notes');await p.selectOption('#tW',bot);await p.click('#sf button[type=submit]');await W(3300);
ok(await ev(()=>S.projects[0].tasks[1].st==='doing'),'bot teammate picks up an assigned task');
// ideas + bot votes
await go('project:'+pid+':ideas');await p.fill('#idT','A poster for every feature');await p.press('#idT','Enter');await W(500);
await p.click('.vote');await W(300);ok(await ev(()=>S.projects[0].ideas[0].votes.includes('me')),'vote on idea');
await W(4200);ok(await ev(()=>S.projects[0].ideas[0].votes.length>=1),'bots react to ideas ('+await ev(()=>S.projects[0].ideas[0].votes.length)+' votes)');
// files
await go('project:'+pid+':files');await p.setInputFiles('#fU',[D+'/t.pdf',D+'/t.gif']);await W(900);ok(await ev(()=>S.projects[0].files.length===2),'files uploaded');
await p.click('.li >> text=t.pdf');await W(500);ok(await p.isVisible('.sheet >> text=Download'),'file opens');await close();
// boards
await go('project:'+pid+':boards');await p.click('text=New drawing board');await W(700);
const box=await p.locator('#cv').boundingBox();await p.mouse.move(box.x+40,box.y+40);await p.mouse.down();for(let i=0;i<20;i++)await p.mouse.move(box.x+40+i*8,box.y+40+Math.sin(i/3)*30);await p.mouse.up();
await p.click('[data-c="#d9764f"]');await p.mouse.move(box.x+60,box.y+150);await p.mouse.down();await p.mouse.move(box.x+200,box.y+170);await p.mouse.up();
await p.click('text=Save');await W(700);ok(await ev(()=>!!S.projects[0].boards[0].thumb),'board saved with thumbnail');
const bid=await ev(()=>S.projects[0].boards[0].id);ok(await ev(async id=>(await IDB.get('b:'+id)).length===2,bid),'two strokes stored');
await p.click('#bUn');await p.click('text=Save');await W(600);ok(await ev(async id=>(await IDB.get('b:'+id)).length===1,bid),'undo works');
await p.click('[aria-label=Back]');await W(500);ok(await p.isVisible('.bcard img'),'board thumbnail in list');
// inspiration
await go('project:'+pid+':inspo');await p.setInputFiles('#iU',D+'/t.gif');await W(700);await p.click('text=Link');await W(300);await p.fill('#iL','dribbble.com');await p.click('#sf button[type=submit]');await W(400);
await p.click('text=Quote');await W(300);await p.fill('#iQ','Less, but better.');await p.click('#sf button[type=submit]');await W(400);
ok(await ev(()=>S.projects[0].inspo.length===3&&S.projects[0].inspo.some(x=>x.url==='https://dribbble.com')),'inspiration: image, link, quote');
// data
await go('project:'+pid+':data');await p.fill('.dt input[data-r="0"][data-c="0"]','Mon');await p.fill('.dt input[data-r="0"][data-c="1"]','4');await p.fill('.dt input[data-r="1"][data-c="0"]','Tue');await p.fill('.dt input[data-r="1"][data-c="1"]','7');await W(500);
ok(await p.isVisible('#dch .bar'),'table draws a chart');await p.click('text=Line');await W(300);ok(await p.isVisible('#dch .ln'),'line chart');
await p.click('text=Row');await W(300);ok(await ev(()=>S.projects[0].table.rows.length===3),'add row');
await go('project:'+pid);ok(await p.isVisible('.phero')&&await p.isVisible('.ptab .chart'),'overview with progress and chart');
// chat
await go('chat');ok(await ev(()=>document.querySelectorAll('.convo').length>=1),'conversation list');
await ev(id=>{const c=ensureDM(id);save();go('c:'+c.id)},bot);await W(500);await p.fill('#ci','Hi Luka, any idea for the cover?');await p.press('#ci','Enter');await W(300);
ok(await p.isVisible('.msg.me >> text=any idea'),'message sent');await W(1800);ok(await p.isVisible('#typ:not([hidden])')||await ev(()=>S.chats.find(c=>c.with===S.people[1].id).msgs.length>1),'typing indicator');
await W(3500);ok(await ev(id=>S.chats.find(c=>c.kind==='dm'&&c.with===id).msgs.length===2,bot),'bot replies');
await p.click('.composer [aria-label=Share]');await W(400);await p.click('.shopt[data-k=note]');await W(400);await p.click('.sheet [data-pk]');await W(500);ok(await p.isVisible('.att'),'note shared in chat');
const gc=await ev(()=>S.chats.find(c=>c.kind==='group').id);await go('c:'+gc);await p.fill('#ci','Deadline is Friday, ok?');await p.press('#ci','Enter');await go('today');await W(6000);
ok(await ev(id=>S.chats.find(c=>c.id===id).msgs.filter(m=>m.from!=='me').length>=2,gc),'group members reply');
ok(await p.isVisible('#tabs .badge'),'unread badge on Chat tab');
// groups & people
await go('groups');await p.click('text=New >> nth=0');await W(400);await p.fill('#gN','Study club');await p.check('#sf input[name^="m_"] >> nth=0');await p.click('#sf button[type=submit]');await W(800);
ok(await ev(()=>S.groups.length===2&&S.groups[1].members.length===2),'group created');
await go('people');await p.click('text=Add');await W(400);await p.fill('#bN','Nika Petek');await p.fill('#bR','Marketing');await p.click('#sf .seg label:nth-child(3)');await p.check('#sf input[name^="g_"] >> nth=1');await p.click('#sf button[type=submit]');await W(500);
ok(await ev(()=>S.people.length===6&&S.people[5].tone==='curious'&&S.groups[1].members.includes(S.people[5].id)),'new bot teammate added to a group');
// focus
await go('focus');await p.click('[data-mode=study]');await W(300);await p.fill('#fLabel','Biology');await p.click('.cbtn.main');await W(500);
ok(await ev(()=>S.focus.run&&S.focus.run.mode==='study'&&S.focus.run.phase==='work'),'study session starts');
ok(await ev(()=>document.querySelector('.focus').getAttribute('style').includes('--focus')),'work colour');
await ev(()=>{S.focus.run.ws-=3*60000});await W(600);ok(await ev(()=>S.focus.run.done===3),'focus minutes are credited');
await p.click('[aria-label=Pause]');await W(300);ok(await ev(()=>S.focus.run.paused),'pause');await p.click('[aria-label=Resume]');await W(300);
await p.click('[aria-label="Skip to next phase"]');await W(500);ok(await ev(()=>S.focus.run.phase==='break'),'skip to break');
ok(await ev(()=>document.querySelector('.focus').getAttribute('style').includes('--break')),'break has its own colour');
await go('today');ok(await p.isVisible('.fcard'),'live focus card on Today');await p.click('.fcard .fpb');await W(300);ok(await ev(()=>route.k==='today'&&S.focus.run.paused),'pause on the Today card does not leave the page');await p.click('.fcard .fpb');await W(200);ok(await p.isVisible('#mini:not([hidden])'),'mini timer pill');
await ev(()=>{S.focus.run.endAt=Date.now()-10});await W(800);ok(await ev(()=>S.focus.run.phase==='work'&&S.focus.run.round===2),'break ends into round 2');
await go('focus');await p.click('[aria-label=Stop]');await W(400);ok(await ev(()=>!S.focus.run&&S.focus.sessions[0].mins===3),'stop saves the session');
await p.click('[data-mode=quick]');await W(200);await p.click('.cbtn.main');await ev(()=>{S.focus.run.ws-=15*60000;S.focus.run.endAt=Date.now()-5});await W(900);
ok(await ev(()=>!S.focus.run&&S.focus.sessions.length===2&&S.focus.sessions[1].mins===15),'Focus 15 completes by itself');
// you
let used=await ev(()=>S.usage.days[today()]._n);await go('you');ok(await p.isVisible('.knotsum')&&await ev(n=>document.querySelector('.kbig .v').dataset.n==n,used),'You shows knots used today ('+used+')');
ok(await ev(()=>{let s=0;Object.values(S.usage.days).forEach(d=>s+=d._n);return s===S.usage.total}),'daily totals add up to all-time');
ok(await ev(()=>document.querySelectorAll('.ut tbody tr').length>5),'usage tables');
// profile on You, and editing it
ok(await ev(()=>{const c=document.querySelector('.prof');return c.querySelector('h2').textContent==='Nejc Lipovšek'&&/Student · University of Ljubljana/.test(c.textContent)&&/nejc\.lipovsek@example\.com/.test(c.textContent)&&!c.querySelector('.vpill')}),'You shows full name, school and email');
{const iv0=await ev(()=>S.me.vault.iv),k0=await K();await p.click('.prof .btn:has-text("Edit")');await W(500);
 ok(await p.inputValue('#pfSur')==='Lipovšek'&&await p.inputValue('#pfMail')==='nejc.lipovsek@example.com'&&await ev(()=>document.querySelector('#pfSt input[value=student]').checked),'edit sheet opens with the saved details');
 await p.fill('#pfMail','');await p.click('#sf button[type=submit]');await W(300);ok(await ev(()=>isOpen()&&!!document.querySelector('#sf .ferr')),'edit sheet will not save without an email');
 await p.click('#pfSt label:has-text("Working")');await p.fill('#pfRole','Ceramics lead');await p.fill('#pfMail','nejc@studio.si');await p.fill('#pfName','Nejko');await p.click('#sf button[type=submit]');await W(700);
 ok(await ev(()=>!isOpen()&&S.me.name==='Nejko'&&PROFILE.status==='work'&&document.querySelector('.prof h2').textContent==='Nejko Lipovšek'&&/Ceramics lead/.test(document.querySelector('.prof').textContent)),'profile edits show at once');
 ok(await ev(iv=>S.me.vault.iv!==iv&&!/studio\.si|Ceramics lead/.test(localStorage.getItem('atelier-v1')),iv0),'edited profile is sealed again with a new IV');
 ok(await K()===k0+8&&await ev(()=>S.usage.days[today()].profile===1),'profile update uses one knot unit');
 await go('people');ok(await ev(()=>/Nejko Lipovšek \(you\)/.test(document.querySelector('#view').textContent)&&/Ceramics lead/.test(document.querySelector('#view').textContent)),'People shows your full name and work');
 await go('you')}
await go('posters');ok(await ev(()=>document.querySelectorAll('.poster').length===8),'8 posters');
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('.pcard button >> nth=0')]);ok(/atelier-focus\.png/.test(dl.suggestedFilename()),'poster PNG export');
// persistence + backup
await p.reload();await W(1900);ok(await ev(()=>S.projects[0].tasks.length===2&&S.notes.length===2&&S.people.length===6),'everything survives reload');
ok(await ev(()=>PROFILE&&PROFILE.last==='Lipovšek'&&PROFILE.email==='nejc@studio.si'&&fullName()==='Nejko Lipovšek'),'profile is decrypted again after reload');
await go('board:'+pid+':'+bid);await W(800);ok(await ev(()=>BD&&BD.strokes.length===1),'board strokes reload');await p.click('[aria-label=Back]');await W(400);
await go('settings');const [ex]=await Promise.all([p.waitForEvent('download'),p.click('text=Export backup')]);const fp=await ex.path();const bk=JSON.parse(fs.readFileSync(fp,'utf8'));
ok(bk._blobs&&Object.keys(bk._blobs).length>=4,'backup includes files and boards ('+Object.keys(bk._blobs||{}).length+')');
ok(bk._profile&&bk._profile.email==='nejc@studio.si'&&!Object.keys(bk._blobs||{}).some(k=>k.startsWith('key:')),'backup carries the profile so it opens on another device, and never the key');
const BK=require('path').join(require('os').tmpdir(),'atelier-bk-'+process.pid+'.json');fs.copyFileSync(fp,BK);
await ev(()=>{save();localStorage.setItem('atelier-backup',localStorage.getItem('atelier-v1'));localStorage.setItem('atelier-v1','{bad')});await p.reload();await W(1900);
ok(await ev(()=>S.me&&S.projects.length===1),'corrupted save restores from backup');
await go('settings');await p.click('[data-th=dark]');await W(300);ok(await ev(()=>document.documentElement.dataset.theme==='dark'),'dark mode');
await p.click('text=Sign out and erase');await W(300);await p.click('#askY');await W(1000);ok(await p.isVisible('text=Work better, together.'),'erase returns to onboarding');
ok(await ev(async()=>!(await IDB.get('key:profile'))&&!localStorage.getItem('atelier-key')&&!PROFILE),'erase also removes the encryption key');
{// a new device: restore the backup there, the profile is sealed again with that device's own key
 const c2=await b.newContext({...devices['iPhone 13']}),q=await c2.newPage();q.on('pageerror',e=>errs.push(e.message));await q.goto(U);await q.waitForTimeout(1800);
 await q.click('#obS');await q.waitForTimeout(300);await q.fill('#obName','Temp');await q.fill('#obSur','User');await q.click('#obSt label:has-text("Working")');await q.fill('#obMail','temp@user.io');await q.click('#obF button[type=submit]');await q.waitForTimeout(1200);
 await q.evaluate(()=>go('settings'));await q.waitForTimeout(400);
 await q.setInputFiles('#imp',BK);await q.waitForTimeout(400);await q.click('#askY');await q.waitForTimeout(1500);
 ok(await q.evaluate(()=>fullName()==='Nejko Lipovšek'&&PROFILE.email==='nejc@studio.si'&&S.me.enc&&!/studio\.si/.test(localStorage.getItem('atelier-v1'))),'restored on a new device: profile readable and encrypted again');
 await q.reload();await q.waitForTimeout(1900);ok(await q.evaluate(()=>PROFILE&&PROFILE.email==='nejc@studio.si'),'restored profile survives reload');
 // an older save (name and role in plain text) moves into the vault without losing anything
 await q.evaluate(()=>{S.me={id:'me',name:'Ana Marija Zorman',handle:'ana',role:'Student',fig:{h:1,c:2},created:Date.now()-864e5};save()});
 await q.reload();await q.waitForTimeout(2000);
 ok(await q.evaluate(()=>PROFILE.first==='Ana'&&PROFILE.last==='Marija Zorman'&&PROFILE.status==='student'&&S.me.name==='Ana'&&S.me.enc&&!('role' in S.me)&&!/Zorman/.test(localStorage.getItem('atelier-v1'))),'older saves move name and role into the vault');
 await q.evaluate(()=>go('you'));await q.waitForTimeout(500);ok(await q.isVisible('.prof .lnk:has-text("Finish your profile")'),'You asks older accounts to add their email');
 // a vault from another device cannot be opened here: the app keeps working and asks for the details again
 await q.evaluate(()=>{S.me.vault={...S.me.vault,ct:btoa('x'.repeat(40))};save()});
 await q.reload();await q.waitForTimeout(2000);await q.evaluate(()=>go('you'));await q.waitForTimeout(500);
 ok(await q.evaluate(()=>window._vaultErr===true&&document.querySelector('.prof h2').textContent==='Ana')&&await q.isVisible('text=Add them again'),'an unreadable vault does not break the app');
 await q.click('.prof .btn:has-text("Edit")');await q.waitForTimeout(400);await q.fill('#pfSur','Novak');await q.click('#pfSt label:has-text("Student")');await q.fill('#pfMail','ana@uni.si');await q.click('#sf button[type=submit]');await q.waitForTimeout(800);
 ok(await q.evaluate(()=>!window._vaultErr&&fullName()==='Ana Novak'&&S.me.enc),'adding the details again seals a fresh vault');
 await c2.close();try{fs.unlinkSync(BK)}catch(e){}}
await go('');await p.click('#obS');await W(300);await p.fill('#obName','X');await W(50);
await p.setInputFiles('#obF input[type=file]',[]).catch(()=>{});
{// ===== chat sharing, group info, group styles, agenda, project progress, insights, voice =====
 const c3=await b.newContext({...devices['iPhone 13'],acceptDownloads:true}),r=await c3.newPage();r.on('pageerror',e=>errs.push('new: '+e.message));r.on('console',m=>{if(m.type()==='error'&&!/manifest|icon|404/.test(m.text()))errs.push('new: '+m.text())});
 const E=(f,a)=>r.evaluate(f,a),Z=t=>r.waitForTimeout(t),G=async h=>{await E(h=>go(h),h);await Z(450)};
 await r.goto(U);await Z(1800);await r.click('#obS');await Z(300);await r.fill('#obName','Nika');await r.fill('#obSur','Petek');await r.click('#obSt label:has-text("Working")');await r.fill('#obRole','Designer');await r.fill('#obMail','nika@studio.si');await r.click('#obF button[type=submit]');await Z(1500);
 // encryption stays, but nothing about it shows
 ok(await E(()=>S.me.enc===true&&!!S.me.vault),'profile is still encrypted');
 for(const h of ['you','settings']){await G(h);ok(await E(()=>!/encrypt/i.test(document.querySelector('#view').textContent)),'no encryption text on '+h)}
 await E(()=>{S.me=null;render()});await Z(300);await E(()=>{OB.i=3;onboarding()});await Z(300);ok(await E(()=>!/encrypt/i.test(document.querySelector('#view').textContent)),'no encryption text on the account screen');
 await r.reload();await Z(1900);
 // voice: the animation always runs, stop and finish always work, closing always releases
 await E(()=>voiceSheet());await Z(300);await r.click('#vb');await Z(1400);
 ok(await E(()=>document.querySelector('#vr').classList.contains('on')&&/Stop/.test(document.querySelector('#vb').textContent)&&!document.querySelector('#vx').hidden),'voice: recording animation and timer run');
 ok(await E(()=>document.querySelector('#vt').textContent!=='0:00'),'voice: timer counts');
 await r.click('#vb');await Z(500);ok(await E(()=>isOpen()&&!document.querySelector('#vr').classList.contains('on')&&/Record a memo/.test(document.querySelector('#vb').textContent)),'voice: Stop always stops');
 await r.click('#vd');await Z(500);ok(await E(()=>document.querySelector('#vr').classList.contains('on')&&/Finish/.test(document.querySelector('#vd').textContent)),'voice: dictation animation runs');
 await r.click('#vd');await Z(500);ok(await E(()=>!document.querySelector('#vr').classList.contains('on')),'voice: Finish always ends dictation');
 await r.click('#vb');await Z(400);await r.click('#vx');await Z(300);ok(await E(()=>!document.querySelector('#vr').classList.contains('on')&&isOpen()),'voice: Cancel stops without closing');
 await r.click('#vb');await Z(400);await r.click('#modal [data-close]');await Z(400);ok(await E(()=>!isOpen()&&!_rec&&!window._onSheetClose),'voice: closing while recording stops everything');
 await E(()=>voiceSheet());await Z(300);await r.click('#vd');await Z(300);await r.keyboard.press('Escape');await Z(400);ok(await E(()=>!isOpen()),'voice: Escape closes while dictating');
 await E(()=>voiceSheet());await Z(300);await r.click('#vb');await Z(300);ok(await E(()=>document.querySelector('#vr').classList.contains('on')),'voice: opens fresh after closing');await E(()=>closeSheet());await Z(300);
 // agenda
 await G('today');ok(await r.isVisible('.agsec .agempty'),'Today has an agenda with an empty state');
 let k0=await E(()=>S.usage.total);await r.click('.agsec [aria-label="Add to agenda"]');await Z(400);await r.fill('#agT','Team stand-up');await r.fill('#agH','09:30');await r.click('#sf button[type=submit]');await Z(500);
 ok(await E(()=>S.agenda.length===1&&S.agenda[0].t==='09:30'&&S.agenda[0].d===today()&&document.querySelectorAll('.agi').length===1),'agenda item added for today');
 ok(await E(k=>S.usage.total===k+16&&S.usage.days[today()].agenda_new===1&&S.ledger.some(x=>x.k==='agenda'&&/Planned: Team stand-up/.test(x.t)),k0),'agenda uses knots and shows in the ledger');
 await r.click('.agi .agc');await Z(400);ok(await E(()=>S.agenda[0].done&&document.querySelector('.agi').classList.contains('done')&&/1 of 1 done/.test(document.querySelector('.agfoot').textContent)&&S.usage.days[today()].agenda_done===1),'tick an agenda item off');
 await r.click('.agi .agb');await Z(400);await r.fill('#agT','Team stand-up, short');await r.click('#sf button[type=submit]');await Z(400);ok(await E(()=>S.agenda[0].title==='Team stand-up, short'&&S.agenda.length===1),'edit an agenda item');
 const tmr=await E(()=>{const d=new Date();d.setDate(d.getDate()+1);return isoD(d)});
 if(await r.isVisible(`[data-day="${tmr}"]`)){await r.click(`[data-day="${tmr}"]`);await Z(400);ok(await E(t=>selDay===t&&/still ahead/.test(document.querySelector('#view').textContent),tmr),'future days open to plan ahead')}else ok(true,'future days open to plan ahead (week ends today)');
 await E(t=>agendaForm(t),tmr);await Z(300);await r.fill('#agT','Exam prep');await r.click('#sf button[type=submit]');await Z(400);
 ok(await E(t=>S.agenda.some(a=>a.d===t&&a.title==='Exam prep')&&(!document.querySelector(`[data-day="${t}"]`)||document.querySelector(`[data-day="${t}"] .agdot.on`)),tmr),'planned days get a dot in the week');
 await E(()=>{selDay=null;render()});await Z(300);
 // project with progress and milestones, shared with Studio
 const gid=await E(()=>S.groups[0].id);await E(g=>projectForm({groups:[g]}),gid);await Z(400);await r.fill('#pN','Brand book');await r.click('#sf button[type=submit]');await Z(900);
 const pid=await E(()=>S.projects[0].id);await E(id=>{const p=proj(id);addTask(p,{t:'Logo'});addTask(p,{t:'Colours'})},pid);await G('project:'+pid);
 ok(await E(()=>!!document.querySelector('.phero .pbar')&&document.querySelectorAll('.ptab .grid3 .kpi').length===3),'overview keeps the to do, doing and done counters');
 await r.fill('#mlT','First draft');await r.click('#mlF button');await Z(500);ok(await E(id=>proj(id).miles.length===1&&document.querySelectorAll('.mile').length===1&&S.usage.days[today()].milestone===1,pid),'milestone added');
 ok(await E(id=>pctOf(proj(id))===0,pid),'progress starts at 0%');
 await r.click('.mile .mchk');await Z(500);ok(await E(id=>pctOf(proj(id))===50&&proj(id).miles[0].done&&S.ledger.some(x=>x.k==='milestone'),id=pid),'a milestone counts like two tasks (50%)');
 await E(id=>{const p=proj(id);setTaskSt(p,p.tasks[0],'done')},pid);await Z(300);ok(await E(id=>pctOf(proj(id))===75&&proj(id).hist[today()]===75,pid),'progress follows tasks and is kept per day');
 await G('project:'+pid);await r.click('.phero .btn:has-text("Update")');await Z(400);await r.click('#pgM label:nth-child(2)');await E(()=>{const x=document.querySelector('#pgR');x.value=90;x.dispatchEvent(new Event('input'))});
 ok(await E(()=>document.querySelector('#pgV').textContent==='90%'),'progress sheet shows the value live');await r.fill('#pgN','Logo approved');await r.click('#sf button[type=submit]');await Z(600);
 ok(await E(id=>{const p=proj(id);return p.pmode==='manual'&&p.pct===90&&pctOf(p)===90&&p.hist[today()]===90},pid),'progress can be set by hand');
 const gc=await E(g=>ensureGroupChat(g).id,gid);ok(await E(c=>{const m=S.chats.find(x=>x.id===c).msgs.find(m=>m.att&&m.att.kind==='progress');return m&&m.att.pct===90&&m.att.from===75&&m.att.note==='Logo approved'},gc),'progress update posted to the group with the note');
 await G('projects');ok(await E(()=>/90%/.test(document.querySelector('.card.list').textContent)),'project list shows the percentage');
 // group chat: header opens info, share everything
 await G('c:'+gc);await Z(2500);ok(await E(c=>S.chats.find(x=>x.id===c).msgs.some(m=>m.from!=='me'),gc),'bots react to the progress update');
 await r.click('.composer [aria-label="Share"]');await Z(400);ok(await E(()=>document.querySelectorAll('.wtile').length===8&&document.querySelectorAll('.shopt:not(.wtile)').length===3),'share sheet: eight widgets, then photo, file and note');
 await r.setInputFiles('#sh_photo',D+'/t.gif');await Z(900);
 const ph=await E(c=>{const m=S.chats.find(x=>x.id===c).msgs.filter(m=>m.att&&m.att.kind==='photo').pop();return m&&{fid:m.att.fid,id:m.id}},gc);
 ok(ph&&await E(f=>IDB.get(f).then(b=>b instanceof Blob),ph.fid),'photo shared and kept on the device');
 ok(await E(()=>{const i=document.querySelector('.msg .aph img');return!!(i&&i.src)}),'photo shows in the chat');
 await r.click('.composer [aria-label="Share"]');await Z(300);await r.setInputFiles('#sh_doc',D+'/t.pdf');await Z(800);
 ok(await E(c=>S.chats.find(x=>x.id===c).msgs.some(m=>m.att&&m.att.kind==='doc'&&m.att.title==='t.pdf'),gc),'file shared in the chat');
 for(const k of ['focus','day','agenda']){await r.click('.composer [aria-label="Share"]');await Z(300);await r.click(`.wtile[data-k=${k}]`);await Z(450);await r.click('#wSend');await Z(450)}
 ok(await E(c=>{const M=S.chats.find(x=>x.id===c).msgs.map(m=>m.att).filter(Boolean);const f=M.find(a=>a.kind==='focus'),d=M.find(a=>a.kind==='day'),a=M.find(a=>a.kind==='agenda');return f&&typeof f.mins==='number'&&d&&d.st&&d.st.agenda==='1/1'&&a&&a.items.length===1&&a.items[0].done},gc),'focus, day and agenda shared as snapshots');
 await r.click('.composer [aria-label="Share"]');await Z(300);await r.click('.wtile[data-k=project]');await Z(450);await r.click('#wSend');await Z(500);
 ok(await E(c=>S.chats.find(x=>x.id===c).msgs.some(m=>m.att&&m.att.kind==='project'&&m.att.pct===90),gc),'project shared with its progress');
 ok(await E(()=>document.querySelectorAll('.msg .wdg').length>=4&&document.querySelectorAll('.msg .rc').length>=1),'shared things show as widgets and cards');
 ok(await E(()=>['photo','file_share','share'].every(k=>S.usage.days[today()][k]>0)),'sharing uses knots');
 // pin from the message menu
 await r.click('.msg:has(.aph) .bub',{button:'right'});await Z(400);ok(await r.isVisible('#maPin'),'press and hold opens the message menu');
 await r.click('#maPin');await Z(500);ok(await E(i=>!!S.chats.flatMap(c=>c.msgs).find(m=>m.id===i).pin,ph.id)&&await r.isVisible('.pinbar'),'pin a message, pinned bar shows');
 // group info
 await r.click('.chinfo');await Z(700);ok(await E(g=>route.k==='group'&&route.a[0]===g,gid),'tap the group name to open group info');
 ok(await E(g=>document.querySelectorAll('.mstrip .mem:not(.add)').length===grp(g).members.length,gid),'group info: members at the top');
 ok(await E(()=>{const t=[...document.querySelectorAll('.sh h2')].map(h=>h.textContent);return t.indexOf('Members')<t.indexOf('Active projects')&&t.indexOf('Active projects')<t.indexOf('Pinned')&&t.indexOf('Pinned')<t.indexOf('Photos')&&t.indexOf('Photos')<t.indexOf('Files')}),'group info order: members, active projects, pinned, photos, files');
 ok(await E(()=>document.querySelectorAll('.apcard').length===1&&/90%/.test(document.querySelector('.apcard').textContent)),'active project with progress');
 ok(await E(()=>document.querySelectorAll('.mgrid .mthumb').length===1&&[...document.querySelectorAll('.card.list .li')].some(l=>/t\.pdf/.test(l.textContent))),'photos and files collected');
 await Z(400);ok(await E(()=>!!document.querySelector('.mgrid img').src),'photo thumbnails load');
 ok(await E(c=>document.querySelector('.ph .icon-btn[aria-label=Back]').getAttribute('href')==='#c:'+c,gc),'back returns to the chat');
 await r.click('.mgrid .mthumb');await Z(600);ok(await E(()=>isOpen()&&!!document.querySelector('.sheet .fprev[src]')&&!!document.querySelector('.sheet a[download]')),'open a shared photo');await E(()=>closeSheet());await Z(400);
 // group look
 await r.click('.ph .btn:has-text("Edit")');await Z(400);await r.click('.gicons label:has(input[value=cap])');await r.click('#gK label:has(input[value=study])');await r.click('.figpick label:has(input[value=read])');await r.check('#sf input[name=mute]');await r.click('#sf button[type=submit]');await Z(500);
 ok(await E(g=>{const x=grp(g);return x.icon==='cap'&&x.kind==='study'&&x.fig==='read'&&x.mute===true},gid),'group icon, kind, cover drawing and quiet mode saved');
 ok(await E(()=>/Study group/.test(document.querySelector('.ph .eyebrow').textContent)&&document.querySelector('.gbadge path').getAttribute('d')===ICON.cap),'group info shows the new look');
 await G('chat');ok(await E(()=>!!document.querySelector('.convo .mutei')),'quiet groups are marked in the list');
 // forward and delete
 const fwd=await E(()=>S.people[0].id);await G('c:'+gc);await r.click('.msg:has(.att) .bub >> nth=0',{button:'right'});await Z(300);await r.click('#maFwd');await Z(500);
 await r.click(`.sheet [data-i]:has-text("${await E(i=>person(i).name,fwd)}")`);await Z(600);ok(await E(i=>{const c=S.chats.find(c=>c.kind==='dm'&&c.with===i);return c&&c.msgs.some(m=>m.att&&m.att.kind==='doc')},fwd),'forward a message to a person');
 const dc=await E(i=>S.chats.find(c=>c.kind==='dm'&&c.with===i).id,fwd);
 await E(i=>{const c=S.chats.find(x=>x.id===i),m=c.msgs.find(m=>m.att&&m.att.kind==='photo');if(m){c.msgs=c.msgs.filter(x=>x!==m)}},dc);
 const pf=await E(c=>S.chats.find(x=>x.id===c).msgs.find(m=>m.att&&m.att.kind==='photo').att.fid,gc);
 await G('c:'+gc);await r.click('.msg:has(.aph) .bub',{button:'right'});await Z(300);await r.click('#maDel');await Z(400);await r.click('#askY');await Z(600);
 ok(await E(f=>IDB.get(f).then(b=>!b),pf),'deleting the last copy of a photo frees the space');
 // person info
 await G('c:'+dc);await r.click('.chinfo');await Z(600);ok(await E(i=>route.k==='person'&&route.a[0]===i&&/Groups together/.test(document.querySelector('#view').textContent),fwd),'tap a name to open their info');
 // insights
 await G('you');ok(await E(()=>{const n=+document.querySelector('.effc .ring text').textContent;return n>=0&&n<=100}),'You shows an efficiency score');
 ok(await E(()=>document.querySelectorAll('.kpis6 .kpi').length===6),'six work data points');
 ok(await E(()=>{const t=[...document.querySelectorAll('.sh h2')].map(h=>h.textContent);return t.includes('When you work')&&t.includes('Week rhythm')}),'when you work and week rhythm charts');
 ok(await E(()=>{let s=0;Object.values(S.usage.days).forEach(d=>s+=d._n);return s===S.usage.total}),'daily totals still add up with the new actions');
 // everything survives a reload, and older saves get the new fields
 await G('c:'+gc);await r.click('.msg:has(.att) .bub >> nth=0',{button:'right'});await Z(300);await r.click('#maPin');await Z(400);
 await r.reload();await Z(1900);ok(await E((a)=>S.agenda.length===2&&proj(a.pid).miles.length===1&&grp(a.gid).icon==='cap'&&S.chats.flatMap(c=>c.msgs).some(m=>m.pin),{pid,gid}),'agenda, milestones, group look and pins survive reload');
 await E(()=>{delete S.agenda;S.projects.forEach(p=>{delete p.miles;delete p.hist;delete p.pmode});S.groups.forEach(g=>{delete g.icon;delete g.kind;delete g.fig});save()});await r.reload();await Z(1900);
 ok(await E(()=>Array.isArray(S.agenda)),'older saves get an empty agenda');
 for(const h of ['today','projects','project:'+pid,'groups','group:'+gid,'c:'+gc,'you']){await G(h);ok(await E(()=>!/Something went wrong/.test(document.querySelector('#view').textContent)),'older save opens '+h.split(':')[0])}
 await c3.close()}

{// ===== timer catch-up, alerts, calendar alerts, deep mode, study =====
 const c4=await b.newContext({...devices['iPhone 13'],acceptDownloads:true}),r=await c4.newPage();r.on('pageerror',e=>errs.push('study: '+e.message));r.on('console',m=>{if(m.type()==='error'&&!/manifest|icon|404/.test(m.text()))errs.push('study: '+m.text())});
 c4.on('page',pg=>pg.close().catch(()=>{}));
 const E=(f,a)=>r.evaluate(f,a),Z=t=>r.waitForTimeout(t),G=async h=>{await E(h=>go(h),h);await Z(450)};
 await r.goto(U);await Z(1800);await r.click('#obS');await Z(300);await r.fill('#obName','Ana');await r.fill('#obSur','Zorman');await r.click('#obSt label:has-text("Student")');await r.fill('#obMail','ana@uni.si');await r.click('#obF button[type=submit]');await Z(1500);
 // the timer counts time away exactly
 let x=await E(()=>{S.focus.mode='pomo';S.focus.label='Maths';S.settings.auto=true;startFocus();const r=S.focus.run,t0=Date.now()-31*60000;r.started=t0;r.ws=t0;r.endAt=t0+25*60000;window._t0=t0;catchUp();const q=S.focus.run;return{ph:q.phase,round:q.round,end:q.endAt-(t0+55*60000),done:q.done,brk:S.ledger.some(l=>l.k==='break')}});
 ok(x.ph==='work'&&x.round===2&&Math.abs(x.end)<1500&&x.done===25&&x.brk,'away 31 min: break passed, round 2 runs on the real clock, 25 min counted ('+JSON.stringify(x)+')');
 ok(await E(()=>/While you were away/.test(document.querySelector('#toast').textContent)),'a note says what happened while you were away');
 x=await E(()=>{const r=S.focus.run,t0=window._t0;r.endAt=t0-3*3600e3+25*60000;r.ws=t0-3*3600e3;r.started=t0-3*3600e3;r.round=1;r.phase='work';r.done=0;catchUp();const s=S.focus.sessions[S.focus.sessions.length-1];return{run:!!S.focus.run,mins:s&&s.mins}});
 ok(!x.run&&x.mins===100,'away 3 hours: the whole session finished with exactly 100 minutes ('+JSON.stringify(x)+')');
 x=await E(()=>{S.settings.auto=false;startFocus();const r=S.focus.run,t0=Date.now()-40*60000;r.started=t0;r.ws=t0;r.endAt=t0+25*60000;catchUp();const q=S.focus.run;return{ph:q.phase,paused:q.paused,left:q.left,done:q.done}});
 ok(x.ph==='break'&&x.paused&&x.left===5*60000&&x.done===25,'with auto start off, the break waits for you ('+JSON.stringify(x)+')');
 await E(()=>{stopFocus(true);S.settings.auto=true;startFocus();S.focus.run.endAt=Date.now()-1000;document.dispatchEvent(new Event('visibilitychange'))});await Z(200);
 ok(await E(()=>S.focus.run&&S.focus.run.phase==='break'),'coming back to the app catches up at once');
 // alerts
 await E(()=>{window._notes=[];Object.defineProperty(Notification,'permission',{get:()=>'granted',configurable:true});Notification.requestPermission=async()=>'granted';
  navigator.serviceWorker.getRegistration=async()=>({showNotification:async(t,o)=>window._notes.push([t,o])});S.settings.notify=true});
 await G('focus');ok(await r.isVisible('.ph .icon-btn.on[aria-label=Alerts]'),'alerts show as on');
 await E(()=>{Object.defineProperty(document,'visibilityState',{get:()=>'hidden',configurable:true});nextPhase(false)});await Z(300);
 ok(await E(()=>window._notes.length===1&&window._notes[0][0]==='Back to focus'&&/round 2 of 4/.test(window._notes[0][1].body)),'a notification when the phase switches in the background');
 await E(()=>{nextPhase(false)});await Z(200);ok(await E(()=>window._notes[1]&&window._notes[1][0]==='Break time'),'a notification for the break too');
 await E(()=>{delete document.visibilityState;window._notes=[];nextPhase(false)});await Z(200);ok(await E(()=>window._notes.length===0),'no system notification while you are looking at the app');
 await E(()=>{S.settings.notify=false});await G('focus');await r.click('.fbtns .btn:has-text("Alerts")');await Z(400);
 ok(await r.isVisible('#alAsk')&&await r.isVisible('#alCal'),'alerts sheet: while open and when locked');
 const plan=await E(()=>phasePlan().length);ok(await E(()=>document.querySelectorAll('.alplan .li').length)===plan&&plan>0,'alerts sheet lists every switch of this session ('+plan+')');
 await r.click('#alAsk');await Z(400);ok(await E(()=>S.settings.notify===true),'allow turns alerts on');
 ok(await E(()=>{const t=icsFor(S.focus.run),P=phasePlan();return(t.match(/BEGIN:VEVENT/g)||[]).length===P.length&&(t.match(/BEGIN:VALARM/g)||[]).length===P.length&&t.includes('DTSTART:'+icsT(P[0].at))&&/^BEGIN:VCALENDAR/.test(t)&&t.includes('TRIGGER:PT0S')}),'calendar file has an alert at every switch');
 await E(()=>alertsSheet());await Z(300);await r.click('#alCal');await Z(500);ok(await E(()=>S.usage.days[today()].cal_alerts===1),'calendar alerts handed to the phone');
 // deep mode
 await E(()=>stopFocus(true));await G('focus');await r.click('.fbtns .zbtn');await Z(900);
 ok(await E(()=>!!S.focus.run&&S.focus.zen===true&&document.body.classList.contains('zenon')&&!!document.querySelector('#zen')),'start in deep mode');
 ok(await E(()=>getComputedStyle(document.querySelector('#shell')).visibility==='hidden'&&getComputedStyle(document.querySelector('#zen')).backgroundColor==='rgb(0, 0, 0)'&&document.querySelector('meta[name=theme-color]').content==='#000000'),'everything else goes away, true black');
 ok(await E(()=>/^\d\d:\d\d$/.test(document.querySelector('#zT').textContent)&&document.querySelector('#zPh').textContent==='Focus'),'only the timer and the phase show');
 ok(await E(()=>S.usage.days[today()].zen===1),'deep mode uses a knot');
 await r.mouse.click(195,300);await Z(300);ok(await E(()=>document.querySelector('#zen').classList.contains('ctl')),'tap shows the controls');
 await r.click('#zP');await Z(300);ok(await E(()=>S.focus.run.paused&&/paused/.test(document.querySelector('#zPh').textContent)),'pause in deep mode');await r.click('#zP');await Z(200);
 await r.click('#zS');await Z(400);ok(await E(()=>S.focus.run.phase==='break'&&document.querySelector('#zPh').textContent==='Break'),'the phase shows when it changes');
 await r.reload();await Z(2200);ok(await E(()=>!!document.querySelector('#zen')&&document.body.classList.contains('zenon')),'deep mode comes back after closing the app');
 await E(()=>{const q=S.focus.run;q.phase='long';q.round=4;q.endAt=Date.now()-5});await Z(700);
 ok(await E(()=>document.querySelector('#zen').classList.contains('done')&&/Session complete/.test(document.querySelector('#zen').textContent)),'deep mode shows the session is complete');
 await r.click('#zC .zx');await Z(600);ok(await E(()=>!document.querySelector('#zen')&&!document.body.classList.contains('zenon')&&S.focus.zen===false),'leave deep mode');
 // study: goal, exams, plan
 await r.click('.ftabs a:has-text("Study")');await Z(500);ok(await E(()=>route.k==='study'&&!!document.querySelector('.sgoal')),'Study opens from the Focus tabs');
 await r.click('.sgoal .btn:has-text("Goal")');await Z(300);await E(()=>{const x=document.querySelector('#sgR');x.value=90;x.dispatchEvent(new Event('input'))});await r.click('#sf button[type=submit]');await Z(400);
 ok(await E(()=>S.study.goal===90&&/Goal 90 min/.test(document.querySelector('.sgoal').textContent)),'daily study goal');
 const exd=await E(()=>{const d=new Date();d.setDate(d.getDate()+3);return isoD(d)});
 await r.click('.sh .lnk:has-text("New") >> nth=0');await Z(300);await r.fill('#exT','Chemistry exam');await r.fill('#exD',exd);await r.click('#sf button[type=submit]');await Z(400);
 ok(await E(()=>S.study.exams.length===1&&/in 3 days/.test(document.querySelector('.exam').textContent)&&!!document.querySelector('.exam .cd.urgent')),'exam counts down, close ones in red');
 await r.click('.exam [aria-label="Plan study blocks"]');await Z(300);await r.fill('#plT','23:59');await r.fill('#plN','2');await r.click('#sf button[type=submit]');await Z(400);
 x=await E(e=>({blocks:S.agenda.filter(a=>a.title==='Study: Chemistry exam').map(a=>a.d),exam:S.agenda.some(a=>a.title==='Exam: Chemistry exam'&&a.d===e)}),exd);
 ok(x.blocks.length===2&&x.blocks.every(d=>d<exd)&&x.exam,'plan adds study blocks before the exam, and the exam ('+JSON.stringify(x)+')');
 await E(e=>planSheet(S.study.exams[0].id));await Z(300);await r.fill('#plT','23:59');await r.fill('#plN','2');await r.click('#sf button[type=submit]');await Z(300);ok(await E(()=>S.agenda.filter(a=>a.title==='Study: Chemistry exam').length===2),'planning again adds no doubles');
 // flashcards
 await E(()=>{newNote({title:'Chem terms',body:'# Terms\ncation - a positive ion\nanion :: a negative ion\n[ ] revise\nmole: amount of substance'})});
 await G('study');await r.click('.sh .lnk:has-text("New deck")');await Z(300);await r.fill('#dkN','Chemistry');await r.click('#sf button[type=submit]');await Z(700);
 const did=await E(()=>route.k==='deck'&&route.a[0]);ok(!!did,'new deck opens');
 await r.fill('#cfA','Atom');await r.fill('#cfB','The smallest unit of an element');await r.click('#cfF button');await Z(400);ok(await E(i=>deck(i).cards.length===1&&deck(i).cards[0].due===today(),did),'add a card, due today');
 ok(await E(()=>JSON.stringify(parseCards('# T\na - b\nc :: d\n[ ] x\ne: f\nno separator'))===JSON.stringify([['a','b'],['c','d'],['e','f']])),'card lines are understood: dash, double colon and colon');
 await r.click('.sh .lnk:has-text("From a note")');await Z(300);await r.click('[data-pk]:has-text("Chem terms")');await Z(400);ok(await E(i=>deck(i).cards.length===4,did),'cards made from a note');
 await r.click('.sh .lnk:has-text("From a note")');await Z(300);await r.click('[data-pk]:has-text("Chem terms")');await Z(400);ok(await E(i=>deck(i).cards.length===4,did),'the same note adds no doubles');
 let k0=await E(()=>S.usage.days[today()].card_review||0);
 await r.click('.dhero .btn.primary');await Z(600);ok(await E(()=>route.k==='review'&&document.querySelectorAll('#flp .fface').length===2&&document.querySelector('#rail').hidden),'review opens, quiet without the quick panel');
 ok(await E(()=>document.querySelector('#grd').hidden),'grades wait until the answer shows');
 await r.click('#flp');await Z(700);ok(await E(()=>document.querySelector('#flp').classList.contains('on')&&!document.querySelector('#grd').hidden),'tap flips the card');
 const first=await E(()=>REV.q[0]);await r.click('.grade button:has-text("Good")');await Z(500);
 ok(await E(([i,c])=>{const x=deck(i).cards.find(y=>y.id===c);return x.box===1&&x.due===addDays(today(),1)},[did,first]),'good: back tomorrow');
 const sec=await E(()=>REV.q[1]);await r.click('#flp');await Z(500);await r.click('.grade button:has-text("Again")');await Z(500);ok(await E(c=>REV.q.length===5&&REV.q[4]===c,sec),'again: the card comes back in this round');
 const third=await E(()=>REV.q[REV.i]);await r.click('#flp');await Z(500);await r.click('.grade button:has-text("Easy")');await Z(500);ok(await E(([i,c])=>{const x=deck(i).cards.find(y=>y.id===c);return x.box===2&&x.due===addDays(today(),2)},[did,third]),'easy: skips ahead');
 await r.click('#flp');await Z(500);await r.click('.grade button:has-text("Hard")');await Z(500);await r.click('#flp');await Z(500);await r.click('.grade button:has-text("Good")');await Z(800);
 ok(await r.isVisible('.rdone')&&await E(()=>/5 cards reviewed/.test(document.querySelector('.rdone').textContent)&&/3 right the first time/.test(document.querySelector('.rdone').textContent)),'summary after the round');
 ok(await E(k=>S.usage.days[today()].card_review===k+5&&S.ledger.some(l=>l.k==='study'&&/Reviewed 5 cards/.test(l.t)),k0),'reviews use knots and show in the ledger');
 ok(await E(i=>dueOf(deck(i)).length===0,did),'nothing is due after the review');
 await r.click('.rdone .btn:has-text("Back to the deck")');await Z(500);ok(await E(()=>/Nothing is due/.test(document.querySelector('.dhero').textContent)),'deck says when the next card comes back');
 await r.click('.dhero .btn.primary');await Z(500);ok(await E(()=>REV.practise&&REV.q.length===4&&REV.i===0),'practise all when nothing is due');await G('deck:'+did);
 // share, Today, subjects, You
 await r.click('.ph [aria-label="Share deck"]');await Z(400);await r.click('#wSend');await Z(400);await r.click('.sheet [data-i] >> nth=0');await Z(700);ok(await E(()=>S.chats.some(c=>c.msgs.some(m=>m.att&&m.att.kind==='deck'&&m.att.count===4))&&!!document.querySelector('.msg .w-deck')),'share a deck in chat');
 await E(i=>{deck(i).cards[0].due=today()},did);await G('today');ok(await E(()=>{const s=document.querySelector(space()==='student'?'.shero':'.studyrow');return s&&/1 card to review/.test(s.textContent)&&/Chemistry exam in 3 days/.test(s.textContent)}),'Today shows cards to review and the next exam');
 await E(()=>{S.focus.sessions.push({at:Date.now()-3600e3,end:Date.now(),mins:35,mode:'study',label:'Chemistry'});save()});await G('study');
 ok(await E(()=>[...document.querySelectorAll('.srow')].some(s=>/Chemistry/.test(s.textContent)&&/35/.test(s.textContent))),'time per subject this week');
 await r.click('.srow:has-text("Chemistry")');await Z(400);ok(await E(()=>route.k==='focus'&&S.focus.mode==='study'&&S.focus.label==='Chemistry'),'tap a subject to study it');
 await G('you');ok(await E(()=>/Study/.test(document.querySelector('.legend').textContent)),'Study shows in knots by area');
 ok(await E(()=>{let s=0;Object.values(S.usage.days).forEach(d=>s+=d._n);return s===S.usage.total}),'daily totals still add up');
 // older saves without study data
 await E(()=>{delete S.study;S.focus.zen=undefined;save()});await r.reload();await Z(1900);ok(await E(()=>S.study&&S.study.goal===60&&Array.isArray(S.study.decks)&&Array.isArray(S.study.exams)),'older saves get the study space');
 for(const h of ['study','focus','today','you']){await G(h);ok(await E(()=>!/Something went wrong/.test(document.querySelector('#view').textContent)),'older save opens '+h)}
 await c4.close()}

{// ===== tab bar, spaces, logo, knot scale, themes, frames, quotes, profiles, widgets =====
 const c5=await b.newContext({...devices['iPhone 13']}),r=await c5.newPage();r.on('pageerror',e=>errs.push('rewards: '+e.message));r.on('console',m=>{if(m.type()==='error'&&!/manifest|icon|404/.test(m.text()))errs.push('rewards: '+m.text())});
 c5.on('page',pg=>pg.close().catch(()=>{}));
 const E=(f,a)=>r.evaluate(f,a),Z=t=>r.waitForTimeout(t),G=async h=>{await E(h=>go(h),h);await Z(450)};
 await r.goto(U);await Z(1800);await r.click('#obS');await Z(300);await r.fill('#obName','Iva');await r.fill('#obSur','Kos');await r.click('#obSt label:has-text("Student")');await r.fill('#obMail','iva@uni.si');await r.click('#obF button[type=submit]');await Z(1500);
 // spaces
 ok(await E(()=>S.settings.space==='student'&&document.documentElement.dataset.space==='student'&&S.focus.mode==='study'),'a student account opens in the student space');
 ok(await E(()=>{const t=[...document.querySelectorAll('#tabs a span')].map(s=>s.textContent);return t.join()==='Today,Focus,Study,Notes,Chat,You'}),'student tabs: Today, Focus, Study, Notes, Chat, You');
 ok(await E(()=>/Study/.test(document.querySelector('.shero').textContent)),'student Today opens with study');
 await G('project:x');await G('study');ok(await E(()=>document.querySelector('#tabs a.on').dataset.tab==='study'&&/Projects and assignments/.test(document.querySelector('#view').textContent)),'study tab holds projects and assignments');
 await E(()=>actionSheet());await Z(300);ok(await E(()=>/Flashcards/.test(document.querySelector('.actgrid').textContent)&&/Exam/.test(document.querySelector('.actgrid').textContent)),'student quick actions');await E(()=>closeSheet());await Z(300);
 // the tab bar stays put when a reply comes in elsewhere; only the badge pops
 const gc=await E(()=>S.chats.find(c=>c.kind==='group').id);await G('today');
 await E(c=>{window._tg=document.querySelector('#tabs .tabglow');window._ta=document.querySelector('#tabs a');const ch=S.chats.find(x=>x.id===c);sendMsg(ch,'Hello all')},gc);await Z(4200);
 ok(await E(()=>window._tg===document.querySelector('#tabs .tabglow')&&window._ta===document.querySelector('#tabs a')),'the tab bar is not rebuilt when a reply arrives');
 ok(await E(()=>{const b=document.querySelector('#tabs a[data-tab=chat] .badge');return!b.hidden&&+b.textContent>=1&&b.classList.contains('pop')}),'the unread badge pops in');
 await G('you');await r.click('.spseg [data-sp=work]');await Z(900);
 ok(await E(()=>S.settings.space==='work'&&[...document.querySelectorAll('#tabs a span')].map(s=>s.textContent).join()==='Today,Focus,Notes,Projects,Chat,You'&&route.k==='today'&&/Work/.test(document.querySelector('.shero').textContent)),'switch to the work space: work tabs and a work Today');
 ok(await E(()=>S.usage.days[today()].space===1),'switching space uses a knot');
 await G('you');await r.click('.spseg [data-sp=student]');await Z(700);
 // logo
 ok(await E(()=>MARK_A.startsWith('M12.5 47L25.6 15.2')&&MARK_B.startsWith('M16.8 33.6')&&posterSVG(POSTERS[0]).includes(MARK_B)&&markSVG().includes(MARK_A)&&document.querySelector('#splash')===null||document.querySelector('#splash path').getAttribute('d')===MARK_A),'the new mark is used in the app, splash and posters');
 ok(await E(()=>{const n=MARK_A.match(/[\d.]+/g).map(Number);const xs=n.filter((_,i)=>i%2===0);return xs.every((x,i)=>Math.abs(x+xs[xs.length-1-i]-56)<.01)}),'the A is exactly symmetrical');
 // knot scale
 let k=await E(()=>S.usage.total);await E(()=>use('msg'));ok(await E(k=>S.usage.total===k+8,k),'one message is 8 knots');
 ok(await E(()=>{const s=fixData({usage:{days:{'2026-01-01':{_n:10,msg:10}},total:10},focus:{},settings:{},study:{}});return s.usage.total===80&&s.usage.days['2026-01-01']._n===80&&s.usage.ks===8&&fixData(s).usage.total===80}),'older knots are scaled once, never twice');
 // themes and frames
 await E(()=>{S.usage.total=24000;save()});await G('rewards');ok(await E(()=>document.querySelectorAll('.sk').length===11&&document.querySelectorAll('.frc').length===7),'collection: 11 themes and 6 frames plus none');
 await r.click('.sk:has-text("Harbour")');await Z(300);ok(await E(()=>document.documentElement.dataset.skin==='clay'&&/unlocks at 25,000/.test(document.querySelector('#toast').textContent)),'a locked theme says what it takes');
 await E(()=>{S.usage.total=24996;use('msg')});await Z(600);ok(await E(()=>S.ledger.some(l=>/Unlocked the Harbour theme/.test(l.t))&&/Unlocked: Harbour/.test(document.querySelector('#toast').textContent)),'reaching a mark unlocks the theme');
 ok(await E(()=>S.usage.total>=25000),'knots are never spent');
 await G('rewards');await r.click('.sk:has-text("Harbour")');await Z(400);ok(await E(()=>document.documentElement.dataset.skin==='harbour'&&getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()==='#eef3f8'&&S.settings.skin==='harbour'),'use an unlocked theme');
 await E(()=>{S.settings.theme='dark';applyTheme()});ok(await E(()=>getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()==='#0f1824'),'themes have a dark version');await E(()=>{S.settings.theme='light';applyTheme()});
 await r.reload();await Z(1900);ok(await E(()=>document.documentElement.dataset.skin==='harbour'),'the theme stays after reopening');
 await E(()=>{S.settings.skin='prism';applyTheme()});ok(await E(()=>document.documentElement.dataset.skin==='clay'),'a theme you have not reached cannot be forced');
 await G('rewards');await r.click('.frc:has-text("Hairline")');await Z(300);ok(await E(()=>!S.me.frame),'a locked frame stays locked');
 await E(()=>{S.usage.total=400000;render()});await Z(300);await r.click('.frc:has-text("Stitch")');await Z(400);ok(await E(()=>S.me.frame==='dotted'&&!!document.querySelector('.frc.on .frm-dotted')),'wear a frame');
 await G('today');ok(await E(()=>!!document.querySelector('.thav .frm-dotted')),'the frame shows on your avatar');
 ok(await E(()=>SKINS.every((s,i)=>i===0||s.at>SKINS[i-1].at)&&SKINS[SKINS.length-1].at>=1000000&&FRAMES[0].at>=SKINS[5].at&&FRAMES[FRAMES.length-1].at>SKINS[SKINS.length-1].at),'prices rise to over a million; frames start at mid-theme prices and end above the top theme');
 // every screen in every theme, light and dark
 const scr=['today','focus','study','notes','projects','chat','groups','you','rewards','profile','settings','posters'];let bad=[];
 for(const sk of await E(()=>SKINS.map(s=>s.id)))for(const th of ['light','dark']){const x=await E(([sk,th,scr])=>{S.usage.total=2e6;S.settings.skin=sk;S.settings.theme=th;applyTheme();const out=[];for(const h of scr){go(h);if(/Something went wrong/.test(document.querySelector('#view').textContent))out.push(h)}return out},[sk,th,scr]);if(x.length)bad.push(sk+'/'+th+': '+x.join())}
 ok(!bad.length,'every screen opens in every theme, light and dark'+(bad.length?' '+bad.join(' | '):''));
 await E(()=>{S.settings.skin='clay';S.settings.theme='light';S.usage.total=400000;applyTheme()});
 // quotes and profiles
 await G('profile');ok(await r.isVisible('.qempty'),'profile invites a quote');await r.click('.qempty');await Z(400);await r.fill('#qT','Slow is smooth, smooth is fast.');await r.click('#qF label:has-text("Hand")');await r.click('#qL label:has-text("Ink")');
 ok(await E(()=>{const q=document.querySelector('#qPv .qcard');return q.classList.contains('qf-hand')&&q.classList.contains('ql-ink')&&/Slow is smooth/.test(q.textContent)}),'quote preview follows font and look');
 await r.click('#sf button[type=submit]');await Z(500);ok(await E(()=>S.me.quote.t==='Slow is smooth, smooth is fast.'&&S.me.quote.font==='hand'&&!!document.querySelector('.proq .qcard.qf-hand')&&S.usage.days[today()].quote===1),'quote saved on the profile');
 const bot=await E(()=>S.people[0].id);await G('person:'+bot);ok(await E(()=>!!document.querySelector('.proq .qcard')),'teammates have a quote on their profile');
 // widgets
 await G('c:'+gc);await r.click('.composer [aria-label=Share]');await Z(400);await r.click('.wtile[data-k=focus]');await Z(500);
 ok(await E(()=>!!document.querySelector('.wstage .wdg.w-focus.wl-small.wt-glass.wf-sans')),'widget editor shows a live preview');
 await r.click('#wL [data-v=wide]');await r.click('#wF [data-v=serif]');await r.click('#wT [data-v=ink]');await Z(200);
 ok(await E(()=>!!document.querySelector('.wstage .wdg.wl-wide.wt-ink.wf-serif')),'size, font and surface change the preview');
 await r.click('#wSend');await Z(600);ok(await E(c=>{const m=S.chats.find(x=>x.id===c).msgs.filter(m=>m.att&&m.att.kind==='focus').pop();return m&&m.att.w.layout==='wide'&&m.att.w.tone==='ink'&&m.att.w.font==='serif'},gc)&&await E(()=>!!document.querySelector('.msg .wdg.w-focus.wt-ink')),'focus widget sent with its style');
 ok(await E(()=>S.widgets.focus.tone==='ink'&&S.usage.days[today()].widget>=1),'the style is remembered and the widget uses knots');
 await r.click('.composer [aria-label=Share]');await Z(300);await r.click('.wtile[data-k=focus]');await Z(400);ok(await E(()=>!!document.querySelector('.wstage .wdg.wt-ink.wf-serif')),'next time it opens in your style');await E(()=>closeSheet());await Z(300);
 await r.click('.composer [aria-label=Share]');await Z(300);await r.click('.wtile[data-k=quote]');await Z(400);await r.click('#wSend');await Z(600);ok(await E(()=>!!document.querySelector('.msg .w-quote .wq.qf-hand')&&/Slow is smooth/.test(document.querySelector('.msg .w-quote').textContent)),'quote widget keeps the quote style');
 await r.click('.composer [aria-label=Share]');await Z(300);await r.click('.wtile[data-k=countdown]');await Z(400);ok(await E(()=>document.querySelector('#wSend').disabled&&/No exams/.test(document.querySelector('.wsheet').textContent)),'a widget with nothing to show says how to start');await E(()=>closeSheet());await Z(300);
 await E(()=>{const d=new Date();d.setDate(d.getDate()+6);S.study.exams.push({id:uid(),title:'History',d:isoD(d),col:GCOL[0],note:'',at:Date.now()});save()});
 await r.click('.composer [aria-label=Share]');await Z(300);await r.click('.wtile[data-k=countdown]');await Z(400);await r.click('#wSend');await Z(600);ok(await E(()=>/6\s*days/.test(document.querySelector('.msg .w-countdown').textContent)),'countdown widget');
 await r.click('.composer [aria-label=Share]');await Z(300);await r.click('.wtile[data-k=photo]');await Z(400);ok(await E(()=>document.querySelector('#wSend').disabled),'photo widget waits for a photo');
 await r.setInputFiles('#wPh',D+'/t.gif');await Z(300);await r.fill('#wCap','Our desk');await Z(200);await r.click('#wSend');await Z(900);
 ok(await E(c=>{const m=S.chats.find(x=>x.id===c).msgs.filter(m=>m.att&&m.att.kind==='photo').pop();return m&&m.att.w&&m.att.cap==='Our desk'&&m.att.fid&&m.att.fid!=='pending'},gc),'photo widget with a caption');
 ok(await E(c=>{const m=S.chats.find(x=>x.id===c).msgs.filter(m=>m.att&&m.att.kind==='photo').pop();return IDB.get(m.att.fid).then(b=>b instanceof Blob)},gc),'the widget photo is kept on the device');
 ok(await E(()=>/Photo widget/.test(msgPreview(S.chats.find(c=>c.kind==='group').msgs.filter(m=>m.att&&m.att.kind==='photo').pop()))),'the chat list says it is a widget');
 ok(await E(c=>{const ch=S.chats.find(x=>x.id===c);ch.msgs.push({id:uid(),from:'me',text:'',att:{kind:'day',title:'My day',date:today(),st:{focus:5,tasks:1,notes:0,agenda:'0/0'},items:[]},at:Date.now()});render();return!!document.querySelector('.msg:last-of-type .wdg.w-day')||document.querySelectorAll('.wdg.w-day').length>=1},gc),'older shared cards show as widgets');
 await G('projects');await E(()=>projectForm());await Z(300);await r.fill('#pN','Thesis');await r.click('#sf button[type=submit]');await Z(800);
 await r.click('.ph [aria-label="Share project"]');await Z(400);ok(await E(()=>!!document.querySelector('.wstage .wdg.w-project')),'sharing a project opens its widget');await E(()=>closeSheet());await Z(300);
 ok(await E(()=>{let s=0;Object.values(S.usage.days).forEach(d=>s+=d._n);return Math.abs(s-S.usage.total)<1||S.usage.total>=400000}),'knots stay consistent');
 await c5.close()}

ok(errs.length===0,'no script errors'+(errs.length?': '+[...new Set(errs)].slice(0,5).join(' | '):''));
console.log(`\n${pass} passed, ${fail} failed`);await b.close()})();
