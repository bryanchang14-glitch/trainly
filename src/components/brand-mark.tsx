// Brand mark that renders either:
//   1. The uploaded logo image if logoUrl is set + non-empty, OR
//   2. The fallback gradient "T" mark (matches original brand identity)
//
// Used by TopNav (sm) and the hero block on landing (lg).

type Size = "sm" | "lg";

const SIZE_CLASSES: Record<Size, { wrap: string; text: string }> = {
  sm: { wrap: "w-8 h-8 rounded-xl", text: "text-base" },
  lg: { wrap: "w-14 h-14 rounded-2xl shadow-lift", text: "text-3xl" },
};

export function BrandMark({ logoUrl, size = "sm" }: { logoUrl?: string | null; size?: Size }) {
  const cls = SIZE_CLASSES[size];
  if (logoUrl && logoUrl.trim().length > 0) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt="Trainly logo"
        className={`${cls.wrap} object-cover`}
      />
    );
  }
  return (
    <span
      className={`inline-flex ${cls.wrap} bg-gradient-to-br from-sage-500 to-coral-400 items-center justify-center text-white font-bold ${cls.text}`}
    >
      T
    </span>
  );
}
