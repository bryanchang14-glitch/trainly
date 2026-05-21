import Link from "next/link";
import { sgd } from "@/lib/utils";

type CoachCardData = {
  slug: string;
  headline: string;
  tagline: string;
  heroImageUrl: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  vibeTags: string;
  formats: string;
  user: { name: string; location: string | null; avatarUrl: string | null };
  specialties: { specialty: { name: string; icon: string } }[];
};

export function CoachCard({ coach }: { coach: CoachCardData }) {
  const vibe = coach.vibeTags.split(",").slice(0, 3);
  const formats = coach.formats.split(",");
  return (
    <Link
      href={`/coaches/${coach.slug}`}
      className="group card overflow-hidden hover:shadow-lift transition flex flex-col"
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition duration-500"
          style={{ backgroundImage: `url(${coach.heroImageUrl})` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {coach.specialties.slice(0, 2).map((s) => (
            <span key={s.specialty.name} className="chip bg-white/95 backdrop-blur text-[11px]">
              <span>{s.specialty.icon}</span>
              {s.specialty.name}
            </span>
          ))}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {coach.user.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coach.user.avatarUrl} className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="" />
          )}
          <div className="text-white drop-shadow">
            <div className="font-semibold text-sm leading-tight">{coach.user.name}</div>
            <div className="text-xs opacity-90">📍 {coach.user.location}</div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="font-medium text-ink-900 leading-snug">{coach.headline}</div>
        <p className="text-sm text-ink-600 mt-1 line-clamp-2">{coach.tagline}</p>

        <div className="mt-3 flex flex-wrap gap-1">
          {vibe.map((v) => (
            <span key={v} className="chip-sage text-[10px]">
              {v}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-ink-700">
            <span className="text-coral-500">★</span>
            <span className="font-semibold">{coach.rating.toFixed(2)}</span>
            <span className="text-ink-500">({coach.reviewCount})</span>
          </div>
          <div className="text-ink-900 font-semibold">
            {sgd(coach.hourlyRate)}
            <span className="text-ink-500 font-normal">/session</span>
          </div>
        </div>
        <div className="mt-2 flex gap-1 text-[10px] text-ink-500">
          {formats.includes("HOME") && <span>🏠 Home</span>}
          {formats.includes("GYM") && <span>🏋️ Gym</span>}
          {formats.includes("OUTDOOR") && <span>🌳 Outdoor</span>}
          {formats.includes("VIRTUAL") && <span>💻 Virtual</span>}
          {formats.includes("STUDIO") && <span>🧘 Studio</span>}
        </div>
      </div>
    </Link>
  );
}
