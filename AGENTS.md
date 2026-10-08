# Caffeine Cove — agent notes

Static HTML/CSS/ES-module site. No build step, no npm dependencies, no framework.
Everything below is non-obvious knowledge for working in this repo.

## Running

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Serves on port 3000 via `tools/dev-server.mjs` (plain Node, zero dependencies).
The server resolves extensionless routes (`/menu` → `menu.html`), injects a
live-reload client into every HTML response and watches source files by polling
mtimes (bind mounts do not deliver inotify events reliably).

## How the app is wired

- `assets/js/main.js` is the single entry point. It mounts the header/footer,
  binds global quick-add, then calls the page module named by `data-page` on
  `<body>`.
- Page modules are keyed in the `PAGES` map in `main.js`. **Adding a page means
  adding its `<body data-page="…">` value to that map.**
- The cart store (`assets/js/lib/cart.js`) is a module singleton; the header
  drawer, the quick-view dialog and the cart page all read from it and subscribe
  to changes. Nothing else should touch `sessionStorage` directly.
- Product data and option groups live in `assets/js/data/menu.js`. Option groups
  are declared per product, so add-ons only render where they are relevant.
- The quick-view dialog and the product page share
  `assets/js/components/product-options.js` — change option behaviour there once.

## Verifying a change

- HTML/CSS/JS edits are picked up by the dev server without a restart (the
  browser reloads itself). A change to `docker-compose.base44.yml` needs
  `docker compose -f docker-compose.base44.yml up -d`.
- `curl -s localhost:3000/ | head` should return the served HTML with the
  live-reload script injected at the end of `<body>`.
- JS syntax can be checked without a browser:
  `for f in $(find assets/js -name '*.js'); do node --check "$f"; done`

## Gotchas

- Images are bundled under `assets/images/` (downloaded from Unsplash). Keep new
  imagery local rather than hot-linking, so the preview stays fast and offline-safe.
- `tools/dev-server.mjs` ignores `tools/` and `.base44/` when watching, so editing
  those will not trigger a reload.
- The font stack (Fraunces + Manrope) is loaded from Google Fonts in each page's
  `<head>`; there is no local font fallback file.
