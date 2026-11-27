// 寒蝉记：把模型、贴图、声音缓存到本机，第二次打开不用再下载
const C = 'hcj-v1';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== C) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;   // 联机信令等外站请求不管
  const page = r.mode === 'navigate' || /\/(index\.html)?$/.test(u.pathname) || /\.(json)$/.test(u.pathname);
  if (page) {   // 页面和数据：先联网拿最新，断网才用缓存
    e.respondWith(fetch(r).then(res => { if (res.ok) caches.open(C).then(c => c.put(r, res.clone())); return res; }).catch(() => caches.match(r)));
    return;
  }
  const versioned = u.search.includes('v=');
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(r);
    const net = () => fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; });
    if (hit) { if (!versioned) net().catch(() => {}); return hit; }   // 带版本号的文件不会变，直接用缓存；其余后台顺便更新
    return net();
  }));
});
