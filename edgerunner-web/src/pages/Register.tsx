import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Lock, User, ArrowRight, AlertTriangle, Cpu } from 'lucide-react';
import api from '../services/api';
import { soundEngine } from '../utils/sound';

export function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    soundEngine.playClick();

    if (password !== confirmPassword) {
      soundEngine.playWarning();
      setError('ERRO DE VALIDAÇÃO: As chaves de acesso informadas não coincidem.');
      return;
    }

    if (password.length < 4) {
      soundEngine.playWarning();
      setError('SEGURANÇA INSUFICIENTE: A chave de acesso deve conter pelo menos 4 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register', {
        username: username.trim(),
        password,
      });

      soundEngine.playSuccess();
      navigate('/login', { state: { registered: true } });
    } catch (err: unknown) {
      soundEngine.playWarning();
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(
        axiosErr.response?.data?.error ||
          'FALHA NO REGISTRO: Não foi possível persistir o perfil de operador no servidor.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-dark-bg bg-cyber-grid bg-grid-sm flex items-center justify-center p-4 relative overflow-hidden">
      {/* Iluminação Atmosférica */}
      <div className="ambient-glow pointer-events-none absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/[0.08] blur-3xl" />
      <div className="ambient-glow pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/[0.08] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-md bg-dark-surface border border-dark-border relative cyber-chamfer ah-reticle shadow-2xl"
      >
        {/* Barra Superior Ciano Tático */}
        <div className="h-1 w-full bg-neon-cyan" />

        <div className="p-8">
          {/* Header do Terminal */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-neon-cyan/10 border border-neon-cyan flex items-center justify-center shadow-hud-cyan">
                <UserPlus className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <h1 className="cyber-glitch font-display font-bold text-2xl tracking-wider text-white uppercase">
                  NOVO <span className="text-neon-cyan">OPERADOR</span>
                </h1>
                <p className="font-mono text-[10px] tracking-[0.22em] text-edgerunner-yellow uppercase">
                  CREDENCIAMENTO // AFTERHOURS
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] px-2 py-1 border border-dark-border text-gray-400">
              [REG_02]
            </span>
          </div>

          {/* Alocação Inicial do Perfil */}
          <div className="mb-6 p-3 bg-dark-card border border-dark-border flex items-center justify-between font-mono text-[11px] text-gray-400">
            <span className="flex items-center gap-2 text-neon-cyan">
              <Cpu className="w-4 h-4" />
              PARÂMETROS INICIAIS:
            </span>
            <span>
              REP: <strong className="text-white">1</strong> | SALDO:{' '}
              <strong className="text-edgerunner-yellow">CR¢ 0</strong>
            </span>
          </div>

          {/* Alerta de Erro */}
          {error && (
            <div className="mb-6 p-3.5 bg-neon-pink/10 border border-neon-pink text-neon-pink flex items-start gap-3 font-mono text-xs shadow-hud-pink">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="reg-username"
                className="block font-mono text-xs uppercase tracking-widest text-gray-300 mb-2"
              >
                // Definir Codinome Público
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: OP_VALKYRIE"
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-neon-cyan focus:shadow-hud-cyan transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block font-mono text-xs uppercase tracking-widest text-gray-300 mb-2"
              >
                // Chave de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-neon-cyan focus:shadow-hud-cyan transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block font-mono text-xs uppercase tracking-widest text-gray-300 mb-2"
              >
                // Confirmar Chave de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-neon-cyan focus:shadow-hud-cyan transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-neon-cyan text-dark-bg font-display font-bold text-base uppercase tracking-widest border border-neon-cyan hover:bg-transparent hover:text-neon-cyan hover:shadow-hud-cyan transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'REGISTRANDO OPERADOR...' : 'EMITIR CREDENCIAL'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Rodapé para Login */}
          <div className="mt-6 pt-5 border-t border-dark-border flex items-center justify-between font-mono text-xs text-gray-400">
            <span>JÁ POSSUI CREDENCIAL?</span>
            <Link
              to="/login"
              onClick={() => soundEngine.playClick()}
              className="text-edgerunner-yellow hover:underline tracking-wider uppercase flex items-center gap-1"
            >
              [ACESSAR TERMINAL]
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
