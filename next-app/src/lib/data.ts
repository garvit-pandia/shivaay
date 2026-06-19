export interface City {
  name: string;
  lat: number;
  lng: number;
  label: string;
  tag: string;
  services: string[];
  isHub: boolean;
}

export interface CityPair {
  from: string;
  to: string;
}

export interface ServiceCard {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  initials: string;
  name: string;
  role: string;
}

export interface WhyUsItem {
  icon: string;
  title: string;
  description: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
  compact?: boolean;
}

export const heroStats: Stat[] = [
  { value: 15, suffix: "+", label: "Years Experience" },
  { value: 800, suffix: "+", label: "Happy Clients" },
  { value: 5, suffix: "", label: "Major Ports" },
  { value: 12000, suffix: "+", label: "Shipments Cleared", compact: true },
  { value: 1200, suffix: "+", label: "Containers Moved" },
];

export const cities: Record<string, City> = {
  Ludhiana: {
    name: "Ludhiana",
    lat: 30.901,
    lng: 75.8573,
    label: "Ludhiana",
    tag: "Headquarters",
    services: ["Customs Clearance", "Freight Forwarding", "Logistics Hub"],
    isHub: true,
  },
  Amritsar: {
    name: "Amritsar",
    lat: 31.634,
    lng: 74.8723,
    label: "Amritsar",
    tag: "Border Hub",
    services: ["Customs Clearance", "Cross-Border Logistics"],
    isHub: false,
  },
  Delhi: {
    name: "Delhi",
    lat: 28.6139,
    lng: 77.209,
    label: "Delhi",
    tag: "Distribution Hub",
    services: ["Freight Forwarding", "Distribution", "Warehousing"],
    isHub: false,
  },
  Mumbai: {
    name: "Mumbai",
    lat: 19.076,
    lng: 72.8777,
    label: "Mumbai",
    tag: "Major Port",
    services: ["Sea Freight", "Port Operations", "Customs Clearance"],
    isHub: false,
  },
  Mundra: {
    name: "Mundra",
    lat: 22.8395,
    lng: 69.7217,
    label: "Mundra",
    tag: "Port Hub",
    services: ["Port Operations", "Cargo Handling", "Sea Freight"],
    isHub: false,
  },
};

export const routes: CityPair[] = [
  { from: "Ludhiana", to: "Amritsar" },
  { from: "Ludhiana", to: "Delhi" },
  { from: "Ludhiana", to: "Mumbai" },
  { from: "Ludhiana", to: "Mundra" },
  { from: "Delhi", to: "Mumbai" },
  { from: "Mumbai", to: "Mundra" },
];

export interface MapCity {
  x: number;
  y: number;
  label: string;
  tag: string;
  isHub: boolean;
}

export const mapCities: Record<string, MapCity> = {
  Ludhiana: { x: 308, y: 257, label: "Ludhiana", tag: "Headquarters", isHub: true },
  Amritsar: { x: 279, y: 236, label: "Amritsar", tag: "Border Hub", isHub: false },
  Delhi:    { x: 346, y: 323, label: "Delhi",    tag: "Distribution Hub", isHub: false },
  Mundra:   { x: 130, y: 491, label: "Mundra",   tag: "Port Hub", isHub: false },
  Mumbai:   { x: 221, y: 600, label: "Mumbai",   tag: "Major Port", isHub: false },
};

export interface StoryStep {
  eyebrow: string;
  headline: string;
  body: string;
  city: keyof typeof mapCities | null;
  routeFrom: keyof typeof mapCities | null;
  routeTo: keyof typeof mapCities | null;
  stamp: string;
  valueProp: string;
}

export const storySteps: StoryStep[] = [
  {
    eyebrow: "STEP 01",
    headline: "Your cargo begins its journey in Ludhiana",
    body: "Collected at your facility, surveyed, weighed, and packed for export-grade transport.",
    city: "Ludhiana",
    routeFrom: null,
    routeTo: null,
    stamp: "DEPARTURE · LUDHIANA",
    valueProp: "24/7 Customer Support",
  },
  {
    eyebrow: "STEP 02",
    headline: "Documentation filed at Delhi ICD",
    body: "ICEGATE filings, bills of lading, shipping bills, and DGFT compliance — handled end to end.",
    city: "Delhi",
    routeFrom: "Ludhiana",
    routeTo: "Delhi",
    stamp: "CUSTOMS FILED · DELHI",
    valueProp: "Customs Compliance Assurance",
  },
  {
    eyebrow: "STEP 03",
    headline: "Transhipment at Mundra Port",
    body: "Container stuffing, port handling, and vessel booking coordinated in a single window.",
    city: "Mundra",
    routeFrom: "Delhi",
    routeTo: "Mundra",
    stamp: "TRANSHIPMENT · MUNDRA",
    valueProp: "Expertise & Experience",
  },
  {
    eyebrow: "STEP 04",
    headline: "Sea transit to Mumbai",
    body: "FCL/LCL consolidation, vessel sailing, and tracking until discharge at destination port.",
    city: "Mumbai",
    routeFrom: "Mundra",
    routeTo: "Mumbai",
    stamp: "SAILED · MUMBAI",
    valueProp: "Timely & Safe Delivery",
  },
  {
    eyebrow: "STEP 05",
    headline: "Door-to-door delivery",
    body: "Last-mile road freight, proof of delivery, and a closed shipment file at your destination.",
    city: null,
    routeFrom: null,
    routeTo: null,
    stamp: "DELIVERED",
    valueProp: "Cost Effective Solutions",
  },
];

export const homepageServices: ServiceCard[] = [
  { icon: "file-check", title: "Customs Clearance", description: "Expert customs brokerage and documentation services" },
  { icon: "ship", title: "Freight Forwarding", description: "Sea, air, road, and rail freight solutions" },
  { icon: "package-check", title: "Logistics Solutions", description: "Complete supply chain management" },
  { icon: "shield-check", title: "Trusted Service", description: "Reliable, timely, and cost-effective delivery" },
];

export const services: ServiceCard[] = [
  { icon: "plane", title: "Air Freight", description: "Fast and reliable air cargo services for time-sensitive shipments across domestic and international routes." },
  { icon: "ship", title: "Sea Freight", description: "Cost-effective ocean freight solutions including FCL and LCL shipments to major ports worldwide." },
  { icon: "truck", title: "Road Freight", description: "Pan-India road transportation with a fleet of modern vehicles for timely door-to-door delivery." },
  { icon: "train-front", title: "Rail Freight", description: "Economical rail cargo services for bulk and heavy shipments across the Indian railway network." },
  { icon: "home", title: "Door to Door Delivery", description: "Complete pickup-to-delivery service with real-time tracking and proof of delivery." },
  { icon: "hammer", title: "Project Cargo Handling", description: "Specialized handling for oversized, heavy-lift, and complex project cargo movements." },
  { icon: "warehouse", title: "Warehousing & Distribution", description: "Secure storage facilities with inventory management and distribution network across India." },
  { icon: "shield", title: "Cargo Insurance", description: "Comprehensive cargo insurance coverage protecting your goods against transit risks." },
  { icon: "package", title: "Packaging & Repacking", description: "Professional packing services including export-grade packaging and repacking solutions." },
  { icon: "file-text", title: "Import & Export Documentation", description: "Complete documentation support for customs, DGFT, and regulatory compliance." },
  { icon: "boxes", title: "Consolidation (LCL) Services", description: "Less-than-container-load consolidation for cost-efficient small-volume shipments." },
  { icon: "briefcase", title: "Third Party Logistics (3PL)", description: "End-to-end outsourced logistics management including warehousing, transport, and fulfillment." },
];

export const testimonials: Testimonial[] = [
  {
    quote: "Shivaay Logistics handled our entire export consignment from Ludhiana to Dubai without a single delay. Their customs clearance expertise is unmatched.",
    initials: "RS",
    name: "Rajinder Singh",
    role: "Textile Exporter, Ludhiana",
  },
  {
    quote: "We've been working with Mandeep's team for 3 years. They manage our freight forwarding across 5 states — reliable, cost-effective, and always on time.",
    initials: "PS",
    name: "Priya Sharma",
    role: "Auto Parts Manufacturer, Delhi",
  },
  {
    quote: "From documentation to door delivery, Shivaay made our first import shipment completely stress-free. Highly recommend for anyone new to international trade.",
    initials: "AV",
    name: "Amit Verma",
    role: "Furniture Importer, Mumbai",
  },
];

export const whyUsItems: WhyUsItem[] = [
  { icon: "shield-check", title: "Expertise & Experience", description: "15+ years of deep industry knowledge and customs expertise" },
  { icon: "clock", title: "Timely & Safe Delivery", description: "On-time delivery with complete cargo safety and tracking" },
  { icon: "badge-indian-rupee", title: "Cost Effective Solutions", description: "Competitive pricing without compromising on service quality" },
  { icon: "file-text", title: "Customs Compliance Assurance", description: "Full regulatory compliance for hassle-free clearance" },
  { icon: "headphones", title: "24/7 Customer Support", description: "Round-the-clock assistance for all your logistics needs" },
];

export const galleryImages = [
  { src: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&h=450&fit=crop", alt: "Cargo ship docked at a busy port terminal" },
  { src: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&h=450&fit=crop", alt: "Port cranes loading containers at a shipping yard" },
  { src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=450&fit=crop", alt: "Convoy of logistics trucks on a highway" },
];

export const contactInfo = {
  address: "Plot No. 116, Street No. 8, Ganesh Nagar, 33 Feet Road, Near Ashiana Enclave, Mundian Kalan, Ludhiana-141015 (Pb.)",
  phones: ["+91 88474-67790"],
  email: "shivaaylogistics2022@gmail.com",
  hours: "Monday - Saturday: 9:00 AM - 7:00 PM / Sunday: Closed",
};

export const companyInfo = {
  name: "Shivaay Logistics",
  tagline: "Customs Broker & Logistics Facilitator",
  experience: "15+ Years Experience",
  clients: "800+ Happy Clients",
  description: "Shivaay Logistics is a trusted customs broker and logistics facilitator based in Ludhiana, Punjab. We serve businesses across India with reliable, cost-effective freight solutions.",
  phone: "+918847467790",
  whatsapp: "+918847467790",
};

export const serviceOptions = [
  "Customs Clearance",
  "Air Freight",
  "Sea Freight",
  "Road Freight",
  "Rail Freight",
  "Door to Door Delivery",
  "Project Cargo Handling",
  "Warehousing & Distribution",
  "Cargo Insurance",
  "Packaging & Repacking",
  "Import & Export Documentation",
  "Consolidation (LCL) Services",
  "Third Party Logistics (3PL)",
  "Other / Multiple Services",
];

export interface TickerItem {
  event: string;
  ref: string;
  route: string;
  time: string;
}

export const tickerItems: TickerItem[] = [
  { event: "Customs cleared",        ref: "MSCU-4729384", route: "Mundra → Ludhiana",      time: "8m ago" },
  { event: "ICEGATE filing approved", ref: "SH-2841",     route: "Ludhiana export",         time: "14m ago" },
  { event: "Container loaded",       ref: "TCLU-8816204", route: "Mumbai → Hamburg",        time: "23m ago" },
  { event: "BL issued",              ref: "HLCU-2024477", route: "Mundra sea FCL",          time: "31m ago" },
  { event: "Dispatched",             ref: "CON-7702341", route: "Delhi ICD → Ludhiana",     time: "42m ago" },
  { event: "Arrived",                ref: "MSKU-1190382", route: "Mundra port",             time: "1h ago" },
  { event: "Door delivery",          ref: "TRK-5520",    route: "Mumbai → Pune",           time: "1h ago" },
  { event: "Customs cleared",        ref: "TEMU-6641029", route: "Amritsar border",         time: "1h ago" },
  { event: "Loaded",                 ref: "MAEU-4470821", route: "Mundra → Rotterdam",      time: "2h ago" },
  { event: "Filing approved",        ref: "SH-3018",     route: "Delhi ICD import",        time: "2h ago" },
  { event: "Sailed",                 ref: "MSCU-7720193", route: "Mumbai → Jebel Ali",      time: "3h ago" },
  { event: "Arrived",                ref: "CRXU-3001847", route: "Chennai port",            time: "3h ago" },
  { event: "Dispatched",             ref: "TRK-9182",    route: "Ludhiana → Jalandhar",    time: "4h ago" },
  { event: "Customs cleared",        ref: "TCLU-5592107", route: "Mundra → Delhi",          time: "5h ago" },
  { event: "Booked",                 ref: "SH-4190",     route: "Ludhiana → Mundra FCL",   time: "6h ago" },
];

export interface Credential {
  label: string;
  value: string;
}

// DEMO VALUES — replace with real credentials before production.
// Internally consistent: IEC and GSTIN share PAN prefix AALCS8394K.
export const credentials: Credential[] = [
  { label: "IEC Code",                  value: "AALCS8394K" },
  { label: "Customs Broker License",    value: "CB/PUN/2021/00847" },
  { label: "GSTIN",                     value: "03AALCS8394K1Z5" },
  { label: "ISO 9001:2015",             value: "Certified" },
  { label: "ISO 28000",                 value: "Certified" },
];
