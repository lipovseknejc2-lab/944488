/* Boot: load, catch up on the days you were away, welcome first-time makers, start the live feed */
function welcome(){const w=document.createElement('div');w.className='welcome';w.id='welcome';
 w.innerHTML=`<div style="width:min(980px,calc(100vw - 48px));display:grid;grid-template-columns:1.05fr .95fr;gap:0;border:1px solid var(--line);border-radius:24px;overflow:hidden;background:var(--panel);box-shadow:var(--sh-3)">
 <div style="padding:44px 44px 36px;display:flex;flex-direction:column"><div class="row" style="gap:12px">${mark()}<b style="font:600 22px var(--f-display);letter-spacing:-.035em">mintora</b></div>
  <h1 style="font-size:38px;margin:34px 0 10px;letter-spacing:-.04em">Make it. Sell it.<br>Grow it together.</h1><p class="muted" style="margin:0 0 26px;font-size:15px">Mintora is the workshop for digital products: storefronts, sales, analytics, your team and your community in one place. Blueprint lets you build the parts that are only yours.</p>
  <div class="field"><label for="wN">Your name</label><input class="inp" id="wN" value="${esc(S.me.name)}"></div><div class="field"><label for="wW">Studio or brand</label><input class="inp" id="wW" value="${esc(S.workspace.name)}"></div>
  <button class="btn pri lg" id="wGo" style="margin-top:6px">Open my workspace ${ic('arrow','s')}</button><p class="xs faint" style="margin:14px 0 0">The workspace starts with demo products and six months of sample sales so every screen has something to show. Reset it any time in Settings.</p></div>
 <div style="background:#0C2A66;position:relative;overflow:hidden;padding:40px;display:flex;flex-direction:column;justify-content:flex-end;color:#EAF1FF"><div style="position:absolute;inset:0;background-image:linear-gradient(rgba(170,205,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(170,205,255,.08) 1px,transparent 1px),linear-gradient(rgba(170,205,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(170,205,255,.15) 1px,transparent 1px);background-size:14px 14px,14px 14px,70px 70px,70px 70px"></div>
  <div style="position:absolute;right:30px;top:30px;width:230px;height:230px">${bpSchematicMark()}</div>
  <div style="position:relative">${[['dash','Performance score','One number for the health of your shop'],['page','Storefronts','A page for every product, designed by you'],['hub','Hubs','Communities with roles, admins and projects'],['plug','Blueprint','Plugins and designs, from scratch']].map(([i,t,d])=>`<div class="row" style="padding:10px 0;border-top:1px dashed rgba(160,195,255,.25)"><span style="color:#7FE3FF">${ic(i)}</span><div><b style="font:500 14px var(--f-mono)">${t}</b><div style="color:#A8BFE8;font-size:12.5px">${d}</div></div></div>`).join('')}</div></div></div>`;
 document.body.appendChild(w);$('#wN').focus();
 $('#wGo').onclick=()=>{const n=$('#wN').value.trim(),ws=$('#wW').value.trim();if(n)S.me.name=n;if(ws){S.workspace.name=ws;S.workspace.initials=initials(ws)}S.settings.onboarded=true;save();w.style.transition='opacity .4s';w.style.opacity='0';setTimeout(()=>w.remove(),400);render();toast('Welcome to Mintora','spark')}}
function boot(){load();applyTheme();try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(S.settings.theme==='system'){applyTheme();bar()}})}catch(e){}
 catchUpDays();window._noSim=S.settings.notif===false;route=parse(location.hash);render();save();
 setTimeout(()=>{const s=$('#splash');s&&s.classList.add('out');setTimeout(()=>s&&s.remove(),600)},1150);
 if(!S.settings.onboarded)setTimeout(welcome,900);liveSales();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){catchUpDays();save()}});window.addEventListener('beforeunload',save)}
window.addEventListener('error',e=>{console.error(e.error||e.message)});
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
boot();
