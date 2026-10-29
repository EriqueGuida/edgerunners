import { useEffect, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import {
  Volume2,
  VolumeX,
  Eye,
  Layers,
  Clock,
  Lock,
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
    <div className="h-screen w-screen overflow-hidden bg-[#07090E] text-[#F1F5F9] flex flex-col md:flex-row selection:bg-[#00E5FF] selection:text-[#07090E]">
      {/* Barra Lateral Tática (Desktop) / Navegação HUD (Mobile) */}
      <Sidebar />

      {/* Área Principal do Terminal Operacional */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#07090E]">
        {/* Grade Cartográfica Sutil e Iluminação Localizada */}
        <div
          className="pointer-events-none absolute inset-0 ah-tactical-grid opacity-30"
          aria-hidden="true"
        />
        <div
          className="ambient-glow pointer-events-none absolute -top-36 right-1/4 w-[36rem] h-72 bg-[#00E5FF]/[0.035] blur-3xl"
          aria-hidden="true"
        />

        {/* Barra Superior de Telemetria & Controle de Interface (Desktop) */}
        <header className="hidden md:flex h-14 px-8 border-b border-[#1E2636] bg-[#0C1017]/90 backdrop-blur-md items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4 font-mono text-[11px] text-[#94A3B8] tracking-[0.16em] uppercase">
            <span className="flex items-center gap-2 text-[#F1F5F9]">
              <span className="w-1.5 h-1.5 bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              AFTERHOURS // NOCTURNAL OPERATIONS TERMINAL
            </span>
            <span className="text-[#1E2636]">|</span>
            <span className="flex items-center gap-1.5 text-[#94A3B8]">
              <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
              {utcTime} UTC
            </span>
          </div>

          {/* Controles do Operador sobre a Interface (RF-120, RF-121, RF-122) */}
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] uppercase">
            <button
              type="button"
              onClick={toggleVisualMode}
              title="Alternar entre apresentação imersiva e apresentação tática simplificada"
              className={`px-3 py-1.5 border flex items-center gap-1.5 transition-colors cursor-pointer ${
                visualMode === 'immersive'
                  ? 'border-[#1E2636] bg-[#111722] text-[#00E5FF] hover:border-[#00E5FF]/50'
                  : 'border-[#00E5FF]/60 bg-[#00E5FF]/10 text-[#F1F5F9]'
              }`}
            >
              {visualMode === 'immersive' ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>UI: IMERSIVA</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>UI: SIMPLIFICADA</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={toggleSound}
              title="Ativar ou silenciar feedback sonoro de interface"
              className={`px-3 py-1.5 border flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'border-[#1E2636] bg-[#111722] text-[#F1F5F9] hover:border-[#00E5FF]/50'
                  : 'border-[#1E2636] bg-[#07090E] text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>ÁUDIO: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>ÁUDIO: MUTE</span>
                </>
              )}
            </button>

            <span className="text-[#1E2636]">|</span>

            <span className="flex items-center gap-1.5 text-[#10B981]">
              <Lock className="w-3.5 h-3.5" />
              TLS-1.3 // ATIVO
            </span>
          </div>
        </header>

        {/* Renderização das Rotas Filhas com Transição Adaptativa */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 z-10">
          <div className="max-w-[1320px] mx-auto">
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
