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
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcd9ff",
          300: "#8ec1ff",
          400: "#599fff",
          500: "#337bff",
          600: "#1f5ef5",
          700: "#1849e1",
          800: "#1a3db6",
          900: "#1b388f",
        },
      warm: {
        400: "#f0a868",
        500: "#e8924a",
      },
      // Circle accent — violet, used in the signature blue→violet gradient
      accent: {
        300: "#c4b5fd",
        400: "#a78bfa",
        500: "#8b5cf6",
        600: "#7c3aed",
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
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.10)",
        "glass-lg": "0 20px 60px -10px rgba(31, 38, 135, 0.18)",
        soft: "0 4px 20px -4px rgba(0,0,0,0.08)",
        // MSN/XP-style glossy inset highlight + brand glow
        gloss: "inset 0 1px 0 0 rgba(255,255,255,0.5)",
        glow: "0 10px 40px -8px rgba(51,123,255,0.45)",
      },
      backgroundImage: {
        "circle-gradient": "linear-gradient(135deg, #337bff 0%, #6d5cf6 55%, #22b8cf 120%)",
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
