/* ============ ATELIER · ART ============
   One ink line, one accent. Icons on a 24 grid, characters on a 100 grid, avatars on a 40 grid. */
const ICON={
home:'M4 11L12 4.6L20 11M6.2 9.4V19.4H10.2V14.6H13.8V19.4H17.8V9.4',
focus:'M4 13a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M12 8.8V13L14.8 14.6M9.5 2.8H14.5',
notes:'M6 3.6H14.6L18.4 7.4V20.4H6ZM14.4 3.8V7.6H18.2M8.6 11.6C10 10.6 11.2 12.6 12.6 11.6S15 11 15.6 11.4M8.6 15H13.4',
chat:'M4.4 12C4.4 7.8 7.8 5 12 5S19.6 7.8 19.6 12S16.2 19 12 19C10.8 19 9.7 18.8 8.7 18.3L4.6 19.4L5.7 15.8C4.9 14.7 4.4 13.4 4.4 12Z',
projects:'M4.5 5H10.5V11H4.5ZM13.5 5H19.5V8.6H13.5ZM13.5 11.6H19.5V19H13.5ZM4.5 14H10.5V19H4.5Z',
you:'M8.1 8.3a3.9 3.9 0 1 0 7.8 0a3.9 3.9 0 1 0 -7.8 0M5 20.2C5.8 16.8 8.6 14.8 12 14.8S18.2 16.8 19 20.2',
plus:'M12 5.5V18.5M5.5 12H18.5',search:'M4.8 10.8a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M15.2 15.2L19.6 19.6',
back:'M14.5 5L8 12L14.5 19',close:'M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5',
send:'M4.5 11.6L19.5 4.6L15.2 19.4L11.6 13L4.5 11.6ZM11.6 13L19.5 4.6',
attach:'M15.6 8.2L9.4 14.4A1.8 1.8 0 0 0 11.9 17L18 10.8A3.7 3.7 0 0 0 12.8 5.6L6.6 11.8A5.4 5.4 0 0 0 14.2 19.4L18.8 14.8',
group:'M5.8 8.2a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0M3.4 19.4C4 16.4 6.2 14.6 9 14.6S14 16.4 14.6 19.4M16 5.6A2.8 2.8 0 0 1 16 11.2M17.6 14.6C19.4 15.2 20.4 16.8 20.8 19',
people:'M8.6 7.6a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0M5.6 19.6C6.4 16.4 8.9 14.6 12 14.6S17.6 16.4 18.4 19.6',
check:'M5.5 12.5L10 17L18.5 7.5',more:'M6 12H6.01M12 12H12.01M18 12H18.01',
pin:'M9.5 4.5H14.5L14 9.5L17 12.5H7L10 9.5ZM12 12.5V19.5',trash:'M5.5 7H18.5M9.5 7V4.8H14.5V7M7.2 7L8 19.5H16L16.8 7',
edit:'M5 19L5.6 15.4L15.8 5.2A2 2 0 0 1 18.8 8.2L8.6 18.4ZM14 7L17 10',
share:'M12 15V4.5M8 8.2L12 4.4L16 8.2M6 12.5V19.5H18V12.5',
play:'M8 5.5L18.5 12L8 18.5Z',pause:'M8.5 5.5V18.5M15.5 5.5V18.5',skip:'M6 5.5L14.5 12L6 18.5ZM18 5.5V18.5',reset:'M-1.2 5.4a6.6 6.6 0 1 0 13.2 0a6.6 6.6 0 1 0 -13.2 0M5 4.6V8.4H8.8',
file:'M6.5 3.8H14L17.5 7.3V20.2H6.5ZM14 4V7.6H17.4M9 12.6H15M9 15.8H13.2',image:'M4.5 5.5H19.5V18.5H4.5ZM4.8 16L9.6 11.4L13 14.6L15.4 12.4L19.2 16M15.4 8.6H15.41',
link:'M10.2 13.8A3.6 3.6 0 0 0 15.3 13.8L18.3 10.8A3.6 3.6 0 0 0 13.2 5.7L11.9 7M13.8 10.2A3.6 3.6 0 0 0 8.7 10.2L5.7 13.2A3.6 3.6 0 0 0 10.8 18.3L12.1 17',
draw:'M4.6 19.4C6.6 16.4 8.4 18.8 10.6 16.2C12.6 13.8 15 10.6 18.8 5.6M15.6 5.2L19.2 8.8',
board:'M4 5H20V16.2H4ZM9 16.2L7.4 20M15 16.2L16.6 20M7 12.4C8.8 9.4 10.4 13.4 12.4 10.4S15.6 9.4 17 11.6',
idea:'M9.4 17.4H14.6M10.2 20.2H13.8M12 3.8C8.8 3.8 6.6 6.2 6.6 9C6.6 11.2 7.8 12.4 8.8 13.6C9.4 14.3 9.6 15.2 9.6 16.2H14.4C14.4 15.2 14.6 14.3 15.2 13.6C16.2 12.4 17.4 11.2 17.4 9C17.4 6.2 15.2 3.8 12 3.8Z',
table:'M4.5 5.5H19.5V18.5H4.5ZM4.5 10H19.5M4.5 14.3H19.5M10 5.5V18.5',chart:'M4.5 4.5V19.5H19.5M8.2 16V12.4M12 16V8.6M15.8 16V11',
upload:'M12 15.5V4.8M7.8 8.8L12 4.6L16.2 8.8M5 15V19.4H19V15',download:'M12 4.5V15.2M7.8 11L12 15.2L16.2 11M5 15.6V19.4H19V15.6',
sun:'M8.2 12a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0M12 2.8V4.6M12 19.4V21.2M2.8 12H4.6M19.4 12H21.2M5.5 5.5L6.8 6.8M17.2 17.2L18.5 18.5M18.5 5.5L17.2 6.8M6.8 17.2L5.5 18.5',
moon:'M19 14.6A7.6 7.6 0 1 1 9.4 5C9 9.8 13.2 15 19 14.6Z',bell:'M6.5 16.6V11A5.5 5.5 0 0 1 17.5 11V16.6L19 18H5ZM10.2 20.4H13.8',
gear:'M9.2 12a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0M12 3.5V5.6M12 18.4V20.5M5.9 5.9L7.4 7.4M16.6 16.6L18.1 18.1M3.5 12H5.6M18.4 12H20.5M5.9 18.1L7.4 16.6M16.6 7.4L18.1 5.9',
star:'M12 4L14.3 9.1L19.8 9.6L15.6 13.3L16.9 18.8L12 15.9L7.1 18.8L8.4 13.3L4.2 9.6L9.7 9.1Z',folder:'M4 6.5H10L11.8 8.4H20V18.6H4Z',
calendar:'M4.5 6.5H19.5V19.5H4.5ZM4.5 10.5H19.5M8.5 4V8M15.5 4V8',flag:'M6 20.5V4.5M6 5C9 3.6 11 6.6 14 5.4C15.8 4.7 17 4.8 18 5.4V13.4C17 12.8 15.8 12.7 14 13.4C11 14.6 9 11.6 6 13',
arrow:'M5 12H18.5M13.5 7L18.5 12L13.5 17',sparkle:'M12 4C12.6 8.6 15.4 11.4 20 12C15.4 12.6 12.6 15.4 12 20C11.4 15.4 8.6 12.6 4 12C8.6 11.4 11.4 8.6 12 4Z',
addp:'M6.6 7.6a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0M3.6 19.6C4.4 16.4 6.9 14.6 10 14.6C11.8 14.6 13.4 15.2 14.6 16.2M18 13.5V19.5M15 16.5H21',
eraser:'M8.2 19.4H19M5.4 15.6L13.8 7.2L18.2 11.6L11.4 18.4H8.2Z',undo:'M8.4 8.6H14.6A4.6 4.6 0 0 1 14.6 17.8H8M8.4 8.6L11.6 5.4M8.4 8.6L11.6 11.8',
bot:'M7 9.5H17V18H7ZM12 9.5V6.5M12 5.5H12.01M9.8 13.4H9.81M14.2 13.4H14.21M10 16H14M5 12.5V15M19 12.5V15',
vote:'M12 5.5L17.5 12.5H14V18.5H10V12.5H6.5Z',coffee:'M5.5 9.5H16V14A4.5 4.5 0 0 1 11.5 18.5H10A4.5 4.5 0 0 1 5.5 14ZM16 10.6H17.6A2.2 2.2 0 0 1 17.6 15H16M8.4 4.5C7.8 5.6 9.2 6.2 8.6 7.4M11.4 4.5C10.8 5.6 12.2 6.2 11.6 7.4',
lock:'M6.5 10.5H17.5V19.5H6.5ZM8.8 10.5V8A3.2 3.2 0 0 1 15.2 8V10.5',stop:'M7 7H17V17H7Z',quote:'M5 16.5C5 12 6.6 9 10 7.5L10.6 8.6C8.8 9.6 8 11 8 12.5H10.4V17H5ZM13.6 16.5C13.6 12 15.2 9 18.6 7.5L19.2 8.6C17.4 9.6 16.6 11 16.6 12.5H19V17H13.6Z',chevr:'M9.5 5L16 12L9.5 19',chevl:'M14.5 5L8 12L14.5 19',mic:'M9.4 11.6V7.4A2.6 2.6 0 0 1 14.6 7.4V11.6A2.6 2.6 0 0 1 9.4 11.6ZM6.4 11C6.4 14.4 8.8 16.8 12 16.8S17.6 14.4 17.6 11M12 16.8V20.4M9 20.4H15',logout:'M10 19.5H5.5V4.5H10M14.5 8L18.5 12L14.5 16M18.5 12H9.5',
cap:'M3.2 9.6L12 5.2L20.8 9.6L12 14ZM7 11.6V15.8C8.6 17.4 10.2 18 12 18S15.4 17.4 17 15.8V11.6M20.8 9.6V14.6',
case:'M4 8.6H20V19H4ZM9.2 8.6V6.4C9.2 5.7 9.7 5.2 10.4 5.2H13.6C14.3 5.2 14.8 5.7 14.8 6.4V8.6M4.2 13.2C9.2 14.6 14.8 14.6 19.8 13.2M11 13.9V15.4H13V13.9',
mail:'M4 6.4H20V17.6H4ZM4.6 7C8 9.8 9.8 11.4 12 12.9C14.2 11.4 16 9.8 19.4 7'};
const ic=(k,sw=1.7)=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON[k]||''}"/></svg>`;
/* the note icon: a folded page whose line turns into a little loop and pen stroke */
const noteGlyph=(col='var(--accent)')=>`<svg class="ng" viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.5H29.5L37.5 14.5V41.5H12Z" stroke="currentColor" stroke-width="2.2"/><path d="M29 7V15H37" stroke="currentColor" stroke-width="2.2"/><path d="M17 23.5C20 21 22 26 25 23.5C27 21.8 26 19.6 24.4 20.4C22.6 21.4 25.8 26.4 32 22.4" stroke="${col}" stroke-width="2.4"/><path d="M17 30.5H29M17 35.5H24" stroke="currentColor" stroke-width="2.2" opacity=".55"/></svg>`;
/* knot: tracking unit (shown only on the You page) */
const KNOT='M11 51C17 41 24 31 21 22C18 13 7 17 10.5 27C14 37 35 38 45 27C53 18 47.5 9 40.5 13C33 17 40 34 53 51';
const knot=(cls='kn',sw=4.4)=>`<svg class="${cls}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${KNOT}"/></svg>`;
/* app mark: two lines meeting in a loop, people working on one thread */
const MARK_A='M10 46C16 34 22 22 30 14C34 26 38 38 46 48';
const MARK_B='M18 34C26 30 36 30 44 33C48 35 50 31 47 28C44 25 39 29 43 34';
function markSVG(bg=true,sw=4){return`<svg viewBox="0 0 56 56" aria-hidden="true">${bg?'<rect width="56" height="56" rx="13" fill="#f4efe6"/>':''}<g fill="none" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="${MARK_A}" stroke="${bg?'#24211d':'currentColor'}"/><path d="${MARK_B}" stroke="${bg?'#d9764f':'var(--accent)'}"/></g></svg>`}

/* ---- characters: gesture figures, unfinished on purpose. P = ink paths, A = accent paths ---- */
const FIG={
think:{P:['M45 21C39 21 36 26 37.5 31C39 36 45 37.5 48.5 34C52 30.5 50.5 24 46.5 22.6','M44 38C40 46 39.5 56 42.5 64C49 63.6 56 63.8 62 64.6C63 71 63 78 62 86','M44 46C50 52 56 56 59.5 62M59.5 62C57 54 53 46 49.5 39.5','M30 66H68M36 66L34 90M64 66L66 90'],A:['M58 9C57 5 62 2.8 65 5.6C67.6 8 66 11.4 64 12.6V15.4H60.6V12.6C59.4 12 58.4 10.8 58 9ZM61 18H64']},
write:{P:['M38 20C32 20 29 25 30.5 30C32 35 38 36.5 41.5 33C45 29.5 43.5 23 39.5 21.6','M37 37C40 44 44 50 50 54C46 60 44 67 44 76M50 54C56 60 58 67 57 76','M41 44C46 48 52 50 58 49.5L66 48','M24 58H86M30 58V90M80 58V90'],A:['M66 48L74 40M73 52C77 50 79 46 79 42']},
walk:{P:['M52 14C46.5 14 43.5 18.5 45 23.5C46.5 28.5 52 29.5 55.5 26.5C59 23.5 57.5 17 53.8 15.6','M50 31C48 41 46 50 45 58','M45 58C40 66 36 73 30 82M45 58C51 66 55 73 62 80C64 81.5 67 81 69 80','M49 37C43 42 39 47 36 53M50 37C56 41 60 45 63 50'],A:['M63 50L64 66H74L75 50Z','M66 50C66 46 72 46 72 50']},
read:{P:['M40 18C34 18 31 23 32.5 28C34 33 40 34.5 43.5 31C47 27.5 45.5 21 41.5 19.6','M39 35C35 44 35 54 38 62C46 61 56 62 64 64C63 72 62 80 60 88','M41 42C47 46 52 47 57 45M41 47C46 52 51 54 57 52'],A:['M55 40C60 37 66 38 70 41V55C66 52 60 51 55 54ZM70 41C73 39 76 39 79 40V54C76 53 73 53 70 55']},
reach:{P:['M46 30C40 30 37 35 38.5 40C40 45 46 46.5 49.5 43C53 39.5 51.5 33 47.5 31.6','M45 47C44 58 44 68 44 78M44 78C41 83 39 87 37 92M44 78C47 83 50 87 53 92','M46 52C40 56 36 60 32 66M47 51C52 44 56 34 58 24'],A:['M61 10L63 16L69 17L64 21L65.5 27L61 23.6L56.5 27L58 21L53 17L59 16Z']},
rest:{P:['M26 40C20.5 40 17.5 45 19 50C20.5 55 26 56.5 29.5 53C33 49.5 31.5 43 27.6 41.6','M33 56C42 58 52 58 60 56C66 55 72 56 78 60','M60 56C66 64 72 68 82 70M40 58C44 52 50 50 56 50','M14 66C30 64 60 64 90 68'],A:['M56 44H66V50C66 53 64 55 61 55C58 55 56 53 56 50ZM66 46H68.5C70.4 46 70.4 50 68.5 50H66M59 36C58 38.4 60.4 39.4 59.6 41.6M63 36C62 38.4 64.4 39.4 63.6 41.6']},
wave:{P:['M48 18C42 18 39 23 40.5 28C42 33 48 34.5 51.5 31C55 27.5 53.5 21 49.5 19.6','M48 35C47 46 46.5 56 47 66M47 66C44 74 42 82 40 92M47 66C50 74 53 82 56 92','M48 42C42 48 38 54 36 62M49 41C55 37 59 30 61 21C62 18 64 16 66 17'],A:['M69 12C72 14 73 17 72 20M73 8C77 11 79 16 77 21']},
duo:{P:['M28 22C22.5 22 19.5 27 21 32C22.5 37 28 38.5 31.5 35C35 31.5 33.5 25 29.6 23.6','M28 39C27 50 27 60 28 70M28 70C26 77 25 84 24 91M28 70C30 77 32 84 33 91','M29 46C35 50 41 52 46 52','M72 24C66.5 24 63.5 29 65 34C66.5 39 72 40.5 75.5 37C79 33.5 77.5 27 73.6 25.6','M72 41C73 52 73 62 72 72M72 72C70 79 69 86 68 92M72 72C74 79 76 86 77 92','M71 48C65 51 60 52 55 52'],A:['M45 46H56V58H45ZM48 50H53M48 53.5H52']},
team:{P:['M22 34C17 34 14.5 38.5 16 43C17.5 47.5 22.5 48.5 25.5 45.5','M21 50C19 58 19 66 20 74','M50 26C44.5 26 41.5 31 43 36C44.5 41 50 42.5 53.5 39C57 35.5 55.5 29 51.6 27.6','M50 43C49 52 49 61 50 70','M78 34C83 34 85.5 38.5 84 43C82.5 47.5 77.5 48.5 74.5 45.5','M79 50C81 58 81 66 80 74','M12 76C36 73 64 73 88 76'],A:['M40 58C46 54 54 54 60 58C55 62 45 62 40 58Z']}};
function figure(pose,{ink='currentColor',acc='var(--accent)',sw=2.4,cls='fig',draw=false}={}){const f=FIG[pose]||FIG.wave;let i=0;const P=p=>`<path d="${p}" ${draw?`pathLength="1" style="--d:${(i++)*0.12}s"`:''}/>`;
 return`<svg class="${cls}${draw?' drawn':''}" viewBox="0 0 100 100" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g stroke="${ink}" stroke-width="${sw}">${f.P.map(P).join('')}</g><g stroke="${acc}" stroke-width="${sw}">${f.A.map(P).join('')}</g></svg>`}
/* ---- avatars: hair shape + shoulders, no face ---- */
const HAIR=['M13 19C12 11 17 7 21 7C26 7 29.5 11 28 19','M12.5 21C11 12 15 7.5 20.5 7.5C26.5 7.5 30 12.5 28 24C27 20 25 16 23 15C20 18 16 19 12.5 21','M14 15C14 9 18 7 21 7.5C26 8 28 11.5 27.5 16C24 15 20 13 18 11C17 13 16 14.5 14 15','M12 23C10 14 14 7 20.5 7.5C27 8 31 14 29 23C30 28 31 31 33 33M12 23C11 28 10 31 8 33','M14.5 12C16 8 19 7 21.5 7C25 7 27 9 27.5 12C25 11 22 10.5 20 11.5C18 10.5 16 11 14.5 12','M13.5 16C12 10 15.5 6.5 20 6.5C23 6.5 25 8 26 10C28 9 30 11 29 14C28 16 27.5 17 27.5 19'];
const AV_COL=['#e08f70','#6fa8f0','#5fc98a','#f0c94f','#ef7b8c','#b28cf0','#4fc4c0','#e0a86a'];
function avatar(p,size=40,cls='av'){const fg=p&&p.fig||{h:0,c:0};const c=AV_COL[(fg.c||0)%AV_COL.length];
 return`<span class="${cls}" style="--ac:${c};width:${size}px;height:${size}px" title="${p?escH(p.name):''}"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${HAIR[(fg.h||0)%HAIR.length]}"/><path d="M14.5 18C14.5 23 17 26 20.5 26C23.5 26 26 23.5 26.5 19.5"/><path d="M17.5 26.5V29.5M23.5 26V29M8 39C9 33 13.5 30 20.5 30C27 30 31 33 32.5 39"/></svg>${p&&p.bot?`<i class="botdot">${ic('bot',2)}</i>`:''}</span>`}
function escH(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
/* ---- posters: one figure, one headline, lots of room ---- */
const POSTERS=[
 {id:'focus',fig:'write',t:'One thing at a time.',s:'FOCUS · ATELIER',acc:'#d9764f',dark:false,wash:'#f0c9b6'},
 {id:'team',fig:'duo',t:'Ideas grow\nin company.',s:'GROUPS · ATELIER',acc:'#4f8ad9',dark:true,wash:'#2a3a52'},
 {id:'rest',fig:'rest',t:'Rest is part\nof the work.',s:'BREAKS · ATELIER',acc:'#3fa86e',dark:false,wash:'#cfe6d4'},
 {id:'think',fig:'think',t:'Leave room to think.',s:'NOTES · ATELIER',acc:'#e0b23f',dark:true,wash:'#4a3f22'},
 {id:'reach',fig:'reach',t:'Small steps, far places.',s:'PROJECTS · ATELIER',acc:'#d9764f',dark:false,wash:'#f2dcc9'},
 {id:'read',fig:'read',t:'Study slowly.\nRemember long.',s:'STUDY · ATELIER',acc:'#8a6fd9',dark:false,wash:'#e2dbf3'},
 {id:'walk',fig:'walk',t:'Show up.\nThen keep going.',s:'EVERY DAY · ATELIER',acc:'#d9764f',dark:true,wash:'#4a2e24'},
 {id:'wave',fig:'wave',t:'Work better, together.',s:'ATELIER',acc:'#3fa86e',dark:true,wash:'#23402f'}];
function posterSVG(po,w){const bg=po.dark?'#1f1d1a':'#f4efe6',ink=po.dark?'#f2ece2':'#24211d',mu=po.dark?'#a39a8c':'#857c70';
 return`<svg class="poster" viewBox="0 0 300 400" ${w?`width="${w}"`:''} xmlns="http://www.w3.org/2000/svg" font-family="Newsreader, Georgia, serif"><rect width="300" height="400" fill="${bg}"/><ellipse cx="168" cy="168" rx="98" ry="84" fill="${po.wash}" opacity="${po.dark?.55:.7}" transform="rotate(-8 168 168)"/>
 <g transform="translate(58 46) scale(2.1)" fill="none">${figure(po.fig,{ink,acc:po.acc,sw:2.1}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g>
 <text x="28" y="${po.t.includes('\n')?312:330}" font-size="27" fill="${ink}" letter-spacing="-.3">${po.t.split('\n').map((l,i)=>`<tspan x="28" dy="${i?31:0}">${escH(l)}</tspan>`).join('')}</text>
 <text x="28" y="364" font-size="9.5" fill="${mu}" letter-spacing="2.4" font-family="Instrument Sans, Helvetica, sans-serif" font-weight="600">${escH(po.s)}</text>
 <g transform="translate(246 342) scale(.5)" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="${MARK_A}" stroke="${ink}"/><path d="${MARK_B}" stroke="${po.acc}"/></g></svg>`}
/* ---- focus clock ---- */
function clockSVG(frac,phase){const R=118,C=2*Math.PI*R,ticks=[];for(let i=0;i<60;i++){const a=i/60*Math.PI*2-Math.PI/2,big=i%5===0,r1=R+16,r2=R+(big?27:22),j=((i*37)%7-3)*.12;
  ticks.push(`<line x1="${(150+Math.cos(a+j*.01)*r1).toFixed(1)}" y1="${(150+Math.sin(a+j*.01)*r1).toFixed(1)}" x2="${(150+Math.cos(a)*r2).toFixed(1)}" y2="${(150+Math.sin(a)*r2).toFixed(1)}" stroke-width="${big?2.2:1.3}" opacity="${big?.75:.35}"/>`)}
 const off=C*(1-Math.max(0,Math.min(1,frac)));const ha=frac*Math.PI*2-Math.PI/2,hx=150+Math.cos(ha)*R,hy=150+Math.sin(ha)*R;
 return`<svg class="clock" viewBox="0 0 300 300" aria-hidden="true"><g stroke="currentColor" stroke-linecap="round">${ticks.join('')}</g>
 <circle cx="150" cy="150" r="${R}" fill="none" stroke="var(--track)" stroke-width="14"/>
 <circle class="arc" cx="150" cy="150" r="${R}" fill="none" stroke="var(--phase)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 150 150)"/>
 <circle class="knob" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="9" fill="var(--bg)" stroke="var(--phase)" stroke-width="4"/></svg>`}
