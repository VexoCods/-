# Working notes (Base44 sandbox)

Notes that are not obvious from the manifests. Keep them short and current.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- The preview is served on host port **3000**.
- The container builds the Dockerfile `base` stage (runtime only, no source) and
  bind-mounts the repo, running `node --watch src/server.js`. Source edits
  hot-reload; no rebuild needed.
- Dependencies install at container start with `npm ci` into the `menu_node_modules`
  volume, from the committed `package-lock.json`. After changing dependencies,
  re-run `docker compose ... up -d` so it re-syncs. Never delete `menu_data`.

## Verify it works

```bash
curl -s http://localhost:3000/healthz                       # {"status":"ok"} (also the healthcheck)
curl -s http://localhost:3000/ | grep -c 'class="chip"'     # category chips on the public menu
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/admin/login   # 200 login form
```

CSRF is a synchroniser token in the session. A `POST /admin/login` **without** a
`_csrf` token is correctly rejected with **403**; with a valid token it is
accepted. Seeing `csrf_rejected`/`request_rejected` for a token-less POST is
expected behaviour, not a bug.

## Non-obvious behaviour

- SQLite database and uploaded images live in the `menu_data` volume at
  `/app/data`. Deleting that volume wipes all menu content.
- `SESSION_SECRET` is a user secret delivered via `/run/base44/app.env`. If it is
  absent in development, the app generates an ephemeral one (admin sessions then
  end on restart); in production it refuses to boot without it.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` are optional bootstrap credentials; when both
  are set they are re-applied to that account on every start.
- `SEED_DEMO=1` (set in the sandbox compose) loads demo content when the database
  is empty, so the menu is never blank on first boot.
- Sandbox overrides are gated on `BASE44_PREVIEW_MODE` or live only in the
  compose file: `ALLOWED_HOSTS` carries the preview proxy wildcards and
  `FORCE_HTTPS=0`. Production leaves `ALLOWED_HOSTS` unset and sets `FORCE_HTTPS=1`.

## Tests

No automated test suite in the repo. Verify by hand with the curl checks above.
