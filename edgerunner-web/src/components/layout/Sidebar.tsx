import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair,
  FileCode2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Terminal,
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
    label: 'Contratos',
    path: '/market',
    code: 'CAT_01',
    icon: Crosshair,
  },
  {
    label: 'Operações',
    path: '/my-contracts',
    code: 'OPS_02',
    icon: FileCode2,
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
          SIDEBAR DESKTOP (Retrátil & Tática AFTERHOURS)
         ========================================================= */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 84 : 276 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex flex-col h-screen bg-dark-surface border-r border-dark-border relative select-none z-30 shrink-0"
      >
        <div className="h-[2px] w-full bg-gradient-to-r from-edgerunner-yellow via-neon-cyan to-transparent" />

        {/* HEADER / IDENTIDADE DO TERMINAL */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-dark-border">
          <Link
            to="/"
            onClick={() => soundEngine.playClick()}
            className="flex items-center gap-3 overflow-hidden group"
            title="Ir para a apresentação pública do AFTERHOURS"
          >
            <div className="w-10 h-10 shrink-0 bg-edgerunner-yellow/10 border border-edgerunner-yellow flex items-center justify-center shadow-hud-yellow group-hover:bg-edgerunner-yellow group-hover:text-dark-bg transition-colors">
              <Terminal className="w-5 h-5 text-edgerunner-yellow group-hover:text-dark-bg transition-colors" />
            </div>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key="brand-text"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-xl tracking-wider text-white uppercase">
                      AFTER<span className="text-edgerunner-yellow">HOURS</span>
                    </span>
                  </div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-neon-cyan uppercase">
                    TERMINAL // VER 1.0
                  </p>
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
          aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          className="absolute -right-3.5 top-24 w-7 h-7 bg-dark-card border border-dark-border hover:border-neon-cyan text-gray-400 hover:text-neon-cyan flex items-center justify-center transition-colors z-40 cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* IDENTIFICAÇÃO E SALDO DO OPERADOR AUTENTICADO */}
        <div className="px-5 py-4 border-b border-dark-border/60 bg-dark-card/30">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span
              className="w-2 h-2 shrink-0 bg-neon-green rounded-none shadow-[0_0_8px_#10B981]"
              aria-hidden="true"
            />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate flex-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">
                      {isAdmin ? 'DIRETORIA ADMIN' : 'OPERADOR ATIVO'}
                    </span>
                    <span className="font-mono text-[10px] text-neon-cyan uppercase">
                      REP {operatorRep}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5 mt-0.5 truncate">
                    <UserCheck className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                    {operatorCallsign}
                  </span>
                  <div className="mt-2 pt-2 border-t border-dark-border/60 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-gray-400">SALDO:</span>
                    <strong className="text-edgerunner-yellow">
                      CR¢ {new Intl.NumberFormat('pt-BR').format(operatorBalance)}
                    </strong>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* LINKS DE NAVEGAÇÃO OPERACIONAL */}
        <nav aria-label="Navegação Principal" className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => soundEngine.playClick()}
                onMouseEnter={() => soundEngine.playHover()}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 px-3.5 py-3 border transition-all duration-150 ${
                    isActive
                      ? 'bg-edgerunner-yellow/10 border-edgerunner-yellow text-edgerunner-yellow shadow-hud-yellow'
                      : 'bg-transparent border-transparent text-gray-400 hover:bg-neon-cyan/5 hover:border-neon-cyan/40 hover:text-neon-cyan'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${
                        isActive
                          ? 'bg-edgerunner-yellow'
                          : 'bg-transparent group-hover:bg-neon-cyan'
                      }`}
                    />

                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                        isActive
                          ? 'text-edgerunner-yellow'
                          : 'text-gray-400 group-hover:text-neon-cyan'
                      }`}
                    />

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.15 }}
                          className="flex flex-1 items-center justify-between whitespace-nowrap overflow-hidden"
                        >
                          <span className="font-mono text-sm tracking-widest uppercase">
                            {item.label}
                          </span>
                          <span className="font-mono text-[10px] opacity-60">
                            [{item.code}]
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

        {/* RODAPÉ / VISÃO PÚBLICA & ENCERRAMENTO DE SESSÃO */}
        <div className="p-3 border-t border-dark-border space-y-2">
          <Link
            to="/"
            onClick={() => soundEngine.playClick()}
            onMouseEnter={() => soundEngine.playHover()}
            className="w-full group relative flex items-center gap-3.5 px-3.5 py-2.5 border border-transparent text-gray-400 hover:border-dark-border hover:text-neon-cyan transition-all duration-150"
          >
            <Globe2 className="w-4 h-4 shrink-0" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  key="public-link"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-xs tracking-widest uppercase whitespace-nowrap"
                >
                  Apresentação Pública
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            onMouseEnter={() => soundEngine.playHover()}
            className="w-full group relative flex items-center gap-3.5 px-3.5 py-3 border border-dark-border bg-dark-card/50 text-gray-400 hover:bg-neon-pink/10 hover:border-neon-pink hover:text-neon-pink transition-all duration-150 cursor-pointer"
          >
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-neon-pink transition-colors" />
            <LogOut className="w-5 h-5 shrink-0" />

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key="logout-text"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-1 items-center justify-between whitespace-nowrap overflow-hidden"
                >
                  <span className="font-mono text-sm tracking-widest uppercase">
                    Sair
                  </span>
                  <span className="font-mono text-[10px] opacity-60">
                    [ENCERRAR]
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* =========================================================
          MOBILE HUD HEADER + DRAWER TÁTICO + BARRA INFERIOR
         ========================================================= */}
      <header className="md:hidden h-16 px-4 bg-dark-surface border-b border-dark-border flex items-center justify-between z-40 shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-edgerunner-yellow/10 border border-edgerunner-yellow flex items-center justify-center">
            <Terminal className="w-4 h-4 text-edgerunner-yellow" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-wider text-white uppercase">
              AFTER<span className="text-edgerunner-yellow">HOURS</span>
            </span>
            <span className="block font-mono text-[9px] tracking-widest text-neon-cyan uppercase">
              {operatorCallsign} // CR¢ {new Intl.NumberFormat('pt-BR').format(operatorBalance)}
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
          className="p-2 border border-dark-border bg-dark-card text-edgerunner-yellow hover:border-edgerunner-yellow transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed inset-x-0 top-16 bg-dark-surface/95 backdrop-blur-md border-b border-neon-cyan/40 p-4 space-y-3 z-50 shadow-hud-cyan"
          >
            <div className="flex items-center justify-between pb-2 border-b border-dark-border font-mono text-[11px] text-neon-cyan uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Matriz de Navegação
              </span>
              <span className="text-gray-400">REP {operatorRep}</span>
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
                    `flex items-center justify-between px-4 py-3 border font-mono text-sm uppercase tracking-widest ${
                      isActive
                        ? 'bg-edgerunner-yellow/10 border-edgerunner-yellow text-edgerunner-yellow'
                        : 'border-dark-border text-gray-300 hover:border-neon-cyan hover:text-neon-cyan'
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  <span className="text-[10px] opacity-60">[{item.code}]</span>
                </NavLink>
              );
            })}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dark-border">
              <button
                type="button"
                onClick={toggleVisualMode}
                className="px-3 py-2.5 border border-dark-border bg-dark-card text-gray-300 font-mono text-xs uppercase flex items-center justify-center gap-2"
              >
                {visualMode === 'immersive' ? (
                  <>
                    <Layers className="w-3.5 h-3.5 text-neon-cyan" />
                    <span>Imersivo</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-edgerunner-yellow" />
                    <span>Simplificado</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={toggleSound}
                className="px-3 py-2.5 border border-dark-border bg-dark-card text-gray-300 font-mono text-xs uppercase flex items-center justify-center gap-2"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-neon-green" />
                    <span>Áudio On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-gray-500" />
                    <span>Mudo</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 border border-neon-pink/50 bg-neon-pink/10 text-neon-pink font-mono text-sm uppercase tracking-widest"
            >
              <span className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                Encerrar Sessão
              </span>
              <span className="text-[10px]">[SAIR]</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        aria-label="Navegação Rápida Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-dark-surface border-t border-dark-border grid grid-cols-3 z-40"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => soundEngine.playClick()}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 border-r border-dark-border font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-edgerunner-yellow/10 text-edgerunner-yellow border-t-2 border-t-edgerunner-yellow'
                    : 'text-gray-400 hover:text-neon-cyan'
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
          className="flex flex-col items-center justify-center gap-1 font-mono text-[11px] uppercase tracking-wider text-gray-400 hover:text-neon-pink active:bg-neon-pink/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </nav>
    </>
  );
}

export default Sidebar;
