import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import api, { TOKEN_KEY, USER_KEY } from '../services/api';
import type { OperatorProfile, UserRole } from '../types/contract';

const PROFILE_CACHE_KEY = 'afterhours_profile_cache';

interface AuthContextValue {
  token: string | null;
  operator: OperatorProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithToken: (token: string, initialData?: Partial<OperatorProfile>) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  adjustLocalStats: (rewardDelta: number, reputationDelta: number) => void;
  updateProfileLocal: (updates: Partial<OperatorProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const createBaseProfile = (username: string, role: UserRole = 'OPERATOR'): OperatorProfile => ({
  id: 0,
  username,
  callsign: `OP_${username.toUpperCase().replace(/^OP_/, '')}`,
  role,
  specialization: 'INFILTRAÇÃO & EXTRAÇÃO DE DADOS',
  bio: 'Operador credenciado na rede AFTERHOURS.',
  avatarCode: 'VANGUARD_01',
  streetCred: 1,
  eddies: 0,
  reputation: 1,
  balance: 0,
  activeOperationsCount: 0,
  completedOperationsCount: 0,
  failedOperationsCount: 0,
  unreadNotificationsCount: 0,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [operator, setOperator] = useState<OperatorProfile | null>(() => {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as OperatorProfile;
      } catch {
        // Ignora cache corrompido
      }
    }
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? createBaseProfile(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const persistOperator = (profile: OperatorProfile | null) => {
    setOperator(profile);
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      localStorage.setItem(USER_KEY, profile.username);
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  };

  const refreshProfile = useCallback(async () => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (!activeToken) {
      persistOperator(null);
      return;
    }

    if (activeToken.startsWith('ah_local_jwt_')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get<OperatorProfile>('/api/operators/me');
      persistOperator(response.data);
    } catch {
      // Preserva metadados básicos já obtidos no login
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token || token.startsWith('ah_local_jwt_')) return;
    let cancelled = false;
    api
      .get<OperatorProfile>('/api/operators/me')
      .then((response) => {
        if (!cancelled) {
          persistOperator(response.data);
        }
      })
      .catch(() => {
        // Preserva metadados básicos já obtidos no login caso o servidor esteja offline
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const loginWithToken = async (
    newToken: string,
    initialData?: Partial<OperatorProfile>
  ) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);

    const username = initialData?.username || localStorage.getItem(USER_KEY) || 'operator';
    const baseProfile: OperatorProfile = {
      ...createBaseProfile(username, initialData?.role || 'OPERATOR'),
      ...initialData,
    };
    persistOperator(baseProfile);

    if (newToken.startsWith('ah_local_jwt_')) {
      return;
    }

    try {
      const response = await api.get<OperatorProfile>('/api/operators/me');
      persistOperator(response.data);
    } catch {
      // Mantém metadados retornados pelo endpoint /auth/login
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_CACHE_KEY);
    setToken(null);
    setOperator(null);
  };

  const adjustLocalStats = (rewardDelta: number, reputationDelta: number) => {
    if (!operator) return;
    const newBalance = (operator.balance ?? operator.eddies ?? 0) + rewardDelta;
    const newRep = (operator.reputation ?? operator.streetCred ?? 1) + reputationDelta;
    const updated: OperatorProfile = {
      ...operator,
      balance: newBalance,
      eddies: newBalance,
      reputation: newRep,
      streetCred: newRep,
    };
    persistOperator(updated);
  };

  const updateProfileLocal = (updates: Partial<OperatorProfile>) => {
    if (!operator) return;
    const updated: OperatorProfile = {
      ...operator,
      ...updates,
    };
    persistOperator(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        operator,
        isAuthenticated: Boolean(token),
        isAdmin: operator?.role === 'ADMIN',
        isLoading,
        loginWithToken,
        logout,
        refreshProfile,
        adjustLocalStats,
        updateProfileLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return ctx;
}
