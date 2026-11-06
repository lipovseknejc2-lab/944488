const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
const errs=[],net=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/manifest|icon|404/.test(m.text()))errs.push(m.text())});p.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))net.push(r.url())});
p.on('dialog',d=>d.dismiss());p.on('popup',x=>x.close().catch(()=>{}));
await p.goto('http://127.0.0.1:8812/atelier.html');await p.waitForTimeout(1700);await p.click('#obS');await p.fill('#obName','Test');await p.fill('#obSur','User');await p.click('#obSt label:has-text("Working")');await p.fill('#obMail','test@user.io');await p.click('#obF button[type=submit]');await p.waitForTimeout(800);
// heavy: 60 projects x 40 tasks, 400 notes, 3000 messages, 2000 ledger entries, 365 usage days
await p.evaluate(()=>{for(let i=0;i<60;i++){const pr={id:'p'+i,name:'Project '+i,desc:'',size:i%2?'big':'small',tools:TOOLS.map(t=>t[0]),col:GCOL[i%8],groups:[S.groups[0].id],members:['me'],at:Date.now()-i*864e5,tasks:[],ideas:[],files:[],boards:[],inspo:[],table:{cols:['A','B'],rows:[['x','1']],chart:'bar'},activity:[]};
 for(let j=0;j<40;j++)pr.tasks.push({id:'t'+i+'_'+j,t:'Task '+j,st:['todo','doing','done'][j%3],who:j%2?S.people[j%5].id:'me',at:Date.now(),doneAt:j%3===2?Date.now()-j*864e5/3:null});for(let j=0;j<15;j++)pr.ideas.push({id:'i'+i+j,text:'Idea '+j,by:'me',votes:[],col:j%5,at:Date.now()});for(let j=0;j<30;j++)pr.activity.push({who:'me',text:'did '+j,at:Date.now()-j*6e4});S.projects.push(pr)}
 for(let i=0;i<400;i++)S.notes.push({id:'n'+i,title:'Note '+i,body:'Line one\n[ ] task\n- bullet '.repeat(5),col:i%6,pin:i%17===0,share:{groups:i%3?[]:[S.groups[0].id],projects:[]},at:Date.now()-i*36e5,up:Date.now()-i*36e5});
 const c=S.chats[0];for(let i=0;i<3000;i++)c.msgs.push({id:'m'+i,from:i%2?'me':S.people[i%5].id,text:'Message number '+i+' about the project',at:Date.now()-(3000-i)*6e4});
 for(let i=0;i<2000;i++)S.ledger.push({id:'l'+i,at:Date.now()-i*6e5,k:['focus','note','msg','task','feel'][i%5],t:'Entry '+i,feel:'calm'});
 for(let i=0;i<365;i++){const d=isoD(new Date(Date.now()-i*864e5));S.usage.days[d]={_n:50,msg:20,note_edit:10,task_move:10,focus_min:10};S.usage.total+=50}
 for(let i=0;i<300;i++)S.focus.sessions.push({at:Date.now()-i*864e5/2,mins:25,mode:'pomo',label:'x'});save();render()});
console.log('save size',Math.round(await p.evaluate(()=>localStorage.getItem('atelier-v1').length)/1024),'KB');
const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
for(const v of ['today','ledger','focus','notes','projects','project:p0','project:p0:tasks','project:p0:ideas','chat','c:'+await p.evaluate(()=>S.chats[0].id),'groups','group:'+await p.evaluate(()=>S.groups[0].id),'you','posters','settings']){
 const t=await p.evaluate(v=>{const t0=performance.now();location.hash=v;render();return performance.now()-t0},v);console.log(v.split(':').slice(0,2).join(':').padEnd(18),Math.round(t),'ms (4x slower CPU)');await p.waitForTimeout(150)}
const sv=await p.evaluate(()=>{const t0=performance.now();for(let i=0;i<10;i++)save();return(performance.now()-t0)/10});console.log('save',Math.round(sv),'ms');
await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
const heap=async()=>{await cdp.send('HeapProfiler.collectGarbage');return(await p.evaluate(()=>performance.memory.usedJSHeapSize))/1048576};const h0=await heap();
const V=['today','notes','projects','project:p1:tasks','chat','you','focus'];for(let i=0;i<200;i++){await p.evaluate(v=>{location.hash=v},V[i%V.length]);if(i%20===0)await p.waitForTimeout(20)}
await p.waitForTimeout(500);console.log('heap',h0.toFixed(1),'MB ->',(await heap()).toFixed(1),'MB after 200 screen changes');
// monkey on a normal dataset
await p.evaluate(()=>{S.projects=S.projects.slice(0,3);S.notes=S.notes.slice(0,20);S.chats[0].msgs=S.chats[0].msgs.slice(-40);S.ledger=S.ledger.slice(-100);save();location.hash='today';render()});
let s=11;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;let n=0;
for(let i=0;i<400;i++){const els=await p.$$('button:visible, a[href^="#"]:visible, .li:visible, .wday:visible, [data-mode]:visible');if(!els.length)continue;const e=els[Math.floor(rnd()*els.length)];const t=(await e.textContent().catch(()=>''))||'';
 if(/Delete|Erase|Sign out|Remove|Export|Download|Import|Voice/.test(t))continue;await e.click({timeout:1200}).catch(()=>{});n++;await p.waitForTimeout(30);
 if(i%30===0)await p.evaluate(()=>{const f=document.querySelector('#sf');if(f){const i=f.querySelector('input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=hidden])');if(i&&!i.value)i.value='Test '+Date.now()%1000;f.requestSubmit()}});
 if(i%50===0)await p.evaluate(()=>{if(document.querySelector('#modal').classList.contains('open'))closeSheet()})}
console.log('random taps',n,'· still signed in:',await p.evaluate(()=>!!S.me&&!!localStorage.getItem('atelier-v1')));
console.log('external requests:',net.length?net.slice(0,3):'none (fully offline)');
console.log(errs.length?'ERRORS:\n'+[...new Set(errs)].slice(0,8).join('\n'):'no errors');await b.close()})();
