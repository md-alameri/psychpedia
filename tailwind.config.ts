import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#fafafa",
          light: "#ffffff",
          off: "#f5f5f5",
        },
        text: {
          primary: "#1e293b",
          secondary: "#475569",
          muted: "#64748b",
        },
        border: {
          DEFAULT: "#e5e7eb",
          light: "#f3f4f6",
        },
        accent: {
          DEFAULT: "#475569",
          light: "#64748b",
        },
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.6" }],
        sm: ["0.875rem", { lineHeight: "1.6" }],
        base: ["1rem", { lineHeight: "1.7" }],
        lg: ["1.125rem", { lineHeight: "1.7" }],
        xl: ["1.25rem", { lineHeight: "1.6" }],
        "2xl": ["1.5rem", { lineHeight: "1.5" }],
        "3xl": ["2rem", { lineHeight: "1.4" }],
        "4xl": ["2.5rem", { lineHeight: "1.2" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        arabic: ["var(--font-noto-arabic)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans Arabic", "Arabic UI Display", "sans-serif"],
      },
      spacing: {
        section: "6rem", // 96px
        "section-mobile": "4rem", // 64px
      },
      maxWidth: {
        container: "1280px", // max-w-7xl
        "text-content": "75ch", // Optimal reading width
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.05)",
        soft: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 4px 6px -1px rgb(0 0 0 / 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
