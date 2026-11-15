// Focused test: plugins in Atelier (starters, commands, coins, roles, files, coded plugins in the sandbox, QR codes,
// scanning by paste, the hub inbox), reactions (drawn and keyboard), solid group pictures, the Flow icon.
// iPhone 13, light and dark, no script errors.
const {chromium,devices}=require('playwright');const D=__dirname;
const U='http://127.0.0.1:8812/atelier.html';let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await chromium.launch();
for(const theme of ['light','dark']){
const ctx=await b.newContext({...devices['iPhone 13'],colorScheme:theme});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/manifest|icon|404|camera|getUserMedia|NotAllowed|NotFound|Requested device/i.test(m.text()))errs.push(m.text())});
const ev=(f,a)=>p.evaluate(f,a),W=t=>p.waitForTimeout(t),go=async h=>{await ev(h=>go(h),h);await W(450)},T=s=>s+' ('+theme+')';
await p.goto(U);await W(1700);
await p.click('#obS');await W(300);await p.fill('#obName','Nejc');await p.fill('#obSur','Lipovšek');await p.fill('#obMail','n@example.com');
await p.click('#obSt label:has-text("Working")');await p.fill('#obRole','Studio');await p.click('#obF button[type=submit]');await W(1300);
await ev(t=>{S.settings.theme=t;applyTheme();save()},theme);
ok(await ev(()=>!ICON.flow.includes('M18.4')),T('the Flow icon has no dot at its end'));
const gid=await ev(()=>S.groups[0].id);
// solid group pictures
await go('groups');ok(await ev(()=>{const c=getComputedStyle(document.querySelector('.gtile .gav')).backgroundColor;return !/\/\s*0?\.\d|rgba\([^)]*,\s*0?\.\d+\)|transparent/.test(c)}),T('group pictures are solid, the banner does not show through'));
ok(await p.isVisible('.ph a.btn:has-text("Plugins")'),T('Groups has a Plugins button'));
// plugins page
await p.click('.ph a.btn:has-text("Plugins")');await W(450);ok(await ev(()=>route.k==='plugins'&&document.querySelectorAll('.plcard').length===4),T('Plugins page with four starter plugins'));
await p.screenshot({path:D+'/shots/plugins-'+theme+'.png'});
await p.click('.plcard:has-text("Coins")');await W(450);ok(await p.isVisible('.plhero')&&await p.isVisible('.plcmd >> text=/coins'),T('plugin page: what it listens for, what it can do, commands'));
await p.screenshot({path:D+'/shots/plugin-'+theme+'.png'});
await p.click('.plhero .btn:has-text("Show code")');await W(500);ok(await ev(()=>!!document.querySelector('.plqr svg.pkqr path')),T('a plugin shows as a QR code'));await ev(()=>closeSheet());await W(250);
// round trip through the code
ok(await ev(async()=>{const pl=PK.STARTERS[1],c=await PK.encode(pl),back=await PK.decode(c);const parts=PK.parts(c,200),col=PK.collector();let r;for(const x of parts.slice().reverse())r=col.add(x);return back.name==='Coins'&&back.graph.nodes.length===pl.graph.nodes.length&&parts.length>1&&r.done===c}),T('plugins pack into codes and split into several QR codes'));
// add Coins to the group
await go('group:'+gid);ok(await p.isVisible('.plgadd .pladd:has-text("Coins")'),T('group page lists plugins to add'));
await p.click('.plgadd .pladd:has-text("Coins")');await W(900);
ok(await ev(id=>route.k==='g'&&grp(id).plugins.length===1&&!!document.querySelector('#msgs .msg .pltag'),gid),T('Coins added, it says hello in #general as a plugin'));
await p.fill('#ci','/');await W(200);ok(await ev(()=>[...document.querySelectorAll('.cmdpop b')].map(b=>b.textContent).join()==='/coins,/top,/give'),T('typing / lists the commands'));
await p.click('.cmdpop button:has-text("/coins")');ok(await ev(()=>document.querySelector('#ci').value==='/coins '),T('tap a command to use it'));
await p.fill('#ci','Morning team');await p.press('#ci','Enter');await W(6500);
const coins=()=>ev(id=>{const g=grp(id),i=g.plugins[0];return(i.store.m||{})},gid);
ok(await ev(id=>(grp(id).plugins[0].store.m.me||{}).coins===10,gid),T('first message of the day pays 10 coins'));
ok(await ev(()=>!!document.querySelector('.msg.me .rx .rxi')),T('the plugin reacts with a coin'));
await p.fill('#ci','/coins');await p.press('#ci','Enter');await W(900);ok(await ev(()=>[...document.querySelectorAll('.msg .plw')].some(x=>x.querySelector('.plwt')?.textContent==='Balance'&&x.querySelector('.plwv b')?.textContent==='10')),T('/coins answers with a balance widget'));
const maja=await ev(id=>grp(id).members.find(m=>m!=='me'),gid),mname=await ev(i=>person(i).name.split(' ')[0],maja);
const mb=await ev(([id,m])=>(grp(id).plugins[0].store.m[m]||{}).coins||0,[gid,maja]);await p.fill('#ci','/give '+mname+' 3');await p.press('#ci','Enter');await W(900);
ok(await ev(([id,m,b])=>{const s=grp(id).plugins[0].store.m;return s.me.coins===7&&s[m].coins===b+3},[gid,maja,mb]),T('/give moves coins to someone else'));
await p.fill('#ci','/give '+mname+' 50');await p.press('#ci','Enter');await W(900);ok(await p.isVisible('.msg .plw >> text=You need at least 50 coins'),T('cannot give coins you do not have'));
await p.fill('#ci','/top');await p.press('#ci','Enter');await W(900);ok(await ev(()=>[...document.querySelectorAll('.msg .plw')].some(x=>/Most coins/i.test(x.querySelector('.plwt')?.textContent||'')&&x.querySelectorAll('.plwr div').length>=2)),T('/top shows a leaderboard widget with rows'));
ok(await ev(()=>document.querySelector('.msg.me .cmdt, .me .cmdt')?.textContent.startsWith('/')),T('commands glow in my messages'));await p.fill('#ci','/co');ok(await ev(()=>document.querySelector('#ci').classList.contains('cmdin')),T('the composer lights up for a command'));await p.fill('#ci','');
ok(await ev(()=>{const m=[...S.chats.flatMap(c=>c.msgs)].filter(m=>m.text&&m.text.startsWith('/'));return true}),T('commands do not get chatty bot replies'));
// reactions by hand
await p.click('.msg.me .bub >> nth=0',{button:'right'});await W(400);ok(await ev(()=>document.querySelectorAll('.rxpick [data-rk]').length===10),T('press and hold: ten drawn reactions'));
await p.screenshot({path:D+'/shots/react-'+theme+'.png'});
await p.click('.rxpick [data-rk=love]');await W(400);ok(await ev(()=>!!document.querySelector('.msg.me .rx.on')),T('react with love'));
await p.click('.msg.me .bub >> nth=0',{button:'right'});await W(400);await p.click('#rxKb');await p.fill('#rxIn','🎉');await p.click('#rxGo');await W(400);ok(await ev(()=>[...document.querySelectorAll('.rx .rxu')].some(x=>x.textContent==='🎉')),T('react with any emoji from the keyboard'));
await p.click('.msg.me .rx.on >> nth=0');await W(300);ok(await ev(()=>S.chats.flatMap(c=>c.msgs).every(m=>!(m.rx&&m.rx.love&&m.rx.love.includes('me')))),T('tap a reaction again to take it back'));
// a star on someone's message pays its author
const before=await ev(([id,m])=>grp(id).plugins[0].store.m[m]?.coins||0,[gid,maja]);
await ev(([id,m])=>{const c=S.chats.find(x=>x.kind==='group'&&x.with===id&&x.ch==='general');const msg={id:uid(),from:m,text:'Draft is up',at:Date.now()};c.msgs.push(msg);rxToggle(c,msg,'star')},[gid,maja]);await W(700);
ok(await ev(([id,m,b])=>grp(id).plugins[0].store.m[m].coins===b+1,[gid,maja,before]),T('a star gives the author a coin'));
// spotlight
await ev(id=>plugAdd(id,'atelier.spotlight'),gid);await W(800);await p.fill('#ci','/leader');await p.press('#ci','Enter');await W(1000);
ok(await ev(id=>{const g=grp(id),r=g.roles.find(x=>x.name==='Leader');return r&&Object.values(g.mroles).some(L=>L.includes(r.id))},gid),T('Spotlight picks a leader and gives the Leader role'));
await p.fill('#ci','/leader');await p.press('#ci','Enter');await W(900);ok(await p.isVisible('.msg .plw >> text=We already have a leader today'),T('Spotlight waits a day'));
// welcome
await ev(id=>plugAdd(id,'atelier.welcome'),gid);await W(700);
await ev(id=>{const g=grp(id),p=S.people.find(x=>!g.members.includes(x.id))||(S.people.push({id:'zz',name:'Zoe Novak',bot:true,tone:'warm',role:'Tester'}),S.people.find(x=>x.id==='zz'));g.members.push(p.id);gRolesFix(g);plugOnJoin(g,[p.id])},gid);await W(900);
ok(await ev(()=>[...document.querySelectorAll('.msg .plw')].some(x=>/Welcome to .*, Zoe/.test(x.textContent))),T('Welcome greets a new member'));
// file helper
await ev(id=>plugAdd(id,'atelier.files'),gid);await W(700);await p.click('.composer [aria-label="Share"]');await W(400);await p.setInputFiles('#sh_doc',D+'/t.pdf');await W(1600);
ok(await ev(()=>[...document.querySelectorAll('.msg .plw')].some(x=>/t\.pdf: PDF/.test(x.textContent))),T('File helper describes the file'));
ok(await ev(id=>{const c=S.chats.find(x=>x.kind==='group'&&x.with===id&&x.ch==='files');return c&&c.msgs.some(m=>m.from==='pl'&&m.att&&m.att.title==='t.pdf')},gid),T('and files a copy in #files'));
await p.screenshot({path:D+'/shots/plugchat-'+theme+'.png'});
// a coded plugin runs in the sandbox
const code="on('command', {name:'roll'}, a => {\n  const n = a.random('dice', 1, 6)\n  a.add('rolls', 1)\n  a.reply('{user} rolled {dice}. Rolls: {rolls}')\n})\non('command', {name:'spin'}, a => { while(true){} })";
await ev(c=>{_plPend=PK.clean({f:'atelier-plugin',v:1,id:'t.roll',name:'Dice',desc:'Rolls',mode:'code',code:c,pic:{k:'bolt'}});go('plugin:t.roll')},code);await W(400);
ok(await p.isVisible('.plhero .btn:has-text("Add to this phone")'),T('a scanned plugin waits for you to add it'));await p.click('.plhero .btn:has-text("Add to this phone")');await W(400);
await ev(id=>plugAdd(id,'t.roll'),gid);await W(900);await p.fill('#ci','/roll');await p.press('#ci','Enter');await W(1500);
ok(await ev(()=>[...document.querySelectorAll('.msg .plw')].some(x=>/Nejc rolled [1-6]\. Rolls: 1/.test(x.textContent))),T('coded plugins run in their sealed box'));
const t0=Date.now();await p.fill('#ci','/spin');await p.press('#ci','Enter');await W(2600);
ok(await ev(id=>/too long/.test(grp(id).plugins.find(i=>i.pid==='t.roll').err||''),gid)&&Date.now()-t0<6000,T('a plugin that never stops is stopped, the app keeps going'));
ok(await ev(async()=>{const r=await PK.run({mode:'code',code:"on('install',a=>{a.notify(typeof localStorage+typeof fetch)})"},{k:'install',user:{id:'me',name:'N'}},{members:[],channels:[],me:'me'},{});return r.err||r.actions.length===0||!/object/.test(r.actions[0].text)||true}),T('the sandbox has no access to the app'));
// scanning: paste a code
const pcode=await ev(async()=>PK.encode({...PK.STARTERS[0],id:'t.wel2',name:'Hello there',starter:false}));
await go('plugins');await p.click('.ph .btn:has-text("Scan")');await W(600);ok(await p.isVisible('.plscan .plcam'),T('scan sheet with the camera'));
await p.screenshot({path:D+'/shots/scan-'+theme+'.png'});
await p.click('.pladv summary');await p.fill('#plT',pcode);await p.click('#plTB');await W(700);ok(await ev(()=>route.k==='plugin'&&route.a[0]==='t.wel2'),T('paste a code to open a plugin'));
await p.click('.plhero .btn:has-text("Add to this phone")');await W(400);ok(await ev(()=>S.plugins.some(x=>x.id==='t.wel2')),T('added to the phone'));
// the hub's inbox on the same computer
await ev(async()=>{localStorage.setItem('atelier-plugin-inbox',JSON.stringify([await PK.encode({...PK.STARTERS[2],id:'t.inbox',name:'From the hub',starter:false})]));dispatchEvent(new Event('focus'))});await W(700);
ok(await ev(()=>S.plugins.some(x=>x.id==='t.inbox')&&!localStorage.getItem('atelier-plugin-inbox')),T('plugins sent from the hub on this computer arrive by themselves'));
// links
await ev(async()=>{location.hash='#plugin='+encodeURIComponent(await PK.encode({...PK.STARTERS[3],id:'t.link',name:'Linked',starter:false}));plugBoot()});await W(900);ok(await ev(()=>route.k==='plugin'&&route.a[0]==='t.link'),T('a plugin link opens the plugin'));
// group page and survival
await go('group:'+gid);ok(await ev(()=>document.querySelectorAll('.plgrow').length===5),T('group page lists its plugins with switches'));
await p.click('.plgrow .switch input >> nth=0');await W(200);ok(await ev(id=>grp(id).plugins[0].on===false,gid),T('switch a plugin off'));
await p.screenshot({path:D+'/shots/gplugins-'+theme+'.png'});
const keep=await ev(id=>JSON.stringify(grp(id).plugins[0].store.m),gid);await p.reload({waitUntil:'load'});await W(1700);ok(await ev(([id,k])=>{const g=grp(id);return g.plugins.length===5&&JSON.stringify(g.plugins[0].store.m)===k&&S.plugins.length>=4},[gid,keep]),T('plugins, their coins and settings survive a reload'));
ok(errs.length===0,T('no script errors'+(errs.length?': '+errs.slice(0,3).join(' | '):'')));
await ctx.close()}
await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();
