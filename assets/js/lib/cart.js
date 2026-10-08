/**
 * Cart state, persisted for the browsing session in sessionStorage.
 * The store knows nothing about the DOM: components subscribe and re-render.
 */

import { PRODUCTS } from "../data/menu.js";

const KEY = "caffeine-cove.cart.v1";

const listeners = new Set();

function read() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — the cart still works for this page view */
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

/** Stable identity for a product + its chosen options. */
export function lineKey(productId, selection = {}) {
  const parts = Object.keys(selection)
    .sort()
    .map((groupId) => {
      const value = selection[groupId];
      const normalised = Array.isArray(value) ? [...value].sort().join("+") : String(value ?? "");
      return `${groupId}=${normalised}`;
    });
  return [productId, ...parts].join("|");
}

export function findProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId) ?? null;
}

/** Order totals. Tax is shown separately so the summary reads like a receipt. */
export const TAX_RATE = 0.08;

export function totals(list = items) {
  const subtotal = list.reduce((total, item) => total + item.unitPrice * item.qty, 0);
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
}

let items = read();

export const cart = {
  items() {
    return items;
  },

  count() {
    return items.reduce((total, item) => total + item.qty, 0);
  },

  subtotal() {
    return items.reduce((total, item) => total + item.unitPrice * item.qty, 0);
  },

  /** Adds a line, merging into an identical existing line when possible. */
  add({ productId, qty = 1, selection = {}, unitPrice = 0 }) {
    const key = lineKey(productId, selection);
    const existing = items.find((item) => item.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      items = [...items, { key, productId, qty, selection, unitPrice }];
    }
    write(items);
    emit();
  },

  setQty(key, qty) {
    if (qty <= 0) return this.remove(key);
    items = items.map((item) => (item.key === key ? { ...item, qty } : item));
    write(items);
    emit();
  },

  remove(key) {
    items = items.filter((item) => item.key !== key);
    write(items);
    emit();
  },

  clear() {
    items = [];
    write(items);
    emit();
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
