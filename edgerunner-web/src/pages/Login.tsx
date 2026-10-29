import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Lock, User, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import api, { TOKEN_KEY, USER_KEY } from '../services/api';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const registeredMessage = (location.state as { registered?: boolean } | null)?.registered;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post<{ token: string }>('/auth/login', {
        username: username.trim(),
        password,
      });

      const { token } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, username.trim());

      navigate('/market', { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('ACESSO NEGADO: Credenciais inválidas na rede Night City.');
      } else {
        setError(
          err.response?.data?.error ||
            'FALHA DE NETLINK: Não foi possível conectar ao servidor central.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-dark-bg bg-cyber-grid bg-grid-sm flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Glows ambientais OLED */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-edgerunner-yellow/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-neon-cyan/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md bg-dark-surface border-2 border-dark-border relative cyber-chamfer shadow-2xl"
      >
        {/* Barra Superior Brutalista */}
        <div className="h-1.5 w-full bg-edgerunner-yellow" />

        <div className="p-8">
          {/* Header do Terminal */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-edgerunner-yellow/10 border border-edgerunner-yellow flex items-center justify-center shadow-hud-yellow">
                <Terminal className="w-5 h-5 text-edgerunner-yellow drop-shadow-neon-yellow" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl tracking-wider text-white uppercase">
                  EDGE<span className="text-edgerunner-yellow">RUNNER</span>
                </h1>
                <p className="font-mono text-[10px] tracking-[0.25em] text-neon-cyan uppercase">
                  AUTH_GATE // VER 2.077
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] px-2 py-1 border border-dark-border text-gray-400">
              [SEC_01]
            </span>
          </div>

          {/* Alerta de Registro Concluído */}
          {registeredMessage && !error && (
            <div className="mb-6 p-3.5 bg-neon-green/10 border border-neon-green text-neon-green flex items-start gap-3 font-mono text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>HUNTER REGISTRADO! Insira suas credenciais para iniciar o Netlink.</span>
            </div>
          )}

          {/* Alerta de Erro */}
          {error && (
            <div className="mb-6 p-3.5 bg-neon-pink/10 border border-neon-pink text-neon-pink flex items-start gap-3 font-mono text-xs shadow-hud-pink">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário Brutalista */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block font-mono text-xs uppercase tracking-widest text-gray-300 mb-2"
              >
                // Hunter Codename
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: DavidMartinez"
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border-2 border-dark-border text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-edgerunner-yellow focus:shadow-hud-yellow transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-mono text-xs uppercase tracking-widest text-gray-300 mb-2"
              >
                // Neural Passkey
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border-2 border-dark-border text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-edgerunner-yellow focus:shadow-hud-yellow transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-edgerunner-yellow text-dark-bg font-display font-bold text-base uppercase tracking-widest border-2 border-edgerunner-yellow hover:bg-transparent hover:text-edgerunner-yellow hover:shadow-hud-yellow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'AUTHENTICATING...' : 'JACK IN // LOGIN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Rodapé para Registro */}
          <div className="mt-6 pt-5 border-t border-dark-border flex items-center justify-between font-mono text-xs text-gray-400">
            <span>NOVO MERCENÁRIO?</span>
            <Link
              to="/register"
              className="text-neon-cyan hover:underline tracking-wider uppercase flex items-center gap-1"
            >
              [REGISTRAR CREDENCIAL]
            </Link>
          </div>

          {/* Botão de Preview Rápido (Dev Mode sem precisar do Backend ligado) */}
          <div className="mt-4 pt-3 border-t border-dark-border/50 text-center">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(TOKEN_KEY, 'dev-preview-token');
                localStorage.setItem(USER_KEY, 'DavidMartinez');
                navigate('/market');
              }}
              className="font-mono text-[11px] text-gray-500 hover:text-edgerunner-yellow tracking-widest uppercase transition-colors cursor-pointer"
            >
              [DEV_MODE // SIMULAR LOGIN E VER DASHBOARD]
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
