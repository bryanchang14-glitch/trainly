"use client";

import { useState, useTransition } from "react";
import { updateCoachProfile } from "@/app/actions";

type Initial = {
  headline: string;
  tagline: string;
  longBio: string;
  hourlyRate: number;
  vibeTags: string;
  languages: string;
  formats: string;
};

const FORMAT_OPTIONS = ["HOME", "GYM", "OUTDOOR", "VIRTUAL", "STUDIO"];

export function CoachProfileEditor({ initial }: { initial: Initial }) {
  const [s, setS] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggleFormat(f: string) {
    const set = new Set(s.formats.split(","));
    if (set.has(f)) set.delete(f);
    else set.add(f);
    setS({ ...s, formats: Array.from(set).filter(Boolean).join(",") });
  }

  function save() {
    start(async () => {
      await updateCoachProfile(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">Headline</label>
        <input className="input py-2 text-sm" value={s.headline} onChange={(e) => setS({ ...s, headline: e.target.value })} />
      </div>
      <div>
        <label className="label text-xs">Tagline</label>
        <input className="input py-2 text-sm" value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} />
      </div>
      <div>
        <label className="label text-xs">Bio</label>
        <textarea className="input py-2 text-sm" rows={4} value={s.longBio} onChange={(e) => setS({ ...s, longBio: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Hourly (S$)</label>
          <input
            className="input py-2 text-sm"
            type="number"
            value={s.hourlyRate}
            onChange={(e) => setS({ ...s, hourlyRate: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="label text-xs">Languages (CSV)</label>
          <input className="input py-2 text-sm" value={s.languages} onChange={(e) => setS({ ...s, languages: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label text-xs">Vibe tags (CSV)</label>
        <input className="input py-2 text-sm" value={s.vibeTags} onChange={(e) => setS({ ...s, vibeTags: e.target.value })} />
      </div>
      <div>
        <label className="label text-xs">Session formats</label>
        <div className="flex flex-wrap gap-1.5">
          {FORMAT_OPTIONS.map((f) => {
            const on = s.formats.split(",").includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFormat(f)}
                className={`chip text-xs ${on ? "bg-sage-600 text-white" : "bg-white border border-ink-200"}`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>
      <button className="btn-primary w-full" disabled={pending} onClick={save}>
        {saved ? "✓ Saved" : pending ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
