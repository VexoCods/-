'use strict';

/**
 * Input validation.
 *
 * Server-side validation is the one that counts: the browser's `required`
 * attributes are a convenience for the owner, but every value is re-checked
 * here before it reaches the database. Errors are collected per field so the
 * form can show a message under the exact input that is wrong.
 *
 * Nothing in this file builds HTML - escaping happens once, at render time,
 * in the EJS templates (see docs/SECURITY.md, "XSS").
 */

const { ValidationError } = require('./errors');

const MESSAGES = {
  fa: {
    required: (label) => `«${label}» الزامی است.`,
    tooLong: (label, max) => `«${label}» نباید بیشتر از ${max} کاراکتر باشد.`,
    tooShort: (label, min) => `«${label}» باید حداقل ${min} کاراکتر باشد.`,
    notNumber: (label) => `«${label}» باید عدد باشد.`,
    notInteger: (label) => `«${label}» باید عدد صحیح باشد.`,
    outOfRange: (label, min, max) => `«${label}» باید بین ${min} و ${max} باشد.`,
    invalidEmail: (label) => `«${label}» ایمیل معتبری نیست.`,
    invalidChoice: (label) => `«${label}» مقدار مجاز نیست.`,
    noCategories: () => 'ابتدا یک دسته‌بندی بسازید.',
  },
  en: {
    required: (label) => `"${label}" is required.`,
    tooLong: (label, max) => `"${label}" must be at most ${max} characters.`,
    tooShort: (label, min) => `"${label}" must be at least ${min} characters.`,
    notNumber: (label) => `"${label}" must be a number.`,
    notInteger: (label) => `"${label}" must be a whole number.`,
    outOfRange: (label, min, max) => `"${label}" must be between ${min} and ${max}.`,
    invalidEmail: (label) => `"${label}" is not a valid email address.`,
    invalidChoice: (label) => `"${label}" is not an allowed value.`,
    noCategories: () => 'Create a category first.',
  },
};

/**
 * Removes characters that have no place in stored text:
 * control characters (including NUL), zero-width joiners used to hide payloads,
 * and normalises all whitespace to single spaces so stored data stays tidy.
 */
function normalizeText(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

class Validator {
  /** @param {string} lang `fa` or `en` (controls error message language) */
  constructor(lang = 'fa') {
    this.lang = MESSAGES[lang] ? lang : 'fa';
    this.messages = MESSAGES[this.lang];
    /** @type {Record<string, string>} */
    this.errors = {};
  }

  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  /** Records the first error for a field (later checks do not overwrite it). */
  addError(field, message) {
    if (!this.errors[field]) this.errors[field] = message;
  }

  /** Throws a ValidationError carrying every collected field error. */
  throwIfInvalid() {
    if (this.hasErrors()) throw new ValidationError(this.errors);
  }

  /** @returns {boolean} true when the value is present, and records an error when not */
  #required(value, field, label) {
    if (value === undefined || value === null || String(value).trim() === '') {
      this.addError(field, this.messages.required(label));
      return false;
    }
    return true;
  }

  /**
   * Required text field.
   * @returns {string} normalized text ('' when invalid)
   */
  text(value, { field, label, min = 1, max = 200 }) {
    const clean = normalizeText(value);
    if (!this.#required(clean, field, label)) return '';
    if (clean.length < min) {
      this.addError(field, this.messages.tooShort(label, min));
      return '';
    }
    if (clean.length > max) {
      this.addError(field, this.messages.tooLong(label, max));
      return '';
    }
    return clean;
  }

  /** Optional text field; empty input becomes ''. */
  optionalText(value, { field, label, max = 500 }) {
    const clean = normalizeText(value);
    if (clean === '') return '';
    if (clean.length > max) {
      this.addError(field, this.messages.tooLong(label, max));
      return '';
    }
    return clean;
  }

  /**
   * Whole number within [min, max].
   * @returns {number} the parsed value, or NaN when invalid
   */
  integer(value, { field, label, min, max, required = true }) {
    const raw = String(value ?? '').trim();
    if (raw === '') {
      if (required) this.addError(field, this.messages.required(label));
      return NaN;
    }
    // Digits only: rejects "1e5", "0x10", "12abc", "+-3" and whitespace tricks.
    if (!/^-?\d+$/.test(raw)) {
      this.addError(field, this.messages.notInteger(label));
      return NaN;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isSafeInteger(parsed)) {
      this.addError(field, this.messages.notInteger(label));
      return NaN;
    }
    if ((min !== undefined && parsed < min) || (max !== undefined && parsed > max)) {
      this.addError(field, this.messages.outOfRange(label, min ?? 0, max ?? 0));
      return NaN;
    }
    return parsed;
  }

  /**
   * Optional decimal within [min, max]; empty input becomes null.
   * @returns {number|null}
   */
  decimal(value, { field, label, min, max }) {
    const raw = String(value ?? '').trim();
    if (raw === '') return null;
    if (!/^-?\d+(\.\d{1,2})?$/.test(raw)) {
      this.addError(field, this.messages.notNumber(label));
      return null;
    }
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed)) {
      this.addError(field, this.messages.notNumber(label));
      return null;
    }
    if ((min !== undefined && parsed < min) || (max !== undefined && parsed > max)) {
      this.addError(field, this.messages.outOfRange(label, min ?? 0, max ?? 0));
      return null;
    }
    return parsed;
  }

  /** Email address (deliberately simple, no regex backtracking pitfalls). */
  email(value, { field, label, max = 254 }) {
    const clean = normalizeText(value).toLowerCase();
    if (!this.#required(clean, field, label)) return '';
    if (clean.length > max || !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(clean)) {
      this.addError(field, this.messages.invalidEmail(label));
      return '';
    }
    return clean;
  }

  /** Value must be one of `allowed`. */
  choice(value, allowed, { field, label }) {
    if (!allowed.includes(value)) {
      this.addError(field, this.messages.invalidChoice(label));
      return null;
    }
    return value;
  }

  /** Checkbox/switch -> 1 or 0. Any of "on", "1", "true", "yes" means on. */
  flag(value) {
    return toFlag(value);
  }
}

/** Rejects HTML form values that arrive as arrays (never trusted). */
function singleValue(value) {
  return Array.isArray(value) ? value[value.length - 1] : value;
}

/** Checkbox/switch -> 1 or 0. Any of "on", "1", "true", "yes" means on. */
function toFlag(value) {
  if (Array.isArray(value)) value = value[value.length - 1];
  return ['on', '1', 'true', 'yes'].includes(String(value ?? '').toLowerCase()) ? 1 : 0;
}

module.exports = { Validator, normalizeText, singleValue, toFlag };
