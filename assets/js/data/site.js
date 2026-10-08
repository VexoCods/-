/**
 * Caffeine Cove — brand, navigation and contact details.
 * One place to change the address, opening hours or navigation order.
 */

export const SITE = {
  name: "Caffeine Cove",
  shortName: "Cove",
  tagline: "Crafted moments in every cup",
  blurb:
    "A neighbourhood coffee house built around slow mornings, honest ingredients and coffee worth sitting with.",
  address: ["24 Harbour Lane, Marina Quarter", "2100 Copenhagen", "Denmark"],
  phone: "(555) 014-2280",
  phoneHref: "tel:+15550142280",
  email: "hello@caffeinecove.com",
  hours: [
    { days: "Monday – Friday", time: "7:00 – 19:00" },
    { days: "Saturday", time: "8:00 – 20:00" },
    { days: "Sunday", time: "8:00 – 18:00" },
  ],
  hoursShort: "Open daily from 7am",
  mapQuery: "24 Harbour Lane, Marina Quarter",
  social: [
    { name: "Instagram", href: "https://www.instagram.com/", icon: "instagram" },
    { name: "Facebook", href: "https://www.facebook.com/", icon: "facebook" },
    { name: "TikTok", href: "https://www.tiktok.com/", icon: "tiktok" },
  ],
  nav: [
    { label: "Home", href: "index.html" },
    { label: "Menu", href: "menu.html" },
    { label: "About", href: "about.html" },
    { label: "Gallery", href: "gallery.html" },
    { label: "Contact", href: "contact.html" },
  ],
};

/** Current page filename, e.g. "menu.html" (falls back to index for "/"). */
export function currentPage() {
  const file = window.location.pathname.split("/").pop();
  return file && file.length > 0 ? file : "index.html";
}
