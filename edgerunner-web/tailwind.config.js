/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fundos OLED e Superfícies HUD
        "dark-bg": "#050508",
        "dark-surface": "#0C0D14",
        "dark-card": "#12141F",
        "dark-border": "#1F2335",

        // Paleta Primária Clean Cyberpunk
        "edgerunner-yellow": "#FCEE0A",
        "neon-cyan": "#00F0FF",
        "neon-pink": "#FF003C",
        "neon-green": "#00FF66",
        "cyber-purple": "#B829FF",
      },
      fontFamily: {
        display: ["'Rajdhani'", "sans-serif"],
        mono: ["'Share Tech Mono'", "monospace"],
        sans: ["'Rajdhani'", "sans-serif"],
      },
      dropShadow: {
        "neon-yellow": [
          "0 0 6px rgba(252, 238, 10, 0.75)",
          "0 0 18px rgba(252, 238, 10, 0.35)",
        ],
        "neon-cyan": [
          "0 0 6px rgba(0, 240, 255, 0.75)",
          "0 0 18px rgba(0, 240, 255, 0.35)",
        ],
        "neon-pink": [
          "0 0 6px rgba(255, 0, 60, 0.75)",
          "0 0 18px rgba(255, 0, 60, 0.35)",
        ],
      },
      boxShadow: {
        "hud-yellow": "0 0 15px -3px rgba(252, 238, 10, 0.4), inset 0 0 10px -4px rgba(252, 238, 10, 0.2)",
        "hud-cyan": "0 0 15px -3px rgba(0, 240, 255, 0.4), inset 0 0 10px -4px rgba(0, 240, 255, 0.2)",
        "hud-pink": "0 0 15px -3px rgba(255, 0, 60, 0.4), inset 0 0 10px -4px rgba(255, 0, 60, 0.2)",
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-sm": "24px 24px",
      },
    },
  },
  plugins: [],
};