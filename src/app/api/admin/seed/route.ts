import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-shot seed endpoint. Hit it once after deploy to populate the DB.
// Protected with a token from AUTH_SECRET — call like:
//   curl https://YOUR-SITE/api/admin/seed?token=YOUR_AUTH_SECRET

const SPECIALTIES = [
  { name: "Personal Training", slug: "personal-training", icon: "💪" },
  { name: "Yoga", slug: "yoga", icon: "🧘" },
  { name: "Pilates", slug: "pilates", icon: "🤸" },
  { name: "Physiotherapy", slug: "physiotherapy", icon: "🩺" },
  { name: "Nutrition", slug: "nutrition", icon: "🥗" },
  { name: "Sports Coaching", slug: "sports-coaching", icon: "⚽" },
  { name: "Rehabilitation", slug: "rehabilitation", icon: "🦴" },
  { name: "Mobility & Stretch", slug: "mobility", icon: "🤲" },
  { name: "Boxing & MMA", slug: "boxing", icon: "🥊" },
  { name: "Senior Fitness", slug: "senior-fitness", icon: "🌿" },
  { name: "Pre/Postnatal", slug: "prenatal", icon: "🤰" },
  { name: "Kids & Youth", slug: "kids", icon: "🧒" },
];

const COACHES = [
  {
    email: "aisha@trainly.com", name: "Aisha Rahman", slug: "aisha-rahman", location: "Tanjong Pagar",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    hero: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&h=800&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800","https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800","https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800"],
    headline: "Vinyasa & Pilates for busy professionals", tagline: "Calm strength, every session.",
    longBio: "After a decade in finance, I left the bank to teach yoga full-time. I specialise in 45-minute sessions you can do before work in your condo gym or living room — strong on form, gentle on your nervous system. Trained in Rishikesh, certified through Yoga Alliance (RYT-500) and Stott Pilates.",
    years: 8, hourly: 95, rating: 4.9, reviews: 142, sessions: 980, responseMin: 12,
    languages: "English,Bahasa Melayu", formats: "HOME,VIRTUAL,STUDIO",
    vibe: "Calm,Mindful,Encouraging,Patient,Premium",
    certs: [{ name: "RYT-500", issuer: "Yoga Alliance", year: 2017 },{ name: "Stott Pilates Matwork", issuer: "Merrithew", year: 2019 },{ name: "Prenatal Yoga Specialist", issuer: "YogaFit", year: 2021 }],
    socials: { instagram: "@aisha.flows", tiktok: "@aisha.flows" }, specialties: ["yoga","pilates","prenatal"],
    featured: true, homeVisit: true,
    packages: [{ name: "Single Session", sessions: 1, price: 95, desc: "Try-it-out session, anywhere." },{ name: "Monthly Glow", sessions: 8, price: 680, desc: "Twice-weekly for steady progress.", monthly: true },{ name: "Reset Package", sessions: 12, price: 990, desc: "Best value — 6 weeks of transformation." }],
  },
  {
    email: "ravi@trainly.com", name: "Ravi Kumar", slug: "ravi-kumar", location: "Bishan",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop",
    hero: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800","https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"],
    headline: "Strength coaching for beginners and athletes", tagline: "Train hard. Train smart. No ego.",
    longBio: "Ex-SAF Physical Training Instructor turned strength coach. I work with everyone from total beginners terrified of barbells to recreational athletes prepping for IPPT or Spartan races. My sessions are direct and structured — we measure, we progress, we have fun.",
    years: 11, hourly: 110, rating: 4.95, reviews: 218, sessions: 1640, responseMin: 8,
    languages: "English,Tamil,Mandarin (basic)", formats: "GYM,HOME,OUTDOOR",
    vibe: "Direct,Motivating,Disciplined,Tough-love,Friendly",
    certs: [{ name: "NSCA-CSCS", issuer: "NSCA", year: 2016 },{ name: "Precision Nutrition L1", issuer: "PN", year: 2020 },{ name: "FMS Level 2", issuer: "FMS", year: 2018 }],
    socials: { instagram: "@coachravi.sg", tiktok: "@coachravi.sg", youtube: "Coach Ravi SG" },
    specialties: ["personal-training","sports-coaching","nutrition"], featured: true, homeVisit: true,
    packages: [{ name: "Single Session", sessions: 1, price: 110, desc: "Assessment + first workout." },{ name: "IPPT Crash 6", sessions: 6, price: 600, desc: "Six-session sprint to your IPPT max." },{ name: "Strength Foundations", sessions: 12, price: 1140, desc: "12 weeks, programmed and tracked." }],
  },
  {
    email: "mei@trainly.com", name: "Dr. Mei Tan", slug: "mei-tan", location: "Tampines",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    hero: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800","https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800"],
    headline: "MOH-registered physiotherapist & rehab specialist", tagline: "Move better. Heal smarter.",
    longBio: "12 years in clinical physio across SGH and private practice. I treat everything from post-op knee rehab and frozen shoulders to chronic lower back pain. Home visits available across the east. I'll always give you a clear diagnosis, a clear plan, and an honest timeline.",
    years: 12, hourly: 140, rating: 4.97, reviews: 305, sessions: 2100, responseMin: 25,
    languages: "English,Mandarin,Hokkien", formats: "HOME,VIRTUAL,STUDIO",
    vibe: "Professional,Warm,Thorough,Patient,Evidence-based",
    certs: [{ name: "B.Sc Physiotherapy", issuer: "NUS", year: 2012 },{ name: "MOH Registered Physiotherapist", issuer: "AHPC", year: 2013 },{ name: "APPI Pilates Rehab", issuer: "APPI", year: 2019 }],
    socials: { instagram: "@drmei.physio" }, specialties: ["physiotherapy","rehabilitation","senior-fitness","mobility"],
    featured: true, homeVisit: true,
    packages: [{ name: "Initial Assessment", sessions: 1, price: 180, desc: "60-min assessment + treatment plan." },{ name: "Recovery Block", sessions: 6, price: 780, desc: "Most rehab goals reach milestone here." },{ name: "Senior Mobility Monthly", sessions: 8, price: 960, desc: "For parents/grandparents.", monthly: true }],
  },
  {
    email: "javier@trainly.com", name: "Javier Lim", slug: "javier-lim", location: "East Coast",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    hero: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1200&h=800&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800","https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800"],
    headline: "Beach bootcamps & outdoor running coach", tagline: "Vitamin D, salt air, no excuses.",
    longBio: "Outdoor sessions at East Coast Park year-round. From your first 5K to your sub-1:45 half marathon, I'll get you there with structured training, gait analysis, and pacing strategy. Small group bootcamps Saturday mornings.",
    years: 6, hourly: 85, rating: 4.85, reviews: 96, sessions: 540, responseMin: 15,
    languages: "English,Mandarin", formats: "OUTDOOR,VIRTUAL",
    vibe: "Energetic,Fun,Group-friendly,Motivating,Outdoorsy",
    certs: [{ name: "ACE Personal Trainer", issuer: "ACE", year: 2019 },{ name: "RRCA Running Coach", issuer: "RRCA", year: 2021 }],
    socials: { instagram: "@javier.runs", tiktok: "@javier.runs" }, specialties: ["personal-training","sports-coaching"], homeVisit: false,
    packages: [{ name: "Single Session", sessions: 1, price: 85, desc: "Park session, one-on-one." },{ name: "5K Starter", sessions: 8, price: 600, desc: "Couch to 5K in 8 weeks." },{ name: "Half-Marathon Build", sessions: 16, price: 1280, desc: "16 weeks, race-day ready." }],
  },
  {
    email: "priya@trainly.com", name: "Priya Nair", slug: "priya-nair", location: "Holland Village",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    hero: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=800&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800","https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800"],
    headline: "Registered dietitian — sustainable nutrition", tagline: "No crash diets. No guilt. Just food that works.",
    longBio: "I help busy Singaporeans build eating habits that survive hawker lunches, business dinners, and 2am cravings. Specialise in PCOS, prediabetes reversal, and sports nutrition. Virtual consults globally; home visits for pantry audits in central SG.",
    years: 9, hourly: 130, rating: 4.92, reviews: 174, sessions: 820, responseMin: 20,
    languages: "English,Malayalam,Hindi", formats: "VIRTUAL,HOME",
    vibe: "Warm,Non-judgmental,Evidence-based,Pragmatic,Detail-oriented",
    certs: [{ name: "M.Sc Clinical Nutrition", issuer: "King's College London", year: 2015 },{ name: "Registered Dietitian (SNDA)", issuer: "SNDA", year: 2016 }],
    socials: { instagram: "@priya.eats.smart" }, specialties: ["nutrition"], homeVisit: true,
    packages: [{ name: "Initial Consult", sessions: 1, price: 180, desc: "75-min assessment + plan." },{ name: "8-Week Reset", sessions: 8, price: 960, desc: "Weekly accountability + plan iteration." }],
  },
  {
    email: "daniel@trainly.com", name: "Daniel Goh", slug: "daniel-goh", location: "Bukit Timah",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    hero: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&h=800&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800"],
    headline: "Youth football & multi-sport coaching", tagline: "Confident kids. Competent athletes.",
    longBio: "MOE-registered coach, 7 years working with kids 5-16. Private sessions or small groups at school fields and condo facilities. Focus is on long-term athletic development — agility, coordination, confidence — not just one sport.",
    years: 7, hourly: 80, rating: 4.88, reviews: 112, sessions: 720, responseMin: 18,
    languages: "English,Mandarin", formats: "OUTDOOR,GYM",
    vibe: "Fun,Patient,Kid-friendly,Energetic,Structured",
    certs: [{ name: "FAS Football Coaching C-License", issuer: "FAS", year: 2018 },{ name: "MOE CRC cleared", issuer: "MOE", year: 2024 },{ name: "Youth Strength & Conditioning", issuer: "NSCA", year: 2022 }],
    socials: { instagram: "@coachdaniel.kids" }, specialties: ["kids","sports-coaching"], homeVisit: false,
    packages: [{ name: "Single Session", sessions: 1, price: 80, desc: "1-on-1 with your child." },{ name: "Term Package", sessions: 10, price: 720, desc: "Weekly across a school term." }],
  },
  {
    email: "nadia@trainly.com", name: "Nadia Ismail", slug: "nadia-ismail", location: "Punggol",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    hero: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=800&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800","https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=800"],
    headline: "Boxing & women's strength training", tagline: "Strong. Skilled. Unbothered.",
    longBio: "Former national amateur boxer. I run private boxing fundamentals + strength sessions in my Punggol home studio or your condo gym. Women's-only group classes on Sundays. No experience needed — just bring water and a willingness to learn.",
    years: 9, hourly: 100, rating: 4.93, reviews: 156, sessions: 1080, responseMin: 14,
    languages: "English,Bahasa Melayu", formats: "STUDIO,GYM,HOME",
    vibe: "Empowering,Direct,Skill-focused,Women-friendly,Fun",
    certs: [{ name: "England Boxing L2 Coach", issuer: "England Boxing", year: 2020 },{ name: "NASM-CPT", issuer: "NASM", year: 2018 }],
    socials: { instagram: "@nadia.boxes", tiktok: "@nadia.boxes" }, specialties: ["boxing","personal-training"], homeVisit: true,
    packages: [{ name: "Single Session", sessions: 1, price: 100, desc: "Wrap, glove, learn the basics." },{ name: "Boxing Foundations", sessions: 8, price: 720, desc: "8 weeks to a clean jab-cross-hook." }],
  },
  {
    email: "william@trainly.com", name: "William Teo", slug: "william-teo", location: "Marine Parade",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop",
    hero: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800"],
    headline: "Senior fitness & fall-prevention specialist", tagline: "Stronger today than yesterday. At any age.",
    longBio: "I work with adults 60+, focusing on strength, balance, and confidence. Most of my clients started with me after a fall, a surgery, or a doctor's nudge. We meet at your home or void deck — no gyms, no intimidation, no judgment. Pace is yours.",
    years: 14, hourly: 90, rating: 4.96, reviews: 198, sessions: 1450, responseMin: 22,
    languages: "English,Mandarin,Hokkien", formats: "HOME,OUTDOOR",
    vibe: "Patient,Gentle,Respectful,Encouraging,Experienced",
    certs: [{ name: "ACSM Exercise Physiologist", issuer: "ACSM", year: 2014 },{ name: "Functional Aging Specialist", issuer: "FAI", year: 2019 }],
    socials: { instagram: "@william.seniors" }, specialties: ["senior-fitness","rehabilitation","mobility"], homeVisit: true,
    packages: [{ name: "Single Session", sessions: 1, price: 90, desc: "Assessment + first session." },{ name: "Confidence Builder", sessions: 12, price: 1020, desc: "12 weeks to steadier steps." }],
  },
];

const CLIENTS = [
  { email: "sarah@demo.com", name: "Sarah Lim", location: "Tiong Bahru", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
  { email: "marcus@demo.com", name: "Marcus Tan", location: "Bishan", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token || token !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Idempotent: if already seeded, skip.
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return NextResponse.json({ ok: true, message: "Already seeded.", users: userCount });
  }

  const specialtiesMap = new Map<string, string>();
  for (const s of SPECIALTIES) {
    const created = await prisma.specialty.create({ data: s });
    specialtiesMap.set(s.slug, created.id);
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  const clientUsers: { id: string }[] = [];
  for (const c of CLIENTS) {
    const u = await prisma.user.create({
      data: { email: c.email, passwordHash, name: c.name, role: "CLIENT", avatarUrl: c.avatar, location: c.location },
    });
    clientUsers.push({ id: u.id });
  }

  const coachRecords: { coachId: string; userId: string }[] = [];
  for (const c of COACHES) {
    const user = await prisma.user.create({
      data: { email: c.email, passwordHash, name: c.name, role: "COACH", avatarUrl: c.avatar, location: c.location, bio: c.tagline },
    });
    const coach = await prisma.coach.create({
      data: {
        userId: user.id, slug: c.slug, headline: c.headline, tagline: c.tagline, longBio: c.longBio,
        heroImageUrl: c.hero, galleryUrls: JSON.stringify(c.gallery),
        yearsExperience: c.years, hourlyRate: c.hourly, rating: c.rating, reviewCount: c.reviews,
        sessionCount: c.sessions, responseTimeMin: c.responseMin,
        languages: c.languages, formats: c.formats, vibeTags: c.vibe,
        certifications: JSON.stringify(c.certs), socials: JSON.stringify(c.socials),
        isFeatured: c.featured ?? false, acceptsHomeVisit: c.homeVisit ?? true,
      },
    });
    for (const slug of c.specialties) {
      const sid = specialtiesMap.get(slug);
      if (sid) await prisma.coachSpecialty.create({ data: { coachId: coach.id, specialtyId: sid } });
    }
    for (const p of c.packages) {
      await prisma.package.create({
        data: { coachId: coach.id, name: p.name, sessions: p.sessions, priceSGD: p.price, description: p.desc, isMonthly: p.monthly ?? false },
      });
    }
    for (let weekday = 1; weekday <= 6; weekday++) {
      await prisma.availability.create({ data: { coachId: coach.id, weekday, startMin: 7 * 60, endMin: 21 * 60 } });
    }
    coachRecords.push({ coachId: coach.id, userId: user.id });
  }

  const reviewBodies = [
    "Genuinely changed how I think about training. Patient, structured, and clearly cares.",
    "Booked a single session, ended up doing the 12-pack. Worth every dollar.",
    "Punctual, professional, knows their stuff. Highly recommend.",
    "Made me feel comfortable from minute one. No judgment, just results.",
    "Travelled to my condo at 6:30am twice a week. Game-changer for a working parent.",
    "Best decision I made this year. Finally consistent for the first time.",
    "Sessions are tough but they fly by. I look forward to them now.",
    "My back pain is 80% better in 6 weeks. Honest, evidence-based, kind.",
  ];
  for (const cr of coachRecords) {
    const n = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < n; i++) {
      await prisma.review.create({
        data: {
          coachId: cr.coachId,
          authorId: clientUsers[i % clientUsers.length].id,
          rating: 5 - (i === 2 ? 1 : 0),
          body: reviewBodies[(i * 3) % reviewBodies.length],
        },
      });
    }
  }

  // Demo bookings + messages for the headline client
  const sarah = clientUsers[0];
  const now = new Date();
  const future = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); future.setHours(8, 0, 0, 0);
  await prisma.booking.create({
    data: { clientId: sarah.id, coachId: coachRecords[0].coachId, startsAt: future, endsAt: new Date(future.getTime() + 3600000),
      format: "HOME", locationNote: "Tiong Bahru — Eng Hoon St, condo gym", status: "CONFIRMED", priceSGD: 95, notes: "Looking forward to it!" },
  });
  const past = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); past.setHours(7, 30, 0, 0);
  await prisma.booking.create({
    data: { clientId: sarah.id, coachId: coachRecords[1].coachId, startsAt: past, endsAt: new Date(past.getTime() + 3600000),
      format: "GYM", locationNote: "Bishan ActiveSG", status: "COMPLETED", priceSGD: 110 },
  });
  const pending = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); pending.setHours(18, 0, 0, 0);
  await prisma.booking.create({
    data: { clientId: sarah.id, coachId: coachRecords[2].coachId, startsAt: pending, endsAt: new Date(pending.getTime() + 3600000),
      format: "HOME", locationNote: "Tiong Bahru — lower back assessment", status: "PENDING", priceSGD: 180,
      notes: "Persistent lower back tightness from desk work." },
  });

  await prisma.message.createMany({
    data: [
      { senderId: sarah.id, recipientId: coachRecords[0].userId, body: "Hi Aisha! I'm interested in your monthly package. Do you have weekday morning slots?", createdAt: new Date(now.getTime() - 2 * 86400000) },
      { senderId: coachRecords[0].userId, recipientId: sarah.id, body: "Hi Sarah! Yes, I have Tue/Thu 7am free starting next week. Want me to send a tentative booking?", createdAt: new Date(now.getTime() - 2 * 86400000 + 720000) },
      { senderId: sarah.id, recipientId: coachRecords[0].userId, body: "Yes please 🙏", createdAt: new Date(now.getTime() - 2 * 86400000 + 840000) },
    ],
  });

  for (let i = 0; i < 6; i++) {
    await prisma.progressEntry.create({
      data: { userId: sarah.id, metric: "weight", value: 62 - i * 0.3, unit: "kg",
        recordedAt: new Date(now.getTime() - (6 - i) * 7 * 86400000) },
    });
    await prisma.progressEntry.create({
      data: { userId: sarah.id, metric: "energy", value: 5 + i * 0.5, unit: "/10",
        recordedAt: new Date(now.getTime() - (6 - i) * 7 * 86400000) },
    });
  }
  await prisma.favourite.create({ data: { userId: sarah.id, coachId: coachRecords[0].coachId } });
  await prisma.favourite.create({ data: { userId: sarah.id, coachId: coachRecords[2].coachId } });

  return NextResponse.json({
    ok: true,
    seeded: { specialties: SPECIALTIES.length, coaches: COACHES.length, clients: CLIENTS.length },
    demoLogins: { client: "sarah@demo.com", coach: "aisha@trainly.com", password: "password123" },
  });
}
