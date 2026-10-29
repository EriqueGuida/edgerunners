import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  User,
  ArrowRight,
  AlertTriangle,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { registerInLocalVault } from '../services/localAuthVault';
import { useImmersion } from '../context/ImmersionContext';
import gridFrankfurtImg from '../assets/afterhours-grid-frankfurt.jpg';

const SPECIALIZATIONS = [
  'INFILTRAÇÃO & EXTRAÇÃO DE DADOS',
  'INTELIGÊNCIA & RECONHECIMENTO URBANO',
  'AUDITORIA DE INFRAESTRUTURA CRÍTICA',
  'CONTRAMEDIDAS & CRIPTOGRAFIA',
];

export function Register() {
  const [username, setUsername] = useState('');
  const [callsign, setCallsign] = useState('');
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { reducedMotion } = useImmersion();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setError('O identificador do operador deve conter pelo menos 3 caracteres.');
      return;
    }

    if (password.length < 4) {
      setError('A senha de acesso deve conter pelo menos 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas informadas não coincidem.');
      return;
    }

    setIsLoading(true);
    const resolvedCallsign =
      callsign.trim() || `OP_${trimmedUsername.toUpperCase()}`;

    try {
      await api.post('/auth/register', {
        username: trimmedUsername,
        password,
        callsign: resolvedCallsign,
        specialization,
      });

      navigate('/login', { state: { registered: true } });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
      };

      // Se o backend Spring Boot não estiver rodando (erro de conexão), registra com hash SHA-256 no Vault local
      if (!axiosErr.response) {
        try {
          await registerInLocalVault({
            username: trimmedUsername,
            password,
            callsign: resolvedCallsign,
            specialization,
          });
          navigate('/login', { state: { registered: true } });
          return;
        } catch (vaultErr: unknown) {
          const message =
            vaultErr instanceof Error
              ? vaultErr.message
              : 'Este identificador já está registrado.';
          setError(message);
          return;
        }
      }

      setError(
        axiosErr.response?.data?.error ||
          'Unable to complete registration. Try another identifier.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-[#E6EDF3] selection:bg-[#00E5FF] selection:text-[#07090E] flex flex-col lg:grid lg:grid-cols-12 overflow-x-hidden">
      {/* Área de Identidade Visual */}
      <aside
        aria-label="Identidade visual de registro AFTERHOURS"
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
            <span>OPERATOR CREDENTIALING // REGISTRY</span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#E6EDF3] tracking-tight leading-[1.06]">
            ESTABLISH YOUR FIELD IDENTITY.
          </h1>

          <p className="text-sm sm:text-base text-[#8B98A9] leading-relaxed max-w-md">
            Emita uma credencial de operador para acessar o diretório de contratos, registrar operações e acumular reputação verificada dentro do sistema.
          </p>
        </div>

        <div className="hidden sm:flex relative z-10 pt-6 border-t border-[#1E2636]/80 items-center justify-between font-mono text-[11px] text-[#8B98A9]">
          <span>INITIAL CLEARANCE // LEVEL 01</span>
          <span>STARTING BALANCE // CR¢ 0</span>
        </div>
      </aside>

      {/* Área do Formulário de Registro */}
      <main className="lg:col-span-5 bg-[#0C1017] flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-2 border-b border-[#1E2636] pb-5">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#00E5FF] tracking-[0.14em]">
              <span>OPERATOR ONBOARDING</span>
              <span className="text-[#8B98A9]">REG_02</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#E6EDF3] tracking-tight">
              REGISTER OPERATOR
            </h2>
            <p className="text-sm text-[#8B98A9]">
              Create an operator account to access the AFTERHOURS network.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 bg-[#F43F5E]/10 border border-[#F43F5E]/70 text-[#E6EDF3] flex items-start gap-3 text-xs sm:text-sm"
            >
              <AlertTriangle
                className="w-4 h-4 text-[#F43F5E] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="reg-username"
                  className="block text-xs font-medium text-[#E6EDF3] mb-1.5"
                >
                  Operator identifier
                </label>
                <div className="relative">
                  <User
                    className="w-4 h-4 text-[#8B98A9] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-username"
                    type="text"
                    required
                    disabled={isLoading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. erique"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#07090E] border border-[#1E2636] text-sm text-[#E6EDF3] placeholder:text-[#8B98A9]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-callsign"
                  className="block text-xs font-medium text-[#E6EDF3] mb-1.5"
                >
                  Public callsign (optional)
                </label>
                <div className="relative">
                  <Shield
                    className="w-4 h-4 text-[#8B98A9] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-callsign"
                    type="text"
                    disabled={isLoading}
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    placeholder="e.g. OP_ERIQUE"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#07090E] border border-[#1E2636] text-sm text-[#E6EDF3] placeholder:text-[#8B98A9]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-spec"
                className="block text-xs font-medium text-[#E6EDF3] mb-1.5"
              >
                Operational specialization
              </label>
              <select
                id="reg-spec"
                disabled={isLoading}
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#07090E] border border-[#1E2636] text-xs font-mono text-[#E6EDF3] focus:outline-none focus:border-[#00E5FF]"
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-medium text-[#E6EDF3] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-[#8B98A9] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-[#07090E] border border-[#1E2636] text-sm text-[#E6EDF3] placeholder:text-[#8B98A9]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B98A9] hover:text-[#E6EDF3] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-xs font-medium text-[#E6EDF3] mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-[#8B98A9] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#07090E] border border-[#1E2636] text-sm text-[#E6EDF3] placeholder:text-[#8B98A9]/50 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 mt-2 bg-[#00E5FF] text-[#07090E] hover:bg-[#00E5FF]/90 font-mono text-xs font-semibold tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>REGISTERING...</span>
                </>
              ) : (
                <>
                  <span>CREATE CREDENTIAL</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="pt-5 border-t border-[#1E2636] flex items-center justify-between text-xs text-[#8B98A9]">
            <span>Already hold an active credential?</span>
            <Link
              to="/login"
              className="font-mono text-[#00E5FF] hover:underline tracking-wider flex items-center gap-1"
            >
              <span>ACCESS TERMINAL</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Register;
