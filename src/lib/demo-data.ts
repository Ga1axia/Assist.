/** eTower static content — entrepreneurship community */

/** Primary brand mark — green E + white wordmark on black (from logos/etowerlogo.png). */
export const ETOWER_LOGO = "/etowerlogo.png";
/** Alias kept for dark surfaces; same asset as ETOWER_LOGO. */
export const ETOWER_LOGO_LIGHT = "/etowerlogo.png";
/** Nav variant — green E (white glyph) + black wordmark, transparent bg. */
export const ETOWER_LOGO_NAV = "/etowerlogo-nav.png";

export const ETOWER = {
  name: "eTower",
  tagline: "Where Boston's Next Generation of Entrepreneurs Live, Learn, and Launch",
  subtagline:
    "Join 21 ambitious residents building the future at Boston's premier entrepreneurial living community",
  email: "etowerbabson@gmail.com",
  instagram: "@etowerbabson",
  instagramUrl: "https://instagram.com/etowerbabson",
  address: "Van Winkle Hall C2, Babson College, Wellesley, MA 02457",
} as const;

export const HERO_STATS = [
  { value: "21", label: "Active Residents" },
  { value: "250+", label: "Alumni Network" },
  { value: "$3B+", label: "Alumni Valuations" },
] as const;

export const IMPACT_METRICS = [
  {
    value: "250+",
    label: "Alumni Network",
    description: "Successful entrepreneurs and leaders",
  },
  {
    value: "$3B+",
    label: "Alumni Valuations",
    description: "Combined value of alumni companies",
  },
  {
    value: "100+",
    label: "Startups Founded",
    description: "Companies launched by our community",
  },
  {
    value: "$50M+",
    label: "Funding Raised",
    description: "Capital raised by alumni ventures",
  },
] as const;

export type FeaturedStartup = {
  id: string;
  name: string;
  category: string;
  overview: string;
  founder: string;
  initial: string;
  logo: string;
};

/** Local brand marks from /public/logos (copied from repo logos/) */
export const COMMUNITY_VENTURES = [
  {
    id: "junk-teens",
    name: "Junk Teens",
    category: "Service",
    overview:
      "Youth-focused junk removal that employs teenagers while helping communities clear clutter and waste.",
    founder: "Kirk McKinney",
    initial: "JT",
    logo: "/logos/JunkTeens.png",
    image: "https://images.unsplash.com/photo-1621451537084-624c072d4aee?w=640&h=360&fit=crop&q=80",
  },
  {
    id: "sunu-body",
    name: "Sunu Body",
    category: "Wellness",
    overview: "Bodycare and wellness brand built for everyday rituals that feel intentional and lasting.",
    founder: "eTower Resident",
    initial: "SB",
    logo: "/logos/SunuBody.png",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=640&h=360&fit=crop&q=80",
  },
  {
    id: "truvit",
    name: "TRUVIT",
    category: "Health",
    overview: "Health and nutrition venture focused on clearer choices for modern lifestyles.",
    founder: "eTower Alumni",
    initial: "TV",
    logo: "/logos/Truvit.png",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&h=360&fit=crop&q=80",
  },
  {
    id: "checkmate",
    name: "Checkmate Academy",
    category: "Education",
    overview: "Chess education that builds focus, strategy, and confidence for the next generation of thinkers.",
    founder: "eTower Resident",
    initial: "CA",
    logo: "/logos/CheckmateAcademy.png",
    image: "https://images.unsplash.com/photo-1529699211952-484e3085560c?w=640&h=360&fit=crop&q=80",
  },
  {
    id: "empower",
    name: "Empower Sports Academy",
    category: "Sports",
    overview: "Athlete development academy helping young talent train harder and dream bigger.",
    founder: "eTower Resident",
    initial: "ES",
    logo: "/logos/EmpowerSportsAcademy.png",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&h=360&fit=crop&q=80",
  },
  {
    id: "desi-eats",
    name: "Desi Eats",
    category: "Food",
    overview: "Flavor-forward food brand bringing bold Desi-inspired eats to campus and beyond.",
    founder: "eTower Resident",
    initial: "DE",
    logo: "/logos/DesiEats.png",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=640&h=360&fit=crop&q=80",
  },
  {
    id: "arcangel",
    name: "Arcangel",
    category: "Tech",
    overview: "Community-built venture pushing creative tech products from idea to launch.",
    founder: "eTower Alumni",
    initial: "AR",
    logo: "/logos/arcangel.png",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&h=360&fit=crop&q=80",
  },
] as const;

export const FEATURED_STARTUPS: FeaturedStartup[] = COMMUNITY_VENTURES.slice(0, 3).map((v) => ({
  id: v.id,
  name: v.name,
  category: v.category,
  overview: v.overview,
  founder: v.founder,
  initial: v.initial,
  logo: v.logo,
}));

export type ResidentProfile = {
  name: string;
  role: string;
  focus: string;
  year: string;
  initials: string;
};

export const CURRENT_RESIDENTS: ResidentProfile[] = [
  { name: "Kirk McKinney", role: "Resident", focus: "Junk Teens", year: "2026", initials: "KM" },
  { name: "Anastacia Yefimenko", role: "Resident", focus: "Elcove", year: "2026", initials: "AY" },
  { name: "Maya Chen", role: "Resident", focus: "Consumer products", year: "2027", initials: "MC" },
  { name: "Jordan Lee", role: "Resident", focus: "Fintech", year: "2026", initials: "JL" },
  { name: "Sam Ortiz", role: "Resident", focus: "EdTech", year: "2027", initials: "SO" },
  { name: "Priya Shah", role: "Resident", focus: "Climate", year: "2026", initials: "PS" },
  { name: "Alex Rivera", role: "President", focus: "Community ops", year: "2026", initials: "AR" },
  { name: "Taylor Brooks", role: "Resident", focus: "Media", year: "2027", initials: "TB" },
];

export type AlumniProfile = {
  name: string;
  role: string;
  company: string;
  era: string;
  initials: string;
};

export const ALUMNI_SPOTLIGHT: AlumniProfile[] = [
  { name: "Ryan Laverty", role: "Founder", company: "Arist", era: "President 2018", initials: "RL" },
  { name: "Jake Ross", role: "Founder", company: "Build You Marketing", era: "President 2022", initials: "JR" },
  { name: "Andrew Foley", role: "Founder", company: "eTower", era: "Class of 2001", initials: "AF" },
  { name: "IdeaPaint Team", role: "Founders", company: "IdeaPaint", era: "Early residents", initials: "IP" },
  { name: "Dylan Zajac", role: "Founder", company: "Computers4People", era: "Alumni", initials: "DZ" },
  { name: "Community Builders", role: "Operators", company: "100+ ventures", era: "2001–today", initials: "ET" },
];

export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  initials: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ryan Laverty",
    role: "President 2018",
    company: "Founder of Arist",
    quote:
      "eTower completely changed my life and is a core reason I'm where I am today. From meeting my cofounders, to all of my best friends, to countless mentors and supporters, I genuinely don't want to know where I'd be without it.",
    initials: "RL",
  },
  {
    name: "Jake Ross",
    role: "President 2022",
    company: "Founder of Build You Marketing",
    quote:
      "I wouldn't be an entrepreneur without eTower. The community pushes me every single day to become a better version of myself and an improved business person. It was an honor to lead this community.",
    initials: "JR",
  },
  {
    name: "Kirk McKinney",
    role: "Current Resident",
    company: "Founder of Junk Teens",
    quote:
      "eTower is a community for entrepreneurs to learn and grow together on their entrepreneurial endeavors. Business is the ideas, the systems, and the people — and I learned that from being here.",
    initials: "KM",
  },
  {
    name: "Anastacia Yefimenko",
    role: "Current Resident",
    company: "Founder of Elcove",
    quote:
      "eTower is my family away from home. The entrepreneurship journey can be lonely and the support from eTower is amazing.",
    initials: "AY",
  },
];

export type StoryMilestone = {
  num: string;
  title: string;
  body: string;
};

export const STORY_MILESTONES: StoryMilestone[] = [
  {
    num: "01",
    title: "The Founding",
    body: 'Founded in 2001 by Andrew Foley — "What if we created a live-in incubator of the best entrepreneurial minds on campus?" The first Babson living-learning community was born on Van Winkle Hall.',
  },
  {
    num: "02",
    title: "The Establishment",
    body: "IdeaPaint emerged from early residents. A 2004 retreat formalized the mission: a community of students committed to becoming successful entrepreneurs.",
  },
  {
    num: "05",
    title: "The Growth Era",
    body: "Outward expansion with the Young Entrepreneurs Conference (YEC) and ePitch — Babson's biggest student-run pitch event to date.",
  },
  {
    num: "07",
    title: "Post-Covid",
    body: "Celebrating 20+ years with an Alumni Gala and renewed in-person community — an example of what's possible when like-minded students grow together.",
  },
];

export type JoinPillar = {
  title: string;
  description: string;
};

export const JOIN_PILLARS: JoinPillar[] = [
  {
    title: "Collaborative Community",
    description: "Live and work alongside passionate entrepreneurs",
  },
  {
    title: "Innovation Hub",
    description: "Access to resources, mentorship, and funding opportunities",
  },
  {
    title: "Powerful Network",
    description: "Connect with successful alumni and industry leaders",
  },
  {
    title: "Growth Focused",
    description: "Structured programs to accelerate your startup journey",
  },
];

export const ETOWER_OUTLETS = {
  sectionTitle: "eTower Outlets",
  clothing: {
    status: "COMING SOON",
    title: "ETOWER CLOTHING COLLECTION",
  },
  megaphone: {
    title: "MEGAPHONE",
    description:
      "The networking hub of Babson where startups connect with VCs, potential talent, and the people who matter. Where deals get made and teams get built.",
    cta: "JOIN MEGAPHONE",
    href: `mailto:${ETOWER.email}?subject=Join%20Megaphone`,
  },
  cafe: {
    title: "etower café",
    description:
      "A weekly Friday space for founders to work, connect, and caffeinate. Reserve a spot at the main table, a sofa chair, the couch, or the window standing desk. 9AM–2PM at Van Winkle C2.",
    cta: "RSVP AT CAFÉ",
    href: `mailto:${ETOWER.email}?subject=Caf%C3%A9%20RSVP`,
  },
} as const;

export type SocialPost = {
  caption: string;
  likes: number;
  comments: number;
};

export const SOCIAL_POSTS: SocialPost[] = [
  {
    caption: "Late night brainstorming sessions in eTower! #entrepreneurlife #innovation",
    likes: 127,
    comments: 23,
  },
  {
    caption: "Amazing speaker event with industry leaders sharing their insights #networking #startup",
    likes: 89,
    comments: 15,
  },
  {
    caption: "Celebrating another successful startup launch from our community! #success #community",
    likes: 156,
    comments: 31,
  },
  {
    caption: "Building the future together, one idea at a time #teamwork #etower",
    likes: 94,
    comments: 18,
  },
];

/** Column exit directions */
export const INTRO_COLUMN_DIRECTIONS = [
  "up",
  "down",
  "up",
  "down",
  "up",
  "down",
  "up",
  "down",
] as const;

export type IntroColumnDirection = (typeof INTRO_COLUMN_DIRECTIONS)[number];

export type HeroGalleryBusiness = {
  id: string;
  name: string;
  /** Local company logo from /public/logos */
  logo: string;
  /** Product / brand photo matching the company */
  image: string;
  /** Shown if logo image fails to load */
  fallbackInitials: string;
};

/** Lifestyle / team photos from /public/logos/pics — paired to ventures where possible */
const VENTURE_PICS: Record<string, string> = {
  "junk-teens": "/logos/pics/jteens.png",
  "sunu-body": "/logos/pics/Sunubody.png",
  empower: "/logos/pics/Esports.png",
  "desi-eats": "/logos/pics/desieats.png",
  arcangel: "/logos/pics/arcangel.png",
};

const GALLERY_FILL_IMAGES = [
  "/logos/pics/jteens.png",
  "/logos/pics/Sunubody.png",
  "/logos/pics/Esports.png",
  "/logos/pics/desieats.png",
  "/logos/pics/arcangel.png",
];

/** 5×5 hero mosaic — frontal logos over cropped pics from /logos/pics */
export const HERO_GALLERY_BUSINESSES: HeroGalleryBusiness[] = Array.from({ length: 25 }, (_, i) => {
  const venture = COMMUNITY_VENTURES[i % COMMUNITY_VENTURES.length];
  return {
    id: `${venture.id}-${i}`,
    name: venture.name,
    logo: venture.logo,
    image: VENTURE_PICS[venture.id] ?? GALLERY_FILL_IMAGES[i % GALLERY_FILL_IMAGES.length],
    fallbackInitials: venture.initial,
  };
});
