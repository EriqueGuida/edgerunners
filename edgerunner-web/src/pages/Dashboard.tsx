import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Award,
  Activity,
  CheckCircle2,
  Bell,
  ArrowUpRight,
  Crosshair,
  Shield,
  Sparkles,
  CheckCheck,
  Clock,
  FileSearch,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ContractCard } from '../components/contracts/ContractCard';
import { ContractBriefingDrawer } from '../components/contracts/ContractBriefingDrawer';
import {
  fetchAllContractsUnified,
  acceptContractUnified,
  getLocalMyContracts,
  getLocalNotifications,
  markAllLocalNotificationsRead,
} from '../services/contractStore';
import type { Contract, NotificationItem } from '../types/contract';
import { soundEngine } from '../utils/sound';

export function Dashboard() {
  const { operator, refreshProfile } = useAuth();
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [myContracts, setMyContracts] = useState<Contract[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const operatorCallsign = operator?.callsign || operator?.username || 'OP_VANGUARD';
  const operatorSpec = operator?.specialization || 'INFILTRAÇÃO & EXTRAÇÃO DE DADOS';
  const balance = operator?.balance ?? operator?.eddies ?? 0;
  const reputation = operator?.reputation ?? operator?.streetCred ?? 1;

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      setIsLoading(true);
      const { contracts, isOffline } = await fetchAllContractsUnified();

      let operatorContracts: Contract[] = [];
      let operatorNotifications: NotificationItem[] = [];

      if (!isOffline) {
        try {
          const [myRes, notifRes] = await Promise.all([
            api.get<Contract[]>('/api/contracts/my-contracts'),
            api.get<NotificationItem[]>('/api/notifications'),
          ]);
          operatorContracts = myRes.data;
          operatorNotifications = notifRes.data;
        } catch {
          operatorContracts = getLocalMyContracts();
          operatorNotifications = getLocalNotifications();
        }
      } else {
        operatorContracts = getLocalMyContracts();
        operatorNotifications = getLocalNotifications();
      }

      if (!cancelled) {
        setAllContracts(contracts);
        setMyContracts(operatorContracts);
        setNotifications(operatorNotifications);
        setIsLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAcceptContract = async (idOrContract: number | Contract) => {
    const target =
      typeof idOrContract === 'number'
        ? allContracts.find((c) => c.id === idOrContract)
        : idOrContract;
    if (!target) return;

    setAcceptingId(target.id);
    try {
      const { updatedContract, isOffline } = await acceptContractUnified(target);
      setAllContracts((prev) =>
        prev.map((c) => (c.id === target.id ? updatedContract : c))
      );
      setMyContracts((prev) => [
        updatedContract,
        ...prev.filter((c) => c.id !== target.id),
      ]);

      if (!isOffline) {
        await refreshProfile();
        const notifRes = await api.get<NotificationItem[]>('/api/notifications');
        setNotifications(notifRes.data);
      } else {
        setNotifications(getLocalNotifications());
      }

      setSelectedContract((prev) =>
        prev?.id === target.id ? updatedContract : prev
      );
      setBannerMessage(
        `OPERAÇÃO CTR-${String(target.id).padStart(4, '0')} VINCULADA AO SEU TERMINAL.`
      );
      window.setTimeout(() => setBannerMessage(null), 4000);
    } catch {
      soundEngine.playWarning();
    } finally {
      setAcceptingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    soundEngine.playClick();
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      setNotifications(markAllLocalNotificationsRead());
    }
  };

  const activeOperations = myContracts.filter((c) => c.status === 'ACCEPTED');
  const completedOperations = myContracts.filter((c) => c.status === 'COMPLETED');

  // Contratos recomendados: disponíveis e compatíveis com a reputação atual do operador
  const recommendedContracts = allContracts
    .filter(
      (c) => c.status === 'AVAILABLE' && (c.minReputation ?? 1) <= reputation
    )
    .sort((a, b) => b.reward - a.reward)
    .slice(0, 3);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(balance);

  const nextTierRep = reputation < 10 ? 10 : reputation < 30 ? 30 : 100;
  const repProgressPct = Math.min(100, Math.round((reputation / nextTierRep) * 100));
  const clearanceLabel =
    reputation >= 30
      ? 'OPERADOR SÊNIOR // NÍVEL ALFA'
      : reputation >= 10
      ? 'ESPECIALISTA TÁTICO // NÍVEL BETA'
      : 'OPERADOR VERIFICADO // NÍVEL INICIAL';

  return (
    <div className="space-y-8">
      {/* =========================================================
          1. CABEÇALHO EXECUTIVO DO OPERADOR
         ========================================================= */}
      <section className="border border-[#1E2636] bg-[#0C1017] p-6 md:p-8 ah-corner-marks relative overflow-hidden">
        <div className="h-[1px] w-full bg-[#00E5FF]/60 absolute top-0 left-0" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] mb-2">
              <span className="inline-flex items-center gap-1.5 text-[#00E5FF]">
                <span className="w-1.5 h-1.5 bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                COMMAND CENTER // OPS_00
              </span>
              <span className="text-[#1E2636]">|</span>
              <span className="text-[#94A3B8]">{clearanceLabel}</span>
            </div>

            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-[#F1F5F9]">
              Terminal Operacional — {operatorCallsign}
            </h1>
            <p className="font-mono text-xs text-[#64748B] uppercase tracking-[0.14em] mt-1">
              ESPECIALIZAÇÃO: <span className="text-[#94A3B8]">{operatorSpec}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/contracts"
              onClick={() => soundEngine.playClick()}
              className="px-4 py-2.5 bg-[#00E5FF] hover:bg-[#33ECFF] text-[#07090E] font-mono text-[11px] font-semibold uppercase tracking-[0.16em] flex items-center gap-2 transition-colors"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>CATÁLOGO DE CONTRATOS</span>
            </Link>

            <Link
              to="/my-contracts"
              onClick={() => soundEngine.playClick()}
              className="px-4 py-2.5 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF]/60 text-[#F1F5F9] font-mono text-[11px] uppercase tracking-[0.16em] flex items-center gap-2 transition-colors"
            >
              <span>SALA DE OPERAÇÕES ({activeOperations.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#00E5FF]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Banner de confirmação ao vincular contrato pelo Dashboard */}
      <AnimatePresence>
        {bannerMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-[#10B981]/10 border border-[#10B981]/60 text-[#10B981] font-mono text-xs uppercase tracking-[0.14em] flex items-center justify-between"
          >
            <span className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {bannerMessage}
            </span>
            <Link
              to="/my-contracts"
              className="underline hover:opacity-80 font-semibold"
            >
              IR PARA OPERAÇÕES &rarr;
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          2. INDICADORES EXECUTIVOS (4 KPIs)
         ========================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* KPI 1: Saldo da Carteira */}
        <div className="bg-[#0C1017] border border-[#1E2636] p-5 ah-corner-marks relative">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.16em]">
              SALDO DISPONÍVEL
            </span>
            <Wallet className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display font-bold text-3xl text-[#F1F5F9]">
              {formattedBalance}
            </span>
            <span className="font-mono text-xs font-semibold text-[#00E5FF]">¢</span>
          </div>
          <p className="mt-2 font-mono text-[10px] text-[#64748B] uppercase tracking-[0.12em]">
            LIQUIDAÇÃO AUTOMÁTICA ATIVA
          </p>
        </div>

        {/* KPI 2: Nível de Reputação & Progressão */}
        <div className="bg-[#0C1017] border border-[#1E2636] p-5 ah-corner-marks relative">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.16em]">
              ÍNDICE DE REPUTAÇÃO
            </span>
            <Award className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-3xl text-[#F1F5F9]">
                {reputation}
              </span>
              <span className="font-mono text-xs text-[#00E5FF]">REP</span>
            </div>
            <span className="font-mono text-[10px] text-[#64748B]">
              PRÓX. NÍVEL: {nextTierRep}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full bg-[#111722] border border-[#1E2636] overflow-hidden">
            <div
              className="h-full bg-[#00E5FF] transition-all duration-300"
              style={{ width: `${repProgressPct}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Operações Ativas */}
        <div className="bg-[#0C1017] border border-[#1E2636] p-5 ah-corner-marks relative">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.16em]">
              EM ANDAMENTO
            </span>
            <Activity className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl text-[#F1F5F9]">
              {activeOperations.length}
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">
              {activeOperations.length === 1 ? 'OPERAÇÃO ATIVA' : 'OPERAÇÕES ATIVAS'}
            </span>
          </div>
          <p className="mt-2 font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.12em]">
            {allContracts.filter((c) => c.status === 'AVAILABLE').length} DISPONÍVEIS NA REDE
          </p>
        </div>

        {/* KPI 4: Operações Concluídas */}
        <div className="bg-[#0C1017] border border-[#1E2636] p-5 ah-corner-marks relative">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.16em]">
              HISTÓRICO VERIFICADO
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl text-[#10B981]">
              {completedOperations.length}
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">CONCLUÍDAS</span>
          </div>
          <p className="mt-2 font-mono text-[10px] text-[#64748B] uppercase tracking-[0.12em]">
            REGISTRO AUDITADO NO LEDGER
          </p>
        </div>
      </section>

      {/* =========================================================
          3. GRID PRINCIPAL: OPERAÇÕES ATIVAS + NOTIFICAÇÕES
         ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda (8 cols): Operações em Andamento */}
        <section className="lg:col-span-8 bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1E2636] pb-4 mb-5">
              <div>
                <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  ACTIVE DEPLOYMENTS
                </span>
                <h2 className="font-display font-bold text-xl text-[#F1F5F9] mt-0.5">
                  Operações em Andamento
                </h2>
              </div>

              <Link
                to="/my-contracts"
                onClick={() => soundEngine.playClick()}
                className="font-mono text-[11px] text-[#00E5FF] hover:underline uppercase tracking-[0.14em] flex items-center gap-1"
              >
                <span>GERENCIAR TODAS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((sk) => (
                  <div
                    key={sk}
                    className="h-20 bg-[#111722] border border-[#1E2636] animate-pulse"
                  />
                ))}
              </div>
            ) : activeOperations.length === 0 ? (
              <div className="p-8 bg-[#111722]/60 border border-[#1E2636] text-center">
                <p className="font-sans text-sm text-[#94A3B8]">
                  Você não possui operações em execução no momento.
                </p>
                <Link
                  to="/contracts"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#00E5FF]/15 border border-[#00E5FF] font-mono text-xs text-[#00E5FF] uppercase tracking-[0.14em]"
                >
                  EXPLORAR OPORTUNIDADES &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOperations.map((op) => (
                  <div
                    key={op.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedContract(op);
                    }}
                    className="group p-4 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF]/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                        <span className="text-[#00E5FF]">
                          CTR-{String(op.id).padStart(4, '0')}
                        </span>
                        <span className="text-[#1E2636]">|</span>
                        <span className="text-[#94A3B8]">
                          {op.locationName || op.faction}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-base text-[#F1F5F9] group-hover:text-[#00E5FF] transition-colors">
                        {op.title}
                      </h3>
                      <p className="font-mono text-[11px] text-[#64748B]">
                        ALVO: <span className="text-[#94A3B8]">{op.targetName}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-[#1E2636] pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="block font-mono text-[10px] text-[#64748B] uppercase">
                          RECOMPENSA
                        </span>
                        <span className="font-display font-bold text-lg text-[#F1F5F9]">
                          {new Intl.NumberFormat('pt-BR').format(op.reward)}{' '}
                          <span className="font-mono text-xs text-[#00E5FF]">¢</span>
                        </span>
                      </div>

                      <span className="px-3 py-2 bg-[#07090E] border border-[#1E2636] group-hover:border-[#00E5FF] font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.14em] flex items-center gap-1.5">
                        <FileSearch className="w-3.5 h-3.5" />
                        <span>BRIEFING</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Coluna Direita (4 cols): Feed de Notificações Recentes */}
        <section className="lg:col-span-4 bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1E2636] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#00E5FF]" />
                <div>
                  <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] block">
                    SYSTEM TELEMETRY
                  </span>
                  <h2 className="font-display font-bold text-lg text-[#F1F5F9]">
                    Notificações ({unreadCount})
                  </h2>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Marcar todas as notificações como lidas"
                  className="px-2.5 py-1 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF] font-mono text-[10px] text-[#94A3B8] hover:text-[#00E5FF] uppercase tracking-[0.12em] flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>LER TODAS</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="font-mono text-xs text-[#64748B] py-6 text-center">
                  Nenhuma transmissão recente.
                </p>
              ) : (
                notifications.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 border transition-colors ${
                      item.isRead
                        ? 'bg-[#111722]/40 border-[#1E2636] opacity-75'
                        : 'bg-[#111722] border-[#00E5FF]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] font-semibold text-[#F1F5F9] uppercase tracking-[0.12em] flex items-center gap-1.5">
                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 bg-[#00E5FF] shrink-0" />
                        )}
                        {item.type === 'ALERT' && (
                          <AlertTriangle className="w-3 h-3 text-[#F43F5E] shrink-0" />
                        )}
                        {item.title}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                      {item.message}
                    </p>
                    <span className="mt-2 flex items-center gap-1 font-mono text-[10px] text-[#64748B]">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(item.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          4. CONTRATOS RECOMENDADOS PARA O PERFIL DO OPERADOR
         ========================================================= */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1E2636] pb-4">
          <div>
            <span className="font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.16em] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              RECOMMENDED BRIEFINGS // CLEARANCE MATCH
            </span>
            <h2 className="font-display font-bold text-2xl text-[#F1F5F9] mt-1">
              Contratos Recomendados para seu Nível (REP {reputation})
            </h2>
          </div>

          <Link
            to="/contracts"
            onClick={() => soundEngine.playClick()}
            className="font-mono text-xs text-[#00E5FF] hover:underline uppercase tracking-[0.14em] flex items-center gap-1.5"
          >
            <span>VER DIRETÓRIO COMPLETO</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {recommendedContracts.length === 0 ? (
          <div className="p-8 bg-[#0C1017] border border-[#1E2636] text-center">
            <p className="font-sans text-sm text-[#94A3B8]">
              Todos os contratos compatíveis já foram vinculados. Explore o catálogo completo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommendedContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                operatorReputation={reputation}
                onSelect={(c) => setSelectedContract(c)}
                onAccept={(id) => handleAcceptContract(id)}
                isAccepting={acceptingId === contract.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================
          DRAWER CINEMATOGRÁFICO DE BRIEFING (RF-050 a RF-057)
         ========================================================= */}
      <ContractBriefingDrawer
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
        operatorReputation={reputation}
        onAccept={(c) => handleAcceptContract(c)}
        isAccepting={
          selectedContract ? acceptingId === selectedContract.id : false
        }
      />
    </div>
  );
}

export default Dashboard;
