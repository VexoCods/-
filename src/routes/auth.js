'use strict';

/**
 * Sign in / sign out.
 *
 * Security notes:
 *  - the password is never compared to a hardcoded value, only to a scrypt hash
 *    read from the database;
 *  - the response is identical for "no such account" and "wrong password", and
 *    the hash comparison always runs, so timing does not reveal which is which;
 *  - repeated failures lock the account for a while (services/users.js), and the
 *    endpoint itself is rate limited per IP (middleware/rate-limit.js);
 *  - a successful sign-in regenerates the session id (session fixation).
 */

const crypto = require('node:crypto');
const express = require('express');
const users = require('../services/users');
const { Validator, singleValue } = require('../utils/validate');
const { setFlash } = require('../middleware/context');
const { verifyCsrf } = require('../middleware/csrf');
const { loginLimiter } = require('../middleware/rate-limit');
const logger = require('../utils/logger');
const config = require('../config');

const router = express.Router();

/** GET /admin/login - the sign-in form. */
router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/admin');
  return res.render('admin/login', { pageTitle: res.locals.t('admin.login'), errors: {} });
});

/** POST /admin/login */
router.post('/login', loginLimiter(), verifyCsrf, async (req, res, next) => {
  try {
    const t = res.locals.t;
    const validator = new Validator(req.lang);

    const email = validator.email(singleValue(req.body.email), {
      field: 'email',
      label: t('admin.email'),
    });
    const password = validator.text(singleValue(req.body.password), {
      field: 'password',
      label: t('admin.password'),
      max: 200,
    });

    if (validator.hasErrors()) {
      // Do not echo which field was wrong - just ask again.
      setFlash(req, 'error', t('error.invalid_credentials'));
      return res.status(400).redirect('/admin/login');
    }

    const user = users.findByEmail(email);

    if (!user || users.isLocked(user)) {
      if (user) {
        logger.security('login_locked_account', { ip: req.ip });
        setFlash(req, 'error', t('error.account_locked'));
      } else {
        // Still do the work, so the timing matches a wrong password.
        await users.verifyPassword(password, null);
        logger.security('login_unknown_account', { ip: req.ip });
        setFlash(req, 'error', t('error.invalid_credentials'));
      }
      return res.status(401).redirect('/admin/login');
    }

    users.clearExpiredLock(user);
    const passwordMatches = await users.verifyPassword(password, user.password_hash);

    if (!passwordMatches) {
      users.registerFailure(user);
      logger.security('login_failed', { ip: req.ip, account: user.id });
      setFlash(req, 'error', t('error.invalid_credentials'));
      return res.status(401).redirect('/admin/login');
    }

    users.registerSuccess(user);

    // Session fixation: throw the old session away and start a fresh one.
    return req.session.regenerate((regenerateError) => {
      if (regenerateError) return next(regenerateError);

      req.session.userId = user.id;
      req.session.csrfToken = crypto.randomBytes(32).toString('base64url');
      req.session.cookie.maxAge = config.sessionMaxAgeMs;

      // Persist before redirecting, so the next request always sees the session.
      return req.session.save((saveError) => {
        if (saveError) return next(saveError);
        logger.info('Admin signed in', { accountId: user.id });
        setFlash(req, 'success', res.locals.t('admin.logged_in'));
        return res.redirect('/admin');
      });
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /admin/logout
 * The session row is deleted server side, so the cookie is worthless even if it
 * is replayed. The cookie itself is cleared too.
 */
router.post('/logout', verifyCsrf, (req, res) => {
  const lang = req.lang;
  return req.session.destroy(() => {
    res.clearCookie('dm.sid', { path: '/' });
    return res.redirect(`/admin/login?lang=${lang}`);
  });
});

module.exports = { router };
