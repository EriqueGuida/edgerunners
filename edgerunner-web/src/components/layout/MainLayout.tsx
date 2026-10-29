import { useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Activity, Wifi } from 'lucide-react';

export function MainLayout() {
  const location = useLocation();
  const currentOutlet = useOutlet();

  return (
    <div className="h-screen w-screen overflow-hidden bg-dark-bg text-gray-100 flex flex-col md:flex-row select-none">
      {/* Barra Lateral Retrátil (Desktop) / HUD Nav (Mobile) */}
      <Sidebar />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-cyber-grid bg-grid-sm">
        {/* Glows ambientais de alta fidelidade sobre o fundo chumbo #0A0A0C */}
        <div className="pointer-events-none absolute -top-28 left-1/4 w-[28rem] h-56 bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-1/4 w-[28rem] h-56 bg-fuchsia-500/10 blur-3xl" />

        {/* Sub-header HUD de Telemetria (Desktop) */}
        <header className="hidden md:flex h-12 px-8 border-b border-dark-border bg-dark-surface/85 backdrop-blur-md items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4 font-mono text-xs text-gray-400 tracking-widest uppercase">
            <span className="flex items-center gap-1.5 text-neon-cyan">
              <Activity className="w-3.5 h-3.5" />
              NIGHT_CITY // FIXER_NET
            </span>
            <span className="text-dark-border">|</span>
            <span>SECTOR: WATSON_04</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs tracking-widest uppercase">
            <span className="text-gray-400">
              PING: <strong className="text-edgerunner-yellow">4ms</strong>
            </span>
            <span className="flex items-center gap-1.5 text-neon-green">
              <Wifi className="w-3.5 h-3.5" />
              SECURED
            </span>
          </div>
        </header>

        {/* Renderização das Rotas Filhas com Page Transition (Framer Motion) */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 z-10 select-text">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{
                  opacity: 0,
                  y: 10,
                  filter: 'brightness(1.75) blur(2px)',
                }}
                animate={{
                  opacity: [0, 0.9, 0.65, 1],
                  y: 0,
                  filter: 'brightness(1) blur(0px)',
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  filter: 'brightness(1.4) blur(1px)',
                }}
                transition={{
                  duration: 0.24,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {currentOutlet}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
