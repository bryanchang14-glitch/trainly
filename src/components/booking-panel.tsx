"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sgd, formatDate, formatTime } from "@/lib/utils";
import { FORMAT_LABELS } from "@/lib/types";
import { createBooking, sendMessage } from "@/app/actions";

type Package = {
  id: string;
  name: string;
  sessions: number;
  priceSGD: number;
  description: string;
  isMonthly: boolean;
};

export function BookingPanel({
  coachId,
  coachName,
  coachUserId,
  packages,
  hourlyRate,
  formats,
  isLoggedIn,
}: {
  coachId: string;
  coachName: string;
  coachUserId: string;
  packages: Package[];
  hourlyRate: number;
  formats: string[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [pkgId, setPkgId] = useState<string | null>(packages[0]?.id ?? null);
  const [format, setFormat] = useState(formats[0]);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState("08:00");
  const [note, setNote] = useState("");
  const [showConfirm, setShowConfirm] = useState<null | { id: string; startsAt: Date }>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selected = packages.find((p) => p.id === pkgId);
  const price = selected?.priceSGD ?? hourlyRate;

  async function submit() {
    setError(null);
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    const startsAt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(startsAt.getTime()) || startsAt < new Date()) {
      setError("Pick a future date and time.");
      return;
    }
    start(async () => {
      const res = await createBooking({
        coachId,
        packageId: pkgId,
        startsAt: startsAt.toISOString(),
        format,
        locationNote: note,
        priceSGD: price,
      });
      if ("error" in res) {
        setError(res.error);
      } else {
        setShowConfirm({ id: res.id, startsAt });
      }
    });
  }

  async function sendQuickMsg() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!msg.trim()) return;
    start(async () => {
      await sendMessage({ recipientId: coachUserId, body: msg });
      setMsg("");
      router.push("/chat");
    });
  }

  if (showConfirm) {
    return (
      <div className="mt-6 rounded-2xl bg-sage-50 border border-sage-200 p-5 text-sage-900">
        <div className="text-2xl">✅</div>
        <div className="font-display text-xl font-semibold mt-1">Booking request sent!</div>
        <p className="text-sm mt-1">
          {coachName} typically replies in under an hour. We've sent them a notification.
        </p>
        <div className="mt-3 text-sm">
          <div><strong>{formatDate(showConfirm.startsAt)}</strong> at <strong>{formatTime(showConfirm.startsAt)}</strong></div>
          <div>{FORMAT_LABELS[format]?.icon} {FORMAT_LABELS[format]?.label}</div>
          <div>{sgd(price)}</div>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/dashboard" className="btn-primary">View dashboard</Link>
          <button className="btn-outline" onClick={() => setShowConfirm(null)}>Book another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div>
        <label className="label">Package</label>
        <div className="grid gap-2">
          {packages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPkgId(p.id)}
              className={`text-left rounded-xl border p-3 transition ${
                pkgId === p.id ? "border-sage-500 bg-sage-50" : "border-ink-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-baseline">
                <div className="font-medium text-sm">{p.name}</div>
                <div className="font-semibold">{sgd(p.priceSGD)}</div>
              </div>
              <div className="text-xs text-ink-600">{p.description}</div>
              <div className="text-[10px] text-ink-500 mt-1">
                {p.sessions} session{p.sessions > 1 ? "s" : ""} · {sgd(Math.round(p.priceSGD / p.sessions))} each
                {p.isMonthly && " · monthly"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Date</label>
          <input type="date" className="input" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label text-xs">Time</label>
          <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label text-xs">Format</label>
        <div className="flex flex-wrap gap-1">
          {formats.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={`chip text-xs ${format === f ? "bg-ink-900 text-cream" : ""}`}
            >
              {FORMAT_LABELS[f]?.icon} {FORMAT_LABELS[f]?.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label text-xs">Notes for {coachName.split(" ")[0]} (optional)</label>
        <textarea
          rows={2}
          className="input"
          placeholder="Anything they should know? Injuries, goals, parking notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && <div className="text-xs text-coral-700 bg-coral-50 rounded px-3 py-2">{error}</div>}

      <button className="btn-coral w-full" onClick={submit} disabled={pending}>
        {pending ? "Sending…" : `Request booking · ${sgd(price)}`}
      </button>

      <div className="pt-3 border-t border-ink-100">
        <label className="label text-xs">Quick message instead</label>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder={`Say hi to ${coachName.split(" ")[0]}`}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
          <button className="btn-outline" onClick={sendQuickMsg} disabled={pending || !msg.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
