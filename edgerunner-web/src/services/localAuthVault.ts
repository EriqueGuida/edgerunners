import type { OperatorProfile, UserRole } from '../types/contract';

/**
 * Perfis de demonstração explícitos para inspeção de interface quando o backend Spring Boot
 * não está em execução no ambiente local (Milestone 2).
 *
 * Diretrizes de Segurança:
 * - Nenhuma senha real é armazenada ou processada localmente com SHA-256.
 * - O modo de demonstração nunca é acionado silenciosamente; exige escolha deliberada do usuário
 *   após detecção de indisponibilidade do servidor.
 * - Sessões de demonstração não emitem JWTs e nunca são enviadas ao backend como credenciais reais.
 */

export const DEMO_OPERATOR_PROFILE: OperatorProfile = {
  id: 9001,
  username: 'operador',
  callsign: 'OP_VANGUARD',
  role: 'OPERATOR',
  specialization: 'INFILTRAÇÃO & EXTRAÇÃO DE DADOS',
  bio: 'Sessão de demonstração local (somente simulação de interface; sem persistência no servidor).',
  avatarCode: 'VANGUARD_01',
  streetCred: 15,
  eddies: 24500,
  reputation: 15,
  balance: 24500,
  activeOperationsCount: 2,
  completedOperationsCount: 1,
  failedOperationsCount: 0,
  unreadNotificationsCount: 2,
  createdAt: new Date().toISOString(),
};

export const DEMO_ADMIN_PROFILE: OperatorProfile = {
  id: 9000,
  username: 'admin',
  callsign: 'DIRECTOR_ZERO',
  role: 'ADMIN',
  specialization: 'DIREÇÃO DE OPERAÇÕES GLOBAIS',
  bio: 'Sessão administrativa de demonstração local (somente simulação de interface; sem persistência no servidor).',
  avatarCode: 'OVERWATCH_04',
  streetCred: 50,
  eddies: 150000,
  reputation: 50,
  balance: 150000,
  activeOperationsCount: 0,
  completedOperationsCount: 3,
  failedOperationsCount: 0,
  unreadNotificationsCount: 1,
  createdAt: new Date().toISOString(),
};

export function createDemoSession(role: UserRole = 'OPERATOR'): {
  token: string;
  profile: OperatorProfile;
} {
  const profile = role === 'ADMIN' ? DEMO_ADMIN_PROFILE : DEMO_OPERATOR_PROFILE;
  return {
    token: `ah_demo_session_${role.toLowerCase()}`,
    profile: { ...profile },
  };
}
