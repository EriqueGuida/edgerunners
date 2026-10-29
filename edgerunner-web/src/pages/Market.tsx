import { useEffect, useState } from 'react';
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

// Contratos de demonstração caso o usuário esteja em DEV_MODE sem o MySQL ligado
const FALLBACK_CONTRACTS: Contract[] = [
  {
    id: 101,
    title: 'Neutralize Cyberpsycho in Santo Domingo',
    targetName: 'Lt. James Norris',
    faction: 'Maelstrom',
    reward: 45000,
    threatLevel: 'PSYCHO',
    status: 'AVAILABLE',
  },
  {
    id: 102,
    title: 'Extract Prototype Sandevistan Schematics',
    targetName: 'Kenichi Zaburo',
    faction: 'Arasaka Corp',
    reward: 28500,
    threatLevel: 'HIGH',
    status: 'AVAILABLE',
  },
  {
    id: 103,
    title: 'Disrupt Scavenger Haunt in Japantown',
    targetName: 'Grigoriy "Butcher" Markov',
    faction: 'Scavengers',
    reward: 14000,
    threatLevel: 'MEDIUM',
    status: 'AVAILABLE',
  },
  {
    id: 104,
    title: 'Intercept Militech Convoy Data Shard',
    targetName: 'Convoy Alpha-9',
    faction: 'Militech',
    reward: 19200,
    threatLevel: 'HIGH',
    status: 'AVAILABLE',
  },
  {
    id: 105,
    title: 'Clear Tyger Claws Extortion Racket',
    targetName: 'Shinji Sato',
    faction: 'Tyger Claws',
    reward: 7500,
    threatLevel: 'LOW',
    status: 'AVAILABLE',
  },
  {
    id: 106,
    title: 'Zero Rogue Netrunner in Pacifica',
    targetName: 'Voodoo Ghost_99',
    faction: 'Voodoo Boys',
    reward: 62000,
    threatLevel: 'PSYCHO',
    status: 'AVAILABLE',
  },
];

export function Market() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineDemo, setIsOfflineDemo] = useState<boolean>(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<ThreatLevel | 'ALL'>('ALL');

  // Estado para modal rápido de criação de contrato (para testar o POST /api/contracts)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newFaction, setNewFaction] = useState('');
  const [newReward, setNewReward] = useState('');
  const [newThreat, setNewThreat] = useState<ThreatLevel>('MEDIUM');

  const fetchAvailableContracts = async () => {
    setIsLoading(true);
    setIsOfflineDemo(false);

    try {
      const response = await api.get<Contract[]>('/api/contracts/available');
      setContracts(response.data);
    } catch {
      // Se o backend/MySQL não estiver acessível, carrega o feed tático de demonstração
      setIsOfflineDemo(true);
      setContracts(FALLBACK_CONTRACTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableContracts();
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
      // Remove o contrato aceito da lista de disponíveis
      setContracts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Erro ao aceitar contrato:', err);
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
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewTarget('');
      setNewFaction('');
      setNewReward('');
      setNewThreat('MEDIUM');
    } catch (err) {
      console.error('Erro ao publicar contrato:', err);
    }
  };

  const filteredContracts =
    selectedThreat === 'ALL'
      ? contracts
      : contracts.filter((c) => c.threatLevel === selectedThreat);

  return (
    <div className="space-y-8">
      {/* =========================================================
          HEADER TÁTICO DO MERCADO
         ========================================================= */}
      <div className="border-2 border-dark-border bg-dark-surface/90 p-6 cyber-chamfer relative overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-edgerunner-yellow via-neon-cyan to-neon-pink absolute top-0 left-0" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-neon-cyan uppercase tracking-widest mb-1">
              <Radar className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              <span>// NIGHT CITY FIXER NETWORK — LIVE BOUNTY FEED</span>
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-wider uppercase text-white">
              Contract <span className="text-edgerunner-yellow drop-shadow-neon-yellow">Market</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-edgerunner-yellow text-dark-bg font-mono text-xs font-bold uppercase tracking-widest border border-edgerunner-yellow hover:bg-transparent hover:text-edgerunner-yellow hover:shadow-hud-yellow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>NEW GIG</span>
            </button>

            <button
              type="button"
              onClick={fetchAvailableContracts}
              disabled={isLoading}
              className="px-4 py-2.5 bg-dark-card border border-dark-border hover:border-neon-cyan text-gray-300 hover:text-neon-cyan font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-neon-cyan' : ''}`} />
              <span>SYNC FEED</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros por Threat Level */}
        <div className="mt-6 pt-4 border-t border-dark-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'PSYCHO'] as const).map((level) => {
              const isSelected = selectedThreat === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedThreat(level)}
                  className={`px-3 py-1 font-mono text-xs uppercase tracking-widest border transition-all cursor-pointer ${
                    isSelected
                      ? level === 'PSYCHO'
                        ? 'bg-neon-pink text-dark-bg border-neon-pink font-bold shadow-hud-pink'
                        : 'bg-edgerunner-yellow text-dark-bg border-edgerunner-yellow font-bold shadow-hud-yellow'
                      : 'bg-dark-card border-dark-border text-gray-400 hover:border-neon-cyan hover:text-neon-cyan'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>

          <div className="font-mono text-xs text-gray-400 uppercase tracking-widest">
            AVAILABLE GIGS: <strong className="text-edgerunner-yellow">{filteredContracts.length}</strong>
          </div>
        </div>
      </div>

      {/* Banner Informativo caso esteja em Modo Demo Offline */}
      {isOfflineDemo && (
        <div className="p-3.5 bg-edgerunner-yellow/10 border border-edgerunner-yellow/60 text-edgerunner-yellow flex items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              SIMULATION FEED ATIVO: Exibindo contratos táticos locais (conecte o backend Spring Boot em localhost:8080 para dados reais do MySQL).
            </span>
          </div>
        </div>
      )}

      {/* =========================================================
          GRID RESPONSIVO DE CONTRATOS (1 col Mobile, 2/3 Desktop)
         ========================================================= */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((skeleton) => (
            <div
              key={skeleton}
              className="h-64 bg-dark-surface border-2 border-dark-border p-6 animate-pulse flex flex-col justify-between"
            >
              <div className="h-4 w-1/3 bg-dark-border" />
              <div className="h-6 w-3/4 bg-dark-border" />
              <div className="h-16 w-full bg-dark-card border border-dark-border" />
              <div className="h-8 w-1/2 bg-dark-border" />
            </div>
          ))}
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="border-2 border-dark-border bg-dark-surface/70 p-12 text-center cyber-chamfer">
          <Skull className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider">
            No Active Bounties Found
          </h2>
          <p className="font-mono text-xs text-gray-400 mt-1 uppercase tracking-widest">
            Nenhum contrato disponível para o filtro selecionado no momento.
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  filter: 'brightness(2)',
                  transition: { duration: 0.25 },
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
          MODAL DE CRIAÇÃO RÁPIDA DE CONTRATO (FIXER POST)
         ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-dark-surface border-2 border-edgerunner-yellow cyber-chamfer p-6 relative shadow-hud-yellow">
            <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-5">
              <h2 className="font-display font-bold text-xl text-edgerunner-yellow uppercase tracking-wider">
                // Post New Bounty
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-neon-pink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-300 uppercase mb-1">Contract Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Eliminate Maelstrom Lieutenant"
                  className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border text-white focus:outline-none focus:border-edgerunner-yellow"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 uppercase mb-1">Target Name</label>
                  <input
                    type="text"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="Ex: Royce"
                    className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border text-white focus:outline-none focus:border-edgerunner-yellow"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 uppercase mb-1">Faction</label>
                  <input
                    type="text"
                    required
                    value={newFaction}
                    onChange={(e) => setNewFaction(e.target.value)}
                    placeholder="Ex: Maelstrom"
                    className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border text-white focus:outline-none focus:border-edgerunner-yellow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 uppercase mb-1">Reward (€$)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border text-white focus:outline-none focus:border-edgerunner-yellow"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 uppercase mb-1">Threat Level</label>
                  <select
                    value={newThreat}
                    onChange={(e) => setNewThreat(e.target.value as ThreatLevel)}
                    className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border text-white focus:outline-none focus:border-edgerunner-yellow"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="PSYCHO">PSYCHO</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-edgerunner-yellow text-dark-bg font-display font-bold text-sm uppercase tracking-widest hover:bg-transparent hover:text-edgerunner-yellow border border-edgerunner-yellow transition-all cursor-pointer"
              >
                BROADCAST CONTRACT TO NET
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Market;
