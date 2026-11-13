/* Mintora core: state, storage, router, credits and small helpers.
   Saved data: localStorage 'mintora-v1' (and 'mintora-backup'). Bump VERSION and add a step to migrate() when the shape changes. */
'use strict';
const KEY='mintora-v1',BACKUP='mintora-backup',VERSION=1;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=(p='')=>p+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sum=a=>a.reduce((x,y)=>x+y,0);
const DAY=864e5;
const dayKey=t=>{const d=new Date(t);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()};
const startOfDay=t=>{const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()};
/* a seeded random generator, so the demo data is the same for everyone */
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* storage that falls back to memory when blocked */
const LS={m:{},get(k){try{return localStorage.getItem(k)}catch(e){return this.m[k]??null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){this.m[k]=v}},del(k){try{localStorage.removeItem(k)}catch(e){delete this.m[k]}}};
let S=null;
function load(){let raw=LS.get(KEY);let s=null;try{s=raw?JSON.parse(raw):null}catch(e){s=null}
 if(!s){try{const b=LS.get(BACKUP);s=b?JSON.parse(b):null}catch(e){s=null}}
 S=s?migrate(s):seed();if(!s)save()}
function migrate(s){s.v=s.v||1;
 /* future: if(s.v<2){...;s.v=2} */
 const d=DEF();for(const k in d)if(s[k]===undefined)s[k]=d[k];
 s.settings=Object.assign(d.settings,s.settings||{});s.credits=Object.assign(d.credits,s.credits||{});s.bp=Object.assign(d.bp,s.bp||{});
 return s}
let _saveT=0,_backupAt=0;
function save(){try{const j=JSON.stringify(S);LS.set(KEY,j);if(Date.now()-_backupAt>60000){LS.set(BACKUP,j);_backupAt=Date.now()}}catch(e){console.warn('save failed',e)}}
function saveSoon(){clearTimeout(_saveT);_saveT=setTimeout(save,250)}
/* ---- money and numbers ---- */
const CUR={USD:['$',''],EUR:['','€'],GBP:['£','']};
function money(v,{c,dec}={}){c=c||(S&&S.settings.currency)||'USD';const [a,b]=CUR[c]||CUR.USD;const n=Math.abs(v),d=dec??(n<100&&n%1?2:n>=1e4?0:n%1?2:0);
 return(v<0?'−':'')+a+n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})+(b?' '+b:'')}
function short(v){const n=Math.abs(v);return(v<0?'−':'')+(n>=1e6?(n/1e6).toFixed(n>=1e7?0:1)+'M':n>=1e3?(n/1e3).toFixed(n>=1e4?0:1)+'k':Math.round(n)+'')}
const moneyShort=v=>{const [a,b]=CUR[S.settings.currency]||CUR.USD;return a+short(v)+(b?b:'')};
const pct=(v,d=1)=>(v*100).toFixed(d)+'%';
const nfmt=v=>Math.round(v).toLocaleString('en-US');
function ago(t){const s=(Date.now()-t)/1000;if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';if(s<86400*7)return Math.floor(s/86400)+'d ago';return new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
const fdate=t=>new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric',year:new Date(t).getFullYear()!==new Date().getFullYear()?'numeric':undefined});
const ftime=t=>new Date(t).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false});
const plural=(n,w,p)=>`${nfmt(n)} ${n===1?w:(p||w+'s')}`;
/* ---- credits: usage credits pile up with no limit ---- */
const EARN={daily:[50,'Daily check-in'],publish:[100,'Product published'],sale:[0,'Sale'],page:[40,'Storefront published'],roadmap:[10,'Roadmap item'],invite:[30,'Teammate invited'],hub:[60,'Hub created'],plugin:[80,'Plugin published'],design:[40,'Design blueprint saved'],launch:[150,'Project launched'],message:[1,'Message sent']};
function earn(k,amt,why){const e=EARN[k]||[0,k];amt=amt??e[0];if(!amt)return 0;S.credits.balance+=amt;S.credits.earned+=amt;S.credits.log.unshift({at:Date.now(),amt,why:why||e[1]});if(S.credits.log.length>400)S.credits.log.length=400;saveSoon();bumpCredits();return amt}
function spend(amt,why){if(S.credits.balance<amt){toast(`You need ${nfmt(amt-S.credits.balance)} more credits`,'coins');return false}S.credits.balance-=amt;S.credits.spent+=amt;S.credits.log.unshift({at:Date.now(),amt:-amt,why});save();bumpCredits();return true}
function bumpCredits(){const p=$('#credp');if(!p)return;p.querySelector('b').textContent=nfmt(S.credits.balance);p.classList.remove('bump');void p.offsetWidth;p.classList.add('bump')}
/* activity feed */
function act(kind,text,ref){S.activity.unshift({id:uid(),at:Date.now(),kind,text,ref:ref||''});if(S.activity.length>300)S.activity.length=300;saveSoon()}
/* ---- router: in memory, mirrored to the hash when the browser allows it ---- */
let route={k:'dash',a:[]},_navN=0;
const PAGES={};
function parse(h){const p=String(h||'').replace(/^#\/?/,'').split('/').filter(Boolean);return{k:p[0]||'dash',a:p.slice(1)}}
function go(h,{replace}={}){const r=parse(h);route=r;_navN++;try{const target='#/'+[r.k,...r.a].join('/');if(location.hash!==target){replace?history.replaceState(null,'',target):history.pushState(null,'',target)}}catch(e){}render();$('#view')&&($('#view').scrollTop=0)}
window.addEventListener('popstate',()=>{route=parse(location.hash);render()});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||e.metaKey||e.ctrlKey)return;e.preventDefault();go(a.getAttribute('href'))});
let _rendering=false;
function render(){if(_rendering)return;_rendering=true;try{const bp=route.k==='bp';document.body.classList.toggle('bp',bp);
  const P=PAGES[route.k]||PAGES.dash;const t0=performance.now();let html='';
  try{html=P.view(...route.a)}catch(err){console.error(err);html=`<div class="page"><div class="empty"><b>Something went wrong</b><p class="mono sm">${esc(err.message)}</p><a class="btn" href="#/dash">Back to the dashboard</a></div></div>`}
  $('#view').innerHTML=html;side();bar();try{P.after&&P.after(...route.a)}catch(err){console.error(err)}
  window._lastRender=performance.now()-t0}finally{_rendering=false}}
function rerender(){const v=$('#view'),y=v.scrollTop;render();v.scrollTop=y}
/* ---- data shape ---- */
function DEF(){return{v:VERSION,me:{id:'me',name:'Alex Morgan',email:'alex@studio.dev',handle:'alexmorgan',color:'#12C48B'},
 workspace:{name:'Northwind Studio',color:'#12C48B',initials:'NS'},
 settings:{theme:'light',currency:'USD',density:'comfy',onboarded:false,lastDaily:0,notif:true,sound:false},
 products:[],orders:[],customers:[],views:{},reviews:[],roadmap:[],team:[],invites:[],channels:[],hubs:[],activity:[],
 credits:{balance:0,earned:0,spent:0,log:[],perks:{}},
 bp:{license:null,plugins:[],designs:[],logs:[]},
 api:{keys:[],hooks:[],deliveries:[]},notifs:[]}}
