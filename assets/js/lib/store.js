/**
 * Browser-local state: saved properties, enquiry records and newsletter
 * subscribers. Everything degrades silently when storage is unavailable.
 */

const SAVED_KEY = "horizon.saved.v1";
const ENQUIRY_KEY = "horizon.enquiries.v1";
const SUBSCRIBER_KEY = "horizon.subscribers.v1";

const listeners = new Set();

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or storage disabled — state simply does not persist */
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

/** Saved (shortlisted) properties, newest first. */
export const saved = {
  ids() {
    const value = read(SAVED_KEY, []);
    return Array.isArray(value) ? value : [];
  },
  has(id) {
    return this.ids().includes(id);
  },
  count() {
    return this.ids().length;
  },
  /** Returns true when the property is saved after toggling. */
  toggle(id) {
    const ids = this.ids();
    const next = ids.includes(id) ? ids.filter((entry) => entry !== id) : [id, ...ids];
    write(SAVED_KEY, next);
    emit();
    return next.includes(id);
  },
  clear() {
    write(SAVED_KEY, []);
    emit();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** Enquiries and viewing requests captured by the on-site forms. */
export const enquiries = {
  list() {
    const value = read(ENQUIRY_KEY, []);
    return Array.isArray(value) ? value : [];
  },
  add(entry) {
    const record = { id: `enq_${Date.now()}`, createdAt: new Date().toISOString(), ...entry };
    write(ENQUIRY_KEY, [record, ...this.list()].slice(0, 100));
    return record;
  },
};

export const subscribers = {
  add(email) {
    const list = read(SUBSCRIBER_KEY, []);
    const next = Array.isArray(list) ? list : [];
    if (!next.includes(email)) next.push(email);
    write(SUBSCRIBER_KEY, next);
    return next.includes(email);
  },
};
