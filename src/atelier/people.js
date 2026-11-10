/* ============ TEAMMATES (bots) ============ */
const BOT_SEED=[
 {name:'Maja Kovač',role:'Product designer',fig:{h:3,c:0},tone:'warm'},
 {name:'Luka Novak',role:'Developer',fig:{h:4,c:1},tone:'brief'},
 {name:'Ana Zupan',role:'Researcher',fig:{h:1,c:2},tone:'curious'},
 {name:'Tim Horvat',role:'Project lead',fig:{h:5,c:3},tone:'brief'},
 {name:'Eva Kralj',role:'Writer',fig:{h:0,c:4},tone:'warm'}];
const LINES={
 greet:{warm:['Hi! Good to hear from you.','Hey, hope your day is going well.'],brief:['Hey.','Hi, what\'s up?'],curious:['Hi! What are you working on?','Hello! Anything I can help with?']},
 idea:{warm:['Oh I like that. Let\'s sketch it out.','That could really work, add it to the ideas board?'],brief:['Good idea. Add it to the board.','Makes sense to me.'],curious:['Interesting. What problem does it solve first?','Nice. Who would use it most?']},
 time:{warm:['We can make it, let\'s split the tasks.','I can take one of the tasks tonight.'],brief:['Deadline noted.','On it. I\'ll update the board.'],curious:['What\'s the most important part before then?','Should we cut scope a little?']},
 thanks:{warm:['Anytime!','Happy to help.'],brief:['Sure thing.','No problem.'],curious:['Of course! Tell me how it goes.','Glad it helped.']},
 q:{warm:['Good question, let me check and get back to you.','I think yes, but let\'s confirm together.'],brief:['Yes.','Probably. I\'ll check.'],curious:['Hmm, what do you think?','Depends. What are the options?']},
 file:{warm:['Thanks for sharing, looking at it now.','Got it, I\'ll leave comments.'],brief:['Got it.','Received.'],curious:['Thanks! Which part should I read first?','Nice, is this the latest version?']},
 meet:{warm:['Sure, let\'s do a short focus session together first.','Works for me!'],brief:['Fine by me.','OK, 15 min.'],curious:['What should we prepare?','Sounds good. What\'s the agenda?']},
 photo:{warm:['Oh, lovely picture!','That looks great, thanks for sharing.'],brief:['Nice shot.','Got it.'],curious:['Where was this?','Ooh, what am I looking at?']},
 project:{warm:['Great, I\'ll have a look at the board.','Thanks! I can take a task from it.'],brief:['Seen. I\'ll check the tasks.','OK, on the board.'],curious:['What should we finish first?','Nice. Which part needs help?']},
 progress:{warm:['Look at that progress! Well done.','We are getting there, nice work everyone.'],brief:['Good pace.','Noted, thanks.'],curious:['What moved it forward this time?','What is blocking the rest?']},
 focus:{warm:['That is a solid focus streak!','Proud of you, keep it going.'],brief:['Nice focus.','Good session.'],curious:['What did you work on?','How do you keep the streak?']},
 day:{warm:['Sounds like a good day so far.','Thanks for sharing your day!'],brief:['Productive.','Nice day.'],curious:['What was the best part?','How are you feeling about it?']},
 agenda:{warm:['Nice plan for the day!','Good plan. Shout if I can take something.'],brief:['Plan noted.','Clear plan.'],curious:['Which one matters most?','Is there time for a break in there?']},
 deck:{warm:['Ooh, can I borrow these cards?','Great deck, let\'s quiz each other.'],brief:['Useful, thanks.','Got the deck.'],curious:['How many do you know already?','Which card is the hardest?']},
 quote:{warm:['That is a lovely line.','I needed that today, thank you.'],brief:['Good one.','True.'],curious:['Where is that from?','What made you pick it?']},
 countdown:{warm:['You have got this! Want to study together?','We can plan the last days together.'],brief:['Noted. Good luck.','Counting with you.'],curious:['How ready do you feel?','Which part worries you most?']},
 gen:{warm:['Sounds good!','Love it. Keep going.','I\'m with you on this.'],brief:['OK.','Noted.','Sure.'],curious:['Tell me more?','Why do you think so?','Interesting!']}};
function topicOf(t){t=t.toLowerCase();if(/\b(hi|hey|hello|živjo|zdravo|good morning)\b/.test(t))return'greet';if(/thank|hvala|thx/.test(t))return'thanks';if(/idea|ideja|what if|maybe we/.test(t))return'idea';if(/deadline|due|tomorrow|today|friday|rok|jutri/.test(t))return'time';if(/meet|call|sestan|session/.test(t))return'meet';if(/\?$/.test(t.trim()))return'q';return'gen'}
const pick=a=>a[Math.floor(Math.random()*a.length)];
function seedBots(){if(S.people.length)return;BOT_SEED.forEach(b=>S.people.push({id:uid(),bot:true,handle:b.name.split(' ')[0].toLowerCase(),status:'Available',...b}))}
function botReply(chat,text,att){const pool=chat.kind==='dm'?[chat.with]:(grp(chat.with)?.members||[]).filter(id=>id!=='me'&&person(id)?.bot);
 if(!pool.length)return;const who=chat.kind==='dm'?pool:[...pool].sort(()=>Math.random()-.5).slice(0,Math.min(pool.length,Math.random()<.45?2:1));
 let delay=700+Math.random()*900;who.forEach(pid=>{const p=person(pid);if(!p)return;const top=att?(LINES[att.kind]?att.kind:'file'):topicOf(text);const line=pick(LINES[top][p.tone||'warm']);
  const t0=delay;setTimeout(()=>{chat.typing=pid;if(route.k==='c'&&route.a[0]===chat.id)typingUI(chat)},t0);
  delay+=900+Math.min(1800,line.length*28)+Math.random()*500;
  setTimeout(()=>{chat.typing=null;chat.msgs.push({id:uid(),from:pid,text:line,at:Date.now()});save();if(route.k==='c'&&route.a[0]===chat.id){chat.read=Date.now();appendMsgs(chat)}else{nav();if(!(chat.kind==='group'&&grp(chat.with)?.mute))toast(`${p.name.split(' ')[0]}: ${line}`)}},delay);delay+=400})}
/* bots react inside projects: vote on ideas, pick up tasks */
function botsReactIdea(p,idea){const bots=projMembers(p).filter(id=>person(id)?.bot);bots.slice(0,2).forEach((id,i)=>setTimeout(()=>{if(!idea.votes.includes(id)&&Math.random()<.75){idea.votes.push(id);act(p,id,`voted for “${idea.text.slice(0,40)}”`);save();if(route.k==='project'&&route.a[0]===p.id)render()}},1600+i*1400))}
function botsReactTask(p,t){const b=person(t.who);if(!b?.bot||t.st!=='todo')return;setTimeout(()=>{if(t.st==='todo'){t.st='doing';act(p,b.id,`started “${t.t.slice(0,40)}”`);save();if(route.k==='project'&&route.a[0]===p.id)render()}},2500)}
function act(p,who,text){(p.activity=p.activity||[]).push({who,text,at:Date.now()});if(p.activity.length>200)p.activity=p.activity.slice(-150)}
const projMembers=p=>[...new Set([...(p.members||[]),...(p.groups||[]).flatMap(g=>grp(g)?.members||[])])].filter(id=>id==='me'||person(id));

/* ============ ONBOARDING: posters, then the account ============ */
let OB={i:0,h:0,c:0};
const obHair=()=>HAIR.map((_,i)=>`<button type="button" data-h="${i}" class="${OB.h===i?'on':''}" aria-label="Look ${i+1}">${avatar({fig:{h:i,c:OB.c}},38)}</button>`).join('');
function onboarding(){const slides=[['wave','Work better, together.','Notes, projects, chat and focus in one calm place.'],['duo','Ideas grow in company.','Make groups, share anything, build projects together.'],['write','One thing at a time.','Focus timers for working and studying, with real breaks.']];
 if(OB.i<3){const [f,t,s]=slides[OB.i];$('#view').innerHTML=`<div class="ob"><div class="obart" key="${OB.i}">${figure(f,{draw:true,sw:2.2})}</div><div class="dots">${[0,1,2].map(i=>`<i class="${i===OB.i?'on':''}"></i>`).join('')}</div><h1 class="hand">${t}</h1><p class="lead">${s}</p><button class="btn primary full" id="obN">${OB.i<2?'Next':'Create your account'}</button>${OB.i<2?'<button class="btn ghost full" id="obS">Skip</button>':''}</div>`;
  $('#obN').onclick=()=>{OB.i++;onboarding()};const sk=$('#obS');if(sk)sk.onclick=()=>{OB.i=3;onboarding()};return}
 $('#view').innerHTML=`<form class="ob" id="obF" novalidate><div class="obmark">${markSVG()}</div><h1>Create your account</h1><p class="lead">It lives on this device and works offline.</p>
 <div class="avpick" id="obAv">${avatar({fig:{h:OB.h,c:OB.c}},84)}</div>
 <div class="flabel">Look</div><div class="opts" id="obH">${obHair()}</div>
 <div class="flabel">Colour</div><div class="opts" id="obC">${AV_COL.map((c,i)=>`<button type="button" data-c="${i}" class="sw ${OB.c===i?'on':''}" style="background:${c}" aria-label="Colour ${i+1}"></button>`).join('')}</div>
 ${profileFields('ob')}
 <label class="chk"><input type="checkbox" name="team" checked> Add five teammate bots to try groups and chat</label>
 <button class="btn primary full" type="submit">Start</button></form>`;
 const F=$('#obF');wireProfile(F,'ob');
 /* look and colour update in place, so nothing you typed is lost */
 const pick=()=>{$('#obAv').innerHTML=avatar({fig:{h:OB.h,c:OB.c}},84);$('#obH').innerHTML=obHair();$$('#obC [data-c]').forEach(b=>b.classList.toggle('on',+b.dataset.c===OB.c))};
 $('#obH').onclick=e=>{const b=e.target.closest('[data-h]');if(b){OB.h=+b.dataset.h;pick()}};
 $('#obC').onclick=e=>{const b=e.target.closest('[data-c]');if(b){OB.c=+b.dataset.c;pick()}};
 F.onsubmit=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(F));if(!showErrs(F,checkProfile(fd)))return;
  const p=cleanProfile(fd),name=p.first;
  S.me={id:'me',name,handle:name.split(/\s+/)[0].toLowerCase(),fig:{h:OB.h,c:OB.c},created:Date.now()};S.settings.space=p.status==='student'?'student':'work';S.focus.mode=p.status==='student'?'study':'pomo';storeProfile(p);use('signin');applyTheme();
  if(fd.team){seedBots();const ids=S.people.map(p=>p.id);const g={id:uid(),name:'Studio',col:GCOL[0],desc:'Your first working group.',members:['me',...ids],at:Date.now()};S.groups.push(g);
   const c={id:uid(),kind:'group',with:g.id,msgs:[],read:Date.now(),at:Date.now()};S.chats.push(c);c.msgs.push({id:uid(),from:ids[3],text:`Welcome to Studio, ${name.split(' ')[0]}! This is where we plan things.`,at:Date.now()});
   S.notes.push({id:uid(),title:'Welcome to Atelier',body:'# Start here\nNotes are yours until you share them.\n\n[ ] Make your first note\n[ ] Start a focus session\n[ ] Create a project with Studio\n\n- Share notes with a group from the note menu\n- Your activity shows up on Today',col:0,pin:true,share:{groups:[],projects:[]},at:Date.now(),up:Date.now()})}
  save();go('today');render();setTimeout(()=>burst(),300)}}
