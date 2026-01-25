import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // B2B SaaS System Font Stack
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      // CSS Variable-based colors for theming
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Semantic colors with muted tones
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
        },
        success: {
          50: "var(--success-50)",
          100: "var(--success-100)",
          500: "var(--success-500)",
          600: "var(--success-600)",
          700: "var(--success-700)",
        },
        warning: {
          50: "var(--warning-50)",
          100: "var(--warning-100)",
          500: "var(--warning-500)",
          600: "var(--warning-600)",
          700: "var(--warning-700)",
        },
        error: {
          50: "var(--error-50)",
          100: "var(--error-100)",
          500: "var(--error-500)",
          600: "var(--error-600)",
          700: "var(--error-700)",
        },
        // Surface colors for layered UI
        surface: {
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          tertiary: "var(--surface-tertiary)",
        },
        // Border colors
        border: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
        },
      },
      // 4px/8px spacing scale (Tailwind default is good, just being explicit)
      spacing: {
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "2.5": "10px",
        "3": "12px",
        "3.5": "14px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "11": "44px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
      },
      // Typography scale (3-4 sizes for hierarchy)
      fontSize: {
        // Caption / small text
        xs: ["0.75rem", { lineHeight: "1rem" }],
        // Body text
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        // Default / Large body
        base: ["1rem", { lineHeight: "1.5rem" }],
        // Subheadings
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        // Headings
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
      },
      // Fast transitions (100-200ms max as per PRD)
      transitionDuration: {
        DEFAULT: "150ms",
        fast: "100ms",
        normal: "150ms",
        slow: "200ms",
      },
      // Minimal border radius
      borderRadius: {
        none: "0",
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      // Subtle shadows
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
