'use strict';

/**
 * Admin accounts: hashing, verification and lockout bookkeeping.
 *
 * Passwords are hashed with scrypt, which is built into Node - no extra
 * dependency, and it is memory-hard, so brute forcing stolen hashes is slow.
 * The stored format is self-describing:
 *
 *     scrypt$N$r$p$<salt base64url>$<derived key base64url>
 *
 * so the parameters can be raised later without invalidating old hashes.
 */

const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { db } = require('../db');
const config = require('../config');

const scrypt = promisify(crypto.scrypt);

const SCRYPT = { N: 16384, r: 8, p: 1, keyLength: 64, saltBytes: 16 };

/** Minimum password length enforced everywhere (login bootstrap, panel, CLI). */
const MIN_PASSWORD_LENGTH = 10;

async function hashPassword(password) {
  const salt = crypto.randomBytes(SCRYPT.saltBytes);
  const derived = await scrypt(password, salt, SCRYPT.keyLength, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: 64 * 1024 * 1024,
  });
  return [
    'scrypt',
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString('base64url'),
    derived.toString('base64url'),
  ].join('$');
}

/**
 * Verifies a password against a stored hash.
 * Always does the same amount of work, so the response time cannot be used to
 * tell "no such account" from "wrong password".
 */
async function verifyPassword(password, storedHash) {
  const fallback = 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAA';
  const hash = storedHash || fallback;

  const parts = String(hash).split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    // Unknown format: burn the same time, then fail.
    await scrypt(password, 'invalid-format', SCRYPT.keyLength, {
      N: SCRYPT.N,
      r: SCRYPT.r,
      p: SCRYPT.p,
      maxmem: 64 * 1024 * 1024,
    });
    return false;
  }

  const [, n, r, p, saltB64, keyB64] = parts;
  const salt = Buffer.from(saltB64, 'base64url');
  const expected = Buffer.from(keyB64, 'base64url');

  const derived = await scrypt(password, salt, expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  });

  if (derived.length !== expected.length) return false;
  const matches = crypto.timingSafeEqual(derived, expected);

  // Keep "no user" and "wrong password" indistinguishable.
  if (!storedHash) return false;
  return matches;
}

/* -------------------------------------------------------------------------- */
/* Queries (all parameterised)                                                */
/* -------------------------------------------------------------------------- */

const statements = {
  byEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  byId: db.prepare('SELECT * FROM users WHERE id = ?'),
  count: db.prepare('SELECT COUNT(*) AS total FROM users'),
  insert: db.prepare(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
  ),
  updatePassword: db.prepare('UPDATE users SET password_hash = ? WHERE id = ?'),
  updateEmail: db.prepare('UPDATE users SET email = ? WHERE id = ?'),
  failures: db.prepare('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?'),
  lastLogin: db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?"),
  deleteExpiredLock: db.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?'),
};

const findByEmail = (email) => statements.byEmail.get(String(email || '').toLowerCase()) || null;
const findById = (id) => statements.byId.get(Number(id)) || null;
const countAdmins = () => statements.count.get().total;

async function createAdmin(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) throw new Error('An email address is required.');
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`The password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  const hash = await hashPassword(password);
  const result = statements.insert.run(normalizedEmail, hash, 'admin');
  return findById(result.lastInsertRowid);
}

/** Creates the account if it is missing, otherwise updates its password. */
async function upsertAdmin(email, password) {
  const existing = findByEmail(email);
  if (!existing) return createAdmin(email, password);
  const hash = await hashPassword(password);
  statements.updatePassword.run(hash, existing.id);
  return findById(existing.id);
}

async function changePassword(userId, newPassword) {
  const hash = await hashPassword(newPassword);
  statements.updatePassword.run(hash, Number(userId));
}

function isLocked(user) {
  if (!user?.locked_until) return false;
  return new Date(user.locked_until).getTime() > Date.now();
}

/** Records a failed sign-in and locks the account after too many attempts. */
function registerFailure(user) {
  if (!user) return;
  const attempts = Number(user.failed_attempts || 0) + 1;
  let lockedUntil = null;
  if (attempts >= config.auth.maxFailures) {
    lockedUntil = new Date(Date.now() + config.auth.lockoutMinutes * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
  }
  statements.failures.run(attempts, lockedUntil, user.id);
}

function registerSuccess(user) {
  statements.failures.run(0, null, user.id);
  statements.lastLogin.run(user.id);
}

/** Removes a lockout that has already expired, so the counter starts clean. */
function clearExpiredLock(user) {
  if (user?.locked_until && !isLocked(user)) statements.deleteExpiredLock.run(user.id);
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  hashPassword,
  verifyPassword,
  findByEmail,
  findById,
  countAdmins,
  createAdmin,
  upsertAdmin,
  changePassword,
  isLocked,
  registerFailure,
  registerSuccess,
  clearExpiredLock,
};
