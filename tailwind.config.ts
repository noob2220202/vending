import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapped to CSS variables so a future Telegram Mini App can swap to --tg-theme-*.
        bg: {
          base: "var(--bg-base)",
          elevated: "var(--bg-elevated)",
          card: "var(--bg-card)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          deep: "var(--accent-deep)",
          hover: "var(--accent-hover)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      backgroundImage: {
        "growth-gradient":
          "linear-gradient(135deg, var(--gradient-start), var(--gradient-mid), var(--gradient-end))",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Pretendard Variable",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
        // Latin display face for hero/headline copy; falls back to Pretendard for Korean glyphs.
        display: ["var(--font-display)", "Pretendard", "sans-serif"],
        // Tabular figures for price/balance/countdown.
        mono: ["var(--font-mono)", "Pretendard", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "toast-in": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        aurora: {
          "0%, 100%": { transform: "translate(0%, 0%) rotate(0deg)" },
          "50%": { transform: "translate(5%, -5%) rotate(8deg)" },
        },
        "gradient-sweep": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "spark-out": {
          "0%": { opacity: "1", transform: "rotate(var(--spark-angle, 0deg)) scaleX(0.3)" },
          "100%": {
            opacity: "0",
            transform: "rotate(var(--spark-angle, 0deg)) scaleX(1.6) translateX(14px)",
          },
        },
      },
      animation: {
        "toast-in": "toast-in 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        aurora: "aurora 14s ease-in-out infinite",
        "gradient-sweep": "gradient-sweep 3s linear infinite",
        "spark-out": "spark-out 0.45s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
