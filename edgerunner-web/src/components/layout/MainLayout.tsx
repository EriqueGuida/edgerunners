import { useEffect, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import {
  Activity,
  Wifi,
  Volume2,
  VolumeX,
  Eye,
  Layers,
  Clock,
} from 'lucide-react';
import { useImmersion } from '../../context/ImmersionContext';

export function MainLayout() {
  const location = useLocation();
  const currentOutlet = useOutlet();
  const {
    visualMode,
    soundEnabled,
    reducedMotion,
    toggleVisualMode,
    toggleSound,
  } = useImmersion();

  const [utcTime, setUtcTime] = useState<string>(() =>
    new Date().toISOString().slice(11, 19)
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setUtcTime(new Date().toISOString().slice(11, 19));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const isSimpleTransition = reducedMotion || visualMode === 'simplified';

  return (
    <div className="h-screen w-screen overflow-hidden bg-dark-bg text-gray-100 flex flex-col md:flex-row">
      {/* Barra Lateral Tática (Desktop) / Navegação HUD (Mobile) */}
      <Sidebar />

      {/* Área Principal de Operações */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-cyber-grid bg-grid-sm">
        {/* Iluminação Atmosférica Contida (Desativada automaticamente no Modo Simplificado) */}
        <div className="ambient-glow pointer-events-none absolute -top-32 left-1/4 w-[32rem] h-64 bg-amber-500/[0.06] blur-3xl" />
        <div className="ambient-glow pointer-events-none absolute -bottom-32 right-1/4 w-[32rem] h-64 bg-cyan-500/[0.06] blur-3xl" />

        {/* Barra Superior de Telemetria & Controle de Imersão (Desktop) */}
        <header className="hidden md:flex h-12 px-8 border-b border-dark-border bg-dark-surface/90 backdrop-blur-md items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4 font-mono text-xs text-gray-400 tracking-widest uppercase">
            <span className="flex items-center gap-1.5 text-edgerunner-yellow">
              <Activity className="w-3.5 h-3.5" />
              AFTERHOURS // REDE OPERACIONAL
            </span>
            <span className="text-dark-border">|</span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5 text-neon-cyan" />
              {utcTime} UTC
            </span>
          </div>

          {/* Controles do Usuário sobre a Interface (RF-120, RF-121, RF-122) */}
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
            <button
              type="button"
              onClick={toggleVisualMode}
              title="Alternar entre apresentação imersiva e apresentação tática simplificada (RF-122)"
              className={`px-2.5 py-1 border flex items-center gap-1.5 transition-colors cursor-pointer ${
                visualMode === 'immersive'
                  ? 'border-dark-border bg-dark-card text-neon-cyan hover:border-neon-cyan'
                  : 'border-edgerunner-yellow/60 bg-edgerunner-yellow/10 text-edgerunner-yellow'
              }`}
            >
              {visualMode === 'immersive' ? (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>UI: IMERSIVA</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>UI: SIMPLIFICADA</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={toggleSound}
              title="Ativar ou silenciar feedback sonoro de interface (RF-121)"
              className={`px-2.5 py-1 border flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'border-dark-border bg-dark-card text-gray-300 hover:border-neon-cyan hover:text-neon-cyan'
                  : 'border-dark-border bg-dark-bg text-gray-500 hover:text-gray-300'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-neon-green" />
                  <span>ÁUDIO: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-gray-500" />
                  <span>ÁUDIO: MUTE</span>
                </>
              )}
            </button>

            <span className="text-dark-border">|</span>

            <span className="flex items-center gap-1.5 text-neon-green">
              <Wifi className="w-3.5 h-3.5" />
              CANAL SEGURO
            </span>
          </div>
        </header>

        {/* Renderização das Rotas Filhas com Transição Adaptativa */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 z-10">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={
                  isSimpleTransition
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8 }
                }
                animate={
                  isSimpleTransition
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0 }
                }
                exit={
                  isSimpleTransition
                    ? { opacity: 0 }
                    : { opacity: 0, y: -6 }
                }
                transition={{
                  duration: isSimpleTransition ? 0.1 : 0.22,
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
