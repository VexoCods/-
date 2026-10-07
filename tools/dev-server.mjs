#!/usr/bin/env node
/**
 * Horizon Properties — development static server.
 *
 * Zero dependencies on purpose: the site is plain HTML/CSS/ES modules, so there is
 * no bundler and nothing to install. This server only does what a dev loop needs:
 *   - serve the repository root (with extensionless routes: /properties -> properties.html)
 *   - inject a tiny live-reload client into every HTML response
 *   - push a reload over SSE whenever a source file changes
 *
 * The watcher polls file mtimes instead of using inotify, because bind-mounted
 * volumes do not reliably deliver filesystem events.
 */
import { createServer } from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';
const POLL_INTERVAL_MS = 600;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const LIVE_CLIENT = [
  '<script data-base44-live-reload>',
  '(function(){',
  "  var es = new EventSource('/__live');",
  "  es.onmessage = function (event) { if (event.data === 'reload') location.reload(); };",
  '})();',
  '</script>',
  '',
].join('\n');

const WATCH_IGNORED_DIRS = new Set(['.git', 'node_modules', '.base44', 'tools']);
const WATCH_EXTENSIONS = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg']);

/* ------------------------------------------------------------------ watcher */

/** @type {Map<string, number>} */
let snapshot = new Map();
/** @type {Set<import('node:http').ServerResponse>} */
const liveClients = new Set();

async function walk(dir) {
  const found = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || WATCH_IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await walk(full)));
    } else if (WATCH_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      found.push(full);
    }
  }
  return found;
}

async function takeSnapshot() {
  const next = new Map();
  for (const file of await walk(ROOT)) {
    try {
      next.set(file, (await stat(file)).mtimeMs);
    } catch {
      /* file vanished mid-scan */
    }
  }
  return next;
}

async function watchForChanges() {
  snapshot = await takeSnapshot();
  setInterval(async () => {
    const next = await takeSnapshot();
    let changed = next.size !== snapshot.size;
    if (!changed) {
      for (const [file, mtime] of next) {
        if (snapshot.get(file) !== mtime) {
          changed = true;
          break;
        }
      }
    }
    if (!changed) return;
    snapshot = next;
    console.log('[dev-server] change detected — reloading %d client(s)', liveClients.size);
    for (const client of liveClients) client.write('data: reload\n\n');
  }, POLL_INTERVAL_MS);
}

/* ------------------------------------------------------------------- serving */

function injectLiveReload(html) {
  return html.includes('</body>')
    ? html.replace('</body>', `${LIVE_CLIENT}</body>`)
    : html + LIVE_CLIENT;
}

async function resolveRequestPath(urlPath) {
  let target = path.join(ROOT, decodeURIComponent(urlPath));
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) return null; // path traversal

  const candidates = [target];
  if (!path.extname(target)) candidates.push(`${target}.html`);

  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isDirectory()) {
        const indexFile = path.join(candidate, 'index.html');
        const indexInfo = await stat(indexFile);
        if (indexInfo.isFile()) return indexFile;
        continue;
      }
      if (info.isFile()) return candidate;
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

async function respondWithFile(res, file, statusCode = 200) {
  const body = await readFile(file);
  const isHtml = path.extname(file).toLowerCase() === '.html';
  res.writeHead(statusCode, {
    'Content-Type': MIME_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  res.end(isHtml ? injectLiveReload(body.toString('utf8')) : body);
}

const server = createServer(async (req, res) => {
  const urlPath = (req.url ?? '/').split('?')[0];

  if (urlPath === '/__live') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
    });
    res.write(': connected\n\n');
    liveClients.add(res);
    req.on('close', () => liveClients.delete(res));
    return;
  }

  try {
    const file = await resolveRequestPath(urlPath === '/' ? '/index.html' : urlPath);
    if (!file) {
      const notFound = await resolveRequestPath('/404.html');
      if (notFound) return respondWithFile(res, notFound, 404);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    await respondWithFile(res, file);
  } catch (error) {
    console.error('[dev-server] %s', error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log('[dev-server] serving %s at http://%s:%d', ROOT, HOST, PORT);
  watchForChanges();
});
