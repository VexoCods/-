/** Number, price and text formatting used across the site. */

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat("en-US");

/** $2,350,000 */
export function usd(value) {
  return currency.format(value);
}

/** $2.35 Million — the headline figure used on cards and listings. */
export function priceShort(value) {
  const millions = value / 1_000_000;
  if (millions >= 1) {
    const trimmed = millions.toFixed(2).replace(/\.?0+$/, "");
    return `$${trimmed} Million`;
  }
  return `$${Math.round(value / 1000)}K`;
}

/** 6,420 */
export function count(value) {
  return integer.format(value);
}

export function plural(value, singular, pluralForm) {
  return value === 1 ? singular : (pluralForm ?? `${singular}s`);
}

/** 1 bedroom / 5 bedrooms */
export function beds(value) {
  return `${value} ${plural(value, "bed", "beds")}`;
}

export function baths(value) {
  return `${value} ${plural(value, "bath", "baths")}`;
}

/** Trim long text to a whole-word limit. */
export function truncate(text, limit = 120) {
  if (text.length <= limit) return text;
  return `${text.slice(0, text.lastIndexOf(" ", limit))}…`;
}
