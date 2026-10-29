import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

function MarketPlaceholder() {
  return (
    <div className="border border-dark-border bg-dark-surface/90 p-6 cyber-chamfer">
      <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-4">
        <div>
          <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest">
            // LIVE FEED
          </span>
          <h1 className="text-3xl font-bold tracking-wider uppercase text-white">
            Contract <span className="text-edgerunner-yellow">Market</span>
          </h1>
        </div>
        <span className="px-3 py-1 border border-edgerunner-yellow/50 bg-edgerunner-yellow/10 font-mono text-xs text-edgerunner-yellow uppercase">
          STATUS: ONLINE
        </span>
      </div>
      <p className="font-mono text-sm text-gray-400">
        Aguardando sincronização de contratos disponíveis em Night City...
      </p>
    </div>
  );
}

function MyContractsPlaceholder() {
  return (
    <div className="border border-dark-border bg-dark-surface/90 p-6 cyber-chamfer">
      <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-4">
        <div>
          <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest">
            // HUNTER LOG
          </span>
          <h1 className="text-3xl font-bold tracking-wider uppercase text-white">
            My <span className="text-neon-cyan">Contracts</span>
          </h1>
        </div>
        <span className="px-3 py-1 border border-neon-cyan/50 bg-neon-cyan/10 font-mono text-xs text-neon-cyan uppercase">
          ACTIVE GIGS
        </span>
      </div>
      <p className="font-mono text-sm text-gray-400">
        Seus contratos aceitos e histórico de missões aparecerão aqui.
      </p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas de Autenticação */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas Privadas Protegidas por JWT */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/market" replace />} />
            <Route path="/market" element={<MarketPlaceholder />} />
            <Route path="/my-contracts" element={<MyContractsPlaceholder />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/market" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
