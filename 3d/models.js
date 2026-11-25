// 三维构件与家具。单位：尺。x 向东，z 向南，y 向上。
const M = {};
(function () {
  const mats = {};
  function mat(color, opt = {}) {
    const key = color + JSON.stringify(opt);
    if (!mats[key]) mats[key] = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, opt));
    return mats[key];
  }
  M.mat = mat;
  M.texMat = (tex, rx, ry, opt = {}) => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshStandardMaterial(Object.assign({ map: t, roughness: 0.9 }, opt)); };
  function add(parent, mesh) { mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh; }
  M.box = (p, w, h, d, x, y, z, m, ry = 0) => { const o = add(p, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof m === 'string' ? mat(m) : m)); o.position.set(x, y + h / 2, z); o.rotation.y = ry; return o; };
  M.cyl = (p, r1, r2, h, x, y, z, m, seg = 20) => { const o = add(p, new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), typeof m === 'string' ? mat(m) : m)); o.position.set(x, y + h / 2, z); return o; };
  M.sph = (p, r, x, y, z, m, seg = 12) => { const o = add(p, new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), typeof m === 'string' ? mat(m) : m)); o.position.set(x, y, z); return o; };
  M.plane = (p, w, d, x, y, z, m) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); o.rotation.x = -Math.PI / 2; o.position.set(x, y, z); o.receiveShadow = true; p.add(o); return o; };
  M.group = (p, x = 0, y = 0, z = 0, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; p.add(g); return g; };

  const WOOD = '#6b4128', WOOD_D = '#3f2516', WOOD_L = '#9a6a42', RED = '#7a2a22';

  // 地面
  M.floor = (p, x0, z0, x1, z1, tex, scale = 12, y = 0.02, opt) => M.plane(p, x1 - x0, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, M.texMat(tex, (x1 - x0) / scale, (z1 - z0) / scale, opt));

  // 墙：剖切高度 H，切口压黑
  M.wall = (p, x0, z0, x1, z1, H = 5, t = 1.2, color = '#e8e0cf', openings = []) => {
    const horiz = Math.abs(z1 - z0) < 1e-6;
    const L = horiz ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
    const a0 = horiz ? Math.min(x0, x1) : Math.min(z0, z1);
    const segs = []; let cur = 0;
    const ops = openings.map(o => ({ s: o[0] - a0, e: o[1] - a0, sill: o[2] || 0, kind: o[3] || 'door' })).sort((a, b) => a.s - b.s);
    ops.forEach(o => { if (o.s > cur) segs.push([cur, o.s, H, 0]); if (o.sill > 0) segs.push([o.s, o.e, o.sill, 0, o.kind]); cur = o.e; });
    if (cur < L) segs.push([cur, L, H, 0]);
    segs.forEach(([s, e, h, _, kind]) => {
      const len = e - s, c = a0 + (s + e) / 2;
      const w = horiz ? len + (s === 0 || e === L ? t : 0) : t, d = horiz ? t : len + (s === 0 || e === L ? t : 0);
      const bx = horiz ? c : x0, bz = horiz ? z0 : c;
      M.box(p, w, h, d, bx, 0, bz, color);
      M.box(p, w + 0.02, 0.06, d + 0.02, bx, h, bz, '#2a221c');            // 切口
      if (kind === 'win') {                                                // 窗框 + 玻璃
        M.box(p, horiz ? len : 0.3, 0.25, horiz ? 0.3 : len, bx, h, bz, WOOD_D);
        const g = M.box(p, horiz ? len : 0.1, 1.6, horiz ? 0.1 : len, bx, h + 0.25, bz, mat('#a9c3c6', { transparent: true, opacity: 0.35, roughness: 0.1 }));
        g.castShadow = false;
      }
    });
  };
  // 打开的门扇
  M.door = (p, x, z, w, angle, color = WOOD) => { const g = M.group(p, x, 0, z, angle); M.box(g, w, 4.6, 0.25, w / 2, 0, 0, color); return g; };

  // 家具
  M.table = (p, x, z, w, d, h = 2.6, ry = 0, top = WOOD) => {
    const g = M.group(p, x, 0, z, ry);
    M.box(g, w, 0.25, d, 0, h - 0.25, 0, top);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => M.box(g, 0.3, h - 0.25, 0.3, a * (w / 2 - 0.3), 0, b * (d / 2 - 0.3), WOOD_D));
    M.box(g, w - 0.4, 0.3, 0.15, 0, h - 0.6, d / 2 - 0.25, WOOD_D); M.box(g, w - 0.4, 0.3, 0.15, 0, h - 0.6, -d / 2 + 0.25, WOOD_D);
    return g;
  };
  M.chair = (p, x, z, ry = 0, c = WOOD) => {
    const g = M.group(p, x, 0, z, ry);
    M.box(g, 1.5, 0.18, 1.4, 0, 1.45, 0, c);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => M.box(g, 0.16, 1.45, 0.16, a * 0.62, 0, b * 0.58, WOOD_D));
    M.box(g, 1.5, 1.9, 0.16, 0, 1.6, -0.62, c);
    return g;
  };
  M.armchair = (p, x, z, ry = 0) => {
    const g = M.group(p, x, 0, z, ry);
    M.box(g, 2.2, 0.25, 2, 0, 1.4, 0, WOOD_D);
    M.box(g, 1.9, 0.12, 1.7, 0, 1.65, 0.05, RED);
    M.box(g, 2.2, 2.4, 0.22, 0, 1.4, -0.9, WOOD_D);
    M.box(g, 0.2, 1, 2, -1, 1.4, 0, WOOD_D); M.box(g, 0.2, 1, 2, 1, 1.4, 0, WOOD_D);
    M.box(g, 2, 1.4, 1.8, 0, 0, 0, WOOD);
    return g;
  };
  M.sofa = (p, x, z, w = 6, ry = 0) => {
    const g = M.group(p, x, 0, z, ry);
    M.box(g, w, 1.4, 2.6, 0, 0, 0, '#6a3a2e'); M.box(g, w - 1, 0.5, 2, 0, 1.4, 0.2, '#93594a');
    M.box(g, w, 2.4, 0.6, 0, 0, -1.1, '#6a3a2e'); M.box(g, 0.6, 2, 2.6, -w / 2 + 0.3, 0, 0, '#6a3a2e'); M.box(g, 0.6, 2, 2.6, w / 2 - 0.3, 0, 0, '#6a3a2e');
    return g;
  };
  M.roundTable = (p, x, z, r = 1.4, h = 2.4) => { M.cyl(p, r, r, 0.2, x, h - 0.2, z, WOOD); M.cyl(p, 0.18, 0.25, h - 0.2, x, 0, z, WOOD_D); };
  M.bed = (p, x, z, w, d, ry = 0, canopy = true) => {
    const g = M.group(p, x, 0, z, ry);
    M.box(g, w, 1.4, d, 0, 0, 0, WOOD_D);
    M.box(g, w - 0.4, 0.5, d - 0.4, 0, 1.4, 0, '#e6dcc6');
    const q = M.box(g, w - 0.5, 0.35, d * 0.62, 0, 1.85, d * 0.15, M.texMat(TX.quilt(), 1, 1)); q.castShadow = true;
    M.box(g, w * 0.38, 0.45, 1, -w * 0.22, 1.9, -d / 2 + 0.9, '#f1ead8'); M.box(g, w * 0.38, 0.45, 1, w * 0.22, 1.9, -d / 2 + 0.9, '#f1ead8');
    M.box(g, w, 2.2, 0.25, 0, 1.4, -d / 2, WOOD_D);
    if (canopy) {
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => M.box(g, 0.3, 7, 0.3, a * (w / 2 - 0.15), 0, b * (d / 2 - 0.15), WOOD_D));
      M.box(g, w, 0.3, 0.3, 0, 7, -d / 2 + 0.15, WOOD_D); M.box(g, w, 0.3, 0.3, 0, 7, d / 2 - 0.15, WOOD_D);
      M.box(g, 0.3, 0.3, d, -w / 2 + 0.15, 7, 0, WOOD_D); M.box(g, 0.3, 0.3, d, w / 2 - 0.15, 7, 0, WOOD_D);
      M.box(g, w, 1.6, 0.12, 0, 5.4, d / 2 - 0.15, mat('#e8dcc0', { transparent: true, opacity: 0.55 }));
    }
    return g;
  };
  M.wardrobe = (p, x, z, w, d, h = 6.5, ry = 0) => {
    const g = M.group(p, x, 0, z, ry);
    M.box(g, w, h, d, 0, 0, 0, WOOD);
    M.box(g, 0.06, h - 0.6, 0.05, 0, 0.3, d / 2, WOOD_D);
    M.box(g, 0.3, 0.6, 0.08, -0.25, h / 2, d / 2, '#c49a48'); M.box(g, 0.3, 0.6, 0.08, 0.25, h / 2, d / 2, '#c49a48');
    return g;
  };
  M.duobao = (p, x, z, w, d, h, ry, missing = 6) => {          // 多宝格：格子错落，每格一只药罐
    const g = M.group(p, x, 0, z, ry);
    const cols = Math.max(2, Math.round(w / 3.6)), rows = 4, cw = w / cols, rh = h / rows;
    M.box(g, w, h, 0.15, 0, 0, -d / 2 + 0.08, '#b88a5a');
    for (let r = 0; r <= rows; r++) M.box(g, w, 0.22, d, 0, Math.min(r * rh, h - 0.22), 0, '#8a5a36');
    for (let c = 0; c <= cols; c++) M.box(g, 0.22, h, d, -w / 2 + c * cw, 0, 0, '#8a5a36');
    let n = 0;
    const cl = ['#3f6b6a', '#d8cfb8', '#7a5a3a', '#a8b8b0', '#5a7a8a', '#c9b48a'];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cx = -w / 2 + (c + 0.5) * cw, cy = r * rh + 0.22;
      if (n++ === missing) { M.box(g, 1.3, 0.03, 1.3, cx, cy, 0, '#cbb48c'); continue; }
      M.cyl(g, 0.65, 0.55, rh * 0.55, cx, cy, 0.2, cl[(r * 3 + c) % cl.length], 16);
      M.cyl(g, 0.45, 0.45, 0.25, cx, cy + rh * 0.55, 0.2, '#2a4a54', 16);
    }
    return g;
  };
  M.bookcase = (p, x, z, w, d, h, ry = 0) => {
    const g = M.group(p, x, 0, z, ry);
    M.box(g, w, h, d, 0, 0, 0, WOOD_D);
    const shelves = 4;
    for (let s = 0; s < shelves; s++) { const b = M.box(g, w - 0.4, h / shelves - 0.4, 0.1, 0, s * h / shelves + 0.2, d / 2 + 0.01, M.texMat(TX.books(), w / 8, 1)); }
    return g;
  };
  M.ironBox = (p, x, y, z, ry = 0) => {
    const g = M.group(p, x, y, z, ry);
    M.box(g, 2, 1.3, 1.5, 0, 0, 0, '#5a2e1a'); M.box(g, 0.5, 0.5, 0.1, 0, 0.4, 0.78, '#c8a048');
    return g;
  };
  M.screen = (p, x, z, n = 4, seg = 1.6, ry = 0) => {
    const g = M.group(p, x, 0, z, ry);
    for (let i = 0; i < n; i++) { const pnl = M.box(g, seg, 5.5, 0.15, i * seg * 0.95, 0, (i % 2) * 0.5, '#4a2e1c'); pnl.rotation.y = (i % 2 ? -0.3 : 0.3); M.box(g, seg - 0.3, 4.5, 0.17, i * seg * 0.95, 0.5, (i % 2) * 0.5, '#d9c69a').rotation.y = (i % 2 ? -0.3 : 0.3); }
    return g;
  };
  M.plant = (p, x, z, s = 1, y = 0) => {
    M.cyl(p, 0.6 * s, 0.45 * s, 1.1 * s, x, y, z, '#8a4a30');
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const l = M.box(p, 0.25 * s, 0.08, 1.8 * s, x + Math.cos(a) * 0.6 * s, y + 1.3 * s, z + Math.sin(a) * 0.6 * s, '#4a6b3c'); l.rotation.y = -a + Math.PI / 2; l.rotation.x = 0.6; }
  };
  M.tree = (p, x, z, r = 6, h = 9, col = '#4f6b42') => {
    M.cyl(p, 0.45, 0.7, h * 0.6, x, 0, z, '#4a3624');
    const g = M.group(p, x, 0, z);
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2, rr = i === 0 ? 0 : r * 0.55;
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r * (i === 0 ? 0.7 : 0.5), 1), mat(i % 2 ? col : '#5f7c4c', { flatShading: true }));
      s.position.set(Math.cos(a) * rr, h * 0.62 + (i === 0 ? r * 0.35 : Math.sin(i * 1.7) * 0.8), Math.sin(a) * rr);
      s.castShadow = true; s.receiveShadow = true; g.add(s);
    }
  };
  M.shrub = (p, x, z, r = 1.2) => { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat('#5b7a49', { flatShading: true })); s.position.set(x, r * 0.7, z); s.castShadow = s.receiveShadow = true; p.add(s); };
  M.trunkBox = (p, x, z, w, d, h, ry = 0, y = 0) => {
    const g = M.group(p, x, y, z, ry);
    M.box(g, w, h, d, 0, 0, 0, '#7a5332'); M.box(g, 0.25, h + 0.05, d + 0.05, -w * 0.28, 0, 0, '#3a2414'); M.box(g, 0.25, h + 0.05, d + 0.05, w * 0.28, 0, 0, '#3a2414');
    M.box(g, 0.5, 0.4, 0.06, 0, h * 0.5, d / 2 + 0.02, '#c8a048');
    return g;
  };
  M.covered = (p, x, z, w, d, h, ry = 0) => {
    const g = M.group(p, x, 0, z, ry);
    const geo = new THREE.BoxGeometry(w, h, d, 4, 2, 4); const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); if (y < 0) { pos.setX(i, pos.getX(i) * 1.08); pos.setZ(i, pos.getZ(i) * 1.08); } pos.setY(i, y + Math.sin(pos.getX(i) * 3) * 0.08); }
    geo.computeVertexNormals();
    const o = new THREE.Mesh(geo, mat('#ece6d8')); o.position.y = h / 2; o.castShadow = o.receiveShadow = true; g.add(o);
    return g;
  };
  M.rattan = (p, x, z, ry = 0) => {
    const g = M.group(p, x, 0, z, ry);
    M.cyl(g, 1.2, 0.9, 1.5, 0, 0, 0, '#b08a4a'); M.cyl(g, 1.1, 1.1, 0.15, 0, 1.5, 0, '#c9a560');
    const back = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 8, 20, Math.PI), mat('#a07a3a')); back.position.set(0, 2.3, -0.4); back.rotation.x = -0.2; back.castShadow = true; g.add(back);
    return g;
  };
  M.stove = (p, x, z, w, d, ry = 0) => {
    const g = M.group(p, x, 0, z, ry);
    M.box(g, w, 2.8, d, 0, 0, 0, '#8a7f70'); M.box(g, w + 0.2, 0.2, d + 0.2, 0, 2.8, 0, '#6e655a');
    [-w / 4, w / 4].forEach(cx => { M.cyl(g, d * 0.32, d * 0.2, 0.6, cx, 2.6, 0, '#2a2622'); M.cyl(g, d * 0.36, d * 0.36, 0.15, cx, 3.1, 0, '#6b4a2a'); });
    M.box(g, 1, 6, 1, w / 2 - 0.6, 0, -d / 2 + 0.6, '#7a7064');
    return g;
  };
  M.vat = (p, x, z, r = 1.3) => { M.cyl(p, r, r * 0.8, 2.2, x, 0, z, '#4a3a2e'); M.cyl(p, r * 0.88, r * 0.88, 0.05, x, 2.05, z, M.mat('#5f7d7a', { roughness: 0.2 })); };
  M.logs = (p, x, z, w, d, h) => {
    const g = M.group(p, x, 0, z);
    for (let y = 0; y < h; y += 0.6) for (let i = -w / 2 + 0.3; i < w / 2; i += 0.62) { const c = M.cyl(g, 0.28, 0.28, d, i + (y % 1.2 ? 0.3 : 0), y + 0.3, 0, '#8a6440', 8); c.rotation.x = Math.PI / 2; c.position.y = y + 0.3; }
  };
  M.well = (p, x, z, r = 2.2) => {
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; M.box(p, 1.1, 1.3, 0.9, x + Math.cos(a) * (r + 0.4), 0, z + Math.sin(a) * (r + 0.4), '#8c8a80').rotation.y = -a; }
    M.box(p, r * 2.6, 0.5, r * 2.2, x, 1.3, z, M.texMat(TX.stone(), 1, 1));
    M.box(p, r * 2.4, 0.08, 0.15, x, 1.8, z - r * 0.7, '#3a3028'); M.box(p, r * 2.4, 0.08, 0.15, x, 1.8, z + r * 0.7, '#3a3028');
  };
  M.lamp = (p, x, y, z) => { M.cyl(p, 0.35, 0.45, 0.25, x, y, z, '#5a4a3a'); M.cyl(p, 0.2, 0.3, 0.9, x, y + 0.25, z, M.mat('#f2e6c0', { emissive: '#d9b060', emissiveIntensity: 0.6, transparent: true, opacity: 0.85 })); };
  M.carpet = (p, x0, z0, x1, z1, field, border, y = 0.05) => M.plane(p, x1 - x0, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, new THREE.MeshStandardMaterial({ map: TX.carpet(field, border), roughness: 1 }));
  M.basin = (p, x, z) => { M.cyl(p, 0.9, 0.7, 2.6, x, 0, z, '#eeeeea'); };
  M.toilet = (p, x, z) => { M.box(p, 1.2, 1.4, 1.6, x, 0, z, '#eeeeea'); M.box(p, 1.4, 1.8, 0.6, x, 0, z - 1, '#eeeeea'); };
  M.gramophone = (p, x, z) => { M.box(p, 1.4, 2.6, 1.4, x, 0, z, WOOD_D); const h = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 16, 1, true), M.mat('#c8a048', { side: THREE.DoubleSide, metalness: 0.4, roughness: 0.4 })); h.position.set(x + 0.5, 3.6, z); h.rotation.z = 1.0; h.castShadow = true; p.add(h); };
  M.roofWallCap = (p, x0, z0, x1, z1, H, t) => {                 // 院墙瓦顶
    const horiz = Math.abs(z1 - z0) < 1e-6, L = horiz ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
    const shape = new THREE.Shape(); shape.moveTo(-t, 0); shape.lineTo(0, 0.9); shape.lineTo(t, 0); shape.lineTo(-t, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: L + t, bevelEnabled: false });
    const o = new THREE.Mesh(geo, M.texMat(TX.roofTile(), 0.2, L / 6)); o.castShadow = o.receiveShadow = true;
    if (horiz) { o.rotation.y = Math.PI / 2; o.position.set(Math.min(x0, x1) - t / 2, H, z0); }
    else { o.position.set(x0, H, Math.min(z0, z1) - t / 2); }
    p.add(o);
  };
  M.courtWall = (p, x0, z0, x1, z1, H = 7, t = 1.2, openings = []) => {
    M.wall(p, x0, z0, x1, z1, H, t, '#d9d2c2', openings);
    const horiz = Math.abs(z1 - z0) < 1e-6; const a0 = horiz ? Math.min(x0, x1) : Math.min(z0, z1), a1 = horiz ? Math.max(x0, x1) : Math.max(z0, z1);
    let cur = a0; [...openings, [a1, a1]].sort((a, b) => a[0] - b[0]).forEach(o => { if (o[0] > cur) { if (horiz) M.roofWallCap(p, cur, z0, o[0], z0, H, 1.1); else M.roofWallCap(p, x0, cur, x0, o[0], H, 1.1); } cur = o[1]; });
  };
  M.gatehouse = (p, x, z, w, ry = 0) => {                         // 院门门楼
    const g = M.group(p, x, 0, z, ry);
    M.box(g, 1.2, 8.5, 1.6, -w / 2 - 0.6, 0, 0, '#d9d2c2'); M.box(g, 1.2, 8.5, 1.6, w / 2 + 0.6, 0, 0, '#d9d2c2');
    const shape = new THREE.Shape(); shape.moveTo(-2.4, 0); shape.quadraticCurveTo(-0.6, 0.5, 0, 2); shape.quadraticCurveTo(0.6, 0.5, 2.4, 0); shape.lineTo(-2.4, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: w + 4, bevelEnabled: false });
    const r = new THREE.Mesh(geo, M.texMat(TX.roofTile(), 0.3, 1)); r.rotation.y = Math.PI / 2; r.position.set(-w / 2 - 2, 8.5, 0); r.castShadow = r.receiveShadow = true; g.add(r);
    M.box(g, w / 2, 7, 0.3, -w / 4, 0, -1.6, '#5a2e1e').rotation.y = 0.9; M.box(g, w / 2, 7, 0.3, w / 4, 0, -1.6, '#5a2e1e').rotation.y = -0.9;
    return g;
  };
  M.balustrade = (p, x0, x1, z, y = 0) => {
    M.box(p, x1 - x0, 0.3, 0.8, (x0 + x1) / 2, y + 3.2, z, '#cbbfa4');
    M.box(p, x1 - x0, 0.3, 0.8, (x0 + x1) / 2, y, z, '#cbbfa4');
    for (let x = x0 + 0.6; x < x1; x += 1.3) { M.cyl(p, 0.3, 0.22, 2.9, x, y + 0.3, z, '#d8ceb6', 10); }
  };
  // 人物：伏案者
  M.slumped = (p, x, z, ry = 0) => {
    const g = M.group(p, x, 0, z, ry);
    const cloth = M.mat('#4a4b5c'), skin = M.mat('#d4b39a'), hair = M.mat('#1d1916');
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.95, 2.2, 6, 12), cloth); torso.position.set(0, 3.3, 1.0); torso.rotation.x = -1.05; torso.castShadow = true; g.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 16), hair); head.position.set(-0.7, 3.3, -0.9); head.castShadow = true; g.add(head);
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.33, 2.2, 4, 8), cloth); armL.position.set(-0.6, 2.95, -0.7); armL.rotation.z = Math.PI / 2; armL.rotation.y = 0.5; armL.castShadow = true; g.add(armL);
    const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.33, 2.4, 4, 8), cloth); armR.position.set(1.6, 2.95, -0.4); armR.rotation.z = Math.PI / 2; armR.rotation.y = -0.4; armR.castShadow = true; g.add(armR);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), skin); hand.position.set(2.8, 2.9, -0.9); g.add(hand);
    const legs = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 1.6, 4, 8), cloth); legs.position.set(0, 1.9, 2.4); legs.rotation.x = 1.4; legs.castShadow = true; g.add(legs);
    const knife = M.box(g, 0.25, 1.8, 0.25, -0.7, 4.1, 0.6, M.mat('#d4a83c', { metalness: 0.6, roughness: 0.3, emissive: '#3a2a08' })); knife.rotation.x = 0.35; knife.rotation.z = 0.35;
    const blood = M.plane(g, 0.9, 0.7, -0.5, 3.75, 0.55, M.mat('#4a1410')); blood.rotation.x = -1.05 - Math.PI / 2 + Math.PI / 2;
    return g;
  };
})();
