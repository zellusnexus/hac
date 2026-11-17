# Huntsville American Cabinets — site redesign

Static redesign for Huntsville American Cabinets, styled after the FITE Building Company look:
a dark grey and dark brown palette with gold accents, transparent nav over a full-bleed video hero,
serif statements (Source Serif 4), geometric sans UI (Jost), and gold CTAs.

Open `index.html` in a browser — no build step.

## Pages
The site keeps the old site's page structure (Home, Services, Gallery, Contact) plus an About page.
All pages share the same header, footer and `css/styles.css`; dropdown items jump to sections within each page:

| Menu | Page | Sections (anchor) |
| --- | --- | --- |
| Home | `index.html` | |
| Services | `services.html` | overview, `#commercial`, `#residential`, `#architects-designers`, `#custom-home-builders`, `#process` |
| Gallery | `gallery.html` | overview, `#gallery-residential`, `#gallery-commercial`, `#gallery-builder` |
| About | `about.html` | Our Story, `#quality`, `#testimonials` |
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
- **Gallery photos:** the Residential, Commercial and Builder galleries on `gallery.html` are generated from
  `data/portfolio-images.txt` (one `<uploadcare-uuid> <filename>` per line). The filename prefix
  (`kitchen-`, `bar-`, `commercial-`…) picks the category and room group; see `GROUPS` in
  `scripts/build-portfolio.py`. After adding photos, run `python3 scripts/build-portfolio.py`.
- **Contact form:** `action="#"` — point it at your form handler (Formspree, Netlify Forms, etc.).
- **Colors/fonts:** all tokens live at the top of `css/styles.css`.
