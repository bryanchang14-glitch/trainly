import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CoachCard } from "@/components/coach-card";
import { CoachFilters } from "@/components/coach-filters";

type SP = { specialty?: string; format?: string; q?: string; max?: string; sort?: string };

export default async function CoachesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;

  const specialties = await prisma.specialty.findMany({ orderBy: { name: "asc" } });

  const where: any = {};
  if (sp.specialty) {
    where.specialties = { some: { specialty: { slug: sp.specialty } } };
  }
  if (sp.format) {
    where.formats = { contains: sp.format };
  }
  if (sp.q) {
    where.OR = [
      { headline: { contains: sp.q } },
      { tagline: { contains: sp.q } },
      { vibeTags: { contains: sp.q } },
      { user: { name: { contains: sp.q } } },
      { user: { location: { contains: sp.q } } },
    ];
  }
  if (sp.max) {
    const m = parseInt(sp.max);
    if (!Number.isNaN(m)) where.hourlyRate = { lte: m };
  }

  const orderBy =
    sp.sort === "price-asc"
      ? { hourlyRate: "asc" as const }
      : sp.sort === "price-desc"
      ? { hourlyRate: "desc" as const }
      : sp.sort === "experience"
      ? { yearsExperience: "desc" as const }
      : { rating: "desc" as const };

  const coaches = await prisma.coach.findMany({
    where,
    include: { user: true, specialties: { include: { specialty: true } } },
    orderBy,
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="section-title">Browse coaches</h1>
          <p className="text-ink-600 mt-1">{coaches.length} verified professionals available in Singapore.</p>
        </div>
        <Link href="/match" className="hidden md:inline-flex btn-coral">
          Use AI Match instead →
        </Link>
      </div>

      <CoachFilters specialties={specialties} current={sp} />

      {coaches.length === 0 ? (
        <div className="card p-10 text-center text-ink-600">
          No coaches match those filters yet.{" "}
          <Link href="/coaches" className="text-sage-700 font-medium">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((c) => (
            <CoachCard key={c.id} coach={c as any} />
          ))}
        </div>
      )}
    </div>
  );
}
