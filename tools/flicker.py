"""Crop and grade photos for the intro flicker card.

usage: python3 tools/flicker.py <out-number> <image>[:fx,fy] ...
  fx, fy = where the subject is, as 0-1 fractions of width/height (default .5,.5)

each image is cropped to the card ratio (16:9), turned into paper/ink duotone
with light grain, and written to assets/flicker/NN.jpg starting at <out-number>.
"""
import sys, random
from pathlib import Path
from PIL import Image, ImageOps

W, H = 960, 540            # 3x the 320x180 card, 16:9 like the reel
INK, PAPER = (17, 17, 17), (255, 255, 255)
OUT = Path(__file__).resolve().parent.parent / "assets" / "flicker"


def crop(im, fx, fy):
    target = W / H
    w, h = im.size
    if w / h > target:      # too wide: trim sides
        cw, ch = round(h * target), h
    else:                   # too tall: trim top/bottom
        cw, ch = w, round(w / target)
    left = min(max(round(fx * w - cw / 2), 0), w - cw)
    top = min(max(round(fy * h - ch / 2), 0), h - ch)
    return im.crop((left, top, left + cw, top + ch)).resize((W, H), Image.LANCZOS)


def grade(im):
    g = ImageOps.grayscale(im)
    g = ImageOps.autocontrast(g, cutoff=1)
    rnd = random.Random(7)
    px = g.load()
    for y in range(H):
        for x in range(W):
            px[x, y] = max(0, min(255, px[x, y] + int(rnd.gauss(0, 9))))
    return ImageOps.colorize(g, INK, PAPER)


def main():
    n = int(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    for arg in sys.argv[2:]:
        path, _, focus = arg.partition(":")
        fx, fy = (float(v) for v in focus.split(",")) if focus else (.5, .5)
        im = Image.open(path).convert("RGB")
        dest = OUT / f"{n:02d}.jpg"
        grade(crop(im, fx, fy)).save(dest, quality=82, optimize=True, progressive=True)
        print(dest.name, "<-", Path(path).name)
        n += 1


if __name__ == "__main__":
    main()
