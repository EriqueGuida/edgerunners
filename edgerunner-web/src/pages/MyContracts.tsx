import { useEffect, useState } from 'react';
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
import api, { USER_KEY } from '../services/api';
import { ContractCard } from '../components/contracts/ContractCard';
import type { Contract, ContractStatus } from '../types/contract';
import { soundEngine } from '../utils/sound';

export const DEMO_MY_CONTRACTS_KEY = 'afterhours_demo_my_contracts';

const DEFAULT_DEMO_MY_CONTRACTS: Contract[] = [
  {
    id: 201,
    title: 'Infiltração em Subestação de Dados em Frankfurt',
    targetName: 'Núcleo Financeiro E-Central',
    faction: 'Aethelgard Dynamics',
    reward: 32000,
    threatLevel: 'HIGH',
    status: 'ACCEPTED',
  },
  {
    id: 202,
    title: 'Desativação de Antena de Interceptação no Porto de Santos',
    targetName: 'Terminal Marítimo T-08',
    faction: 'Consórcio Meridian',
    reward: 18500,
    threatLevel: 'MEDIUM',
    status: 'ACCEPTED',
  },
  {
    id: 203,
    title: 'Auditoria Forçada em Laboratório Subterrâneo de Seul',
    targetName: 'Unidade Bio-Sintética Songdo',
    faction: 'Helios Biotech',
    reward: 50000,
    threatLevel: 'PSYCHO',
    status: 'COMPLETED',
  },
];

const STATUS_FILTER_LABELS: Record<ContractStatus | 'ALL', string> = {
  ALL: 'TODOS',
  AVAILABLE: 'DISPONÍVEIS',
  ACCEPTED: 'EM ANDAMENTO',
  COMPLETED: 'CONCLUÍDOS',
  FAILED: 'FALHOS',
};

interface FeedbackBanner {
  type: 'success' | 'error';
  message: string;
}

export function MyContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineDemo, setIsOfflineDemo] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null);

  // Indicadores do Operador (Carteira Fictícia e Reputação)
  const [credits, setCredits] = useState<number>(0);
  const [reputation, setReputation] = useState<number>(1);
  const operatorCallsign = localStorage.getItem(USER_KEY) || 'OP_VANGUARD';

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    window.setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const syncKpisFromContracts = (list: Contract[]) => {
    const hunterWithStats = list.find((c) => c.hunter)?.hunter;
    if (hunterWithStats) {
      setCredits(hunterWithStats.eddies);
      setReputation(hunterWithStats.streetCred);
      return;
    }

    const completedList = list.filter((c) => c.status === 'COMPLETED');
    const totalEarned = completedList.reduce((acc, c) => acc + c.reward, 0);
    const totalRep = 1 + completedList.length * 10;
    setCredits(totalEarned);
    setReputation(totalRep);
  };

  const fetchMyContracts = async () => {
    setIsLoading(true);
    setIsOfflineDemo(false);

    try {
      const response = await api.get<Contract[]>('/api/contracts/my-contracts');
      setContracts(response.data);
      syncKpisFromContracts(response.data);
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
      syncKpisFromContracts(initialList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyContracts();
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
        syncKpisFromContracts(updated);
      } else {
        const updated = contracts.map((c) =>
          c.id === id ? { ...c, status: 'COMPLETED' as const } : c
        );
        setContracts(updated);
        localStorage.setItem(DEMO_MY_CONTRACTS_KEY, JSON.stringify(updated));
        syncKpisFromContracts(updated);
      }

      soundEngine.playSuccess();
      const formattedReward = new Intl.NumberFormat('pt-BR').format(targetContract.reward);
      triggerFeedback(
        'success',
        `OPERAÇÃO #${String(id).padStart(4, '0')} CONCLUÍDA // +CR¢ ${formattedReward} CREDITADOS & +10 REPUTAÇÃO!`
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
        `OPERAÇÃO #${String(id).padStart(4, '0')} ENCERRADA SEM SUCESSO // REGISTRO ARQUIVADO.`
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
          className="bg-dark-surface border border-edgerunner-yellow/60 p-6 cyber-chamfer ah-reticle shadow-hud-yellow relative overflow-hidden"
        >
          <div className="h-1 w-full bg-edgerunner-yellow absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
              // Carteira de Créditos
            </span>
            <div className="w-9 h-9 bg-edgerunner-yellow/10 border border-edgerunner-yellow flex items-center justify-center">
              <Wallet className="w-4 h-4 text-edgerunner-yellow" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-sm font-bold text-neon-green">CR¢</span>
            <span className="font-mono text-3xl md:text-4xl font-bold text-edgerunner-yellow">
              {formattedCredits}
            </span>
          </div>
          <p className="mt-2 font-mono text-[11px] text-gray-400 uppercase tracking-wider">
            OPERADOR: <strong className="text-white">{operatorCallsign}</strong>
          </p>
        </motion.div>

        {/* Card 2: Reputação e Progressão */}
        <motion.div
          key={`rep-${reputation}`}
          initial={{ scale: 0.99 }}
          animate={{ scale: 1 }}
          className="bg-dark-surface border border-neon-cyan/60 p-6 cyber-chamfer ah-reticle shadow-hud-cyan relative overflow-hidden"
        >
          <div className="h-1 w-full bg-neon-cyan absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
              // Índice de Reputação
            </span>
            <div className="w-9 h-9 bg-neon-cyan/10 border border-neon-cyan flex items-center justify-center">
              <Award className="w-4 h-4 text-neon-cyan" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-xs uppercase text-neon-cyan">NÍVEL</span>
            <span className="font-mono text-3xl md:text-4xl font-bold text-white">
              {reputation}
            </span>
            <span className="font-mono text-xs text-neon-green ml-2">+10 / OPERAÇÃO</span>
          </div>
          <p className="mt-2 font-mono text-[11px] text-gray-400 uppercase tracking-wider">
            CREDENCIAL:{' '}
            <strong className="text-neon-cyan">
              {reputation >= 30 ? 'OPERADOR SÊNIOR // NÍVEL ALFA' : 'OPERADOR INDEPENDENTE'}
            </strong>
          </p>
        </motion.div>

        {/* Card 3: Telemetria Operacional */}
        <div className="bg-dark-surface border border-dark-border p-6 cyber-chamfer ah-reticle relative overflow-hidden">
          <div className="h-1 w-full bg-neon-green absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
              // Resumo Operacional
            </span>
            <div className="w-9 h-9 bg-neon-green/10 border border-neon-green flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-neon-green" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="block font-mono text-[10px] text-gray-400 uppercase">EM EXECUÇÃO</span>
              <span className="font-mono text-2xl font-bold text-edgerunner-yellow">
                {activeCount}
              </span>
            </div>
            <div className="border-l border-dark-border pl-4">
              <span className="block font-mono text-[10px] text-gray-400 uppercase">CONCLUÍDAS</span>
              <span className="font-mono text-2xl font-bold text-neon-green">
                {completedCount}
              </span>
            </div>
          </div>
          <p className="mt-2 font-mono text-[11px] text-gray-400 uppercase tracking-wider">
            HISTÓRICO TOTAL: <strong className="text-white">{contracts.length}</strong>
          </p>
        </div>
      </div>

      {/* =========================================================
          NOTIFICAÇÃO DE FEEDBACK OPERACIONAL
         ========================================================= */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`p-4 border font-mono text-xs md:text-sm uppercase tracking-wider flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-neon-green/15 border-neon-green text-neon-green shadow-hud-emerald'
                : 'bg-neon-pink/15 border-neon-pink text-neon-pink shadow-hud-pink'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0" />
              )}
              <span className="font-bold">{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline opacity-75 hover:opacity-100 cursor-pointer"
            >
              [FECHAR]
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          CABEÇALHO E FILTROS DAS OPERAÇÕES DO OPERADOR
         ========================================================= */}
      <div className="border border-dark-border bg-dark-surface/90 p-6 cyber-chamfer ah-reticle">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              // REGISTRO DE OPERAÇÕES E HISTÓRICO
            </span>
            <h1 className="cyber-glitch font-display font-bold text-3xl tracking-wider uppercase text-white mt-1">
              Minhas <span className="text-neon-cyan">Operações</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              fetchMyContracts();
            }}
            disabled={isLoading}
            className="self-start md:self-auto px-4 py-2.5 bg-dark-card border border-dark-border hover:border-neon-cyan text-gray-300 hover:text-neon-cyan font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-neon-cyan' : ''}`} />
            <span>SINCRONIZAR REGISTRO</span>
          </button>
        </div>

        {/* Filtros por Estado da Operação */}
        <div className="mt-6 pt-4 border-t border-dark-border flex flex-wrap items-center gap-2">
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
                className={`px-3 py-1 font-mono text-xs uppercase tracking-widest border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neon-cyan text-dark-bg border-neon-cyan font-bold shadow-hud-cyan'
                    : 'bg-dark-card border-dark-border text-gray-400 hover:border-neon-cyan hover:text-neon-cyan'
                }`}
              >
                {STATUS_FILTER_LABELS[status]}
              </button>
            );
          })}
        </div>
      </div>

      {isOfflineDemo && (
        <div className="p-3.5 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan flex items-center gap-2.5 font-mono text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            MODO DE SIMULAÇÃO LOCAL: Operações vinculadas no Catálogo e resultados submetidos aqui permanecem sincronizados na sua sessão.
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
              className="h-64 bg-dark-surface border border-dark-border p-6 animate-pulse"
            />
          ))}
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="border border-dark-border bg-dark-surface/70 p-12 text-center cyber-chamfer">
          <Briefcase className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider">
            Nenhuma Operação Registrada
          </h2>
          <p className="font-mono text-xs text-gray-400 mt-1 uppercase tracking-widest">
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
                initial={{ opacity: 0, y: 10 }}
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
