import type { OperatorProfile, UserRole } from '../types/contract';

/**
 * Repositório local de contingência para registro e autenticação quando o backend Spring Boot
 * não está em execução na máquina local.
 *
 * Segurança (Seção 5.5):
 * - Nenhuma senha em texto puro é armazenada em localStorage, sessionStorage ou logs.
 * - As senhas são transformadas em hash unidirecional SHA-256 via Web Crypto API nativa.
 */

const VAULT_STORAGE_KEY = 'afterhours_operator_vault_v1';

interface VaultRecord {
  id: number;
  username: string;
  passwordHash: string;
  callsign: string;
  role: UserRole;
  specialization: string;
  bio: string;
  avatarCode: string;
  reputation: number;
  balance: number;
  createdAt: string;
}

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`afterhours_salt_v1:${input}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function loadVault(): VaultRecord[] {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VaultRecord[]) : [];
  } catch {
    return [];
  }
}

function saveVault(records: VaultRecord[]): void {
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(records));
}

export async function registerInLocalVault(params: {
  username: string;
  password: string;
  callsign?: string;
  specialization?: string;
}): Promise<OperatorProfile> {
  const normalizedUsername = params.username.trim();
  const vault = loadVault();

  const exists = vault.some(
    (r) => r.username.toLowerCase() === normalizedUsername.toLowerCase()
  );
  if (exists) {
    throw new Error('Este identificador de Operador já está registrado.');
  }

  const passwordHash = await sha256Hex(params.password);
  const formattedCallsign =
    params.callsign && params.callsign.trim()
      ? params.callsign.trim().toUpperCase()
      : `OP_${normalizedUsername.toUpperCase()}`;

  const newRecord: VaultRecord = {
    id: Date.now(),
    username: normalizedUsername,
    passwordHash,
    callsign: formattedCallsign,
    role: 'OPERATOR',
    specialization:
      params.specialization || 'INFILTRAÇÃO & EXTRAÇÃO DE DADOS',
    bio: 'Operador independente credenciado na rede global AFTERHOURS.',
    avatarCode: 'VANGUARD_01',
    reputation: 1,
    balance: 0,
    createdAt: new Date().toISOString(),
  };

  vault.push(newRecord);
  saveVault(vault);

  return {
    id: newRecord.id,
    username: newRecord.username,
    callsign: newRecord.callsign,
    role: newRecord.role,
    specialization: newRecord.specialization,
    bio: newRecord.bio,
    avatarCode: newRecord.avatarCode,
    streetCred: newRecord.reputation,
    eddies: newRecord.balance,
    reputation: newRecord.reputation,
    balance: newRecord.balance,
    activeOperationsCount: 0,
    completedOperationsCount: 0,
    failedOperationsCount: 0,
    unreadNotificationsCount: 1,
    createdAt: newRecord.createdAt,
  };
}

export async function authenticateInLocalVault(params: {
  username: string;
  password: string;
}): Promise<{ token: string; profile: OperatorProfile } | null> {
  const normalizedUsername = params.username.trim();
  const vault = loadVault();

  const record = vault.find(
    (r) => r.username.toLowerCase() === normalizedUsername.toLowerCase()
  );
  if (!record) {
    return null;
  }

  const inputHash = await sha256Hex(params.password);
  if (inputHash !== record.passwordHash) {
    return null;
  }

  const sessionToken = `ah_local_jwt_${record.id}_${inputHash.slice(0, 16)}`;

  return {
    token: sessionToken,
    profile: {
      id: record.id,
      username: record.username,
      callsign: record.callsign,
      role: record.role,
      specialization: record.specialization,
      bio: record.bio,
      avatarCode: record.avatarCode,
      streetCred: record.reputation,
      eddies: record.balance,
      reputation: record.reputation,
      balance: record.balance,
      activeOperationsCount: 0,
      completedOperationsCount: 0,
      failedOperationsCount: 0,
      unreadNotificationsCount: 1,
      createdAt: record.createdAt,
    },
  };
}
