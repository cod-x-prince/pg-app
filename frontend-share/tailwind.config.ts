import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: "#1B3B6F",
          mid:     "#254E99",
          light:   "#EEF3FB",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light:   "#FEF3C7",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans:  ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        card:    "0 2px 16px 0 rgba(27,59,111,0.08)",
        "card-hover": "0 8px 32px 0 rgba(27,59,111,0.16)",
        amber:   "0 4px 24px 0 rgba(245,158,11,0.25)",
      },
    },
  },
  plugins: [],
}
export default config
