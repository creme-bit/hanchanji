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
    1: [['柴房', [13, 5, 8]], ['管家房', [36, 5, 10]], ['井', [64, 3, 11]], ['后门', [0, 7, 21.5]], ['西厢', [15, 4, 55]], ['前厅', [57, 5, 64]], ['客厅', [94, 4, 50]],
      ['楼梯', [115, 7, 46]], ['下人房', [115, 4, 80]], ['大门', [57, 6, 90]], ['院门', [57, 9, 115]], ['洗手间', [144, 4, 34]]],
    2: [['沈景行房', [25, F2 + 5, 40]], ['二老爷旧房', [79, F2 + 5, 40]], ['杂物间', [137, F2 + 5, 40]], ['楼梯', [115, F2 + 1, 41]], ['落地窗', [92.5, F2 + 8, 90]]],
  };

  function oldShop(s) {
    const W = '#d9cfbb';
    M.floor(s, -46, -4, 0, 42, TX.mud(), 14, 0.01);
    M.floor(s, -36, 8, -10, 32, TX.plank([120, 88, 60]), 10, 0.04);
    M.wall(s, -36, 8, -10, 8, 5, 1, W); M.wall(s, -36, 32, -10, 32, 5, 1, W, [[-30, -22, 3, 'win']]);
    M.wall(s, -36, 8, -36, 32, 5, 1, W); M.wall(s, -10, 8, -10, 32, 5, 1, W, [[17, 23]]);
    M.door(s, -10, 17, 6, 1.1, '#5a2e1e');
    M.box(s, 3, 3.4, 16, -16, 0, 20, '#4a2e1c');                      // 柜台
    M.bookcase(s, -23, 9.4, 18, 2, 7);                                  // 药柜
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
        if (l.hot) { const st = self.state ? self.state(l.hot.loc) : ''; d.dataset.st = st; d.querySelector('i').textContent = st === 'can' ? '搜' : st === 'done' ? '已翻遍' : ''; d.classList.toggle('sel', sel === l.hot); }
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
    self.reset = () => { view.az = 0.42; view.el = 0.9; view.tx = 58; view.tz = 48; view.ppu = 0; fit(); };
    setFloor(1);
    return self;
  }
  let MAP = null;
  V3.map = () => MAP || (MAP = makeMap());

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
