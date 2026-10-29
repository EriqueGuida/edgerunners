import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  ShieldAlert,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: 'Market',
    path: '/market',
    code: 'NET_01',
    icon: Crosshair,
  },
  {
    label: 'My Contracts',
    path: '/my-contracts',
    code: 'GIG_02',
    icon: FileCode2,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('edgerunner_token');
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* =========================================================
          DESKTOP SIDEBAR (Retrátil com Framer Motion)
         ========================================================= */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 84 : 272 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex flex-col h-screen bg-dark-surface border-r border-dark-border relative select-none z-30 shrink-0"
      >
        {/* Linha decorativa superior Amarelo Cyberpunk */}
        <div className="h-[2px] w-full bg-gradient-to-r from-edgerunner-yellow via-neon-cyan to-transparent" />

        {/* HEADER / LOGO */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-dark-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 shrink-0 bg-edgerunner-yellow/10 border border-edgerunner-yellow flex items-center justify-center shadow-hud-yellow">
              <Terminal className="w-5 h-5 text-edgerunner-yellow drop-shadow-neon-yellow" />
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
                      EDGE<span className="text-edgerunner-yellow">RUNNER</span>
                    </span>
                  </div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-neon-cyan uppercase">
                    SYS.VER // 2.077
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTÃO TÁTICO DE EXPANDIR / RECOLHER */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? 'Expandir Sidebar' : 'Recolher Sidebar'}
          className="absolute -right-3.5 top-24 w-7 h-7 bg-dark-card border border-dark-border hover:border-neon-cyan text-gray-400 hover:text-neon-cyan flex items-center justify-center transition-colors z-40 cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* STATUS TELEMETRIA */}
        <div className="px-5 py-4 border-b border-dark-border/60">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-neon-green rounded-none animate-pulse shadow-[0_0_8px_#00FF66]" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="font-mono text-[11px] text-gray-400 tracking-widest uppercase whitespace-nowrap"
                >
                  NETLINK: ENCRYPTED
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* LINKS DE NAVEGAÇÃO */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
                    {/* Barra lateral indicadora ativa */}
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
                          ? 'text-edgerunner-yellow drop-shadow-neon-yellow'
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
                          <span className="font-mono text-[10px] opacity-50">
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

        {/* RODAPÉ / LOGOUT */}
        <div className="p-3 border-t border-dark-border">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full group relative flex items-center gap-3.5 px-3.5 py-3 border border-dark-border bg-dark-card/50 text-gray-400 hover:bg-neon-pink/10 hover:border-neon-pink hover:text-neon-pink transition-all duration-150 cursor-pointer"
          >
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-neon-pink transition-colors" />
            <LogOut className="w-5 h-5 shrink-0 group-hover:drop-shadow-neon-pink" />

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
                    Logout
                  </span>
                  <span className="font-mono text-[10px] opacity-60">
                    [JACK_OUT]
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* =========================================================
          MOBILE HUD HEADER + MENU HAMBÚRGUER TÁTICO + BOTTOM BAR
         ========================================================= */}
      {/* Top Bar Mobile */}
      <header className="md:hidden h-16 px-4 bg-dark-surface border-b border-dark-border flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-edgerunner-yellow/10 border border-edgerunner-yellow flex items-center justify-center">
            <Terminal className="w-4 h-4 text-edgerunner-yellow" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-wider text-white uppercase">
              EDGE<span className="text-edgerunner-yellow">RUNNER</span>
            </span>
            <span className="block font-mono text-[9px] tracking-widest text-neon-cyan uppercase">
              HUD // MOBILE
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Menu Tático"
          className="p-2 border border-dark-border bg-dark-card text-edgerunner-yellow hover:border-edgerunner-yellow transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Drawer Tático Mobile (Hambúrguer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-x-0 top-16 bg-dark-surface/95 backdrop-blur-md border-b border-neon-cyan/40 p-4 space-y-2 z-50 shadow-hud-cyan"
          >
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-dark-border font-mono text-[11px] text-neon-cyan uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4" />
              <span>Tactical Navigation Matrix</span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
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

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 border border-neon-pink/50 bg-neon-pink/10 text-neon-pink font-mono text-sm uppercase tracking-widest"
            >
              <span className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                Logout
              </span>
              <span className="text-[10px]">[JACK_OUT]</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar Tática Mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-dark-surface border-t border-dark-border grid grid-cols-3 z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
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
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
}

export default Sidebar;
