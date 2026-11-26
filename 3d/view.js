// 寒蝉记 · 立体图与铜锁。依赖 three.min.js / textures.js / models.js / scene.js（按需加载）
const V3 = {};
(function () {
  let loading = null;
  function load(src) { return new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  V3.ready = () => loading || (loading = (async () => { for (const f of ['three.min.js', 'textures.js', 'models.js', 'scene.js']) await load('3d/' + f); })());
  V3.ok = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } };

  /* ------------------------------------------------------------ 立体图 */
  const F2 = 12;
  // 可搜的地方：box = [x0,z0,x1,z1]，at = 标签位置
  const HOT = {
    1: [
      { loc: '前厅', sub: '众人在此', box: [30, 38, 82, 90], at: [57, 6, 70] },
      { loc: '后院', box: [0, 0, 150, 30], at: [86, 3, 16] },
      { loc: '厨房', box: [124, 38, 150, 90], at: [137, 6, 60] },
      { loc: '一楼东厢（顾雪芝）', name: '东厢', sub: '顾雪芝住', box: [82, 64, 106, 90], at: [94, 6, 77] },
      { loc: '前院', box: [0, 90, 150, 115], at: [112, 2, 106] },
      { loc: '老号（公馆后门外三十步）', name: '老号', sub: '后门外三十步', box: [-40, 4, -8, 36], at: [-24, 7, 20] },
    ],
    2: [
      { loc: '书房', box: [50, 60, 100, 90], at: [72, F2 + 6, 68] },
      { loc: '二楼走廊', name: '走廊', box: [0, 52, 150, 60], at: [138, F2 + 2, 56] },
      { loc: '西头卧房（沈伯衡）', name: '卧房', sub: '沈伯衡住', box: [0, 60, 50, 90], at: [20, F2 + 5, 80] },
      { loc: '东头空客房', name: '空客房', box: [100, 60, 150, 90], at: [126, F2 + 5, 77] },
      { loc: '露台', box: [0, 90, 150, 104], at: [50, F2 + 1, 98] },
    ],
  };
  const PLAIN = {
    1: [['柴房', [13, 5, 8]], ['管家房', [36, 5, 10]], ['井', [64, 3, 11]], ['后门', [0, 7, 21.5]], ['西厢', [15, 4, 55]], ['客厅', [94, 4, 50]],
      ['楼梯', [115, 7, 46]], ['下人房', [115, 4, 80]], ['大门', [57, 6, 90]], ['院门', [57, 9, 115]], ['洗手间', [144, 4, 34]]],
    2: [['沈景行房', [25, F2 + 5, 40]], ['二老爷旧房', [79, F2 + 5, 40]], ['杂物间', [137, F2 + 5, 40]], ['楼梯', [115, F2 + 1, 41]], ['落地窗', [92.5, F2 + 8, 90]]],
  };

  let DC = null;
  function drugCab(s, x, z, w, d, h) {
    if (!DC) { const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
      g.fillStyle = '#3a2214'; g.fillRect(0, 0, 1024, 512); const cols = 12, rows = 6, cw = 1024 / cols, rh = 512 / rows;
      const names = '川乌附子黄芪当归川芎白芍熟地人参甘草茯苓白术桂枝麻黄大黄芒硝黄连黄芩栀子柴胡半夏陈皮枳实厚朴杏仁桃仁红花丹参三七天麻钩藤全蝎蜈蚣僵蚕地龙石膏知母';
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const x0 = q * cw, y0 = r * rh;
        g.fillStyle = `rgb(${92 + (r * 7 + q * 13) % 18},${56 + (q * 5) % 10},${32})`; g.fillRect(x0 + 4, y0 + 4, cw - 8, rh - 8);
        g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 3; g.strokeRect(x0 + 4, y0 + 4, cw - 8, rh - 8);
        g.fillStyle = '#efe2c4'; g.fillRect(x0 + cw / 2 - 26, y0 + 12, 52, 26); g.fillStyle = '#2a1a0e'; g.font = '700 16px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        const i = (r * cols + q) * 2 % names.length; g.fillText(names.slice(i, i + 2), x0 + cw / 2, y0 + 25);
        g.fillStyle = '#c39445'; g.beginPath(); g.arc(x0 + cw / 2, y0 + rh * 0.66, 7, 0, 7); g.fill(); }
      DC = new THREE.CanvasTexture(c); DC.colorSpace = THREE.SRGBColorSpace; DC.anisotropy = 8; }
    const m = M.mat('#3a2214'), f = new THREE.MeshStandardMaterial({ map: DC, roughness: 0.6 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [m, m, m, m, f, m]); b.position.set(x, h / 2, z); b.castShadow = b.receiveShadow = true; s.add(b);
    M.box(s, w + 0.4, 0.4, d + 0.4, x, h, z, '#2a170c');
  }
  function oldShop(s) {
    const W = '#d9cfbb';
    M.floor(s, -46, -4, 0, 42, TX.mud(), 14, 0.01);
    M.floor(s, -36, 8, -10, 32, TX.plank([120, 88, 60]), 10, 0.04);
    M.wall(s, -36, 8, -10, 8, 5, 1, W); M.wall(s, -36, 32, -10, 32, 5, 1, W, [[-30, -22, 3, 'win']]);
    M.wall(s, -36, 8, -36, 32, 5, 1, W); M.wall(s, -10, 8, -10, 32, 5, 1, W, [[17, 23]]);
    M.door(s, -10, 17, 6, 1.1, '#5a2e1e');
    M.box(s, 3, 3.4, 16, -16, 0, 20, '#4a2e1c');                      // 柜台
    drugCab(s, -23, 9.4, 18, 2, 7);                                     // 药柜
    M.box(s, 2.6, 6.5, 12, -34.2, 0, 22, '#3f2516');
    M.trunkBox(s, -30, 27, 5, 4, 2.6); M.lamp(s, -16, 3.4, 15);
    [[-7, 21], [-4.5, 21.6], [-2, 21.3]].forEach(([x, z]) => M.box(s, 2, 0.12, 1.6, x, 0, z, '#9a958a'));
  }

  function lights(s, floor) {
    s.add(new THREE.HemisphereLight(0x8f9cc0, 0x2a2018, 1.05));
    const moon = new THREE.DirectionalLight(0xcfd8ff, 1.9);
    moon.position.set(20, 170, 170); moon.target.position.set(70, 0, 60);
    moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
    const sc = moon.shadow.camera; sc.left = -140; sc.right = 140; sc.top = 140; sc.bottom = -140; sc.near = 10; sc.far = 420;
    moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.04;
    s.add(moon); s.add(moon.target);
    const warm = floor === 1 ? [[57, 6, 56], [57, 6, 72], [94, 6, 50], [140, 6, 50], [-16, 6, 15]] : [[69, F2 + 5, 75], [20, F2 + 5, 66], [6, F2 + 5, 54]];
    warm.forEach(p => { const l = new THREE.PointLight(0xffb468, 260, 34, 1.6); l.position.set(...p); s.add(l); });
  }

  function makeMap(host) {
    const el = document.createElement('div'); el.className = 'm3d';
    el.innerHTML = '<div class="m3d-c"></div><div class="m3d-l"></div><div class="m3d-bar"><button data-f="1">一楼及院落</button><button data-f="2">二楼</button><span class="m3d-tip">拖动转视角 · 双指缩放</span></div><div class="m3d-wait">正在搭公馆……</div>';
    const cbox = el.querySelector('.m3d-c'), lbox = el.querySelector('.m3d-l');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x120e0b, 1);
    cbox.appendChild(renderer.domElement);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 3000);
    const view = { az: 0.42, el: 0.9, tx: 58, tz: 48, ppu: 0 };
    const scenes = {}; let floor = 1, need = true, W = 1, H = 1, sel = null;
    const self = { el, floor: () => floor };

    function build(f) {
      if (scenes[f]) return scenes[f];
      const s = new THREE.Scene();
      if (f === 1) SCENE.buildGround(s); else SCENE.buildUpper(s);
      oldShop(s); lights(s, f);
      const hits = [], labels = [];
      HOT[f].forEach(h => {
        const [x0, z0, x1, z1] = h.box, y = f === 2 ? F2 : 0;
        const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 7, z1 - z0), new THREE.MeshBasicMaterial());
        m.position.set((x0 + x1) / 2, y + 3.5, (z0 + z1) / 2); m.updateMatrixWorld(); m.userData = h; hits.push(m);
        const hl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.16, depthWrite: false }));
        hl.rotation.x = -Math.PI / 2; hl.position.set((x0 + x1) / 2, y + 0.15, (z0 + z1) / 2); hl.visible = false; s.add(hl);
        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(x1 - x0, 5.2, z1 - z0)), new THREE.LineBasicMaterial({ color: 0xe8b85a }));
        edge.position.set((x0 + x1) / 2, y + 2.6, (z0 + z1) / 2); edge.visible = false; s.add(edge);
        h._hl = [hl, edge];
        labels.push({ hot: h, at: h.at });
      });
      PLAIN[f].forEach(([t, at]) => labels.push({ t, at }));
      scenes[f] = { s, hits, labels };
      return scenes[f];
    }

    function fit() {
      const r = cbox.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      if (!view.ppu) view.ppu = Math.min(W / 172, H / 112);
      need = true;
    }
    function place() {
      cam.left = -W / 2 / view.ppu; cam.right = W / 2 / view.ppu; cam.top = H / 2 / view.ppu; cam.bottom = -H / 2 / view.ppu;
      const ty = floor === 2 ? F2 : 0, D = 800;
      cam.position.set(view.tx + D * Math.sin(view.az) * Math.cos(view.el), ty + D * Math.sin(view.el), view.tz + D * Math.cos(view.az) * Math.cos(view.el));
      cam.lookAt(view.tx, ty, view.tz); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    }
    let lblEls = [];
    function drawLabels() {
      const sc = scenes[floor]; if (!sc) return;
      if (lblEls.length !== sc.labels.length || lblEls._f !== floor) {
        lbox.innerHTML = ''; lblEls = sc.labels.map(l => {
          const d = document.createElement(l.hot ? 'button' : 'div');
          d.className = l.hot ? 'm3d-hot' : 'm3d-plain';
          d.innerHTML = l.hot ? `<b>${l.hot.name || l.hot.loc}</b>${l.hot.sub ? `<small>${l.hot.sub}</small>` : ''}<i></i>` : l.t;
          if (l.hot) d.onclick = (e) => { e.stopPropagation(); pick(l.hot); };
          lbox.appendChild(d); return d;
        }); lblEls._f = floor;
      }
      const v = new THREE.Vector3();
      sc.labels.forEach((l, i) => {
        v.set(...l.at).project(cam); const d = lblEls[i];
        const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
        d.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
        d.style.display = x < -40 || x > W + 40 || y < -20 || y > H + 20 ? 'none' : '';
        if (l.hot) { const st = self.state ? self.state(l.hot.loc) : ''; d.dataset.st = st; d.querySelector('i').textContent = st === 'can' ? '搜' : st === 'look' ? '勘查' : st === 'done' ? '已翻遍' : ''; d.classList.toggle('sel', sel === l.hot); }
      });
    }
    function pick(h) {
      if (sel && sel._hl) sel._hl.forEach(o => o.visible = false);
      sel = h; if (h && h._hl) h._hl.forEach(o => o.visible = true); need = true;
      if (h && self.onPick) self.onPick(h.loc, h.name || h.loc);
    }
    self.clear = () => { pick(null); };
    function frame() {
      if (!el.isConnected) { raf = 0; return; }
      raf = requestAnimationFrame(frame);
      if (auto) { view.az += 0.0009; need = true; }
      if (!need) return; need = false;
      const sc = scenes[floor]; if (!sc) return;
      place(); renderer.render(sc.s, cam); drawLabels();
    }
    let raf = 0;
    self.attach = (ph) => { ph.replaceWith(el); fit(); if (!raf) raf = requestAnimationFrame(frame); need = true; };
    self.refresh = () => { need = true; };
    function setFloor(f) {
      floor = f; el.querySelectorAll('[data-f]').forEach(b => b.classList.toggle('on', +b.dataset.f === f));
      const w = el.querySelector('.m3d-wait');
      if (!scenes[f]) { w.style.display = ''; setTimeout(() => { build(f); w.style.display = 'none'; lblEls = []; need = true; }, 30); }
      else { lblEls = []; need = true; }
    }
    self.setFloor = setFloor;
    el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => setFloor(+b.dataset.f));
    new ResizeObserver(fit).observe(cbox);

    // 手势
    const ptr = new Map(); let moved = 0, last = null, pinch = null;
    const cv = renderer.domElement; cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button, sh: e.shiftKey }); moved = 0; pinch = null; });
    cv.addEventListener('pointermove', e => {
      const p = ptr.get(e.pointerId); if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      if (ptr.size === 1) {
        if (p.b === 2 || p.sh) pan(dx, dy);
        else { view.az -= dx * 0.008; view.el = Math.max(0.5, Math.min(1.5, view.el + dy * 0.006)); }
      } else if (ptr.size === 2) {
        const [a, b] = [...ptr.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        if (pinch) { zoom(d / pinch.d); pan(mx - pinch.mx, my - pinch.my); }
        pinch = { d, mx, my };
      }
      need = true;
    });
    const up = e => {
      const p = ptr.get(e.pointerId); ptr.delete(e.pointerId); if (ptr.size < 2) pinch = null;
      if (p && moved < 8 && ptr.size === 0) tap(e);
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => { ptr.delete(e.pointerId); pinch = null; });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    cv.addEventListener('wheel', e => { e.preventDefault(); zoom(Math.exp(-e.deltaY * 0.0015)); need = true; }, { passive: false });
    function zoom(k) { const base = Math.min(W / 172, H / 112); view.ppu = Math.max(base * 0.7, Math.min(base * 6, view.ppu * k)); }
    function pan(dx, dy) {
      const s = 1 / view.ppu, se = 1 / Math.sin(view.el);
      const rx = Math.cos(view.az), rz = -Math.sin(view.az), fx = -Math.sin(view.az), fz = -Math.cos(view.az);
      view.tx += (-dx * rx + dy * se * fx) * s; view.tz += (-dx * rz + dy * se * fz) * s;
      view.tx = Math.max(-40, Math.min(160, view.tx)); view.tz = Math.max(-10, Math.min(120, view.tz));
    }
    const ray = new THREE.Raycaster(), nv = new THREE.Vector2();
    function tap(e) {
      const sc = scenes[floor]; if (!sc) return; const r = cv.getBoundingClientRect();
      nv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      place(); ray.setFromCamera(nv, cam); const hit = ray.intersectObjects(sc.hits)[0];
      pick(hit ? hit.object.userData : null);
    }
    let auto = false;
    let modeSet = null;
    self.home = (on) => {
      if (modeSet === on) return; modeSet = on;
      auto = on; el.classList.toggle('home', on);
      if (on) { setFloor(1); view.tx = 57; view.tz = 62; view.el = 0.78; view.az = 0.5; fit(); view.ppu = Math.min(W / 78, H / 70); }
      else { self.reset(); }
      need = true;
    };
    self.reset = () => { view.az = 0.42; view.el = 0.9; view.tx = 58; view.tz = 48; view.ppu = 0; fit(); };
    setFloor(1);
    return self;
  }
  let MAP = null;
  V3.map = () => MAP || (MAP = makeMap());

  /* ------------------------------------------------------------ 走进房间（第一人称） */
  const IH = 10.5, EYE = 5.0;
  /* ---------- 室内：材质 ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  function cvs(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
  function ctex(c, srgb = true, rep) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (rep) t.repeat.set(...rep); return t; }
  let IM = null;
  function imats() {
    if (IM) return IM;
    IM = {};
    // 木纹
    const grain = cvs(512, 512, (g, w, h) => {
      g.fillStyle = '#cdb497'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        const y = rnd(0, h), a = rnd(0.04, 0.22), d = rnd(-1, 1) > 0;
        g.strokeStyle = d ? `rgba(70,40,18,${a})` : `rgba(255,235,200,${a * 0.5})`; g.lineWidth = rnd(0.6, 3);
        g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.013 + i) * rnd(2, 7)); g.stroke();
      }
      for (let k = 0; k < 3; k++) { const x = rnd(40, w - 40), y = rnd(40, h - 40); for (let r = 4; r < 26; r += 3) { g.strokeStyle = `rgba(60,32,12,${0.25 - r / 140})`; g.beginPath(); g.ellipse(x, y, r * 2.2, r * 0.7, 0, 0, 7); g.stroke(); } }
    });
    IM.grain = ctex(grain); IM.grainB = ctex(grain, false);
    const woodCache = {};
    IM.wood = (color, rough = 0.42) => woodCache[color + rough] || (woodCache[color + rough] = new THREE.MeshStandardMaterial({ map: IM.grain, bumpMap: IM.grainB, bumpScale: 0.6, color: new THREE.Color(color).multiplyScalar(1.45), roughness: rough, metalness: 0.05 }));
    // 丝绒（拉扣）
    const velvet = (base) => cvs(256, 256, (g, w, h) => {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      const s = 64; for (let y = 0; y <= h; y += s / 2) for (let x = (y / (s / 2)) % 2 ? s / 2 : 0; x <= w; x += s) {
        const gr = g.createRadialGradient(x, y, 1, x, y, s * 0.55); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.15, 'rgba(0,0,0,.15)'); gr.addColorStop(0.6, 'rgba(255,255,255,.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(x - s, y - s, s * 2, s * 2);
      }
    });
    IM.velvetR = new THREE.MeshStandardMaterial({ map: ctex(velvet('#6e1f1a'), true, [2, 2]), roughness: 0.95 });
    IM.velvetG = new THREE.MeshStandardMaterial({ map: ctex(velvet('#2c3d33'), true, [2, 2]), roughness: 0.95 });
    IM.brass = new THREE.MeshStandardMaterial({ color: 0xc39445, metalness: 0.9, roughness: 0.3 });
    IM.glass = new THREE.MeshStandardMaterial({ color: 0x9fb2bc, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.2 });
    IM.curtainR = new THREE.MeshStandardMaterial({ color: 0x5a1712, roughness: 0.9, side: THREE.DoubleSide });
    IM.curtainG = new THREE.MeshStandardMaterial({ color: 0x23342c, roughness: 0.9, side: THREE.DoubleSide });
    IM.sheer = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    // 墙：护墙板 + 墙纸 / 满墙木板（一块 6 尺宽、10.5 尺高）
    const PX = 85, WW = 6 * PX, WH = Math.round(IH * PX), Y = v => WH - v * PX;
    function panel(g, x, y0, y1, w, dark, light) {
      g.fillStyle = dark; g.fillRect(x, Y(y1), w, (y1 - y0) * PX);
      g.strokeStyle = light; g.lineWidth = 3; g.strokeRect(x + 2, Y(y1) + 2, w - 4, (y1 - y0) * PX - 4);
      g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 3; g.strokeRect(x + 9, Y(y1) + 9, w - 18, (y1 - y0) * PX - 18);
      g.strokeStyle = 'rgba(255,220,170,.18)'; g.lineWidth = 2; g.strokeRect(x + 13, Y(y1) + 13, w - 26, (y1 - y0) * PX - 26);
    }
    function wallC(style) {
      return cvs(WW, WH, (g) => {
        const gr = g.createPattern(grain, 'repeat');
        if (style === 'wood') { g.fillStyle = '#4a2a18'; g.fillRect(0, 0, WW, WH); g.globalAlpha = 0.5; g.fillStyle = gr; g.fillRect(0, 0, WW, WH); g.globalAlpha = 1; }
        else {
          g.fillStyle = '#2f3b33'; g.fillRect(0, 0, WW, WH);
          for (let y = 0; y < WH; y += 64) for (let x = (y / 64) % 2 ? 32 : 0; x < WW + 32; x += 64) {
            g.fillStyle = 'rgba(190,170,110,.10)'; g.beginPath(); g.moveTo(x, y - 22); g.quadraticCurveTo(x + 14, y, x, y + 22); g.quadraticCurveTo(x - 14, y, x, y - 22); g.fill();
            g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); g.strokeStyle = 'rgba(190,170,110,.08)'; g.beginPath(); g.arc(x, y, 14, 0, 7); g.stroke();
          }
        }
        // 上半：木框板
        if (style === 'wood') for (let i = 0; i < 2; i++) panel(g, i * WW / 2 + 14, 4.2, 9.0, WW / 2 - 28, 'rgba(110,62,32,.55)', 'rgba(255,210,150,.15)');
        // 护墙板
        g.fillStyle = '#3a2112'; g.fillRect(0, Y(3.7), WW, 3.7 * PX);
        g.globalAlpha = 0.45; g.fillStyle = gr; g.fillRect(0, Y(3.7), WW, 3.7 * PX); g.globalAlpha = 1;
        for (let i = 0; i < 2; i++) panel(g, i * WW / 2 + 12, 0.75, 3.3, WW / 2 - 24, 'rgba(90,50,26,.6)', 'rgba(255,210,150,.16)');
        // 腰线、踢脚、顶线
        const band = (y0, y1, c, hi) => { g.fillStyle = c; g.fillRect(0, Y(y1), WW, (y1 - y0) * PX); g.fillStyle = hi; g.fillRect(0, Y(y1), WW, 3); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, Y(y0) - 3, WW, 3); };
        band(3.6, 3.95, '#5a341c', 'rgba(255,210,150,.35)'); band(0, 0.55, '#24140b', 'rgba(255,210,150,.2)');
        band(9.5, 10.5, '#3d2414', 'rgba(255,210,150,.3)'); band(9.25, 9.5, style === 'wood' ? '#6a4a30' : '#b8a888', 'rgba(255,255,255,.3)');
        for (let x = 6; x < WW; x += 18) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, Y(10.2), 8, 0.4 * PX); }
      });
    }
    ['wood', 'paper'].forEach(k => { const c = wallC(k); IM['wall_' + k] = new THREE.MeshStandardMaterial({ map: ctex(c), bumpMap: ctex(c, false), bumpScale: 1.2, roughness: k === 'wood' ? 0.55 : 0.85 }); });
    // 门：四抹头隔扇
    const doorC = cvs(256, 512, (g, w, h) => {
      g.fillStyle = '#4a2a16'; g.fillRect(0, 0, w, h); g.globalAlpha = 0.5; g.fillStyle = g.createPattern(grain, 'repeat'); g.fillRect(0, 0, w, h); g.globalAlpha = 1;
      [[20, 20, 216, 200], [20, 240, 216, 50], [20, 310, 216, 182]].forEach(([x, y, ww, hh], i) => {
        g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 4; g.strokeRect(x, y, ww, hh); g.strokeStyle = 'rgba(255,210,150,.2)'; g.lineWidth = 2; g.strokeRect(x + 6, y + 6, ww - 12, hh - 12);
        if (i === 0) { g.strokeStyle = 'rgba(30,15,6,.8)'; g.lineWidth = 5; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x + ww * k / 4, y + 8); g.lineTo(x + ww * k / 4, y + hh - 8); g.stroke(); g.beginPath(); g.moveTo(x + 8, y + hh * k / 4); g.lineTo(x + ww - 8, y + hh * k / 4); g.stroke(); } }
      });
    });
    IM.door = new THREE.MeshStandardMaterial({ map: ctex(doorC), bumpMap: ctex(doorC, false), bumpScale: 1, roughness: 0.5 });
    // 天花：石膏 + 线脚
    const ceilC = cvs(256, 256, (g, w, h) => { g.fillStyle = '#d6ccb6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,100,70,.25)'; g.lineWidth = 3; g.strokeRect(10, 10, w - 20, h - 20); g.strokeRect(22, 22, w - 44, h - 44); });
    IM.ceil = new THREE.MeshStandardMaterial({ map: ctex(ceilC, true, [12, 6]), roughness: 0.95 });
    return IM;
  }
  const WOODS = new Set(['#6b4128', '#3f2516', '#9a6a42', '#4a2e1c', '#8a5a36', '#b88a5a', '#5a3a24', '#4a261a', '#5a2e1e', '#6b4a2e', '#3a1f12', '#5a3420', '#7a5a3a']);
  /* ---------- 室内：构件 ---------- */
  function uvWall(geo, horiz, cx, y0, cz) {
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, ((horiz ? p.getX(i) + cx : p.getZ(i) + cz)) / 6, (p.getY(i) + y0) / IH);
    uv.needsUpdate = true;
  }
  function wallBox(p, len, h, t, cx, y0, cz, horiz, m) {
    const geo = new THREE.BoxGeometry(horiz ? len : t, h, horiz ? t : len); geo.translate(0, h / 2, 0);
    uvWall(geo, horiz, cx, y0, cz);
    const o = new THREE.Mesh(geo, m); o.position.set(cx, y0, cz); o.castShadow = o.receiveShadow = true; p.add(o); return o;
  }
  function drape(p, x, z, horiz, side, h, w, m, y0) {
    const geo = new THREE.PlaneGeometry(w, h, 24, 1), pp = geo.attributes.position;
    for (let i = 0; i < pp.count; i++) { const u = pp.getX(i); pp.setZ(i, Math.sin((u / w) * Math.PI * 7) * 0.16); }
    geo.computeVertexNormals();
    const o = new THREE.Mesh(geo, m); o.position.set(x, y0 + h / 2, z); if (!horiz) o.rotation.y = Math.PI / 2; o.castShadow = true; o.receiveShadow = true; p.add(o); return o;
  }
  function iwall(styleFor) {
    return (p, x0, z0, x1, z1, H = 5, t = 1.2, color = '#e8e0cf', openings = []) => {
      const horiz = Math.abs(z1 - z0) < 1e-6, L = horiz ? Math.abs(x1 - x0) : Math.abs(z1 - z0), a0 = horiz ? Math.min(x0, x1) : Math.min(z0, z1);
      const gy = p.isScene ? 0 : (p.position ? p.position.y : 0);
      const m = IM['wall_' + styleFor(gy)];
      const at = (a) => horiz ? [a, z0] : [x0, a];
      const ops = openings.map(o => ({ s: o[0], e: o[1], sill: o[2] || 0, win: o[3] === 'win' })).sort((a, b) => a.s - b.s);
      let cur = a0 - t / 2; const end = a0 + L + t / 2;
      const seg = (s, e, y0, y1) => { if (e - s < 0.01 || y1 - y0 < 0.01) return; const [cx, cz] = at((s + e) / 2); wallBox(p, e - s, y1 - y0, t, cx, y0, cz, horiz, m); };
      const cx0 = p.isScene ? 0 : 0;
      // 外墙判断：屋内在哪一侧
      const ext = horiz ? (z0 === 30 || z0 === 90 || z0 === 8 || z0 === 32) : (x0 === 0 || x0 === 150 || x0 === -36 || x0 === -10);
      const shop = horiz ? (z0 === 8 || z0 === 32) && x0 < 0 : (x0 === -36 || x0 === -10);
      const ctr = shop ? [-23, 20] : [75, 60];
      const inSign = horiz ? Math.sign(ctr[1] - z0) : Math.sign(ctr[0] - x0);
      ops.forEach(o => {
        seg(cur, o.s, 0, IH);
        const top = o.win ? 7.8 : 7.4; seg(o.s, o.e, top, IH);
        if (o.win) {
          seg(o.s, o.e, 0, o.sill);
          const len = o.e - o.s, [cx, cz] = at((o.s + o.e) / 2);
          const gl = M.box(p, horiz ? len : 0.08, top - o.sill, horiz ? 0.08 : len, cx, o.sill, cz, IM.glass); gl.castShadow = false;
          M.box(p, horiz ? len + 0.4 : t + 0.5, 0.25, horiz ? t + 0.5 : len + 0.4, cx, o.sill - 0.05, cz, IM.wood('#3f2516'));
          for (let k = 0; k <= 3; k++) { const q = o.s + len * k / 3, [mx, mz] = at(q); M.box(p, horiz ? 0.2 : 0.22, top - o.sill, horiz ? 0.22 : 0.2, mx, o.sill, mz, IM.wood('#3f2516')); }
          [o.sill + (top - o.sill) * 0.62, top - 0.15].forEach(y => M.box(p, horiz ? len : 0.22, 0.18, horiz ? 0.22 : len, cx, y, cz, IM.wood('#3f2516')));
          if (ext && !(p.isScene === false && false)) {
            const off = inSign * (t / 2 + 0.45), red = gy > 6;
            const cm = red ? IM.curtainR : IM.curtainG;
            [o.s - 0.5, o.e + 0.5].forEach((q, k) => { const [dx, dz] = at(q); drape(p, horiz ? dx : dx + off, horiz ? dz + off : dz, horiz, k, 8.6, 2.0, cm, 0.4); });
            const [vx, vz] = at((o.s + o.e) / 2);
            M.box(p, horiz ? len + 4 : 0.5, 1.0, horiz ? 0.5 : len + 4, horiz ? vx : vx + off, 8.6, horiz ? vz + off : vz, cm);
            if (Math.random() < 0.9) drape(p, horiz ? vx : vx + off * 0.8, horiz ? vz + off * 0.8 : vz, horiz, 0, top - o.sill - 0.3, len - 0.4, IM.sheer, o.sill + 0.2).scale.set(1, 1, 0.4);
          }
        }
        cur = o.e;
      });
      seg(cur, end, 0, IH);
    };
  }
  function chandelier(s, x, y, z, big) {
    const g = new THREE.Group(); g.position.set(x, y, z); s.add(g);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 8), IM.brass); stem.position.y = -0.8; g.add(stem);
    const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 0.2, 20), IM.brass); rose.position.y = -0.1; g.add(rose);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), IM.brass); body.position.y = -1.75; g.add(body);
    const n = big ? 8 : 5, R = big ? 1.5 : 1.0;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.05, 8, 40), IM.brass); ring.rotation.x = Math.PI / 2; ring.position.y = -1.9; g.add(ring);
    const bulbM = new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffb860, emissiveIntensity: 1.6 });
    const shadeM = new THREE.MeshStandardMaterial({ color: 0xf3e2c0, emissive: 0xffa040, emissiveIntensity: 0.5, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, bx = Math.cos(a) * R, bz = Math.sin(a) * R;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, R, 6), IM.brass); arm.rotation.z = Math.PI / 2; arm.rotation.y = -a; arm.position.set(bx / 2, -1.85, bz / 2); g.add(arm);
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.18, 10), IM.brass); cup.position.set(bx, -1.8, bz); g.add(cup);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), bulbM); bulb.position.set(bx, -1.6, bz); g.add(bulb);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 0.42, 14, 1, true), shadeM); sh.position.set(bx, -1.5, bz); g.add(sh);
    }
    const med = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.06, 32), new THREE.MeshStandardMaterial({ color: 0xd8ceb8, roughness: 0.9 })); med.position.y = -0.03; g.add(med);
    return g;
  }
  // 字画
  const ART = {};
  function artTex(kind, text) {
    const key = kind + (text || ''); if (ART[key]) return ART[key];
    const c = cvs(kind === 'plaque' ? 512 : 256, kind === 'plaque' ? 160 : 640, (g, w, h) => {
      if (kind === 'plaque') {
        g.fillStyle = '#2a170c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8893c'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
        g.fillStyle = '#d9b25a'; g.font = '700 92px "Noto Serif SC","Songti SC",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 6); return;
      }
      g.fillStyle = '#5a4630'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#e8dcbf'; g.fillRect(18, 60, w - 36, h - 110);
      if (kind === 'scroll') {
        for (let k = 0; k < 4; k++) { g.fillStyle = `rgba(40,40,40,${0.12 + k * 0.08})`; g.beginPath(); let x = 18, y = 300 + k * 60; g.moveTo(18, h - 50); for (; x <= w - 18; x += 12) g.lineTo(x, y - Math.abs(Math.sin(x * 0.03 + k * 2)) * (90 - k * 10) - rnd(0, 8)); g.lineTo(w - 18, h - 50); g.fill(); }
        g.fillStyle = 'rgba(180,40,30,.8)'; g.fillRect(w - 52, 90, 16, 16);
      } else {
        g.fillStyle = '#2a2018'; g.font = '700 64px "Noto Serif SC","Songti SC",serif'; g.textAlign = 'center';
        [...(text || '')].forEach((ch, i) => g.fillText(ch, w / 2, 150 + i * 92));
      }
      g.fillStyle = '#2a1a0e'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14);
    });
    return ART[key] = new THREE.MeshStandardMaterial({ map: ctex(c), roughness: 0.8 });
  }
  function hang(s, kind, x, y, z, ry, text, w = 2.2, h = 5.5) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; s.add(g);
    if (kind === 'plaque') { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), [IM.wood('#3f2516'), IM.wood('#3f2516'), IM.wood('#3f2516'), IM.wood('#3f2516'), artTex('plaque', text), IM.wood('#3f2516')]); b.position.z = 0.15; g.add(b); return g; }
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), [IM.wood('#3f2516'), IM.wood('#3f2516'), IM.wood('#3f2516'), IM.wood('#3f2516'), artTex(kind, text), IM.wood('#3f2516')]); b.position.z = 0.05; g.add(b);
    [h / 2, -h / 2].forEach(yy => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, w + 0.3, 10), IM.wood('#2a170c')); r.rotation.z = Math.PI / 2; r.position.set(0, yy, 0.1); g.add(r); });
    return g;
  }
  function clock(s, x, z, ry, y0 = 0) {
    const g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.y = ry; s.add(g);
    const W = IM.wood('#4a2a16', 0.35);
    const add = (geo, m, px, py, pz) => { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); o.castShadow = true; g.add(o); return o; };
    add(new THREE.BoxGeometry(1.8, 1.2, 1.2), W, 0, 0.6, 0); add(new THREE.BoxGeometry(1.4, 3.8, 0.9), W, 0, 3.1, 0); add(new THREE.BoxGeometry(1.9, 2.2, 1.2), W, 0, 6.1, 0);
    add(new THREE.BoxGeometry(2.1, 0.4, 1.4), W, 0, 7.4, 0);
    const face = cvs(128, 128, (gg, w, h) => { gg.fillStyle = '#efe4c8'; gg.beginPath(); gg.arc(64, 64, 60, 0, 7); gg.fill(); gg.strokeStyle = '#3a2a1a'; gg.lineWidth = 3; gg.stroke(); gg.fillStyle = '#2a1a0e'; gg.font = '700 16px serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle';
      for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; gg.fillText(['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][i - 1], 64 + Math.cos(a) * 46, 64 + Math.sin(a) * 46); }
      gg.lineWidth = 4; gg.beginPath(); gg.moveTo(64, 64); gg.lineTo(64 + 30 * Math.cos(-1.2), 64 + 30 * Math.sin(-1.2)); gg.moveTo(64, 64); gg.lineTo(64 + 40 * Math.cos(1.9), 64 + 40 * Math.sin(1.9)); gg.stroke(); });
    const f = add(new THREE.CircleGeometry(0.7, 32), new THREE.MeshStandardMaterial({ map: ctex(face), roughness: 0.6 }), 0, 6.2, 0.61); f.castShadow = false;
    add(new THREE.TorusGeometry(0.72, 0.06, 8, 32), IM.brass, 0, 6.2, 0.62);
    add(new THREE.BoxGeometry(0.9, 2.6, 0.05), IM.glass, 0, 3.2, 0.46);
    add(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 20), IM.brass, 0, 2.4, 0.3).rotation.x = Math.PI / 2;
    return g;
  }
  function lampStand(s, x, y, z) {
    M.cyl(s, 0.35, 0.45, 0.12, x, y, z, IM.brass); M.cyl(s, 0.06, 0.06, 1.1, x, y + 0.1, z, IM.brass);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.75, 0.7, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0x2f5a3a, emissive: 0x3a6a2a, emissiveIntensity: 0.25, side: THREE.DoubleSide, roughness: 0.4 }));
    sh.position.set(x, y + 1.45, z); s.add(sh);
  }
  /* ---------- 室内：家具（覆盖俯视图里的简化版） ---------- */
  function richFurniture() {
    const W = (c = '#5a3420') => IM.wood(c);
    const keep = {};
    const lathe = (pts, m, seg = 16) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), m);
    const leg = (g, x, z, h, m) => { const o = lathe([[0.12, 0], [0.2, 0.15], [0.13, h * 0.3], [0.2, h * 0.55], [0.12, h * 0.8], [0.16, h]], m, 10); o.position.set(x, 0, z); o.castShadow = true; g.add(o); return o; };
    const add = (g, geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; g.add(o); return o; };
    keep.table = M.table;
    M.table = (p, x, z, w, d, h = 2.6, ry = 0, top = '#6b4128') => {
      const g = M.group(p, x, 0, z, ry), m = W(top), m2 = W('#3f2516');
      add(g, new THREE.BoxGeometry(w, 0.22, d), m, 0, h - 0.11, 0);
      add(g, new THREE.BoxGeometry(w + 0.2, 0.1, d + 0.2), m2, 0, h - 0.27, 0);
      add(g, new THREE.BoxGeometry(w - 0.5, 0.45, d - 0.5), m2, 0, h - 0.55, 0);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => leg(g, a * (w / 2 - 0.35), b * (d / 2 - 0.35), h - 0.3, m2));
      return g;
    };
    M.chair = (p, x, z, ry = 0, c = '#6b4128') => {
      const g = M.group(p, x, 0, z, ry), m = W(c), m2 = W('#3f2516');
      add(g, new THREE.BoxGeometry(1.5, 0.16, 1.4), m, 0, 1.5, 0);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => leg(g, a * 0.6, b * 0.56, 1.45, m2));
      [-0.62, 0.62].forEach(a => add(g, new THREE.CylinderGeometry(0.07, 0.07, 2.2, 8), m2, a, 2.6, -0.62));
      const yoke = add(g, new THREE.CylinderGeometry(0.09, 0.09, 1.7, 10), m2, 0, 3.7, -0.62); yoke.rotation.z = Math.PI / 2;
      const splat = add(g, new THREE.BoxGeometry(0.5, 1.9, 0.08), m, 0, 2.65, -0.66); splat.rotation.x = 0.08;
      return g;
    };
    M.armchair = (p, x, z, ry = 0) => {
      const g = M.group(p, x, 0, z, ry), m2 = W('#3a1f12'), v = IM.velvetR;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => leg(g, a * 0.85, b * 0.75, 1.1, m2));
      add(g, new THREE.BoxGeometry(2.1, 0.3, 1.9), m2, 0, 1.15, 0);
      const seat = add(g, new THREE.BoxGeometry(1.9, 0.45, 1.7), v, 0, 1.5, 0.05); seat.geometry.translate(0, 0, 0);
      const back = new THREE.Shape(); back.moveTo(-1, 0); back.lineTo(1, 0); back.lineTo(1, 1.6); back.bezierCurveTo(0.9, 2.5, -0.9, 2.5, -1, 1.6); back.lineTo(-1, 0);
      const bg = new THREE.ExtrudeGeometry(back, { depth: 0.3, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2 });
      add(g, bg, m2, 0, 1.6, -0.95);
      const bp = new THREE.Shape(); bp.moveTo(-0.8, 0); bp.lineTo(0.8, 0); bp.lineTo(0.8, 1.45); bp.bezierCurveTo(0.7, 2.15, -0.7, 2.15, -0.8, 1.45); bp.lineTo(-0.8, 0);
      add(g, new THREE.ExtrudeGeometry(bp, { depth: 0.18, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06 }), v, 0, 1.75, -0.7);
      [-1.02, 1.02].forEach(a => { add(g, new THREE.BoxGeometry(0.22, 0.2, 1.7), m2, a, 2.35, 0); const sc = add(g, new THREE.CylinderGeometry(0.16, 0.16, 0.28, 12), m2, a, 2.4, 0.85); sc.rotation.z = Math.PI / 2; add(g, new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8), m2, a, 1.95, 0.7); });
      return g;
    };
    M.sofa = (p, x, z, w = 6, ry = 0) => {
      const g = M.group(p, x, 0, z, ry), m2 = W('#3a1f12'), v = IM.velvetG;
      [-1, 1].forEach(a => [-1, 1].forEach(b => leg(g, a * (w / 2 - 0.4), b * 1.0, 0.8, m2)));
      add(g, new THREE.BoxGeometry(w, 0.7, 2.6), v, 0, 1.1, 0); add(g, new THREE.BoxGeometry(w - 1.2, 0.4, 2.1), v, 0, 1.65, 0.2);
      add(g, new THREE.BoxGeometry(w - 0.6, 2.0, 0.6), v, 0, 2.0, -1.0);
      [-1, 1].forEach(a => { const arm = add(g, new THREE.CylinderGeometry(0.45, 0.45, 2.6, 16), v, a * (w / 2 - 0.3), 2.2, 0); arm.rotation.x = Math.PI / 2; add(g, new THREE.BoxGeometry(0.6, 1.0, 2.6), v, a * (w / 2 - 0.3), 1.45, 0); });
      add(g, new THREE.BoxGeometry(w, 0.25, 0.3), m2, 0, 3.0, -1.2);
      return g;
    };
    M.wardrobe = (p, x, z, w, d, h = 6.5, ry = 0) => {
      const g = M.group(p, x, 0, z, ry), m = W('#5a3420'), m2 = W('#3a1f12');
      add(g, new THREE.BoxGeometry(w, h - 0.6, d), m, 0, (h - 0.6) / 2 + 0.3, 0);
      add(g, new THREE.BoxGeometry(w + 0.3, 0.4, d + 0.3), m2, 0, h - 0.1, 0); add(g, new THREE.BoxGeometry(w + 0.1, 0.3, d + 0.1), m2, 0, 0.15, 0);
      const n = Math.max(2, Math.round(w / 2.4)); for (let i = 0; i < n; i++) { const cx = -w / 2 + (i + 0.5) * w / n;
        add(g, new THREE.BoxGeometry(w / n - 0.4, h * 0.5, 0.06), m2, cx, h * 0.55, d / 2 + 0.02); add(g, new THREE.BoxGeometry(w / n - 0.4, h * 0.2, 0.06), m2, cx, h * 0.17, d / 2 + 0.02);
        add(g, new THREE.BoxGeometry(w / n - 0.7, h * 0.44, 0.06), m, cx, h * 0.55, d / 2 + 0.05); }
      for (let i = 1; i < n; i++) add(g, new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), IM.brass, -w / 2 + i * w / n, h * 0.5, d / 2 + 0.12);
      return g;
    };
    keep.floor = M.floor; keep.bookcase = M.bookcase; keep.slumped = M.slumped;
    M.floor = (p, x0, z0, x1, z1, tx, scale = 12, y = 0.02, opt) => keep.floor(p, x0, z0, x1, z1, tx, scale * 0.45, y, Object.assign({ roughness: 0.5 }, opt || {}));
    M.bookcase = (p, x, z, w, d, h, ry = 0) => {
      const g = M.group(p, x, 0, z, ry), m = W('#3a1f12');
      add(g, new THREE.BoxGeometry(w, h, 0.2), m, 0, h / 2, -d / 2 + 0.1);
      [-w / 2, w / 2].forEach(a => add(g, new THREE.BoxGeometry(0.25, h, d), m, a, h / 2, 0));
      const n = 5; for (let i = 0; i <= n; i++) add(g, new THREE.BoxGeometry(w, 0.18, d), m, 0, 0.1 + i * (h - 0.3) / n, 0);
      add(g, new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3), m, 0, h + 0.1, 0);
      const cols = ['#6e1f1a', '#2c3d33', '#3a2a1a', '#7a5a2a', '#1f2a3a', '#5a4630', '#8a6a3a', '#2a1a12', '#4a2418'];
      const geo = new THREE.BoxGeometry(1, 1, 1), mat = new THREE.MeshStandardMaterial({ roughness: 0.8 });
      const cnt = Math.floor(w / 0.34) * n; const im = new THREE.InstancedMesh(geo, mat, cnt); let k = 0; const o = new THREE.Object3D(), c = new THREE.Color();
      for (let i = 0; i < n; i++) { let xx = -w / 2 + 0.3; const sh = (h - 0.3) / n, base = 0.1 + i * sh + 0.09;
        while (xx < w / 2 - 0.4 && k < cnt) { const bw = rnd(0.18, 0.38), bh = sh * rnd(0.55, 0.85), bd = d * rnd(0.6, 0.8);
          if (Math.random() < 0.06) { xx += bw * 2; continue; }
          o.position.set(xx + bw / 2, base + bh / 2, -d / 2 + 0.2 + bd / 2); o.rotation.set(0, 0, Math.random() < 0.05 ? 0.25 : 0); o.scale.set(bw, bh, bd); o.updateMatrix(); im.setMatrixAt(k, o.matrix);
          im.setColorAt(k, c.set(cols[Math.floor(Math.random() * cols.length)]).multiplyScalar(rnd(0.7, 1.2))); k++; xx += bw + 0.02; } }
      im.count = k; im.castShadow = im.receiveShadow = true; g.add(im);
      return g;
    };
    M.slumped = (p, x, z, ry = 0) => {
      const g = M.group(p, x, 0, z, ry);
      const gown = new THREE.MeshStandardMaterial({ color: 0x1e2a3c, roughness: 0.85 }), skin = new THREE.MeshStandardMaterial({ color: 0xb59a86, roughness: 0.7 }), hair = new THREE.MeshStandardMaterial({ color: 0x141210, roughness: 0.6 });
      const torso = add(g, new THREE.CylinderGeometry(0.75, 1.0, 2.8, 16), gown, 0, 3.55, 1.6); torso.rotation.x = -1.0;
      const skirt = add(g, new THREE.CylinderGeometry(1.0, 1.35, 2.2, 16), gown, 0, 1.75, 2.9);
      const neck = add(g, new THREE.CylinderGeometry(0.26, 0.3, 0.5, 10), skin, -0.1, 3.4, 0.25); neck.rotation.x = -1.2;
      const head = add(g, new THREE.SphereGeometry(0.62, 20, 16), hair, -0.35, 3.25, -0.4); head.scale.set(1, 0.92, 1.1);
      add(g, new THREE.SphereGeometry(0.2, 8, 8), skin, 0.2, 3.2, -0.35);
      const armL = add(g, new THREE.CylinderGeometry(0.28, 0.32, 2.0, 10), gown, -1.0, 2.95, -0.2); armL.rotation.z = Math.PI / 2; armL.rotation.y = 0.6;
      const armR = add(g, new THREE.CylinderGeometry(0.28, 0.32, 2.2, 10), gown, 1.3, 2.95, 0.2); armR.rotation.z = Math.PI / 2; armR.rotation.y = -0.35;
      add(g, new THREE.SphereGeometry(0.28, 10, 8), skin, -1.9, 2.92, -0.75); add(g, new THREE.SphereGeometry(0.28, 10, 8), skin, 2.4, 2.92, -0.25);
      const knife = add(g, new THREE.CylinderGeometry(0.07, 0.09, 1.0, 8), IM.brass, -0.55, 4.25, 1.25); knife.rotation.x = 0.5; knife.rotation.z = 0.3;
      const blood = add(g, new THREE.CircleGeometry(0.55, 20), new THREE.MeshStandardMaterial({ color: 0x3a0c08, roughness: 0.4 }), -0.45, 3.92, 1.35); blood.rotation.x = -0.55;
      return g;
    };
    return () => { Object.assign(M, keep); };
  }
  function interior(fn, f) {
    imats();
    const ow = M.wall, od = M.door, ot = M.table, oc = M.chair, oa = M.armchair, os = M.sofa, owr = M.wardrobe, of = M.floor, ob = M.bookcase, osl = M.slumped;
    M.wall = iwall(y => (y > 6 ? 'wood' : 'paper'));
    M.door = (p, x, z, w, angle) => { const g = M.group(p, x, 0, z, angle); const b = M.box(g, w, 7.3, 0.25, w / 2, 0, 0, IM.door); M.cyl(g, 0.12, 0.12, 0.5, w - 0.5, 3.6, 0.2, IM.brass); return g; };
    M.matHook = (color, opt) => (WOODS.has(color) && !opt.transparent ? IM.wood(color) : null);
    richFurniture();
    try { fn(); } finally { M.wall = ow; M.door = od; M.table = ot; M.chair = oc; M.armchair = oa; M.sofa = os; M.wardrobe = owr; M.floor = of; M.bookcase = ob; M.slumped = osl; M.matHook = null; }
  }
  function decorate(s, f) {
    if (f === 2) {
      const y = F2;
      hang(s, 'plaque', 51.0, y + 8.9, 75.5, Math.PI / 2, '懸壺濟世', 7, 1.6);
      hang(s, 'scroll', 99.4, y + 6, 79, -Math.PI / 2);
      clock(s, 98.4, 85.5, -Math.PI / 2, y);
      lampStand(s, 70.5, y + 2.6, 74.6);
      hang(s, 'scroll', 0.65, y + 6, 70, Math.PI / 2); hang(s, 'calli', 49.4, y + 6, 78, -Math.PI / 2, '靜水流深');
      hang(s, 'calli', 30, y + 6, 59.4, Math.PI, '寧靜致遠'); hang(s, 'scroll', 90, y + 6, 59.4, Math.PI);
      hang(s, 'scroll', 100.6, y + 6, 72, Math.PI / 2);
      chandelier(s, 75, y + IH, 75, true); chandelier(s, 25, y + IH, 75, false); chandelier(s, 125, y + IH, 75, false);
      [30, 95].forEach(x => chandelier(s, x, y + IH, 56, false));
    } else {
      hang(s, 'plaque', 57, 9.0, 38.65, 0, '沈萬春堂', 9, 1.9);
      hang(s, 'calli', 49.5, 5.6, 38.7, 0, '杏林春暖'); hang(s, 'calli', 64.5, 5.6, 38.7, 0, '橘井泉香');
      hang(s, 'scroll', 57, 5.4, 38.7, 0, null, 3.6, 5.0);
      clock(s, 79.5, 86.5, Math.PI, 0);
      hang(s, 'scroll', 105.4, 6, 50, -Math.PI / 2); hang(s, 'calli', 105.4, 6, 76, -Math.PI / 2, '花好月圓');
      hang(s, 'scroll', 30.6, 6, 70, Math.PI / 2);
      chandelier(s, 57, IH, 54, true); chandelier(s, 57, IH, 74, true); chandelier(s, 94, IH, 51, true); chandelier(s, 94, IH, 77, false);
      chandelier(s, 15, IH, 64, false); chandelier(s, -23, IH, 20, false);
      lampStand(s, 102.6, 3.9, 69);
    }
  }
  function figure(s, x, z, ry, robe = '#2f3a3a') {
    const g = M.group(s, x, 0, z, ry), c = M.mat(robe), sk = M.mat('#c9a688'), hr = M.mat('#1a1614');
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.05, 4.2, 14), c); body.position.y = 2.1; body.castShadow = true; g.add(body);
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 10), c); sh.scale.set(1.15, 0.55, 0.8); sh.position.y = 4.2; g.add(sh);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 14), sk); head.position.y = 4.95; g.add(head);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.57, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), hr); cap.position.y = 5.0; g.add(cap);
    return g;
  }
  function pendant(s, x, y, z) {
    M.cyl(s, 0.03, 0.03, 1.6, x, y - 1.6, z, '#222');
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.7, 20, 1, true), M.mat('#e9d9b0', { emissive: '#ff9a3a', emissiveIntensity: 0.35, side: THREE.DoubleSide }));
    shade.position.set(x, y - 1.9, z); s.add(shade);
  }
  const ROOMS1 = [[57, 52], [57, 76], [94, 51], [94, 77], [137, 62], [115, 77], [15, 64], [75, 34], [-23, 20]];
  const ROOMS2 = [[75, 75], [25, 75], [125, 75], [30, 56], [95, 56], [135, 56], [25, 41], [79, 41]];
  const DIM = { '125,75': 0.35, '135,56': 0.6 };
  function buildInterior(f, renderer) {
    const s = new THREE.Scene();
    s.background = new THREE.Color(0x0a0c14); s.fog = new THREE.Fog(0x0a0c14, 90, 260);
    interior(() => { if (f === 1) SCENE.buildGround(s); else SCENE.buildUpper(s); oldShop(s); }, f);
    if (renderer && !IM.brass.envMap) { const e = envMap(renderer); IM.brass.envMap = e; }
    const y0 = f === 2 ? F2 : 0;
    const ce = new THREE.Mesh(new THREE.BoxGeometry(151, 0.4, 61), IM.ceil); ce.position.set(75, y0 + IH + 0.2, 60); ce.castShadow = ce.receiveShadow = true; s.add(ce);
    if (f === 1) { const c2 = new THREE.Mesh(new THREE.BoxGeometry(27, 0.4, 25), IM.ceil); c2.position.set(-23, IH + 0.2, 20); c2.castShadow = true; s.add(c2); }
    if (f === 2) M.box(s, 152, 0.3, 4, 75, y0 + IH + 0.2, 92, '#2a2420');
    decorate(s, f);
    s.add(new THREE.HemisphereLight(0x6c7aa6, 0x2a1e14, 0.75));
    const moon = new THREE.DirectionalLight(0xaab8ff, 1.6);
    moon.position.set(10, 160, 240); moon.target.position.set(75, 0, 60); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
    const sc = moon.shadow.camera; sc.left = -150; sc.right = 150; sc.top = 150; sc.bottom = -150; sc.near = 10; sc.far = 500; moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.05;
    s.add(moon, moon.target);
    (f === 1 ? ROOMS1 : ROOMS2).forEach(([x, z]) => {
      const k = DIM[x + ',' + z] ?? 1;
      const l = new THREE.PointLight(0xffb36a, 110 * k, 34, 1.6); l.position.set(x, y0 + IH - 2.8, z); s.add(l);
    });
    if (f === 2) { const l = new THREE.PointLight(0xffd090, 22, 12, 1.5); l.position.set(70.5, F2 + 4.4, 74.6); s.add(l); }
    if (f === 1) {
      figure(s, -8, 20.5, -Math.PI / 2, '#3a3428');
      figure(s, 40, 107, Math.PI * 0.9, '#2b2f3a');
      const lt = new THREE.PointLight(0xffa850, 60, 26, 1.6); lt.position.set(40, 6, 104); s.add(lt);
      const lt2 = new THREE.PointLight(0xffa850, 40, 22, 1.6); lt2.position.set(17, 7, 21); s.add(lt2);
    }
    return s;
  }
  // 机位：look = 初始朝向点
  const VP = {
    '前厅': [{ f: 1, at: [45, 85], look: [60, 50], n: '大门口' }, { f: 1, at: [70, 47], look: [50, 72], n: '主位边' }],
    '书房': [{ f: 2, at: [76, 67.6], look: [76.5, 80], n: '书桌前' }, { f: 2, at: [93, 74], look: [72, 78], n: '落地窗边' }, { f: 2, at: [59, 65], look: [53, 76], n: '门口' }],
    '二楼走廊': [{ f: 2, at: [14, 56], look: [60, 56], n: '西头' }, { f: 2, at: [62, 56], look: [59, 60], n: '书房门外' }, { f: 2, at: [128, 56], look: [60, 56], n: '东头' }],
    '西头卧房（沈伯衡）': [{ f: 2, at: [40, 71], look: [18, 70], n: '屋里' }],
    '东头空客房': [{ f: 2, at: [111, 71], look: [128, 80], n: '屋里' }],
    '露台': [{ f: 2, at: [30, 97], look: [90, 94], n: '西段' }, { f: 2, at: [90, 98], look: [91, 90], n: '落地窗外' }, { f: 2, at: [128, 97], look: [80, 95], n: '东段' }],
    '后院': [{ f: 1, at: [52, 24], look: [64, 11], n: '井边' }, { f: 1, at: [30, 25], look: [12, 10], n: '柴房前' }],
    '厨房': [{ f: 1, at: [133, 80], look: [142, 46], n: '厨房' }],
    '一楼东厢（顾雪芝）': [{ f: 1, at: [87.5, 76], look: [101, 70], n: '屋里' }],
    '老号（公馆后门外三十步）': [{ f: 1, at: [-23, 29.5], look: [-19, 13], n: '老号' }],
    '前院': [{ f: 1, at: [70, 110], look: [40, 104], n: '前院' }],
  };
  // 可查看的地方：r1 = 第一轮可得，r2 = 第二轮对应卡，t = 没有卡时的描述
  const SP = {
    '前厅': [
      { n: '长桌', at: [57, 3.6, 66], t: '晚宴撤了一半，碗碟还摆着，十个座位空了一个。' },
      { n: '主位', at: [57, 4.6, 45.2], t: '六点四十分，沈伯衡就坐在这里，说子时要当众开铁盒。说完他上了楼。' },
      { n: '匾额', at: [57, 9.6, 39], t: '「沈萬春堂」，老太爷的字。' },
      { n: '落地钟', at: [79.5, 6.4, 86], t: '钟走得很准。' },
      { n: '大门', at: [57, 4.5, 89.6], t: '大门外是前院，再往外是院门。' },
      { n: '客厅', at: [82, 4.5, 46.8], t: '往东是客厅，留声机还开着盖。' },
    ],
    '书房': [
      { n: '尸体', at: [75.2, 16.9, 80.4], r1: ['R1-01', 'R1-02', 'R1-07'], r2: ['R2-01'], t: '他伏在桌上，已经凉了。' },
      { n: '拆信刀', at: [78.6, 15.3, 79.6], r1: ['R1-02'], r2: ['R2-02'], t: '黄铜刀柄露在外面，刀柄朝上。' },
      { n: '药盏', at: [69.6, 15.2, 79.4], r1: ['R1-05'], r2: ['R2-03'], t: '白瓷药盏，盏底一层褐色药渍。' },
      { n: '书桌', at: [82, 14.8, 76.5], r1: ['R1-05'], t: '流水账合着，手边有一块长方形的地方没有灰。' },
      { n: '笔架', at: [84.6, 15.2, 79.4], r1: ['R1-05'], t: '笔架上空着一个插口，拆信刀原本插在这里。' },
      { n: '门闩', at: [59, 16, 60.8], r1: ['R1-03'], t: '断成两截的木闩还丢在门边，断口很新。' },
      { n: '南窗', at: [69, 17, 89.4], r1: ['R1-04'], t: '插销插得好好的，窗台的灰没有动过。' },
      { n: '落地窗', at: [92.5, 17, 89.4], r1: ['R1-04'], t: '窗扇虚掩着，插销是坏的。' },
      { n: '多宝格', at: [53.4, 17, 75.5], r1: ['R1-06'], t: '一排药罐，中间空着一格，灰印很新。' },
      { n: '纸篓', at: [91, 14.6, 83.2], r1: ['R1-08'], t: '纸灰已经被人翻过了。' },
      { n: '铁盒', at: [79.3, 20, 62.6], r1: ['R1-09'], t: '紫檀铁盒还搁在书架顶上，铜锁扣着。' },
      { n: '书架', at: [70, 16.5, 62.8], t: '医书、药典、几大本旧账，排得满满的，看不出动过。' },
      { n: '扶手椅', at: [96.2, 14.6, 68], t: '椅背上搭着一条薄毯，叠得整整齐齐。' },
    ],
    '二楼走廊': [
      { n: '兰花', at: [3, 15.2, 56], r2: ['R2-04'], t: '一盆兰花，叶子有点蔫。' },
      { n: '书房门下沿', at: [59, 12.8, 59.6], r2: ['R2-04'], t: '门下沿的木头旧了，边上磨得发亮。' },
      { n: '煤油灯', at: [6.5, 15.9, 53.6], t: '灯罩熏得发黑，灯油还剩一半。' },
      { n: '楼梯口', at: [115, 13, 51], t: '楼梯通到一楼。木板踩上去吱呀响。' },
    ],
    '西头卧房（沈伯衡）': [
      { n: '床头柜', at: [20.2, 15, 64.8], r2: ['R2-05'], t: '床头柜上一只空茶碗。' },
      { n: '南窗', at: [21.5, 16.5, 89.4], r2: ['R2-05'], t: '南窗关着。' },
      { n: '衣柜', at: [39.5, 16.5, 64.2], t: '几件长衫，口袋都是空的。' },
      { n: '写字台', at: [40, 15, 81.5], t: '一摞信封，都是药行往来的公函。' },
      { n: '床', at: [10, 14.5, 72], t: '被子叠着，没睡过。' },
    ],
    '东头空客房': [
      { n: '藤椅', at: [104.5, 14.4, 65], r2: ['R2-06'], t: '一把旧藤椅，坐垫有点塌。' },
      { n: '南窗窗台', at: [128, 15.4, 89.4], r2: ['R2-06'], t: '窗台很高，积着厚灰。' },
      { n: '箱笼', at: [132.5, 15, 65.5], t: '樟木箱子，锁着，锁头上的灰没动过。' },
      { n: '蒙布的家具', at: [138, 15, 83], t: '白布底下是一张旧八仙桌，几把椅子倒扣着。' },
    ],
    '露台': [
      { n: '地上的积灰', at: [88, 12.3, 94], r2: ['R2-07'], t: '露台上积着一层灰。' },
      { n: '落地窗', at: [92.5, 15.5, 90.6], r2: ['R2-07'], t: '书房的落地窗，从外面一推就开。' },
      { n: '栏杆', at: [60, 15, 103.6], t: '栏杆外面就是前院。底下站着人，抬头能看见这里。' },
    ],
    '后院': [
      { n: '井口', at: [64, 1.6, 11], r2: ['R2-08'], t: '青石板盖着井口。' },
      { n: '泥地', at: [42, 0.3, 16], r2: ['R2-08'], t: '后院是泥地，青灰色的土，有点潮。' },
      { n: '柴堆', at: [12, 3, 8], r2: ['R2-09', 'R2-10'], t: '柴房里堆着劈好的柴。' },
      { n: '管家房', at: [36, 4, 12], t: '门关着，屋里没点灯。' },
    ],
    '厨房': [
      { n: '灶台', at: [143.4, 4, 44], r2: ['R2-11'], t: '灶上温着一碗莲子羹。' },
      { n: '灶膛', at: [140.5, 1.4, 46.6], r2: ['R2-12'], t: '灶膛里一层冷灰。' },
      { n: '条案', at: [127.8, 4.4, 62], r2: ['R2-11'], t: '条案上摆着几只调料罐。' },
      { n: '水缸', at: [146.8, 2.6, 56], t: '半缸清水，冰凉。' },
    ],
    '一楼东厢（顾雪芝）': [
      { n: '妆奁', at: [102.6, 4.6, 67.7], r2: ['R2-13'], t: '一只紫檀妆奁。' },
      { n: '绣鞋', at: [95, 0.4, 76.6], r2: ['R2-13'], t: '床边一双绣鞋。' },
      { n: '衣柜', at: [88.5, 5, 68.2], r2: ['R2-14'], t: '衣柜里挂着几件旗袍。' },
      { n: '床', at: [98.75, 3, 82.9], t: '床褥铺得平平整整。' },
    ],
    '老号（公馆后门外三十步）': [
      { n: '柜台', at: [-16, 4, 17], r2: ['R2-15'], t: '柜台上一本取药簿。' },
      { n: '药柜', at: [-23, 5, 10.2], r2: ['R2-16'], t: '一排小抽屉，每格贴着药名。' },
      { n: '看门的老李', at: [-8, 5.4, 20.5], r2: ['R2-17'], t: '老李缩着脖子，不太想说话。' },
      { n: '账柜', at: [-34, 5, 22], r2: ['R2-18'], t: '账柜上了锁。' },
      { n: '樟木箱', at: [-30, 3, 27], t: '锁着。锁头上的灰蹭掉了一块。' },
    ],
    '前院': [
      { n: '巡夜的老周', at: [40, 5.4, 107], r2: ['R2-19'], t: '老周提着灯，在院子里来回走。' },
      { n: '露台', at: [75, 14, 103.5], t: '仰头能看见二楼整条露台，栏杆后面黑着。' },
      { n: '台阶', at: [57, 1, 92.6], t: '大门外的台阶，扫得很干净。' },
    ],
  };
  V3.spots = SP;

  function makeWalk() {
    const el = document.createElement('div'); el.className = 'walk';
    el.innerHTML = '<div class="walk-c"></div><div class="walk-l"></div><div class="walk-top"><button class="pill" data-w="back">全图</button><div class="walk-t"><b></b><small></small></div><div class="walk-i"></div></div><div class="walk-tip">拖动环视 · 点亮处可以查看</div><div class="walk-wait">正在点灯……</div>';
    const cbox = el.querySelector('.walk-c'), lbox = el.querySelector('.walk-l'), wait = el.querySelector('.walk-wait');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    cbox.appendChild(renderer.domElement);
    const cam = new THREE.PerspectiveCamera(70, 1, 0.3, 600);
    const scenes = {}; let cur = null, loc = null, vps = [], vi = 0, yaw = 0, pitch = -0.12, need = true, W = 1, H = 1, tw = null;
    const pos = new THREE.Vector3();
    const self = { el };
    function fit() { const r = cbox.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); renderer.setSize(W, H, false); cam.aspect = W / H; cam.fov = W / H < 0.8 ? 92 : 64; cam.updateProjectionMatrix(); need = true; }
    function place() {
      const f = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
      cam.position.copy(pos); cam.lookAt(pos.clone().add(f)); cam.updateMatrixWorld();
    }
    let lbl = [];
    function labels() {
      if (!lbl._loc || lbl._loc !== loc + vi) {
        lbox.innerHTML = ''; lbl = [];
        (SP[loc] || []).forEach(sp => { const d = document.createElement('button'); d.className = 'walk-spot'; d.innerHTML = `<i></i><span>${sp.n}</span>`; d.onclick = e => { e.stopPropagation(); self.onSpot && self.onSpot(loc, sp); }; lbox.appendChild(d); lbl.push({ d, at: sp.at, sp }); });
        vps.forEach((v, i) => { if (i === vi) return; const d = document.createElement('button'); d.className = 'walk-go'; d.innerHTML = `<span>去${v.n}</span>`; d.onclick = e => { e.stopPropagation(); go(i); }; lbox.appendChild(d); lbl.push({ d, at: [v.at[0], (v.f === 2 ? F2 : 0) + 0.3, v.at[1]] }); });
        lbl._loc = loc + vi;
      }
      const v = new THREE.Vector3();
      lbl.forEach(o => {
        v.set(...o.at); const dist = v.distanceTo(pos); v.project(cam);
        const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H, vis = v.z < 1 && x > -60 && x < W + 60 && y > -30 && y < H + 30 && dist < 120;
        o.d.style.display = vis ? '' : 'none';
        if (vis) { o.d.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${Math.max(0.75, Math.min(1.15, 26 / dist)).toFixed(2)})`; }
        if (o.sp) { const s = self.state ? self.state(loc, o.sp) : ''; o.d.dataset.st = s; }
      });
    }
    function frame() {
      if (!el.isConnected) { raf = 0; return; }
      raf = requestAnimationFrame(frame);
      if (tw) { const t = Math.min(1, (performance.now() - tw.t0) / 700), e = t * t * (3 - 2 * t); pos.lerpVectors(tw.a, tw.b, e); yaw = tw.y0 + (tw.y1 - tw.y0) * e; if (t >= 1) tw = null; need = true; }
      if (!need || !cur) return; need = false; place(); renderer.render(cur, cam); labels();
    }
    let raf = 0;
    function yawTo(v, x, z) { return Math.atan2(x - v.at[0], z - v.at[1]); }
    function go(i, instant) {
      vi = i; const v = vps[i], p = new THREE.Vector3(v.at[0], (v.f === 2 ? F2 : 0) + EYE, v.at[1]);
      let y1 = yawTo(v, v.look[0], v.look[1]);
      if (instant) { pos.copy(p); yaw = y1; pitch = W / H < 0.8 ? -0.3 : -0.15; }
      else { while (y1 - yaw > Math.PI) y1 -= 2 * Math.PI; while (yaw - y1 > Math.PI) y1 += 2 * Math.PI; tw = { a: pos.clone(), b: p, y0: yaw, y1, t0: performance.now() }; }
      lbl._loc = null; need = true;
    }
    self.enter = (l, title, sub) => {
      loc = l; vps = VP[l] || []; if (!vps.length) return;
      el.querySelector('.walk-t b').textContent = title || l; el.querySelector('.walk-t small').textContent = sub || '';
      const f = vps[0].f;
      const start = () => { cur = scenes[f]; wait.style.display = 'none'; go(0, true); need = true; };
      if (scenes[f]) start(); else { wait.style.display = ''; cur = null; setTimeout(() => { scenes[f] = buildInterior(f, renderer); start(); }, 40); }
      lbl._loc = null;
    };
    self.attach = (host) => { host.appendChild(el); fit(); if (!raf) raf = requestAnimationFrame(frame); need = true; };
    self.refresh = () => { need = true; };
    self.info = (h) => { el.querySelector('.walk-i').innerHTML = h; };
    self.sub = (h) => { el.querySelector('.walk-t small').innerHTML = h; };
    self.loc = () => loc;
    self.go = (i) => go(i, true);
    self.turn = (d) => { yaw += d; need = true; };
    el.querySelector('[data-w=back]').onclick = () => self.onBack && self.onBack();
    new ResizeObserver(fit).observe(cbox);
    const cv = renderer.domElement; cv.style.touchAction = 'none';
    const ptr = new Map(); let pinch = null;
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); pinch = null; });
    cv.addEventListener('pointermove', e => {
      const p = ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (ptr.size === 1) { const k = cam.fov / 70 * 0.0055; yaw += dx * k; pitch = Math.max(-1.2, Math.min(1.0, pitch + dy * k)); }
      else if (ptr.size === 2) { const [a, b] = [...ptr.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) { cam.fov = Math.max(30, Math.min(85, cam.fov * pinch / d)); cam.updateProjectionMatrix(); } pinch = d; }
      need = true;
    });
    const up = e => { ptr.delete(e.pointerId); if (ptr.size < 2) pinch = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); cam.fov = Math.max(30, Math.min(85, cam.fov * Math.exp(e.deltaY * 0.001))); cam.updateProjectionMatrix(); need = true; }, { passive: false });
    return self;
  }
  let WALK = null;
  V3.walk = () => WALK || (WALK = makeWalk());
  V3.canWalk = l => !!VP[l];
  V3.label = l => { for (const f of [1, 2]) { const h = HOT[f].find(x => x.loc === l); if (h) return h.name || h.loc; } return l; };

  /* ------------------------------------------------------------ 铜锁 */
  function envMap(renderer) {
    const s = new THREE.Scene();
    const g = new THREE.SphereGeometry(50, 32, 16), cols = [];
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 50; const c = new THREE.Color().setRGB(0.12 + 0.5 * Math.max(0, y), 0.1 + 0.42 * Math.max(0, y), 0.08 + 0.3 * Math.max(0, y)); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    s.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), new THREE.MeshBasicMaterial({ color: 0xfff0d0 }));
    lamp.position.set(-10, 34, 20); lamp.lookAt(0, 0, 0); s.add(lamp);
    const pm = new THREE.PMREMGenerator(renderer); const t = pm.fromScene(s, 0.02).texture; pm.dispose(); return t;
  }
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  function rounded(w, h, r) { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; }
  const NUM = '〇一二三四五六七八九';

  V3.lock = function (onTry) {
    const el = document.createElement('div'); el.className = 'lock3d';
    el.innerHTML = '<div class="lock3d-c"></div><p class="fine">上下拨动转轮，对好四个字再开锁。</p>';
    const cbox = el.querySelector('.lock3d-c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    cbox.appendChild(renderer.domElement);
    const s = new THREE.Scene(); s.environment = envMap(renderer);
    const brass = new THREE.MeshStandardMaterial({ color: 0xc9953f, metalness: 1, roughness: 0.32 });
    const brassD = new THREE.MeshStandardMaterial({ color: 0x8a5f22, metalness: 1, roughness: 0.45 });
    const iron = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 1, roughness: 0.28 });
    // 紫檀盒面
    const wood = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = '#3a1a12'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(${90 + Math.random() * 40},${36 + Math.random() * 16},${24},${0.15 + Math.random() * 0.25})`; g.lineWidth = 1 + Math.random() * 3; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + Math.random() * 20 - 10, w * 0.7, y + Math.random() * 20 - 10, w, y + Math.random() * 10 - 5); g.stroke(); }
    });
    const box = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 2), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5, metalness: 0 }));
    box.position.set(0, -1.5, -1.6); box.receiveShadow = true; s.add(box);
    // 搭扣
    const hasp = new THREE.Mesh(new THREE.ExtrudeGeometry(rounded(3.2, 5.4, 0.6), { depth: 0.25, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2 }), brassD);
    hasp.position.set(0, 2.2, -0.6); hasp.castShadow = true; s.add(hasp);
    // 锁身
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(rounded(7.4, 4.2, 0.7), { depth: 1.6, bevelEnabled: true, bevelSize: 0.22, bevelThickness: 0.22, bevelSegments: 4, curveSegments: 10 }), brass);
    body.position.set(0, -0.6, -0.4); body.castShadow = true; s.add(body);
    // 锁面刻字
    const face = canvasTex(1024, 580, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.font = '700 150px "Noto Serif SC","Songti SC",serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = 'rgba(70,40,10,0.85)'; g.fillText('勿 忘', w / 2, 120);
      g.fillStyle = 'rgba(255,220,150,0.35)'; g.fillText('勿 忘', w / 2 + 3, 124);
      g.strokeStyle = 'rgba(70,40,10,0.6)'; g.lineWidth = 6; g.strokeRect(40, 230, w - 80, 220);
    });
    const fp = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 4.08), new THREE.MeshStandardMaterial({ map: face, transparent: true, metalness: 0.6, roughness: 0.5 }));
    fp.position.set(0, -0.6, 1.43); s.add(fp);
    // 窗口凹槽
    const slot = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x1a120a, roughness: 0.9 }));
    slot.position.set(0, -1.15, 1.36); s.add(slot);
    // 转轮
    const wheelTex = canvasTex(1024, 128, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6e4a1c'); gr.addColorStop(0.5, '#d8a85a'); gr.addColorStop(1, '#6e4a1c');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.font = '700 78px "Noto Serif SC","Songti SC",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#241608';
      for (let i = 0; i < 10; i++) { g.save(); g.translate((i + 0.5) * w / 10, h / 2); g.rotate(Math.PI / 2); g.fillText(NUM[i], 0, 4); g.restore(); g.fillStyle = 'rgba(40,24,8,0.5)'; g.fillRect((i + 1) * w / 10 - 2, 0, 4, h); g.fillStyle = '#241608'; }
    });
    wheelTex.wrapS = THREE.RepeatWrapping; wheelTex.offset.x = 0.07;
    const wheels = [];
    for (let i = 0; i < 4; i++) {
      const grp = new THREE.Group(); grp.position.set(-2.25 + i * 1.5, -1.15, 0.9); s.add(grp);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 1.2, 40, 1, true), new THREE.MeshStandardMaterial({ map: wheelTex, metalness: 0.85, roughness: 0.38 }));
      m.rotation.z = Math.PI / 2; grp.add(m);
      [-0.62, 0.62].forEach(x => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.06, 40), brassD); r.rotation.z = Math.PI / 2; r.position.x = x; grp.add(r); });
      grp.userData = { i, v: 0, a: 0 }; m.userData.wheel = grp; wheels.push(grp);
    }
    // 读数窗：上下两条压板，只露中间一格
    [0.66, -0.66].forEach(dy => { const b = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.46, 0.4), brass); b.position.set(0, -1.15 + dy, 1.62); b.castShadow = true; s.add(b); });
    // 锁梁
    const shackle = new THREE.Group(); s.add(shackle);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.26, 16, 40, Math.PI), iron); arc.position.y = 3.6; shackle.add(arc);
    [-1.25, 1.25].forEach(x => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 2.6, 20), iron); c.position.set(x, 2.3, 0); shackle.add(c); });
    shackle.position.z = 0.4; shackle.children.forEach(c => c.castShadow = true);
    // 光
    s.add(new THREE.HemisphereLight(0xffe9c8, 0x221810, 0.6));
    const key = new THREE.DirectionalLight(0xffe2b0, 2.2); key.position.set(-6, 10, 12); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    const kc = key.shadow.camera; kc.left = -12; kc.right = 12; kc.top = 12; kc.bottom = -12; s.add(key);
    const rim = new THREE.DirectionalLight(0x9fb4ff, 0.6); rim.position.set(8, 4, -6); s.add(rim);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0.8, 1.2, 19); cam.lookAt(0, 0.2, 0);
    let W = 1, H = 1, need = true, open = false, openT = 0;
    function fit() { const r = cbox.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); renderer.setSize(W, H, false); cam.aspect = W / H; cam.fov = W / H < 1.1 ? 40 : 30; cam.updateProjectionMatrix(); need = true; }
    let raf = 0, shake = 0;
    function frame() {
      if (!el.isConnected) { raf = 0; return; }
      raf = requestAnimationFrame(frame);
      let busy = false;
      wheels.forEach(w => { const tgt = w.userData.drag ? w.userData.a : w.userData.v * Math.PI / 5; const cur = w.rotation.x; const nx = cur + (tgt - cur) * 0.3; if (Math.abs(nx - cur) > 1e-4) { w.rotation.x = nx; busy = true; } else w.rotation.x = tgt; });
      if (open && openT < 1) { openT = Math.min(1, openT + 0.04); shackle.position.y = 1.4 * Math.sin(openT * Math.PI / 2); shackle.rotation.y = openT > 0.6 ? (openT - 0.6) * 2.2 : 0; busy = true; }
      if (shake > 0) { shake -= 1; s.position.x = Math.sin(shake * 1.7) * 0.12 * (shake / 20); busy = true; } else s.position.x = 0;
      if (!busy && !need) return; need = false; renderer.render(s, cam);
    }
    const ray = new THREE.Raycaster(), nv = new THREE.Vector2(), cv = renderer.domElement; cv.style.touchAction = 'none';
    let drag = null;
    cv.addEventListener('pointerdown', e => {
      const r = cv.getBoundingClientRect(); nv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      ray.setFromCamera(nv, cam); const h = ray.intersectObjects(wheels.map(w => w.children[0]))[0];
      if (!h || open) return; const w = h.object.userData.wheel; cv.setPointerCapture(e.pointerId);
      drag = { w, y: e.clientY, a0: w.userData.v * Math.PI / 5, moved: 0, half: nv.y }; w.userData.drag = true; w.userData.a = drag.a0;
    });
    cv.addEventListener('pointermove', e => { if (!drag) return; const dy = e.clientY - drag.y; drag.moved = Math.abs(dy); drag.w.userData.a = drag.a0 + dy * 0.025; });
    const end = () => {
      if (!drag) return; const u = drag.w.userData;
      if (drag.moved < 6) { const r = cv.getBoundingClientRect(); const wy = new THREE.Vector3(); drag.w.getWorldPosition(wy); wy.project(cam); u.v = (u.v + (drag.half > wy.y ? 9 : 1)) % 10; }
      else { u.v = ((Math.round(u.a / (Math.PI / 5)) % 10) + 10) % 10; }
      u.drag = false; const target = u.v * Math.PI / 5; let cur = drag.w.rotation.x % (2 * Math.PI); drag.w.rotation.x = cur;
      if (target - cur > Math.PI) drag.w.rotation.x += 2 * Math.PI; if (cur - target > Math.PI) drag.w.rotation.x -= 2 * Math.PI;
      drag = null; need = true; self.onChange && self.onChange(self.value());
    };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    const self = {
      el,
      value: () => wheels.map(w => w.userData.v).join(''),
      attach(ph) { ph.replaceWith(el); fit(); if (!raf) raf = requestAnimationFrame(frame); },
      open() { open = true; need = true; },
      fail() { shake = 26; },
      set(str) { wheels.forEach((w, i) => { w.userData.v = (+str[i] || 0) % 10; }); need = true; },
    };
    new ResizeObserver(fit).observe(cbox);
    return self;
  };
})();
