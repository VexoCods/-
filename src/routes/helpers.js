'use strict';

/**
 * Shared helpers for building route handlers that render EJS views.
 */

/**
 * Renders a view with the values every template expects.
 * Keeping this in one place means `lang`, `dir`, `csrfToken` and the translator
 * are never missing from a page.
 */
function renderPage(res, view, data = {}) {
  return res.render(view, data);
}

/**
 * Renders an error page. In production the message stays generic so internal
 * details never leak; in development the real error helps the maintainer.
 */
function renderError(res, { status, message, detail }) {
  return res.status(status).render('error', { status, message, detail });
}

module.exports = { renderPage, renderError };
