import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crosshair,
  Building2,
  MapPin,
  Globe2,
  ShieldAlert,
  Skull,
  CheckCircle2,
  XCircle,
  Lock,
  Terminal,
  Award,
  FileText,
  ListChecks,
  AlertTriangle,
} from 'lucide-react';
import type { Contract, ThreatLevel } from '../../types/contract';
import { HoldToAcceptButton } from '../ui/HoldToAcceptButton';
import { useImmersion } from '../../context/ImmersionContext';
import { soundEngine } from '../../utils/sound';
import gridFrankfurtImg from '../../assets/afterhours-grid-frankfurt.jpg';

interface ContractBriefingDrawerProps {
  contract: Contract | null;
  onClose: () => void;
  onAccept?: (contract: Contract) => void | Promise<void>;
  onComplete?: (id: number) => void;
  onFail?: (id: number) => void;
  operatorReputation?: number;
  isAccepting?: boolean;
  isProcessing?: boolean;
}

const THREAT_META: Record<
  ThreatLevel,
  {
    label: string;
    badge: string;
    accentLine: string;
  }
> = {
  LOW: {
    label: 'RISCO // BAIXO',
    badge: 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]',
    accentLine: 'bg-[#10B981]',
  },
  MEDIUM: {
    label: 'RISCO // MÉDIO',
    badge: 'bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]',
    accentLine: 'bg-[#00E5FF]',
  },
  HIGH: {
    label: 'RISCO // ALTO',
    badge: 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]',
    accentLine: 'bg-[#F59E0B]',
  },
  PSYCHO: {
    label: 'RISCO // CRÍTICO',
    badge: 'bg-[#F43F5E]/10 border-[#F43F5E]/50 text-[#F43F5E]',
    accentLine: 'bg-[#F43F5E]',
  },
};

function formatCoordinates(lat?: number, lng?: number): string {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return '35.6895° N, 139.6917° E';
  }
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function ContractBriefingDrawer({
  contract,
  onClose,
  onAccept,
  onComplete,
  onFail,
  operatorReputation = 1,
  isAccepting = false,
  isProcessing = false,
}: ContractBriefingDrawerProps) {
  const { reducedMotion } = useImmersion();

  useEffect(() => {
    if (!contract) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [contract, onClose]);

  if (!contract) return null;

  const meta = THREAT_META[contract.threatLevel] || THREAT_META.MEDIUM;
  const isPsycho = contract.threatLevel === 'PSYCHO';
  const minRep = contract.minReputation ?? 1;
  const repReward = contract.reputationReward ?? 10;
  const meetsReputation = operatorReputation >= minRep;

  const formattedReward = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(contract.reward);

  const objectivesList = contract.objectives
    ? contract.objectives
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean)
    : [
        `Estabelecer acesso furtivo ao perímetro de ${contract.targetName}`,
        `Executar protocolo tático solicitado por ${contract.faction}`,
        'Transmitir telemetria criptografada de confirmação e evadir do setor',
      ];

  const narrativeBriefing =
    contract.briefing ||
    contract.summary ||
    `Dossiê operacional classificado emitido por ${contract.faction}. O operador credenciado deverá infiltrar-se no setor ${contract.locationName || 'designado'}, cumprir os objetivos primários sobre ${contract.targetName} e registrar o hash de verificação na rede AFTERHOURS.`;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex justify-end bg-[#07090E]/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="briefing-drawer-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            soundEngine.playClick();
            onClose();
          }
        }}
      >
        <motion.aside
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 48 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 48 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl h-full bg-[#0C1017] border-l border-[#1E2636] flex flex-col justify-between overflow-hidden shadow-2xl"
        >
          {/* Barra superior de classificação de risco */}
          <div className={`h-[2px] w-full shrink-0 ${meta.accentLine}`} />

          {/* TOP BAR DO DOSSIÊ */}
          <header className="px-6 py-4 border-b border-[#1E2636] bg-[#0C1017] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <span className="font-mono text-[11px] tracking-[0.18em] text-[#00E5FF] uppercase">
                DOSSIÊ OPERACIONAL // CTR-{String(contract.id).padStart(4, '0')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-3 py-1.5 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF]/60 font-mono text-[11px] text-[#94A3B8] hover:text-[#F1F5F9] tracking-[0.14em] uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>ESC</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </header>

          {/* CORPO SCROLLABLE DO BRIEFING */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1E2636]">
            {/* 1. HERO CARTOGRÁFICO & IDENTIFICAÇÃO DO ALVO */}
            <div className="relative p-6 md:p-8 overflow-hidden">
              <img
                src={gridFrankfurtImg}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-20 saturate-[0.75]"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0C1017] via-[#0C1017]/85 to-[#0C1017]/60"
                aria-hidden="true"
              />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border font-mono text-[10px] tracking-[0.14em] uppercase ${meta.badge}`}
                  >
                    {isPsycho ? (
                      <Skull className="w-3 h-3" />
                    ) : (
                      <ShieldAlert className="w-3 h-3" />
                    )}
                    {meta.label}
                  </span>

                  {contract.region && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#111722] border border-[#1E2636] font-mono text-[10px] text-[#94A3B8] tracking-[0.14em] uppercase">
                      <Globe2 className="w-3 h-3 text-[#00E5FF]" />
                      {contract.region}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#111722] border border-[#1E2636] font-mono text-[10px] text-[#F1F5F9] tracking-[0.14em] uppercase">
                    STATUS: {contract.status}
                  </span>
                </div>

                <h2
                  id="briefing-drawer-title"
                  className="font-display font-bold text-2xl md:text-3xl text-[#F1F5F9] tracking-tight leading-snug"
                >
                  {contract.title}
                </h2>

                {contract.summary && (
                  <p className="mt-2.5 font-sans text-sm text-[#94A3B8] leading-relaxed">
                    {contract.summary}
                  </p>
                )}

                {/* Grade de Telemetria Geográfica e Contratante */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#111722]/90 border border-[#1E2636] p-4">
                  <div>
                    <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] flex items-center gap-1.5">
                      <Crosshair className="w-3 h-3 text-[#00E5FF]" />
                      Alvo Primário
                    </span>
                    <p className="font-mono text-xs text-[#F1F5F9] font-medium mt-1">
                      {contract.targetName}
                    </p>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-[#00E5FF]" />
                      Organização Contratante
                    </span>
                    <p className="font-mono text-xs text-[#F1F5F9] font-medium mt-1">
                      {contract.faction}
                    </p>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#00E5FF]" />
                      Localização / Setor
                    </span>
                    <p className="font-mono text-xs text-[#00E5FF] mt-1">
                      {contract.locationName || 'Perímetro Urbano Classificado'}
                    </p>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-[#00E5FF]" />
                      Coordenadas WGS84
                    </span>
                    <p className="font-mono text-xs text-[#94A3B8] mt-1">
                      {formatCoordinates(contract.latitude, contract.longitude)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MATRIZ DE LIQUIDAÇÃO & CLEARANCE DE REPUTAÇÃO */}
            <div className="p-6 md:px-8 bg-[#07090E]/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#111722] border border-[#1E2636]">
                <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] block">
                  Recompensa Líquida
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-display font-bold text-2xl text-[#F1F5F9]">
                    {formattedReward}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#00E5FF]">
                    ¢
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#111722] border border-[#1E2636]">
                <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] block">
                  Progressão de Reputação
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <Award className="w-4 h-4 text-[#10B981] self-center" />
                  <span className="font-display font-bold text-2xl text-[#10B981]">
                    +{repReward}
                  </span>
                  <span className="font-mono text-xs text-[#94A3B8]">REP</span>
                </div>
              </div>

              <div
                className={`p-4 border ${
                  meetsReputation
                    ? 'bg-[#111722] border-[#1E2636]'
                    : 'bg-[#F43F5E]/10 border-[#F43F5E]/50'
                }`}
              >
                <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] block">
                  Clearance Exigido
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span
                    className={`font-display font-bold text-xl ${
                      meetsReputation ? 'text-[#F1F5F9]' : 'text-[#F43F5E]'
                    }`}
                  >
                    REP &ge; {minRep}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 border uppercase ${
                      meetsReputation
                        ? 'border-[#10B981]/40 text-[#10B981] bg-[#10B981]/10'
                        : 'border-[#F43F5E]/50 text-[#F43F5E] bg-[#F43F5E]/15'
                    }`}
                  >
                    {meetsReputation ? ' ELEGÍVEL' : 'BLOQUEADO'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. CONTEXTO NARRATIVO DO BRIEFING */}
            <div className="p-6 md:px-8 space-y-3">
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.16em]">
                <FileText className="w-3.5 h-3.5" />
                <span>01 // BRIEFING TÁTICO E CONTEXTO</span>
              </div>
              <p className="font-sans text-sm text-[#F1F5F9]/90 leading-relaxed bg-[#111722]/60 border border-[#1E2636] p-4">
                {narrativeBriefing}
              </p>
            </div>

            {/* 4. OBJETIVOS OPERACIONAIS */}
            <div className="p-6 md:px-8 space-y-3">
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.16em]">
                <ListChecks className="w-3.5 h-3.5" />
                <span>02 // PROTOCOLO DE OBJETIVOS</span>
              </div>
              <ol className="space-y-2.5">
                {objectivesList.map((obj, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3.5 bg-[#111722] border border-[#1E2636]"
                  >
                    <span className="font-mono text-[11px] font-semibold text-[#00E5FF] px-2 py-0.5 bg-[#07090E] border border-[#1E2636] shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="font-sans text-sm text-[#F1F5F9] leading-relaxed">
                      {obj}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* 5. REQUISITOS, RESTRIÇÕES & VERIFICAÇÃO */}
            <div className="p-6 md:px-8 space-y-4">
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.16em]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>03 // PARÂMETROS DE ENGAJAMENTO & AUDITORIA</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 bg-[#111722] border border-[#1E2636]">
                  <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] block mb-1">
                    Condições e Restrições de Campo
                  </span>
                  <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                    {contract.requirements ||
                      'Operação sob sigilo estrito. Qualquer comprometimento da malha AFTERHOURS implicará encerramento imediato do contrato.'}
                  </p>
                </div>

                {contract.verificationPrompt && (
                  <div className="p-4 bg-[#111722] border border-[#1E2636]">
                    <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.14em] block mb-1">
                      Protocolo de Comprovação Pós-Operação
                    </span>
                    <p className="font-mono text-xs text-[#F1F5F9]">
                      {contract.verificationPrompt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER FIXO DE ASSINATURA TÁTICA (HoldToAcceptButton) */}
          <footer className="p-6 border-t border-[#1E2636] bg-[#07090E] shrink-0">
            {contract.status === 'AVAILABLE' && onAccept ? (
              <div className="space-y-3">
                {!meetsReputation && (
                  <div className="p-3 bg-[#F43F5E]/10 border border-[#F43F5E]/50 flex items-center gap-2.5 font-mono text-xs text-[#F43F5E]">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>
                      CLEARANCE INSUFICIENTE: Este contrato exige Reputação mínima{' '}
                      <strong>{minRep}</strong> (sua Reputação atual:{' '}
                      <strong>{operatorReputation}</strong>).
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] block">
                      Assinatura Criptográfica do Operador
                    </span>
                    <span className="font-sans text-xs text-[#94A3B8]">
                      Pressione e segure (ou use Espaço/Enter) para vincular a operação.
                    </span>
                  </div>

                  <HoldToAcceptButton
                    onAccept={() => onAccept(contract)}
                    isPsycho={isPsycho}
                    disabled={isAccepting || !meetsReputation}
                  />
                </div>
              </div>
            ) : contract.status === 'ACCEPTED' && (onComplete || onFail) ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.14em] block">
                    OPERAÇÃO VINCULADA AO SEU TERMINAL
                  </span>
                  <span className="font-sans text-xs text-[#94A3B8]">
                    Submeta a conclusão para liquidar {formattedReward} ¢ na carteira.
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {onComplete && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => {
                        soundEngine.playClick();
                        onComplete(contract.id);
                      }}
                      className="px-4 py-2.5 bg-[#10B981] hover:bg-[#10B981]/90 text-[#07090E] font-mono text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CONCLUIR OPERAÇÃO</span>
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
                      className="px-4 py-2.5 bg-[#F43F5E]/10 border border-[#F43F5E]/60 hover:bg-[#F43F5E] text-[#F43F5E] hover:text-[#07090E] font-mono text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>REPORTAR FALHA</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between font-mono text-xs text-[#94A3B8]">
                <span>ESTADO DO REGISTRO: {contract.status}</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF] text-[#F1F5F9] uppercase tracking-[0.14em] cursor-pointer"
                >
                  FECHAR DOSSIÊ
                </button>
              </div>
            )}
          </footer>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}

export default ContractBriefingDrawer;
