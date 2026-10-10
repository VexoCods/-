'use strict';

/**
 * CSRF protection (synchroniser token pattern).
 *
 * Every state-changing request must carry the token that lives in the visitor's
 * session, either in the `_csrf` form field or in the `x-csrf-token` header.
 * Because an attacker's site cannot read the token (same-origin policy), it
 * cannot forge a valid POST. Session cookies are also SameSite=Lax, so a
 * cross-site POST never even carries the session.
 *
 * We additionally verify Origin/Referer on state-changing requests, which
 * catches cases where a token leaks into an unexpected context.
 */

const crypto = require('node:crypto');
const { forbidden } = require('../utils/errors');
const config = require('../config');
const logger = require('../utils/logger');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Constant-time string comparison (prevents timing attacks on the token). */
function safeEqual(a, b) {
  const bufferA = Buffer.from(String(a || ''), 'utf8');
  const bufferB = Buffer.from(String(b || ''), 'utf8');
  if (bufferA.length !== bufferB.length || bufferA.length === 0) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

/** Hosts we accept in Origin/Referer. Derived from the Host allowlist. */
function originAllowed(req) {
  const origin = req.get('origin') || req.get('referer');
  if (!origin) return true; // Non-browser clients (curl, tests) send neither.

  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  // Same host as the request itself is always fine.
  const requestHost = String(req.headers.host || '').toLowerCase();
  if (url.host.toLowerCase() === requestHost) return true;

  // Otherwise it must match the configured allowlist (sandbox preview hosts).
  return config.allowedHosts.some((entry) =>
    entry.startsWith('*.')
      ? url.hostname.toLowerCase().endsWith(entry.slice(1))
      : url.hostname.toLowerCase() === entry
  );
}

/**
 * Verifies the CSRF token. Must run AFTER the request body has been parsed
 * (including multipart bodies - see the upload middleware in routes/admin.js).
 */
function verifyCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (!req.session) return next(forbidden('error.csrf'));

  const supplied = single(req.body?._csrf) || req.get('x-csrf-token') || '';
  if (!safeEqual(supplied, req.session.csrfToken)) {
    logger.security('csrf_rejected', { path: req.path, ip: req.ip });
    return next(forbidden('error.csrf'));
  }

  if (!originAllowed(req)) {
    logger.security('csrf_origin_rejected', { path: req.path, ip: req.ip });
    return next(forbidden('error.csrf'));
  }

  return next();
}

/** Form values can arrive as arrays; take the last one and compare as string. */
function single(value) {
  return Array.isArray(value) ? value[value.length - 1] : value;
}

module.exports = { verifyCsrf, safeEqual, originAllowed };
