/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fundos Obsidiana & Grafite Técnico (AFTERHOURS Dark Ops)
        "dark-bg": "#08090C",
        "dark-surface": "#0E1117",
        "dark-card": "#141821",
        "dark-border": "#212736",

        // Tokens Semânticos AFTERHOURS (compatíveis com classes legadas)
        "edgerunner-yellow": "#F59E0B", // Âmbar Tático
        "neon-cyan": "#22D3EE",         // Ciano Telemetria
        "neon-pink": "#F43F5E",         // Carmesim Alerta Crítico
        "neon-green": "#10B981",        // Esmeralda Operacional
        "cyber-purple": "#8B5CF6",      // Violeta Criptográfico

        // Aliases Explícitos do Design System AFTERHOURS
        "ah-obsidian": "#08090C",
        "ah-surface": "#0E1117",
        "ah-panel": "#141821",
        "ah-border": "#212736",
        "ah-amber": "#F59E0B",
        "ah-cyan": "#22D3EE",
        "ah-crimson": "#F43F5E",
        "ah-emerald": "#10B981",
      },
      fontFamily: {
        display: ["'Rajdhani'", "sans-serif"],
        mono: ["'Share Tech Mono'", "monospace"],
        sans: ["'Inter'", "'Rajdhani'", "sans-serif"],
      },
      dropShadow: {
        "neon-yellow": [
          "0 0 8px rgba(245, 158, 11, 0.55)",
          "0 0 18px rgba(245, 158, 11, 0.25)",
        ],
        "neon-cyan": [
          "0 0 8px rgba(34, 211, 238, 0.55)",
          "0 0 18px rgba(34, 211, 238, 0.25)",
        ],
        "neon-pink": [
          "0 0 8px rgba(244, 63, 94, 0.55)",
          "0 0 18px rgba(244, 63, 94, 0.25)",
        ],
      },
      boxShadow: {
        "hud-yellow":
          "0 0 22px -4px rgba(245, 158, 11, 0.32), inset 0 0 12px -4px rgba(245, 158, 11, 0.14)",
        "hud-cyan":
          "0 0 22px -4px rgba(34, 211, 238, 0.32), inset 0 0 12px -4px rgba(34, 211, 238, 0.14)",
        "hud-pink":
          "0 0 22px -4px rgba(244, 63, 94, 0.35), inset 0 0 12px -4px rgba(244, 63, 94, 0.16)",
        "hud-emerald":
          "0 0 22px -4px rgba(16, 185, 129, 0.32), inset 0 0 12px -4px rgba(16, 185, 129, 0.14)",
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(to right, rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(34, 211, 238, 0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-sm": "28px 28px",
      },
    },
  },
  plugins: [],
};
