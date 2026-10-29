export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'PSYCHO';

export type ContractStatus = 'AVAILABLE' | 'ACCEPTED' | 'COMPLETED' | 'FAILED';

export interface HunterSummary {
  id: number;
  username: string;
  streetCred: number;
  eddies: number;
}

export interface Contract {
  id: number;
  title: string;
  targetName: string;
  faction: string;
  reward: number;
  threatLevel: ThreatLevel;
  status: ContractStatus;
  hunter?: HunterSummary | null;
}
