#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ประกอบหน้าเว็บจากชิ้นส่วนใน parts/ และเนื้อหาใน pages/
รันด้วย:  python3 build.py       ผลลัพธ์เป็นไฟล์ .html ที่รากโปรเจกต์

ทำไมต้องมีขั้นตอนประกอบ: หัวเว็บกับท้ายเว็บเหมือนกันทุกหน้า ถ้าก็อปวาง
ไว้หกที่ พอแก้ลิงก์เดียวต้องไล่แก้หกรอบ ที่ผ่านมาพังเพราะแบบนั้น
"""
import re
import sys
import pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent / 'parts'))
import art  # noqa: E402

ROOT = pathlib.Path(__file__).parent
PARTS = ROOT / 'parts'
PAGES = ROOT / 'pages'

APP_URL = 'https://spireone.pages.dev/'   # ที่อยู่ของแอปจริง เปลี่ยนตรงนี้ที่เดียว

# ตราสัญลักษณ์ Phasmion — อ่านจากไฟล์แล้วฝังเป็น inline SVG
# ต้อง inline เพราะ <use> ข้ามไฟล์รับ currentColor ไม่ได้ในบางเบราว์เซอร์
_mark_src = (ROOT / 'assets' / 'phasmion.svg').read_text(encoding='utf-8')
MARK_INNER = re.sub(r'^.*?<svg[^>]*>|</svg>\s*$', '', _mark_src, flags=re.S)

HEAD = (PARTS / 'head.html').read_text(encoding='utf-8')
NAV = (PARTS / 'nav.html').read_text(encoding='utf-8')
FOOT = (PARTS / 'foot.html').read_text(encoding='utf-8')


def render(name: str, src: str) -> str:
    # ดึงเมตาจากบรรทัดคอมเมนต์บนสุด:  <!--@ title | desc -->
    m = re.match(r'\s*<!--@(.*?)-->\s*', src, re.S)
    title, desc = 'Cendon', ''
    if m:
        bits = [b.strip() for b in m.group(1).split('|')]
        title = bits[0] if bits else 'Cendon'
        desc = bits[1] if len(bits) > 1 else ''
        src = src[m.end():]

    out = HEAD.replace('{{TITLE}}', title).replace('{{DESC}}', desc)
    out += (NAV.replace('{{PAGE}}', name)
               .replace('{{APP}}', APP_URL)
               .replace('{{MARK}}',
                        '<svg class="mk" viewBox="0 0 200 200" fill="currentColor" '
                        'aria-hidden="true">' + MARK_INNER + '</svg>'))
    out += src
    out = out.replace('{{MARK}}',
                      '<svg class="mk" viewBox="0 0 200 200" fill="currentColor" '
                      'aria-hidden="true">' + MARK_INNER + '</svg>')
    out += FOOT.replace('{{APP}}', APP_URL)

    # แทนภาพประกอบ
    def art_sub(mo):
        key = mo.group(1)
        if key not in art.ALL:
            raise SystemExit(f'ไม่รู้จักภาพประกอบ: {key}')
        return art.ALL[key]()
    out = re.sub(r'\{\{ART:(\w+)\}\}', art_sub, out)

    # ทำเครื่องหมายหน้าปัจจุบันในเมนู
    out = out.replace(f'href="{name}.html"', f'href="{name}.html" aria-current="page"', 1) \
        if name != 'index' else out.replace('href="index.html"', 'href="index.html" aria-current="page"', 1)
    return out


def main():
    n = 0
    for f in sorted(PAGES.glob('*.html')):
        name = f.stem
        html = render(name, f.read_text(encoding='utf-8'))
        (ROOT / f'{name}.html').write_text(html, encoding='utf-8')
        print(f'  {name}.html  {len(html)/1024:.0f} KB')
        n += 1
    print(f'เสร็จ {n} หน้า')


if __name__ == '__main__':
    main()
