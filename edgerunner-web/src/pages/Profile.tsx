import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Wallet,
  Award,
  Shield,
  Save,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Cpu,
  Terminal,
  Eye,
  Radio,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  getLocalWalletTransactions,
  getLocalReputationEvents,
} from '../services/contractStore';
import type { ReputationEvent, WalletTransaction } from '../types/contract';
import { soundEngine } from '../utils/sound';

const SPECIALIZATIONS = [
  'INFILTRAÇÃO & EXTRAÇÃO DE DADOS',
  'INTELIGÊNCIA & RECONHECIMENTO URBANO',
  'AUDITORIA DE INFRAESTRUTURA CRÍTICA',
  'CONTRAMEDIDAS & CRIPTOGRAFIA',
  'DIREÇÃO DE OPERAÇÕES GLOBAIS',
];

const AVATAR_PRESETS = [
  { code: 'VANGUARD_01', label: 'VANGUARD // INFILTRATION', icon: Shield },
  { code: 'SPECTRE_02', label: 'SPECTRE // RECON', icon: Eye },
  { code: 'NETRUNNER_03', label: 'CIPHER // QUANTUM', icon: Cpu },
  { code: 'OVERWATCH_04', label: 'OVERWATCH // COMMAND', icon: Radio },
];

export function Profile() {
  const { operator, isDemoMode, updateProfileLocal, refreshProfile } = useAuth();

  const [callsign, setCallsign] = useState(
    () => operator?.callsign || operator?.username?.toUpperCase() || 'OP_VANGUARD'
  );
  const [specialization, setSpecialization] = useState(
    () => operator?.specialization || SPECIALIZATIONS[0]
  );
  const [bio, setBio] = useState(
    () =>
      operator?.bio ||
      'Operador tático independente com atuação em zonas financeiras e infraestrutura crítica.'
  );
  const [avatarCode, setAvatarCode] = useState(
    () => operator?.avatarCode || 'VANGUARD_01'
  );

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [reputationEvents, setReputationEvents] = useState<ReputationEvent[]>([]);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const balance = operator?.balance ?? operator?.eddies ?? 0;
  const reputation = operator?.reputation ?? operator?.streetCred ?? 1;

  useEffect(() => {
    let cancelled = false;
    setLedgerError(null);

    if (isDemoMode) {
      setTransactions(getLocalWalletTransactions());
      setReputationEvents(getLocalReputationEvents());
      return;
    }

    api
      .get<{
        balance: number;
        reputation: number;
        transactions: WalletTransaction[];
        reputationEvents: ReputationEvent[];
      }>('/api/wallet')
      .then((res) => {
        if (!cancelled) {
          setTransactions(res.data.transactions || []);
          setReputationEvents(res.data.reputationEvents || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLedgerError(
            'Não foi possível carregar o histórico de movimentações a partir do servidor.'
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isDemoMode]);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const payload = {
      callsign: callsign.trim().toUpperCase() || 'OP_VANGUARD',
      specialization,
      bio: bio.trim(),
      avatarCode,
    };

    if (isDemoMode) {
      updateProfileLocal(payload);
      soundEngine.playSuccess();
      setIsSaving(false);
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 3500);
      return;
    }

    try {
      await api.patch('/api/operators/me', payload);
      await refreshProfile();
      soundEngine.playSuccess();
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 3500);
    } catch {
      soundEngine.playWarning();
      setSaveError(
        'Não foi possível salvar as alterações de perfil no servidor.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const ActiveAvatarIcon =
    AVATAR_PRESETS.find((a) => a.code === avatarCode)?.icon || Shield;

  return (
    <div className="space-y-8">
      {/* =========================================================
          1. CABEÇALHO DO PERFIL E CARTEIRA DO OPERADOR
         ========================================================= */}
      <section className="border border-[#1E2636] bg-[#0C1017] p-6 md:p-8 ah-corner-marks relative overflow-hidden">
        <div className="h-[1px] w-full bg-[#00E5FF]/60 absolute top-0 left-0" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 bg-[#111722] border border-[#00E5FF] flex items-center justify-center shrink-0">
              <ActiveAvatarIcon className="w-7 h-7 text-[#00E5FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.18em]">
                <Terminal className="w-3.5 h-3.5" />
                <span>OPERATOR DOSSIER &amp; LEDGER // PRF_04</span>
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-[#F1F5F9] tracking-tight mt-0.5">
                {callsign}
              </h1>
              <p className="font-mono text-xs text-[#64748B] uppercase tracking-[0.14em] mt-0.5">
                ID: {operator?.username || 'operador'} // {specialization}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="px-5 py-3 bg-[#111722] border border-[#1E2636]">
              <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] block">
                Saldo Auditado
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-display font-bold text-2xl text-[#F1F5F9]">
                  {new Intl.NumberFormat('pt-BR').format(balance)}
                </span>
                <span className="font-mono text-xs font-semibold text-[#00E5FF]">
                  ¢
                </span>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#111722] border border-[#1E2636]">
              <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] block">
                Reputação Atual
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display font-bold text-2xl text-[#00E5FF]">
                  {reputation}
                </span>
                <span className="font-mono text-xs text-[#94A3B8]">REP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. GRID PRINCIPAL: PERSONALIZAÇÃO DE IDENTIDADE + EXTRATO DA CARTEIRA
         ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda (5 cols): Personalização Visual & Identidade (RF-023) */}
        <section className="lg:col-span-5 bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks">
          <div className="border-b border-[#1E2636] pb-4 mb-5">
            <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              IDENTITY CUSTOMIZATION
            </span>
            <h2 className="font-display font-bold text-lg text-[#F1F5F9] mt-0.5">
              Identidade Operacional
            </h2>
            <p className="font-sans text-xs text-[#94A3B8] mt-0.5">
              Personalize seu codinome público, insígnia tática e especialização exibidos na rede.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Seletor de Insígnia Visual */}
            <div>
              <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-2">
                Insígnia de Terminal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVATAR_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = avatarCode === preset.code;
                  return (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setAvatarCode(preset.code);
                      }}
                      className={`p-3 border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-[#F1F5F9]'
                          : 'bg-[#111722] border-[#1E2636] text-[#94A3B8] hover:border-[#00E5FF]/40'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#00E5FF] shrink-0" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] truncate">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                Codinome público (Callsign)
              </label>
              <input
                type="text"
                required
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-mono text-xs text-[#F1F5F9] uppercase tracking-[0.12em] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                Especialização principal
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-mono text-xs text-[#F1F5F9] focus:outline-none"
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1.5">
                Dossiê biográfico / Histórico de atuação
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-sans text-xs text-[#F1F5F9] leading-relaxed focus:outline-none"
              />
            </div>

            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-[#10B981]/10 border border-[#10B981]/50 text-[#10B981] font-mono text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isDemoMode
                      ? 'IDENTIDADE SIMULADA ATUALIZADA NO TERMINAL LOCAL.'
                      : 'CREDENCIAL ATUALIZADA NO SERVIDOR AFTERHOURS.'}
                  </span>
                </motion.div>
              )}

              {saveError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="p-3 bg-[#F43F5E]/10 border border-[#F43F5E]/60 text-[#F43F5E] font-mono text-xs flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-[#00E5FF] hover:bg-[#33ECFF] text-[#07090E] font-mono font-semibold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>SALVAR IDENTIDADE OPERACIONAL</span>
            </button>
          </form>
        </section>

        {/* Coluna Direita (7 cols): Extrato Auditável da Carteira & Histórico de Reputação */}
        <div className="lg:col-span-7 space-y-6">
          {/* Extrato Financeiro Fictício (RF-070 a RF-074) */}
          <section className="bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks">
            <div className="flex items-center justify-between border-b border-[#1E2636] pb-4 mb-4">
              <div>
                <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  WALLET LEDGER // AUDITABLE TRANSACTIONS
                </span>
                <h2 className="font-display font-bold text-lg text-[#F1F5F9] mt-0.5">
                  Extrato Auditável de Transações ({transactions.length})
                </h2>
              </div>
              <span className="font-mono text-[10px] text-[#10B981] uppercase tracking-[0.14em]">
                INTEGRIDADE VERIFICADA
              </span>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {ledgerError ? (
                <div className="p-4 bg-[#F43F5E]/10 border border-[#F43F5E]/50 text-[#F43F5E] font-mono text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{ledgerError}</span>
                </div>
              ) : transactions.length === 0 ? (
                <p className="font-mono text-xs text-[#64748B] py-6 text-center">
                  Nenhuma transação registrada na carteira até o momento.
                </p>
              ) : (
                transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 bg-[#111722] border border-[#1E2636] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                      <span className="text-[#00E5FF]">
                        TX-{String(tx.id).slice(-4).padStart(4, '0')}
                      </span>
                      <span className="text-[#1E2636]">|</span>
                      <span className="px-1.5 py-0.5 bg-[#07090E] border border-[#1E2636] text-[#94A3B8]">
                        {tx.type}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#F1F5F9] font-medium">
                      {tx.description}
                    </p>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-[#64748B]">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(tx.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-[#1E2636] pt-2 sm:pt-0">
                    <div className="flex items-center sm:justify-end gap-1 font-display font-bold text-lg text-[#10B981]">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>
                        +{new Intl.NumberFormat('pt-BR').format(tx.amount)}
                      </span>
                      <span className="font-mono text-xs">¢</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#64748B] block">
                      SALDO APÓS:{' '}
                      {new Intl.NumberFormat('pt-BR').format(tx.balanceAfter)} ¢
                    </span>
                  </div>
                </div>
                ))
              )}
            </div>
          </section>

          {/* Histórico de Evolução de Reputação (RF-080 a RF-083) */}
          <section className="bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks">
            <div className="flex items-center justify-between border-b border-[#1E2636] pb-4 mb-4">
              <div>
                <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  REPUTATION PROGRESSION LOG
                </span>
                <h2 className="font-display font-bold text-lg text-[#F1F5F9] mt-0.5">
                  Evolução de Reputação ({reputationEvents.length})
                </h2>
              </div>
              <span className="font-mono text-xs text-[#00E5FF] font-semibold">
                NÍVEL ATUAL: REP {reputation}
              </span>
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {reputationEvents.length === 0 ? (
                <p className="font-mono text-xs text-[#64748B] py-6 text-center">
                  Nenhum evento de reputação registrado.
                </p>
              ) : (
                reputationEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 bg-[#111722] border border-[#1E2636] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="font-sans text-xs text-[#F1F5F9]">
                      {ev.reason}
                    </p>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-[#64748B]">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(ev.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-display font-bold text-base text-[#00E5FF] block">
                      +{ev.delta} REP
                    </span>
                    <span className="font-mono text-[10px] text-[#64748B]">
                      ÍNDICE: {ev.reputationAfter}
                    </span>
                  </div>
                </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;
