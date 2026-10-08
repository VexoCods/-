/** Gallery page: renders the asymmetric editorial grid. */

const ITEMS = [
  {
    src: "assets/images/gallery/g1.jpg",
    alt: "Friends sharing coffee around a corner table",
    caption: "Slow mornings",
    span: "gallery-item--big",
  },
  {
    src: "assets/images/gallery/g6.jpg",
    alt: "Warmly lit cafe interior at golden hour",
    caption: "The reading nook",
    span: "gallery-item--tall",
  },
  {
    src: "assets/images/gallery/g5.jpg",
    alt: "Barista preparing an espresso shot",
    caption: "Dialling in",
  },
  {
    src: "assets/images/gallery/g3.jpg",
    alt: "Freshly roasted coffee beans in a hessian sack",
    caption: "House blend",
  },
  {
    src: "assets/images/gallery/g4.jpg",
    alt: "Hands cradling a steaming cup of coffee",
    caption: "First sip",
  },
  {
    src: "assets/images/gallery/g7.jpg",
    alt: "The service counter mid-morning",
    caption: "Behind the bar",
    span: "gallery-item--wide",
  },
  {
    src: "assets/images/gallery/g2.jpg",
    alt: "Guests settling in for the afternoon",
    caption: "Good company",
    span: "gallery-item--wide",
  },
  {
    src: "assets/images/gallery/g12.jpg",
    alt: "Outdoor terrace seating under the awnings",
    caption: "The terrace",
    span: "gallery-item--tall",
  },
  {
    src: "assets/images/gallery/g8.jpg",
    alt: "Window table with a plant and morning light",
    caption: "The window table",
  },
  {
    src: "assets/images/gallery/g11.jpg",
    alt: "The Caffeine Cove sign on Harbour Lane",
    caption: "Harbour Lane",
  },
  {
    src: "assets/images/gallery/g9.jpg",
    alt: "Brew bar tools laid out on a counter",
    caption: "Brew bar",
  },
  {
    src: "assets/images/gallery/g10.jpg",
    alt: "The counter from the far end of the room",
    caption: "Room to linger",
  },
];

export function initGallery() {
  const grid = document.querySelector("[data-gallery]");
  if (!grid) return;

  grid.innerHTML = ITEMS.map(
    (item) => `<figure class="gallery-item ${item.span ?? ""}">
      <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" width="1100" height="800">
      <figcaption>${item.caption}</figcaption>
    </figure>`,
  ).join("");
}
