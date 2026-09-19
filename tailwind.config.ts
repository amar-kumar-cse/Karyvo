import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        heading: ["var(--font-manrope)", "var(--font-inter)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        base: {
          darkest: "#05060E",
          dark: "#070814",
          card: "#0B0D1E",
          surface: "#0F122C",
          border: "rgba(255, 255, 255, 0.08)",
        },
        action: {
          light: "#A78BFA",
          DEFAULT: "#8B5CF6",
          dark: "#7C3AED",
          glow: "rgba(139, 92, 246, 0.25)",
        },
        gold: {
          light: "#FDE68A",
          DEFAULT: "#F59E0B",
          rich: "#D97706",
          glow: "rgba(245, 158, 11, 0.2)",
        },
        status: {
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        "glass-hover": "0 14px 44px 0 rgba(124, 58, 237, 0.18)",
        "gold-glass": "0 0 30px rgba(245, 158, 11, 0.15)",
        "paper-lit": "0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.15) inset, 0 10px 25px -5px rgba(139, 92, 246, 0.08)",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-subtle": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        orbit: "orbit 15s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(1deg)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(160px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(160px) rotate(-360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
