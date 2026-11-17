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
ok(await ev(()=>!H.lic&&V.view==='dash'&&!document.querySelector('.plqart')),'no license step: straight to the dashboard');ok(await p.isVisible('.side .nv em.claim'),'License says Claim');
ok(await ev(()=>{const a=JSON.parse(localStorage.getItem('atelier-account'));return a&&a.id===H.acct.acc&&a.name==='Nejc'}),'one account: the hub writes the shared account');
ok(await p.isVisible('.tiles .tile')&&await p.isVisible('.side .nv.on >> text=Dashboard'),'dashboard with tiles and the sidebar');await shot('dashboard');
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
await ev(()=>go('public'));await W(400);ok(await ev(()=>document.querySelectorAll('.pcard').length===14),'public plugins: fourteen starters');await shot('public');
await p.click('.pcard:has-text("Coins") .btn:has-text("Use as a start")');await W(700);ok(await ev(()=>V.view==='studio'&&curPl().graph.nodes.length===20),'Coins opens in the studio, 20 nodes');await ev(()=>fitView());await W(200);await shot('studio-coins');
await p.click('.stbar .btn:has-text("Test")');await W(500);
await p.fill('#bI','Morning');await p.press('#bI','Enter');await W(500);await p.fill('#bI','/coins');await p.press('#bI','Enter');await W(500);ok(await ev(()=>[...document.querySelectorAll('.bmsg.pl .plwv b')].some(x=>x.textContent==='10')),'coins on the bench');
await p.selectOption('#bAs','s0');await p.fill('#bI','hey');await p.press('#bI','Enter');await W(400);await p.selectOption('#bAs','me');await p.fill('#bI','/give Ana 4');await p.press('#bI','Enter');await W(500);
ok(await ev(()=>{const s=sim().store.m;return s.me.coins===6&&s.s0.coins===14}),'give coins between members');ok(await p.isVisible('.vt'),'values table');
await p.click('.bacts .btn:has-text("Next day")');await W(300);await p.fill('#bI','Day two');await p.press('#bI','Enter');await W(500);ok(await ev(()=>sim().store.m.me.coins===16),'next day: daily coins again');await shot('bench-coins');
await p.fill('#bI','/top');await p.press('#bI','Enter');await W(600);ok(await ev(()=>document.querySelectorAll('.bmsg.pl:last-of-type .plwr div, .bmsg.pl .plwr div').length>=2),'the leaderboard is a widget with rows');await shot('bench-widgets');
// without a license a plugin works in one group only
await p.click('.stbar .btn:has-text("Send to Atelier")');await W(400);ok(await ev(()=>/One group without a license/.test(document.querySelector('#modal').textContent)),'without a license: one group, or claim');await ev(()=>closeModal());
// claim the license in the License tab
await ev(()=>go('lic'));await W(400);ok(await p.isVisible('.s-claim')&&await p.isVisible('.cmpt'),'License: claim it, with what it changes');await shot('license-claim');
await p.click('#lcClaim');await W(800);ok(await ev(()=>licensed()&&/AP-\w{4}-\w{4}/.test(H.lic.no))&&await p.isVisible('#modal .s-cheer'),'claimed: a thumbs up and the license');ok(/You got your license/.test(await p.textContent('#modal')),'you got your license');await shot('license');
await p.click('#licOk');await W(500);await ev(()=>go('studio',H.plugins.find(x=>x.name==='Coins').id));await W(400);
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
// developer points: spent while building, back on undo, a daily allowance, a simulated shop, earned from Atelier
ok(await ev(()=>H.dp&&H.dp.bal>0&&+document.querySelector('#dpP b').textContent.replace(/\D/g,'')===H.dp.bal),'developer points in the sidebar: '+(await ev(()=>H.dp.bal)));
await ev(()=>go('studio',H.plugins.find(x=>x.name==='Greeter').id));await W(400);const b0=await ev(()=>H.dp.bal);await ev(()=>{V.sel=null;addNode('react',600,400)});await W(200);
ok(await ev(b=>H.dp.bal===b-DPC.node&&curPl().dp>=DPC.node,b0),'a new block costs points');ok(await p.isVisible('#dpM'),'the studio shows what this plugin used');
await p.keyboard.press('Control+z');await W(300);ok(await ev(b=>H.dp.bal===b,b0),'undo gives them back');
await ev(()=>{H.dp.bal=1;render()});const n1=await ev(()=>curPl().graph.nodes.length);await ev(()=>{V.sel=null;addNode('react',600,400)});await W(500);
ok(await ev(n=>curPl().graph.nodes.length===n&&!!document.querySelector('.dpshop'),n1),'out of points: the change is taken back and the shop opens');await shot('dp-shop');
await p.click('.dppack:has-text("Studio")');await W(500);ok(await ev(()=>H.dp.bal===7001&&H.dp.bought===7000),'buy points (simulated, no payment)');
const e0=await ev(()=>H.dp.bal);await ev(()=>{const id=H.plugins.find(x=>x.name==='Greeter').id;localStorage.setItem('atelier-plugin-stats',JSON.stringify({[id]:{installs:2,adds:1,likes:3,days:{}}}));V._dpt=0;dpTick()});
ok(await ev(e=>H.dp.bal===e+2*8+12+3*5&&H.np.total>0,e0),'installs, group additions and likes from Atelier earn points');
ok(await ev(()=>{const b=JSON.parse(localStorage.getItem('atelier-builder'));return b&&b.dp===H.dp.bal&&b.np===H.np.total}),'node and developer points are shared with Atelier');
await ev(()=>{const p=H.plugins.find(x=>x.name==='Greeter');p.pub=true;H.dp.sim[p.id]={from:dDay(Date.now()-6*864e5),done:dDay(Date.now()-6*864e5),days:{}};dpTrend(p)});ok(await ev(()=>{const t=dpTrendNow(H.plugins.find(x=>x.name==='Greeter'));return t&&t.total>0&&t.m>0}),'published plugins earn from a download trend');
await ev(()=>go('dev'));await W(500);ok(await p.isVisible('.dphero .dpbal')&&await p.isVisible('.dptr'),'the developer points wallet');await shot('dev-points');
await ev(()=>{H.plugins.find(x=>x.name==='Greeter').pub=false});
await ev(()=>go('dash'));await W(500);ok(await p.isVisible('#dpSec .dpbal'),'developer points on the dashboard');await shot('dash-np');
// the widget designer
await ev(()=>{go('studio',H.plugins.find(x=>x.name==='Greeter').id)});await W(300);await ev(()=>{V.sel=null;addNode('card',700,200)});await W(300);await p.click('.dsgbtn');await W(400);ok(await p.isVisible('.dsgrid .dsstage .plw'),'the widget designer opens with a preview');
await p.click('[data-eye="text"]');await W(150);await p.click('#dsBA');await W(150);await p.fill('[data-bt="0"]','See coins');await p.selectOption('[data-bd="0"]','cmd');await W(150);await p.fill('[data-bv="0"]','/coins');await p.click('#dsBg [data-v="glow"]');await p.click('[data-tone2="blue"]');await p.click('#dsAl [data-v="center"]');await W(200);await shot('designer');
await p.click('#dsS');await W(300);ok(await ev(()=>{const d=PK.design(curPl().graph.nodes.find(n=>n.k==='card'&&n.p.design).p.design,'card');return d.hide.includes('text')&&d.buttons[0].t==='See coins'&&d.buttons[0].v==='/coins'&&d.bg==='glow'&&d.align==='center'}),'the design is saved on the block');
ok(await ev(()=>/data-pdo="cmd"/.test(PK.plCard({card:{title:'x',value:'1',design:curPl().graph.nodes.find(n=>n.k==='card'&&n.p.design).p.design},text:''},curPl()))),'widgets render the buttons');
// the whole library at once
await ev(()=>go('library'));await W(300);await p.click('.hdr .btn:has-text("Send the whole library")');await W(500);ok(await ev(()=>!!document.querySelector('#lQ svg path')&&document.querySelectorAll('.libl .pill').length===H.plugins.filter(p=>!p.priv).length),'send the whole library as codes');await shot('library-send');
await p.click('#lIn');await W(200);ok(await ev(async()=>{const L=JSON.parse(localStorage.getItem('atelier-plugin-inbox'));const B=await PK.decodeBundle(L[L.length-1]);return B.plugins.length===H.plugins.filter(p=>!p.priv).length}),'the library goes to Atelier in one bundle');await ev(()=>closeModal());
// license
await p.click('.side .nv:has-text("License")');await W(500);ok(await ev(()=>V.view==='lic')&&await p.isVisible('.lplq .s-cheer'),'the license tab, illustrated');
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
// public plugins: search, filters, details
await ev(()=>go('public'));await W(400);ok(await p.isVisible('.pubfeat'),'a featured plugin made of bots');
await p.fill('#pq','/roll');await W(500);ok(await ev(()=>document.querySelectorAll('#pubR .pcard').length===1&&/Dice/.test(document.querySelector('#pubR').textContent)),'search finds commands');
await p.fill('#pq','');await W(400);await p.click('.pbcat:has-text("Fun and games")');await W(300);ok(await ev(()=>document.querySelectorAll('.pcard').length===4),'filter by category');
await ev(()=>{H.pf.cat='all';render()});await p.click('.fchip:has-text("Bots")');await W(300);ok(await ev(()=>document.querySelectorAll('.pcard').length===1),'filter: only plugins with bots');await ev(()=>{H.pf.bots=false;render()});
await p.click('.pcard:has-text("Guard") .btn:has-text("Details")');await W(400);ok(await ev(()=>document.querySelectorAll('#modal .pibot').length===3&&/How to use it/.test(document.querySelector('#modal').textContent)),'details: bots, how to, rules');await shot('public-details');await ev(()=>closeModal());
// bots in the studio
await p.click('.pcard:has-text("Guard") .btn:has-text("Use as a start")');await W(600);ok(await ev(()=>document.querySelectorAll('.botbar .bbt.bot').length===3&&!!curPl().base),'Guard: three bots, and the credit stays');ok(/Based on Guard by Atelier/.test(await p.textContent('.insp')),'credit in the studio');
await p.click('.bbt.bot:has-text("Kind words")');await W(500);ok(await ev(()=>V.bot==='kind'&&document.querySelectorAll('.nd').length===4&&/Bot/.test(document.querySelector('.insp .tag').textContent)),'open a bot: its own canvas and settings');await ev(()=>fitView());await shot('studio-bot');
await p.click('[data-bs=channels]');await W(300);await p.fill('#bC','general, chat');await W(200);ok(await ev(()=>curBot().scope==='channels'&&curBot().chs.join()==='general,chat'),'a bot works in some channels');await p.click('[data-bs=group]');await W(200);
await p.click('.bbt.add:has-text("New bot")');await W(400);ok(await ev(()=>curPl().bots.length===4&&V.bot===curPl().bots[3].id),'make a new bot');
await p.fill('#bN','Porter');await W(150);const bc=await ev(()=>botPack(curBot()));await ev(()=>{H.plugins.find(x=>x.name==='Coins')});
await ev(()=>go('studio',H.plugins.find(x=>x.name==='Greeter').id));await W(400);await p.click('.bbt.add:has-text("Paste a bot")');await p.fill('#bpT',bc);await p.click('#bpGo');await W(400);ok(await ev(()=>curPl().bots?.[0]?.name==='Porter'),'copy a bot into another plugin with its code');
await ev(()=>go('studio',H.plugins.find(x=>x.name==='Guard').id));await W(300);await p.click('.stbar .btn:has-text("Test")');await W(500);
await p.selectOption('#bAs','s0');await p.fill('#bI','you are stupid');await p.press('#bI','Enter');await W(800);ok(await ev(()=>!!document.querySelector('.bt2.mw .bw')&&[...document.querySelectorAll('.bmsg.pl .plw')].some(x=>/Warning/i.test(x.textContent))),'bench: a bot blurs unkind words and warns');
await p.fill('#bI','danes je lep dan in jaz sem doma');await p.press('#bI','Enter');await W(800);ok(await ev(()=>!!document.querySelector('.bt2.mb')),'bench: one language in #general');ok(await ev(()=>[...document.querySelectorAll('.bmsg.pl .bw, .bmsg.pl .pltag.bot')].length>0||document.querySelectorAll('.pltag.bot').length>0),'bots post as themselves');await shot('bench-bots');await p.selectOption('#bAs','me');
// one account: Atelier on the same computer, its groups, and a private edit without a license
{const c2=await b.newContext({viewport:{width:1440,height:900}}),q=await c2.newPage();q.on('pageerror',e=>errs.push(e.message));q.on('dialog',d=>d.accept().catch(()=>{}));const qe=(f,a)=>q.evaluate(f,a);
 await q.goto(U);await qe(()=>{localStorage.clear();localStorage.setItem('atelier-account',JSON.stringify({id:'a1',name:'Nejc',at:1}));localStorage.setItem('atelier-v1',JSON.stringify({me:{id:'me',name:'Nejc',acc:'a1'},plugins:[],groups:[{id:'g1',name:'Studio crew',owner:'me',members:['me','b1'],roles:[],mroles:{},chs:[{id:'h1',name:'general',type:'talk'}],plugins:[{id:'i1',pid:'atelier.coins',on:true,store:{}}]}]}))});await q.reload();await q.waitForTimeout(600);
 ok(await q.isVisible('#siA')&&/Continue as Nejc/.test(await q.textContent('#siA')),'sign in: continue as the Atelier account');ok(/1 group you manage/.test(await q.textContent('#siA')),'the Atelier account comes preloaded');await q.screenshot({path:D+'/shots/signin-account.png'});
 await q.click('#siA');await q.waitForTimeout(500);ok(await qe(()=>H.acct.acc==='a1'&&!licensed()),'the same account, no license yet');
 await qe(()=>go('groups'));await q.waitForTimeout(400);ok(await qe(()=>document.querySelectorAll('.gcard').length===1&&/Studio crew/.test(document.querySelector('.gcard').textContent)&&/Coins/.test(document.querySelector('.gcard').textContent)),'Your groups: the group and its Coins plugin');ok(await q.isVisible('.limc'),'the limits without a license');await q.screenshot({path:D+'/shots/groups.png'});
 await q.click('.gpl .btn:has-text("Edit for Studio crew")');await q.waitForTimeout(600);ok(await qe(()=>V.view==='studio'&&curPl().priv?.gid==='g1'&&!!curPl().lock&&curPl().from.id==='atelier.coins'),'a private edit for one group');
 ok(await q.isVisible('.lkbar')&&await qe(()=>document.querySelector('#stN').readOnly),'the limits bar, the name stays');
 const n0=await qe(()=>curPl().graph.nodes.length);await qe(()=>{V.sel=curPl().lock.nodes[0];delSel()});ok(await qe(n=>curPl().graph.nodes.length===n,n0),'a block it came with cannot be removed');
 await qe(()=>addNode('giverole',100,900));ok(await qe(n=>curPl().graph.nodes.length===n,n0),'blocks that need a license are refused');
 await qe(()=>{const c=curPl().graph.nodes.find(n=>n.k==='card'&&n.p.unit==='coins');c.p.unit='rocks';c.p.title='Rocks';touch(curPl())});
 for(let i=0;i<7;i++)await qe(i=>{V.sel=null;addNode('react',100+i*40,1000)},i);ok(await qe(n=>curPl().graph.nodes.length===n+6&&privCheck(curPl()).ok,n0),'six new blocks, then no more');await q.screenshot({path:D+'/shots/studio-private.png'});
 ok(await qe(()=>{const x=JSON.parse(JSON.stringify(curPl()));x.name='Rocks';return!PK.guard(x,PK.STARTERS.find(p=>p.id==='atelier.coins')).ok}),'renaming is caught by the check');
 await q.click('.stbar .btn:has-text("Update in Studio crew")');await q.waitForTimeout(500);ok(/Update Coins in Studio crew/.test(await q.textContent('#modal')),'update in the group');await q.click('#sIn');await q.waitForTimeout(300);
 ok(await qe(async()=>{const L=JSON.parse(localStorage.getItem('atelier-plugin-inbox'));const pl=await PK.decode(L[L.length-1]);return pl.priv.gid==='g1'&&pl.lock&&pl.from.id==='atelier.coins'&&pl.base.author==='Atelier'}),'sent to Atelier as a private plugin with its credit');await qe(()=>closeModal());
 await qe(()=>go('test'));await q.waitForTimeout(300);await q.fill('#bI','/coins');await q.press('#bI','Enter');await q.waitForTimeout(600);ok(await qe(()=>[...document.querySelectorAll('.bmsg.pl .plwt')].some(x=>/rocks/i.test(x.textContent))),'the edit runs on the bench');
 const lk=await qe(async()=>PK.encodeLink({f:'atelier-link',acc:'a1',name:'Nejc',at:Date.now(),groups:[{id:'g9',name:'Phone club',plugins:[{iid:'i9',pid:'atelier.dice',on:true}]}],plugins:[]}));
 await qe(()=>importPlugin('link'));await q.fill('#iT',lk);await q.click('#iGo');await q.waitForTimeout(500);ok(await qe(()=>H.links&&V.view==='groups'&&document.querySelectorAll('.gcard').length===2&&/Phone club/.test(document.querySelector('.ggrid').textContent)),'connect a phone with its account link');
 await c2.close();
 const c3=await b.newContext({viewport:{width:1440,height:900}}),r=await c3.newPage();r.on('pageerror',e=>errs.push(e.message));await r.goto(U);await r.evaluate(()=>localStorage.clear());await r.reload();await r.waitForTimeout(500);
 const lk2=await r.evaluate(async()=>PK.encodeLink({f:'atelier-link',acc:'a7',name:'Nejc',at:Date.now(),groups:[{id:'g7',name:'Phone crew',plugins:[]}],plugins:[]}));
 await r.click('#siQ');await r.waitForTimeout(300);ok(/Sign in with your phone/.test(await r.textContent('#modal')),'sign in with the phone: scan its code');await r.fill('#iT',lk2);await r.click('#iGo');await r.waitForTimeout(600);
 ok(await r.evaluate(()=>H.acct&&H.acct.acc==='a7'&&H.acct.name==='Nejc'&&V.view==='groups'&&/Phone crew/.test(document.body.textContent)),'signed in with the phone account, groups and all');await c3.close()}
ok(errs.length===0,'no script errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();
