import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowDownRight,
  Lock,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Terminal,
  Crosshair,
  Skull,
  Radio,
  Layers,
  Award,
  Globe2,
} from 'lucide-react';
import heroTokyoImg from '../assets/afterhours-hero-tokyo.jpg';
import gridFrankfurtImg from '../assets/afterhours-grid-frankfurt.jpg';
import operatorRainImg from '../assets/afterhours-operator-rain.jpg';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useImmersion } from '../context/ImmersionContext';
import type { Contract, ContractStatus, ThreatLevel } from '../types/contract';
import { soundEngine } from '../utils/sound';

interface SampleBriefing {
  id: string;
  code: string;
  title: string;
  client: string;
  target: string;
  sector: string;
  region: string;
  coordinates: string;
  threat: ThreatLevel;
  status: ContractStatus;
  statusLabel: string;
  minReputation: number;
  reputationReward: number;
  reward: string;
  summary: string;
  objectives: string[];
  requirements: string;
}

const DEMONSTRATIVE_SAMPLES: SampleBriefing[] = [
  {
    id: 'ctr-0101',
    code: 'CTR-0101',
    title: 'Extração de Criptografia Quântica em Shinjuku',
    client: 'Aethelgard Dynamics',
    target: 'Servidor Kestrel-09',
    sector: 'Shinjuku, Tóquio — Japão',
    region: 'ÁSIA-PACÍFICO',
    coordinates: '35.6895° N, 139.6917° E',
    threat: 'PSYCHO',
    status: 'AVAILABLE',
    statusLabel: 'STATUS // AVAILABLE (SAMPLE)',
    minReputation: 10,
    reputationReward: 20,
    reward: 'CR¢ 45.000',
    summary:
      'Extração física de chaves pós-quânticas armazenadas em cofre frio isolado da rede no 42º andar do complexo Shinjuku Mitsui durante janela de manutenção térmica.',
    objectives: [
      'Infiltrar-se no 42º andar via duto de resfriamento sem acionar bloqueio biométrico',
      'Extrair o módulo criptográfico Kestrel-09 intacto',
      'Registrar protocolo de confirmação no terminal para liquidação do contrato',
    ],
    requirements:
      'Reputação mínima nível 10. Proibido uso de explosivos ou interferência eletromagnética ampla.',
  },
  {
    id: 'ctr-0102',
    code: 'CTR-0102',
    title: 'Interceptação de Remessa Biométrica na Avenida Paulista',
    client: 'Helios Biotech',
    target: 'Comboio Blindado V-12',
    sector: 'Av. Paulista, São Paulo — Brasil',
    region: 'AMÉRICA LATINA',
    coordinates: '23.5614° S, 46.6559° W',
    threat: 'HIGH',
    status: 'AVAILABLE',
    statusLabel: 'STATUS // AVAILABLE (SAMPLE)',
    minReputation: 5,
    reputationReward: 15,
    reward: 'CR¢ 28.500',
    summary:
      'Clonagem não destrutiva de manifesto de transporte via acoplamento óptico de curto alcance em corredor urbano subterrâneo.',
    objectives: [
      'Posicionar repetidor tático no túnel da Avenida Paulista',
      'Sincronizar leitura de pacotes a menos de 15 metros do veículo V-12',
      'Submeter checksum do manifesto clonado na Sala de Operações',
    ],
    requirements:
      'Reputação mínima nível 5. Operação estritamente furtiva; o comboio não deve detectar perda de pacotes.',
  },
  {
    id: 'ctr-0103',
    code: 'CTR-0103',
    title: 'Neutralização de Nó Clandestino em Kreuzberg',
    client: 'Coletivo Null-Sec',
    target: 'Estação Subterrânea U-04',
    sector: 'Kreuzberg, Berlim — Alemanha',
    region: 'EUROPA',
    coordinates: '52.4986° N, 13.4033° E',
    threat: 'MEDIUM',
    status: 'AVAILABLE',
    statusLabel: 'STATUS // AVAILABLE (SAMPLE)',
    minReputation: 1,
    reputationReward: 10,
    reward: 'CR¢ 14.000',
    summary:
      'Desativação de repetidores ilegais instalados em galeria ferroviária desativada de Berlim que comprometem rotas de comunicação.',
    objectives: [
      'Localizar a entrada secundária da galeria subterrânea U-04',
      'Desenergizar os 3 repetidores de interceptação de sinal',
      'Extrair o cartão de registro de tráfego e reportar conclusão',
    ],
    requirements:
      'Acesso liberado para operadores de nível inicial (Reputação >= 1).',
  },
];

function formatSampleCoords(lat?: number, lng?: number): string {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return '35.6895° N, 139.6917° E';
  }
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

function mapApiContractToSample(c: Contract): SampleBriefing {
  const code = `CTR-${String(c.id).padStart(4, '0')}`;
  const formattedReward = `CR¢ ${new Intl.NumberFormat('pt-BR').format(c.reward)}`;
  const objectives = c.objectives
    ? c.objectives
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
    : [
        `Estabelecer acesso ao perímetro de ${c.targetName}`,
        `Executar protocolo solicitado por ${c.faction}`,
        'Registrar confirmação de campo no terminal AFTERHOURS',
      ];

  return {
    id: `api-${c.id}`,
    code,
    title: c.title,
    client: c.faction,
    target: c.targetName,
    sector: c.locationName || 'Setor Urbano Classificado',
    region: c.region || 'GLOBAL',
    coordinates: formatSampleCoords(c.latitude, c.longitude),
    threat: c.threatLevel,
    status: c.status,
    statusLabel: `STATUS // ${c.status} (CATÁLOGO PÚBLICO)`,
    minReputation: c.minReputation ?? 1,
    reputationReward: c.reputationReward ?? 10,
    reward: formattedReward,
    summary:
      c.summary ||
      c.briefing ||
      `Operação tática solicitada por ${c.faction} visando ${c.targetName}.`,
    objectives,
    requirements:
      c.requirements ||
      `Reputação mínima nível ${c.minReputation ?? 1}. Operação sob protocolo de sigilo.`,
  };
}

const LIFECYCLE_STEPS = [
  {
    step: '01',
    code: 'DISCOVER',
    title: 'Descoberta e Filtragem',
    description:
      'Consulte o diretório de contratos disponíveis filtrando por classificação de risco, organização solicitante ou localização.',
  },
  {
    step: '02',
    code: 'REVIEW',
    title: 'Análise de Briefing',
    description:
      'Examine objetivos primários, alvo, condições operacionais, coordenadas e recompensa antes de tomar qualquer decisão.',
  },
  {
    step: '03',
    code: 'ACCEPT',
    title: 'Vinculação Confirmada',
    description:
      'Assine o contrato com confirmação explícita validada pelo servidor, reservando a operação para o seu perfil.',
  },
  {
    step: '04',
    code: 'EXECUTE',
    title: 'Acompanhamento de Campo',
    description:
      'Monitore o estado das operações vinculadas ao seu identificador em um ambiente focado e livre de ruído visual.',
  },
  {
    step: '05',
    code: 'REPORT',
    title: 'Submissão e Liquidação',
    description:
      'Reporte a conclusão da operação para validação no backend, atualizando seu saldo fictício e histórico de reputação.',
  },
];

export function Landing() {
  const { isAuthenticated, isDemoMode } = useAuth();
  const { reducedMotion } = useImmersion();
  const [samples, setSamples] = useState<SampleBriefing[]>(DEMONSTRATIVE_SAMPLES);
  const [isFromPublicApi, setIsFromPublicApi] = useState<boolean>(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(
    DEMONSTRATIVE_SAMPLES[0].id
  );
  const [focusedStep, setFocusedStep] = useState<string>(LIFECYCLE_STEPS[0].code);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Contract[]>('/api/contracts/public-preview')
      .then((res) => {
        if (!cancelled && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.slice(0, 4).map(mapApiContractToSample);
          setSamples(mapped);
          setSelectedSampleId(mapped[0].id);
          setIsFromPublicApi(true);
        }
      })
      .catch(() => {
        // Mantém os registros demonstrativos estáticos claramente identificados
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeSample =
    samples.find((item) => item.id === selectedSampleId) || samples[0];

  const terminalDestination = isAuthenticated || isDemoMode ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-[#E6EDF3] selection:bg-[#00E5FF] selection:text-[#07090E] overflow-x-hidden">
      {/* =========================================================
          CABEÇALHO MINIMALISTA (Nocturnal Operations Terminal)
         ========================================================= */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#1E2636] bg-[#07090E]/92 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              onClick={() => soundEngine.playClick()}
              className="font-display font-bold text-lg tracking-[0.2em] text-[#E6EDF3] hover:text-[#00E5FF] transition-colors flex items-center gap-2.5"
            >
              <span
                className="w-2 h-2 bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"
                aria-hidden="true"
              />
              <span>AFTERHOURS</span>
            </Link>
            <span
              className="hidden sm:inline-block h-3.5 w-[1px] bg-[#1E2636]"
              aria-hidden="true"
            />
            <span className="hidden sm:inline-block font-mono text-[11px] tracking-[0.16em] text-[#8B98A9]">
              PRIVATE OPERATIONS NETWORK
            </span>
          </div>

          <nav
            aria-label="Seções da página inicial"
            className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-[0.14em] text-[#8B98A9]"
          >
            <a
              href="#network"
              onClick={() => soundEngine.playClick()}
              className="hover:text-[#00E5FF] transition-colors py-1"
            >
              01 // The Network
            </a>
            <a
              href="#operations"
              onClick={() => soundEngine.playClick()}
              className="hover:text-[#00E5FF] transition-colors py-1"
            >
              02 // Contract Operations
            </a>
            <a
              href="#terminal"
              onClick={() => soundEngine.playClick()}
              className="hover:text-[#00E5FF] transition-colors py-1"
            >
              03 // Inside the Terminal
            </a>
          </nav>

          <Link
            to={terminalDestination}
            onClick={() => soundEngine.playClick()}
            className="px-4 py-2 bg-[#0C1017] border border-[#00E5FF]/60 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#07090E] font-mono text-xs font-semibold tracking-[0.14em] transition-colors flex items-center gap-2"
          >
            <span>{isAuthenticated ? 'OPEN TERMINAL' : 'ACCESS TERMINAL'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        {/* =========================================================
            PRIMEIRA DOBRA — ENTRADA CINEMATOGRÁFICA NO UNIVERSO AFTERHOURS
           ========================================================= */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center border-b border-[#1E2636] py-12 lg:py-20 overflow-hidden">
          {/* Atmosfera Urbana Noturna de Fundo & Malha Tática */}
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <img
              src={heroTokyoImg}
              alt=""
              className="w-full h-full object-cover object-center opacity-[0.16] saturate-50 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/92 to-[#07090E]/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-[#07090E]/90" />
            <div className="absolute inset-0 ah-tactical-grid opacity-30" />
            <div className="ambient-glow absolute -top-24 left-1/4 w-[42rem] h-80 bg-[#00E5FF]/[0.04] blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Coluna Editorial Principal (5 colunas) */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 space-y-7"
            >
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-[#0C1017]/90 border border-[#1E2636] font-mono text-[11px] text-[#00E5FF] tracking-[0.16em]">
                <span
                  className="w-1.5 h-1.5 bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"
                  aria-hidden="true"
                />
                <span>NOCTURNAL OPERATIONS TERMINAL</span>
              </div>

              <div className="space-y-4">
                <h1 className="font-display font-bold text-4xl sm:text-5xl xl:text-6xl tracking-tight text-[#E6EDF3] leading-[1.02]">
                  THE CITY NEVER CLOCKS OUT.
                </h1>
                <p className="text-lg sm:text-xl text-[#E6EDF3]/90 font-normal leading-snug">
                  Private contracts. Restricted intelligence. Operations beyond business hours.
                </p>
                <p className="text-sm sm:text-base text-[#8B98A9] leading-relaxed">
                  AFTERHOURS é uma rede privada ficcional de operações táticas. Credencie seu identificador de campo, inspecione dossiês geolocalizados, assuma contratos compatíveis com seu nível de reputação e liquide resultados auditáveis.
                </p>
              </div>

              {/* CTAs Primário e Secundário */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to={terminalDestination}
                  onClick={() => soundEngine.playClick()}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="px-7 py-4 bg-[#00E5FF] text-[#07090E] hover:bg-[#33ECFF] shadow-[0_0_28px_-6px_rgba(0,229,255,0.45)] font-mono text-xs font-semibold tracking-[0.16em] transition-all flex items-center gap-2.5"
                >
                  <span>ENTER THE NETWORK</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <a
                  href="#terminal"
                  onClick={() => soundEngine.playClick()}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="px-6 py-4 bg-[#0C1017]/90 border border-[#1E2636] text-[#E6EDF3] hover:border-[#00E5FF]/60 hover:text-[#00E5FF] font-mono text-xs tracking-[0.16em] transition-colors flex items-center gap-2"
                >
                  <span>INSPECT BRIEFING SAMPLE</span>
                  <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>

              {/* Metadados Técnicos Discretos e Honestos */}
              <dl className="pt-6 border-t border-[#1E2636] grid grid-cols-2 gap-6 font-mono text-xs">
                <div>
                  <dt className="text-[#8B98A9] text-[10px] tracking-[0.14em] mb-1">
                    TERMINAL ARCHITECTURE
                  </dt>
                  <dd className="text-[#E6EDF3]">
                    Spring Security // JWT + WGS84
                  </dd>
                </div>
                <div>
                  <dt className="text-[#8B98A9] text-[10px] tracking-[0.14em] mb-1">
                    OPERATIONAL DOMAIN
                  </dt>
                  <dd className="text-[#00E5FF]">
                    Fictional Contract Dispatch
                  </dd>
                </div>
              </dl>
            </motion.div>

            {/* Composição Visual Proprietária: Visor Cartográfico Sincronizado com o Dossiê Selecionado (7 colunas) */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              <figure className="relative bg-[#0C1017] border border-[#1E2636] ah-corner-marks overflow-hidden shadow-2xl">
                <div className="h-[2px] w-full bg-gradient-to-r from-[#00E5FF] via-[#00E5FF]/40 to-transparent" />

                {/* Barra Superior do Visor Cartográfico */}
                <div className="px-4 py-2.5 bg-[#07090E]/95 border-b border-[#1E2636] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#8B98A9]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 bg-[#00E5FF]"
                      aria-hidden="true"
                    />
                    <span className="text-[#E6EDF3] tracking-[0.12em]">
                      SECTOR_PROJECTION // {activeSample.sector.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[#00E5FF]">
                    {activeSample.coordinates} // TACTICAL OVERLAY
                  </span>
                </div>

                {/* Área Principal da Imagem + Sobreposição Vetorial de Rota */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#07090E]">
                  <img
                    src={heroTokyoImg}
                    alt="Vista aérea noturna de metrópole com sobreposição esquemática de rota operacional em ciano"
                    className="w-full h-full object-cover object-center opacity-65 saturate-75 contrast-110"
                  />
                  {/* Camada de escurecimento controlado para leitura dos vetores */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/35 to-[#07090E]/55" />

                  {/* Malha Cartográfica e Rota Operacional em SVG */}
                  <svg
                    viewBox="0 0 800 500"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id="tactical-grid"
                        width="80"
                        height="80"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 80 0 L 0 0 0 80"
                          fill="none"
                          stroke="rgba(230, 237, 243, 0.06)"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>

                    <rect width="800" height="500" fill="url(#tactical-grid)" />

                    {/* Eixos de Referência */}
                    <line
                      x1="0"
                      y1="250"
                      x2="800"
                      y2="250"
                      stroke="rgba(230, 237, 243, 0.08)"
                      strokeDasharray="4 6"
                    />
                    <line
                      x1="480"
                      y1="0"
                      x2="480"
                      y2="500"
                      stroke="rgba(230, 237, 243, 0.08)"
                      strokeDasharray="4 6"
                    />

                    {/* Perímetro de Operação */}
                    <circle
                      cx="480"
                      cy="210"
                      r="68"
                      fill="rgba(0, 229, 255, 0.05)"
                      stroke={activeSample.threat === 'PSYCHO' ? 'rgba(244, 63, 94, 0.55)' : 'rgba(0, 229, 255, 0.4)'}
                      strokeWidth="1.2"
                      strokeDasharray="5 4"
                    />

                    {/* Rota Selecionada em Ciano Elétrico */}
                    <path
                      d="M 170 390 L 290 330 L 385 265 L 480 210 L 615 155"
                      fill="none"
                      stroke="#00E5FF"
                      strokeWidth="2"
                    />

                    {/* Pontos da Rota */}
                    <circle
                      cx="170"
                      cy="390"
                      r="4"
                      fill="#07090E"
                      stroke="#00E5FF"
                      strokeWidth="2"
                    />
                    <circle
                      cx="385"
                      cy="265"
                      r="3.5"
                      fill="#07090E"
                      stroke="#00E5FF"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="480"
                      cy="210"
                      r="5.5"
                      fill={activeSample.threat === 'PSYCHO' ? '#F43F5E' : '#00E5FF'}
                    />
                    <circle
                      cx="615"
                      cy="155"
                      r="4"
                      fill="#07090E"
                      stroke="#00E5FF"
                      strokeWidth="2"
                    />

                    {/* Rótulos Técnicos Cartográficos */}
                    <g fontFamily="IBM Plex Mono, monospace" fontSize="11">
                      <rect
                        x="130"
                        y="404"
                        width="135"
                        height="22"
                        fill="rgba(7, 9, 14, 0.88)"
                        stroke="#1E2636"
                      />
                      <text x="140" y="419" fill="#8B98A9">
                        INFIL // PERIMETER
                      </text>

                      <rect
                        x="494"
                        y="182"
                        width="235"
                        height="48"
                        fill="rgba(7, 9, 14, 0.92)"
                        stroke={activeSample.threat === 'PSYCHO' ? '#F43F5E' : '#00E5FF'}
                        strokeWidth="1"
                      />
                      <text
                        x="506"
                        y="201"
                        fill={activeSample.threat === 'PSYCHO' ? '#F43F5E' : '#00E5FF'}
                      >
                        {activeSample.code} // {activeSample.threat}
                      </text>
                      <text x="506" y="219" fill="#E6EDF3">
                        {activeSample.target.slice(0, 26)}
                      </text>

                      <rect
                        x="575"
                        y="118"
                        width="135"
                        height="22"
                        fill="rgba(7, 9, 14, 0.88)"
                        stroke="#1E2636"
                      />
                      <text x="585" y="133" fill="#8B98A9">
                        EXFIL // EXTRACTION
                      </text>
                    </g>
                  </svg>

                  {/* Seletor Rápido de Dossiês dentro do Visor */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#07090E]/92 backdrop-blur-md border border-[#1E2636] font-mono text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`px-2 py-0.5 border text-[10px] shrink-0 ${
                          activeSample.threat === 'PSYCHO'
                            ? 'bg-[#F43F5E]/15 border-[#F43F5E]/60 text-[#F43F5E]'
                            : 'bg-[#00E5FF]/10 border-[#00E5FF]/50 text-[#00E5FF]'
                        }`}
                      >
                        {activeSample.code}
                      </span>
                      <span className="text-[#E6EDF3] truncate">
                        {activeSample.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {samples.slice(0, 3).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            setSelectedSampleId(s.id);
                          }}
                          className={`px-2 py-1 border text-[10px] uppercase transition-colors cursor-pointer ${
                            s.id === activeSample.id
                              ? 'bg-[#00E5FF] text-[#07090E] border-[#00E5FF] font-semibold'
                              : 'bg-[#0C1017] text-[#8B98A9] border-[#1E2636] hover:border-[#00E5FF]/50 hover:text-[#E6EDF3]'
                          }`}
                        >
                          {s.code}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </figure>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
            SEÇÃO A — THE NETWORK (Composição Editorial Assimétrica - Seção 4.4)
           ========================================================= */}
        <section
          id="network"
          className="py-24 border-b border-[#1E2636] bg-[#07090E]"
        >
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Coluna Esquerda: Narrativa Editorial */}
            <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-28">
              <div className="font-mono text-xs text-[#00E5FF] tracking-[0.16em]">
                01 // THE NETWORK
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#E6EDF3] tracking-tight leading-tight">
                Um sistema operacional clandestino construído para operações de precisão.
              </h2>
              <p className="text-base text-[#8B98A9] leading-relaxed">
                Sistemas administrativos tradicionais tratam operações como simples linhas em uma tabela. O AFTERHOURS foi projetado sob outra premissa: você não está apenas consultando dados — está acessando uma infraestrutura privada que conecta operadores independentes, briefings restritos e resultados auditáveis.
              </p>

              <div className="pt-4 space-y-6 border-t border-[#1E2636]">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <span className="sm:col-span-4 font-mono text-xs text-[#00E5FF] tracking-wider">
                    IDENTIDADE DE CAMPO
                  </span>
                  <p className="sm:col-span-8 text-sm text-[#E6EDF3]/90 leading-relaxed">
                    Cada operador atua sob um codinome credenciado, mantendo histórico verificável de contratos assumidos, operações concluídas e evolução de reputação.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-6 border-t border-[#1E2636]/70">
                  <span className="sm:col-span-4 font-mono text-xs text-[#00E5FF] tracking-wider">
                    CLAREZA OPERACIONAL
                  </span>
                  <p className="sm:col-span-8 text-sm text-[#E6EDF3]/90 leading-relaxed">
                    Nenhuma decisão é tomada no escuro. Riscos, requisitos mínimos, organização contratante e recompensas fictícias são declarados antes do aceite.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-6 border-t border-[#1E2636]/70">
                  <span className="sm:col-span-4 font-mono text-xs text-[#00E5FF] tracking-wider">
                    CONTROLE DO USUÁRIO
                  </span>
                  <p className="sm:col-span-8 text-sm text-[#E6EDF3]/90 leading-relaxed">
                    A atmosfera nunca sacrifica a legibilidade. O terminal respeita preferências de movimento reduzido, navegação por teclado e modos de apresentação.
                  </p>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Composição Fotográfica & Dossiê de Campo (Foto 4) */}
            <div className="lg:col-span-5 lg:col-start-8">
              <div className="bg-[#0C1017] border border-[#1E2636] p-4 ah-reticle">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2636] font-mono text-[11px] text-[#8B98A9]">
                  <span>FIELD_ARCHIVE // RECON_04</span>
                  <span className="text-[#00E5FF]">RESTRICTED BRIEFING</span>
                </div>

                <div className="relative aspect-[4/5] overflow-hidden bg-[#07090E]">
                  <img
                    src={operatorRainImg}
                    alt="Silhueta de operador em rua urbana noturna chuvosa iluminada por letreiros"
                    className="w-full h-full object-cover object-center opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-[#07090E]/30" />

                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#0C1017]/95 border border-[#1E2636]">
                    <p className="font-mono text-[11px] text-[#00E5FF] mb-1">
                      PRINCIPLE // AFTERHOURS MANIFESTO
                    </p>
                    <p className="text-sm text-[#E6EDF3] leading-snug">
                      &ldquo;Fazer uma aplicação de gestão parecer um lugar no qual o usuário entra, e não apenas uma ferramenta que abre.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SEÇÃO B — CONTRACT OPERATIONS (Fluxo Real - Seção 4.4)
           ========================================================= */}
        <section
          id="operations"
          className="py-24 border-b border-[#1E2636] bg-[#0C1017]/50"
        >
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="font-mono text-xs text-[#00E5FF] tracking-[0.16em]">
                  02 // CONTRACT OPERATIONS
                </div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#E6EDF3] tracking-tight">
                  Do briefing inicial à liquidação do resultado.
                </h2>
              </div>
              <div className="font-mono text-xs text-[#8B98A9] tracking-wider">
                DISCOVER &rarr; REVIEW &rarr; ACCEPT &rarr; EXECUTE &rarr; REPORT
              </div>
            </div>

            {/* Sequência Visual de 5 Etapas */}
            <div className="grid grid-cols-1 md:grid-cols-5 border border-[#1E2636] bg-[#0C1017] divide-y md:divide-y-0 md:divide-x divide-[#1E2636]">
              {LIFECYCLE_STEPS.map((item) => {
                const isActive = focusedStep === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setFocusedStep(item.code);
                    }}
                    onMouseEnter={() => {
                      soundEngine.playHover();
                      setFocusedStep(item.code);
                    }}
                    className={`p-6 text-left flex flex-col justify-between space-y-6 transition-colors cursor-pointer relative ${
                      isActive ? 'bg-[#111722]' : 'hover:bg-[#111722]/60'
                    }`}
                  >
                    {isActive && (
                      <span
                        className="absolute top-0 left-0 right-0 h-[2px] bg-[#00E5FF]"
                        aria-hidden="true"
                      />
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-[#8B98A9]">STEP {item.step}</span>
                        <span
                          className={`px-2 py-0.5 border ${
                            isActive
                              ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]'
                              : 'bg-[#07090E] border-[#1E2636] text-[#00E5FF]'
                          }`}
                        >
                          {item.code}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-lg text-[#E6EDF3]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-[#8B98A9] leading-relaxed">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            SEÇÃO C — INSIDE THE TERMINAL (Inspeção de Dossiês Reais ou Demonstrativos)
           ========================================================= */}
        <section
          id="terminal"
          className="py-24 border-b border-[#1E2636] bg-[#07090E]"
        >
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="font-mono text-xs text-[#00E5FF] tracking-[0.16em]">
                  03 // INSIDE THE TERMINAL
                </div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#E6EDF3] tracking-tight">
                  Inspecione a estrutura do terminal operacional.
                </h2>
                <p className="text-sm sm:text-base text-[#8B98A9]">
                  Selecione qualquer registro abaixo para inspecionar o dossiê tático, coordenadas WGS84, objetivos de campo e requisitos de reputação exatamente como estruturados no terminal.
                </p>
              </div>

              <div className="px-3.5 py-2 bg-[#0C1017] border border-[#1E2636] font-mono text-[11px] text-[#8B98A9] flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#00E5FF]" aria-hidden="true" />
                <span>
                  {isFromPublicApi
                    ? 'PUBLIC PREVIEW // SINCRONIZADO COM /api/contracts/public-preview'
                    : 'INTERFACE PREVIEW // DEMONSTRATIVE SAMPLE DATA'}
                </span>
              </div>
            </div>

            {/* Moldura do Terminal Demonstrativo */}
            <div className="border border-[#1E2636] bg-[#0C1017] ah-corner-marks overflow-hidden shadow-2xl">
              {/* Barra de Título da Janela do Terminal */}
              <div className="px-6 py-3 bg-[#07090E] border-b border-[#1E2636] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-[#00E5FF]" aria-hidden="true" />
                  <span className="text-[#E6EDF3]">
                    AFTERHOURS_TERMINAL // CONTRACT_DISPATCH_PREVIEW
                  </span>
                </div>
                <span className="text-[#8B98A9]">
                  {samples.length} REGISTROS DE DEMONSTRAÇÃO DISPONÍVEIS PARA INSPEÇÃO
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1E2636]">
                {/* Lista de Contratos (5 colunas) */}
                <div className="lg:col-span-5 divide-y divide-[#1E2636]">
                  {samples.map((sample) => {
                    const isSelected = sample.id === activeSample.id;
                    const isCritical = sample.threat === 'PSYCHO';
                    return (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedSampleId(sample.id);
                        }}
                        onMouseEnter={() => soundEngine.playHover()}
                        className={`w-full text-left p-6 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#111722] border-l-2 border-l-[#00E5FF]'
                            : 'bg-[#0C1017] hover:bg-[#111722]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 font-mono text-[11px] mb-2">
                          <span className="text-[#00E5FF] font-semibold">
                            {sample.code} // {sample.region}
                          </span>
                          <span
                            className={`px-2 py-0.5 border inline-flex items-center gap-1 ${
                              isCritical
                                ? 'border-[#F43F5E]/60 text-[#F43F5E] bg-[#F43F5E]/10'
                                : 'border-[#00E5FF]/50 text-[#00E5FF] bg-[#00E5FF]/10'
                            }`}
                          >
                            {isCritical && <Skull className="w-3 h-3" />}
                            THREAT // {sample.threat}
                          </span>
                        </div>

                        <h3 className="font-display font-semibold text-lg text-[#E6EDF3] mb-2">
                          {sample.title}
                        </h3>

                        <div className="flex items-center justify-between font-mono text-xs text-[#8B98A9] pt-2">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" aria-hidden="true" />
                            {sample.sector}
                          </span>
                          <span className="text-[#E6EDF3] font-semibold">
                            {sample.reward}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Painel de Briefing da Amostra Selecionada (7 colunas) */}
                <div className="lg:col-span-7 flex flex-col justify-between bg-[#0C1017]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSample.id}
                      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Faixa Visual com Foto 2 (Frankfurt) */}
                      <div className="relative h-44 overflow-hidden border-b border-[#1E2636] bg-[#07090E]">
                        <img
                          src={gridFrankfurtImg}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-cover object-center opacity-45"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C1017] via-[#0C1017]/60 to-transparent" />

                        <div className="absolute top-4 left-6 right-6 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                          <span className="px-2.5 py-1 bg-[#07090E]/90 border border-[#1E2636] text-[#00E5FF]">
                            {activeSample.statusLabel}
                          </span>
                          <span className="px-2.5 py-1 bg-[#07090E]/90 border border-[#1E2636] text-[#8B98A9] flex items-center gap-1.5">
                            <Globe2 className="w-3 h-3 text-[#00E5FF]" />
                            {activeSample.coordinates}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-6 right-6">
                          <span className="font-mono text-xs text-[#8B98A9] block">
                            CONTRACTING FACTION: <strong className="text-[#E6EDF3]">{activeSample.client}</strong>
                          </span>
                          <h3 className="font-display font-bold text-xl sm:text-2xl text-[#E6EDF3] mt-0.5">
                            {activeSample.title}
                          </h3>
                        </div>
                      </div>

                      {/* Detalhes do Briefing */}
                      <div className="p-6 space-y-6">
                        <div>
                          <h4 className="font-mono text-xs text-[#00E5FF] mb-2 flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5" />
                            <span>BRIEFING SUMMARY</span>
                          </h4>
                          <p className="text-sm text-[#E6EDF3]/90 leading-relaxed">
                            {activeSample.summary}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-mono text-xs text-[#00E5FF] mb-2.5 flex items-center gap-2">
                            <Crosshair className="w-3.5 h-3.5" />
                            <span>OPERATIONAL OBJECTIVES</span>
                          </h4>
                          <ul className="space-y-2 text-sm text-[#8B98A9]">
                            {activeSample.objectives.map((objective, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2.5 p-2.5 bg-[#07090E] border border-[#1E2636]"
                              >
                                <CheckCircle2
                                  className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5"
                                  aria-hidden="true"
                                />
                                <span className="text-[#E6EDF3]/90 text-xs sm:text-sm">
                                  {objective}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                          <div className="p-3 bg-[#07090E] border border-[#1E2636]">
                            <span className="block text-[10px] text-[#8B98A9] mb-1">
                              PRIMARY TARGET
                            </span>
                            <span className="text-[#E6EDF3]">
                              {activeSample.target}
                            </span>
                          </div>
                          <div className="p-3 bg-[#07090E] border border-[#1E2636]">
                            <span className="block text-[10px] text-[#8B98A9] mb-1">
                              CLEARANCE &amp; PROGRESSION
                            </span>
                            <span className="text-[#10B981] flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              REP &ge; {activeSample.minReputation} (+{activeSample.reputationReward} REP)
                            </span>
                          </div>
                          <div className="p-3 bg-[#07090E] border border-[#1E2636]">
                            <span className="block text-[10px] text-[#8B98A9] mb-1">
                              CONTRACT REWARD
                            </span>
                            <span className="text-[#00E5FF] font-semibold">
                              {activeSample.reward}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Aviso de Requisitos no Rodapé do Preview */}
                  <div className="px-6 py-4 bg-[#07090E] border-t border-[#1E2636] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                    <span className="flex items-center gap-2 text-[#8B98A9]">
                      <ShieldAlert className="w-4 h-4 text-[#00E5FF] shrink-0" aria-hidden="true" />
                      {activeSample.requirements}
                    </span>
                    <Link
                      to={terminalDestination}
                      onClick={() => soundEngine.playClick()}
                      className="text-[#00E5FF] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>AUTHENTICATE TO ACCEPT</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SEÇÃO D — ACESSO AO TERMINAL (Seção 4.4)
           ========================================================= */}
        <section className="py-24 bg-[#0C1017] border-b border-[#1E2636]">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#07090E] border border-[#1E2636] font-mono text-xs text-[#00E5FF]">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>RESTRICTED DISPATCH ENVIRONMENT</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#E6EDF3] tracking-tight">
              Pronto para ingressar na rede AFTERHOURS?
            </h2>

            <p className="text-base text-[#8B98A9] max-w-xl mx-auto leading-relaxed">
              Autentique-se com suas credenciais de operador para consultar o catálogo persistido, aceitar contratos disponíveis e gerenciar suas operações.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to={terminalDestination}
                className="px-8 py-4 bg-[#00E5FF] text-[#07090E] hover:bg-[#00E5FF]/90 font-mono text-xs font-semibold tracking-[0.16em] transition-all flex items-center gap-2.5"
              >
                <span>ACCESS THE TERMINAL</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="px-6 py-4 bg-[#07090E] border border-[#1E2636] text-[#E6EDF3] hover:border-[#00E5FF]/60 hover:text-[#00E5FF] font-mono text-xs tracking-[0.16em] transition-colors"
                >
                  REGISTER NEW OPERATOR
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER COMPACTO E HONESTO (Seção 4.5)
         ========================================================= */}
      <footer className="bg-[#07090E] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 font-mono text-xs text-[#8B98A9]">
          <div className="space-y-1">
            <div className="text-[#E6EDF3] font-semibold tracking-[0.14em]">
              AFTERHOURS // PRIVATE OPERATIONS NETWORK
            </div>
            <p className="text-[11px] text-[#8B98A9]">
              Ambiente ficcional de gestão de contratos operacionais. Créditos (CR¢), missões e organizações são elementos narrativos sem valor monetário real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              to="/login"
              className="hover:text-[#00E5FF] transition-colors"
            >
              Access Terminal
            </Link>
            <Link
              to="/register"
              className="hover:text-[#00E5FF] transition-colors"
            >
              Operator Registration
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
