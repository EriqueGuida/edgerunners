import api from './api';
import type {
  Contract,
  ContractStatus,
  NotificationItem,
  ReputationEvent,
  ThreatLevel,
  WalletTransaction,
} from '../types/contract';

export const LOCAL_CONTRACTS_CACHE_KEY = 'afterhours_contracts_catalog_v2';
export const DEMO_MY_CONTRACTS_KEY = 'afterhours_demo_my_contracts';
export const LOCAL_NOTIFICATIONS_KEY = 'afterhours_local_notifications_v1';
export const LOCAL_WALLET_TX_KEY = 'afterhours_local_wallet_tx_v1';
export const LOCAL_REP_EVENTS_KEY = 'afterhours_local_rep_events_v1';

export const INITIAL_GEOLOCATED_CONTRACTS: Contract[] = [
  {
    id: 101,
    title: 'Extração de Criptografia Quântica em Shinjuku',
    targetName: 'Servidor Kestrel-09',
    faction: 'Aethelgard Dynamics',
    reward: 45000,
    threatLevel: 'PSYCHO',
    status: 'AVAILABLE',
    summary:
      'Extração física de chaves pós-quânticas em centro de processamento de alta segurança no distrito de Shinjuku.',
    briefing:
      'A Aethelgard Dynamics identificou o vazamento de um lote de chaves mestras armazenadas em um cofre frio isolado da rede no 42º andar do complexo Shinjuku Mitsui. O operador deverá infiltrar-se durante a janela de manutenção térmica, extrair o módulo físico e transmitir o hash de integridade sem acionar a malha de contenção.',
    objectives:
      'Infiltrar-se no 42º andar via duto de resfriamento;Extrair o módulo criptográfico Kestrel-09 sem acionar o bloqueio biométrico;Transmitir o código de confirmação no ponto de extração',
    requirements:
      'Reputação mínima 10. Proibido uso de explosivos ou interferência eletromagnética ampla.',
    minReputation: 10,
    reputationReward: 20,
    locationName: 'Shinjuku, Tóquio — Japão',
    region: 'ÁSIA-PACÍFICO',
    latitude: 35.6895,
    longitude: 139.6917,
    verificationPrompt:
      'Insira o hash de integridade extraído do módulo Kestrel-09 (ex: KESTREL-SHA-902).',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 102,
    title: 'Interceptação de Remessa Biométrica na Avenida Paulista',
    targetName: 'Comboio Blindado V-12',
    faction: 'Helios Biotech',
    reward: 28500,
    threatLevel: 'HIGH',
    status: 'AVAILABLE',
    summary:
      'Clonagem não destrutiva de registros genéticos transportados entre centros financeiros em São Paulo.',
    briefing:
      'Um veículo de transferência de dados da Helios Biotech cruzará o corredor subterrâneo da Avenida Paulista às 02:40 UTC. O contratante exige uma cópia espelhada do manifesto de carga via acoplamento óptico de curto alcance sem interromper o trajeto do comboio.',
    objectives:
      'Posicionar repetidor tático no túnel da Paulista;Sincronizar leitura de pacotes a menos de 15 metros do veículo V-12;Confirmar checksum do manifesto clonado',
    requirements:
      'Operação estritamente furtiva. O comboio não deve detectar perda de pacotes.',
    minReputation: 5,
    reputationReward: 15,
    locationName: 'Av. Paulista, São Paulo — Brasil',
    region: 'AMÉRICA LATINA',
    latitude: -23.5614,
    longitude: -46.6559,
    verificationPrompt: 'Informe o checksum de sincronização do comboio V-12.',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 103,
    title: 'Neutralização de Nó Clandestino em Kreuzberg',
    targetName: 'Estação Subterrânea U-04',
    faction: 'Coletivo Null-Sec',
    reward: 14000,
    threatLevel: 'MEDIUM',
    status: 'AVAILABLE',
    summary:
      'Desativação de repetidores ilegais instalados em galeria ferroviária desativada de Berlim.',
    briefing:
      'Um grupo dissidente instalou antenas de interceptação em uma subestação abandonada sob Kreuzberg, comprometendo rotas de comunicação de operadores europeus. Desative os três módulos de transmissão e recupere o log de acessos.',
    objectives:
      'Localizar a entrada secundária da galeria U-04;Desenergizar os 3 repetidores de sinal;Extrair o cartão de registro de tráfego',
    requirements: 'Acesso liberado para operadores de nível inicial (Reputação >= 1).',
    minReputation: 1,
    reputationReward: 10,
    locationName: 'Kreuzberg, Berlim — Alemanha',
    region: 'EUROPA',
    latitude: 52.4986,
    longitude: 13.4033,
    verificationPrompt: 'Informe o código serial do repetidor principal desativado.',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 104,
    title: 'Recuperação de Dossiê Financeiro em Marina Bay',
    targetName: 'Terminal Portuário S-3',
    faction: 'Consórcio Meridian',
    reward: 22000,
    threatLevel: 'HIGH',
    status: 'AVAILABLE',
    summary:
      'Auditoria forçada em contêiner automatizado de servidores no porto de Singapura.',
    briefing:
      'O Consórcio Meridian precisa recuperar registros contábeis retidos em um contêiner de dados refrigerado no Terminal S-3 de Marina Bay antes de seu embarque marítimo. O operador deve conectar-se diretamente à porta óptica do contêiner.',
    objectives:
      'Identificar o contêiner MRD-884 no pátio automatizado;Conectar terminal de decodificação na porta óptica;Transferir arquivo de auditoria e limpar logs locais',
    requirements: 'Evitar detecção por drones de patrulha portuária automatizados.',
    minReputation: 5,
    reputationReward: 12,
    locationName: 'Marina Bay, Singapura',
    region: 'ÁSIA-PACÍFICO',
    latitude: 1.2834,
    longitude: 103.8607,
    verificationPrompt: 'Informe o código de manifesto extraído do contêiner MRD-884.',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 105,
    title: 'Varredura de Contramedidas em Gangnam',
    targetName: 'Torre Han-River',
    faction: 'Kurogane Systems',
    reward: 8500,
    threatLevel: 'LOW',
    status: 'AVAILABLE',
    summary:
      'Verificação de segurança física e varredura de escutas em sala de conselho corporativo em Seul.',
    briefing:
      'A Kurogane Systems suspeita de espionagem industrial antes de uma fusão estratégica. O operador realizará uma varredura de espectro eletromagnético no 28º andar da Torre Han-River e removerá quaisquer transmissores passivos.',
    objectives:
      'Executar varredura de radiofrequência no 28º andar;Neutralizar microtransmissores encontrados;Emitir laudo criptografado de conformidade',
    requirements:
      'Nível de risco baixo. Ideal para construção rápida de reputação na rede.',
    minReputation: 1,
    reputationReward: 10,
    locationName: 'Gangnam, Seul — Coreia do Sul',
    region: 'ÁSIA-PACÍFICO',
    latitude: 37.4979,
    longitude: 127.0276,
    verificationPrompt: 'Informe a frequência ou ID do transmissor neutralizado.',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 106,
    title: 'Sabotagem de Bunker de Dados nos Alpes',
    targetName: 'Complexo Criptográfico Helvetia',
    faction: 'Vanguard Sovereign',
    reward: 62000,
    threatLevel: 'PSYCHO',
    status: 'AVAILABLE',
    summary:
      'Injeção de payload lógico em instalação subterrânea de armazenamento frio próxima a Zurique.',
    briefing:
      'O Complexo Helvetia opera servidores isolados sob rocha granítica nos arredores de Zurique. A Vanguard Sovereign autorizou uma operação de alto risco para injetar uma rotina de bloqueio seletivo nos backups de uma organização rival.',
    objectives:
      'Ultrapassar o perímetro de sensores térmicos externos;Acessar o terminal mestre da galeria B;Executar payload de bloqueio e confirmar assinatura criptográfica',
    requirements:
      'Exige Operador Sênior (Reputação >= 15). Janela máxima de permanência: 12 minutos.',
    minReputation: 15,
    reputationReward: 25,
    locationName: 'Zurique — Suíça',
    region: 'EUROPA',
    latitude: 47.3769,
    longitude: 8.5417,
    verificationPrompt:
      'Informe a assinatura de execução gerada pelo terminal Helvetia.',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 107,
    title: 'Rastreamento de Transmissão Fantasma em Manhattan',
    targetName: 'Antena Chrysler-Sec',
    faction: 'Echelon Intelligence',
    reward: 16800,
    threatLevel: 'MEDIUM',
    status: 'AVAILABLE',
    summary:
      'Triangulação e desligamento de farol de dados anônimo operando em Midtown Manhattan.',
    briefing:
      'Sinais criptografados de origem desconhecida estão sendo retransmitidos a partir do topo de um edifício comercial em Midtown. Identifique a unidade de hardware responsável, registre o endereço MAC de origem e desconecte a alimentação.',
    objectives:
      'Triangular a fonte exata do sinal em Midtown;Registrar chave pública do transmissor;Desconectar unidade sem danificar o armazenamento interno',
    requirements:
      'Acesso aos terraços técnicos requer credencial de manutenção simulada.',
    minReputation: 1,
    reputationReward: 10,
    locationName: 'Midtown, Nova York — EUA',
    region: 'AMÉRICA DO NORTE',
    latitude: 40.7549,
    longitude: -73.984,
    verificationPrompt: 'Informe o identificador de hardware do farol desconectado.',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 108,
    title: 'Proteção de Cabo Submarino no Canal de Suez',
    targetName: 'Estação de Aterragem Red-Sea 02',
    faction: 'Global Backbone Alliance',
    reward: 34000,
    threatLevel: 'HIGH',
    status: 'AVAILABLE',
    summary:
      'Inspeção tática e remoção de grampo óptico em ponto de interconexão intercontinental no Egito.',
    briefing:
      'Latências anômalas foram detectadas no tronco óptico que conecta a Europa à Ásia. Há indícios de acoplamento físico clandestino na caixa de junção costeira. O operador deve localizar o grampo óptico, removê-lo e restabelecer a integridade do link.',
    objectives:
      'Inspecionar a câmara de junção costeira Red-Sea 02;Remover acoplador óptico clandestino;Validar atenuação do sinal abaixo de 0.2 dB',
    requirements:
      'Reputação mínima 8. Operação noturna em zona costeira monitorada.',
    minReputation: 8,
    reputationReward: 15,
    locationName: 'Porto Said / Cairo — Egito',
    region: 'ORIENTE MÉDIO & ÁFRICA',
    latitude: 30.0444,
    longitude: 31.2357,
    verificationPrompt: 'Informe o código de diagnóstico óptico pós-remoção.',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

export const DEFAULT_DEMO_MY_CONTRACTS: Contract[] = [
  {
    id: 201,
    title: 'Infiltração em Subestação de Dados em Frankfurt',
    targetName: 'Núcleo Financeiro E-Central',
    faction: 'Aethelgard Dynamics',
    reward: 32000,
    threatLevel: 'HIGH',
    status: 'ACCEPTED',
    summary:
      'Extração de registros de roteamento intercontinental sem acionamento de alarmes.',
    briefing:
      'A subestação E-Central em Frankfurt processa liquidações privadas entre conglomerados europeus. O operador já possui acesso ao perímetro secundário e deve concluir a extração do bloco de auditoria antes da rotação de chaves.',
    objectives:
      'Estabelecer ponte criptografada no rack E-04;Exportar snapshot de roteamento;Encerrar sessão sem deixar artefatos de memória',
    requirements: 'Operação em andamento. Submeta o hash ao finalizar.',
    minReputation: 1,
    reputationReward: 15,
    locationName: 'Distrito Financeiro, Frankfurt — Alemanha',
    region: 'EUROPA',
    latitude: 50.1109,
    longitude: 8.6821,
    verificationPrompt: 'Informe o hash SHA do snapshot exportado.',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 202,
    title: 'Desativação de Antena de Interceptação no Porto de Santos',
    targetName: 'Terminal Marítimo T-08',
    faction: 'Consórcio Meridian',
    reward: 18500,
    threatLevel: 'MEDIUM',
    status: 'ACCEPTED',
    summary: 'Interrupção física de enlace clandestino de telemetria marítima.',
    briefing:
      'Um transmissor não autorizado instalado no guindaste 08 do Porto de Santos está vazando manifestos de carga da Meridian. Desative o circuito principal e confirme o código de desligamento.',
    objectives:
      'Acessar torre de controle do Terminal T-08;Desativar módulo de telemetria clandestino;Confirmar silêncio de rádio na frequência alvo',
    requirements: 'Janela noturna recomendada.',
    minReputation: 1,
    reputationReward: 10,
    locationName: 'Porto de Santos, São Paulo — Brasil',
    region: 'AMÉRICA LATINA',
    latitude: -23.9618,
    longitude: -46.3322,
    verificationPrompt: 'Informe o código de confirmação de desligamento.',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 203,
    title: 'Auditoria Forçada em Laboratório Subterrâneo de Seul',
    targetName: 'Unidade Bio-Sintética Songdo',
    faction: 'Helios Biotech',
    reward: 50000,
    threatLevel: 'PSYCHO',
    status: 'COMPLETED',
    summary: 'Cópia forense de chaves de pesquisa biométrica e limpeza de logs.',
    briefing:
      'Operação concluída com êxito. Os registros forenses da unidade Songdo foram transferidos integralmente para o cofre da Helios Biotech.',
    objectives:
      'Infiltrar laboratório nível B3;Extrair chaves biométricas;Limpar registros de acesso',
    requirements: 'Reputação mínima 10.',
    minReputation: 10,
    reputationReward: 20,
    locationName: 'Songdo IBD, Seul — Coreia do Sul',
    region: 'ÁSIA-PACÍFICO',
    latitude: 37.3826,
    longitude: 126.6563,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 901,
    title: 'CANAL OPERACIONAL CRIPTOGRAFADO ATIVO',
    message:
      'Credencial verificada no nó AFTERHOURS NET-04. O catálogo global de contratos está sincronizado.',
    type: 'INFO',
    isRead: false,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 902,
    title: 'NOVO CONTRATO DE ALTO VALOR EM SHINJUKU',
    message:
      'Aethelgard Dynamics publicou o contrato CTR-0101 (45.000 ¢ // Risco Crítico) no setor Ásia-Pacífico.',
    type: 'ALERT',
    isRead: false,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 903,
    title: 'LIQUIDAÇÃO CONFIRMADA // CTR-0203',
    message:
      'Recompensa de 50.000 ¢ e +20 REP creditados pela conclusão da operação em Songdo, Seul.',
    type: 'SUCCESS',
    isRead: true,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

export function getLocalMyContracts(): Contract[] {
  const raw = localStorage.getItem(DEMO_MY_CONTRACTS_KEY);
  if (!raw) {
    localStorage.setItem(
      DEMO_MY_CONTRACTS_KEY,
      JSON.stringify(DEFAULT_DEMO_MY_CONTRACTS)
    );
    return DEFAULT_DEMO_MY_CONTRACTS;
  }
  try {
    return JSON.parse(raw) as Contract[];
  } catch {
    return DEFAULT_DEMO_MY_CONTRACTS;
  }
}

export function getLocalCatalogContracts(): Contract[] {
  const myContracts = getLocalMyContracts();
  const myIds = new Set(myContracts.map((c) => c.id));

  const rawCatalog = localStorage.getItem(LOCAL_CONTRACTS_CACHE_KEY);
  let catalog: Contract[] = INITIAL_GEOLOCATED_CONTRACTS;
  if (rawCatalog) {
    try {
      catalog = JSON.parse(rawCatalog) as Contract[];
    } catch {
      catalog = INITIAL_GEOLOCATED_CONTRACTS;
    }
  } else {
    localStorage.setItem(
      LOCAL_CONTRACTS_CACHE_KEY,
      JSON.stringify(INITIAL_GEOLOCATED_CONTRACTS)
    );
  }

  // Mescla estado atualizado das operações do operador com o catálogo disponível
  const availableFromCatalog = catalog.filter((c) => !myIds.has(c.id));
  return [...availableFromCatalog, ...myContracts];
}

export function getLocalNotifications(): NotificationItem[] {
  const raw = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
  if (!raw) {
    localStorage.setItem(
      LOCAL_NOTIFICATIONS_KEY,
      JSON.stringify(INITIAL_NOTIFICATIONS)
    );
    return INITIAL_NOTIFICATIONS;
  }
  try {
    return JSON.parse(raw) as NotificationItem[];
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function pushLocalNotification(
  title: string,
  message: string,
  type: NotificationItem['type'] = 'INFO'
): NotificationItem[] {
  const current = getLocalNotifications();
  const created: NotificationItem = {
    id: Date.now(),
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  const updated = [created, ...current].slice(0, 25);
  localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
  return updated;
}

export function markAllLocalNotificationsRead(): NotificationItem[] {
  const updated = getLocalNotifications().map((n) => ({ ...n, isRead: true }));
  localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
  return updated;
}

export async function fetchAllContractsUnified(): Promise<{
  contracts: Contract[];
  isOffline: boolean;
}> {
  try {
    const response = await api.get<Contract[]>('/api/contracts');
    return { contracts: response.data, isOffline: false };
  } catch {
    return { contracts: getLocalCatalogContracts(), isOffline: true };
  }
}

export async function acceptContractUnified(contract: Contract): Promise<{
  updatedContract: Contract;
  isOffline: boolean;
}> {
  try {
    const response = await api.patch<Contract>(
      `/api/contracts/${contract.id}/accept`
    );
    return { updatedContract: response.data, isOffline: false };
  } catch {
    const accepted: Contract = { ...contract, status: 'ACCEPTED' };
    const currentMy = getLocalMyContracts();
    const nextMy = [
      accepted,
      ...currentMy.filter((c) => c.id !== contract.id),
    ];
    localStorage.setItem(DEMO_MY_CONTRACTS_KEY, JSON.stringify(nextMy));

    pushLocalNotification(
      `OPERAÇÃO VINCULADA // CTR-${String(contract.id).padStart(4, '0')}`,
      `Você assumiu a execução de "${contract.title}" (${contract.locationName || 'Global'}).`,
      'INFO'
    );

    return { updatedContract: accepted, isOffline: true };
  }
}

const REGION_DEFAULT_COORDS: Record<string, { lat: number; lng: number }> = {
  'ÁSIA-PACÍFICO': { lat: 35.6895, lng: 139.6917 },
  'AMÉRICA LATINA': { lat: -23.5614, lng: -46.6559 },
  EUROPA: { lat: 52.4986, lng: 13.4033 },
  'AMÉRICA DO NORTE': { lat: 40.7549, lng: -73.984 },
  'ORIENTE MÉDIO & ÁFRICA': { lat: 30.0444, lng: 31.2357 },
};

export function createLocalContract(payload: {
  title: string;
  targetName: string;
  faction: string;
  reward: number;
  threatLevel: ThreatLevel;
  region?: string;
  locationName?: string;
  summary?: string;
  briefing?: string;
  minReputation?: number;
  latitude?: number;
  longitude?: number;
}): Contract {
  const currentCatalog = getLocalCatalogContracts();
  const fallbackCoords =
    REGION_DEFAULT_COORDS[payload.region || 'ÁSIA-PACÍFICO'] ||
    REGION_DEFAULT_COORDS['ÁSIA-PACÍFICO'];
  const created: Contract = {
    id: Math.floor(Math.random() * 700) + 300,
    title: payload.title,
    targetName: payload.targetName,
    faction: payload.faction,
    reward: payload.reward,
    threatLevel: payload.threatLevel,
    status: 'AVAILABLE',
    summary:
      payload.summary ||
      `Operação tática solicitada por ${payload.faction} visando ${payload.targetName}.`,
    briefing:
      payload.briefing ||
      `Dossiê operacional classificado publicado na malha AFTERHOURS. O operador designado deverá infiltrar-se no perímetro de ${payload.targetName}, executar os protocolos técnicos e transmitir o hash de verificação sem exposição da rede.`,
    objectives: `Estabelecer acesso seguro ao perímetro;Executar protocolo sobre ${payload.targetName};Transmitir telemetria de verificação e evadir do local`,
    requirements:
      'Operação sob sigilo estrito. Proibido acionamento de alertas locais.',
    minReputation: payload.minReputation ?? 1,
    reputationReward:
      payload.threatLevel === 'PSYCHO'
        ? 25
        : payload.threatLevel === 'HIGH'
        ? 15
        : 10,
    locationName: payload.locationName || 'Perímetro Urbano Classificado',
    region: payload.region || 'GLOBAL',
    latitude: payload.latitude ?? fallbackCoords.lat,
    longitude: payload.longitude ?? fallbackCoords.lng,
    verificationPrompt:
      'Informe o hash de telemetria ou código de protocolo obtido no local.',
    createdAt: new Date().toISOString(),
  };

  const nextCatalog = [created, ...currentCatalog];
  localStorage.setItem(LOCAL_CONTRACTS_CACHE_KEY, JSON.stringify(nextCatalog));

  pushLocalNotification(
    `NOVO CONTRATO PUBLICADO // CTR-${String(created.id).padStart(4, '0')}`,
    `${created.title} (${new Intl.NumberFormat('pt-BR').format(created.reward)} ¢) adicionado ao diretório.`,
    'INFO'
  );

  return created;
}

const INITIAL_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 702,
    contractId: 203,
    contractTitle: 'Auditoria Forçada em Laboratório Subterrâneo de Seul',
    amount: 50000,
    balanceAfter: 74500,
    type: 'CONTRACT_SETTLEMENT',
    description:
      'Liquidação criptográfica verificada da operação CTR-0203 (Songdo IBD, Seul).',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 701,
    amount: 24500,
    balanceAfter: 24500,
    type: 'INITIAL_GRANT',
    description:
      'Alocação inicial de credencial verificada na malha operacional AFTERHOURS NET-04.',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_REPUTATION_EVENTS: ReputationEvent[] = [
  {
    id: 802,
    delta: 20,
    reputationAfter: 35,
    reason:
      'Conclusão sem detecção do contrato CTR-0203 (Auditoria Forçada em Laboratório Subterrâneo de Seul).',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 801,
    delta: 15,
    reputationAfter: 15,
    reason: 'Histórico operacional prévio validado pela diretoria AFTERHOURS.',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
];

export function getLocalWalletTransactions(): WalletTransaction[] {
  const raw = localStorage.getItem(LOCAL_WALLET_TX_KEY);
  if (!raw) {
    localStorage.setItem(
      LOCAL_WALLET_TX_KEY,
      JSON.stringify(INITIAL_WALLET_TRANSACTIONS)
    );
    return INITIAL_WALLET_TRANSACTIONS;
  }
  try {
    return JSON.parse(raw) as WalletTransaction[];
  } catch {
    return INITIAL_WALLET_TRANSACTIONS;
  }
}

export function getLocalReputationEvents(): ReputationEvent[] {
  const raw = localStorage.getItem(LOCAL_REP_EVENTS_KEY);
  if (!raw) {
    localStorage.setItem(
      LOCAL_REP_EVENTS_KEY,
      JSON.stringify(INITIAL_REPUTATION_EVENTS)
    );
    return INITIAL_REPUTATION_EVENTS;
  }
  try {
    return JSON.parse(raw) as ReputationEvent[];
  } catch {
    return INITIAL_REPUTATION_EVENTS;
  }
}

export function recordLocalSettlement(
  contract: Contract,
  newBalanceAfter: number,
  newReputationAfter: number,
  submissionHash?: string
): void {
  const repReward = contract.reputationReward ?? 10;

  const currentTx = getLocalWalletTransactions();
  const newTx: WalletTransaction = {
    id: Date.now(),
    contractId: contract.id,
    contractTitle: contract.title,
    amount: contract.reward,
    balanceAfter: newBalanceAfter,
    type: 'CONTRACT_SETTLEMENT',
    description: `Liquidação da operação CTR-${String(contract.id).padStart(4, '0')} (${contract.title})${
      submissionHash ? ` // HASH: ${submissionHash}` : ''
    }`,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(
    LOCAL_WALLET_TX_KEY,
    JSON.stringify([newTx, ...currentTx])
  );

  const currentRep = getLocalReputationEvents();
  const newRepEvent: ReputationEvent = {
    id: Date.now() + 1,
    delta: repReward,
    reputationAfter: newReputationAfter,
    reason: `Execução verificada do contrato CTR-${String(contract.id).padStart(4, '0')}: ${contract.title}`,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(
    LOCAL_REP_EVENTS_KEY,
    JSON.stringify([newRepEvent, ...currentRep])
  );
}

export function updateLocalContract(
  id: number,
  updates: Partial<Contract>
): Contract | null {
  const all = getLocalCatalogContracts();
  const existing = all.find((c) => c.id === id);
  if (!existing) return null;

  const updated: Contract = { ...existing, ...updates };
  const nextAll = all.map((c) => (c.id === id ? updated : c));
  localStorage.setItem(LOCAL_CONTRACTS_CACHE_KEY, JSON.stringify(nextAll));

  const myContracts = getLocalMyContracts();
  if (myContracts.some((c) => c.id === id)) {
    localStorage.setItem(
      DEMO_MY_CONTRACTS_KEY,
      JSON.stringify(myContracts.map((c) => (c.id === id ? updated : c)))
    );
  }

  return updated;
}

export function updateLocalContractStatus(
  id: number,
  status: ContractStatus
): Contract | null {
  return updateLocalContract(id, { status });
}
