# Project notes

Static site: `index.html` + `stayle.css` + `jvav.js` (Persian number-guessing game, 1–500,000).
No build step, no package manager, no backend, no external services — so no credentials are needed.

## Running it (Base44 sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- `.base44/Dockerfile.web` is a `node:22-alpine` image with only the `live-server` dev server installed;
  the repo is bind-mounted at `/app`, so edits are served directly from source with no rebuild.
- The web entry point is host port **3000**; `live-server` binds `0.0.0.0` and injects its reload script
  into the served HTML, so edits appear in the preview automatically.
- Healthcheck probes `GET /index.html` on 127.0.0.1:3000 with the image's busybox `wget`.
- `BASE44_PREVIEW_MODE` is passed through as a bare variable; nothing in this project branches on it
  (no sandbox-only overrides are needed for a static site).

## Verifying it works

1. `curl -s http://localhost:3000/ | grep guessInput` — should return the page markup.
2. In the browser: tapping keypad digits fills the input, `حذف` deletes the last digit, and `برسی`
   shows `بیا بالاتر ⬆️` / `بیا پایین‌تر ⬇️` / `قفل باز شد 🔓` and then clears the input.

## Quirks

- `jvav.js` and `stayle.css` are the intentional file names referenced by `index.html`; don't rename.
- `index.html` sets the input `readonly`, so digits must come from the on-screen keypad — the page is
  designed for tapping, not typing.
