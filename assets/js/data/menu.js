/**
 * Caffeine Cove — menu content.
 *
 * Everything the menu renders lives here: categories, products and the option
 * groups (size, milk, extras…) that only appear when they are relevant to a
 * given item. Prices are the base price in dollars; option deltas are added on
 * top by `priceFor()`.
 */

export const CATEGORIES = [
  { id: "coffee", label: "Coffee" },
  { id: "cold", label: "Cold Drinks" },
  { id: "tea", label: "Tea" },
  { id: "breakfast", label: "Breakfast" },
  { id: "pastries", label: "Pastries" },
  { id: "desserts", label: "Desserts" },
  { id: "food", label: "Food" },
  { id: "signature", label: "Signature" },
];

/* --- reusable option groups --------------------------------------------- */

const SIZE = {
  id: "size",
  label: "Size",
  type: "single",
  choices: [
    { id: "regular", label: "Regular" },
    { id: "small", label: "Small", delta: -0.4 },
    { id: "large", label: "Large", delta: 0.6 },
  ],
};

const MILK = {
  id: "milk",
  label: "Milk",
  type: "single",
  choices: [
    { id: "whole", label: "Whole" },
    { id: "oat", label: "Oat", delta: 0.4 },
    { id: "almond", label: "Almond", delta: 0.4 },
    { id: "soy", label: "Soy", delta: 0.4 },
  ],
};

const EXTRAS = {
  id: "extras",
  label: "Extras",
  type: "multi",
  choices: [
    { id: "shot", label: "Extra shot", delta: 1 },
    { id: "vanilla", label: "Vanilla syrup", delta: 0.6 },
    { id: "caramel", label: "Caramel syrup", delta: 0.6 },
  ],
};

const SUGAR = {
  id: "sugar",
  label: "Sugar",
  type: "single",
  choices: [
    { id: "none", label: "None" },
    { id: "light", label: "Light" },
    { id: "regular", label: "Regular" },
  ],
};

const ICE = {
  id: "ice",
  label: "Ice",
  type: "single",
  choices: [
    { id: "regular", label: "Regular" },
    { id: "less", label: "Less ice" },
    { id: "extra", label: "Extra ice" },
  ],
};

const WARMED = {
  id: "serve",
  label: "Serve",
  type: "single",
  choices: [
    { id: "room", label: "As it comes" },
    { id: "warm", label: "Warmed", delta: 0.3 },
  ],
};

const SIDES = {
  id: "sides",
  label: "Add on",
  type: "multi",
  choices: [
    { id: "egg", label: "Poached egg", delta: 1.8 },
    { id: "avocado", label: "Avocado", delta: 2.2 },
    { id: "bacon", label: "Smoked bacon", delta: 2.6 },
  ],
};

/* --- products ------------------------------------------------------------ */

export const PRODUCTS = [
  /* Coffee */
  {
    id: "espresso",
    name: "Espresso",
    category: "coffee",
    price: 3.2,
    image: "assets/images/menu/espresso.jpg",
    description: "A dense, syrupy double shot pulled from our house blend.",
    badge: "Classic",
    options: [SIZE, SUGAR],
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    category: "coffee",
    price: 4.2,
    image: "assets/images/menu/cappuccino.jpg",
    description: "Equal parts espresso, steamed milk and velvet foam.",
    options: [SIZE, MILK, EXTRAS, SUGAR],
  },
  {
    id: "flat-white",
    name: "Flat White",
    category: "coffee",
    price: 4.4,
    image: "assets/images/menu/flat-white.jpg",
    description: "Velvety microfoam blended with a rich double espresso.",
    badge: "Barista pick",
    options: [SIZE, MILK, EXTRAS, SUGAR],
  },
  {
    id: "latte",
    name: "Latte",
    category: "coffee",
    price: 4.5,
    image: "assets/images/menu/latte.jpg",
    description: "Silky steamed milk poured over a smooth double shot.",
    options: [SIZE, MILK, EXTRAS, SUGAR],
  },
  {
    id: "spanish-latte",
    name: "Spanish Latte",
    category: "coffee",
    price: 4.9,
    image: "assets/images/menu/spanish-latte.jpg",
    description: "Condensed milk, espresso and a whisper of cinnamon.",
    options: [SIZE, MILK, EXTRAS],
  },
  {
    id: "caramel-macchiato",
    name: "Caramel Macchiato",
    category: "coffee",
    price: 5.1,
    image: "assets/images/menu/caramel-macchiato.jpg",
    description: "Layered espresso, vanilla milk and burnt caramel.",
    options: [SIZE, MILK, EXTRAS, SUGAR],
  },

  /* Cold drinks */
  {
    id: "iced-americano",
    name: "Iced Americano",
    category: "cold",
    price: 4,
    image: "assets/images/menu/iced-americano.jpg",
    description: "Chilled espresso lengthened with cold filtered water.",
    tags: ["vegan"],
    options: [SIZE, ICE, SUGAR],
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    category: "cold",
    price: 4.6,
    image: "assets/images/menu/cold-brew.jpg",
    description: "Steeped for eighteen hours. Smooth, low-acid, quietly sweet.",
    options: [SIZE, MILK, ICE],
  },
  {
    id: "iced-matcha",
    name: "Iced Matcha",
    category: "cold",
    price: 5.2,
    image: "assets/images/menu/iced-matcha.jpg",
    description: "Stone-ground matcha shaken over ice with your choice of milk.",
    options: [SIZE, MILK, ICE, SUGAR],
  },

  /* Tea */
  {
    id: "matcha-latte",
    name: "Matcha Latte",
    category: "tea",
    price: 4.8,
    image: "assets/images/menu/matcha-latte.jpg",
    description: "Ceremonial-grade matcha whisked with steamed milk.",
    options: [SIZE, MILK, SUGAR],
  },
  {
    id: "chai-latte",
    name: "Chai Latte",
    category: "tea",
    price: 4.6,
    image: "assets/images/menu/chai-latte.jpg",
    description: "Black tea simmered with cardamom, clove and fresh ginger.",
    options: [SIZE, MILK, SUGAR],
  },
  {
    id: "herbal-tea",
    name: "Herbal Infusion",
    category: "tea",
    price: 3.8,
    image: "assets/images/menu/herbal-tea.jpg",
    description: "Loose-leaf botanicals, steeped to order.",
    tags: ["vegan"],
    options: [SIZE, SUGAR],
  },

  /* Breakfast */
  {
    id: "avocado-toast",
    name: "Avocado Toast",
    category: "breakfast",
    price: 9.5,
    image: "assets/images/menu/avocado-toast.jpg",
    description: "Sourdough, smashed avocado, chilli, lemon and a poached egg.",
    badge: "All day",
    options: [SIDES],
  },
  {
    id: "breakfast-plate",
    name: "Morning Plate",
    category: "breakfast",
    price: 11,
    image: "assets/images/menu/breakfast-plate.jpg",
    description: "Fried eggs, roasted tomato, dressed greens and sourdough.",
    options: [SIDES],
  },
  {
    id: "pancakes",
    name: "Buttermilk Pancakes",
    category: "breakfast",
    price: 10.5,
    image: "assets/images/menu/pancakes.jpg",
    description: "Stacked with caramelised banana and warm honey.",
    options: [SIDES],
  },

  /* Pastries */
  {
    id: "croissant",
    name: "Butter Croissant",
    category: "pastries",
    price: 3.6,
    image: "assets/images/menu/croissant.jpg",
    description: "Laminated over three days. Shatteringly crisp.",
    badge: "Baked daily",
    options: [WARMED],
  },
  {
    id: "pain-au-chocolat",
    name: "Pain au Chocolat",
    category: "pastries",
    price: 4,
    image: "assets/images/menu/pain-au-chocolat.jpg",
    description: "Buttery layers folded around dark chocolate.",
    options: [WARMED],
  },
  {
    id: "sourdough",
    name: "Sourdough Loaf",
    category: "pastries",
    price: 6.5,
    image: "assets/images/menu/sourdough.jpg",
    description: "Slow-fermented and wood-fired, baked every morning.",
    options: [WARMED],
  },

  /* Desserts */
  {
    id: "tiramisu",
    name: "Tiramisu",
    category: "desserts",
    price: 6.8,
    image: "assets/images/menu/tiramisu.jpg",
    description: "Espresso-soaked savoiardi, mascarpone and bitter cocoa.",
    badge: "House favourite",
    options: [],
  },
  {
    id: "cheesecake",
    name: "Vanilla Cheesecake",
    category: "desserts",
    price: 6.5,
    image: "assets/images/menu/cheesecake.jpg",
    description: "Baked vanilla cheesecake with a berry compote.",
    options: [],
  },
  {
    id: "chocolate-cake",
    name: "Dark Chocolate Cake",
    category: "desserts",
    price: 6.2,
    image: "assets/images/menu/chocolate-cake.jpg",
    description: "Flourless, fudgy and served just warm.",
    tags: ["vegan"],
    options: [],
  },
  {
    id: "fondant",
    name: "Chocolate Fondant",
    category: "desserts",
    price: 7.2,
    image: "assets/images/menu/fondant.jpg",
    description: "Molten centre, salted caramel and vanilla cream.",
    options: [],
  },

  /* Food */
  {
    id: "club-sandwich",
    name: "Club Sandwich",
    category: "food",
    price: 12.5,
    image: "assets/images/menu/club-sandwich.jpg",
    description: "Roast chicken, smoked bacon, egg and tomato.",
    options: [SIDES],
  },
  {
    id: "panini",
    name: "Grilled Panini",
    category: "food",
    price: 10.5,
    image: "assets/images/menu/panini.jpg",
    description: "Mozzarella, pesto and roasted peppers, pressed hot.",
    options: [SIDES],
  },
  {
    id: "seasonal-salad",
    name: "Seasonal Salad",
    category: "food",
    price: 11.5,
    image: "assets/images/menu/seasonal-salad.jpg",
    description: "Market leaves, grains, soft herbs and a citrus dressing.",
    tags: ["vegan"],
    options: [SIDES],
  },

  /* Signature */
  {
    id: "signature-latte",
    name: "Cove Signature Latte",
    category: "signature",
    price: 5.6,
    image: "assets/images/menu/signature-latte.jpg",
    description: "House blend, brown-butter syrup and a pinch of sea salt.",
    badge: "Signature",
    featured: true,
    options: [SIZE, MILK, EXTRAS],
  },
  {
    id: "pour-over",
    name: "Single-Origin Pour Over",
    category: "signature",
    price: 5.4,
    image: "assets/images/menu/pour-over.jpg",
    description: "Hand-brewed to order. Ask for today's lot.",
    badge: "Small batch",
    featured: true,
    options: [SIZE, SUGAR],
  },
  {
    id: "affogato",
    name: "Affogato",
    category: "signature",
    price: 5.8,
    image: "assets/images/menu/affogato.jpg",
    description: "Vanilla bean gelato drowned in a hot double shot.",
    featured: true,
    options: [EXTRAS],
  },
];

PRODUCTS.find((product) => product.id === "croissant").featured = true;

/* --- helpers ------------------------------------------------------------- */

export function productsInCategory(categoryId) {
  return PRODUCTS.filter((product) => product.category === categoryId);
}

export function featuredProducts() {
  return PRODUCTS.filter((product) => product.featured);
}

export function categoryLabel(categoryId) {
  return CATEGORIES.find((category) => category.id === categoryId)?.label ?? "";
}

/** Default selection: first choice for every single-select group. */
export function defaultSelection(product) {
  const selection = {};
  for (const group of product.options ?? []) {
    if (group.type === "single") selection[group.id] = group.choices[0].id;
    else selection[group.id] = [];
  }
  return selection;
}

function choiceFor(group, choiceId) {
  return group.choices.find((choice) => choice.id === choiceId);
}

/** Base price plus the deltas of the chosen options. */
export function priceFor(product, selection = {}) {
  let total = product.price;
  for (const group of product.options ?? []) {
    const value = selection[group.id];
    if (Array.isArray(value)) {
      for (const id of value) total += choiceFor(group, id)?.delta ?? 0;
    } else if (value != null) {
      total += choiceFor(group, value)?.delta ?? 0;
    }
  }
  return total;
}

/** Human-readable summary of a selection, e.g. "Large · Oat · Extra shot". */
export function describeSelection(product, selection = {}) {
  const parts = [];
  for (const group of product.options ?? []) {
    const value = selection[group.id];
    if (Array.isArray(value)) {
      for (const id of value) {
        const choice = choiceFor(group, id);
        if (choice) parts.push(choice.label);
      }
    } else if (value != null) {
      const choice = choiceFor(group, value);
      // Skip the default choice so the summary stays short.
      if (choice && choice.id !== group.choices[0].id) parts.push(choice.label);
    }
  }
  return parts.join(" · ");
}
