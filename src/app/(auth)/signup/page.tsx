"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "../actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signup, {});
  const [role, setRole] = useState<"CLIENT" | "COACH">("CLIENT");

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="card p-8 fade-up">
        <h1 className="font-display text-3xl font-semibold mb-1">Join Trainly</h1>
        <p className="text-ink-600 mb-6">Two minutes. No commitments.</p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setRole("CLIENT")}
            className={`rounded-xl border px-3 py-3 text-left ${
              role === "CLIENT" ? "border-sage-500 bg-sage-50" : "border-ink-200 bg-white"
            }`}
          >
            <div className="font-medium">I want to train</div>
            <div className="text-xs text-ink-600">Find your coach</div>
          </button>
          <button
            type="button"
            onClick={() => setRole("COACH")}
            className={`rounded-xl border px-3 py-3 text-left ${
              role === "COACH" ? "border-coral-500 bg-coral-50" : "border-ink-200 bg-white"
            }`}
          >
            <div className="font-medium">I'm a coach</div>
            <div className="text-xs text-ink-600">Grow your practice</div>
          </button>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="role" value={role} />
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input className="input" id="name" name="name" required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" required minLength={6} />
          </div>
          <div>
            <label className="label" htmlFor="location">Neighbourhood (Singapore)</label>
            <input className="input" id="location" name="location" placeholder="e.g. Tampines, Holland V" />
          </div>
          {state?.error && <p className="text-sm text-coral-700 bg-coral-50 rounded-lg px-3 py-2">{state.error}</p>}
          <button className="btn-primary w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-ink-600">
          Already have an account?{" "}
          <Link href="/login" className="text-sage-700 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
