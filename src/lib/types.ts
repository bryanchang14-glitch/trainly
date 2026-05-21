export type Cert = { name: string; issuer: string; year: number };
export type Socials = { instagram?: string; tiktok?: string; youtube?: string };

export const FORMAT_LABELS: Record<string, { label: string; icon: string }> = {
  HOME: { label: "Home visit", icon: "🏠" },
  GYM: { label: "Gym", icon: "🏋️" },
  OUTDOOR: { label: "Outdoor", icon: "🌳" },
  VIRTUAL: { label: "Virtual", icon: "💻" },
  STUDIO: { label: "Coach's studio", icon: "🧘" },
};
