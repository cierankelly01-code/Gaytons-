import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm family-deli palette. One accent + supporting warm neutrals.
        cream: "#FBF6EE",
        crust: "#F3E9D9",
        olive: "#5B6E3C",
        "olive-dark": "#445229",
        terracotta: "#C75B39",
        "terracotta-dark": "#A8472A",
        charcoal: "#2B2620",
        clay: "#8A7A66",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
