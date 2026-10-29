import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Activity, Wifi } from 'lucide-react';

export function MainLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-dark-bg text-gray-100 flex flex-col md:flex-row select-none">
      {/* Barra Lateral Retrátil (Desktop) / HUD Nav (Mobile) */}
      <Sidebar />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-cyber-grid bg-grid-sm">
        {/* Glow ambiental sutil no topo */}
        <div className="pointer-events-none absolute -top-24 left-1/3 w-96 h-48 bg-neon-cyan/5 blur-3xl" />

        {/* Sub-header HUD de Telemetria (Desktop) */}
        <header className="hidden md:flex h-12 px-8 border-b border-dark-border bg-dark-surface/80 backdrop-blur-sm items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4 font-mono text-xs text-gray-400 tracking-widest uppercase">
            <span className="flex items-center gap-1.5 text-neon-cyan">
              <Activity className="w-3.5 h-3.5" />
              NIGHT_CITY // FIXER_NET
            </span>
            <span className="text-dark-border">|</span>
            <span>SECTOR: WATSON_04</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs tracking-widest uppercase">
            <span className="text-gray-400">
              PING: <strong className="text-edgerunner-yellow">4ms</strong>
            </span>
            <span className="flex items-center gap-1.5 text-neon-green">
              <Wifi className="w-3.5 h-3.5" />
              SECURED
            </span>
          </div>
        </header>

        {/* Renderização das Rotas Filhas (<Outlet />) */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 z-10 select-text">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
