// Focus mode: phase switches in normal and Deep mode keep the full layout, the screen stays on during a session, sounds go quiet. Light and dark.
const {chromium,devices}=require('playwright');let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await chromium.launch();
for(const theme of ['light','dark']){
const ctx=await b.newContext({...devices['iPhone 13'],colorScheme:theme});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/manifest|icon|404/.test(m.text()))errs.push(m.text())});
const W=t=>p.waitForTimeout(t),ev=(f,a)=>p.evaluate(f,a);const T=theme+': ';
await p.goto('http://127.0.0.1:8812/atelier.html');await W(1800);await p.click('#obS');await W(300);
await p.fill('#obName','Nejc');await p.fill('#obSur','Lipovsek');await p.fill('#obMail','n@ex.com');await p.click('#obSt label:has-text("Student")');await p.fill('#obRole','Uni');await p.click('#obF button[type=submit]');await W(1600);
await ev(t=>{if(document.querySelector('#modal').classList.contains('open'))closeSheet();S.settings.theme=t;applyTheme&&applyTheme();save()},theme);await W(300);
await ev(()=>go('focus'));await W(600);await p.click('[data-mode=pomo]');await W(200);await p.click('.cbtn.main');await W(900);
const box=()=>ev(()=>{const g=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};return{zen:g('#zen'),zt:g('#zT'),zc:g('#zC'),clock:g('.clockwrap'),ctl:g('.fctl'),vw:innerWidth,vh:innerHeight,docW:document.documentElement.scrollWidth,phase:S.focus.run&&S.focus.run.phase}});
ok(await ev(()=>!!document.querySelector('#awake')&&!document.querySelector('#awake').paused),T+'screen kept on as soon as focus starts (silent video playing)');
// normal mode: several switches
for(let i=0;i<3;i++){await ev(()=>{S.focus.run.endAt=Date.now()+200});await W(1300);const L=await box();
 ok(L.docW===L.vw&&L.clock&&L.clock.x>0&&L.clock.x+L.clock.w<=L.vw,T+`normal mode switch ${i+1} to ${L.phase}: layout full width, clock centred`);
 ok(await ev(()=>!!document.querySelector('#awake')&&!document.querySelector('#awake').paused),T+`screen still kept on after switch ${i+1}`);}
await p.screenshot({path:`n_${theme}.png`});
// deep mode: several switches
await p.click('.zbtn');await W(900);
for(let i=0;i<4;i++){await ev(()=>{S.focus.run.endAt=Date.now()+200});await W(1700);const L=await box();
 ok(L.zen&&L.zen.x===0&&L.zen.y===0&&L.zen.w===L.vw&&L.zen.h===L.vh,T+`Deep mode switch ${i+1} to ${L.phase}: still covers the whole screen (${L.zen&&L.zen.w}x${L.zen&&L.zen.h})`);
 ok(L.zt&&L.zt.x>=0&&L.zt.x+L.zt.w<=L.vw&&L.zt.y>0&&L.zt.y+L.zt.h<L.vh,T+`Deep mode switch ${i+1}: timer fully visible`);
 if(i===0)await p.screenshot({path:`z_${theme}.png`});}
await p.tap('#zen');await W(500);const L2=await box();ok(L2.zc&&L2.zc.y+L2.zc.h<=L2.vh&&L2.zc.x>=0,T+'Deep mode controls fully on screen after switches');
// guided reset open while the phase switches
await ev(()=>{if(S.focus.run.phase==='work'){S.focus.run.endAt=Date.now()+200}});await W(1500);
await ev(()=>openReset('zen'));await W(800);ok(await ev(()=>!!document.querySelector('#rst')),T+'guided reset opens from Deep mode on a break');
await ev(()=>{S.focus.run.endAt=Date.now()+200});await W(1600);await ev(()=>closeReset());await W(700);const L3=await box();
ok(L3.zen&&L3.zen.w===L3.vw&&L3.zen.h===L3.vh,T+'Deep mode intact after a reset during a switch');
ok(await ev(()=>!S.focus.run&&document.querySelector('#zen.done')),T+'the long break ending finishes the session in Deep mode');
ok(await ev(()=>document.querySelector('#awake').paused),T+'screen may sleep once the session is complete');
await p.screenshot({path:`zd_${theme}.png`});
// leave deep mode, pause, stop
await p.click('#zC .zx');await W(700);ok(await ev(()=>!document.querySelector('#zen')),T+'Done closes Deep mode');
await p.click('.cbtn.main');await W(600);await p.click('.zbtn');await W(800);await p.tap('#zen');await W(300);await p.click('#zX');await W(700);ok(await ev(()=>!document.querySelector('#zen')&&S.focus.run&&!document.querySelector('#awake').paused),T+'leaving Deep mode mid-session keeps the screen on');
await p.click('.cbtn.main');await W(300);ok(await ev(()=>S.focus.run.paused&&!document.querySelector('#awake').paused),T+'still on while paused');
await p.click('[aria-label=Stop]');await W(600);ok(await ev(()=>!S.focus.run&&document.querySelector('#awake').paused),T+'screen allowed to sleep again after the session stops');
// setting off
await ev(()=>{S.settings.awake=false;save()});await p.click('.cbtn.main');await W(800);ok(await ev(()=>document.querySelector('#awake').paused),T+'"Keep the screen on" switched off is respected');
await ev(()=>{S.settings.awake=true;save();keepAwake()});await W(400);ok(await ev(()=>!document.querySelector('#awake').paused),T+'switched back on works at once');
await ev(()=>alertsSheet());await W(500);ok(await p.isVisible('text=Keep the screen on'),T+'Alerts sheet has the keep-screen-on switch');await p.screenshot({path:`al_${theme}.png`});await ev(()=>closeSheet());
await ev(()=>go('settings'));await W(500);ok(await p.isVisible('#sAwake'),T+'Settings has the keep-screen-on switch');
ok(await ev(()=>{const v=document.querySelector('#awake').getBoundingClientRect();return v.width<=1&&v.height<=1}),T+'the helper video is invisible');
ok(errs.length===0,T+'no script errors'+(errs.length?': '+[...new Set(errs)].slice(0,4).join(' | '):''));await ctx.close()}
console.log(`\n${pass} passed, ${fail} failed`);await b.close()})();
