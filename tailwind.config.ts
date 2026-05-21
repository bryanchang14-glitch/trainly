import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f3f7f4",
          100: "#e3ede5",
          200: "#c7dbcc",
          300: "#9fc0a8",
          400: "#73a081",
          500: "#528263",
          600: "#3f694e",
          700: "#345441",
          800: "#2b4435",
          900: "#24382c",
        },
        coral: {
          50: "#fff4f1",
          100: "#ffe5dd",
          200: "#ffcbbb",
          300: "#ffa68a",
          400: "#ff7a57",
          500: "#ff5a31",
          600: "#ed3f15",
          700: "#c4310f",
          800: "#9c2a12",
          900: "#7e2713",
        },
        ink: {
          50: "#f6f6f5",
          100: "#e7e7e5",
          200: "#cfcfcb",
          300: "#adada6",
          400: "#85857d",
          500: "#6a6a62",
          600: "#54544d",
          700: "#444440",
          800: "#393936",
          900: "#1f1f1d",
        },
        cream: "#faf7f2",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 20, 0.04), 0 8px 24px -8px rgba(15, 23, 20, 0.12)",
        lift: "0 2px 4px rgba(15, 23, 20, 0.06), 0 24px 48px -16px rgba(15, 23, 20, 0.18)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
