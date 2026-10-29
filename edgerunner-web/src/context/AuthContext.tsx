import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import api, {
  TOKEN_KEY,
  USER_KEY,
  SESSION_MODE_KEY,
  PROFILE_CACHE_KEY,
} from '../services/api';
import { createDemoSession } from '../services/localAuthVault';
import type { OperatorProfile, UserRole } from '../types/contract';

export type SessionMode = 'BACKEND' | 'DEMO' | null;

interface AuthContextValue {
  token: string | null;
  operator: OperatorProfile | null;
  sessionMode: SessionMode;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithToken: (
    token: string,
    initialData?: Partial<OperatorProfile>
  ) => Promise<void>;
  enterDemoMode: (role?: UserRole) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  adjustLocalStats: (rewardDelta: number, reputationDelta: number) => void;
  updateProfileLocal: (updates: Partial<OperatorProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const createBaseProfile = (
  username: string,
  role: UserRole = 'OPERATOR'
): OperatorProfile => ({
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

function isLocalOrDemoToken(token: string | null): boolean {
  if (!token) return false;
  return token.startsWith('ah_demo_') || token.startsWith('ah_local_jwt_');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    // Rejeita tokens legados de cofre SHA-256 local que simulavam JWTs reais
    if (stored && stored.startsWith('ah_local_jwt_')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PROFILE_CACHE_KEY);
      localStorage.removeItem(SESSION_MODE_KEY);
      return null;
    }
    return stored;
  });

  const [sessionMode, setSessionMode] = useState<SessionMode>(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken || storedToken.startsWith('ah_local_jwt_')) return null;
    const savedMode = localStorage.getItem(SESSION_MODE_KEY);
    if (savedMode === 'DEMO' || storedToken.startsWith('ah_demo_')) {
      return 'DEMO';
    }
    return 'BACKEND';
  });

  const [operator, setOperator] = useState<OperatorProfile | null>(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken || storedToken.startsWith('ah_local_jwt_')) return null;

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

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_CACHE_KEY);
    localStorage.removeItem(SESSION_MODE_KEY);
    setToken(null);
    setSessionMode(null);
    setOperator(null);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
    };
    window.addEventListener('afterhours:session-expired', handleSessionExpired);
    return () =>
      window.removeEventListener(
        'afterhours:session-expired',
        handleSessionExpired
      );
  }, [logout]);

  const refreshProfile = useCallback(async () => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    const activeMode = localStorage.getItem(SESSION_MODE_KEY);
    if (!activeToken) {
      persistOperator(null);
      return;
    }

    if (activeMode === 'DEMO' || isLocalOrDemoToken(activeToken)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get<OperatorProfile>('/api/operators/me');
      persistOperator(response.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!token || sessionMode === 'DEMO' || isLocalOrDemoToken(token)) return;
    let cancelled = false;
    api
      .get<OperatorProfile>('/api/operators/me')
      .then((response) => {
        if (!cancelled) {
          persistOperator(response.data);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          logout();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, sessionMode, logout]);

  const loginWithToken = async (
    newToken: string,
    initialData?: Partial<OperatorProfile>
  ) => {
    if (isLocalOrDemoToken(newToken)) {
      throw new Error('Tokens locais de demonstração não podem ser usados em loginWithToken.');
    }

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(SESSION_MODE_KEY, 'BACKEND');
    setToken(newToken);
    setSessionMode('BACKEND');

    const username =
      initialData?.username || localStorage.getItem(USER_KEY) || 'operator';
    const baseProfile: OperatorProfile = {
      ...createBaseProfile(username, initialData?.role || 'OPERATOR'),
      ...initialData,
    };
    persistOperator(baseProfile);

    try {
      const response = await api.get<OperatorProfile>('/api/operators/me');
      persistOperator(response.data);
    } catch {
      // Mantém metadados retornados pelo endpoint /auth/login
    }
  };

  const enterDemoMode = (role: UserRole = 'OPERATOR') => {
    const demo = createDemoSession(role);
    localStorage.setItem(TOKEN_KEY, demo.token);
    localStorage.setItem(SESSION_MODE_KEY, 'DEMO');
    setToken(demo.token);
    setSessionMode('DEMO');
    persistOperator(demo.profile);
  };

  const adjustLocalStats = (rewardDelta: number, reputationDelta: number) => {
    if (!operator) return;
    const newBalance = (operator.balance ?? operator.eddies ?? 0) + rewardDelta;
    const newRep =
      (operator.reputation ?? operator.streetCred ?? 1) + reputationDelta;
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

  const isDemoMode = sessionMode === 'DEMO' || isLocalOrDemoToken(token);
  const isAuthenticated = Boolean(token) && sessionMode === 'BACKEND' && !isDemoMode;

  return (
    <AuthContext.Provider
      value={{
        token,
        operator,
        sessionMode,
        isAuthenticated,
        isDemoMode,
        isAdmin: operator?.role === 'ADMIN',
        isLoading,
        loginWithToken,
        enterDemoMode,
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
