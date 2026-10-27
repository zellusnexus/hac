# Huntsville American Cabinets — site redesign

Static redesign for Huntsville American Cabinets, styled after the FITE Building Company look:
a dark grey and dark brown palette with gold accents, transparent nav over a full-bleed video hero,
serif statements (Source Serif 4), geometric sans UI (Jost), and gold CTAs.

Open `index.html` in a browser — no build step.

## Before launch
- **Copy:** elements marked `data-placeholder` (phone, email, street address, project captions, testimonial) are stand-ins. Replace them with real content.
- **Logo:** loaded from Uploadcare (header, footer, favicon). To self-host, save it as `assets/logo.png` and update the three URLs in `index.html`. The artwork is white-on-transparent, so keep it on dark backgrounds.
- **Media:** add files to `assets/` and they'll be picked up automatically:
  - `hero.mp4` (looping, muted drone/site clip) and `hero.jpg` (poster/fallback)
  - `serve-commercial.jpg`, `serve-residential.jpg`, `serve-architects.jpg`,
    `serve-builders.jpg` (the four "Who We Serve" cards)
  - `about.jpg`, `project-1.jpg`, `project-2.jpg`, `project-3.jpg`
  Until then, tinted gradients show in their place.
- **Contact form:** `action="#"` — point it at your form handler (Formspree, Netlify Forms, etc.).
- **Colors/fonts:** all tokens live at the top of `css/styles.css`.
