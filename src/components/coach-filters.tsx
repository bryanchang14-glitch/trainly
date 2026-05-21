"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Specialty = { id: string; name: string; slug: string; icon: string };

export function CoachFilters({
  specialties,
  current,
}: {
  specialties: Specialty[];
  current: { specialty?: string; format?: string; q?: string; max?: string; sort?: string };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(current.q ?? "");

  function update(k: string, v: string | null) {
    const sp = new URLSearchParams(params.toString());
    if (v === null || v === "") sp.delete(k);
    else sp.set(k, v);
    start(() => router.push(`/coaches?${sp.toString()}`));
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    update("q", q);
  }

  const formats = [
    { id: "HOME", label: "🏠 Home" },
    { id: "GYM", label: "🏋️ Gym" },
    { id: "OUTDOOR", label: "🌳 Outdoor" },
    { id: "VIRTUAL", label: "💻 Virtual" },
    { id: "STUDIO", label: "🧘 Studio" },
  ];

  return (
    <div className="card p-4 mb-6 space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, location, vibe..."
          className="input flex-1"
        />
        <button className="btn-primary" disabled={pending}>
          Search
        </button>
      </form>

      <div className="-mx-2 px-2 overflow-x-auto scroll-shadow">
        <div className="flex gap-2 min-w-max">
          <FilterPill
            label="All specialties"
            active={!current.specialty}
            onClick={() => update("specialty", null)}
          />
          {specialties.map((s) => (
            <FilterPill
              key={s.slug}
              label={`${s.icon} ${s.name}`}
              active={current.specialty === s.slug}
              onClick={() => update("specialty", s.slug)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {formats.map((f) => (
            <FilterPill
              key={f.id}
              label={f.label}
              active={current.format === f.id}
              onClick={() => update("format", current.format === f.id ? null : f.id)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <label className="text-ink-700">Max price:</label>
          <select
            className="input w-auto py-1.5"
            value={current.max ?? ""}
            onChange={(e) => update("max", e.target.value || null)}
          >
            <option value="">Any</option>
            <option value="80">S$80</option>
            <option value="100">S$100</option>
            <option value="120">S$120</option>
            <option value="150">S$150</option>
            <option value="200">S$200</option>
          </select>
          <label className="text-ink-700 ml-2">Sort:</label>
          <select
            className="input w-auto py-1.5"
            value={current.sort ?? "rating"}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="rating">Top rated</option>
            <option value="experience">Most experienced</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium border transition ${
        active
          ? "bg-ink-900 text-cream border-ink-900"
          : "bg-white text-ink-700 border-ink-200 hover:border-ink-400"
      }`}
    >
      {label}
    </button>
  );
}
