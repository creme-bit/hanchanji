{
/* ======================= 解密 ======================= */
const K=new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
function sha256(m){const l=m.length,n=((l+9+63)>>6)<<6,b=new Uint8Array(n);b.set(m);b[l]=0x80;const dv=new DataView(b.buffer);dv.setUint32(n-4,l*8);dv.setUint32(n-8,Math.floor(l/0x20000000));
let h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];const w=new Uint32Array(64);const r=(x,k)=>(x>>>k)|(x<<(32-k));
for(let o=0;o<n;o+=64){for(let i=0;i<16;i++)w[i]=dv.getUint32(o+i*4);for(let i=16;i<64;i++){const s0=r(w[i-15],7)^r(w[i-15],18)^(w[i-15]>>>3),s1=r(w[i-2],17)^r(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0}
let [a,b2,c,d,e,f,g,hh]=h;for(let i=0;i<64;i++){const t1=(hh+(r(e,6)^r(e,11)^r(e,25))+((e&f)^(~e&g))+K[i]+w[i])|0,t2=((r(a,2)^r(a,13)^r(a,22))+((a&b2)^(a&c)^(b2&c)))|0;hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=b2;b2=a;a=(t1+t2)|0}
h=[h[0]+a,h[1]+b2,h[2]+c,h[3]+d,h[4]+e,h[5]+f,h[6]+g,h[7]+hh].map(x=>x|0)}const out=new Uint8Array(32);const ov=new DataView(out.buffer);h.forEach((x,i)=>ov.setUint32(i*4,x));return out}
const te=new TextEncoder(),td=new TextDecoder();
const cat=(a,b)=>{const c=new Uint8Array(a.length+b.length);c.set(a);c.set(b,a.length);return c};
const hex=u=>[...u].map(x=>x.toString(16).padStart(2,'0')).join('');
function dec(box,pw){const key=sha256(te.encode('hanchan|'+pw));if(hex(sha256(cat(key,te.encode('chk')))).slice(0,12)!==box.k)return null;
const c=Uint8Array.from(atob(box.c),ch=>ch.charCodeAt(0));const out=new Uint8Array(c.length);
for(let i=0;i*32<c.length;i++){const ctr=new Uint8Array(4);new DataView(ctr.buffer).setUint32(0,i);const s=sha256(cat(key,ctr));for(let j=0;j<32&&i*32+j<c.length;j++)out[i*32+j]=c[i*32+j]^s[j]}return td.decode(out)}

/* ======================= 工具 ======================= */
const S={get(k,d){try{const v=localStorage.getItem('hcj:'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('hcj:'+k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const app=$('app');
let D=null,HD=null;
const st={role:S.get('role',null),pw:S.get('pw',null),codes:S.get('codes',[]),host:S.get('host',null),tab:'world',tries:S.get('tries',0),puzzle:S.get('puzzle',null),
 tasted:S.get('tasted',{}),found:S.get('found',[]),looked:S.get('looked',[]),read:S.get('read',{}),gid:S.get('gid',null),place:S.get('place','前厅'),chat:null,draft:'',pending:[],htab:'run',room:S.get('room',''),sv:null,expect:0};
const cache={},acache={};
const role=()=>D.roles.find(r=>r.id===st.role);
const roleName=id=>(D.roles.find(r=>r.id===id)||{}).name||'';
const cardById=id=>D.cards.find(c=>c.id===id);
function card(c){if(cache[c.id])return cache[c.id];const codes=HD&&!st.role?[HD.codes[c.id]]:st.codes;for(const code of codes){const t=code&&dec(c.e,code+'|'+c.id);if(t){cache[c.id]=JSON.parse(t);return cache[c.id]}}return null}
function asset(id){if(acache[id])return acache[id];const box=D.assets&&D.assets[id];if(!box)return null;const codes=HD&&!st.role?[HD.codes[id]]:st.codes;
 for(const code of codes){const t=code&&dec(box,code+'|'+id+'|a');if(t)return acache[id]=JSON.parse(t)}return null}
function act3(){const r=role();for(const code of st.codes){const t=dec(r.a3,st.pw+'|'+code);if(t)return t}return null}
/* 第一轮的卡：勘查阶段只显示自己找到的和主持人发的 */
function visible(c){if(!card(c))return false;if(c.round!==1)return true;const sv=st.sv;if(!sv||sv.phase!==EXPLORE)return true;
 return st.found.includes(c.id)||(sv.r1rel||[]).includes(c.id)}
let toastT;function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),3200)}
const modal=$('modal'),mbody=$('mbody');
function open(title,html){$('mtitle').textContent=title;mbody.innerHTML=html;modal.classList.add('on');mbody.scrollTop=0}
$('mclose').onclick=()=>{modal.classList.remove('on');render()};
const G3=typeof V3!=='undefined'&&V3.ok();

function tryCode(code){code=String(code).trim();if(!code)return {msg:'请输入口令'};
 const had=st.codes.includes(code);if(!had)st.codes.push(code);let n=0;
 D.cards.forEach(c=>{if(!cache[c.id]){const t=dec(c.e,code+'|'+c.id);if(t){cache[c.id]=JSON.parse(t);n++}}});
 const a3=!!(st.role&&!had&&dec(role().a3,st.pw+'|'+code));
 if(!n&&!a3){if(!had)st.codes.pop();return {msg:had?'这个口令已经用过了':'口令不对'}}
 S.set('codes',st.codes);return {n,a3,msg:(n?`解锁了 ${n} 张线索卡`:'')+(a3?(n?'，':'')+'第三幕已解封':'')}}

/* ======================= 阶段 ======================= */
const PH=[{n:'开场'},{n:'读本'},{n:'自我介绍'},{n:'第一轮 · 勘查现场',pub:'r1'},{n:'第二轮 · 搜证一',ap:3,search:1},{n:'第二轮 · 讨论'},
 {n:'第二轮 · 搜证二',ap:2,search:1},{n:'子时 · 开铁盒',pub:'box'},{n:'第三轮 · 破局',pub:'r3'},{n:'自清'},{n:'最后陈述'},{n:'投票',vote:1},{n:'复盘',reveal:1}];
const EXPLORE=3;const APPV=5;
const GAMES=[{k:'lock',n:'铁盒铜锁',need:'R1-09',tip:'第一轮结束后发布；也可以等有人拿到 R2-14 再发'},{k:'letter',n:'拼残信',need:'R1-08',tip:'第一轮里发布，让找到纸篓的人去拼'},
 {k:'powder',n:'药粉比对',tip:'搜证一开始后发布，有样本的人才能尝'},{k:'mazi',n:'商号码子',need:'R3-06',tip:'第三轮发出小册子以后发布'}];
const R1REL=[['R1-10','开场时说过各人门下都有一封信，把信的样子给大家看'],['R1-11','把下人叫来问话，他们说了这些'],['R1-12','问起后院，老下人说起那口井'],
 ['R1-13','沈家人都知道的老规矩，由主持人当众讲出'],['R1-14','书房抽屉里有一沓药行仿单，主持人拿给大家']];

/* ======================= 同步：主持人 ======================= */
const OPTS=window.PEER_OPTS||{};
const H={peer:null,conns:new Map(),s:S.get('hs',null)};
function hsInit(){if(H.s&&H.s.msgs&&H.s.gid)return;H.s=Object.assign({phase:0,applied:[],pub:[],ap:{},ledger:{},persons:{},votes:{},log:[],games:{},r1rel:[],solved:{}},H.s||{},{msgs:[],gid:Math.random().toString(36).slice(2,10)});hsSave()}
function hsSave(){S.set('hs',H.s)}
let WL=null;function keepAwake(){try{if(navigator.wakeLock&&!WL)navigator.wakeLock.request('screen').then(l=>{WL=l;l.addEventListener('release',()=>{WL=null})}).catch(()=>{})}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&H.peer)keepAwake()});
function hostStart(){hsInit();keepAwake();if(H.peer)return;
 if(!st.room){st.room=String(1000+Math.floor(Math.random()*9000));S.set('room',st.room)}
 if(typeof Peer==='undefined'){toast('同步组件没加载，口令模式仍可用');return}
 H.peer=new Peer('hanchanji-'+st.room,OPTS);
 H.peer.on('open',()=>{render()});
 H.peer.on('error',e=>{if(e.type==='unavailable-id'){H.peer.destroy();H.peer=null;st.room='';S.set('room','');hostStart()}else{toast('连接出错：'+e.type);}});
 H.peer.on('disconnected',()=>{setTimeout(()=>H.peer&&!H.peer.destroyed&&H.peer.reconnect(),2000)});
 H.peer.on('connection',c=>{H.conns.set(c.peer,{c,role:null});
  c.on('data',d=>hostMsg(c,d));c.on('close',()=>{const x=H.conns.get(c.peer);H.conns.delete(c.peer);if(x&&x.role&&![...H.conns.values()].some(y=>y.role===x.role))[...H.conns.values()].forEach(y=>{try{y.c.send({t:'gone',id:x.role})}catch(e){}});render()})})}
function connOf(role){return [...H.conns.values()].filter(x=>x.role===role)}
function stateFor(role){const s=H.s,ph=PH[s.phase];
 const mine=Object.entries(s.ledger).filter(([,r])=>r===role).map(([id])=>HD.codes[id]);
 const msgs=s.msgs.filter(m=>m.to==='all'||m.to===role||m.from===role).map(m=>Object.assign({},m,m.card&&m.from!==role?{code:HD.codes[m.card]}:{}));
 return {t:'state',phase:s.phase,pub:s.pub,mine,ap:s.ap[role]??0,search:!!ph.search,vote:!!ph.vote,myVote:s.votes[role]||null,tally:ph.reveal?tallyVotes():null,
  taken:Object.keys(s.ledger),persons:Object.keys(s.persons),games:s.games,r1rel:s.r1rel,msgs,gid:s.gid,v:APPV}}
function push(role){connOf(role).forEach(x=>{try{x.c.send(stateFor(role))}catch(e){}})}
function pushAll(){hsSave();[...H.conns.values()].forEach(x=>{if(x.role)try{x.c.send(stateFor(x.role))}catch(e){}});render()}
const DEEP={'R2-10':'R2-09'};
function hostMsg(c,d){const x=H.conns.get(c.peer);if(!x||!d||typeof d!=='object')return;
 if(d.t==='hello'&&D.roles.some(r=>r.id===d.role)){x.role=d.role;x.v=d.v||0;push(d.role);[...H.conns.values()].forEach(y=>{if(y!==x&&y.pos&&y.role!==x.role)try{c.send(y.pos)}catch(e){}});render();return}
 const who=x.role;if(!who)return;
 if(d.t==='pos'){const p={t:'pos',id:who,name:roleName(who),f:d.f===2?2:1,x:+d.x||0,z:+d.z||0,g:+d.g||0,yaw:+d.yaw||0,loc:String(d.loc||'').slice(0,30)};x.pos=p;[...H.conns.values()].forEach(y=>{if(y!==x&&y.role&&y.role!==who)try{y.c.send(p)}catch(e){}});return}   // 在宅子里走动：转给其他人
 const s=H.s,ph=PH[s.phase];
 if(d.t==='search'){if(!ph.search)return tell(c,'现在不是搜证时间');
  if(d.person){const pid=HD.persons[roleName(d.person)];if((s.ap[who]??0)<2)return tell(c,'行动点不够（搜人要 2 点）');
   if(d.person===who)return tell(c,'不能搜自己');if(s.persons[d.person])return tell(c,'这个人已经被搜过了');
   s.ap[who]-=2;s.persons[d.person]=who;s.ledger[pid]=who;s.log.unshift(`${roleName(who)} 搜了 ${roleName(d.person)} 的身`);
   tell(c,`搜到了：${roleName(d.person)}的随身物品`);connOf(d.person).forEach(y=>tell(y.c,'有人搜了你的身'));pushAll();return}
  if((s.ap[who]??0)<1)return tell(c,'行动点用完了');
  let next;
  if(Array.isArray(d.cards)){next=d.cards.map(cardById).find(k=>k&&k.round===2&&k.loc===d.loc&&!k.public&&!s.ledger[k.id]&&(!DEEP[k.id]||s.ledger[DEEP[k.id]]));
   if(!next)return tell(c,'这里已经被人翻过了')}
  else next=D.cards.find(k=>k.round===2&&k.loc===d.loc&&!k.public&&!s.ledger[k.id]);
  s.ap[who]-=1;
  if(!next){s.log.unshift(`${roleName(who)} 搜了 ${d.loc}，没东西了`);tell(c,'这里已经有人来过了，什么也没找到');pushAll();return}
  s.ledger[next.id]=who;s.log.unshift(`${roleName(who)} 搜 ${d.loc} → ${next.id} ${HD.titles[next.id]}`);pushAll();return}
 if(d.t==='share'&&d.id){d={t:'chat',to:d.to==='all'?'all':(Array.isArray(d.to)?d.to[0]:d.to),card:d.id,text:d.note||''}}
 if(d.t==='chat'){const to=d.to==='all'?'all':(D.roles.some(q=>q.id===d.to)&&d.to!==who?d.to:null);if(!to)return;
  const card=d.card&&cardById(d.card)&&HD.codes[d.card]?d.card:null,text=String(d.text||'').slice(0,300).trim();if(!card&&!text)return;
  s.msgs.push({i:s.msgs.length+1,from:who,to,text,card,t:Date.now()});
  if(card)s.log.unshift(`${roleName(who)} 把 ${card} ${HD.titles[card]} 给 ${to==='all'?'所有人':roleName(to)} 看了`);
  pushAll();return}
 if(d.t==='solved'&&GAMES.some(g=>g.k===d.g)){const l=s.solved[d.g]=s.solved[d.g]||[];if(!l.includes(who)){l.push(who);s.log.unshift(`${roleName(who)} 解开了「${GAMES.find(g=>g.k===d.g).n}」`);pushAll()}return}
 if(d.t==='vote'&&ph.vote){s.votes[who]={a:d.a,b:d.b,c:d.c};s.log.unshift(`${roleName(who)} 投了票`);tell(c,'票已投出，开票前还能改');pushAll()}}
function tell(c,m){try{c.send({t:'msg',m})}catch(e){}}
function setPhase(i){const s=H.s;i=Math.max(0,Math.min(PH.length-1,i));s.phase=i;const ph=PH[i];
 if(!s.applied.includes(i)){s.applied.push(i);
  if(ph.pub==='r1')s.pub.push(HD.r1);
  if(ph.pub==='box')s.pub.push(HD.box);
  if(ph.pub==='r3')['R3-01','R3-06','R3-08'].forEach(k=>s.pub.push(HD.codes[k]));
  if(ph.ap)D.roles.forEach(r=>s.ap[r.id]=(s.ap[r.id]??0)+ph.ap)}
 pushAll()}
function tallyVotes(){const t={a:{},b:{},c:{}};Object.values(H.s.votes).forEach(v=>['a','b','c'].forEach(k=>{if(v[k])t[k][v[k]]=(t[k][v[k]]||0)+1}));return t}

/* ======================= 同步：玩家 ======================= */
const P={peer:null,conn:null,on:false,timer:null};
function joinRoom(){if(!st.room||!st.role||P.peer)return;if(typeof Peer==='undefined')return;
 P.peer=new Peer(undefined,OPTS);
 P.peer.on('open',()=>dial());
 P.peer.on('error',e=>{if(e.type==='peer-unavailable'){P.on=false;render();retry()}});
 P.peer.on('disconnected',()=>{setTimeout(()=>P.peer&&!P.peer.destroyed&&P.peer.reconnect(),2000)})}
function dial(){const c=P.peer.connect('hanchanji-'+st.room,{reliable:true});P.conn=c;
 c.on('open',()=>{P.on=true;c.send({t:'hello',role:st.role,v:APPV});render()});
 c.on('data',onHost);c.on('close',()=>{P.on=false;render();retry()})}
function retry(){clearTimeout(P.timer);P.timer=setTimeout(()=>{if(P.peer&&!P.peer.destroyed&&!P.on)dial()},4000)}
function leaveRoom(){try{P.peer&&P.peer.destroy()}catch(e){}P.peer=null;P.on=false}
const PEERS={};
function onHost(d){if(!d||typeof d!=='object')return;
 if(d.t==='pos'){if(d.id===st.role)return;PEERS[d.id]=d;if(WALK&&WALK.peer)WALK.peer(d.id,d);return}
 if(d.t==='gone'){delete PEERS[d.id];if(WALK&&WALK.peerGone)WALK.peerGone(d.id);return}
 if(d.t==='msg'){toast(String(d.m));return}
 if(d.t==='state'){
  if(d.gid&&st.gid&&d.gid!==st.gid)wipe();if(d.gid&&d.gid!==st.gid){st.gid=d.gid;S.set('gid',d.gid)}
  const oldN=st.sv?(st.sv.msgs||[]).length:null;
  st.pending=st.pending.filter(p=>!(d.msgs||[]).some(m=>m.from===st.role&&m.to===p.to&&m.text===p.text&&(m.card||null)===(p.card||null)&&m.t>=p.t-60000));
  const before=st.sv?st.sv.phase:null,had=new Set(D.cards.filter(c=>card(c)).map(c=>c.id));st.sv=d;let a3=false;
  if(oldN!==null)(d.msgs||[]).slice(oldN).forEach(m=>{if(m.from!==st.role&&!(st.tab==='msg'&&st.chat===ckey(m)))toast(`${roleName(m.from)}${m.to==='all'?'（对所有人）':''}：${m.text||'给你看了一张线索'}`)});
  [...(d.pub||[]),...(d.mine||[]),...(d.msgs||[]).map(x=>x.code)].forEach(code=>{if(code&&!st.codes.includes(String(code))){const r=tryCode(code);a3=a3||r.a3}});
  const fresh=D.cards.filter(c=>card(c)&&!had.has(c.id)&&visible(c)&&c.round!==1);
  if(before!==null&&before!==d.phase)toast('进入：'+PH[d.phase].n);
  if(fresh.length)setTimeout(()=>toast(`新到 ${fresh.length} 张线索`+(a3?'，第三幕已解封':'')),before!==d.phase?1600:0);else if(a3)toast('第三幕已解封');
  if(st.expect&&fresh.length){st.expect=0;render();showCard(fresh[fresh.length-1].id);return}
  if((d.vote||d.tally)&&before!==d.phase)st.tab='vote';
  render()}}
function wipe(){st.codes=[];st.found=[];st.looked=[];S.set('looked',[]);st.tries=0;st.puzzle=null;st.tasted={};st.read={};st.chat=null;st.place='前厅';
 ['codes','found','tries','puzzle','tasted','read','pz2','place'].forEach(k=>{try{localStorage.removeItem('hcj:'+k)}catch(e){}});
 Object.keys(cache).forEach(k=>delete cache[k]);Object.keys(acache).forEach(k=>delete acache[k]);PZ=null;PZfit=null;
 if(LOCK){try{LOCK.el.remove()}catch(e){}LOCK=null}setTimeout(()=>toast('主持人重新开了一局，你的进度已清空'),300)}
function send(o){if(P.conn&&P.on){P.conn.send(o);return true}toast('还没连上主持人');return false}

/* ======================= 舞台：3D 地图 ======================= */
const stage=$('stage');let MAP=null,WALK=null,LOCK=null;
function useStage(mode){if(!G3||!mode){stage.style.display='none';return}
 stage.style.display='';stage.dataset.mode=mode;const walk=mode==='play'&&st.place!=='map';stage.dataset.walk=walk?1:'';
 V3.ready().then(()=>{
  if(!walk){if(!MAP){MAP=V3.map();MAP.state=locState;MAP.onPick=pickLoc}
   if(MAP.el.parentNode!==stage){stage.innerHTML='';const ph=document.createElement('div');stage.appendChild(ph);MAP.attach(ph)}
   MAP.home(mode==='home');MAP.refresh();return}
  if(!WALK){WALK=V3.walk();WALK.onMove=p=>{if(P.conn&&P.on)try{P.conn.send(Object.assign({t:'pos'},p))}catch(e){}};if(WALK.peer)Object.keys(PEERS).forEach(k=>WALK.peer(k,PEERS[k]));WALK.state=spotState;WALK.onSpot=spotTap;WALK.onBack=()=>{st.place='map';S.set('place','map');render()};WALK.onRoom=r=>{st.place=r;S.set('place',r);walkInfo();const mb=app.querySelector('.mapbar');if(mb)mb.outerHTML=mapOverlay(true),bindAct()}}
  if(WALK.el.parentNode!==stage){stage.innerHTML='';WALK.attach(stage)}
  if(WALK.loc()!==st.place)WALK.enter(st.place,V3.label(st.place),'');walkInfo()}).catch(()=>{stage.style.display='none'})}
function locLeft(loc){const sv=st.sv;return D.cards.filter(c=>c.round===2&&!c.public&&c.loc===loc&&!(sv&&sv.taken.includes(c.id))).length}
function locState(loc){const sv=st.sv;if(!P.on||!sv)return '';
 if(sv.phase===EXPLORE)return loc==='书房'?'look':'';
 if(!sv.search)return '';if(!locLeft(loc))return 'done';return sv.ap>=1?'can':''}
function pickLoc(loc,name){if(G3&&V3.canWalk(loc)){st.place=loc;S.set('place',loc);render();return}
 const sv=st.sv,left=locLeft(loc);let h=`<h3>${esc(name)}</h3>`;const can=P.on&&sv&&sv.search&&left&&sv.ap>=1;
 h+=can?`<p>搜这里花 1 点行动点，你还剩 ${sv.ap} 点。</p>`:'<p class="fine">现在不能搜这里。</p>';
 sheet(h+`<div class="row2"><button class="btn" data-sheet="x">${can?'算了':'知道了'}</button>${can?'<button class="btn red" data-sheet="go">搜这里</button>':''}</div>`,k=>{if(k==='go'&&send({t:'search',loc}))st.expect=1})}
function walkInfo(){if(!WALK)return;const sv=st.sv;WALK.info(sv&&sv.search?`行动点 ${sv.ap}`:(sv&&sv.phase===EXPLORE&&WALK.loc()==='书房'?'勘查现场':''));
 WALK.sub(`<span class="dot ${P.on?'on':''}"></span>${sv?esc(PH[sv.phase].n):(P.on?'已连上主持人':'未连上主持人')}`);WALK.refresh()}
function spotState(loc,sp){return (st.looked||[]).includes(loc+'|'+sp.n)?'done':''}  // 不提示哪里有线索，只标出自己看过的地方
function spotTap(loc,sp){const sv=st.sv;{const k=loc+'|'+sp.n;st.looked=st.looked||[];if(!st.looked.includes(k)){st.looked.push(k);S.set('looked',st.looked)}if(WALK)WALK.refresh()}const say=(h,btn)=>sheet(`<h3>${esc(sp.n)}</h3>${h}<div class="row2"><button class="btn" data-sheet="x">${btn?'算了':'知道了'}</button>${btn?`<button class="btn red" data-sheet="go">${btn}</button>`:''}</div>`,k=>{if(k==='go')go()});
 let go=()=>{};
 if(sv&&sv.phase===EXPLORE&&loc==='书房'&&sp.r1){const ids=sp.r1;const nw=ids.filter(id=>!st.found.includes(id));st.found.push(...nw);S.set('found',st.found);
  if(nw.length){toast(`记下了 ${nw.length} 张线索`);render();WALK.refresh();showCard(nw[0]);return}
  return say(`<p>${esc(sp.t)}</p><p class="fine">这里看过了，线索在「线索」里。</p>`)}
 if(sv&&sv.search&&sp.r2){const left=sp.r2.filter(id=>!sv.taken.includes(id));
  if(!left.length)return say(`<p>${esc(sp.t)}</p><p class="fine">这里已经被人翻过了。</p>`);
  if(sv.ap<1)return say(`<p>${esc(sp.t)}</p><p class="fine">你的行动点用完了。</p>`);
  go=()=>{if(send({t:'search',loc,cards:sp.r2}))st.expect=1};
  return say(`<p>${esc(sp.t)}</p><p>仔细搜一搜要花 1 点行动点，你还剩 ${sv.ap} 点。</p>`,'仔细搜')}
 say(`<p>${esc(sp.t)}</p>${sv&&!sv.search&&sp.r2?'<p class="fine">搜证开始以后，这里可以仔细搜。</p>':''}`)}

function sheet(html,cb){let el=$('sheet');if(!el){el=document.createElement('div');el.id='sheet';el.className='sheet';document.body.appendChild(el)}
 el.innerHTML=html;requestAnimationFrame(()=>el.classList.add('on'));
 el.querySelectorAll('[data-sheet]').forEach(b=>b.onclick=()=>{el.classList.remove('on');try{MAP&&MAP.clear()}catch(e){}cb&&cb(b.dataset.sheet,el)})}

/* ======================= 页面：首页 ======================= */
function home(){useStage('home');app.innerHTML=`<div class="hero"><div><div class="title">寒蟬記</div><div class="seal">寒<br>蝉</div>
<p class="sub">民国二十三年 · 腊月廿三 · 青浦沈公馆</p>
<div class="wrap" style="max-width:420px;margin-top:28px">
<button class="btn glass" data-go="opening">开场<small>故事从这里开始</small></button>
<button class="btn red" data-go="pick">我是玩家</button>
<button class="btn glass" data-go="hostlogin" style="text-align:center">我是主持人</button></div></div></div>`}
function pick(){useStage('home');app.innerHTML=`<div class="top"><div class="who">选择你的角色<small>只选主持人发给你的那一个</small></div><button class="pill" data-go="home">返回</button></div>
<div class="wrap">${D.roles.map(r=>`<button class="btn glass" data-role="${r.id}">${esc(r.name)}<small>${esc(r.sa)} · ${esc(r.ident)}</small></button>`).join('')}</div>`}
function login(rid){useStage('home');const r=D.roles.find(x=>x.id===rid);app.innerHTML=`<div class="top"><div class="who">${esc(r.name)}<small>输入主持人私下给你的密码和房间号</small></div><button class="pill" data-go="pick">返回</button></div>
<div class="wrap"><p class="fine">六位密码</p><div class="code"><input id="pw" inputmode="numeric" autocomplete="off" placeholder="六位密码"></div>
<p class="fine">房间号（主持人屏幕上那四位数，没有可以先空着）</p><div class="code"><input id="rm" inputmode="numeric" autocomplete="off" placeholder="房间号" value="${esc(st.room||'')}"></div>
<button class="btn red" id="pwgo">进入</button><div class="msg" id="pwm"></div></div>`;
 const go=()=>{const v=$('pw').value.trim();if(!dec(r.a12,v)){$('pwm').textContent='密码不对';return}
  st.role=rid;st.pw=v;S.set('role',rid);S.set('pw',v);st.room=$('rm').value.trim();S.set('room',st.room);st.tab='world';view='player';joinRoom();render()};
 $('pwgo').onclick=go}

/* ======================= 页面：玩家 ======================= */
function phaseBar(){const sv=st.sv;return (sv&&(sv.v||0)!==APPV?`<div class="warn">${(sv.v||0)>APPV?'你的网页是旧版本，请刷新一下页面':'主持人的网页是旧版本，请主持人刷新一下页面'}</div>`:'')+`<div class="phase"><span><span class="dot ${P.on?'on':''}"></span>${P.on?'已连上主持人':(st.room?'正在连接房间 '+esc(st.room):'未加入房间')}</span>${sv?`<b>${esc(PH[sv.phase].n)}</b>`:''}</div>`}
function ckey(m){return m.to==='all'?'all':(m.from===st.role?m.to:m.from)}
function unreadOf(k){const ms=((st.sv&&st.sv.msgs)||[]).filter(m=>ckey(m)===k&&m.from!==st.role);return Math.max(0,ms.length-(st.read[k]||0))}
function unreadAll(){return ['all',...D.roles.map(r=>r.id)].reduce((n,k)=>n+(k===st.role?0:unreadOf(k)),0)}
function player(){const r=role(),sv=st.sv;
 if(st.tab==='msg'&&st.chat&&app.dataset.chat===st.chat&&$('chatbox')&&$('chatin')){softChat();return}
 app.dataset.chat=st.tab==='msg'&&st.chat?st.chat:'';
 const tabs=[['book','本','本子'],['clue','线','线索'],['world','館','公馆'],['game','机','机关'],['msg','信','交流']];
 if(sv&&(sv.vote||sv.tally))tabs.push(['vote','票','投票']);
 if(!tabs.some(t=>t[0]===st.tab))st.tab='world';
 const world=st.tab==='world'&&G3,walking=world&&st.place!=='map';
 let body='';
 if(st.tab==='world')body=G3?mapOverlay(walking):mapFallback();
 if(st.tab==='book'){const a=dec(r.a12,st.pw),b=act3();body=`<div class="book">${a}</div>${b?`<div class="book">${b}</div>`:`<div class="lock">第三幕还封着<br><span class="fine">子时铁盒打开时会自动解封</span></div>`}`}
 if(st.tab==='clue')body=clueList();
 if(st.tab==='game')body=games();
 if(st.tab==='msg')body=st.chat?chatView():msgList();
 if(st.tab==='vote')body=voteView();
 useStage(world?'play':null);
 document.body.classList.toggle('onmap',world);document.body.classList.toggle('walking',walking);
 const inp=$('chatin');if(inp)st.draft=inp.value;const focus=document.activeElement&&document.activeElement.id==='chatin';
 const un=unreadAll();
 app.innerHTML=(walking?'':`<div class="top ${world?'float':''}"><div class="who">${esc(r.name)}<small>${esc(r.ident)}</small></div><button class="pill" data-go="logout">换人</button></div>${phaseBar()}`)+`<div class="wrap ${world?'float':''}">${body}</div>
 <nav class="nav" style="grid-template-columns:repeat(${tabs.length},1fr)">${tabs.map(([k,i,t])=>`<button class="${st.tab===k?'on':''} ${k==='world'?'mid':''}" data-tab="${k}"><b>${i}</b>${t}${k==='msg'&&un?`<em>${un}</em>`:''}</button>`).join('')}</nav>`;
 if(st.tab==='game')bindGames();if(st.tab==='vote'||st.tab==='world')bindAct();if(st.tab==='msg')bindChat(focus);
 if(walking)walkInfo()}
function mapOverlay(walking){const sv=st.sv;let h='<div class="mapbar">';
 if(!walking)h+=`<button class="chip gold" id="tohall">回前厅</button>`;
 if(sv&&sv.phase===EXPLORE&&st.place!=='书房')h+='<span class="chip gold">勘查现场：去书房看看</span>';
 if(sv&&sv.search)h+=`${walking?'':`<span class="chip gold">行动点 ${sv.ap}</span>`}<button class="chip" id="persons">搜身</button><button class="chip" id="loclist">地点列表</button>`;
 if(!walking&&(!sv||(!sv.search&&sv.phase!==EXPLORE)))h+='<span class="chip">点房间名可以走进去</span>';
 return h+'</div>'}
function mapFallback(){const sv=st.sv;let h=`<div class="grp">平面图</div><div class="maps">${D.maps.map(m=>`<button data-map="${m.id}"><img src="maps/${m.id}.jpg" alt="${esc(m.name)}" loading="lazy"><span>${esc(m.name)}</span></button>`).join('')}</div>`;
 if(sv&&sv.search)h+=`<div class="grp">搜证<small>剩 ${sv.ap} 点</small></div>`+locRows()+personRows();return h}
function locRows(){const sv=st.sv;const locs=[...new Set(D.cards.filter(c=>c.round===2&&!c.public&&c.loc!=='随身物品').map(c=>c.loc))];
 return locs.map(l=>`<div class="row loc"><span class="t">${esc(l)}<small>${locLeft(l)?'':'已经翻遍了'}</small></span><button class="pill" data-search="${esc(l)}" ${sv.ap<1||!locLeft(l)?'disabled':''}>搜</button></div>`).join('')}
function personRows(){const sv=st.sv;return D.roles.filter(x=>x.id!==st.role).map(x=>`<div class="row loc"><span class="t">${esc(x.name)}<small>${sv.persons.includes(x.id)?'已被搜过':''}</small></span><button class="pill" data-person="${x.id}" ${sv.ap<2||sv.persons.includes(x.id)?'disabled':''}>搜身</button></div>`).join('')}
function clueList(){let h='';const sv=st.sv;
 [1,2,3].forEach(n=>{const got=D.cards.filter(c=>c.round===n&&!c.public&&visible(c));const all=D.cards.filter(c=>c.round===n&&!c.public).length;
  h+=`<div class="grp">第${'一二三'[n-1]}轮<small>已得 ${got.length} / ${all}</small></div>`+(got.length?got.map(c=>{const x=card(c);const from=sv&&(sv.msgs||[]).find(m=>m.card===c.id&&m.from!==st.role);
   return `<div class="row" data-card="${c.id}"><span class="id">${c.id}</span><span class="t">${esc(x.title)}<small>${esc(c.loc||'')}${from?` · ${esc(roleName(from.from))}给你看的`:''}</small></span>›</div>`}).join(''):`<p class="fine">${n===1&&sv&&sv.phase===EXPLORE?'进书房看看，点亮的地方都可以查看。':'还没有'}</p>`)});
 return h+`<details style="margin-top:28px"><summary class="fine">手动输入口令（连不上主持人时用）</summary>${codeBox('cc')}</details>`}
function msgList(){const sv=st.sv;if(!sv)return '<p class="fine">连上主持人以后，可以在这里和别人私聊、给别人看线索。</p>';
 const ms=sv.msgs||[];const last=k=>{const l=ms.filter(m=>ckey(m)===k);return l[l.length-1]};
 const keys=['all',...D.roles.filter(r=>r.id!==st.role).map(r=>r.id)].sort((a,b)=>a==='all'?-1:b==='all'?1:((last(b)||{}).t||0)-((last(a)||{}).t||0));
 return `<div class="grp">交流<small>点一个人进入私聊</small></div>`+keys.map(k=>{const l=last(k),u=unreadOf(k);const prev=l?`${l.from===st.role?'我：':(k==='all'?roleName(l.from)+'：':'')}${l.text||'［线索］'+(l.card||'')}`:(k==='all'?'说给所有人听的话':'');
  return `<div class="row convo" data-chat="${k}"><span class="av">${k==='all'?'众':esc(roleName(k)[0])}</span><span class="t">${k==='all'?'所有人':esc(roleName(k))}<small>${esc(prev)}</small></span>${u?`<em class="badge">${u}</em>`:'›'}</div>`}).join('')}
function chatMsgs(){const sv=st.sv,k=st.chat;const ms=((sv&&sv.msgs)||[]).filter(m=>ckey(m)===k);
 st.read[k]=ms.filter(m=>m.from!==st.role).length;S.set('read',st.read);
 const bub=(m,pend)=>{const me=m.from===st.role,c=m.card&&cardById(m.card),x=c&&card(c);
  return `<div class="msg-row ${me?'me':''} ${pend?(pend==='fail'?'fail':'pend'):''}">${k==='all'&&!me?`<span class="nm">${esc(roleName(m.from))}</span>`:''}<div class="bub">${m.card?`<div class="cchip" data-card="${m.card}"><i>${c&&c.loc==='随身物品'?'身':STAMP[c?c.round:2]}</i><span>${m.card}<b>${esc(x?x.title:'')}</b></span></div>`:''}${m.text?`<p>${esc(m.text)}</p>`:''}</div>${pend==='fail'?`<button class="retry" data-retry="${m.t}">没发出去，点这里重发</button>`:pend?'<span class="nm">发送中…</span>':''}</div>`};
 const pend=st.pending.filter(p=>p.to===k).map(p=>bub(Object.assign({from:st.role},p),Date.now()-p.t>6000?'fail':'pend'));
 return (ms.map(m=>bub(m)).join('')+pend.join(''))||'<p class="fine" style="text-align:center;margin-top:40px">还没有说过话</p>'}
function chatView(){const k=st.chat;
 return `<div class="chat-h"><button class="pill" id="chatback">‹ 返回</button><b>${k==='all'?'所有人':esc(roleName(k))}</b><span class="fine">${k==='all'?'所有人都看得到':'只有你们两个看得到'}</span></div>
 <div class="chat" id="chatbox">${chatMsgs()}</div>
 <div class="composer"><button class="pill" id="chatcard">线索</button><input id="chatin" maxlength="300" placeholder="说点什么" autocomplete="off" enterkeyhint="send"><button class="pill send" id="chatsend">发送</button></div>`}
function softChat(){const box=$('chatbox');const atEnd=window.innerHeight+scrollY>=document.body.scrollHeight-80;box.innerHTML=chatMsgs();bindRetry();
 const ph=app.querySelector('.phase');if(ph)ph.outerHTML=phaseBar();
 const un=unreadAll(),nb=app.querySelector('[data-tab=msg]');if(nb){const em=nb.querySelector('em');if(un){if(em)em.textContent=un;else nb.insertAdjacentHTML('beforeend',`<em>${un}</em>`)}else if(em)em.remove()}
 if(atEnd)scrollTo(0,document.body.scrollHeight)}
function chatSend(o){const p=Object.assign({t:Date.now()},o);st.pending.push(p);if(!send(Object.assign({t:'chat'},o)))p.t=0;render();scrollTo(0,document.body.scrollHeight);
 setTimeout(()=>{if(st.pending.includes(p))render()},6500)}
function bindRetry(){app.querySelectorAll('[data-retry]').forEach(b=>b.onclick=()=>{const p=st.pending.find(x=>String(x.t)===b.dataset.retry);if(!p)return;st.pending=st.pending.filter(x=>x!==p);chatSend({to:p.to,text:p.text,card:p.card})})}
function bindChat(focus){
 app.querySelectorAll('[data-chat]').forEach(b=>b.onclick=()=>{st.chat=b.dataset.chat;render();scrollTo(0,document.body.scrollHeight)});
 const bk=$('chatback');if(bk)bk.onclick=()=>{st.chat=null;render()};
 const inp=$('chatin');if(!inp)return;inp.value=st.draft||'';if(focus)inp.focus();
 const box=$('chatbox');if(box)scrollTo(0,document.body.scrollHeight);
 bindRetry();
 const go=()=>{const t=inp.value.trim();if(!t)return;inp.value='';st.draft='';chatSend({to:st.chat,text:t});const i2=$('chatin');if(i2)i2.focus()};
 $('chatsend').onclick=go;inp.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing&&e.keyCode!==229){e.preventDefault();go()}};
 $('chatcard').onclick=()=>{const own=D.cards.filter(c=>!c.public&&visible(c));
  sheet(`<h3>给${st.chat==='all'?'所有人':esc(roleName(st.chat))}看哪张？</h3><div style="max-height:52vh;overflow:auto">${own.map(c=>`<div class="row" data-pickcard="${c.id}"><span class="id">${c.id}</span><span class="t">${esc(card(c).title)}<small>${esc(c.loc||'')}</small></span>›</div>`).join('')||'<p class="fine">你手里还没有线索卡</p>'}</div><div class="row2"><button class="btn" data-sheet="x">算了</button></div>`);
  $('sheet').querySelectorAll('[data-pickcard]').forEach(r=>r.onclick=()=>{$('sheet').classList.remove('on');const t=inp.value.trim();inp.value='';st.draft='';chatSend({to:st.chat,card:r.dataset.pickcard,text:t})})}}
function voteView(){const sv=st.sv;if(!sv)return '';
 if(sv.vote){const mv=sv.myVote||{};const sel=(k)=>`<select id="v${k}" style="max-width:none;width:100%"><option value="">请选择</option>${D.roles.map(x=>`<option value="${x.id}" ${mv[k]===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}<option value="none" ${mv[k]==='none'?'selected':''}>没有人 / 不知道</option></select>`;
  return `<div class="grp">投票</div><p>第一票：谁杀了沈伯衡？</p>${sel('a')}<p>第二票：谁往尸体上扎了那一刀？</p>${sel('b')}<p>加分题：沈鹤年是谁杀的？</p>${sel('c')}<button class="btn red" id="vote">${sv.myVote?'改票':'投出'}</button><p class="fine">主持人开票前都可以改。</p>`}
 const T=sv.tally;if(!T)return '';const row=(k,q)=>`<div class="grp">${q}</div>`+(Object.entries(T[k]).sort((a,b)=>b[1]-a[1]).map(([id,n])=>`<div class="row"><span class="t">${esc(roleName(id)||'没有人')}</span><b>${n} 票</b></div>`).join('')||'<p class="fine">无人投</p>');
 return row('a','谁杀了沈伯衡')+row('b','谁扎的那一刀')+row('c','沈鹤年是谁杀的')}
function codeBox(id){return `<div class="code"><input id="${id}" inputmode="numeric" autocomplete="off" placeholder="口令 / 卡号"><button class="pill" data-code="${id}">解锁</button></div><div class="msg" id="${id}m"></div>`}
function bindAct(){
 app.querySelectorAll('[data-search]').forEach(b=>b.onclick=()=>{if(send({t:'search',loc:b.dataset.search}))st.expect=1});
 app.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{if(send({t:'search',person:b.dataset.person}))st.expect=1});
 const th=$('tohall');if(th)th.onclick=()=>{st.place='前厅';S.set('place','前厅');render()};
 const ps=$('persons');if(ps)ps.onclick=()=>{sheet(`<h3>搜身</h3><p class="fine">搜一个人花 2 点，每人整局只能被搜一次。</p>${personRows()}<div class="row2"><button class="btn" data-sheet="x">关上</button></div>`);
  $('sheet').querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{$('sheet').classList.remove('on');if(send({t:'search',person:b.dataset.person}))st.expect=1})};
 const ll=$('loclist');if(ll)ll.onclick=()=>{sheet(`<h3>地点</h3><p class="fine">走进房间点具体的地方搜，更像真的；也可以在这里直接搜，会按顺序翻到下一张。</p><div style="max-height:50vh;overflow:auto">${locRows()}</div><div class="row2"><button class="btn" data-sheet="x">关上</button></div>`);
  $('sheet').querySelectorAll('[data-search]').forEach(b=>b.onclick=()=>{$('sheet').classList.remove('on');if(send({t:'search',loc:b.dataset.search}))st.expect=1})};
 const v=$('vote');if(v)v.onclick=()=>send({t:'vote',a:$('va').value,b:$('vb').value,c:$('vc').value})}

/* ======================= 线索卡 ======================= */
const STAMP={1:'勘',2:'搜',3:'匣'};
function cardHTML(c,x){let extra='';
 if(x.sample)extra+=`<p class="note"><b>药粉样本 ${x.sample.id}</b>（${esc(x.sample.from)}）· 主持人发布「药粉比对」后可以尝。</p>`;
 if(x.map){const a=asset(c.id);if(a)extra+=`<button class="imgbtn" data-zimg="${c.id}"><img src="${a.img}" alt="露台鞋印图"><span>点开放大</span></button>`}
 if(x.puzzle)extra+=`<p class="note">碎纸在「机关 · 拼残信」里，主持人发布后可以拼。</p>`;
 if(x.lock)extra+=`<p class="note">铜锁在「机关 · 铁盒铜锁」里，主持人发布后可以试。</p>`;
 const stamp=c.loc==='随身物品'?'身':STAMP[c.round];
 return `<div class="slip card"><div class="stamp">${stamp}</div><div class="meta">${c.id}${c.loc?' · '+esc(c.loc):''}</div><h3>${esc(x.title)}</h3>${x.html}${extra}<div class="foot">沈公馆 · 腊月廿三夜</div></div>`}
function showCard(id){const c=cardById(id),x=card(c);if(!x)return;
 const can=st.role&&P.on&&!(c.round===1&&st.sv&&st.sv.phase!==EXPLORE);
 open(c.id,cardHTML(c,x)+(can?`<button class="btn" id="share" style="text-align:center">给别人看</button>`:''));
 const b=$('share');if(b)b.onclick=()=>shareSheet(id)}
function shareSheet(id){const others=D.roles.filter(r=>r.id!==st.role);
 sheet(`<h3>把 ${id} 给谁看？</h3><p class="fine">会发到你们的私聊里，可以接着说话。</p><div class="pick">${others.map(r=>`<label><input type="radio" name="to" value="${r.id}"> ${esc(r.name)}</label>`).join('')}<label class="all"><input type="radio" name="to" value="all"> 所有人</label></div>
 <input id="note" class="note-in" maxlength="300" placeholder="附一句话（可不填）"><div class="row2"><button class="btn" data-sheet="x">算了</button><button class="btn red" data-sheet="go">发过去</button></div>`,(k,el)=>{
  if(k!=='go')return;const v=el.querySelector('input[name=to]:checked');if(!v)return toast('没选人');
  modal.classList.remove('on');st.tab='msg';st.chat=v.value;chatSend({to:v.value,card:id,text:el.querySelector('#note').value.trim()})})}
function showImg(title,src){open(title,`<div style="display:flex;gap:8px;margin-bottom:8px"><button class="pill" data-z="1">适应</button><button class="pill" data-z="2">放大</button><button class="pill" data-z="3">再大</button></div><div class="zoom" id="zm"><img src="${src}" alt=""></div>`)}
function showMap(id){const m=D.maps.find(x=>x.id===id);showImg(m.name,`maps/${id}.jpg`)}

/* ======================= 残信拼图 ======================= */
let PZ=null,PZfit=null;const BW=1100,BH=1900,FX=100,FY=70;
function pzState(A){let s=S.get('pz2',null);if(!s||s.length!==A.pieces.length){const R=()=>Math.random();
 s=A.pieces.map(p=>{const m=Math.max(p.w,p.h)/2;return {x:m+R()*(BW-2*m),y:m+R()*(BH-2*m),r:[90,180,270,0,90,180][Math.floor(R()*6)],ok:0}});S.set('pz2',s)}return s}
function pzDone(){const s=S.get('pz2',null);return !!(s&&s.length&&s.every(p=>p.ok))}
function puzzleEl(){const A=asset('R1-08');if(!A)return null;if(PZ)return PZ;const s=pzState(A);
 const el=document.createElement('div');el.className='pz';el.innerHTML=`<div class="frame" style="left:${FX/BW*100}%;top:${FY/BH*100}%;width:${A.W/BW*100}%;height:${A.H/BH*100}%"></div>`;
 let k=1;const imgs=A.pieces.map((p,i)=>{const im=new Image();im.src=p.img;im.draggable=false;el.appendChild(im);im.style.zIndex=s[i].ok?0:++k;return im});
 let sc=1;const pos=i=>{const p=A.pieces[i],q=s[i];const im=imgs[i];im.style.width=p.w*sc+'px';im.style.height=p.h*sc+'px';
  im.style.transform=`translate(${(q.x-p.w/2)*sc}px,${(q.y-p.h/2)*sc}px) rotate(${q.r}deg)`;im.classList.toggle('ok',!!q.ok)};
 PZfit=()=>{const w=el.getBoundingClientRect().width||340;sc=w/BW;el.style.height=(s.every(q=>q.ok)?FY*2+A.H:BH)*sc+'px';imgs.forEach((_,i)=>pos(i))};
 new ResizeObserver(()=>PZfit()).observe(el);
 imgs.forEach((im,i)=>{let d=null;
  im.addEventListener('pointerdown',e=>{if(s[i].ok)return;e.preventDefault();im.setPointerCapture(e.pointerId);im.style.zIndex=++k;d={x:e.clientX,y:e.clientY,m:0}});
  im.addEventListener('pointermove',e=>{if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;d.x=e.clientX;d.y=e.clientY;d.m+=Math.abs(dx)+Math.abs(dy);
   const p=A.pieces[i],m=Math.min(p.w,p.h)/2;s[i].x=Math.max(m,Math.min(BW-m,s[i].x+dx/sc));s[i].y=Math.max(m,Math.min(BH-m,s[i].y+dy/sc));pos(i)});
  const up=()=>{if(!d)return;if(d.m<6)s[i].r=(s[i].r+90)%360;d=null;const p=A.pieces[i],tx=FX+p.x+p.w/2,ty=FY+p.y+p.h/2;
   if(s[i].r===0&&Math.hypot(s[i].x-tx,s[i].y-ty)<45){s[i].x=tx;s[i].y=ty;s[i].ok=1;im.style.zIndex=0}
   pos(i);S.set('pz2',s);if(s.every(q=>q.ok)){toast('拼好了');send({t:'solved',g:'letter'});setTimeout(render,600)}};
  im.addEventListener('pointerup',up);im.addEventListener('pointercancel',up)});
 PZ=el;return el}
function letterPreview(A){return `<div class="pzv" style="aspect-ratio:${A.W}/${A.H}">${A.pieces.map(p=>`<img src="${p.img}" style="left:${p.x/A.W*100}%;top:${p.y/A.H*100}%;width:${p.w/A.W*100}%">`).join('')}</div>`}

/* ======================= 机关 ======================= */
function owned(){return D.cards.filter(c=>visible(c)).map(c=>({c,x:card(c)}))}
function released(k){const sv=st.sv;return sv?!!(sv.games||{})[k]:true}
function games(){const o=owned();let h='',any=false;
 if(released('lock')&&o.some(z=>z.c.id==='R1-09')){any=true;const box=o.some(z=>z.c.id==='R3-02');
  h+=`<div class="grp">铁盒铜锁<small>${box?'已打开':`还能试 ${Math.max(0,3-st.tries)} 次`}</small></div>`;
  if(box)h+=`<p class="done">铁盒已经开了。盒中物在「线索」第三轮。</p>`;
  else if(st.tries>=3)h+=`<p class="fine">锁卡死了。等子时，主持人会宣布撬开。</p>`;
  else if(G3)h+=`<p class="fine">四个转轮，每个〇到九。每次试都要当众报出来。</p><div id="lockph" class="lock3d-ph">正在取锁……</div><button class="btn red" id="trylock">开锁</button><div class="msg" id="lockm"></div>`;
  else h+=`<p class="fine">四个转轮，每个〇到九。锁面刻着「勿忘」。每次试都要当众报出来。</p><div class="wheel">${[0,1,2,3].map(i=>`<div><button data-w="${i}" data-d="1">▲</button><span id="w${i}">0</span><button data-w="${i}" data-d="-1">▼</button></div>`).join('')}</div><button class="btn red" id="trylock">开锁</button><div class="msg" id="lockm"></div>`}
 const pz=o.find(z=>z.x.puzzle);
 if(released('letter')&&pz){any=true;const Pz=pz.x.puzzle,A=asset(pz.c.id);
  if(!st.puzzle||st.puzzle.length!==Pz.length){st.puzzle=Pz.map((_,i)=>i).sort(()=>Math.random()-.5);S.set('puzzle',st.puzzle)}
  const ok=A?pzDone():st.puzzle.every((v,i)=>v===i);const text=`<div class="slip"><p>${esc(Pz.join(''))}</p><p class="meta">没有署名。笔迹秀气，像女人写的。</p></div>`;
  h+=`<div class="grp">拼残信<small>${ok?'已拼好':(A?'拖动碎片，轻点转向':'点两片交换位置')}</small></div>`+(A?`<p class="fine">纸篓里捡出来的八片碎纸，边上都烧焦了。拼对的地方会自动吸住。</p><div id="pzph"></div>`+(ok?text:''):(ok?text:`<div class="tiles">${st.puzzle.map((v,i)=>`<button data-t="${i}">${esc(Pz[v])}</button>`).join('')}</div>`))}
 if(released('powder')&&o.some(z=>z.c.round>=2)){any=true;const sm=o.filter(z=>z.x.sample);
  h+=`<div class="grp">药粉比对<small>手里有 ${sm.length} 份样本</small></div><div class="slip">${D.pub.bencao}</div>`+
  (sm.length?sm.map(z=>{const s=z.x.sample;return `<div class="row"><span class="id">样本${s.id}</span><span class="t">${esc(s.from)}<small>颜色：${esc(s.color)}${st.tasted[s.id]?' · 舌感：'+esc(s.taste):''}</small></span><button class="pill" data-taste="${s.id}">尝</button></div>`}).join(''):'<p class="fine">搜到带样本的卡以后，这里能尝。</p>')}
 if(released('mazi')&&o.some(z=>z.x.mazi)){any=true;h+=`<div class="grp">商号码子</div><div class="slip">${maziTable()}<p class="meta">对照小册子前几页抄录的年份和数目。</p></div>`}
 return any?h:`<div class="lock">还没有可以动手的机关。<br><span class="fine">主持人发布以后，这里会出现铜锁、残信、药粉比对这些。</span></div>`}
function maziTable(){return '<p>〡1 〢2 〣3 〤4 〥5 〦6 〧7 〨8 〩9 〇0 十10</p>'}
function bindGames(){const wv=[0,0,0,0];
 app.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{const i=+b.dataset.w;wv[i]=(wv[i]+ +b.dataset.d+10)%10;$('w'+i).textContent=wv[i]});
 const lp=$('lockph');if(lp)V3.ready().then(()=>{const p=$('lockph');if(!p)return;LOCK=LOCK||V3.lock();LOCK.attach(p)}).catch(()=>{});
 const tl=$('trylock');if(tl)tl.onclick=()=>{const c=G3?(LOCK?LOCK.value():'0000'):wv.join('');const m=tryCode(c);const cn=[...c].map(d=>'〇一二三四五六七八九'[+d]).join('');
  if(m.n){$('lockm').textContent='咔哒一声，锁开了。';LOCK&&LOCK.open();tl.disabled=true;send({t:'solved',g:'lock'});setTimeout(render,1800)}
  else{st.tries++;S.set('tries',st.tries);$('lockm').textContent=`${cn}，没开。还能试 ${Math.max(0,3-st.tries)} 次。`;LOCK&&LOCK.fail();if(st.tries>=3)setTimeout(render,1400)}};
 const pp=$('pzph');if(pp){const el=puzzleEl();if(el){pp.replaceWith(el);PZfit&&PZfit()}}
 let sel=null;app.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const i=+b.dataset.t;if(sel===null){sel=i;b.classList.add('sel')}else{const p=st.puzzle;[p[sel],p[i]]=[p[i],p[sel]];sel=null;S.set('puzzle',p);render()}});
 app.querySelectorAll('[data-taste]').forEach(b=>b.onclick=()=>{st.tasted[b.dataset.taste]=1;S.set('tasted',st.tasted);render()})}

/* ======================= 页面：主持人 ======================= */
function hostLogin(){useStage('home');app.innerHTML=`<div class="top"><div class="who">主持人<small>输入主持人密码</small></div><button class="pill" data-go="home">返回</button></div>
<div class="wrap"><div class="code"><input id="hp" inputmode="numeric" autocomplete="off" placeholder="主持人密码"><button class="pill" id="hgo">进入</button></div><div class="msg" id="hm"></div></div>`;
 const go=()=>{const v=$('hp').value.trim();const t=dec(D.host,v);if(t){st.host=v;S.set('host',v);HD=JSON.parse(t);view='host';hostStart();render()}else $('hm').textContent='密码不对'};
 $('hgo').onclick=go}
let HLOCK=null;
function hostGames(){const s=H.s;return `<p class="fine">机关默认不给玩家看。到了合适的时候点「发布」，所有人手机上的「机关」页就会出现（铜锁、残信只对拿到对应线索卡的人出现）。</p>`+
 GAMES.map(g=>`<div class="gcard"><div class="gh"><b>${g.n}</b><span>${s.games[g.k]?'<i class="on">已发布</i>':'<i>未发布</i>'}</span></div><p class="fine">${g.tip}</p>
 ${(s.solved[g.k]||[]).length?`<p class="fine">已解开：${s.solved[g.k].map(roleName).join('、')}</p>`:''}
 <div class="bar2"><button class="btn" data-pv="${g.k}" style="text-align:center">预览</button><button class="btn ${s.games[g.k]?'':'red'}" data-gm="${g.k}" style="text-align:center">${s.games[g.k]?'收回':'发布'}</button></div></div>`).join('')}
function hostPreview(k){
 if(k==='lock'){open('预览 · 铁盒铜锁','<p class="fine">玩家看到的就是这把锁。答案见「小游戏答案」。</p><div id="hlock" class="lock3d-ph">正在取锁……</div>');
  if(G3)V3.ready().then(()=>{const p=$('hlock');if(!p)return;HLOCK=HLOCK||V3.lock();HLOCK.attach(p)});return}
 if(k==='letter'){const A=asset('R1-08');open('预览 · 拼残信',`<p class="fine">玩家拿到的是打乱、转过向的八片；拼好就是下面这样。</p>${A?letterPreview(A):''}`);return}
 if(k==='powder'){const sm=D.cards.filter(c=>{const x=card(c);return x&&x.sample}).map(c=>card(c).sample).sort((a,b)=>a.id<b.id?-1:1);
  open('预览 · 药粉比对',`<div class="slip">${D.pub.bencao}</div><table class="ht"><tr><th>样本</th><th>出处</th><th>颜色</th><th>舌感</th></tr>${sm.map(s=>`<tr><td>${s.id}</td><td>${esc(s.from)}</td><td>${esc(s.color)}</td><td>${esc(s.taste)}</td></tr>`).join('')}</table>`);return}
 if(k==='mazi'){open('预览 · 商号码子',`<div class="slip">${maziTable()}</div>`)}}
function host(){useStage(null);document.body.classList.remove('onmap');if(!HD)HD=JSON.parse(dec(D.host,st.host));hostStart();const s=H.s;const t=st.htab;
 const tabs=[['run','进程'],['games','机关'],...HD.docs.map((d,i)=>[i,d.t])];
 let body='';
 if(t==='run'){const online=new Set([...H.conns.values()].map(x=>x.role).filter(Boolean));
  const link=location.origin+location.pathname+'#r'+st.room;
  body=`<p class="fine" style="text-align:center;margin:0">房间号</p><div class="room">${H.peer&&H.peer.open?esc(st.room):'····'}</div>
  <p class="fine" style="text-align:center">${H.peer&&H.peer.open?'玩家进入时填这个房间号，或打开下面的链接':'正在开房间……'}</p>
  <p class="fine" style="text-align:center;word-break:break-all">${esc(link)}</p>
  <div class="who-list">${D.roles.map(r=>{const old=[...H.conns.values()].some(x=>x.role===r.id&&(x.v||0)<APPV);return `<span class="${online.has(r.id)?'on':''} ${old?'old':''}">${esc(r.name)}${old?' · 请刷新':''}</span>`}).join('')}</div>
  <div class="grp">当前阶段<small>${s.phase+1} / ${PH.length}</small></div><div class="big">${esc(PH[s.phase].n)}</div>
  <div class="bar2"><button class="btn" data-ph="${s.phase-1}" style="text-align:center">上一步</button><button class="btn red" data-ph="${s.phase+1}">下一步：${esc((PH[s.phase+1]||{n:'已结束'}).n)}</button></div>
  ${s.phase>=8&&!s.pub.includes(HD.codes['R3-07'])?`<button class="btn" id="dig">全场决定挖井 → 发 R3-07 井底</button>`:''}
  <details><summary class="fine">跳到某一阶段</summary>${PH.map((p,i)=>`<button class="btn ${i===s.phase?'red':''}" data-ph="${i}">${i+1}. ${esc(p.n)}</button>`).join('')}</details>`;
  if(s.phase===EXPLORE)body+=`<div class="grp">勘查现场</div><p class="fine">书房里能看到的东西，玩家走进书房自己点开，不限次数。下面这几张不是在书房里能看到的，找个由头当众发给所有人。第一轮结束时，没找全的会自动补齐。</p>`+
   R1REL.map(([id,why])=>`<div class="row"><span class="id">${id}</span><span class="t">${esc(HD.titles[id])}<small>${esc(why)}</small></span>${s.r1rel.includes(id)?'<b class="fine">已发</b>':`<button class="pill" data-r1="${id}">发给全体</button>`}</div>`).join('');
  if(PH[s.phase].search||Object.keys(s.ap).length){body+=`<div class="grp">行动点</div>`+D.roles.map(r=>`<div class="row"><span class="t">${esc(r.name)}</span><span class="ap"><button data-ap="${r.id}" data-d="-1">−</button><b style="width:28px;text-align:center">${s.ap[r.id]??0}</b><button data-ap="${r.id}" data-d="1">＋</button></span></div>`).join('')}
  if(PH[s.phase].vote||PH[s.phase].reveal){const T=tallyVotes();body+=`<div class="grp">票况<small>已投 ${Object.keys(s.votes).length} / ${online.size||D.roles.length}</small></div>`+
   [['a','谁杀了沈伯衡'],['b','谁扎的那一刀'],['c','沈鹤年是谁杀的']].map(([k,q])=>`<p><b>${q}</b>：${Object.entries(T[k]).sort((a,b)=>b[1]-a[1]).map(([id,n])=>esc(roleName(id)||'没有人')+' '+n).join('，')||'暂无'}</p>`).join('')+`<p class="fine">进入「复盘」阶段时，票况会同步到每个人的手机上。</p>`}
  body+=`<div class="grp">记录</div>${s.log.slice(0,60).map(l=>`<div class="fine">${esc(l)}</div>`).join('')||'<p class="fine">暂无</p>'}
  <details style="margin-top:20px"><summary class="fine">手动发卡（某人连不上时用）</summary><p class="fine">把卡号念给他，他在「线索」页底部手动输入。卡号见「发放单」。</p></details>
  <button class="btn" id="reset" style="margin-top:30px">清空本局进度，重新开始</button>`}
 else if(t==='games')body=hostGames();
 else body=`<div class="book">${HD.docs[t].html}</div>`;
 app.innerHTML=`<div class="top"><div class="who">主持人台<small>别让玩家看到这块屏幕</small></div><button class="pill" data-go="hostout">退出</button></div>
 <div class="wrap"><div class="tabs">${tabs.map(([k,n])=>`<button class="${String(k)===String(t)?'on':''}" data-ht="${k}">${esc(n)}</button>`).join('')}</div>${body}</div>`;
 app.querySelectorAll('[data-ht]').forEach(b=>b.onclick=()=>{const k=b.dataset.ht;st.htab=(k==='run'||k==='games')?k:+k;render();scrollTo(0,0)});
 app.querySelectorAll('[data-ph]').forEach(b=>b.onclick=()=>setPhase(+b.dataset.ph));
 app.querySelectorAll('[data-ap]').forEach(b=>b.onclick=()=>{s.ap[b.dataset.ap]=Math.max(0,(s.ap[b.dataset.ap]??0)+ +b.dataset.d);pushAll()});
 app.querySelectorAll('[data-r1]').forEach(b=>b.onclick=()=>{s.r1rel.push(b.dataset.r1);s.log.unshift(`发给全体：${b.dataset.r1} ${HD.titles[b.dataset.r1]}`);pushAll()});
 app.querySelectorAll('[data-gm]').forEach(b=>b.onclick=()=>{const k=b.dataset.gm;s.games[k]=s.games[k]?0:1;s.log.unshift(`${s.games[k]?'发布':'收回'}机关：${GAMES.find(g=>g.k===k).n}`);pushAll()});
 app.querySelectorAll('[data-pv]').forEach(b=>b.onclick=()=>hostPreview(b.dataset.pv));
 const dg=$('dig');if(dg)dg.onclick=()=>{s.pub.push(HD.codes['R3-07']);s.log.unshift('全场决定挖井');pushAll()};
 const rs=$('reset');if(rs)rs.onclick=()=>{if(rs.dataset.sure){H.s=null;hsInit();pushAll()}else{rs.dataset.sure=1;rs.textContent='再点一次确认清空'}}}

/* ======================= 路由 ======================= */
let view=st.host?'host':(st.role?'player':'home');
function render(){if(!D){app.innerHTML='<div class="hero"><div class="title">寒蟬記</div></div>';return}
 document.body.classList.remove('onmap');
 if(view==='home'&&st.host)view='host';if(view==='home'&&st.role)view='player';
 if(view==='home')home();else if(view==='pick')pick();else if(view==='hostlogin')hostLogin();
 else if(view==='host'&&st.host)host();else if(view==='player'&&st.role)player();else{view='home';home()}}
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-card]');if(!b||b.closest('#sheet'))return;const d=b.dataset;
 if(d.go){if(d.go==='opening')return open('开场',`<div class="book">${D.pub.opening}</div>`);
  if(d.go==='logout'){st.role=null;S.set('role',null);leaveRoom();view='home'}
  else if(d.go==='hostout'){st.host=null;S.set('host',null);HD=null;view='home'}else view=d.go;render();return}
 if(d.role){login(d.role);return}
 if(d.tab){st.tab=d.tab;render();scrollTo(0,0);return}
 if(d.card){showCard(d.card);return}
 if(d.map){showMap(d.map);return}
 if(d.zimg){const a=asset(d.zimg);if(a)showImg('露台鞋印图',a.img);return}
 if(d.z){document.querySelector('#zm img').style.setProperty('--z',d.z);return}
 if(d.code){const i=$(d.code);const m=tryCode(i.value);$(d.code+'m').textContent=m.msg;i.value='';if(m.n||m.a3)setTimeout(render,700)}});
window.HCJ={lock:()=>LOCK,asset:id=>asset(id),walk:()=>WALK,map:()=>MAP,st};
const hr=(location.hash.match(/^#r(\d{4})$/)||[])[1];if(hr&&!st.host){st.room=hr;S.set('room',hr)}
fetch('data.json?v=25').then(r=>r.json()).then(d=>{D=d;
 if(st.host){const t=dec(D.host,st.host);if(t)HD=JSON.parse(t);else{st.host=null}}
 if(st.role&&!st.host)joinRoom();render()}).catch(()=>{app.innerHTML='<div class="hero"><p>数据没加载出来，刷新试试。</p></div>'});
render();
}
