import {
  Crosshair,
  ShieldAlert,
  Building2,
  Skull,
  CheckCircle2,
} from 'lucide-react';
import { HoldToAcceptButton } from '../ui/HoldToAcceptButton';
import type { Contract, ThreatLevel } from '../../types/contract';

interface ContractCardProps {
  contract: Contract;
  onAccept?: (id: number) => void;
  isAccepting?: boolean;
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
    cardBorder: 'border-dark-border hover:border-neon-green',
    topBar: 'bg-neon-green',
    badge: 'bg-neon-green/10 border-neon-green text-neon-green',
    hoverGlow: 'hover:shadow-[0_0_20px_-4px_rgba(0,255,102,0.45)]',
    label: 'THREAT // LOW',
  },
  MEDIUM: {
    cardBorder: 'border-dark-border hover:border-neon-cyan',
    topBar: 'bg-neon-cyan',
    badge: 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan',
    hoverGlow: 'hover:shadow-hud-cyan',
    label: 'THREAT // MEDIUM',
  },
  HIGH: {
    cardBorder: 'border-edgerunner-yellow/40 hover:border-edgerunner-yellow',
    topBar: 'bg-edgerunner-yellow',
    badge: 'bg-edgerunner-yellow/10 border-edgerunner-yellow text-edgerunner-yellow',
    hoverGlow: 'hover:shadow-hud-yellow',
    label: 'THREAT // HIGH',
  },
  PSYCHO: {
    cardBorder: 'border-neon-pink/80 hover:border-neon-pink',
    topBar: 'bg-neon-pink',
    badge: 'bg-neon-pink/15 border-neon-pink text-neon-pink animate-pulse',
    hoverGlow: 'hover:shadow-hud-pink',
    label: 'THREAT // PSYCHO',
  },
};

export function ContractCard({ contract, onAccept, isAccepting = false }: ContractCardProps) {
  const style = threatStyles[contract.threatLevel] || threatStyles.MEDIUM;
  const isPsycho = contract.threatLevel === 'PSYCHO';

  const formattedReward = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(contract.reward);

  return (
    <article
      className={`group relative flex flex-col justify-between bg-dark-surface border-2 ${style.cardBorder} ${style.hoverGlow} cyber-chamfer transition-all duration-200 ease-out hover:-translate-y-1.5 overflow-hidden`}
    >
      {/* Barra superior de nível de ameaça */}
      <div className={`h-1 w-full ${style.topBar}`} />

      {/* Corpo do Card */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        {/* Topo: ID + Threat Level Badge */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="font-mono text-xs text-gray-500 tracking-widest uppercase">
              GIG_ID #{String(contract.id).padStart(4, '0')}
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

        {/* Dados do Alvo e Facção */}
        <div className="space-y-2.5 py-3.5 px-4 bg-dark-card/90 border border-dark-border">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-2 text-gray-400 uppercase">
              <Crosshair className="w-3.5 h-3.5 text-neon-pink" />
              Target:
            </span>
            <span className="text-white font-semibold tracking-wider uppercase truncate max-w-[60%]">
              {contract.targetName}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs border-t border-dark-border/60 pt-2">
            <span className="flex items-center gap-2 text-gray-400 uppercase">
              <Building2 className="w-3.5 h-3.5 text-neon-cyan" />
              Faction:
            </span>
            <span className="text-neon-cyan tracking-wider uppercase truncate max-w-[60%]">
              {contract.faction}
            </span>
          </div>
        </div>

        {/* Rodapé: Recompensa em Eddies + Botão HoldToAccept */}
        <div className="pt-2 border-t border-dark-border flex items-end justify-between gap-4">
          <div>
            <span className="block font-mono text-[10px] text-gray-400 uppercase tracking-widest">
              Bounty Reward
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-sm font-bold text-neon-green">€$</span>
              <span className="font-mono text-2xl font-bold text-edgerunner-yellow drop-shadow-neon-yellow tracking-tight">
                {formattedReward}
              </span>
            </div>
          </div>

          {onAccept && contract.status === 'AVAILABLE' && (
            <HoldToAcceptButton
              onAccept={() => onAccept(contract.id)}
              isPsycho={isPsycho}
              disabled={isAccepting}
            />
          )}

          {contract.status !== 'AVAILABLE' && (
            <span className="inline-flex items-center gap-1 font-mono text-xs text-neon-cyan uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" />
              {contract.status}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ContractCard;
