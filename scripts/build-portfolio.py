#!/usr/bin/env python3
"""Build the portfolio photo galleries from data/portfolio-images.txt.

Each line of the data file is "<uploadcare-uuid> <filename>". The filename prefix
(kitchen-12.jpg -> "kitchen") decides which portfolio page and room group the
photo lands in, per GROUPS below. Re-run after adding photos:

    python3 scripts/build-portfolio.py
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CDN = "https://3w9gbmfe8q.ucarecd.net"

# page -> list of (anchor id, heading, filename prefix)
GROUPS = {
    "portfolio-residential.html": [
        ("kitchens", "Kitchens", "kitchen"),
        ("bathrooms", "Bathrooms", "bathroom"),
        ("butlers-pantries", "Butler&rsquo;s Pantries", "butler-pantry"),
        ("built-ins", "Built-Ins", "built-ins"),
        ("home-offices", "Home Offices", "office"),
        ("closets", "Closets", "closet"),
    ],
    "portfolio-commercial.html": [
        ("commercial", "Casework &amp; Millwork", "commercial"),
    ],
    "portfolio-builder.html": [
        ("bars", "Bars", "bar"),
        ("laundry-rooms", "Laundry Rooms", "laundry"),
        ("mudrooms", "Mudroom Benches", "mud-benches"),
    ],
}
LABEL = {
    "portfolio-residential.html": "Residential",
    "portfolio-commercial.html": "Commercial",
    "portfolio-builder.html": "Builder",
}
START, END = "<!-- portfolio:start -->", "<!-- portfolio:end -->"


def load():
    photos = {}
    for line in (ROOT / "data/portfolio-images.txt").read_text().split("\n"):
        if not line.strip():
            continue
        uuid, name = line.split()
        m = re.fullmatch(r"(.+)-(\d+)\.(\w+)", name)
        prefix, num, ext = m.group(1), int(m.group(2)), m.group(3).lower()
        photos.setdefault(prefix, []).append((num, uuid, ext))
    for items in photos.values():
        items.sort()
    return photos


def url(uuid, ext, size):
    # HEIC doesn't display in most browsers, so force JPEG for those; let
    # Uploadcare pick WebP/AVIF/JPEG for everything else.
    fmt = "jpeg" if ext == "heic" else "auto"
    return f"{CDN}/{uuid}/-/preview/{size}/-/format/{fmt}/-/quality/smart/"


def photo_grid(items, label, heading):
    plain = html.unescape(heading)
    out = []
    for i, (num, uuid, ext) in enumerate(items, 1):
        alt = html.escape(f"{label} {plain.lower()} by Huntsville American Cabinets, photo {i} of {len(items)}")
        out.append(
            f'<a class="photo" href="{url(uuid, ext, "2000x2000")}">'
            f'<img src="{url(uuid, ext, "800x800")}" alt="{alt}" loading="lazy" decoding="async"></a>'
        )
    return '<div class="photo-grid">' + "".join(out) + "</div>"


def replace_block(text, new, fallback_pattern):
    block = f"{START}{new}{END}"
    if START in text:
        return re.sub(re.escape(START) + ".*?" + re.escape(END), lambda _: block, text, count=1, flags=re.S)
    text, n = re.subn(fallback_pattern, lambda _: block, text, count=1, flags=re.S)
    assert n == 1, "gallery markup not found"
    return text


def build_category_pages(photos):
    for page, groups in GROUPS.items():
        label = LABEL[page]
        parts = []
        if len(groups) > 1:
            links = "".join(f'<a href="#{gid}">{h} <span>{len(photos[p])}</span></a>' for gid, h, p in groups)
            parts.append(f'<nav class="photo-jump" aria-label="Jump to room">{links}</nav>')
        for gid, heading, prefix in groups:
            items = photos[prefix]
            parts.append(
                f'<div class="gallery-group" id="{gid}"><div class="section-head"><p class="eyebrow">{label}</p>'
                f'<h2>{heading}</h2></div>{photo_grid(items, label, heading)}</div>'
            )
        path = ROOT / page
        text = replace_block(path.read_text(), "".join(parts), r'<div class="gallery">.*?</figure></div>')
        path.write_text(text)


def build_overview(photos):
    """portfolio.html: three cover photos per category, linking to that page."""
    path = ROOT / "portfolio.html"
    text = path.read_text()
    for page, groups in GROUPS.items():
        label = LABEL[page]
        picks = [(gid, h, photos[p][0]) for gid, h, p in groups][:3]
        if len(picks) < 3:  # single-group page: take its first three photos
            gid, h, p = groups[0]
            picks = [(gid, h, item) for item in photos[p][:3]]
        tiles = []
        for i, (gid, heading, (num, uuid, ext)) in enumerate(picks):
            cls = "project wide" if i == 0 else "project"
            tiles.append(
                f'<a class="{cls}" href="{page}#{gid}" style="--img:url({url(uuid, ext, "1200x900")})">'
                f'<figcaption><span>{label}</span>{heading}</figcaption></a>'
            )
        gallery = '<div class="gallery">' + "".join(tiles) + "</div>"
        start, end = f"<!-- portfolio:{page}:start -->", f"<!-- portfolio:{page}:end -->"
        block = start + gallery + end
        if start in text:
            text = re.sub(re.escape(start) + ".*?" + re.escape(end), lambda _: block, text, count=1, flags=re.S)
        else:
            pat = r'(href="' + re.escape(page) + r'" class="link-arrow">[^<]*</a></div>)<div class="gallery">.*?</figure></div>'
            text, n = re.subn(pat, lambda m: m.group(1) + block, text, count=1, flags=re.S)
            assert n == 1, f"overview gallery for {page} not found"
    path.write_text(text)


if __name__ == "__main__":
    photos = load()
    build_category_pages(photos)
    build_overview(photos)
    print({p: len(v) for p, v in photos.items()}, "total", sum(len(v) for v in photos.values()))
