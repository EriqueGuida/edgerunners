import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  RefreshCw,
  AlertTriangle,
  Plus,
  X,
  Skull,
} from 'lucide-react';
import api from '../services/api';
import { ContractCard } from '../components/contracts/ContractCard';
import { DEMO_MY_CONTRACTS_KEY } from './MyContracts';
import type { Contract, ThreatLevel } from '../types/contract';
import { soundEngine } from '../utils/sound';

// Contratos de demonstração ambientados no universo original AFTERHOURS (Terra real)
const FALLBACK_CONTRACTS: Contract[] = [
  {
    id: 101,
    title: 'Extração de Criptografia Quântica em Shinjuku',
    summary: 'Infiltração silenciosa no cofre de chaves de baixa latência da Aethelgard.',
    targetName: 'Servidor Kestrel-09',
    faction: 'Aethelgard Dynamics',
    locationName: 'Tóquio // Shinjuku (35.6895° N, 139.6917° E)',
    reward: 45000,
    threatLevel: 'PSYCHO',
    status: 'AVAILABLE',
  },
  {
    id: 102,
    title: 'Interceptação de Remessa Biométrica na Paulista',
    summary: 'Bloqueio tático de comboio corporativo e extração de amostras criptografadas.',
    targetName: 'Comboio Blindado V-12',
    faction: 'Helios Biotech',
    locationName: 'São Paulo // Av. Paulista (23.5614° S, 46.6559° W)',
    reward: 28500,
    threatLevel: 'HIGH',
    status: 'AVAILABLE',
  },
  {
    id: 103,
    title: 'Neutralização de Nó Clandestino em Kreuzberg',
    summary: 'Desconexão física de repetidor de telemetria hostil em subestação urbana.',
    targetName: 'Estação Subterrânea 04',
    faction: 'Coletivo Null-Sec',
    locationName: 'Berlim // Kreuzberg (52.4986° N, 13.4033° E)',
    reward: 14000,
    threatLevel: 'MEDIUM',
    status: 'AVAILABLE',
  },
  {
    id: 104,
    title: 'Recuperação de Dossiê Financeiro em Marina Bay',
    summary: 'Auditoria forçada e cópia integral de registros de liquidação offshore.',
    targetName: 'Cofre Orbital S-3',
    faction: 'Consórcio Meridian',
    locationName: 'Singapura // Marina Bay (1.2834° N, 103.8607° E)',
    reward: 19200,
    threatLevel: 'HIGH',
    status: 'AVAILABLE',
  },
  {
    id: 105,
    title: 'Varredura de Contramedidas em Gangnam',
    summary: 'Mapeamento passivo de frequências e validação de perímetro de segurança.',
    targetName: 'Torre Han-River',
    faction: 'Kurogane Systems',
    locationName: 'Seul // Gangnam (37.4979° N, 127.0276° E)',
    reward: 7500,
    threatLevel: 'LOW',
    status: 'AVAILABLE',
  },
  {
    id: 106,
    title: 'Sabotagem de Reator de Dados nos Alpes',
    summary: 'Injeção de carga térmica controlada em instalação subterrânea de alta segurança.',
    targetName: 'Bunker Criptográfico Z-01',
    faction: 'Vanguard Sovereign',
    locationName: 'Zurique // Setor Alpino (47.3769° N, 8.5417° E)',
    reward: 62000,
    threatLevel: 'PSYCHO',
    status: 'AVAILABLE',
  },
];

const THREAT_FILTER_LABELS: Record<ThreatLevel | 'ALL', string> = {
  ALL: 'TODOS',
  LOW: 'BAIXO',
  MEDIUM: 'MÉDIO',
  HIGH: 'ALTO',
  PSYCHO: 'CRÍTICO',
};

export function Market() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineDemo, setIsOfflineDemo] = useState<boolean>(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<ThreatLevel | 'ALL'>('ALL');

  // Estado para modal de publicação de contrato
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newFaction, setNewFaction] = useState('');
  const [newReward, setNewReward] = useState('');
  const [newThreat, setNewThreat] = useState<ThreatLevel>('MEDIUM');

  const fetchAvailableContracts = useCallback(async () => {
    setIsLoading(true);
    setIsOfflineDemo(false);

    try {
      const response = await api.get<Contract[]>('/api/contracts/available');
      setContracts(response.data);
    } catch {
      setIsOfflineDemo(true);
      setContracts(FALLBACK_CONTRACTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Contract[]>('/api/contracts/available')
      .then((res) => {
        if (!cancelled) {
          setContracts(res.data);
          setIsOfflineDemo(false);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContracts(FALLBACK_CONTRACTS);
          setIsOfflineDemo(true);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAcceptContract = async (id: number) => {
    setAcceptingId(id);
    const acceptedContract = contracts.find((c) => c.id === id);

    try {
      if (!isOfflineDemo) {
        await api.patch(`/api/contracts/${id}/accept`);
      } else if (acceptedContract) {
        const saved = localStorage.getItem(DEMO_MY_CONTRACTS_KEY);
        const currentMyContracts: Contract[] = saved ? JSON.parse(saved) : [];
        const updatedMyContracts: Contract[] = [
          { ...acceptedContract, status: 'ACCEPTED' },
          ...currentMyContracts.filter((c) => c.id !== id),
        ];
        localStorage.setItem(DEMO_MY_CONTRACTS_KEY, JSON.stringify(updatedMyContracts));
      }
      setContracts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Erro ao aceitar contrato:', err);
      soundEngine.playWarning();
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: newTitle.trim(),
      targetName: newTarget.trim(),
      faction: newFaction.trim(),
      reward: Number(newReward) || 5000,
      threatLevel: newThreat,
    };

    try {
      if (!isOfflineDemo) {
        const response = await api.post<Contract>('/api/contracts', payload);
        setContracts((prev) => [response.data, ...prev]);
      } else {
        const mockCreated: Contract = {
          id: Math.floor(Math.random() * 900) + 200,
          ...payload,
          status: 'AVAILABLE',
        };
        setContracts((prev) => [mockCreated, ...prev]);
      }
      soundEngine.playSuccess();
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewTarget('');
      setNewFaction('');
      setNewReward('');
      setNewThreat('MEDIUM');
    } catch (err) {
      console.error('Erro ao publicar contrato:', err);
      soundEngine.playWarning();
    }
  };

  const filteredContracts =
    selectedThreat === 'ALL'
      ? contracts
      : contracts.filter((c) => c.threatLevel === selectedThreat);

  return (
    <div className="space-y-8">
      {/* =========================================================
          CABEÇALHO DO CATÁLOGO DE CONTRATOS (Nocturnal Operations Terminal)
         ========================================================= */}
      <div className="border border-[#1E2636] bg-[#0C1017] p-6 md:p-8 ah-corner-marks relative overflow-hidden">
        <div className="h-[1px] w-full bg-[#00E5FF]/50 absolute top-0 left-0" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.18em] mb-1.5">
              <Radar className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>CONTRACT DIRECTORY // CAT_01</span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-[#F1F5F9]">
              Catálogo de Contratos
            </h1>
            <p className="font-sans text-sm text-[#94A3B8] mt-1">
              Oportunidades operacionais ativas verificadas na rede AFTERHOURS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#00E5FF] hover:bg-[#33ECFF] text-[#07090E] font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>PUBLICAR CONTRATO</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                fetchAvailableContracts();
              }}
              disabled={isLoading}
              className="px-4 py-2.5 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF]/60 text-[#F1F5F9] font-mono text-[11px] uppercase tracking-[0.16em] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00E5FF]' : 'text-[#94A3B8]'}`} />
              <span>ATUALIZAR FEED</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros por Classificação de Risco */}
        <div className="mt-6 pt-5 border-t border-[#1E2636] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.16em] mr-2">
              FILTRAR RISCO:
            </span>
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'PSYCHO'] as const).map((level) => {
              const isSelected = selectedThreat === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedThreat(level);
                  }}
                  className={`px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                    isSelected
                      ? level === 'PSYCHO'
                        ? 'bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E] font-semibold'
                        : 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF] font-semibold'
                      : 'bg-[#111722] border-[#1E2636] text-[#94A3B8] hover:border-[#00E5FF]/40 hover:text-[#F1F5F9]'
                  }`}
                >
                  {THREAT_FILTER_LABELS[level]}
                </button>
              );
            })}
          </div>

          <div className="font-mono text-[11px] text-[#64748B] uppercase tracking-[0.16em]">
            DISPONÍVEIS: <strong className="text-[#00E5FF]">{filteredContracts.length}</strong>
          </div>
        </div>
      </div>

      {/* Aviso de contingência caso o backend não esteja ativo */}
      {isOfflineDemo && (
        <div className="p-3.5 bg-[#111722] border border-[#1E2636] text-[#94A3B8] flex items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#00E5FF] shrink-0" />
            <span>
              MODO TERMINAL LOCAL: Exibindo catálogo tático em cache (conecte o servidor Spring Boot em localhost:8080 para sincronização MySQL).
            </span>
          </div>
        </div>
      )}

      {/* =========================================================
          GRID RESPONSIVO DE CONTRATOS
         ========================================================= */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((skeleton) => (
            <div
              key={skeleton}
              className="h-64 bg-[#0C1017] border border-[#1E2636] p-6 animate-pulse flex flex-col justify-between"
            >
              <div className="h-4 w-1/3 bg-[#1E2636]" />
              <div className="h-6 w-3/4 bg-[#1E2636]" />
              <div className="h-16 w-full bg-[#111722] border border-[#1E2636]" />
              <div className="h-8 w-1/2 bg-[#1E2636]" />
            </div>
          ))}
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="border border-[#1E2636] bg-[#0C1017] p-12 text-center ah-corner-marks">
          <Skull className="w-8 h-8 text-[#64748B] mx-auto mb-3" />
          <h2 className="font-display font-bold text-xl text-[#F1F5F9]">
            Nenhum contrato localizado
          </h2>
          <p className="font-mono text-xs text-[#64748B] mt-1 uppercase tracking-[0.14em]">
            Não há contratos disponíveis para os critérios selecionados no momento.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredContracts.map((contract) => (
              <motion.div
                key={contract.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  transition: { duration: 0.18 },
                }}
              >
                <ContractCard
                  contract={contract}
                  onAccept={handleAcceptContract}
                  isAccepting={acceptingId === contract.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* =========================================================
          MODAL DE PUBLICAÇÃO DE CONTRATO
         ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#07090E]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#0C1017] border border-[#1E2636] ah-corner-marks p-6 relative">
            <div className="h-[1px] w-full bg-[#00E5FF] absolute top-0 left-0" />

            <div className="flex items-center justify-between border-b border-[#1E2636] pb-3.5 mb-5">
              <div>
                <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] block">
                  DISPATCH // NEW BRIEFING
                </span>
                <h2 className="font-display font-bold text-lg text-[#F1F5F9]">
                  Publicar Novo Contrato
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Fechar modal"
                className="text-[#64748B] hover:text-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                  Título da operação
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Extração de Servidor em Tóquio"
                  className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] font-sans text-sm text-[#F1F5F9] placeholder-[#64748B]/50 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Alvo / Instalação
                  </label>
                  <input
                    type="text"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="Ex: Setor Shinjuku-04"
                    className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] font-sans text-sm text-[#F1F5F9] placeholder-[#64748B]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Contratante
                  </label>
                  <input
                    type="text"
                    required
                    value={newFaction}
                    onChange={(e) => setNewFaction(e.target.value)}
                    placeholder="Ex: Aethelgard Corp"
                    className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] font-sans text-sm text-[#F1F5F9] placeholder-[#64748B]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Recompensa (¢)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] font-mono text-sm text-[#F1F5F9] placeholder-[#64748B]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Classificação de risco
                  </label>
                  <select
                    value={newThreat}
                    onChange={(e) => setNewThreat(e.target.value as ThreatLevel)}
                    className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] font-mono text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="LOW">BAIXO</option>
                    <option value="MEDIUM">MÉDIO</option>
                    <option value="HIGH">ALTO</option>
                    <option value="PSYCHO">CRÍTICO</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-[#00E5FF] hover:bg-[#33ECFF] text-[#07090E] font-mono font-semibold text-xs uppercase tracking-[0.16em] transition-colors cursor-pointer"
              >
                PUBLICAR NA REDE AFTERHOURS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Market;
