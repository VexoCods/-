/**
 * Horizon Properties — portfolio content.
 *
 * This module is the single source of truth for listing data. Every field is
 * plain JSON-compatible data, so the array can be served from an API or a
 * database later without touching any component: swap this import for a
 * `fetch()` that resolves to the same shape.
 *
 * Property shape
 * --------------
 * id, name, tagline, description[], city, location, type, status,
 * price (number, USD), bedrooms, bathrooms, area (sq ft), lot, year,
 * featured (bool), badge, agentId, gallery[] (image keys)
 */

/** Interior photography, keyed by the name used in `gallery`. */
export const IMAGE_LIBRARY = {
  "living-openplan": "Open-plan living room opening onto the kitchen",
  "living-minimal": "Minimal lounge with a curated gallery wall",
  "living-bright": "Bright living room with floor-to-ceiling windows",
  "living-formal": "Formal living room with joinery and fireplace",
  "living-neutral": "Neutral lounge with reading chairs",
  "living-terrace": "Lounge with leather seating and garden views",
  "living-woodpanel": "Living space with timber panelling and sliding glass",
  "living-media": "Media lounge with dark bespoke joinery",
  "dining-kitchen": "Dining area adjoining a bespoke kitchen",
  "bedroom-white": "Principal bedroom with garden outlook",
  "bedroom-gallery": "Guest bedroom with curated wall art",
  "bedroom-tufted": "Principal suite with upholstered headboard",
  "bath-gold-mirrors": "Marble bathroom with twin vanities",
  "bath-tub-stone": "Freestanding bath against honed stone",
  "bath-marble": "Marble-walled bathroom with timber vanity",
  "terrace-pool": "Covered terrace overlooking the pool",
};

/** Resolve a gallery key into image records used by the cards, gallery and lightbox. */
export function resolveGallery(property) {
  return property.gallery.map((key) => {
    const isCover = key === "cover";
    const slug = property.id;
    return {
      key,
      large: isCover
        ? `assets/images/covers/${slug}-lg.jpg`
        : `assets/images/interiors/${key}-lg.jpg`,
      small: isCover
        ? `assets/images/covers/${slug}-sm.jpg`
        : `assets/images/interiors/${key}-sm.jpg`,
      alt: isCover
        ? `${property.name} — ${property.location}`
        : `${IMAGE_LIBRARY[key] ?? "Interior"} at ${property.name}`,
    };
  });
}

export const PROPERTIES = [
  {
    id: "lakeside-modern-villa",
    name: "Lakeside Modern Villa",
    tagline: "A glass-walled pavilion wrapped around a private lake terrace.",
    city: "Austin",
    location: "Austin, Texas, USA",
    type: "Villa",
    status: "For sale",
    price: 2350000,
    bedrooms: 5,
    bathrooms: 6,
    area: 6420,
    lot: "0.9 acre",
    year: 2021,
    featured: true,
    badge: "Signature",
    agentId: "daniel-morgan",
    description: [
      "Set on a quarter-mile of private shoreline, Lakeside Modern Villa is composed as a series of low, light-filled volumes that open directly onto the water. Full-height glazing dissolves the boundary between the principal living spaces and a 24-metre infinity-edge pool, while a hand-finished oak ceiling runs the full length of the house.",
      "The principal suite occupies its own wing, with a dressing room, spa bathroom and a private terrace positioned to catch the last of the evening light. A lower level provides a media lounge, wine room and guest accommodation, all served by a discreet service entrance.",
    ],
    features: [
      "24-metre infinity-edge pool",
      "Private lake frontage with boat dock",
      "Full-height glazing to the southern elevation",
      "Hand-finished oak ceilings throughout",
      "Principal suite with spa bathroom",
      "Media lounge and 400-bottle wine room",
      "Four-car garage with EV charging",
      "Integrated lighting, audio and security",
    ],
    amenities: [
      "Infinity pool",
      "Private dock",
      "Wine cellar",
      "Home cinema",
      "Gym",
      "Guest suite",
      "Landscaped gardens",
      "Gated entrance",
      "EV charging",
      "Smart home system",
    ],
    gallery: ["cover", "living-openplan", "dining-kitchen", "bedroom-tufted", "bath-tub-stone", "terrace-pool"],
  },
  {
    id: "pacific-glass-house",
    name: "Pacific Glass House",
    tagline: "Cantilevered above the Pacific and framed entirely in glass.",
    city: "Malibu",
    location: "Malibu, California, USA",
    type: "Residence",
    status: "For sale",
    price: 4800000,
    bedrooms: 6,
    bathrooms: 7,
    area: 7850,
    lot: "0.6 acre",
    year: 2019,
    featured: true,
    badge: "Popular",
    agentId: "olivia-carter",
    description: [
      "Pacific Glass House sits on a bluff above one of Malibu's quietest coves, its living accommodation cantilevered toward the horizon. Structural glass walls retreat completely, turning the main floor into a single open-air room above the ocean.",
      "A sunken lounge and fire terrace face west for sunset. The lower level opens onto a 20-metre pool with a submerged bench, and a private stairway leads down to the beach. Interiors are deliberately restrained: pale limestone, bleached oak and bronze detailing.",
    ],
    features: [
      "Cantilevered ocean-view living room",
      "Full-height retractable glass walls",
      "20-metre pool with sunken lounge",
      "Private beach access via stone stairway",
      "Principal suite with dual dressing rooms",
      "Chef's kitchen with butler's pantry",
      "Two-suite guest wing",
      "Solar array with battery storage",
    ],
    amenities: [
      "Ocean frontage",
      "Infinity pool",
      "Beach access",
      "Outdoor kitchen",
      "Spa and sauna",
      "Home gym",
      "Wine store",
      "Solar power",
      "Gated motor court",
      "Fire terrace",
    ],
    gallery: ["cover", "living-terrace", "living-bright", "bedroom-white", "bath-gold-mirrors", "terrace-pool"],
  },
  {
    id: "desert-horizon-estate",
    name: "Desert Horizon Estate",
    tagline: "Desert modernism in board-formed concrete and glass.",
    city: "Scottsdale",
    location: "Scottsdale, Arizona, USA",
    type: "Estate",
    status: "For sale",
    price: 3150000,
    bedrooms: 5,
    bathrooms: 5,
    area: 5600,
    lot: "2.4 acres",
    year: 2020,
    featured: true,
    badge: "New",
    agentId: "james-wilson",
    description: [
      "Desert Horizon Estate is drawn in board-formed concrete, bronze and glass, set low against the McDowell foothills. Deep overhangs shade the living spaces from the midday sun while framing the Sonoran Desert and distant city lights.",
      "A shaded courtyard with a reflecting pool forms the heart of the plan, with the principal suite and guest casita arranged around it. Interiors use honed travertine, white oak and blackened steel, kept deliberately calm against the landscape.",
    ],
    features: [
      "Board-formed concrete construction",
      "Shaded courtyard with reflecting pool",
      "Separate guest casita",
      "Deep timber-clad overhangs",
      "Outdoor kitchen and dining terrace",
      "Desert-adapted landscaping",
      "Motor court with four-car garage",
      "Photovoltaic array and greywater system",
    ],
    amenities: [
      "Courtyard pool",
      "Casita",
      "Outdoor kitchen",
      "Fire pit",
      "Home office",
      "Yoga studio",
      "Solar power",
      "Gated entry",
      "Mountain views",
      "Motor court",
    ],
    gallery: ["cover", "living-formal", "dining-kitchen", "bedroom-gallery", "bath-marble", "living-neutral"],
  },
  {
    id: "oceanfront-residence",
    name: "Oceanfront Residence",
    tagline: "Direct ocean frontage with a private beach and dock.",
    city: "Miami",
    location: "Miami, Florida, USA",
    type: "Residence",
    status: "For sale",
    price: 5200000,
    bedrooms: 6,
    bathrooms: 6,
    area: 6900,
    lot: "0.8 acre",
    year: 2022,
    featured: false,
    badge: "New",
    agentId: "sophia-bennett",
    description: [
      "Oceanfront Residence commands 120 feet of direct frontage on a quiet stretch of Miami Beach. The house opens along its full width to a limestone terrace, where a mirror-finish pool meets the water beyond.",
      "Six bedrooms are arranged over two levels, including a principal suite with a private terrace, outdoor shower and dressing room. A summer kitchen, dock and shaded loggia make the house work equally well as a family home and an entertainer's address.",
    ],
    features: [
      "120 feet of direct ocean frontage",
      "Mirror-finish pool and spa",
      "Private dock with boat lift",
      "Summer kitchen and shaded loggia",
      "Principal suite with outdoor shower",
      "Impact-rated glazing throughout",
      "Elevator to both floors",
      "Whole-house generator",
    ],
    amenities: [
      "Ocean frontage",
      "Private dock",
      "Pool and spa",
      "Outdoor kitchen",
      "Elevator",
      "Home cinema",
      "Guest apartment",
      "Gated entry",
      "Hurricane glazing",
      "Staff quarters",
    ],
    gallery: ["cover", "living-bright", "living-terrace", "bedroom-white", "bath-gold-mirrors", "terrace-pool"],
  },
  {
    id: "modern-hillside-retreat",
    name: "Modern Hillside Retreat",
    tagline: "A hillside retreat framing canyon views from every room.",
    city: "Los Angeles",
    location: "Los Angeles, California, USA",
    type: "Retreat",
    status: "For sale",
    price: 3750000,
    bedrooms: 4,
    bathrooms: 5,
    area: 4950,
    lot: "1.1 acres",
    year: 2018,
    featured: false,
    badge: null,
    agentId: "olivia-carter",
    description: [
      "Approached down a private drive, Modern Hillside Retreat steps with the grade of the canyon, each level opening onto its own terrace. The house is framed in blackened steel and cedar, softening into the oak woodland around it.",
      "Living space is organised around a double-height atrium that draws light down into the plan. The principal suite opens to a cantilevered deck with an outdoor bath, positioned above the treeline.",
    ],
    features: [
      "Stepped, canyon-facing plan",
      "Double-height central atrium",
      "Cantilevered principal deck",
      "Outdoor bath and shower",
      "Cedar and blackened steel cladding",
      "Saltwater pool with swim jet",
      "Studio and screening room",
      "Two-car garage with workshop",
    ],
    amenities: [
      "Saltwater pool",
      "Outdoor bath",
      "Screening room",
      "Studio",
      "Landscaped terraces",
      "Fire table",
      "Greenhouse",
      "Studio workshop",
      "EV charging",
      "Gated drive",
    ],
    gallery: ["cover", "living-woodpanel", "living-minimal", "bedroom-gallery", "bath-tub-stone", "living-media"],
  },
  {
    id: "palm-garden-residence",
    name: "Palm Garden Residence",
    tagline: "Palm-lined formal gardens and a 1930s pedigree, reimagined.",
    city: "Beverly Hills",
    location: "Beverly Hills, California, USA",
    type: "Estate",
    status: "For sale",
    price: 6400000,
    bedrooms: 7,
    bathrooms: 8,
    area: 9200,
    lot: "1.6 acres",
    year: 2017,
    featured: true,
    badge: null,
    agentId: "daniel-morgan",
    description: [
      "Behind gates on a palm-lined street, Palm Garden Residence pairs its original 1930s proportions with a full structural and services renewal. Formal gardens, a rose walk and a mature olive grove frame the house on three sides.",
      "The plan is generous and classical in sequence: a panelled library, a formal dining room opening to the loggia, and a garden room that leads to the pool terrace. Seven bedrooms include a principal suite with a private sitting room and two dressing rooms.",
    ],
    features: [
      "1.6 acres of formal gardens",
      "Mature olive grove and rose walk",
      "Panelled library and formal dining room",
      "Garden room opening to the loggia",
      "Principal suite with two dressing rooms",
      "Guest house with kitchenette",
      "North-south tennis court",
      "Full structural and services renewal",
    ],
    amenities: [
      "Tennis court",
      "Guest house",
      "Pool and spa",
      "Formal gardens",
      "Library",
      "Wine room",
      "Gym and sauna",
      "Staff quarters",
      "Gated motor court",
      "Generator",
    ],
    gallery: ["cover", "living-formal", "dining-kitchen", "bedroom-tufted", "bath-marble", "terrace-pool"],
  },
  {
    id: "contemporary-lake-house",
    name: "Contemporary Lake House",
    tagline: "Timber, stone and water on Tahoe's quiet north shore.",
    city: "Lake Tahoe",
    location: "Lake Tahoe, Nevada, USA",
    type: "House",
    status: "For sale",
    price: 2950000,
    bedrooms: 4,
    bathrooms: 4,
    area: 4100,
    lot: "0.7 acre",
    year: 2020,
    featured: true,
    badge: null,
    agentId: "james-wilson",
    description: [
      "On the quiet north shore, Contemporary Lake House is built in weathered cedar and local granite, with a glazed gable that looks straight down the lake. A stone pier and boathouse give direct access to the water.",
      "The great room is anchored by a suspended fireplace, with a dining terrace and outdoor spa set into the deck. A bunk room and a lake-level games room make the house work for a full season, not just a weekend.",
    ],
    features: [
      "Glazed gable with lake views",
      "Private stone pier and boathouse",
      "Suspended fireplace in the great room",
      "Deck with outdoor spa and dining terrace",
      "Lake-level games room and bunk room",
      "Heated driveway and terraces",
      "Weathered cedar and granite elevations",
      "Ski and board workshop",
    ],
    amenities: [
      "Lake frontage",
      "Boathouse",
      "Private pier",
      "Outdoor spa",
      "Games room",
      "Bunk room",
      "Mud room",
      "Workshop",
      "Heated drive",
      "Fireplace",
    ],
    gallery: ["cover", "living-woodpanel", "living-openplan", "bedroom-white", "bath-tub-stone", "terrace-pool"],
  },
  {
    id: "architectural-downtown-penthouse",
    name: "Architectural Downtown Penthouse",
    tagline: "A full-floor penthouse above the Austin skyline.",
    city: "Austin",
    location: "Austin, Texas, USA",
    type: "Penthouse",
    status: "For sale",
    price: 1850000,
    bedrooms: 3,
    bathrooms: 3,
    area: 2750,
    lot: "Full floor",
    year: 2023,
    featured: true,
    badge: "New",
    agentId: "sophia-bennett",
    description: [
      "Occupying the whole of the twenty-eighth floor, this penthouse was designed by its architect owner around a single idea: uninterrupted prospect. Glazing runs the length of the western elevation, from the river to the Capitol.",
      "A monolithic island anchors the kitchen, with bespoke joinery in smoked oak and blackened brass. Two guest suites sit to the east; the principal suite opens onto a private terrace with an outdoor kitchen.",
    ],
    features: [
      "Full-floor, 360-degree aspect",
      "Private terrace with outdoor kitchen",
      "Monolithic stone kitchen island",
      "Smoked oak and blackened brass joinery",
      "Principal suite with dressing room",
      "Two guest suites",
      "Three parking spaces with lift access",
      "Resident's pool, gym and concierge",
    ],
    amenities: [
      "Concierge",
      "Residents' pool",
      "Residents' gym",
      "Private terrace",
      "Skyline views",
      "Climate-controlled parking",
      "Storage room",
      "Secure lift access",
      "Guest suite",
      "Smart home system",
    ],
    gallery: ["cover", "living-media", "living-minimal", "bedroom-gallery", "bath-gold-mirrors", "living-neutral"],
  },
];

/* ------------------------------------------------------------------ helpers */

export const CITIES = [...new Set(PROPERTIES.map((property) => property.city))].sort();

export const TYPES = [...new Set(PROPERTIES.map((property) => property.type))].sort();

export const PRICE_BANDS = [
  { value: "any", label: "Price — any", min: 0, max: Infinity },
  { value: "under-2", label: "Under $2M", min: 0, max: 2000000 },
  { value: "2-3.5", label: "$2M – $3.5M", min: 2000000, max: 3500000 },
  { value: "3.5-5", label: "$3.5M – $5M", min: 3500000, max: 5000000 },
  { value: "over-5", label: "Over $5M", min: 5000000, max: Infinity },
];

export const SORTS = [
  { value: "featured", label: "Sort — featured first" },
  { value: "price-asc", label: "Price — low to high" },
  { value: "price-desc", label: "Price — high to low" },
  { value: "area-desc", label: "Largest first" },
  { value: "newest", label: "Newest first" },
];

export function getProperty(id) {
  return PROPERTIES.find((property) => property.id === id) ?? null;
}

/**
 * Filter + sort the portfolio. Every argument is optional; omitted or "any"
 * values are ignored, which keeps this usable straight from a URL query.
 */
export function queryProperties(filters = {}) {
  const {
    search = "",
    city = "any",
    type = "any",
    price = "any",
    bedrooms = "any",
    bathrooms = "any",
    sort = "featured",
    savedIds,
  } = filters;

  const band = PRICE_BANDS.find((entry) => entry.value === price) ?? PRICE_BANDS[0];
  const term = search.trim().toLowerCase();

  const results = PROPERTIES.filter((property) => {
    if (savedIds && !savedIds.includes(property.id)) return false;
    if (city !== "any" && property.city !== city) return false;
    if (type !== "any" && property.type !== type) return false;
    if (property.price < band.min || property.price > band.max) return false;
    if (bedrooms !== "any" && property.bedrooms < Number(bedrooms)) return false;
    if (bathrooms !== "any" && property.bathrooms < Number(bathrooms)) return false;
    if (!term) return true;
    return [property.name, property.location, property.city, property.type, property.tagline]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  const sorters = {
    featured: (a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "area-desc": (a, b) => b.area - a.area,
    newest: (a, b) => b.year - a.year,
  };

  return [...results].sort(sorters[sort] ?? sorters.featured);
}

export function similarProperties(property, limit = 4) {
  return PROPERTIES.filter((entry) => entry.id !== property.id)
    .map((entry) => ({
      entry,
      score:
        (entry.city === property.city ? 2 : 0) +
        (entry.type === property.type ? 2 : 0) +
        (Math.abs(entry.price - property.price) < 1200000 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.entry.price - a.entry.price)
    .slice(0, limit)
    .map((scored) => scored.entry);
}
