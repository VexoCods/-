'use strict';

/**
 * SQLite-backed session store for express-session.
 *
 * Why not the default MemoryStore: it leaks memory and forgets every session
 * when the process restarts, so the owner would be logged out on each deploy.
 * Sessions are stored server-side (the cookie only carries an opaque id), which
 * is what makes "enforce logout" possible - destroying the row kills the session
 * immediately, everywhere.
 */

const { Store } = require('express-session');

class SqliteStore extends Store {
  /**
   * @param {import('better-sqlite3').Database} db
   * @param {{ ttlMs: number }} options
   */
  constructor(db, { ttlMs }) {
    super();
    this.db = db;
    this.ttlMs = ttlMs;

    // Prepared once, reused for every request (fast + always parameterised).
    this.statements = {
      get: db.prepare('SELECT data, expires FROM sessions WHERE sid = ?'),
      set: db.prepare(
        `INSERT INTO sessions (sid, expires, data) VALUES (?, ?, ?)
         ON CONFLICT(sid) DO UPDATE SET expires = excluded.expires, data = excluded.data`
      ),
      touch: db.prepare('UPDATE sessions SET expires = ? WHERE sid = ?'),
      destroy: db.prepare('DELETE FROM sessions WHERE sid = ?'),
      clear: db.prepare('DELETE FROM sessions'),
      count: db.prepare('SELECT COUNT(*) AS total FROM sessions WHERE expires > ?'),
      all: db.prepare('SELECT sid, data FROM sessions WHERE expires > ?'),
      expired: db.prepare('DELETE FROM sessions WHERE expires < ?'),
    };

    // Drop expired rows periodically instead of scanning on every request.
    this.cleanupTimer = setInterval(() => this.cleanup(), Math.min(ttlMs, 15 * 60 * 1000));
    this.cleanupTimer.unref?.();
  }

  #expiry(session) {
    const cookieExpires = session?.cookie?.expires;
    if (cookieExpires) return new Date(cookieExpires).getTime();
    return Date.now() + this.ttlMs;
  }

  get(sid, callback) {
    try {
      const row = this.statements.get.get(sid);
      if (!row) return callback(null, null);
      if (row.expires < Date.now()) {
        this.statements.destroy.run(sid);
        return callback(null, null);
      }
      return callback(null, JSON.parse(row.data));
    } catch (error) {
      return callback(error);
    }
  }

  set(sid, session, callback) {
    try {
      this.statements.set.run(sid, this.#expiry(session), JSON.stringify(session));
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  touch(sid, session, callback) {
    try {
      this.statements.touch.run(this.#expiry(session), sid);
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  destroy(sid, callback) {
    try {
      this.statements.destroy.run(sid);
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  /** Removes expired sessions. Safe to call at any time. */
  cleanup() {
    try {
      this.statements.expired.run(Date.now());
    } catch (error) {
      // A failed cleanup must never crash the server.
      console.warn('[session-store] cleanup failed:', error.message);
    }
  }

  length(callback) {
    try {
      callback(null, this.statements.count.get(Date.now()).total);
    } catch (error) {
      callback(error);
    }
  }

  clear(callback) {
    try {
      this.statements.clear.run();
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  all(callback) {
    try {
      const rows = this.statements.all.all(Date.now());
      callback(null, rows.map((row) => JSON.parse(row.data)));
    } catch (error) {
      callback(error);
    }
  }

  stopCleanup() {
    clearInterval(this.cleanupTimer);
  }
}

module.exports = { SqliteStore };
