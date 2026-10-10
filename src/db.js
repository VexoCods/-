'use strict';

/**
 * Database layer (SQLite via better-sqlite3).
 *
 * Why SQLite: the whole menu is a few hundred rows, so a single file database
 * removes an entire network service from the deployment. Statements are cached
 * and always parameterised (`?` placeholders) - user input is never concatenated
 * into SQL, which is what makes injections impossible here.
 */

const fs = require('node:fs');
const Database = require('better-sqlite3');
const config = require('./config');

fs.mkdirSync(config.dataDir, { recursive: true });
fs.mkdirSync(config.uploadDir, { recursive: true });

const db = new Database(config.dbFile);

// WAL keeps reads fast while a write happens; busy_timeout avoids "database is
// locked" errors if two requests write at the same moment.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

/**
 * Schema. `IF NOT EXISTS` makes this run safely on every boot, so a fresh
 * deployment (or a new volume) sets itself up without a migration tool.
 * CHECK constraints are the last line of defence for data integrity.
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name_fa     TEXT    NOT NULL,
    name_en     TEXT    NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS items (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id       INTEGER NOT NULL REFERENCES categories(id),
    name_fa           TEXT    NOT NULL,
    name_en           TEXT    NOT NULL DEFAULT '',
    description_fa    TEXT    NOT NULL DEFAULT '',
    description_en    TEXT    NOT NULL DEFAULT '',
    price             INTEGER NOT NULL CHECK (price > 0 AND price <= 1000000000),
    discount_percent  INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    rating            REAL    CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
    image_path        TEXT,
    alt_fa            TEXT    NOT NULL DEFAULT '',
    alt_en            TEXT    NOT NULL DEFAULT '',
    is_active         INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    sort_order        INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_items_category ON items (category_id, sort_order);
  CREATE INDEX IF NOT EXISTS idx_items_active   ON items (is_active, sort_order);

  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash   TEXT    NOT NULL,
    role            TEXT    NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until    TEXT,
    last_login_at   TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Server-side session storage (see src/utils/session-store.js).
  CREATE TABLE IF NOT EXISTS sessions (
    sid        TEXT    PRIMARY KEY,
    expires    INTEGER NOT NULL,
    data       TEXT    NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires);
`);

/**
 * Run a function inside a transaction. Used for multi-step writes
 * (e.g. reordering a list) so a failure cannot leave half-updated data.
 */
function transaction(fn) {
  return db.transaction(fn);
}

function close() {
  try {
    db.close();
  } catch {
    /* already closed */
  }
}

module.exports = { db, transaction, close, dbFile: config.dbFile, uploadDir: config.uploadDir };
