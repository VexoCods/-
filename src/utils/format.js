'use strict';

/**
 * Display helpers.
 *
 * Prices are stored as plain integers (Toman, no decimals) and formatted with
 * thousands separators for readability: 15000 -> "15,000".
 * Latin digits are used in both languages because a menu is often read off a
 * phone screen by a cashier, and they are unambiguous everywhere.
 */

const priceFormatter = new Intl.NumberFormat('en-US');

/** Format an integer amount with thousands separators. */
function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return priceFormatter.format(Math.round(number));
}

/** Final price after a discount percentage (rounded to the nearest Toman). */
function discountedPrice(price, discountPercent) {
  const discount = Number(discountPercent) || 0;
  if (discount <= 0) return Number(price);
  return Math.round((Number(price) * (100 - discount)) / 100);
}

/** "4.5" -> "4.5"; 4 -> "4.0" - one decimal place, or '' when unrated. */
function formatRating(rating) {
  if (rating === null || rating === undefined || rating === '') return '';
  const number = Number(rating);
  if (!Number.isFinite(number)) return '';
  return number.toFixed(1);
}

/** ISO timestamp -> "2026-10-10 21:17" (used in the admin list). */
function formatDateTime(value) {
  if (!value) return '';
  return String(value).replace('T', ' ').slice(0, 16);
}

/** Human readable file size, e.g. "1.2 MB". */
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = Number(bytes) || 0;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? size : size.toFixed(1)} ${units[unit]}`;
}

module.exports = { formatPrice, discountedPrice, formatRating, formatDateTime, formatBytes };
