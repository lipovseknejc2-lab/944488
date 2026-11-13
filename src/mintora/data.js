/* Mintora data: the seeded demo workspace, live simulation, and every derived number (revenue, funnel, performance score). */
const FIRST=['Ava','Liam','Mia','Noah','Zoe','Ethan','Lena','Omar','Sara','Jonas','Ines','Theo','Nora','Kai','Elif','Mateo','Yara','Felix','Ana','Leo','Maya','Hugo','Iris','Ravi','Clara','Diego','Hana','Tariq','Emma','Luca','Freya','Sami','Aiko','Nils','Rosa','Ivan'];
const LAST=['Novak','Berg','Costa','Moreau','Fischer','Silva','Kim','Haddad','Lund','Rossi','Okafor','Weber','Tanaka','Petrov','Ortiz','Kowal','Laine','Bauer','Reyes','Sato','Kaur','Dubois','Horvat','Nyberg'];
const COUNTRIES=[['US',.31],['UK',.11],['DE',.1],['CA',.07],['FR',.06],['NL',.05],['IN',.06],['AU',.05],['SI',.03],['BR',.04],['ES',.04],['JP',.03],['SE',.05]];
const SOURCES=[['Direct','#0E1512'],['X / Twitter','#6D5DFC'],['YouTube','#E5484D'],['Newsletter','#12C48B'],['Search','#2F7BEA'],['Hubs','#E39A22']];
const SRCW=[.2,.18,.14,.2,.18,.1];
function pickW(r,ws){let x=r()*sum(ws);for(let i=0;i<ws.length;i++){x-=ws[i];if(x<=0)return i}return ws.length-1}
function defaultBlocks(p){return[
 {id:uid('b'),t:'hero',d:{title:p.name,sub:p.tagline||'',cta:'Get it now',alt:'See what is inside'}},
 {id:uid('b'),t:'features',d:{title:'What you get',items:[['bolt','Ready in minutes','Duplicate it and start the same day.'],['layers','Built in layers','Use the parts you need, skip the rest.'],['refresh','Free updates','Every improvement, forever, at no cost.']]}},
 {id:uid('b'),t:'testimonials',d:{title:'Loved by makers',items:[['It replaced three tools for me. Worth ten times the price.','Ines Weber','Indie founder'],['The clearest product of its kind. Setup took me twenty minutes.','Kai Tanaka','Designer']]}},
 {id:uid('b'),t:'pricing',d:{title:'Simple pricing',tiers:[['Personal',p.price,'For one maker',['Full product','Free updates','Email support']],['Team',Math.round(p.price*2.6),'Up to 5 seats',['Everything in Personal','Team license','Priority support']]]}},
 {id:uid('b'),t:'faq',d:{title:'Questions',items:[['How do I get it?','Right after checkout you get an email with the download link and your license key.'],['Can I get a refund?','Yes. If it is not for you, write within 14 days for a full refund.'],['Do I get updates?','Yes, every update is free for life.']]}},
 {id:uid('b'),t:'cta',d:{title:'Ready to start?',sub:'Join the makers who already use it.',cta:'Get '+p.name}}]}
const DESIGNS0=[
 {id:'d-mint',name:'Mint Clean',tokens:{accent:'#12C48B',bg:'#FFFFFF',surface:'#F4F7F5',text:'#0E1512',muted:'#66706A',radius:14,font:'display',pattern:'none'},sys:true},
 {id:'d-ink',name:'Midnight Ink',tokens:{accent:'#8F82FF',bg:'#0E1116',surface:'#171B22',text:'#EEF1F6',muted:'#97A0AE',radius:12,font:'display',pattern:'grid'},sys:true},
 {id:'d-paper',name:'Paper',tokens:{accent:'#D9622B',bg:'#FBF7F0',surface:'#F2ECE1',text:'#2A2119',muted:'#7C6F62',radius:6,font:'serif',pattern:'dots'},sys:true}];
function seed(){const s=DEF(),r=rng(4242),now=Date.now(),today=startOfDay(now),DAYS=180;
 s.customers=Array.from({length:1400},(_,i)=>{const n=FIRST[Math.floor(r()*FIRST.length)]+' '+LAST[Math.floor(r()*LAST.length)];return{id:'c'+i,name:n,email:n.toLowerCase().replace(/\s+/,'.')+'@'+['mail.com','proton.me','studio.io','gmail.com','hey.com'][i%5],country:COUNTRIES[pickW(r,COUNTRIES.map(c=>c[1]))][0]}});
 const P=[
  ['p1','Founder OS','template',39,'The Notion system that runs a one-person company.',178,320,.034,'live',4.8],
  ['p2','Ship It in 30 Days','course',149,'Build and launch a SaaS in a month, step by step.',150,210,.017,'live',4.7],
  ['p3','Film Grain Presets','preset',24,'Twenty-four Lightroom presets with real film character.',160,260,.029,'live',4.6],
  ['p4','Iconic 2400','assets',59,'2,400 pixel-perfect line icons in six weights.',120,190,.022,'live',4.9],
  ['p5','Cold Email Playbook','ebook',19,'The templates and timing that get replies.',95,170,.031,'live',4.4],
  ['p6','Makers Circle','membership',12,'A monthly membership with live build sessions.',70,120,.024,'live',4.7],
  ['p7','Orbit UI Kit','assets',79,'A Figma kit with 400 components and dark mode.',0,0,0,'draft',0],
  ['p8','Focus Sounds','audio',9,'Two hours of quiet loops for deep work.',30,80,.028,'archived',4.3]];
 s.products=P.map(([id,name,type,price,tagline,age,views,conv,status,rating],i)=>{const p={id,name,type,price,tagline,desc:tagline+' Made with care by '+s.workspace.name+'.',status,rating,created:today-age*DAY-(id==='p7'?3*DAY:0),slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),tags:[TYPES[type].n.toLowerCase()],
   recurring:type==='membership',stock:null,seats:null,_v:views,_c:conv};p.page={blocks:defaultBlocks(p),design:i===1?'d-ink':i===4?'d-paper':'d-mint',published:status==='live',plugins:[]};return p});
 if(s.products[6].created>today)s.products[6].created=today-2*DAY;
 /* 180 days of traffic and sales with weekly rhythm, launches and slow growth */
 s.views={};s.orders=[];let oi=0;
 for(const p of s.products){s.views[p.id]={};if(!p._v)continue;const born=Math.floor((today-p.created)/DAY);
  for(let d=Math.min(born,DAYS);d>=0;d--){const t=today-d*DAY,dow=new Date(t).getDay(),age=born-d,launch=age<7?2.4-age*.2:1,trend=1+(DAYS-d)/DAYS*.55,wk=dow===0||dow===6?.78:1.06,noise=.75+r()*.5;
   const v=Math.round(p._v/6*launch*trend*wk*noise*(p.status==='archived'?.35:1));s.views[p.id][dayKey(t)]=v;
   const exp=v*p._c*(.8+r()*.4);let n=Math.floor(exp)+(r()<exp%1?1:0);
   for(let k=0;k<n;k++){const at=t+Math.floor((8+r()*15)*3600e3);if(at>now)continue;const c=s.customers[Math.floor(Math.pow(r(),1.15)*s.customers.length)];
    const team=p.page.blocks.find(b=>b.t==='pricing')&&r()<.12;s.orders.push({id:'o'+(++oi),p:p.id,a:team?Math.round(p.price*2.6):p.price,t:at,c:c.id,s:pickW(r,SRCW),r:r()<.028?1:0,tier:team?'Team':'Personal'})}}}
 s.orders.sort((a,b)=>a.t-b.t);
 s.reviews=s.products.filter(p=>p.rating).flatMap(p=>Array.from({length:3+Math.floor(r()*4)},()=>{const c=s.customers[Math.floor(r()*s.customers.length)];return{id:uid('rv'),p:p.id,c:c.id,stars:Math.min(5,Math.max(3,Math.round(p.rating+(r()-.6)))),t:now-Math.floor(r()*60)*DAY,text:['Exactly what I needed. Clear and well made.','Paid for itself in the first week.','Good value, I wish there were more examples.','Beautiful work and fast support.','Saved me hours. Recommended to my team.'][Math.floor(r()*5)]}}));
 s.products.forEach(p=>{delete p._v;delete p._c});
 /* two pages are not finished yet, so there is something to improve */
 s.products[2].page.blocks=s.products[2].page.blocks.filter(b=>!['testimonials','faq'].includes(b.t));s.products[4].page.blocks=s.products[4].page.blocks.filter(b=>b.t!=='pricing');
 s.team=[
  {id:'u1',name:'Lea Kovač',email:'lea@northwind.studio',role:'Admin',title:'Design lead',dept:'Design',color:'#6D5DFC',status:'online',joined:today-160*DAY,bot:true},
  {id:'u2',name:'Marco Reyes',email:'marco@northwind.studio',role:'Maker',title:'Engineer',dept:'Product',color:'#2F7BEA',status:'online',joined:today-120*DAY,bot:true},
  {id:'u3',name:'Priya Shah',email:'priya@northwind.studio',role:'Marketer',title:'Growth',dept:'Marketing',color:'#E0558F',status:'away',joined:today-90*DAY,bot:true},
  {id:'u4',name:'Tomás Silva',email:'tomas@northwind.studio',role:'Support',title:'Customer care',dept:'Support',color:'#E39A22',status:'online',joined:today-60*DAY,bot:true},
  {id:'u5',name:'Hana Ito',email:'hana@advisor.co',role:'Viewer',title:'Advisor',dept:'Advisors',color:'#0EA5A5',status:'offline',joined:today-30*DAY,bot:true}];
 s.invites=[{id:uid('i'),email:'sam@freelance.dev',role:'Maker',at:now-2*DAY}];
 s.roadmap=[
  {id:'r1',title:'Orbit UI Kit launch',desc:'Finish the dark mode variants and the documentation site, then launch to the newsletter.',stage:'building',owner:'u1',due:today+9*DAY,est:4200,votes:14,pid:'p7',tasks:[['Dark mode variants',true],['Docs site',false],['Launch email',false]]},
  {id:'r2',title:'Founder OS 3.0',desc:'A finance dashboard and a hiring pipeline inside the template.',stage:'planned',owner:'u2',due:today+30*DAY,est:6000,votes:22,pid:'p1',tasks:[['Finance dashboard',false],['Hiring pipeline',false]]},
  {id:'r3',title:'Affiliate program',desc:'Pay 30% to creators who bring customers.',stage:'planned',owner:'u3',due:today+21*DAY,est:3000,votes:9,tasks:[]},
  {id:'r4',title:'Podcast course',desc:'Record and sell a course about building in public.',stage:'idea',owner:'me',est:5000,votes:6,tasks:[]},
  {id:'r5',title:'Preset pack: Night',desc:'Night photography presets, a companion to Film Grain.',stage:'idea',owner:'u3',est:1800,votes:11,tasks:[]},
  {id:'r6',title:'Bundle: Founder starter',desc:'Founder OS, Cold Email Playbook and Iconic at 30% off.',stage:'idea',owner:'me',est:2500,votes:4,tasks:[]},
  {id:'r7',title:'Makers Circle live sessions',desc:'Weekly build sessions for members.',stage:'launched',owner:'u4',due:today-12*DAY,est:1500,votes:17,pid:'p6',tasks:[['Schedule',true],['First session',true]]},
  {id:'r8',title:'Ship It: chapter 9',desc:'Pricing and payments chapter.',stage:'launched',owner:'u2',due:today-30*DAY,est:900,votes:8,pid:'p2',tasks:[]}];
 const M=(who,text,ago)=>({id:uid('m'),who,text,t:now-ago*60000});
 s.channels=[
  {id:'ch-gen',name:'general',kind:'channel',topic:'Everything at Northwind',members:['me','u1','u2','u3','u4','u5'],msgs:[M('u1','Morning all. The Orbit components are 80% done.',300),M('u2','Nice. I pushed the license key fix for Iconic.',260),M('u3','Newsletter goes out at 16:00 with the Founder OS case study.',90),M('u4','Two refund requests overnight, both handled.',40)],unread:2},
  {id:'ch-launch',name:'launch-orbit',kind:'channel',topic:'Orbit UI Kit launch room',members:['me','u1','u2','u3'],msgs:[M('u1','Cover art is ready, have a look on the storefront.',500),M('u3','I can line up three creators for launch day.',420)],unread:0},
  {id:'ch-sup',name:'support',kind:'channel',topic:'Customer questions',members:['me','u4'],msgs:[M('u4','A customer asks whether Founder OS works with the free Notion plan. It does.',700)],unread:0},
  {id:'dm-u1',name:'Lea Kovač',kind:'dm',with:'u1',members:['me','u1'],msgs:[M('u1','Can you review the Orbit pricing before Friday?',120)],unread:1}];
 const HM=(who,text,ago,ch)=>({id:uid('m'),who,text,t:now-ago*60000});
 s.hubs=[
  {id:'h1',name:'Founder OS Circle',desc:'The community for Founder OS customers. Share setups, ask questions, build together.',color:'#12C48B',icon:'FO',owner:'me',joined:true,public:true,design:'d-mint',pid:'p1',
   roles:[{id:'admin',name:'Admin',color:'#E5484D',perms:['manage','roles','channels','kick','announce','projects']},{id:'mod',name:'Moderator',color:'#6D5DFC',perms:['channels','kick','announce']},{id:'customer',name:'Customer',color:'#12C48B',perms:['projects']},{id:'member',name:'Member',color:'#8A958F',perms:[]}],
   members:[{id:'me',role:'admin'},{id:'u1',role:'admin'},{id:'u4',role:'mod'},...s.customers.slice(0,26).map((c,i)=>({id:c.id,role:i<18?'customer':'member'}))],
   channels:[{id:'hc1',name:'welcome',type:'announce',msgs:[HM('me','Welcome to the Founder OS Circle. Start in #introductions and say hi.',4000)]},{id:'hc2',name:'general',type:'text',msgs:[HM('c3','Has anyone connected Founder OS to a CRM?',200),HM('u4','Yes, there is a guide in the resources page. I will pin it.',180),HM('c7','My weekly review is finally a habit. Thank you!',60)],unread:3},{id:'hc3',name:'showcase',type:'text',msgs:[HM('c11','Here is my setup with the finance view.',900)]},{id:'hc4',name:'feature-requests',type:'text',msgs:[HM('c2','A hiring pipeline would be amazing.',1600)]}],
   projects:[{id:'hp1',name:'Template translations',desc:'Community translations of Founder OS.',members:['c3','c7','u4'],status:'active',progress:.45},{id:'hp2',name:'Integrations guide',desc:'Guides for CRM, calendar and finance tools.',members:['u1','c11'],status:'active',progress:.7}],plugins:[]},
  {id:'h2',name:'Mintora Makers',desc:'The official community for everyone selling on Mintora.',color:'#1F7A5C',icon:'MM',owner:'mintora',joined:true,public:true,official:true,
   roles:[{id:'admin',name:'Staff',color:'#12C48B',perms:['manage','roles','channels','kick','announce','projects']},{id:'member',name:'Maker',color:'#8A958F',perms:['projects']}],
   members:[{id:'me',role:'member'},...s.customers.slice(400,440).map(c=>({id:c.id,role:'member'}))],
   channels:[{id:'hm1',name:'announcements',type:'announce',msgs:[HM('c401','Blueprint plugins are here. Build your own storefront plugins and hub bots.',2000)]},{id:'hm2',name:'general',type:'text',msgs:[HM('c405','First $1k month today!',300),HM('c410','Congrats! What did you sell?',280)]},{id:'hm3',name:'feedback',type:'text',msgs:[]}],projects:[],plugins:[]},
  {id:'h3',name:'Indie Founders EU',desc:'European makers building small, profitable software.',color:'#2F7BEA',icon:'IF',owner:'other',joined:false,public:true,size:1240,roles:[{id:'admin',name:'Admin',color:'#E5484D',perms:['manage']},{id:'member',name:'Member',color:'#8A958F',perms:[]}],members:[],channels:[{id:'hi1',name:'general',type:'text',msgs:[]}],projects:[],plugins:[]},
  {id:'h4',name:'Pixel Guild',desc:'Icon, font and UI kit designers who sell their work.',color:'#E0558F',icon:'PG',owner:'other',joined:false,public:true,size:860,roles:[{id:'admin',name:'Admin',color:'#E5484D',perms:['manage']},{id:'member',name:'Member',color:'#8A958F',perms:[]}],members:[],channels:[{id:'hg1',name:'general',type:'text',msgs:[]}],projects:[],plugins:[]},
  {id:'h5',name:'Creator Economy Lab',desc:'Research and experiments on pricing, launches and audiences.',color:'#E39A22',icon:'CL',owner:'other',joined:false,public:true,size:2310,roles:[{id:'admin',name:'Admin',color:'#E5484D',perms:['manage']},{id:'member',name:'Member',color:'#8A958F',perms:[]}],members:[],channels:[{id:'hl1',name:'general',type:'text',msgs:[]}],projects:[],plugins:[]}];
 s.credits={balance:0,earned:0,spent:0,log:[],perks:{}};
 [[600,'Welcome to Mintora',40],[100,'Product published',38],[100,'Product published',30],[60,'Hub created',28],[100,'Product published',22],[40,'Storefront published',20],[30,'Teammate invited',15],[50,'Daily check-in',3],[50,'Daily check-in',2],[50,'Daily check-in',1]].forEach(([a,w,d])=>{s.credits.log.unshift({at:now-d*DAY,amt:a,why:w});s.credits.balance+=a;s.credits.earned+=a});
 const saleCred=Math.round(s.orders.length*1);s.credits.log.unshift({at:now-DAY/2,amt:saleCred,why:`Sales bonus (${nfmt(s.orders.length)} orders)`});s.credits.balance+=saleCred;s.credits.earned+=saleCred;
 s.credits.log.sort((a,b)=>b.at-a.at);
 s.bp.designs=DESIGNS0.map(d=>({...d,tokens:{...d.tokens}}));
 s.api.keys=[{id:uid('k'),name:'Production',prefix:'mk_live_',tail:'8f2a',at:now-50*DAY,last:now-3600e3}];
 s.api.hooks=[{id:uid('w'),url:'https://hooks.northwind.studio/mintora',events:['order.created','refund.created'],on:true,at:now-40*DAY}];
 s.activity=[{id:uid(),at:now-40*60000,kind:'sale',text:'New order for Founder OS'},{id:uid(),at:now-3*3600e3,kind:'review',text:'A 5-star review on Iconic 2400'},{id:uid(),at:now-5*3600e3,kind:'team',text:'Lea Kovač updated the Orbit UI Kit storefront'},{id:uid(),at:now-26*3600e3,kind:'roadmap',text:'Orbit UI Kit launch moved to Building'}];
 s.notifs=[{id:uid(),at:now-30*60000,text:'Lea Kovač mentioned you in #launch-orbit',ic:'chat',href:'messages',read:false},{id:uid(),at:now-4*3600e3,text:'Founder OS passed 1,000 sales',ic:'star',href:'product/p1',read:false}];
 s.settings.lastDaily=startOfDay(now);s.settings.lastSim=now;
 return s}
/* ---- lookups ---- */
const prod=id=>S.products.find(p=>p.id===id);
const cust=id=>S.customers.find(c=>c.id===id);
const mem=id=>id==='me'?S.me:S.team.find(m=>m.id===id);
function personAny(id){return mem(id)||cust(id)||{id,name:'Former member',color:'#9AA39D'}}
/* ---- live simulation: days pass while you are away, and sales keep arriving while you work ---- */
function catchUpDays(){const last=S.settings.lastSim||Date.now(),now=Date.now();if(now-last<6*3600e3){S.settings.lastSim=now;return}
 const r=rng(Math.floor(now/1000)),from=startOfDay(last),days=Math.min(30,Math.floor((startOfDay(now)-from)/DAY));let added=0;
 for(let d=days;d>=0;d--){const t=startOfDay(now)-d*DAY;for(const p of S.products.filter(p=>p.status==='live')){const k=dayKey(t),prev=S.views[p.id]||(S.views[p.id]={});const base=avgViews(p.id)||40;if(prev[k])continue;const v=Math.round(base*(.8+r()*.4));prev[k]=v;const conv=convOf(p.id)||.02;const n=Math.round(v*conv*(.7+r()*.6));
  for(let i=0;i<n;i++){const at=t+Math.floor((8+r()*15)*3600e3);if(at<=last||at>now)continue;addOrder(p,{at,quiet:true});added++}}}
 S.settings.lastSim=now;if(added)notify(`${plural(added,'new order')} while you were away`,'cart','sales')}
function avgViews(pid){const v=Object.values(S.views[pid]||{}).slice(-14);return v.length?sum(v)/v.length:0}
function convOf(pid){const o=S.orders.filter(o=>o.p===pid&&o.t>Date.now()-30*DAY).length,v=viewsIn(pid,30);return v?o/v:0}
function addOrder(p,{at,quiet}={}){const r=Math.random,c=S.customers[Math.floor(Math.pow(r(),1.3)*S.customers.length)];const o={id:'o'+(S.orders.length+1)+uid().slice(0,3),p:p.id,a:p.price,t:at||Date.now(),c:c.id,s:Math.floor(r()*SOURCES.length),r:0,tier:'Personal'};
 S.orders.push(o);const k=dayKey(o.t);(S.views[p.id]||(S.views[p.id]={}))[k]=(S.views[p.id][k]||0)+Math.round(25+r()*20);earn('sale',5,'Sale: '+p.name);
 if(!quiet){act('sale',`New order for ${p.name}`,'sales');notify(`${c.name} bought ${p.name} · ${money(o.a)}`,'cart','sales');toast(`New sale · ${p.name} · ${money(o.a)}`,'cart');pluginEvent('purchase',{pid:p.id,order:o})}
 return o}
let _simT=0;
function liveSales(){clearTimeout(_simT);_simT=setTimeout(()=>{const L=S.products.filter(p=>p.status==='live');if(L.length&&!document.hidden&&!window._noSim){const w=L.map(p=>Math.max(1,avgViews(p.id)*convOf(p.id)));addOrder(L[pickW(Math.random,w)]);save();if(['dash','sales','analytics','products','product'].includes(route.k))rerender();else{side();bar()}}liveSales()},45000+Math.random()*60000)}
/* ---- numbers ---- */
function inRange(t,days,offset=0){const end=Date.now()-offset*DAY,start=startOfDay(end)-(days-1)*DAY;return t>=start&&t<=end}
function ordersIn(days,offset=0,pid){return S.orders.filter(o=>(!pid||o.p===pid)&&inRange(o.t,days,offset))}
const revOf=L=>sum(L.filter(o=>!o.r).map(o=>o.a));
function viewsIn(pid,days,offset=0){let n=0;const ids=pid?[pid]:Object.keys(S.views);for(const id of ids){const V=S.views[id]||{};for(let d=offset;d<offset+days;d++)n+=V[dayKey(Date.now()-d*DAY)]||0}return n}
function dailySeries(days,fn){const out=[];for(let d=days-1;d>=0;d--){const t=startOfDay(Date.now())-d*DAY;out.push(fn(t,dayKey(t)))}return out}
function revSeries(days,pid){const by={};for(const o of S.orders){if(o.r||(pid&&o.p!==pid))continue;const k=dayKey(o.t);by[k]=(by[k]||0)+o.a}return dailySeries(days,(t,k)=>by[k]||0)}
function ordSeries(days,pid){const by={};for(const o of S.orders){if(pid&&o.p!==pid)continue;const k=dayKey(o.t);by[k]=(by[k]||0)+1}return dailySeries(days,(t,k)=>by[k]||0)}
function viewSeries(days,pid){return dailySeries(days,(t,k)=>sum((pid?[pid]:Object.keys(S.views)).map(id=>(S.views[id]||{})[k]||0)))}
function bucket(series,n){const size=Math.ceil(series.length/n),out=[];for(let i=0;i<series.length;i+=size)out.push(sum(series.slice(i,i+size)));return out}
const dayLabel=(days,i)=>{const t=startOfDay(Date.now())-(days-1-i)*DAY;return new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric'})};
function prodStats(pid,days=30){const L=ordersIn(days,0,pid),P=ordersIn(days,days,pid),v=viewsIn(pid,days),rev=revOf(L),prev=revOf(P),ref=L.filter(o=>o.r).length;
 return{rev,prev,growth:prev?(rev-prev)/prev:rev?Infinity:0,orders:L.length,views:v,conv:v?L.length/v:0,refund:L.length?ref/L.length:0,all:revOf(S.orders.filter(o=>o.p===pid)),allOrders:S.orders.filter(o=>o.p===pid).length}}
/* checkout funnel: views, product page reads, checkout starts, paid (rates from the product's own data) */
function funnel(days,pid){const v=viewsIn(pid,days),paid=ordersIn(days,0,pid).length,co=Math.round(paid/.42+v*.004),eng=Math.round(Math.max(co*2.2,v*.46));return[['Visits',v],['Read the page',eng],['Started checkout',co],['Paid',paid]]}
/* ---- the performance score: six factors against digital-product benchmarks ---- */
const FACTORS=[
 ['growth','Revenue growth',.25,'Revenue in the last 30 days compared with the 30 before.'],
 ['conversion','Conversion',.22,'Paid orders per visit. 1 to 3% is typical for digital products; 4% and above is excellent.'],
 ['refunds','Refund health',.1,'Under 5% refunds is healthy; under 2% is excellent.'],
 ['rating','Customer rating',.15,'The average review score across your products.'],
 ['repeat','Repeat customers',.1,'Customers who bought more than once. 50% and above is excellent; bundles and memberships lift it.'],
 ['storefront','Storefront quality',.18,'Pages with a clear hero, social proof, pricing and answers convert better.']];
function storefrontQuality(p){const t=new Set(p.page.blocks.map(b=>b.t));let s=0;['hero','features','testimonials','pricing','faq','cta'].forEach(k=>{if(t.has(k))s+=1/6});if(!p.page.published)s*=.5;return s}
function perfScore(pid){const days=30,L=ordersIn(days,0,pid),P=ordersIn(days,days,pid),rev=revOf(L),prev=revOf(P),v=viewsIn(pid,days);
 const conv=v?L.length/v:0,ref=L.length?L.filter(o=>o.r).length/L.length:0;const ps=pid?[prod(pid)]:S.products.filter(p=>p.status==='live');
 const rated=ps.filter(p=>p.rating),rating=rated.length?sum(rated.map(p=>p.rating))/rated.length:0;
 const byC={};S.orders.filter(o=>!pid||o.p===pid).forEach(o=>byC[o.c]=(byC[o.c]||0)+1);const cs=Object.values(byC),repeat=cs.length?cs.filter(n=>n>1).length/cs.length:0;
 const sq=ps.length?sum(ps.map(storefrontQuality))/ps.length:0,g=prev?(rev-prev)/prev:rev?1:0;
 const f={growth:clamp(50+g*170,0,100),conversion:clamp(conv/.04*100,0,100),refunds:clamp(100-ref*1000/0.95*.95,0,100),rating:clamp((rating-3)/2*100,0,100),repeat:clamp(repeat/.5*100,0,100),storefront:sq*100};
 const raw={growth:g,conversion:conv,refunds:ref,rating,repeat,storefront:sq};
 const score=Math.round(sum(FACTORS.map(([k,,w])=>f[k]*w)));return{score,f,raw}}
const grade=s=>s>=85?['Excellent','var(--mint-ink)','var(--mint-soft)']:s>=70?['Strong','var(--blue)','var(--blue-soft)']:s>=50?['Fair','var(--amber)','var(--amber-soft)']:['Needs work','var(--red)','var(--red-soft)'];
function tips(P){const T=[],raw=P.raw;
 if(P.f.storefront<96){const p=S.products.filter(p=>p.status==='live').map(p=>[p,storefrontQuality(p)]).sort((a,b)=>a[1]-b[1])[0];if(p)T.push(['page',`Finish the ${p[0].name} storefront`,'Add the missing sections: testimonials, pricing or questions.',`store/${p[0].id}`])}
 if(raw.conversion<.03)T.push(['tag','Try a launch discount','A time-limited code usually lifts conversion. Blueprint plugins can add a countdown.','bp/plugins']);
 if(P.f.repeat<60)T.push(['layers','Create a bundle','Bundles turn one-time buyers into repeat customers.','roadmap']);
 if(raw.refunds>.03)T.push(['shield','Reduce refunds','Set expectations on the page: what is inside, who it is for.','products']);
 if(raw.growth<.05)T.push(['mega','Share a launch in your hub','Hubs drive warm traffic. Post an announcement.','hubs']);
 T.push(['spark','Unlock deep insights','Cohorts, best launch hours and lifetime value. 300 credits.','credits']);return T.slice(0,4)}
