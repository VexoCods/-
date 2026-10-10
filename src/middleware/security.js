'use strict';

/**
 * Web security configuration: security headers, HTTPS enforcement and the
 * Host-header allowlist.
 *
 * Every header below is a deliberate answer to a specific attack:
 *   Content-Security-Policy - blocks injected scripts/styles (XSS)
 *   Strict-Transport-Security - stops protocol downgrade / cookie theft (prod)
 *   X-Content-Type-Options - stops MIME sniffing of uploads
 *   X-Frame-Options + frame-ancestors - stops clickjacking
 *   Referrer-Policy - stops leaking URLs to third parties
 *   Permissions-Policy - switches off hardware APIs the app never uses
 */

const helmet = require('helmet');
const config = require('../config');

/**
 * Content Security Policy.
 *
 * `'self'` only: no inline <script>, no inline `style=""` attributes, no CDN.
 * Everything the page needs (CSS, JS, fonts, images) is served from this origin,
 * so a successful HTML injection still cannot execute script.
 */
const contentSecurityPolicy = {
  useDefaults: false,
  directives: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'media-src': ["'none'"],
    'object-src': ["'none'"],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    // Blocks mixed content and upgrades accidental http:// subresources.
    'upgrade-insecure-requests': config.isProduction ? [] : null,
  },
};

// `null` values are removed by helmet, which lets us drop a directive outside
// production without writing two policies.
const directives = Object.fromEntries(
  Object.entries(contentSecurityPolicy.directives).filter(([, value]) => value !== null)
);

/**
 * Permissions-Policy is written by hand instead of through helmet so the exact
 * value is visible in the code: every powerful browser API the app does not
 * need is switched off for this origin.
 */
function permissionsPolicy(req, res, next) {
  res.setHeader(
    'Permissions-Policy',
    [
      'accelerometer=()',
      'autoplay=()',
      'camera=()',
      'display-capture=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
    ].join(', ')
  );
  next();
}

function securityHeaders() {
  return [
    helmet({
      contentSecurityPolicy: { useDefaults: false, directives },
      // HSTS only when HTTPS is terminated in front of the app. Sending it in
      // local development would pin http://localhost in the developer's browser.
      hsts: config.isProduction
        ? { maxAge: 15552000, includeSubDomains: true, preload: false }
        : false,
      // Clickjacking: refuse to be framed at all.
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      // No MIME sniffing of uploaded files.
      noSniff: true,
      dnsPrefetchControl: { allow: false },
      // Hide the framework banner.
      hidePoweredBy: true,
      // The app serves no cross-origin resources, so this policy is not needed.
      crossOriginEmbedderPolicy: false,
    }),
    permissionsPolicy,
  ];
}

/**
 * Reject requests whose Host header is not in the allowlist.
 * An empty allowlist means "no restriction" (the default outside the sandbox).
 * Wildcards are supported: "*.example.com" matches any subdomain.
 */
function hostAllowlist(allowedHosts) {
  return function hostGuard(req, res, next) {
    if (!allowedHosts || allowedHosts.length === 0) return next();

    const host = String(req.headers.host || '')
      .trim()
      .toLowerCase()
      // Strip the port; the allowlist stores hostnames only.
      .replace(/:\d+$/, '');

    const allowed = allowedHosts.some((entry) =>
      entry.startsWith('*.') ? host.endsWith(entry.slice(1)) : host === entry
    );

    if (!allowed) {
      return res.status(400).type('text/plain').send('Bad Request: unrecognised host.');
    }
    return next();
  };
}

/**
 * Force HTTPS in production. `x-forwarded-proto` is only trusted because
 * TRUST_PROXY is set for deployments behind a reverse proxy.
 */
function enforceHttps(req, res, next) {
  if (!config.forceHttps) return next();
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || '').split(',')[0].trim();
  if (proto === 'https') return next();

  // The host header is attacker-controlled: only use it if it passed the
  // allowlist, and never echo it back unescaped.
  const host = String(req.headers.host || '').replace(/[^\w.:\-[\]]/g, '');
  return res.redirect(301, `https://${host}${req.originalUrl}`);
}

/**
 * Admin pages and uploads must never be cached by shared caches - they contain
 * an authenticated session's data.
 */
function noStore(req, res, next) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  next();
}

/** Long-lived caching for uploaded images (file names are random). */
function immutableUploads(res) {
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.set('X-Content-Type-Options', 'nosniff');
}

module.exports = { securityHeaders, hostAllowlist, enforceHttps, noStore, immutableUploads };
