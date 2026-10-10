'use strict';

/**
 * Authentication middleware.
 *
 * `loadUser` runs for every request: when the session points at an account that
 * no longer exists (deleted or revoked), the session is destroyed immediately,
 * so a stale cookie cannot keep access. The user is re-read from the database
 * on every request, which means role changes take effect at once.
 *
 * `requireAdmin` is mounted in front of every /admin route except the login
 * page. It is the server-side gate - hiding buttons in the UI is never enough.
 */

const users = require('../services/users');
const { forbidden } = require('../utils/errors');
const { setFlash } = require('./context');

function loadUser(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) return next();

  const user = users.findById(userId);
  if (!user) {
    // The account disappeared while the session was alive.
    return req.session.destroy(() => next());
  }

  req.user = user;
  res.locals.currentUser = { id: user.id, email: user.email, role: user.role };
  return next();
}

/** Blocks anything that is not an authenticated admin. */
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();

  if (req.method === 'GET' || req.method === 'HEAD') {
    setFlash(req, 'error', res.locals.t ? res.locals.t('error.forbidden') : 'Access denied.');
    return res.redirect('/admin/login');
  }

  // State-changing requests get a hard failure, never a silent redirect.
  return next(forbidden());
}

module.exports = { loadUser, requireAdmin };
