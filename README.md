# Master Craftsmanship — site redesign

Static redesign of mastercraftsmanship.net, styled after the FITE Building Company look:
navy announcement bar, transparent nav over a full-bleed video hero, serif statements
(Source Serif 4), geometric sans UI (Jost), and burnt-orange CTAs.

Open `index.html` in a browser — no build step.

## Before launch
- **Copy:** elements marked `data-placeholder` (phone, address, stats, testimonial, about text) are stand-ins. Replace them with real content.
- **Media:** add files to `assets/` and they'll be picked up automatically:
  - `hero.mp4` (looping, muted drone/site clip) and `hero.jpg` (poster/fallback)
  - `service-custom-homes.jpg`, `service-remodeling.jpg`, `service-kitchens.jpg`,
    `service-carpentry.jpg`, `service-commercial.jpg`, `service-outdoor.jpg`
  - `about.jpg`, `project-1.jpg`, `project-2.jpg`, `project-3.jpg`
  Until then, tinted gradients show in their place.
- **Contact form:** `action="#"` — point it at your form handler (Formspree, Netlify Forms, etc.).
- **Colors/fonts:** all tokens live at the top of `css/styles.css`.
