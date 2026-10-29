import {
  Crosshair,
  ShieldAlert,
  Building2,
  Skull,
  CheckCircle2,
  XCircle,
  MapPin,
  FileSearch,
  Lock,
} from 'lucide-react';
import { HoldToAcceptButton } from '../ui/HoldToAcceptButton';
import type { Contract, ThreatLevel } from '../../types/contract';
import { soundEngine } from '../../utils/sound';

interface ContractCardProps {
  contract: Contract;
  onSelect?: (contract: Contract) => void;
  onAccept?: (id: number) => void;
  onComplete?: (id: number) => void;
  onFail?: (id: number) => void;
  operatorReputation?: number;
  isAccepting?: boolean;
  isProcessing?: boolean;
}

const threatStyles: Record<
  ThreatLevel,
  {
    cardBorder: string;
    topBar: string;
    badge: string;
    label: string;
  }
> = {
  LOW: {
    cardBorder: 'border-[#1E2636] hover:border-[#10B981]/60',
    topBar: 'bg-[#10B981]',
    badge: 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]',
    label: 'RISCO // BAIXO',
  },
  MEDIUM: {
    cardBorder: 'border-[#1E2636] hover:border-[#00E5FF]/60',
    topBar: 'bg-[#00E5FF]',
    badge: 'bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]',
    label: 'RISCO // MÉDIO',
  },
  HIGH: {
    cardBorder: 'border-[#1E2636] hover:border-[#F59E0B]/60',
    topBar: 'bg-[#F59E0B]',
    badge: 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]',
    label: 'RISCO // ALTO',
  },
  PSYCHO: {
    cardBorder: 'border-[#F43F5E]/40 hover:border-[#F43F5E]',
    topBar: 'bg-[#F43F5E]',
    badge: 'bg-[#F43F5E]/10 border-[#F43F5E]/50 text-[#F43F5E]',
    label: 'RISCO // CRÍTICO',
  },
};

export function ContractCard({
  contract,
  onSelect,
  onAccept,
  onComplete,
  onFail,
  operatorReputation = 999,
  isAccepting = false,
  isProcessing = false,
}: ContractCardProps) {
  const style = threatStyles[contract.threatLevel] || threatStyles.MEDIUM;
  const isPsycho = contract.threatLevel === 'PSYCHO';
  const minRep = contract.minReputation ?? 1;
  const meetsReputation = operatorReputation >= minRep;

  const formattedReward = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(contract.reward);

  const handleOpenBriefing = () => {
    if (!onSelect) return;
    soundEngine.playClick();
    onSelect(contract);
  };

  return (
    <article
      onMouseEnter={() => soundEngine.playHover()}
      className={`group relative flex flex-col justify-between bg-[#0C1017] border ${style.cardBorder} ah-corner-marks transition-all duration-200 ease-out hover:-translate-y-0.5 overflow-hidden`}
    >
      {/* Indicador superior discreto de classificação de risco */}
      <div className={`h-[2px] w-full ${style.topBar}`} />

      {/* Corpo do Card */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        {/* Topo Clicável: Identificador Único + Classificação de Risco + Título */}
        <div
          onClick={handleOpenBriefing}
          className={onSelect ? 'cursor-pointer' : undefined}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#00E5FF] tracking-[0.16em] uppercase">
                CTR-{String(contract.id).padStart(4, '0')}
              </span>
              {contract.region && (
                <span className="font-mono text-[10px] text-[#64748B] px-1.5 py-0.5 bg-[#111722] border border-[#1E2636] uppercase tracking-[0.1em]">
                  {contract.region}
                </span>
              )}
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border font-mono text-[10px] tracking-[0.14em] uppercase ${style.badge}`}
            >
              {isPsycho ? (
                <Skull className="w-3 h-3" />
              ) : (
                <ShieldAlert className="w-3 h-3" />
              )}
              {style.label}
            </span>
          </div>

          {/* Título do Contrato */}
          <h3 className="font-display font-bold text-lg text-[#F1F5F9] tracking-tight group-hover:text-[#00E5FF] transition-colors line-clamp-2">
            {contract.title}
          </h3>

          {contract.summary && (
            <p className="mt-2 font-sans text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
              {contract.summary}
            </p>
          )}
        </div>

        {/* Metadados Operacionais (Alvo, Organização, Localização e Reputação Exigida) */}
        <div
          onClick={handleOpenBriefing}
          className={`space-y-2 py-3 px-3.5 bg-[#111722] border border-[#1E2636] ${
            onSelect ? 'cursor-pointer hover:border-[#00E5FF]/30 transition-colors' : ''
          }`}
        >
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="flex items-center gap-2 text-[#64748B] uppercase tracking-[0.1em]">
              <Crosshair className="w-3.5 h-3.5 text-[#00E5FF]" />
              Alvo:
            </span>
            <span className="text-[#F1F5F9] font-medium tracking-wide truncate max-w-[62%]">
              {contract.targetName}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] border-t border-[#1E2636] pt-2">
            <span className="flex items-center gap-2 text-[#64748B] uppercase tracking-[0.1em]">
              <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
              Contratante:
            </span>
            <span className="text-[#94A3B8] tracking-wide truncate max-w-[62%]">
              {contract.faction}
            </span>
          </div>

          {contract.locationName && (
            <div className="flex items-center justify-between font-mono text-[11px] border-t border-[#1E2636] pt-2">
              <span className="flex items-center gap-2 text-[#64748B] uppercase tracking-[0.1em]">
                <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                Setor:
              </span>
              <span className="text-[#00E5FF] tracking-wide truncate max-w-[62%]">
                {contract.locationName}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between font-mono text-[11px] border-t border-[#1E2636] pt-2">
            <span className="text-[#64748B] uppercase tracking-[0.1em]">
              Clearance:
            </span>
            <span
              className={`font-medium tracking-wide ${
                meetsReputation ? 'text-[#10B981]' : 'text-[#F43F5E]'
              }`}
            >
              REP &ge; {minRep} (+{contract.reputationReward ?? 10} REP)
            </span>
          </div>
        </div>

        {/* Rodapé: Recompensa em Créditos Fictícios + Dossiê + Ações */}
        <div className="pt-3.5 border-t border-[#1E2636] flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="block font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em]">
              Recompensa Estimada
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-display text-2xl font-bold text-[#F1F5F9] tracking-tight">
                {formattedReward}
              </span>
              <span className="font-mono text-xs font-semibold text-[#00E5FF]">
                ¢
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSelect && (
              <button
                type="button"
                onClick={handleOpenBriefing}
                title="Inspecionar Dossiê Completo de Briefing"
                className="px-3 py-2.5 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF] text-[#94A3B8] hover:text-[#00E5FF] font-mono text-[11px] uppercase tracking-[0.12em] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>DOSSIÊ</span>
              </button>
            )}

            {/* 1. Catálogo (AVAILABLE): Segurar para vincular operação ou bloqueio por reputação */}
            {onAccept && contract.status === 'AVAILABLE' && (
              meetsReputation ? (
                <HoldToAcceptButton
                  onAccept={() => onAccept(contract.id)}
                  isPsycho={isPsycho}
                  disabled={isAccepting}
                />
              ) : (
                <button
                  type="button"
                  onClick={handleOpenBriefing}
                  className="px-3.5 py-2.5 bg-[#F43F5E]/10 border border-[#F43F5E]/50 text-[#F43F5E] font-mono text-[11px] uppercase tracking-[0.12em] flex items-center gap-1.5 cursor-pointer"
                  title={`Exige Reputação mínima ${minRep}`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>REP &ge; {minRep}</span>
                </button>
              )
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
                    className="px-3.5 py-2.5 bg-[#10B981]/10 border border-[#10B981]/60 text-[#10B981] hover:bg-[#10B981] hover:text-[#07090E] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                    className="px-3.5 py-2.5 bg-[#F43F5E]/10 border border-[#F43F5E]/60 text-[#F43F5E] hover:bg-[#F43F5E] hover:text-[#07090E] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>FALHAR</span>
                  </button>
                )}
              </div>
            )}

            {/* 3. Estados Finais Persistidos */}
            {contract.status === 'COMPLETED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#10B981]/10 border border-[#10B981]/50 font-mono text-[11px] font-semibold text-[#10B981] uppercase tracking-[0.14em]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CONCLUÍDO
              </span>
            )}

            {contract.status === 'FAILED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F43F5E]/10 border border-[#F43F5E]/50 font-mono text-[11px] font-semibold text-[#F43F5E] uppercase tracking-[0.14em]">
                <XCircle className="w-3.5 h-3.5" />
                FALHOU
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ContractCard;
