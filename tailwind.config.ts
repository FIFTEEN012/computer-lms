import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border-color)",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--bg-primary)",
        foreground: "var(--text-main)",
        'bg-primary': "var(--bg-primary)",
        'bg-secondary': "var(--bg-secondary)",
        'text-main': "var(--text-main)",
        'text-muted': "var(--text-muted)",
        'accent-primary': "var(--accent-primary)",
        'accent-secondary': "var(--accent-secondary)",
        primary: {
          DEFAULT: "var(--accent-primary)",
          foreground: "var(--bg-primary)",
        },
        secondary: {
          DEFAULT: "var(--bg-secondary)",
          foreground: "var(--text-main)",
        },
        destructive: {
          DEFAULT: "var(--accent-secondary)",
          foreground: "var(--text-main)",
        },
        muted: {
          DEFAULT: "var(--text-muted)",
          foreground: "var(--bg-primary)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          foreground: "var(--bg-primary)",
        },
        popover: {
          DEFAULT: "var(--bg-secondary)",
          foreground: "var(--text-main)",
        },
        card: {
          DEFAULT: "var(--bg-secondary)",
          foreground: "var(--text-main)",
        },
        // Stitch Material Design 3 Color System
        "surface-tint": "#00dddd",
        "surface": "#131313",
        "surface-dim": "#131313",
        "surface-bright": "#3a3939",
        "surface-container": "#201f1f",
        "surface-container-low": "#1c1b1b",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353534",
        "surface-variant": "#353534",
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#b9cac9",
        "on-background": "#e5e2e1",
        "primary-fixed": "#00fbfb",
        "primary-fixed-dim": "#00dddd",
        "primary-container": "#00fbfb",
        "on-primary": "#003737",
        "on-primary-fixed": "#002020",
        "on-primary-fixed-variant": "#004f4f",
        "on-primary-container": "#007070",
        "secondary-md": "#ffabf3",
        "secondary-fixed": "#ffd7f5",
        "secondary-fixed-dim": "#ffabf3",
        "secondary-container": "#fe00fe",
        "on-secondary": "#5b005b",
        "on-secondary-fixed": "#380038",
        "on-secondary-fixed-variant": "#810081",
        "on-secondary-container": "#500050",
        "tertiary-fixed": "#79ff5b",
        "tertiary-fixed-dim": "#2ae500",
        "tertiary-container": "#79ff5b",
        "on-tertiary": "#053900",
        "on-tertiary-fixed": "#022100",
        "on-tertiary-fixed-variant": "#095300",
        "on-tertiary-container": "#117500",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        "outline": "#839493",
        "outline-variant": "#3a4a49",
        "inverse-surface": "#e5e2e1",
        "inverse-on-surface": "#313030",
        "inverse-primary": "#006a6a",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        headline: ["var(--font-heading)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        label: ["var(--font-heading)", "Space Grotesk", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};

export default config;
