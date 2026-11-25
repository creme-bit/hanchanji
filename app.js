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
let D=null,HD=null;                       // 公开数据 / 主持人数据
const st={role:S.get('role',null),pw:S.get('pw',null),codes:S.get('codes',[]),host:S.get('host',null),tab:'book',tries:S.get('tries',0),puzzle:S.get('puzzle',null),tasted:S.get('tasted',{}),htab:'run',room:S.get('room',''),sv:null};
const cache={};
const role=()=>D.roles.find(r=>r.id===st.role);
const roleName=id=>(D.roles.find(r=>r.id===id)||{}).name||'';
function card(c){if(cache[c.id])return cache[c.id];for(const code of st.codes){const t=dec(c.e,code+'|'+c.id);if(t){cache[c.id]=JSON.parse(t);return cache[c.id]}}return null}
const acache={};
function asset(id){if(acache[id])return acache[id];const box=D.assets&&D.assets[id];if(!box)return null;for(const code of st.codes){const t=dec(box,code+'|'+id+'|a');if(t)return acache[id]=JSON.parse(t)}return null}
function act3(){const r=role();for(const code of st.codes){const t=dec(r.a3,st.pw+'|'+code);if(t)return t}return null}
let toastT;function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),3200)}
const modal=$('modal'),mbody=$('mbody');
function open(title,html){$('mtitle').textContent=title;mbody.innerHTML=html;modal.classList.add('on');mbody.scrollTop=0}
$('mclose').onclick=()=>{modal.classList.remove('on');render()};

/* 口令：返回 {n, a3, msg} */
function tryCode(code,quiet){code=String(code).trim();if(!code)return {msg:'请输入口令'};
 const had=st.codes.includes(code);if(!had)st.codes.push(code);let n=0;
 D.cards.forEach(c=>{if(!cache[c.id]){const t=dec(c.e,code+'|'+c.id);if(t){cache[c.id]=JSON.parse(t);n++}}});
 const a3=!!(st.role&&!had&&dec(role().a3,st.pw+'|'+code));
 if(!n&&!a3){if(!had)st.codes.pop();return {msg:had?'这个口令已经用过了':'口令不对'}}
 S.set('codes',st.codes);return {n,a3,msg:(n?`解锁了 ${n} 张线索卡`:'')+(a3?(n?'，':'')+'第三幕已解封':'')}}

/* ======================= 阶段 ======================= */
const PH=[{n:'开场'},{n:'读本'},{n:'自我介绍'},{n:'第一轮 · 现场线索',pub:'r1'},{n:'第二轮 · 搜证一',ap:3,search:1},{n:'第二轮 · 讨论'},
 {n:'第二轮 · 搜证二',ap:2,search:1},{n:'子时 · 开铁盒',pub:'box'},{n:'第三轮 · 破局',pub:'r3'},{n:'自清'},{n:'最后陈述'},{n:'投票',vote:1},{n:'复盘',reveal:1}];

/* ======================= 同步：主持人 ======================= */
const OPTS=window.PEER_OPTS||{};
const H={peer:null,conns:new Map(),s:S.get('hs',null)};
function hsInit(){if(H.s)return;H.s={phase:0,applied:[],pub:[],ap:{},ledger:{},persons:{},votes:{},log:[]};hsSave()}
function hsSave(){S.set('hs',H.s)}
function hostStart(){hsInit();if(H.peer)return;
 if(!st.room){st.room=String(1000+Math.floor(Math.random()*9000));S.set('room',st.room)}
 if(typeof Peer==='undefined'){toast('同步组件没加载，口令模式仍可用');return}
 H.peer=new Peer('hanchanji-'+st.room,OPTS);
 H.peer.on('open',()=>{render()});
 H.peer.on('error',e=>{if(e.type==='unavailable-id'){H.peer.destroy();H.peer=null;st.room='';S.set('room','');hostStart()}else{toast('连接出错：'+e.type);}});
 H.peer.on('disconnected',()=>{setTimeout(()=>H.peer&&!H.peer.destroyed&&H.peer.reconnect(),2000)});
 H.peer.on('connection',c=>{H.conns.set(c.peer,{c,role:null});
  c.on('data',d=>hostMsg(c,d));c.on('close',()=>{H.conns.delete(c.peer);render()})})}
function connOf(role){return [...H.conns.values()].filter(x=>x.role===role)}
function stateFor(role){const s=H.s,ph=PH[s.phase];
 const mine=Object.entries(s.ledger).filter(([,r])=>r===role).map(([id])=>HD.codes[id]);
 const tally=ph.reveal?tallyVotes():null;
 return {t:'state',phase:s.phase,pub:s.pub,mine,ap:s.ap[role]??0,search:!!ph.search,vote:!!ph.vote,myVote:s.votes[role]||null,tally,
  taken:Object.keys(s.ledger),persons:Object.keys(s.persons)}}
function push(role){connOf(role).forEach(x=>{try{x.c.send(stateFor(role))}catch(e){}})}
function pushAll(){hsSave();[...H.conns.values()].forEach(x=>{if(x.role)try{x.c.send(stateFor(x.role))}catch(e){}});render()}
function hostMsg(c,d){const x=H.conns.get(c.peer);if(!x||!d||typeof d!=='object')return;
 if(d.t==='hello'&&D.roles.some(r=>r.id===d.role)){x.role=d.role;push(d.role);render();return}
 const who=x.role;if(!who)return;const s=H.s,ph=PH[s.phase];
 if(d.t==='search'){if(!ph.search)return tell(c,'现在不是搜证时间');
  if(d.person){const pid=HD.persons[roleName(d.person)];if((s.ap[who]??0)<2)return tell(c,'行动点不够（搜人要 2 点）');
   if(d.person===who)return tell(c,'不能搜自己');if(s.persons[d.person])return tell(c,'这个人已经被搜过了');
   s.ap[who]-=2;s.persons[d.person]=who;s.ledger[pid]=who;s.log.unshift(`${roleName(who)} 搜了 ${roleName(d.person)} 的身`);
   tell(c,`搜到了：${roleName(d.person)}的随身物品`);connOf(d.person).forEach(y=>tell(y.c,'有人搜了你的身'));pushAll();return}
  if((s.ap[who]??0)<1)return tell(c,'行动点用完了');
  const next=D.cards.find(k=>k.round===2&&k.loc===d.loc&&!k.public&&!s.ledger[k.id]);
  s.ap[who]-=1;
  if(!next){s.log.unshift(`${roleName(who)} 搜了 ${d.loc}，没东西了`);tell(c,'这里已经有人来过了，什么也没找到');pushAll();return}
  s.ledger[next.id]=who;s.log.unshift(`${roleName(who)} 搜 ${d.loc} → ${next.id} ${HD.titles[next.id]}`);
  tell(c,`在${d.loc}找到一张线索`);pushAll();return}
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
 c.on('open',()=>{P.on=true;c.send({t:'hello',role:st.role});render()});
 c.on('data',onHost);c.on('close',()=>{P.on=false;render();retry()})}
function retry(){clearTimeout(P.timer);P.timer=setTimeout(()=>{if(P.peer&&!P.peer.destroyed&&!P.on)dial()},4000)}
function leaveRoom(){try{P.peer&&P.peer.destroy()}catch(e){}P.peer=null;P.on=false}
function onHost(d){if(!d||typeof d!=='object')return;
 if(d.t==='msg'){toast(String(d.m));return}
 if(d.t==='state'){const before=st.sv?st.sv.phase:null;st.sv=d;let gained=0,a3=false;
  [...(d.pub||[]),...(d.mine||[])].forEach(code=>{if(!st.codes.includes(String(code))){const r=tryCode(code,true);gained+=r.n||0;a3=a3||r.a3}});
  if(before!==null&&before!==d.phase)toast('进入：'+PH[d.phase].n);
  if(gained)setTimeout(()=>toast(`新到 ${gained} 张线索`+(a3?'，第三幕已解封':'')),before!==d.phase?1600:0);else if(a3)toast('第三幕已解封');
  if((d.search||d.vote)&&before!==d.phase)st.tab='act';
  render()}}
function send(o){if(P.conn&&P.on)P.conn.send(o);else toast('还没连上主持人')}

/* ======================= 页面：首页 ======================= */
function home(){app.innerHTML=`<div class="hero"><div><div class="title">寒蟬記</div><div class="seal">寒<br>蝉</div>
<p class="sub">民国二十三年 · 腊月廿三 · 青浦沈公馆</p>
<div class="wrap" style="max-width:420px;margin-top:28px">
<button class="btn" data-go="opening">开场<small>故事从这里开始</small></button>
<button class="btn red" data-go="pick">我是玩家</button>
<button class="btn" data-go="hostlogin" style="text-align:center">我是主持人</button></div></div></div>`}
function pick(){app.innerHTML=`<div class="top"><div class="who">选择你的角色<small>只选主持人发给你的那一个</small></div><button class="pill" data-go="home">返回</button></div>
<div class="wrap">${D.roles.map(r=>`<button class="btn" data-role="${r.id}">${esc(r.name)}<small>${esc(r.sa)} · ${esc(r.ident)}</small></button>`).join('')}</div>`}
function login(rid){const r=D.roles.find(x=>x.id===rid);app.innerHTML=`<div class="top"><div class="who">${esc(r.name)}<small>输入主持人私下给你的密码和房间号</small></div><button class="pill" data-go="pick">返回</button></div>
<div class="wrap"><p class="fine">六位密码</p><div class="code"><input id="pw" inputmode="numeric" autocomplete="off" placeholder="六位密码"></div>
<p class="fine">房间号（主持人屏幕上那四位数，没有可以先空着）</p><div class="code"><input id="rm" inputmode="numeric" autocomplete="off" placeholder="房间号" value="${esc(st.room||'')}"></div>
<button class="btn red" id="pwgo">进入</button><div class="msg" id="pwm"></div></div>`;
 const go=()=>{const v=$('pw').value.trim();if(!dec(r.a12,v)){$('pwm').textContent='密码不对';return}
  st.role=rid;st.pw=v;S.set('role',rid);S.set('pw',v);st.room=$('rm').value.trim();S.set('room',st.room);st.tab='book';view='player';joinRoom();render()};
 $('pwgo').onclick=go}

/* ======================= 页面：玩家 ======================= */
function phaseBar(){const sv=st.sv;return `<div class="phase"><span><span class="dot ${P.on?'on':''}"></span>${P.on?'已连上主持人':(st.room?'正在连接房间 '+esc(st.room):'未加入房间')}</span>${sv?`<b>${esc(PH[sv.phase].n)}</b>`:''}</div>`}
function player(){const r=role();const tabs=[['book','本','本子'],['clue','线','线索'],['map','图','地图'],['game','机','机关'],['act','行','行动']];
 let body='';
 if(st.tab==='book'){const a=dec(r.a12,st.pw),b=act3();body=`<div class="book">${a}</div>${b?`<div class="book">${b}</div>`:`<div class="lock">第三幕还封着<br><span class="fine">子时铁盒打开时会自动解封</span></div>`}`}
 if(st.tab==='clue'){ [1,2,3].forEach(n=>{const got=D.cards.filter(c=>c.round===n&&!c.public&&card(c));const all=D.cards.filter(c=>c.round===n&&!c.public).length;
  body+=`<div class="grp">第${'一二三'[n-1]}轮<small>已得 ${got.length} / ${all}</small></div>`+(got.length?got.map(c=>{const x=card(c);return `<div class="row" data-card="${c.id}"><span class="id">${c.id}</span><span class="t">${esc(x.title)}${c.loc?`<small>${esc(c.loc)}</small>`:''}</span>›</div>`}).join(''):`<p class="fine">还没有</p>`)});
  body+=`<details style="margin-top:28px"><summary class="fine">手动输入口令（连不上主持人时用）</summary>${codeBox('cc')}</details>`}
 if(st.tab==='map'){body=`${V3.ok()?'<div class="grp">立体图<small>搜证时点亮的房间可以搜</small></div><div id="m3dph" class="m3d-ph">正在搭公馆……</div>':''}<div class="grp">平面图</div><div class="maps">${D.maps.map(m=>`<button data-map="${m.id}"><img src="maps/${m.id}.jpg" alt="${esc(m.name)}" loading="lazy"><span>${esc(m.name)}</span></button>`).join('')}</div>`}
 if(st.tab==='game')body=games();
 if(st.tab==='act')body=actView();
 app.innerHTML=`<div class="top"><div class="who">${esc(r.name)}<small>${esc(r.ident)}</small></div><button class="pill" data-go="logout">换人</button></div>${phaseBar()}<div class="wrap">${body}</div>
 <nav class="nav">${tabs.map(([k,i,t])=>`<button class="${st.tab===k?'on':''}" data-tab="${k}"><b>${i}</b>${t}</button>`).join('')}</nav>`;
 if(st.tab==='game')bindGames();if(st.tab==='act')bindAct();mount3d()}
function codeBox(id){return `<div class="code"><input id="${id}" inputmode="numeric" autocomplete="off" placeholder="口令 / 卡号"><button class="pill" data-code="${id}">解锁</button></div><div class="msg" id="${id}m"></div>`}
function actView(){const sv=st.sv;
 if(!P.on)return `<p>连上主持人以后，搜证和投票都在这里。</p><p class="fine">房间号</p><div class="code"><input id="rm2" inputmode="numeric" value="${esc(st.room||'')}" placeholder="四位房间号"><button class="pill" id="rmgo">连接</button></div>`;
 if(sv&&sv.search){const locs=[...new Set(D.cards.filter(c=>c.round===2&&!c.public&&c.loc!=='随身物品').map(c=>c.loc))];
  return `<div class="grp">搜证<small>剩 ${sv.ap} 点</small></div><p class="fine">在图上点房间就能搜，也可以用下面的列表。搜一个地点花 1 点，同一地点再搜会往深里翻。搜一个人花 2 点，每人整局只能被搜一次。</p>${V3.ok()?'<div id="m3dph" class="m3d-ph">正在搭公馆……</div>':''}<div class="grp">地点</div>`+
  locs.map(l=>{const left=D.cards.filter(c=>c.loc===l&&!c.public&&!sv.taken.includes(c.id)).length;return `<div class="row loc"><span class="t">${esc(l)}<small>${left?'':'已经翻遍了'}</small></span><button class="pill" data-search="${esc(l)}" ${sv.ap<1?'disabled':''}>搜</button></div>`}).join('')+
  `<div class="grp">搜人</div>`+D.roles.filter(x=>x.id!==st.role).map(x=>`<div class="row loc"><span class="t">${esc(x.name)}<small>${sv.persons.includes(x.id)?'已被搜过':''}</small></span><button class="pill" data-person="${x.id}" ${sv.ap<2||sv.persons.includes(x.id)?'disabled':''}>搜身</button></div>`).join('')}
 if(sv&&sv.vote){const mv=sv.myVote||{};const sel=(k)=>`<select id="v${k}" style="max-width:none;width:100%"><option value="">请选择</option>${D.roles.map(x=>`<option value="${x.id}" ${mv[k]===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}<option value="none" ${mv[k]==='none'?'selected':''}>没有人 / 不知道</option></select>`;
  return `<div class="grp">投票</div><p>第一票：谁杀了沈伯衡？</p>${sel('a')}<p>第二票：谁往尸体上扎了那一刀？</p>${sel('b')}<p>加分题：沈鹤年是谁杀的？</p>${sel('c')}<button class="btn red" id="vote">${sv.myVote?'改票':'投出'}</button><p class="fine">主持人开票前都可以改。</p>`}
 if(sv&&sv.tally){const T=sv.tally;const row=(k,q)=>`<div class="grp">${q}</div>`+(Object.entries(T[k]).sort((a,b)=>b[1]-a[1]).map(([id,n])=>`<div class="row"><span class="t">${esc(roleName(id)||'没有人')}</span><b>${n} 票</b></div>`).join('')||'<p class="fine">无人投</p>');
  return row('a','谁杀了沈伯衡')+row('b','谁扎的那一刀')+row('c','沈鹤年是谁杀的')}
 return `<div class="lock">现在没有要你操作的事。<br><span class="fine">到搜证或投票时，这里会自动打开。</span></div>`}
function bindAct(){const g=$('rmgo');if(g)g.onclick=()=>{st.room=$('rm2').value.trim();S.set('room',st.room);leaveRoom();joinRoom();render()};
 app.querySelectorAll('[data-search]').forEach(b=>b.onclick=()=>send({t:'search',loc:b.dataset.search}));
 app.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>send({t:'search',person:b.dataset.person}));
 const v=$('vote');if(v)v.onclick=()=>send({t:'vote',a:$('va').value,b:$('vb').value,c:$('vc').value})}
function showCard(id){const c=D.cards.find(x=>x.id===id),x=card(c);let extra='';
 if(x.sample)extra=`<p><b>药粉样本 ${x.sample.id}</b>（${esc(x.sample.from)}）可以在「机关 · 药粉比对」里尝。</p>`;
 if(x.map){const a=asset(c.id);if(a)extra+=`<button class="imgbtn" data-zimg="${c.id}"><img src="${a.img}" alt="露台鞋印图"><span>点开放大</span></button>`}if(x.puzzle)extra+=`<p>碎纸可以在「机关 · 拼残信」里拼。</p>`;if(x.lock)extra+=`<p>铜锁可以在「机关 · 铁盒铜锁」里试。</p>`;
 open(c.id,`<div class="slip"><div class="meta">${c.id}${c.loc?' · '+esc(c.loc):''}</div><h3>${esc(x.title)}</h3>${x.html}${extra}</div>`)}
function showImg(title,src){open(title,`<div style="display:flex;gap:8px;margin-bottom:8px"><button class="pill" data-z="1">适应</button><button class="pill" data-z="2">放大</button><button class="pill" data-z="3">再大</button></div><div class="zoom" id="zm"><img src="${src}" alt=""></div>`)}
function showMap(id){const m=D.maps.find(x=>x.id===id);open(m.name,`<div style="display:flex;gap:8px;margin-bottom:8px"><button class="pill" data-z="1">适应</button><button class="pill" data-z="2">放大</button><button class="pill" data-z="3">再大</button></div><div class="zoom" id="zm"><img src="maps/${id}.jpg" alt="${esc(m.name)}"></div>`)}

/* ======================= 立体图 ======================= */
let LOCK=null;window.HCJ={lock:()=>LOCK,asset:id=>asset(id)};
function locLeft(loc){const sv=st.sv;return D.cards.filter(c=>c.round===2&&!c.public&&c.loc===loc&&!(sv&&sv.taken.includes(c.id))).length}
function locState(loc){const sv=st.sv;if(!P.on||!sv||!sv.search)return '';if(!locLeft(loc))return 'done';return sv.ap>=1?'can':''}
function mount3d(){const ph=$('m3dph');if(!ph)return;
 V3.ready().then(()=>{const p=$('m3dph');if(!p)return;const m=V3.map();m.state=locState;m.onPick=pickLoc;m.attach(p);m.refresh()}).catch(()=>{const p=$('m3dph');if(p)p.textContent='立体图没加载出来，可以看下面的平面图。'})}
function sheet(html,cb){let el=$('sheet');if(!el){el=document.createElement('div');el.id='sheet';el.className='sheet';document.body.appendChild(el)}
 el.innerHTML=html;requestAnimationFrame(()=>el.classList.add('on'));
 el.querySelectorAll('[data-sheet]').forEach(b=>b.onclick=()=>{el.classList.remove('on');try{V3.map().clear()}catch(e){}cb&&cb(b.dataset.sheet)})}
function pickLoc(loc,name){const sv=st.sv,left=locLeft(loc);let h=`<h3>${esc(name)}</h3>${name!==loc?`<p class="fine" style="margin-top:0">${esc(loc)}</p>`:''}`;
 const can=P.on&&sv&&sv.search&&left&&sv.ap>=1;
 if(!P.on)h+='<p class="fine">还没连上主持人。</p>';
 else if(!sv||!sv.search)h+='<p class="fine">现在不是搜证时间。主持人开始搜证后，点这里就能搜。</p>';
 else if(!left)h+='<p class="fine">这里已经被人翻遍了。</p>';
 else if(sv.ap<1)h+='<p class="fine">你的行动点用完了。</p>';
 else h+=`<p>搜这里花 1 点行动点，你还剩 ${sv.ap} 点。</p>`;
 sheet(h+`<div class="row2"><button class="btn" data-sheet="x" style="text-align:center">${can?'算了':'知道了'}</button>${can?'<button class="btn red" data-sheet="go" style="text-align:center">搜这里</button>':''}</div>`,k=>{if(k==='go')send({t:'search',loc})})}

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
   const p=A.pieces[i];const m=Math.min(p.w,p.h)/2;s[i].x=Math.max(m,Math.min(BW-m,s[i].x+dx/sc));s[i].y=Math.max(m,Math.min(BH-m,s[i].y+dy/sc));pos(i)});
  const up=()=>{if(!d)return;if(d.m<6)s[i].r=(s[i].r+90)%360;d=null;const p=A.pieces[i],tx=FX+p.x+p.w/2,ty=FY+p.y+p.h/2;
   if(s[i].r===0&&Math.hypot(s[i].x-tx,s[i].y-ty)<45){s[i].x=tx;s[i].y=ty;s[i].ok=1;im.style.zIndex=0}
   pos(i);S.set('pz2',s);if(s.every(q=>q.ok)){toast('拼好了');setTimeout(render,600)}};
  im.addEventListener('pointerup',up);im.addEventListener('pointercancel',up)});
 PZ=el;return el}

/* ======================= 机关 ======================= */
function owned(){return D.cards.filter(c=>card(c)).map(c=>({c,x:card(c)}))}
function games(){const o=owned();let h='';
 if(!o.some(z=>z.c.round===1))return `<div class="lock">第一轮线索到了以后，这里会出现铁盒铜锁和拼残信。</div>`;
 const box=o.some(z=>z.c.id==='R3-02');
 h+=`<div class="grp">铁盒铜锁<small>${box?'已打开':`还能试 ${Math.max(0,3-st.tries)} 次`}</small></div>`;
 if(box)h+=`<p class="done">铁盒已经开了。盒中物在「线索」第三轮。</p>`;
 else if(st.tries>=3)h+=`<p class="fine">锁卡死了。等子时，主持人会宣布撬开。</p>`;
 else if(V3.ok())h+=`<p class="fine">四个转轮，每个〇到九。每次试都要当众报出来。</p><div id="lockph" class="lock3d-ph">正在取锁……</div><button class="btn red" id="trylock">开锁</button><div class="msg" id="lockm"></div>`;
 else h+=`<p class="fine">四个转轮，每个〇到九。锁面刻着「勿忘」。每次试都要当众报出来。</p><div class="wheel">${[0,1,2,3].map(i=>`<div><button data-w="${i}" data-d="1">▲</button><span id="w${i}">0</span><button data-w="${i}" data-d="-1">▼</button></div>`).join('')}</div><button class="btn red" id="trylock">开锁</button><div class="msg" id="lockm"></div>`;
 const pz=o.find(z=>z.x.puzzle);
 if(pz){const Pz=pz.x.puzzle;if(!st.puzzle||st.puzzle.length!==Pz.length){st.puzzle=Pz.map((_,i)=>i).sort(()=>Math.random()-.5);S.set('puzzle',st.puzzle)}
  const A=asset(pz.c.id),ok=A?pzDone():st.puzzle.every((v,i)=>v===i);
  h+=`<div class="grp">拼残信<small>${ok?'已拼好':(A?'拖动碎片，轻点转向':'点两片交换位置')}</small></div>`+(A?`<p class="fine">纸篓里捡出来的八片碎纸，边上都烧焦了。拼对的地方会自动吸住。</p><div id="pzph"></div>`+(ok?`<div class="slip"><p>${esc(Pz.join(''))}</p><p class="meta">没有署名。笔迹秀气，像女人写的。</p></div>`:''):(ok?`<div class="slip"><p>${esc(Pz.join(''))}</p><p class="meta">没有署名。笔迹秀气，像女人写的。</p></div>`:`<div class="tiles">${st.puzzle.map((v,i)=>`<button data-t="${i}">${esc(Pz[v])}</button>`).join('')}</div>`))}
 if(o.some(z=>z.c.round===2)){const sm=o.filter(z=>z.x.sample);
  h+=`<div class="grp">药粉比对<small>手里有 ${sm.length} 份样本</small></div><div class="slip">${D.pub.bencao}</div>`+
  (sm.length?sm.map(z=>{const s=z.x.sample;return `<div class="row"><span class="id">样本${s.id}</span><span class="t">${esc(s.from)}<small>颜色：${esc(s.color)}${st.tasted[s.id]?' · 舌感：'+esc(s.taste):''}</small></span><button class="pill" data-taste="${s.id}">尝</button></div>`}).join(''):'<p class="fine">搜到带样本的卡以后，这里能尝。</p>')}
 if(o.some(z=>z.x.mazi))h+=`<div class="grp">商号码子</div><div class="slip"><p>〡1 〢2 〣3 〤4 〥5 〦6 〧7 〨8 〩9 〇0 十10</p><p class="meta">对照小册子前几页抄录的年份和数目。</p></div>`;
 return h}
function bindGames(){const wv=[0,0,0,0];
 app.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{const i=+b.dataset.w;wv[i]=(wv[i]+ +b.dataset.d+10)%10;$('w'+i).textContent=wv[i]});
 const lp=$('lockph');if(lp)V3.ready().then(()=>{const p=$('lockph');if(!p)return;LOCK=LOCK||V3.lock();LOCK.attach(p)}).catch(()=>{});
 const tl=$('trylock');if(tl)tl.onclick=()=>{const c=$('lockph')||LOCK&&LOCK.el.isConnected?(LOCK?LOCK.value():'0000'):wv.join('');const m=tryCode(c);const cn=[...c].map(d=>'〇一二三四五六七八九'[+d]).join('');
  if(m.n){$('lockm').textContent='咔哒一声，锁开了。';LOCK&&LOCK.open();tl.disabled=true;setTimeout(render,1800)}else{st.tries++;S.set('tries',st.tries);$('lockm').textContent=`${cn}，没开。还能试 ${Math.max(0,3-st.tries)} 次。`;LOCK&&LOCK.fail();if(st.tries>=3)setTimeout(render,1400)}};
 const pp=$('pzph');if(pp){const el=puzzleEl();if(el){pp.replaceWith(el);PZfit&&PZfit()}}
 let sel=null;app.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const i=+b.dataset.t;if(sel===null){sel=i;b.classList.add('sel')}else{const p=st.puzzle;[p[sel],p[i]]=[p[i],p[sel]];sel=null;S.set('puzzle',p);render()}});
 app.querySelectorAll('[data-taste]').forEach(b=>b.onclick=()=>{st.tasted[b.dataset.taste]=1;S.set('tasted',st.tasted);render()})}

/* ======================= 页面：主持人 ======================= */
function hostLogin(){app.innerHTML=`<div class="top"><div class="who">主持人<small>输入主持人密码</small></div><button class="pill" data-go="home">返回</button></div>
<div class="wrap"><div class="code"><input id="hp" inputmode="numeric" autocomplete="off" placeholder="主持人密码"><button class="pill" id="hgo">进入</button></div><div class="msg" id="hm"></div></div>`;
 const go=()=>{const v=$('hp').value.trim();const t=dec(D.host,v);if(t){st.host=v;S.set('host',v);HD=JSON.parse(t);view='host';hostStart();render()}else $('hm').textContent='密码不对'};
 $('hgo').onclick=go}
function host(){if(!HD)HD=JSON.parse(dec(D.host,st.host));hostStart();const s=H.s;const t=st.htab;
 const tabs=[['run','进程'],...HD.docs.map((d,i)=>[i,d.t])];
 let body='';
 if(t==='run'){const online=new Set([...H.conns.values()].map(x=>x.role).filter(Boolean));
  const link=location.origin+location.pathname+'#r'+st.room;
  body=`<p class="fine" style="text-align:center;margin:0">房间号</p><div class="room">${H.peer&&H.peer.open?esc(st.room):'····'}</div>
  <p class="fine" style="text-align:center">${H.peer&&H.peer.open?'玩家进入时填这个房间号，或打开下面的链接':'正在开房间……'}</p>
  <p class="fine" style="text-align:center;word-break:break-all">${esc(link)}</p>
  <div class="who-list">${D.roles.map(r=>`<span class="${online.has(r.id)?'on':''}">${esc(r.name)}</span>`).join('')}</div>
  <div class="grp">当前阶段<small>${s.phase+1} / ${PH.length}</small></div><div class="big">${esc(PH[s.phase].n)}</div>
  <div class="bar2"><button class="btn" data-ph="${s.phase-1}" style="text-align:center">上一步</button><button class="btn red" data-ph="${s.phase+1}">下一步：${esc((PH[s.phase+1]||{n:'已结束'}).n)}</button></div>
  ${s.phase>=8&&!s.pub.includes(HD.codes['R3-07'])?`<button class="btn" id="dig">全场决定挖井 → 发 R3-07 井底</button>`:''}
  <details><summary class="fine">跳到某一阶段</summary>${PH.map((p,i)=>`<button class="btn ${i===s.phase?'red':''}" data-ph="${i}">${i+1}. ${esc(p.n)}</button>`).join('')}</details>`;
  if(PH[s.phase].search||Object.keys(s.ap).length){body+=`<div class="grp">行动点</div>`+D.roles.map(r=>`<div class="row"><span class="t">${esc(r.name)}</span><span class="ap"><button data-ap="${r.id}" data-d="-1">−</button><b style="width:28px;text-align:center">${s.ap[r.id]??0}</b><button data-ap="${r.id}" data-d="1">＋</button></span></div>`).join('')}
  if(PH[s.phase].vote||PH[s.phase].reveal){const T=tallyVotes();body+=`<div class="grp">票况<small>已投 ${Object.keys(s.votes).length} / ${online.size||D.roles.length}</small></div>`+
   [['a','谁杀了沈伯衡'],['b','谁扎的那一刀'],['c','沈鹤年是谁杀的']].map(([k,q])=>`<p><b>${q}</b>：${Object.entries(T[k]).sort((a,b)=>b[1]-a[1]).map(([id,n])=>esc(roleName(id)||'没有人')+' '+n).join('，')||'暂无'}</p>`).join('')+`<p class="fine">进入「复盘」阶段时，票况会同步到每个人的手机上。</p>`}
  body+=`<div class="grp">记录</div>${s.log.slice(0,40).map(l=>`<div class="fine">${esc(l)}</div>`).join('')||'<p class="fine">暂无</p>'}
  <details style="margin-top:20px"><summary class="fine">手动发卡（某人连不上时用）</summary><p class="fine">把卡号念给他，他在「线索」页底部手动输入。卡号见「发放单」。</p></details>
  <button class="btn" id="reset" style="margin-top:30px">清空本局进度，重新开始</button>`}
 else body=`<div class="book">${HD.docs[t].html}</div>`;
 app.innerHTML=`<div class="top"><div class="who">主持人台<small>别让玩家看到这块屏幕</small></div><button class="pill" data-go="hostout">退出</button></div>
 <div class="wrap"><div class="tabs">${tabs.map(([k,n])=>`<button class="${String(k)===String(t)?'on':''}" data-ht="${k}">${esc(n)}</button>`).join('')}</div>${body}</div>`;
 app.querySelectorAll('[data-ht]').forEach(b=>b.onclick=()=>{const k=b.dataset.ht;st.htab=k==='run'?k:+k;render();scrollTo(0,0)});
 app.querySelectorAll('[data-ph]').forEach(b=>b.onclick=()=>setPhase(+b.dataset.ph));
 app.querySelectorAll('[data-ap]').forEach(b=>b.onclick=()=>{s.ap[b.dataset.ap]=Math.max(0,(s.ap[b.dataset.ap]??0)+ +b.dataset.d);pushAll()});
 const dg=$('dig');if(dg)dg.onclick=()=>{s.pub.push(HD.codes['R3-07']);s.log.unshift('全场决定挖井');pushAll()};
 const rs=$('reset');if(rs)rs.onclick=()=>{if(rs.dataset.sure){H.s=null;hsInit();pushAll()}else{rs.dataset.sure=1;rs.textContent='再点一次确认清空'}}}

/* ======================= 路由 ======================= */
let view=st.host?'host':(st.role?'player':'home');
function render(){if(!D){app.innerHTML='<div class="hero"><div class="title">寒蟬記</div></div>';return}
 if(view==='home'&&st.host)view='host';if(view==='home'&&st.role)view='player';
 if(view==='home')home();else if(view==='pick')pick();else if(view==='hostlogin')hostLogin();
 else if(view==='host'&&st.host)host();else if(view==='player'&&st.role)player();else{view='home';home()}}
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-card]');if(!b)return;const d=b.dataset;
 if(d.go){if(d.go==='opening')return open('开场',`<div class="book">${D.pub.opening}</div>`);
  if(d.go==='logout'){st.role=null;S.set('role',null);leaveRoom();view='home'}
  else if(d.go==='hostout'){st.host=null;S.set('host',null);view='home'}else view=d.go;render();return}
 if(d.role){login(d.role);return}
 if(d.tab){st.tab=d.tab;render();scrollTo(0,0);return}
 if(d.card){showCard(d.card);return}
 if(d.map){showMap(d.map);return}
 if(d.zimg){const a=asset(d.zimg);if(a)showImg('露台鞋印图',a.img);return}
 if(d.z){document.querySelector('#zm img').style.setProperty('--z',d.z);return}
 if(d.code){const i=$(d.code);const m=tryCode(i.value);$(d.code+'m').textContent=m.msg;i.value='';if(m.n||m.a3)setTimeout(render,700)}});
const hr=(location.hash.match(/^#r(\d{4})$/)||[])[1];if(hr&&!st.host){st.room=hr;S.set('room',hr)}
fetch('data.json').then(r=>r.json()).then(d=>{D=d;
 st.codes.forEach(()=>{});
 if(st.host){const t=dec(D.host,st.host);if(t)HD=JSON.parse(t);else{st.host=null}}
 if(st.role&&!st.host)joinRoom();render()}).catch(()=>{app.innerHTML='<div class="hero"><p>数据没加载出来，刷新试试。</p></div>'});
render();
}
