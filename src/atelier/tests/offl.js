const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const root=process.argv[2];let ok=0,bad=0;const T=(c,m)=>{c?ok++:bad++;console.log((c?'PASS ':'FAIL ')+m)};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}
 r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'}[path.extname(f)]||'text/plain','Cache-Control':'max-age=600'});fs.createReadStream(f).pipe(r)}).listen(8767);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const U='http://127.0.0.1:8767/944488/atelier/';await p.goto(U);await p.waitForTimeout(2500);
T(await p.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration())),'offline worker installed');
await p.tap('#obS');await p.fill('#obName','Nejc');await p.fill('#obSur','Lipovšek');await p.tap('#obSt label:has-text("Student")');await p.fill('#obMail','nejc@example.com');await p.tap('#obF button[type=submit]');await p.waitForTimeout(1200);
{const want=(fs.readFileSync(path.join(root,'944488/atelier/sw.js'),'utf8').match(/CACHE='([^']+)'/)||[])[1];T(await p.evaluate(()=>caches.keys()).then(k=>!!want&&want.startsWith('atelier-')&&k.includes(want)),'app saved for offline ('+want+')')}
const mf=await p.evaluate(async()=>(await fetch('manifest.webmanifest')).json());T(mf.name==='Atelier'&&mf.start_url==='./','home-screen manifest');
await ctx.setOffline(true);await p.goto(U).catch(()=>{});await p.waitForTimeout(2300);
T(await p.locator('.ttl').isVisible(),'opens offline with your account');
await p.tap('#tabs a:has-text("Focus")');await p.waitForTimeout(500);T(await p.locator('.clockwrap').isVisible(),'tabs work offline');
T(await p.evaluate(()=>document.fonts.check('16px Newsreader')&&document.fonts.check('20px Caveat')),'fonts work offline');
T(errs.length===0,'no errors'+(errs.length?': '+errs.join(' | '):''));console.log(`${ok} passed, ${bad} failed`);await b.close();srv.close()})();
