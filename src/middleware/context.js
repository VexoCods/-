'use strict';

/**
 * Request context: which language the visitor is using, plus the small set of
 * values every template needs (translator, text direction, CSRF token, flash
 * messages, current admin, current path).
 *
 * The language comes from `?lang=xx` (and is then remembered in a cookie) so
 * the language switch is a plain link that works without JavaScript.
 */

const crypto = require('node:crypto');
const i18n = require('../i18n');
const config = require('../config');

const LANG_COOKIE = 'dm_lang';

/** Reads the language from the query string, then the cookie, then the default. */
function resolveLanguage(req) {
  const fromQuery = String(req.query.lang || '').toLowerCase();
  if (i18n.LANGUAGES.includes(fromQuery)) return fromQuery;

  const fromCookie = String(req.cookies?.[LANG_COOKIE] || '').toLowerCase();
  if (i18n.LANGUAGES.includes(fromCookie)) return fromCookie;

  return i18n.DEFAULT_LANGUAGE;
}

/**
 * Tiny cookie reader (no dependency needed for two cookies).
 * Only reads, never writes - sessions use express-session.
 */
function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of String(header).split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

function requestContext(req, res, next) {
  req.cookies = parseCookies(req.headers.cookie);

  const lang = resolveLanguage(req);
  req.lang = lang;

  // Remember the choice so the rest of the session keeps it.
  if (String(req.query.lang || '').toLowerCase() === lang) {
    res.cookie(LANG_COOKIE, lang, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.cookieSecure,
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  res.locals.lang = lang;
  res.locals.dir = i18n.dir(lang);
  res.locals.otherLang = lang === 'fa' ? 'en' : 'fa';
  res.locals.t = (key) => i18n.t(key, lang);
  // Language switch keeps the visitor on the same page.
  res.locals.langSwitchUrl = `${req.path}?lang=${lang === 'fa' ? 'en' : 'fa'}`;

  // One CSRF token per session, exposed to every form.
  if (req.session && !req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('base64url');
  }
  res.locals.csrfToken = req.session?.csrfToken || '';

  // Flash messages survive exactly one redirect.
  res.locals.flash = req.session?.flash || null;
  if (req.session?.flash) delete req.session.flash;

  res.locals.currentPath = req.path;
  res.locals.currentUser = null;
  res.locals.previewMode = config.isPreview;

  next();
}

/** Stores a message that the next rendered page will display. */
function setFlash(req, type, message) {
  if (!req.session) return;
  req.session.flash = { type, message };
}

module.exports = { requestContext, setFlash, LANG_COOKIE };
