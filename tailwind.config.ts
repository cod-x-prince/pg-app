import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Enable class-based dark mode (we'll add 'dark' to html)
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B", // deep black background
        surface: "#121214", // cards, sheets
        primary: "#EAB308", // warm amber (accent)
        secondary: "#A1A1AA", // zinc-400 for muted text
        border: "#27272A", // zinc-800 for borders
        // Keep some semantic aliases for now, but they'll be phased out
        blue: {
          DEFAULT: "#1B3B6F", // keep for legacy? We may replace later
          light: "#EEF3FB",
        },
        amber: {
          DEFAULT: "#EAB308",
          light: "#FEF3C7",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Outfit", "system-ui", "sans-serif"],
        // Keep serif for any old components, but we'll migrate
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(234, 179, 8, 0.5)",
        "glow-lg": "0 0 30px rgba(234, 179, 8, 0.6)",
        card: "0 4px 20px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
