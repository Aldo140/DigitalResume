# Aldo Ortiz — Terminal Portfolio

A digital resume built as a **live market terminal** — because my work lives at the
intersection of fintech, data, and code.

**Live:** https://aldo140.github.io/DigitalResume/

## The concept

Instead of another dark portfolio template, the whole site behaves like a trading
terminal for my career:

- **Hero** — a self-drawing, continuously animating career chart on `<canvas>`
- **Ticker tape** — skills scroll across the bottom like market symbols
- **Watchlist** — skills as a live table with level bars and sparklines
- **Holdings** — projects as ticker-symbol cards (`MRUH`, `AMRN`, `CNRP`…) that open full prospectuses
- **Order history** — work experience as open/filled positions
- **Crosshair cursor** — the page is a chart; the cursor shows live coordinates
- **Boot sequence** — a fast terminal boot on first load

## Stack

Zero frameworks, zero build step. Hand-written HTML, CSS, and vanilla JS.

- Canvas 2D for the hero chart, `IntersectionObserver` for scroll reveals and count-ups
- Native `<dialog>` for project detail modals
- Type: Bricolage Grotesque · IBM Plex Sans · IBM Plex Mono
- Respects `prefers-reduced-motion` throughout; responsive down to mobile

## Structure

```
├── index.html          # the whole site
├── 404.html            # redirects retired /pages/* URLs
├── sw.js               # self-destructing service worker (clears old caches)
├── src/
│   ├── styles/main.css
│   └── js/main.js
└── assets/
    ├── images/         # headshot, favicon
    └── resume.pdf
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Contact

- aldoortiz14@gmail.com
- [LinkedIn](https://www.linkedin.com/in/aldo-ortiz14/) · [GitHub](https://github.com/Aldo140)

MIT License.
