/* 寒蝉记 · 360° 全景探索引擎（街景式）
 * 每个机位一张 2:1 等距柱状全景图，贴在反转的球体内壁上，摄像机在球心。
 * 机位、移动圆环、证物锚点都在 3d/nodes.js 的 PANO_NODES 里，坐标是以机位为原点的方向 (x, y, z)：
 *   +x 东  +z 南  -x 西  -z 北  +y 上；长度不要紧，只看方向（调试模式拾取出来的是半径 10 上的点）。
 * 对外接口跟原来的漫游一样：attach / enter / loc / refresh / info / sub，回调 state / onSpot / onBack / onRoom。
 */
(function () {
  'use strict';
  const DEBUG_UI = true;            // ← 上线前改成 false：角落里的「调试」开关就不显示（网址加 ?debug=1 仍可临时打开）
  const R = 60;                     // 球体半径
  const EYE_H = 5;                  // 机位离地高度：移动圆环按这个高度算落在地上的位置
  const FOV_MIN = 45, FOV_MAX = 85;
  const MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || Math.min(screen.width, screen.height) < 600;

  const NODES = window.PANO_NODES || {};
  const D = V3._data, rname = D.rname, HOT = D.HOT;
  const BYLOC = {};
  for (const id in NODES) (BYLOC[NODES[id].loc] || (BYLOC[NODES[id].loc] = [])).push(id);
  V3.nodes = NODES;
  let PW = null;
  V3.pano = () => PW || (PW = makePano());
  // 总开关：3d/nodes.js 里 PANO_ON = true 才用全景图漫游；否则沿用 3D 漫游
  if (window.PANO_ON || /pano=1/.test(location.search)) { V3.canWalk = l => !!BYLOC[l]; V3.walk = V3.pano; }
  else V3.walk = V3.walk3d;

  /* ---------- 贴图：缓存 + 缺图时用 Canvas 方向占位图 ---------- */
  function placeholder(nd) {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#3a3e44'); gr.addColorStop(0.5, '#5a5c5e'); gr.addColorStop(0.5, '#2e2b28'); gr.addColorStop(1, '#1a1816'); g.fillStyle = gr; g.fillRect(0, 0, 2048, 1024);
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2;
    for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 1024); g.stroke(); }
    for (let j = 1; j < 8; j++) { g.beginPath(); g.moveTo(0, j * 128); g.lineTo(2048, j * 128); g.stroke(); }
    g.fillStyle = '#e8dcc2'; g.textAlign = 'center'; g.font = 'bold 64px sans-serif';
    [['东', 0], ['南', 0.25], ['西', 0.5], ['北', 0.75], ['东', 1]].forEach(([t, u]) => g.fillText(t, u * 2048, 500));
    g.font = '36px sans-serif'; g.fillStyle = '#bcab8b';
    for (let u = 0.125; u < 1; u += 0.25) g.fillText(rname(nd.loc) + ' · ' + nd.n + '（缺图，占位）', u * 2048, 580);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const TEX = new Map(), loader = new THREE.TextureLoader();
  function tex(id, renderer) {
    if (TEX.has(id)) return TEX.get(id);
    const nd = NODES[id];
    const p = new Promise(res => loader.load(nd.img + (window.PANO_VER ? '?v=' + window.PANO_VER : ''), t => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); t.minFilter = THREE.LinearMipmapLinearFilter; res(t);
    }, undefined, () => res(placeholder(nd))));
    TEX.set(id, p);
    if (TEX.size > (MOBILE ? 5 : 9)) {               // 手机上最多留 5 张，免得爆显存
      for (const k of TEX.keys()) { if (k === id || (PW && PW._keep(k))) continue; TEX.get(k).then(t => t.dispose()); TEX.delete(k); if (TEX.size <= (MOBILE ? 5 : 9)) break; }
    }
    return p;
  }

  /* ---------- 地上的移动圆环（街景式） ---------- */
  const RING_GEO = new THREE.RingGeometry(0.62, 0.86, 48).rotateX(-Math.PI / 2);
  const DISC_GEO = new THREE.CircleGeometry(0.62, 48).rotateX(-Math.PI / 2);
  const ARROW_GEO = (() => { const s = new THREE.Shape(); s.moveTo(0, 0.42); s.lineTo(0.34, 0.02); s.lineTo(0.18, 0.02); s.lineTo(0, 0.22); s.lineTo(-0.18, 0.02); s.lineTo(-0.34, 0.02); s.closePath();
    const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); g.translate(0, 0.01, -0.12); return g; })();
  function ringMat(op) { return new THREE.MeshBasicMaterial({ color: 0xf3ecdc, transparent: true, opacity: op, depthTest: false, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }); }
  // 链接方向 → 地上的落点（方向朝下才落地；朝上或太平就悬在 12 远处）
  function floorPoint(at, out) {
    out.set(at[0], at[1], at[2]).normalize();
    if (out.y < -0.06) { let t = EYE_H / -out.y; const hz = Math.hypot(out.x, out.z) * t; if (hz > 30) t *= 30 / hz; out.multiplyScalar(t); }
    else out.multiplyScalar(12);
    return out;
  }

  function makePano() {
    const el = document.createElement('div'); el.className = 'walk pano';
    el.innerHTML = '<div class="walk-c"></div><div class="walk-l"></div><div class="walk-top"><button class="pill" data-w="back">全图</button><div class="walk-t"><b></b><small></small></div><div class="walk-i"></div></div>' +
      '<div class="walk-tip">拖动环视 · 点地上的圆圈走过去 · 点亮处查看</div><div class="pano-fade"></div><div class="walk-wait">正在掌灯……</div><canvas class="walk-mini" width="240" height="170"></canvas>' +
      (DEBUG_UI || /debug=1/.test(location.search) ? '<button class="pano-dbg" data-w="dbg">调试</button><div class="pano-pick"></div>' : '');
    const cbox = el.querySelector('.walk-c'), lbox = el.querySelector('.walk-l'), wait = el.querySelector('.walk-wait'), fade = el.querySelector('.pano-fade');
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;          // 全景图原样输出：不做色调映射，不发白、不偏色
    renderer.toneMapping = THREE.NoToneMapping;
    cbox.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(75, 1, 0.1, R * 3);
    const sphGeo = new THREE.SphereGeometry(R, 72, 48); sphGeo.scale(-1, 1, 1);
    const sphMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    const sphere = new THREE.Mesh(sphGeo, sphMat); scene.add(sphere);
    // 空气里的微尘：很淡，只为了让静态画面有点呼吸感
    const dust = LOOK.dust(MOBILE ? 90 : 170, [16, 10, 16]); dust.material.uniforms.uSize.value = MOBILE ? 0.32 : 0.38; scene.add(dust);
    const rings = new THREE.Group(); scene.add(rings);

    const self = { el };
    let W = 1, H = 1, need = true, raf = 0, last = 0, lastDust = 0;
    let node = null, loc = null, busy = false;
    let yaw = 0, pitch = -0.08, tYaw = 0, tPitch = -0.08, vYaw = 0, vPitch = 0, fov = 75, tFov = 75, baseFov = 75;
    let debug = false;

    function fit() { const r = cbox.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); renderer.setSize(W, H, false); cam.aspect = W / H;
      baseFov = W / H < 0.8 ? 82 : 72; if (!node) fov = tFov = baseFov; cam.updateProjectionMatrix(); need = true; }
    const FWD = new THREE.Vector3();
    function place() {
      FWD.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
      cam.position.set(0, 0, 0); cam.lookAt(FWD); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); } cam.updateMatrixWorld();
    }

    /* ---------- 热点：DOM 标签 + 地上圆环 ---------- */
    let HS = [];              // {d, k:'sp'|'go', at:Vector3, sp?, link?, mesh?}
    const V = new THREE.Vector3();
    function spObj(n) { return (V3.spots[loc] || []).find(s => s.n === n); }
    function build() {
      lbox.innerHTML = ''; HS = []; while (rings.children.length) { const g = rings.children[0]; rings.remove(g); g.traverse(o => { if (o.material) o.material.dispose(); }); }
      (node.links || []).forEach(lk => {
        if (!NODES[lk.to]) return;
        const p = floorPoint(lk.at, new THREE.Vector3()), g = new THREE.Group(); g.position.copy(p);
        const dist = p.length(), sc = Math.max(0.9, Math.min(2.6, dist / 9)); g.scale.setScalar(sc);
        if (p.y > -EYE_H + 0.01) g.lookAt(0, 0, 0), g.rotateX(Math.PI / 2);           // 悬空的就朝着人
        else g.rotation.y = Math.atan2(p.x, p.z) + Math.PI;                                // 箭头朝远处
        const ring = new THREE.Mesh(RING_GEO, ringMat(0.7)), disc = new THREE.Mesh(DISC_GEO, ringMat(0.16)), arr = new THREE.Mesh(ARROW_GEO, ringMat(0.75));
        [ring, disc, arr].forEach(m => { m.renderOrder = 10; m.userData.link = lk; g.add(m); }); rings.add(g);
        const d = document.createElement('button'); d.className = 'walk-go' + (lk.door ? ' door' : ''); d.innerHTML = `<span>${lk.label || ('去' + NODES[lk.to].n)}${lk.door ? ' ›' : ''}</span>`;
        d.onclick = e => { e.stopPropagation(); go(lk); }; lbox.appendChild(d);
        HS.push({ d, k: 'go', at: p.clone().add(new THREE.Vector3(0, 1.1 * sc, 0)), link: lk, g, ring });
      });
      (node.spots || []).forEach(s => {
        const sp = spObj(s.n); if (!sp) return;
        const d = document.createElement('button'); d.className = 'walk-spot'; d.innerHTML = `<i></i><span>${sp.n}</span>`;
        d.onclick = e => { e.stopPropagation(); if (debug) return; self.onSpot && self.onSpot(loc, sp); }; lbox.appendChild(d);
        HS.push({ d, k: 'sp', at: new THREE.Vector3(s.at[0], s.at[1], s.at[2]).normalize().multiplyScalar(R * 0.8), sp });
      });
      need = true;
    }
    const BOX = [];   // 已摆好的标签矩形（复用，不在循环里新建）
    function labels() {
      let nb = 0;
      for (let i = 0; i < HS.length; i++) {
        const o = HS[i]; V.copy(o.at).applyMatrix4(cam.matrixWorldInverse);
        if (V.z > -0.5) { o.d.style.display = 'none'; continue; }              // 转到背后就藏起来
        V.copy(o.at).project(cam);
        let x = (V.x + 1) / 2 * W, y = (1 - V.y) / 2 * H;
        if (x < -80 || x > W + 80 || y < -40 || y > H + 40) { o.d.style.display = 'none'; continue; }
        if (o.k === 'sp') {      // 查看点挤在一起时往下错开
          for (let t = 0; t < 3; t++) { let hit = false; for (let j = 0; j < nb; j++) { const b = BOX[j]; if (Math.abs(b[0] - x) < 64 && Math.abs(b[1] - y) < 34) { hit = true; break; } } if (!hit) break; y += 36; }
        }
        const b = BOX[nb] || (BOX[nb] = [0, 0]); b[0] = x; b[1] = y; nb++;
        o.d.style.display = ''; o.d.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
        if (o.sp) o.d.dataset.st = self.state ? self.state(loc, o.sp) : '';
      }
    }

    /* ---------- 小地图 ---------- */
    const mini = el.querySelector('.walk-mini'), mg = mini.getContext('2d'), MINI = {};
    function drawMini() {
      if (!node || !node.at) { mini.style.display = 'none'; return; } mini.style.display = '';
      const fl = node.f || 1, W2 = mini.width, H2 = mini.height;
      const C = MINI[fl] || (MINI[fl] = (() => { const rooms = (HOT[fl] || []).filter(r => r.box); const x0 = Math.min(...rooms.map(r => r.box[0])), x1 = Math.max(...rooms.map(r => r.box[2])), z0 = Math.min(...rooms.map(r => r.box[1])), z1 = Math.max(...rooms.map(r => r.box[3]));
        const sc = Math.min((W2 - 12) / (x1 - x0), (H2 - 12) / (z1 - z0)); return { rooms, x0, z0, sc, ox: (W2 - (x1 - x0) * sc) / 2, oz: (H2 - (z1 - z0) * sc) / 2 }; })());
      mg.clearRect(0, 0, W2, H2); mg.fillStyle = 'rgba(12,9,6,.72)'; mg.fillRect(0, 0, W2, H2);
      for (let i = 0; i < C.rooms.length; i++) { const r = C.rooms[i], a = C.ox + (r.box[0] - C.x0) * C.sc, b = C.oz + (r.box[1] - C.z0) * C.sc, c = C.ox + (r.box[2] - C.x0) * C.sc, d = C.oz + (r.box[3] - C.z0) * C.sc, me = r.loc === loc;
        mg.fillStyle = me ? 'rgba(200,150,70,.45)' : 'rgba(255,240,210,.06)'; mg.fillRect(a, b, c - a, d - b); mg.strokeStyle = me ? '#e8b85a' : 'rgba(220,200,160,.35)'; mg.lineWidth = me ? 2 : 1; mg.strokeRect(a + 0.5, b + 0.5, c - a - 1, d - b - 1); }
      const hy = yaw + (node.rot || 0) * Math.PI / 180, px = C.ox + (node.at[0] - C.x0) * C.sc, pz = C.oz + (node.at[1] - C.z0) * C.sc;
      mg.strokeStyle = '#ff8a6a'; mg.lineWidth = 2; mg.beginPath(); mg.moveTo(px, pz); mg.lineTo(px + Math.sin(hy) * 14, pz + Math.cos(hy) * 14); mg.stroke();
      mg.fillStyle = '#ff5a3a'; mg.beginPath(); mg.arc(px, pz, 4, 0, 7); mg.fill();
    }

    /* ---------- 主循环 ---------- */
    let tw = null;   // 转场中的镜头动画
    function frame(now) {
      if (!el.isConnected) { raf = 0; return; }
      raf = requestAnimationFrame(frame);
      const dt = Math.min(50, now - (last || now)); last = now;
      if (tw) { const t = Math.max(0, Math.min(1, (now - tw.t0) / tw.ms)), e = t * t * (3 - 2 * t); yaw = tYaw = tw.y0 + (tw.y1 - tw.y0) * e; fov = tFov = tw.f0 + (tw.f1 - tw.f0) * e; if (t >= 1) { const cb = tw.done; tw = null; cb && cb(); } need = true; }
      else {
        if (!dragging && (Math.abs(vYaw) > 1e-5 || Math.abs(vPitch) > 1e-5)) { tYaw += vYaw * dt; tPitch += vPitch * dt; const k = Math.pow(0.9, dt / 16); vYaw *= k; vPitch *= k; }   // 松手后的惯性
        tPitch = Math.max(-1.45, Math.min(1.45, tPitch)); tFov = Math.max(FOV_MIN, Math.min(FOV_MAX, tFov));
        const a = 1 - Math.pow(0.78, dt / 16);           // 阻尼：镜头追着目标走
        if (Math.abs(tYaw - yaw) > 1e-5 || Math.abs(tPitch - pitch) > 1e-5 || Math.abs(tFov - fov) > 1e-3) { yaw += (tYaw - yaw) * a; pitch += (tPitch - pitch) * a; fov += (tFov - fov) * a; need = true; }
      }
      let draw = need;
      if (now - lastDust > (MOBILE ? 66 : 40)) { lastDust = now; draw = true; dust.userData.tick(now / 1000, cam, -EYE_H); const pulse = 0.55 + 0.2 * Math.sin(now / 420); for (let i = 0; i < rings.children.length; i++) rings.children[i].children[0].material.opacity = pulse; }
      if (!draw || !node) return; place(); renderer.render(scene, cam);
      if (need) { need = false; labels(); drawMini(); }
    }

    /* ---------- 机位切换 ---------- */
    const yawOf = v => Math.atan2(v[0], v[2]);
    const pitchOf = v => Math.atan2(v[1], Math.hypot(v[0], v[2]));
    self._keep = k => !!(node && (k === node.id || (node.links || []).some(l => l.to === k)));
    function show(id, heading, pt) {
      return tex(id, renderer).then(t => {
        node = NODES[id]; node.id = id; sphMat.map = t; sphMat.needsUpdate = true;
        const changed = node.loc !== loc; loc = node.loc;
        el.querySelector('.walk-t b').textContent = rname(loc);
        if (heading !== undefined) { yaw = tYaw = heading; } if (pt !== undefined) pitch = tPitch = pt;
        vYaw = vPitch = 0; build(); need = true;
        if (changed && self.onRoom) self.onRoom(loc);
        (node.links || []).forEach(l => NODES[l.to] && tex(l.to, renderer));   // 预载相邻机位
      });
    }
    function go(lk) {
      if (busy) return; busy = true;
      const next = tex(lk.to, renderer);
      let y1 = yawOf(lk.at); while (y1 - yaw > Math.PI) y1 -= 2 * Math.PI; while (yaw - y1 > Math.PI) y1 += 2 * Math.PI;
      fade.classList.add('on');                       // 镜头往前推 + 黑场淡入
      tw = { t0: performance.now(), ms: 480, y0: yaw, y1, f0: fov, f1: Math.max(FOV_MIN - 8, fov - 16), done: () => {
        next.then(() => show(lk.to, y1, -0.05)).then(() => { fov = baseFov - 10; tFov = baseFov; need = true;
          requestAnimationFrame(() => { fade.classList.remove('on'); busy = false;
            const nd = NODES[lk.to];   // 同一间屋里换位置：落地后镜头顺势转向这个机位该看的地方
            if (!lk.door && nd.look) { let y2 = yawOf(nd.look); while (y2 - yaw > Math.PI) y2 -= 2 * Math.PI; while (yaw - y2 > Math.PI) y2 += 2 * Math.PI;
              tw = { t0: performance.now() + 250, ms: 1100, y0: yaw, y1: y2, f0: baseFov - 10, f1: baseFov }; } }); }); } };
    }
    function enterNode(id) {
      const nd = NODES[id]; wait.style.display = '';
      return show(id, yawOf(nd.look || [0, 0, 1]), pitchOf(nd.look || [0, -0.1, 1])).then(() => { fov = tFov = baseFov; wait.style.display = 'none'; });
    }

    /* ---------- 操作：拖拽 / 惯性 / 缩放 / 点击 ---------- */
    const cv = renderer.domElement; cv.style.touchAction = 'none';
    const ptr = new Map(); let pinch = 0, dragging = false, moved = 0, lx = 0, ly = 0, lt = 0;
    const rate = () => (fov * Math.PI / 180) / H;      // 一个像素转多少弧度：视角越窄转得越细
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); dragging = false; }
      else { dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; lt = performance.now(); vYaw = vPitch = 0; } });
    cv.addEventListener('pointermove', e => {
      if (!ptr.has(e.pointerId)) return; ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptr.size === 2 && pinch) { const [a, b] = [...ptr.values()], d = Math.hypot(a.x - b.x, a.y - b.y); tFov *= pinch / d; pinch = d; need = true; return; }
      if (!dragging || tw) return;
      const dx = e.clientX - lx, dy = e.clientY - ly, now = performance.now(), dt = Math.max(1, now - lt); moved += Math.abs(dx) + Math.abs(dy);
      const k = rate(); tYaw += dx * k; tPitch += dy * k;
      vYaw = vYaw * 0.6 + (dx * k / dt) * 0.4; vPitch = vPitch * 0.6 + (dy * k / dt) * 0.4;
      lx = e.clientX; ly = e.clientY; lt = now; need = true; });
    const up = e => { const was = ptr.has(e.pointerId); ptr.delete(e.pointerId); if (ptr.size < 2) pinch = 0;
      if (!was || !dragging) return; dragging = false;
      if (performance.now() - lt > 90) vYaw = vPitch = 0;            // 停住再松手就不滑
      if (moved < 6) { vYaw = vPitch = 0; click(e); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); tFov += e.deltaY * 0.04; need = true; }, { passive: false });
    const ray = new THREE.Raycaster(), NDC = new THREE.Vector2();
    function click(e) {
      const r = cv.getBoundingClientRect(); NDC.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      place(); ray.setFromCamera(NDC, cam);
      if (debug) return pick(ray.ray.direction, e);
      const hit = ray.intersectObjects(rings.children, true)[0]; if (hit && hit.object.userData.link) go(hit.object.userData.link);
    }
    cv.addEventListener('pointermove', e => { if (dragging || debug) return; const r = cv.getBoundingClientRect(); NDC.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(NDC, cam); cv.style.cursor = ray.intersectObjects(rings.children, true).length ? 'pointer' : 'grab'; });

    /* ---------- 坐标拾取调试模式 ---------- */
    const pk = el.querySelector('.pano-pick'), dbtn = el.querySelector('.pano-dbg');
    function pick(dir, e) {
      const x = +(dir.x * 10).toFixed(2), y = +(dir.y * 10).toFixed(2), z = +(dir.z * 10).toFixed(2), txt = `[${x}, ${y}, ${z}]`;
      const copy = () => { const ok = () => pk.querySelector('em').textContent = '已复制'; if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, () => fb()); else fb();
        function fb() { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (er) {} ta.remove(); } };
      pk.innerHTML = `<b>${node.id}</b> · ${esc(node.n)}<code>${txt}</code><small>朝向 yaw ${(yaw * 180 / Math.PI).toFixed(1)}° · 视角 ${fov.toFixed(0)}°</small><div><button data-p="c">复制坐标</button><em></em></div>`;
      pk.style.display = 'block'; const r = el.getBoundingClientRect();
      pk.style.left = Math.min(r.width - 250, Math.max(8, e.clientX - r.left + 12)) + 'px'; pk.style.top = Math.min(r.height - 130, Math.max(60, e.clientY - r.top + 12)) + 'px';
      pk.querySelector('[data-p=c]').onclick = ev => { ev.stopPropagation(); copy(); };
      copy(); console.log('[pano pick]', node.id, txt);
    }
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    if (dbtn) dbtn.onclick = () => { debug = !debug; dbtn.classList.toggle('on', debug); el.classList.toggle('debug', debug); pk.style.display = 'none';
      el.querySelector('.walk-tip').textContent = debug ? '调试：点画面任意处，拾取并复制该点坐标' : '拖动环视 · 点地上的圆圈走过去 · 点亮处查看'; };
    if (/debug=1/.test(location.search) && dbtn) dbtn.onclick();

    /* ---------- 对外接口 ---------- */
    self.enter = l => { if (l === loc && node) return; const ids = BYLOC[l]; if (ids) { loc = null; enterNode(ids[0]); } };
    self.node = id => NODES[id] && enterNode(id);
    self.attach = host => { host.appendChild(el); fit(); if (!raf) raf = requestAnimationFrame(frame); need = true; };
    self.refresh = () => { need = true; };
    self.info = h => { el.querySelector('.walk-i').innerHTML = h; };
    self.sub = h => { el.querySelector('.walk-t small').innerHTML = h; };
    self.loc = () => loc;
    self.cur = () => node && node.id;
    self._state = () => ({ yaw, pitch, fov, busy, id: node && node.id });
    self.look = (y, p, f) => { yaw = tYaw = y; if (p !== undefined) pitch = tPitch = p; if (f) fov = tFov = f; need = true; };
    self.debug = on => { if (!!on !== debug && dbtn) dbtn.onclick(); };
    el.querySelector('[data-w=back]').onclick = () => self.onBack && self.onBack();
    new ResizeObserver(fit).observe(cbox);
    document.addEventListener('visibilitychange', () => { last = 0; need = true; });
    return self;
  }
})();
