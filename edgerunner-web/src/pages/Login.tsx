import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  User,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import api from '../services/api';
import { authenticateInLocalVault } from '../services/localAuthVault';
import { useAuth } from '../context/AuthContext';
import { useImmersion } from '../context/ImmersionContext';
import gridFrankfurtImg from '../assets/afterhours-grid-frankfurt.jpg';
import type { UserRole } from '../types/contract';

interface LoginResponse {
  token: string;
  username?: string;
  callsign?: string;
  role?: UserRole;
  streetCred?: number;
  eddies?: number;
  reputation?: number;
  balance?: number;
}

interface FieldErrors {
  username?: string;
  password?: string;
}

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState<{
    kind: 'credentials' | 'network' | 'server';
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  const { reducedMotion } = useImmersion();

  const locationState = location.state as {
    registered?: boolean;
    from?: { pathname?: string };
  } | null;
  const registeredMessage = locationState?.registered;
  const redirectTarget = locationState?.from?.pathname || '/dashboard';

  const validateFields = (): boolean => {
    const errors: FieldErrors = {};
    if (!username.trim()) {
      errors.username = 'Informe seu identificador de operador.';
    }
    if (!password) {
      errors.password = 'Informe sua senha de acesso.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    const trimmedUsername = username.trim();

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        username: trimmedUsername,
        password,
      });

      const data = response.data;
      await loginWithToken(data.token, {
        username: data.username || trimmedUsername,
        callsign: data.callsign,
        role: data.role || 'OPERATOR',
        streetCred: data.streetCred ?? 1,
        eddies: data.eddies ?? 0,
        reputation: data.reputation ?? data.streetCred ?? 1,
        balance: data.balance ?? data.eddies ?? 0,
      });

      navigate(redirectTarget, { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
      };

      // Se o backend não estiver rodando localmente, verifica o Vault local criptografado (SHA-256)
      if (!axiosErr.response) {
        const vaultResult = await authenticateInLocalVault({
          username: trimmedUsername,
          password,
        });

        if (vaultResult) {
          await loginWithToken(vaultResult.token, vaultResult.profile);
          navigate(redirectTarget, { replace: true });
          return;
        }

        setAuthError({
          kind: 'credentials',
          message:
            'Unable to authenticate. Check your credentials and try again.',
        });
        return;
      }

      const status = axiosErr.response.status;
      if (status === 401 || status === 403 || status === 400) {
        setAuthError({
          kind: 'credentials',
          message:
            'Unable to authenticate. Check your credentials and try again.',
        });
      } else {
        setAuthError({
          kind: 'server',
          message:
            'The operations server returned an unexpected response. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-[#E6EDF3] selection:bg-[#00E5FF] selection:text-[#07090E] flex flex-col lg:grid lg:grid-cols-12 overflow-x-hidden">
      {/* =========================================================
          ÁREA DE IDENTIDADE VISUAL (58% largura em Desktop — 7 de 12 colunas - Seção 5.2)
         ========================================================= */}
      <aside
        aria-label="Identidade visual da rede privada AFTERHOURS"
        className="relative lg:col-span-7 bg-[#07090E] border-b lg:border-b-0 lg:border-r border-[#1E2636] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden"
      >
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <img
            src={gridFrankfurtImg}
            alt=""
            className="w-full h-full object-cover object-center opacity-30 saturate-50 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090E]/90 via-[#07090E]/75 to-[#07090E]/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-[#07090E]/80" />

          <svg
            viewBox="0 0 700 800"
            className="hidden lg:block absolute inset-0 w-full h-full opacity-55"
          >
            <defs>
              <pattern
                id="login-grid"
                width="70"
                height="70"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 70 0 L 0 0 0 70"
                  fill="none"
                  stroke="rgba(230, 237, 243, 0.04)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="700" height="800" fill="url(#login-grid)" />

            <path
              d="M 90 540 L 260 440 L 440 440 L 660 320"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="1.5"
              strokeOpacity="0.65"
            />
            <circle cx="260" cy="440" r="3.5" fill="#00E5FF" />
            <circle
              cx="440"
              cy="440"
              r="4.5"
              fill="#07090E"
              stroke="#00E5FF"
              strokeWidth="1.5"
            />
            <circle cx="660" cy="320" r="4" fill="#00E5FF" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="font-display font-bold text-lg tracking-[0.18em] text-[#E6EDF3] hover:text-[#00E5FF] transition-colors"
          >
            AFTERHOURS
          </Link>

          <Link
            to="/"
            className="font-mono text-xs text-[#8B98A9] hover:text-[#00E5FF] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Public Overview</span>
          </Link>
        </div>

        <div className="relative z-10 my-8 lg:my-0 max-w-xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0C1017]/90 border border-[#1E2636] font-mono text-[11px] text-[#00E5FF] tracking-[0.14em]">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"
              aria-hidden="true"
            />
            <span>PRIVATE NETWORK // AUTHORIZED ACCESS ONLY</span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#E6EDF3] tracking-tight leading-[1.06]">
            YOUR NEXT OPERATION STARTS HERE.
          </h1>

          <p className="text-sm sm:text-base text-[#8B98A9] leading-relaxed max-w-md">
            Acesso restrito a operadores credenciados. Estabeleça sessão autenticada para consultar contratos disponíveis, inspecionar briefings e submeter resultados de campo.
          </p>
        </div>

        <div className="hidden sm:flex relative z-10 pt-6 border-t border-[#1E2636]/80 items-center justify-between font-mono text-[11px] text-[#8B98A9]">
          <span>NODE // GATEWAY_CENTRAL_01</span>
          <span>SESSION_POLICY // STATELESS JWT</span>
        </div>
      </aside>

      {/* =========================================================
          ÁREA DE AUTENTICAÇÃO (42% largura em Desktop — 5 de 12 colunas - Seção 5.2 & 5.3)
         ========================================================= */}
      <main className="lg:col-span-5 bg-[#0C1017] flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md space-y-7"
        >
          <div className="space-y-2 border-b border-[#1E2636] pb-5">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#00E5FF] tracking-[0.14em]">
              <span>TERMINAL GATEWAY</span>
              <span className="text-[#8B98A9]">AUTH_01</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#E6EDF3] tracking-tight">
              ACCESS TERMINAL
            </h2>
            <p className="text-sm text-[#8B98A9]">
              Authenticate to continue to your operations environment.
            </p>
          </div>

          {registeredMessage && !authError && (
            <div
              role="status"
              className="p-3.5 bg-[#10B981]/10 border border-[#10B981]/60 text-[#E6EDF3] flex items-start gap-3 text-xs sm:text-sm"
            >
              <ShieldCheck
                className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium text-[#10B981]">
                  Operator credential registered.
                </p>
                <p className="text-xs text-[#8B98A9] mt-0.5">
                  Sign in below with your identifier and password to open the terminal.
                </p>
              </div>
            </div>
          )}

          {authError && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3.5 bg-[#F43F5E]/10 border border-[#F43F5E]/70 text-[#E6EDF3] flex items-start gap-3 text-xs sm:text-sm"
            >
              <AlertTriangle
                className="w-4 h-4 text-[#F43F5E] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="font-medium text-[#F43F5E]">
                  {authError.kind === 'network'
                    ? 'Connection Error'
                    : 'Authentication Failed'}
                </p>
                <p className="text-xs text-[#E6EDF3]/90 leading-relaxed">
                  {authError.message}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-medium text-[#E6EDF3] mb-2"
              >
                Operator identifier
              </label>
              <div className="relative">
                <User
                  className="w-4 h-4 text-[#8B98A9] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={isLoading}
                  value={username}
                  aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={
                    fieldErrors.username ? 'login-username-error' : undefined
                  }
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) {
                      setFieldErrors((prev) => ({ ...prev, username: undefined }));
                    }
                  }}
                  placeholder="Enter your operator handle"
                  className={`w-full pl-10 pr-4 py-3 bg-[#07090E] border text-sm text-[#E6EDF3] placeholder:text-[#8B98A9]/50 focus:outline-none transition-colors disabled:opacity-60 ${
                    fieldErrors.username
                      ? 'border-[#F43F5E] focus:border-[#F43F5E]'
                      : 'border-[#1E2636] focus:border-[#00E5FF]'
                  }`}
                />
              </div>
              <div className="min-h-[20px] pt-1">
                {fieldErrors.username && (
                  <p
                    id="login-username-error"
                    role="alert"
                    className="text-xs text-[#F43F5E] flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{fieldErrors.username}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-[#E6EDF3] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-[#8B98A9] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? 'login-password-error' : undefined
                  }
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-[#07090E] border text-sm text-[#E6EDF3] placeholder:text-[#8B98A9]/50 focus:outline-none transition-colors disabled:opacity-60 ${
                    fieldErrors.password
                      ? 'border-[#F43F5E] focus:border-[#F43F5E]'
                      : 'border-[#1E2636] focus:border-[#00E5FF]'
                  }`}
                />

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8B98A9] hover:text-[#E6EDF3] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <div className="min-h-[20px] pt-1">
                {fieldErrors.password && (
                  <p
                    id="login-password-error"
                    role="alert"
                    className="text-xs text-[#F43F5E] flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-[#00E5FF] text-[#07090E] hover:bg-[#00E5FF]/90 font-mono text-xs font-semibold tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>AUTHENTICATE</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="pt-5 border-t border-[#1E2636] flex items-center justify-between text-xs text-[#8B98A9]">
            <span>No active operator credential?</span>
            <Link
              to="/register"
              className="font-mono text-[#00E5FF] hover:underline tracking-wider flex items-center gap-1"
            >
              <span>REGISTER OPERATOR</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Login;
