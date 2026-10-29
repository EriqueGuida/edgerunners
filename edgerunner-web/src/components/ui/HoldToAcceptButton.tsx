import { useState, useRef, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Zap, CheckCircle2, Radio } from 'lucide-react';

interface HoldToAcceptButtonProps {
  onAccept: () => void | Promise<void>;
  holdDurationMs?: number;
  isPsycho?: boolean;
  disabled?: boolean;
}

type ButtonPhase = 'idle' | 'holding' | 'success';

export function HoldToAcceptButton({
  onAccept,
  holdDurationMs = 2000,
  isPsycho = false,
  disabled = false,
}: HoldToAcceptButtonProps) {
  const [phase, setPhase] = useState<ButtonPhase>('idle');
  const [progressPct, setProgressPct] = useState<number>(0);

  const fillControls = useAnimationControls();
  const isHoldingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimers = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const updatePercentageLoop = () => {
    if (!isHoldingRef.current) return;
    const elapsed = performance.now() - startTimeRef.current;
    const pct = Math.min(100, Math.floor((elapsed / holdDurationMs) * 100));
    setProgressPct(pct);

    if (elapsed < holdDurationMs) {
      rafRef.current = window.requestAnimationFrame(updatePercentageLoop);
    }
  };

  const handleHoldStart = () => {
    if (disabled || phase === 'success') return;

    isHoldingRef.current = true;
    startTimeRef.current = performance.now();
    setPhase('holding');
    setProgressPct(0);

    // Anima a barra de preenchimento contínuo por 2 segundos
    fillControls.start({
      scaleX: 1,
      transition: {
        duration: holdDurationMs / 1000,
        ease: 'linear',
      },
    });

    rafRef.current = window.requestAnimationFrame(updatePercentageLoop);

    // Dispara o sucesso exatamente ao completar os 2 segundos contínuos
    timerRef.current = window.setTimeout(async () => {
      if (!isHoldingRef.current) return;
      isHoldingRef.current = false;
      clearTimers();
      setProgressPct(100);
      setPhase('success');

      // Breve janela para exibir o flash Ciano Neon de sucesso antes de remover o card
      window.setTimeout(() => {
        onAccept();
      }, 420);
    }, holdDurationMs);
  };

  const handleHoldAbort = () => {
    if (!isHoldingRef.current || phase === 'success') return;

    isHoldingRef.current = false;
    clearTimers();
    setPhase('idle');
    setProgressPct(0);

    // Esvazia a barra rapidamente se o usuário soltar antes dos 2s
    fillControls.stop();
    fillControls.start({
      scaleX: 0,
      transition: {
        duration: 0.18,
        ease: 'easeOut',
      },
    });
  };

  // Paleta dinâmica conforme o estado e ameaça do contrato
  const baseColorClasses =
    phase === 'success'
      ? 'border-neon-cyan text-dark-bg shadow-hud-cyan'
      : isPsycho
      ? 'border-neon-pink text-neon-pink hover:shadow-hud-pink'
      : 'border-edgerunner-yellow text-edgerunner-yellow hover:shadow-hud-yellow';

  const fillBarColor =
    phase === 'success'
      ? 'bg-neon-cyan'
      : isPsycho
      ? 'bg-neon-pink/35'
      : 'bg-edgerunner-yellow/30';

  return (
    <motion.button
      type="button"
      disabled={disabled || phase === 'success'}
      onTapStart={handleHoldStart}
      onTap={handleHoldAbort}
      onTapCancel={handleHoldAbort}
      whileTap={phase !== 'success' ? { scale: 0.97 } : undefined}
      animate={
        phase === 'success'
          ? {
              backgroundColor: ['#00F0FF', '#050508', '#00F0FF'],
              boxShadow: [
                '0 0 0px rgba(0,240,255,0)',
                '0 0 28px rgba(0,240,255,0.95)',
                '0 0 18px rgba(0,240,255,0.75)',
              ],
            }
          : undefined
      }
      transition={{ duration: 0.38 }}
      className={`relative overflow-hidden px-4 py-2.5 min-w-[165px] bg-dark-bg border font-mono text-xs font-bold uppercase tracking-widest select-none cursor-pointer disabled:cursor-not-allowed transition-colors ${baseColorClasses}`}
    >
      {/* Barra de Preenchimento Progressivo (0 -> 100% em 2s) */}
      <motion.span
        initial={{ scaleX: 0 }}
        animate={fillControls}
        style={{ originX: 0 }}
        className={`pointer-events-none absolute inset-0 ${fillBarColor}`}
      />

      {/* Linha laser inferior de progresso */}
      {phase === 'holding' && (
        <motion.span
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: holdDurationMs / 1000, ease: 'linear' }}
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] bg-neon-cyan shadow-[0_0_8px_#00F0FF]"
        />
      )}

      {/* Conteúdo / Rótulo Tático */}
      <span className="relative z-10 flex items-center justify-center gap-1.5">
        {phase === 'idle' && (
          <>
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>HOLD TO ACCEPT</span>
          </>
        )}

        {phase === 'holding' && (
          <>
            <Radio className="w-3.5 h-3.5 shrink-0 animate-spin text-neon-cyan" />
            <span className="text-white">LINKING {progressPct}%</span>
          </>
        )}

        {phase === 'success' && (
          <>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-dark-bg" />
            <span className="text-dark-bg font-extrabold">GIG LINKED!</span>
          </>
        )}
      </span>
    </motion.button>
  );
}

export default HoldToAcceptButton;
