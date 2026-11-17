# Huntsville American Cabinets — site redesign

Static redesign for Huntsville American Cabinets, styled after the FITE Building Company look:
a dark grey and dark brown palette with gold accents, transparent nav over a full-bleed video hero,
serif statements (Source Serif 4), geometric sans UI (Jost), and gold CTAs.

Open `index.html` in a browser — no build step.

## Pages
The menu follows the old site (Services, Gallery, Contact) plus About. Each top-level item is an overview page,
and each dropdown item is its own page. All pages share the same header, footer and `css/styles.css`:

| Menu | Overview page | Dropdown pages |
| --- | --- | --- |
| Services | `services.html` | `commercial.html`, `residential.html`, `architects-designers.html`, `custom-home-builders.html` |
| Gallery | `gallery.html` | `gallery-residential.html`, `gallery-commercial.html`, `gallery-builder.html` |
| About | `about.html` | `quality.html`, `testimonials.html` |
| Contact | `contact.html` | |

The inner-page copy is a draft based on what a custom cabinet shop like HAC would likely say. Have the client review it,
especially the history timeline, industries served, FAQ answers, timelines, hours and service area.

## Before launch
- **Contact info** (phone, fax, email, address, hours, map) comes from the current site, mastercraftsmanship.net.
- **Copy:** elements marked `data-placeholder` (project captions, testimonials, history timeline) are stand-ins. Replace them with real content.
- **Logo:** loaded from Uploadcare (header, footer, favicon). To self-host, save it as `assets/logo.png` and update the three URLs in `index.html`. The artwork is white-on-transparent, so keep it on dark backgrounds.
- **Media:** add files to `assets/` and they'll be picked up automatically:
  - `hero.mp4` (looping, muted drone/site clip) and `hero.jpg` (poster/fallback)
  - `about.jpg`, `project-1.jpg`, `project-2.jpg`, `project-3.jpg`
  Until then, tinted gradients show in their place.
- **Gallery photos:** the galleries on `gallery-residential.html`, `gallery-commercial.html` and `gallery-builder.html` (and the cover tiles, room lists and photo counts on `gallery.html`) are generated from
  `data/portfolio-images.txt` (one `<uploadcare-uuid> <filename>` per line). The filename prefix
  (`kitchen-`, `bar-`, `commercial-`…) picks the category and room group; see `GROUPS` in
  `scripts/build-portfolio.py`. After adding photos, run `python3 scripts/build-portfolio.py`.
- **Forms:** the home page and `contact.html` show a dashed *form placeholder* box (`.form-placeholder`). Replace each box with your embedded form (Formspree, HubSpot, Jotform, etc.); the box lists the fields it should collect.
- **Colors/fonts:** all tokens live at the top of `css/styles.css`.
