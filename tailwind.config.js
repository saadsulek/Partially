/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Disciplined Swiss Neutral Palette (Cool Zinc)
        canvas: "#09090b", // Deep zinc base
        surface: {
          DEFAULT: "#121215", // Primary panel surface
          raised: "#18181b",  // Elevated controls and inputs
          overlay: "#202024", // Floating menus and modals
          sunken: "#0d0d10",  // Recessed wells and code blocks
        },
        border: {
          subtle: "#1f1f23",
          DEFAULT: "#27272a", // Standard 1px structural hairline
          strong: "#3f3f46",  // Interactive or emphasized borders
        },
        // Single Intentional Brand Accent: Precision Cobalt
        brand: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
          subtle: "rgba(37, 99, 235, 0.12)",
          border: "rgba(37, 99, 235, 0.4)",
          text: "#60a5fa",
        },
        // Strictly Semantic Variable Accents (for Calculus X / Y differentiation)
        variable: {
          x: "#38bdf8", // Cool slate cyan for x-axis / ∂f/∂x
          "x-bg": "rgba(56, 189, 248, 0.08)",
          "x-border": "rgba(56, 189, 248, 0.3)",
          y: "#f59e0b", // Precision amber for y-axis / ∂f/∂y
          "y-bg": "rgba(245, 158, 11, 0.08)",
          "y-border": "rgba(245, 158, 11, 0.3)",
          z: "#a1a1aa", // Neutral slate for z-height
        },
        // Functional Status Colors
        status: {
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Literata', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
        headline: ['Literata', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        label: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.35)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'panel': '0 4px 12px 0 rgba(0, 0, 0, 0.5)',
      },
      letterSpacing: {
        'micro': '0.12em',
        'tightest': '-0.03em',
      },
    },
  },
  plugins: [],
};
