/** Currency and text formatting helpers. */

const CURRENCY = "$";

export function money(value) {
  const amount = Number(value) || 0;
  return `${CURRENCY}${amount.toFixed(2)}`;
}

/** "3 items" / "1 item" */
export function pluralise(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
