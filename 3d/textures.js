// 程序化材质贴图（canvas）
const TX = {};
(function () {
  function cv(w, h, fn) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); fn(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function noise(g, w, h, n, alpha) {
    for (let i = 0; i < n; i++) { g.fillStyle = `rgba(0,0,0,${rnd(0, alpha)})`; g.fillRect(rnd(0, w), rnd(0, h), rnd(1, 3), rnd(1, 3)); }
  }
  TX.plank = (tint = [176, 128, 82]) => cv(512, 512, (g, w, h) => {
    const rows = 8, rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd(0, 200);
      while (x < w) {
        const L = rnd(180, 320), k = rnd(-18, 14);
        g.fillStyle = `rgb(${tint[0] + k},${tint[1] + k},${tint[2] + k})`; g.fillRect(x, r * rh, L, rh);
        g.strokeStyle = 'rgba(60,35,15,0.55)'; g.lineWidth = 2; g.strokeRect(x, r * rh, L, rh);
        for (let s = 0; s < 6; s++) { g.strokeStyle = `rgba(80,50,25,${rnd(0.05, 0.18)})`; g.lineWidth = 1; g.beginPath(); const yy = r * rh + rnd(4, rh - 4); g.moveTo(x, yy); g.bezierCurveTo(x + L / 3, yy + rnd(-3, 3), x + 2 * L / 3, yy + rnd(-3, 3), x + L, yy); g.stroke(); }
        x += L;
      }
    }
    noise(g, w, h, 4000, 0.08);
  });
  TX.herring = () => cv(512, 512, (g, w, h) => {
    g.fillStyle = '#b98a55'; g.fillRect(0, 0, w, h);
    const L = 96, W = 24;
    g.save(); g.translate(w / 2, h / 2); g.rotate(Math.PI / 4); g.translate(-w, -h);
    for (let y = 0; y < 2 * h + L; y += W) for (let x = 0; x < 2 * w + L; x += 2 * W) {
      const k = rnd(-16, 14);
      g.fillStyle = `rgb(${190 + k},${142 + k},${92 + k})`;
      const ox = (Math.floor(y / W) % 4) * W;
      g.fillRect(x + ox, y, L, W); g.strokeStyle = 'rgba(70,40,20,0.5)'; g.strokeRect(x + ox, y, L, W);
    }
    g.restore(); noise(g, w, h, 3000, 0.08);
  });
  TX.tile = () => cv(256, 256, (g, w, h) => {
    const n = 8, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      g.fillStyle = (i + j) % 2 ? '#e9e2d0' : '#3d3832'; g.fillRect(i * s, j * s, s, s);
      g.strokeStyle = 'rgba(0,0,0,0.25)'; g.strokeRect(i * s, j * s, s, s);
    }
    noise(g, w, h, 1500, 0.1);
  });
  TX.flowerTile = () => cv(256, 256, (g, w, h) => {
    const n = 4, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = i * s, y = j * s;
      g.fillStyle = '#d9cfb8'; g.fillRect(x, y, s, s);
      g.fillStyle = '#9a4a36'; g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.22, 0, 7); g.fill();
      g.fillStyle = '#d6b678'; g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.09, 0, 7); g.fill();
      g.fillStyle = '#4f6a5a'; [[0, 0], [s, 0], [0, s], [s, s]].forEach(([a, b]) => { g.beginPath(); g.arc(x + a, y + b, s * 0.16, 0, 7); g.fill(); });
      g.strokeStyle = 'rgba(0,0,0,0.25)'; g.strokeRect(x, y, s, s);
    }
    noise(g, w, h, 1500, 0.08);
  });
  TX.brick = () => cv(512, 512, (g, w, h) => {
    g.fillStyle = '#6e6c64'; g.fillRect(0, 0, w, h);
    const bw = 64, bh = 32;
    for (let r = 0; r < h / bh; r++) for (let c = -1; c < w / bw + 1; c++) {
      const k = rnd(-14, 12), x = c * bw + (r % 2 ? bw / 2 : 0);
      g.fillStyle = `rgb(${138 + k},${136 + k},${126 + k})`; g.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4);
    }
    noise(g, w, h, 5000, 0.12);
  });
  TX.mud = () => cv(512, 512, (g, w, h) => {
    g.fillStyle = '#8e8770'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const k = rnd(-25, 20); g.fillStyle = `rgba(${120 + k},${114 + k},${92 + k},0.5)`; g.beginPath(); g.ellipse(rnd(0, w), rnd(0, h), rnd(4, 20), rnd(3, 12), rnd(0, 3), 0, 7); g.fill(); }
    noise(g, w, h, 8000, 0.2);
  });
  TX.soil = () => cv(256, 256, (g, w, h) => {
    g.fillStyle = '#6b6450'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(40,36,28,0.35)'; g.fillRect(0, y, w, 8); }
    noise(g, w, h, 4000, 0.25);
  });
  TX.terrazzo = () => cv(256, 256, (g, w, h) => {
    g.fillStyle = '#cfc6b0'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 600; i++) { const k = rnd(-50, 10); g.fillStyle = `rgb(${150 + k},${140 + k},${120 + k})`; g.beginPath(); g.arc(rnd(0, w), rnd(0, h), rnd(0.6, 2.4), 0, 7); g.fill(); }
  });
  TX.square = (base = '#c8bea8') => cv(256, 256, (g, w, h) => {
    const n = 4, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const k = rnd(-10, 8); g.fillStyle = `rgb(${200 + k},${190 + k},${168 + k})`; g.fillRect(i * s, j * s, s, s); g.strokeStyle = 'rgba(60,50,40,0.45)'; g.lineWidth = 2; g.strokeRect(i * s, j * s, s, s); }
    noise(g, w, h, 3000, 0.1);
  });
  TX.stone = () => cv(256, 256, (g, w, h) => {
    g.fillStyle = '#9b9a92'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { const k = rnd(-20, 20); g.fillStyle = `rgba(${150 + k},${150 + k},${142 + k},0.5)`; g.fillRect(rnd(0, w), rnd(0, h), rnd(4, 18), rnd(2, 8)); }
    noise(g, w, h, 3000, 0.15);
  });
  TX.carpet = (field = '#6b2a24', border = '#2b3b52') => cv(512, 768, (g, w, h) => {
    g.fillStyle = border; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9a25e'; g.fillRect(18, 18, w - 36, h - 36);
    g.fillStyle = field; g.fillRect(30, 30, w - 60, h - 60);
    g.strokeStyle = '#c9a25e'; g.lineWidth = 3; g.strokeRect(46, 46, w - 92, h - 92);
    g.fillStyle = '#9b4a35'; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.26, h * 0.22, 0, 0, 7); g.fill();
    g.strokeStyle = '#d8b77a'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#d8b77a'; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.08, h * 0.06, 0, 0, 7); g.fill();
    // 角花：四角各一块扇形角云（天津地毯式）
    [[46, 46, 0], [w - 46, 46, Math.PI / 2], [w - 46, h - 46, Math.PI], [46, h - 46, -Math.PI / 2]].forEach(([x, y, r]) => { g.save(); g.translate(x, y); g.rotate(r);
      g.fillStyle = border; g.beginPath(); g.moveTo(0, 0); g.lineTo(90, 0); g.quadraticCurveTo(70, 30, 40, 40); g.quadraticCurveTo(30, 70, 0, 90); g.closePath(); g.fill();
      g.strokeStyle = '#c9a25e'; g.lineWidth = 2; g.stroke(); g.restore(); });
    // 回纹边
    g.strokeStyle = '#c9a25e'; g.lineWidth = 2; for (let x = 36; x < w - 36; x += 16) { g.strokeRect(x, 22, 10, 6); g.strokeRect(x, h - 28, 10, 6); } for (let y = 36; y < h - 36; y += 16) { g.strokeRect(22, y, 6, 10); g.strokeRect(w - 28, y, 6, 10); }
    // 地子上散点小团花
    for (let i = 0; i < 26; i++) { const x = 70 + Math.random() * (w - 140), y = 70 + Math.random() * (h - 140); if (((x - w / 2) / (w * 0.3)) ** 2 + ((y - h / 2) / (h * 0.26)) ** 2 < 1) continue;
      g.fillStyle = 'rgba(216,183,122,.45)'; for (let k = 0; k < 5; k++) { const a = k * 1.2566; g.beginPath(); g.ellipse(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 2.5, a, 0, 7); g.fill(); } }
    // 中心团花瓣
    g.fillStyle = 'rgba(216,183,122,.6)'; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * w * 0.15, h / 2 + Math.sin(a) * h * 0.12, 14, 7, a, 0, 7); g.fill(); }
    noise(g, w, h, 6000, 0.12);
  });
  TX.roofTile = () => cv(256, 256, (g, w, h) => {
    g.fillStyle = '#3c3b39'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) { g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x, 0, 6, h); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x + 12, 0, 3, h); }
    for (let y = 0; y < h; y += 20) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, y, w, 2); }
  });
  TX.books = () => cv(256, 64, (g, w, h) => {
    let x = 0; const cols = ['#6b2f27', '#2f4a4f', '#8c6d3e', '#3d3226', '#71583a', '#26364a', '#7a6a50'];
    while (x < w) { const bw = rnd(5, 12); g.fillStyle = cols[Math.floor(rnd(0, cols.length))]; g.fillRect(x, rnd(0, 8), bw - 1, h); x += bw; }
  });
  TX.quilt = () => cv(256, 256, (g, w, h) => {
    g.fillStyle = '#8c3b35'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { g.fillStyle = 'rgba(214,170,100,0.55)'; g.beginPath(); g.arc(i * 44 + 22, j * 44 + 22, 8, 0, 7); g.fill(); }
  });
})();
