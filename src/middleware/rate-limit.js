'use strict';

/**
 * Rate limiting - the first line of defence against brute force and abuse.
 *
 * Two layers:
 *   1. per-IP limits on the login endpoint and on the whole /admin area;
 *   2. per-account lockout after repeated failures (in services/users.js),
 *      which stops an attacker who rotates IP addresses.
 *
 * The client IP is taken from `req.ip`, which Express derives from
 * x-forwarded-for only because TRUST_PROXY is configured for a known number of
 * proxy hops. That is what stops an attacker spoofing the header to get a fresh
 * bucket for every attempt.
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');
const { setFlash } = require('./context');
const i18n = require('../i18n');

/** Builds a limiter whose handler flashes a translated message and redirects. */
function loginLimiter() {
  return rateLimit({
    windowMs: config.auth.loginWindowMinutes * 60 * 1000,
    limit: config.auth.loginMaxAttemptsPerIp,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Successful sign-ins do not count towards the limit.
    skipSuccessfulRequests: true,
    handler(req, res) {
      logger.security('login_rate_limited', { ip: req.ip });
      const lang = req.lang || i18n.DEFAULT_LANGUAGE;
      setFlash(req, 'error', i18n.t('error.too_many_requests', lang));
      return res.status(429).redirect('/admin/login');
    },
  });
}

/** A generous limit for the rest of the admin area (stops scripted abuse). */
function adminLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler(req, res) {
      logger.security('admin_rate_limited', { path: req.path, ip: req.ip });
      const lang = req.lang || i18n.DEFAULT_LANGUAGE;
      return res
        .status(429)
        .type('text/plain')
        .send(i18n.t('error.too_many_requests', lang));
    },
  });
}

module.exports = { loginLimiter, adminLimiter };
