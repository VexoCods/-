'use strict';

/**
 * Application entry point.
 *
 * The middleware order below is the security design, so it is worth reading
 * top to bottom:
 *
 *   1. security headers   - every response, including errors, is hardened
 *   2. host allowlist     - refuse requests for hostnames we do not serve
 *   3. HTTPS redirect     - production only
 *   4. tiny body limits   - no giant payloads
 *   5. sessions           - server-side session store (SQLite)
 *   6. request context    - language, CSRF token, flash messages
 *   7. loadUser           - re-read the admin from the database on every request
 *   8. static files       - with correct caching, uploads served read-only
 *   9. routes             - public menu, login, protected admin
 *  10. error handler      - translates failures, never leaks internals
 */

const path = require('node:path');
const express = require('express');
const session = require('express-session');

const config = require('./config');
const { db, close } = require('./db');
const users = require('./services/users');
const seed = require('./services/seed');
const i18n = require('./i18n');
const logger = require('./utils/logger');
const { SqliteStore } = require('./utils/session-store');
const { formatPrice, discountedPrice, formatRating, formatDateTime } = require('./utils/format');
const { securityHeaders, hostAllowlist, enforceHttps, noStore, immutableUploads } = require('./middleware/security');
const { requestContext } = require('./middleware/context');
const { loadUser } = require('./middleware/auth');
const { requireAdmin } = require('./middleware/auth');
const publicModule = require('./routes/public');
const authModule = require('./routes/auth');
const adminModule = require('./routes/admin');

const app = express();

/* -------------------------------------------------------------------------- */
/* Basics                                                                     */
/* -------------------------------------------------------------------------- */

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
// Only trust the number of proxy hops you actually operate.
app.set('trust proxy', config.trustProxy);
// In production, Express strips stack traces from its own error output.
if (config.isProduction) app.set('env', 'production');

/* -------------------------------------------------------------------------- */
/* 1-3. Security headers, host allowlist, HTTPS                               */
/* -------------------------------------------------------------------------- */

app.use(...securityHeaders());
app.use(hostAllowlist(config.allowedHosts));
app.use(enforceHttps);

/* -------------------------------------------------------------------------- */
/* 4. Request bodies (small, explicit limits)                                 */
/* -------------------------------------------------------------------------- */

app.use(express.urlencoded({ extended: false, limit: '200kb', parameterLimit: 200 }));
app.use(express.json({ limit: '100kb' }));

/* -------------------------------------------------------------------------- */
/* 5. Sessions                                                                */
/* -------------------------------------------------------------------------- */

const sessionStore = new SqliteStore(db, { ttlMs: config.sessionMaxAgeMs });

app.use(
  session({
    name: 'dm.sid',
    secret: config.sessionSecret,
    store: sessionStore,
    resave: false,
    // A session is created for anonymous visitors so the login form has a CSRF
    // token before anyone signs in.
    saveUninitialized: true,
    // Kept false: the public menu is read by many phones and must not write a
    // session row on every request. Authenticated sessions are refreshed below.
    rolling: false,
    cookie: {
      httpOnly: true, // not readable from JavaScript (XSS cannot steal it)
      sameSite: 'lax', // not sent on cross-site POSTs (CSRF defence in depth)
      secure: config.cookieSecure, // HTTPS-only in production
      path: '/',
      maxAge: config.sessionMaxAgeMs,
    },
  })
);

/* -------------------------------------------------------------------------- */
/* 6-7. Request context and the current admin                                 */
/* -------------------------------------------------------------------------- */

app.use(requestContext);

app.use((req, res, next) => {
  // Keep a signed-in admin's session alive while they work, without writing a
  // session row for every anonymous menu view.
  if (req.session?.userId) req.session.cookie.maxAge = config.sessionMaxAgeMs;
  next();
});

app.use(loadUser);

/* -------------------------------------------------------------------------- */
/* View helpers available to every template                                   */
/* -------------------------------------------------------------------------- */

app.use((req, res, next) => {
  res.locals.appName = i18n.t('app.name', req.lang);
  res.locals.formatPrice = formatPrice;
  res.locals.discountedPrice = discountedPrice;
  res.locals.formatRating = formatRating;
  res.locals.formatDateTime = formatDateTime;
  res.locals.year = new Date().getFullYear();
  next();
});

/* -------------------------------------------------------------------------- */
/* 8. Static files                                                            */
/* -------------------------------------------------------------------------- */

app.use(
  '/static',
  express.static(path.join(__dirname, '..', 'public'), {
    dotfiles: 'deny',
    index: false,
    etag: true,
    maxAge: '1h',
    setHeaders(res, filePath) {
      // Fonts never change under the same name: cache them for a year.
      if (filePath.includes(`${path.sep}fonts${path.sep}`)) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// Uploaded images. Random file names, read-only, long cache.
app.use(
  '/uploads',
  express.static(config.uploadDir, {
    dotfiles: 'deny',
    index: false,
    redirect: false,
    maxAge: '1y',
    immutable: true,
    setHeaders: immutableUploads,
  })
);

/* -------------------------------------------------------------------------- */
/* 9. Routes                                                                  */
/* -------------------------------------------------------------------------- */

// Public menu (no authentication) - also carries /healthz.
app.use('/', publicModule.router);

// Login/logout live under /admin but must stay reachable without a session.
app.use('/admin', authModule.router);

// Everything else under /admin requires an authenticated admin.
app.use('/admin', requireAdmin, adminModule.router);

/* -------------------------------------------------------------------------- */
/* 10. Not found and error handling                                           */
/* -------------------------------------------------------------------------- */

app.use((req, res) => {
  const message = i18n.t('error.not_found', req.lang || i18n.DEFAULT_LANGUAGE);
  if (req.accepts(['html', 'json']) === 'json') {
    return res.status(404).json({ error: message });
  }
  return res.status(404).render('error', { status: 404, message, detail: null });
});

// eslint-disable-next-line no-unused-vars -- Express identifies the error handler by its 4 arguments
app.use((error, req, res, next) => {
  const lang = req.lang || i18n.DEFAULT_LANGUAGE;
  const status = Number(error.status) || 500;

  if (status >= 500) {
    // Log the technical detail server-side; the visitor sees only a friendly line.
    logger.error('Request failed', {
      path: req.path,
      method: req.method,
      error: error.name,
      message: error.message,
      stack: config.isProduction ? undefined : error.stack,
    });
  } else {
    logger.security('request_rejected', {
      path: req.path,
      method: req.method,
      status,
      reason: error.messageKey || error.name,
    });
  }

  const key =
    error.messageKey ||
    (status === 404
      ? 'error.not_found'
      : status === 403
        ? 'error.forbidden'
        : status === 400
          ? 'error.bad_request'
          : 'error.generic');

  const message = error.publicMessage || i18n.t(key, lang);

  if (req.accepts(['html', 'json']) === 'json') {
    return res.status(status).json({ error: message });
  }

  // Stack traces are a development aid only.
  const detail = config.isProduction
    ? null
    : `${error.name}: ${error.message}${error.stack ? `\n\n${error.stack}` : ''}`;

  return res.status(status).render('error', { status, message, detail });
});

/* -------------------------------------------------------------------------- */
/* Startup                                                                    */
/* -------------------------------------------------------------------------- */

async function bootstrapAdmin() {
  if (!config.adminEmail || !config.adminPassword) {
    if (users.countAdmins() === 0) {
      logger.warn(
        'No admin account exists. Create one with: npm run create-admin -- --email you@example.com'
      );
    }
    return;
  }

  await users.upsertAdmin(config.adminEmail, config.adminPassword);
  logger.info('Bootstrap admin account is ready');
}

async function start() {
  await bootstrapAdmin();

  if (config.seedDemo) seed.seedIfEmpty();

  const server = app.listen(config.port, '0.0.0.0', () => {
    logger.info(`Digital menu running on http://0.0.0.0:${config.port} (${config.nodeEnv})`);
    logger.info(
      `Admin panel: /admin  |  Public menu: /  |  Uploads: ${path.relative(process.cwd(), config.uploadDir) || config.uploadDir}`
    );
    if (!config.publicBaseUrl) {
      logger.warn('PUBLIC_BASE_URL is not set - the admin QR code will use the request host.');
    }
  });

  // Graceful shutdown: finish in-flight requests, stop timers, close the database.
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => {
      sessionStore.stopCleanup();
      close();
      process.exit(0);
    });
    // Do not hang forever if a connection refuses to close.
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

if (require.main === module) {
  start().catch((error) => {
    logger.error('Failed to start', { message: error.message });
    process.exit(1);
  });
}

module.exports = { app, start };
