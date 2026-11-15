// Atelier Plugins and Atelier together, served like GitHub Pages (same site): the inbox on one computer, and a real
// round trip through QR codes (drawn by one app, photographed, read by the other), including several codes.
const {chromium}=require('playwright');const U='http://127.0.0.1:8814/';let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const hub=await ctx.newPage();const errs=[];hub.on('pageerror',e=>errs.push('hub: '+e.message));
await hub.goto(U+'atelier-plugins/');await hub.waitForTimeout(700);await hub.fill('#siN','Nejc');await hub.fill('#siE','n@example.com');await hub.click('#siF button[type=submit]');await hub.waitForTimeout(1200);await hub.click('#licOk');await hub.waitForTimeout(400);
await hub.evaluate(()=>useStarter('atelier.coins'));await hub.waitForTimeout(500);await hub.evaluate(()=>{curPl().name='Coins Plus';curPl().graph.nodes.find(n=>n.k==='add').p.amount='15'});
await hub.click('.stbar .btn:has-text("Send to Atelier")');await hub.waitForTimeout(600);await hub.click('#sIn');await hub.waitForTimeout(200);
const app=await ctx.newPage();app.on('pageerror',e=>errs.push('app: '+e.message));await app.setViewportSize({width:390,height:844});await app.goto(U+'atelier/');await app.waitForTimeout(1700);
await app.click('#obS');await app.fill('#obName','Nejc');await app.fill('#obSur','L');await app.fill('#obMail','n@example.com');await app.click('#obSt label:has-text("Working")');await app.fill('#obRole','S');await app.click('#obF button[type=submit]');await app.waitForTimeout(1200);
await app.evaluate(()=>dispatchEvent(new Event('focus')));await app.waitForTimeout(800);
ok(await app.evaluate(()=>S.plugins.some(p=>p.name==='Coins Plus'&&p.graph.nodes.find(n=>n.k==='add').p.amount==='15')),'the hub sends a plugin to Atelier on the same computer');
const read=async(pg,b64)=>pg.evaluate(async b=>{const img=new Image();img.src='data:image/png;base64,'+b;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);const r=jsQR(x.getImageData(0,0,c.width,c.height).data,c.width,c.height);return r&&r.data},b64);
const grab=async(src,sel,dst)=>{const got=new Map();let n=1;for(let i=0;i<60;i++){const t=await read(dst,(await (await src.$(sel)).screenshot()).toString('base64'));if(t){const m=t.match(/^ATQ:\w+:(\d+)\/(\d+):/);if(m){n=+m[2];got.set(m[1],t)}else got.set('1',t)}if(got.size>=n)break;await src.waitForTimeout(350)}return[...got.values()]};
const texts=await grab(hub,'#sQ',app);
ok(texts.length>=2,`the hub drew ${texts.length} QR codes and every one was read`);
const name=await app.evaluate(async L=>{const col=PK.collector();let r;for(const t of L.slice().reverse())r=col.add(t);if(!r.done)return null;return(await PK.decode(r.done)).name},texts);
ok(name==='Coins Plus','Atelier puts the codes together, in any order, into the plugin');
await app.evaluate(()=>go('plugin:atelier.spotlight'));await app.waitForTimeout(400);await app.click('.plhero .btn:has-text("Show code")');await app.waitForTimeout(600);
const back=await grab(app,'.plqr',hub);await hub.evaluate(()=>closeModal());
await hub.evaluate(async L=>{const col=PK.collector();let r;for(const t of L)r=col.add(t);addImported(await PK.decode(r.done))},back);await hub.waitForTimeout(400);ok(await hub.evaluate(()=>curPl()&&curPl().name==='Spotlight'),'the hub imports a plugin from codes Atelier shows');
ok(errs.length===0,'no script errors'+(errs.length?': '+errs.join(' | '):''));await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();
