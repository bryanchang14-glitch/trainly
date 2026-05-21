"use client";

import { useState, useTransition } from "react";
import { logProgress } from "@/app/actions";

export function LogProgressForm() {
  const [metric, setMetric] = useState("weight");
  const [value, setValue] = useState("");
  const [pending, start] = useTransition();
  const [ok, setOk] = useState(false);

  const meta: Record<string, { unit: string; placeholder: string }> = {
    weight: { unit: "kg", placeholder: "62.5" },
    energy: { unit: "/10", placeholder: "7" },
    mood: { unit: "/10", placeholder: "8" },
    sleep: { unit: "hours", placeholder: "7.5" },
  };

  function submit() {
    const v = parseFloat(value);
    if (Number.isNaN(v)) return;
    start(async () => {
      await logProgress({ metric, value: v, unit: meta[metric].unit });
      setValue("");
      setOk(true);
      setTimeout(() => setOk(false), 1500);
    });
  }

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="label text-xs">Metric</label>
        <select className="input py-1.5" value={metric} onChange={(e) => setMetric(e.target.value)}>
          <option value="weight">Weight</option>
          <option value="energy">Energy</option>
          <option value="mood">Mood</option>
          <option value="sleep">Sleep</option>
        </select>
      </div>
      <div className="flex-1">
        <label className="label text-xs">Value ({meta[metric].unit})</label>
        <input
          className="input py-1.5"
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={meta[metric].placeholder}
        />
      </div>
      <button className="btn-sage" onClick={submit} disabled={pending || !value}>
        {ok ? "✓" : "Log"}
      </button>
    </div>
  );
}
