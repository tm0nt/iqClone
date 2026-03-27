import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Platform design tokens
        "platform-primary": "var(--platform-primary-color)",
        "platform-primary-hover": "var(--platform-primary-hover-color)",
        "platform-bg": "var(--platform-background-color)",
        "platform-surface": "var(--platform-surface-color)",
        "platform-surface-alt": "var(--platform-surface-alt-color)",
        "platform-card": "var(--platform-card-color)",
        "platform-border": "var(--platform-border-color)",
        "platform-text": "var(--platform-text-color)",
        "platform-muted": "var(--platform-muted-text-color)",
        "platform-positive": "var(--platform-positive-color)",
        "platform-negative": "var(--platform-negative-color)",
        "platform-success": "var(--platform-success-color)",
        "platform-danger": "var(--platform-danger-color)",
        "platform-warning": "var(--platform-warning-color)",
        "platform-info": "var(--platform-info-color)",
        "platform-accent": "var(--platform-accent-color)",
        "platform-demo": "var(--platform-demo-color)",
        "platform-demo-hover": "var(--platform-demo-hover-color)",
        // Overlay
        "platform-overlay-backdrop": "var(--platform-overlay-backdrop-color)",
        "platform-overlay-surface": "var(--platform-overlay-surface-color)",
        "platform-overlay-border": "var(--platform-overlay-border-color)",
        "platform-overlay-card": "var(--platform-overlay-card-color)",
        "platform-overlay-hover": "var(--platform-overlay-hover-color)",
        "platform-overlay-muted": "var(--platform-overlay-muted-text-color)",
        // Input
        "platform-input-bg": "var(--platform-input-background-color)",
        "platform-input-border": "var(--platform-input-border-color)",
        "platform-input-label": "var(--platform-input-label-color)",
        "platform-input-subtle": "var(--platform-input-subtle-text-color)",
        // Chart
        "platform-chart-deep-bg": "var(--platform-chart-deep-background-color)",
        "platform-chart-surface": "var(--platform-chart-surface-color)",
        "platform-chart-surface-alt": "var(--platform-chart-surface-alt-color)",
        "platform-chart-price-tag": "var(--platform-chart-price-tag-color)",
        "platform-candle-up": "var(--platform-candle-up-color)",
        "platform-candle-down": "var(--platform-candle-down-color)",
        "platform-chart-grid": "var(--platform-chart-grid-color)",
        // Foregrounds (contrast pairs)
        "platform-bg-foreground": "var(--platform-background-foreground-color)",
        "platform-bg-muted-foreground": "var(--platform-background-muted-foreground-color)",
        "platform-surface-foreground": "var(--platform-surface-foreground-color)",
        "platform-surface-muted-foreground": "var(--platform-surface-muted-foreground-color)",
        "platform-surface-alt-foreground": "var(--platform-surface-alt-foreground-color)",
        "platform-surface-alt-muted-foreground": "var(--platform-surface-alt-muted-foreground-color)",
        "platform-card-foreground": "var(--platform-card-foreground-color)",
        "platform-card-muted-foreground": "var(--platform-card-muted-foreground-color)",
        "platform-overlay-surface-foreground": "var(--platform-overlay-surface-foreground-color)",
        "platform-overlay-surface-muted-foreground": "var(--platform-overlay-surface-muted-foreground-color)",
        "platform-overlay-card-foreground": "var(--platform-overlay-card-foreground-color)",
        "platform-overlay-card-muted-foreground": "var(--platform-overlay-card-muted-foreground-color)",
        "platform-input-foreground": "var(--platform-input-foreground-color)",
        "platform-input-muted-foreground": "var(--platform-input-muted-foreground-color)",
        "platform-primary-foreground": "var(--platform-primary-foreground-color)",
        "platform-success-foreground": "var(--platform-success-foreground-color)",
        "platform-danger-foreground": "var(--platform-danger-foreground-color)",
        "platform-warning-foreground": "var(--platform-warning-foreground-color)",
        "platform-demo-foreground": "var(--platform-demo-foreground-color)",
        // Header
        "platform-header-text": "var(--platform-header-text-color)",
        "platform-icon": "var(--platform-icon-color)",
        "platform-icon-bg": "var(--platform-icon-bg-color)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
