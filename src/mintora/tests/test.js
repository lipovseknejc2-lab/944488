/* Mintora end-to-end tests. Run with: bash src/mintora/tests/run.sh  (needs node with playwright, and python3) */
const {chromium}=require('playwright');
const URL=process.env.MURL||'http://127.0.0.1:8897/';
let pass=0,fail=0;const fails=[];
const ok=(c,m)=>{if(c)pass++;else{fail++;fails.push(m)}console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
const W=t=>p.waitForTimeout(t),E=(f,a)=>p.evaluate(f,a),G=async r=>{await E(r=>go(r),r);await W(250)};
await p.goto(URL);await W(1700);await E(()=>{window._noSim=true});
// ---------- first run ----------
ok(await p.isVisible('#welcome'),'first run shows the welcome screen');
await p.fill('#wN','Nejc Test');await p.fill('#wW','Kiln Studio');await p.click('#wGo');await W(600);
ok(await E(()=>S.me.name==='Nejc Test'&&S.workspace.name==='Kiln Studio'&&S.workspace.initials==='KS'&&S.settings.onboarded),'welcome saves the name and the studio');
ok(await E(()=>!document.querySelector('#welcome')&&/Kiln Studio/.test(document.querySelector('#side').textContent)),'the sidebar shows the studio');
// ---------- dashboard ----------
await G('dash');await W(1200);
ok(await E(()=>{const P=perfScore();return P.score>=0&&P.score<=100&&+document.querySelector('.gauge b').textContent===P.score}),'performance score counts up to the computed value');
ok(await E(()=>document.querySelectorAll('#perf .factor').length===6),'six score factors are shown');
ok(await E(()=>document.querySelectorAll('.kpi').length>=4&&document.querySelectorAll('.kpi .spark').length>=4),'KPIs with sparklines');
ok(await E(()=>document.querySelector('#dRev path.ln')&&document.querySelector('#dRev path.ln2')),'revenue chart with the previous period');
const r30=await E(()=>document.querySelector('.ph p').textContent);await p.click('#dsP button[data-v="7"]');await W(400);
ok(await E(()=>DASH.days===7)&&r30!==await E(()=>document.querySelector('.ph p').textContent),'period switch to 7 days changes the numbers');
await p.hover('#dRev .hit',{position:{x:300,y:80}});await W(150);ok(await E(()=>document.querySelector('#dRev').classList.contains('hov')&&!!document.querySelector('#tip')),'chart hover shows a readout');
await p.mouse.move(5,5);await p.click('#dsP button[data-v="30"]');await W(300);
await E(()=>{S.settings.lastDaily=0;rerender()});const c0=await E(()=>S.credits.balance);await p.click('#dClaim');await W(300);
ok(await E(c=>S.credits.balance===c+50,c0),'claim the daily 50 credits');
ok(await E(()=>document.querySelector('#dClaim').disabled),'the daily claim locks until tomorrow');
await p.click('button:has-text("How it works")');await W(300);ok(await p.isVisible('.modal table'),'score explainer opens');await p.keyboard.press('Escape');await W(200);
// ---------- command palette and keyboard ----------
await p.keyboard.press('Control+k');await W(300);ok(await p.isVisible('#palI'),'⌘K opens the command palette');
await p.fill('#palI','analyt');await W(150);await p.keyboard.press('Enter');await W(400);ok(await E(()=>route.k==='analytics'),'palette fuzzy search and Enter navigate');
await p.keyboard.press('Control+k');await W(200);await p.fill('#palI','founder');await W(150);ok(await E(()=>[...document.querySelectorAll('.po')].some(o=>/Founder OS/.test(o.textContent))),'palette finds products');await p.keyboard.press('Escape');
await p.keyboard.press('g');await p.keyboard.press('p');await W(400);ok(await E(()=>route.k==='products'),'g then p goes to Products');
await p.keyboard.press('?');await W(250);ok(await p.isVisible('.shortcut-list'),'? shows the shortcuts');await p.keyboard.press('Escape');
// ---------- products ----------
const n0=await E(()=>S.products.length);await p.keyboard.press('n');await W(400);ok(await p.isVisible('#pfN'),'N opens the new product sheet');
await p.click('#pfGo');await W(200);ok(await E(()=>document.querySelector('#pfN').classList.contains('err')),'a product needs a name');
await p.fill('#pfN','Night Presets');await p.click('#pfT .chip[data-v=preset]');await p.fill('#pfP','29');await W(100);
ok(await E(()=>/You keep/.test(document.querySelector('#pfPh').textContent)),'price shows what you keep after fees');
ok(await E(()=>document.querySelector('#pfC svg')&&/PRESET/.test(document.querySelector('#pfC').innerHTML)),'cover preview follows the type');
const cb=await E(()=>S.credits.balance);await p.click('button:has-text("Suggest")');await W(250);ok(await E(c=>S.credits.balance===c-50&&document.querySelectorAll('#aiOut .chip').length===3,cb),'copy suggestions cost 50 credits and give three taglines');
await p.click('#aiOut .chip >> nth=0');ok(await E(()=>document.querySelector('#pfG').value.length>5),'a suggestion fills the tagline');
await p.click('#pfS button[data-v=live]');const cb2=await E(()=>S.credits.balance);await p.click('#pfGo');await W(600);
ok(await E(n=>S.products.length===n+1,n0),'product created');
ok(await E(c=>{const x=S.products.at(-1);return x.name==='Night Presets'&&x.type==='preset'&&x.price===29&&x.status==='live'&&x.page.published&&S.credits.balance===c+100},cb2),'published right away and earned 100 credits');
ok(await E(()=>route.k==='product'),'opens the new product');
await G('products');await p.click('#prV button[data-v=table]');await W(300);ok(await E(()=>document.querySelectorAll('.tbl tbody tr').length===S.products.length),'table view lists every product');
await p.fill('#prQ','iconic');await W(500);ok(await E(()=>document.querySelectorAll('.tbl tbody tr').length===1),'filter narrows the list');await p.fill('#prQ','');await W(400);
await p.click('.tabs button:has-text("Drafts")');await W(250);ok(await E(()=>[...document.querySelectorAll('.tbl tbody tr')].every(r=>/draft/.test(r.textContent))),'drafts tab');
await p.click('.tabs button:has-text("All")');await p.click('#prV button[data-v=grid]');await W(300);
await E(()=>dupProduct('p5'));await W(300);ok(await E(()=>S.products.some(x=>x.name==='Cold Email Playbook copy'&&x.status==='draft')),'duplicate a product');
// product page
await G('product/p1');ok(await E(()=>/Founder OS/.test(document.querySelector('h1').textContent)&&document.querySelectorAll('.kpi').length===4),'product page with its numbers');
ok(await E(()=>document.querySelectorAll('.funnel .fstep').length===4),'product checkout funnel');
await p.click('.tabs button:has-text("Orders")');await W(300);ok(await E(()=>document.querySelectorAll('.tbl tbody tr').length>0),'product orders tab');
await p.click('.tbl tbody tr >> nth=0');await W(400);ok(await p.isVisible('.drawer')&&await E(()=>/MNT-/.test(document.querySelector('.drawer').textContent)),'order drawer with a license key');
const oid=await E(()=>document.querySelector('.drawer h2').textContent.replace('Order #','').toLowerCase());await p.click('.drawer button:has-text("Refund")');await W(300);await p.click('#cfOk');await W(400);
ok(await E(o=>S.orders.find(x=>x.id===o)?.r===1,oid),'refund an order');
await p.click('.tabs button:has-text("Reviews")');await W(250);ok(await E(()=>document.querySelectorAll('.page .card.pad').length>0),'reviews tab');
await p.click('.tabs button:has-text("Delivery")');await W(250);ok(await E(()=>/License keys|license key/i.test(document.querySelector('.page').textContent)),'delivery and license keys tab');
// ---------- storefront editor ----------
await G('store');ok(await E(()=>document.querySelectorAll('.pgrid .card').length===S.products.filter(p=>p.status!=='archived').length),'storefronts list');
await G('store/p3');await W(300);const bl0=await E(()=>prod('p3').page.blocks.length);
await p.click('#blkL .blk >> nth=0');await W(200);ok(await p.isVisible('#insF input[data-k=title]'),'select a section to edit it');
await p.fill('#insF input[data-k=title]','Film that feels like film');await W(200);ok(await E(()=>/Film that feels like film/.test(document.querySelector('#sfE h1').textContent)),'typing updates the canvas live');
await p.click('.addblk button:has-text("Testimonials")');await W(300);ok(await E(b=>prod('p3').page.blocks.length===b+1&&prod('p3').page.blocks.some(x=>x.t==='testimonials'),bl0),'add a section');
await p.click('#insAdd');await W(250);ok(await E(()=>{const b=prod('p3').page.blocks.find(x=>x.t==='testimonials');return b.d.items.length===2}),'add an item to a list');
const order0=await E(()=>prod('p3').page.blocks.map(b=>b.t).join());const sel=await E(()=>SE.sel);await p.hover(`#blkL .blk[data-b="${sel}"]`);await p.click(`#blkL .blk[data-b="${sel}"] [data-act=up]`);await W(250);
ok(await E(o=>prod('p3').page.blocks.map(b=>b.t).join()!==o,order0),'move a section up');
await p.dragAndDrop('#blkL .blk >> nth=3','#blkL .blk >> nth=1');await W(300);ok(await E(o=>prod('p3').page.blocks.map(b=>b.t).join()!==o,order0),'drag sections to reorder');
await p.click('#seD button[data-v=mob]');await W(300);ok(await E(()=>document.querySelector('#frame').classList.contains('mob')),'phone preview');await p.click('#seD button[data-v=desk]');
await p.click('button:has-text("Page settings")');await W(250);await p.click('[data-design=d-ink]');await W(300);ok(await E(()=>prod('p3').page.design==='d-ink'&&/#8F82FF/i.test(document.querySelector('#sfE .sf').getAttribute('style'))),'switch the page design');
const cb3=await E(()=>S.credits.balance),wasPub=await E(()=>prod('p3').page.published);await p.click('.canvas button:has-text("Update"), .canvas button:has-text("Publish")');await W(300);ok(await E(([c,w])=>prod('p3').page.published&&S.credits.balance===c+(w?0:40),[cb3,wasPub]),'publish the storefront');
// public page and checkout
await G('p/p3');ok(await E(()=>!!document.querySelector('.frame .sf h1')),'the live page renders');const ord0=await E(()=>S.orders.length);
await p.click('.frame .sbtn >> nth=0');await W(300);await p.click('#coGo');await W(200);ok(await E(n=>S.orders.length===n,ord0),'checkout needs a name and email');
await p.fill('#coN','Test Buyer');await p.fill('#coE','buyer@example.com');await p.click('#coGo');await W(400);
ok(await E(n=>S.orders.length===n+1&&S.orders.at(-1).test&&cust(S.orders.at(-1).c).email==='buyer@example.com',ord0),'a test checkout creates an order');
ok(await E(()=>/MNT-/.test(document.querySelector('.modal').textContent)),'thank-you screen with the license key');await p.click('.modal .btn.pri');
// ---------- analytics ----------
await G('analytics');ok(await E(()=>document.querySelectorAll('.kpi').length===6&&!!document.querySelector('#aRev')),'analytics KPIs and chart');
await p.click('#anP button[data-v="365"]');await W(400);ok(await E(()=>AN.days===365&&/Week/.test(document.querySelector('#aRev').textContent)),'12 months groups by week');
await E(()=>{AN.pid='p1';rerender()});await W(200);ok(await E(()=>/Founder OS/.test(document.querySelector('select.inp').selectedOptions[0].textContent)),'filter analytics by product');await E(()=>{AN.pid='';AN.days=30;rerender()});
ok(await E(()=>document.querySelector('.locked .lockov')!==null),'deep insights start locked');const cb4=await E(()=>S.credits.balance);
await p.click('button:has-text("Unlock for 300 credits")');await W(400);ok(await E(c=>insightsOn()&&S.credits.balance===c-300&&!document.querySelector('.locked'),cb4),'unlock deep insights with 300 credits');
ok(await E(()=>document.querySelectorAll('.heat i').length===168&&/busiest hour/.test(document.body.textContent)),'best-hours heatmap');
ok(await E(()=>document.querySelectorAll('.page .tbl tbody tr').length>0),'monthly cohorts');
// ---------- sales ----------
await G('sales');ok(await E(()=>document.querySelectorAll('.tbl tbody tr').length===50),'orders page shows 50 per page');
await p.fill('#saQ','buyer@example.com');await W(500);ok(await E(()=>document.querySelectorAll('.tbl tbody tr').length===1),'search orders by email');
await p.fill('#saQ','');await W(400);await p.selectOption('.tabs select','refunded');await W(300);ok(await E(()=>[...document.querySelectorAll('.tbl tbody tr')].every(r=>/Refunded/.test(r.textContent))),'filter refunded orders');
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:4000}).catch(()=>null),p.click('.ph button:has-text("Export CSV")')]);ok(!!dl&&/mintora-orders\.csv/.test(dl.suggestedFilename()),'export orders as CSV');
await p.click('.tabs button:has-text("Customers")');await W(300);ok(await E(()=>document.querySelectorAll('.tbl tbody tr').length>10),'customers with lifetime value');
await p.click('.tbl tbody tr >> nth=0');await W(300);ok(await p.isVisible('.drawer')&&await E(()=>/Lifetime value/.test(document.querySelector('.drawer').textContent)),'customer drawer');await p.keyboard.press('Escape');
await p.click('.tabs button:has-text("Payouts")');await W(300);ok(await E(()=>/Upcoming/.test(document.querySelector('.tbl').textContent)),'payout schedule');
// ---------- roadmap ----------
await G('roadmap');ok(await E(()=>document.querySelectorAll('.kcol').length===4),'four roadmap columns');
await p.click('.ph button:has-text("New project")');await W(300);await p.fill('#rmT','Audio course');await p.fill('#rmE','1200');await p.click('#rmGo');await W(400);
ok(await E(()=>S.roadmap.some(r=>r.title==='Audio course'&&r.stage==='idea')),'add a roadmap project');
await p.dragAndDrop('.kcard[data-id=r4]','.kcol[data-st=planned]');await W(400);ok(await E(()=>S.roadmap.find(r=>r.id==='r4').stage==='planned'),'drag a project to Planned');
const v0=await E(()=>S.roadmap.find(r=>r.id==='r2').votes);await p.click('.kcard[data-id=r2] .vote');await W(200);ok(await E(v=>S.roadmap.find(r=>r.id==='r2').votes===v+1,v0),'vote on a project');
await p.click('.kcard[data-id=r1]');await W(300);await p.fill('#rmNt','Record the launch video');await p.press('#rmNt','Enter');await W(300);ok(await E(()=>S.roadmap.find(r=>r.id==='r1').tasks.some(t=>t[0]==='Record the launch video')),'add a checklist step');
const pc=await E(()=>S.products.length);await p.click('.drawer .btn.mint');await W(500);ok(await E(()=>S.roadmap.find(r=>r.id==='r1').stage==='launched'&&prod('p7').status==='live'),'launch publishes the linked product');
await p.keyboard.press('Escape');await p.click('#rmV button[data-v=time]');await W(300);ok(await E(()=>document.querySelectorAll('.page .card > div[style*="grid-template-columns:260px"]').length>3),'timeline view');
// ---------- people ----------
await G('team');await p.click('.ph button:has-text("Invite")');await W(300);await p.fill('#ivE','not-an-email');await p.click('#ivGo');await W(200);ok(await E(()=>document.querySelector('#ivE').classList.contains('err')),'invite checks the email');
await p.fill('#ivE','sam@studio.dev, jo@agency.co');await p.click('#ivGo');await W(400);ok(await E(()=>S.invites.filter(i=>/sam@studio|jo@agency/.test(i.email)).length===2),'invite two people at once');
await E(()=>acceptInvite('jo@agency.co'));await W(300);ok(await E(()=>S.team.some(m=>m.email==='jo@agency.co')&&!S.invites.some(i=>i.email==='jo@agency.co')),'an accepted invite becomes a member');
await E(()=>{PE.tab='members';rerender()});await W(200);await p.selectOption('.tbl tbody tr >> nth=2 >> select','Viewer');await W(200);ok(await E(()=>S.team[1].role==='Viewer'),'change a role');
await E(()=>{PE.tab='roles';rerender()});await W(200);ok(await E(()=>document.querySelectorAll('.perm .ck').length===42),'permissions matrix');
// ---------- messages ----------
await G('messages/ch-gen');await p.fill('#ci','Shall we ship Orbit on Friday?');await p.press('#ci','Enter');await W(300);ok(await E(()=>S.channels[0].msgs.at(-1).text==='Shall we ship Orbit on Friday?'),'send a message with Enter');
await W(4200);ok(await E(()=>S.channels[0].msgs.at(-1).who!=='me'),'a teammate replies');
await p.click('.compose [aria-label="Share a product"]');await W(200);await p.click('#menu button >> nth=0');await W(300);ok(await E(()=>!!document.querySelector('.mcard')),'share a product card');
await p.click('[aria-label="New channel"]');await W(250);await p.fill('#ncN','Launch Night');await p.click('#ncGo');await W(400);ok(await E(()=>S.channels.some(c=>c.name==='launch-night')&&route.a[0]?.startsWith('ch')),'create a channel');
await E(()=>dmWith('u3'));await W(300);ok(await E(()=>S.channels.some(c=>c.kind==='dm'&&c.with==='u3')),'start a direct message');
// ---------- hubs ----------
await G('hubs');await p.click('.card:has-text("Pixel Guild") button:has-text("Join")');await W(400);ok(await E(()=>hub('h4').joined&&route.k==='hub'),'join a hub from Discover');
await G('hubs');await p.click('.ph button:has-text("New hub")');await W(300);await p.fill('#hfN','Grain Club');await p.click('#hfGo');await W(400);ok(await E(()=>S.hubs.some(h=>h.name==='Grain Club'&&h.owner==='me'&&myRole(h).id==='admin')),'create a hub as its admin');
await G('hub/h1');await p.fill('#ci','/help');await p.press('#ci','Enter');await W(300);ok(await E(()=>/\/project/.test(hub('h1').channels.find(c=>c.id==='hc2').msgs.at(-1).text)),'/help lists the commands');
await p.fill('#ci','/project Spanish translation');await p.press('#ci','Enter');await W(300);ok(await E(()=>hub('h1').projects.some(x=>x.name==='Spanish translation')),'/project starts a project');
await p.click('.chl:has-text("Spanish translation")');await W(300);ok(await E(()=>/Members/.test(document.querySelector('.msgs').textContent)),'open a hub project');
await p.click('.chl:has-text("general")');await W(300);await p.click('button:has-text("Add people")');await W(300);await p.fill('#amQ','Marco');await W(200);await p.click('#amL .li >> nth=0');await W(300);
ok(await E(()=>hub('h1').members.some(m=>m.id==='u2')),'add a teammate to the hub');await p.keyboard.press('Escape');
await G('hub/h1/settings');await p.click('[data-radd]');await W(300);ok(await E(()=>hub('h1').roles.some(r=>r.name==='New role')),'add a role');
await p.click('[data-rp]:not([disabled]) >> nth=0');await W(150);ok(await E(()=>hub('h1').roles.some(r=>r.id!=='admin'&&r.perms.length>0)),'toggle a role permission');
await p.click('[data-hs=members]');await W(250);ok(await E(()=>document.querySelectorAll('select[data-mr]').length>5),'members with roles');
await G('hub/h2/hm1');ok(await E(()=>/can post here/.test(document.querySelector('.compose').textContent)),'announcements are locked for members');
// ---------- credits ----------
await G('credits');ok(await E(()=>document.querySelectorAll('.shopi').length===6&&!!document.querySelector('#crC')),'credits wallet and shop');
const cb5=await E(()=>S.credits.balance);await p.click('.shopi:has-text("Boost") button');await W(300);await p.click('input[name=bst] >> nth=0');await p.click('#bsGo');await W(300);
ok(await E(c=>S.credits.balance===c-200&&S.products.some(x=>x.boost>Date.now()),cb5),'boost a product with 200 credits');
await p.click('#crF button[data-v=out]');await W(250);ok(await E(()=>[...document.querySelectorAll('.page .tbl tbody tr')].every(r=>!/\+/.test(r.querySelector('td:last-child').textContent))),'history filter: spent');
// ---------- Blueprint ----------
await E(()=>{S.credits.balance=Math.max(S.credits.balance,2600);save()});
await G('bp');ok(await E(()=>document.body.classList.contains('bp')&&/Blueprint/.test(document.querySelector('#side').textContent)),'Blueprint switches to the drawing look');
await G('bp/plugins');ok(await E(()=>/needs a license/.test(document.querySelector('#view').textContent)),'plugins need a license');
await G('bp/license');await p.fill('#bpKey','MNT-BP-AAAA-BBBB-000');await p.click('button:has-text("Activate key")');await W(200);ok(await E(()=>!licensed()&&/not valid/.test(document.querySelector('#bpKeyE').textContent)),'a wrong key is refused');
ok(await E(()=>keyOK(makeKey())&&!keyOK('MNT-BP-1234-5678-ABC')),'license keys carry a checksum');
const cb6=await E(()=>S.credits.balance);await p.click('button:has-text("Unlock with")');await W(500);ok(await E(c=>licensed()&&S.bp.license.tier==='solo'&&S.credits.balance===c-2000&&route.k==='bp',cb6),'unlock Blueprint with 2,000 credits');
await G('bp/plugins');await p.click('.grid.g3 button:has-text("Launch countdown")');await W(500);ok(await E(()=>route.a[0]==='plugin'&&document.querySelectorAll('#psN .node').length===4),'a plugin from a template, drawn as a schematic');
await p.fill('[data-pf=name]','Launch week');await W(200);ok(await E(()=>/Launch week/.test(document.querySelector('#psJ').value)),'form edits update the manifest');
await p.selectOption('#psAdd','discount');await W(300);ok(await E(()=>{const x=S.bp.plugins[0];return x.actions.some(a=>a.type==='discount')&&/discount/.test(document.querySelector('#psJ').value)}),'add an action');
await p.fill('#psJ','{ "name": broken');await W(200);ok(await E(()=>/✕/.test(document.querySelector('#psErr').textContent)),'broken JSON shows an error');
await p.fill('#psJ',JSON.stringify({name:'Launch week',version:'0.1.0',target:'page',trigger:'load',actions:[{type:'banner',text:'Launch week',tone:'accent'},{type:'countdown',label:'Ends in',hours:24},{type:'discount',code:'NIGHT20',pct:20},{type:'proof',text:'{n} people bought this week'}]},null,2));await W(300);
ok(await E(()=>/✓/.test(document.querySelector('#psErr').textContent)&&S.bp.plugins[0].actions.length===4&&document.querySelectorAll('#psN .node.act').length===4),'valid JSON updates the plugin and the schematic');
await p.fill('#psJ','{"name":"x","target":"page","trigger":"join","actions":[]}');await W(200);ok(await E(()=>/trigger/.test(document.querySelector('#psErr').textContent)),'the validator checks triggers per target');
await p.fill('#psJ',await E(()=>manifest(S.bp.plugins[0])));await W(200);
await p.click('button:has-text("Test run")');await W(400);ok(await E(()=>S.bp.logs.some(l=>/Test: trigger/.test(l.msg))&&!!document.querySelector('#psC')),'test run logs to the console');
const cb7=await E(()=>S.credits.balance);await p.click('button:has-text("Publish")');await W(400);ok(await E(c=>S.bp.plugins[0].status==='published'&&S.bp.plugins[0].version==='1.0.0'&&S.credits.balance===c+80,cb7),'publish the plugin as 1.0.0');
await p.click('#psI input[data-inst=p3]');await W(300);ok(await E(()=>prod('p3').page.plugins.includes(S.bp.plugins[0].id)),'install it on a storefront');
await G('p/p3');await W(1300);ok(await E(()=>/\d\d:\d\d:\d\d/.test(document.querySelector('.pl-banner .cd').textContent)&&/NIGHT20/.test(document.querySelector('.pl-code').textContent)&&!!document.querySelector('.pl-proof')),'the live page shows the banner, a ticking countdown, the code and social proof');
await p.click('.frame .sbtn >> nth=0');await W(300);ok(await E(()=>/NIGHT20/.test(document.querySelector('.modal').textContent)&&/20% off/.test(document.querySelector('.modal').textContent)),'the discount applies at checkout');await p.keyboard.press('Escape');
// a hub plugin: welcome bot plus auto role
await E(()=>newPlugin(4));await W(400);await p.selectOption('#psAdd','autorole');await W(200);await p.fill('[data-ak=role] >> nth=0','Customer').catch(()=>{});await W(200);
await p.click('button:has-text("Publish")');await W(400);await p.click('#psI input[data-inst=h1]');await W(300);ok(await E(()=>hub('h1').plugins.length===1),'install a welcome bot in a hub');
await E(()=>{const h=hub('h1');h.members.push({id:'c900',role:'member'});hubJoined(h,'c900')});await W(200);
ok(await E(()=>{const h=hub('h1'),m=h.channels.find(c=>c.type==='text').msgs.slice(-2);return m.some(x=>x.bot&&/Welcome,/.test(x.text))&&h.members.find(x=>x.id==='c900').role==='customer'}),'a new member is welcomed and given a role');
await E(()=>newPlugin(6));await W(400);await p.click('button:has-text("Publish")');await W(300);await p.click('#psI input[data-inst=h1]');await W(200);
await G('hub/h1/hc2');await p.fill('#ci','/links');await p.press('#ci','Enter');await W(300);ok(await E(()=>{const m=hub('h1').channels.find(c=>c.id==='hc2').msgs.at(-1);return m.bot&&/mintora\.shop/.test(m.text)}),'a plugin slash command answers');
await E(()=>newPlugin(7));await W(400);await p.click('button:has-text("Publish")');await W(300);await p.click('#psI input[data-inst=h1]');await W(200);
await E(()=>setStatus('p8','live'));await W(200);ok(await E(()=>{const ch=hub('h1').channels.find(c=>c.type==='announce');return/Focus Sounds/.test(ch.msgs.at(-1).text)}),'the launch announcer posts when a product goes live');
await E(()=>newPlugin(8));await W(400);await p.click('button:has-text("Publish")');await W(300);await G('dash');ok(await E(()=>/Monthly goal/.test(document.querySelector('#view').textContent)),'a dashboard widget plugin shows on the dashboard');
// designs
await G('bp/designs');await p.click('.ph button:has-text("From scratch")');await W(400);ok(await E(()=>route.a[0]==='design'&&!!document.querySelector('#dsC .sf')),'design studio with a measured canvas');
await p.fill('[data-dk=name]','Night Market');await p.fill('[data-th=accent]','#E5484D');await W(300);ok(await E(()=>/#E5484D/i.test(document.querySelector('#dsC .sf').getAttribute('style'))&&/E5484D/i.test(document.querySelector('#dsJ').textContent)),'colour tokens update the canvas');
await p.click('[data-tf=mono]');await W(200);ok(await E(()=>/JetBrains/.test(document.querySelector('#dsC .sf').getAttribute('style'))),'typeface token');
ok(await E(()=>document.querySelectorAll('#dsK .badge').length===4),'contrast checks');
const cb8=await E(()=>S.credits.balance);await p.click('button:has-text("Save design")');await W(300);ok(await E(c=>S.credits.balance===c+40,cb8),'save the design for 40 credits');
await p.click('#dsA input[data-ap=p2]');await W(300);ok(await E(()=>design(prod('p2').page.design).name==='Night Market'),'apply the design to a storefront');
await G('bp/docs');ok(await E(()=>/REST API/.test(document.querySelector('#view').textContent)&&document.querySelectorAll('.code').length>=2),'the reference');
await G('bp');ok(await E(()=>/LICENSE|SOLO/.test(document.querySelector('#view').textContent)&&document.querySelectorAll('.console div').length>0),'Blueprint overview with status and console');
// ---------- settings ----------
await G('settings');await p.click('#stCur button[data-v=EUR]');await W(300);ok(await E(()=>S.settings.currency==='EUR'&&/€/.test(money(10))),'switch the currency');await p.click('#stCur button[data-v=USD]');await W(200);
await E(()=>{ST.tab='developers';rerender()});await W(200);await p.click('button:has-text("New key")');await W(200);await p.fill('#nkN','CLI');await p.click('#nkGo');await W(300);
ok(await E(()=>/mk_live_[a-z0-9]{28}/.test(document.querySelector('.modal input').value)&&S.api.keys.some(k=>k.name==='CLI')),'create an API key, shown once');await p.keyboard.press('Escape');await W(200);
await p.click('button:has-text("Endpoint")');await W(200);await p.fill('#nhU','http://insecure');await p.click('#nhGo');await W(200);ok(await E(()=>document.querySelector('#nhU').classList.contains('err')),'webhooks need https');
await p.fill('#nhU','https://hooks.example.com/m');await p.click('#nhGo');await W(300);await p.click('button:has-text("Send test") >> nth=1');await W(300);ok(await E(()=>S.api.deliveries[0]?.code===200),'send a test delivery');
await E(()=>{ST.tab='data';rerender()});await W(200);const [dj]=await Promise.all([p.waitForEvent('download',{timeout:4000}).catch(()=>null),p.click('button:has-text("Export JSON")')]);ok(!!dj,'export the workspace as JSON');
await E(()=>{ST.tab='appearance';rerender()});await W(200);await p.click('#stTh button[data-v=dark]');await W(200);ok(await E(()=>document.documentElement.dataset.theme==='dark'),'dark theme');await p.click('#stTh button[data-v=light]');
// ---------- persistence ----------
const snap=await E(()=>({p:S.products.length,o:S.orders.length,c:S.credits.balance,l:!!S.bp.license,pl:S.bp.plugins.length,h:S.hubs.filter(h=>h.joined).length}));await E(()=>save());await p.reload();await W(1800);
ok(await E(s=>S.products.length===s.p&&S.orders.length===s.o&&S.credits.balance===s.c&&!!S.bp.license===s.l&&S.bp.plugins.length===s.pl&&S.hubs.filter(h=>h.joined).length===s.h&&!document.querySelector('#welcome'),snap),'everything is still there after a reload');
await E(()=>{window._noSim=true});
// ---------- every screen, light and dark, two window sizes ----------
const routes=await E(()=>['dash','products','product/p1','store','store/p1','p/p1','analytics','sales','roadmap','team','messages','hubs','hub/h1','hub/h1/settings','credits','settings','bp','bp/plugins','bp/plugin/'+S.bp.plugins[0].id,'bp/designs','bp/design/'+S.bp.designs.at(-1).id,'bp/license','bp/docs']);
for(const vw of [1440,1100]){await p.setViewportSize({width:vw,height:860});for(const th of ['light','dark']){await E(t=>{S.settings.theme=t;applyTheme()},th);const bad=[],slow=[];
 for(const r of routes){await E(r=>go(r),r);await W(60);const x=await E(()=>({broke:/Something went wrong/.test(document.querySelector('#view').textContent),wide:document.documentElement.scrollWidth>innerWidth+1,ms:window._lastRender}));if(x.broke)bad.push(r);if(x.wide)bad.push(r+' (too wide)');if(x.ms>100)slow.push(r+' '+Math.round(x.ms)+'ms')}
 ok(!bad.length,`every screen at ${vw}px in ${th}: ${bad.join(', ')||'all good'}`);ok(!slow.length,`every screen under 100 ms at ${vw}px in ${th}${slow.length?': '+slow.join(', '):''}`)}}
await p.setViewportSize({width:1440,height:900});await E(()=>{S.settings.theme='light';applyTheme()});
// ---------- stress: heavy data, many renders, random clicks ----------
await E(()=>{const now=Date.now();for(let i=0;i<20000;i++){S.orders.push({id:'x'+i,p:S.products[i%6].id,a:29,t:now-Math.floor(Math.random()*170)*DAY,c:'c'+(i%1400),s:i%6,r:0})}S.orders.sort((a,b)=>a.t-b.t)});
const heavy={};for(const r of ['dash','analytics','sales','products','product/p1','credits']){heavy[r]=await E(r=>{const t=performance.now();go(r);return performance.now()-t},r)}
ok(Object.values(heavy).every(v=>v<400),'with 21,000 orders every screen still renders fast: '+Object.entries(heavy).map(([k,v])=>k+' '+Math.round(v)+'ms').join(', '));
const h0=await E(()=>performance.memory?performance.memory.usedJSHeapSize:0);for(let i=0;i<120;i++){await E(r=>go(r),routes[i%routes.length])}await E(()=>window.gc&&window.gc());await W(300);const h1=await E(()=>performance.memory?performance.memory.usedJSHeapSize:0);
ok(!h0||h1<h0*2.2,`memory stays flat over 120 screen changes (${(h0/1e6).toFixed(1)} MB → ${(h1/1e6).toFixed(1)} MB)`);
await E(()=>{S.orders=S.orders.filter(o=>!/^x\d/.test(o.id));save()});
const e0=errs.length;let taps=0;for(let i=0;i<300;i++){if(i%40===0)await E(r=>{closeOv();go(r)},routes[Math.floor(i/40)%routes.length]);
 const t=await E(()=>{const L=[...document.querySelectorAll('#view button:not([disabled]), #view a[href^="#"], #side a, .tabs button, .seg button, .chl, .li.click, tr.click')].filter(x=>{const r=x.getBoundingClientRect();return r.width&&r.height&&r.top>=0&&r.bottom<=innerHeight&&!/Delete|Reset|Remove|Revoke|Refund|Leave|Export|CSV|JSON|Copy|brand kit/i.test(x.textContent+x.getAttribute('aria-label'))});const x=L[Math.floor(Math.random()*L.length)];if(!x)return null;const r=x.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});
 if(t){await p.mouse.click(t[0],t[1]).catch(()=>{});taps++}if(i%7===0)await p.keyboard.press('Escape');await W(25)}
ok(errs.length===e0,`${taps} random taps without a script error`);ok(await E(()=>!!S&&S.products.length>0&&document.querySelector('#side')),'the app is still alive after the random taps');
// ---------- offline: the page has no outside requests ----------
const ext=[];p.on('request',r=>{if(!/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(r.url()))ext.push(r.url())});await p.reload();await W(1500);await E(()=>go('analytics'));await W(300);ok(!ext.length,'no outside requests: fonts and art are built in'+(ext.length?' '+ext.slice(0,3).join(' '):''));
ok(!errs.length,'no script errors'+(errs.length?': '+[...new Set(errs)].slice(0,5).join(' | '):''));
console.log(`\n${pass} passed, ${fail} failed`);if(fails.length)console.log('Failed:\n - '+fails.join('\n - '));await b.close();process.exit(fail?1:0)})();
