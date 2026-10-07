/**
 * Horizon Properties — brand, navigation and contact details.
 * One place to change the phone number, address or navigation order.
 */

export const SITE = {
  name: "Horizon Properties",
  shortName: "Horizon",
  blurb:
    "A specialist agency for architectural houses and considered investments. We represent a small number of properties at a time, across 38 cities.",
  phone: "(555) 246-7890",
  phoneHref: "tel:+15552467890",
  email: "hello@horizonproperties.com",
  address: ["1200 Congress Avenue, Suite 2800", "Austin, Texas 78701", "United States"],
  hours: "Monday – Friday, 9am – 6pm CT",
  founded: 2004,
  social: [
    { name: "Instagram", href: "https://www.instagram.com/", icon: "instagram" },
    { name: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
    { name: "Facebook", href: "https://www.facebook.com/", icon: "facebook" },
    { name: "YouTube", href: "https://www.youtube.com/", icon: "youtube" },
  ],
  nav: [
    { label: "Home", href: "index.html" },
    { label: "Properties", href: "properties.html" },
    { label: "About Us", href: "about.html" },
    { label: "Services", href: "services.html" },
    { label: "Team", href: "team.html" },
    { label: "Contact", href: "contact.html" },
  ],
};

/** Current page filename, e.g. "properties.html" (falls back to index for "/"). */
export function currentPage() {
  const file = window.location.pathname.split("/").pop();
  return file && file.length > 0 ? file : "index.html";
}
