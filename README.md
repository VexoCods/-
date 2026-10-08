# Caffeine Cove

A premium cafe website: cinematic food photography, an editorial dark palette and
a fully working menu-to-cart ordering flow.

## Stack

Plain HTML, CSS and ES modules. No build step, no dependencies, no framework.

- `*.html` — one file per page (`index`, `menu`, `product`, `about`, `gallery`, `contact`, `cart`, `404`)
- `assets/css/` — `tokens.css` (design tokens) → `base.css` (reset + typography) → `components.css` → `pages.css`
- `assets/js/data/` — `site.js` (brand, nav, contact details) and `menu.js` (categories, products, option groups)
- `assets/js/lib/` — `dom.js`, `format.js`, `forms.js`, `cart.js` (sessionStorage-backed cart store)
- `assets/js/components/` — header, footer, product cards, option groups, quantity stepper, quick-view dialog, cart drawer, toast, reveal
- `assets/js/pages/` — one module per page, mounted from `assets/js/main.js` via `data-page` on `<body>`

## Running locally

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

The site is served on <http://localhost:3000>. The dev server (`tools/dev-server.mjs`)
serves the repo root, resolves extensionless routes (`/menu` → `menu.html`) and
live-reloads the browser when a source file changes. It has no dependencies.

## Notes

- **Content lives in data modules.** Add or edit a product in
  `assets/js/data/menu.js`; it appears on the menu, in the featured grid (add
  `featured: true`) and on its own `product.html?id=…` page.
- **Option groups are per-product.** Only the groups a product declares are
  rendered, so extras never appear where they don't apply.
- **Cart state** is kept in `sessionStorage` for the browsing session and shared
  by the header drawer and the cart page through the store's subscribe API.
- **Checkout is a demo flow** — no payment is taken; placing an order clears the
  cart and shows a confirmation with a reference number.
- Contact details, opening hours and social links are placeholders in
  `assets/js/data/site.js`.
