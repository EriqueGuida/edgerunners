import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Zap, CheckCircle2, Radio } from 'lucide-react';
import { useImmersion } from '../../context/ImmersionContext';
import { soundEngine } from '../../utils/sound';

interface HoldToAcceptButtonProps {
  onAccept: () => void | Promise<void>;
  holdDurationMs?: number;
  isPsycho?: boolean;
  disabled?: boolean;
}

type ButtonPhase = 'idle' | 'holding' | 'success';

export function HoldToAcceptButton({
  onAccept,
  holdDurationMs = 1400,
  isPsycho = false,
  disabled = false,
}: HoldToAcceptButtonProps) {
  const [phase, setPhase] = useState<ButtonPhase>('idle');
  const [progressPct, setProgressPct] = useState<number>(0);
  const { reducedMotion } = useImmersion();

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

  const completeAcceptance = () => {
    isHoldingRef.current = false;
    clearTimers();
    setProgressPct(100);
    setPhase('success');
    soundEngine.playSuccess();

    window.setTimeout(() => {
      onAccept();
    }, reducedMotion ? 120 : 340);
  };

  const handleHoldStart = () => {
    if (disabled || phase === 'success' || isHoldingRef.current) return;

    if (reducedMotion) {
      completeAcceptance();
      return;
    }

    isHoldingRef.current = true;
    startTimeRef.current = Date.now();
    setPhase('holding');
    setProgressPct(0);
    soundEngine.playHoldCharge();

    fillControls.start({
      scaleX: 1,
      transition: {
        duration: holdDurationMs / 1000,
        ease: 'linear',
      },
    });

    const step = () => {
      if (!isHoldingRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, Math.floor((elapsed / holdDurationMs) * 100));
      setProgressPct(pct);

      if (elapsed < holdDurationMs) {
        rafRef.current = window.requestAnimationFrame(step);
      }
    };

    rafRef.current = window.requestAnimationFrame(step);

    timerRef.current = window.setTimeout(() => {
      if (!isHoldingRef.current) return;
      completeAcceptance();
    }, holdDurationMs);
  };

  const handleHoldAbort = () => {
    if (!isHoldingRef.current || phase === 'success') return;

    isHoldingRef.current = false;
    clearTimers();
    setPhase('idle');
    setProgressPct(0);

    fillControls.stop();
    fillControls.start({
      scaleX: 0,
      transition: {
        duration: 0.16,
        ease: 'easeOut',
      },
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.repeat) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleHoldStart();
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleHoldAbort();
    }
  };

  const baseColorClasses =
    phase === 'success'
      ? 'border-[#00E5FF] bg-[#00E5FF] text-[#07090E]'
      : isPsycho
      ? 'border-[#F43F5E]/70 bg-[#07090E] text-[#F43F5E] hover:border-[#F43F5E]'
      : 'border-[#00E5FF]/60 bg-[#07090E] text-[#00E5FF] hover:border-[#00E5FF]';

  const fillBarColor =
    phase === 'success'
      ? 'bg-[#00E5FF]'
      : isPsycho
      ? 'bg-[#F43F5E]/20'
      : 'bg-[#00E5FF]/20';

  return (
    <motion.button
      type="button"
      disabled={disabled || phase === 'success'}
      onPointerDown={handleHoldStart}
      onPointerUp={handleHoldAbort}
      onPointerLeave={handleHoldAbort}
      onPointerCancel={handleHoldAbort}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handleHoldAbort}
      aria-label={
        reducedMotion
          ? 'Aceitar contrato'
          : 'Mantenha pressionado para confirmar aceitação do contrato'
      }
      whileTap={phase !== 'success' && !reducedMotion ? { scale: 0.985 } : undefined}
      className={`relative overflow-hidden px-4 py-2.5 min-w-[180px] border font-mono text-[11px] font-semibold uppercase tracking-[0.14em] select-none cursor-pointer disabled:cursor-not-allowed transition-colors ${baseColorClasses}`}
    >
      {/* Barra de Preenchimento Progressivo */}
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
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"
        />
      )}

      {/* Rótulo Operacional */}
      <span className="relative z-10 flex items-center justify-center gap-1.5">
        {phase === 'idle' && (
          <>
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>{reducedMotion ? 'VINCULAR OPERAÇÃO' : 'SEGURE P/ ACEITAR'}</span>
          </>
        )}

        {phase === 'holding' && (
          <>
            <Radio className="w-3.5 h-3.5 shrink-0 animate-spin text-[#00E5FF]" />
            <span className="text-[#F1F5F9]">VINCULANDO {progressPct}%</span>
          </>
        )}

        {phase === 'success' && (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#07090E]" />
            <span className="text-[#07090E] font-bold">VINCULADO</span>
          </>
        )}
      </span>
    </motion.button>
  );
}

export default HoldToAcceptButton;
