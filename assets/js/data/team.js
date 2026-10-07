/**
 * Horizon Properties — team & services content.
 * Plain data, easy to edit or move behind an API later.
 */

export const TEAM = [
  {
    id: "daniel-morgan",
    name: "Daniel Morgan",
    role: "Managing Director",
    photo: "assets/images/team/daniel-morgan.jpg",
    bio: "Twenty-two years in prime residential, previously leading a private office in Mayfair. Daniel oversees every mandate the practice takes on.",
    email: "daniel@horizonproperties.com",
    phone: "(555) 246-7890",
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "olivia-carter",
    name: "Olivia Carter",
    role: "Luxury Property Advisor",
    photo: "assets/images/team/olivia-carter.jpg",
    bio: "Olivia advises on waterfront and architectural houses along the Californian coast, with a specialism in off-market introductions.",
    email: "olivia@horizonproperties.com",
    phone: "(555) 246-7891",
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "james-wilson",
    name: "James Wilson",
    role: "Investment Consultant",
    photo: "assets/images/team/james-wilson.jpg",
    bio: "James builds and reviews residential portfolios for private clients and family offices, covering yield, structure and exit.",
    email: "james@horizonproperties.com",
    phone: "(555) 246-7892",
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "sophia-bennett",
    name: "Sophia Bennett",
    role: "Senior Property Specialist",
    photo: "assets/images/team/sophia-bennett.jpg",
    bio: "Sophia leads our city and penthouse division in Austin, from first viewing through to completion, alongside our in-house legal team.",
    email: "sophia@horizonproperties.com",
    phone: "(555) 246-7893",
    linkedin: "https://www.linkedin.com/",
  },
];

export function getAgent(id) {
  return TEAM.find((member) => member.id === id) ?? TEAM[0];
}

export const SERVICES = [
  {
    id: "luxury-home-sales",
    index: "01",
    name: "Luxury Home Sales",
    short: "Discreet representation for exceptional houses.",
    description:
      "From valuation and photography to private viewings and negotiation, we represent a small number of houses at a time so each mandate receives the attention it deserves.",
    includes: ["Pre-market strategy", "Architectural photography & film", "Private viewings", "Negotiation & completion"],
  },
  {
    id: "property-investment",
    index: "02",
    name: "Property Investment",
    short: "Portfolios built on evidence, not instinct.",
    description:
      "We model yield, financing structure and exit horizon for every acquisition, and report on performance quarterly so you always know where a portfolio stands.",
    includes: ["Market & yield modelling", "Acquisition sourcing", "Financing structure", "Quarterly performance reporting"],
  },
  {
    id: "property-marketing",
    index: "03",
    name: "Property Marketing",
    short: "Editorial campaigns for architectural houses.",
    description:
      "Every campaign is art-directed as a piece of editorial: written copy, commissioned photography, film and a targeted placement schedule across print and digital.",
    includes: ["Art direction", "Commissioned photography & film", "Brochure & editorial production", "Print & digital placement"],
  },
  {
    id: "real-estate-advisory",
    index: "04",
    name: "Real Estate Advisory",
    short: "Independent advice before you commit.",
    description:
      "Whether you are buying, holding or restructuring, we provide an independent view on value, risk and timing, free of any interest in the transaction itself.",
    includes: ["Independent valuation review", "Risk & title due diligence", "Development feasibility", "Negotiation strategy"],
  },
  {
    id: "property-valuation",
    index: "05",
    name: "Property Valuation",
    short: "Accurate figures for the decisions that matter.",
    description:
      "Instructed valuations for sale, refinancing, probate and portfolio reporting, prepared by specialists who transact in the same market every day.",
    includes: ["Sale & market valuations", "Refinancing and lending", "Probate & estate purposes", "Portfolio reporting"],
  },
  {
    id: "relocation-services",
    index: "06",
    name: "Relocation Services",
    short: "A single point of contact for a move.",
    description:
      "Area orientation, school introductions, interiors and household set-up — coordinated end to end so an international move feels like a short trip.",
    includes: ["Area & school orientation", "Shortlist viewings", "Interiors & furnishing", "Household set-up"],
  },
];

export const WHY_HORIZON = [
  {
    index: "01",
    title: "Specialists, not generalists",
    text: "Each advisor works a defined patch of the market. You speak to the person who knows the street, the architect and the last three comparable sales.",
  },
  {
    index: "02",
    title: "A small, deliberate portfolio",
    text: "We take on a limited number of mandates so every house receives a considered campaign rather than a listing on a portal.",
  },
  {
    index: "03",
    title: "Transparent from the first call",
    text: "Clear fees, realistic valuations and honest advice on timing — including when the answer is to wait.",
  },
  {
    index: "04",
    title: "From first viewing to keys",
    text: "Legal, finance, survey and interiors are coordinated in-house, so nothing falls between two advisors.",
  },
];

export const STATS = [
  { value: "$1.4B", label: "Property transacted" },
  { value: "21", label: "Years in practice" },
  { value: "38", label: "Cities covered" },
  { value: "96%", label: "Client referral rate" },
];

export const VALUES = [
  {
    index: "01",
    title: "Integrity",
    text: "We give the same advice to a first-time buyer as to a family office. Nothing is presented as a certainty when it is a judgement.",
  },
  {
    index: "02",
    title: "Precision",
    text: "Values are supported by evidence, campaigns are measured weekly, and every promise has a date attached to it.",
  },
  {
    index: "03",
    title: "Discretion",
    text: "A significant share of our work never reaches a portal. Names, addresses and figures stay confidential until you decide otherwise.",
  },
  {
    index: "04",
    title: "Craft",
    text: "Architecture deserves to be presented properly — in writing, in photography and in the way a viewing is arranged.",
  },
];

export const PROCESS = [
  { index: "01", title: "Introduction", text: "A confidential conversation about the property or the brief, and a first view on value and timing." },
  { index: "02", title: "Strategy", text: "We set the price, the audience and the campaign, and agree what success looks like before anything goes live." },
  { index: "03", title: "Campaign", text: "Photography, film and editorial are commissioned; viewings are qualified and accompanied by the advisor who knows the market." },
  { index: "04", title: "Completion", text: "Negotiation, legal coordination and handover are managed through to keys, with a single point of contact throughout." },
];

export const FAQS = [
  {
    q: "How do you value a property?",
    a: "We combine recent comparable sales, current competing stock and the specific attributes of the house — orientation, architecture, condition and plot. You receive the evidence with the figure, so you can see how the number was reached.",
  },
  {
    q: "Can you sell off-market?",
    a: "Yes. A meaningful portion of our mandates are introduced privately to a vetted list before any public campaign. We will tell you honestly whether off-market or open-market is likely to achieve more.",
  },
  {
    q: "Do you work with international buyers?",
    a: "Regularly. We coordinate currency, financing, legal representation and relocation so a purchase can be completed from abroad without a wasted journey.",
  },
  {
    q: "What are your fees?",
    a: "A fixed percentage of the achieved sale price for sales mandates, and a scoped fee for advisory and valuation work. Both are confirmed in writing before we begin.",
  },
];
