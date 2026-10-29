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

export const DEMO_MY_CONTRACTS_KEY = 'edgerunner_demo_my_contracts';

const DEFAULT_DEMO_MY_CONTRACTS: Contract[] = [
  {
    id: 201,
    title: 'Neutralize Arasaka Counter-Intel Operative',
    targetName: 'Takashi Kuroda',
    faction: 'Arasaka Corp',
    reward: 32000,
    threatLevel: 'HIGH',
    status: 'ACCEPTED',
  },
  {
    id: 202,
    title: 'Shut Down Illegal Braindance Studio',
    targetName: 'Gottfried & Fredrik',
    faction: 'Maelstrom',
    reward: 18500,
    threatLevel: 'MEDIUM',
    status: 'ACCEPTED',
  },
  {
    id: 203,
    title: 'Eliminate Cyberpsycho Sniper in Arroyo',
    targetName: 'Teresa "Deadeye" Vance',
    faction: '6th Street',
    reward: 50000,
    threatLevel: 'PSYCHO',
    status: 'COMPLETED',
  },
];

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

  // KPIs do Hunter
  const [eddies, setEddies] = useState<number>(0);
  const [streetCred, setStreetCred] = useState<number>(1);
  const hunterUsername = localStorage.getItem(USER_KEY) || 'DavidMartinez';

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    window.setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const syncKpisFromContracts = (list: Contract[]) => {
    // Se vier do backend com objeto hunter populado, usa o valor oficial do banco
    const hunterWithStats = list.find((c) => c.hunter)?.hunter;
    if (hunterWithStats) {
      setEddies(hunterWithStats.eddies);
      setStreetCred(hunterWithStats.streetCred);
      return;
    }

    // Cálculo para modo offline/demo baseado nos contratos COMPLETED
    const completedList = list.filter((c) => c.status === 'COMPLETED');
    const totalEarned = completedList.reduce((acc, c) => acc + c.reward, 0);
    const totalCred = 1 + completedList.length * 10;
    setEddies(totalEarned);
    setStreetCred(totalCred);
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

      const formattedReward = new Intl.NumberFormat('en-US').format(targetContract.reward);
      triggerFeedback(
        'success',
        `GIG #${String(id).padStart(4, '0')} COMPLETED // +€$ ${formattedReward} TRANSFERRED & +10 STREET CRED!`
      );
    } catch (err) {
      console.error('Erro ao completar contrato:', err);
      triggerFeedback('error', 'FALHA DE TRANSMISSÃO: Não foi possível confirmar a conclusão do contrato.');
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

      triggerFeedback(
        'error',
        `GIG #${String(id).padStart(4, '0')} MARKED AS FAILED // FIXER NOTIFIED.`
      );
    } catch (err) {
      console.error('Erro ao marcar falha no contrato:', err);
      triggerFeedback('error', 'FALHA DE TRANSMISSÃO: Não foi possível atualizar o status.');
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

  const formattedEddies = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(eddies);

  return (
    <div className="space-y-8">
      {/* =========================================================
          PAINEL DE KPIs DO HUNTER (SALDO DE EDDIES & STREET CRED)
         ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Saldo de Eddies */}
        <motion.div
          key={`eddies-${eddies}`}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          className="bg-dark-surface border-2 border-edgerunner-yellow/70 p-6 cyber-chamfer shadow-hud-yellow relative overflow-hidden"
        >
          <div className="h-1 w-full bg-edgerunner-yellow absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
              // Eurodollars Balance
            </span>
            <div className="w-9 h-9 bg-edgerunner-yellow/10 border border-edgerunner-yellow flex items-center justify-center">
              <Wallet className="w-4 h-4 text-edgerunner-yellow" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold text-neon-green">€$</span>
            <span className="font-mono text-3xl md:text-4xl font-bold text-edgerunner-yellow drop-shadow-neon-yellow">
              {formattedEddies}
            </span>
          </div>
          <p className="mt-2 font-mono text-[11px] text-gray-400 uppercase tracking-wider">
            ACCOUNT: <strong className="text-white">{hunterUsername}</strong>
          </p>
        </motion.div>

        {/* Card 2: Street Cred */}
        <motion.div
          key={`cred-${streetCred}`}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          className="bg-dark-surface border-2 border-neon-cyan/70 p-6 cyber-chamfer shadow-hud-cyan relative overflow-hidden"
        >
          <div className="h-1 w-full bg-neon-cyan absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
              // Street Cred Rating
            </span>
            <div className="w-9 h-9 bg-neon-cyan/10 border border-neon-cyan flex items-center justify-center">
              <Award className="w-4 h-4 text-neon-cyan" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-xs uppercase text-neon-cyan">LVL</span>
            <span className="font-mono text-3xl md:text-4xl font-bold text-white drop-shadow-neon-cyan">
              {streetCred}
            </span>
            <span className="font-mono text-xs text-neon-green ml-2">+10 / GIG</span>
          </div>
          <p className="mt-2 font-mono text-[11px] text-gray-400 uppercase tracking-wider">
            RANK: <strong className="text-neon-cyan">{streetCred >= 30 ? 'AFTERLIFE LEGEND' : 'EDGERUNNER MERC'}</strong>
          </p>
        </motion.div>

        {/* Card 3: Resumo Operacional */}
        <div className="bg-dark-surface border-2 border-dark-border p-6 cyber-chamfer relative overflow-hidden">
          <div className="h-1 w-full bg-neon-green absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
              // Operational Telemetry
            </span>
            <div className="w-9 h-9 bg-neon-green/10 border border-neon-green flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-neon-green" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="block font-mono text-[10px] text-gray-400 uppercase">ACTIVE GIGS</span>
              <span className="font-mono text-2xl font-bold text-edgerunner-yellow">
                {activeCount}
              </span>
            </div>
            <div className="border-l border-dark-border pl-4">
              <span className="block font-mono text-[10px] text-gray-400 uppercase">COMPLETED</span>
              <span className="font-mono text-2xl font-bold text-neon-green">
                {completedCount}
              </span>
            </div>
          </div>
          <p className="mt-2 font-mono text-[11px] text-gray-400 uppercase tracking-wider">
            TOTAL LOGGED: <strong className="text-white">{contracts.length}</strong>
          </p>
        </div>
      </div>

      {/* =========================================================
          FEEDBACK VISUAL RÁPIDO (VERDE SUCESSO / VERMELHO FALHA)
         ========================================================= */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`p-4 border-2 font-mono text-xs md:text-sm uppercase tracking-wider flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-neon-green/15 border-neon-green text-neon-green shadow-[0_0_20px_rgba(0,255,102,0.3)]'
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
              [DISMISS]
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          CABEÇALHO E FILTROS DOS CONTRATOS DO HUNTER
         ========================================================= */}
      <div className="border-2 border-dark-border bg-dark-surface/90 p-6 cyber-chamfer">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              // PERSONAL MERCENARY LOG
            </span>
            <h1
              data-text="MY CONTRACTS"
              className="cyber-glitch font-display font-bold text-3xl tracking-wider uppercase text-white mt-1"
            >
              My <span className="text-neon-cyan drop-shadow-neon-cyan">Contracts</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={fetchMyContracts}
            disabled={isLoading}
            className="self-start md:self-auto px-4 py-2.5 bg-dark-card border border-dark-border hover:border-neon-cyan text-gray-300 hover:text-neon-cyan font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-neon-cyan' : ''}`} />
            <span>REFRESH LOG</span>
          </button>
        </div>

        {/* Filtros por Status */}
        <div className="mt-6 pt-4 border-t border-dark-border flex flex-wrap items-center gap-2">
          {(['ALL', 'ACCEPTED', 'COMPLETED', 'FAILED'] as const).map((status) => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 font-mono text-xs uppercase tracking-widest border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neon-cyan text-dark-bg border-neon-cyan font-bold shadow-hud-cyan'
                    : 'bg-dark-card border-dark-border text-gray-400 hover:border-neon-cyan hover:text-neon-cyan'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {isOfflineDemo && (
        <div className="p-3.5 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan flex items-center gap-2.5 font-mono text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            SIMULATION LOG ATIVO: Os contratos aceitos no Market ou concluídos aqui são atualizados em tempo real na sua sessão!
          </span>
        </div>
      )}

      {/* =========================================================
          LISTAGEM DE CONTRATOS DO HUNTER
         ========================================================= */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((skeleton) => (
            <div
              key={skeleton}
              className="h-64 bg-dark-surface border-2 border-dark-border p-6 animate-pulse"
            />
          ))}
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="border-2 border-dark-border bg-dark-surface/70 p-12 text-center cyber-chamfer">
          <Briefcase className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider">
            No Contracts in Log
          </h2>
          <p className="font-mono text-xs text-gray-400 mt-1 uppercase tracking-widest">
            Vá até o Market e segure o botão de aceite por 2 segundos para iniciar uma missão.
          </p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredContracts.map((contract) => (
              <motion.div
                key={contract.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
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
