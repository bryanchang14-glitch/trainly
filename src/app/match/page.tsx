import { prisma } from "@/lib/prisma";
import { MatchWizard } from "@/components/match-wizard";

export default async function MatchPage() {
  const coaches = await prisma.coach.findMany({
    include: { user: true, specialties: { include: { specialty: true } } },
  });
  const specialties = await prisma.specialty.findMany();

  // Strip Prisma classes; pass plain JSON to client
  const data = coaches.map((c) => ({
    id: c.id,
    slug: c.slug,
    headline: c.headline,
    tagline: c.tagline,
    heroImageUrl: c.heroImageUrl,
    hourlyRate: c.hourlyRate,
    rating: c.rating,
    reviewCount: c.reviewCount,
    yearsExperience: c.yearsExperience,
    languages: c.languages,
    formats: c.formats,
    vibeTags: c.vibeTags,
    acceptsHomeVisit: c.acceptsHomeVisit,
    user: { name: c.user.name, location: c.user.location, avatarUrl: c.user.avatarUrl },
    specialties: c.specialties.map((s) => ({ specialty: { name: s.specialty.name, icon: s.specialty.icon, slug: s.specialty.slug } })),
  }));

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <div className="chip-coral mx-auto inline-flex mb-3">AI Match</div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold">Find your coach in 60 seconds.</h1>
        <p className="text-ink-600 mt-3">Ten quick questions. We'll do the matching.</p>
      </div>
      <MatchWizard coaches={data} specialties={specialties.map((s) => ({ name: s.name, slug: s.slug, icon: s.icon }))} />
    </div>
  );
}
