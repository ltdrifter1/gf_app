import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft, calming wellness palette
        sage: {
          50: "#f3f7f4",
          100: "#e3ede6",
          200: "#c7dbcd",
          300: "#9fc0aa",
          400: "#6f9e80",
          500: "#4f8163",
          600: "#3c674e",
          700: "#315340",
          800: "#294335",
          900: "#22372c",
        },
        cream: {
          50: "#fdfbf7",
          100: "#faf5ec",
          200: "#f3e8d3",
        },
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      warm: {
        400: "#f0a868",
        500: "#e8924a",
      },
      // Safely accent — sky, used in the teal→sky signature gradient
      accent: {
        300: "#7dd3fc",
        400: "#38bdf8",
        500: "#0ea5e9",
        600: "#0284c8",
      },
    },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(15, 118, 110, 0.10)",
        "glass-lg": "0 20px 60px -10px rgba(15, 118, 110, 0.18)",
        soft: "0 4px 20px -4px rgba(0,0,0,0.08)",
        // MSN/XP-style glossy inset highlight + brand glow
        gloss: "inset 0 1px 0 0 rgba(255,255,255,0.5)",
        glow: "0 10px 40px -8px rgba(13,148,136,0.45)",
      },
      backgroundImage: {
        "safely-gradient": "linear-gradient(135deg, #0d9488 0%, #0284c8 55%, #38bdf8 120%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
