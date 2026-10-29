import { useCallback, useEffect, useState } from 'react';
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
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ContractCard } from '../components/contracts/ContractCard';
import type { Contract, ContractStatus } from '../types/contract';
import { soundEngine } from '../utils/sound';

export const DEMO_MY_CONTRACTS_KEY = 'afterhours_demo_my_contracts';

const DEFAULT_DEMO_MY_CONTRACTS: Contract[] = [
  {
    id: 201,
    title: 'Infiltração em Subestação de Dados em Frankfurt',
    summary: 'Extração de registros de roteamento intercontinental sem acionamento de alarmes.',
    targetName: 'Núcleo Financeiro E-Central',
    faction: 'Aethelgard Dynamics',
    locationName: 'Frankfurt // Distrito Financeiro (50.1109° N, 8.6821° E)',
    reward: 32000,
    threatLevel: 'HIGH',
    status: 'ACCEPTED',
  },
  {
    id: 202,
    title: 'Desativação de Antena de Interceptação no Porto de Santos',
    summary: 'Interrupção física de enlace clandestino de telemetria marítima.',
    targetName: 'Terminal Marítimo T-08',
    faction: 'Consórcio Meridian',
    locationName: 'Santos // Cais Setor 08 (23.9618° S, 46.3322° W)',
    reward: 18500,
    threatLevel: 'MEDIUM',
    status: 'ACCEPTED',
  },
  {
    id: 203,
    title: 'Auditoria Forçada em Laboratório Subterrâneo de Seul',
    summary: 'Cópia forense de chaves de pesquisa biométrica e limpeza de logs.',
    targetName: 'Unidade Bio-Sintética Songdo',
    faction: 'Helios Biotech',
    locationName: 'Seul // Songdo IBD (37.3826° N, 126.6563° E)',
    reward: 50000,
    threatLevel: 'PSYCHO',
    status: 'COMPLETED',
  },
];

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

export function MyContracts() {
  const { operator, adjustLocalStats, refreshProfile } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineDemo, setIsOfflineDemo] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null);

  const operatorCallsign = operator?.callsign || operator?.username || 'OP_VANGUARD';
  const credits = operator?.balance ?? operator?.eddies ?? 0;
  const reputation = operator?.reputation ?? operator?.streetCred ?? 1;

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    window.setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const fetchMyContracts = useCallback(async () => {
    setIsLoading(true);
    setIsOfflineDemo(false);

    try {
      const response = await api.get<Contract[]>('/api/contracts/my-contracts');
      setContracts(response.data);
      await refreshProfile();
    } catch {
      setIsOfflineDemo(true);
      const savedDemo = localStorage.getItem(DEMO_MY_CONTRACTS_KEY);
      const initialList: Contract[] = savedDemo
        ? JSON.parse(savedDemo)
        : DEFAULT_DEMO_MY_CONTRACTS;

      if (!savedDemo) {
        localStorage.setItem(DEMO_MY_CONTRACTS_KEY, JSON.stringify(initialList));
      }
      setContracts(initialList);
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Contract[]>('/api/contracts/my-contracts')
      .then((res) => {
        if (!cancelled) {
          setContracts(res.data);
          setIsOfflineDemo(false);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const savedDemo = localStorage.getItem(DEMO_MY_CONTRACTS_KEY);
          const initialList: Contract[] = savedDemo
            ? JSON.parse(savedDemo)
            : DEFAULT_DEMO_MY_CONTRACTS;

          if (!savedDemo) {
            localStorage.setItem(DEMO_MY_CONTRACTS_KEY, JSON.stringify(initialList));
          }
          setContracts(initialList);
          setIsOfflineDemo(true);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCompleteContract = async (id: number) => {
    const targetContract = contracts.find((c) => c.id === id);
    if (!targetContract) return;

    setProcessingId(id);
    try {
      if (!isOfflineDemo) {
        const response = await api.patch<Contract>(`/api/contracts/${id}/complete`);
        const updated = contracts.map((c) => (c.id === id ? response.data : c));
        setContracts(updated);
        await refreshProfile();
      } else {
        const updated = contracts.map((c) =>
          c.id === id ? { ...c, status: 'COMPLETED' as const } : c
        );
        setContracts(updated);
        localStorage.setItem(DEMO_MY_CONTRACTS_KEY, JSON.stringify(updated));

        adjustLocalStats(targetContract.reward, targetContract.reputationReward ?? 10);
      }

      soundEngine.playSuccess();
      const formattedReward = new Intl.NumberFormat('pt-BR').format(targetContract.reward);
      triggerFeedback(
        'success',
        `OPERAÇÃO CTR-${String(id).padStart(4, '0')} CONCLUÍDA // +${formattedReward} ¢ CREDITADOS & +10 REPUTAÇÃO`
      );
    } catch (err) {
      console.error('Erro ao completar contrato:', err);
      soundEngine.playWarning();
      triggerFeedback('error', 'FALHA DE TRANSMISSÃO: Não foi possível registrar a conclusão da operação.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleFailContract = async (id: number) => {
    setProcessingId(id);
    try {
      if (!isOfflineDemo) {
        const response = await api.patch<Contract>(`/api/contracts/${id}/fail`);
        const updated = contracts.map((c) => (c.id === id ? response.data : c));
        setContracts(updated);
      } else {
        const updated = contracts.map((c) =>
          c.id === id ? { ...c, status: 'FAILED' as const } : c
        );
        setContracts(updated);
        localStorage.setItem(DEMO_MY_CONTRACTS_KEY, JSON.stringify(updated));
      }

      soundEngine.playWarning();
      triggerFeedback(
        'error',
        `OPERAÇÃO CTR-${String(id).padStart(4, '0')} ENCERRADA SEM SUCESSO // REGISTRO ARQUIVADO.`
      );
    } catch (err) {
      console.error('Erro ao marcar falha no contrato:', err);
      soundEngine.playWarning();
      triggerFeedback('error', 'FALHA DE TRANSMISSÃO: Não foi possível atualizar o estado da operação.');
    } finally {
      setProcessingId(null);
    }
  };

  const activeCount = contracts.filter((c) => c.status === 'ACCEPTED').length;
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
          INDICADORES DO OPERADOR (CARTEIRA FICTÍCIA & REPUTAÇÃO)
         ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Carteira de Créditos Fictícios */}
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
            <div className="w-8 h-8 bg-[#111722] border border-[#1E2636] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#00E5FF]" />
            </div>
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

        {/* Card 2: Reputação e Progressão */}
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
            <span className="font-mono text-[11px] text-[#10B981] ml-2">+10 / MISSÃO</span>
          </div>
          <p className="mt-2.5 font-mono text-[11px] text-[#64748B] uppercase tracking-[0.14em]">
            CREDENCIAL:{' '}
            <strong className="text-[#00E5FF]">
              {reputation >= 50 ? 'OPERADOR SÊNIOR // NÍVEL ALFA' : 'OPERADOR VERIFICADO'}
            </strong>
          </p>
        </motion.div>

        {/* Card 3: Telemetria Operacional */}
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
                {activeCount}
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
            REGISTROS VINCULADOS: <strong className="text-[#F1F5F9]">{contracts.length}</strong>
          </p>
        </div>
      </div>

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
          CABEÇALHO E FILTROS DAS OPERAÇÕES DO OPERADOR
         ========================================================= */}
      <div className="border border-[#1E2636] bg-[#0C1017] p-6 md:p-8 ah-corner-marks relative overflow-hidden">
        <div className="h-[1px] w-full bg-[#00E5FF]/50 absolute top-0 left-0" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.18em] flex items-center gap-2 mb-1.5">
              <Terminal className="w-3.5 h-3.5" />
              ACTIVE OPERATIONS // OPS_02
            </span>
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-[#F1F5F9]">
              Minhas Operações
            </h1>
            <p className="font-sans text-sm text-[#94A3B8] mt-1">
              Acompanhamento de contratos aceitos, submissão de resultados e histórico operacional.
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
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00E5FF]' : 'text-[#94A3B8]'}`} />
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

      {isOfflineDemo && (
        <div className="p-3.5 bg-[#111722] border border-[#1E2636] text-[#94A3B8] flex items-center gap-2.5 font-mono text-[11px]">
          <AlertTriangle className="w-4 h-4 text-[#00E5FF] shrink-0" />
          <span>
            MODO TERMINAL LOCAL: Operações vinculadas no Catálogo e resultados submetidos aqui atualizam sua carteira e reputação em tempo real.
          </span>
        </div>
      )}

      {/* =========================================================
          LISTAGEM DE OPERAÇÕES
         ========================================================= */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  onComplete={handleCompleteContract}
                  onFail={handleFailContract}
                  isProcessing={processingId === contract.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default MyContracts;
