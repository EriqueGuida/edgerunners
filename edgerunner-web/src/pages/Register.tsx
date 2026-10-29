import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Lock, User, ArrowRight, AlertTriangle, Cpu } from 'lucide-react';
import api from '../services/api';

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

    if (password !== confirmPassword) {
      setError('ERRO DE SINCRONIA: As chaves neurais (senhas) não coincidem.');
      return;
    }

    if (password.length < 4) {
      setError('SEGURANÇA INSUFICIENTE: A senha deve conter pelo menos 4 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register', {
        username: username.trim(),
        password,
      });

      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'FALHA NO REGISTRO: Não foi possível gravar o perfil no banco de Night City.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-dark-bg bg-cyber-grid bg-grid-sm flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Glows ambientais OLED */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 bg-neon-cyan/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 bg-edgerunner-yellow/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md bg-dark-surface border-2 border-dark-border relative cyber-chamfer shadow-2xl"
      >
        {/* Barra Superior Brutalista Ciano Neon */}
        <div className="h-1.5 w-full bg-neon-cyan" />

        <div className="p-8">
          {/* Header do Terminal */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-neon-cyan/10 border border-neon-cyan flex items-center justify-center shadow-hud-cyan">
                <UserPlus className="w-5 h-5 text-neon-cyan drop-shadow-neon-cyan" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl tracking-wider text-white uppercase">
                  NEW <span className="text-neon-cyan">HUNTER</span>
                </h1>
                <p className="font-mono text-[10px] tracking-[0.25em] text-edgerunner-yellow uppercase">
                  MERCENARY_REGISTRY // NC
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] px-2 py-1 border border-dark-border text-gray-400">
              [REG_02]
            </span>
          </div>

          {/* Info de Bônus Inicial */}
          <div className="mb-6 p-3 bg-dark-card border border-dark-border flex items-center justify-between font-mono text-[11px] text-gray-400">
            <span className="flex items-center gap-2 text-neon-cyan">
              <Cpu className="w-4 h-4" />
              INITIAL STATS:
            </span>
            <span>
              CRED: <strong className="text-white">1</strong> | EDDIES:{' '}
              <strong className="text-edgerunner-yellow">€$ 0</strong>
            </span>
          </div>

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
                htmlFor="reg-username"
                className="block font-mono text-xs uppercase tracking-widest text-gray-300 mb-2"
              >
                // Choose Codename
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: LucyKushinada"
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border-2 border-dark-border text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-neon-cyan focus:shadow-hud-cyan transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block font-mono text-xs uppercase tracking-widest text-gray-300 mb-2"
              >
                // Neural Passkey
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
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border-2 border-dark-border text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-neon-cyan focus:shadow-hud-cyan transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block font-mono text-xs uppercase tracking-widest text-gray-300 mb-2"
              >
                // Confirm Passkey
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
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border-2 border-dark-border text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-neon-cyan focus:shadow-hud-cyan transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-neon-cyan text-dark-bg font-display font-bold text-base uppercase tracking-widest border-2 border-neon-cyan hover:bg-transparent hover:text-neon-cyan hover:shadow-hud-cyan transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'INITIALIZING...' : 'CREATE HUNTER PROFILE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Rodapé para Login */}
          <div className="mt-6 pt-5 border-t border-dark-border flex items-center justify-between font-mono text-xs text-gray-400">
            <span>JÁ POSSUI CREDENCIAL?</span>
            <Link
              to="/login"
              className="text-edgerunner-yellow hover:underline tracking-wider uppercase flex items-center gap-1"
            >
              [FAZER LOGIN]
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
