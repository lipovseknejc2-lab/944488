// Focused test: chat sections, groups as servers (private and official), categories, channels of every type,
// roles, members, verification, the Everything feed, ideas with votes, widgets in channels, migration of old groups.
// iPhone 13 in light and dark, plus a desktop pass for the three-column layout. No script errors allowed.
const {chromium,devices}=require('playwright');const D=__dirname;
const U='http://127.0.0.1:8812/atelier.html';let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await chromium.launch();
for(const theme of ['light','dark']){
const ctx=await b.newContext({...devices['iPhone 13'],colorScheme:theme});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/manifest|icon|404/.test(m.text()))errs.push(m.text())});
const ev=(f,a)=>p.evaluate(f,a),W=t=>p.waitForTimeout(t),go=async h=>{await ev(h=>go(h),h);await W(450)},T=s=>s+' ('+theme+')';
await p.goto(U);await W(1700);
await p.click('#obS');await W(300);await p.fill('#obName','Nejc');await p.fill('#obSur','Lipovšek');await p.fill('#obMail','n@example.com');
await p.click('#obSt label:has-text("Student")');await p.fill('#obRole','Uni');await p.click('#obF button[type=submit]');await W(1300);
await ev(t=>{S.settings.theme=t;applyTheme();save()},theme);
// an old-style group, as saved before this update
await ev(()=>{const g={id:'oldg',name:'Old crew',col:GCOL[2],desc:'From before',members:['me',S.people[0].id],at:Date.now()};S.groups.push(g);S.chats.push({id:'oldc',kind:'group',with:'oldg',msgs:[{id:'m1',from:S.people[0].id,text:'We kept this',at:Date.now()-5000}],read:0,at:Date.now()});save()});
await p.reload({waitUntil:'load'});await W(1700);
ok(await ev(()=>{const g=grp('oldg'),c=S.chats.find(x=>x.id==='oldc');return g._v===2&&g.chs.map(x=>x.id).join()==='general,files'&&c.ch==='general'&&c.msgs[0].text==='We kept this'&&g.mroles.me[0]==='owner'}),T('old groups get roles, Main, #general and #files, and keep their messages'));
// chat sections
await go('chat');ok(await ev(()=>[...document.querySelectorAll('.ctabs .ctab span')].map(s=>s.textContent).join()==='Messages,Groups,People'&&document.querySelector('.ctab.on span').textContent==='Messages'),T('chat sections are rounded tabs'));
ok(await p.isVisible('.gstrip .gsi')&&await ev(()=>!document.querySelector('.card.list .gav')),T('Messages: direct chats, groups as a strip on top'));
ok(await ev(()=>{const i=document.querySelector('.ctab i');return !!i}),T('unread groups show a count on the Groups tab'));
await p.click('.ctab:has-text("Groups")');await W(450);ok(await ev(()=>route.k==='groups'&&document.querySelectorAll('.gtile').length===2),T('Groups tab lists the groups'));
await p.screenshot({path:D+'/shots/groups-'+theme+'.png'});
// community: official and verified, roles limit what I can do
await p.click('.gdisc .btn');await W(700);
ok(await ev(()=>route.k==='g'&&!!document.querySelector('.svtt .gver,.svid .gver')),T('joined Atelier Community, verified'));
ok(await p.isVisible('.svlock'),T('announcements: only the team can post'));
await p.click('.svgb');await W(500);ok(await ev(()=>document.body.classList.contains('svl')&&Math.abs(document.querySelector('.svch').getBoundingClientRect().left)<2),T('channels slide in from the side'));
ok(await ev(()=>!document.querySelector('#svCh .svadd')),T('members cannot make channels in an official group'));
await p.click('#svCh .chp:has-text("ideas")');await W(500);ok(await ev(()=>route.a[1]==='ideas'&&!document.body.classList.contains('svl')),T('tap a channel: it opens and the panel closes'));
ok(await p.isVisible('.vote'),T('ideas show votes'));
await p.click('.msg .vote >> nth=0');await W(200);ok(await ev(()=>S.chats.find(c=>c.ch==='ideas'&&grp(c.with).comm).msgs[0].votes.includes('me')),T('vote on an idea'));
// a new private group
await go('groups');await p.click('.ph .btn:has-text("New")');await W(400);await p.click('.gtype [data-t=private]');await W(500);
await p.fill('#gN','Physics crew');await p.fill('#gD','Labs and exams');await p.click('.banpick input[value=dots] + .bano');await p.click('#gK label:has-text("Study group")');
await p.setInputFiles('#gAvF',D+'/t.gif');await W(200);
await ev(()=>document.querySelectorAll('#sf .picks input[type=checkbox]').forEach((x,i)=>{if(i<3)x.checked=true}));
await p.click('#sf button[type=submit]');await W(1000);
const gid=await ev(()=>route.a[0]);
ok(await ev(id=>{const g=grp(id);return route.k==='g'&&g.type==='private'&&g.members.length===4&&g.ban.k==='dots'&&g.kind==='study'&&g.mroles.me[0]==='owner'},gid),T('private group: name, banner, kind, members, me as owner'));
ok(await ev(id=>!!grp(id).avatar,gid)&&await ev(()=>!!document.querySelector('.svgb img[src]')),T('group picture uploaded'));
ok(await ev(()=>route.a[1]==='general'||document.querySelector('.svtt b').textContent.includes('general')),T('opens straight into #general'));
ok(await p.isVisible('.chwel >> text=Welcome to #general'),T('channel welcome'));
await p.fill('#ci','Hello crew');await p.press('#ci','Enter');await W(400);ok(await p.isVisible('.msg.me >> text=Hello crew'),T('message in a channel'));
await W(3800);ok(await ev(()=>document.querySelectorAll('#msgs .msg:not(.me)').length>=1),T('teammates answer in the channel'));
// widgets inside a channel
await ev(()=>openWidget(window._svc,'focus'));await W(500);await p.click('#wSend');await W(700);ok(await ev(()=>!!document.querySelector('#msgs .wdg.w-focus')&&route.k==='g'),T('widgets work in channels'));
// files channel
await go('g:'+gid+':files');ok(await p.isVisible('.svshelf >> text=Files here'),T('files channel has its shelf'));
await p.setInputFiles('.svshelf input[type=file]',D+'/t.pdf');await W(900);ok(await ev(()=>document.querySelectorAll('.fgrid .ftile').length===1&&!!document.querySelector('#msgs .msg.me')),T('upload in #files: a tile and a message'));
ok(await ev(()=>document.querySelector('.svh [aria-label="Attached in this channel"] .ibn')?.textContent==='1'),T('each channel shows what is attached'));await p.screenshot({path:D+'/shots/files-'+theme+'.png'});
await p.click('[aria-label="Attached in this channel"]');await W(450);ok(await p.isVisible('.sheet h2:has-text("Attached in #files")'),T('attached sheet'));await ev(()=>closeSheet());await W(250);
// channels and categories
await p.click('.svgb');await W(400);await p.click('#svCh .svnew .btn:has-text("Category")');await W(400);await p.fill('#ctN','Homework');await p.click('#sf button[type=submit]');await W(500);
ok(await ev(id=>grp(id).cats.length===2,gid),T('new category'));
const mk=async(name,type,cat)=>{await ev(([id,c])=>channelForm(id,null,c),[gid,cat]);await W(400);await p.fill('#chN',name);await p.click(`.chtypes input[value=${type}]`,{force:true});await p.click('#sf button[type=submit]');await W(700)};
const cat2=await ev(id=>grp(id).cats[1].id,gid);
await mk('Big Ideas','ideas',cat2);ok(await ev(id=>{const g=grp(id),c=g.chs.find(x=>x.name==='big-ideas');return c&&c.type==='ideas'&&route.a[1]===c.id},gid),T('ideas channel, the name becomes big-ideas'));
await p.fill('#ci','Shared formula sheet');await p.press('#ci','Enter');await W(300);ok(await p.isVisible('.msg.me .vote'),T('ideas: every idea gets a vote'));
await W(3200);ok(await ev(id=>{const g=grp(id),ch=g.chs.find(x=>x.name==='big-ideas'),c=S.chats.find(x=>x.ch===ch.id);return(c.msgs.find(m=>m.from==='me').votes||[]).length>=1},gid),T('teammates vote on ideas'));
for(const [n,t] of [['news','announce'],['all-stuff','all'],['lab-photos','gallery'],['labs','projects'],['shared','notes'],['dates','events']])await mk(n,t,cat2);
ok(await ev(id=>grp(id).chs.length===9,gid),T('every channel type can be made'));
await go('g:'+gid+':'+await ev(id=>grp(id).chs.find(x=>x.name==='news').id,gid));ok(await p.isVisible('#ci'),T('the owner can post announcements'));
await go('g:'+gid+':'+await ev(id=>grp(id).chs.find(x=>x.name==='labs').id,gid));ok(await p.isVisible('.svact >> text=Share a project')&&!(await p.isVisible('#ci')),T('projects channel: only projects'));
await go('g:'+gid+':'+await ev(id=>grp(id).chs.find(x=>x.name==='shared').id,gid));await p.click('.composer [aria-label="Share a note"]');await W(400);await p.click('.sheet [data-pk] >> nth=0');await W(700);
ok(await ev(id=>S.notes.some(n=>n.share.groups.includes(id)),gid)&&await p.isVisible('.svshelf .ncard'),T('notes channel: share a note, it shows with its page'));
await go('g:'+gid+':'+await ev(id=>grp(id).chs.find(x=>x.name==='dates').id,gid));ok(await p.isVisible('.svquick'),T('plans channel: share agenda and day'));
await go('g:'+gid+':'+await ev(id=>grp(id).chs.find(x=>x.name==='all-stuff').id,gid));
ok(await ev(()=>document.querySelectorAll('.svfeed .svfr').length>=3),T('Everything collects all that was attached'));
await p.click('.svff .chip:has-text("Files")');await W(300);ok(await ev(()=>document.querySelectorAll('.svfeed .svfr').length===1),T('Everything filters by kind'));
// roles
await ev(id=>roleForm(id),gid);await W(400);await p.fill('#rN','Lab lead');await p.check('[name=p_announce]');await ev(()=>{const x=document.querySelector('#sf .picks input[name^=m_]:not([name=m_me])');x.checked=true});await p.click('#sf button[type=submit]');await W(500);
ok(await ev(id=>{const g=grp(id),r=g.roles.find(x=>x.name==='Lab lead');return r&&r.perms.announce&&Object.values(g.mroles).some(L=>L.includes(r.id))},gid),T('new role with what it can do, given to a member'));
await go('g:'+gid);await p.click('.svmb');await W(450);ok(await ev(()=>document.body.classList.contains('svr')&&[...document.querySelectorAll('.svrh')].some(x=>/Lab lead/.test(x.textContent))),T('members sorted under their roles'));
await p.click('.rfil .chip:has-text("Lab lead")');await W(200);ok(await ev(()=>document.querySelectorAll('#svMem .svm').length===1),T('filter members by role'));
await p.screenshot({path:D+'/shots/members-'+theme+'.png'});await p.click('#svMem .svm');await W(400);ok(await p.isVisible('.sheet [data-r]'),T('member sheet: give roles'));await ev(()=>{closeSheet();svClose()});await W(250);
// group page and verification
await go('group:'+gid);ok(await p.isVisible('.ghero2')&&await p.isVisible('h2:has-text("Roles")')&&await p.isVisible('h2:has-text("Channels")')&&await p.isVisible('h2:has-text("Plugins")'),T('group page: roles, channels, plugins'));
await p.click('.gvcard .btn');await W(400);await p.fill('#vN','Gimnazija Bežigrad');await p.fill('#vS','gimb.org');await p.fill('#vM','info@gimb.org');await p.click('#sf .seg label:has-text("School")');await p.click('#sf button[type=submit]');await W(500);
ok(await ev(id=>{const g=grp(id);return g.type==='official'&&g.verify==='pending'&&g.org.kind==='school'},gid)&&await p.isVisible('.gvsteps .ok >> nth=2'),T('make it official: verification request with its checks'));
await p.screenshot({path:D+'/shots/ginfo-'+theme+'.png'});
// official group from the start
await go('groups');ok(await ev(()=>[...document.querySelectorAll('section .sh h2')].map(x=>x.textContent).includes('Official')),T('official groups have their own section'));
await p.click('.ph .btn:has-text("New")');await W(400);await p.click('.gtype [data-t=official]');await W(500);await p.fill('#gN','Acme design');await p.click('#sf button[type=submit]');await W(300);
ok(await p.isVisible('#sf'),T('official groups need the organisation name'));await p.fill('#gON','Acme d.o.o.');await p.click('#sf button[type=submit]');await W(900);
ok(await ev(()=>{const g=grp(route.a[0]);return g.type==='official'&&g.org.name==='Acme d.o.o.'&&g.verify==='pending'}),T('official group created, waiting for verification'));
// sharing from anywhere reaches channels
await ev(()=>pickConvo(()=>{}));await W(400);ok(await ev(()=>[...document.querySelectorAll('.sheet .li .t')].some(x=>/· #general/.test(x.textContent))),T('share sheet lists group channels'));await ev(()=>closeSheet());await W(250);
// a link to an old chat goes to its channel
await go('c:oldc');await W(300);ok(await ev(()=>route.k==='g'&&route.a[0]==='oldg'),T('old chat links open the channel'));
await p.screenshot({path:D+'/shots/server-'+theme+'.png'});
await p.click('.svgb');await W(500);await p.screenshot({path:D+'/shots/channels-'+theme+'.png'});await ev(()=>svClose());
// speed
const ms=await ev(()=>{const t=performance.now();for(let i=0;i<5;i++){go('g:'+S.groups[2].id);go('groups')}return(performance.now()-t)/10});ok(ms<60,T(`group screens render in ${ms.toFixed(1)} ms`));
ok(errs.length===0,T('no script errors'+(errs.length?': '+errs.slice(0,3).join(' | '):'')));
await ctx.close()}
// desktop: channels, chat and members side by side
{const ctx=await b.newContext({viewport:{width:1366,height:860}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(U);await p.waitForTimeout(1600);await p.click('#obS');await p.fill('#obName','Nejc');await p.fill('#obSur','L');await p.fill('#obMail','n@example.com');await p.click('#obSt label:has-text("Working")');await p.fill('#obRole','Studio');await p.click('#obF button[type=submit]');await p.waitForTimeout(1200);
await p.evaluate(()=>go('g:'+S.groups[0].id));await p.waitForTimeout(600);
const r=await p.evaluate(()=>{const a=document.querySelector('.svch').getBoundingClientRect(),m=document.querySelector('.svmain').getBoundingClientRect(),z=document.querySelector('.svmem').getBoundingClientRect();return a.width>200&&z.width>200&&a.right<=m.left&&m.right<=z.left&&a.left>=0&&z.right<=innerWidth});
ok(r,'desktop: channels, chat and members side by side');await p.screenshot({path:D+'/shots/server-desktop.png'});ok(errs.length===0,'desktop: no script errors');await ctx.close()}
await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();
