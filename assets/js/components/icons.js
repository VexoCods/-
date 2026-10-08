/**
 * Inline SVG icon set. Line icons are drawn on a 24×24 grid and inherit
 * `currentColor`, so they take the colour of the text they sit beside.
 */

const LINE = {
  cart: '<circle cx="9.5" cy="20" r="1.5"/><circle cx="17.5" cy="20" r="1.5"/><path d="M3 4h2.1l2.2 11.3a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L20.4 8H6.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  "arrow-right": '<path d="M4 12h15M13 6l6 6-6 6"/>',
  "arrow-up-right": '<path d="M7 17L17 7M8 7h9v9"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  phone: '<path d="M6.5 3h3l1.5 4-2 1.4a12 12 0 0 0 5.6 5.6L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 6.2 2 2 0 0 1 6 4z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>',
  directions: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M11 14v-3.2h3.2M14.2 10.8L16 12.6"/>',
  cup: '<path d="M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M16 10h1.8a2.2 2.2 0 0 1 0 4.4H16"/><path d="M7 3.2c0 1-.8 1.2-.8 2.2M10.2 3c0 1-.8 1.2-.8 2.2"/>',
  bean: '<ellipse cx="12" cy="12" rx="6.5" ry="8.5" transform="rotate(38 12 12)"/><path d="M8.6 8.4c2.4 1.6 4 4.6 5.2 8.4"/>',
  leaf: '<path d="M4 20c0-8 5-14 16-15 0 11-5 16-13 16z"/><path d="M5 19C9 14 13 11 19 7"/>',
  chef: '<path d="M7 13a4 4 0 1 1 1.2-7.8 4.2 4.2 0 0 1 7.6 0A4 4 0 1 1 17 13z"/><path d="M7 13v5.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5V13"/>',
  sofa: '<path d="M4 12V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M4 12a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z"/><path d="M7 19v1.5M17 19v1.5"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.6l5.9-.8z"/>',
  "shield-check": '<path d="M12 3l7 2.8v5.4c0 4.4-3 8-7 9.8-4-1.8-7-5.4-7-9.8V5.8z"/><path d="M9 12l2.2 2.2L15.4 10"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.4"/>',
  bag: '<path d="M5.5 8h13l1 12h-15z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
};

const SOLID = {
  instagram:
    '<path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3zm6.9-11.1a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z"/>',
  facebook:
    '<path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6A22 22 0 0 0 14.3 3.5c-2.5 0-4.2 1.5-4.2 4.3v2.1H7.4V13h2.7v8z"/>',
  tiktok:
    '<path d="M16.5 3h-2.9v11.3a2.4 2.4 0 1 1-2-2.4v-3a5.4 5.4 0 1 0 4.9 5.4V8.9a6.4 6.4 0 0 0 3.5 1.1V7.1a3.6 3.6 0 0 1-3.5-3.5z"/>',
};

function wrap(paths, fill) {
  return `<svg viewBox="0 0 24 24" fill="${fill ? "currentColor" : "none"}" ${
    fill ? "" : 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'
  } aria-hidden="true">${paths}</svg>`;
}

/** Line icon markup, sized by CSS. */
export function icon(name) {
  return wrap(LINE[name] ?? LINE.info, false);
}

/** Filled brand/social icon markup. */
export function socialIcon(name) {
  return wrap(SOLID[name] ?? SOLID.instagram, true);
}

/** Caffeine Cove monogram: a cup drawn in a single continuous line. */
export function brandMark() {
  return `<svg class="brand__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="19" stroke="currentColor" stroke-width="1.1" opacity="0.55"/>
    <path d="M11 16h14v7.5A4.5 4.5 0 0 1 20.5 28h-5A4.5 4.5 0 0 1 11 23.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M25 17.5h2.4a3.1 3.1 0 0 1 0 6.2H25" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M15.6 12.4c0-1.2 1-1.4 1-2.6M19.6 12.4c0-1.2 1-1.4 1-2.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`;
}
