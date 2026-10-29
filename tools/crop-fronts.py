"""Crop a single front-facing figure out of each turnaround, for use as --oref / image prompt.

Multi-figure references make Midjourney return multi-figure lineups; a single-figure crop
fixes that. Crop boxes are fractions of image width (x0, x1); full height is kept and the
result is padded to 2:3 portrait with the image's own background colour.
Usage: python3 tools/crop-fronts.py
"""
from PIL import Image

IMAGES = 'docs/references/images'
# Add an entry per accepted turnaround. Boxes for the earlier smooth turnarounds
# (now in images/explore/) were busker 0.08-0.29, metal 0.40-0.60, country 0.30-0.52, jazz 0.14-0.37.
CROPS = {
    '01-rap': (0.05, 0.29),       # view 1: front. Also the faceted --sref for every hero prompt.
}

for char, (x0, x1) in CROPS.items():
    src = Image.open(f'{IMAGES}/char-{char}-turnaround.jpg').convert('RGB')
    w, h = src.size
    fig = src.crop((int(x0 * w), 0, int(x1 * w), h))
    out_w = max(fig.width, int(h * 2 / 3))
    canvas = Image.new('RGB', (out_w, h), src.getpixel((5, 5)))
    canvas.paste(fig, ((out_w - fig.width) // 2, 0))
    canvas.save(f'{IMAGES}/char-{char}-front.jpg', quality=92)
    print(char, canvas.size)
