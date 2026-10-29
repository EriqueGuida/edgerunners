import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Award,
  Briefcase,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Terminal,
  KeyRound,
  FileCheck2,
  Sparkles,
  X,
  ArrowUpRight,
  ListChecks,
  CheckSquare,
  Square,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useImmersion } from '../context/ImmersionContext';
import { ContractCard } from '../components/contracts/ContractCard';
import { ContractBriefingDrawer } from '../components/contracts/ContractBriefingDrawer';
import {
  DEMO_MY_CONTRACTS_KEY,
  getLocalMyContracts,
  pushLocalNotification,
  recordLocalSettlement,
} from '../services/contractStore';
import type { Contract, ContractStatus } from '../types/contract';
import { soundEngine } from '../utils/sound';

export { DEMO_MY_CONTRACTS_KEY };

const STATUS_FILTER_LABELS: Record<ContractStatus | 'ALL', string> = {
  ALL: 'TODOS',
  AVAILABLE: 'DISPONÍVEIS',
  ACCEPTED: 'EM EXECUÇÃO',
  COMPLETED: 'CONCLUÍDOS',
  FAILED: 'FALHOS',
};

interface FeedbackBanner {
  type: 'success' | 'error';
  message: string;
}

interface SettlementCeremonyData {
  contract: Contract;
  rewardPaid: number;
  reputationEarned: number;
  newBalance: number;
  newReputation: number;
  submissionHash: string;
}

export function MyContracts() {
  const { operator, isDemoMode, adjustLocalStats, refreshProfile } = useAuth();
  const { reducedMotion } = useImmersion();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Estado para o Terminal de Submissão de Resultado (RF-063 a RF-066)
  const [submissionTarget, setSubmissionTarget] = useState<Contract | null>(null);
  const [submissionHash, setSubmissionHash] = useState<string>('');
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [checkedObjectives, setCheckedObjectives] = useState<Record<string, boolean>>({});

  // Estado para a Cerimônia de Liquidação Cinematográfica
  const [ceremonyData, setCeremonyData] = useState<SettlementCeremonyData | null>(null);

  const operatorCallsign = operator?.callsign || operator?.username || 'OP_VANGUARD';
  const credits = operator?.balance ?? operator?.eddies ?? 0;
  const reputation = operator?.reputation ?? operator?.streetCred ?? 1;

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    window.setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  const fetchMyContracts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    if (isDemoMode) {
      setContracts(getLocalMyContracts());
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<Contract[]>('/api/contracts/my-contracts');
      setContracts(response.data);
      await refreshProfile();
    } catch {
      setLoadError(
        'Não foi possível sincronizar suas operações com o servidor.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, refreshProfile]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    if (isDemoMode) {
      setContracts(getLocalMyContracts());
      setIsLoading(false);
      return;
    }

    api
      .get<Contract[]>('/api/contracts/my-contracts')
      .then((res) => {
        if (!cancelled) {
          setContracts(res.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(
            'Não foi possível sincronizar suas operações com o servidor.'
          );
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isDemoMode]);

  // Abre o Terminal de Submissão de Resultado quando o operador clica em CONCLUIR
  const openSubmissionTerminal = (id: number) => {
    const target = contracts.find((c) => c.id === id);
    if (!target) return;
    soundEngine.playClick();
    setSelectedContract(null);
    setSubmissionTarget(target);
    setSubmissionHash(
      `AH-TELEMETRY-${String(target.id).padStart(4, '0')}-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`
    );
    setSubmissionNotes(
      `Objetivos primários executados no setor ${
        target.locationName || 'designado'
      } sem comprometimento da rede.`
    );
  };

  const handleConfirmSubmission = async (e: FormEvent) => {
    e.preventDefault();
    if (!submissionTarget) return;

    const id = submissionTarget.id;
    const cleanHash =
      submissionHash.trim() ||
      `AH-RECEIPT-${String(id).padStart(4, '0')}`;
    const cleanNotes = submissionNotes.trim();
    const repReward = submissionTarget.reputationReward ?? 10;

    setProcessingId(id);
    try {
      let finalContract: Contract = {
        ...submissionTarget,
        status: 'COMPLETED',
      };

      if (!isDemoMode) {
        const response = await api.post<Contract>(
          `/api/operations/${id}/submissions`,
          {
            submissionHash: cleanHash,
            submissionNotes: cleanNotes,
          }
        );
        finalContract = response.data;
        const updated = contracts.map((c) => (c.id === id ? finalContract : c));
        setContracts(updated);
        await refreshProfile();
      } else {
        const updated = contracts.map((c) =>
          c.id === id ? finalContract : c
        );
        setContracts(updated);
        localStorage.setItem(DEMO_MY_CONTRACTS_KEY, JSON.stringify(updated));

        const nextBalance = credits + submissionTarget.reward;
        const nextRep = reputation + repReward;
        adjustLocalStats(submissionTarget.reward, repReward);
        recordLocalSettlement(
          submissionTarget,
          nextBalance,
          nextRep,
          cleanHash
        );
        pushLocalNotification(
          `LIQUIDAÇÃO CONFIRMADA // CTR-${String(id).padStart(4, '0')}`,
          `Recompensa de ${new Intl.NumberFormat('pt-BR').format(
            submissionTarget.reward
          )} ¢ e +${repReward} REP creditados (Protocolo: ${cleanHash}).`,
          'SUCCESS'
        );
      }

      soundEngine.playSuccess();
      setSubmissionTarget(null);
      setCeremonyData({
        contract: finalContract,
        rewardPaid: submissionTarget.reward,
        reputationEarned: repReward,
        newBalance: credits + submissionTarget.reward,
        newReputation: reputation + repReward,
        submissionHash: cleanHash,
      });
    } catch (err: unknown) {
      soundEngine.playWarning();
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      triggerFeedback(
        'error',
        axiosErr.response?.data?.message ||
          axiosErr.response?.data?.error ||
          'FALHA DE TRANSMISSÃO: Não foi possível registrar o comprovante da operação no servidor.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleFailContract = async (id: number) => {
    setProcessingId(id);
    try {
      if (!isDemoMode) {
        const response = await api.patch<Contract>(`/api/contracts/${id}/fail`);
        const updated = contracts.map((c) => (c.id === id ? response.data : c));
        setContracts(updated);
        setSelectedContract((prev) => (prev?.id === id ? response.data : prev));
      } else {
        const updated = contracts.map((c) =>
          c.id === id ? { ...c, status: 'FAILED' as const } : c
        );
        setContracts(updated);
        setSelectedContract((prev) =>
          prev?.id === id ? { ...prev, status: 'FAILED' } : prev
        );
        localStorage.setItem(DEMO_MY_CONTRACTS_KEY, JSON.stringify(updated));
      }

      soundEngine.playWarning();
      triggerFeedback(
        'error',
        `OPERAÇÃO CTR-${String(id).padStart(4, '0')} ENCERRADA SEM SUCESSO // REGISTRO ARQUIVADO.`
      );
    } catch (err: unknown) {
      soundEngine.playWarning();
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      triggerFeedback(
        'error',
        axiosErr.response?.data?.message ||
          axiosErr.response?.data?.error ||
          'FALHA DE TRANSMISSÃO: Não foi possível atualizar o estado da operação no servidor.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const toggleObjectiveCheck = (contractId: number, index: number) => {
    soundEngine.playClick();
    const key = `${contractId}-${index}`;
    setCheckedObjectives((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const activeOperations = contracts.filter((c) => c.status === 'ACCEPTED');
  const completedCount = contracts.filter((c) => c.status === 'COMPLETED').length;

  const filteredContracts =
    statusFilter === 'ALL'
      ? contracts
      : contracts.filter((c) => c.status === statusFilter);

  const formattedCredits = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(credits);

  return (
    <div className="space-y-8">
      {/* =========================================================
          1. INDICADORES DO OPERADOR (CARTEIRA FICTÍCIA & REPUTAÇÃO)
         ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          key={`credits-${credits}`}
          initial={{ scale: 0.99 }}
          animate={{ scale: 1 }}
          className="bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks relative overflow-hidden"
        >
          <div className="h-[1px] w-full bg-[#00E5FF] absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#64748B] uppercase tracking-[0.16em]">
              CARTEIRA OPERACIONAL
            </span>
            <Link
              to="/profile"
              className="font-mono text-[10px] text-[#00E5FF] hover:underline flex items-center gap-1"
            >
              <span>EXTRATO</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-bold text-[#F1F5F9]">
              {formattedCredits}
            </span>
            <span className="font-mono text-sm font-semibold text-[#00E5FF]">¢</span>
          </div>
          <p className="mt-2.5 font-mono text-[11px] text-[#64748B] uppercase tracking-[0.14em]">
            OPERADOR: <strong className="text-[#F1F5F9]">{operatorCallsign}</strong>
          </p>
        </motion.div>

        <motion.div
          key={`rep-${reputation}`}
          initial={{ scale: 0.99 }}
          animate={{ scale: 1 }}
          className="bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks relative overflow-hidden"
        >
          <div className="h-[1px] w-full bg-[#00E5FF]/60 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#64748B] uppercase tracking-[0.16em]">
              ÍNDICE DE REPUTAÇÃO
            </span>
            <div className="w-8 h-8 bg-[#111722] border border-[#1E2636] flex items-center justify-center">
              <Award className="w-4 h-4 text-[#00E5FF]" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-[11px] uppercase text-[#00E5FF] tracking-[0.14em]">
              REP
            </span>
            <span className="font-display text-3xl font-bold text-[#F1F5F9]">
              {reputation}
            </span>
            <span className="font-mono text-[11px] text-[#10B981] ml-2">
              +REP / MISSÃO
            </span>
          </div>
          <p className="mt-2.5 font-mono text-[11px] text-[#64748B] uppercase tracking-[0.14em]">
            CREDENCIAL:{' '}
            <strong className="text-[#00E5FF]">
              {reputation >= 30
                ? 'OPERADOR SÊNIOR // NÍVEL ALFA'
                : 'OPERADOR VERIFICADO'}
            </strong>
          </p>
        </motion.div>

        <div className="bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks relative overflow-hidden">
          <div className="h-[1px] w-full bg-[#10B981]/60 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#64748B] uppercase tracking-[0.16em]">
              TELEMETRIA DE MISSÕES
            </span>
            <div className="w-8 h-8 bg-[#111722] border border-[#1E2636] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#10B981]" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 pt-0.5">
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em]">
                EM EXECUÇÃO
              </span>
              <span className="font-display text-2xl font-bold text-[#00E5FF]">
                {activeOperations.length}
              </span>
            </div>
            <div className="border-l border-[#1E2636] pl-4">
              <span className="block font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em]">
                CONCLUÍDAS
              </span>
              <span className="font-display text-2xl font-bold text-[#10B981]">
                {completedCount}
              </span>
            </div>
          </div>
          <p className="mt-2.5 font-mono text-[11px] text-[#64748B] uppercase tracking-[0.14em]">
            REGISTROS VINCULADOS:{' '}
            <strong className="text-[#F1F5F9]">{contracts.length}</strong>
          </p>
        </div>
      </div>

      {/* =========================================================
          2. CHECKLIST TÁTICO DAS OPERAÇÕES EM EXECUÇÃO (RF-061, RF-063)
         ========================================================= */}
      {activeOperations.length > 0 && (
        <section className="border border-[#1E2636] bg-[#0C1017] p-6 md:p-8 ah-corner-marks space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2636] pb-4">
            <div>
              <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" />
                FIELD EXECUTION CHECKLIST // PROTOCOLOS ATIVOS
              </span>
              <h2 className="font-display font-bold text-xl text-[#F1F5F9] mt-0.5">
                Acompanhamento de Objetivos &amp; Submissão de Resultado
              </h2>
            </div>
            <span className="font-mono text-[11px] text-[#94A3B8]">
              Marque os objetivos cumpridos em campo e submeta o hash de verificação
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {activeOperations.map((op) => {
              const objectives = op.objectives
                ? op.objectives.split(';').map((s) => s.trim()).filter(Boolean)
                : [
                    `Infiltrar perímetro de ${op.targetName}`,
                    `Executar protocolo solicitado por ${op.faction}`,
                    'Transmitir hash de comprovação na malha AFTERHOURS',
                  ];

              return (
                <div
                  key={op.id}
                  className="p-5 bg-[#111722] border border-[#1E2636] flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.14em]">
                        CTR-{String(op.id).padStart(4, '0')} // {op.locationName || op.faction}
                      </span>
                      <span className="font-display font-bold text-base text-[#F1F5F9]">
                        {new Intl.NumberFormat('pt-BR').format(op.reward)}{' '}
                        <span className="font-mono text-xs text-[#00E5FF]">¢</span>
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-[#F1F5F9]">
                      {op.title}
                    </h3>

                    <div className="mt-3 space-y-2">
                      {objectives.map((obj, idx) => {
                        const isChecked = Boolean(
                          checkedObjectives[`${op.id}-${idx}`]
                        );
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleObjectiveCheck(op.id, idx)}
                            className={`w-full text-left p-2.5 border font-sans text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                              isChecked
                                ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#F1F5F9]'
                                : 'bg-[#07090E] border-[#1E2636] text-[#94A3B8] hover:border-[#00E5FF]/40'
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
                            )}
                            <span className={isChecked ? 'line-through opacity-80' : ''}>
                              {obj}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1E2636] flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.12em]">
                      RECOMPENSA: +{op.reputationReward ?? 10} REP
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openSubmissionTerminal(op.id)}
                        className="px-4 py-2 bg-[#00E5FF] hover:bg-[#33ECFF] text-[#07090E] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>SUBMETER RESULTADO</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFailContract(op.id)}
                        className="px-3 py-2 bg-[#F43F5E]/10 border border-[#F43F5E]/50 hover:bg-[#F43F5E] text-[#F43F5E] hover:text-[#07090E] font-mono text-[11px] uppercase tracking-[0.14em] transition-colors cursor-pointer"
                      >
                        ABORTAR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================
          NOTIFICAÇÃO DE FEEDBACK OPERACIONAL
         ========================================================= */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 border font-mono text-xs uppercase tracking-[0.14em] flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-[#10B981]/10 border-[#10B981]/60 text-[#10B981]'
                : 'bg-[#F43F5E]/10 border-[#F43F5E]/60 text-[#F43F5E]'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-[11px] underline opacity-75 hover:opacity-100 cursor-pointer"
            >
              FECHAR
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          3. CABEÇALHO E FILTROS DO HISTÓRICO DE OPERAÇÕES
         ========================================================= */}
      <div className="border border-[#1E2636] bg-[#0C1017] p-6 md:p-8 ah-corner-marks relative overflow-hidden">
        <div className="h-[1px] w-full bg-[#00E5FF]/50 absolute top-0 left-0" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.18em] flex items-center gap-2 mb-1.5">
              <Terminal className="w-3.5 h-3.5" />
              OPERATIONS ROOM // ACT_03
            </span>
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-[#F1F5F9]">
              Sala de Operações &amp; Histórico
            </h1>
            <p className="font-sans text-sm text-[#94A3B8] mt-1">
              Inspecione dossiês vinculados, envie relatórios criptográficos de conclusão e audite o registro completo de missões.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              fetchMyContracts();
            }}
            disabled={isLoading}
            className="self-start md:self-auto px-4 py-2.5 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF]/60 text-[#F1F5F9] font-mono text-[11px] uppercase tracking-[0.16em] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isLoading ? 'animate-spin text-[#00E5FF]' : 'text-[#94A3B8]'
              }`}
            />
            <span>SINCRONIZAR REGISTRO</span>
          </button>
        </div>

        {/* Filtros por Estado da Operação */}
        <div className="mt-6 pt-5 border-t border-[#1E2636] flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.16em] mr-2">
            ESTADO:
          </span>
          {(['ALL', 'ACCEPTED', 'COMPLETED', 'FAILED'] as const).map((status) => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setStatusFilter(status);
                }}
                className={`px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF] font-semibold'
                    : 'bg-[#111722] border-[#1E2636] text-[#94A3B8] hover:border-[#00E5FF]/40 hover:text-[#F1F5F9]'
                }`}
              >
                {STATUS_FILTER_LABELS[status]}
              </button>
            );
          })}
        </div>
      </div>

      {loadError && (
        <div
          role="alert"
          className="p-4 bg-[#F43F5E]/10 border border-[#F43F5E]/60 text-[#F43F5E] flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-[0.14em]"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={fetchMyContracts}
            className="underline hover:opacity-80 cursor-pointer"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      )}

      {isDemoMode && (
        <div className="p-3.5 bg-[#F59E0B]/10 border border-[#F59E0B]/50 text-[#F59E0B] flex items-center gap-2.5 font-mono text-[11px]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            MODO DEMONSTRAÇÃO ATIVO: Submissões realizadas aqui disparam a Cerimônia de Liquidação simulada localmente sem persistência no servidor.
          </span>
        </div>
      )}

      {/* =========================================================
          4. LISTAGEM DE OPERAÇÕES
         ========================================================= */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3].map((skeleton) => (
            <div
              key={skeleton}
              className="h-64 bg-[#0C1017] border border-[#1E2636] p-6 animate-pulse"
            />
          ))}
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="border border-[#1E2636] bg-[#0C1017] p-12 text-center ah-corner-marks">
          <Briefcase className="w-8 h-8 text-[#64748B] mx-auto mb-3" />
          <h2 className="font-display font-bold text-xl text-[#F1F5F9]">
            Nenhuma operação registrada
          </h2>
          <p className="font-mono text-xs text-[#64748B] mt-1 uppercase tracking-[0.14em]">
            Acesse o Catálogo de Contratos para avaliar oportunidades e vincular uma nova operação.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredContracts.map((contract) => (
              <motion.div
                key={contract.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <ContractCard
                  contract={contract}
                  operatorReputation={reputation}
                  onSelect={(c) => setSelectedContract(c)}
                  onComplete={(id) => openSubmissionTerminal(id)}
                  onFail={handleFailContract}
                  isProcessing={processingId === contract.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* =========================================================
          5. TERMINAL DE SUBMISSÃO DE RESULTADO (Modal Tático RF-063)
         ========================================================= */}
      <AnimatePresence>
        {submissionTarget && (
          <div className="fixed inset-0 bg-[#07090E]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg bg-[#0C1017] border border-[#00E5FF]/60 ah-corner-marks p-6 md:p-7 relative shadow-2xl"
            >
              <div className="h-[2px] w-full bg-[#00E5FF] absolute top-0 left-0" />

              <div className="flex items-center justify-between border-b border-[#1E2636] pb-4 mb-5">
                <div>
                  <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.18em] block">
                    OPERATION COMPLETION PROTOCOL // CTR-
                    {String(submissionTarget.id).padStart(4, '0')}
                  </span>
                  <h2 className="font-display font-bold text-xl text-[#F1F5F9] mt-0.5">
                    Terminal de Submissão de Resultado
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmissionTarget(null)}
                  className="text-[#64748B] hover:text-[#F1F5F9] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 bg-[#111722] border border-[#1E2636] mb-5">
                <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.14em] block mb-1">
                  Protocolo Solicitado pelo Contratante ({submissionTarget.faction})
                </span>
                <p className="font-sans text-xs text-[#F1F5F9]">
                  {submissionTarget.verificationPrompt ||
                    'Informe o identificador de protocolo ou código de telemetria obtido ao concluir os objetivos.'}
                </p>
              </div>

              <form onSubmit={handleConfirmSubmission} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-sans text-xs font-medium text-[#94A3B8] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#00E5FF]" />
                      Identificador de Protocolo / Telemetria
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setSubmissionHash(
                          `AH-TELEMETRY-${String(submissionTarget.id).padStart(
                            4,
                            '0'
                          )}-${Math.random()
                            .toString(36)
                            .substring(2, 7)
                            .toUpperCase()}`
                        )
                      }
                      className="font-mono text-[10px] text-[#00E5FF] hover:underline uppercase cursor-pointer"
                    >
                      GERAR CÓDIGO DE PROTOCOLO
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={submissionHash}
                    onChange={(e) => setSubmissionHash(e.target.value)}
                    placeholder="Ex: KESTREL-SHA-902"
                    className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-mono text-xs text-[#00E5FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Relatório de Execução de Campo
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Descreva brevemente a conclusão do protocolo e extração..."
                    className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-sans text-xs text-[#F1F5F9] focus:outline-none"
                  />
                </div>

                <div className="p-3.5 bg-[#07090E] border border-[#1E2636] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#94A3B8]">LIQUIDAÇÃO PREVISTA:</span>
                  <div className="flex items-center gap-3">
                    <strong className="text-[#10B981]">
                      +{new Intl.NumberFormat('pt-BR').format(submissionTarget.reward)} ¢
                    </strong>
                    <span className="text-[#00E5FF]">
                      +{submissionTarget.reputationReward ?? 10} REP
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmissionTarget(null)}
                    className="px-4 py-2.5 bg-[#111722] border border-[#1E2636] font-mono text-xs text-[#94A3B8] hover:text-[#F1F5F9] uppercase tracking-[0.14em] cursor-pointer"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === submissionTarget.id}
                    className="px-5 py-2.5 bg-[#10B981] hover:bg-[#10B981]/90 text-[#07090E] font-mono text-xs font-semibold uppercase tracking-[0.16em] flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>TRANSMITIR &amp; LIQUIDAR</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          6. CERIMÔNIA DE LIQUIDAÇÃO CINEMATOGRÁFICA
         ========================================================= */}
      <AnimatePresence>
        {ceremonyData && (
          <div className="fixed inset-0 bg-[#07090E]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.9, y: 16 }
              }
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xl bg-[#0C1017] border border-[#10B981] ah-corner-marks p-8 relative text-center overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
              <div className="h-[2px] w-full bg-gradient-to-r from-[#00E5FF] via-[#10B981] to-[#00E5FF] absolute top-0 left-0" />

              <div className="w-14 h-14 mx-auto bg-[#10B981]/15 border border-[#10B981] flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-[#10B981]" />
              </div>

              <span className="font-mono text-[11px] text-[#10B981] uppercase tracking-[0.22em] block">
                SETTLEMENT RECORDED // LIQUIDAÇÃO REGISTRADA
              </span>

              <h2 className="font-display font-bold text-2xl md:text-3xl text-[#F1F5F9] mt-2">
                {ceremonyData.contract.title}
              </h2>

              <p className="font-mono text-xs text-[#94A3B8] mt-1">
                IDENTIFICADOR DE PROTOCOLO:{' '}
                <span className="text-[#00E5FF]">{ceremonyData.submissionHash}</span>
              </p>

              {/* Blocos de Transferência de Créditos e Evolução de Reputação */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-[#111722] border border-[#10B981]/50">
                  <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] block">
                    Transferência de Créditos
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display font-bold text-2xl text-[#10B981]">
                      +{new Intl.NumberFormat('pt-BR').format(ceremonyData.rewardPaid)}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#10B981]">
                      ¢
                    </span>
                  </div>
                  <span className="mt-1 block font-mono text-[10px] text-[#94A3B8]">
                    NOVO SALDO: {new Intl.NumberFormat('pt-BR').format(ceremonyData.newBalance)} ¢
                  </span>
                </div>

                <div className="p-4 bg-[#111722] border border-[#00E5FF]/50">
                  <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] block">
                    Evolução de Reputação
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-2xl text-[#00E5FF]">
                      +{ceremonyData.reputationEarned}
                    </span>
                    <span className="font-mono text-xs text-[#00E5FF]">REP</span>
                  </div>
                  <span className="mt-1 block font-mono text-[10px] text-[#94A3B8]">
                    ÍNDICE ATUAL: REP {ceremonyData.newReputation}
                  </span>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/profile"
                  onClick={() => setCeremonyData(null)}
                  className="px-5 py-2.5 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF] font-mono text-xs text-[#00E5FF] uppercase tracking-[0.14em] flex items-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>AUDITAR EXTRATO DA CARTEIRA</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setCeremonyData(null);
                  }}
                  className="px-6 py-2.5 bg-[#00E5FF] hover:bg-[#33ECFF] text-[#07090E] font-mono text-xs font-semibold uppercase tracking-[0.16em] cursor-pointer"
                >
                  PROSSEGUIR NO TERMINAL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOSSIÊ DE BRIEFING */}
      <ContractBriefingDrawer
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
        operatorReputation={reputation}
        onComplete={(id) => openSubmissionTerminal(id)}
        onFail={handleFailContract}
        isProcessing={
          selectedContract ? processingId === selectedContract.id : false
        }
      />
    </div>
  );
}

export default MyContracts;
