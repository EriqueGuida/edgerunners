export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'PSYCHO';

export type ContractStatus = 'AVAILABLE' | 'ACCEPTED' | 'COMPLETED' | 'FAILED';

export type OperationStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ABANDONED';

export type UserRole = 'OPERATOR' | 'ADMIN';

export interface HunterSummary {
  id: number;
  username: string;
  callsign?: string;
  role?: UserRole;
  specialization?: string;
  bio?: string;
  avatarCode?: string;
  streetCred: number;
  eddies: number;
  reputation?: number;
  balance?: number;
}

export interface Contract {
  id: number;
  title: string;
  targetName: string;
  faction: string;
  reward: number;
  threatLevel: ThreatLevel;
  status: ContractStatus;
  summary?: string;
  briefing?: string;
  objectives?: string;
  requirements?: string;
  minReputation?: number;
  reputationReward?: number;
  locationName?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  verificationPrompt?: string;
  createdAt?: string;
  hunter?: HunterSummary | null;
}

export interface Operation {
  id: number;
  contract: Contract;
  operator: HunterSummary;
  status: OperationStatus;
  acceptedAt: string;
  completedAt?: string;
  submissionHash?: string;
  submissionNotes?: string;
  rewardPaid?: number;
  reputationEarned?: number;
}

export interface WalletTransaction {
  id: number;
  contractId?: number;
  contractTitle?: string;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface ReputationEvent {
  id: number;
  delta: number;
  reputationAfter: number;
  reason: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  createdAt: string;
}

export interface OperatorProfile {
  id: number;
  username: string;
  callsign: string;
  role: UserRole;
  specialization: string;
  bio: string;
  avatarCode: string;
  streetCred: number;
  eddies: number;
  reputation: number;
  balance: number;
  activeOperationsCount: number;
  completedOperationsCount: number;
  failedOperationsCount: number;
  unreadNotificationsCount: number;
  createdAt?: string;
}
