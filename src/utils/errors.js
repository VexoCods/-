'use strict';

/**
 * HTTP error types.
 *
 * Routes throw these; a single error handler at the end of the middleware
 * stack turns them into a response. The `messageKey` is an i18n key, so the
 * user always sees a friendly, translated message and never a stack trace.
 */

class HttpError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} messageKey i18n key for the user-facing message
   * @param {{publicMessage?: string}} [options]
   */
  constructor(status, messageKey, options = {}) {
    super(messageKey);
    this.name = 'HttpError';
    this.status = status;
    this.messageKey = messageKey;
    // Optional already-localised message (used by flash messages).
    this.publicMessage = options.publicMessage;
    this.expose = true;
  }
}

/** 400 with per-field messages, rendered next to the inputs in the forms. */
class ValidationError extends HttpError {
  /**
   * @param {Record<string, string>} fieldErrors field name -> translated message
   */
  constructor(fieldErrors, messageKey = 'error.bad_request') {
    super(400, messageKey);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

const badRequest = (key = 'error.bad_request') => new HttpError(400, key);
const unauthorized = (key = 'error.invalid_credentials') => new HttpError(401, key);
const forbidden = (key = 'error.forbidden') => new HttpError(403, key);
const notFound = (key = 'error.not_found') => new HttpError(404, key);

module.exports = { HttpError, ValidationError, badRequest, unauthorized, forbidden, notFound };
