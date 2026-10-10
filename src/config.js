'use strict';

/**
 * Central configuration.
 *
 * Everything the application needs to know about its environment is read here
 * exactly once, so no other file has to touch `process.env` for settings.
 */

const path = require('node:path');
const crypto = require('node:crypto');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

/**
 * The platform exports BASE44_PREVIEW_MODE=1 inside the sandbox preview.
 * We use it for one narrow purpose only: accepting the preview proxy hostnames
 * (the sandbox hostname rotates on every recreate, so they cannot be hardcoded).
 * Any other value - or the variable being absent - keeps normal behaviour.
 */
const isPreview = process.env.BASE44_PREVIEW_MODE === '1';

/* -------------------------------------------------------------------------- */
/* Secrets                                                                    */
/* -------------------------------------------------------------------------- */

let sessionSecret = process.env.SESSION_SECRET || '';

if (!sessionSecret) {
  if (isProduction) {
    // Fail fast: a guessable session secret means forgeable admin sessions.
    throw new Error(
      'SESSION_SECRET is required when NODE_ENV=production. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"'
    );
  }
  // Development only: keep the app bootable, but do not pretend to be secure.
  sessionSecret = crypto.randomBytes(48).toString('base64url');
  console.warn(
    '[config] SESSION_SECRET is not set - using an ephemeral development secret. ' +
      'Admin sessions will end when the server restarts.'
  );
}

/* -------------------------------------------------------------------------- */
/* Paths                                                                      */
/* -------------------------------------------------------------------------- */

const dataDir = path.resolve(process.env.DATA_DIR || path.join(__dirname, '..', 'data'));

/* -------------------------------------------------------------------------- */
/* Networking                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Host header allowlist (defence in depth against host-header attacks).
 * Empty list = no restriction (the historical behaviour).
 * Wildcards are supported, e.g. "*.example.com".
 */
const allowedHosts = String(process.env.ALLOWED_HOSTS || '')
  .split(',')
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY ?? '1', 10);

module.exports = {
  nodeEnv,
  isProduction,
  isPreview,

  port: Number.parseInt(process.env.PORT || '3000', 10),

  dataDir,
  uploadDir: path.join(dataDir, 'uploads'),
  dbFile: path.join(dataDir, 'menu.db'),

  sessionSecret,
  // Session cookie duration: 8 hours, refreshed while the admin is active.
  sessionMaxAgeMs: 8 * 60 * 60 * 1000,
  // `true` when HTTPS terminates at the reverse proxy in production.
  cookieSecure: isProduction,

  adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',

  trustProxy: Number.isFinite(trustProxyHops) ? trustProxyHops : 0,
  forceHttps: process.env.FORCE_HTTPS === '1',
  publicBaseUrl: (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, ''),
  allowedHosts,
  seedDemo: process.env.SEED_DEMO === '1',

  /** Upload limits (see docs/SECURITY.md). */
  upload: {
    maxBytes: 5 * 1024 * 1024, // 5 MB
    maxFiles: 1,
    // Longest edge of the stored image, in pixels.
    maxDimension: 1200,
    minDimension: 32,
    webpQuality: 82,
  },

  /** Login protection. */
  auth: {
    maxFailures: 5, // per account
    lockoutMinutes: 15,
    loginWindowMinutes: 15,
    loginMaxAttemptsPerIp: 20,
  },
};
