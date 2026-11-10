// Phone-preview test: sandboxed frame (no storage, no address changes) and a page where address changes are blocked. Real taps only.
const {chromium,devices}=require('playwright');let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
async function run(name,url,frameSel,block){const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/manifest|icon|404|Failed to load/.test(m.text()))errs.push(m.text())});
 if(block)await ctx.addInitScript(()=>{history.pushState=()=>{throw new Error('blocked')};history.replaceState=()=>{throw new Error('blocked')};addEventListener('hashchange',e=>e.stopImmediatePropagation(),true);
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(a)e.preventDefault()},true)});
 await p.goto(url);await p.waitForTimeout(2200);const F=frameSel?p.frameLocator(frameSel):p;const W=t=>p.waitForTimeout(t);
 console.log('--- '+name);
 // onboarding with taps
 await F.locator('#obN').tap();await W(350);ok(await F.locator('text=Ideas grow in company.').isVisible(),name+': onboarding slide 2');
 await F.locator('#obN').tap();await W(350);await F.locator('#obN').tap();await W(450);ok(await F.locator('#obName').isVisible(),name+': account form');
 await F.locator('#obF button[type=submit]').tap();await W(400);ok(await F.locator('#obF .ferr').count()===4&&!(await F.locator('.ttl').isVisible()),name+': empty account form shows errors and waits');
 await F.locator('#obH [data-h="2"]').tap();await W(200);await F.locator('#obName').fill('Nejc');await F.locator('#obSur').fill('Lipovšek');await F.locator('#obC [data-c="1"]').tap();await W(200);
 ok(await F.locator('#obName').inputValue()==='Nejc'&&await F.locator('#obSur').inputValue()==='Lipovšek','name kept after changing look and colour');
 await F.locator('#obSt label:has-text("Student")').tap();await W(150);ok((await F.locator('#obRoleL').textContent())==='Where do you study?',name+': student choice taps');
 {const h=await F.locator('#obSt label').first().boundingBox();ok(h&&h.height>=44,name+': student and working are full-size tap targets ('+Math.round(h?.height||0)+'px)')}
 await F.locator('#obRole').fill('University of Ljubljana');await F.locator('#obMail').fill('nejc@example.com');
 await F.locator('#obF button[type=submit]').tap();await W(1100);ok(await F.locator('.ttl').isVisible(),name+': account created, Today opens');
 await F.locator('#tabs a:has-text("You")').tap();await W(700);ok((await F.locator('.prof h2').textContent())==='Nejc Lipovšek'&&await F.locator('.prof .pmail').isVisible(),name+': You shows the full name and email');
 ok(!(await F.locator('.prof .vpill').count())&&!/encrypt/i.test(await F.locator('#view').textContent()),name+': no encryption notes on show');
 for(const [tab,check] of [['Focus','.clockwrap'],['Notes','.ngrid'],['Projects','text=Small steps, far places'],['Chat','.convo'],['You','.knotsum'],['Today','.ttl']]){
  await F.locator(`#tabs a:has-text("${tab}")`).tap();await W(600);ok(await F.locator(check).first().isVisible(),`${name}: tab ${tab} opens`)}
 await F.locator('.thav').tap();await W(500);ok(await F.locator('.knotsum').isVisible(),name+': avatar opens account');
 await F.locator('#tabs a:has-text("Today")').tap();await W(400);
 await F.locator('.lnk:has-text("Ledger")').tap();await W(500);ok(await F.locator('h1:has-text("Ledger")').isVisible(),name+': Ledger link');
 await F.locator('.ph .icon-btn[aria-label=Back]').tap();await W(500);ok(await F.locator('.ttl').isVisible(),name+': back button');
 await F.locator('.agsec .btn:has-text("Add to agenda")').tap();await W(450);await F.locator('#agT').fill('Phone plan');await F.locator('#agH').fill('10:15');await F.locator('#sf button[type=submit]').tap();await W(600);
 ok(await F.locator('.agi:has-text("Phone plan")').isVisible(),name+': agenda item added with taps');
 {const b=await F.locator('.agacts .btn').first().boundingBox(),vw=await p.evaluate(()=>innerWidth);ok(b&&b.x+b.width<vw-90,name+': agenda buttons stay clear of the quick panel')}
 await F.locator('.agi .agc').first().tap();await W(450);ok(await F.locator('.agi.done').count()===1,name+': agenda item ticked off');
 // panel
 ok(await F.locator('#rail .rbtns').isVisible(),name+': quick panel visible');
 const card=await F.locator('#motd').boundingBox(),vw=await p.evaluate(()=>innerWidth);await p.screenshot({path:'shots/ph_'+name.split(' ')[0]+'.png'});console.log('  card',Math.round(card.x),Math.round(card.width),'viewport',vw);ok(card.x+card.width>vw-30&&card.x+card.width<=vw,name+': panel floats, content keeps full width ('+Math.round(card.width)+'px)');
 await F.locator('.rtog').tap();await W(600);ok(!(await F.locator('#rail .rbtns').isVisible())||await F.locator('#rail.off').count()===1,name+': panel hides');
 ok(await F.locator('.rtog').isVisible(),name+': handle stays to bring it back');
 {const g=await F.locator('.rtog').evaluate(el=>{const r=el.getBoundingClientRect();return{gap:innerWidth-r.right,w:r.width}});ok(g.gap>=-1&&g.gap<=2&&g.w<=30,name+': tucked handle sits flush on the screen edge (gap '+Math.round(g.gap)+'px)')}
 await F.locator('.rtog').tap();await W(500);ok(await F.locator('#rail:not(.off) .rbtns').isVisible(),name+': panel comes back');
 {const g=await F.locator('#rail').evaluate(el=>{const b=el.querySelector('.rbtns').getBoundingClientRect(),t=el.querySelector('.rtog').getBoundingClientRect();return{gap:innerWidth-b.right,join:b.left-t.right}});ok(g.gap>=-1&&g.gap<=2&&Math.abs(g.join)<=2,name+': open panel docks to the edge with the handle attached')}
 await F.locator('#tabs a:has-text("Notes")').tap();await W(400);ok(await F.locator('#rail.off').count()===1,name+': on other pages it waits as a handle');await F.locator('.rtog').tap();await W(400);ok(await F.locator('#rail:not(.off)').count()===1,name+': handle opens it on any page');await F.locator('#tabs a:has-text("Today")').tap();await W(400);
 await F.locator('#rail .rbtns button:has-text("Voice")').tap();await W(500);ok(await F.locator('.sheet label.btn:has-text("Attach a recording")').isVisible(),name+': voice sheet with options');
 await F.locator('#vb').tap();await W(700);ok(await F.locator('#vr.on').count()===1,name+': voice record animation runs');
 await F.locator('#vb').tap();await W(500);ok(await F.locator('#vr.on').count()===0,name+': voice stops with one tap');
 await F.locator('#vd').tap();await W(500);ok(await F.locator('#vr.on').count()===1,name+': dictation animation runs');
 await F.locator('.sheet [data-close]').first().tap();await W(500);ok(!(await F.locator('#modal.open').count()),name+': voice closes while listening');
 await F.locator('#rail .rbtns button:has-text("Note")').tap();await W(600);ok(await F.locator('#nB').isVisible(),name+': quick note opens');
 await F.locator('#nB').fill('Hello from the phone');await W(400);await F.locator('.ph a[aria-label=Back]').tap();await W(500);ok(await F.locator('.ncard b:has-text("Hello from the phone")').isVisible(),name+': note saved and listed');
 await F.locator('#tabs a:has-text("Projects")').tap();await W(400);await F.locator('.ph .btn:has-text("New")').tap();await W(500);await F.locator('#pN').fill('Phone project');await F.locator('#sf button[type=submit]').tap();await W(900);
 ok(await F.locator('.ptabs').isVisible(),name+': project created and opened');await F.locator('.ptabs a:has-text("Tasks")').tap();await W(500);ok(await F.locator('.kanban').isVisible(),name+': project tab opens');
 await F.locator('#tabs a:has-text("Focus")').tap();await W(500);await F.locator('.ftabs a:has-text("Study")').tap();await W(500);ok(await F.locator('.sgoal').isVisible(),name+': Study opens from Focus');
 await F.locator('.sh .lnk:has-text("New deck")').tap();await W(450);await F.locator('#dkN').fill('Phone deck');await F.locator('#sf button[type=submit]').tap();await W(800);ok(await F.locator('#cfF').isVisible(),name+': new deck with taps');
 await F.locator('#cfA').fill('Front side');await F.locator('#cfB').fill('Back side');await F.locator('#cfF button').tap();await W(500);ok(await F.locator('.fcd:has-text("Front side")').isVisible(),name+': card added');
 await F.locator('.dhero .btn.primary').tap();await W(600);await F.locator('#flp').tap();await W(800);ok(await F.locator('#flp.on').count()===1,name+': card flips with a tap');
 await F.locator('.grade button:has-text("Good")').tap();await W(700);ok(await F.locator('.rdone').isVisible(),name+': review done');
 await F.locator('.rdone .btn').first().tap();await W(500);await F.locator('#tabs a:has-text("Focus")').tap();await W(500);
 await F.locator('.fbtns .zbtn').tap();await W(900);ok(await F.locator('#zen').isVisible()&&!(await F.locator('#tabs').isVisible()),name+': deep mode hides everything else');
 await F.locator('#zen').tap({position:{x:180,y:300}});await W(400);await F.locator('#zX').tap();await W(700);ok(!(await F.locator('#zen').count())&&await F.locator('#tabs').isVisible(),name+': leave deep mode with a tap');
 await F.locator('[aria-label=Stop]').tap();await W(400);
 await F.locator('#tabs a:has-text("Chat")').tap();await W(400);await F.locator('.convo').first().tap();await W(600);ok(await F.locator('#ci').isVisible(),name+': conversation opens');
 await F.locator('#ci').fill('Hi team');await F.locator('.sendb').tap();await W(400);ok(await F.locator('.msg.me >> text=Hi team').isVisible(),name+': message sends');
 await F.locator('.composer [aria-label=Share]').tap();await W(450);ok(await F.locator('.shopt').count()===7,name+': share sheet opens');
 await F.locator('.shopt[data-k=day]').tap();await W(700);ok(await F.locator('.msg.me .rday').first().isVisible(),name+': share my day with a tap');
 await F.locator('.composer [aria-label=Share]').tap();await W(400);await F.locator('.shopt[data-k=agenda]').tap();await W(700);ok(await F.locator('.msg.me .rag').first().isVisible(),name+': share the agenda with a tap');
 await F.locator('.chinfo').tap();await W(700);ok(await F.locator('.mstrip').isVisible(),name+': tap the chat header for group info');
 ok(await F.locator('.sh h2:has-text("Active projects")').isVisible()||await F.locator('.sh h2:has-text("Active projects")').count()===1,name+': group info lists active projects');
 await F.locator('.ph .icon-btn[aria-label=Back]').tap();await W(600);ok(await F.locator('#ci').isVisible(),name+': back from group info to the chat');
 await F.locator('.chath a[aria-label=Back]').tap();await W(400);await F.locator('.seg a:has-text("Groups")').tap();await W(400);ok(await F.locator('.gcard').first().isVisible(),name+': groups open');
 await F.locator('.seg a:has-text("People")').tap();await W(400);ok(await F.locator('text=Maja Kovač').isVisible(),name+': people open');
 await F.locator('#tabs a:has-text("Focus")').tap();await W(400);await F.locator('[data-mode=study]').tap();await W(300);await F.locator('.cbtn.main').tap();await W(600);ok(await F.locator('[aria-label=Pause]').isVisible(),name+': focus starts');
 await F.locator('#tabs a:has-text("Today")').tap();await W(500);ok(await F.locator('.fcard').isVisible(),name+': live focus card');
 ok(errs.length===0,name+': no errors'+(errs.length?': '+[...new Set(errs)].slice(0,4).join(' | '):''));
 await b.close()}
(async()=>{await run('Sandboxed preview','http://127.0.0.1:8812/sandbox.html','#f',false);await run('Address changes blocked','http://127.0.0.1:8812/atelier.html',null,true);await run('Safari normal','http://127.0.0.1:8812/atelier.html',null,false);
 console.log(`\n${pass} passed, ${fail} failed`)})();
