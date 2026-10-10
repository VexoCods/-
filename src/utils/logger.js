'use strict';

/**
 * Minimal logger.
 *
 * Rules (see docs/SECURITY.md "Logging"):
 *  - never log request bodies, cookies, passwords, tokens or full query strings;
 *  - log the request path only, so a query string can never leak a secret;
 *  - security events (failed logins, lockouts, blocked requests) are logged
 *    with the client IP, which is what an administrator needs to investigate.
 */

function timestamp() {
  return new Date().toISOString();
}

function write(level, message, meta) {
  const line = `[${timestamp()}] ${level.toUpperCase()} ${message}`;
  const extra = meta === undefined ? '' : ` ${JSON.stringify(meta)}`;
  if (level === 'error') console.error(line + extra);
  else if (level === 'warn') console.warn(line + extra);
  else console.log(line + extra);
}

module.exports = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),

  /** Logs one finished request. Path only - never the query string. */
  request(method, path, status, durationMs) {
    write('info', `${method} ${path} ${status} ${durationMs}ms`);
  },

  /** Security-relevant event, kept separate so it is easy to grep. */
  security(event, meta) {
    write('warn', `SECURITY ${event}`, meta);
  },
};
