import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Cinzel", "serif"],
        sans:  ["Josefin Sans", "sans-serif"],
        body:  ["Josefin Sans", "sans-serif"],
      },
      colors: {
        ink:   "#0A0A0F",
        ink2:  "#12121A",
        ink3:  "#1A1A26",
        glass: "rgba(255,255,255,0.06)",
        gold:  "#C9A84C",
        "gold-light": "#F0D080",
        "gold-dark":  "#8B6914",
        cream: "#F8F4EE",
        mist:  "rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "gold-gradient":  "linear-gradient(135deg, #C9A84C, #F0D080, #C9A84C)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        "ink-gradient":   "linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)",
      },
      boxShadow: {
        "glass":    "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        "gold":     "0 8px 32px rgba(201,168,76,0.3)",
        "gold-lg":  "0 16px 48px rgba(201,168,76,0.4)",
        "card":     "0 2px 24px rgba(0,0,0,0.5)",
        "card-hover": "0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15)",
      },
      animation: {
        "fade-up":    "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "shimmer":    "shimmer 2s infinite",
        "float":      "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "morph":      "morph 8s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:    { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:    { from: { opacity: "0" }, to: { opacity: "1" } },
        shimmer:   { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float:     { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        glowPulse: { "0%,100%": { boxShadow: "0 0 20px rgba(201,168,76,0.2)" }, "50%": { boxShadow: "0 0 60px rgba(201,168,76,0.5)" } },
        morph:     { "0%,100%": { borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%" }, "50%": { borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%" } },
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "60px",
      },
      transitionTimingFunction: {
        "expo-out":   "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring":     "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
}

export default config
