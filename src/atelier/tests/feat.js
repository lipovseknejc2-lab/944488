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
ok(await ev(()=>S.usage.total===1),'sign-in uses 1 knot');
// today
ok(await p.isVisible('.ttl')&&await p.isVisible('.week')&&await p.isVisible('#motd'),'today: title, week, message of the day');
ok(!(await p.isVisible('text=knots')),'knots hidden on Today');
let k0=await K();await p.click('.playb');await W(300);ok(await K()===k0+1,'message of the day play is metered');
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
await p.click('[aria-label=Attach]');await W(400);await p.click('.sheet [data-n]');await W(500);ok(await p.isVisible('.att'),'note shared in chat');
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
ok(await ev(()=>{const c=document.querySelector('.prof');return c.querySelector('h2').textContent==='Nejc Lipovšek'&&/Student · University of Ljubljana/.test(c.textContent)&&/nejc\.lipovsek@example\.com/.test(c.textContent)&&!!c.querySelector('.vpill')}),'You shows full name, school, email and the encrypted badge');
{const iv0=await ev(()=>S.me.vault.iv),k0=await K();await p.click('.prof .btn:has-text("Edit")');await W(500);
 ok(await p.inputValue('#pfSur')==='Lipovšek'&&await p.inputValue('#pfMail')==='nejc.lipovsek@example.com'&&await ev(()=>document.querySelector('#pfSt input[value=student]').checked),'edit sheet opens with the saved details');
 await p.fill('#pfMail','');await p.click('#sf button[type=submit]');await W(300);ok(await ev(()=>isOpen()&&!!document.querySelector('#sf .ferr')),'edit sheet will not save without an email');
 await p.click('#pfSt label:has-text("Working")');await p.fill('#pfRole','Ceramics lead');await p.fill('#pfMail','nejc@studio.si');await p.fill('#pfName','Nejko');await p.click('#sf button[type=submit]');await W(700);
 ok(await ev(()=>!isOpen()&&S.me.name==='Nejko'&&PROFILE.status==='work'&&document.querySelector('.prof h2').textContent==='Nejko Lipovšek'&&/Ceramics lead/.test(document.querySelector('.prof').textContent)),'profile edits show at once');
 ok(await ev(iv=>S.me.vault.iv!==iv&&!/studio\.si|Ceramics lead/.test(localStorage.getItem('atelier-v1')),iv0),'edited profile is sealed again with a new IV');
 ok(await K()===k0+1&&await ev(()=>S.usage.days[today()].profile===1),'profile update uses one knot');
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
 ok(await q.isVisible('.card .vnote:has-text("encrypted on this device")'),'Settings explains the encryption');
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
ok(errs.length===0,'no script errors'+(errs.length?': '+[...new Set(errs)].slice(0,5).join(' | '):''));
console.log(`\n${pass} passed, ${fail} failed`);await b.close()})();
