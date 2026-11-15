// Focused test of Atelier Plugins (the desktop hub): sign in, license, dashboard, studio (nodes and code), the test
// bench, sending (QR, inbox) and importing. Desktop viewport, no script errors.
const {chromium}=require('playwright');const D=__dirname;const U='http://127.0.0.1:8813/hub.html';let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();const errs=[];p.on('dialog',d=>d.accept().catch(()=>{}));p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/sw\.js|manifest|icon|404|camera|getUserMedia|NotFound|NotAllowed|Requested device/i.test(m.text()))errs.push(m.text())});
const ev=(f,a)=>p.evaluate(f,a),W=t=>p.waitForTimeout(t),shot=n=>p.screenshot({path:D+'/shots/'+n+'.png'});
await p.goto(U);await W(600);ok(await p.isVisible('#siF'),'sign in first');await shot('signin');
ok(await ev(()=>document.querySelectorAll('.tslide').length===3&&!!document.querySelector('.s-nodes')&&!!document.querySelector('.s-bench')&&!!document.querySelector('.s-phone')),'the tour: three illustrated slides');
await p.click('#tN');await W(900);ok(await ev(()=>document.querySelector('.tslide.on')===document.querySelectorAll('.tslide')[1]&&document.querySelectorAll('.tdots .on').length===1),'the arrow moves to the next slide, the dots follow');await shot('signin-bench');
await p.click('#tN');await W(900);await shot('signin-phone');await p.click('#tP');await W(900);ok(await ev(()=>document.querySelector('.tslide.on')===document.querySelectorAll('.tslide')[1]),'and back');
await p.fill('#siN','Nejc Lipovšek');await p.fill('#siE','n@example.com');await p.fill('#siS','Nejc Studio');await p.click('#siF button[type=submit]');await W(1400);
ok(await p.isVisible('.plqart .s-plaque')&&/AP-\w{4}-\w{4}/.test(await p.textContent('.plqart')),'a builder license is issued: a character holds the plaque');ok(/Start creating/.test(await p.textContent('#licOk')),'start creating');await shot('license');
await p.click('#licOk');await W(600);ok(await p.isVisible('.tiles .tile')&&await p.isVisible('.side .nv.on >> text=Dashboard'),'dashboard with tiles and the sidebar');await shot('dashboard');
// new plugin with nodes
await p.click('.side .btn:has-text("New plugin")');await W(300);await p.fill('#npN','Greeter');await p.click('#npGo');await W(700);
ok(await ev(()=>V.view==='studio'&&document.querySelectorAll('.nd').length===2&&document.querySelectorAll('.wire').length===1),'a new plugin starts with a command and a reply, wired');
// add a block from the palette after the reply, edit it, and connect by dragging
await p.click('.nd[data-n=n2]');await W(150);await p.click('.pb[data-k=react]');await W(400);ok(await ev(()=>{const G=curPl().graph;return G.nodes.length===3&&G.links.some(l=>l.a==='n2'&&l.b==='n3')}),'click a block: it is added after the selected one and wired');
await p.click('.rxrow [data-rv=love]');await W(200);ok(await ev(()=>curPl().graph.nodes.find(n=>n.id==='n3').p.key==='love'),'inspector edits a block');
await p.click('.pb[data-k=join]');await W(400);await ev(()=>{fitView();drawWires()});await W(200);
const from=await p.$('.nd[data-n=n4] .pin.out'),to=await p.$('.nd[data-n=n2] .ndh');const a=await from.boundingBox(),c=await to.boundingBox();
await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(c.x+60,c.y+10,{steps:12});await p.mouse.up();await W(300);
ok(await ev(()=>curPl().graph.links.some(l=>l.a==='n4'&&l.b==='n2')),'drag from a dot to a block to connect');
const nd=await (await p.$('.nd[data-n=n4] .ndh')).boundingBox();await p.mouse.move(nd.x+40,nd.y+10);await p.mouse.down();await p.mouse.move(nd.x+40,nd.y+170,{steps:8});await p.mouse.up();await W(200);ok(await ev(()=>curPl().graph.nodes.find(n=>n.id==='n4').y>200),'drag blocks around');
await ev(()=>{fitView();drawWires()});await W(150);await p.click('.nd[data-n=n2] .ndh');await W(150);await p.fill('#pp_text','Hi {user}, welcome to {group}!');await W(400);ok(await ev(()=>/welcome to \{group\}/.test(PK.gen(curPl()))&&/welcome to/.test(document.querySelector('.genc').textContent)),'the code writes itself from the nodes');
await p.keyboard.press('Escape');await ev(()=>{V.sel=null});await p.click('.genh button:has-text("Checks")');await W(300);ok(await p.isVisible('.chks .chk'),'checks list');
await p.keyboard.press('Control+z');await W(300);ok(await ev(()=>V.fut.length===1),'undo');await p.keyboard.press('Control+Shift+z');await W(300);
await ev(()=>fitView());await W(200);await shot('studio');
// test bench
await p.click('.stbar .btn:has-text("Test")');await W(500);ok(await p.isVisible('.bchat'),'test bench opens');
await p.fill('#bI','/hello');await p.press('#bI','Enter');await W(700);ok(await ev(()=>[...document.querySelectorAll('.bmsg.pl .plw')].some(x=>/Hi Nejc, welcome to Test group!/.test(x.textContent))),'commands run on the bench');
ok(await ev(()=>document.querySelectorAll('.bmsg .rx').length>=1),'the reaction shows');
ok(await ev(()=>document.querySelector('.bmsg.me .cmdt')?.textContent==='/hello'),'commands glow in my message');
await p.fill('#bI','/he');ok(await ev(()=>document.querySelector('#bI').classList.contains('cmdin')),'the composer lights up for a command');await p.fill('#bI','');
await p.click('.bacts .btn:has-text("Someone joins")');await W(700);ok(await ev(()=>[...document.querySelectorAll('.bmsg.pl .plw')].some(x=>/Hi Nina/.test(x.textContent))),'someone joins: the plugin greets them');
ok(await ev(()=>document.querySelectorAll('.blog .bl').length>=2),'the log shows what ran');await shot('bench');
// coins starter
await ev(()=>go('public'));await W(400);ok(await ev(()=>document.querySelectorAll('.pcard').length===4),'public plugins: the four starters');await shot('public');
await p.click('.pcard:has-text("Coins") .btn:has-text("Use as a start")');await W(700);ok(await ev(()=>V.view==='studio'&&curPl().graph.nodes.length===20),'Coins opens in the studio, 20 nodes');await ev(()=>fitView());await W(200);await shot('studio-coins');
await p.click('.stbar .btn:has-text("Test")');await W(500);
await p.fill('#bI','Morning');await p.press('#bI','Enter');await W(500);await p.fill('#bI','/coins');await p.press('#bI','Enter');await W(500);ok(await ev(()=>[...document.querySelectorAll('.bmsg.pl .plwv b')].some(x=>x.textContent==='10')),'coins on the bench');
await p.selectOption('#bAs','s0');await p.fill('#bI','hey');await p.press('#bI','Enter');await W(400);await p.selectOption('#bAs','me');await p.fill('#bI','/give Ana 4');await p.press('#bI','Enter');await W(500);
ok(await ev(()=>{const s=sim().store.m;return s.me.coins===6&&s.s0.coins===14}),'give coins between members');ok(await p.isVisible('.vt'),'values table');
await p.click('.bacts .btn:has-text("Next day")');await W(300);await p.fill('#bI','Day two');await p.press('#bI','Enter');await W(500);ok(await ev(()=>sim().store.m.me.coins===16),'next day: daily coins again');await shot('bench-coins');
await p.fill('#bI','/top');await p.press('#bI','Enter');await W(600);ok(await ev(()=>document.querySelectorAll('.bmsg.pl:last-of-type .plwr div, .bmsg.pl .plwr div').length>=2),'the leaderboard is a widget with rows');await shot('bench-widgets');
// sending
await p.click('.stbar .btn:has-text("Send to Atelier")');await W(600);ok(await ev(()=>!!document.querySelector('#sQ svg path')&&/\d+ \/ \d+/.test(document.querySelector('.qrmeta').textContent)),'QR codes, several for a big plugin');await shot('send');
await p.click('#sIn');await W(200);ok(await ev(()=>JSON.parse(localStorage.getItem('atelier-plugin-inbox')).length===1),'send to Atelier on this computer');
const code=await ev(async()=>PK.encode(curPl()));await ev(()=>closeModal());
// import
await ev(()=>{H.plugins=H.plugins.filter(x=>x.name!=='Coins')});await p.click('.side .btn:has-text("Import")');await W(400);await p.fill('#iT',code);await p.click('#iGo');await W(500);ok(await ev(()=>V.view==='studio'&&curPl().name==='Coins'),'import a plugin by code');
// code mode
await p.click('.stbar .seg button:has-text("Code")');await W(500);ok(await ev(()=>curPl().mode==='code'&&/on\("daily"/.test(document.querySelector('#cedT').value)),'switch to code: the written code comes along');
await p.fill('#cedT',"on('command', { name: 'roll' }, a => {\n  a.random('dice', 1, 6)\n  a.reply('{user} rolled {dice}')\n})\n");await W(300);ok(await p.isVisible('.cedmsg.ok'),'the editor checks the code');
await p.fill('#cedT',"on('command', { name: 'x' }, a => {");await W(200);ok(await p.isVisible('.cedmsg.err'),'and shows mistakes');
await p.fill('#cedT',"on('command', { name: 'roll' }, a => {\n  a.random('dice', 1, 6)\n  a.reply('{user} rolled {dice}')\n})\n");await shot('code');
await p.click('.stbar .btn:has-text("Test")');await W(500);await p.fill('#bI','/roll');await p.press('#bI','Enter');await W(1200);ok(await ev(()=>[...document.querySelectorAll('.bmsg.pl .plw')].some(x=>/Nejc rolled [1-6]/.test(x.textContent))),'coded plugins run on the bench, sealed away');
// node points
ok(await ev(()=>H.np.total>=30&&+document.querySelector('#npP b').textContent.replace(/\D/g,'')===H.np.total),'node points count what you build: '+(await ev(()=>H.np.total)));
await ev(()=>go('dash'));await W(500);ok(await p.isVisible('#npSec .npbig'),'node points on the dashboard');await shot('dash-np');
// license
await p.click('.side .nv:has-text("License")');await W(500);ok(await ev(()=>V.view==='lic')&&await p.isVisible('.lplq .s-plaque'),'the license tab, illustrated');
ok(await ev(()=>!document.querySelector('#lkV')||/•|\*/.test(document.querySelector('.lkey').textContent)),'the key is hidden');await p.click('#lkS');await W(300);ok(await ev(()=>document.querySelector('.lkey').textContent.includes(H.lic.no)),'show the key');
await p.click('#lcNew');await W(400);await p.fill('#lcL','Studio laptop');await p.click('#lcMk');await W(600);ok(await ev(()=>H.lic.codes.length===1&&H.lic.codes[0].label==='Studio laptop'&&!!document.querySelector('#modal svg path')),'make a code for another computer, with a QR code');
const lcode=await ev(()=>licCode(H.lic.codes[0]));await ev(()=>closeModal());await W(300);ok(await ev(()=>document.querySelectorAll('.llog div').length>=3),'the license log');await shot('license-tab');
await p.fill('#lcIn',lcode);await p.click('#lcGo');await W(500);ok(await ev(()=>H.lic.seat==='s2'||H.lic.codes[0].used),'redeem a code');
await ev(()=>go('lic'));await W(300);if(await p.$('[data-rev]')){await p.click('[data-rev]');await W(300)}ok(await ev(()=>H.lic.codes.length===0),'take a code back');
// settings
await p.click('.side .nv:has-text("Settings")');await W(500);ok(await ev(()=>V.view==='set')&&await p.isVisible('.surfs'),'settings');
await p.click('.acc[data-k=accent][data-v=moss]');await W(300);ok(await ev(()=>H.set.accent==='moss'&&getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()!==''),'accent changes');
for(const sf of ['graphite','walnut','paper']){await p.click(`.surf[data-v=${sf}]`);await W(400);await shot('settings-'+sf)}
ok(await ev(()=>document.documentElement.dataset.surface==='paper'&&getComputedStyle(document.body).backgroundColor!=='rgb(26, 25, 23)'),'surfaces change the whole hub');
await p.click('[data-k=wire][data-v=elbow]');await W(200);ok(await ev(()=>H.set.wire==='elbow'),'wire style');
await p.click('[data-k=tourAuto][data-v=false]');await W(200);ok(await ev(()=>H.set.tourAuto===false),'tour auto play setting');
await p.click('#setR');await W(400);ok(await ev(()=>H.set.surface==='charcoal'&&H.set.accent!=='moss'),'put settings back');
// library and reload
await ev(()=>go('library'));await W(400);ok(await ev(()=>document.querySelectorAll('.pcard').length===2),'library lists the plugins');await shot('library');
await p.reload();await W(800);ok(await ev(()=>H.plugins.length===2&&H.lic.ok&&V.view==='dash'),'everything is kept after a reload');ok(await ev(()=>+document.querySelectorAll('.tile .big')[1].textContent>=1),'the dashboard counts sends');
ok(errs.length===0,'no script errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();
