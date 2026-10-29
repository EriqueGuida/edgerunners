/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Nocturnal Operations Terminal (Seção 3.1)
        "dark-bg": "#07090E",        // Preto azulado muito escuro
        "dark-surface": "#0C1017",   // Grafite profundo (camada 1)
        "dark-card": "#111722",      // Grafite profundo (camada 2)
        "dark-border": "#1E2636",    // Cinza azulado de baixa intensidade

        // Assinatura Primária: Ciano Elétrico | Secundária reservada: Carmesim/Magenta
        "neon-cyan": "#00E5FF",
        "neon-pink": "#F43F5E",
        "neon-green": "#10B981",
        "edgerunner-yellow": "#00E5FF", // Alinhado à assinatura primária ciano sem quebrar telas internas
        "ah-amber": "#F59E0B",

        // Tokens explícitos AFTERHOURS
        "ah-bg": "#07090E",
        "ah-surface": "#0C1017",
        "ah-elevated": "#111722",
        "ah-border": "#1E2636",
        "ah-cyan": "#00E5FF",
        "ah-crimson": "#F43F5E",
        "ah-emerald": "#10B981",
        "ah-text": "#E6EDF3",
        "ah-muted": "#8B98A9",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "'Rajdhani'", "sans-serif"],
        sans: ["'IBM Plex Sans'", "'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "'Share Tech Mono'", "monospace"],
      },
      dropShadow: {
        "neon-cyan": [
          "0 0 10px rgba(0, 229, 255, 0.35)",
        ],
        "neon-yellow": [
          "0 0 10px rgba(0, 229, 255, 0.35)",
        ],
        "neon-pink": [
          "0 0 10px rgba(244, 63, 94, 0.35)",
        ],
      },
      boxShadow: {
        "hud-cyan":
          "0 0 24px -6px rgba(0, 229, 255, 0.22), inset 0 0 10px -6px rgba(0, 229, 255, 0.12)",
        "hud-yellow":
          "0 0 24px -6px rgba(0, 229, 255, 0.22), inset 0 0 10px -6px rgba(0, 229, 255, 0.12)",
        "hud-pink":
          "0 0 20px -6px rgba(244, 63, 94, 0.25)",
        "hud-emerald":
          "0 0 20px -6px rgba(16, 185, 129, 0.22)",
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(to right, rgba(0, 229, 255, 0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.025) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-sm": "32px 32px",
      },
    },
  },
  plugins: [],
};
