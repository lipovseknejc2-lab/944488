/* ============ Atelier Plugins kit ============
   Shared by Atelier (the app) and Atelier Plugins (the hub). One file, built into both, so a plugin behaves the
   same in the hub's test bench and in a real group.
   A plugin: {f:'atelier-plugin',v:1,id,name,desc,pic:{k}|{img},size:'small'|'big',author,ver,mode:'nodes'|'code',
              graph:{nodes:[{id,k,x,y,p}],links:[{id,a,ap,b}]},code,made,up}
   Plugins never touch the app directly. They run against a snapshot of the group and return a list of actions
   (post, react, pin, give a role, copy a file, make a channel, notice) that the app applies. Coded plugins run
   in a sealed sandbox (an iframe with no origin and no network, and a worker inside it when the browser allows). */
const PK={};
PK.VER=1;
/* ---- starters: what a plugin listens for ---- */
PK.TRIG=['join','message','keyword','command','reaction','daily','timer','file','role','install'];
/* ---- the node catalogue: [category, label, icon path, description, outputs, params] ---- */
PK.CATS=[['start','Starters','var(--accent)'],['act','Actions','var(--blue)'],['logic','Logic','var(--violet)'],['data','Data and economy','var(--yellow)'],['files','Files and roles','var(--green)']];
const _P=(k,l,t='text',def='',o)=>({k,l,t,def,o});
const WHO=[['user','Who did it'],['picked','Picked member'],['author','Message author'],['arg','Name in the command'],['me','The owner']];
PK.NODES={
 join:{c:'start',l:'Member joins',i:'M9 11a3.4 3.4 0 1 0 0-6.8a3.4 3.4 0 1 0 0 6.8M3 20c.5-3.5 3-5.6 6-5.6s5.5 2.1 6 5.6M18 8v6M15 11h6',d:'Someone is added to the group.',o:['next'],p:[]},
 message:{c:'start',l:'Message sent',i:'M4 5.5h16v10H9l-5 4z',d:'Any message in a channel.',o:['next'],p:[_P('ch','Only in channel','text','')]},
 keyword:{c:'start',l:'Message contains',i:'M10.5 17a6.5 6.5 0 1 0 0-13a6.5 6.5 0 1 0 0 13M15.3 15.3L20.5 20.5',d:'A message with a word or phrase.',o:['next'],p:[_P('word','Words (comma between)','text','hello, hi'),_P('ch','Only in channel','text','')]},
 command:{c:'start',l:'Command',i:'M4 17l6-5l-6-5M12 19h8',d:'Someone types /name with words after it.',o:['next'],p:[_P('name','Command name','text','hello')]},
 reaction:{c:'start',l:'Reaction added',i:'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',d:'Someone reacts to a message.',o:['next'],p:[_P('key','Reaction','react','')]},
 daily:{c:'start',l:'First message of the day',i:'M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4M12 15.5a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7',d:'Once a day for each member, on their first message.',o:['next'],p:[]},
 timer:{c:'start',l:'Every few minutes',i:'M12 20.5a8 8 0 1 0 0-16a8 8 0 1 0 0 16M12 8.5V12.5L14.8 14.2',d:'Runs on a clock while Atelier is open.',o:['next'],p:[_P('mins','Every (minutes)','num',60)]},
 file:{c:'start',l:'File shared',i:'M7 3.5h7l4 4v13H7zM14 3.5V7.5H18',d:'A file or photo is shared.',o:['next'],p:[]},
 role:{c:'start',l:'Role given',i:'M12 3.2L19 6v5.4c0 4.4-3 7.7-7 9.4c-4-1.7-7-5-7-9.4V6z',d:'Someone gets a role.',o:['next'],p:[_P('role','Role (empty = any)','text','')]},
 install:{c:'start',l:'Plugin added',i:'M9 3.5V8M15 3.5V8M6.5 8h11v3.2a5.5 5.5 0 0 1-11 0zM12 16.7v4.1',d:'The plugin is added to a group.',o:['next'],p:[]},
 send:{c:'act',l:'Send message',i:'M4.5 12L19.5 5L16 19.5L11.5 13.5zM11.5 13.5L19.5 5',d:'Post in a channel as the plugin.',o:['next'],p:[_P('ch','Channel (empty = same)','text',''),_P('text','Message','long','Hello {user}!')]},
 reply:{c:'act',l:'Reply',i:'M9 8L4 12.5L9 17M4.5 12.5H14a6 6 0 0 1 6 6',d:'Answer in the same channel.',o:['next'],p:[_P('text','Message','long','Thanks, {user}.')]},
 card:{c:'act',l:'Send a widget',i:'M4 5.5h16v13H4zM7.5 9h5M7.5 15.5h3M14.5 12.5h3v3h-3z',d:'Posts a widget card: a title, a big value and a line of text.',o:['next'],p:[_P('ch','Channel (empty = same)','text',''),_P('title','Title','text','Balance'),_P('value','Big value','text','{coins}'),_P('unit','Under the value','text','coins'),_P('text','Text','long','{user}'),_P('tone','Colour','select','accent',[['accent','Clay'],['yellow','Gold'],['green','Green'],['blue','Blue'],['violet','Violet'],['red','Red']])]},
 react:{c:'act',l:'React',i:'M12 20.5a8.5 8.5 0 1 0 0-17a8.5 8.5 0 1 0 0 17M8.5 14c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2M9 9.5v.5M15 9.5v.5',d:'Add a reaction to the message.',o:['next'],p:[_P('key','Reaction','react','star')]},
 pin:{c:'act',l:'Pin message',i:'M14.5 4L20 9.5M15.5 5L9.6 9.2L6.4 9.6L14.4 17.6L14.8 14.4L19 8.5M10 14L4 20',d:'Pin the message to the top.',o:['next'],p:[]},
 notify:{c:'act',l:'Show a notice',i:'M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5L19 18H5zM10 20.5h4',d:'A short notice on screen.',o:['next'],p:[_P('text','Notice','text','{user} did something')]},
 mkchannel:{c:'act',l:'Make a channel',i:'M9.6 4.2L7.6 19.8M16.4 4.2L14.4 19.8M4.6 9H19.8M4 15H19.2',d:'Creates a channel if it is missing.',o:['next'],p:[_P('name','Name','text','winners'),_P('type','Type','select','talk',[['talk','Talk'],['announce','Announcements'],['files','Files'],['ideas','Ideas']])]},
 if:{c:'logic',l:'If',i:'M6 4v6a4 4 0 0 0 4 4h8M14 10l4 4l-4 4M6 20v-6',d:'Compare two values.',o:['yes','no'],p:[_P('a','Value','text','{coins}'),_P('op','Is','select','>=',[['=','equal to'],['!=','not equal to'],['>','more than'],['<','less than'],['>=','at least'],['<=','at most'],['has','contains']]),_P('b','Than','text','10')]},
 chance:{c:'logic',l:'Chance',i:'M5 5h14v14H5zM9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01',d:'Goes yes some of the time.',o:['yes','no'],p:[_P('pct','Chance (%)','num',50)]},
 cooldown:{c:'logic',l:'Cooldown',i:'M7 3.5h10M7 20.5h10M8 3.5c0 4.5 8 4.5 8 8.5s-8 4-8 8.5M16 3.5c0 4.5-8 4.5-8 8.5',d:'Only once per period.',o:['yes','no'],p:[_P('per','Once per','select','day',[['day','day'],['hour','hour'],['min','few minutes']]),_P('mins','Minutes (for few minutes)','num',10),_P('who','For','select','user',[['user','each member'],['group','the whole group']])]},
 hasrole:{c:'logic',l:'Has role',i:'M12 3.2L19 6v5.4c0 4.4-3 7.7-7 9.4c-4-1.7-7-5-7-9.4V6zM9 12l2 2l4-4',d:'Checks a member for a role.',o:['yes','no'],p:[_P('who','Member','select','user',WHO),_P('role','Role','text','Leader')]},
 pick:{c:'logic',l:'Pick a member',i:'M12 20.5a8.5 8.5 0 1 0 0-17a8.5 8.5 0 1 0 0 17M12 15.5a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7M12 12h.01',d:'Chooses someone at random: {picked}.',o:['next'],p:[_P('from','From','select','all',[['all','everyone'],['people','people only'],['role','members with a role'],['top','the top of a value']]),_P('role','Role or value name','text','coins'),_P('notme','Not who did it','bool',false)]},
 wait:{c:'logic',l:'Wait',i:'M12 20.5a8 8 0 1 0 0-16a8 8 0 1 0 0 16M12 8v4h3',d:'Pause before going on.',o:['next'],p:[_P('s','Seconds','num',3)]},
 random:{c:'logic',l:'Random number',i:'M4 7h4l8 10h4M4 17h4l2.5-3M14 10l2-3h4M18 5l2 2l-2 2M18 15l2 2l-2 2',d:'Saves a random number as {name}.',o:['next'],p:[_P('name','Save as','text','roll'),_P('min','From','num',1),_P('max','To','num',6)]},
 text:{c:'logic',l:'Make text',i:'M5 6h14M12 6v13M9 19h6',d:'Builds text and saves it as {name}.',o:['next'],p:[_P('name','Save as','text','line'),_P('value','Text','long','{user} has {coins} coins')]},
 add:{c:'data',l:'Add to value',i:'M12 20.5a8.5 8.5 0 1 0 0-17a8.5 8.5 0 1 0 0 17M12 8v8M8 12h8',d:'Adds (or takes, with a minus) to a number, like coins.',o:['next'],p:[_P('name','Value','text','coins'),_P('amount','Amount','text','10'),_P('who','For','select','user',WHO.concat([['group','The whole group']]))]},
 set:{c:'data',l:'Set value',i:'M5 8h14M5 16h14',d:'Sets a value for a member or the group.',o:['next'],p:[_P('name','Value','text','level'),_P('value','To','text','1'),_P('who','For','select','user',WHO.concat([['group','The whole group']]))]},
 board:{c:'data',l:'Leaderboard',i:'M5 20V12h4v8M10 20V6h4v14M15 20V9h4v11',d:'Ranks members by a value: {leaderboard}.',o:['next'],p:[_P('name','Value','text','coins'),_P('n','How many','num',5)]},
 giverole:{c:'files',l:'Give role',i:'M12 3.2L19 6v5.4c0 4.4-3 7.7-7 9.4c-4-1.7-7-5-7-9.4V6zM12 8.5v6M9 11.5h6',d:'Gives a role, made if missing.',o:['next'],p:[_P('who','Member','select','user',WHO),_P('role','Role','text','Leader')]},
 takerole:{c:'files',l:'Take role',i:'M12 3.2L19 6v5.4c0 4.4-3 7.7-7 9.4c-4-1.7-7-5-7-9.4V6zM9 11.5h6',d:'Takes a role away.',o:['next'],p:[_P('who','Member','select','user',WHO),_P('role','Role','text','Leader')]},
 summarize:{c:'files',l:'Describe file',i:'M7 3.5h7l4 4v13H7zM10 11h5M10 14h5M10 17h3',d:'Saves a short description as {summary}.',o:['next'],p:[]},
 copyfile:{c:'files',l:'Copy file to channel',i:'M8 8h11v12H8zM5 16V4h11',d:'Files the shared file in another channel.',o:['next'],p:[_P('ch','Channel','text','files')]}};
PK.ORDER=Object.keys(PK.NODES);
/* the reactions of Atelier: drawn, not typed. [key,label,colour,svg] */
PK.REACTS=[['love','Love','var(--red)','<path class="f" d="M12 19.6C6.8 16.2 3.8 13.2 3.8 9.6C3.8 7.2 5.7 5.3 8 5.3C9.7 5.3 11.1 6.2 12 7.6C12.9 6.2 14.3 5.3 16 5.3C18.3 5.3 20.2 7.2 20.2 9.6C20.2 13.2 17.2 16.2 12 19.6Z"/><path class="s" d="M8.2 8.4C7.4 8.6 6.8 9.2 6.6 10"/>'],
 ['like','Like','var(--yellow)','<path class="f" d="M8 10.6L11.3 4.6C11.7 3.9 12.6 3.8 13.2 4.3C13.7 4.8 13.8 5.5 13.6 6.2L12.8 9.4H18C19.3 9.4 20.2 10.6 19.9 11.8L18.6 17.6C18.4 18.6 17.5 19.3 16.5 19.3H8Z"/><path class="s" d="M4.3 10.4H8V19.4H4.3Z"/>'],
 ['haha','Haha','var(--yellow)','<circle class="f" cx="12" cy="12" r="8.4"/><path class="s" d="M7.8 9.8L9.2 8.8L10.4 9.9M13.6 9.9L14.8 8.8L16.2 9.8M7.8 13.2H16.2C15.8 15.6 14.1 17 12 17S8.2 15.6 7.8 13.2Z"/>'],
 ['wow','Wow','var(--yellow)','<circle class="f" cx="12" cy="12" r="8.4"/><path class="s" d="M9 9.6V10.2M15 9.6V10.2M12 17.2A2 2.4 0 1 0 12 12.4A2 2.4 0 1 0 12 17.2"/>'],
 ['sad','Sad','var(--blue)','<circle class="f" cx="12" cy="12" r="8.4"/><path class="s" d="M9 10V10.6M15 10V10.6M9 16.2C9.8 15.2 10.8 14.7 12 14.7S14.2 15.2 15 16.2M16.6 12.4C17.4 13.6 17.6 14.6 16.8 15.2C16 15.6 15.4 14.8 15.8 13.8Z"/>'],
 ['star','Star','var(--yellow)','<path class="f" d="M12 3.8L14.4 9L20 9.6L15.8 13.3L17 18.9L12 16L7 18.9L8.2 13.3L4 9.6L9.6 9Z"/>'],
 ['done','Done','var(--green)','<rect class="f" x="4" y="4" width="16" height="16" rx="5"/><path class="s" d="M8.2 12.3L10.8 14.8L15.9 9.3"/>'],
 ['idea','Idea','var(--yellow)','<path class="f" d="M9.4 16.2C7.6 15 6.6 13.2 6.6 11.2C6.6 8.2 9 5.8 12 5.8S17.4 8.2 17.4 11.2C17.4 13.2 16.4 15 14.6 16.2V17.6H9.4Z"/><path class="s" d="M10 20.2H14M12 2.4V3.4M4.6 5.6L5.4 6.4M19.4 5.6L18.6 6.4"/>'],
 ['coin','Coin','var(--yellow)','<circle class="f" cx="12" cy="12" r="8.2"/><path class="s" d="M12 17.4A5.4 5.4 0 1 0 12 6.6M12 9.2V14.8M10.2 10.6C10.6 9.8 11.2 9.4 12 9.4C13 9.4 13.8 10 13.8 10.9C13.8 13 10.2 12.1 10.2 13.9C10.2 14.8 11 15.2 12 15.2C12.9 15.2 13.5 14.8 13.9 14"/>'],
 ['spark','Spark','var(--accent)','<path class="f" d="M12.6 3.6C13 7.4 16.8 9.4 16.8 13.6C16.8 17 14.6 19.8 12 19.8S7.2 17.4 7.2 14.4C7.2 12.4 8.2 11 9.4 10C9.6 11.6 10.4 12.6 11.4 12.8C11 9.6 11.4 6.2 12.6 3.6Z"/><path class="s" d="M12.2 17.4C11 17.2 10.2 16.2 10.4 15"/>']];
PK.RX=Object.fromEntries(PK.REACTS.map(r=>[r[0],r]));
PK.rxSvg=k=>{const r=PK.RX[k];return r?`<svg class="rxi" viewBox="0 0 24 24" style="--rf:${r[2]}" aria-hidden="true">${r[3]}</svg>`:''};
PK.rxHtml=k=>k.startsWith('u:')?`<span class="rxu">${String(k.slice(2)).replace(/[<>&"]/g,'')}</span>`:PK.rxSvg(k);
/* pictures for plugins without their own: [key, colour, drawing] */
PK.PICS=[['spark','var(--accent)','M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.6 2.6M15.4 15.4L18 18M6 18l2.6-2.6M15.4 8.6L18 6'],['coin','var(--yellow)','M12 20a8 8 0 1 0 0-16a8 8 0 1 0 0 16M12 8v8M9.8 10c.4-.8 1.2-1.2 2.2-1.2c1.2 0 2 .7 2 1.6c0 2.2-4.2 1.3-4.2 3.4c0 .9.9 1.4 2.2 1.4c1 0 1.8-.4 2.2-1.2'],
 ['wave','var(--blue)','M3 14c2.5-4 4.5-4 7 0s4.5 4 7 0c1-1.6 2-2.4 4-2.4M3 9c2.5-4 4.5-4 7 0'],['gear','var(--violet)','M12 15a3 3 0 1 0 0-6a3 3 0 1 0 0 6M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8'],
 ['bell','var(--accent)','M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5L19 18H5zM10 20.5h4'],['leaf','var(--green)','M5 19C5 10 10 5 19 5C19 14 14 19 5 19ZM5 19L13 11'],['bolt','var(--yellow)','M13 3L5 13.5h6L10 21l8-10.5h-6z'],['book','var(--blue)','M4.5 5.5c2.6-1 5-1 7.5.5c2.5-1.5 4.9-1.5 7.5-.5v13c-2.6-1-5-1-7.5.5c-2.5-1.5-4.9-1.5-7.5-.5zM12 6v13'],
 ['crown','var(--yellow)','M4.5 17.5L3.6 7.8L8.6 11.4L12 5.2L15.4 11.4L20.4 7.8L19.5 17.5ZM5 20.5H19'],['chat','var(--green)','M4 5.5h16v10H9l-5 4z'],['files','var(--green)','M3.5 7.5V18.5H20.5V9H11.5L9.5 6.5H3.5Z'],['shield','var(--violet)','M12 3.2L19 6v5.4c0 4.4-3 7.7-7 9.4c-4-1.7-7-5-7-9.4V6z']];
PK.picHtml=(pl,cls='')=>{const p=pl&&pl.pic||{};if(p.img&&/^data:image\/(png|jpeg|webp);base64,/.test(p.img))return`<span class="pkpic img ${cls}"><img src="${p.img}" alt=""></span>`;const d=PK.PICS.find(x=>x[0]===p.k)||PK.PICS[0];
 return`<span class="pkpic ${cls}" style="--pc:${d[1]}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d[2]}"/></svg></span>`};
PK.esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---- the engine. Kept inside one function so the sandbox can be given the very same code. ---- */
function pkCore(){
 const P='atelier-plugin';
 const num=v=>{const n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:0};
 function makeApi(ev,snap,store,out){store.g=store.g||{};store.m=store.m||{};const tmp={};let picked=null;
  const mem=id=>snap.members.find(x=>x.id===id);
  const byName=n=>{n=String(n||'').replace(/^@/,'').toLowerCase().trim();if(!n)return null;return snap.members.find(x=>x.name.toLowerCase()===n)||snap.members.find(x=>x.name.toLowerCase().split(' ')[0]===n)||snap.members.find(x=>x.name.toLowerCase().startsWith(n))};
  const whoId=w=>w==='picked'?picked&&picked.id:w==='author'?ev.author&&ev.author.id:w==='arg'?(byName((ev.args||[])[0])||{}).id:w==='me'?snap.me:ev.user&&ev.user.id;
  const chId=n=>{n=String(n||'').replace(/^#/,'').trim().toLowerCase();if(!n||n==='here'||n==='same')return ev.ch?ev.ch.id:((snap.channels.find(c=>c.type==='talk')||snap.channels[0])||{}).id;const c=snap.channels.find(c=>c.name.toLowerCase()===n);return c?c.id:(ev.ch?ev.ch.id:null)};
  const mv=(id,name)=>{const o=store.m[id]||{};return o[name]};
  const fill=t=>String(t==null?'':t).replace(/\{([a-z0-9_.]+)\}/gi,(m,k)=>{const L=k.toLowerCase(),a=ev.args||[];
   if(L==='user')return ev.user?ev.user.name.split(' ')[0]:'';if(L==='user.full')return ev.user?ev.user.name:'';if(L==='author')return ev.author?ev.author.name.split(' ')[0]:'';if(L==='picked')return picked?picked.name.split(' ')[0]:'';
   if(L==='channel')return ev.ch?ev.ch.name:'';if(L==='group')return snap.group?snap.group.name:'';if(L==='text')return ev.text||'';if(L==='command')return ev.cmd||'';if(L==='args')return a.join(' ');
   const am=L.match(/^arg(\d)$/);if(am)return a[+am[1]-1]||'';if(L==='file')return ev.file?ev.file.name:'';if(L==='file.type')return ev.file?ev.file.kind:'';if(L==='file.size')return ev.file?ev.file.sizeText:'';if(L==='file.words')return ev.file?String(ev.file.words||0):'';
   if(L==='reaction')return ev.reaction?ev.reaction.label||'':'';if(L==='role')return ev.role?ev.role.name:'';if(L==='members')return String(snap.members.length);
   const d=new Date(ev.now||Date.now());if(L==='date')return d.toLocaleDateString('en-GB',{day:'numeric',month:'long'});if(L==='time')return d.toTimeString().slice(0,5);if(L==='day')return d.toLocaleDateString('en-GB',{weekday:'long'});
   if(L in tmp)return String(tmp[L]);const dm=L.match(/^(picked|author|group|user)\.(.+)$/);if(dm){if(dm[1]==='group')return String(store.g[dm[2]]??0);const id=dm[1]==='picked'?picked&&picked.id:dm[1]==='author'?ev.author&&ev.author.id:ev.user&&ev.user.id;return String(mv(id,dm[2])??0)}
   const u=ev.user&&mv(ev.user.id,L);if(u!==undefined)return String(u);if(L in store.g)return String(store.g[L]);return/^[a-z]+$/.test(L)&&ev.user?'0':''});
  const api={event:ev,members:snap.members,channels:snap.channels,group:snap.group,tmp,fill,
   get picked(){return picked},
   reply(text){out.actions.push({t:'send',ch:chId(''),text:fill(text),at:out.t});return api},
   card(o={}){out.actions.push({t:'send',ch:chId(o.ch||''),text:fill(o.text||''),card:{title:fill(o.title||''),value:fill(o.value==null?'':o.value),unit:fill(o.unit||''),tone:['accent','yellow','green','blue','violet','red'].includes(o.tone)?o.tone:'accent'},at:out.t});return api},
   send(ch,text){if(text===undefined){text=ch;ch=''}out.actions.push({t:'send',ch:chId(ch),text:fill(text),at:out.t});return api},
   react(key){if(ev.msg)out.actions.push({t:'react',ch:ev.ch&&ev.ch.id,msg:ev.msg.id,key:String(key||'star'),at:out.t});return api},
   pin(){if(ev.msg)out.actions.push({t:'pin',ch:ev.ch&&ev.ch.id,msg:ev.msg.id,at:out.t});return api},
   notify(text){out.actions.push({t:'notify',text:fill(text),at:out.t});return api},
   giveRole(who,role){const id=whoId(who||'user'),r=fill(role).trim();if(id&&r){out.actions.push({t:'role',who:id,role:r,on:true,at:out.t});const m=mem(id);if(m&&!m.roles.includes(r))m.roles.push(r)}return api},
   takeRole(who,role){const id=whoId(who||'user'),r=fill(role).trim();if(id&&r){out.actions.push({t:'role',who:id,role:r,on:false,at:out.t});const m=mem(id);if(m)m.roles=m.roles.filter(x=>x.toLowerCase()!==r.toLowerCase())}return api},
   hasRole(who,role){const m=mem(whoId(who||'user')),r=fill(role).toLowerCase().trim();return!!m&&m.roles.some(x=>x.toLowerCase()===r)},
   makeChannel(name,type){const n=fill(name).toLowerCase().replace(/[^a-z0-9čšž]+/g,'-').replace(/^-|-$/g,'')||'channel';if(!snap.channels.some(c=>c.name===n)){snap.channels.push({id:'new:'+n,name:n,type:type||'talk'});out.actions.push({t:'mkch',name:n,type:type||'talk',at:out.t})}return api},
   copyFile(ch){if(ev.file&&ev.msg){const to=chId(ch);if(to&&(!ev.ch||to!==ev.ch.id))out.actions.push({t:'copy',ch:to,from:ev.ch&&ev.ch.id,msg:ev.msg.id,at:out.t})}return api},
   summarize(){const f=ev.file;let s='';if(f){s=`${f.name}: ${f.kind}, ${f.sizeText}`;if(f.words)s+=`, about ${f.words} words`;if(f.lines)s+=`, ${f.lines} lines`;if(f.first)s+=`. It starts: "${f.first.slice(0,90)}${f.first.length>90?'…':''}"`;s+='.'}tmp.summary=s;return s},
   get(name,who,scope){if(scope==='group'||who==='group')return store.g[name]??0;return mv(whoId(who||'user'),name)??0},
   set(name,value,who,scope){const v=typeof value==='string'?fill(value):value,val=isFinite(parseFloat(v))&&String(v).trim()!==''&&!/[a-z]/i.test(String(v))?num(v):v;if(scope==='group'||who==='group'){store.g[name]=val;return api}const id=whoId(who||'user');if(id){store.m[id]=store.m[id]||{};store.m[id][name]=val}return api},
   add(name,amount,who,scope){const a=num(typeof amount==='string'?fill(amount):amount);if(scope==='group'||who==='group'){store.g[name]=num(store.g[name])+a;return api}const id=whoId(who||'user');if(id){store.m[id]=store.m[id]||{};store.m[id][name]=num(store.m[id][name])+a}return api},
   pick(o={}){let L=snap.members.slice();if(o.from==='people')L=L.filter(m=>!m.bot||m.id===snap.me);if(o.from==='role'){const r=String(o.role||'').toLowerCase();L=L.filter(m=>m.roles.some(x=>x.toLowerCase()===r))}if(o.notMe&&ev.user)L=L.filter(m=>m.id!==ev.user.id);
    if(o.from==='top'){const n=o.role||'coins';L.sort((a,b)=>num(mv(b.id,n))-num(mv(a.id,n)));picked=L[0]||null}else picked=L.length?L[Math.floor(Math.random()*L.length)]:null;return picked},
   chance(p){return Math.random()*100<num(p)},
   cooldown(key,per,mins,who){const span=per==='hour'?36e5:per==='min'?Math.max(1,num(mins))*6e4:0,now=ev.now||Date.now(),day=new Date(now).toDateString(),k='_cd_'+key+(who==='group'?'':'_'+(ev.user&&ev.user.id));const last=store.g[k];
    const ok=span?(!last||now-last>=span):last!==day;if(ok)store.g[k]=span?now:day;return ok},
   wait(s){out.t+=Math.max(0,Math.min(30,num(s)))*1000;return api},
   random(name,min,max){const a=Math.ceil(num(min)),b=Math.floor(num(max));const v=a+Math.floor(Math.random()*(Math.max(a,b)-a+1));tmp[String(name).toLowerCase()]=v;return v},
   text(name,value){tmp[String(name).toLowerCase()]=fill(value);return tmp[String(name).toLowerCase()]},
   leaderboard(name,n){const L=snap.members.map(m=>({m,v:num(mv(m.id,name))})).sort((a,b)=>b.v-a.v).slice(0,Math.max(1,num(n)||5));const s=L.map((x,i)=>`${i+1}. ${x.m.name.split(' ')[0]}: ${x.v}`).join('\n');tmp.leaderboard=s;return s}};
  return api}
 /* when does a starter fire for this event */
 function matches(node,ev,store){const p=node.p||{};if(node.k!==ev.k)return false;const chOk=()=>!p.ch||!ev.ch||String(p.ch).replace(/^#/,'').toLowerCase()===ev.ch.name.toLowerCase();
  switch(node.k){case'message':return chOk();case'keyword':{const t=String(ev.text||'').toLowerCase();return chOk()&&String(p.word||'').split(',').map(w=>w.trim().toLowerCase()).filter(Boolean).some(w=>t.includes(w))}
   case'command':return String(p.name||'').replace(/^\//,'').toLowerCase()===String(ev.cmd||'').toLowerCase();case'reaction':return!p.key||p.key===ev.reaction?.key;case'role':return!p.role||String(p.role).toLowerCase()===String(ev.role?.name||'').toLowerCase();
   case'timer':{const k='_t_'+node.id,now=ev.now||Date.now(),span=Math.max(1,Number(p.mins)||60)*6e4;if(store.g[k]&&now-store.g[k]<span)return false;store.g[k]=now;return true}}return true}
 /* one node, run through the same API a coded plugin uses */
 function step(n,api,ev){const p=n.p||{},cmp=(a,op,b)=>{const x=api.fill(a),y=api.fill(b),nx=parseFloat(x),ny=parseFloat(y),bn=isFinite(nx)&&isFinite(ny);
   switch(op){case'=':return bn?nx===ny:x.toLowerCase()===y.toLowerCase();case'!=':return bn?nx!==ny:x.toLowerCase()!==y.toLowerCase();case'>':return bn&&nx>ny;case'<':return bn&&nx<ny;case'>=':return bn&&nx>=ny;case'<=':return bn&&nx<=ny;case'has':return x.toLowerCase().includes(y.toLowerCase())}return false};
  switch(n.k){case'send':api.send(p.ch||'',p.text);break;case'card':api.card(p);break;case'reply':api.reply(p.text);break;case'react':api.react(p.key);break;case'pin':api.pin();break;case'notify':api.notify(p.text);break;
   case'mkchannel':api.makeChannel(p.name,p.type);break;case'if':return cmp(p.a,p.op,p.b)?'yes':'no';case'chance':return api.chance(p.pct)?'yes':'no';case'cooldown':return api.cooldown(n.id,p.per,p.mins,p.who)?'yes':'no';
   case'hasrole':return api.hasRole(p.who,p.role)?'yes':'no';case'pick':api.pick({from:p.from,role:p.role,notMe:!!p.notme});if(!api.picked)return'stop';break;case'wait':api.wait(p.s);break;case'random':api.random(p.name,p.min,p.max);break;case'text':api.text(p.name,p.value);break;
   case'add':api.add(p.name,p.amount,p.who);break;case'set':api.set(p.name,p.value,p.who);break;case'board':api.leaderboard(p.name,p.n);break;case'giverole':api.giveRole(p.who,p.role);break;case'takerole':api.takeRole(p.who,p.role);break;
   case'summarize':api.summarize();break;case'copyfile':api.copyFile(p.ch);break}return'next'}
 function runGraph(pl,ev,snap,store){const out={actions:[],trace:[],t:0},api=makeApi(ev,snap,store,out),G=pl.graph||{nodes:[],links:[]};let steps=0;
  const walk=id=>{const n=G.nodes.find(x=>x.id===id);if(!n||++steps>400)return;let port='next';try{port=step(n,api,ev)}catch(e){out.trace.push({id,err:String(e.message||e)});return}out.trace.push({id,port});
   G.links.filter(l=>l.a===id&&(l.ap||'next')===port).forEach(l=>walk(l.b))};
  G.nodes.filter(n=>PK_TRIG_SET.has(n.k)&&matches(n,ev,store)).forEach(n=>{out.trace.push({id:n.id,port:'next'});G.links.filter(l=>l.a===n.id).forEach(l=>walk(l.b))});
  return{actions:out.actions,store,trace:out.trace}}
 const PK_TRIG_SET=new Set(['join','message','keyword','command','reaction','daily','timer','file','role','install']);
 /* a coded plugin: on(kind, filter, handler). Handlers get the same API the nodes use. */
 async function runCode(code,ev,snap,store){const out={actions:[],trace:[],t:0},api=makeApi(ev,snap,store,out),H=[];let tid=0;
  const on=(k,f,fn)=>{if(typeof f==='function'){fn=f;f={}}H.push({id:'c'+(tid++),k,p:f||{},fn})};
  const fn=new Function('on','atelier','"use strict";\n'+code);fn(on,{version:1});
  for(const h of H){if(matches({id:h.id,k:h.k,p:h.p},ev,store)){out.trace.push({id:h.id,port:'next'});await h.fn(api)}}
  return{actions:out.actions,store,trace:out.trace}}
 return{makeApi,matches,runGraph,runCode,step}}
PK.core=pkCore();

/* ---- turning a graph into code: the nodes write the program for you ---- */
PK.gen=function(pl){const G=pl.graph||{nodes:[],links:[]},q=s=>JSON.stringify(String(s??'')),L=[],seen=new Set();
 const W=n=>{const p=n.p||{};switch(n.k){case'send':return`a.send(${q(p.ch||'here')}, ${q(p.text)})`;case'reply':return`a.reply(${q(p.text)})`;case'card':return`a.card({ ch: ${q(p.ch||'')}, title: ${q(p.title)}, value: ${q(p.value)}, unit: ${q(p.unit)}, text: ${q(p.text)}, tone: ${q(p.tone||'accent')} })`;case'react':return`a.react(${q(p.key)})`;case'pin':return'a.pin()';case'notify':return`a.notify(${q(p.text)})`;
  case'mkchannel':return`a.makeChannel(${q(p.name)}, ${q(p.type)})`;case'pick':return`if (!a.pick({ from: ${q(p.from)}, role: ${q(p.role)}, notMe: ${!!p.notme} })) return`;case'wait':return`a.wait(${+p.s||0})`;case'random':return`a.random(${q(p.name)}, ${+p.min||0}, ${+p.max||0})`;case'text':return`a.text(${q(p.name)}, ${q(p.value)})`;
  case'add':return`a.add(${q(p.name)}, ${q(p.amount)}, ${q(p.who)})`;case'set':return`a.set(${q(p.name)}, ${q(p.value)}, ${q(p.who)})`;case'board':return`a.leaderboard(${q(p.name)}, ${+p.n||5})`;case'giverole':return`a.giveRole(${q(p.who)}, ${q(p.role)})`;case'takerole':return`a.takeRole(${q(p.who)}, ${q(p.role)})`;
  case'summarize':return'a.summarize()';case'copyfile':return`a.copyFile(${q(p.ch)})`}return`// ${n.k}`};
 const cond=n=>{const p=n.p||{};switch(n.k){case'if':return`compare(a.fill(${q(p.a)}), ${q(p.op)}, a.fill(${q(p.b)}))`;case'chance':return`a.chance(${+p.pct||0})`;case'cooldown':return`a.cooldown(${q(n.id)}, ${q(p.per)}, ${+p.mins||0}, ${q(p.who)})`;case'hasrole':return`a.hasRole(${q(p.who)}, ${q(p.role)})`}};
 const body=(id,port,ind,depth)=>{const out=[];G.links.filter(l=>l.a===id&&(l.ap||'next')===port).forEach(l=>{const n=G.nodes.find(x=>x.id===l.b);if(!n||depth>40)return;const pad='  '.repeat(ind);
   if(PK.NODES[n.k]?.o.length===2){out.push(`${pad}if (${cond(n)}) {`,...body(n.id,'yes',ind+1,depth+1),`${pad}} else {`,...body(n.id,'no',ind+1,depth+1),`${pad}}`)}else{out.push(pad+W(n));out.push(...body(n.id,'next',ind,depth+1))}});return out};
 L.push(`// ${pl.name||'Plugin'}: written by the nodes. Edit it as code to go further.`);let usesCmp=false;
 G.nodes.filter(n=>PK.NODES[n.k]?.c==='start').forEach(n=>{const p=n.p||{},f=Object.keys(p).length?' '+JSON.stringify(p)+',':'';const b=body(n.id,'next',1,0);if(b.some(x=>x.includes('compare(')))usesCmp=true;L.push('',`on(${q(n.k)},${f} a => {`,...(b.length?b:['  // nothing connected yet']),'})')});
 if(usesCmp)L.push('','function compare(x, op, y) {','  const a = parseFloat(x), b = parseFloat(y), n = isFinite(a) && isFinite(b)','  if (op === "=") return n ? a === b : x.toLowerCase() === y.toLowerCase()','  if (op === "!=") return n ? a !== b : x.toLowerCase() !== y.toLowerCase()','  if (op === "has") return x.toLowerCase().includes(y.toLowerCase())','  return n && (op === ">" ? a > b : op === "<" ? a < b : op === ">=" ? a >= b : a <= b)','}');
 return L.join('\n')};

/* ---- what a plugin needs, read from its nodes or code ---- */
PK.info=function(pl){const ks=new Set(),cmds=[],trig=new Set();if(pl.mode==='code'){const c=pl.code||'';const re=/on\(\s*['"](\w+)['"]\s*(?:,\s*\{([^}]*)\})?/g;let m;while((m=re.exec(c))){trig.add(m[1]);if(m[1]==='command'){const nm=(m[2]||'').match(/name\s*:\s*['"]([^'"]+)/);if(nm)cmds.push(nm[1])}}
  [['send','send'],['reply','send'],['card','send'],['react','react'],['pin','pin'],['giveRole','role'],['takeRole','role'],['makeChannel','mkchannel'],['copyFile','files'],['summarize','files'],['add(','data'],['set(','data'],['notify','notify']].forEach(([w,k])=>{if(c.includes('.'+w))ks.add(k)})}
 else(pl.graph?.nodes||[]).forEach(n=>{const c=PK.NODES[n.k]?.c;if(c==='start'){trig.add(n.k);if(n.k==='command'&&n.p?.name)cmds.push(String(n.p.name).replace(/^\//,''))}
  ({send:'send',reply:'send',card:'send',react:'react',pin:'pin',giverole:'role',takerole:'role',mkchannel:'mkchannel',copyfile:'files',summarize:'files',add:'data',set:'data',board:'data',notify:'notify'})[n.k]&&ks.add(({send:'send',reply:'send',card:'send',react:'react',pin:'pin',giverole:'role',takerole:'role',mkchannel:'mkchannel',copyfile:'files',summarize:'files',add:'data',set:'data',board:'data',notify:'notify'})[n.k])});
 const PL={send:'Post messages',react:'Add reactions',pin:'Pin messages',role:'Give and take roles',mkchannel:'Make channels',files:'Read and file shared files',data:'Keep its own values, like coins',notify:'Show notices'};
 return{perms:[...ks].map(k=>PL[k]),cmds:[...new Set(cmds)],trig:[...trig].map(k=>PK.NODES[k]?.l||k),nodes:(pl.graph?.nodes||[]).length}};
PK.valid=function(pl){if(!pl||pl.f!=='atelier-plugin'||typeof pl.name!=='string'||!pl.id)return'This is not an Atelier plugin.';if(pl.v>PK.VER)return'This plugin needs a newer Atelier.';
 if(pl.mode==='code'){if(typeof pl.code!=='string'||pl.code.length>60000)return'The code is missing or too long.'}else{const G=pl.graph;if(!G||!Array.isArray(G.nodes)||!Array.isArray(G.links))return'The nodes are missing.';if(G.nodes.length>300)return'Too many nodes.';if(G.nodes.some(n=>!PK.NODES[n.k]))return'This plugin uses blocks this Atelier does not know.'}return''};
PK.clean=function(pl){const o={f:'atelier-plugin',v:PK.VER,id:String(pl.id).slice(0,40),name:String(pl.name||'Plugin').slice(0,40),desc:String(pl.desc||'').slice(0,240),size:pl.size==='big'?'big':'small',author:String(pl.author||'').slice(0,40),ver:String(pl.ver||'1.0').slice(0,12),mode:pl.mode==='code'?'code':'nodes',made:+pl.made||Date.now(),up:+pl.up||Date.now(),pic:pl.pic&&pl.pic.img&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(pl.pic.img)&&pl.pic.img.length<40000?{img:pl.pic.img}:{k:PK.PICS.some(x=>x[0]===pl.pic?.k)?pl.pic.k:'spark'}};
 if(o.mode==='code')o.code=String(pl.code||'');else o.graph={nodes:pl.graph.nodes.map(n=>({id:String(n.id).slice(0,20),k:n.k,x:+n.x||0,y:+n.y||0,p:Object.fromEntries(Object.entries(n.p||{}).slice(0,12).map(([k,v])=>[String(k).slice(0,20),typeof v==='boolean'||typeof v==='number'?v:String(v).slice(0,600)]))})),links:pl.graph.links.map(l=>({id:String(l.id).slice(0,20),a:String(l.a),ap:String(l.ap||'next'),b:String(l.b)}))};return o};

/* ---- sending plugins: compressed text, split into QR codes when long ---- */
const b64u={enc:u8=>{let s='';for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')},dec:s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}};
async function pkPipe(u8,Kind,fmt){const s=new Blob([u8]).stream().pipeThrough(new Kind(fmt));return new Uint8Array(await new Response(s).arrayBuffer())}
PK.encode=async function(pl){const j=new TextEncoder().encode(JSON.stringify(PK.clean(pl)));try{if(typeof CompressionStream==='function')return'ATP1z'+b64u.enc(await pkPipe(j,CompressionStream,'deflate-raw'))}catch(e){}return'ATP1r'+b64u.enc(j)};
PK.decode=async function(s){s=String(s||'').trim();const m=s.match(/ATP1([zr])([A-Za-z0-9_-]+)/);if(!m)throw new Error('No plugin in this code.');let u=b64u.dec(m[2]);if(m[1]==='z'){if(typeof DecompressionStream!=='function')throw new Error('This browser cannot open packed plugins.');u=await pkPipe(u,DecompressionStream,'deflate-raw')}
 const pl=JSON.parse(new TextDecoder().decode(u)),bad=PK.valid(pl);if(bad)throw new Error(bad);return PK.clean(pl)};
/* QR parts: "ATQ:<set>:<i>/<n>:<chunk>". One part when it fits. */
PK.parts=function(code,size=900){const n=Math.max(1,Math.ceil(code.length/size)),set=Math.random().toString(36).slice(2,6);if(n===1)return[code];return Array.from({length:n},(_,i)=>`ATQ:${set}:${i+1}/${n}:${code.slice(i*size,(i+1)*size)}`)};
PK.collector=function(){const sets={};return{add(t){t=String(t||'');if(/^ATP1/.test(t)||/ATP1[zr]/.test(t)&&!t.startsWith('ATQ:'))return{done:t.slice(t.indexOf('ATP1'))};const m=t.match(/^ATQ:(\w+):(\d+)\/(\d+):(.*)$/s);if(!m)return{bad:true};const s=sets[m[1]]=sets[m[1]]||{n:+m[3],p:{}};s.p[m[2]]=m[4];const got=Object.keys(s.p).length;
  if(got===s.n)return{done:Array.from({length:s.n},(_,i)=>s.p[i+1]).join('')};return{got,n:s.n}}}};
PK.qrSvg=function(text,cls=''){const q=qrcode(0,'L');q.addData(text,'Byte');q.make();const n=q.getModuleCount();let d='';for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+=`M${c} ${r}h1v1h-1z`;
 return`<svg class="pkqr ${cls}" viewBox="-2 -2 ${n+4} ${n+4}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect x="-2" y="-2" width="${n+4}" height="${n+4}" fill="#fff"/><path d="${d}" fill="#151413"/></svg>`};
/* ---- the camera scanner, shared: returns stop() ---- */
PK.scan=function(video,canvas,onText,onErr){let stream=null,raf=0,stopped=false,last=0;
 navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false}).then(s=>{if(stopped){s.getTracks().forEach(t=>t.stop());return}stream=s;video.srcObject=s;video.setAttribute('playsinline','');video.muted=true;video.play().catch(()=>{});
  const x=canvas.getContext('2d',{willReadFrequently:true});const tick=t=>{if(stopped)return;raf=requestAnimationFrame(tick);if(t-last<110||video.readyState<2)return;last=t;const w=Math.min(720,video.videoWidth),h=Math.round(video.videoHeight*w/video.videoWidth);if(!w||!h)return;canvas.width=w;canvas.height=h;x.drawImage(video,0,0,w,h);
   const r=jsQR(x.getImageData(0,0,w,h).data,w,h,{inversionAttempts:'dontInvert'});if(r&&r.data)onText(r.data)};raf=requestAnimationFrame(tick)}).catch(e=>onErr&&onErr(e));
 return()=>{stopped=true;cancelAnimationFrame(raf);if(stream)stream.getTracks().forEach(t=>t.stop());video.srcObject=null}};

/* ---- running a plugin: nodes run here, code runs sealed away ---- */
PK._box=null;PK._wait={};PK._seq=0;
PK._boxSrc=()=>`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:"><script>
const PK_SRC=${JSON.stringify('const PK={};PK.NODES={};const pkCore='+pkCore.toString()+';self.core=pkCore();')};
let W=null;try{W=new Worker(URL.createObjectURL(new Blob([PK_SRC+'onmessage=async e=>{const d=e.data;try{const r=await core.runCode(d.code,d.ev,d.snap,d.store);postMessage({id:d.id,r})}catch(x){postMessage({id:d.id,err:String(x&&x.message||x)})}}'],{type:'text/javascript'})))}catch(e){W=null}
if(W){W.onmessage=e=>parent.postMessage(e.data,'*');W.onerror=e=>{e.preventDefault()}}else{eval(PK_SRC)}
onmessage=async e=>{const d=e.data;if(W){W.postMessage(d);return}try{const r=await core.runCode(d.code,d.ev,d.snap,d.store);parent.postMessage({id:d.id,r},'*')}catch(x){parent.postMessage({id:d.id,err:String(x&&x.message||x)},'*')}};
<\/script>`;
PK._mkBox=function(){if(PK._box)PK._box.remove();const f=document.createElement('iframe');f.setAttribute('sandbox','allow-scripts');f.setAttribute('aria-hidden','true');f.tabIndex=-1;f.style.cssText='position:fixed;width:1px;height:1px;left:-9px;top:-9px;border:0;opacity:0;pointer-events:none';f.srcdoc=PK._boxSrc();document.body.appendChild(f);PK._box=f;PK._ready=new Promise(r=>f.onload=()=>r());
 if(!PK._lis){PK._lis=1;addEventListener('message',e=>{if(!PK._box||e.source!==PK._box.contentWindow)return;const d=e.data||{},w=PK._wait[d.id];if(w){delete PK._wait[d.id];clearTimeout(w.t);d.err?w.no(new Error(d.err)):w.ok(d.r)}})}};
PK.runCode=async function(code,ev,snap,store){if(!PK._box)PK._mkBox();await PK._ready;const id='r'+(++PK._seq);
 return new Promise((ok,no)=>{const t=setTimeout(()=>{delete PK._wait[id];PK._mkBox();no(new Error('The plugin took too long and was stopped.'))},2000);PK._wait[id]={ok,no,t};PK._box.contentWindow.postMessage({id,code,ev:JSON.parse(JSON.stringify(ev)),snap:JSON.parse(JSON.stringify(snap)),store:JSON.parse(JSON.stringify(store))},'*')})};
PK.run=async function(pl,ev,snap,store){const st=JSON.parse(JSON.stringify(store||{})),sn=JSON.parse(JSON.stringify(snap));try{if(pl.mode==='code'){const r=await PK.runCode(pl.code||'',ev,sn,st);return r}return PK.core.runGraph(pl,ev,sn,st)}catch(e){return{actions:[],store:store||{},trace:[],err:String(e.message||e)}}};
/* a quick file description, read before the plugin runs (text files only, first 20 KB) */
PK.fileInfo=async function(name,type,size,blob){const ext=(String(name).split('.').pop()||'').toLowerCase(),kind=type.startsWith('image/')?'image':ext==='pdf'?'PDF':/^(txt|md|csv|json|js|html|css|tex)$/.test(ext)||type.startsWith('text/')?'text file':/^(doc|docx|odt|pages|rtf)$/.test(ext)?'document':/^(xls|xlsx|numbers|ods)$/.test(ext)?'spreadsheet':/^(ppt|pptx|key|odp)$/.test(ext)?'slides':ext?ext.toUpperCase()+' file':'file';
 const sizeText=size<1024?size+' B':size<1048576?Math.round(size/1024)+' KB':(size/1048576).toFixed(1)+' MB';const o={name,kind,size,sizeText};
 if(blob&&kind==='text file'){try{const t=await blob.slice(0,20480).text();o.words=(t.match(/\S+/g)||[]).length;o.lines=t.split('\n').length;o.first=(t.split('\n').find(l=>l.trim())||'').trim().slice(0,140)}catch(e){}}return o};

/* ---- the starter plugins, in both apps ---- */
PK.STARTERS=(()=>{let i=0;const N=(k,x,y,p={})=>({id:'n'+(++i),k,x,y,p}),Lk=(a,b,ap='next')=>({id:'l'+a.id+b.id+ap,a:a.id,ap,b:b.id});
 const mk=(id,name,desc,pic,size,nodes,links)=>({f:'atelier-plugin',v:1,id,name,desc,pic:{k:pic},size,author:'Atelier',ver:'1.1',mode:'nodes',made:1763200000000,up:1763300000000,starter:true,graph:{nodes,links}});
 i=0;let a=N('join',40,60),b=N('send',340,60,{ch:'',text:'Welcome to {group}, {user}! Say hi here and look around the channels.'}),c=N('react',640,60,{key:'love'}),d=N('install',40,260),e=N('send',340,260,{ch:'',text:'Welcome is on. Everyone who joins gets a warm hello.'});
 const welcome=mk('atelier.welcome','Welcome','Greets every new member with a message in the group.','wave','small',[a,b,c,d,e],[Lk(a,b),Lk(d,e)]);
 i=0;const d1=N('daily',40,40),d2=N('add',330,40,{name:'coins',amount:'10',who:'user'}),d3=N('react',620,40,{key:'coin'}),
  c1=N('command',40,230,{name:'coins'}),c2=N('card',330,230,{ch:'',title:'Balance',value:'{coins}',unit:'coins',text:'{user}, keep going. A star on your message pays a coin.',tone:'yellow'}),
  t1=N('command',40,400,{name:'top'}),t2=N('board',330,400,{name:'coins',n:5}),t3=N('card',620,400,{ch:'',title:'Most coins',value:'',unit:'',text:'{leaderboard}',tone:'yellow'}),
  r1=N('reaction',40,570,{key:'star'}),r2=N('add',330,570,{name:'coins',amount:'1',who:'author'}),
  g1=N('command',40,740,{name:'give'}),g2=N('if',330,740,{a:'{coins}',op:'>=',b:'{arg2}'}),g3=N('if',620,700,{a:'{arg2}',op:'>',b:'0'}),g4=N('add',910,660,{name:'coins',amount:'-{arg2}',who:'user'}),g5=N('add',1200,660,{name:'coins',amount:'{arg2}',who:'arg'}),g6=N('reply',1490,660,{text:'{user} gave {arg2} coins to {arg1}.'}),g7=N('reply',620,880,{text:'You need at least {arg2} coins for that, {user}.'}),g8=N('reply',910,800,{text:'Give a number, like /give Ana 5.'}),
  i1=N('install',40,930),i2=N('send',330,930,{ch:'',text:'Coins is on. Everyone gets 10 coins a day. Type /coins, /top or /give name amount. A star on a message gives its author a coin.'});
 const coins=mk('atelier.coins','Coins','A small economy: daily coins, stars that pay, a leaderboard and giving coins to others.','coin','big',[d1,d2,d3,c1,c2,t1,t2,t3,r1,r2,g1,g2,g3,g4,g5,g6,g7,g8,i1,i2],[Lk(d1,d2),Lk(d2,d3),Lk(c1,c2),Lk(t1,t2),Lk(t2,t3),Lk(r1,r2),Lk(g1,g2),Lk(g2,g3,'yes'),Lk(g2,g7,'no'),Lk(g3,g4,'yes'),Lk(g3,g8,'no'),Lk(g4,g5),Lk(g5,g6),Lk(i1,i2)]);
 i=0;const s1=N('command',40,80,{name:'leader'}),s2=N('cooldown',330,80,{per:'day',mins:10,who:'group'}),s3=N('pick',620,40,{from:'all',role:'',notme:false}),s4=N('giverole',910,40,{who:'picked',role:'Leader'}),s5=N('add',1200,40,{name:'coins',amount:'25',who:'picked'}),s6=N('card',1490,40,{ch:'',title:'Leader of the day',value:'{picked}',unit:'+25 coins',text:'Lead well! Ask {picked} where to start today.',tone:'violet'}),s7=N('reply',620,220,{text:'We already have a leader today. Try again tomorrow.'});
 const spot=mk('atelier.spotlight','Spotlight','Type /leader to choose a leader of the day: a role and 25 coins.','crown','small',[s1,s2,s3,s4,s5,s6,s7],[Lk(s1,s2),Lk(s2,s3,'yes'),Lk(s2,s7,'no'),Lk(s3,s4),Lk(s4,s5),Lk(s5,s6)]);
 i=0;const f1=N('file',40,60),f2=N('summarize',330,60),f3=N('card',620,60,{ch:'',title:'{file}',value:'',unit:'',text:'{summary}',tone:'green'}),f4=N('if',910,60,{a:'{channel}',op:'!=',b:'files'}),f5=N('copyfile',1200,20,{ch:'files'}),f6=N('reply',1490,20,{text:'I filed a copy in #files.'});
 const files=mk('atelier.files','File helper','Describes every shared file and files a copy in #files.','files','small',[f1,f2,f3,f4,f5,f6],[Lk(f1,f2),Lk(f2,f3),Lk(f3,f4),Lk(f4,f5,'yes'),Lk(f5,f6)]);
 return[welcome,coins,spot,files]})();

/* ---- plugin messages are widgets: a card with the plugin's picture, a title, a big value, ranked rows ---- */
PK.guess=function(text){const t=String(text||''),L=t.split('\n'),rows=[],rest=[];let title='';
 L.forEach(l=>{const m=l.match(/^\s*(\d+)\.\s+(.+?):\s*(-?\d+(?:[.,]\d+)?)\s*$/);if(m)rows.push([m[2],m[3]]);else if(l.trim())rest.push(l)});
 if(rows.length>=1&&rest.length&&/:\s*$/.test(rest[0])){title=rest.shift().replace(/:\s*$/,'')}
 const st=rows.length||t.length>70?null:t.match(/(-?\d+(?:[.,]\d+)?)\s+(coins?|points?|stars?|rolls?|xp|votes?)\b/i);
 return{title,value:st?st[1]:'',unit:st?st[2]:'',text:rest.join('\n'),rows}};
PK.fmt=t=>PK.esc(t).replace(/(^|\s)(\/[a-z0-9-]+)/gi,'$1<span class="cmdt">$2</span>').replace(/(^|\s)#([a-z0-9čšž-]+)/gi,'$1<span class="chm">#$2</span>');
PK.plCard=function(m,pl){const c=m.card?{...m.card,text:m.text||'',rows:[]}:PK.guess(m.text);if(m.card&&c.text){const g=PK.guess(c.text);if(g.rows.length){c.rows=g.rows;c.text=g.text}}
 const mx=Math.max(1,...c.rows.map(r=>Math.abs(parseFloat(String(r[1]).replace(',','.'))||0)));const tone=c.tone||'violet';
 return`<div class="plw" style="--pt:var(--${tone==='accent'?'accent':tone})"><div class="plwh">${PK.picHtml(pl||{},'sm')}<b>${PK.esc(pl?.name||'Plugin')}</b><span class="pltag">Plugin</span></div>
 ${c.title?`<div class="plwt">${PK.esc(c.title)}</div>`:''}${c.value!==''&&c.value!=null?`<div class="plwv"><b>${PK.esc(c.value)}</b>${c.unit?`<span>${PK.esc(c.unit)}</span>`:''}</div>`:''}
 ${c.rows.length?`<div class="plwr">${c.rows.slice(0,10).map((r,i)=>`<div class="${i===0?'top':''}"><i>${i+1}</i><span>${PK.esc(r[0])}</span><b>${PK.esc(r[1])}</b><em style="width:${Math.round(Math.abs(parseFloat(String(r[1]).replace(',','.'))||0)/mx*100)}%"></em></div>`).join('')}</div>`:''}
 ${c.text?`<p class="plwx">${PK.fmt(c.text)}</p>`:''}</div>`};
