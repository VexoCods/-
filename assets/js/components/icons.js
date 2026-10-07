/**
 * Inline SVG icons — thin-line, 24px grid, currentColor.
 * Kept as strings so components can compose them directly into templates.
 */

const PATHS = {
  heart: '<path d="M12 20.2C9.9 18.6 4.5 14.9 4.5 10.6A4.1 4.1 0 0 1 12 8.1a4.1 4.1 0 0 1 7.5 2.5c0 4.3-5.4 8-7.5 9.6Z"/>',
  phone:
    '<path d="M6.6 3.8h2.7l1.4 3.4-1.7 1.3a11.4 11.4 0 0 0 5.4 5.4l1.3-1.7 3.4 1.4v2.7a1.9 1.9 0 0 1-2.1 1.9A16.6 16.6 0 0 1 4.7 5.9 1.9 1.9 0 0 1 6.6 3.8Z"/>',
  mail: '<rect x="3.2" y="5.5" width="17.6" height="13" rx="2"/><path d="m3.6 7.2 8.4 5.6 8.4-5.6"/>',
  mapPin: '<path d="M12 21s6.5-5.4 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.6 12 21 12 21Z"/><circle cx="12" cy="10.6" r="2.4"/>',
  bed: '<path d="M3.5 18.5v-11"/><path d="M3.5 13.2h17v5.3"/><path d="M3.5 10.6h5.8a2 2 0 0 1 2 2v.6"/><path d="M11.3 13.2h9.2a2 2 0 0 1 2 2v3.3"/><circle cx="7.4" cy="9.1" r="1.6"/>',
  bath: '<path d="M3.5 12.5h17v2.6a3.4 3.4 0 0 1-3.4 3.4H6.9a3.4 3.4 0 0 1-3.4-3.4Z"/><path d="M6.4 12.5V6.9a2.4 2.4 0 0 1 4.3-1.4"/><path d="M7.6 18.5 6.6 21M16.4 18.5l1 2.5"/>',
  area: '<rect x="4.2" y="4.2" width="15.6" height="15.6" rx="1.4"/><path d="M8.4 4.2v2.2M15.6 4.2v2.2M4.2 8.4h2.2M4.2 15.6h2.2M17.8 8.4h2M17.8 15.6h2"/>',
  arrowRight: '<path d="M4.5 12h14"/><path d="m13 6.5 5.5 5.5-5.5 5.5"/>',
  arrowLeft: '<path d="M19.5 12h-14"/><path d="M11 6.5 5.5 12 11 17.5"/>',
  arrowUpRight: '<path d="M7 17 17 7"/><path d="M8.6 7H17v8.4"/>',
  arrowDown: '<path d="M12 4.5v14"/><path d="m6.5 13 5.5 5.5L17.5 13"/>',
  chevronLeft: '<path d="m14 6-6 6 6 6"/>',
  chevronRight: '<path d="m10 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 10 6 6 6-6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12.8 4.6 4.6L19 7"/>',
  search: '<circle cx="11" cy="11" r="6.2"/><path d="m15.6 15.6 4.4 4.4"/>',
  sliders: '<path d="M4.5 8h11M18.5 8h1M4.5 16h5M12.5 16h7"/><circle cx="16.6" cy="8" r="1.9"/><circle cx="10.6" cy="16" r="1.9"/>',
  calendar: '<rect x="3.8" y="5.4" width="16.4" height="14.8" rx="2"/><path d="M3.8 10h16.4M8.4 3.6v3.4M15.6 3.6v3.4"/>',
  clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.6V12l3 1.9"/>',
  expand: '<path d="M9 4.5H4.5V9M15 4.5h4.5V9M15 19.5h4.5V15M9 19.5H4.5V15"/>',
  key: '<circle cx="7.8" cy="16.2" r="4.2"/><path d="m10.9 13.2 8.6-8.6"/><path d="m16.6 7.5 2.1 2.1"/><path d="m14.2 9.9 2.1 2.1"/><path d="M3.4 21.2h17.2"/>',
  home: '<path d="M4.2 10.6 12 4.2l7.8 6.4v8.2a1.4 1.4 0 0 1-1.4 1.4H5.6a1.4 1.4 0 0 1-1.4-1.4Z"/><path d="M9.6 20.2v-5.4h4.8v5.4"/>',
  building: '<rect x="4.6" y="3.8" width="14.8" height="16.4" rx="1.4"/><path d="M8.6 7.6h2.4M13 7.6h2.4M8.6 11.4h2.4M13 11.4h2.4M10 20.2v-4.4h4v4.4"/>',
  compass: '<circle cx="12" cy="12" r="8.2"/><path d="m14.9 9.1-1.7 4.1-4.1 1.7 1.7-4.1Z"/>',
  shield: '<path d="M12 3.6 5.4 6.2v5.4c0 4 2.8 7.4 6.6 8.8 3.8-1.4 6.6-4.8 6.6-8.8V6.2Z"/><path d="m9.4 12 1.9 1.9 3.5-3.6"/>',
  sparkle: '<path d="M12 3.8 13.7 9l5.2 1.7-5.2 1.7L12 17.6l-1.7-5.2L5.1 10.7 10.3 9Z"/><path d="M18.4 16.4l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z"/>',
  users: '<circle cx="9.6" cy="8.6" r="3.4"/><path d="M3.6 19.4a6.4 6.4 0 0 1 12 0"/><path d="M16.4 6.2a3.2 3.2 0 0 1 0 6.2M18.2 19.4a6.6 6.6 0 0 0-2-4.6"/>',
  quote: '<path d="M9.6 6.4c-3 1.2-4.6 3.4-4.6 6.4v4.8h5.6v-5.6H7.9c0-1.7.8-2.9 2.6-3.7Z"/><path d="M19.4 6.4c-3 1.2-4.6 3.4-4.6 6.4v4.8H20.4v-5.6h-2.7c0-1.7.8-2.9 2.6-3.7Z"/>',
  instagram:
    '<rect x="4" y="4" width="16" height="16" rx="4.4"/><circle cx="12" cy="12" r="3.5"/><circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" stroke="none"/>',
  linkedin: '<rect x="4" y="4" width="16" height="16" rx="2.2"/><path d="M8.2 10.4v6M8.2 7.6v.1M11.6 16.4v-3.2a2.1 2.1 0 0 1 4.2 0v3.2"/><path d="M11.6 10.4v6"/>',
  facebook: '<path d="M14.6 8.4h2.2M14.6 20.2V8.6a2.4 2.4 0 0 1 2.4-2.4h.8"/><path d="M11 12h5.6"/>',
  youtube: '<rect x="3.4" y="6.4" width="17.2" height="11.2" rx="3.4"/><path d="m10.8 9.9 4.4 2.6-4.4 2.6Z"/>',
};

/**
 * @param {keyof typeof PATHS} name
 * @param {{className?: string, strokeWidth?: number}} [options]
 */
export function icon(name, { className = "", strokeWidth = 1.5 } = {}) {
  const body = PATHS[name] ?? PATHS.arrowRight;
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

/** The Horizon mark: a roofline above a horizon rule. */
export function brandMark(className = "brand__mark") {
  return `<svg class="${className}" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.6 20.4 18 7l13.4 13.4"/><path d="M9.8 20.4v9.2h16.4v-9.2"/><path d="M2 32.6h32" opacity=".45"/></svg>`;
}
