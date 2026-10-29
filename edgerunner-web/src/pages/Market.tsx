import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  RefreshCw,
  AlertTriangle,
  Plus,
  X,
  Skull,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  LayoutGrid,
  Globe2,
  Columns,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ContractCard } from '../components/contracts/ContractCard';
import { ContractBriefingDrawer } from '../components/contracts/ContractBriefingDrawer';
import { TacticalWorldMap } from '../components/map/TacticalWorldMap';
import {
  fetchAllContractsUnified,
  acceptContractUnified,
  createLocalContract,
} from '../services/contractStore';
import type { Contract, ContractStatus, ThreatLevel } from '../types/contract';
import { soundEngine } from '../utils/sound';

const THREAT_FILTER_LABELS: Record<ThreatLevel | 'ALL', string> = {
  ALL: 'TODOS OS RISCOS',
  LOW: 'BAIXO',
  MEDIUM: 'MÉDIO',
  HIGH: 'ALTO',
  PSYCHO: 'CRÍTICO',
};

const STATUS_FILTER_LABELS: Record<ContractStatus | 'ALL', string> = {
  ALL: 'TODOS OS STATUS',
  AVAILABLE: 'DISPONÍVEIS',
  ACCEPTED: 'EM EXECUÇÃO',
  COMPLETED: 'CONCLUÍDOS',
  FAILED: 'FALHOS',
};

const REGION_OPTIONS = [
  'ALL',
  'ÁSIA-PACÍFICO',
  'AMÉRICA LATINA',
  'EUROPA',
  'AMÉRICA DO NORTE',
  'ORIENTE MÉDIO & ÁFRICA',
] as const;

type SortOption =
  | 'REWARD_DESC'
  | 'REWARD_ASC'
  | 'RISK_DESC'
  | 'RISK_ASC'
  | 'REP_ASC'
  | 'REP_DESC';

type CatalogViewMode = 'GRID' | 'MAP' | 'HYBRID';

const THREAT_WEIGHT: Record<ThreatLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  PSYCHO: 4,
};

interface MarketProps {
  defaultView?: CatalogViewMode;
}

export function Market({ defaultView }: MarketProps = {}) {
  const location = useLocation();
  const { operator, isAdmin, isDemoMode, refreshProfile } = useAuth();
  const operatorReputation = operator?.reputation ?? operator?.streetCred ?? 1;

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Modo de visualização (RF-106): GRADE, MAPA TÁTICO ou HÍBRIDO
  const [viewMode, setViewMode] = useState<CatalogViewMode>(() => {
    if (defaultView) return defaultView;
    if (
      location.pathname === '/map' ||
      location.search.includes('view=map')
    ) {
      return 'MAP';
    }
    return 'GRID';
  });

  // Estados de Busca, Filtros Combinados e Ordenação (RF-040 a RF-042)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedThreat, setSelectedThreat] = useState<ThreatLevel | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus | 'ALL'>('AVAILABLE');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [onlyEligible, setOnlyEligible] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('REWARD_DESC');

  // Estado para modal de publicação de contrato
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newFaction, setNewFaction] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newRegion, setNewRegion] = useState('ÁSIA-PACÍFICO');
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');
  const [newReward, setNewReward] = useState('');
  const [newMinRep, setNewMinRep] = useState('1');
  const [newThreat, setNewThreat] = useState<ThreatLevel>('MEDIUM');
  const [newSummary, setNewSummary] = useState('');

  const showBanner = (type: 'success' | 'error', message: string) => {
    setActionBanner({ type, message });
    window.setTimeout(() => {
      setActionBanner((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  const loadContracts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { contracts: list } = await fetchAllContractsUnified(isDemoMode);
      setContracts(list);
    } catch {
      setLoadError(
        'Não foi possível comunicar com o servidor de operações para carregar o catálogo.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    fetchAllContractsUnified(isDemoMode)
      .then(({ contracts: list }) => {
        if (!cancelled) {
          setContracts(list);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(
            'Não foi possível comunicar com o servidor de operações para carregar o catálogo.'
          );
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isDemoMode]);

  const handleAcceptContract = async (idOrContract: number | Contract) => {
    const target =
      typeof idOrContract === 'number'
        ? contracts.find((c) => c.id === idOrContract)
        : idOrContract;
    if (!target) return;

    setAcceptingId(target.id);
    try {
      const { updatedContract, isOffline } = await acceptContractUnified(
        target,
        isDemoMode
      );
      setContracts((prev) =>
        prev.map((c) => (c.id === target.id ? updatedContract : c))
      );
      setSelectedContract((prev) =>
        prev?.id === target.id ? updatedContract : prev
      );
      if (!isOffline) {
        await refreshProfile();
      }
      soundEngine.playSuccess();
      showBanner(
        'success',
        `OPERAÇÃO CTR-${String(target.id).padStart(4, '0')} VINCULADA AO SEU TERMINAL.`
      );
    } catch (err: unknown) {
      soundEngine.playWarning();
      const axiosErr = err as {
        response?: { status?: number; data?: { message?: string; error?: string } };
      };
      const serverMsg =
        axiosErr.response?.data?.message || axiosErr.response?.data?.error;
      showBanner(
        'error',
        serverMsg ||
          'FALHA NA VINCULAÇÃO: O servidor rejeitou a operação ou está indisponível.'
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      soundEngine.playWarning();
      showBanner(
        'error',
        'ACESSO NEGADO: Apenas contas com perfil ADMIN podem publicar contratos na rede.'
      );
      return;
    }

    const parsedLat = newLatitude.trim() ? Number(newLatitude) : undefined;
    const parsedLng = newLongitude.trim() ? Number(newLongitude) : undefined;

    const payload = {
      title: newTitle.trim(),
      targetName: newTarget.trim(),
      faction: newFaction.trim(),
      reward: Number(newReward) || 15000,
      threatLevel: newThreat,
      locationName: newLocation.trim() || 'Perímetro Urbano Classificado',
      region: newRegion,
      latitude:
        typeof parsedLat === 'number' && !Number.isNaN(parsedLat)
          ? parsedLat
          : undefined,
      longitude:
        typeof parsedLng === 'number' && !Number.isNaN(parsedLng)
          ? parsedLng
          : undefined,
      minReputation: Math.max(1, Number(newMinRep) || 1),
      summary: newSummary.trim() || undefined,
    };

    try {
      if (!isDemoMode) {
        const response = await api.post<Contract>('/api/contracts', payload);
        setContracts((prev) => [response.data, ...prev]);
      } else {
        const created = createLocalContract(payload);
        setContracts((prev) => [created, ...prev]);
      }
      soundEngine.playSuccess();
      showBanner('success', 'NOVO CONTRATO PUBLICADO NO DIRETÓRIO DA REDE.');
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewTarget('');
      setNewFaction('');
      setNewLocation('');
      setNewLatitude('');
      setNewLongitude('');
      setNewReward('');
      setNewMinRep('1');
      setNewSummary('');
      setNewThreat('MEDIUM');
    } catch (err: unknown) {
      soundEngine.playWarning();
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 403) {
        showBanner(
          'error',
          'ACESSO NEGADO (HTTP 403): Permissão administrativa exigida para publicar contratos.'
        );
      } else {
        showBanner(
          'error',
          'FALHA NA PUBLICAÇÃO: Não foi possível salvar o contrato no servidor.'
        );
      }
    }
  };

  const resetFilters = () => {
    soundEngine.playClick();
    setSearchQuery('');
    setSelectedThreat('ALL');
    setSelectedStatus('AVAILABLE');
    setSelectedRegion('ALL');
    setOnlyEligible(false);
    setSortBy('REWARD_DESC');
  };

  const filteredAndSortedContracts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return contracts
      .filter((c) => {
        if (selectedThreat !== 'ALL' && c.threatLevel !== selectedThreat) {
          return false;
        }
        if (selectedStatus !== 'ALL' && c.status !== selectedStatus) {
          return false;
        }
        if (
          selectedRegion !== 'ALL' &&
          (c.region || 'GLOBAL').toUpperCase() !== selectedRegion
        ) {
          return false;
        }
        if (onlyEligible && (c.minReputation ?? 1) > operatorReputation) {
          return false;
        }
        if (query) {
          const haystack = [
            c.title,
            c.targetName,
            c.faction,
            c.locationName,
            c.region,
            c.summary,
            `CTR-${String(c.id).padStart(4, '0')}`,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!haystack.includes(query)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'REWARD_DESC':
            return b.reward - a.reward;
          case 'REWARD_ASC':
            return a.reward - b.reward;
          case 'RISK_DESC':
            return THREAT_WEIGHT[b.threatLevel] - THREAT_WEIGHT[a.threatLevel];
          case 'RISK_ASC':
            return THREAT_WEIGHT[a.threatLevel] - THREAT_WEIGHT[b.threatLevel];
          case 'REP_ASC':
            return (a.minReputation ?? 1) - (b.minReputation ?? 1);
          case 'REP_DESC':
            return (b.minReputation ?? 1) - (a.minReputation ?? 1);
          default:
            return 0;
        }
      });
  }, [
    contracts,
    searchQuery,
    selectedThreat,
    selectedStatus,
    selectedRegion,
    onlyEligible,
    operatorReputation,
    sortBy,
  ]);

  return (
    <div className="space-y-8">
      {/* =========================================================
          1. CABEÇALHO DO CATÁLOGO DE CONTRATOS & BUSCA EM TEMPO REAL
         ========================================================= */}
      <div className="border border-[#1E2636] bg-[#0C1017] p-6 md:p-8 ah-corner-marks relative overflow-hidden">
        <div className="h-[1px] w-full bg-[#00E5FF]/50 absolute top-0 left-0" />

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.18em] mb-1.5">
              <Radar className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>CONTRACT DIRECTORY &amp; EARTH CARTOGRAPHY // CAT_01</span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-[#F1F5F9]">
              Catálogo Global de Contratos
            </h1>
            <p className="font-sans text-sm text-[#94A3B8] mt-1">
              alterne entre a grade de dossiês e o mapa geográfico real da Terra (WGS84) mantendo todos os filtros sincronizados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Alternador de Modo de Visualização (RF-106): GRADE / MAPA / HÍBRIDO */}
            <div
              role="group"
              aria-label="Modo de visualização do catálogo"
              className="inline-flex bg-[#07090E] border border-[#1E2636] p-0.5"
            >
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setViewMode('GRID');
                }}
                className={`px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-[#00E5FF] text-[#07090E] font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>GRADE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setViewMode('MAP');
                }}
                className={`px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'MAP'
                    ? 'bg-[#00E5FF] text-[#07090E] font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>MAPA GLOBAL</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setViewMode('HYBRID');
                }}
                className={`px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'HYBRID'
                    ? 'bg-[#00E5FF] text-[#07090E] font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>HÍBRIDO</span>
              </button>
            </div>

            {isAdmin && (
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
            )}

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                loadContracts();
              }}
              disabled={isLoading}
              className="px-3.5 py-2.5 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF]/60 text-[#F1F5F9] font-mono text-[11px] uppercase tracking-[0.16em] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isLoading ? 'animate-spin text-[#00E5FF]' : 'text-[#94A3B8]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* BARRA DE PESQUISA TEXTUAL + SELETORES DE FILTRO E ORDENAÇÃO */}
        <div className="mt-6 pt-6 border-t border-[#1E2636] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Busca por texto em tempo real */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por operação, alvo, contratante, cidade ou CTR-ID..."
                aria-label="Pesquisar contratos"
                className="w-full pl-10 pr-9 py-2.5 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-sans text-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F1F5F9] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtro por Região Geográfica */}
            <div className="md:col-span-3">
              <div className="relative">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#00E5FF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    soundEngine.playClick();
                    setSelectedRegion(e.target.value);
                  }}
                  aria-label="Filtrar por região geográfica"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-mono text-[11px] text-[#F1F5F9] uppercase tracking-[0.12em] focus:outline-none cursor-pointer"
                >
                  {REGION_OPTIONS.map((region) => (
                    <option key={region} value={region}>
                      {region === 'ALL' ? 'REGIÃO: GLOBAL (TODAS)' : region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtro por Status */}
            <div className="md:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  soundEngine.playClick();
                  setSelectedStatus(e.target.value as ContractStatus | 'ALL');
                }}
                aria-label="Filtrar por status do contrato"
                className="w-full px-3 py-2.5 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-mono text-[11px] text-[#F1F5F9] uppercase tracking-[0.12em] focus:outline-none cursor-pointer"
              >
                {(['ALL', 'AVAILABLE', 'ACCEPTED', 'COMPLETED', 'FAILED'] as const).map(
                  (st) => (
                    <option key={st} value={st}>
                      {STATUS_FILTER_LABELS[st]}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Ordenação */}
            <div className="md:col-span-2">
              <div className="relative">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#00E5FF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    soundEngine.playClick();
                    setSortBy(e.target.value as SortOption);
                  }}
                  aria-label="Ordenar contratos"
                  className="w-full pl-8 pr-2 py-2.5 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-mono text-[11px] text-[#F1F5F9] uppercase tracking-[0.1em] focus:outline-none cursor-pointer"
                >
                  <option value="REWARD_DESC">MAIOR RECOMPENSA</option>
                  <option value="REWARD_ASC">MENOR RECOMPENSA</option>
                  <option value="RISK_DESC">MAIOR RISCO</option>
                  <option value="RISK_ASC">MENOR RISCO</option>
                  <option value="REP_ASC">MENOR REP EXIGIDA</option>
                  <option value="REP_DESC">MAIOR REP EXIGIDA</option>
                </select>
              </div>
            </div>
          </div>

          {/* Linha secundária: Pílulas de Risco + Toggle de Elegibilidade + Contador */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'PSYCHO'] as const).map(
                (level) => {
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
                }
              )}

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setOnlyEligible((prev) => !prev);
                }}
                className={`px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                  onlyEligible
                    ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981] font-semibold'
                    : 'bg-[#111722] border-[#1E2636] text-[#94A3B8] hover:border-[#10B981]/50 hover:text-[#F1F5F9]'
                }`}
              >
                ELEGÍVEIS (REP &le; {operatorReputation})
              </button>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px] text-[#64748B] uppercase tracking-[0.14em]">
              {(searchQuery ||
                selectedThreat !== 'ALL' ||
                selectedStatus !== 'AVAILABLE' ||
                selectedRegion !== 'ALL' ||
                onlyEligible) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[#94A3B8] hover:text-[#00E5FF] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>LIMPAR FILTROS</span>
                </button>
              )}

              <span>
                EXIBINDO:{' '}
                <strong className="text-[#00E5FF]">
                  {filteredAndSortedContracts.length}
                </strong>{' '}
                / {contracts.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de feedback operacional (sucesso ou falha de API) */}
      {actionBanner && (
        <div
          role={actionBanner.type === 'error' ? 'alert' : 'status'}
          className={`p-4 border font-mono text-xs uppercase tracking-[0.14em] flex items-center justify-between gap-3 ${
            actionBanner.type === 'success'
              ? 'bg-[#10B981]/10 border-[#10B981]/60 text-[#10B981]'
              : 'bg-[#F43F5E]/10 border-[#F43F5E]/60 text-[#F43F5E]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            FECHAR
          </button>
        </div>
      )}

      {/* Erro explícito de comunicação com a API (sem mascarar com dados fictícios) */}
      {loadError && (
        <div
          role="alert"
          className="p-6 bg-[#F43F5E]/10 border border-[#F43F5E]/60 text-[#E6EDF3] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F43F5E] shrink-0 mt-0.5" />
            <div>
              <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-[#F43F5E] font-semibold">
                ERRO DE COMUNICAÇÃO COM O BACKEND
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                {loadError}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadContracts}
            className="px-4 py-2 bg-[#0C1017] border border-[#F43F5E]/60 hover:border-[#00E5FF] font-mono text-xs text-[#F1F5F9] uppercase tracking-[0.14em] shrink-0 cursor-pointer"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      )}

      {/* Aviso explícito quando em Modo Demonstração deliberado */}
      {isDemoMode && (
        <div className="p-3.5 bg-[#F59E0B]/10 border border-[#F59E0B]/50 text-[#F59E0B] flex items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              MODO DEMONSTRAÇÃO ATIVO: Catálogo simulado localmente. Operações realizadas neste modo não alteram o banco de dados do servidor.
            </span>
          </div>
        </div>
      )}

      {/* =========================================================
          2. MAPA GEOGRÁFICO REAL DA TERRA — MAPLIBRE GL JS (RF-100 a RF-108)
         ========================================================= */}
      {(viewMode === 'MAP' || viewMode === 'HYBRID') && !isLoading && (
        <TacticalWorldMap
          contracts={filteredAndSortedContracts}
          mode={viewMode === 'MAP' ? 'FULL_MAP' : 'HYBRID'}
          operatorReputation={operatorReputation}
          onOpenDossier={(c) => setSelectedContract(c)}
          onAcceptContract={(c) => handleAcceptContract(c)}
          acceptingId={acceptingId}
        />
      )}

      {/* =========================================================
          3. GRID RESPONSIVO DE CONTRATOS
         ========================================================= */}
      {(viewMode === 'GRID' || viewMode === 'HYBRID') && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
          ) : filteredAndSortedContracts.length === 0 ? (
            <div className="border border-[#1E2636] bg-[#0C1017] p-12 text-center ah-corner-marks">
              <Skull className="w-8 h-8 text-[#64748B] mx-auto mb-3" />
              <h2 className="font-display font-bold text-xl text-[#F1F5F9]">
                Nenhum contrato localizado
              </h2>
              <p className="font-mono text-xs text-[#64748B] mt-1 uppercase tracking-[0.14em]">
                Ajuste os filtros de risco, região ou termos de pesquisa para visualizar mais resultados.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF] font-mono text-xs text-[#00E5FF] uppercase tracking-[0.14em] cursor-pointer"
              >
                RESTAURAR PARÂMETROS PADRÃO
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredAndSortedContracts.map((contract) => (
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
                      operatorReputation={operatorReputation}
                      onSelect={(c) => setSelectedContract(c)}
                      onAccept={(id) => handleAcceptContract(id)}
                      isAccepting={acceptingId === contract.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      {/* =========================================================
          4. DOSSIÊ CINEMATOGRÁFICO DE BRIEFING (Drawer)
         ========================================================= */}
      <ContractBriefingDrawer
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
        operatorReputation={operatorReputation}
        onAccept={(c) => handleAcceptContract(c)}
        isAccepting={
          selectedContract ? acceptingId === selectedContract.id : false
        }
      />

      {/* =========================================================
          5. MODAL DE PUBLICAÇÃO DE CONTRATO GEOLOCALIZADO
         ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#07090E]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#0C1017] border border-[#1E2636] ah-corner-marks p-6 relative max-h-[92vh] overflow-y-auto">
            <div className="h-[1px] w-full bg-[#00E5FF] absolute top-0 left-0" />

            <div className="flex items-center justify-between border-b border-[#1E2636] pb-3.5 mb-5">
              <div>
                <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] block">
                  DISPATCH // GEOLOCATED BRIEFING
                </span>
                <h2 className="font-display font-bold text-lg text-[#F1F5F9]">
                  Publicar Novo Contrato na Rede
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Alvo / Instalação
                  </label>
                  <input
                    type="text"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="Ex: Servidor Kestrel-09"
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
                    placeholder="Ex: Aethelgard Dynamics"
                    className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] font-sans text-sm text-[#F1F5F9] placeholder-[#64748B]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Cidade / Setor Geográfico
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Ex: Shinjuku, Tóquio — Japão"
                    className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] font-sans text-sm text-[#F1F5F9] placeholder-[#64748B]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Região Operacional
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] font-mono text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00E5FF]"
                  >
                    {REGION_OPTIONS.filter((r) => r !== 'ALL').map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Latitude WGS84 (opcional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={newLatitude}
                    onChange={(e) => setNewLatitude(e.target.value)}
                    placeholder="Ex: 35.6895"
                    className="w-full px-3.5 py-2 bg-[#07090E] border border-[#1E2636] font-mono text-xs text-[#F1F5F9] placeholder-[#64748B]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Longitude WGS84 (opcional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={newLongitude}
                    onChange={(e) => setNewLongitude(e.target.value)}
                    placeholder="Ex: 139.6917"
                    className="w-full px-3.5 py-2 bg-[#07090E] border border-[#1E2636] font-mono text-xs text-[#F1F5F9] placeholder-[#64748B]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                    className="w-full px-3 py-2.5 bg-[#07090E] border border-[#1E2636] font-mono text-sm text-[#F1F5F9] placeholder-[#64748B]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    REP Mínima
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newMinRep}
                    onChange={(e) => setNewMinRep(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#07090E] border border-[#1E2636] font-mono text-sm text-[#F1F5F9] focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                    Risco
                  </label>
                  <select
                    value={newThreat}
                    onChange={(e) => setNewThreat(e.target.value as ThreatLevel)}
                    className="w-full px-3 py-2.5 bg-[#07090E] border border-[#1E2636] font-mono text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="LOW">BAIXO</option>
                    <option value="MEDIUM">MÉDIO</option>
                    <option value="HIGH">ALTO</option>
                    <option value="PSYCHO">CRÍTICO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                  Resumo Tático (opcional)
                </label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Síntese do objetivo e contexto operacional..."
                  className="w-full px-3.5 py-2 bg-[#07090E] border border-[#1E2636] font-sans text-xs text-[#F1F5F9] placeholder-[#64748B]/50 focus:outline-none focus:border-[#00E5FF]"
                />
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
