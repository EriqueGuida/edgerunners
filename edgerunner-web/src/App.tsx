import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ImmersionProvider } from './context/ImmersionContext';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Market } from './pages/Market';
import { MyContracts } from './pages/MyContracts';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';

export function App() {
  return (
    <ImmersionProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Área Pública Cinematográfica (RF-001 a RF-015) */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Área Operacional Autenticada */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/contracts"
                  element={<Market key="catalog-grid" defaultView="GRID" />}
                />
                <Route
                  path="/market"
                  element={<Market key="market-grid" defaultView="GRID" />}
                />
                <Route
                  path="/map"
                  element={<Market key="catalog-map" defaultView="MAP" />}
                />
                <Route path="/operations" element={<MyContracts />} />
                <Route path="/my-contracts" element={<MyContracts />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ImmersionProvider>
  );
}

export default App;
