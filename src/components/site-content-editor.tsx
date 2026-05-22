"use client";

import { useState, useTransition } from "react";
import { updateSiteContent } from "@/app/actions";
import type {
  SiteContent,
  FooterColumn,
  HeroStat,
  Step,
  TrustCard,
} from "@/lib/site-content";

export function SiteContentEditor({ initial }: { initial: SiteContent }) {
  const [c, setC] = useState<SiteContent>(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [openSection, setOpenSection] = useState<string | null>("brand");

  function save() {
    setMsg(null);
    start(async () => {
      const res = await updateSiteContent(c);
      if ("error" in res) setMsg({ kind: "err", text: res.error });
      else setMsg({ kind: "ok", text: "Saved — refresh the homepage to see changes." });
      setTimeout(() => setMsg(null), 3500);
    });
  }

  // Field updater helper: deep merge a partial into a nested section
  function patch<K extends keyof SiteContent>(key: K, partial: Partial<SiteContent[K]>) {
    setC((prev) => ({ ...prev, [key]: { ...(prev[key] as object), ...partial } as SiteContent[K] }));
  }

  return (
    <div className="space-y-3">
      {/* Brand */}
      <Section
        id="brand"
        title="Brand"
        sub="Logo, name, and tagline"
        open={openSection === "brand"}
        onToggle={() => setOpenSection(openSection === "brand" ? null : "brand")}
      >
        <Field label="Brand name">
          <input
            className="input"
            value={c.brand.name}
            onChange={(e) => patch("brand", { name: e.target.value })}
          />
        </Field>
        <Field label="Tagline / sub-line">
          <input
            className="input"
            value={c.brand.tagline}
            onChange={(e) => patch("brand", { tagline: e.target.value })}
          />
        </Field>
        <Field
          label="Logo image URL"
          help="Use /trainly-logo.png if you saved the logo into the project's public/ folder, or paste a full URL like https://… Leave blank to use the gradient T fallback."
        >
          <input
            className="input"
            value={c.brand.logoUrl}
            onChange={(e) => patch("brand", { logoUrl: e.target.value })}
            placeholder="/trainly-logo.png"
          />
          {c.brand.logoUrl && (
            <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
              <span>Preview:</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.brand.logoUrl} alt="logo preview" className="w-10 h-10 rounded-xl object-cover border border-ink-200" />
            </div>
          )}
        </Field>
      </Section>

      {/* Hero */}
      <Section
        id="hero"
        title="Hero section"
        sub="The big block at the top of the homepage"
        open={openSection === "hero"}
        onToggle={() => setOpenSection(openSection === "hero" ? null : "hero")}
      >
        <Field label="Chip (small badge above the headline)">
          <input className="input" value={c.hero.chip} onChange={(e) => patch("hero", { chip: e.target.value })} />
        </Field>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Headline line 1">
            <input className="input" value={c.hero.title1} onChange={(e) => patch("hero", { title1: e.target.value })} />
          </Field>
          <Field label="Headline line 2 (coloured)">
            <input className="input" value={c.hero.title2} onChange={(e) => patch("hero", { title2: e.target.value })} />
          </Field>
        </div>
        <Field label="Lead paragraph">
          <textarea
            className="input"
            rows={4}
            value={c.hero.lead}
            onChange={(e) => patch("hero", { lead: e.target.value })}
          />
        </Field>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Primary button label">
            <input className="input" value={c.hero.primaryCta} onChange={(e) => patch("hero", { primaryCta: e.target.value })} />
          </Field>
          <Field label="Primary button link">
            <input className="input" value={c.hero.primaryCtaHref} onChange={(e) => patch("hero", { primaryCtaHref: e.target.value })} />
          </Field>
          <Field label="Secondary button label">
            <input className="input" value={c.hero.secondaryCta} onChange={(e) => patch("hero", { secondaryCta: e.target.value })} />
          </Field>
          <Field label="Secondary button link">
            <input className="input" value={c.hero.secondaryCtaHref} onChange={(e) => patch("hero", { secondaryCtaHref: e.target.value })} />
          </Field>
        </div>
        <div className="rounded-xl border border-ink-100 p-3 bg-cream/50 space-y-2">
          <div className="text-xs font-medium text-ink-700">Floating preview card (overlaid on hero image)</div>
          <Field label="Booking line — name">
            <input
              className="input py-1.5 text-sm"
              value={c.hero.floatCard.name}
              onChange={(e) => patch("hero", { floatCard: { ...c.hero.floatCard, name: e.target.value } })}
            />
          </Field>
          <Field label="Booking line — detail">
            <input
              className="input py-1.5 text-sm"
              value={c.hero.floatCard.detail}
              onChange={(e) => patch("hero", { floatCard: { ...c.hero.floatCard, detail: e.target.value } })}
            />
          </Field>
          <Field label="Chips (comma-separated, max 2)">
            <input
              className="input py-1.5 text-sm"
              value={c.hero.floatCard.chips.join(", ")}
              onChange={(e) =>
                patch("hero", {
                  floatCard: { ...c.hero.floatCard, chips: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) },
                })
              }
            />
          </Field>
          <Field label="Live badge (top-right pulse)">
            <input
              className="input py-1.5 text-sm"
              value={c.hero.floatBadge}
              onChange={(e) => patch("hero", { floatBadge: e.target.value })}
            />
          </Field>
        </div>
      </Section>

      {/* Stats */}
      <Section
        id="stats"
        title="Hero stats"
        sub="The 3 numbers under the hero CTA"
        open={openSection === "stats"}
        onToggle={() => setOpenSection(openSection === "stats" ? null : "stats")}
      >
        <StatListEditor stats={c.heroStats} onChange={(s) => setC({ ...c, heroStats: s })} />
      </Section>

      {/* Specialties */}
      <Section
        id="specialties"
        title='"Every kind of movement" section'
        sub="Heading above the 12 specialty tiles"
        open={openSection === "specialties"}
        onToggle={() => setOpenSection(openSection === "specialties" ? null : "specialties")}
      >
        <Field label="Chip">
          <input className="input" value={c.specialties.chip} onChange={(e) => patch("specialties", { chip: e.target.value })} />
        </Field>
        <Field label="Title">
          <input className="input" value={c.specialties.title} onChange={(e) => patch("specialties", { title: e.target.value })} />
        </Field>
        <Field label="Sub-line (optional)">
          <input className="input" value={c.specialties.sub} onChange={(e) => patch("specialties", { sub: e.target.value })} />
        </Field>
      </Section>

      {/* Featured */}
      <Section
        id="featured"
        title='"Featured coaches" section'
        sub="Heading above the 3 hand-picked coaches"
        open={openSection === "featured"}
        onToggle={() => setOpenSection(openSection === "featured" ? null : "featured")}
      >
        <Field label="Chip">
          <input className="input" value={c.featured.chip} onChange={(e) => patch("featured", { chip: e.target.value })} />
        </Field>
        <Field label="Title">
          <input className="input" value={c.featured.title} onChange={(e) => patch("featured", { title: e.target.value })} />
        </Field>
        <Field label="Sub-line">
          <input className="input" value={c.featured.sub} onChange={(e) => patch("featured", { sub: e.target.value })} />
        </Field>
      </Section>

      {/* How it works */}
      <Section
        id="howItWorks"
        title='"How Trainly works" section'
        sub="The dark sage 3-step block"
        open={openSection === "howItWorks"}
        onToggle={() => setOpenSection(openSection === "howItWorks" ? null : "howItWorks")}
      >
        <Field label="Chip">
          <input className="input" value={c.howItWorks.chip} onChange={(e) => patch("howItWorks", { chip: e.target.value })} />
        </Field>
        <Field label="Title">
          <input className="input" value={c.howItWorks.title} onChange={(e) => patch("howItWorks", { title: e.target.value })} />
        </Field>
        <StepListEditor steps={c.howItWorks.steps} onChange={(s) => patch("howItWorks", { steps: s })} />
      </Section>

      {/* Trust */}
      <Section
        id="trust"
        title='"Trust & safety" section'
        sub="Insurance, verification — the whole reassurance block"
        open={openSection === "trust"}
        onToggle={() => setOpenSection(openSection === "trust" ? null : "trust")}
      >
        <Field label="Chip">
          <input className="input" value={c.trust.chip} onChange={(e) => patch("trust", { chip: e.target.value })} />
        </Field>
        <Field label="Title">
          <input className="input" value={c.trust.title} onChange={(e) => patch("trust", { title: e.target.value })} />
        </Field>
        <Field label="Body paragraph">
          <textarea
            className="input"
            rows={4}
            value={c.trust.body}
            onChange={(e) => patch("trust", { body: e.target.value })}
          />
        </Field>
        <StringListEditor
          label="Bullets (with green checkmarks)"
          items={c.trust.bullets}
          onChange={(b) => patch("trust", { bullets: b })}
        />
        <TrustCardListEditor cards={c.trust.cards} onChange={(cards) => patch("trust", { cards })} />
      </Section>

      {/* Coach CTA */}
      <Section
        id="coachCta"
        title='"For coaches" CTA'
        sub="The big coral block near the bottom"
        open={openSection === "coachCta"}
        onToggle={() => setOpenSection(openSection === "coachCta" ? null : "coachCta")}
      >
        <Field label="Chip">
          <input className="input" value={c.coachCta.chip} onChange={(e) => patch("coachCta", { chip: e.target.value })} />
        </Field>
        <Field label="Title">
          <input className="input" value={c.coachCta.title} onChange={(e) => patch("coachCta", { title: e.target.value })} />
        </Field>
        <Field label="Body paragraph">
          <textarea
            className="input"
            rows={3}
            value={c.coachCta.body}
            onChange={(e) => patch("coachCta", { body: e.target.value })}
          />
        </Field>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Primary button label">
            <input className="input" value={c.coachCta.primaryCta} onChange={(e) => patch("coachCta", { primaryCta: e.target.value })} />
          </Field>
          <Field label="Primary button link">
            <input className="input" value={c.coachCta.primaryCtaHref} onChange={(e) => patch("coachCta", { primaryCtaHref: e.target.value })} />
          </Field>
          <Field label="Secondary button label">
            <input className="input" value={c.coachCta.secondaryCta} onChange={(e) => patch("coachCta", { secondaryCta: e.target.value })} />
          </Field>
          <Field label="Secondary button link">
            <input className="input" value={c.coachCta.secondaryCtaHref} onChange={(e) => patch("coachCta", { secondaryCtaHref: e.target.value })} />
          </Field>
        </div>
      </Section>

      {/* Footer */}
      <Section
        id="footer"
        title="Footer"
        sub="3 columns of links at the bottom of every page"
        open={openSection === "footer"}
        onToggle={() => setOpenSection(openSection === "footer" ? null : "footer")}
      >
        <div className="grid md:grid-cols-3 gap-4">
          <FooterColumnEditor col={c.footer.clients} onChange={(col) => patch("footer", { ...c.footer, clients: col })} />
          <FooterColumnEditor col={c.footer.coaches} onChange={(col) => patch("footer", { ...c.footer, coaches: col })} />
          <FooterColumnEditor col={c.footer.company} onChange={(col) => patch("footer", { ...c.footer, company: col })} />
        </div>
      </Section>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex items-center justify-end gap-3 z-10 pt-2">
        {msg && (
          <span className={`text-sm rounded-full px-3 py-1.5 ${msg.kind === "ok" ? "bg-sage-100 text-sage-800" : "bg-coral-100 text-coral-800"}`}>
            {msg.text}
          </span>
        )}
        <button onClick={save} disabled={pending} className="btn-coral shadow-lift">
          {pending ? "Saving…" : "Save all changes"}
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────────────────

function Section({
  title,
  sub,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  sub: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-cream/50 transition"
      >
        <div>
          <div className="font-display text-lg font-semibold">{title}</div>
          <div className="text-xs text-ink-500 mt-0.5">{sub}</div>
        </div>
        <span className={`text-ink-400 transition-transform ${open ? "rotate-90" : ""}`}>›</span>
      </button>
      {open && <div className="p-5 pt-1 border-t border-ink-100 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {help && <p className="text-[10px] text-ink-500 mt-1">{help}</p>}
    </div>
  );
}

function StatListEditor({ stats, onChange }: { stats: HeroStat[]; onChange: (s: HeroStat[]) => void }) {
  return (
    <div className="space-y-2">
      {stats.map((s, i) => (
        <div key={i} className="flex gap-2 items-end">
          <Field label="Number">
            <input
              className="input py-2 text-sm"
              value={s.n}
              onChange={(e) => {
                const next = [...stats];
                next[i] = { ...next[i], n: e.target.value };
                onChange(next);
              }}
              placeholder="2,400+"
            />
          </Field>
          <Field label="Label">
            <input
              className="input py-2 text-sm"
              value={s.label}
              onChange={(e) => {
                const next = [...stats];
                next[i] = { ...next[i], label: e.target.value };
                onChange(next);
              }}
              placeholder="verified coaches"
            />
          </Field>
          <button
            onClick={() => onChange(stats.filter((_, idx) => idx !== i))}
            className="text-coral-700 hover:bg-coral-50 rounded px-2 py-2 text-xs"
            disabled={stats.length <= 1}
          >
            Remove
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...stats, { n: "", label: "" }])} className="btn-ghost text-xs">
        + Add stat
      </button>
    </div>
  );
}

function StepListEditor({ steps, onChange }: { steps: Step[]; onChange: (s: Step[]) => void }) {
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={i} className="rounded-xl border border-ink-100 p-3 bg-cream/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-700">Step {i + 1}</span>
            <button
              onClick={() => onChange(steps.filter((_, idx) => idx !== i))}
              className="text-coral-700 hover:bg-coral-50 rounded px-2 text-xs"
              disabled={steps.length <= 1}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <input
              className="input py-1.5 text-sm"
              value={s.n}
              onChange={(e) => {
                const next = [...steps];
                next[i] = { ...next[i], n: e.target.value };
                onChange(next);
              }}
              placeholder="01"
            />
            <input
              className="input py-1.5 text-sm"
              value={s.title}
              onChange={(e) => {
                const next = [...steps];
                next[i] = { ...next[i], title: e.target.value };
                onChange(next);
              }}
              placeholder="Match"
            />
          </div>
          <textarea
            className="input py-1.5 text-sm"
            rows={2}
            value={s.body}
            onChange={(e) => {
              const next = [...steps];
              next[i] = { ...next[i], body: e.target.value };
              onChange(next);
            }}
            placeholder="Take our quiz..."
          />
        </div>
      ))}
      <button
        onClick={() => onChange([...steps, { n: String(steps.length + 1).padStart(2, "0"), title: "", body: "" }])}
        className="btn-ghost text-xs"
      >
        + Add step
      </button>
    </div>
  );
}

function StringListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input py-1.5 text-sm flex-1"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-coral-700 hover:bg-coral-50 rounded px-2 text-xs"
              disabled={items.length <= 1}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...items, ""])} className="btn-ghost text-xs mt-2">
        + Add
      </button>
    </div>
  );
}

function TrustCardListEditor({ cards, onChange }: { cards: TrustCard[]; onChange: (c: TrustCard[]) => void }) {
  return (
    <div>
      <div className="label">Trust cards (icon + title + body)</div>
      <div className="space-y-2">
        {cards.map((card, i) => (
          <div key={i} className="rounded-xl border border-ink-100 p-3 bg-cream/50 space-y-2">
            <div className="grid grid-cols-[60px_1fr_auto] gap-2 items-end">
              <input
                className="input py-1.5 text-sm text-center text-lg"
                value={card.icon}
                onChange={(e) => {
                  const next = [...cards];
                  next[i] = { ...next[i], icon: e.target.value };
                  onChange(next);
                }}
                placeholder="🛡️"
              />
              <input
                className="input py-1.5 text-sm"
                value={card.title}
                onChange={(e) => {
                  const next = [...cards];
                  next[i] = { ...next[i], title: e.target.value };
                  onChange(next);
                }}
                placeholder="S$1M insurance"
              />
              <button
                onClick={() => onChange(cards.filter((_, idx) => idx !== i))}
                className="text-coral-700 hover:bg-coral-50 rounded px-2 text-xs"
              >
                Remove
              </button>
            </div>
            <input
              className="input py-1.5 text-sm"
              value={card.body}
              onChange={(e) => {
                const next = [...cards];
                next[i] = { ...next[i], body: e.target.value };
                onChange(next);
              }}
              placeholder="Every verified session covered."
            />
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...cards, { icon: "✨", title: "", body: "" }])} className="btn-ghost text-xs mt-2">
        + Add card
      </button>
    </div>
  );
}

function FooterColumnEditor({ col, onChange }: { col: FooterColumn; onChange: (c: FooterColumn) => void }) {
  return (
    <div className="rounded-xl border border-ink-100 p-3 bg-cream/50">
      <input
        className="input py-2 text-sm font-medium mb-2"
        value={col.title}
        onChange={(e) => onChange({ ...col, title: e.target.value })}
        placeholder="Column title"
      />
      <div className="space-y-1.5">
        {col.links.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-1">
            <input
              className="input py-1.5 text-xs"
              value={l.label}
              onChange={(e) => {
                const links = [...col.links];
                links[i] = { ...links[i], label: e.target.value };
                onChange({ ...col, links });
              }}
              placeholder="Label"
            />
            <input
              className="input py-1.5 text-xs"
              value={l.href}
              onChange={(e) => {
                const links = [...col.links];
                links[i] = { ...links[i], href: e.target.value };
                onChange({ ...col, links });
              }}
              placeholder="/path"
            />
            <button
              onClick={() => onChange({ ...col, links: col.links.filter((_, idx) => idx !== i) })}
              className="text-coral-700 hover:bg-coral-50 rounded px-2 text-xs"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange({ ...col, links: [...col.links, { label: "", href: "/" }] })} className="btn-ghost text-xs mt-2">
        + Add link
      </button>
    </div>
  );
}
