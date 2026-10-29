import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Crosshair,
  FileCode2,
  Wallet,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
  Volume2,
  VolumeX,
  Eye,
  Layers,
  UserCheck,
  Globe2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useImmersion } from '../../context/ImmersionContext';
import { soundEngine } from '../../utils/sound';

interface NavItem {
  label: string;
  path: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    code: 'OPS_00',
    icon: LayoutDashboard,
  },
  {
    label: 'Contratos',
    path: '/contracts',
    code: 'CAT_01',
    icon: Crosshair,
  },
  {
    label: 'Mapa Global',
    path: '/map',
    code: 'GEO_02',
    icon: Globe2,
  },
  {
    label: 'Operações',
    path: '/operations',
    code: 'ACT_03',
    icon: FileCode2,
  },
  {
    label: 'Perfil & Carteira',
    path: '/profile',
    code: 'PRF_04',
    icon: Wallet,
  },
  {
    label: 'Painel Admin',
    path: '/admin',
    code: 'ADM_05',
    icon: ShieldAlert,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { operator, isAdmin, logout } = useAuth();
  const { visualMode, soundEnabled, toggleVisualMode, toggleSound } = useImmersion();

  const operatorCallsign = operator?.callsign || operator?.username || 'OP_VANGUARD';
  const operatorBalance = operator?.balance ?? operator?.eddies ?? 0;
  const operatorRep = operator?.reputation ?? operator?.streetCred ?? 1;

  const handleLogout = () => {
    soundEngine.playClick();
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* =========================================================
          SIDEBAR DESKTOP (Nocturnal Operations Terminal)
         ========================================================= */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 272 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex flex-col h-screen bg-[#0C1017] border-r border-[#1E2636] relative select-none z-30 shrink-0"
      >
        <div className="h-[1px] w-full bg-[#00E5FF]/50" />

        {/* HEADER / IDENTIDADE DO PRODUTO (Idêntica à Landing Page) */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#1E2636]">
          <Link
            to="/"
            onClick={() => soundEngine.playClick()}
            className="flex items-center gap-3 overflow-hidden group"
            title="Retornar à apresentação pública do AFTERHOURS"
          >
            <div className="w-8 h-8 shrink-0 bg-[#111722] border border-[#1E2636] group-hover:border-[#00E5FF]/60 flex items-center justify-center transition-colors">
              <span className="w-2 h-2 bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
            </div>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key="brand-text"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.14 }}
                  className="flex items-center gap-2.5 whitespace-nowrap"
                >
                  <span className="font-display font-bold text-base tracking-[0.2em] text-[#F1F5F9]">
                    AFTERHOURS
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.14em] text-[#64748B] border-l border-[#1E2636] pl-2.5 uppercase">
                    NET-04
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* BOTÃO DE EXPANDIR / RECOLHER */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setIsCollapsed((prev) => !prev);
          }}
          aria-label={isCollapsed ? 'Expandir painel lateral' : 'Recolher painel lateral'}
          className="absolute -right-3 top-16 w-6 h-6 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF] text-[#94A3B8] hover:text-[#00E5FF] flex items-center justify-center transition-colors z-40 cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* CREDENCIAL E TELEMETRIA DO OPERADOR AUTENTICADO */}
        <div className="px-5 py-4 border-b border-[#1E2636] bg-[#111722]/50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span
              className="w-1.5 h-1.5 shrink-0 bg-[#10B981] shadow-[0_0_8px_#10B981]"
              aria-hidden="true"
            />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="truncate flex-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#64748B] tracking-[0.16em] uppercase">
                      {isAdmin ? 'CLEARANCE // ADMIN' : 'OPERADOR ATIVO'}
                    </span>
                    <span className="font-mono text-[10px] text-[#00E5FF] tracking-[0.12em] uppercase">
                      REP {operatorRep}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-medium text-[#F1F5F9] tracking-[0.12em] uppercase flex items-center gap-1.5 mt-1 truncate">
                    <UserCheck className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                    {operatorCallsign}
                  </span>
                  <div className="mt-2.5 pt-2.5 border-t border-[#1E2636] flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#64748B] tracking-[0.12em]">SALDO:</span>
                    <strong className="text-[#F1F5F9] font-medium">
                      {new Intl.NumberFormat('pt-BR').format(operatorBalance)}{' '}
                      <span className="text-[#00E5FF]">¢</span>
                    </strong>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* NAVEGAÇÃO OPERACIONAL */}
        <nav aria-label="Navegação Principal" className="flex-1 py-5 px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => soundEngine.playClick()}
                onMouseEnter={() => soundEngine.playHover()}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 px-3.5 py-2.5 border transition-all duration-150 ${
                    isActive
                      ? 'bg-[#00E5FF]/[0.07] border-[#00E5FF]/50 text-[#F1F5F9]'
                      : 'bg-transparent border-transparent text-[#94A3B8] hover:bg-[#111722] hover:border-[#1E2636] hover:text-[#F1F5F9]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors ${
                        isActive
                          ? 'bg-[#00E5FF]'
                          : 'bg-transparent group-hover:bg-[#00E5FF]/50'
                      }`}
                    />

                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#00E5FF]'
                          : 'text-[#64748B] group-hover:text-[#00E5FF]'
                      }`}
                    />

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.14 }}
                          className="flex flex-1 items-center justify-between whitespace-nowrap overflow-hidden"
                        >
                          <span className="font-sans text-sm font-medium tracking-wide">
                            {item.label}
                          </span>
                          <span className="font-mono text-[10px] text-[#64748B] tracking-[0.12em]">
                            {item.code}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* RODAPÉ / PORTAL PÚBLICO & DESCONEXÃO */}
        <div className="p-3 border-t border-[#1E2636] space-y-1.5">
          <Link
            to="/"
            onClick={() => soundEngine.playClick()}
            onMouseEnter={() => soundEngine.playHover()}
            className="w-full group relative flex items-center gap-3.5 px-3.5 py-2.5 border border-transparent text-[#94A3B8] hover:bg-[#111722] hover:border-[#1E2636] hover:text-[#F1F5F9] transition-colors"
          >
            <Globe2 className="w-4 h-4 shrink-0 text-[#64748B] group-hover:text-[#00E5FF] transition-colors" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  key="public-link"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[11px] tracking-[0.14em] uppercase whitespace-nowrap"
                >
                  Portal Público
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            onMouseEnter={() => soundEngine.playHover()}
            className="w-full group relative flex items-center gap-3.5 px-3.5 py-2.5 border border-[#1E2636] bg-[#111722]/60 text-[#94A3B8] hover:bg-[#F43F5E]/10 hover:border-[#F43F5E]/60 hover:text-[#F43F5E] transition-colors cursor-pointer"
          >
            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#F43F5E] transition-colors" />
            <LogOut className="w-4 h-4 shrink-0" />

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key="logout-text"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.14 }}
                  className="flex flex-1 items-center justify-between whitespace-nowrap overflow-hidden"
                >
                  <span className="font-mono text-xs tracking-[0.14em] uppercase">
                    Desconectar
                  </span>
                  <span className="font-mono text-[10px] opacity-60">
                    EXIT
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* =========================================================
          MOBILE HUD HEADER + DRAWER + BARRA INFERIOR
         ========================================================= */}
      <header className="md:hidden h-14 px-4 bg-[#0C1017] border-b border-[#1E2636] flex items-center justify-between z-40 shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#111722] border border-[#1E2636] flex items-center justify-center">
            <span className="w-2 h-2 bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-[0.2em] text-[#F1F5F9] uppercase block">
              AFTERHOURS
            </span>
            <span className="block font-mono text-[10px] tracking-[0.12em] text-[#00E5FF] uppercase">
              {operatorCallsign} // {new Intl.NumberFormat('pt-BR').format(operatorBalance)} ¢
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setIsMobileMenuOpen((prev) => !prev);
          }}
          aria-label="Abrir menu de navegação e preferências"
          className="p-2 border border-[#1E2636] bg-[#111722] text-[#00E5FF] hover:border-[#00E5FF] transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.16 }}
            className="md:hidden fixed inset-x-0 top-14 bg-[#0C1017]/95 backdrop-blur-md border-b border-[#00E5FF]/40 p-4 space-y-3 z-50"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2636] font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.14em]">
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Navegação Operacional
              </span>
              <span className="text-[#94A3B8]">REP {operatorRep}</span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    soundEngine.playClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-2.5 border font-mono text-xs uppercase tracking-[0.14em] ${
                      isActive
                        ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-[#F1F5F9]'
                        : 'border-[#1E2636] text-[#94A3B8] hover:border-[#00E5FF] hover:text-[#F1F5F9]'
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#00E5FF]" />
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#64748B]">{item.code}</span>
                </NavLink>
              );
            })}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E2636]">
              <button
                type="button"
                onClick={toggleVisualMode}
                className="px-3 py-2 border border-[#1E2636] bg-[#111722] text-[#F1F5F9] font-mono text-[11px] uppercase flex items-center justify-center gap-2"
              >
                {visualMode === 'immersive' ? (
                  <>
                    <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Imersivo</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Simplificado</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={toggleSound}
                className="px-3 py-2 border border-[#1E2636] bg-[#111722] text-[#F1F5F9] font-mono text-[11px] uppercase flex items-center justify-center gap-2"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Áudio On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Mudo</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-[#F43F5E]/50 bg-[#F43F5E]/10 text-[#F43F5E] font-mono text-xs uppercase tracking-[0.14em]"
            >
              <span className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                Desconectar Sessão
              </span>
              <span className="text-[10px]">EXIT</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        aria-label="Navegação Rápida Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-[#0C1017] border-t border-[#1E2636] grid grid-cols-5 z-40"
      >
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => soundEngine.playClick()}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 border-r border-[#1E2636] font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-t-2 border-t-[#00E5FF]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#94A3B8] hover:text-[#F43F5E] active:bg-[#F43F5E]/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </nav>
    </>
  );
}

export default Sidebar;
