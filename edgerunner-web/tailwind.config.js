/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fundos Chumbo Profundíssimo (Apple x Cyberpunk - nunca #000000 puro)
        "dark-bg": "#0A0A0C",
        "dark-surface": "#101116",
        "dark-card": "#161821",
        "dark-border": "#242838",

        // Paleta Primária Clean Cyberpunk
        "edgerunner-yellow": "#FCEE0A",
        "neon-cyan": "#00F0FF",
        "neon-pink": "#FF003C",
        "neon-green": "#00FF66",
        "cyber-purple": "#D946EF",
      },
      fontFamily: {
        display: ["'Rajdhani'", "sans-serif"],
        mono: ["'Share Tech Mono'", "monospace"],
        sans: ["'Rajdhani'", "sans-serif"],
      },
      dropShadow: {
        "neon-yellow": [
          "0 0 8px rgba(252, 238, 10, 0.75)",
          "0 0 22px rgba(252, 238, 10, 0.35)",
        ],
        "neon-cyan": [
          "0 0 8px rgba(0, 240, 255, 0.75)",
          "0 0 22px rgba(0, 240, 255, 0.35)",
        ],
        "neon-pink": [
          "0 0 8px rgba(255, 0, 60, 0.75)",
          "0 0 22px rgba(255, 0, 60, 0.35)",
        ],
      },
      boxShadow: {
        "hud-yellow":
          "0 0 20px -3px rgba(252, 238, 10, 0.42), inset 0 0 12px -4px rgba(252, 238, 10, 0.22)",
        "hud-cyan":
          "0 0 20px -3px rgba(0, 240, 255, 0.42), inset 0 0 12px -4px rgba(0, 240, 255, 0.22)",
        "hud-pink":
          "0 0 20px -3px rgba(255, 0, 60, 0.42), inset 0 0 12px -4px rgba(255, 0, 60, 0.22)",
        "hud-fuchsia":
          "0 0 20px -3px rgba(217, 70, 239, 0.42), inset 0 0 12px -4px rgba(217, 70, 239, 0.22)",
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(to right, rgba(0, 240, 255, 0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.045) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-sm": "24px 24px",
      },
    },
  },
  plugins: [],
};
