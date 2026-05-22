"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { sgd } from "@/lib/utils";

type Coach = {
  id: string;
  slug: string;
  headline: string;
  tagline: string;
  heroImageUrl: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  languages: string;
  formats: string;
  vibeTags: string;
  acceptsHomeVisit: boolean;
  user: { name: string; location: string | null; avatarUrl: string | null };
  specialties: { specialty: { name: string; icon: string; slug: string } }[];
};

type Specialty = { name: string; slug: string; icon: string };

type Answers = {
  goal?: string;
  specialty?: string;
  format?: string;
  budget?: number;
  experience?: string;
  vibe?: string;
  schedule?: string;
  language?: string;
  location?: string;
  pace?: string;
};

type Question = {
  key: keyof Answers;
  title: string;
  sub?: string;
  type?: "slider";
  min?: number;
  max?: number;
  step?: number;
  default?: number;
  options?: { v: string; l: string }[];
};

const QUESTIONS: Question[] = [
  {
    key: "goal",
    title: "What's your main goal?",
    sub: "Pick the closest fit — we'll narrow from here.",
    options: [
      { v: "weight-loss", l: "Lose weight" },
      { v: "strength", l: "Get stronger" },
      { v: "rehab", l: "Recover from injury / pain" },
      { v: "flexibility", l: "Move better / flexibility" },
      { v: "skill", l: "Learn a sport / skill" },
      { v: "lifestyle", l: "General wellness & habits" },
    ],
  },
  {
    key: "specialty",
    title: "Which kind of coach feels right?",
    sub: "Don't overthink it.",
    options: [
      { v: "personal-training", l: "💪 Personal trainer" },
      { v: "yoga", l: "🧘 Yoga teacher" },
      { v: "pilates", l: "🤸 Pilates instructor" },
      { v: "physiotherapy", l: "🩺 Physiotherapist" },
      { v: "nutrition", l: "🥗 Nutritionist" },
      { v: "boxing", l: "🥊 Boxing coach" },
      { v: "sports-coaching", l: "⚽ Sports / running coach" },
      { v: "senior-fitness", l: "🌿 Senior / mobility specialist" },
      { v: "kids", l: "🧒 Kids & youth coach" },
      { v: "any", l: "Not sure — show me options" },
    ],
  },
  {
    key: "format",
    title: "Where do you want to train?",
    sub: "You can change this later.",
    options: [
      { v: "HOME", l: "🏠 At home / condo gym" },
      { v: "GYM", l: "🏋️ Public or partner gym" },
      { v: "OUTDOOR", l: "🌳 Outdoors (park, beach)" },
      { v: "VIRTUAL", l: "💻 Virtual — anywhere" },
      { v: "STUDIO", l: "🧘 Coach's studio" },
    ],
  },
  {
    key: "experience",
    title: "How experienced are you?",
    sub: "We'll match your level.",
    options: [
      { v: "beginner", l: "Total beginner" },
      { v: "casual", l: "Casual — I move occasionally" },
      { v: "intermediate", l: "Intermediate" },
      { v: "advanced", l: "Advanced / athlete" },
    ],
  },
  {
    key: "vibe",
    title: "What coaching style do you respond to?",
    sub: "This is the magic question.",
    options: [
      { v: "Tough-love", l: "🔥 Push me — tough love" },
      { v: "Patient", l: "🌱 Patient and gentle" },
      { v: "Direct", l: "🎯 Direct and structured" },
      { v: "Fun", l: "🎉 Fun and high-energy" },
      { v: "Mindful", l: "🧘 Calm and mindful" },
      { v: "Evidence-based", l: "📚 Scientific and analytical" },
    ],
  },
  {
    key: "budget",
    title: "What's your per-session budget?",
    sub: "Slide left or right.",
    type: "slider",
    min: 60,
    max: 200,
    step: 5,
    default: 110,
  },
  {
    key: "schedule",
    title: "When do you want to train?",
    sub: "Most common time.",
    options: [
      { v: "early-am", l: "🌅 Early morning (6–9am)" },
      { v: "midday", l: "🌞 Midday (10am–2pm)" },
      { v: "evening", l: "🌆 Evening (5–8pm)" },
      { v: "weekend", l: "📅 Weekends only" },
      { v: "flexible", l: "🤷 I'm flexible" },
    ],
  },
  {
    key: "language",
    title: "Preferred language?",
    options: [
      { v: "English", l: "English" },
      { v: "Mandarin", l: "Mandarin" },
      { v: "Bahasa Melayu", l: "Bahasa Melayu" },
      { v: "Tamil", l: "Tamil" },
      { v: "any", l: "No preference" },
    ],
  },
  {
    key: "location",
    title: "Which area of Singapore?",
    sub: "We'll prioritise nearby coaches.",
    options: [
      { v: "central", l: "Central (Tanjong Pagar, Tiong Bahru, Orchard)" },
      { v: "east", l: "East (Tampines, Bedok, East Coast)" },
      { v: "west", l: "West (Clementi, Jurong, Holland)" },
      { v: "north", l: "North (Yishun, Woodlands, Bishan)" },
      { v: "northeast", l: "Northeast (Punggol, Sengkang, Hougang)" },
      { v: "anywhere", l: "Anywhere / virtual" },
    ],
  },
  {
    key: "pace",
    title: "How committed are you ready to be?",
    sub: "No wrong answer — we'll meet you there.",
    options: [
      { v: "trial", l: "Try one session first" },
      { v: "weekly", l: "1× per week" },
      { v: "twice", l: "2× per week" },
      { v: "intensive", l: "3+ per week / intensive" },
    ],
  },
];

const LOCATION_MAP: Record<string, string[]> = {
  central: ["Tanjong Pagar", "Tiong Bahru", "Orchard", "Holland", "Bukit Timah"],
  east: ["Tampines", "Bedok", "East Coast", "Marine Parade", "Pasir Ris"],
  west: ["Clementi", "Jurong", "Holland", "Queenstown"],
  north: ["Yishun", "Woodlands", "Bishan", "Ang Mo Kio"],
  northeast: ["Punggol", "Sengkang", "Hougang", "Serangoon"],
};

function score(c: Coach, a: Answers): { score: number; reasons: string[] } {
  let s = 0;
  const reasons: string[] = [];

  // Specialty
  if (a.specialty && a.specialty !== "any") {
    const has = c.specialties.some((x) => x.specialty.slug === a.specialty);
    if (has) {
      s += 30;
      reasons.push(`Specialises in ${c.specialties.find((x) => x.specialty.slug === a.specialty)?.specialty.name}`);
    }
  } else s += 5;

  // Goal → specialty inference
  const goalSpecialtyMap: Record<string, string[]> = {
    "weight-loss": ["personal-training", "nutrition", "boxing"],
    strength: ["personal-training", "boxing"],
    rehab: ["physiotherapy", "rehabilitation"],
    flexibility: ["yoga", "pilates", "mobility"],
    skill: ["sports-coaching", "boxing"],
    lifestyle: ["yoga", "personal-training", "nutrition"],
  };
  if (a.goal && goalSpecialtyMap[a.goal]) {
    const has = c.specialties.some((x) => goalSpecialtyMap[a.goal!].includes(x.specialty.slug));
    if (has) s += 12;
  }

  // Format
  if (a.format && c.formats.includes(a.format)) {
    s += 15;
    reasons.push(`Offers ${a.format.toLowerCase()} sessions`);
  }

  // Budget
  if (a.budget) {
    if (c.hourlyRate <= a.budget) {
      s += 12;
    } else {
      const over = c.hourlyRate - a.budget;
      s -= Math.min(over / 5, 15);
    }
  }

  // Vibe
  if (a.vibe) {
    const vibes = c.vibeTags.toLowerCase();
    if (vibes.includes(a.vibe.toLowerCase())) {
      s += 18;
      reasons.push(`Coaching style: ${a.vibe.toLowerCase()}`);
    }
  }

  // Language
  if (a.language && a.language !== "any") {
    if (c.languages.toLowerCase().includes(a.language.toLowerCase())) {
      s += 6;
      reasons.push(`Teaches in ${a.language}`);
    }
  }

  // Location
  if (a.location && a.location !== "anywhere" && LOCATION_MAP[a.location]) {
    const loc = (c.user.location || "").toLowerCase();
    const hit = LOCATION_MAP[a.location].some((n) => loc.includes(n.toLowerCase()));
    if (hit) {
      s += 14;
      reasons.push(`Based in ${c.user.location}`);
    } else if (c.acceptsHomeVisit) {
      s += 4;
    }
  }

  // Experience pairing
  if (a.experience === "beginner") {
    if (c.vibeTags.toLowerCase().includes("patient") || c.vibeTags.toLowerCase().includes("friendly")) {
      s += 6;
      reasons.push("Beginner-friendly");
    }
  }
  if (a.experience === "advanced" && c.yearsExperience >= 8) {
    s += 6;
  }

  // Rating
  s += c.rating * 2;

  return { score: Math.round(s), reasons: reasons.slice(0, 3) };
}

export function MatchWizard({ coaches, specialties: _ }: { coaches: Coach[]; specialties: Specialty[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  const total = QUESTIONS.length;
  const q = QUESTIONS[step];
  const progress = (step / total) * 100;

  function pick(v: string | number) {
    setAnswers((a) => ({ ...a, [q.key]: v as any }));
    if (step === total - 1) {
      setDone(true);
    } else {
      setStep(step + 1);
    }
  }

  const results = useMemo(() => {
    if (!done) return [];
    const scored = coaches.map((c) => ({ coach: c, ...score(c, answers) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5);
  }, [done, coaches, answers]);

  if (done) {
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center bg-gradient-to-br from-sage-50 to-coral-50 border-sage-200">
          <div className="text-5xl mb-2">✨</div>
          <h2 className="font-display text-2xl font-semibold">Your top matches</h2>
          <p className="text-ink-600 mt-1">Ranked by fit across specialty, vibe, budget, and location.</p>
        </div>

        {results.map((r, i) => (
          <Link
            key={r.coach.id}
            href={`/coaches/${r.coach.slug}`}
            className="card p-4 flex gap-4 hover:shadow-lift transition fade-up items-start"
          >
            <div
              className="w-24 h-24 rounded-2xl bg-cover bg-center shrink-0"
              style={{ backgroundImage: `url(${r.coach.heroImageUrl})` }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-semibold">{r.coach.user.name}</span>
                {i === 0 && <span className="chip-coral text-[10px]">★ Best match</span>}
              </div>
              <div className="text-sm text-ink-600">{r.coach.headline}</div>
              <div className="text-xs text-ink-500 mt-0.5">📍 {r.coach.user.location} · ⭐ {r.coach.rating.toFixed(2)} ({r.coach.reviewCount})</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.reasons.map((reason) => (
                  <span key={reason} className="chip-sage text-[10px]">✓ {reason}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-ink-500">From</div>
              <div className="font-semibold">{sgd(r.coach.hourlyRate)}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-sage-700 font-medium">
                Match {r.score}%
              </div>
            </div>
          </Link>
        ))}

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => {
              setDone(false);
              setStep(0);
              setAnswers({});
            }}
            className="btn-outline"
          >
            Restart
          </button>
          <Link href="/coaches" className="btn-primary">
            Browse all coaches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 md:p-10">
      {/* progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-ink-500 mb-2">
          <span>
            Question {step + 1} of {total}
          </span>
          <span>{Math.round(progress)}% done</span>
        </div>
        <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage-500 to-coral-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="font-display text-2xl font-semibold">{q.title}</h2>
      {q.sub && <p className="text-ink-600 mt-1">{q.sub}</p>}

      <div className="mt-6">
        {"type" in q && q.type === "slider" ? (
          <SliderInput
            min={q.min!}
            max={q.max!}
            step={q.step!}
            defaultValue={(answers.budget as number) ?? q.default!}
            onSubmit={(v) => pick(v)}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {q.options!.map((o) => (
              <button
                key={o.v}
                onClick={() => pick(o.v)}
                className="text-left rounded-xl border border-ink-200 bg-white px-4 py-3 hover:border-sage-500 hover:bg-sage-50 transition"
              >
                {o.l}
              </button>
            ))}
          </div>
        )}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="btn-ghost mt-4 text-xs"
        >
          ← Back
        </button>
      )}
    </div>
  );
}

function SliderInput({
  min,
  max,
  step,
  defaultValue,
  onSubmit,
}: {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  onSubmit: (v: number) => void;
}) {
  const [v, setV] = useState(defaultValue);
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div className="font-display text-4xl font-semibold">{sgd(v)}</div>
        <div className="text-sm text-ink-500">per session</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => setV(parseInt(e.target.value))}
        className="w-full accent-sage-600"
      />
      <div className="flex justify-between text-xs text-ink-500 mt-1">
        <span>{sgd(min)}</span>
        <span>{sgd(max)}+</span>
      </div>
      <button className="btn-primary mt-6 w-full" onClick={() => onSubmit(v)}>
        Continue
      </button>
    </div>
  );
}
