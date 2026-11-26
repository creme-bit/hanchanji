#!/usr/bin/env python3
"""
寒蝉记 · 批量生成 360° 全景图（在你自己电脑上运行）

用法（在项目根目录，也就是 index.html 所在的文件夹里）：
    pip3 install requests pillow
    python3 tools/gen_panoramas.py                         # 默认用 Pollinations（免费、不要 Token）
    python3 tools/gen_panoramas.py --only shufang-1,shufang-2   # 只生成指定机位
    python3 tools/gen_panoramas.py --force                 # 已有的图也重新生成
    HF_TOKEN=hf_xxx python3 tools/gen_panoramas.py --provider hf   # 用 Hugging Face 免费 Token 调 FLUX.1-schnell
    python3 tools/gen_panoramas.py --seed 7                # 换个随机种子再来一批

生成后自动：左右接缝羽化 → 缩放到 2:1 → 压成 WebP（单张约 1MB 以内）→ 存到 assets/panoramas/<机位>.webp
→ 更新 3d/nodes.js 里的 PANO_VER，让浏览器和手机重新取图。
换成 AI 图以后，画面内容和原来的占位图不一样，箭头和证物的位置需要用网页角落的「调试」开关点一下画面，
把拾取到的坐标贴回 3d/nodes.js 对应的 at: [...]。
"""
import argparse, io, json, os, random, re, sys, time, urllib.parse

try:
    import requests
    from PIL import Image
except ImportError:
    sys.exit('先安装依赖：pip3 install requests pillow')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS = os.path.join(ROOT, 'assets', 'panoramas', 'prompts.json')
NODES_JS = os.path.join(ROOT, '3d', 'nodes.js')


def gen_pollinations(prompt, neg, w, h, seed):
    url = ('https://image.pollinations.ai/prompt/' + urllib.parse.quote(prompt + '. Avoid: ' + neg)
           + f'?width={w}&height={h}&seed={seed}&model=flux&nologo=true&enhance=false&private=true')
    r = requests.get(url, timeout=240)
    r.raise_for_status()
    if not r.headers.get('content-type', '').startswith('image'):
        raise RuntimeError('返回的不是图片：' + r.text[:200])
    return Image.open(io.BytesIO(r.content))


def gen_hf(prompt, neg, w, h, seed, model='black-forest-labs/FLUX.1-schnell'):
    tok = os.environ.get('HF_TOKEN')
    if not tok:
        raise RuntimeError('没有 HF_TOKEN：去 https://huggingface.co/settings/tokens 建一个免费 Token，再 export HF_TOKEN=hf_xxx')
    r = requests.post(f'https://router.huggingface.co/hf-inference/models/{model}',
                      headers={'Authorization': f'Bearer {tok}'},
                      json={'inputs': prompt, 'parameters': {'width': min(w, 1536), 'height': min(h, 768), 'seed': seed,
                                                             'negative_prompt': neg}}, timeout=300)
    if r.status_code == 503:
        raise RuntimeError('模型正在加载，稍后重试')
    r.raise_for_status()
    return Image.open(io.BytesIO(r.content))


def seam_fix(im, band=48):
    """让最左和最右两列颜色对上，转一圈不出现竖缝。"""
    im = im.convert('RGB')
    w, h = im.size
    px = im.load()
    for y in range(h):
        l, r = px[0, y], px[w - 1, y]
        s = tuple((a + b) / 2 for a, b in zip(l, r))
        for k in range(band):
            t = 1 - k / band
            a = px[k, y]; px[k, y] = tuple(int(c + (sv - lv) * t) for c, sv, lv in zip(a, s, l))
            b = px[w - 1 - k, y]; px[w - 1 - k, y] = tuple(int(c + (sv - rv) * t) for c, sv, rv in zip(b, s, r))
    return im


def save_webp(im, path, width, max_kb=1000):
    im = im.resize((width, width // 2), Image.LANCZOS)   # 强制 2:1
    for q in (86, 80, 74, 68, 60):
        buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
        if buf.tell() <= max_kb * 1024 or q == 60:
            open(path, 'wb').write(buf.getvalue()); return buf.tell() // 1024, q


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--provider', choices=['pollinations', 'hf'], default='pollinations')
    ap.add_argument('--only', default='')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--seed', type=int, default=1934)
    ap.add_argument('--width', type=int, default=2048, help='输出宽度，高度自动取一半；手机上 2048 足够，追求清晰用 4096')
    ap.add_argument('--retries', type=int, default=3)
    a = ap.parse_args()
    items = json.load(open(PROMPTS, encoding='utf-8'))
    only = set(x.strip() for x in a.only.split(',') if x.strip())
    done = 0
    for i, it in enumerate(items):
        if only and it['id'] not in only:
            continue
        out = os.path.join(ROOT, it['file'])
        if os.path.exists(out) and not a.force and not only:
            print(f"[跳过] {it['id']} 已有图（加 --force 重新生成）"); continue
        for t in range(a.retries):
            try:
                print(f"[{i + 1}/{len(items)}] {it['id']} {it['room']}·{it['view']} 生成中……", flush=True)
                seed = a.seed + i * 17 + t
                im = (gen_pollinations if a.provider == 'pollinations' else gen_hf)(it['prompt'], it['negative'], 2048, 1024, seed)
                kb, q = save_webp(seam_fix(im), out, a.width)
                print(f"    ✓ {out}  {kb}KB (q={q})"); done += 1; break
            except Exception as e:
                print(f"    ✗ 第 {t + 1} 次失败：{e}"); time.sleep(8 * (t + 1))
        time.sleep(2)   # 免费接口别打太快
    if done and os.path.exists(NODES_JS):
        s = open(NODES_JS, encoding='utf-8').read()
        s = re.sub(r'window\.PANO_VER = "[^"]*";', f'window.PANO_VER = "{int(time.time())}";', s)
        open(NODES_JS, 'w', encoding='utf-8').write(s)
    print(f'完成 {done} 张。刷新网页即可看到；记得用「调试」开关校一下箭头和证物位置。')


if __name__ == '__main__':
    main()
