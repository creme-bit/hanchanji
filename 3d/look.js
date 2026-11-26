// 寒蝉记 · 画质与氛围
// 三块，各自独立，方便以后迁移：
//   LOOK.tex / LOOK.pbr / LOOK.upgrade  —— 程序化 PBR 材质（离屏 canvas 生成颜色、凹凸、粗糙度三张图）
//   LOOK.env / LOOK.renderer / LOOK.fog / LOOK.keyLight —— 渲染器、环境反射、布光、雾
//   LOOK.dust                            —— 空气里的浮尘（全在着色器里动，渲染循环里不新建任何对象）
// 只依赖全局 THREE，不读任何外部图片。
const LOOK = {};
(function () {
  const MOBILE = /iPhone|iPad|Android/i.test(navigator.userAgent);
  LOOK.mobile = MOBILE;
  const TS = MOBILE ? 256 : 512;                       // 程序化贴图边长

  /* ---------------- 噪声工具 ---------------- */
  // 可平铺的值噪声：先在小网格上取随机值，再双线性插值，多层叠加
  function tileNoise(size, cells, octaves, seed) {
    let s = seed || 1; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const out = new Float32Array(size * size);
    let amp = 1, total = 0;
    for (let o = 0; o < octaves; o++) {
      const n = cells << o, g = new Float32Array(n * n);
      for (let i = 0; i < g.length; i++) g[i] = rnd();
      for (let y = 0; y < size; y++) {
        const fy = y / size * n, y0 = Math.floor(fy), ty = fy - y0, y1 = (y0 + 1) % n, sy = ty * ty * (3 - 2 * ty);
        for (let x = 0; x < size; x++) {
          const fx = x / size * n, x0 = Math.floor(fx), tx = fx - x0, x1 = (x0 + 1) % n, sx = tx * tx * (3 - 2 * tx);
          const a = g[y0 * n + x0], b = g[y0 * n + x1], c = g[y1 * n + x0], d = g[y1 * n + x1];
          out[y * size + x] += amp * ((a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy);
        }
      }
      total += amp; amp *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= total;
    return out;
  }
  function canvasFrom(size, fn) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), img = g.createImageData(size, size), d = img.data;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const i = (y * size + x) * 4, v = fn(x, y); d[i] = v[0]; d[i + 1] = v[1]; d[i + 2] = v[2]; d[i + 3] = 255; }
    g.putImageData(img, 0, 0); return c;
  }
  function texOf(c, srgb, rep) {
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace; if (rep) t.repeat.set(rep, rep); t.needsUpdate = true; return t;
  }
  const clamp = v => Math.max(0, Math.min(255, v | 0));

  /* ---------------- 四种基础纹理 ---------------- */
  // 每种返回 { map, bump, rough }，颜色图是接近白的灰度细节，实际颜色由材质 color 着色
  const TEX = {};
  const gen = {
    wood() {                                            // 木纹：沿 x 方向的年轮 + 拉丝毛孔 + 偶尔的节疤
      const N = tileNoise(TS, 4, 4, 11), F = tileNoise(TS, 32, 2, 12);
      const ring = (x, y) => { const n = N[y * TS + x]; const v = Math.sin((y / TS * 26 + n * 6) * Math.PI); return v * 0.5 + 0.5; };
      const col = canvasFrom(TS, (x, y) => { const r = ring(x, y), f = F[y * TS + x]; const v = 170 + r * 55 - f * 40 + (Math.random() - 0.5) * 10; return [clamp(v), clamp(v * 0.97), clamp(v * 0.93)]; });
      const bump = canvasFrom(TS, (x, y) => { const v = 128 + (ring(x, y) - 0.5) * 70 + (F[y * TS + x] - 0.5) * 50; return [clamp(v), clamp(v), clamp(v)]; });
      const rough = canvasFrom(TS, (x, y) => { const v = 150 + (ring(x, y) - 0.5) * 60 + (F[y * TS + x] - 0.5) * 40; return [clamp(v), clamp(v), clamp(v)]; });
      return { map: texOf(col, true), bump: texOf(bump), rough: texOf(rough) };
    },
    plaster() {                                         // 石膏/墙面：低频起伏 + 细砂颗粒
      const N = tileNoise(TS, 6, 5, 21);
      const col = canvasFrom(TS, (x, y) => { const v = 214 + (N[y * TS + x] - 0.5) * 36 + (Math.random() - 0.5) * 14; return [clamp(v), clamp(v * 0.99), clamp(v * 0.96)]; });
      const bump = canvasFrom(TS, (x, y) => { const v = 128 + (N[y * TS + x] - 0.5) * 90 + (Math.random() - 0.5) * 50; return [clamp(v), clamp(v), clamp(v)]; });
      const rough = canvasFrom(TS, (x, y) => { const v = 215 + (N[y * TS + x] - 0.5) * 40; return [clamp(v), clamp(v), clamp(v)]; });
      return { map: texOf(col, true), bump: texOf(bump), rough: texOf(rough) };
    },
    fabric() {                                          // 织物：经纬交织 + 绒毛起伏
      const N = tileNoise(TS, 8, 3, 31), P = 4;
      const weave = (x, y) => { const a = (x % P) < P / 2, b = (y % P) < P / 2; return (a ^ b) ? 1 : 0; };
      const col = canvasFrom(TS, (x, y) => { const v = 200 + weave(x, y) * 22 + (N[y * TS + x] - 0.5) * 40 + (Math.random() - 0.5) * 12; return [clamp(v), clamp(v), clamp(v)]; });
      const bump = canvasFrom(TS, (x, y) => { const v = 110 + weave(x, y) * 60 + (Math.random() - 0.5) * 30; return [clamp(v), clamp(v), clamp(v)]; });
      const rough = canvasFrom(TS, (x, y) => { const v = 225 + (Math.random() - 0.5) * 30; return [clamp(v), clamp(v), clamp(v)]; });
      return { map: texOf(col, true, 4), bump: texOf(bump, false, 4), rough: texOf(rough, false, 4) };
    },
    metal() {                                           // 拉丝金属：一个方向的细长划痕 + 斑驳氧化
      const N = tileNoise(TS, 5, 4, 41), lines = new Float32Array(TS);
      for (let y = 0; y < TS; y++) lines[y] = Math.random();
      const col = canvasFrom(TS, (x, y) => { const v = 205 + (lines[y] - 0.5) * 30 + (N[y * TS + x] - 0.5) * 50; return [clamp(v), clamp(v), clamp(v)]; });
      const bump = canvasFrom(TS, (x, y) => { const v = 128 + (lines[y] - 0.5) * 80; return [clamp(v), clamp(v), clamp(v)]; });
      const rough = canvasFrom(TS, (x, y) => { const v = 70 + (lines[y] - 0.5) * 40 + (N[y * TS + x] - 0.5) * 120; return [clamp(v), clamp(v), clamp(v)]; });
      return { map: texOf(col, true), bump: texOf(bump), rough: texOf(rough) };
    },
    glaze() {                                           // 瓷、漆面：几乎镜面，只有极轻的橘皮和细划痕
      const N = tileNoise(TS, 10, 3, 51);
      const col = canvasFrom(TS, (x, y) => { const v = 236 + (N[y * TS + x] - 0.5) * 16; return [clamp(v), clamp(v), clamp(v)]; });
      const bump = canvasFrom(TS, (x, y) => { const v = 128 + (N[y * TS + x] - 0.5) * 30; return [clamp(v), clamp(v), clamp(v)]; });
      const rough = canvasFrom(TS, (x, y) => { const v = 40 + (N[y * TS + x] - 0.5) * 40 + (Math.random() < 0.004 ? 90 : 0); return [clamp(v), clamp(v), clamp(v)]; });
      return { map: texOf(col, true), bump: texOf(bump), rough: texOf(rough) };
    },
  };
  LOOK.tex = kind => TEX[kind] || (TEX[kind] = gen[kind]());

  /* ---------------- 材质 ---------------- */
  const PRESET = {   // 各类材质的基础物理参数
    wood: { roughness: 0.62, metalness: 0.0, bump: 0.025 },
    plaster: { roughness: 0.92, metalness: 0.0, bump: 0.03 },
    fabric: { roughness: 0.95, metalness: 0.0, bump: 0.02 },
    metal: { roughness: 0.38, metalness: 0.85, bump: 0.008 },
    glaze: { roughness: 0.18, metalness: 0.0, bump: 0.004 },
  };
  LOOK.pbr = (kind, color, extra) => {
    const t = LOOK.tex(kind), p = PRESET[kind];
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, map: t.map, bumpMap: t.bump, bumpScale: p.bump, roughnessMap: t.rough, roughness: p.roughness, metalness: p.metalness }, extra || {}));
    m.userData.look = kind; return m;
  };
  // 按颜色和物理参数判断一个纯色材质该是哪一类
  function classify(m) {
    const hsl = { h: 0, s: 0, l: 0 }; m.color.getHSL(hsl);
    if (m.metalness >= 0.4) return 'metal';
    if (m.roughness <= 0.32) return 'glaze';
    if (hsl.h > 0.015 && hsl.h < 0.13 && hsl.s > 0.16 && hsl.l < 0.45) return 'wood';
    if (hsl.l > 0.62 && hsl.s < 0.35) return 'plaster';
    return 'fabric';
  }
  // 给场景里所有"只有颜色、没有贴图"的标准材质补上颜色、凹凸、粗糙度三张图。共享材质只处理一次。
  LOOK.upgrade = root => {
    const seen = new Set();
    root.traverse(o => {
      if (!o.isMesh && !o.isSkinnedMesh) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
        if (!m || seen.has(m) || !m.isMeshStandardMaterial || m.userData.look) return; seen.add(m);
        if (m.map || m.transparent || m.opacity < 1 || m.wireframe) return;
        if (m.emissive && (m.emissive.r + m.emissive.g + m.emissive.b) > 0.15 && m.emissiveIntensity > 0.2) return;   // 灯罩之类发光件不动
        const kind = classify(m), t = LOOK.tex(kind), p = PRESET[kind];
        m.map = t.map; m.bumpMap = t.bump; m.bumpScale = p.bump; m.roughnessMap = t.rough;
        if (kind === 'metal') { m.roughness = Math.max(0.3, Math.min(m.roughness, 0.5)); }
        m.userData.look = kind; m.needsUpdate = true;
      });
    });
  };

  /* ---------------- 渲染器 ---------------- */
  LOOK.renderer = (r, exposure) => {
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.AgXToneMapping || THREE.ACESFilmicToneMapping; r.toneMappingExposure = exposure || 1.0;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  };

  /* ---------------- 环境反射：程序化的"房间" ---------------- */
  // 跟 RoomEnvironment 同一个思路：一个暗灰的盒子，几块发光面当灯和窗，用 PMREM 烘成反射贴图。
  // 这里换成悬疑基调：顶上一盏暖黄吊灯、一侧一扇冷蓝月光窗，其余是深色木墙。
  let ENV = null;
  LOOK.env = renderer => {
    if (ENV) return ENV;
    const s = new THREE.Scene(), box = new THREE.BoxGeometry(1, 1, 1);
    const room = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x4a4c52, side: THREE.BackSide })); room.scale.set(16, 8, 16); room.position.y = 3; s.add(room);
    const panel = (c, i, x, y, z, sx, sy, sz) => { const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i) })); m.position.set(x, y, z); m.scale.set(sx, sy, sz); s.add(m); };
    panel(0xffe8cc, 8, 0, 6.8, 0, 3, 0.1, 3);        // 吊灯
    panel(0xffdcb0, 3, -5, 2.2, -5, 1, 1, 1);        // 台灯
    panel(0xb8c8e8, 4, 7.9, 3.2, 0, 0.1, 3.5, 5);  // 月光窗
    panel(0x5a5650, 1.2, 0, -0.9, 0, 16, 0.1, 16);     // 地面反光
    const pm = new THREE.PMREMGenerator(renderer);
    ENV = pm.fromScene(s, 0.04).texture; pm.dispose(); box.dispose();
    return ENV;
  };

  /* ---------------- 布光 ---------------- */
  // 暖色主光（吊灯、台灯）：带阴影的聚光灯，往下打；阴影只给关键的几盏，控制开销
  LOOK.keyLight = (parent, x, y, z, tx, ty, tz, opt) => {
    const o = Object.assign({ color: 0xfff0e0, intensity: 120, distance: 30, angle: 0.95, penumbra: 0.75, shadow: true, size: MOBILE ? 512 : 1024 }, opt || {});
    const l = new THREE.SpotLight(o.color, o.intensity, o.distance, o.angle, o.penumbra, 1.6);
    l.position.set(x, y, z); l.target.position.set(tx, ty, tz);
    if (o.shadow) { l.castShadow = true; l.shadow.mapSize.set(o.size, o.size); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.04; l.shadow.radius = 4; l.shadow.camera.near = 0.5; l.shadow.camera.far = o.distance; }
    parent.add(l, l.target); return l;
  };
  // 冷色补光（月光）
  LOOK.moon = (parent, cx, cz, span) => {
    const m = new THREE.DirectionalLight(0x9fb4ff, 1.8);
    m.position.set(cx - 60, 160, cz + 180); m.target.position.set(cx, 0, cz);
    m.castShadow = true; m.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
    const c = m.shadow.camera; c.left = -span; c.right = span; c.top = span; c.bottom = -span; c.near = 10; c.far = 500;
    m.shadow.bias = -0.0005; m.shadow.normalBias = 0.06;
    parent.add(m, m.target); return m;
  };
  // 指数雾：远处慢慢沉进夜色里
  LOOK.fog = (scene, color, density) => { scene.fog = new THREE.FogExp2(color, density); scene.background = new THREE.Color(color); };

  /* ---------------- 浮尘 ---------------- */
  // 点的位置只在创建时算一次；飘动、绕着镜头循环铺开，全在顶点着色器里做。
  // 每帧只改两个 uniform（时间、镜头位置），不新建任何对象。
  LOOK.dust = (count, box) => {
    const n = count || (MOBILE ? 260 : 520), pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) { pos[i * 3] = Math.random(); pos[i * 3 + 1] = Math.random(); pos[i * 3 + 2] = Math.random(); seed[i] = Math.random(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(...(box || [26, 9, 26])) }, uFloor: { value: 0 }, uSize: { value: MOBILE ? 2.2 : 2.6 } },
      vertexShader: `
        attribute float seed; uniform float uTime; uniform vec3 uCam; uniform vec3 uBox; uniform float uFloor; uniform float uSize; varying float vA;
        void main(){
          vec3 p = position * uBox;
          p += vec3(sin(uTime*0.05 + seed*40.0)*0.8, uTime*0.035*(0.4+seed), cos(uTime*0.04 + seed*30.0)*0.8);
          vec3 base = uCam - uBox*0.5; base.y = uFloor + 0.4;
          p = mod(p - base, uBox) + base;
          vec4 mv = modelViewMatrix * vec4(p,1.0);
          float d = -mv.z;
          vA = smoothstep(26.0, 6.0, d) * smoothstep(0.4, 2.5, d) * (0.35 + 0.65*fract(seed*7.0));
          gl_PointSize = uSize * (0.6 + seed) * (40.0 / max(d, 1.0));
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vA;
        void main(){ vec2 c = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(c)) * vA * 0.22; gl_FragColor = vec4(1.0, 0.9, 0.75, a); }`,
    });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.userData.noscale = 1; pts.renderOrder = 5;
    pts.userData.tick = (t, cam, floorY) => { mat.uniforms.uTime.value = t; mat.uniforms.uCam.value.copy(cam.position); mat.uniforms.uFloor.value = floorY; };
    return pts;
  };
})();
