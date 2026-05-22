import { prisma } from "./prisma";

export type HeroStat = { n: string; label: string };
export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };

export type Brand = {
  name: string;
  tagline: string;
  logoUrl: string; // empty string falls back to the gradient T mark
};

export type HeroFloatCard = {
  name: string;
  detail: string;
  chips: string[];
};

export type Hero = {
  chip: string;
  title1: string;
  title2: string;
  lead: string;
  primaryCta: string;
  primaryCtaHref: string;
  secondaryCta: string;
  secondaryCtaHref: string;
  floatCard: HeroFloatCard;
  floatBadge: string;
};

export type SimpleSection = {
  chip: string;
  title: string;
  sub: string;
};

export type Step = { n: string; title: string; body: string };
export type HowItWorks = {
  chip: string;
  title: string;
  steps: Step[];
};

export type TrustCard = { icon: string; title: string; body: string };
export type Trust = {
  chip: string;
  title: string;
  body: string;
  bullets: string[];
  cards: TrustCard[];
};

export type CoachCta = {
  chip: string;
  title: string;
  body: string;
  primaryCta: string;
  primaryCtaHref: string;
  secondaryCta: string;
  secondaryCtaHref: string;
};

export type SiteContent = {
  brand: Brand;
  hero: Hero;
  heroStats: HeroStat[];
  specialties: SimpleSection;
  featured: SimpleSection;
  howItWorks: HowItWorks;
  trust: Trust;
  coachCta: CoachCta;
  footer: {
    clients: FooterColumn;
    coaches: FooterColumn;
    company: FooterColumn;
  };
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  brand: {
    name: "Trainly",
    tagline: "All coaches. One place.",
    logoUrl: "", // set via /owner/site → Brand → "Logo image URL"
  },
  hero: {
    chip: "🇸🇬 Now live in Singapore",
    title1: "Find your coach.",
    title2: "Train how you live.",
    lead:
      "Trainly is Singapore's verified marketplace for freelance fitness and wellness professionals — personal trainers, physios, yoga teachers, nutritionists and more, bookable at home, online, or outdoors. No gym contracts. No middlemen.",
    primaryCta: "Start AI Match →",
    primaryCtaHref: "/match",
    secondaryCta: "Browse coaches",
    secondaryCtaHref: "/coaches",
    floatCard: {
      name: "Aisha booked for tomorrow",
      detail: "7:00am · Home visit · S$95",
      chips: ["Confirmed", "🏠 Tiong Bahru"],
    },
    floatBadge: "12 coaches free in the next hour",
  },
  heroStats: [
    { n: "2,400+", label: "verified coaches" },
    { n: "4.9★", label: "avg rating" },
    { n: "48hr", label: "money-back guarantee" },
  ],
  specialties: {
    chip: "What we cover",
    title: "Every kind of movement",
    sub: "",
  },
  featured: {
    chip: "⭐ Hand-picked",
    title: "Featured coaches this week",
    sub: "Verified, reviewed, ready to train.",
  },
  howItWorks: {
    chip: "How Trainly works",
    title: "Three steps from doom-scrolling to your first session.",
    steps: [
      {
        n: "01",
        title: "Match",
        body: "Take our 60-second quiz or filter by specialty, location, vibe and price. AI Match shortlists in seconds.",
      },
      {
        n: "02",
        title: "Chat & book",
        body: "Free 5-minute consult with any coach. Instant booking when you're ready. Pay per session, package, or monthly.",
      },
      {
        n: "03",
        title: "Train",
        body: "At home, in a park, at a partner gym, or virtual. We track your progress and you cancel anytime.",
      },
    ],
  },
  trust: {
    chip: "Trust & safety",
    title: "Vetted like we'd send our own mum.",
    body:
      "Every Trainly coach passes ID verification, certification checks (NASM, ACE, MOH-registered physio, RYT yoga), a 1-on-1 onboarding interview, and an annual background screen. Sessions are covered by S$1M liability insurance, and your first session is fully refundable if it isn't a fit.",
    bullets: [
      "Singpass MyInfo identity check",
      "Certification cross-verified with issuing body",
      "Two-sided reviews with booking proof",
      "SOS button on home-visit sessions",
      "48-hour first-session money-back guarantee",
    ],
    cards: [
      { icon: "🛡️", title: "S$1M insurance", body: "Every verified session covered." },
      { icon: "🪪", title: "Singpass verified", body: "No bots, no catfish coaches." },
      { icon: "📋", title: "Certs checked", body: "Direct from the issuing body." },
      { icon: "↩️", title: "48-hr refund", body: "First session, no questions." },
    ],
  },
  coachCta: {
    chip: "For coaches",
    title: "Stop hustling for clients. Start coaching them.",
    body:
      "Trainly handles discovery, bookings, payments, and reviews — so you can spend your time on the work that actually moves people. Keep 80–88% of every booking. No website needed.",
    primaryCta: "Become a Trainly coach",
    primaryCtaHref: "/signup",
    secondaryCta: "See how it works",
    secondaryCtaHref: "/coach/about",
  },
  footer: {
    clients: {
      title: "For clients",
      links: [
        { label: "Browse coaches", href: "/coaches" },
        { label: "AI Match", href: "/match" },
        { label: "Trainly+", href: "/coaches" },
        { label: "Gift cards", href: "/coaches" },
      ],
    },
    coaches: {
      title: "For coaches",
      links: [
        { label: "Become a Trainly coach", href: "/signup" },
        { label: "Coach Academy", href: "/coaches" },
        { label: "Insurance & trust", href: "/" },
        { label: "Pricing", href: "/" },
      ],
    },
    company: {
      title: "Company",
      links: [
        { label: "About", href: "/" },
        { label: "Press", href: "/" },
        { label: "Careers", href: "/" },
        { label: "Contact", href: "/" },
      ],
    },
  },
};

/** Read site content from DB, merging with defaults so missing keys don't crash the UI. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { id: "singleton" } });
    if (!row) return DEFAULT_SITE_CONTENT;
    const parsed = JSON.parse(row.data) as Partial<SiteContent>;
    return mergeWithDefaults(parsed);
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

function mergeWithDefaults(p: Partial<SiteContent>): SiteContent {
  const d = DEFAULT_SITE_CONTENT;
  return {
    brand: { ...d.brand, ...(p.brand ?? {}) },
    hero: {
      ...d.hero,
      ...(p.hero ?? {}),
      floatCard: { ...d.hero.floatCard, ...(p.hero?.floatCard ?? {}) },
    },
    heroStats: p.heroStats?.length ? p.heroStats : d.heroStats,
    specialties: { ...d.specialties, ...(p.specialties ?? {}) },
    featured: { ...d.featured, ...(p.featured ?? {}) },
    howItWorks: {
      ...d.howItWorks,
      ...(p.howItWorks ?? {}),
      steps: p.howItWorks?.steps?.length ? p.howItWorks.steps : d.howItWorks.steps,
    },
    trust: {
      ...d.trust,
      ...(p.trust ?? {}),
      bullets: p.trust?.bullets?.length ? p.trust.bullets : d.trust.bullets,
      cards: p.trust?.cards?.length ? p.trust.cards : d.trust.cards,
    },
    coachCta: { ...d.coachCta, ...(p.coachCta ?? {}) },
    footer: {
      clients: p.footer?.clients ?? d.footer.clients,
      coaches: p.footer?.coaches ?? d.footer.coaches,
      company: p.footer?.company ?? d.footer.company,
    },
  };
}

/** Upsert site content. */
export async function setSiteContent(content: SiteContent) {
  await prisma.siteContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", data: JSON.stringify(content) },
    update: { data: JSON.stringify(content) },
  });
}
