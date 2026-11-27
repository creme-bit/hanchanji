// 寒蝉记 · 立体图与铜锁。依赖 three.min.js / textures.js / models.js / scene.js（按需加载）
const V3 = {};
(function () {
  let loading = null;
  function load(src) { return new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  V3.ready = () => loading || (loading = (async () => { for (const f of ['three.min.js', 'gltf.min.js', 'look.js', 'textures.js', 'models.js', 'scene.js', 'nodes.js', 'pano.js']) await load('3d/' + f + (/^(models|scene|textures|look|nodes|pano)/.test(f) ? '?v=26' : '')); })());
  V3.ok = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } };

  /* ------------------------------------------------------------ 立体图 */
  const F2 = 12;
  // 可搜的地方：box = [x0,z0,x1,z1]，at = 标签位置
  const HOT = {
    1: [
      { loc: '前厅', sub: '众人在此', box: [30, 38, 82, 90], at: [57, 6, 70] },
      { loc: '后院', box: [0, 0, 150, 30], at: [86, 3, 16] },
      { loc: '客厅', box: [82, 38, 106, 64], at: [94, 5, 50] },
      { loc: '西厢', sub: '方氏旧居', box: [0, 38, 30, 90], at: [15, 4, 58] },
      { loc: '后廊', box: [0, 30, 150, 38], at: [45, 4, 34] },
      { loc: '楼梯', box: [106, 38, 124, 64], at: [115, 7, 48] },
      { loc: '下人房', box: [106, 64, 124, 90], at: [115, 4, 80] },
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
      { loc: '沈景行房', box: [0, 30, 52, 52], at: [25, F2 + 5, 40] },
      { loc: '二老爷旧房', sub: '沈仲衡今晚留宿', box: [52, 30, 106, 52], at: [79, F2 + 5, 40] },
    ],
  };
  const PLAIN = {
    1: [['柴房', [13, 5, 8]], ['管家房', [36, 5, 10]], ['井', [64, 3, 11]], ['后门', [0, 7, 21.5]], ['大门', [57, 6, 90]], ['院门', [57, 9, 115]], ['洗手间', [144, 4, 34]]],
    2: [['杂物间', [137, F2 + 5, 40]], ['楼梯', [113, F2 + 1, 52]], ['落地窗', [92.5, F2 + 8, 90]]],
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

  /* 首页总图：不加载家具模型，只换上真实的地板、木纹和地毯，跟室内对得上 */
  function liteMats(fn) {
    if (!RT._ok) { fn(); return; }
    imats();
    const save = { floor: M.floor, carpet: M.carpet, hook: M.matHook }, TXS = { herring: TX.herring, plank: TX.plank, terrazzo: TX.terrazzo, tile: TX.tile, flowerTile: TX.flowerTile, square: TX.square, brick: TX.brick };
    const FT = { herring: ['herringbone_parquet', 6, 0x9a7a60], plank: ['plank_flooring_02', 7, 0xa89078], terrazzo: ['terrazzo_tiles', 7, 0xb8b0a0], tile: ['patterned_terracotta_tiling', 5, 0xc8b8a8], flowerTile: ['interior_tiles', 4, 0xe0d8c8], square: ['grey_cartago_01', 6, 0xa8a098], brick: ['patterned_brick_floor', 7, 0xa89080] };
    Object.keys(FT).forEach(k => { TX[k] = (a) => ({ real: FT[k][0], s: FT[k][1], tint: FT[k][2], k, a }); });
    M.floor = (p, x0, z0, x1, z1, tx, scale = 12, y = 0.02, opt) => {
      if (!tx || !tx.real || !RT[tx.real] || !RT[tx.real].diff) return save.floor(p, x0, z0, x1, z1, tx && tx.real ? TXS[tx.k](tx.a) : tx, scale, y, opt);
      const w = x1 - x0, d = z1 - z0, geo = new THREE.PlaneGeometry(w, d), uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / tx.s + x0 / tx.s, uv.getY(i) * d / tx.s + z0 / tx.s);
      const o = new THREE.Mesh(geo, rmat(tx.real, tx.tint)); o.rotation.x = -Math.PI / 2; o.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); o.receiveShadow = true; p.add(o); return o; };
    M.carpet = (p, x0, z0, x1, z1, field, border, y = 0.05) => M.plane(p, x1 - x0, z1 - z0, (x0 + x1) / 2, Math.max(y, 0.07), (z0 + z1) / 2, new THREE.MeshStandardMaterial({ map: carpetTex(x1 - x0, z1 - z0, field, border, ['tianjin', 'persian', 'deco'][Math.abs(Math.round(x0 * 3 + z0 * 7 + y * 11)) % 3]), roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
    const WOODS2 = c => { if (typeof c !== 'string' || c[0] !== '#') return false; const h = {}; new THREE.Color(c).getHSL(h); return h.h > 0.015 && h.h < 0.13 && h.s > 0.18 && h.l < 0.42; };
    M.matHook = (color, opt) => (WOODS2(color) && !opt.transparent && !opt.emissive ? IM.wood(color) : null);
    try { fn(); } finally { M.floor = save.floor; M.carpet = save.carpet; M.matHook = save.hook; Object.assign(TX, TXS); }
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
      liteMats(() => { if (f === 1) SCENE.buildGround(s); else SCENE.buildUpper(s); oldShop(s); }); lights(s, f);
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
    if (!RT._ok) realTex().then(() => { Object.keys(scenes).forEach(k => delete scenes[k]); lblEls = []; setFloor(floor); }).catch(() => {});
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
  const K = 0.72;            // 平面收紧：房间按比例缩到七成多，家具尺寸不变
  const KP = a => [a[0] * K, a[1], a[2] * K];
  /* ---------- 室内：材质 ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  function cvs(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
  function ctex(c, srgb = true, rep) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (rep) t.repeat.set(...rep); return t; }
  let IM = null;
  const RT = {};
  function loadImg(u) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; }); }
  const RNAMES = ['velour_velvet', 'herringbone_parquet', 'plank_flooring', 'plank_flooring_02', 'terrazzo_tiles', 'patterned_terracotta_tiling', 'interior_tiles', 'grey_cartago_01', 'patterned_brick_floor', 'dark_wood', 'wooden_panels', 'plastered_wall_04', 'white_stucco', 'lacquered_cherry_wood', 'decrepit_wallpaper', 'painted_plaster_wall', 'yellow_plaster', 'worn_plaster_wall', 'patterned_plaster_wall', 'clay_plaster', 'grey_roof_tiles', 'patterned_cobblestone', 'whitewashed_brick', 'leafy_grass', 'forest_ground_04', 'old_stone_wall', 'red_brick_03'];
  async function realTex() {
    if (RT._ok) return;
    await Promise.all(RNAMES.map(async n => { RT[n] = {}; await Promise.all(['diff', 'nor', 'rough'].map(async k => { try { RT[n][k] = await loadImg(`3d/tex/${n}_${k}.webp`); } catch (e) { } })); }));
    RT._ok = 1;
  }
  const RTX = {};
  function rtx(n, k) { const key = n + k; if (RTX[key] !== undefined) return RTX[key]; const img = RT[n] && RT[n][k]; if (!img) return RTX[key] = null;
    const t = new THREE.Texture(img); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (k === 'diff') t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; return RTX[key] = t; }
  const RMAT = {};
  function rmat(n, tint, opt = {}) { const key = n + tint + JSON.stringify(opt); return RMAT[key] || (RMAT[key] = new THREE.MeshStandardMaterial(Object.assign({ map: rtx(n, 'diff'), normalMap: rtx(n, 'nor'), roughnessMap: rtx(n, 'rough'), roughness: 1, color: tint }, opt))); }
  /* 地毯：按实际长宽出图，不拉伸；几种花样轮换 */
  const CARPS = {};
  function carpetTex(w, d, field, border, style) {
    const key = [w, d, field, border, style].join(); if (CARPS[key]) return CARPS[key];
    const k = Math.min(20, 760 / Math.max(w, d)), cw = Math.round(w * k), ch = Math.round(d * k), u = k;   // u = 每尺像素
    const c = cvs(cw, ch, (g) => {
      const B = Math.max(1.0, Math.min(w, d) * 0.09) * u;
      g.fillStyle = border; g.fillRect(0, 0, cw, ch); g.fillStyle = '#c9a25e'; g.fillRect(B * 0.25, B * 0.25, cw - B * 0.5, ch - B * 0.5); g.fillStyle = border; g.fillRect(B * 0.35, B * 0.35, cw - B * 0.7, ch - B * 0.7);
      g.fillStyle = field; g.fillRect(B, B, cw - 2 * B, ch - 2 * B);
      g.strokeStyle = '#c9a25e'; g.lineWidth = Math.max(2, u * 0.08); g.strokeRect(B, B, cw - 2 * B, ch - 2 * B);
      const gold = 'rgba(216,183,122,.55)', cream = 'rgba(236,222,190,.5)';
      if (style === 'persian') {
        // 边带：一圈小菱形；地子：菱格加小花
        g.fillStyle = gold; for (let x = B; x < cw - B; x += u * 0.9) { [B * 0.62, ch - B * 0.62].forEach(y => { g.beginPath(); g.moveTo(x, y - u * 0.25); g.lineTo(x + u * 0.25, y); g.lineTo(x, y + u * 0.25); g.lineTo(x - u * 0.25, y); g.fill(); }); }
        for (let y = B; y < ch - B; y += u * 0.9) { [B * 0.62, cw - B * 0.62].forEach(x => { g.beginPath(); g.moveTo(x, y - u * 0.25); g.lineTo(x + u * 0.25, y); g.lineTo(x, y + u * 0.25); g.lineTo(x - u * 0.25, y); g.fill(); }); }
        g.save(); g.beginPath(); g.rect(B, B, cw - 2 * B, ch - 2 * B); g.clip(); g.strokeStyle = 'rgba(30,20,30,.35)'; g.lineWidth = u * 0.06; const st = u * 2.2;
        for (let x = -ch; x < cw + ch; x += st) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + ch, ch); g.stroke(); g.beginPath(); g.moveTo(x, 0); g.lineTo(x - ch, ch); g.stroke(); }
        g.fillStyle = cream; for (let y = B + st / 2; y < ch; y += st) for (let x = B + ((y - B - st / 2) / st % 2 ? 0 : st / 2); x < cw; x += st) { for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2; g.beginPath(); g.ellipse(x + Math.cos(a) * u * 0.18, y + Math.sin(a) * u * 0.18, u * 0.16, u * 0.08, a, 0, 7); g.fill(); } }
        g.restore();
        g.fillStyle = '#7a3a2a'; g.beginPath(); g.ellipse(cw / 2, ch / 2, Math.min(cw, ch) * 0.22, Math.min(cw, ch) * 0.16, cw > ch ? 0 : Math.PI / 2, 0, 7); g.fill(); g.strokeStyle = '#d8b77a'; g.lineWidth = u * 0.1; g.stroke();
      } else if (style === 'deco') {
        // 装饰艺术：同心折线框 + 四角扇形
        g.strokeStyle = gold; g.lineWidth = u * 0.08; for (let i = 1; i < 4; i++) { const m = B + i * u * 0.7; g.strokeRect(m, m, cw - 2 * m, ch - 2 * m); }
        [[B, B, 0], [cw - B, B, Math.PI / 2], [cw - B, ch - B, Math.PI], [B, ch - B, -Math.PI / 2]].forEach(([x, y, r]) => { g.save(); g.translate(x, y); g.rotate(r); for (let i = 4; i > 0; i--) { g.fillStyle = i % 2 ? 'rgba(216,183,122,.5)' : border; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, u * i * 0.7, 0, Math.PI / 2); g.fill(); } g.restore(); });
        g.fillStyle = 'rgba(216,183,122,.35)'; const cx = cw / 2, cy = ch / 2; for (let i = 0; i < 12; i++) { g.save(); g.translate(cx, cy); g.rotate(i * Math.PI / 6); g.fillRect(-u * 0.08, 0, u * 0.16, Math.min(cw, ch) * 0.25); g.restore(); }
        g.fillStyle = border; g.beginPath(); g.arc(cx, cy, u * 1.0, 0, 7); g.fill();
      } else {
        // 天津毯：角云 + 回纹边 + 中心团花 + 散点小花
        [[B, B, 0], [cw - B, B, Math.PI / 2], [cw - B, ch - B, Math.PI], [B, ch - B, -Math.PI / 2]].forEach(([x, y, r]) => { g.save(); g.translate(x, y); g.rotate(r); const R = Math.min(cw, ch) * 0.16;
          g.fillStyle = border; g.beginPath(); g.moveTo(0, 0); g.lineTo(R, 0); g.quadraticCurveTo(R * 0.75, R * 0.35, R * 0.45, R * 0.45); g.quadraticCurveTo(R * 0.35, R * 0.75, 0, R); g.closePath(); g.fill(); g.strokeStyle = '#c9a25e'; g.lineWidth = u * 0.06; g.stroke(); g.restore(); });
        g.strokeStyle = gold; g.lineWidth = Math.max(1, u * 0.05); for (let x = B * 0.5; x < cw - B * 0.5; x += u * 0.6) { g.strokeRect(x, B * 0.45, u * 0.35, u * 0.22); g.strokeRect(x, ch - B * 0.45 - u * 0.22, u * 0.35, u * 0.22); }
        const r0 = Math.min(cw, ch) * 0.2; g.fillStyle = '#9b4a35'; g.beginPath(); g.arc(cw / 2, ch / 2, r0, 0, 7); g.fill(); g.strokeStyle = '#d8b77a'; g.lineWidth = u * 0.1; g.stroke();
        g.fillStyle = 'rgba(216,183,122,.6)'; for (let q = 0; q < 12; q++) { const a = q * Math.PI / 6; g.beginPath(); g.ellipse(cw / 2 + Math.cos(a) * r0 * 0.65, ch / 2 + Math.sin(a) * r0 * 0.65, r0 * 0.18, r0 * 0.08, a, 0, 7); g.fill(); }
        g.fillStyle = '#d8b77a'; g.beginPath(); g.arc(cw / 2, ch / 2, r0 * 0.25, 0, 7); g.fill();
        g.fillStyle = 'rgba(216,183,122,.4)'; const n = Math.round(w * d / 6); for (let i = 0; i < n; i++) { const x = B + u + Math.random() * (cw - 2 * B - 2 * u), y = B + u + Math.random() * (ch - 2 * B - 2 * u); if (Math.hypot(x - cw / 2, y - ch / 2) < r0 * 1.2) continue; for (let q = 0; q < 5; q++) { const a = q * 1.2566; g.beginPath(); g.ellipse(x + Math.cos(a) * u * 0.16, y + Math.sin(a) * u * 0.16, u * 0.14, u * 0.08, a, 0, 7); g.fill(); } }
      }
      // 绒面杂色与踩旧的地方
      for (let i = 0; i < cw * ch / 60; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,240,220'},${Math.random() * 0.06})`; g.fillRect(Math.random() * cw, Math.random() * ch, 2, 2); }
      const wear = g.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.max(cw, ch) * 0.5); wear.addColorStop(0, 'rgba(255,230,200,.06)'); wear.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = wear; g.fillRect(0, 0, cw, ch);
    });
    return CARPS[key] = ctex(c);
  }
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
    IM.wood = (color, rough = 0.58) => { const key = color + rough; if (woodCache[key]) return woodCache[key]; const h = {}; new THREE.Color(color).getHSL(h);
      const n = h.h < 0.045 && h.s > 0.3 ? 'lacquered_cherry_wood' : (h.l > 0.3 ? 'wooden_panels' : 'dark_wood'); const T = rtx(n, 'diff') ? n : 'dark_wood';
      const m = rtx(T, 'diff') ? new THREE.MeshStandardMaterial({ map: rtx(T, 'diff'), normalMap: rtx(T, 'nor'), color: new THREE.Color(color).multiplyScalar(T === 'dark_wood' ? 3.4 : 2.1), roughness: rough, metalness: 0.05 }) : new THREE.MeshStandardMaterial({ map: IM.grain, bumpMap: IM.grainB, bumpScale: 0.6, color, roughness: rough });
      m.userData.wood = 1; return woodCache[key] = m; };
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
    const PX = 100, WW = 6 * PX, WH = Math.round(IH * PX), Y = v => WH - v * PX;
    function panel(g, x, y0, y1, w, dark, light) {
      g.fillStyle = dark; g.fillRect(x, Y(y1), w, (y1 - y0) * PX);
      g.strokeStyle = light; g.lineWidth = 3; g.strokeRect(x + 2, Y(y1) + 2, w - 4, (y1 - y0) * PX - 4);
      g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 3; g.strokeRect(x + 9, Y(y1) + 9, w - 18, (y1 - y0) * PX - 18);
      g.strokeStyle = 'rgba(255,220,170,.18)'; g.lineWidth = 2; g.strokeRect(x + 13, Y(y1) + 13, w - 26, (y1 - y0) * PX - 26);
    }
    function wallC(style) {
      return cvs(WW, WH, (g) => {
        const pat = (img, units, fallback) => { if (!img) return fallback; const p = g.createPattern(img, 'repeat'); const k = units * PX / img.width; if (p.setTransform) p.setTransform(new DOMMatrix().scale(k)); return p; };
        const W1 = RT.dark_wood && RT.dark_wood.diff, PL = RT.plastered_wall_04 && RT.plastered_wall_04.diff;
        const gr = pat(W1, 2.2, g.createPattern(grain, 'repeat'));
        if (style === 'ext') {           // 外墙：刷白的砖墙，下面一圈青灰勒脚
          const B = RT.whitewashed_brick && RT.whitewashed_brick.diff; g.fillStyle = '#c8c4b8'; g.fillRect(0, 0, WW, WH); if (B) { g.fillStyle = pat(B, 5, '#c8c4b8'); g.fillRect(0, 0, WW, WH); }
          g.fillStyle = 'rgba(70,74,80,.85)'; g.fillRect(0, Y(1.4), WW, 1.4 * PX); for (let i = 0; i < 30; i++) { const x = Math.random() * WW; const gr2 = g.createLinearGradient(0, Y(3), 0, WH); gr2.addColorStop(0, 'rgba(60,60,50,0)'); gr2.addColorStop(1, 'rgba(60,60,50,.18)'); g.fillStyle = gr2; g.fillRect(x, Y(3), 30 + Math.random() * 60, 3 * PX); }
          return;
        }
        const PAPER = { paper: null, rose: ['#4a1c22', 'rgba(200,150,110,.16)', 'damask'], floral: ['#c8b0a0', 'rgba(150,70,80,.30)', 'floral'], blue: ['#2a3a4a', 'rgba(190,200,210,.13)', 'lattice'], stripe: ['#d8ccb0', 'rgba(70,90,110,.28)', 'stripe'] };
        const TEXW = { decrepit: 'decrepit_wallpaper', plaster: 'painted_plaster_wall', worn: 'worn_plaster_wall', yellow: 'yellow_plaster' };
        if (PAPER[style] || TEXW[style]) {
          if (TEXW[style]) { const T = RT[TEXW[style]] && RT[TEXW[style]].diff; g.fillStyle = '#b8ae98'; g.fillRect(0, 0, WW, WH); if (T) { g.fillStyle = pat(T, style === 'decrepit' ? 5 : 4, '#b8ae98'); g.fillRect(0, 0, WW, WH); }
            if (style === 'yellow') { g.globalCompositeOperation = 'multiply'; g.fillStyle = '#e8d8a8'; g.fillRect(0, 0, WW, WH); g.globalCompositeOperation = 'source-over'; }
            if (style === 'plaster') { g.globalCompositeOperation = 'multiply'; g.fillStyle = '#b8c4b0'; g.fillRect(0, 0, WW, WH); g.globalCompositeOperation = 'source-over'; }
            for (let i = 0; i < (style === 'decrepit' || style === 'worn' ? 26 : 8); i++) { const x = Math.random() * WW, y = Math.random() * WH; const gr2 = g.createRadialGradient(x, y, 0, x, y, 50 + Math.random() * 140); gr2.addColorStop(0, 'rgba(90,70,40,.16)'); gr2.addColorStop(1, 'rgba(90,70,40,0)'); g.fillStyle = gr2; g.fillRect(x - 200, y - 200, 400, 400); } }
          else { const [bg, fg, kind] = PAPER[style]; g.fillStyle = bg; g.fillRect(0, 0, WW, WH);
            if (PL) { g.globalAlpha = 0.35; g.fillStyle = pat(PL, 4, bg); g.globalCompositeOperation = 'overlay'; g.fillRect(0, 0, WW, WH); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
            g.fillStyle = fg; g.strokeStyle = fg;
            if (kind === 'damask') for (let y = 0; y < WH; y += 90) for (let x = (y / 90) % 2 ? 45 : 0; x < WW + 45; x += 90) { g.beginPath(); g.moveTo(x, y - 34); g.bezierCurveTo(x + 26, y - 18, x + 20, y + 14, x, y + 34); g.bezierCurveTo(x - 20, y + 14, x - 26, y - 18, x, y - 34); g.fill(); g.beginPath(); g.arc(x, y - 40, 5, 0, 7); g.fill(); g.lineWidth = 2; g.beginPath(); g.arc(x, y, 20, 0, 7); g.stroke(); }
            if (kind === 'floral') for (let y = 0; y < WH; y += 70) for (let x = (y / 70) % 2 ? 35 : 0; x < WW + 35; x += 70) { for (let k = 0; k < 5; k++) { const a = k * 1.2566; g.beginPath(); g.ellipse(x + Math.cos(a) * 7, y + Math.sin(a) * 7, 6, 3.5, a, 0, 7); g.fill(); } g.fillStyle = 'rgba(90,110,60,.35)'; g.beginPath(); g.ellipse(x + 14, y + 12, 8, 3, 0.7, 0, 7); g.fill(); g.fillStyle = fg; }
            if (kind === 'lattice') { g.lineWidth = 2; for (let x = -WH; x < WW + WH; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + WH * 0.6, WH); g.stroke(); g.beginPath(); g.moveTo(x, 0); g.lineTo(x - WH * 0.6, WH); g.stroke(); } }
            if (kind === 'stripe') for (let x = 0; x < WW; x += 56) { g.fillRect(x, 0, 18, WH); g.fillRect(x + 28, 0, 3, WH); } }
        }
        else if (style === 'lime' || style === 'kitchen') {
          const ST = RT.white_stucco && RT.white_stucco.diff, PL = RT.plastered_wall_04 && RT.plastered_wall_04.diff;
          g.fillStyle = '#d8d0bc'; g.fillRect(0, 0, WW, WH); if (ST || PL) { g.globalAlpha = 0.85; g.fillStyle = pat(PL || ST, 3, '#d8d0bc'); g.fillRect(0, 0, WW, WH); g.globalAlpha = 1; g.globalCompositeOperation = 'multiply'; g.fillStyle = '#e4dac4'; g.fillRect(0, 0, WW, WH); g.globalCompositeOperation = 'source-over'; }
          for (let i = 0; i < 40; i++) { const x = Math.random() * WW, y = Math.random() * WH; const gr2 = g.createRadialGradient(x, y, 0, x, y, 60 + Math.random() * 120); gr2.addColorStop(0, 'rgba(120,100,70,.10)'); gr2.addColorStop(1, 'rgba(120,100,70,0)'); g.fillStyle = gr2; g.fillRect(x - 200, y - 200, 400, 400); }
          if (style === 'kitchen') { g.fillStyle = '#6e6a62'; g.fillRect(0, Y(3.8), WW, 3.8 * PX); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '30,30,30' : '200,200,190'},.12)`; g.fillRect(Math.random() * WW, Y(3.8) + Math.random() * 3.8 * PX, 2, 2); } g.fillStyle = '#4a4740'; g.fillRect(0, Y(3.85), WW, 10);
            const sm = g.createLinearGradient(0, 0, 0, WH * 0.5); sm.addColorStop(0, 'rgba(40,32,24,.45)'); sm.addColorStop(1, 'rgba(40,32,24,0)'); g.fillStyle = sm; g.fillRect(0, 0, WW, WH * 0.5); }
          else { g.fillStyle = '#3a2a1a'; g.fillRect(0, Y(0.6), WW, 0.6 * PX); g.fillStyle = 'rgba(80,60,40,.25)'; g.fillRect(0, Y(1.6), WW, 1.0 * PX); }
          return;
        }
        if (PAPER[style] || TEXW[style]) {} else if (style === 'wood') { g.fillStyle = '#4a2a18'; g.fillRect(0, 0, WW, WH); g.globalAlpha = W1 ? 0.95 : 0.5; g.fillStyle = gr; g.fillRect(0, 0, WW, WH); g.globalAlpha = 1; if (W1) { g.fillStyle = 'rgba(40,18,6,.25)'; g.fillRect(0, 0, WW, WH); } }
        else {
          g.fillStyle = '#2f3b33'; g.fillRect(0, 0, WW, WH);
          if (PL) { g.fillStyle = pat(PL, 4, '#2f3b33'); g.fillRect(0, 0, WW, WH); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#4a5a48'; g.fillRect(0, 0, WW, WH); g.globalCompositeOperation = 'source-over'; }
          for (let y = 0; y < WH; y += 64) for (let x = (y / 64) % 2 ? 32 : 0; x < WW + 32; x += 64) {
            g.fillStyle = 'rgba(190,170,110,.10)'; g.beginPath(); g.moveTo(x, y - 22); g.quadraticCurveTo(x + 14, y, x, y + 22); g.quadraticCurveTo(x - 14, y, x, y - 22); g.fill();
            g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); g.strokeStyle = 'rgba(190,170,110,.08)'; g.beginPath(); g.arc(x, y, 14, 0, 7); g.stroke();
          }
        }
        // 上半：木框板
        if (style === 'wood') for (let i = 0; i < 2; i++) panel(g, i * WW / 2 + 14, 4.2, 9.0, WW / 2 - 28, 'rgba(110,62,32,.55)', 'rgba(255,210,150,.15)');
        // 护墙板
        g.fillStyle = '#3a2112'; g.fillRect(0, Y(3.7), WW, 3.7 * PX);
        g.globalAlpha = W1 ? 0.9 : 0.45; g.fillStyle = gr; g.fillRect(0, Y(3.7), WW, 3.7 * PX); g.globalAlpha = 1;
        for (let i = 0; i < 2; i++) panel(g, i * WW / 2 + 12, 0.75, 3.3, WW / 2 - 24, 'rgba(90,50,26,.6)', 'rgba(255,210,150,.16)');
        // 腰线、踢脚、顶线
        const band = (y0, y1, c, hi) => { g.fillStyle = c; g.fillRect(0, Y(y1), WW, (y1 - y0) * PX); g.fillStyle = hi; g.fillRect(0, Y(y1), WW, 3); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, Y(y0) - 3, WW, 3); };
        band(3.6, 3.95, '#5a341c', 'rgba(255,210,150,.35)'); band(0, 0.55, '#24140b', 'rgba(255,210,150,.2)');
        band(9.5, 10.5, '#3d2414', 'rgba(255,210,150,.3)'); band(9.25, 9.5, style === 'wood' ? '#6a4a30' : '#b8a888', 'rgba(255,255,255,.3)');
        for (let x = 6; x < WW; x += 18) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, Y(10.2), 8, 0.4 * PX); }
      });
    }
    ['wood', 'paper', 'lime', 'kitchen', 'ext', 'rose', 'floral', 'blue', 'stripe', 'decrepit', 'plaster', 'worn', 'yellow'].forEach(k => { const c = wallC(k); IM['wall_' + k] = new THREE.MeshStandardMaterial({ map: ctex(c), bumpMap: ctex(c, false), bumpScale: k === 'lime' ? 2.0 : 1.2, roughness: k === 'wood' ? 0.55 : 0.85 }); IM['wall_' + k].userData.noUV = 1; });
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
    IM.base = IM.wood('#24140a', 0.5); IM.crown = LOOK.pbr('plaster', 0xd6cdbd);
    IM.ceil = rtx('white_stucco', 'diff') ? (() => { const m = new THREE.MeshStandardMaterial({ map: rtx('white_stucco', 'diff').clone(), normalMap: rtx('white_stucco', 'nor') && rtx('white_stucco', 'nor').clone(), color: 0xa89c88, roughness: 0.95 }); m.map.repeat.set(20, 8); m.map.needsUpdate = true; if (m.normalMap) { m.normalMap.repeat.set(20, 8); m.normalMap.needsUpdate = true; } return m; })() : new THREE.MeshStandardMaterial({ map: ctex(ceilC, true, [12, 6]), roughness: 0.95 });
    return IM;
  }
  const WOODS = new Set(['#6b4128', '#3f2516', '#9a6a42', '#4a2e1c', '#8a5a36', '#b88a5a', '#5a3a24', '#4a261a', '#5a2e1e', '#6b4a2e', '#3a1f12', '#5a3420', '#7a5a3a']);
  /* ---------- 写实模型（Poly Haven, CC0） ---------- */
  const GL = {}; let gltfLoader = null; V3.onModel = null;
  function gload(id) {
    if (!gltfLoader) gltfLoader = new THREE.GLTFLoader();
    return GL[id] || (GL[id] = new Promise((ok, no) => gltfLoader.load('3d/models/' + id + '.glb', g => {
      const noSh = /handelier|Lantern/.test(id); g.scene.traverse(o => { if (o.isMesh) { o.castShadow = !noSh; o.receiveShadow = true; const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach(m => { m.envMapIntensity = 0.5; m.needsUpdate = true; }); } });
      ok(g.scene); }, undefined, no)));
  }
  function model(p, id, x, y, z, ry = 0, sc = 3, opt = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(sc); g.userData.glb = 1; p.add(g);
    gload(id).then(src => { const c = src.clone(true); if (opt.center) { const b = new THREE.Box3().setFromObject(c); c.position.x -= (b.min.x + b.max.x) / 2; c.position.z -= (b.min.z + b.max.z) / 2; } g.add(c); g.updateMatrixWorld(true); V3.onModel && V3.onModel(); }).catch(() => {});
    return g;
  }
  /* ---------- 室内：构件 ---------- */
  function uvWall(geo, horiz, cx, y0, cz) {
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, ((horiz ? p.getX(i) + cx : p.getZ(i) + cz)) / 6, (p.getY(i) + y0) / IH);
    uv.needsUpdate = true;
  }
  function wallBox(p, len, h, t, cx, y0, cz, horiz, m) {
    const geo = new THREE.BoxGeometry(horiz ? len : t, h, horiz ? t : len); geo.translate(0, h / 2, 0);
    uvWall(geo, horiz, cx, y0, cz);
    let mm = m;
    if (IM.wall_lime && (m === IM.wall_paper || m === IM.wall_wood)) {
      const up = (p.position ? p.position.y : 0) + y0 >= F2 - 0.5, d = t / 2 + 0.6;
      const sideA = horiz ? roomStyle(cx, cz + d, up) : roomStyle(cx + d, cz, up), sideB = horiz ? roomStyle(cx, cz - d, up) : roomStyle(cx - d, cz, up);
      const mA = sideA ? IM['wall_' + sideA] : m, mB = sideB ? IM['wall_' + sideB] : m;
      if (mA !== m || mB !== m) mm = horiz ? [mA, mA, mA, mA, mA, mB] : [mA, mB, mA, mA, mA, mA];
    }
    const o = new THREE.Mesh(geo, mm); o.position.set(cx, y0, cz); o.castShadow = o.receiveShadow = true; o.userData.wall = 1; p.add(o);
    // 踢脚线、顶角线：两面各一条，外墙那一面不加
    if (IM.base && len > 0.6) {
      const up = (p.position ? p.position.y : 0) + y0 >= F2 - 0.5, d = t / 2 + 0.6;
      const sides = [[1, horiz ? roomStyle(cx, cz + d, up) : roomStyle(cx + d, cz, up)], [-1, horiz ? roomStyle(cx, cz - d, up) : roomStyle(cx - d, cz, up)]];
      sides.forEach(([sg, st]) => { if (!st || st === 'ext') return;
        const add2 = (hh, dd, yy, mt) => { const b = new THREE.Mesh(new THREE.BoxGeometry(horiz ? len : dd, hh, horiz ? dd : len), mt); b.position.set(horiz ? 0 : sg * (t / 2 + dd / 2), yy, horiz ? sg * (t / 2 + dd / 2) : 0); b.receiveShadow = true; o.add(b); };
        if (y0 < 0.01) add2(0.6, 0.09, 0.3, IM.base);
        if (y0 + h >= IH - 0.01) { add2(0.42, 0.16, IH - y0 - 0.21, IM.crown); add2(0.12, 0.26, IH - y0 - 0.5, IM.crown); } });
    }
    return o;
  }
  const ROOMDEF = {
    1: [[30, 38, 82, 90, 'paper', 'coffer'], [82, 38, 106, 64, 'rose', 'plaster'], [82, 64, 106, 90, 'floral', 'plaster'], [0, 38, 30, 90, 'decrepit', 'stained'], [0, 30, 150, 38, 'yellow', 'beams'],
      [106, 38, 124, 64, 'wood', 'plaster'], [106, 64, 124, 90, 'lime', 'beams'], [124, 38, 150, 90, 'kitchen', 'sooty'], [-36, 8, -10, 32, 'wood', 'planks']],
    2: [[0, 52, 150, 60, 'wood', 'plaster'], [0, 30, 52, 52, 'stripe', 'plaster'], [52, 30, 106, 52, 'plaster', 'stained'], [106, 30, 124, 52, 'wood', 'plaster'], [124, 30, 150, 52, 'lime', 'beams'],
      [0, 60, 50, 90, 'blue', 'coffer'], [50, 60, 100, 90, 'wood', 'coffer'], [100, 60, 150, 90, 'worn', 'stained']],
  };
  function roomAt(x, z, up) { return ROOMDEF[up ? 2 : 1].find(r => x > r[0] && x < r[2] && z > r[1] && z < r[3]); }
  function roomStyle(x, z, up) {             // 每面墙朝哪间屋：各屋墙纸不同，外墙刷白砖
    const r = roomAt(x, z, up); if (r) return r[4];
    if (!up && x > -36 && x < -10 && z > 8 && z < 32) return 'wood';
    if (!up && x > 0 && x < 46 && z > 2 && z < 19) return 'lime';
    return 'ext';
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
      const BR = horiz ? [30, 82, 106, 124] : [38, 52, 60, 64];
      const seg = (s, e, y0, y1) => { if (e - s < 0.01 || y1 - y0 < 0.01) return; const cut = BR.find(b => b > s + 0.3 && b < e - 0.3); if (cut !== undefined) { seg(s, cut, y0, y1); seg(cut, e, y0, y1); return; } const [cx, cz] = at((s + e) / 2); wallBox(p, e - s, y1 - y0, t, cx, y0, cz, horiz, m); };
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
        // 门窗套：两面各一圈木框，门窗不再是墙上直接挖的洞
        { const cas = IM.wood('#2e1a0e'), top2 = o.win ? 7.8 : 7.4, bot = o.win ? o.sill : 0, L = o.e - o.s;
          [-1, 1].forEach(sd => { const off = sd * (t / 2 + 0.05);
            [o.s - 0.18, o.e + 0.18].forEach(q => { const [jx, jz] = at(q); M.box(p, horiz ? 0.36 : 0.1, top2 - bot + 0.18, horiz ? 0.1 : 0.36, horiz ? jx : jx + off, bot, horiz ? jz + off : jz, cas); });
            const [hx, hz] = at((o.s + o.e) / 2); M.box(p, horiz ? L + 0.72 : 0.12, 0.34, horiz ? 0.12 : L + 0.72, horiz ? hx : hx + off, top2, horiz ? hz + off : hz, cas); }); }
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
    keep.dining = M.dining;
    M.dining = (p, x, z, w, d, h = 2.8, ry = 0) => {         // 长餐桌：白台布垂边
      const g = M.group(p, x, 0, z, ry), m = W('#3a2012');
      add(g, new THREE.BoxGeometry(w, 0.2, d), m, 0, h - 0.1, 0);
      [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1, 0], [1, 0]].forEach(([a, b]) => leg(g, a * (w / 2 - 0.5), b * (d / 2 - 0.6), h - 0.2, m));
      const cl = new THREE.MeshStandardMaterial({ color: 0xece6d8, roughness: 0.92, side: THREE.DoubleSide });
      add(g, new THREE.BoxGeometry(w + 0.1, 0.03, d + 0.1), cl, 0, h + 0.015, 0);
      const drop = 0.9;
      [[w + 0.1, d / 2 + 0.05, 0], [w + 0.1, -d / 2 - 0.05, 0]].forEach(([ww, zz]) => add(g, new THREE.BoxGeometry(ww, drop, 0.03), cl, 0, h - drop / 2, zz));
      [w / 2 + 0.05, -w / 2 - 0.05].forEach(xx => add(g, new THREE.BoxGeometry(0.03, drop, d + 0.1), cl, xx, h - drop / 2, 0));
      return g;
    };
    keep.bed = M.bed;
    M.bed = (p, x, z, w, d, ry = 0) => {                   // 木床：雕花床屏、褥子、缎面被、枕头
      const g = M.group(p, x, 0, z, ry), m = W('#3a1a0c'), top = 1.9;
      add(g, new THREE.BoxGeometry(w, 0.5, d), m, 0, 0.95, 0);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => add(g, new THREE.BoxGeometry(0.4, 0.8, 0.4), m, a * (w / 2 - 0.2), 0.4, b * (d / 2 - 0.2)));
      add(g, new THREE.BoxGeometry(w, 2.8, 0.25), m, 0, 2.3, -d / 2 + 0.12); add(g, new THREE.BoxGeometry(w - 1.2, 1.6, 0.06), W('#5a2a14'), 0, 2.5, -d / 2 + 0.27);
      add(g, new THREE.BoxGeometry(w - 0.3, 0.45, d - 0.3), new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 0.9 }), 0, 1.42, 0);
      const pal = ['#7a2a3a', '#2a3a5a', '#3a4a3a', '#8a2a2a', '#4a3a5a', '#5a4a3a'], qc = pal[Math.abs(Math.round(x * 7 + z * 3)) % pal.length];
      const qt = ctex(cvs(128, 128, (q, cw, ch) => { q.fillStyle = qc; q.fillRect(0, 0, cw, ch); q.fillStyle = 'rgba(230,190,110,.42)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { q.beginPath(); q.arc(i * 32 + 16, j * 32 + 16, 9, 0, 7); q.fill(); } }), true, [w / 2.5, d / 3.5]);
      const qm = new THREE.MeshStandardMaterial({ map: qt, roughness: 0.55 });
      const geo = new THREE.BoxGeometry(w - 0.5, 0.42, d * 0.6, 8, 1, 8); const ps = geo.attributes.position; for (let i = 0; i < ps.count; i++) { const yy = ps.getY(i); if (yy > 0) ps.setY(i, yy + Math.sin(ps.getX(i) * 1.7) * 0.06 + Math.cos(ps.getZ(i) * 1.3) * 0.05); else { ps.setX(i, ps.getX(i) * 1.04); ps.setZ(i, ps.getZ(i) * 1.02); } } geo.computeVertexNormals();
      add(g, geo, qm, 0, top, d * 0.17);
      add(g, new THREE.BoxGeometry(Math.min(w - 0.9, 3.6), 0.5, 1.1), qm, 0, top + 0.45, d / 2 - 1.0);
      (w > 7 ? [-w * 0.22, w * 0.22] : [0]).forEach(xx => { const pl = add(g, new THREE.SphereGeometry(0.5, 14, 8), new THREE.MeshStandardMaterial({ color: 0xf4eedc, roughness: 0.8 }), xx, top + 0.1, -d / 2 + 1.0); pl.scale.set(1.5, 0.45, 0.8); });
      return g;
    };
    keep.covered = M.covered;
    M.covered = (p, x, z, w, d, h, ry = 0) => {             // 蒙尘布：底下是真家具，布按家具轮廓搭上去，垂到半腰
      const g = M.group(p, x, 0, z, ry), area = w * d, fur = new THREE.Group(); g.add(fur);
      if (h > 2.8 && h <= 3.2 && area > 60) { const t = tbl(fur, 0, 0, 4.2, 4.2, 2.8, 0); [[-1.1, 0.3], [1.1, -0.4]].forEach(([a, r]) => { const c = model(fur, 'chinese_armchair', a, 2.8, 0, r, 2.6); c.rotation.z = Math.PI; c.position.y = 2.8 + 2.9 * 1.0; }); }
      else if (h <= 2.8 && area > 60) M.bed(fur, 0, 0, Math.min(w, 8) - 0.6, Math.min(d, 10) - 0.6, 0);
      else if (h >= 6) model(fur, 'chinese_cabinet', 0, 0, 0, 0, Math.min(3, h / 2.87));
      else if (h >= 4) { model(fur, 'chinese_commode', 0, 0, 0, 0, 2.2); }
      else if (w <= 4.5 && d <= 4.5) model(fur, area < 6 ? 'chinese_stool' : 'chinese_armchair', 0, 0, 0, 0, 3);
      else { tbl(fur, 0, 0, Math.min(w, 7) - 1.2, Math.min(d, 4) - 0.8, 2.7, 0); }
      let tries = 0;
      const fit = () => {
        g.updateMatrixWorld(true); const inv = g.matrixWorld.clone().invert(), bb = new THREE.Box3(), tmp = new THREE.Box3(); let n = 0;
        fur.traverse(o => { if (!o.isMesh) return; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); tmp.copy(o.geometry.boundingBox).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)); bb.union(tmp); n++; });
        const waiting = fur.children.some(c => c.isGroup && c.children.length === 0 && c.scale.x !== 1);
        if ((!n || waiting) && tries++ < 60) { setTimeout(fit, 250); return; }
        if (!n) return;
        const cw0 = bb.max.x - bb.min.x, cd0 = bb.max.z - bb.min.z, top = bb.max.y, cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
        const hang = Math.min(top * 0.6, 2.4), seg = 40, geo = new THREE.PlaneGeometry(cw0 + hang * 2, cd0 + hang * 2, seg, seg); geo.rotateX(-Math.PI / 2);
        const ps = geo.attributes.position, ph = Math.random() * 6, W2 = cw0 / 2, D2 = cd0 / 2;
        for (let i = 0; i < ps.count; i++) { const u = ps.getX(i), v = ps.getZ(i);
          const dx = Math.max(Math.abs(u) - W2, 0), dz = Math.max(Math.abs(v) - D2, 0), out = Math.hypot(dx, dz);
          let nx = Math.sign(u) * Math.min(Math.abs(u), W2 + 0.1), nz = Math.sign(v) * Math.min(Math.abs(v), D2 + 0.1);
          const fold = Math.sin((u + v) * 2.3 + ph) * 0.12 * Math.min(out, 1.2) + Math.sin(u * 5.1 - v * 3.7) * 0.05 * Math.min(out, 1);
          if (dx > 0) nx += Math.sign(u) * (0.04 + Math.abs(fold)); if (dz > 0) nz += Math.sign(v) * (0.04 + Math.abs(fold));
          ps.setXYZ(i, cx + nx, top + 0.08 - out + (out > 0 ? Math.sin(u * 3 + v * 2 + ph) * 0.12 * Math.min(out, 1) : 0), cz + nz); }
        geo.computeVertexNormals();
        const cm = new THREE.MeshStandardMaterial({ map: ctex(cvs(128, 128, (q, a, b) => { q.fillStyle = '#d8d0bc'; q.fillRect(0, 0, a, b); for (let i = 0; i < 900; i++) { q.fillStyle = `rgba(${Math.random() < 0.5 ? '120,110,90' : '240,235,220'},.18)`; q.fillRect(Math.random() * a, Math.random() * b, 2, 2); } q.strokeStyle = 'rgba(150,140,120,.25)'; for (let i = 0; i < a; i += 8) { q.beginPath(); q.moveTo(i, 0); q.lineTo(i, b); q.stroke(); } }), true, [(cw0 + hang * 2) / 4, (cd0 + hang * 2) / 4]), roughness: 0.95, side: THREE.DoubleSide, color: 0xc8c0ae });
        const c = new THREE.Mesh(geo, cm); c.castShadow = c.receiveShadow = true; g.add(c); V3.onModel && V3.onModel();
      };
      setTimeout(fit, 50);
      return g;
    };
    COVER = M.covered;
    keep.tree = M.tree;
    M.tree = (p, x, z, r = 6, h = 9) => {                   // 树：分杈的干 + 一簇簇叶团，颜色深浅不一
      const g = M.group(p, x, 0, z, Math.random() * 6), bark = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 1 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, h * 0.6, 8), bark); trunk.position.y = h * 0.3; trunk.castShadow = true; g.add(trunk);
      for (let i = 0; i < 4; i++) { const a = i * 1.7, br = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.28, h * 0.4, 6), bark); br.position.set(Math.cos(a) * 0.9, h * 0.62, Math.sin(a) * 0.9); br.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); g.add(br); }
      if (!IM.leafTex) IM.leafTex = ctex(cvs(256, 256, (q, w, h) => { for (let i = 0; i < 260; i++) { const x = 20 + Math.random() * 216, y = 20 + Math.random() * 216; if (Math.hypot(x - 128, y - 128) > 112) continue; q.save(); q.translate(x, y); q.rotate(Math.random() * 6.28);
        q.fillStyle = `hsl(${95 + Math.random() * 30},${35 + Math.random() * 20}%,${16 + Math.random() * 16}%)`; q.beginPath(); q.ellipse(0, 0, 9 + Math.random() * 6, 4 + Math.random() * 2, 0, 0, 7); q.fill(); q.restore(); } }));
      const lm = IM.leafM || (IM.leafM = new THREE.MeshStandardMaterial({ map: IM.leafTex, alphaTest: 0.45, transparent: false, side: THREE.DoubleSide, roughness: 0.9 }));
      for (let i = 0; i < 16; i++) { const a = Math.random() * 6.28, rr = Math.random() * r * 0.65, cl = new THREE.Group(), sz = r * (0.7 + Math.random() * 0.5);
        cl.position.set(Math.cos(a) * rr, h * 0.68 + Math.random() * h * 0.38, Math.sin(a) * rr); cl.rotation.y = Math.random() * 3;
        for (let k = 0; k < 3; k++) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz * 0.85), lm); pl.rotation.y = k * Math.PI / 3; pl.rotation.x = (Math.random() - 0.5) * 0.5; pl.castShadow = true; cl.add(pl); }
        g.add(cl); }
      return g;
    };
    keep.desk = M.desk;
    M.desk = (p, x, z, w, d, h = 2.6, ry = 0) => {          // 民国写字台：两侧抽屉柜，中间空膛
      const g = M.group(p, x, 0, z, ry), m = W('#5a3420'), m2 = W('#4a2814'), pw = Math.min(3.2, w * 0.3);
      add(g, new THREE.BoxGeometry(w + 0.3, 0.22, d + 0.3), m2, 0, h - 0.11, 0);
      add(g, new THREE.BoxGeometry(w, 0.12, d), m, 0, h - 0.28, 0);
      [-1, 1].forEach(sd => { const cx = sd * (w / 2 - pw / 2);
        add(g, new THREE.BoxGeometry(pw, h - 0.5, d - 0.2), m, cx, (h - 0.5) / 2 + 0.16, 0);
        add(g, new THREE.BoxGeometry(pw + 0.12, 0.16, d - 0.05), m2, cx, 0.08, 0);
        for (let i = 0; i < 3; i++) { const dh = (h - 0.7) / 3, cy = 0.3 + dh * i + dh / 2;
          [-1, 1].forEach(fz => { add(g, new THREE.BoxGeometry(pw - 0.3, dh - 0.14, 0.06), m2, cx, cy, fz * (d / 2 - 0.08));
            add(g, new THREE.BoxGeometry(0.5, 0.06, 0.1), IM.brass, cx, cy, fz * (d / 2 - 0.02)); }); } });
      [-1, 1].forEach(fz => { add(g, new THREE.BoxGeometry(w - 2 * pw - 0.2, 0.36, 0.06), m2, 0, h - 0.52, fz * (d / 2 - 0.06));
        add(g, new THREE.BoxGeometry(0.6, 0.06, 0.1), IM.brass, 0, h - 0.52, fz * (d / 2)); });
      add(g, new THREE.BoxGeometry(w - 2 * pw, h - 0.7, 0.1), m2, 0, (h - 0.7) / 2 + 0.1, 0.4);
      return g;
    };
    keep.floor = M.floor; keep.bookcase = M.bookcase; keep.slumped = M.slumped;
    keep.carpet = M.carpet;
    M.carpet = (p, x0, z0, x1, z1, field, border, y = 0.05) => {
      const w = x1 - x0, d = z1 - z0, geo = new THREE.PlaneGeometry(w, d);
      const nm = rtx('velour_velvet', 'nor'); let nm2 = null; if (nm) { nm2 = nm.clone(); nm2.repeat.set(w / 1.5, d / 1.5); nm2.needsUpdate = true; }
      const sty = ['tianjin', 'persian', 'deco'][Math.abs(Math.round(x0 * 3 + z0 * 7 + y * 11)) % 3];
      const m = new THREE.MeshStandardMaterial({ map: carpetTex(w, d, field, border, sty), normalMap: nm2, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 1, color: 0xb09888, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
      const o = new THREE.Mesh(geo, m); o.rotation.x = -Math.PI / 2; o.position.set((x0 + x1) / 2, Math.max(y, 0.07), (z0 + z1) / 2); o.receiveShadow = true; p.add(o);
      return o;
    };
    M.floor = (p, x0, z0, x1, z1, tx, scale = 12, y = 0.02, opt) => {
      if (!tx || !tx.real || !RT[tx.real] || !RT[tx.real].diff) return keep.floor(p, x0, z0, x1, z1, tx && tx.real ? TXK[tx.k](tx.a) : tx, scale * 0.45, y, Object.assign({ roughness: 0.45, color: 0xa08c78 }, opt || {}));
      const w = x1 - x0, d = z1 - z0, geo = new THREE.PlaneGeometry(w, d), uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / tx.s + x0 / tx.s, uv.getY(i) * d / tx.s + z0 / tx.s);
      const o = new THREE.Mesh(geo, rmat(tx.real, tx.tint || 0xffffff)); o.rotation.x = -Math.PI / 2; o.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); o.receiveShadow = true; p.add(o); return o;
    };
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
      if (!gltfLoader) gltfLoader = new THREE.GLTFLoader();
      gltfLoader.load('3d/models/male_base.glb', gl => {
        const m = gl.scene, bones = {}; let mesh = null;
        m.traverse(o => { if (o.isBone) bones[o.name] = o; if (o.isSkinnedMesh) mesh = o; });
        const D = (k, v) => { const b = bones[k]; if (!b) return; m.updateMatrixWorld(true);
          if (Array.isArray(v)) { b.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...v.map(t => t * Math.PI / 180)))); return; }
          const wq = new THREE.Quaternion(); b.getWorldQuaternion(wq); const cy = new THREE.Vector3(0, 1, 0).applyQuaternion(wq);
          const nq = new THREE.Quaternion().setFromUnitVectors(cy, new THREE.Vector3(...v.d).normalize()).multiply(wq); const pq = new THREE.Quaternion(); b.parent.getWorldQuaternion(pq); b.quaternion.copy(pq.invert().multiply(nq)); };
        const POSE = [['thighL', [-95, 0, 0]], ['thighR', [-95, 0, 0]], ['shinL', [95, 0, 0]], ['shinR', [95, 0, 0]], ['spine001', [30, 0, 0]], ['spine002', [32, 0, 0]], ['spine003', [22, 0, 0]], ['spine004', [15, 0, 0]], ['spine005', [10, 0, 55]],
          ['upper_armL', { d: [0.75, -0.3, -0.4] }], ['forearmL', { d: [0.1, -0.02, 1] }], ['upper_armR', { d: [0.8, -0.3, 0.45] }], ['forearmR', { d: [1, -0.02, -0.05] }], ['handR', { d: [1, -0.1, 0] }]];
        POSE.forEach(([k, v]) => D(k, v)); m.updateMatrixWorld(true);
        // 材质：皮肤 + 长衫外壳 + 头发
        const skin = new THREE.MeshStandardMaterial({ color: 0x9c8676, roughness: 0.65 }); skin.userData.look = 'skin';
        mesh.material = skin; mesh.castShadow = mesh.receiveShadow = true;
        const geo = mesh.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
        const names = mesh.skeleton.bones.map(b => b.name), bare = new Set(names.map((n, i) => /^(spine005|hand|f_|thumb)/.test(n) ? i : -1).filter(i => i >= 0));
        const g2 = geo.clone(), p2 = g2.attributes.position, keep = [];
        for (let i = 0; i < pos.count; i++) { p2.setXYZ(i, pos.getX(i) + nor.getX(i) * 0.014, pos.getY(i) + nor.getY(i) * 0.014, pos.getZ(i) + nor.getZ(i) * 0.014); }
        const idx = geo.index.array, ni = [];
        const isBare = v => { let w = 0; for (let k = 0; k < 4; k++) if (bare.has(si.getComponent(v, k))) w += sw.getComponent(v, k); return w > 0.5; };
        for (let t = 0; t < idx.length; t += 3) if (!isBare(idx[t]) && !isBare(idx[t + 1]) && !isBare(idx[t + 2])) ni.push(idx[t], idx[t + 1], idx[t + 2]);
        g2.setIndex(ni);
        const nm = rtx('velour_velvet', 'nor'); let n2 = null; if (nm) { n2 = nm.clone(); n2.repeat.set(4, 4); n2.needsUpdate = true; }
        const gown = new THREE.SkinnedMesh(g2, new THREE.MeshStandardMaterial({ color: 0x1c2330, roughness: 0.8, normalMap: n2, normalScale: new THREE.Vector2(0.5, 0.5) }));
        gown.bind(mesh.skeleton, mesh.bindMatrix); gown.castShadow = gown.receiveShadow = true; mesh.parent.add(gown);
        const head = bones['spine005'];
        if (head) {
          const hair = new THREE.Mesh(new THREE.SphereGeometry(0.108, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), new THREE.MeshStandardMaterial({ color: 0x15110e, roughness: 0.55 }));
          hair.position.set(0, 0.115, -0.012); hair.rotation.x = -0.25; hair.scale.set(1, 0.95, 1.12); head.add(hair);
          // 拆信刀：插在左胸靠肩，刀柄朝上
          const knife = new THREE.Group(); const hdl = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.11, 10), IM.brass); hdl.position.y = 0.055; knife.add(hdl);
          const gd = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.012), IM.brass); knife.add(gd);
          const sp3 = bones['spine003']; if (sp3) { knife.position.set(-0.07, 0.06, -0.12); knife.rotation.set(-0.9, 0, 0.2); sp3.add(knife);
            const bl = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.06, 0.13, 0), new THREE.Vector3(0.068, 0.15, 0), new THREE.Vector3(0.072, 0.18, 0.01)]), 4, 0.003, 4), IM.brass); knife.add(bl); }
          const blood = new THREE.Mesh(new THREE.CircleGeometry(0.045, 16), new THREE.MeshStandardMaterial({ color: 0x1a0604, roughness: 0.35 })); if (sp3) { blood.position.set(-0.07, 0.06, -0.128); blood.rotation.y = Math.PI; blood.scale.set(1, 1.6, 1); sp3.add(blood); }
        }
        const S = 2.62; m.scale.setScalar(S); m.rotation.y = Math.PI / 2; m.updateMatrixWorld(true);
        m.updateMatrixWorld(true);
        // 让臀部落在椅子上：把人整体放到桌后
        const pel = new THREE.Vector3(); bones['spine'].getWorldPosition(pel); m.position.set(-pel.x, 1.95 - pel.y, -pel.z - 0.15);
        g.add(m); m.traverse(o => { if (o.isMesh) o.frustumCulled = false; }); V3.onModel && V3.onModel();
      }, undefined, e => console.error('BODYERR', e && e.message));
      return g;
    };
    keep.screen = M.screen; keep.plant = M.plant; keep.roundTable = M.roundTable;
    const fl = p => (p.isScene ? 0 : (p.position ? p.position.y : 0));
    M.armchair = (p, x, z, ry = 0) => { const parlor = fl(p) < 6 && x > 82 && x < 106 && z < 64; return model(p, parlor ? 'GreenChair_01' : 'chinese_armchair', x, 0, z, ry, parlor ? 3.1 : 2.9); };
    M.screen = (p, x, z, n = 4, seg = 1.6, ry = 0) => model(p, 'chinese_screen_panels', x, 0, z, ry, 3.2);
    M.plant = (p, x, z, s = 1, y = 0) => model(p, 'potted_plant_02', x, y, z, x * 0.37, 2.2 * s, { center: true });
    M.roundTable = (p, x, z) => { const g = model(p, 'round_wooden_table_01', x, 0, z, 0, 2.6); model(p, 'tea_set_01', x, 2.62, z, 0.6, 2.6, { center: true }); return g; };
    M.chair = (p, x, z, ry = 0) => model(p, 'chinese_armchair', x, 0, z, ry, 2.6);
    M.wardrobe = (p, x, z, w, d, h = 6.5, ry = 0) => { const g = M.group(p, x, 0, z, ry), sc = Math.min(3, h / 2.87), cw = 1.26 * sc, n = Math.max(1, Math.round(w / cw));
      for (let i = 0; i < n; i++) model(g, 'chinese_cabinet', (i - (n - 1) / 2) * cw, 0, 0, 0, sc); return g; };
    M.sofa = (p, x, z, w = 6, ry = 0) => model(p, 'Sofa_01', x, 0, z, ry, w > 10 ? 4.3 : 3.4);
    const tbl = M.table;
    M.table = (p, x, z, w, d, h = 2.6, ry = 0, top) => {
      if (w <= 4.6 && d <= 4.2) return model(p, fl(p) > 6 ? 'ClassicNightstand_01' : 'chinese_tea_table', x, 0, z, ry, fl(p) > 6 ? 3.6 : 3.4);
      return tbl(p, x, z, w, d, h, ry, top);
    };
    return () => { Object.assign(M, keep); };
  }
  let TXK = null, COVER = null, CARPET = null;
  function interior(fn, f) {
    imats();
    TXK = { herring: TX.herring, plank: TX.plank, terrazzo: TX.terrazzo, tile: TX.tile, flowerTile: TX.flowerTile, square: TX.square, brick: TX.brick };
    TX.herring = () => ({ real: 'herringbone_parquet', s: 6, tint: 0x9a7a60, k: 'herring' });
    TX.plank = (a) => ({ real: a && a[0] < 160 ? 'plank_flooring' : 'plank_flooring_02', s: 7, tint: a && a[0] < 160 ? 0xc0a890 : 0xa89078, k: 'plank', a });
    TX.terrazzo = () => ({ real: 'terrazzo_tiles', s: 7, tint: 0xb8b0a0, k: 'terrazzo' });
    TX.tile = () => ({ real: 'patterned_terracotta_tiling', s: 5, tint: 0xc8b8a8, k: 'tile' });
    TX.flowerTile = () => ({ real: 'interior_tiles', s: 4, tint: 0xe0d8c8, k: 'flowerTile' });
    TX.square = () => ({ real: 'grey_cartago_01', s: 6, tint: 0xa8a098, k: 'square' });
    TX.brick = () => ({ real: 'patterned_brick_floor', s: 7, tint: 0xa89080, k: 'brick' });
    const ocp = M.carpet, ow = M.wall, od = M.door, ot = M.table, oc = M.chair, oa = M.armchair, os = M.sofa, owr = M.wardrobe, of = M.floor, ob = M.bookcase, osl = M.slumped, otr = M.tree, obd = M.bed, ocv = M.covered, odk = M.desk, odn = M.dining, osc = M.screen, opl = M.plant, ort = M.roundTable;
    M.wall = iwall(y => (y > 6 ? 'wood' : 'paper'));
    M.door = (p, x, z, w, angle) => { const g = M.group(p, x, 0, z, angle); const b = M.box(g, w, 7.3, 0.25, w / 2, 0, 0, IM.door); M.cyl(g, 0.12, 0.12, 0.5, w - 0.5, 3.6, 0.2, IM.brass); return g; };
    const brown = c => { if (typeof c !== 'string' || c[0] !== '#') return false; const h = {}; new THREE.Color(c).getHSL(h); return h.h > 0.015 && h.h < 0.13 && h.s > 0.18 && h.l < 0.42; };
    M.matHook = (color, opt) => ((WOODS.has(color) || brown(color)) && !opt.transparent && !opt.emissive ? IM.wood(color) : null);
    richFurniture();
    const tagW = fn0 => fn0 && fn0.__tag ? fn0 : Object.assign((p, ...args) => { const n = p.children.length, r = fn0(p, ...args); for (let i = n; i < p.children.length; i++) p.children[i].userData.struct = 1; return r; }, { __tag: 1 });
    ['wall', 'floor', 'carpet', 'door'].forEach(k => { if (M[k]) M[k] = tagW(M[k]); });
    try { fn(); CARPET = M.carpet; } finally { Object.assign(TX, TXK); M.wall = ow; M.door = od; M.table = ot; M.chair = oc; M.armchair = oa; M.sofa = os; M.wardrobe = owr; M.floor = of; M.carpet = ocp; M.bookcase = ob; M.slumped = osl; M.desk = odk; M.tree = otr; M.bed = obd; M.covered = ocv; M.dining = odn; M.screen = osc; M.plant = opl; M.roundTable = ort; M.matHook = null; }
  }
  /* 室外：夜空、远处屋顶、院中铺地、路灯、树 */
  function outdoor(s, f) {
    const lathe = (pts, m, seg = 16) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), m);
    // 夜空：上深蓝下灰蓝，星点，一轮半月
    const sky = cvs(1024, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#05070e'); gr.addColorStop(0.55, '#0e1424'); gr.addColorStop(0.8, '#1e2a3e'); gr.addColorStop(1, '#2a3446'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 700; i++) { const y = Math.random() * h * 0.7; g.fillStyle = `rgba(220,228,255,${Math.random() * 0.8 * (1 - y / h)})`; g.fillRect(Math.random() * w, y, Math.random() < 0.1 ? 2 : 1, Math.random() < 0.1 ? 2 : 1); }
      for (let i = 0; i < 6; i++) { const x = Math.random() * w, y = h * (0.3 + Math.random() * 0.3), gr2 = g.createRadialGradient(x, y, 0, x, y, 160); gr2.addColorStop(0, 'rgba(120,130,150,.10)'); gr2.addColorStop(1, 'rgba(120,130,150,0)'); g.fillStyle = gr2; g.fillRect(0, 0, w, h); } });
    const sk = new THREE.Mesh(new THREE.SphereGeometry(420, 32, 16), new THREE.MeshBasicMaterial({ map: ctex(sky), side: THREE.BackSide, fog: false, depthWrite: false })); sk.position.set(75 * K, 0, 60 * K); sk.userData.noscale = 1; s.add(sk);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshBasicMaterial({ map: ctex(cvs(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 10, 64, 64, 64); gr.addColorStop(0, '#f4f0dc'); gr.addColorStop(0.7, '#e8e2c8'); gr.addColorStop(0.72, 'rgba(232,226,200,.25)'); gr.addColorStop(1, 'rgba(232,226,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.fillStyle = 'rgba(5,7,14,.92)'; g.beginPath(); g.arc(84, 54, 50, 0, 7); g.fill(); })), transparent: true, fog: false, depthWrite: false }));
    moon.position.set(40, 190, 360); moon.lookAt(75 * K, 0, 60 * K); moon.userData.noscale = 1; s.add(moon);
    // 远处一圈弄堂屋顶剪影，零星几扇亮窗
    const roofM = new THREE.MeshStandardMaterial({ color: 0x1a1e26, roughness: 0.9 }), wallM = new THREE.MeshStandardMaterial({ color: 0x232830, roughness: 0.95 }), winM = new THREE.MeshBasicMaterial({ color: 0xf0b860 });
    const house = (x, z, w, d, h, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; s.add(g); const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallM); b.position.y = h / 2; g.add(b);
      const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 1, 0); sh.lineTo(0, d * 0.45); sh.lineTo(d / 2 + 1, 0); const r = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: w + 2, bevelEnabled: false }), roofM); r.rotation.y = Math.PI / 2; r.position.set(-w / 2 - 1, h, 0); g.add(r);
      for (let i = 0; i < 3; i++) if (Math.random() < 0.35) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3), winM); wn.position.set(-w / 2 + (i + 0.7) * w / 3.4, h * 0.6, d / 2 + 0.05); g.add(wn); } };
    for (let i = 0; i < 14; i++) { house(-60 + i * 22 + Math.random() * 6, 150 + Math.random() * 15, 18, 14, 14 + Math.random() * 10, Math.PI); house(-60 + i * 22 + Math.random() * 6, -45 - Math.random() * 15, 18, 14, 14 + Math.random() * 10, 0); }
    for (let i = 0; i < 6; i++) { house(-75 - Math.random() * 10, -20 + i * 30, 22, 14, 14 + Math.random() * 8, Math.PI / 2); house(215 + Math.random() * 10, -20 + i * 30, 22, 14, 14 + Math.random() * 8, -Math.PI / 2); }
    if (f !== 1) return;
    // 院中铺地：前院青石板，后院泥土落叶
    const ground = (x0, z0, x1, z1, n, rep, tint, y = 0.05) => { if (!rtx(n, 'diff')) return; const mt = new THREE.MeshStandardMaterial({ map: rtx(n, 'diff').clone(), normalMap: rtx(n, 'nor') && rtx(n, 'nor').clone(), roughness: 1, color: tint, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
      [mt.map, mt.normalMap].forEach(t => { if (t) { t.repeat.set((x1 - x0) / rep, (z1 - z0) / rep); t.needsUpdate = true; } });
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mt); pl.rotation.x = -Math.PI / 2; pl.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); pl.receiveShadow = true; s.add(pl); };
    ground(2, 92, 148, 114, 'patterned_cobblestone', 8, 0xc8c6be);
    ground(2, 1, 148, 29, 'forest_ground_04', 10, 0xb0a898);
    ground(-40, 33, -6, 40, 'patterned_cobblestone', 8, 0x8a8880);
    // 路灯：院门外和后门外各一盏
    [[57, 122, 0], [-6, 34, Math.PI / 2]].forEach(([x, z, r]) => { model(s, 'street_lamp_01', x, 0, z, r, 3); const l = new THREE.PointLight(0xffc880, 40, 40, 1.6); l.position.set(x, 11.2, z); s.add(l); });
    // 院子里再添几盆花、一张石桌
    [[22, 96], [92, 96], [118, 96]].forEach(([x, z], i) => model(s, i % 2 ? 'potted_plant_02' : 'potted_plant_04', x, 0, z, i, 3.4));
  }
  /* 天花：各屋不同——藻井、石膏线灯盘、木梁、木板、水渍 */
  const HOLE = [109, 48, 117, 56.4];
  function cutHole(r) {   // 矩形减去楼梯井洞口，返回剩下的几块（保留后面的附加字段）
    const [x0, z0, x1, z1] = r, [a, b, c, d] = HOLE, rest = r.slice(4);
    if (x1 <= a || x0 >= c || z1 <= b || z0 >= d) return [r];
    const out = []; const push = (p, q, u, v) => { if (u - p > 0.05 && v - q > 0.05) out.push([p, q, u, v, ...rest]); };
    push(x0, z0, a, z1); push(c, z0, x1, z1); push(Math.max(x0, a), z0, Math.min(x1, c), b); push(Math.max(x0, a), d, Math.min(x1, c), z1); return out;
  }
  function ceilings(s, f) {
    const y0 = (f === 2 ? F2 : 0) + IH - 0.02, LIGHTS = f === 1 ? ROOMS1 : ROOMS2, CT = {};
    const tex = (kind, w, d) => { const k = Math.min(14, 640 / Math.max(w, d)), cw = Math.round(w * k), ch = Math.round(d * k), u = k;
      return ctex(cvs(cw, ch, (g) => { const P = RT.white_stucco && RT.white_stucco.diff, C = RT.clay_plaster && RT.clay_plaster.diff, Wd = RT.wooden_panels && RT.wooden_panels.diff;
        const fill = (img, sc, base, alpha = 1) => { g.fillStyle = base; g.fillRect(0, 0, cw, ch); if (img) { const p = g.createPattern(img, 'repeat'); if (p.setTransform) p.setTransform(new DOMMatrix().scale(sc * u / img.width)); g.globalAlpha = alpha; g.fillStyle = p; g.fillRect(0, 0, cw, ch); g.globalAlpha = 1; } };
        if (kind === 'planks') { fill(Wd, 6, '#5a3a22'); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#8a6a4a'; g.fillRect(0, 0, cw, ch); g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(20,10,4,.6)'; for (let x = 0; x < cw; x += u * 0.8) g.fillRect(x, 0, 2, ch); return; }
        fill(kind === 'sooty' || kind === 'beams' ? C || P : P, 4, '#d6cfc2', 0.9); g.globalCompositeOperation = 'multiply'; g.fillStyle = kind === 'sooty' ? '#8a8478' : '#ddd6ca'; g.fillRect(0, 0, cw, ch); g.globalCompositeOperation = 'source-over';
        if (kind === 'sooty') { for (let i = 0; i < 18; i++) { const x = Math.random() * cw, y = Math.random() * ch, gr = g.createRadialGradient(x, y, 0, x, y, u * (2 + Math.random() * 6)); gr.addColorStop(0, 'rgba(30,26,22,.35)'); gr.addColorStop(1, 'rgba(30,26,22,0)'); g.fillStyle = gr; g.fillRect(0, 0, cw, ch); } }
        if (kind === 'stained') { for (let i = 0; i < 7; i++) { const x = Math.random() * cw, y = Math.random() * ch, r = u * (1.5 + Math.random() * 4); for (let k2 = 0; k2 < 3; k2++) { g.strokeStyle = `rgba(120,90,50,${0.25 - k2 * 0.06})`; g.lineWidth = u * 0.1; g.beginPath(); g.ellipse(x, y, r * (1 + k2 * 0.25), r * 0.7 * (1 + k2 * 0.25), Math.random(), 0, 7); g.stroke(); } const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(150,120,70,.18)'); gr.addColorStop(1, 'rgba(150,120,70,0)'); g.fillStyle = gr; g.fillRect(0, 0, cw, ch); }
          g.strokeStyle = 'rgba(60,50,40,.35)'; g.lineWidth = 1.5; for (let i = 0; i < 4; i++) { let x = Math.random() * cw, y = Math.random() * ch; g.beginPath(); g.moveTo(x, y); for (let k2 = 0; k2 < 12; k2++) { x += (Math.random() - 0.5) * u; y += Math.random() * u * 0.6; g.lineTo(x, y); } g.stroke(); } }
        if (kind === 'plaster' || kind === 'coffer' || kind === 'stained') { const m1 = u * 0.8, m2 = u * 1.3; g.strokeStyle = 'rgba(90,80,64,.45)'; g.lineWidth = u * 0.12; g.strokeRect(m1, m1, cw - 2 * m1, ch - 2 * m1); g.strokeStyle = 'rgba(255,250,235,.5)'; g.lineWidth = u * 0.06; g.strokeRect(m2, m2, cw - 2 * m2, ch - 2 * m2); }
        if (kind === 'coffer') { const n = Math.max(2, Math.round(w / 8)), m = Math.max(2, Math.round(d / 8)), mg = u * 2; const cwi = (cw - 2 * mg) / n, chi = (ch - 2 * mg) / m;
          for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const x = mg + i * cwi, y = mg + j * chi; g.fillStyle = 'rgba(60,44,30,.6)'; g.fillRect(x, y, cwi, chi); g.fillStyle = 'rgba(206,196,178,.9)'; g.fillRect(x + u * 0.35, y + u * 0.35, cwi - u * 0.7, chi - u * 0.7); g.strokeStyle = 'rgba(150,110,60,.6)'; g.lineWidth = u * 0.08; g.strokeRect(x + u * 0.6, y + u * 0.6, cwi - u * 1.2, chi - u * 1.2);
            g.strokeStyle = 'rgba(150,110,60,.35)'; g.lineWidth = u * 0.06; g.beginPath(); g.arc(x + cwi / 2, y + chi / 2, Math.min(cwi, chi) * 0.16, 0, 7); g.stroke(); } }
      })); };
    (ROOMDEF[f] || []).flatMap(r => f === 1 ? cutHole(r) : [r]).forEach(([x0, z0, x1, z1, wall, kind]) => {
      const w = x1 - x0, d = z1 - z0, pl = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.2, d - 0.2), new THREE.MeshStandardMaterial({ map: tex(kind, w, d), roughness: 0.97, color: 0xa49a8c, bumpMap: LOOK.tex('plaster').bump, bumpScale: 0.02 }));
      pl.rotation.x = Math.PI / 2; pl.position.set((x0 + x1) / 2, y0, (z0 + z1) / 2); pl.receiveShadow = true; s.add(pl);
      // 灯盘：石膏圆花
      if (kind === 'plaster' || kind === 'coffer') LIGHTS.filter(([lx, lz]) => lx > x0 && lx < x1 && lz > z0 && lz < z1).forEach(([lx, lz]) => {
        const r = Math.min(2.6, Math.min(w, d) * 0.18), ro = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [r * 0.3, -0.05], [r * 0.55, -0.12], [r * 0.7, -0.08], [r * 0.85, -0.16], [r, -0.04], [r * 1.02, 0]].map(([a, b]) => new THREE.Vector2(a, b)), 32), new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.8, side: THREE.DoubleSide }));
        ro.position.set(lx, y0, lz); s.add(ro); });
      // 木梁
      if (kind === 'beams' || kind === 'sooty') { const along = w > d, n = Math.floor((along ? w : d) / 4.5), bm = IM.wood(kind === 'sooty' ? '#2a1c12' : '#4a3020');
        for (let i = 1; i < n; i++) { const t = (along ? x0 : z0) + i * (along ? w : d) / n; const b = new THREE.Mesh(new THREE.BoxGeometry(along ? 0.6 : w - 1.8, 0.8, along ? d - 1.8 : 0.6), bm); b.position.set(along ? t : (x0 + x1) / 2, y0 - 0.4, along ? (z0 + z1) / 2 : t); b.castShadow = true; b.userData.struct = 1; s.add(b); }
        const rb = new THREE.Mesh(new THREE.BoxGeometry(along ? w - 1.8 : 0.9, 1.0, along ? 0.9 : d - 1.8), bm); rb.position.set((x0 + x1) / 2, y0 - 1.1, (z0 + z1) / 2); rb.userData.struct = 1; s.add(rb); }
    });
  }
  /* 木器贴图按实际尺寸铺，避免一块木纹拉满整张桌面 */
  function woodUV(s) {
    const ws = new THREE.Vector3();
    s.traverse(o => { if (!o.isMesh || Array.isArray(o.material) || !o.material.userData.wood || o.geometry.userData.uvd) return;
      const gt = o.geometry.type; if (gt !== 'BoxGeometry' && gt !== 'CylinderGeometry') return;
      o.getWorldScale(ws); const g = o.geometry.clone(), uv = g.attributes.uv, pr = g.parameters, T = 2.2;
      if (gt === 'BoxGeometry') { const dims = [[pr.depth * ws.z, pr.height * ws.y], [pr.depth * ws.z, pr.height * ws.y], [pr.width * ws.x, pr.depth * ws.z], [pr.width * ws.x, pr.depth * ws.z], [pr.width * ws.x, pr.height * ws.y], [pr.width * ws.x, pr.height * ws.y]];
        g.groups.forEach((gr, fi) => { const [a, b] = dims[fi] || [1, 1]; for (let k = gr.start; k < gr.start + gr.count; k++) { const vi = g.index.getX(k); if (g.userData['v' + vi]) continue; g.userData['v' + vi] = 1; uv.setXY(vi, uv.getX(vi) * a / T + fi * 0.37, uv.getY(vi) * b / T); } }); }
      else { const c = Math.PI * (pr.radiusTop + pr.radiusBottom) * Math.max(ws.x, ws.z), h = pr.height * ws.y; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * c / T, uv.getY(i) * h / T); }
      Object.keys(g.userData).forEach(k => delete g.userData[k]); g.userData.uvd = 1; uv.needsUpdate = true; o.geometry = g; });
  }
  /* ---------- 其余各屋：照民国公馆、下房、厨房、药号实景加密陈设 ---------- */
  function roomsDeco(s, f) {
    const mk = (p, geo, m, x, yy, z) => { if (geo.isMesh) { z = yy; yy = x; x = m; } const o = geo.isMesh ? geo : new THREE.Mesh(geo, m); o.position.set(x, yy, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
    const G = (x, yy, z, ry = 0, p = s) => { const g = new THREE.Group(); g.position.set(x, yy, z); g.rotation.y = ry; p.add(g); return g; };
    const lathe = (pts, m, seg = 20) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), m);
    const WD = c => IM.wood(c);
    const MC = {}; const cloth = c => MC[c] || (MC[c] = new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }));
    const por = new THREE.MeshStandardMaterial({ color: 0xf0ece2, roughness: 0.25 });
    const enamel = new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.2 });
    const iron = new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.55, metalness: 0.6 });
    const pottery = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55 });
    const rnd = (a, b) => a + Math.random() * (b - a);
    const Y = f === 2 ? F2 : 0;
    // —— 通用件 ——
    const frame = (x, y, z, ry, w, h, kind = 'photo') => { const g = G(x, y, z, ry); mk(g, new THREE.BoxGeometry(w + 0.18, h + 0.18, 0.08), kind === 'photo' ? IM.brass : WD('#2a1608'), 0, 0, 0);
      const c = cvs(64, 80, (q, cw, ch) => { if (kind === 'photo') { q.fillStyle = '#bca684'; q.fillRect(0, 0, cw, ch); q.fillStyle = '#4a3a2a'; q.beginPath(); q.ellipse(32, 30, 11, 14, 0, 0, 7); q.fill(); q.fillRect(14, 45, 36, 35); }
        else if (kind === 'land') { q.fillStyle = '#e8dcc0'; q.fillRect(0, 0, cw, ch); q.fillStyle = 'rgba(60,70,60,.5)'; for (let i = 0; i < 3; i++) { q.beginPath(); q.moveTo(0, 50 + i * 8); for (let x = 0; x <= cw; x += 8) q.lineTo(x, 30 + i * 10 + Math.sin(x * 0.15 + i) * 8); q.lineTo(cw, ch); q.lineTo(0, ch); q.fill(); } }
        else { q.fillStyle = '#c8402a'; q.fillRect(0, 0, cw, ch); q.fillStyle = '#f0d890'; q.beginPath(); q.ellipse(32, 34, 14, 18, 0, 0, 7); q.fill(); q.fillStyle = '#1a1a1a'; q.fillRect(8, 60, 48, 6); q.fillRect(14, 70, 36, 4); } });
      mk(g, new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: ctex(c), roughness: 0.7 }), 0, 0, 0.05); return g; };
    const sconce = (x, y, z, ry) => { const g = G(x, y, z, ry); mk(g, new THREE.BoxGeometry(0.45, 0.7, 0.1), IM.brass, 0, 0, 0);
      mk(g, lathe([[0.1, 0], [0.3, 0.22], [0.34, 0.5], [0.3, 0.55]], new THREE.MeshStandardMaterial({ color: 0xf6e8c8, emissive: 0xf0c070, emissiveIntensity: 1.0, roughness: 0.6, side: THREE.DoubleSide }), 14), 0, -0.1, 0.6);
      const l = new THREE.PointLight(0xffc888, 3, 8, 1.8); l.position.set(0, 0.2, 0.9); g.add(l); };
    const oilLamp = (x, y, z, lit = true) => { const g = G(x, y, z); mk(g, lathe([[0, 0], [0.3, 0], [0.32, 0.08], [0.12, 0.2], [0.3, 0.35], [0.28, 0.5], [0.1, 0.55], [0, 0.55]], new THREE.MeshStandardMaterial({ color: 0x5a7a6a, roughness: 0.2, transparent: true, opacity: 0.85 })), 0, 0, 0);
      mk(g, lathe([[0.1, 0], [0.18, 0.15], [0.2, 0.4], [0.1, 0.75], [0.09, 0.8]], new THREE.MeshStandardMaterial({ color: 0xf0f0e8, transparent: true, opacity: 0.35, roughness: 0.05, side: THREE.DoubleSide, emissive: lit ? 0xffb050 : 0, emissiveIntensity: 0.5 }), 14), 0, 0.55, 0);
      if (lit) { const l = new THREE.PointLight(0xffa850, 6, 12, 1.7); l.position.set(0, 0.9, 0); g.add(l); } return g; };
    const washstand = (x, y, z, ry) => { const g = G(x, y, z, ry);
      [0, 2.1, 4.2].forEach(a => { const l = mk(g, new THREE.CylinderGeometry(0.06, 0.05, 2.6, 6), WD('#4a2a14'), Math.cos(a) * 0.55, 1.3, Math.sin(a) * 0.55); });
      mk(g, new THREE.TorusGeometry(0.6, 0.05, 6, 20), WD('#4a2a14'), 0, 2.35, 0).rotation.x = Math.PI / 2;
      mk(g, lathe([[0, 0], [0.3, 0], [0.62, 0.3], [0.66, 0.32], [0.6, 0.32], [0.28, 0.04], [0, 0.04]], enamel), 0, 2.15, 0);
      mk(g, new THREE.BoxGeometry(0.06, 2.0, 0.06), WD('#4a2a14'), 0, 3.2, -0.62); mk(g, new THREE.BoxGeometry(1.1, 0.06, 0.06), WD('#4a2a14'), 0, 3.9, -0.62);
      const t = mk(g, new THREE.BoxGeometry(0.9, 0.9, 0.03), cloth('#f0ece0'), 0, 3.45, -0.6); mk(g, new THREE.BoxGeometry(0.9, 0.06, 0.04), cloth('#b83a2a'), 0, 3.2, -0.58); return g; };
    const thermos = (x, y, z, c = 0x9a3a2a) => { const g = G(x, y, z); mk(g, new THREE.CylinderGeometry(0.3, 0.3, 1.2, 14), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }), 0, 0.6, 0); mk(g, new THREE.CylinderGeometry(0.18, 0.28, 0.2, 14), iron, 0, 1.3, 0); mk(g, new THREE.CylinderGeometry(0.12, 0.12, 0.14, 10), WD('#c8a878'), 0, 1.45, 0); };
    const mug = (x, y, z) => { mk(s, lathe([[0, 0], [0.2, 0], [0.2, 0.36], [0.18, 0.36], [0.18, 0.03], [0, 0.03]], enamel, 14), x, y, z); };
    const pot = (x, y, z, r, h, c, lid = true) => { const g = G(x, y, z); mk(g, lathe([[0, 0], [r * 0.7, 0], [r, h * 0.45], [r * 0.85, h * 0.92], [r * 0.6, h], [r * 0.55, h]], pottery(c)), 0, 0, 0); if (lid) mk(g, new THREE.CylinderGeometry(r * 0.62, r * 0.62, 0.08, 16), WD('#6a4a2a'), 0, h, 0); return g; };
    const garment = (p, x, y, z, c, len = 3.6, ry = 0) => { const o = mk(p, lathe([[0.15, len], [0.5, len - 0.3], [0.55, len - 1.2], [0.62, 0.6], [0.66, 0], [0.15, 0]], cloth(c), 16), x, y - len, z); o.scale.set(1, 1, 0.35); o.rotation.y = ry; return o; };
    const pegRail = (x, y, z, ry, w, items) => { const g = G(x, y, z, ry); mk(g, new THREE.BoxGeometry(w, 0.3, 0.12), WD('#4a2a14'), 0, 0, 0);
      items.forEach(([dx, c, len]) => { mk(g, new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), WD('#2a1608'), dx, 0, 0.2).rotation.x = Math.PI / 2; garment(g, dx, -0.05, 0.3, c, len); }); return g; };
    const hat = (x, y, z, c = '#5a4a38', straw = false) => { const g = G(x, y, z, rnd(0, 3)); const m = straw ? cloth('#d8c088') : cloth(c);
      mk(g, new THREE.CylinderGeometry(0.62, 0.62, 0.04, 20), m, 0, 0, 0); mk(g, new THREE.CylinderGeometry(0.34, 0.4, 0.4, 18), m, 0, 0.2, 0); return g; };
    const shoes = (x, z, ry, c = '#1a1612') => { const g = G(x, Y, z, ry); [-0.2, 0.2].forEach(dx => { const o = mk(g, new THREE.SphereGeometry(0.2, 10, 6), cloth(c), dx, 0.08, 0); o.scale.set(0.8, 0.45, 2.0); }); };
    const canopy = (x, z, w, d, ry, net = '#f2ece0') => { const g = G(x, Y, z, ry), P = WD('#3a1a0c');
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mk(g, new THREE.CylinderGeometry(0.14, 0.16, 7.2, 10), P, a * (w / 2 - 0.15), 3.6, b * (d / 2 - 0.15)));
      [[w, 0.35, 0.18, 0, d / 2 - 0.15], [w, 0.35, 0.18, 0, -d / 2 + 0.15]].forEach(([a, b, c, xx, zz]) => mk(g, new THREE.BoxGeometry(a, b, c), P, xx, 7.1, zz));
      [-1, 1].forEach(e => mk(g, new THREE.BoxGeometry(0.18, 0.35, d), P, e * (w / 2 - 0.15), 7.1, 0));
      const val = ctex(cvs(256, 32, (q, cw, ch) => { q.fillStyle = '#8a2a1e'; q.fillRect(0, 0, cw, ch); q.strokeStyle = '#d8b060'; q.lineWidth = 2; for (let i = 0; i < cw; i += 32) { q.beginPath(); q.arc(i + 16, 16, 9, 0, 7); q.stroke(); } }));
      mk(g, new THREE.BoxGeometry(w, 0.9, 0.06), new THREE.MeshStandardMaterial({ map: val, roughness: 0.8 }), 0, 6.6, d / 2 - 0.1);
      const nm = new THREE.MeshStandardMaterial({ color: net, transparent: true, opacity: 0.32, roughness: 0.9, side: THREE.DoubleSide, depthWrite: false });
      [-1, 1].forEach(e => { const c = mk(g, new THREE.PlaneGeometry(d - 0.3, 5.2), nm, e * (w / 2 - 0.2), 4.3, 0); c.rotation.y = Math.PI / 2; c.castShadow = false; });
      mk(g, new THREE.PlaneGeometry(w - 0.3, 5.2), nm, 0, 4.3, -d / 2 + 0.2).castShadow = false;
      [-1, 1].forEach(e => { const c = mk(g, lathe([[0.3, 0], [0.12, 1.6], [0.5, 5.0], [0.3, 5.2]], nm, 10), e * (w / 2 - 0.5), 1.1, d / 2 - 0.25); c.castShadow = false; mk(g, new THREE.TorusGeometry(0.16, 0.04, 6, 12), IM.brass, e * (w / 2 - 0.5), 2.8, d / 2 - 0.25); });
      return g; };
    const bedding = (x, z, w, d, ry, quilt = '#8a2a2a', top = 1.9) => { const g = G(x, Y, z, ry);
      const qt = ctex(cvs(128, 128, (q, cw, ch) => { q.fillStyle = quilt; q.fillRect(0, 0, cw, ch); q.fillStyle = 'rgba(230,190,110,.45)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { q.beginPath(); q.arc(i * 32 + 16, j * 32 + 16, 9, 0, 7); q.fill(); } }));
      const qm = new THREE.MeshStandardMaterial({ map: qt, roughness: 0.6 });
      const geo = new THREE.BoxGeometry(w - 0.5, 0.42, d * 0.58, 6, 1, 6); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const yy = p.getY(i); if (yy > 0) p.setY(i, yy + Math.sin(p.getX(i) * 1.7) * 0.06 + Math.cos(p.getZ(i) * 1.3) * 0.05); if (yy < 0) { p.setX(i, p.getX(i) * 1.04); } } geo.computeVertexNormals();
      mk(g, geo, qm, 0, top, d * 0.17);
      mk(g, new THREE.BoxGeometry(w - 0.9, 0.5, 1.1), qm, 0, top + 0.45, d / 2 - 0.9);
      [-w * 0.22, w * 0.22].forEach(xx => { const pl = mk(g, new THREE.SphereGeometry(0.5, 14, 8), cloth('#f4eedc'), xx, top + 0.1, -d / 2 + 1.0); pl.scale.set(1.5, 0.45, 0.8); });
      return g; };
    const cobweb = (x, y, z, ry, sz = 2) => { const c = cvs(128, 128, (q, w, h) => { q.strokeStyle = 'rgba(235,235,230,.55)'; q.lineWidth = 1; for (let i = 0; i < 9; i++) { const a = i / 8 * Math.PI / 2; q.beginPath(); q.moveTo(0, 0); q.lineTo(Math.cos(a) * 128, Math.sin(a) * 128); q.stroke(); } for (let r = 14; r < 128; r += 14) { q.beginPath(); for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2, rr = r + Math.sin(i * 3) * 3; i ? q.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : q.moveTo(rr, 0); } q.stroke(); } });
      const o = mk(G(x, y, z, ry), new THREE.PlaneGeometry(sz, sz), new THREE.MeshBasicMaterial({ map: ctex(c), transparent: true, depthWrite: false, side: THREE.DoubleSide }), 0, 0, 0); o.rotation.z = Math.PI; o.castShadow = false; };
    const dust = (x0, z0, x1, z1, y = Y + 0.1) => { const c = cvs(128, 128, (q, w, h) => { const gr = q.createRadialGradient(64, 64, 8, 64, 64, 64); gr.addColorStop(0, 'rgba(170,160,140,.38)'); gr.addColorStop(1, 'rgba(170,160,140,0)'); q.fillStyle = gr; q.fillRect(0, 0, w, h); });
      const o = mk(s, new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ map: ctex(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 }), (x0 + x1) / 2, y, (z0 + z1) / 2); o.rotation.x = -Math.PI / 2; o.castShadow = false; };
    const basket = (x, y, z, r = 0.7, c = '#a88450') => { const g = G(x, y, z); const t = ctex(cvs(64, 64, (q, w, h) => { q.fillStyle = c; q.fillRect(0, 0, w, h); q.strokeStyle = 'rgba(60,40,20,.5)'; for (let i = 0; i < w; i += 6) { q.beginPath(); q.moveTo(i, 0); q.lineTo(i, h); q.stroke(); q.beginPath(); q.moveTo(0, i); q.lineTo(w, i); q.stroke(); } }), true, [3, 1]);
      mk(g, lathe([[0, 0], [r * 0.75, 0], [r, r * 0.8], [r * 0.95, r * 0.8], [r * 0.72, 0.04], [0, 0.04]], new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, side: THREE.DoubleSide })), 0, 0, 0); return g; };
    const string = (x, y, z, c, n = 9, sz = 0.16) => { const g = G(x, y, z); mk(g, new THREE.CylinderGeometry(0.02, 0.02, n * sz * 1.6, 4), cloth('#7a6a4a'), 0, -n * sz * 0.8, 0);
      for (let i = 0; i < n; i++) { const o = mk(g, new THREE.SphereGeometry(sz, 8, 6), cloth(c), rnd(-0.1, 0.1), -i * sz * 1.6 - 0.2, rnd(-0.1, 0.1)); o.scale.set(c === '#b8241a' ? 0.5 : 1, c === '#b8241a' ? 1.8 : 0.9, c === '#b8241a' ? 0.5 : 1); } return g; };
    const bench = (x, z, ry, w = 5, y = Y) => { const g = G(x, y, z, ry); mk(g, new THREE.BoxGeometry(w, 0.22, 1.0), WD('#5a3820'), 0, 1.5, 0); [-1, 1].forEach(e => [-0.32, 0.32].forEach(dz => mk(g, new THREE.BoxGeometry(0.16, 1.5, 0.16), WD('#5a3820'), e * (w / 2 - 0.4), 0.75, dz))); return g; };
    const broom = (x, z, ry, y = Y) => { const g = G(x, y, z, ry); const h = mk(g, new THREE.CylinderGeometry(0.06, 0.06, 4.2, 6), WD('#9a7a4a'), 0, 2.6, 0); const b = mk(g, new THREE.ConeGeometry(0.55, 1.4, 10, 1, true), cloth('#b89a5a'), 0, 0.6, 0); g.rotation.z = 0.18; };
    const box = (x, y, z, w, h, d, m, ry = 0) => { const o = mk(s, new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z); o.rotation.y = ry; return o; };
    const books = (x, y, z, n = 3, ry = 0) => { let h = y; for (let i = 0; i < n; i++) { const t = rnd(0.1, 0.2); const b = box(x, h, z, rnd(0.9, 1.2), t, rnd(0.65, 0.85), cloth(['#5a1e18', '#1f3a2c', '#3a2416', '#6a4a22'][i % 4]), ry + rnd(-0.2, 0.2)); h += t; } };

    if (f === 1) {
      // ================= 一楼东厢：顾雪芝 =================
      canopy(99.5, 83.0, 7.5, 9.2, Math.PI, '#f4e8e0');
      // 梳妆台上：粉盒、香水瓶、发梳、首饰匣；前面一只绣墩
      { const T = 2.7 + 1.2; mk(s, lathe([[0, 0], [0.32, 0], [0.32, 0.18], [0, 0.22]], new THREE.MeshStandardMaterial({ color: 0xd8b8a8, roughness: 0.3 })), 101.4, T, 68.6);
        [[103.0, 0x9ac0c8], [103.5, 0xe0b080], [103.9, 0xb0a0d0]].forEach(([x, c]) => { const g = G(x, T, 68.4); mk(g, lathe([[0, 0], [0.16, 0], [0.18, 0.3], [0.06, 0.38], [0.05, 0.5], [0, 0.5]], new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.75, roughness: 0.05 }), 12), 0, 0, 0); mk(g, new THREE.SphereGeometry(0.09, 8, 6), IM.brass, 0, 0.58, 0); });
        box(102.0, T, 69.0, 0.9, 0.06, 0.28, WD('#3a1a0c'), 0.3); box(101.0, T, 69.2, 0.8, 0.4, 0.55, new THREE.MeshStandardMaterial({ color: 0x8a1e1a, roughness: 0.3 }), -0.2);
        model(s, 'chinese_stool', 102.6, 0, 71.2, 0, 3); }
      // 衣架上挂旗袍，床尾樟木箱，墙上月份牌美人、相框
      { const g = G(91.5, 0, 87.6, 0); [-1.5, 1.5].forEach(x => mk(g, new THREE.CylinderGeometry(0.07, 0.08, 6.2, 8), WD('#3a1a0c'), x, 3.1, 0)); mk(g, new THREE.CylinderGeometry(0.06, 0.06, 3.4, 8), WD('#3a1a0c'), 0, 6.0, 0).rotation.z = Math.PI / 2;
        [[-0.9, 0.82, 0x2a4a6a], [0, 0.82, 0x8a2a3a], [0.9, 0.82, 0x3a6a5a]].forEach(([x, w, c]) => { const q = mk(g, lathe([[0.12, 4.6], [0.4, 4.45], [0.45, 3.9], [0.36, 3.1], [0.44, 1.3], [0.4, 0.5], [0.12, 0.5]], new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.1 }), 18), x, 1.4, 0); q.scale.set(1, 1, 0.4); }); }
      M.trunkBox(s, 99.5, 78.0, 5.0, 1.8, 1.9, 0);
      frame(105.4, 6.4, 74, -Math.PI / 2, 1.4, 2.2, 'poster'); frame(105.4, 6.6, 77, -Math.PI / 2, 0.8, 1.0); frame(105.4, 6.2, 70.2, -Math.PI / 2, 1.0, 1.3);
      model(s, 'ClassicNightstand_01', 91.6, 0, 82.6, Math.PI / 2, 3.4); oilLamp(91.6, 2.62, 82.3); model(s, 'ceramic_vase_02', 91.4, 2.62, 83.6, 0, 1.6);
      { const sm = G(96.4, 0, 65.6, Math.PI); // 缝纫机：铸铁脚踏 + 木台面 + 黑机头
        [-1.1, 1.1].forEach(x => { const l = mk(sm, new THREE.TorusGeometry(0.9, 0.08, 6, 16), iron, x, 1.1, 0); l.rotation.y = Math.PI / 2; });
        mk(sm, new THREE.BoxGeometry(2.6, 0.12, 1.2), iron, 0, 0.3, 0); mk(sm, new THREE.BoxGeometry(3.0, 0.16, 1.5), WD('#5a3418'), 0, 2.4, 0);
        const head = G(0, 2.48, 0, 0, sm); mk(head, new THREE.BoxGeometry(1.5, 0.35, 0.45), new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.2 }), 0, 0.18, 0); mk(head, new THREE.BoxGeometry(0.35, 0.9, 0.4), new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.2 }), 0.55, 0.7, 0);
        mk(head, new THREE.BoxGeometry(1.35, 0.3, 0.38), new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.2 }), 0, 1.05, 0); mk(head, new THREE.CylinderGeometry(0.3, 0.3, 0.12, 16), iron, 0.75, 0.75, 0).rotation.z = Math.PI / 2;
        box(96.9, 2.56, 65.4, 0.8, 0.04, 0.6, cloth('#c8b8e0')); }
      model(s, 'potted_plant_02', 104.4, 0, 88.2, 0, 2.6); shoes(97.5, 75.0, 0.2, '#6a1e2a');
      sconce(105.6, 6.2, 80, -Math.PI / 2);
      model(s, 'Rockingchair_01', 88.8, 0, 86.6, Math.PI * 0.8, 3.2);
      model(s, 'wall_clock', 123.4, 6.8, 72, -Math.PI / 2, 3.2); model(s, 'wall_clock', 124.6, 7.2, 70, Math.PI / 2, 3.2);
      model(s, 'painted_wooden_chair_01', 134.5, 0, 72.5, 0.4, 3); model(s, 'painted_wooden_chair_01', 138.6, 0, 77.6, 2.8, 3);
      model(s, 'wicker_basket_01', 137.0, 2.6, 64.6, 0.3, 3); model(s, 'wicker_basket_02', 128.0, 3.0, 66.0, 0, 3);
      model(s, 'painted_wooden_bench', 34, 0, 26.6, 0, 3.2); model(s, 'painted_wooden_bench', 100, 0, 26.8, 0, 3.2);
      [[20, 34], [60, 34], [100, 34], [135, 34]].forEach(([x, z]) => model(s, 'lantern_chandelier_01', x, IH, z, 0, 2.4));

      dust(1, 39, 29, 89);
      [[3, 40], [28.4, 40], [3, 88.4], [28.4, 88.4]].forEach(([x, z], i) => cobweb(x, IH - 0.9, z, [0, -Math.PI / 2, Math.PI / 2, Math.PI][i] + (i === 1 ? 0 : 0), 2.6));
      (COVER || M.covered)(s, 22, 66, 6, 3, 4.2); (COVER || M.covered)(s, 13, 47, 4, 4, 3.2); (COVER || M.covered)(s, 17.5, 47.5, 2, 2, 3.0, 0.4);
      (COVER || M.covered)(s, 4, 82, 3.2, 1.6, 7.2);
      { const r = mk(s, new THREE.CylinderGeometry(0.55, 0.55, 8, 14), cloth('#6a3a2a'), 27, 0.55, 75); r.rotation.x = Math.PI / 2; }
      [[24, 52, 0.3], [25.6, 51.2, -0.2]].forEach(([x, z, r]) => { const g = G(x, 0, z, r); mk(g, new THREE.BoxGeometry(2.6, 3.4, 0.12), WD('#4a2a14'), 0, 1.7, 0).rotation.x = -0.18; });
      M.trunkBox(s, 6, 52, 4, 2.6, 2.2, 0.1); M.trunkBox(s, 6, 52, 3.4, 2.2, 1.6, -0.1, 2.2);
      model(s, 'wooden_crate_01', 26, 0, 86.6, 0.5, 3); model(s, 'ceramic_vase_04', 2.2, 0, 64, 0, 2.6);
      // ================= 后廊 =================
      bench(48, 31.0, 0, 6); bench(102, 31.0, 0, 5);
      [[16, 37.4], [62, 37.4], [97, 37.4]].forEach(([x, z]) => { oilLamp(x, 6.4, z - 0.3, true); box(x, 6.2, z - 0.25, 0.9, 0.2, 0.6, WD('#4a2a14')); });
      { const g = G(78.5, 0, 31.2); mk(g, new THREE.BoxGeometry(3.6, 0.12, 1.2), WD('#5a3820'), 0, 0.9, 0); mk(g, new THREE.BoxGeometry(3.6, 0.12, 1.2), WD('#5a3820'), 0, 0.1, 0); [-1.7, 1.7].forEach(x => mk(g, new THREE.BoxGeometry(0.12, 1.0, 1.2), WD('#5a3820'), x, 0.5, 0));
        [[-1.1, '#1a1612'], [-0.4, '#3a2a1a'], [0.5, '#1a1612'], [1.2, '#5a3a2a']].forEach(([x, c], i) => { [-0.18, 0.18].forEach(d => { const o = mk(g, new THREE.SphereGeometry(0.18, 8, 6), cloth(c), x + d, i < 2 ? 1.05 : 0.25, 0); o.scale.set(0.8, 0.5, 2); }); }); }
      { const g = G(84, 0, 31.8); mk(g, lathe([[0, 0], [0.5, 0], [0.55, 1.8], [0.5, 1.8], [0.45, 0.1], [0, 0.1]], pottery('#3a4a4a')), 0, 0, 0); [[0.15, '#8a2a2a'], [-0.15, '#1a1a1a']].forEach(([a, c]) => { const u = mk(g, new THREE.CylinderGeometry(0.1, 0.05, 3.0, 8), cloth(c), a, 1.6, 0); u.rotation.z = a; }); }
      broom(31, 32, 0.4); broom(122.6, 32, -0.3); basket(40, 0, 31.4, 0.9); basket(41.6, 0, 31.6, 0.7, '#8a6a3a');
      [[6, 31.2], [128, 37]].forEach(([x, z]) => model(s, 'planter_pot_clay', x, 0, z, x, 3));
      { const g = G(140, 0, 31.0); [0, 1].forEach(r => [0, 1, 2].forEach(c => mk(g, new THREE.CylinderGeometry(0.42, 0.42, 0.55, 14), new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 0.9 }), c * 0.9 - 0.9, 0.28 + r * 0.56, r * 0.2))); }
      box(144, 0, 37.0, 3.4, 2.2, 1.0, WD('#6a4a2a')); mug(143.2, 2.2, 37); model(s, 'jug_01', 144.6, 2.2, 37, 0, 2.6);
      // ================= 楼梯：扶手栏杆、梯毯 =================
      for (let i = 0; i < 14; i++) { const z = 39.6 + i * 1.2 + 0.6, h = F2 / 14 * (i + 1);
        box(113, h, z, 6, 0.03, 1.1, cloth('#6b2a24')).userData.struct = 1;
        const o = mk(s, lathe([[0.1, 0], [0.16, 0.2], [0.08, 0.6], [0.14, 1.4], [0.08, 2.3], [0.1, 2.8]], WD('#3a1a0c'), 8), 116.8, h, z); o.userData.fixed = o.userData.nocol = 1; }
      { const L = Math.hypot(16.8, F2), r = mk(s, new THREE.BoxGeometry(0.3, 0.22, L), WD('#2a1208'), 116.8, (F2 / 14 + F2) / 2 + 2.85, 48.3); r.rotation.x = -Math.atan2(F2, 16.8); r.userData.fixed = r.userData.nocol = 1; }
      { const g = G(116.8, 0, 39.9); g.userData.fixed = g.userData.nocol = 1; mk(g, new THREE.BoxGeometry(0.6, 3.6, 0.6), WD('#2a1208'), 0, 1.8, 0); mk(g, new THREE.SphereGeometry(0.4, 14, 10), IM.brass, 0, 3.9, 0); }
      frame(106.5, 7.0, 54, Math.PI / 2, 2.2, 1.6, 'land'); frame(123.5, 9.5, 46, -Math.PI / 2, 1.4, 1.8, 'photo');
      // ================= 下人房 =================
            model(s, 'chinese_tea_table', 115, 0, 69.0, 0, 3.4); oilLamp(115, 2.25, 69.0, true); mug(114.4, 2.25, 69.5); thermos(115.7, 2.25, 69.6, 0x2a5a3a);
      washstand(107.4, 0, 86.8, 0.3);
      pegRail(111.6, 6.2, 64.4, 0, 8, [[-3, '#3a4a6a', 3.4], [-1.6, '#5a5a5a', 3.0], [1.2, '#2a2a3a', 3.6], [2.8, '#6a5a4a', 2.8]]);
      hat(115.2, 6.6, 64.8, null, true); shoes(110.8, 80.0, 0.1, '#1a1a1a'); shoes(120.6, 80.2, -0.2, '#2a2420');
      model(s, 'chinese_stool', 117.5, 0, 82, 0.3, 2.6); model(s, 'wooden_bucket_01', 122.6, 0, 87.6, 0, 2.6);
      frame(123.6, 6.0, 80, -Math.PI / 2, 1.2, 1.8, 'poster');
      // ================= 厨房 =================
      // 灶上蒸笼、铁锅；灶边柴禾；墙上挂锅铲、竹篮、蒜辫辣椒串
      { [[140.7, 43.2], [146, 43.2]].forEach(([x, z], i) => { const g = G(x, 3.0, z); if (i === 0) { for (let k = 0; k < 3; k++) { mk(g, new THREE.CylinderGeometry(1.0, 1.0, 0.45, 20, 1, true), WD('#c8a86a'), 0, 0.3 + k * 0.46, 0); } mk(g, new THREE.CylinderGeometry(1.05, 1.05, 0.12, 20), WD('#b8985a'), 0, 1.7, 0); }
          else mk(g, new THREE.SphereGeometry(1.0, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), iron, 0, 0.6, 0); }); }
      M.logs(s, 136.2, 41.5, 2.6, 3.0, 1.8);
      box(149.0, 6.4, 50, 0.12, 0.25, 8, WD('#4a2a14'));
      [[47, 'ladle'], [48.5, 'spat'], [50, 'basket'], [52, 'garlic'], [53.3, 'chili']].forEach(([z, k]) => { const x = 148.5;
        if (k === 'ladle') { const g = G(x, 6.3, z); mk(g, new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), WD('#7a5a3a'), 0, -1.1, 0); mk(g, new THREE.SphereGeometry(0.35, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), iron, 0, -2.2, 0); }
        else if (k === 'spat') { const g = G(x, 6.3, z); mk(g, new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), WD('#7a5a3a'), 0, -1.0, 0); mk(g, new THREE.BoxGeometry(0.05, 0.6, 0.5), iron, 0, -2.2, 0); }
        else if (k === 'basket') { const b = basket(x - 0.4, 4.6, z, 0.8); b.rotation.z = Math.PI / 2 - 0.2; }
        else string(x - 0.1, 6.3, z, k === 'garlic' ? '#e8e0d0' : '#b8241a', 10, k === 'garlic' ? 0.18 : 0.12); });
      // 碗橱
      { const g = G(124.9 + 1.2, 0, 80, Math.PI / 2); mk(g, new THREE.BoxGeometry(4.2, 6.4, 2.0), WD('#6a4a2a'), 0, 3.2, 0); mk(g, new THREE.BoxGeometry(4.0, 2.8, 0.06), new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.7, transparent: true, opacity: 0.55 }), 0, 4.4, 1.02);
        for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) mk(g, lathe([[0, 0], [0.18, 0], [0.32, 0.22], [0.3, 0.24], [0, 0.04]], por, 12), -1.6 + c * 0.8, 3.3 + r * 1.3, 0.3);
        [-1, 1].forEach(e => mk(g, new THREE.BoxGeometry(1.9, 2.4, 0.06), WD('#5a3a20'), e * 1.0, 1.4, 1.02)); }
      // 案板上的菜：白菜、萝卜、刀；酱缸一排
      { const T = 3.0; model(s, 'wooden_cutting_board', 127.8, T, 58.2, 1.57, 3);
        const cab = mk(s, new THREE.SphereGeometry(0.55, 14, 10), cloth('#cfdca8'), 127.6, T + 0.4, 74.8); cab.scale.set(0.8, 0.8, 1.6);
        [[128.2, 76.6], [127.4, 77.2]].forEach(([x, z]) => { const r = mk(s, new THREE.ConeGeometry(0.22, 1.1, 10), cloth('#e8e0d0'), x, T + 0.2, z); r.rotation.z = Math.PI / 2; });
        box(127.9, T, 59.6, 0.12, 0.04, 0.9, iron, 0.3);
        [[148.2, 88], [146.6, 88.4], [145.0, 88.2]].forEach(([x, z], i) => pot(x, 0, z, 0.8 - i * 0.12, 1.6 - i * 0.2, ['#3a2a1e', '#5a3a24', '#4a3a2a'][i])); }
      thermos(141.4, 2.6, 63.4); mug(137.6, 2.6, 66.2); mug(140.2, 2.6, 67.2); oilLamp(139, 2.6, 65.2, true);
      model(s, 'chinese_stool', 143.6, 0, 50.6, 0.4, 2.6); broom(148.6, 61.0, 0.2); basket(131, 0, 88.2, 1.0, '#9a7a48'); basket(133.2, 0, 88.0, 0.8);
      model(s, 'wooden_bucket_01', 148.2, 0, 59.4, 0.5, 3);
      { const c = cvs(128, 160, (q, w, h) => { q.fillStyle = '#c8281e'; q.fillRect(0, 0, w, h); q.fillStyle = '#f0d070'; q.fillRect(8, 8, w - 16, h - 16); q.fillStyle = '#c8281e'; q.fillRect(14, 14, w - 28, h - 28); q.fillStyle = '#f2d890'; q.beginPath(); q.ellipse(64, 60, 18, 22, 0, 0, 7); q.fill(); q.fillStyle = '#1a1a1a'; q.font = '700 18px serif'; q.textAlign = 'center'; q.fillText('定福灶君', 64, 120); });
        const g = G(143.4, 6.0, 38.62, 0); mk(g, new THREE.PlaneGeometry(1.8, 2.25), new THREE.MeshStandardMaterial({ map: ctex(c), roughness: 0.8 }), 0, 0, 0); mk(g, new THREE.BoxGeometry(2.4, 0.15, 0.7), WD('#4a2a14'), 0, -1.4, 0.3);
        mk(g, new THREE.CylinderGeometry(0.22, 0.18, 0.3, 12), IM.brass, 0, -1.18, 0.35); [-0.6, 0.6].forEach(x => { mk(g, new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), cloth('#c8281e'), x, -1.08, 0.35); });
        [[-1.6, 'left'], [1.6, 'right']].forEach(([x]) => { const cc = cvs(32, 160, (q, w, h) => { q.fillStyle = '#c8281e'; q.fillRect(0, 0, w, h); q.fillStyle = '#1a1a1a'; q.font = '700 18px serif'; q.textAlign = 'center'; [...(x < 0 ? '上天言好事' : '下界保平安')].forEach((ch, i) => q.fillText(ch, 16, 26 + i * 28)); }); mk(g, new THREE.PlaneGeometry(0.4, 2.4), new THREE.MeshStandardMaterial({ map: ctex(cc), roughness: 0.8 }), x, 0, 0); }); }
      { const g = G(134, IH - 0.2, 46); mk(g, new THREE.CylinderGeometry(0.15, 0.15, 10, 8), WD('#3a2a1a'), 0, 0, 0).rotation.z = Math.PI / 2;
        [-3.5, -2.2, -1, 0.4, 1.6, 3].forEach((x, i) => { mk(g, new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), cloth('#8a7a5a'), x, -0.6, 0); const m = mk(g, new THREE.BoxGeometry(0.5, i % 2 ? 1.6 : 1.1, 0.25), new THREE.MeshStandardMaterial({ color: i % 3 === 2 ? 0x6a2a1a : 0x8a3a20, roughness: 0.45 }), x, -1.2 - (i % 2 ? 0.8 : 0.55), 0); m.rotation.y = i; }); }
      pot(130.6, 0, 40.4, 1.2, 2.4, '#3a2a1e'); box(130.6, 2.4, 40.4, 2.0, 0.1, 2.0, WD('#6a4a2a'));
      { const g = G(140, 0, 80); model(g, 'chinese_tea_table', 0, 0, 0, 0, 3.4); [[-0.5, 0x8a2a2a], [0.3, 0x3a5a3a]].forEach(([x, c]) => mk(g, new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }), x, 2.4, 0.2)); basket(0.9, 2.15, -0.2, 0.6); }
      [[136.5, 86.6], [138.4, 87.2]].forEach(([x, z], i) => model(s, 'chinese_stool', x, 0, z, i, 2.6));
      // ================= 后院 =================
      { const g = G(80, 0, 10); [-6, 6].forEach(x => { mk(g, new THREE.CylinderGeometry(0.12, 0.14, 6, 8), WD('#6a5a40'), x, 3, 0); }); mk(g, new THREE.CylinderGeometry(0.05, 0.05, 12, 6), WD('#8a7a5a'), 0, 5.8, 0).rotation.z = Math.PI / 2;
        [[-3.6, '#d8d0c0', 2.6], [-1.6, '#3a4a6a', 3.0], [0.6, '#e8e0d0', 2.0], [2.8, '#5a4a3a', 2.4]].forEach(([x, c, l]) => { const o = mk(g, new THREE.BoxGeometry(1.4, l, 0.04), cloth(c), x, 5.8 - l / 2, 0); o.rotation.y = rnd(-0.15, 0.15); }); }
      { const g = G(66, 0, 20); mk(g, new THREE.CylinderGeometry(1.4, 1.4, 1.6, 20), new THREE.MeshStandardMaterial({ color: 0xa8a49a, roughness: 0.9 }), 0, 0.8, 0);
        mk(g, new THREE.CylinderGeometry(1.25, 1.25, 0.6, 20), new THREE.MeshStandardMaterial({ color: 0x9a968c, roughness: 0.9 }), 0, 1.9, 0); mk(g, new THREE.CylinderGeometry(0.1, 0.1, 1.2, 6), WD('#5a4a30'), 0.9, 2.6, 0); }
      model(s, 'wooden_bucket_01', 59.5, 0, 9.6, 0.3, 3); model(s, 'wooden_bucket_01', 61, 0, 8.6, 1.4, 2.6);
      basket(50, 0, 6, 1.1); basket(52.2, 0, 5.6, 0.9, '#8a6a3a'); [[92, 6], [96, 7], [100, 6.4]].forEach(([x, z]) => model(s, 'planter_pot_clay', x, 0, z, x, 3.2));
      [[30, 26], [28, 24.6]].forEach(([x, z], i) => model(s, 'chinese_stool', x, 0, z, i, 2.6));
      { const lv = cvs(256, 256, (q, w, h) => { for (let i = 0; i < 220; i++) { q.fillStyle = ['rgba(140,90,40,.8)', 'rgba(170,120,50,.8)', 'rgba(100,70,40,.8)'][i % 3]; q.beginPath(); q.ellipse(Math.random() * w, Math.random() * h, 5, 2.5, Math.random() * 3, 0, 7); q.fill(); } });
        [[40, 26, 20, 8], [92, 18, 16, 10]].forEach(([x, z, w, d]) => { const o = mk(s, new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: ctex(lv), transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 }), x, 0.06, z); o.rotation.x = -Math.PI / 2; o.castShadow = false; }); }
      // ================= 前院：门口停一辆黄包车 =================
      { const g = G(73, 0, 104.5, 0.9), red = new THREE.MeshStandardMaterial({ color: 0x5a1a14, roughness: 0.35 }), blk = new THREE.MeshStandardMaterial({ color: 0x141210, roughness: 0.4 });
        [-1.2, 1.2].forEach(x => { const w = G(x, 1.6, 0, Math.PI / 2, g); mk(w, new THREE.TorusGeometry(1.55, 0.09, 8, 28), blk, 0, 0, 0); for (let k = 0; k < 12; k++) { const sp = mk(w, new THREE.CylinderGeometry(0.025, 0.025, 3.0, 4), iron, 0, 0, 0); sp.rotation.z = k * Math.PI / 12; } mk(w, new THREE.CylinderGeometry(0.15, 0.15, 0.3, 10), iron, 0, 0, 0).rotation.x = Math.PI / 2; });
        mk(g, new THREE.BoxGeometry(2.0, 0.6, 1.8), red, 0, 2.2, 0.2); mk(g, new THREE.BoxGeometry(2.0, 1.8, 0.3), red, 0, 3.2, -0.6).rotation.x = -0.2; mk(g, new THREE.BoxGeometry(1.8, 0.3, 1.6), cloth('#2a1a14'), 0, 2.6, 0.2);
        const hood = mk(g, new THREE.CylinderGeometry(1.2, 1.2, 2.1, 16, 1, true, Math.PI, Math.PI * 0.6), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, side: THREE.DoubleSide }), 0, 3.6, -0.3); hood.rotation.z = Math.PI / 2;
        [-0.9, 0.9].forEach(x => { const sh = mk(g, new THREE.CylinderGeometry(0.06, 0.06, 6.5, 6), WD('#3a2a1a'), x, 1.3, 3.2); sh.rotation.x = Math.PI / 2 + 0.3; });
        mk(g, new THREE.BoxGeometry(1.8, 0.1, 1.0), blk, 0, 1.2, 1.4); }
      [[44, 96.5], [70, 96.5]].forEach(([x, z]) => { const g = G(x, 0, z); mk(g, new THREE.CylinderGeometry(0.9, 1.0, 1.4, 16), new THREE.MeshStandardMaterial({ color: 0x8a8a82, roughness: 0.9 }), 0, 0.7, 0); });
      [[40, 99], [74, 99]].forEach(([x, z]) => pot(x, 0, z, 1.4, 2.2, '#3a4a4a', false));
      // ================= 老号：百子柜、柜台、戥子秤、药碾 =================
      { const g = G(-23, 0, 9.9, 0), lb = ctex(cvs(256, 256, (q, w, h) => { q.fillStyle = '#5a3418'; q.fillRect(0, 0, w, h); const nm = ['當歸', '黃芪', '川芎', '白芍', '茯苓', '甘草', '黨參', '枸杞', '陳皮', '半夏', '桂枝', '麻黃', '防風', '白朮', '熟地', '山藥'];
          for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = i * 64, y = j * 64; q.strokeStyle = '#2a1608'; q.lineWidth = 4; q.strokeRect(x + 3, y + 3, 58, 58); q.fillStyle = '#efe0b8'; q.fillRect(x + 20, y + 10, 24, 26); q.fillStyle = '#2a1a0e'; q.font = '700 10px serif'; q.textAlign = 'center'; q.fillText(nm[(i * 4 + j) % nm.length].slice(0, 1), x + 32, y + 22); q.fillText(nm[(i * 4 + j) % nm.length].slice(1), x + 32, y + 33); q.fillStyle = '#c8a048'; q.beginPath(); q.arc(x + 32, y + 48, 4, 0, 7); q.fill(); } }), true, [3, 2]);
        mk(g, new THREE.BoxGeometry(12, 7.4, 1.6), WD('#4a2a14'), 0, 3.7, 0); mk(g, new THREE.PlaneGeometry(11.4, 6.8), new THREE.MeshStandardMaterial({ map: lb, roughness: 0.7 }), 0, 3.8, 0.81);
        mk(g, new THREE.BoxGeometry(12.4, 0.4, 1.9), WD('#2a1608'), 0, 7.5, 0); }
      { const g = G(-23, 0, 15.2, 0); mk(g, new THREE.BoxGeometry(10, 3.4, 2.0), WD('#5a3418'), 0, 1.7, 0); mk(g, new THREE.BoxGeometry(10.4, 0.2, 2.3), WD('#2a1608'), 0, 3.5, 0);
        const sc = G(-2.5, 3.6, 0, 0, g); mk(sc, new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6), WD('#e8dcc0'), 0, 1.2, 0).rotation.z = Math.PI / 2; mk(sc, lathe([[0, 0], [0.35, 0.05], [0.38, 0.1]], IM.brass, 14), -1.0, 0.7, 0); mk(sc, new THREE.CylinderGeometry(0.1, 0.12, 0.25, 10), IM.brass, 1.0, 0.9, 0);
        const ny = G(2.6, 3.6, 0, 0.3, g); mk(ny, new THREE.BoxGeometry(2.4, 0.5, 0.6), iron, 0, 0.25, 0); const wh = mk(ny, new THREE.CylinderGeometry(0.4, 0.4, 0.1, 18), iron, 0, 0.6, 0); wh.rotation.x = Math.PI / 2; mk(ny, new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), WD('#7a5a3a'), 0, 0.6, 0).rotation.x = Math.PI / 2;
        [-4.2, -3.4, 0.2, 1.0].forEach((x, i) => { const p = mk(g, new THREE.BoxGeometry(0.7, 0.02, 0.7), cloth('#e8dcc0'), x, 3.62, 0.2); p.rotation.y = i * 0.3; mk(g, new THREE.ConeGeometry(0.2, 0.15, 8), cloth(['#8a5a2a', '#c8a050', '#5a3a2a', '#a8784a'][i]), x, 3.7, 0.2); }); }
      oilLamp(-16, 3.4, 23, true);
    } else {
      const y = F2;
      // ================= 二楼走廊 =================
      [[20, 52.6, 0, 'land'], [44, 52.6, 0, 'photo'], [96, 52.6, 0, 'land'], [132, 52.6, 0, 'photo'], [40, 59.4, Math.PI, 'photo'], [100, 59.4, Math.PI, 'land']].forEach(([x, z, r, k]) => frame(x, y + 6.4, z, r, k === 'land' ? 2.4 : 1.2, k === 'land' ? 1.6 : 1.5, k));
      [[30, 52.6, 0], [80, 52.6, 0], [120, 59.4, Math.PI], [70, 59.4, Math.PI]].forEach(([x, z, r]) => sconce(x, y + 6.6, z, r));
      bench(88, 53.4, 0, 5, y); model(s, 'potted_plant_04', 104, y, 58.6, 0.3, 2.8); model(s, 'antique_ceramic_vase_01', 52, y, 53.2, 0, 3);
      // ================= 沈伯衡卧房 =================
      canopy(10, 71.5, 14, 17, 0, '#ece4d4');       washstand(27.5, y, 87.6, 0.4); model(s, 'pot_enamel_01', 19.2, y, 82.5, 0, 2.4);
      { const g = G(46.5, y, 66.4); mk(g, lathe([[0.7, 0], [0.7, 0.08], [0.12, 0.2], [0.08, 6.4], [0.14, 6.5], [0, 6.7]], WD('#3a2010'), 14), 0, 0, 0); garment(g, 0.35, 6.0, 0.1, '#3a3a44', 4.6, 0.4); hat(46.8, y + 6.25, 66.2, '#2a2622'); }
      model(s, 'chinese_armchair', 30, y, 72, Math.PI / 2, 2.9); model(s, 'chinese_tea_table', 30, y, 75.5, Math.PI / 2, 3); model(s, 'tea_set_01', 30, y + 2.0, 75.5, 0, 2.2);
      { const T = y + 2.7; books(36.2, T, 81, 3, 0.3); model(s, 'vintage_oil_lamp', 44.6, T, 80.8, 0, 2.8); box(40.5, T, 81.2, 2.2, 0.15, 1.6, cloth('#e8dcc0'), 0.1); box(38.3, T, 82, 0.5, 0.5, 0.5, WD('#3a1a0c')); }
      model(s, 'brass_pot_01', 20.2, y + 2.62, 65.2, 0, 2.0); [[21, 64.6], [19.6, 64.9]].forEach(([x, z]) => mug(x, y + 2.62, z));
      hang(s, 'scroll', 0.65, y + 6, 78, Math.PI / 2, null, 2.6, 5.0); frame(33, y + 6.4, 60.6, 0, 1.2, 1.5, 'photo');
      shoes(16.4, 81.2, 0.1);
      // ================= 沈景行房：洋派少爷 =================
      { const vg = G(44, y + 2.7, 34.0, 0.4); // 桌上小提琴盒开着
        mk(vg, new THREE.BoxGeometry(2.4, 0.3, 0.95), cloth('#1a1a1a'), 0, 0.15, 0); mk(vg, new THREE.BoxGeometry(2.3, 0.05, 0.85), cloth('#5a1a2a'), 0, 0.3, 0);
        const vb = new THREE.Shape(); vb.moveTo(0, -0.55); vb.bezierCurveTo(0.42, -0.55, 0.45, -0.1, 0.25, 0); vb.bezierCurveTo(0.38, 0.12, 0.38, 0.45, 0, 0.45); vb.bezierCurveTo(-0.38, 0.45, -0.38, 0.12, -0.25, 0); vb.bezierCurveTo(-0.45, -0.1, -0.42, -0.55, 0, -0.55);
        const v = mk(vg, new THREE.ExtrudeGeometry(vb, { depth: 0.12, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }), new THREE.MeshStandardMaterial({ color: 0x8a3a12, roughness: 0.25 }), -0.35, 0.36, 0); v.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
        mk(vg, new THREE.BoxGeometry(0.75, 0.05, 0.08), new THREE.MeshStandardMaterial({ color: 0x0e0e0e }), 0.55, 0.42, 0); }
      { const T = y + 2.7; box(37.6, T, 34.6, 1.0, 0.02, 1.3, cloth('#f0e8d4'), -0.15); books(34.2, T, 34.2, 4, 0.2); model(s, 'standing_picture_frame_01', 41.6, T, 33.4, 0.3, 2.8); box(35.6, T, 35.6, 0.18, 0.2, 0.18, new THREE.MeshStandardMaterial({ color: 0x101820, roughness: 0.1 })); }
      { const g = G(47, y + 2.6, 45.2); for (let i = 0; i < 6; i++) { const r = mk(g, new THREE.CylinderGeometry(0.7, 0.7, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.25 }), rnd(-0.05, 0.05), i * 0.05, 0); mk(g, new THREE.CylinderGeometry(0.22, 0.22, 0.045, 14), cloth(['#b83a2a', '#e0c060', '#3a6a8a'][i % 3]), r.position.x, i * 0.05, 0); } }
      { const g = G(30, y, 33.2, 0); [[-0.6, '#2a2a30', 4.2], [0.4, '#4a4a52', 4.0], [1.4, '#d8d4c8', 3.2]].forEach(([x, c, l]) => garment(g, x, 6.2, 0, c, l)); mk(g, new THREE.CylinderGeometry(0.05, 0.05, 3, 6), WD('#2a1608'), 0.4, 6.25, 0).rotation.z = Math.PI / 2; }
      { const r = G(16.5, y + 0.2, 33.4, 0.2); r.rotation.z = 0.15; const hd = mk(r, new THREE.TorusGeometry(0.55, 0.06, 6, 20), WD('#c8a870'), 0, 2.4, 0); hd.scale.set(0.8, 1.1, 1); mk(r, new THREE.CylinderGeometry(0.06, 0.07, 1.6, 8), WD('#c8a870'), 0, 1.0, 0); mk(r, new THREE.CircleGeometry(0.5, 12), new THREE.MeshStandardMaterial({ color: 0xe8e0c8, transparent: true, opacity: 0.4, side: THREE.DoubleSide }), 0, 2.4, 0).scale.set(0.8, 1.1, 1); }
      model(s, 'vintage_suitcase', 13.6, y, 49.4, 0.3, 3); frame(0.7, y + 6.4, 44, Math.PI / 2, 1.8, 2.6, 'poster'); frame(31.6, y + 6.8, 51.4, Math.PI, 2.4, 1.6, 'land');
      { const g = G(36, y, 47.6); mk(g, lathe([[0, 0], [0.5, 0], [0.45, 0.1], [0.08, 0.2], [0, 0.2]], IM.brass), 0, 0, 0); mk(g, new THREE.CylinderGeometry(0.05, 0.05, 5.0, 8), IM.brass, 0, 2.6, 0); mk(g, new THREE.CylinderGeometry(0.55, 0.9, 0.9, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xe8d4a8, emissive: 0xd8a860, emissiveIntensity: 0.5, side: THREE.DoubleSide }), 0, 5.3, 0); }
      model(s, 'side_table_01', 3.6, y, 62.6, 0, 3.4); oilLamp(3.6, y + 1.66, 62.6, false);
      model(s, 'wooden_bookshelf_worn', 49.6, y, 40, -Math.PI / 2, 3.2);
      // ================= 二老爷旧房：老派、樟脑味 =================
      canopy(61, 39.5, 10, 15, 0, '#e4dccc');       { const T = y + 2.7; const ab = G(86.5, T, 34.8, 0.1); mk(ab, new THREE.BoxGeometry(2.4, 0.12, 1.1), WD('#3a1a0c'), 0, 0.06, 0); for (let i = 0; i < 9; i++) { mk(ab, new THREE.CylinderGeometry(0.015, 0.015, 1.0, 4), IM.brass, -1.0 + i * 0.25, 0.14, 0).rotation.x = Math.PI / 2; for (let k = 0; k < 5; k++) mk(ab, new THREE.SphereGeometry(0.075, 8, 5), WD('#1a0c06'), -1.0 + i * 0.25, 0.14, -0.4 + k * 0.17 + (k > 0 ? 0.12 : 0)).scale.set(1, 0.6, 1); }
        box(90.5, T, 34.8, 1.4, 0.3, 1.8, cloth('#ece4d0'), -0.1); box(92.6, T, 34.2, 0.6, 0.5, 0.6, WD('#2a1608')); }
      { const g = G(80.6, y, 34.0, 0); mk(g, new THREE.CylinderGeometry(0.06, 0.06, 7, 6), WD('#4a2a14'), 0, 3.5, 0); mk(g, new THREE.BoxGeometry(1.4, 0.06, 0.06), WD('#4a2a14'), 0, 6.8, 0.1);
        const cg = G(0.6, 5.0, 0.3, 0, g); mk(cg, new THREE.CylinderGeometry(0.6, 0.6, 0.08, 16), WD('#6a4a2a'), 0, 0, 0); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; mk(cg, new THREE.CylinderGeometry(0.015, 0.015, 1.3, 3), WD('#9a7a4a'), Math.cos(a) * 0.58, 0.65, Math.sin(a) * 0.58); } mk(cg, new THREE.SphereGeometry(0.6, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9a7a4a, wireframe: true }), 0, 1.3, 0); }
      { const g = G(94.2, y + 2.7, 35.6, -0.4); mk(g, new THREE.CylinderGeometry(0.22, 0.24, 0.6, 12), IM.brass, 0, 0.3, 0); const t = mk(g, new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), IM.brass, 0.15, 0.8, 0); t.rotation.z = -0.5; }
      M.trunkBox(s, 69, 49.4, 4.4, 2.2, 2.0, 0, y); M.trunkBox(s, 69, 49.4, 3.6, 1.9, 1.5, 0.1, y + 2.0);
      model(s, 'chinese_armchair', 102, y, 47.5, -Math.PI / 2 - 0.3, 2.9); hang(s, 'scroll', 104.9, y + 6, 42, -Math.PI / 2, null, 2.4, 5.0); hang(s, 'calli', 52.6, y + 6, 46, Math.PI / 2, '知足常樂', 1.4, 5.0);
      [[66.5, 47], [57, 33]].forEach(([x, z]) => cobweb(x, y + IH - 0.9, z, 0, 1.6)); shoes(66.8, 47.6, 0.2, '#2a2420');
      // ================= 东头空客房、杂物间 =================
      dust(101, 61, 149, 89, y + 0.1); [[102, 61.2], [148.6, 88.6]].forEach(([x, z], i) => cobweb(x, y + IH - 0.9, z, i ? Math.PI : 0, 2.4));
      (COVER || M.covered)(s, 113, 85.5, 6, 3, 3.4, y ? 0 : 0); s.children[s.children.length - 1].position.y = y;
      model(s, 'wooden_crate_01', 147, y, 66, 0.3, 3); model(s, 'wooden_crate_02', 147.2, y + 1.9, 66.2, 1, 2.6); model(s, 'vintage_suitcase', 118, y, 64.6, -0.2, 3);
      { const g = G(140, y, 36.5); for (let i = 0; i < 4; i++) model(g, i % 2 ? 'wooden_crate_02' : 'wooden_crate_01', (i % 2) * 2.6 - 1.3, Math.floor(i / 2) * 1.9, 0, i * 0.4, 2.8); }
      [[128, 34], [130, 33.6], [132, 34.2]].forEach(([x, z], i) => pot(x, y, z, 0.6, 1.4, ['#4a3a2a', '#3a4a4a', '#5a3a24'][i])); model(s, 'Lantern_01', 145, y + 4.2, 33, 0, 3); dust(124, 31, 149, 51, y + 0.1);
      // ================= 露台：藤椅、花盆、晾衣竹竿 =================
      M.rattan(s, 8.5, 94.5, 0.4); s.children[s.children.length - 1].position.y = y; M.rattan(s, 15.5, 94.5, -0.4); s.children[s.children.length - 1].position.y = y;
      { const g = G(12, y, 97.6); mk(g, new THREE.CylinderGeometry(1.3, 1.3, 0.12, 20), WD('#6a4a2a'), 0, 2.2, 0); mk(g, new THREE.CylinderGeometry(0.12, 0.3, 2.2, 10), WD('#6a4a2a'), 0, 1.1, 0); model(g, 'tea_set_01', 0, 2.26, 0, 0, 2.2); }
      [36, 46, 104, 114, 124, 136].forEach((x, i) => { pot(x, y, 103, 0.9, 1.4, '#8a4a2a', false); model(s, i % 2 ? 'potted_plant_02' : 'potted_plant_04', x, y + 0.2, 103, i, 2.4); });
      { const g = G(130, y, 93); [-5, 5].forEach(x => mk(g, new THREE.CylinderGeometry(0.1, 0.12, 6.2, 8), WD('#7a6a4a'), x, 3.1, 0)); mk(g, new THREE.CylinderGeometry(0.06, 0.06, 10.5, 6), WD('#b8a070'), 0, 6.0, 0).rotation.z = Math.PI / 2;
        [[-3, '#e8e4d8', 2.8], [-0.5, '#9ab0c8', 3.2], [2.4, '#d8c0b0', 2.2]].forEach(([x, c, l]) => mk(g, new THREE.BoxGeometry(1.6, l, 0.04), cloth(c), x, 6.0 - l / 2, 0)); }
    }
    // —— Poly Haven 照片扫描件（CC0）：补几处还空着的角落 ——
    if (f === 1) {
      model(s, 'wooden_barrels_01', 27, 0, 5.5, 0.3, 2.6);            // 后院柴房边的木桶
      model(s, 'wooden_barrels_01', 146.3, 0, 86.5, -0.6, 2.4);       // 厨房东南角
      model(s, 'side_table_tall_01', 104.6, 0, 62.3, -Math.PI / 2, 2.7); // 客厅东南角高几
    } else {
      model(s, 'drawer_cabinet', 53.6, F2, 44, Math.PI / 2, 2.7);       // 二老爷旧房西墙的抽屉柜
      model(s, 'painted_wooden_nightstand', 102.6, F2, 87.6, 0, 2.7); // 空客房西南角
      model(s, 'side_table_tall_01', 50.4, F2, 49.8, -Math.PI / 2, 2.7); // 景行房东北角
      model(s, 'wooden_candlestick', 50.4, F2 + 2.75, 49.8, 0, 2.7);
    }
  }
  /* ---------- 客厅：三十年代上海洋式客厅 ---------- */
  function parlor(s) {
    const mk = (p, geo, m, x, yy, z) => { if (geo.isMesh) { z = yy; yy = x; x = m; } const o = geo.isMesh ? geo : new THREE.Mesh(geo, m); o.position.set(x, yy, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
    const G = (x, yy, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, yy, z); g.rotation.y = ry; s.add(g); return g; };
    const lathe = (pts, m, seg = 24) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), m);
    const WD = c => IM.wood(c);
    const marble = new THREE.MeshStandardMaterial({ map: ctex(cvs(256, 256, (q, w, h) => { q.fillStyle = '#d8d2c6'; q.fillRect(0, 0, w, h); q.strokeStyle = 'rgba(120,110,100,.35)'; for (let i = 0; i < 18; i++) { q.lineWidth = Math.random() * 2; q.beginPath(); let x = Math.random() * w, y = 0; q.moveTo(x, y); while (y < h) { x += (Math.random() - 0.5) * 30; y += 12; q.lineTo(x, y); } q.stroke(); } })), roughness: 0.25 });
    const black = new THREE.MeshStandardMaterial({ color: 0x0e0d0c, roughness: 0.3 });
    const cloth = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
    // —— 东墙壁炉：大理石炉框，炉台上座钟、烛台、照片，上方挂油画 ——
    { const g = G(105.2, 0, 51, -Math.PI / 2);
      mk(g, new THREE.BoxGeometry(6.4, 4.0, 1.0), marble, 0, 2.0, 0);
      mk(g, new THREE.BoxGeometry(7.0, 0.3, 1.5), marble, 0, 4.15, 0.15);
      mk(g, new THREE.BoxGeometry(3.4, 2.8, 1.02), black, 0, 1.4, 0.01);
      mk(g, new THREE.BoxGeometry(7.2, 0.18, 2.6), marble, 0, 0.09, 0.9);
      [-1.4, 1.4].forEach(x => { const a = mk(g, lathe([[0, 0], [0.18, 0], [0.12, 0.2], [0.06, 1.0], [0.12, 1.1], [0, 1.25]], IM.brass, 10), x, 0, 0.5); });
      for (let i = 0; i < 3; i++) { const lg = mk(g, new THREE.CylinderGeometry(0.16, 0.16, 2.2, 8), WD('#3a2414'), (i - 1) * 0.5, 0.35 + (i % 2) * 0.25, 0.4); lg.rotation.z = Math.PI / 2; lg.rotation.y = (i - 1) * 0.3; }
      const ember = new THREE.PointLight(0xff7a30, 3, 7, 2); ember.position.set(0, 0.8, 1.2); g.add(ember);
      [-2.6, 2.6].forEach(x => { const c = G(0, 0, 0); g.add(c); c.position.set(x, 4.3, 0.2); mk(c, lathe([[0, 0], [0.22, 0], [0.18, 0.06], [0.05, 0.2], [0.04, 0.8], [0.1, 0.85], [0, 0.88]], IM.brass, 12), 0, 0, 0); mk(c, new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8), cloth('#efe6d0'), 0, 1.1, 0); });
      [[-1.5, 0.3], [1.6, -0.25]].forEach(([x, r]) => { const f = G(0, 0, 0); g.add(f); f.position.set(x, 4.3, 0.25); f.rotation.y = r;
        mk(f, new THREE.BoxGeometry(0.9, 1.1, 0.08), IM.brass, 0, 0.55, 0);
        mk(f, new THREE.PlaneGeometry(0.7, 0.9), new THREE.MeshStandardMaterial({ map: ctex(cvs(64, 80, (q, w, h) => { q.fillStyle = '#b8a07a'; q.fillRect(0, 0, w, h); q.fillStyle = '#5a4630'; q.beginPath(); q.ellipse(32, 30, 12, 15, 0, 0, 7); q.fill(); q.fillRect(14, 46, 36, 34); })), roughness: 0.6 }), 0, 0.55, 0.05); });
    }
    model(s, 'mantel_clock_01', 104.9, 4.3, 51, -Math.PI / 2, 5);
    // —— 北墙立式钢琴 + 琴凳 ——
    { const g = G(95.0, 0, 39.4, 0), P = new THREE.MeshStandardMaterial({ color: 0x1a0e08, roughness: 0.18 });
      mk(g, new THREE.BoxGeometry(5.0, 4.2, 1.2), P, 0, 2.1, 0);
      mk(g, new THREE.BoxGeometry(5.0, 0.35, 2.2), P, 0, 2.45, 0.5);
      const keys = ctex(cvs(512, 32, (q, w, h) => { q.fillStyle = '#f2ecdc'; q.fillRect(0, 0, w, h); q.fillStyle = '#222'; for (let i = 0; i < 52; i++) { q.fillRect(i * w / 52, 0, 1, h); if ([0, 1, 3, 4, 5].includes(i % 7) && i < 51) q.fillRect(i * w / 52 + 6, 0, 5, h * 0.62); } }));
      const kb = mk(g, new THREE.PlaneGeometry(4.6, 0.75), new THREE.MeshStandardMaterial({ map: keys, roughness: 0.4 }), 0, 2.64, 1.1); kb.rotation.x = -Math.PI / 2;
      mk(g, new THREE.BoxGeometry(4.7, 0.9, 0.08), P, 0, 3.3, 0.62).rotation.x = -0.18;
      [-2.3, 2.3].forEach(x => mk(g, new THREE.BoxGeometry(0.3, 2.3, 0.3), P, x, 1.15, 1.45));
      mk(g, new THREE.BoxGeometry(1.4, 0.9, 0.04), cloth('#efe6cc'), 0, 3.6, 0.67).rotation.x = -0.18;
      [-1.6, 1.6].forEach(x => { mk(g, lathe([[0, 0], [0.2, 0], [0.06, 0.15], [0.05, 0.8], [0.15, 0.9], [0, 0.9]], IM.brass, 12), x, 4.2, 0.3); });
      model(g, 'brass_vase_01', 0.4, 4.2, 0.2, 0, 2.0);
      const b = G(95.0, 0, 43.2); mk(b, new THREE.BoxGeometry(3.0, 0.4, 1.3), cloth('#5a2a24'), 0, 1.75, 0); [[-1.3, -0.5], [1.3, -0.5], [-1.3, 0.5], [1.3, 0.5]].forEach(([x, z]) => mk(b, new THREE.BoxGeometry(0.18, 1.6, 0.18), P, x, 0.8, z)); }
    // —— 沙发西头：方几上三十年代礼拜堂式收音机 ——
    model(s, 'ClassicNightstand_01', 85.2, 0, 58.8, Math.PI / 2, 3.4);
    { const g = G(85.2, 2.55, 58.8, Math.PI / 2 + 0.3);
      const pr = new THREE.Shape(); pr.moveTo(-0.7, 0); pr.lineTo(0.7, 0); pr.lineTo(0.7, 1.0); pr.absarc(0, 1.0, 0.7, 0, Math.PI, false); pr.lineTo(-0.7, 0);
      const body = mk(g, new THREE.ExtrudeGeometry(pr, { depth: 0.75, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 }), WD('#6a3a1a'), 0, 0, -0.4);
      const gr = mk(g, new THREE.CircleGeometry(0.45, 24, 0, Math.PI), cloth('#b8a070'), 0, 1.0, 0.4);
      mk(g, new THREE.PlaneGeometry(0.9, 0.5), cloth('#b8a070'), 0, 0.75, 0.4);
      [-0.3, 0, 0.3].forEach(x => { const k = mk(g, new THREE.CylinderGeometry(0.07, 0.07, 0.08, 12), black, x, 0.22, 0.42); k.rotation.x = Math.PI / 2; });
      mk(g, new THREE.CircleGeometry(0.12, 16), new THREE.MeshStandardMaterial({ color: 0xffd890, emissive: 0xd8a040, emissiveIntensity: 0.6 }), 0, 0.45, 0.41); }
    // —— 沙发东头落地灯、茶几上的烟具报纸 ——
    { const g = G(102.8, 0, 59.2);
      mk(g, lathe([[0, 0], [0.55, 0], [0.5, 0.1], [0.1, 0.2], [0, 0.2]], IM.brass), 0, 0, 0);
      mk(g, new THREE.CylinderGeometry(0.06, 0.06, 5.2, 8), IM.brass, 0, 2.7, 0);
      mk(g, new THREE.CylinderGeometry(0.65, 1.05, 1.0, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xe8c898, emissive: 0xd89850, emissiveIntensity: 0.6, roughness: 0.9, side: THREE.DoubleSide }), 0, 5.6, 0);
      const l = new THREE.PointLight(0xffc070, 9, 11, 1.6); l.position.set(0, 5.4, 0); g.add(l); }
    { const T = 2.62; mk(s, lathe([[0, 0], [0.4, 0], [0.45, 0.12], [0.35, 0.14], [0, 0.06]], new THREE.MeshStandardMaterial({ color: 0x6a8a8a, roughness: 0.1, transparent: true, opacity: 0.8 })), 93.2, T, 50.8);
      mk(s, new THREE.BoxGeometry(0.7, 0.18, 0.45), WD('#5a2a14'), 95.0, T + 0.09, 49.2);
      const np = mk(s, new THREE.BoxGeometry(0.8, 0.03, 1.1), new THREE.MeshStandardMaterial({ map: ctex(cvs(128, 180, (q, w, h) => { q.fillStyle = '#e4dcc4'; q.fillRect(0, 0, w, h); q.fillStyle = '#2a2420'; q.font = '700 18px serif'; q.fillText('申 報', 36, 24); q.fillStyle = 'rgba(40,36,30,.5)'; for (let y = 36; y < h - 8; y += 6) q.fillRect(8 + (y % 18 ? 0 : 60), y, y % 18 ? w - 16 : 52, 2); })), roughness: 0.9 }), 93.4, T + 0.02, 49.4); np.rotation.y = 0.5; }
    // —— 南墙：沙发上方一排相框，两盏壁灯 ——
    [[89.5, 6.6, 0.8, 1.1], [92.0, 6.9, 1.2, 1.5], [96.0, 6.9, 1.2, 1.5], [98.5, 6.6, 0.8, 1.1], [94.0, 7.4, 1.6, 1.1]].forEach(([x, y, w, h], i) => {
      const g = G(x, y, 63.45, Math.PI); mk(g, new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.08), i % 2 ? IM.brass : WD('#2a1608'), 0, 0, 0);
      mk(g, new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: ctex(cvs(64, 80, (q, cw, ch) => { q.fillStyle = '#c0a882'; q.fillRect(0, 0, cw, ch); q.fillStyle = '#4a3a2a'; const n = i === 4 ? 4 : 1 + (i % 2); for (let k = 0; k < n; k++) { const cx = cw * (k + 0.5) / n; q.beginPath(); q.ellipse(cx, ch * 0.38, 7, 9, 0, 0, 7); q.fill(); q.fillRect(cx - 9, ch * 0.52, 18, ch * 0.5); } })), roughness: 0.6 }), 0, 0, 0.05); });
    [87, 101].forEach(x => { const g = G(x, 6.4, 63.6, Math.PI); mk(g, new THREE.BoxGeometry(0.5, 0.8, 0.12), IM.brass, 0, 0, 0);
      mk(g, lathe([[0.1, 0], [0.32, 0.25], [0.36, 0.55], [0.32, 0.6]], new THREE.MeshStandardMaterial({ color: 0xf6e8c8, emissive: 0xf0c070, emissiveIntensity: 1.1, roughness: 0.6, side: THREE.DoubleSide }), 16), 0, -0.1, 0.7); });
    // 书报架、痰盂、高脚花几、靠垫
    { const g = G(88.2, 0, 46.4, 0.4); [-0.5, 0.5].forEach(x => mk(g, new THREE.BoxGeometry(0.1, 1.8, 1.2), WD('#4a2a14'), x, 0.9, 0));
      mk(g, new THREE.BoxGeometry(1.0, 0.1, 1.2), WD('#4a2a14'), 0, 0.2, 0); [0.15, -0.15].forEach(z => { const p = mk(g, new THREE.BoxGeometry(0.85, 1.2, 0.04), cloth('#ddd2b8'), 0, 0.95, z); p.rotation.x = z * 0.8; }); }
    model(s, 'pot_enamel_01', 99.6, 0, 55.6, 0.2, 2.2);
    model(s, 'potted_plant_04', 104.3, 0, 40.8, 0.4, 3.2); model(s, 'ceramic_vase_02', 83.6, 0, 62.4, 0, 3);
  }
  /* ---------- 前厅：照民国公馆厅堂实景加密陈设 ---------- */
  function hall(s) {
    const mk = (p, geo, m, x, yy, z) => { if (geo.isMesh) { z = yy; yy = x; x = m; } const o = geo.isMesh ? geo : new THREE.Mesh(geo, m); o.position.set(x, yy, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
    const G = (x, yy, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, yy, z); g.rotation.y = ry; s.add(g); return g; };
    const lathe = (pts, m, seg = 24) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), m);
    const por = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.25 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x2f4f7a, roughness: 0.3 });
    const cloth = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
    const WD = c => IM.wood(c);
    const T = 2.83;
    // —— 餐桌：十副碗筷，主位那副没动过，其余吃了一半 ——
    const seats = [[57, 50.2, 0, true]]; [54.5, 59.5, 64.5, 69.5].forEach(z => { seats.push([54.4, z, Math.PI / 2]); seats.push([59.6, z, -Math.PI / 2]); }); seats.push([57, 71.8, Math.PI]);
    seats.forEach(([x, z, ry, host], i) => { const g = G(x, T, z, ry);
      mk(g, lathe([[0, 0], [0.55, 0], [0.62, 0.06], [0.6, 0.07], [0.5, 0.03], [0, 0.03]], por), 0, 0, 0);
      mk(g, lathe([[0, 0], [0.18, 0], [0.32, 0.25], [0.3, 0.26], [0.16, 0.04], [0, 0.04]], por), 0, 0.05, 0);
      if (!host) mk(g, new THREE.CylinderGeometry(0.27, 0.27, 0.02, 16), cloth(i % 3 ? '#e6dcc4' : '#c8a878'), 0, 0.2, 0);
      [-0.06, 0.06].forEach(dx => { const c = mk(g, new THREE.BoxGeometry(0.04, 0.04, 1.2), WD('#2a160a'), 0.85 + dx, 0.03, host ? 0 : 0.15); c.rotation.y = host ? 0 : 0.15; });
      mk(g, new THREE.BoxGeometry(0.22, 0.06, 0.12), por, 0.85, 0.03, -0.6);
      const cup = mk(g, lathe([[0, 0], [0.12, 0], [0.18, 0.28], [0.16, 0.28], [0.1, 0.02], [0, 0.02]], por), host ? -0.75 : -0.8, 0, host ? -0.4 : -0.3);
      if (!host && i % 4 === 1) { cup.rotation.z = Math.PI / 2; cup.position.y = 0.12; }
      const nap = mk(g, new THREE.BoxGeometry(0.5, 0.02, 0.5), cloth('#e8e0cc'), -0.75, 0.01, 0.4); nap.rotation.y = host ? 0 : i * 0.7;
    });
    // 桌心：几样菜撤了一半，留着冷盘、汤钵、果盘，两支烛台
    [[57, 55.5, '#8a4a28', 0.95], [57, 61, '#c8b07a', 1.25], [57, 66.5, '#6a7a3a', 0.95]].forEach(([x, z, c, r]) => {
      mk(s, lathe([[0, 0], [r * 0.5, 0], [r, 0.18], [r * 1.02, 0.2], [r * 0.48, 0.03], [0, 0.03]], blue), x, T, z);
      mk(s, new THREE.CylinderGeometry(r * 0.75, r * 0.75, 0.03, 20), cloth(c), x, T + 0.13, z); });
    { const g = G(57, T, 59.2); mk(g, lathe([[0, 0], [0.3, 0], [0.3, 0.1], [0.75, 0.55], [0.8, 0.6], [0.72, 0.6], [0.25, 0.14], [0, 0.14]], blue), 0, 0, 0);
      mk(g, new THREE.CylinderGeometry(0.7, 0.7, 0.02, 20), cloth('#d8c49a'), 0, 0.48, 0); }
    { const g = G(57, T, 63.8); mk(g, lathe([[0, 0], [0.5, 0], [0.55, 0.1], [0.2, 0.25], [0.18, 0.45], [0.7, 0.5], [0.72, 0.55], [0, 0.55]], IM.brass), 0, 0, 0);
      [[0.25, 0.7, 0, '#c84a2a'], [-0.2, 0.68, 0.15, '#d8a028'], [0, 0.68, -0.25, '#c84a2a'], [0.05, 0.85, 0.05, '#7a9a3a']].forEach(([a, b, c, col]) => mk(g, new THREE.SphereGeometry(0.2, 12, 8), cloth(col), a, b, c)); }
    [52.4, 69.6].forEach(z => { const g = G(57, T, z); mk(g, lathe([[0, 0], [0.32, 0], [0.3, 0.08], [0.08, 0.2], [0.06, 0.9], [0.14, 1.0], [0.12, 1.05], [0, 1.05]], IM.brass), 0, 0, 0);
      mk(g, new THREE.CylinderGeometry(0.07, 0.07, 0.5, 10), new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.6 }), 0, 1.3, 0); });
    // —— 北墙条案：座钟居中，左右掸瓶、帽筒 ——
    model(s, 'mantel_clock_01', 57, 3.2, 40.6, 0, 6);
    [53.5, 60.5].forEach(x => { const g = G(x, 3.2, 40.5); mk(g, lathe([[0, 0], [0.32, 0], [0.32, 1.1], [0.3, 1.15], [0, 1.15]], por), 0, 0, 0);
      mk(g, new THREE.CylinderGeometry(0.33, 0.33, 0.5, 20, 1, true), blue, 0, 0.55, 0); });
    [[47.5, 40.5], [66.5, 40.5]].forEach(([x, z]) => { const g = G(x, 3.2, z); mk(g, new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12), WD('#2a160a'), 0, 0.03, 0);
      mk(g, new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), WD('#2a160a'), 0.2, 0.5, 0); mk(g, new THREE.TorusGeometry(0.22, 0.03, 6, 16), IM.brass, 0, 0.95, 0).rotation.x = Math.PI / 2; });
    // 条案前一对太师椅夹一张方几（厅堂「一几二椅」）
    model(s, 'chinese_armchair', 50.5, 0, 43.2, 0, 2.9); model(s, 'chinese_armchair', 63.5, 0, 43.2, 0, 2.9);
    model(s, 'chinese_tea_table', 47.6, 0, 43.4, 0, 3.0); model(s, 'chinese_tea_table', 66.4, 0, 43.4, 0, 3.0);
    model(s, 'tea_set_01', 47.6, 2.05, 43.4, 0.3, 2.2);
    // —— 东墙：两组官帽椅夹茶几，墙上字画与壁灯 ——
    [[57.5, 61.5], [66.5, 70.5]].forEach(([za, zb]) => { model(s, 'chinese_armchair', 79.4, 0, za, -Math.PI / 2, 2.8); model(s, 'chinese_armchair', 79.4, 0, zb, -Math.PI / 2, 2.8); model(s, 'chinese_tea_table', 79.6, 0, (za + zb) / 2, -Math.PI / 2, 3.0); });
    model(s, 'brass_vase_02', 79.6, 2.05, 59.5, 0, 2.2); model(s, 'jug_01', 79.6, 2.05, 68.5, 0.4, 2.6);
    hang(s, 'scroll', 81.4, 6.0, 64, -Math.PI / 2, null, 3.0, 4.6);
    // 西墙：对称一组，加博古小架
    model(s, 'chinese_cabinet', 31.6, 0, 58.5, Math.PI / 2, 3);
    model(s, 'antique_ceramic_vase_01', 31.6, 0, 82.5, 0, 3.2);
    // 壁灯：黄铜臂 + 磨砂玻璃罩
    const sconce = (x, z, ry) => { const g = G(x, 6.4, z, ry); mk(g, new THREE.BoxGeometry(0.5, 0.8, 0.12), IM.brass, 0, 0, 0);
      const a = mk(g, new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), IM.brass, 0, 0.1, 0.35); a.rotation.x = Math.PI / 2;
      mk(g, lathe([[0.1, 0], [0.32, 0.25], [0.36, 0.55], [0.32, 0.6]], new THREE.MeshStandardMaterial({ color: 0xf6e8c8, emissive: 0xf0c070, emissiveIntensity: 1.1, roughness: 0.6, side: THREE.DoubleSide }), 16), 0, -0.1, 0.7);
      const l = new THREE.PointLight(0xffc888, 4, 9, 1.8); l.position.set(0, 0.2, 1.0); g.add(l); };
    [56, 72].forEach(z => sconce(81.8, z, -Math.PI / 2)); [62, 78].forEach(z => sconce(30.2, z, Math.PI / 2));
    // —— 大门内：衣帽架、伞桶、热水瓶小柜 ——
    { const g = G(40.5, 0, 87.8);
      mk(g, lathe([[0.7, 0], [0.7, 0.08], [0.12, 0.2], [0.08, 6.4], [0.14, 6.5], [0, 6.7]], WD('#3a2010'), 16), 0, 0, 0);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; const h = mk(g, new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), WD('#3a2010'), Math.cos(a) * 0.3, 6.0, Math.sin(a) * 0.3); h.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); }
      [[0.4, '#3a3430', 0.2], [-0.4, '#6a5a48', 2.6]].forEach(([dx, c, r]) => { const coat = mk(g, lathe([[0.18, 5.9], [0.55, 5.6], [0.6, 4.5], [0.7, 2.6], [0.74, 2.0], [0.2, 2.0]], cloth(c), 20), dx, 0, 0.1); coat.scale.set(1, 1, 0.45); coat.rotation.y = r; });
      const hat = G(40.5 + 0.3, 6.25, 87.8 - 0.25, 0.3); hat.rotation.z = -0.3;
      mk(hat, new THREE.CylinderGeometry(0.62, 0.62, 0.04, 24), cloth('#5a4a38'), 0, 0, 0); mk(hat, new THREE.CylinderGeometry(0.34, 0.4, 0.42, 20), cloth('#5a4a38'), 0, 0.22, 0); }
    { const g = G(38.0, 0, 88.3); mk(g, lathe([[0, 0], [0.55, 0], [0.6, 2.2], [0.55, 2.2], [0.5, 0.1], [0, 0.1]], new THREE.MeshStandardMaterial({ color: 0x3a5a5a, roughness: 0.3 })), 0, 0, 0);
      [[0.15, 0.1, 0.12, '#1a1a1a'], [-0.15, -0.05, -0.15, '#3a2a1a']].forEach(([a, b, t, c]) => { const u = mk(g, new THREE.CylinderGeometry(0.1, 0.06, 3.0, 8), cloth(c), a, 1.8, b); u.rotation.z = t; }); }
    model(s, 'chinese_commode', 72.5, 0, 87.4, Math.PI, 2.8);
    { const g = G(71.5, 2.75, 87.4); mk(g, new THREE.CylinderGeometry(0.32, 0.32, 1.3, 16), new THREE.MeshStandardMaterial({ color: 0x9a3a2a, roughness: 0.4 }), 0, 0.65, 0);
      mk(g, new THREE.CylinderGeometry(0.2, 0.3, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xc8c8c0, metalness: 0.7, roughness: 0.3 }), 0, 1.38, 0); }
    model(s, 'tea_set_01', 73.5, 2.75, 87.4, 0.2, 2.2);
    model(s, 'pot_enamel_01', 54.0, 0, 46.6, 0.2, 2.4);
    model(s, 'potted_plant_04', 78.5, 0, 87.6, 0.6, 3.0);
    // 入门处一架屏风挡着正厅（进门不直视主位）
    // 四只高花几，摆兰草、文竹
    [[41.5, 47.5], [72.5, 47.5], [41.5, 77.5], [72.5, 77.5]].forEach(([x, z], i) => { const g = G(x, 0, z, i * 0.7);
      mk(g, new THREE.CylinderGeometry(0.75, 0.75, 0.14, 8), WD('#3a1a0c'), 0, 3.6, 0);
      [0, 1, 2, 3].forEach(k => { const a = k * Math.PI / 2 + Math.PI / 4; mk(g, new THREE.CylinderGeometry(0.08, 0.07, 3.6, 6), WD('#3a1a0c'), Math.cos(a) * 0.55, 1.8, Math.sin(a) * 0.55); });
      mk(g, new THREE.CylinderGeometry(0.62, 0.62, 0.1, 8), WD('#3a1a0c'), 0, 0.5, 0);
      model(g, i % 2 ? 'potted_plant_02' : 'potted_plant_04', 0, 3.67, 0, 0, i % 2 ? 2.4 : 2.0); });
    model(s, 'antique_ceramic_vase_01', 44.5, 0, 87.6, 0, 3.0); model(s, 'ceramic_vase_04', 77.6, 0, 46.5, 0, 3.0);
    // 进门右手墙上：月份牌、穿衣镜
    { const c = cvs(200, 300, (q, w, h) => { const gr = q.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e0d0a8'); gr.addColorStop(1, '#c0a070'); q.fillStyle = gr; q.fillRect(0, 0, w, h);
        q.fillStyle = '#7a2a1a'; q.fillRect(0, 0, w, 26); q.fillStyle = '#efe0b8'; q.font = '700 18px serif'; q.textAlign = 'center'; q.fillText('沈萬春堂 謹贈', w / 2, 19);
        q.fillStyle = '#d0a088'; q.beginPath(); q.ellipse(w / 2, 118, 42, 54, 0, 0, 7); q.fill(); q.fillStyle = '#1e1410'; q.beginPath(); q.ellipse(w / 2, 84, 42, 26, 0, Math.PI, 0); q.fill();
        q.fillStyle = '#7a3a4a'; q.beginPath(); q.moveTo(w / 2 - 62, 262); q.lineTo(w / 2 - 38, 168); q.lineTo(w / 2 + 38, 168); q.lineTo(w / 2 + 62, 262); q.fill();
        q.fillStyle = '#efe6cc'; q.fillRect(20, 264, w - 40, 28); q.fillStyle = '#3a2a1a'; q.font = '14px serif'; q.fillText('民國廿五年 · 九月', w / 2, 283); });
      const g = G(30.4, 5.6, 84.5, Math.PI / 2); mk(g, new THREE.PlaneGeometry(1.5, 2.25), new THREE.MeshStandardMaterial({ map: ctex(c), roughness: 0.85 }), 0, 0, 0); }
    model(s, 'ornate_mirror_01', 30.4, 5.8, 41.6 + 30, Math.PI / 2, 3.0);
  }
  /* ---------- 书房：照民国写字间实景加密陈设 ---------- */
  function study(s, y) {
    const mk = (p, geo, m, x, yy, z) => { if (geo.isMesh) { z = yy; yy = x; x = m; } const o = geo.isMesh ? geo : new THREE.Mesh(geo, m); o.position.set(x, yy, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
    const G = (x, yy, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, yy, z); g.rotation.y = ry; s.add(g); return g; };
    const lathe = (pts, m, seg = 24) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), m);
    const black = new THREE.MeshStandardMaterial({ color: 0x0d0c0b, roughness: 0.22, metalness: 0.1 });
    const paper = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9 });
    const cloth = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 });
    const WD = c => IM.wood(c);
    const T = y + 2.6;                                  // 桌面高度
    const bookCols = ['#5a1e18', '#1f3a2c', '#2a2a3c', '#6a4a22', '#3a2416', '#7a6a4a', '#1a1a1a', '#4a3a5a', '#8a2a1a'];
    function books(p, x0, x1, yy, z, h0, d0, lean) {      // 一排书：高矮不齐，偶尔斜靠
      let x = x0; while (x < x1 - 0.2) { const bw = 0.15 + Math.random() * 0.22, bh = h0 * (0.75 + Math.random() * 0.25);
        if (Math.random() < 0.05) { x += 0.4; continue; }
        const b = mk(p, new THREE.BoxGeometry(bw, bh, d0 * (0.8 + Math.random() * 0.2)), cloth(bookCols[Math.floor(Math.random() * bookCols.length)]), x + bw / 2, yy + bh / 2, z);
        if (lean && Math.random() < 0.06) { b.rotation.z = 0.28; b.position.y -= 0.04; }
        x += bw + 0.015; } }
    function stack(p, x, yy, z, n, w = 1.1, d = 0.8, ry = 0) {   // 摞起来的书
      let h = yy; for (let i = 0; i < n; i++) { const t = 0.12 + Math.random() * 0.1; const b = mk(p, new THREE.BoxGeometry(w * (0.85 + Math.random() * 0.2), t, d * (0.85 + Math.random() * 0.2)), cloth(bookCols[(i * 3 + 1) % bookCols.length]), x, h + t / 2, z); b.rotation.y = ry + (Math.random() - 0.5) * 0.25; h += t; } return h; }

    // —— 书桌上 ——
    { // 银行家台灯：黄铜座，绿玻璃罩
      const g = G(71.8, T, 75.9, 0.3);
      mk(g, lathe([[0, 0], [0.42, 0], [0.42, 0.06], [0.3, 0.12], [0.08, 0.16], [0, 0.16]], IM.brass), 0, 0, 0);
      mk(g, new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), IM.brass, 0, 0.7, 0);
      mk(g, new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), IM.brass, 0, 1.25, 0).rotation.x = Math.PI / 2;
      const sh = mk(g, new THREE.CylinderGeometry(0.62, 0.62, 1.3, 24, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1f5a34, emissive: 0x1c4a24, emissiveIntensity: 0.35, roughness: 0.15, side: THREE.DoubleSide }), 0, 1.25, 0);
      sh.rotation.z = Math.PI / 2; sh.scale.set(1, 1, 0.75); sh.castShadow = false;
      mk(g, new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffc870, emissiveIntensity: 2 }), 0, 1.05, 0).castShadow = false;
    }
    { // 黑色摇把电话（三十年代座机）
      const g = G(81.6, T, 76.0, -0.5);
      mk(g, lathe([[0, 0], [0.5, 0], [0.46, 0.22], [0.3, 0.42], [0.18, 0.5], [0, 0.5]], black), 0, 0, 0);
      mk(g, new THREE.BoxGeometry(0.16, 0.24, 0.5), black, 0, 0.6, 0);
      const hs = new THREE.Group(); hs.position.set(0, 0.8, 0); g.add(hs);
      mk(hs, new THREE.BoxGeometry(0.16, 0.12, 1.1), black, 0, 0, 0);
      [-0.55, 0.55].forEach(zz => mk(hs, new THREE.CylinderGeometry(0.17, 0.12, 0.22, 16), black, 0, -0.08, zz));
      const dial = mk(g, new THREE.CylinderGeometry(0.22, 0.22, 0.03, 24), new THREE.MeshStandardMaterial({ color: 0xd8cfb8, roughness: 0.4 }), 0, 0.3, 0.38); dial.rotation.x = 1.0;
      const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.3, 0.1, -0.3), new THREE.Vector3(0.9, 0.02, -0.6), new THREE.Vector3(1.6, 0.02, -0.2), new THREE.Vector3(2.0, -0.6, 0.6)]), 20, 0.03, 6), black); g.add(cord);
    }
    { // 砚台、笔筒、笔架（空着一个口）
      mk(s, new THREE.BoxGeometry(0.9, 0.16, 1.2), new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: 0.5 }), 79.2, T + 0.08, 78.3);
      mk(s, new THREE.BoxGeometry(0.6, 0.03, 0.5), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1 }), 79.2, T + 0.17, 78.15);
      mk(s, new THREE.BoxGeometry(0.4, 0.18, 0.12), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.6 }), 79.65, T + 0.09, 77.4);
      const pot = G(80.9, T, 77.3);
      mk(pot, lathe([[0, 0], [0.32, 0], [0.34, 0.05], [0.3, 0.75], [0.33, 0.8], [0.28, 0.8], [0.26, 0.1], [0, 0.1]], new THREE.MeshStandardMaterial({ color: 0xc8d2c8, roughness: 0.3 })), 0, 0, 0);
      [[0.08, 0.1, 0.12], [-0.1, 0.05, -0.1], [0.02, -0.12, 0.05], [-0.06, -0.02, 0.18]].forEach(([a, b, c]) => { const br = mk(pot, new THREE.CylinderGeometry(0.035, 0.035, 1.5, 6), WD('#7a5a2a'), a, 0.9, b); br.rotation.set(c, 0, a); });
      const rack = G(80.6, T, 79.2, 0);   // 笔架：山形，五个口，中间一个空
      mk(rack, new THREE.BoxGeometry(1.5, 0.08, 0.3), WD('#3a2010'), 0, 0.04, 0);
      [-0.68, 0.68].forEach(xx => mk(rack, new THREE.BoxGeometry(0.08, 0.6, 0.12), WD('#3a2010'), xx, 0.34, 0));
      mk(rack, new THREE.BoxGeometry(1.5, 0.08, 0.14), WD('#3a2010'), 0, 0.62, 0);
      [-0.5, -0.25, 0.25, 0.5].forEach(xx => { mk(rack, new THREE.CylinderGeometry(0.025, 0.02, 0.42, 6), WD('#8a6a3a'), xx, 0.4, 0.08); const tip = mk(rack, new THREE.ConeGeometry(0.045, 0.16, 8), cloth('#1a1410'), xx, 0.12, 0.08); tip.rotation.x = Math.PI; });
    }
    // 账本（合着）、信笺、文件盒、书摞、眼镜、怀表、座钟
    mk(s, new THREE.BoxGeometry(1.3, 0.22, 1.8), cloth('#3c2a1a'), 78.6, T + 0.11, 76.3).rotation.y = 0.12;
    mk(s, new THREE.BoxGeometry(1.22, 0.2, 1.7), paper, 78.62, T + 0.12, 76.3).rotation.y = 0.12; mk(s, new THREE.BoxGeometry(1.32, 0.03, 1.82), cloth('#3c2a1a'), 78.6, T + 0.235, 76.3).rotation.y = 0.12;
    [[74.0, 77.4, 0.3], [74.4, 77.1, -0.2], [73.6, 76.7, 0.8]].forEach(([x, z, r]) => mk(s, new THREE.BoxGeometry(0.9, 0.01, 1.2), paper, x, T + 0.01, z).rotation.y = r);
    { const g = G(83.4, T, 78.6, 0.1); mk(g, new THREE.BoxGeometry(1.3, 0.35, 1.0), WD('#5a3420'), 0, 0.18, 0); mk(g, new THREE.BoxGeometry(1.1, 0.06, 0.85), paper, 0, 0.38, 0); mk(g, new THREE.BoxGeometry(1.3, 0.35, 1.0), WD('#5a3420'), 0, 0.6, 0); }
    stack(s, 73.0, T, 76.0, 4, 1.0, 0.7, 0.4); stack(s, 82.7, T, 76.3, 3, 1.1, 0.8, -0.3);
    model(s, 'round_spectacles', 77.9, T + 0.02, 76.0, 2.6, 3); model(s, 'pocket_watch', 75.0, T + 0.02, 76.4, 0.4, 3);
    model(s, 'mantel_clock_01', 81.9, T, 75.0, Math.PI, 2.6); model(s, 'magnifying_glass_01', 80.2, T + 0.02, 76.2, 1.1, 3);
    model(s, 'tea_set_01', 94.0, y + 2.2, 71.0, 0.4, 2.6);

    // —— 地上：废纸篓旁的画缸、痰盂、炭盆 ——
    { const g = G(85.2, y, 81.2); mk(g, lathe([[0, 0], [0.75, 0], [0.85, 1.5], [0.8, 1.6], [0.7, 1.6], [0.7, 0.1], [0, 0.1]], new THREE.MeshStandardMaterial({ color: 0xdfe4e6, roughness: 0.25 })), 0, 0, 0);
      [[0.25, 0.1, 0.15], [-0.2, 0.2, -0.1], [0.05, -0.25, 0.08], [-0.25, -0.1, -0.2], [0.3, -0.2, 0.25]].forEach(([a, b, t]) => { const r = mk(g, new THREE.CylinderGeometry(0.12, 0.12, 2.4, 10), paper, a, 1.6, b); r.rotation.set(t, 0, a * 0.6); }); }
    model(s, 'pot_enamel_01', 70.2, y, 81.3, 0.3, 2.4);
    { const g = G(87.5, y, 72.5); mk(g, lathe([[0, 0.9], [0.9, 0.9], [1.0, 1.4], [0.85, 1.5], [0, 1.2]], IM.brass), 0, 0, 0);
      [0, 2.1, 4.2].forEach(a => { const l = mk(g, new THREE.CylinderGeometry(0.06, 0.05, 1.0, 6), WD('#2a1608'), Math.cos(a) * 0.7, 0.5, Math.sin(a) * 0.7); });
      mk(g, new THREE.CircleGeometry(0.85, 20), new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 1 }), 0, 1.38, 0).rotation.x = -Math.PI / 2; }

    // —— 门边：衣帽架，挂长衫、礼帽 ——
    { const g = G(63.2, y, 62.6);
      mk(g, lathe([[0.7, 0], [0.7, 0.08], [0.12, 0.2], [0.08, 6.4], [0.14, 6.5], [0, 6.7]], WD('#3a2010'), 16), 0, 0, 0);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; const h = mk(g, new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), WD('#3a2010'), Math.cos(a) * 0.3, 6.0, Math.sin(a) * 0.3); h.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); }
      const hat = G(63.2 + 0.25, y + 6.25, 62.6 + 0.3, 0.3); hat.rotation.z = 0.35;
      mk(hat, new THREE.CylinderGeometry(0.62, 0.62, 0.04, 24), cloth('#2a2622'), 0, 0, 0); mk(hat, new THREE.CylinderGeometry(0.34, 0.4, 0.42, 20), cloth('#2a2622'), 0, 0.22, 0);
      mk(hat, new THREE.CylinderGeometry(0.405, 0.405, 0.1, 20), cloth('#121010'), 0, 0.06, 0);
      const coat = mk(g, lathe([[0.18, 5.9], [0.55, 5.6], [0.6, 4.5], [0.72, 2.2], [0.78, 1.6], [0.2, 1.6]], cloth('#45505a'), 20), -0.35, 0, 0.1); coat.scale.set(1, 1, 0.45); coat.rotation.y = 0.5;
    }

    // —— 北墙：书架两侧再添玻璃门书橱 ——
    [[65.0, 4.6], [94.5, 6.0]].forEach(([x, w]) => { const g = G(x, y, 62.2), d = 1.9, h = 7.2, cw = WD('#3a2012');
      mk(g, new THREE.BoxGeometry(w, h, 0.12), cw, 0, h / 2, -d / 2 + 0.06); [-1, 1].forEach(e => mk(g, new THREE.BoxGeometry(0.14, h, d), cw, e * (w / 2 - 0.07), h / 2, 0)); mk(g, new THREE.BoxGeometry(w, 0.2, d), cw, 0, h - 0.1, 0);
      mk(g, new THREE.BoxGeometry(w + 0.4, 0.35, d + 0.3), WD('#2a160a'), 0, h + 0.17, 0);
      for (let r = 0; r < 4; r++) { const yy = 0.9 + r * 1.55; mk(g, new THREE.BoxGeometry(w - 0.4, 0.08, d - 0.3), WD('#2a160a'), 0, yy, 0.05); books(g, -w / 2 + 0.3, w / 2 - 0.3, yy + 0.04, 0.05, 1.15, 1.2, true); }
      mk(g, new THREE.BoxGeometry(w - 0.3, 0.7, 0.08), WD('#2a160a'), 0, 0.4, d / 2);
      [-1, 1].forEach(sd => { const dg = mk(g, new THREE.BoxGeometry(w / 2 - 0.25, h - 1.0, 0.04), IM.glass, sd * w / 4, h / 2 + 0.35, d / 2 + 0.03);
        [[0, (h - 1.0) / 2], [0, -(h - 1.0) / 2]].forEach(([a, b]) => mk(g, new THREE.BoxGeometry(w / 2 - 0.2, 0.12, 0.08), WD('#2a160a'), sd * w / 4, h / 2 + 0.35 + b, d / 2 + 0.05));
        [-1, 1].forEach(e => mk(g, new THREE.BoxGeometry(0.12, h - 1.0, 0.08), WD('#2a160a'), sd * w / 4 + e * (w / 4 - 0.15), h / 2 + 0.35, d / 2 + 0.05));
        mk(g, new THREE.BoxGeometry(0.06, 0.3, 0.06), IM.brass, sd * 0.2, h / 2, d / 2 + 0.1); });
    });
    { // 保险柜（墨绿铁皮，铜转盘）
      const g = G(68.6, y, 62.8); mk(g, new THREE.BoxGeometry(2.0, 2.6, 1.8), new THREE.MeshStandardMaterial({ color: 0x1f2a24, roughness: 0.45, metalness: 0.5 }), 0, 1.4, 0);
      mk(g, new THREE.BoxGeometry(2.1, 0.14, 1.9), black, 0, 0.07, 0); mk(g, new THREE.BoxGeometry(1.6, 2.1, 0.06), new THREE.MeshStandardMaterial({ color: 0x24302a, roughness: 0.4, metalness: 0.5 }), 0, 1.4, 0.92);
      const dl = mk(g, new THREE.CylinderGeometry(0.28, 0.28, 0.1, 24), IM.brass, 0.2, 1.7, 0.98); dl.rotation.x = Math.PI / 2;
      const hd = mk(g, new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), IM.brass, -0.4, 1.2, 1.0); hd.rotation.z = Math.PI / 2;
      model(s, 'brass_vase_02', 68.6, y + 2.8, 62.8, 0, 2.4);
    }

    // —— 东边会客角：第二把扶手椅、落地灯、地球仪、留声机 ——
    model(s, 'chinese_armchair', 96.2, y, 74.4, -Math.PI / 2, 3);
    { const g = G(97.6, y, 71.2);   // 落地灯
      mk(g, lathe([[0, 0], [0.55, 0], [0.5, 0.1], [0.1, 0.2], [0, 0.2]], IM.brass), 0, 0, 0);
      mk(g, new THREE.CylinderGeometry(0.06, 0.06, 5.2, 8), IM.brass, 0, 2.7, 0);
      mk(g, new THREE.CylinderGeometry(0.6, 1.0, 1.0, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xe8d4a8, emissive: 0xd8a860, emissiveIntensity: 0.55, roughness: 0.9, side: THREE.DoubleSide }), 0, 5.6, 0);
      const l = new THREE.PointLight(0xffc880, 10, 10, 1.6); l.position.set(0, 5.3, 0); g.add(l);
    }
    { // 地球仪：木三脚架 + 黄铜子午圈
      const g = G(88.6, y, 65.0, 0.6);
      [0, 2.1, 4.2].forEach(a => { const l = mk(g, new THREE.CylinderGeometry(0.07, 0.05, 2.0, 8), WD('#3a2010'), Math.cos(a) * 0.45, 0.95, Math.sin(a) * 0.45); l.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); });
      mk(g, new THREE.TorusGeometry(0.95, 0.06, 8, 32), WD('#3a2010'), 0, 2.0, 0).rotation.x = Math.PI / 2;
      const map = cvs(256, 128, (q, w, h) => { q.fillStyle = '#c8b483'; q.fillRect(0, 0, w, h); q.fillStyle = '#8a6a3a';
        [[40, 40, 30, 22], [60, 80, 16, 26], [120, 38, 40, 22], [130, 70, 18, 22], [190, 90, 18, 10], [170, 40, 30, 18]].forEach(([x, yy, rx, ry]) => { q.beginPath(); q.ellipse(x, yy, rx, ry, 0.4, 0, 7); q.fill(); });
        q.strokeStyle = 'rgba(90,60,30,.35)'; q.lineWidth = 1; for (let i = 0; i < w; i += 21) { q.beginPath(); q.moveTo(i, 0); q.lineTo(i, h); q.stroke(); } for (let j = 0; j < h; j += 21) { q.beginPath(); q.moveTo(0, j); q.lineTo(w, j); q.stroke(); } });
      const gl = mk(g, new THREE.SphereGeometry(0.8, 32, 20), new THREE.MeshStandardMaterial({ map: ctex(map), roughness: 0.45 }), 0, 2.1, 0); gl.rotation.z = 0.41;
      const mer = mk(g, new THREE.TorusGeometry(0.86, 0.04, 6, 32, Math.PI * 1.4), IM.brass, 0, 2.1, 0); mer.rotation.set(0, Math.PI / 2, 0.41 - 0.7);
    }
    { // 留声机放在矮柜上
      model(s, 'vintage_cabinet_01', 98.6, y, 80.6, -Math.PI / 2, 3);
      const g = G(98.4, y + 3.0, 80.6, -Math.PI / 2 - 0.3);
      mk(g, new THREE.BoxGeometry(1.5, 0.6, 1.5), WD('#4a2a14'), 0, 0.3, 0);
      mk(g, new THREE.CylinderGeometry(0.62, 0.62, 0.04, 28), black, 0, 0.62, 0);
      const arm = mk(g, new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), IM.brass, 0.5, 0.75, 0.2); arm.rotation.z = Math.PI / 2 - 0.3;
      const horn = lathe([[0.06, 0], [0.1, 0.6], [0.25, 1.3], [0.6, 1.8], [1.05, 2.05], [1.1, 2.05]], new THREE.MeshStandardMaterial({ color: 0xb8893a, metalness: 0.75, roughness: 0.3, side: THREE.DoubleSide }), 28);
      horn.position.set(0.55, 0.65, 0.1); horn.rotation.set(0, 0, -1.0); g.add(horn);
    }

    // —— 南窗下：条案，摆盆景、香炉 ——
    model(s, 'chinese_console_table', 80.5, y, 88.4, Math.PI, 3);
    { const g = G(78.8, y + 2.85, 88.4); mk(g, new THREE.BoxGeometry(1.4, 0.3, 0.7), new THREE.MeshStandardMaterial({ color: 0x5f7f84, roughness: 0.3 }), 0, 0.15, 0);
      mk(g, new THREE.DodecahedronGeometry(0.42, 0), new THREE.MeshStandardMaterial({ color: 0x8a8478, roughness: 0.9 }), -0.2, 0.6, 0).scale.set(0.8, 1.4, 0.7);
      for (let i = 0; i < 8; i++) { const l = mk(g, new THREE.SphereGeometry(0.22, 8, 6), cloth('#36502a'), 0.25 + Math.random() * 0.3 - 0.15, 0.7 + Math.random() * 0.6, Math.random() * 0.4 - 0.2); l.scale.set(1.3, 0.5, 1.1); } }
    { const g = G(82.4, y + 2.85, 88.4); mk(g, lathe([[0, 0], [0.32, 0], [0.42, 0.25], [0.4, 0.42], [0.3, 0.45], [0, 0.42]], IM.brass), 0, 0.12, 0);
      [0, 2.1, 4.2].forEach(a => mk(g, new THREE.CylinderGeometry(0.04, 0.03, 0.14, 6), IM.brass, Math.cos(a) * 0.25, 0.06, Math.sin(a) * 0.25)); }

    // —— 墙上：月份牌、对联、相框 ——
    { const c = cvs(200, 300, (q, w, h) => { const gr = q.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d9c8a0'); gr.addColorStop(1, '#b89a70'); q.fillStyle = gr; q.fillRect(0, 0, w, h);
        q.fillStyle = '#7a2a1a'; q.fillRect(0, 0, w, 26); q.fillStyle = '#efe0b8'; q.font = '700 18px serif'; q.textAlign = 'center'; q.fillText('民國廿五年', w / 2, 19);
        q.fillStyle = '#c89a80'; q.beginPath(); q.ellipse(w / 2, 120, 46, 58, 0, 0, 7); q.fill(); q.fillStyle = '#2a1a14'; q.beginPath(); q.ellipse(w / 2, 86, 44, 28, 0, Math.PI, 0); q.fill();
        q.fillStyle = '#3a5a6a'; q.beginPath(); q.moveTo(w / 2 - 60, 260); q.lineTo(w / 2 - 40, 170); q.lineTo(w / 2 + 40, 170); q.lineTo(w / 2 + 60, 260); q.fill();
        q.fillStyle = '#efe6cc'; q.fillRect(20, 262, w - 40, 30); q.fillStyle = '#3a2a1a'; q.font = '14px serif'; q.fillText('九月 · 寒露', w / 2, 282); });
      const g = G(50.4, y + 5.4, 63.6, Math.PI / 2); mk(g, new THREE.PlaneGeometry(1.4, 2.1), new THREE.MeshStandardMaterial({ map: ctex(c), roughness: 0.85 }), 0, 0, 0); mk(g, new THREE.CylinderGeometry(0.05, 0.05, 1.55, 8), WD('#2a1608'), 0, 1.08, 0.02).rotation.z = Math.PI / 2; }
    hang(s, 'calli', 99.4, y + 6.4, 66.8, -Math.PI / 2, '杏林春暖', 1.4, 5.2);
    model(s, 'hanging_picture_frame_02', 99.35, y + 7.2, 74.4, -Math.PI / 2, 3);
    model(s, 'standing_picture_frame_01', 98.6, y + 5.8, 80.0, -Math.PI / 2 + 0.3, 2.6);
    // —— 西侧：罗汉床式长榻 + 方几 + 两只绣墩，对着书桌 ——
    model(s, 'chinese_sofa', 57.2, y, 78.5, Math.PI / 2, 3);
    model(s, 'chinese_tea_table', 61.6, y, 78.5, Math.PI / 2, 3.2); model(s, 'tea_set_01', 61.6, y + 2.0, 78.5, 0.8, 2.4);
    model(s, 'chinese_stool', 64.6, y, 76.3, 0.3, 3); model(s, 'chinese_stool', 64.6, y, 80.8, -0.2, 3);
    model(s, 'potted_plant_02', 89.0, y, 87.6, 0.6, 3.2); model(s, 'potted_plant_02', 64.0, y, 87.8, 2.0, 3.0);
    { const l = new THREE.PointLight(0xffd8a0, 6, 14, 1.8); l.position.set(80.5, y + 5, 86.5); s.add(l); }
  }
  function decorate(s, f) {
    if (f === 2) {
      const y = F2;
      hang(s, 'plaque', 51.0, y + 8.9, 75.5, Math.PI / 2, '懸壺濟世', 7, 1.6);
      hang(s, 'scroll', 99.4, y + 6, 79, -Math.PI / 2);
      model(s, 'vintage_grandfather_clock_01', 98.2, y, 85.5, -Math.PI / 2, 3.2);
      model(s, 'antique_ceramic_vase_01', 55.5, y, 87.5, 0, 3.4);
      model(s, 'ClassicConsole_01', 30, y, 53.7, 0, 3); model(s, 'brass_vase_01', 30, y + 2.85, 53.4, 0, 2.6);
      model(s, 'ornate_mirror_01', 49.3, y + 6.2, 70, -Math.PI / 2, 3.4);
      model(s, 'GothicCommode_01', 46.8, y, 70, -Math.PI / 2, 3);
      model(s, 'vintage_suitcase', 140, y, 72, -0.4, 2.8);
      const gr = M.group(s, 0, y, 0); M.carpet(gr, 24, 64, 46, 87, '#3a2a40', '#6b2a24', 0.04); M.carpet(gr, 18, 37, 47, 50, '#2b3b52', '#6b2a24', 0.04); M.carpet(gr, 58, 37, 86, 50, '#4a3a34', '#2b3b52', 0.04);
      model(s, 'brass_vase_03', 93.9, y + 2.2, 71.2, 0, 3); study(s, y);
      model(s, 'ceramic_vase_04', 97, y, 87.5, 0, 3.2); model(s, 'ceramic_vase_02', 55.3, y + 7.6, 70, 0, 2.4); model(s, 'brass_pot_01', 55.3, y + 7.6, 81, 0, 2.4);
      model(s, 'standing_picture_frame_01', 20.2, y + 2.15, 64.4, 0.6, 3); model(s, 'vintage_oil_lamp', 45, y + 2.7, 81.5, 0, 2.8);
      model(s, 'jug_01', 46.8, y + 3.64, 68.6, -1.2, 3); model(s, 'treasure_chest', 10, y, 82.6, 0, 3); model(s, 'ceramic_vase_02', 3, y, 88, 0, 3.2);
      model(s, 'treasure_chest', 133, y, 78, 0.2, 3); model(s, 'treasure_chest', 133.5, y + 1.85, 78.2, 0.1, 2.8); model(s, 'wooden_crate_02', 112, y, 86, 1.4, 3); model(s, 'wooden_crate_01', 146, y, 86.5, -0.2, 3);
      model(s, 'standing_picture_frame_01', 43, y + 2.62, 33.6, 0.5, 3); model(s, 'ceramic_vase_04', 3.5, y, 48, 0, 3);
      model(s, 'brass_pot_01', 93, y + 2.62, 34.4, 0, 2.2); model(s, 'standing_picture_frame_01', 84, y + 2.62, 33.8, -0.4, 3); model(s, 'potted_plant_04', 104, y, 48, 0, 3.2);
      model(s, 'hanging_picture_frame_02', 75, y + 6.4, 52.65, 0, 3); model(s, 'hanging_picture_frame_02', 16, y + 6.4, 52.65, 0, 2.6);
      model(s, 'hanging_picture_frame_02', 30, y + 6.4, 59.35, Math.PI, 2.6); model(s, 'hanging_picture_frame_02', 85, y + 6.4, 59.35, Math.PI, 2.6);
      model(s, 'potted_plant_04', 147, y, 54, 0, 3);
      model(s, 'planter_pot_clay', 50, y, 102, 0, 3.4); model(s, 'planter_pot_clay', 110, y, 102, 1, 3.4);
      hang(s, 'scroll', 0.65, y + 6, 70, Math.PI / 2); hang(s, 'calli', 49.4, y + 6, 78, -Math.PI / 2, '靜水流深');
      hang(s, 'calli', 30, y + 6, 59.4, Math.PI, '寧靜致遠'); hang(s, 'scroll', 90, y + 6, 59.4, Math.PI);
      hang(s, 'scroll', 100.6, y + 6, 72, Math.PI / 2);
      model(s, 'Chandelier_01', 75, y + IH, 75, 0, 3.2); model(s, 'Chandelier_01', 25, y + IH, 75, 0.4, 2.8); chandelier(s, 125, y + IH, 75, false);
      [30, 95].forEach(x => chandelier(s, x, y + IH, 56, false));
    } else {
      hang(s, 'plaque', 57, 9.0, 38.65, 0, '沈萬春堂', 9, 1.9); hall(s);
      hang(s, 'calli', 49.5, 5.6, 38.7, 0, '杏林春暖'); hang(s, 'calli', 64.5, 5.6, 38.7, 0, '橘井泉香');
      hang(s, 'scroll', 57, 5.4, 38.7, 0, null, 3.6, 5.0);
      model(s, 'vintage_grandfather_clock_01', 79.5, 0, 87.6, Math.PI, 3.2);
      model(s, 'antique_ceramic_vase_01', 50.5, 3.2, 40.4, 0, 2.4); model(s, 'antique_ceramic_vase_01', 63.5, 3.2, 40.4, 2, 2.4);
      model(s, 'antique_ceramic_vase_01', 33.5, 0, 87, 0, 3.6); model(s, 'antique_ceramic_vase_01', 80.5, 0, 41, 1, 3.6);
      model(s, 'vintage_cabinet_01', 100, 0, 39.6, 0, 3);
      model(s, 'fancy_picture_frame_01', 104.6, 7.0, 51, -Math.PI / 2, 4.2); parlor(s);
      model(s, 'ornate_mirror_01', 105.3, 6.0, 67.7, -Math.PI / 2, 3.4);
      model(s, 'chinese_commode', -33.4, 0, 22, Math.PI / 2, 2.6);
      model(s, 'wooden_bucket_01', 144, 0, 60, 0.3, 3); model(s, 'wooden_bucket_01', 145, 0, 63.5, 1.2, 2.8);
      model(s, 'wooden_lantern_01', 22, 0, 22, 0, 3); model(s, 'wooden_lantern_01', 52, 0, 27, 0.5, 3);
      model(s, 'chinese_console_table', 33, 0, 75, Math.PI / 2, 3);
      model(s, 'vintage_oil_lamp', -16, 3.4, 23, 0, 3);
      M.carpet(s, 84, 66, 97, 80, '#3a2a40', '#6b2a24', 0.04); M.carpet(s, 4, 44, 26, 60, '#3a3430', '#4a2a20', 0.04);
      model(s, 'brass_pot_01', 33, 2.0, 72, 0, 2.6); model(s, 'brass_vase_02', 33, 2.0, 78, 0, 2.6);
      model(s, 'brass_vase_03', 102.5, 3.05, 40.6, 0, 3); model(s, 'ceramic_vase_04', 104, 0, 62, 0, 3.2);
      model(s, 'treasure_chest', 98.75, 0, 75.4, Math.PI, 3); model(s, 'jug_01', 100.6, 2.7, 68.4, 0.6, 3); model(s, 'ceramic_vase_02', 104.4, 0, 88, 0, 3);
      model(s, 'wooden_crate_01', 20, 0, 85, 0.3, 3); model(s, 'brass_pot_01', 26, 0, 70, 0, 2.6);
      model(s, 'planter_pot_clay', 50, 0, 32, 0, 3.4); model(s, 'planter_pot_clay', 96, 0, 32, 1, 3.4); model(s, 'wooden_bucket_01', 118, 0, 33, 0.6, 3);
      model(s, 'wooden_crate_02', 121.5, 0, 86, 0, 3); model(s, 'jug_01', 115, 3.0, 85, 1, 3);
      model(s, 'pot_enamel_01', 140.7, 3.1, 43.2, 0, 3.4); model(s, 'brass_pot_01', 146, 3.1, 43.2, 0, 2.8);
      model(s, 'wooden_cutting_board', 127.8, 3.0, 54.5, 1.57, 3); model(s, 'wooden_bowl_01', 127.8, 3.0, 72, 0, 3);
      model(s, 'ceramic_pot', 147, 0, 74, 1.6, 3); model(s, 'ceramic_pot', 147, 0, 78.5, 1.2, 3); model(s, 'wooden_crate_01', 136, 0, 88.3, 0, 3);
      model(s, 'carved_wooden_plate', 139, 2.6, 65, 0, 3); model(s, 'wooden_bowl_01', 141, 2.6, 66, 0, 3);
      model(s, 'vintage_wooden_drawer_01', -15, 0, 30.4, Math.PI, 3); model(s, 'magnifying_glass_01', -16, 3.4, 19, 1.2, 3); model(s, 'Lantern_01', -16, 3.4, 13.5, 0, 3);
      model(s, 'wooden_crate_01', -33, 0, 10.5, 0, 3); model(s, 'wooden_crate_02', -33, 1.0, 10.5, 1.57, 2.6);
      [-28, -24, -20].forEach((x, i) => model(s, 'ceramic_pot', x, 0, 12.6, i, 2.2));
      model(s, 'wooden_crate_01', 24, 0, 26.5, 0.4, 3); model(s, 'wooden_bucket_01', 60.5, 0, 14, 0, 3);
      [110, 120, 130].forEach(x => model(s, 'planter_pot_clay', x, 0, 28, x, 3.6));
      model(s, 'Lantern_01', 52, 1.4, 92.6, 0, 3.2); model(s, 'Lantern_01', 62, 1.4, 92.6, 0, 3.2);
      model(s, 'planter_pot_clay', 30, 0, 98, 0, 3.6); model(s, 'planter_pot_clay', 84, 0, 98, 1, 3.6);
      hang(s, 'scroll', 105.4, 6, 50, -Math.PI / 2); hang(s, 'calli', 105.4, 6, 76, -Math.PI / 2, '花好月圓');
      hang(s, 'scroll', 30.6, 6, 70, Math.PI / 2);
      model(s, 'chinese_chandelier', 57, IH, 55, 0, 3); model(s, 'chinese_chandelier', 57, IH, 67, 0, 3); model(s, 'Chandelier_02', 94, IH - 3.2, 51, 0, 3.2); model(s, 'chinese_chandelier', 94, IH, 77, 0, 2.6);
      chandelier(s, 15, IH, 64, false); chandelier(s, -23, IH, 20, false);
      lampStand(s, 102.6, 3.9, 69);
    }
  }
  /* 人物：用同一副人体网格，按身份换衣帽、摆姿势 */
  function person(s, x, y, z, faceY, o = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = faceY; s.add(g);
    if (!gltfLoader) gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('3d/models/male_base.glb', gl => {
      const m = gl.scene, bones = {}; let mesh = null;
      m.traverse(q => { if (q.isBone) bones[q.name] = q; if (q.isSkinnedMesh) mesh = q; });
      const D = (k, v) => { const b = bones[k]; if (!b) return; m.updateMatrixWorld(true);
        if (Array.isArray(v)) { b.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...v.map(t => t * Math.PI / 180)))); return; }
        const wq = new THREE.Quaternion(); b.getWorldQuaternion(wq); const cy = new THREE.Vector3(0, 1, 0).applyQuaternion(wq);
        const nq = new THREE.Quaternion().setFromUnitVectors(cy, new THREE.Vector3(...v.d).normalize()).multiply(wq); const pq = new THREE.Quaternion(); b.parent.getWorldQuaternion(pq); b.quaternion.copy(pq.invert().multiply(nq)); };
      const POSES = {
        stand: [['upper_armL', { d: [0.05, -1, -0.18] }], ['upper_armR', { d: [0.05, -1, 0.18] }], ['forearmL', { d: [0.15, -1, -0.12] }], ['forearmR', { d: [0.15, -1, 0.12] }], ['spine005', [0, 0, -6]]],
        lantern: [['upper_armL', { d: [0.05, -1, -0.18] }], ['forearmL', { d: [0.2, -1, -0.1] }], ['upper_armR', { d: [0.35, -1, 0.15] }], ['forearmR', { d: [1, -0.15, 0.05] }], ['spine005', [0, 0, -8]], ['spine001', [4, 0, 0]]],
        counter: [['upper_armL', { d: [0.5, -1, -0.25] }], ['forearmL', { d: [1, -0.25, 0.05] }], ['upper_armR', { d: [0.5, -1, 0.25] }], ['forearmR', { d: [1, -0.25, -0.05] }], ['spine001', [8, 0, 0]], ['spine005', [0, 0, -12]]],
        stir: [['upper_armL', { d: [0.4, -1, -0.2] }], ['forearmL', { d: [1, -0.4, 0.1] }], ['upper_armR', { d: [0.5, -1, 0.3] }], ['forearmR', { d: [1, 0.1, -0.1] }], ['spine001', [10, 0, 0]], ['spine005', [0, 0, -18]]],
        rest: [['upper_armL', { d: [0.05, -1, -0.15] }], ['forearmL', { d: [0.15, -1, -0.1] }], ['upper_armR', { d: [-0.1, -1, 0.35] }], ['forearmR', { d: [0.6, 0.2, -0.6] }], ['spine005', [0, 12, -5]]],
      };
      (POSES[o.pose || 'stand'] || []).forEach(([k, v]) => D(k, v)); m.updateMatrixWorld(true);
      const skin = new THREE.MeshStandardMaterial({ color: o.skin || 0xd2a98a, roughness: 0.62, envMapIntensity: 0.4 }); skin.userData.look = 'skin'; mesh.material = skin; mesh.castShadow = !o.dyn;
      const geo = mesh.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight, idx = geo.index.array;
      const names = mesh.skeleton.bones.map(b => b.name);
      const part = n => /^(spine005|spine004)/.test(n) ? 'head' : /^(hand|f_|thumb|palm)/.test(n) ? 'hand' : /^(foot|toe|heel)/.test(n) ? 'foot' : /^(thigh|shin)/.test(n) ? 'leg' : /^(upper_arm|forearm)/.test(n) ? 'arm' : 'torso';
      const PB = names.map(part);
      const vpart = v => { const acc = {}; for (let k = 0; k < 4; k++) { const p2 = PB[si.getComponent(v, k)], w = sw.getComponent(v, k); acc[p2] = (acc[p2] || 0) + w; } return Object.keys(acc).sort((a, b) => acc[b] - acc[a])[0]; };
      const VP = []; for (let v = 0; v < pos.count; v++) VP.push(vpart(v));
      const shell = (parts, off, color, rough = 0.85) => { const g2 = geo.clone(), p2 = g2.attributes.position;
        for (let i = 0; i < pos.count; i++) p2.setXYZ(i, pos.getX(i) + nor.getX(i) * off, pos.getY(i) + nor.getY(i) * off, pos.getZ(i) + nor.getZ(i) * off);
        const ni = []; for (let t = 0; t < idx.length; t += 3) { const c = parts.includes(VP[idx[t]]) + parts.includes(VP[idx[t + 1]]) + parts.includes(VP[idx[t + 2]]); if (c >= (parts.length === 1 && parts[0] === 'foot' ? 3 : 1)) ni.push(idx[t], idx[t + 1], idx[t + 2]); }
        g2.setIndex(ni); const cm = new THREE.MeshPhysicalMaterial({ color, roughness: Math.max(0.8, rough), metalness: 0, sheen: 0.7, sheenRoughness: 0.75, sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.35), envMapIntensity: 0.3 }); cm.userData.look = 'cloth';
        if (rough < 0.6) { cm.roughness = 0.55; cm.sheen = 0; }   // 鞋子留一点光
        const sm = new THREE.SkinnedMesh(g2, cm); sm.bind(mesh.skeleton, mesh.bindMatrix); sm.castShadow = true; sm.frustumCulled = false; mesh.parent.add(sm); return sm; };
      const top = o.top || '#3a3a40', bottom = o.bottom || top;
      shell(['torso', 'arm'], 0.016, top); shell(['leg'], 0.014, bottom); shell(['foot'], 0.012, '#151210', 0.5);
      if (o.vest) shell(['torso'], 0.03, o.vest, 0.7);
      if (o.apron) shell(['torso'], 0.026, o.apron, 0.9);
      const pel = bones['spine'];
      if (o.gown && pel) {   // 长衫下摆：从腰垂到脚踝
        const gm = new THREE.MeshPhysicalMaterial({ color: top, roughness: 0.85, sheen: 0.7, sheenRoughness: 0.75, sheenColor: new THREE.Color(top).lerp(new THREE.Color(0xffffff), 0.35), side: THREE.DoubleSide, envMapIntensity: 0.3 }); gm.userData.look = 'cloth';
        const sk2 = new THREE.Mesh(new THREE.LatheGeometry(o.bun ? [[0.16, 0.08], [0.17, -0.2], [0.18, -0.6], [0.17, -0.92]].map(([a, b]) => new THREE.Vector2(a, b)) : [[0.17, 0.08], [0.2, -0.2], [0.24, -0.6], [0.27, -0.9]].map(([a, b]) => new THREE.Vector2(a, b)), 20), gm);
        sk2.scale.set(1, 1, 0.75); sk2.castShadow = true; pel.add(sk2); }
      const head = bones['spine005'];
      if (head) { const hm = new THREE.MeshStandardMaterial({ color: 0x17120f, roughness: 0.42, envMapIntensity: 0.5 }); hm.userData.look = 'hair';
        const H = (geo, m, x, y, z, rx = 0, sx = 1, sy = 1, sz = 1) => { const o2 = new THREE.Mesh(geo, m); o2.position.set(x, y, z); o2.rotation.x = rx; o2.scale.set(sx, sy, sz); head.add(o2); return o2; };
        if (!o.bald) {   // 头发：盖住头顶和后脑，额头露出来
          H(new THREE.SphereGeometry(0.118, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.56), hm, 0, 0.128, -0.012, -0.42, 1.04, 1.0, 1.1);
          if (o.bun) { H(new THREE.SphereGeometry(0.118, 20, 12, Math.PI, Math.PI, 0, Math.PI * 0.8), hm, 0, 0.124, -0.012, 0, 1.06, 1.04, 1.1);   // 后脑头发垂到颈
            H(new THREE.SphereGeometry(0.055, 14, 10), hm, 0, 0.04, -0.118, 0, 1.25, 0.9, 0.9); }   // 低发髻
        }
        if (o.hat === 'gua') { const hmat = new THREE.MeshStandardMaterial({ color: 0x0e0d0c, roughness: 0.4 });
          H(new THREE.SphereGeometry(0.124, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), hmat, 0, 0.15, -0.01, -0.12);
          H(new THREE.SphereGeometry(0.016, 8, 6), new THREE.MeshStandardMaterial({ color: 0xa01810 }), 0, 0.272, 0.0); }
        if (o.hat === 'straw') { const h = new THREE.Group(); h.position.set(0, 0.235, -0.01); head.add(h); const sm = new THREE.MeshStandardMaterial({ color: 0xc8a868, roughness: 0.9 });
          h.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.01, 20), sm)); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.08, 16), sm); c.position.y = 0.04; h.add(c); }
        { // 五官：眼白 + 瞳仁、眉、鼻、唇
          const white = new THREE.MeshStandardMaterial({ color: 0xece6dc, roughness: 0.35 }), iris = new THREE.MeshStandardMaterial({ color: 0x1a120c, roughness: 0.2 }), brow = new THREE.MeshStandardMaterial({ color: 0x1c1612, roughness: 0.7 });
          const lip = new THREE.MeshStandardMaterial({ color: o.bun ? 0x9a3a36 : 0x8a5a4c, roughness: 0.5 }); const sk = mesh.material;
          [-1, 1].forEach(e => { const xx = e * 0.036;
            H(new THREE.SphereGeometry(0.014, 12, 8), white, xx, 0.118, 0.088, 0, 1.25, 0.72, 0.5);
            H(new THREE.SphereGeometry(0.0078, 10, 8), iris, xx, 0.118, 0.0945, 0, 1, 1, 0.5);
            const b2 = H(new THREE.BoxGeometry(0.034, 0.0055, 0.01), brow, xx, 0.142, 0.093); b2.rotation.z = e * (o.bun ? -0.12 : -0.06); });
          H(new THREE.ConeGeometry(0.013, 0.04, 8), sk, 0, 0.094, 0.1, -1.15, 1, 1, 0.8);                    // 鼻
          H(new THREE.SphereGeometry(0.017, 12, 8), lip, 0, 0.062, 0.091, 0, 1.25, 0.38, 0.5);            // 唇
          if (o.mustache) H(new THREE.BoxGeometry(0.046, 0.008, 0.012), new THREE.MeshStandardMaterial({ color: 0x5a5448 }), 0, 0.075, 0.097); }
        if (o.glasses) { const gm2 = new THREE.MeshStandardMaterial({ color: 0x8a7a50, metalness: 0.8, roughness: 0.3 }); [-0.036, 0.036].forEach(xx => H(new THREE.TorusGeometry(0.02, 0.0028, 6, 18), gm2, xx, 0.118, 0.103));
          H(new THREE.BoxGeometry(0.03, 0.003, 0.003), gm2, 0, 0.12, 0.104); }
        if (o.gown || o.vest) { const cm2 = new THREE.MeshStandardMaterial({ color: o.top || '#333', roughness: 0.9 }); cm2.userData.look = 'cloth';   // 立领
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.074, 0.045, 18, 1, true), cm2); col.material.side = THREE.DoubleSide; col.position.set(0, -0.012, 0.004); head.add(col); }
      }
      if (o.pose === 'lantern' && bones['handR']) { m.updateMatrixWorld(true); const hp = new THREE.Vector3(); bones['handR'].getWorldPosition(hp); const lt = new THREE.Group(); lt.position.copy(hp); lt.position.y -= 0.02; m.add(lt);
        const pm = new THREE.MeshStandardMaterial({ color: 0xf0d8a8, emissive: 0xffa040, emissiveIntensity: 1.2, roughness: 0.8 });
        const bd = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), pm); bd.scale.set(1, 1.25, 1); bd.position.y = -0.16; lt.add(bd);
        [-0.05, -0.27].forEach(yy => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.025, 12), new THREE.MeshStandardMaterial({ color: 0x1a1210 })); c.position.y = yy; lt.add(c); });
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 6), new THREE.MeshStandardMaterial({ color: 0x3a2a1a })); st.position.y = -0.01; lt.add(st);
        const pl = new THREE.PointLight(0xffa850, 2.2, 9, 1.8); pl.position.y = -0.16; lt.add(pl);
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 4), new THREE.MeshStandardMaterial({ color: 0x2a1a10 })); cord.position.y = -0.02; lt.add(cord); }
      const S = o.h || 2.62; m.scale.setScalar(S); m.rotation.y = 0; m.position.y = 0; m.updateMatrixWorld(true); { const fp = new THREE.Vector3(), fp2 = new THREE.Vector3(); (bones['footL'] || m).getWorldPosition(fp); (bones['footR'] || m).getWorldPosition(fp2); m.position.y = 0.07 * S - Math.min(fp.y, fp2.y); m.updateMatrixWorld(true); }
      g.add(m); m.traverse(q => { if (q.isMesh) { q.frustumCulled = false; if (o.dyn) q.castShadow = false; } });
      g.userData.bones = bones; g.userData.base = {}; ['thighL', 'thighR', 'shinL', 'shinR', 'upper_armL', 'upper_armR'].forEach(k => { if (bones[k]) g.userData.base[k] = bones[k].quaternion.clone(); });
      V3.onModel && V3.onModel();
    });
    return g;
  }
  /* 人物（新）：Quaternius Universal Base Characters（CC0）+ Universal Animation Library 的站立、走路动作；
     按角色套衣服（长衫、旗袍、西式）、发型、帽子、眼镜。模型统一转成面朝 +x，和旧的 person() 一样用 faceY 转向。 */
  const QA = { p: null, clips: {} };
  function qAnims() {
    if (!gltfLoader) gltfLoader = new THREE.GLTFLoader();
    return QA.p || (QA.p = new Promise(res => gltfLoader.load('3d/models/qm_anim.glb', gl => { gl.animations.forEach(a => QA.clips[a.name] = a); res(QA.clips); }, undefined, () => res(QA.clips))));
  }
  const QPART = n => /^(Head|neck_01)$/.test(n) ? (n === 'Head' ? 'head' : 'neck') : /^(hand_|index|middle|pinky|ring|thumb)/.test(n) ? 'hand' : /^(foot_|ball_)/.test(n) ? 'foot' : /^(thigh_|calf_)/.test(n) ? 'leg' : /^(upperarm_|lowerarm_)/.test(n) ? 'arm' : 'torso';
  function fabric(color, rough = 0.9) {
    const m = new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, sheen: 0.6, sheenRoughness: 0.75, sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.3), envMapIntensity: 0.3, side: THREE.DoubleSide });
    m.userData.look = 'cloth'; return m;
  }
  function avatar(s, x, y, z, faceY, o = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = faceY; g.userData.nomerge = 1; s.add(g);
    if (!gltfLoader) gltfLoader = new THREE.GLTFLoader();
    const female = !!o.bun, MH = !!o.mh;   // MH：MakeHuman 写实亚洲人（CC0）；否则 Quaternius
    const file = MH ? 'mh_' + o.mh : (female ? 'qm_female' : 'qm_male');
    const RIG = MH ? { head: 'head', pelvis: 'root', handR: 'wrist.R' } : { head: 'Head', pelvis: 'pelvis', handR: 'hand_r' };
    Promise.all([new Promise((res, rej) => gltfLoader.load('3d/models/' + file + '.glb', res, undefined, rej)), MH ? Promise.resolve(null) : qAnims()]).then(([gl, clips0]) => {
      const clips = MH ? Object.fromEntries(gl.animations.map(a => [a.name, a])) : clips0;
      const m = gl.scenes[0], bones = {}; let body = null;
      m.traverse(q => { if (q.isBone) bones[q.name] = q; if (q.isSkinnedMesh && (MH ? q.material && q.material.name === 'skin' : (!body || q.geometry.attributes.position.count > body.geometry.attributes.position.count))) body = q; });
      if (!body) throw new Error('no body');
      m.updateMatrixWorld(true);
      const bb0 = new THREE.Box3().setFromObject(body), U = (bb0.max.y - bb0.min.y) / 1.75;   // 1 米折多少模型单位
      const head = bones[RIG.head], V = new THREE.Vector3(), V2 = new THREE.Vector3();
      const hairBox = new THREE.Box3();
      if (MH) { m.traverse(q => { if (q.isMesh && q.material) { const n = q.material.name; q.material.userData.look = n === 'skin' ? 'skin' : 'hair'; if (n === 'hair') { if (o.hairColor) q.material.color.set(o.hairColor); hairBox.expandByObject(q); } q.castShadow = !o.dyn; } }); }
      else {   // Quaternius：头发在静止姿态下挂到头骨上
        const hs = gl.scenes[female ? (o.hair === 'buns' ? 2 : 1) : 1];
        if (hs && head) { hs.updateMatrixWorld(true); const list = []; hs.traverse(q => { if (q.isMesh) list.push(q); });
          list.forEach(q => { hairBox.expandByObject(q); q.material = q.material.clone(); q.material.color.set(o.hairColor || 0x3a2a20); q.material.userData.look = 'hair'; q.castShadow = !o.dyn; head.attach(q); }); }
        m.traverse(q => { if (q.isMesh && q !== body && q.material && /Hair/.test(q.material.name || '')) { q.material = q.material.clone(); q.material.color.set(o.hairColor || 0x3a2a20); q.material.userData.look = 'hair'; } });
        body.material.userData.look = 'skin';
      }
      // 衣服：把身体网格沿法线外扩一层，只留对应部位的三角形
      const geo = body.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight, idx = geo.index.array;
      const partMH = b => { for (let q = b; q && q.isBone; q = q.parent) { const n = q.name; if (n === 'head') return 'head'; if (/^neck0/.test(n)) return 'neck'; if (/^(wrist|finger|metacarpal)/.test(n)) return 'hand'; if (/^(foot|toe)/.test(n)) return 'foot'; if (/^(upperleg|lowerleg)/.test(n)) return 'leg'; if (/^(upperarm|lowerarm)/.test(n)) return 'arm'; } return 'torso'; };
      const PB = body.skeleton.bones.map(b => MH ? partMH(b) : QPART(b.name)), VP = new Array(pos.count);
      const CMP = (at, i, k) => k === 0 ? at.getX(i) : k === 1 ? at.getY(i) : k === 2 ? at.getZ(i) : at.getW(i);
      for (let v = 0; v < pos.count; v++) { const acc = {}; for (let k = 0; k < 4; k++) { const p2 = PB[CMP(si, v, k)], w = CMP(sw, v, k); acc[p2] = (acc[p2] || 0) + w; } let best = null, bw = -1; for (const k in acc) if (acc[k] > bw) { bw = acc[k]; best = k; } VP[v] = best; }
      const NX = (i, k) => k === 0 ? nor.getX(i) : k === 1 ? nor.getY(i) : nor.getZ(i);
      geo.computeBoundingBox(); const LS = U / ((geo.boundingBox.max.y - geo.boundingBox.min.y) / 1.75 || U);   // 量化过的网格带缩放：外扩量按网格自己的单位算
      const shell = (parts, off, mat, need = 1) => { const g2 = new THREE.BufferGeometry(), p2 = new Float32Array(pos.count * 3); off *= U / LS;
        for (let i = 0; i < pos.count; i++) { p2[i * 3] = pos.getX(i) + NX(i, 0) * off; p2[i * 3 + 1] = pos.getY(i) + NX(i, 1) * off; p2[i * 3 + 2] = pos.getZ(i) + NX(i, 2) * off; }
        g2.setAttribute('position', new THREE.BufferAttribute(p2, 3)); g2.setAttribute('normal', nor); g2.setAttribute('skinIndex', si); g2.setAttribute('skinWeight', sw); if (geo.attributes.uv) g2.setAttribute('uv', geo.attributes.uv);
        const ni = []; for (let t = 0; t < idx.length; t += 3) { const c = parts.includes(VP[idx[t]]) + parts.includes(VP[idx[t + 1]]) + parts.includes(VP[idx[t + 2]]); if (c >= need) ni.push(idx[t], idx[t + 1], idx[t + 2]); }
        g2.setIndex(ni); const sm = new THREE.SkinnedMesh(g2, mat); sm.bind(body.skeleton, body.bindMatrix); sm.castShadow = !o.dyn; sm.frustumCulled = false; body.parent.add(sm); return sm; };
      const top = o.top || '#3a3a40', bottom = o.bottom || top, gown = !!o.gown;
      shell((gown || female) && !MH ? ['torso', 'arm', 'neck'] : ['torso', 'arm'], gown ? 0.022 : 0.017, fabric(top), gown || female ? 2 : 1);
      shell(['leg'], 0.009, fabric(female && !o.bottom ? '#2a2522' : bottom));
      shell(['foot'], 0.012, new THREE.MeshStandardMaterial({ color: female ? 0x2a1a14 : 0x141110, roughness: 0.45 }), 1);
      if (o.vest) shell(['torso'], 0.03, fabric(o.vest, 0.8));
      if (o.apron) shell(['torso'], 0.028, fabric(o.apron));
      // 长衫、旗袍下摆：从腰垂到脚踝，挂在骨盆上
      const pel = bones[RIG.pelvis];
      if (gown && pel) { pel.getWorldPosition(V); const bb = bb0; const ankle = bb.min.y + 0.1 * (bb.max.y - bb.min.y), hip = V.y + 0.06 * U;
        const H = hip - ankle, R = (female ? [0.16, 0.17, 0.18, 0.2] : [0.17, 0.21, 0.25, 0.28]).map(r => r * U);
        const sk = new THREE.Mesh(new THREE.LatheGeometry([[R[0], 0], [R[1], -H * 0.3], [R[2], -H * 0.7], [R[3], -H]].map(([a, b]) => new THREE.Vector2(a, b)), 24), fabric(top));
        sk.position.set(V.x, hip, V.z); sk.scale.set(1, 1, 0.78); sk.castShadow = !o.dyn; m.add(sk); pel.attach(sk); }
      // 朝向：MakeHuman 面朝 +z；Quaternius 看脚尖方向
      let fx = 0, fz = 1;
      if (!MH) { const bl = bones['ball_l'], fl = bones['foot_l']; if (bl && fl) { bl.getWorldPosition(V2); const a = V2.clone(); fl.getWorldPosition(V2); fx = a.x - V2.x; fz = a.z - V2.z; const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l; } }
      // 帽子、眼镜：在静止姿态里算好位置，挂到头骨上
      if (head) { head.getWorldPosition(V); const topY = hairBox.isEmpty() ? V.y + 0.22 * U : hairBox.max.y;
        if (o.hat === 'gua') { const h = new THREE.Mesh(new THREE.SphereGeometry((MH ? 0.1 : 0.118) * U, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), new THREE.MeshStandardMaterial({ color: 0x0e0d0c, roughness: 0.45 })); h.material.userData.look = 'hair';
          const hb = hairBox.isEmpty() ? null : hairBox.getCenter(new THREE.Vector3()); h.position.set(hb ? hb.x : V.x, topY - (MH ? 0.085 : 0.075) * U, hb ? hb.z : V.z); h.scale.set(1, 0.9, 1.08); m.add(h); head.attach(h);
          const kn = new THREE.Mesh(new THREE.SphereGeometry(0.017 * U, 8, 6), new THREE.MeshStandardMaterial({ color: 0xa01810 })); kn.position.set(h.position.x, h.position.y + (MH ? 0.1 : 0.118) * U * 0.88, h.position.z); m.add(kn); head.attach(kn); }
        if (o.glasses) { const eb = new THREE.Box3(); m.traverse(q => { if (q.isMesh && /^(eye|MI_Eyes)/i.test((q.material && q.material.name) || '')) eb.expandByObject(q); });
          if (!eb.isEmpty()) { eb.getCenter(V2); const gm2 = new THREE.MeshStandardMaterial({ color: 0x8a7a50, metalness: 0.8, roughness: 0.3 }); gm2.userData.look = 'hair'; const side = new THREE.Vector3(fz, 0, -fx), hw = (eb.max.x - eb.min.x) / 2;
            [-1, 1].forEach(e => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.021 * U, 0.003 * U, 6, 18), gm2); const sx = MH ? hw * 0.72 : 0.033 * U;
              r.position.set(V2.x + side.x * e * sx + fx * 0.045 * U, V2.y + 0.004 * U, V2.z + side.z * e * sx + fz * 0.045 * U); r.lookAt(r.position.x + fx, r.position.y, r.position.z + fz); m.add(r); head.attach(r); }); } }
      }
      // 统一朝向 +x、按身高缩放、脚踩地
      const wrap = new THREE.Group(); wrap.add(m); wrap.rotation.y = Math.atan2(fz, fx);
      const S = (o.h ? o.h * 1.78 : (female ? 4.35 : 4.65)) / (bb0.max.y - bb0.min.y), side = Math.abs(fz) >= Math.abs(fx), slim = MH ? 1 : 0.86, slim2 = MH ? 1 : 0.93;   // Quaternius 是“超级英雄”身材，收一收
      wrap.scale.set(S * (side ? slim : slim2), S, S * (side ? slim2 : slim)); wrap.position.y = -bb0.min.y * S;
      g.add(wrap);
      if (o.pose === 'lantern' && bones[RIG.handR]) { const lt = new THREE.Group(); const hp = new THREE.Vector3(); wrap.updateMatrixWorld(true); bones[RIG.handR].getWorldPosition(hp); g.worldToLocal(hp);
        const pm = new THREE.MeshStandardMaterial({ color: 0xf0d8a8, emissive: 0xffa040, emissiveIntensity: 1.2, roughness: 0.8 }); pm.userData.look = 'skin';
        const bd = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), pm); bd.scale.set(1, 1.25, 1); bd.position.y = -0.42; lt.add(bd);
        const pl = new THREE.PointLight(0xffb060, 2.2, 9, 1.8); pl.position.y = -0.42; lt.add(pl); lt.position.copy(hp); g.add(lt); bones[RIG.handR].attach(lt); }
      m.traverse(q => { if (q.isMesh) { q.frustumCulled = false; if (o.dyn) q.castShadow = false; } });
      // 动作
      const mixer = new THREE.AnimationMixer(m), A = n => clips[n] ? mixer.clipAction(clips[n]) : null;
      const idle = MH ? A(o.pose === 'lantern' ? 'torch' : 'idle') : A(o.pose === 'lantern' ? 'Idle_Torch_Loop' : 'Idle_Loop');
      const walk = MH ? A(female ? 'walkF' : 'walk') : A(female ? 'Walk_Loop' : 'Walk_Formal_Loop');
      if (idle) { idle.play(); idle.time = Math.random() * 2; }
      mixer.update(0.01);
      g.userData.anim = { mixer, idle, walk, walking: false, still: !o.dyn };
      V3.onModel && V3.onModel();
    }).catch(e => { console.warn('avatar fallback', e); person(s, x, y, z, faceY, o); s.remove(g); });
    return g;
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
  /* 平面收紧：位置按 K 缩，墙地顶这类结构件连长宽一起缩，家具、摆件保持原尺寸 */
  function compress(s) {
    const bb = new THREE.Box3(), sz = new THREE.Vector3();
    const isStruct = o => { if (o.userData.struct || o.userData.wall) return true; bb.setFromObject(o); if (bb.isEmpty()) return false; bb.getSize(sz); return Math.max(sz.x, sz.z) > 12; };
    const walk = list => list.slice().forEach(o => {
      if (o.userData.noscale || o.isHemisphereLight || o.isAmbientLight) return;
      if ((o.isGroup || o.type === 'Object3D') && !o.userData.struct && Math.abs(o.position.x) < 1e-6 && Math.abs(o.position.z) < 1e-6 && o.children.length > 1) { walk(o.children); return; }
      if (!o.isLight && isStruct(o)) {   // 结构件：套一层按世界坐标缩放的壳，躺倒的地板、天花也缩得对
        const par = o.parent, w = new THREE.Group(); w.scale.set(K, 1, K); w.userData.struct = 1; w.userData.wrap = 1; par.add(w); w.add(o); return; }
      o.position.x *= K; o.position.z *= K;
    });
    walk(s.children);
    // 收紧以后贴墙的家具会嵌进墙里：沿墙的法线把它推出来
    s.updateMatrixWorld(true);
    const walls = []; s.traverse(o => { if (o.isMesh && o.userData.wall) walls.push(new THREE.Box3().setFromObject(o)); });
    const items = []; const pick = list => list.forEach(o => { if (o.userData.noscale || o.isLight) return; if ((o.isGroup || o.type === 'Object3D') && !o.userData.struct && o.children.length > 1 && Math.abs(o.position.x) < 1e-6 && Math.abs(o.position.z) < 1e-6) { pick(o.children); return; } if (!o.userData.struct && !o.userData.wall) items.push(o); });
    pick(s.children);
    const b = new THREE.Box3(), c = new THREE.Vector3(), wc = new THREE.Vector3();
    items.forEach(o => { for (let it = 0; it < 2; it++) { b.setFromObject(o); if (b.isEmpty()) return; b.getSize(sz); if (Math.max(sz.x, sz.z) > 12) return; b.getCenter(c); let mx = 0, mz = 0;
      walls.forEach(w => { if (!b.intersectsBox(w)) return; const iy = Math.min(b.max.y, w.max.y) - Math.max(b.min.y, w.min.y); if (iy < 0.3) return; w.getCenter(wc);
        const thinX = (w.max.x - w.min.x) < (w.max.z - w.min.z);
        if (thinX) { const pen = c.x > wc.x ? w.max.x - b.min.x : b.max.x - w.min.x; const ov = Math.min(b.max.z, w.max.z) - Math.max(b.min.z, w.min.z); if (pen > 0.02 && pen < 2.5 && ov > 0.3) { const d = (c.x > wc.x ? 1 : -1) * (pen + 0.03); if (Math.abs(d) > Math.abs(mx)) mx = d; } }
        else { const pen = c.z > wc.z ? w.max.z - b.min.z : b.max.z - w.min.z; const ov = Math.min(b.max.x, w.max.x) - Math.max(b.min.x, w.min.x); if (pen > 0.02 && pen < 2.5 && ov > 0.3) { const d = (c.z > wc.z ? 1 : -1) * (pen + 0.03); if (Math.abs(d) > Math.abs(mz)) mz = d; } } });
      if (!mx && !mz) return; o.position.x += mx; o.position.z += mz; o.updateMatrixWorld(true); } });
  }
  /* 门口让路：家具挡在门里外 4.5 以内的通道上，就往旁边或屋里挪一点（线索点跟着挪） */
  function clearDoors(s, f) {
    const y0 = f === 2 ? F2 : 0, rooms = new Set((HOT[f] || []).map(h => h.loc)), bb = new THREE.Box3(), sz = new THREE.Vector3();
    s.updateMatrixWorld(true);
    const walls = []; s.traverse(o => { if (o.isMesh && o.userData.wall) walls.push(new THREE.Box3().setFromObject(o)); });
    const items = [];
    const pick = list => list.forEach(o => {
      if (o.isLight || o.isPoints || o.userData.noscale || o.userData.struct || o.userData.wall || o.userData.fixed) return;
      if ((o.isGroup || o.type === 'Object3D') && o.children.length > 1 && Math.abs(o.position.x) < 1e-6 && Math.abs(o.position.z) < 1e-6) { pick(o.children); return; }
      bb.setFromObject(o); if (bb.isEmpty()) return; bb.getSize(sz);
      if (Math.max(sz.x, sz.z) > 14 || sz.y < 0.7 || bb.max.y < y0 + 0.5 || bb.min.y > y0 + 4.6) return;
      if (o.isMesh && o.geometry && o.geometry.type === 'BoxGeometry' && bb.min.y < y0 + 0.3 && bb.max.y <= y0 + 1.5) return;   // 能踩上去的台阶
      items.push(o); });
    pick(s.children);
    const PRm = 0.85, moved = [];
    DOORS.forEach(d => {
      if (!rooms.has(d[0]) || !rooms.has(d[2])) return;
      const a = d[4], c = d[5]; let ux = c[0] - a[0], uz = c[2] - a[2]; const L = Math.hypot(ux, uz); if (L < 0.5 || L > 3) return; ux /= L; uz /= L;
      const cx = (a[0] + c[0]) / 2 * K, cz = (a[2] + c[2]) / 2 * K, lx = -uz, lz = ux, HW = 2.0 * K + PRm, AL = 4.5 * K + PRm;
      items.forEach(o => {
        bb.setFromObject(o); const cs = [[bb.min.x, bb.min.z], [bb.max.x, bb.min.z], [bb.min.x, bb.max.z], [bb.max.x, bb.max.z]];
        const pr = (vx, vz) => { let a0 = 1e9, a1 = -1e9, l0 = 1e9, l1 = -1e9; cs.forEach(([x, z]) => { const dx = x - cx, dz = z - cz, al = dx * vx + dz * vz, lt = dx * lx + dz * lz; if (al < a0) a0 = al; if (al > a1) a1 = al; if (lt < l0) l0 = lt; if (lt > l1) l1 = lt; }); return [a0, a1, l0, l1]; };
        const [a0, a1, l0, l1] = pr(ux, uz);
        if (a1 < -AL || a0 > AL || l1 < -HW || l0 > HW) return;           // 不在通道上
        const hang = bb.min.y > y0 + 1.5;
        const opts = [[HW - l0 + 0.05, lx, lz], [-(l1 + HW) - 0.05, lx, lz]];   // 往两边让
        if (!hang) { if (a0 > 0) opts.push([AL - a0 + 0.05, ux, uz]); else if (a1 < 0) opts.push([-(a1 + AL) - 0.05, ux, uz]); }   // 往屋里退
        opts.sort((p, q) => Math.abs(p[0]) - Math.abs(q[0]));
        for (const [m, vx, vz] of opts) {
          if (Math.abs(m) > 4.2) continue;
          const nb = bb.clone().translate(new THREE.Vector3(vx * m, 0, vz * m)); nb.expandByScalar(-0.05);
          if (walls.some(w => w.intersectsBox(nb))) continue;
          o.position.x += vx * m; o.position.z += vz * m; o.updateMatrixWorld(true);
          moved.push([bb.clone(), vx * m, vz * m]); break;
        }
      });
    });
    // 线索点跟着家具挪
    Object.keys(SP).forEach(l => { if (!rooms.has(l)) return; SP[l].forEach(sp => { const x = sp.at[0] * K, z = sp.at[2] * K; const m = moved.find(([b]) => x >= b.min.x - 0.3 && x <= b.max.x + 0.3 && z >= b.min.z - 0.3 && z <= b.max.z + 0.3 && sp.at[1] >= b.min.y - 0.5 && sp.at[1] <= b.max.y + 0.8);
      if (m) { sp.at = [sp.at[0] + m[1] / K, sp.at[1], sp.at[2] + m[2] / K]; } }); });
    return moved.length;
  }
  async function buildHouse(renderer) {
    await realTex();
    const s = new THREE.Scene();
    LOOK.fog(s, 0x16191f, 0.005);
    interior(() => { SCENE.buildHouse(s); oldShop(s); }, 1);
    if (renderer) s.environment = LOOK.env(renderer);
    // 天花：一楼在楼梯井处留洞，二楼整块
    cutHole([-0.5, 29.5, 150.5, 90.5]).forEach(([x0, z0, x1, z1]) => { const ce = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.4, z1 - z0), IM.ceil); ce.position.set((x0 + x1) / 2, IH + 0.2, (z0 + z1) / 2); ce.castShadow = ce.receiveShadow = true; s.add(ce); });
    { const ce = new THREE.Mesh(new THREE.BoxGeometry(151, 0.4, 61), IM.ceil); ce.position.set(75, F2 + IH + 0.2, 60); ce.castShadow = ce.receiveShadow = true; s.add(ce); }
    { const c2 = new THREE.Mesh(new THREE.BoxGeometry(27, 0.4, 25), IM.ceil); c2.position.set(-23, IH + 0.2, 20); c2.castShadow = true; s.add(c2); }
    M.box(s, 152, 0.3, 4, 75, F2 + IH + 0.2, 92, '#2a2420');
    { const oc = M.carpet; if (CARPET) M.carpet = CARPET; try { decorate(s, 1); roomsDeco(s, 1); decorate(s, 2); roomsDeco(s, 2); } finally { M.carpet = oc; } }
    ceilings(s, 1); ceilings(s, 2); outdoor(s, 1); woodUV(s);
    // 布光：天光、月光两层共用；各层吊灯、聚光只在人所在那层打开
    s.add(new THREE.HemisphereLight(0xbfcbe0, 0x46474c, 0.62));
    LOOK.moon(s, 75, 60, 150);
    LOOK.keyLight(s, 57, IH - 0.8, 61, 57, 0, 61, { intensity: 210, distance: 26, angle: 1.0 }); LOOK.keyLight(s, 94, IH - 0.8, 51, 94, 0, 51, { intensity: 130, distance: 18, angle: 0.95 });
    LOOK.keyLight(s, 71.8, F2 + 3.55, 75.9, 74.5, F2 + 2.6, 78, { intensity: 70, distance: 11, angle: 1.15, color: 0xfff0dc }); LOOK.keyLight(s, 25, F2 + IH - 0.8, 75, 25, F2, 75, { intensity: 75, distance: 20, angle: 1.0 });
    { const du = LOOK.dust(); s.add(du); s.userData.dust = du; }
    [[ROOMS1, 0], [ROOMS2, F2]].forEach(([R, y0]) => R.forEach(([x, z]) => { const k = DIM[x + ',' + z] ?? 1; const l = new THREE.PointLight(0xfff1e6, 54 * k, 32, 1.6); l.position.set(x, y0 + IH - 4.2, z); s.add(l); }));
    { const l = new THREE.PointLight(0xffe2b8, 22, 12, 1.5); l.position.set(71.8, F2 + 4.3, 75.9); s.add(l); }
    // 人物（模型面朝 +x，faceY 让它转向）：老号伙计、前院车夫、前厅老周、厨房厨娘
    avatar(s, -23, 0, 12.4, -Math.PI / 2, { mh: 'm_mid', pose: 'counter', top: '#4a4236', vest: '#1e1c1a', hat: 'gua', glasses: true });
    avatar(s, 70.5, 0, 101.5, Math.PI * 0.75, { mh: 'm_young', pose: 'rest', top: '#2e3e58', bottom: '#22262c', hat: 'straw' });
    avatar(s, 34.5, 0, 83.5, Math.PI * 0.2, { mh: 'm_old', pose: 'lantern', top: '#5a5a56', vest: '#151413', gown: 1, hat: 'gua', mustache: 1 });
    avatar(s, 140.7, 0, 47.4, Math.PI / 2, { mh: 'f_mid', pose: 'stir', top: '#3a4a5a', bottom: '#2a2a2e', apron: '#d8d0c0', bun: 1, h: 2.45 });
    { const lt = new THREE.PointLight(0xffa850, 60, 26, 1.6); lt.position.set(40, 6, 104); s.add(lt); const lt2 = new THREE.PointLight(0xffa850, 40, 22, 1.6); lt2.position.set(17, 7, 21); s.add(lt2); }
    compress(s);
    clearDoors(s, 1); clearDoors(s, 2);
    LOOK.upgrade(s);
    s.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.envMapIntensity !== undefined && m !== IM.brass) m.envMapIntensity = 0.7; }); });
    if (LOOK.mobile) { const rm = []; s.traverse(o => { if (o.isPointLight && o.intensity < 12) rm.push(o); if (o.isSpotLight) o.castShadow = false; }); rm.forEach(o => o.parent.remove(o)); }   // 手机：小装饰灯去掉，聚光不投影，只留月光的阴影
    // 按层分组室内灯（院子、街上的灯常亮）；两组凑成一样多，换层时着色器不用重编
    const FL = { 1: [], 2: [] }, wp = new THREE.Vector3(); s.updateMatrixWorld(true);
    s.traverse(o => { if (!(o.isPointLight || o.isSpotLight)) return; o.getWorldPosition(wp); const px = wp.x / K, pz = wp.z / K;
      if (px < 0 || px > 150 || pz < 30 || pz > 90) return; (wp.y < F2 - 0.5 ? FL[1] : FL[2]).push(o); });
    const cnt = (L, t) => L.filter(o => o[t]).length;
    [1, 2].forEach(f => { const o2 = f === 1 ? 2 : 1; for (let i = cnt(FL[f], 'isPointLight'); i < cnt(FL[o2], 'isPointLight'); i++) { const d = new THREE.PointLight(0, 0, 1); d.userData.noscale = 1; s.add(d); FL[f].push(d); } });
    s.userData.FL = FL;
    if (V3._colRaw) s.userData.colStatic = { 1: V3._colRaw(s, 1), 2: V3._colRaw(s, 2) };   // 合批前把碰撞算好
    mergeStatic(s);
    return s;
  }
  /* 合批：把静止的零件按材质、按区域（18×18 一格、分上下层）合成一个网格，几千次绘制降到几百次 */
  function mergeStatic(s) {
    s.updateMatrixWorld(true);
    const groups = new Map(), c = new THREE.Vector3(), ws = new THREE.Vector3();
    const skip = o => { for (let q = o; q; q = q.parent) if (q.userData && (q.userData.glb || q.userData.avatar || q.userData.nomerge)) return true; return false; };
    s.traverse(o => {
      if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || Array.isArray(o.material) || !o.visible || !o.material) return;
      const g = o.geometry; if (!g || !g.attributes.position || g.morphAttributes.position) return;
      const keys = Object.keys(g.attributes).sort().join(','); if (keys !== 'normal,position,uv' && keys !== 'normal,position') return;
      if (!g.boundingSphere) g.computeBoundingSphere(); o.getWorldScale(ws); if (g.boundingSphere.radius * Math.max(ws.x, ws.y, ws.z) > 30) return;
      if (skip(o)) return;
      o.getWorldPosition(c); const cell = Math.floor(c.x / 18) + ',' + Math.floor(c.z / 18) + ',' + (c.y > F2 - 0.5 ? 1 : 0);
      const key = o.material.uuid + '|' + keys + '|' + cell + '|' + (o.castShadow ? 1 : 0) + (o.receiveShadow ? 1 : 0) + '|' + o.renderOrder;
      let L = groups.get(key); if (!L) groups.set(key, L = []); L.push(o);
    });
    const v = new THREE.Vector3(), nm = new THREE.Matrix3(); let merged = 0, removed = 0;
    groups.forEach(list => {
      if (list.length < 2) return;
      let nv = 0, ni = 0; list.forEach(o => { const g = o.geometry; nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
      const hasUV = !!list[0].geometry.attributes.uv, P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), U = hasUV ? new Float32Array(nv * 2) : null, I = new (nv > 65535 ? Uint32Array : Uint16Array)(ni);
      let vo = 0, io = 0;
      list.forEach(o => { const g = o.geometry, p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv, mw = o.matrixWorld; nm.getNormalMatrix(mw); const flip = mw.determinant() < 0;
        for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(mw); P[(vo + i) * 3] = v.x; P[(vo + i) * 3 + 1] = v.y; P[(vo + i) * 3 + 2] = v.z;
          v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); N[(vo + i) * 3] = v.x; N[(vo + i) * 3 + 1] = v.y; N[(vo + i) * 3 + 2] = v.z;
          if (U) { U[(vo + i) * 2] = uv.getX(i); U[(vo + i) * 2 + 1] = uv.getY(i); } }
        const cnt = g.index ? g.index.count : p.count, get = g.index ? (i => g.index.getX(i)) : (i => i);
        for (let i = 0; i < cnt; i += 3) { const a = get(i), b = get(i + 1), d = get(i + 2); I[io++] = vo + a; if (flip) { I[io++] = vo + d; I[io++] = vo + b; } else { I[io++] = vo + b; I[io++] = vo + d; } }
        vo += p.count; });
      const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(P, 3)); mg.setAttribute('normal', new THREE.BufferAttribute(N, 3)); if (U) mg.setAttribute('uv', new THREE.BufferAttribute(U, 2)); mg.setIndex(new THREE.BufferAttribute(I, 1)); mg.computeBoundingSphere(); mg.computeBoundingBox();
      const m = new THREE.Mesh(mg, list[0].material); m.castShadow = list[0].castShadow; m.receiveShadow = list[0].receiveShadow; m.renderOrder = list[0].renderOrder; m.userData.merged = 1; m.userData.noscale = 1; s.add(m);
      list.forEach(o => { if (o.parent) o.parent.remove(o); }); merged++; removed += list.length;
    });
    // 空掉的组也清掉，少遍历
    const empties = []; s.traverse(o => { if ((o.isGroup || o.type === 'Object3D') && !o.children.length && !o.userData.glb && !o.userData.avatar && !o.userData.nomerge && o.parent) empties.push(o); }); empties.forEach(o => o.parent.remove(o));
    s.userData.mergeStat = [merged, removed];
  }
  function floorLights(s, f) { const FL = s && s.userData.FL; if (!FL) return; FL[1].forEach(l => l.visible = f === 1); FL[2].forEach(l => l.visible = f === 2); }
  // 机位：look = 初始朝向点
  const VP = {
    '前厅': [{ f: 1, at: [45, 85], look: [60, 50], n: '大门内' }, { f: 1, at: [66, 45.5], look: [50, 72], n: '主位边' }, { f: 1, at: [39, 62], look: [60, 66], n: '西侧' }, { f: 1, at: [76, 76], look: [45, 58], n: '东侧' }],
    '客厅': [{ f: 1, at: [88, 56], look: [100, 44], n: '沙发边' }, { f: 1, at: [100, 47], look: [86, 58], n: '陈列柜前' }],
    '一楼东厢（顾雪芝）': [{ f: 1, at: [87.5, 76], look: [101, 70], n: '屋里' }, { f: 1, at: [96, 71], look: [86, 86], n: '妆台边' }],
    '西厢': [{ f: 1, at: [22, 54], look: [9, 72], n: '屋里' }, { f: 1, at: [16, 80], look: [24, 44], n: '南窗下' }],
    '后廊': [{ f: 1, at: [20, 34], look: [70, 34], n: '西段' }, { f: 1, at: [73, 34.5], look: [73, 28], n: '后门内' }, { f: 1, at: [100, 34], look: [40, 34], n: '东段' }],
    '楼梯': [{ f: 1, at: [120, 41.5], look: [113, 50], n: '楼梯口' }],
    '下人房': [{ f: 1, at: [115, 70], look: [115, 86], n: '屋里' }],
    '厨房': [{ f: 1, at: [133, 80], look: [142, 46], n: '条案边' }, { f: 1, at: [134, 47], look: [130, 80], n: '灶台前' }],
    '后院': [{ f: 1, at: [52, 24], look: [64, 11], n: '井边' }, { f: 1, at: [30, 25], look: [12, 10], n: '柴房前' }, { f: 1, at: [90, 22], look: [40, 14], n: '东头' }],
    '老号（公馆后门外三十步）': [{ f: 1, at: [-23, 29.5], look: [-19, 13], n: '进门' }, { f: 1, at: [-24, 17], look: [-14, 24], n: '药柜前' }],
    '前院': [{ f: 1, at: [70, 110], look: [40, 104], n: '院中' }, { f: 1, at: [57, 98], look: [57, 112], n: '台阶下' }],
    '二楼走廊': [{ f: 2, at: [14, 56], look: [60, 56], n: '西头' }, { f: 2, at: [66, 55.5], look: [59, 60], n: '书房门外' }, { f: 2, at: [120.5, 57.5], look: [60, 56], n: '楼梯口' }, { f: 2, at: [138, 56], look: [60, 56], n: '东头' }],
    '书房': [{ f: 2, at: [76, 66], look: [76.5, 80], n: '书桌前' }, { f: 2, at: [93, 74], look: [72, 78], n: '落地窗边' }, { f: 2, at: [59.5, 64.5], look: [84, 84], n: '门口' }, { f: 2, at: [60, 85], look: [85, 70], n: '南窗下' }],
    '西头卧房（沈伯衡）': [{ f: 2, at: [40, 71], look: [18, 70], n: '屋里' }, { f: 2, at: [22, 85], look: [40, 66], n: '南窗下' }],
    '东头空客房': [{ f: 2, at: [111, 71], look: [128, 80], n: '门口' }, { f: 2, at: [131, 79], look: [110, 66], n: '南窗下' }],
    '沈景行房': [{ f: 2, at: [40, 44], look: [10, 38], n: '屋里' }],
    '二老爷旧房': [{ f: 2, at: [70, 46], look: [90, 36], n: '屋里' }, { f: 2, at: [96, 44], look: [60, 38], n: '窗边' }],
    '露台': [{ f: 2, at: [24, 96], look: [90, 94], n: '西段' }, { f: 2, at: [90, 98], look: [91, 90], n: '落地窗外' }, { f: 2, at: [128, 97], look: [80, 95], n: '东段' }],
  };
  // 门：[房间A, A 落脚机位, 房间B, B 落脚机位, A 侧标记位置, B 侧标记位置, A→B 说明, B→A 说明]
  const DOORS = [
    ['前厅', 2, '西厢', 0, [30.6, 3, 49.8], [29.4, 3, 49.8]],
    ['前厅', 1, '客厅', 0, [81.4, 3, 46.8], [82.6, 3, 46.8]],
    ['前厅', 3, '一楼东厢（顾雪芝）', 0, [81.4, 3, 80.8], [82.6, 3, 80.8]],
    ['前厅', 2, '后廊', 0, [36.8, 3, 38.6], [36.8, 3, 37.4]],
    ['前厅', 0, '前院', 1, [57, 3, 89.4], [57, 3, 90.8], '出大门', '进大门'],
    ['客厅', 1, '后廊', 2, [88.7, 3, 38.6], [88.7, 3, 37.4]],
    ['西厢', 0, '后廊', 0, [5.8, 3, 38.6], [5.8, 3, 37.4]],
    ['后廊', 2, '楼梯', 0, [119, 3, 37.4], [119, 3, 38.6]],
    ['后廊', 1, '厨房', 1, [129, 3, 37.4], [129, 3, 38.6]],
    ['后廊', 1, '后院', 0, [73, 3, 30.6], [73, 3, 29.4], '出后门', '进后门'],
    ['楼梯', 0, '下人房', 0, [120.3, 3, 63.4], [120.3, 3, 64.6]],
    ['楼梯', 0, '二楼走廊', 2, [113, 3, 41], [113, F2 + 1, 57.5], '上二楼', '下一楼'],
    ['后院', 1, '老号（公馆后门外三十步）', 0, [0.8, 3, 21.7], [-10.6, 3, 20], '出院子后门，去老号', '回公馆后院'],
    ['二楼走廊', 0, '西头卧房（沈伯衡）', 0, [44.6, F2 + 3, 59.4], [44.6, F2 + 3, 60.6]],
    ['二楼走廊', 1, '书房', 2, [58.9, F2 + 3, 59.4], [58.9, F2 + 3, 60.6]],
    ['二楼走廊', 2, '东头空客房', 0, [103.6, F2 + 3, 59.4], [103.6, F2 + 3, 60.6]],
    ['二楼走廊', 0, '沈景行房', 0, [44.5, F2 + 3, 52.6], [44.5, F2 + 3, 51.4]],
    ['二楼走廊', 2, '二老爷旧房', 0, [97.5, F2 + 3, 52.6], [97.5, F2 + 3, 51.4]],
    ['西头卧房（沈伯衡）', 1, '露台', 0, [21.5, F2 + 3.6, 89.4], [21.5, F2 + 3.6, 90.6], '翻窗到露台', '翻窗进卧房'],
    ['书房', 1, '露台', 1, [92.5, F2 + 3.6, 89.4], [92.5, F2 + 3.6, 90.6], '推开落地窗', '进书房'],
    ['东头空客房', 1, '露台', 2, [128, F2 + 3.6, 89.4], [128, F2 + 3.6, 90.6], '翻窗到露台', '翻窗进空客房'],
  ];
  const ROOMNAME = { '一楼东厢（顾雪芝）': '东厢', '老号（公馆后门外三十步）': '老号', '西头卧房（沈伯衡）': '卧房', '东头空客房': '空客房', '二楼走廊': '二楼走廊' };
  const rname = l => ROOMNAME[l] || l;
  // 可查看的地方：r1 = 第一轮可得，r2 = 第二轮对应卡，t = 没有卡时的描述
  const SP = {
    '客厅': [
      { n: '留声机', at: [103, 4, 42], t: '留声机的唱针还搭在唱片上，唱片停了。' },
      { n: '陈列柜', at: [100, 5.5, 40.5], t: '玻璃柜里摆着洋酒、几只瓷盘和一对铜烛台。' },
      { n: '圆桌', at: [94, 3.4, 50], t: '桌上一套茶具，两只杯子里还有残茶。' },
      { n: '油画', at: [104.6, 7.6, 51], t: '一幅西洋风景画，画框很新。' },
    ],
    '西厢': [
      { n: '蒙布的床', at: [9, 3.5, 68.5], t: '白布底下是一张床。这屋子八年没人住了。' },
      { n: '梳妆台', at: [24, 5, 43], t: '梳妆台也蒙着布，镜子朝里扣着。' },
    ],
    '后廊': [
      { n: '后门', at: [73, 4.5, 30.6], t: '后门通后院，门闩是拉开的。' },
      { n: '水缸', at: [100, 2.2, 32.3], t: '一口大水缸，水面上浮着几片落叶。' },
    ],
    '楼梯': [{ n: '楼梯', at: [113, 5, 46], t: '木楼梯，踩上去吱呀响。楼上的人听得见。' }],
    '下人房': [
      { n: '铺盖', at: [110, 2.4, 74.5], t: '两张窄床，铺盖叠得方方正正。' },
      { n: '木箱', at: [115, 3.4, 85], t: '下人的箱子，里面是换洗衣裳。' },
    ],
    '沈景行房': [
      { n: '书架', at: [24.5, F2 + 4, 33], t: '几本洋文书，一叠乐谱。' },
      { n: '留声机', at: [47, F2 + 3, 47], t: '旁边一摞唱片，最上面一张是梅兰芳。' },
      { n: '书桌', at: [39, F2 + 3, 34.7], t: '桌上摊着一封没写完的信，只写了个抬头。' },
    ],
    '二老爷旧房': [
      { n: '写字台', at: [88.5, F2 + 3, 34.7], t: '桌上一把算盘，一叠空白账页。' },
      { n: '衣柜', at: [75, F2 + 5, 33.6], t: '几件旧长衫，樟脑味很重。' },
      { n: '脸盆架', at: [101, F2 + 3, 34], t: '盆里的水是凉的。' },
    ],
    '前厅': [
      { n: '长桌', at: [57, 3.6, 62], t: '晚宴撤了一半，碗碟还摆着，十个座位空了一个。' },
      { n: '主位', at: [57, 4.6, 48.6], t: '六点四十分，沈伯衡就坐在这里，说子时要当众开铁盒。说完他上了楼。' },
      { n: '匾额', at: [57, 9.6, 39], t: '「沈萬春堂」，老太爷的字。' },
      { n: '落地钟', at: [79.5, 6.4, 86], t: '钟走得很准。' },
      { n: '大门', at: [57, 4.5, 89.6], t: '大门外是前院，再往外是院门。' },
      { n: '客厅', at: [82, 4.5, 46.8], t: '往东是客厅，留声机还开着盖。' },
    ],
    '书房': [
      { n: '尸体', at: [76.0, 16.4, 80.9], r1: ['R1-01', 'R1-02', 'R1-07'], r2: ['R2-01'], t: '他伏在桌上，已经凉了。' },
      { n: '拆信刀', at: [77.4, 15.9, 81.3], r1: ['R1-02'], r2: ['R2-02'], t: '黄铜刀柄露在外面，刀柄朝上。' },
      { n: '药盏', at: [72.4, 15.3, 79.0], r1: ['R1-05'], r2: ['R2-03'], t: '白瓷药盏，盏底一层褐色药渍。' },
      { n: '书桌', at: [79.5, 14.8, 75.6], r1: ['R1-05'], t: '流水账合着，手边有一块长方形的地方没有灰。' },
      { n: '笔架', at: [80.6, 15.5, 79.2], r1: ['R1-05'], t: '笔架上空着一个插口，拆信刀原本插在这里。' },
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
      { n: '楼梯口', at: [113, 14, 54], t: '楼梯通到一楼。木板踩上去吱呀响。' },
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
    el.innerHTML = '<div class="walk-c"></div><div class="walk-l"></div><div class="walk-top"><button class="pill" data-w="back">全图</button><div class="walk-t"><b></b><small></small></div><div class="walk-i"></div></div><div class="walk-tip">' + (matchMedia('(pointer: coarse)').matches ? '左下摇杆走动 · 拖动环视 · 点地面走过去' : 'WASD / 方向键走动 · 拖动环视 · 点地面走过去') + '</div><div class="walk-wait">正在点灯……</div><canvas class="walk-mini" width="240" height="170"></canvas><div class="walk-l walk-pl"></div><div class="walk-joy"><i></i></div>';
    const cbox = el.querySelector('.walk-c'), lbox = el.querySelector('.walk-l'), wait = el.querySelector('.walk-wait');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    LOOK.renderer(renderer, 1.1); renderer.shadowMap.autoUpdate = false;
    const PRMAX = Math.min(window.devicePixelRatio || 1, LOOK.mobile ? 1.5 : 2), PRMIN = LOOK.mobile ? 0.75 : 1; let PRNOW = PRMAX; renderer.setPixelRatio(PRNOW);
    if (LOOK.mobile) renderer.shadowMap.type = THREE.PCFShadowMap;   // 场景是静的：阴影只在场景变了以后重算一次
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    cbox.appendChild(renderer.domElement);
    const cam = new THREE.PerspectiveCamera(70, 1, 0.3, 1000);
    const scenes = {}; let cur = null, loc = null, vps = [], vi = 0, yaw = 0, pitch = -0.12, need = true, W = 1, H = 1, tw = null;
    const pos = new THREE.Vector3();
    const self = { el };
    function fit() { const r = cbox.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); renderer.setSize(W, H, false); cam.aspect = W / H; cam.fov = W / H < 0.8 ? 92 : 64; cam.updateProjectionMatrix(); need = true; }
    function place() {
      const f = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
      cam.position.copy(pos); cam.lookAt(pos.clone().add(f)); cam.updateMatrixWorld();
    }
    let lbl = [];
    function doorsHere() { const out = []; DOORS.forEach(d => { if (d[0] === loc) out.push({ to: d[2], vi: d[3], at: d[4], n: d[6] || '去' + rname(d[2]) }); else if (d[2] === loc) out.push({ to: d[0], vi: d[1], at: d[5], n: d[7] || '去' + rname(d[0]) }); }); return out; }
    const LV = new THREE.Vector3(), LMAXD = { sp: 30, vp: 999, door: 999 }, LPRI = { door: 0, vp: 1, sp: 2 }, LSHOWN = [], LORD = [], LPOOL = [], LCMP = (a, b) => (LPRI[a.k] - LPRI[b.k]) || (a.dist - b.dist);
    function labels() {
      if (!lbl._loc || lbl._loc !== loc + vi) {
        lbox.innerHTML = ''; lbl = [];
        (SP[loc] || []).forEach(sp => { const d = document.createElement('button'); d.className = 'walk-spot'; d.innerHTML = `<i></i><span>${sp.n}</span>`; d.onclick = e => { e.stopPropagation(); self.onSpot && self.onSpot(loc, sp); }; lbox.appendChild(d); lbl.push({ d, at: KP(sp.at), sp, k: 'sp' }); });
        doorsHere().forEach(o => { const d = document.createElement('button'); d.className = 'walk-go door'; d.innerHTML = `<span>${o.n} ›</span>`; d.onclick = e => { e.stopPropagation(); moveTo(o.to, o.vi); }; lbox.appendChild(d); lbl.push({ d, at: KP(o.at), k: 'door' }); });
        lbl._loc = loc + vi;
      }
      const v = LV, MAXD = LMAXD, PRI = LPRI, shown = LSHOWN; shown.length = 0;
      lbl.forEach(o => { v.set(...o.at); o.dist = v.distanceTo(pos); v.project(cam); o.x = (v.x + 1) / 2 * W; o.y = (1 - v.y) / 2 * H; o.on = v.z < 1 && o.x > -60 && o.x < W + 60 && o.y > -30 && o.y < H + 30; });
      // 出口（门、楼梯）和站位一律显示；查看点只显示近处的；重叠时先保出口，再保站位
      lbl.forEach(o => { o.vis = o.on && o.dist < MAXD[o.k]; });
      LORD.length = 0; for (let i = 0; i < lbl.length; i++) if (lbl[i].vis) LORD.push(lbl[i]); LORD.sort(LCMP); LORD.forEach(o => { const sc = Math.max(0.75, Math.min(1.15, 26 / o.dist)), w = (o.k === 'sp' ? 70 : 96) * sc, h = 30 * sc; o.sc = sc;
        let hit = shown.find(r => Math.abs(r.x - o.x) < (r.w + w) / 2 && Math.abs(r.y - o.y) < (r.h + h) / 2);
        if (hit && o.k !== 'sp') { o.y = hit.y + (hit.h + h) / 2 + 2; hit = shown.find(r => Math.abs(r.x - o.x) < (r.w + w) / 2 && Math.abs(r.y - o.y) < (r.h + h) / 2); if (hit) o.y = hit.y - (hit.h + h) - 4; }
        else if (hit) { o.vis = false; return; }
        const r = LPOOL[shown.length] || (LPOOL[shown.length] = {}); r.x = o.x; r.y = o.y; r.w = w; r.h = h; shown.push(r); });
      lbl.forEach(o => {
        o.d.style.display = o.vis ? '' : 'none';
        if (o.vis) o.d.style.transform = `translate(${o.x.toFixed(1)}px,${o.y.toFixed(1)}px) translate(-50%,-50%) scale(${o.sc.toFixed(2)})`;
        if (o.sp) { const st = self.state ? self.state(loc, o.sp) : ''; o.d.dataset.st = st; }
      });
    }
    // 小地图：本层各屋轮廓，当前屋点亮，红点是自己，短线是朝向
    const mini = el.querySelector('.walk-mini'), mg = mini.getContext('2d');
    const MINI = {};
    function drawMini() {
      const fl = vps[vi] ? vps[vi].f : 1, W2 = mini.width, H2 = mini.height;
      const C = MINI[fl] || (MINI[fl] = (() => { const rooms = (HOT[fl] || []).filter(r => r.box); const x0 = Math.min(...rooms.map(r => r.box[0])), x1 = Math.max(...rooms.map(r => r.box[2])), z0 = Math.min(...rooms.map(r => r.box[1])), z1 = Math.max(...rooms.map(r => r.box[3]));
        const sc = Math.min((W2 - 12) / (x1 - x0), (H2 - 12) / (z1 - z0)); return { rooms, x0, z0, sc, ox: (W2 - (x1 - x0) * sc) / 2, oz: (H2 - (z1 - z0) * sc) / 2 }; })());
      const rooms = C.rooms, x0 = C.x0, z0 = C.z0, sc = C.sc, ox = C.ox, oz = C.oz;
      mg.clearRect(0, 0, W2, H2); mg.fillStyle = 'rgba(12,9,6,.72)'; mg.fillRect(0, 0, W2, H2);
      for (let i = 0; i < rooms.length; i++) { const r = rooms[i], a = ox + (r.box[0] - x0) * sc, b = oz + (r.box[1] - z0) * sc, c = ox + (r.box[2] - x0) * sc, d = oz + (r.box[3] - z0) * sc, me = r.loc === loc;
        mg.fillStyle = me ? 'rgba(200,150,70,.45)' : 'rgba(255,240,210,.06)'; mg.fillRect(a, b, c - a, d - b); mg.strokeStyle = me ? '#e8b85a' : 'rgba(220,200,160,.35)'; mg.lineWidth = me ? 2 : 1; mg.strokeRect(a + 0.5, b + 0.5, c - a - 1, d - b - 1); }
      const px = ox + (pos.x / K - x0) * sc, pz = oz + (pos.z / K - z0) * sc; mg.strokeStyle = '#ff8a6a'; mg.lineWidth = 2; mg.beginPath(); mg.moveTo(px, pz); mg.lineTo(px + Math.sin(yaw) * 14, pz + Math.cos(yaw) * 14); mg.stroke();
      mg.fillStyle = '#ff5a3a'; mg.beginPath(); mg.arc(px, pz, 4, 0, 7); mg.fill();
    }
    /* ---------- 自由走动 ---------- */
    const COL = {}, PR = 0.62, SPEED = 9;
    function buildCol(s, f) {      // 合批后用：静态部分在建楼时算好，照片扫描件加载完再补
      const st = s.userData.colStatic && s.userData.colStatic[f]; if (!st) return colRaw(s, f, false);
      return st.concat(colRaw(s, f, true));
    }
    V3._colRaw = (s, f) => colRaw(s, f, false);
    function colRaw(s, f, glbOnly) {      // 碰撞盒（世界坐标 x/z）：墙 + 落地的家具；地毯、吊灯、细杆、小摆件不挡
      const y0 = f === 2 ? F2 : 0, out = [], bb = new THREE.Box3(), sz = new THREE.Vector3();
      s.updateMatrixWorld(true);
      const add = (b, src) => { if (b.isEmpty() || b.max.y < y0 + 0.5 || b.min.y > y0 + 4.6) return; const r = [b.min.x, b.min.z, b.max.x, b.max.z]; r.src = src; r.h = [b.min.y, b.max.y];
        r.step = !!(src && src.isMesh && !src.userData.wall && src.geometry && src.geometry.type === 'BoxGeometry' && b.min.y < y0 + 0.3 && Math.min(b.max.x - b.min.x, b.max.z - b.min.z) >= 0.8); r.wall = !!(src && src.userData.wall);
        if (!r.wall && !r.step) { const ix = Math.min(0.15, (r[2] - r[0]) * 0.15), iz = Math.min(0.15, (r[3] - r[1]) * 0.15); r[0] += ix; r[2] -= ix; r[1] += iz; r[3] -= iz; }   // 家具外框比看上去大，往里收一点
        out.push(r); };   // 台阶、矮台：能踩上去   // 薄板（护墙、栏杆）不能踩
      if (glbOnly) { s.traverse(o => { if (!o.userData.glb || o.userData.nocol) return; for (let q = o.parent; q; q = q.parent) if (q.userData && (q.userData.avatar || q.userData.nocol)) return;
          bb.setFromObject(o); if (bb.isEmpty()) return; bb.getSize(sz); if (Math.max(sz.x, sz.z) > 14 || sz.y < 0.7 || Math.min(sz.x, sz.z) < 0.12 || (Math.max(sz.x, sz.z) < 1.1 && sz.y < 3.5)) return; add(bb, o); });
        return out; }
      s.traverse(o => { if (o.isMesh && o.userData.wall) { bb.setFromObject(o); add(bb, o); } });
      // 收紧时被包成“结构件”的大方块（楼梯踏步、扶手墙）也要算：踏步能踩，扶手挡人
      s.traverse(o => { if (!o.isMesh || o.userData.wall || !o.geometry || o.geometry.type !== 'BoxGeometry') return; let q = o.parent, wrapped = false; while (q) { if (q.userData && q.userData.wrap) { wrapped = true; break; } q = q.parent; } if (!wrapped) return;
        const gp = o.geometry.parameters || {}; if (Math.min(gp.width || 0, gp.depth || 0) < 0.8 && !(Math.max(gp.width || 0, gp.depth || 0) > 6 && (gp.height || 0) > 2)) return;   // 门扇不算；长条护墙板算
        bb.setFromObject(o); if (bb.min.y < y0 + 0.3 && bb.max.y > y0 + 0.3 && bb.max.y < y0 + F2 + 0.5) add(bb, o); });
      const pick = list => list.forEach(o => {
        if (o.isLight || o.isPoints || o.userData.noscale || o.userData.struct || o.userData.wall || o.userData.avatar || o.userData.nocol || o.userData.glb) return;
        if ((o.isGroup || o.type === 'Object3D') && o.children.length > 1 && Math.abs(o.position.x) < 1e-6 && Math.abs(o.position.z) < 1e-6) { pick(o.children); return; }
        bb.setFromObject(o); if (bb.isEmpty()) return; bb.getSize(sz);
        if (Math.max(sz.x, sz.z) > 14 || sz.y < 0.7 || Math.min(sz.x, sz.z) < 0.12 || (Math.max(sz.x, sz.z) < 1.1 && sz.y < 3.5)) return;   // 花瓶、小桶这类小摆件不挡路
        add(bb, o); });
      pick(s.children);
      return out;
    }
    let ground = 0;     // 脚下的高度：踩上台阶、楼梯会变高
    const STEPUP = 1.5;
    function groundAt(x, z, any) {
      const y0 = floor === 2 ? F2 : 0, L = COL[floor]; let g = y0;
      if (L) for (let i = 0; i < L.length; i++) { const b = L[i]; if (b.step && x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3] && b.h[1] > g && (any ? b.h[1] < y0 + F2 + 0.5 : b.h[1] <= ground + STEPUP)) g = b.h[1]; }
      return g;
    }
    function blocked(x, z, ox, oz) {
      const L = COL[floor];
      if (L) for (let i = 0; i < L.length; i++) { const b = L[i];
        if (b.step) { if (b.h[1] > ground + STEPUP && x > b[0] - 0.15 && x < b[2] + 0.15 && z > b[1] - 0.15 && z < b[3] + 0.15) return true; continue; }   // 台阶只看脚下那一点：迈得上去就不挡
        if (x > b[0] - PR && x < b[2] + PR && z > b[1] - PR && z < b[3] + PR && !(ox > b[0] - PR && ox < b[2] + PR && oz > b[1] - PR && oz < b[3] + PR)) return true; }   // 原本就卡在里面的，允许走出来
      const px = x / K, pz = z / K, R = HOT[floor] || [];
      for (let i = 0; i < R.length; i++) { const b = R[i].box; if (b && px >= b[0] - 0.5 && px <= b[2] + 0.5 && pz >= b[1] - 0.5 && pz <= b[3] + 0.5) return false; }
      if (floor === 2 && px >= 106 && px <= 124 && pz >= 30 && pz <= 52.5) return false;   // 二楼楼梯口平台
      return true;   // 走出了所有房间、院子的范围
    }
    function roomAt(x, z) { const px = x / K, pz = z / K, R = HOT[floor] || []; for (let i = 0; i < R.length; i++) { const b = R[i].box; if (b && px >= b[0] && px < b[2] && pz >= b[1] && pz < b[3]) return R[i].loc; } return null; }
    function updRoom() { const l = roomAt(pos.x, pos.z); if (l && l !== loc && VP[l]) { loc = l; vps = VP[l]; vi = -1; lbl._loc = null; el.querySelector('.walk-t b').textContent = rname(l); self.onRoom && self.onRoom(l); } }
    let lift = 0;
    function switchFloor(f) { floor = f; if (!COL[f]) COL[f] = buildCol(cur, f); floorLights(cur, f); ground = f === 2 ? F2 : groundAt(pos.x, pos.z, true); renderer.shadowMap.needsUpdate = true; sentKey = ''; }
    function toFloor(f, px, pz, y) {      // 走楼梯换层
      if (busy) return; target = null; mark.visible = false;
      const done = () => { cur = scenes[f]; floor = f; floorLights(cur, f); if (!COL[f]) COL[f] = buildCol(cur, f); cur.add(mark); PEERS.forEach(placePeer); renderer.shadowMap.needsUpdate = true; wait.style.display = 'none'; busy = false;
        pos.set(px * K, 0, pz * K); ground = groundAt(pos.x, pos.z, true); lift = ground; pos.y = ground + EYE; yaw = y; tw = null; loc = null; updRoom(); lbl._loc = null; sentKey = ''; lastSent = 0; need = true; };
      if (scenes[f]) done(); else { busy = true; wait.style.display = ''; setTimeout(async () => { scenes[1] = scenes[2] = await buildHouse(renderer); done(); }, 40); }
    }
    const KEYS = new Set(); let joyX = 0, joyY = 0, target = null, bob = 0, lastT = 0, lastSent = 0, sentKey = '';
    const isTyping = () => { const a = document.activeElement; return a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); };
    window.addEventListener('keydown', e => { if (!el.isConnected || isTyping()) return; KEYS.add(e.code); if (/^(Arrow|Space)/.test(e.code)) e.preventDefault(); });
    window.addEventListener('keyup', e => KEYS.delete(e.code));
    window.addEventListener('blur', () => KEYS.clear());
    const joy = el.querySelector('.walk-joy'), knob = joy.querySelector('i');
    function mvJoy(e) { const r = joy.getBoundingClientRect(), R = r.width / 2; let dx = e.clientX - r.left - R, dy = e.clientY - r.top - R; const d = Math.hypot(dx, dy); if (d > R * 0.8) { dx *= R * 0.8 / d; dy *= R * 0.8 / d; }
      joyX = dx / (R * 0.8); joyY = dy / (R * 0.8); knob.style.transform = `translate(${dx.toFixed(0)}px,${dy.toFixed(0)}px)`; }
    joy.addEventListener('pointerdown', e => { joy.setPointerCapture(e.pointerId); joy.dataset.on = 1; target = null; mvJoy(e); e.stopPropagation(); });
    joy.addEventListener('pointermove', e => { if (joy.dataset.on) mvJoy(e); });
    const joyEnd = () => { delete joy.dataset.on; joyX = joyY = 0; knob.style.transform = ''; };
    joy.addEventListener('pointerup', joyEnd); joy.addEventListener('pointercancel', joyEnd);
    const mark = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.7, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xf3e6c8, transparent: true, opacity: 0.7, depthTest: false }));
    mark.renderOrder = 9; mark.visible = false; mark.userData.noscale = 1;
    function walkStep(dt) {
      if (tw || busy || !cur) return false;
      let fw = 0, st = 0, ry = 0;
      if (KEYS.has('KeyW') || KEYS.has('ArrowUp')) fw += 1; if (KEYS.has('KeyS') || KEYS.has('ArrowDown')) fw -= 1;
      if (KEYS.has('KeyA')) st -= 1; if (KEYS.has('KeyD')) st += 1;
      if (KEYS.has('ArrowLeft') || KEYS.has('KeyQ')) ry += 1; if (KEYS.has('ArrowRight') || KEYS.has('KeyE')) ry -= 1;
      fw -= joyY; st += joyX;
      if (ry) yaw += ry * 1.9 * dt;
      let vx = 0, vz = 0;
      if (fw || st) { target = null; mark.visible = false; const sy = Math.sin(yaw), cy = Math.cos(yaw); vx = sy * fw - cy * st; vz = cy * fw + sy * st; const m = Math.hypot(vx, vz); if (m > 1) { vx /= m; vz /= m; } }
      else if (target) { const dx = target.x - pos.x, dz = target.z - pos.z, d = Math.hypot(dx, dz);
        if (d < 0.35) { target = null; mark.visible = false; }
        else { vx = dx / d; vz = dz / d; let dy = Math.atan2(dx, dz) - yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; yaw += dy * Math.min(1, dt * 4); } }
      if (!vx && !vz) return !!ry;
      const sp = SPEED * (KEYS.has('ShiftLeft') || KEYS.has('ShiftRight') ? 1.7 : 1) * dt, ox = pos.x, oz = pos.z;
      const nx = pos.x + vx * sp; if (!blocked(nx, pos.z, ox, oz)) pos.x = nx;
      const nz = pos.z + vz * sp; if (!blocked(pos.x, nz, ox, oz)) pos.z = nz;
      if ((fw || st) && Math.hypot(pos.x - ox, pos.z - oz) < sp * 0.15) {      // 正面顶住了：左右各试几个角度，顺着边滑过去
        for (const a of [0.6, -0.6, 1.1, -1.1]) { const c = Math.cos(a), sn = Math.sin(a), dx = (vx * c - vz * sn) * sp * 0.8, dz = (vx * sn + vz * c) * sp * 0.8;
          if (!blocked(ox + dx, oz + dz, ox, oz)) { pos.x = ox + dx; pos.z = oz + dz; break; } } }
      const md = Math.hypot(pos.x - ox, pos.z - oz);
      if (target && md < sp * 0.2) { target = null; mark.visible = false; }       // 被挡住就停下
      ground = groundAt(pos.x, pos.z);
      bob += md * 1.1; lift += (ground - lift) * Math.min(1, dt * 12); pos.y = lift + EYE + Math.sin(bob) * 0.06;
      if (floor === 1 && ground >= F2 - 0.3) switchFloor(2);                                                   // 楼梯走到顶：上了二楼
      else if (floor === 2) { const px = pos.x / K, pz = pos.z / K; if (px > HOLE[0] + 0.2 && px < HOLE[2] - 0.2 && pz > HOLE[1] + 0.2 && pz < HOLE[3] - 0.1) switchFloor(1); }   // 二楼走进楼梯口：往下走
      updRoom(); return true;
    }
    function sendPos(now) {
      if (!self.onMove || !cur || now - lastSent < 220) return;
      const k = floor + ',' + (pos.x / K).toFixed(1) + ',' + (pos.z / K).toFixed(1) + ',' + yaw.toFixed(1);
      if (k === sentKey) return; sentKey = k; lastSent = now;
      self.onMove({ f: floor, x: +(pos.x / K).toFixed(2), z: +(pos.z / K).toFixed(2), g: +ground.toFixed(2), yaw: +yaw.toFixed(3), loc });
    }
    /* ---------- 其他玩家：人物模型 + 名牌，位置平滑插值，走路摆腿 ---------- */
    const OUTFIT = {
      '01': { mh: 'm_mid', top: '#3a3328', vest: '#18160f', gown: 1, hat: 'gua', glasses: true }, '02': { mh: 'f_mid', top: '#cfcac0', bottom: '#2b2b30', bun: 1, h: 2.45 },
      '03': { mh: 'm_young', top: '#2d3340', bottom: '#2d3340' }, '04': { mh: 'f_mid', top: '#4a2430', gown: 1, bun: 1, h: 2.42 },
      '05': { mh: 'm_mid', top: '#3c3a36', vest: '#121110', gown: 1, hat: 'gua', mustache: 1 }, '06': { mh: 'm_young', top: '#2f3a44', gown: 1 },
      '07': { mh: 'f_young', top: '#7a1e2a', gown: 1, bun: 1, h: 2.42 }, '08': { mh: 'm_old', top: '#2a2622', vest: '#3a2a18', gown: 1, mustache: 1, glasses: true },
      '09': { mh: 'm_young', top: '#57503f', bottom: '#38322c', glasses: true }, '10': { mh: 'f_young', top: '#34404a', gown: 1, bun: 1, h: 2.44 },
    };
    const NOANIM = /noanim/.test(location.search);   // 测试用：人物不动画，截图不卡
    const PEERS = new Map(), pbox = el.querySelector('.walk-pl'), PQ = new THREE.Quaternion(), PAX = new THREE.Vector3(1, 0, 0), PV = new THREE.Vector3();
    function placePeer(p) {
      const sc = scenes[p.f]; if (!sc) { if (p.g && p.g.parent) p.g.parent.remove(p.g); return; }
      if (!p.g) { p.g = avatar(sc, p.x * K, p.f === 2 ? F2 : 0, p.z * K, p.yaw - Math.PI / 2, Object.assign({ dyn: 1 }, OUTFIT[p.id] || {})); p.g.userData.avatar = 1; p.g.userData.noscale = 1; }
      else if (p.g.parent !== sc) sc.add(p.g);
    }
    self.peer = (id, d) => {
      let p = PEERS.get(id);
      if (!p) { p = { id, x: d.x, z: d.z, yaw: d.yaw || 0, tx: d.x, tz: d.z, tyaw: d.yaw || 0, ph: 0, g: null, f: d.f === 2 ? 2 : 1 };
        PEERS.set(id, p); p.lab = document.createElement('div'); p.lab.className = 'walk-peer'; pbox.appendChild(p.lab); }
      const f = d.f === 2 ? 2 : 1; if (p.f !== f) { p.x = d.x; p.z = d.z; p.f = f; }
      p.tx = d.x; p.tz = d.z; p.tg = typeof d.g === 'number' ? d.g : (f === 2 ? F2 : 0); p.tyaw = d.yaw || 0; p.lab.textContent = d.name || id; placePeer(p); need = true;
    };
    self.peerGone = id => { const p = PEERS.get(id); if (!p) return; if (p.g && p.g.parent) p.g.parent.remove(p.g); p.lab.remove(); PEERS.delete(id); need = true; };
    function stepPeers(dt) {
      let any = false; const k = 1 - Math.exp(-dt * 7);
      PEERS.forEach(p => {
        if (!p.g) return;
        const dx = p.tx - p.x, dz = p.tz - p.z, d = Math.hypot(dx, dz); p.x += dx * k; p.z += dz * k;
        let dy = p.tyaw - p.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; p.yaw += dy * k;
        p.gy = p.gy === undefined ? p.tg : p.gy + ((p.tg ?? 0) - p.gy) * k; p.g.position.set(p.x * K, p.gy ?? (p.f === 2 ? F2 : 0), p.z * K); p.g.rotation.y = p.yaw - Math.PI / 2;
        const walking = d > 0.05, A = p.g.userData.anim;
        if (A) {
          if (walking !== A.walking && A.walk && A.idle) { A.walking = walking; const from = walking ? A.idle : A.walk, to = walking ? A.walk : A.idle; to.reset(); to.setEffectiveWeight(1); to.play(); from.crossFadeTo(to, 0.25, false); if (A.walk) A.walk.timeScale = 1.5; }
          A.acc = (A.acc || 0) + dt; const near = p.f === floor && Math.hypot(p.x * K - pos.x, p.z * K - pos.z) < (LOOK.mobile ? 40 : 70);
          if (near && A.acc >= (LOOK.mobile ? 1 / 24 : 0)) { A.mixer.update(NOANIM ? 0 : A.acc); A.acc = 0; if (!NOANIM || walking) any = true; } else if (near && walking) any = true;
        }
      });
      return any;
    }
    function wallBetween(x0, z0, x1, z1) {      // 两点连线有没有穿过墙（只看墙，门洞看得见）
      const L = COL[floor]; if (!L) return false; const dx = x1 - x0, dz = z1 - z0;
      for (let i = 0; i < L.length; i++) { const b = L[i]; if (!b.wall) continue; let t0 = 0, t1 = 1;
        if (Math.abs(dx) < 1e-6) { if (x0 < b[0] || x0 > b[2]) continue; } else { let a = (b[0] - x0) / dx, c = (b[2] - x0) / dx; if (a > c) { const t = a; a = c; c = t; } t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) continue; }
        if (Math.abs(dz) < 1e-6) { if (z0 < b[1] || z0 > b[3]) continue; } else { let a = (b[1] - z0) / dz, c = (b[3] - z0) / dz; if (a > c) { const t = a; a = c; c = t; } t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) continue; }
        return true; }
      return false;
    }
    function peerLabels() {
      PEERS.forEach(p => {
        if (!p.g || p.f !== floor) { p.lab.style.display = 'none'; return; }
        if (Math.hypot(p.x * K - pos.x, p.z * K - pos.z) > 45 || wallBetween(pos.x, pos.z, p.x * K, p.z * K)) { p.lab.style.display = 'none'; return; }
        PV.set(p.x * K, (p.gy ?? (p.f === 2 ? F2 : 0)) + 5.4, p.z * K); const dist = PV.distanceTo(pos); PV.project(cam);
        const x = (PV.x + 1) / 2 * W, y = (1 - PV.y) / 2 * H;
        if (PV.z > 1 || dist > 70 || x < -50 || x > W + 50 || y < -30 || y > H + 30) { p.lab.style.display = 'none'; return; }
        p.lab.style.display = ''; p.lab.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;
      });
    }
    function frame() {
      if (!el.isConnected) { raf = 0; return; }
      raf = requestAnimationFrame(frame);
      { const t = performance.now(), dt = Math.min(0.05, (t - (lastT || t)) / 1000); lastT = t;
        if (walkStep(dt)) need = true; if (stepPeers(dt)) need = true; sendPos(t); }

      if (tw) { const t = Math.min(1, (performance.now() - tw.t0) / 700), e = t * t * (3 - 2 * t); pos.lerpVectors(tw.a, tw.b, e); yaw = tw.y0 + (tw.y1 - tw.y0) * e; if (t >= 1) tw = null; need = true; }
      const now = performance.now();
      if (upAt && cur && now - upAt > 400) { upAt = 0; LOOK.upgrade(cur); renderer.shadowMap.needsUpdate = true; need = true; delete COL[1]; delete COL[2]; COL[floor] = buildCol(cur, floor); }          // 新载入的模型、人物也补上材质
      if (DUST_MS && cur && cur.userData.dust && now - lastDust > DUST_MS) { lastDust = now; cur.userData.dust.userData.tick(now / 1000, cam, floor === 2 ? F2 : 0); need = true; }   // 浮尘约 30 帧
      if (!need || !cur) return; need = false;
      { const t = performance.now(); if (lastR && t - lastR < 100) { ftE = ftE * 0.92 + (t - lastR) * 0.08; if (t - lastAdj > 2000) { lastAdj = t;   // 连续渲染时看帧间隔：卡就降分辨率，顺就升回来
          const np = ftE > 26 ? Math.max(PRMIN, PRNOW - 0.15) : ftE < 15 ? Math.min(PRMAX, PRNOW + 0.1) : PRNOW; if (Math.abs(np - PRNOW) > 0.01) { PRNOW = np; renderer.setPixelRatio(PRNOW); renderer.setSize(W, H, false); } } } lastR = t; }
      place(); renderer.render(cur, cam); labels(); peerLabels(); drawMini();
    }
    let raf = 0, lastDust = 0, lastR = 0, ftE = 16, lastAdj = 0;
    const DUST_MS = /nodust/.test(location.search) ? 0 : (LOOK.mobile ? 66 : 40);   // 浮尘刷新：电脑约 25 帧，手机约 15 帧
    let upAt = 0; V3.onModel = () => { need = true; upAt = performance.now(); };
    function yawTo(v, x, z) { return Math.atan2((x - v.at[0]) * K, (z - v.at[1]) * K); }
    function go(i, instant) {
      vi = i; const v = vps[i], p = new THREE.Vector3(v.at[0] * K, (v.f === 2 ? F2 : 0) + EYE, v.at[1] * K);
      let y1 = yawTo(v, v.look[0], v.look[1]);
      if (instant) { pos.copy(p); yaw = y1; pitch = W / H < 0.8 ? -0.2 : -0.1; }
      else { while (y1 - yaw > Math.PI) y1 -= 2 * Math.PI; while (yaw - y1 > Math.PI) y1 += 2 * Math.PI; tw = { a: pos.clone(), b: p, y0: yaw, y1, t0: performance.now() }; }
      lbl._loc = null; need = true;
    }
    let floor = 0, busy = false;
    function moveTo(l, i = 0, instant) {
      const list = VP[l]; if (!list || !list.length || busy) return; const v = list[Math.min(i, list.length - 1)];
      const changed = l !== loc; loc = l; vps = list; lbl._loc = null;
      el.querySelector('.walk-t b').textContent = rname(l);
      if (changed && self.onRoom) self.onRoom(l);
      const idx = list.indexOf(v);
      if (floor === v.f && cur && !instant) { go(idx); return; }
      const start = () => { cur = scenes[v.f]; floor = v.f; floorLights(cur, floor); ground = lift = v.f === 2 ? F2 : 0; if (!COL[v.f]) COL[v.f] = buildCol(cur, v.f); cur.add(mark); mark.visible = false; target = null; PEERS.forEach(placePeer); renderer.shadowMap.needsUpdate = true; wait.style.display = 'none'; busy = false; go(idx, true); need = true; };
      if (scenes[v.f]) start(); else { busy = true; wait.style.display = ''; setTimeout(async () => { scenes[1] = scenes[2] = await buildHouse(renderer); start(); }, 40); }
    }
    self.enter = (l) => { if (l === loc && cur) return; moveTo(l, 0, true); };
    self.attach = (host) => { host.appendChild(el); fit(); if (!raf) raf = requestAnimationFrame(frame); need = true; };
    self.refresh = () => { need = true; };
    self.info = (h) => { el.querySelector('.walk-i').innerHTML = h; };
    self.sub = (h) => { el.querySelector('.walk-t small').innerHTML = h; };
    self.loc = () => loc; self._scene = () => cur; self._renderer = () => renderer; self._pos = () => pos.toArray();
    self.go = (i) => go(i, true);
    self._dbg = { line: (x0, z0, x1, z1) => { pos.set(x0 * K, 0, z0 * K); ground = floor === 2 ? F2 : 0; ground = groundAt(pos.x, pos.z); const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 0.25); for (let i = 1; i <= n; i++) { const x = (x0 + (x1 - x0) * i / n) * K, z = (z0 + (z1 - z0) * i / n) * K; if (blocked(x, z, pos.x, pos.z)) return [false, +(pos.x / K).toFixed(1), +(pos.z / K).toFixed(1)]; pos.x = x; pos.z = z; ground = groundAt(x, z); } return [true, +ground.toFixed(2)]; }, ground: () => ground, toFloor: (f, x, z, y) => toFloor(f, x, z, y), blocked: (x, z) => blocked(x, z, pos.x, pos.z), col: () => COL[floor], step: (code, n, dt) => { KEYS.add(code); for (let i = 0; i < n; i++) walkStep(dt || 0.05); KEYS.delete(code); need = true; return pos.toArray(); } };
    self.turn = (d) => { yaw += d; need = true; };
    self.cam = (p, y, pt, fov) => { pos.set(p[0] * K, p[1], p[2] * K); yaw = y; pitch = pt; if (fov) { cam.fov = fov; cam.updateProjectionMatrix(); } need = true; };
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
    let downAt = null;
    cv.addEventListener('pointerdown', e => { downAt = ptr.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null; });
    const tray = new THREE.Raycaster(), tnv = new THREE.Vector2();
    function tapFloor(e) {
      if (!cur || tw || busy) return; const r = cv.getBoundingClientRect(); tnv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      place(); tray.setFromCamera(tnv, cam); tray.far = 45; mark.visible = false;
      const hits = tray.intersectObjects(cur.children, true); let h = null;
      for (let i = 0; i < hits.length; i++) { const o = hits[i].object; if (o === mark || o.isPoints || o.isSprite || !o.visible) continue; h = hits[i]; break; }
      const fy = floor === 2 ? F2 : 0; if (!h || h.point.y > fy + 0.6) return;     // 只认地面
      target = { x: h.point.x, z: h.point.z }; mark.position.set(h.point.x, fy + 0.08, h.point.z); mark.visible = true; need = true;
    }
    const up = e => { ptr.delete(e.pointerId); if (ptr.size < 2) pinch = null;
      if (downAt && e.type === 'pointerup' && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 7 && performance.now() - downAt.t < 450) tapFloor(e); downAt = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); cam.fov = Math.max(30, Math.min(85, cam.fov * Math.exp(e.deltaY * 0.001))); cam.updateProjectionMatrix(); need = true; }, { passive: false });
    return self;
  }
  let WALK = null;
  V3.walk3d = () => WALK || (WALK = makeWalk());   // 旧的几何体漫游：只给烘焙全景图用
  V3._data = { VP, DOORS, SP, HOT, rname, K, F2, EYE };
  V3.canWalk = l => !!VP[l];
  V3.label = l => rname(l);

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
