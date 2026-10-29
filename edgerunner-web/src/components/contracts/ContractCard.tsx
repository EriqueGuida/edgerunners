import {
  Crosshair,
  ShieldAlert,
  Building2,
  Skull,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { HoldToAcceptButton } from '../ui/HoldToAcceptButton';
import type { Contract, ThreatLevel } from '../../types/contract';
import { soundEngine } from '../../utils/sound';

interface ContractCardProps {
  contract: Contract;
  onAccept?: (id: number) => void;
  onComplete?: (id: number) => void;
  onFail?: (id: number) => void;
  isAccepting?: boolean;
  isProcessing?: boolean;
}

const threatStyles: Record<
  ThreatLevel,
  {
    cardBorder: string;
    topBar: string;
    badge: string;
    hoverGlow: string;
    label: string;
  }
> = {
  LOW: {
    cardBorder: 'border-dark-border hover:border-neon-green/80',
    topBar: 'bg-neon-green',
    badge: 'bg-neon-green/10 border-neon-green/60 text-neon-green',
    hoverGlow: 'hover:shadow-hud-emerald',
    label: 'RISCO // BAIXO',
  },
  MEDIUM: {
    cardBorder: 'border-dark-border hover:border-neon-cyan/80',
    topBar: 'bg-neon-cyan',
    badge: 'bg-neon-cyan/10 border-neon-cyan/60 text-neon-cyan',
    hoverGlow: 'hover:shadow-hud-cyan',
    label: 'RISCO // MÉDIO',
  },
  HIGH: {
    cardBorder: 'border-edgerunner-yellow/35 hover:border-edgerunner-yellow',
    topBar: 'bg-edgerunner-yellow',
    badge: 'bg-edgerunner-yellow/10 border-edgerunner-yellow/70 text-edgerunner-yellow',
    hoverGlow: 'hover:shadow-hud-yellow',
    label: 'RISCO // ALTO',
  },
  PSYCHO: {
    cardBorder: 'border-neon-pink/60 hover:border-neon-pink',
    topBar: 'bg-neon-pink',
    badge: 'bg-neon-pink/15 border-neon-pink text-neon-pink',
    hoverGlow: 'hover:shadow-hud-pink',
    label: 'RISCO // CRÍTICO',
  },
};

export function ContractCard({
  contract,
  onAccept,
  onComplete,
  onFail,
  isAccepting = false,
  isProcessing = false,
}: ContractCardProps) {
  const style = threatStyles[contract.threatLevel] || threatStyles.MEDIUM;
  const isPsycho = contract.threatLevel === 'PSYCHO';

  const formattedReward = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(contract.reward);

  return (
    <article
      onMouseEnter={() => soundEngine.playHover()}
      className={`group relative flex flex-col justify-between bg-dark-surface border ${style.cardBorder} ${style.hoverGlow} cyber-chamfer ah-reticle transition-all duration-200 ease-out hover:-translate-y-1 overflow-hidden`}
    >
      {/* Indicador superior de classificação de risco */}
      <div className={`h-1 w-full ${style.topBar}`} />

      {/* Corpo do Card */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        {/* Topo: Identificador Único + Classificação de Risco */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="font-mono text-xs text-gray-400 tracking-widest uppercase">
              CTR #{String(contract.id).padStart(4, '0')}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border font-mono text-[11px] tracking-widest uppercase ${style.badge}`}
            >
              {isPsycho ? (
                <Skull className="w-3.5 h-3.5" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" />
              )}
              {style.label}
            </span>
          </div>

          {/* Título do Contrato */}
          <h3 className="font-display font-bold text-xl text-white tracking-wide uppercase group-hover:text-edgerunner-yellow transition-colors line-clamp-2">
            {contract.title}
          </h3>
        </div>

        {/* Metadados Operacionais (Alvo e Organização/Facção) */}
        <div className="space-y-2.5 py-3.5 px-4 bg-dark-card/90 border border-dark-border">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-2 text-gray-400 uppercase">
              <Crosshair className="w-3.5 h-3.5 text-neon-pink" />
              Alvo / Objetivo:
            </span>
            <span className="text-white font-semibold tracking-wider uppercase truncate max-w-[58%]">
              {contract.targetName}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs border-t border-dark-border/60 pt-2">
            <span className="flex items-center gap-2 text-gray-400 uppercase">
              <Building2 className="w-3.5 h-3.5 text-neon-cyan" />
              Organização:
            </span>
            <span className="text-neon-cyan tracking-wider uppercase truncate max-w-[58%]">
              {contract.faction}
            </span>
          </div>
        </div>

        {/* Rodapé: Recompensa em Créditos Fictícios + Ações */}
        <div className="pt-3 border-t border-dark-border flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="block font-mono text-[10px] text-gray-400 uppercase tracking-widest">
              Recompensa Estimada
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-mono text-xs font-bold text-neon-green uppercase">
                CR¢
              </span>
              <span className="font-mono text-2xl font-bold text-edgerunner-yellow tracking-tight">
                {formattedReward}
              </span>
            </div>
          </div>

          {/* 1. Catálogo (AVAILABLE): Segurar para vincular operação */}
          {onAccept && contract.status === 'AVAILABLE' && (
            <HoldToAcceptButton
              onAccept={() => onAccept(contract.id)}
              isPsycho={isPsycho}
              disabled={isAccepting}
            />
          )}

          {/* 2. Operações em Andamento (ACCEPTED): Concluir ou Reportar Falha */}
          {contract.status === 'ACCEPTED' && (onComplete || onFail) && (
            <div className="flex items-center gap-2">
              {onComplete && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    soundEngine.playClick();
                    onComplete(contract.id);
                  }}
                  className="px-3.5 py-2 bg-neon-green/10 border border-neon-green text-neon-green hover:bg-neon-green hover:text-dark-bg hover:shadow-hud-emerald font-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CONCLUIR</span>
                </button>
              )}

              {onFail && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    soundEngine.playClick();
                    onFail(contract.id);
                  }}
                  className="px-3.5 py-2 bg-neon-pink/10 border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-dark-bg hover:shadow-hud-pink font-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>FALHAR</span>
                </button>
              )}
            </div>
          )}

          {/* 3. Estados Finais Persistidos */}
          {contract.status === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neon-green/10 border border-neon-green font-mono text-xs font-bold text-neon-green uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" />
              CONCLUÍDO
            </span>
          )}

          {contract.status === 'FAILED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neon-pink/10 border border-neon-pink font-mono text-xs font-bold text-neon-pink uppercase tracking-widest">
              <XCircle className="w-4 h-4" />
              FALHOU
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ContractCard;
