#!/usr/bin/env python3
"""
寒蝉记 · 用 Hugging Face 免费 GPU 上的专用 360° 全景模型（Krea 2 360° Panorama LoRA）生成全景图

在「同步版」文件夹里运行：
    pip3 install pillow
    python3 tools/gen_pano_hf.py --only shufang-1      # 先试一张书房
    python3 tools/gen_pano_hf.py                       # 每个房间一张，共 18 张；中途额度用完，明天再跑会接着来
可选：注册一个免费 Hugging Face 账号，建个 Token（https://huggingface.co/settings/tokens），
    export HF_TOKEN=hf_xxx   之后再跑，免费 GPU 额度会多一些。
生成的原图存在 tools/raw/，压缩后的 WebP 放进 assets/panoramas/。
"""
import argparse, os, re, shutil, sys, time

import json, urllib.request, urllib.error
ROOT0 = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def _early(msg):
    try:
        with open(os.path.join(ROOT0, 'tools', 'gen_log.txt'), 'a', encoding='utf-8') as f: f.write(time.strftime('%H:%M:%S ') + msg + '\n')
    except Exception: pass
_early('启动 python ' + sys.version.split()[0])
try:
    from PIL import Image
except ImportError:
    _early('缺 Pillow'); sys.exit('先安装依赖：pip3 install pillow')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'panoramas')
RAW = os.path.join(ROOT, 'tools', 'raw')
SPACE = 'hugging-apps/krea2-360-panorama-lora'
BASE = 'https://hugging-apps-krea2-360-panorama-lora.hf.space'

STYLE = ('360 equirectangular panorama, seamless 360 view, photorealistic, realistic Chinese period drama cinematography, '
         '1930s Republic of China, overcast gloomy daylight through windows, desaturated cold grey and muted dark wood tones, '
         'aged wood, slightly peeling plaster walls, natural soft shadows, lifted shadows with detail, level horizon')
INSIDE = 'interior of an old mansion in Shanghai, '
# 每个房间一张：只写最要紧的几样东西，写多了模型反而全丢
ROOMS = {
 'qianting-1': 'grand dining hall, long banquet table with porcelain bowls and rosewood chairs, black lacquered plaque with gold calligraphy on the wall, tall grandfather clock, double wooden front doors',
 'keting-1':   'western style parlor, gramophone, glass display cabinet with bottles and brass candlesticks, round tea table with teacups, leather sofa, landscape oil painting',
 'dongxiang-1':'a lady\'s bedroom, carved Chinese canopy bed, rosewood vanity with round mirror and dressing case, wardrobe, embroidered shoes by the bed',
 'xixiang-1':  'abandoned bedroom, bed and dressing table covered with dusty white sheets, faded floral wallpaper, dust',
 'houlang-1':  'narrow back corridor, wooden back door, large glazed water vat, doorways, dark wooden wainscot',
 'louti-1':    'dim staircase hall, dark wooden stairs with turned balusters going up, small doorway',
 'xiarenfang-1':'small servants\' room, two narrow plank beds with folded blue quilts, plain wooden trunk, whitewashed walls',
 'chufang-1':  'old Chinese kitchen, brick stove with iron wok, long wooden side table with jars, big water vat, bamboo baskets',
 'houyuan-1':  'OUT:muddy back courtyard, old stone well covered by a bluestone slab, woodshed stacked with firewood, small house with closed door, grey brick walls, bare trees',
 'laohao-1':   'old Chinese herbal medicine shop, wall of small wooden herb drawers, long wooden counter with brass scale and ledger, wooden cabinets',
 'qianyuan-1': 'OUT:front courtyard of a two storey mansion, stone steps to the front door, long second floor balcony with railings, courtyard gate, bare trees, an old man holding a paper lantern',
 'zoulang-1':  'long upstairs corridor, wooden floor, panelled doors on both sides, potted orchid and kerosene lamp at the far end',
 'shufang-1':  'study of a rich medicine merchant, large dark wooden desk with a green banker\'s lamp and a man in a dark robe slumped over the desk, tall bookshelves full of books, shelf of medicine jars, French window, armchair',
 'woshi-1':    'master bedroom, carved wooden bed with folded quilt, bedside cabinet with tea bowl, tall wardrobe, writing desk',
 'kongkefang-1':'storage room, old rattan chair, stacked camphor wood trunks, furniture under dusty sheets, high window',
 'jingxing-1': 'young man\'s room, bookshelf with books and sheet music, gramophone with records, desk with letter paper',
 'erlaoye-1':  'old bedroom, writing desk with an abacus and ledgers, wardrobe, washstand with enamel basin',
 'lutai-1':    'OUT:long second floor balcony terrace of a mansion, dusty floor tiles, wooden railings, French windows and shuttered windows along the wall, view over a courtyard',
}


def prompt_of(k):
    s = ROOMS[k]
    return (STYLE + ', ' + (s[4:] if s.startswith('OUT:') else INSIDE + s) + ', no text, no watermark')


def seam_fix(im, band=24):
    im = im.convert('RGB'); w, h = im.size; px = im.load()
    for y in range(h):
        l, r = px[0, y], px[w - 1, y]; s = tuple((a + b) / 2 for a, b in zip(l, r))
        for k in range(band):
            t = 1 - k / band
            a = px[k, y]; px[k, y] = tuple(int(c + (sv - lv) * t) for c, sv, lv in zip(a, s, l))
            b = px[w - 1 - k, y]; px[w - 1 - k, y] = tuple(int(c + (sv - rv) * t) for c, sv, rv in zip(b, s, r))
    return im


LOG = os.path.join(ROOT, 'tools', 'gen_log.txt')
_print = print
def print(*a, **k):   # 屏幕上照常显示，同时记到 tools/gen_log.txt，方便 Claude 查看
    _print(*a, **k)
    try:
        with open(LOG, 'a', encoding='utf-8') as f: f.write(time.strftime('%H:%M:%S ') + ' '.join(str(x) for x in a) + '\n')
    except Exception: pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--force', action='store_true', help='已生成过的也重做')
    ap.add_argument('--seed', type=int, default=1934)
    ap.add_argument('--steps', type=int, default=12)
    a = ap.parse_args()
    os.makedirs(RAW, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    tok = os.environ.get('HF_TOKEN')
    print('开始；HF_TOKEN', '已设置' if tok else '未设置')
    H = {'Content-Type': 'application/json', 'User-Agent': 'hanchanji-gen/1.0'}
    if tok: H['Authorization'] = 'Bearer ' + tok

    def call(prompt, seed, steps):
        body = json.dumps({'data': [prompt, '2048', steps, 1.0, seed, False]}).encode()
        r = urllib.request.urlopen(urllib.request.Request(BASE + '/gradio_api/call/generate_panorama', body, H), timeout=60)
        eid = json.loads(r.read())['event_id']
        r = urllib.request.urlopen(urllib.request.Request(BASE + '/gradio_api/call/generate_panorama/' + eid, headers=H), timeout=900)
        ev = None
        for line in r:
            line = line.decode('utf-8', 'replace').strip()
            if line.startswith('event:'): ev = line[6:].strip()
            elif line.startswith('data:'):
                data = line[5:].strip()
                if ev == 'error': raise RuntimeError('模型报错：' + data[:500])
                if ev == 'complete':
                    d = json.loads(data)[0]; url = d.get('url') or (BASE + '/gradio_api/file=' + d['path'])
                    return urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=120).read()
        raise RuntimeError('没有拿到结果（事件：%s）' % ev)
    ids = [x.strip() for x in a.only.split(',') if x.strip()] or list(ROOMS)
    done = 0
    for i, k in enumerate(ids):
        if k not in ROOMS: print('没有这个机位：', k); continue
        raw = os.path.join(RAW, k + '.png')
        if os.path.exists(raw) and not a.force: print(f'[跳过] {k} 已经生成过（加 --force 重做）'); continue
        print(f'[{i + 1}/{len(ids)}] {k} 生成中（一张大约 1 分钟）……', flush=True)
        try:
            img = call(prompt_of(k), a.seed + i, a.steps)
        except Exception as e:
            msg = str(e)
            if isinstance(e, urllib.error.HTTPError):
                try: msg += ' ' + e.read().decode('utf-8', 'replace')[:400]
                except Exception: pass
            if re.search(r'quota|GPU|ZeroGPU|exceeded', msg, re.I):
                print('    报错原文：', msg[:500])
                print('    今天的免费 GPU 额度用完了。明天再运行同一条命令，会从没做的那张接着生成。'); break
            print('    失败：', repr(e)[:800]); time.sleep(10); continue
        open(raw, 'wb').write(img)
        im = seam_fix(Image.open(raw))
        if im.size[0] != 2 * im.size[1]: im = im.resize((im.size[0], im.size[0] // 2), Image.LANCZOS)
        out = os.path.join(OUT, k + '.webp'); im.save(out, 'WEBP', quality=88, method=6)
        print(f'    ✓ {out}  {im.size[0]}×{im.size[1]}  {os.path.getsize(out) // 1024}KB'); done += 1
    print(f'完成 {done} 张。告诉 Claude 一声，它来看图、对好箭头和证物位置、上线。')


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback; _early('崩溃：' + traceback.format_exc()[-1500:]); raise
