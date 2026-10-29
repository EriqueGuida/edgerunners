import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ImmersionProvider } from './context/ImmersionContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Market } from './pages/Market';
import { MyContracts } from './pages/MyContracts';

export function App() {
  return (
    <ImmersionProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas de Autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Área Operacional Autenticada */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/market" replace />} />
              <Route path="/market" element={<Market />} />
              <Route path="/my-contracts" element={<MyContracts />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/market" replace />} />
        </Routes>
      </BrowserRouter>
    </ImmersionProvider>
  );
}

export default App;
