import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sgd, parseJson, timeAgo } from "@/lib/utils";
import { FORMAT_LABELS, type Cert, type Socials } from "@/lib/types";
import { BookingPanel } from "@/components/booking-panel";
import { getSession } from "@/lib/auth";

export default async function CoachDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const coach = await prisma.coach.findUnique({
    where: { slug },
    include: {
      user: true,
      specialties: { include: { specialty: true } },
      packages: { orderBy: { sessions: "asc" } },
      reviews: { include: { author: true }, orderBy: { createdAt: "desc" }, take: 6 },
    },
  });
  if (!coach) notFound();

  const certs = parseJson<Cert[]>(coach.certifications, []);
  const socials = parseJson<Socials>(coach.socials, {});
  const gallery = parseJson<string[]>(coach.galleryUrls, []);
  const vibe = coach.vibeTags.split(",");
  const formats = coach.formats.split(",");
  const session = await getSession();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mb-10">
        <div className="relative aspect-[16/10] lg:aspect-auto rounded-3xl overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${coach.heroImageUrl})` }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
            <div className="flex items-center gap-3">
              {coach.user.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coach.user.avatarUrl} className="w-14 h-14 rounded-full border-2 border-white object-cover" alt="" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-3xl font-semibold">{coach.user.name}</span>
                  {coach.isVerified && (
                    <span className="chip bg-sage-500/90 text-white border-0">✓ Verified</span>
                  )}
                </div>
                <div className="text-sm opacity-90">📍 {coach.user.location} · ⭐ {coach.rating.toFixed(2)} ({coach.reviewCount} reviews)</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {coach.specialties.map((s) => (
                <span key={s.specialty.name} className="chip bg-white/90 text-ink-800 border-0">
                  {s.specialty.icon} {s.specialty.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm text-ink-500">Starting at</div>
          <div className="font-display text-4xl font-semibold">{sgd(coach.hourlyRate)}<span className="text-base text-ink-500 font-normal">/session</span></div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {formats.map((f) => (
              <span key={f} className="chip text-xs">
                {FORMAT_LABELS[f]?.icon} {FORMAT_LABELS[f]?.label}
              </span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat n={`${coach.yearsExperience}+`} l="years" />
            <Stat n={String(coach.sessionCount)} l="sessions" />
            <Stat n={`${coach.responseTimeMin}m`} l="replies" />
          </div>
          <BookingPanel
            coachId={coach.id}
            coachName={coach.user.name}
            packages={coach.packages.map((p) => ({
              id: p.id,
              name: p.name,
              sessions: p.sessions,
              priceSGD: p.priceSGD,
              description: p.description,
              isMonthly: p.isMonthly,
            }))}
            hourlyRate={coach.hourlyRate}
            formats={formats}
            isLoggedIn={!!session && session.role === "CLIENT"}
            coachUserId={coach.userId}
          />
        </div>
      </div>

      {/* Body */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <div className="space-y-10">
          {/* About */}
          <section>
            <h2 className="section-title mb-3">{coach.headline}</h2>
            <p className="text-ink-700 leading-relaxed text-lg italic">"{coach.tagline}"</p>
            <p className="text-ink-700 leading-relaxed mt-4 whitespace-pre-line">{coach.longBio}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {vibe.map((v) => (
                <span key={v} className="chip-sage">{v}</span>
              ))}
            </div>
          </section>

          {/* Gallery */}
          {gallery.length > 0 && (
            <section>
              <h3 className="font-display text-xl font-semibold mb-3">From the gym & beyond</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {gallery.map((g, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-cover bg-center rounded-2xl"
                    style={{ backgroundImage: `url(${g})` }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          <section>
            <h3 className="font-display text-xl font-semibold mb-3">Certifications & training</h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {certs.map((c, i) => (
                <li key={i} className="card p-4 flex gap-3 items-start">
                  <div className="text-2xl">📜</div>
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-ink-500">{c.issuer} · {c.year}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Reviews */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">Reviews</h3>
              <div className="text-sm text-ink-600">
                <span className="text-coral-500">★</span> {coach.rating.toFixed(2)} · {coach.reviewCount} reviews
              </div>
            </div>
            <div className="space-y-3">
              {coach.reviews.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center gap-3">
                    {r.author.avatarUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.author.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{r.author.name}</div>
                      <div className="text-xs text-ink-500">{timeAgo(r.createdAt)}</div>
                    </div>
                    <div className="text-sm">
                      {"★".repeat(r.rating)}<span className="text-ink-300">{"★".repeat(5 - r.rating)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-ink-700 mt-2">{r.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          {/* Languages & socials */}
          <div className="card p-5">
            <div className="font-medium mb-2">Languages</div>
            <div className="text-sm text-ink-700">{coach.languages.replaceAll(",", " · ")}</div>
          </div>
          {(socials.instagram || socials.tiktok || socials.youtube) && (
            <div className="card p-5">
              <div className="font-medium mb-2">Follow {coach.user.name.split(" ")[0]}</div>
              <div className="space-y-1.5 text-sm">
                {socials.instagram && <div>📷 Instagram: <span className="text-sage-700">{socials.instagram}</span></div>}
                {socials.tiktok && <div>🎵 TikTok: <span className="text-sage-700">{socials.tiktok}</span></div>}
                {socials.youtube && <div>📺 YouTube: <span className="text-sage-700">{socials.youtube}</span></div>}
              </div>
            </div>
          )}
          <div className="card p-5 bg-sage-50 border-sage-200">
            <div className="font-medium mb-2">🛡️ Trainly trust layer</div>
            <ul className="text-xs text-sage-800 space-y-1">
              <li>· ID & cert verified</li>
              <li>· S$1M session insurance</li>
              <li>· 48-hr first-session refund</li>
              <li>· In-app messaging only — no phone numbers exchanged before booking</li>
            </ul>
          </div>
          <Link href="/coaches" className="block text-sm text-center text-ink-600 hover:text-ink-900">
            ← Back to all coaches
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="bg-cream rounded-xl py-2">
      <div className="font-semibold">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{l}</div>
    </div>
  );
}
