import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CoachCard } from "@/components/coach-card";
import { sgd } from "@/lib/utils";
import { getSiteContent } from "@/lib/site-content";
import { BrandMark } from "@/components/brand-mark";

export default async function HomePage() {
  const featured = await prisma.coach.findMany({
    where: { isFeatured: true },
    include: {
      user: true,
      specialties: { include: { specialty: true } },
    },
    take: 3,
  });
  const specialties = await prisma.specialty.findMany({ take: 12 });
  const site = await getSiteContent();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cream via-sage-50 to-coral-50" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-coral-200/40 blur-3xl -z-10 float" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-sage-300/40 blur-3xl -z-10 float" />

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="fade-up">
            {/* Trainly brand block */}
            <div className="flex items-center gap-3 mb-6">
              <BrandMark logoUrl={site.brand.logoUrl} size="lg" />
              <div>
                <div className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-none text-ink-900">
                  {site.brand.name}
                </div>
                <div className="text-xs md:text-sm text-ink-500 mt-1 tracking-wide uppercase">
                  {site.brand.tagline}
                </div>
              </div>
            </div>

            <div className="chip-sage mb-4">{site.hero.chip}</div>
            <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-ink-900">
              {site.hero.title1} <br />
              <span className="text-sage-700">{site.hero.title2}</span>
            </h1>
            <p className="mt-5 text-lg text-ink-700 max-w-xl whitespace-pre-line">{site.hero.lead}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={site.hero.primaryCtaHref} className="btn-coral">
                {site.hero.primaryCta}
              </Link>
              <Link href={site.hero.secondaryCtaHref} className="btn-outline">
                {site.hero.secondaryCta}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-ink-600">
              {site.heroStats.map((s, i) => (
                <Stat key={i} n={s.n} label={s.label} />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sage-200 to-coral-200 rotate-3 -z-10" />
            <div
              className="rounded-3xl aspect-[4/5] bg-cover bg-center shadow-lift"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1000&h=1250&fit=crop)",
              }}
            />
            <div className="absolute -bottom-6 -left-6 card p-4 max-w-[260px] fade-up">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop"
                  className="w-10 h-10 rounded-full object-cover"
                  alt=""
                />
                <div>
                  <div className="font-medium text-sm">{site.hero.floatCard.name}</div>
                  <div className="text-xs text-ink-500">{site.hero.floatCard.detail}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {site.hero.floatCard.chips.map((c, i) => (
                  <span key={i} className={i === 0 ? "chip-sage text-[10px]" : "chip text-[10px]"}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute -top-4 -right-4 card p-3 fade-up">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                <span className="font-medium">{site.hero.floatBadge}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            {site.specialties.chip && <div className="chip mb-3">{site.specialties.chip}</div>}
            <h2 className="section-title">{site.specialties.title}</h2>
            {site.specialties.sub && <p className="text-ink-600 mt-2">{site.specialties.sub}</p>}
          </div>
          <Link href="/coaches" className="text-sm text-sage-700 font-medium hover:underline hidden md:inline">
            See all coaches →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {specialties.map((s) => (
            <Link
              key={s.id}
              href={`/coaches?specialty=${s.slug}`}
              className="card p-4 hover:shadow-lift transition flex flex-col gap-2"
            >
              <div className="text-3xl">{s.icon}</div>
              <div className="font-medium text-sm">{s.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured coaches */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            {site.featured.chip && <div className="chip-coral mb-3">{site.featured.chip}</div>}
            <h2 className="section-title">{site.featured.title}</h2>
            {site.featured.sub && <p className="text-ink-600 mt-2">{site.featured.sub}</p>}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((c) => (
            <CoachCard key={c.id} coach={c as any} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sage-700 text-cream py-20 relative grain">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="chip bg-sage-600 text-sage-50 mb-3">{site.howItWorks.chip}</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold">{site.howItWorks.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {site.howItWorks.steps.map((s, i) => (
              <Step key={i} n={s.n} title={s.title} body={s.body} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="chip-sage mb-3">{site.trust.chip}</div>
            <h2 className="section-title">{site.trust.title}</h2>
            <p className="text-ink-700 mt-4 leading-relaxed whitespace-pre-line">{site.trust.body}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {site.trust.bullets.map((b, i) => (
                <Bullet key={i}>{b}</Bullet>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {site.trust.cards.map((c, i) => (
              <div key={i} className={`card p-5 ${i % 2 === 1 ? "translate-y-6" : ""}`}>
                <div className="text-3xl">{c.icon}</div>
                <div className="font-medium mt-2">{c.title}</div>
                <p className="text-sm text-ink-600 mt-1">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coach CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-coral-500 to-coral-700 text-white p-10 md:p-16 relative overflow-hidden grain">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="chip bg-white/15 text-white border border-white/20 mb-4">{site.coachCta.chip}</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold">{site.coachCta.title}</h2>
            <p className="mt-4 text-white/90 text-lg whitespace-pre-line">{site.coachCta.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={site.coachCta.primaryCtaHref} className="btn bg-white text-coral-700 hover:bg-cream">
                {site.coachCta.primaryCta}
              </Link>
              <Link
                href={site.coachCta.secondaryCtaHref}
                className="btn bg-transparent border border-white/30 text-white hover:bg-white/10"
              >
                {site.coachCta.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold">{n}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="bg-sage-800/50 border border-sage-600/40 rounded-2xl p-6">
      <div className="font-display text-sm text-sage-200">{n}</div>
      <div className="font-display text-2xl font-semibold mt-2">{title}</div>
      <p className="text-sage-100/90 text-sm mt-2 leading-relaxed whitespace-pre-line">{body}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-1 w-4 h-4 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center text-[10px]">✓</span>
      <span className="text-ink-700">{children}</span>
    </li>
  );
}
