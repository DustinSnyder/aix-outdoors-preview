# AIX Outdoors — visual samples

Static HTML/CSS only. No build step. Open `index.html` in a browser.

**Direction A is the selected look.** Direction B is kept as an alternate (same sitemap, SAMPLE banner still switches A ↔ B).

## Folders

| Path | Status | Direction | Palette |
|------|--------|-----------|---------|
| `a/` | **Selected** | Proof / conversion contractor catalog | Dark charcoal, olive, safety orange |
| `b/` | Alternate | Hunt-ready habitat | Cream paper, field green, gold |

Direction A is a 14-page site (adds `partners.html`). Direction B is the alternate 13-page set with its own `styles.css`. Internal links stay inside that folder. The yellow/green **SAMPLE** bar switches A ↔ B on the matching filename.

## Pages (identical sitemap in `a/` and `b/`)

- `index.html` — home (Direction A: conversion layout — proof hero, pain vs outcome, 3-step, gallery/YouTube placeholder, FAQ teaser, SAMPLE partners strip, Facebook rail)
- `services.html` — catalog + sample ranges
- `service-clearing.html` — Ground Clearing
- `service-trails.html` — Trail Creation and Management
- `service-plots.html` — Hunting Feeding Plots
- `service-stands.html` — Hunting Stand Management
- `service-mowing.html` — Large Plot Mowing
- `service-driveways.html` — Gravel Driveway Resurfacing
- `process.html`
- `gallery.html` — Direction A: Iowa/Midwest land pairs + labeled SAMPLE harvest frames (not real jobs/customers)
- `partners.html` — Direction A only: SAMPLE job-site products grouped by service (no brand logos)
- `service-area.html` — 100-mile radius of Burlington IA 52601 + SVG map (Cedar Rapids out)
- `quote.html` — static form (success state only; no backend) + sample pricing table
- `faq.html`

## Brand rules used here

- Wordmark is a geometric mark + “AIX Outdoors”. No owner face, no personal bio.
- Contact placeholders: Burlington IA · (555) 010-1249 · hello@aixoutdoors.example
- Service area: 100 miles of Burlington IA 52601. Cedar Rapids is explicitly **out**.
- Sample pricing is labeled **not a bid** on every rate.

## Photography

Direction A uses **local files** in `a/img/`:

- Unsplash Iowa/Midwest land: `iowa-corn-mason-city.jpg` (Mason City corn), `iowa-green-field.jpg`, `midwest-oak-timber.jpg`, `gravel-rural-lane.jpg`, `farm-rows.jpg`
- Generated **SAMPLE** harvest (adults only; not real AIX jobs or customers): `harvest-buck-timber.png`, `harvest-doe-trail.png`

Harvest frames appear only in the gallery and a small “why the work matters” strip on plots/stands — **not in the hero**. Captions mark them as illustrative placeholders until original photos arrive.

## Partners

Owner product partnerships are unknown. Direction A uses SAMPLE wordmark tiles (charcoal/olive/orange) — forestry mulching heads/carriers, plot seed/lime/soil test, rotary cutters, gravel/limestone, stands/blinds as access work. No official brand logos. Named when the owner confirms.

## Suggested screenshots

**Re-screenshot these first (Direction A selected):**

1. `a/index.html` — home: Iowa corn hero + proof strip + partner strip + Facebook rail
2. `a/gallery.html` — SAMPLE harvest + timber/land pairs
3. `a/partners.html` — SAMPLE job-site product tiles
4. `a/service-plots.html` (or another service) — product tiles + Iowa photos

Also useful: quote, service-area map, services, process, FAQ, root chooser, mobile home.

Open locally:

```bash
# from this folder
python3 -m http.server 8080
# then http://127.0.0.1:8080/
```
