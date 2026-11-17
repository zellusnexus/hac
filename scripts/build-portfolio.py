#!/usr/bin/env python3
"""Build the portfolio photo galleries from data/portfolio-images.txt.

Each line of the data file is "<uploadcare-uuid> <filename>". The filename prefix
(kitchen-12.jpg -> "kitchen") decides which portfolio page and room group the
photo lands in (gallery-<category>.html), per GROUPS below. Re-run after adding photos:

    python3 scripts/build-portfolio.py
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CDN = "https://3w9gbmfe8q.ucarecd.net"

# category -> list of (anchor id, heading, filename prefix)
GROUPS = {
    "residential": [
        ("kitchens", "Kitchens", "kitchen"),
        ("bathrooms", "Bathrooms", "bathroom"),
        ("butlers-pantries", "Butler&rsquo;s Pantries", "butler-pantry"),
        ("built-ins", "Built-Ins", "built-ins"),
        ("home-offices", "Home Offices", "office"),
        ("closets", "Closets", "closet"),
    ],
    "commercial": [
        ("commercial", "Casework &amp; Millwork", "commercial"),
    ],
    "builder": [
        ("bars", "Bars", "bar"),
        ("laundry-rooms", "Laundry Rooms", "laundry"),
        ("mudrooms", "Mudroom Benches", "mud-benches"),
    ],
}
LABEL = {
    "residential": "Residential",
    "commercial": "Commercial",
    "builder": "Builder",
}
OVERVIEW = ROOT / "gallery.html"           # cover tiles for each category
def page(cat): return ROOT / f"gallery-{cat}.html"  # full photo galleries


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


def replace_marked(text, key, new):
    start, end = f"<!-- portfolio:{key}:start -->", f"<!-- portfolio:{key}:end -->"
    assert start in text and end in text, f"markers for {key} not found"
    return re.sub(re.escape(start) + ".*?" + re.escape(end), lambda _: start + new + end, text, count=1, flags=re.S)


def build_category_pages(photos):
    for cat, groups in GROUPS.items():
        label = LABEL[cat]
        parts = []
        if len(groups) > 1:
            links = "".join(f'<a href="#{gid}">{h} <span>{len(photos[p])}</span></a>' for gid, h, p in groups)
            parts.append(f'<nav class="photo-jump" aria-label="Jump to room">{links}</nav>')
        for gid, heading, prefix in groups:
            items = photos[prefix]
            parts.append(
                f'<div class="gallery-group" id="{gid}"><h3 class="gallery-room">{heading}</h3>'
                f'{photo_grid(items, label, heading)}</div>'
            )
        path = page(cat)
        path.write_text(replace_marked(path.read_text(), cat, "".join(parts)))


def build_overview(photos):
    """gallery.html: three cover photos per category, linking to that category's page."""
    text = OVERVIEW.read_text()
    for cat, groups in GROUPS.items():
        label = LABEL[cat]
        picks = [(gid, h, photos[p][0]) for gid, h, p in groups][:3]
        if len(picks) < 3:  # single-group category: take its first three photos
            gid, h, p = groups[0]
            picks = [(gid, h, item) for item in photos[p][:3]]
        tiles = []
        for i, (gid, heading, (num, uuid, ext)) in enumerate(picks):
            cls = "project wide" if i == 0 else "project"
            tiles.append(
                f'<a class="{cls}" href="gallery-{cat}.html#{gid}" style="--img:url({url(uuid, ext, "1200x900")})">'
                f'<figcaption><span>{label}</span>{heading}</figcaption></a>'
            )
        text = replace_marked(text, f"overview-{cat}", '<div class="gallery">' + "".join(tiles) + "</div>")
        # room list with photo counts, plus a button to the full category page
        total = sum(len(photos[p]) for _, _, p in groups)
        rooms = "".join(f'<li><a href="gallery-{cat}.html#{gid}">{h}<span>{len(photos[p])}</span></a></li>' for gid, h, p in groups)
        text = replace_marked(text, f"rooms-{cat}",
            f'<ul class="gal-rooms">{rooms}</ul><a href="gallery-{cat}.html" class="btn btn-primary">See all {total} photos</a>')
    OVERVIEW.write_text(text)


if __name__ == "__main__":
    photos = load()
    build_category_pages(photos)
    build_overview(photos)
    print({p: len(v) for p, v in photos.items()}, "total", sum(len(v) for v in photos.values()))
