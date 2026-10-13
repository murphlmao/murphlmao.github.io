#!/usr/bin/env python3
"""Cut the cores out of room 12's cloud rings for /transcend (needs Pillow).

/transcend shows only the middle of each ring: a circle of radius 26% of the 2048px gif
(see .ring in src/pages/transcend/index.astro). Shipping and rotating the whole gif means
decoding, rastering and compositing four times the pixels that can ever be seen, so this
writes 12-cloud-<n>-core.gif: the same pixels, cropped to a centred square just big enough
to hold that circle. No resampling, same palette, same transparent index; the script
checks that every kept pixel is identical. CORE below is the side of that square, and
index.astro sizes the image by the same number.

Ring 1 is left out on purpose: it is hollow, fully transparent inside that circle.

  python3 scripts/crop-transcend-rings.py
"""
from pathlib import Path
from PIL import Image

STATUE = Path(__file__).resolve().parent.parent / 'public' / 'statue'
FULL = 2048
CORE = 1068  # 2 * ceil(0.26 * 2048) = 1066, plus a pixel each side for the clip's antialiasing
RINGS = [2, 3, 4, 5]

lo = (FULL - CORE) // 2
box = (lo, lo, lo + CORE, lo + CORE)
for n in RINGS:
    src = Image.open(STATUE / f'12-cloud-{n}.gif')
    assert src.size == (FULL, FULL) and src.mode == 'P', (n, src.size, src.mode)
    core = src.crop(box)
    out = STATUE / f'12-cloud-{n}-core.gif'
    core.save(out, transparency=src.info['transparency'], optimize=False)
    same = Image.open(out).convert('RGBA').tobytes() == src.convert('RGBA').crop(box).tobytes()
    assert same, f'ring {n}: the saved crop does not match the source pixels'
    print(f'{out.name}: {CORE}x{CORE}, {out.stat().st_size // 1024} KB (full ring: {(STATUE / f"12-cloud-{n}.gif").stat().st_size // 1024} KB), pixels identical')
