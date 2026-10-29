import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowDownRight,
  Lock,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import heroTokyoImg from '../assets/afterhours-hero-tokyo.jpg';
import gridFrankfurtImg from '../assets/afterhours-grid-frankfurt.jpg';
import operatorRainImg from '../assets/afterhours-operator-rain.jpg';
import { useAuth } from '../context/AuthContext';
import { useImmersion } from '../context/ImmersionContext';
import type { ThreatLevel } from '../types/contract';

interface SampleBriefing {
  id: string;
  code: string;
  title: string;
  client: string;
  target: string;
  sector: string;
  coordinates: string;
  threat: ThreatLevel;
  statusLabel: string;
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
    target: 'Módulo Físico Kestrel-09',
    sector: 'Shinjuku, Tóquio',
    coordinates: '35.6895° N, 139.6917° E',
    threat: 'PSYCHO',
    statusLabel: 'AVAILABLE // VERIFIED',
    reward: 'CR¢ 45.000',
    summary:
      'Recuperação física de chaves pós-quânticas armazenadas em cofre frio isolado da rede no 42º andar do complexo comercial de Shinjuku durante janela de manutenção térmica.',
    objectives: [
      'Acessar o perímetro técnico do 42º andar sem acionar bloqueio perimetral',
      'Extrair o módulo criptográfico Kestrel-09 intacto',
      'Registrar hash de verificação no terminal para liquidação do contrato',
    ],
    requirements:
      'Reputação mínima nível 10. Operação sob protocolo de silêncio de rádio.',
  },
  {
    id: 'ctr-0102',
    code: 'CTR-0102',
    title: 'Interceptação de Manifesto Biométrico na Paulista',
    client: 'Helios Biotech',
    target: 'Comboio Blindado V-12',
    sector: 'Av. Paulista, São Paulo',
    coordinates: '23.5614° S, 46.6559° W',
    threat: 'HIGH',
    statusLabel: 'AVAILABLE // VERIFIED',
    reward: 'CR¢ 28.500',
    summary:
      'Clonagem não destrutiva de manifesto de transporte via acoplamento óptico de curto alcance em corredor urbano subterrâneo.',
    objectives: [
      'Posicionar repetidor de leitura no corredor subterrâneo designado',
      'Sincronizar espelhamento de pacotes durante a passagem da unidade V-12',
      'Submeter checksum de integridade no painel de operações',
    ],
    requirements:
      'Reputação mínima nível 5. Proibida interrupção física do comboio.',
  },
  {
    id: 'ctr-0103',
    code: 'CTR-0103',
    title: 'Desativação de Nó Clandestino em Kreuzberg',
    client: 'Coletivo Null-Sec',
    target: 'Subestação Subterrânea U-04',
    sector: 'Kreuzberg, Berlim',
    coordinates: '52.4986° N, 13.4033° E',
    threat: 'MEDIUM',
    statusLabel: 'IN PROGRESS // SAMPLE',
    reward: 'CR¢ 14.000',
    summary:
      'Neutralização de repetidores não autorizados instalados em galeria ferroviária desativada que interceptam tráfego de operadores locais.',
    objectives: [
      'Localizar acesso secundário da subestação U-04',
      'Desenergizar os três transmissores de interceptação',
      'Recuperar registro de tráfego local e relatar conclusão',
    ],
    requirements:
      'Acesso liberado para operadores de nível inicial (Reputação >= 1).',
  },
];

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
  const { isAuthenticated } = useAuth();
  const { reducedMotion } = useImmersion();
  const [selectedSampleId, setSelectedSampleId] = useState<string>(
    DEMONSTRATIVE_SAMPLES[0].id
  );

  const activeSample =
    DEMONSTRATIVE_SAMPLES.find((item) => item.id === selectedSampleId) ||
    DEMONSTRATIVE_SAMPLES[0];

  const terminalDestination = isAuthenticated ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-[#E6EDF3] selection:bg-[#00E5FF] selection:text-[#07090E] overflow-x-hidden">
      {/* =========================================================
          CABEÇALHO MINIMALISTA (Seção 4.2)
         ========================================================= */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#1E2636] bg-[#07090E]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="font-display font-bold text-lg tracking-[0.18em] text-[#E6EDF3] hover:text-[#00E5FF] transition-colors"
            >
              AFTERHOURS
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
            className="hidden md:flex items-center gap-8 text-sm text-[#8B98A9]"
          >
            <a
              href="#network"
              className="hover:text-[#E6EDF3] transition-colors py-1"
            >
              The Network
            </a>
            <a
              href="#operations"
              className="hover:text-[#E6EDF3] transition-colors py-1"
            >
              Contract Operations
            </a>
            <a
              href="#terminal"
              className="hover:text-[#E6EDF3] transition-colors py-1"
            >
              Inside the Terminal
            </a>
          </nav>

          <Link
            to={terminalDestination}
            className="px-4 py-2 bg-[#0C1017] border border-[#00E5FF]/60 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#07090E] font-mono text-xs font-medium tracking-[0.14em] transition-colors flex items-center gap-2"
          >
            <span>ACCESS TERMINAL</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        {/* =========================================================
            PRIMEIRO VIEWPORT — HERO EDITORIAL & CARTOGRAFIA NOTURNA (Seção 4.2 & 4.3)
           ========================================================= */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center border-b border-[#1E2636] py-12 lg:py-20">
          <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Coluna Editorial Principal (5 colunas) */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="lg:col-span-5 space-y-7"
            >
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#0C1017] border border-[#1E2636] font-mono text-[11px] text-[#00E5FF] tracking-[0.14em]">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"
                  aria-hidden="true"
                />
                <span>NOCTURNAL OPERATIONS TERMINAL</span>
              </div>

              <div className="space-y-4">
                <h1 className="font-display font-bold text-4xl sm:text-5xl xl:text-6xl tracking-tight text-[#E6EDF3] leading-[1.04]">
                  THE CITY NEVER CLOCKS OUT.
                </h1>
                <p className="text-lg sm:text-xl text-[#E6EDF3]/90 font-normal leading-snug">
                  Private contracts. Restricted intelligence. Operations beyond business hours.
                </p>
                <p className="text-sm sm:text-base text-[#8B98A9] leading-relaxed">
                  AFTERHOURS é uma plataforma ficcional de gestão de contratos táticos. Assuma a identidade de um operador independente, avalie briefings de campo, aceite missões verificadas e construa sua reputação em uma rede privada.
                </p>
              </div>

              {/* CTAs Primário e Secundário */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to={terminalDestination}
                  className="px-6 py-3.5 bg-[#00E5FF] text-[#07090E] hover:bg-[#00E5FF]/90 font-mono text-xs font-semibold tracking-[0.16em] transition-all flex items-center gap-2.5"
                >
                  <span>ENTER THE NETWORK</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <a
                  href="#network"
                  className="px-6 py-3.5 bg-[#0C1017] border border-[#1E2636] text-[#E6EDF3] hover:border-[#00E5FF]/50 hover:text-[#00E5FF] font-mono text-xs tracking-[0.16em] transition-colors flex items-center gap-2"
                >
                  <span>EXPLORE THE SYSTEM</span>
                  <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>

              {/* Metadados Técnicos Discretos */}
              <dl className="pt-6 border-t border-[#1E2636] grid grid-cols-2 gap-6 font-mono text-xs">
                <div>
                  <dt className="text-[#8B98A9] text-[11px] mb-1">
                    ENVIRONMENT ARCHITECTURE
                  </dt>
                  <dd className="text-[#E6EDF3]">
                    Encrypted Dispatch // REST + JWT
                  </dd>
                </div>
                <div>
                  <dt className="text-[#8B98A9] text-[11px] mb-1">
                    OPERATIONAL SCOPE
                  </dt>
                  <dd className="text-[#00E5FF]">
                    Fictional Contract Network
                  </dd>
                </div>
              </dl>
            </motion.div>

            {/* Composição Visual Proprietária: Malha Cartográfica & Rota Noturna (7 colunas - Seção 4.2 e 4.3) */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
              className="lg:col-span-7"
            >
              <figure className="relative bg-[#0C1017] border border-[#1E2636] ah-reticle overflow-hidden">
                {/* Barra Superior do Visor Cartográfico */}
                <div className="px-4 py-2.5 bg-[#07090E]/90 border-b border-[#1E2636] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#8B98A9]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 bg-[#00E5FF]"
                      aria-hidden="true"
                    />
                    <span className="text-[#E6EDF3]">
                      SECTOR_VIEW // TOKYO METROPOLITAN CORRIDOR
                    </span>
                  </div>
                  <span>35.6895° N, 139.6917° E // ILLUSTRATIVE OVERLAY</span>
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

                  {/* Malha Cartográfica e Rota Operacional em SVG (Destaque único em Ciano - Seção 4.3) */}
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

                    {/* Grade Cartográfica Secundária */}
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

                    {/* Perímetro de Operação Discreto */}
                    <circle
                      cx="480"
                      cy="210"
                      r="68"
                      fill="rgba(0, 229, 255, 0.05)"
                      stroke="rgba(0, 229, 255, 0.35)"
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
                    <circle cx="480" cy="210" r="5.5" fill="#00E5FF" />
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
                        width="115"
                        height="22"
                        fill="rgba(7, 9, 14, 0.85)"
                        stroke="#1E2636"
                      />
                      <text x="140" y="419" fill="#8B98A9">
                        ENTRY // NODE_01
                      </text>

                      <rect
                        x="494"
                        y="186"
                        width="186"
                        height="44"
                        fill="rgba(7, 9, 14, 0.9)"
                        stroke="#00E5FF"
                        strokeWidth="1"
                      />
                      <text x="506" y="204" fill="#00E5FF">
                        TARGET // KESTREL-09
                      </text>
                      <text x="506" y="220" fill="#E6EDF3">
                        SHINJUKU SECTOR // HIGH
                      </text>

                      <rect
                        x="575"
                        y="118"
                        width="124"
                        height="22"
                        fill="rgba(7, 9, 14, 0.85)"
                        stroke="#1E2636"
                      />
                      <text x="585" y="133" fill="#8B98A9">
                        EXFIL // CORRIDOR_B
                      </text>
                    </g>
                  </svg>

                  {/* Legenda Inferior dentro do Visor */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#07090E]/90 backdrop-blur-md border border-[#1E2636] font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-[#00E5FF]/10 border border-[#00E5FF]/50 text-[#00E5FF] text-[11px]">
                        ROUTE_ACTIVE
                      </span>
                      <span className="text-[#E6EDF3]">
                        Corredor de extração Shinjuku &rarr; Sumida
                      </span>
                    </div>
                    <span className="text-[#8B98A9] text-[11px]">
                      DIST: 4.8 KM // CLEARANCE LVL 10
                    </span>
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
              {LIFECYCLE_STEPS.map((item) => (
                <div
                  key={item.code}
                  className="p-6 flex flex-col justify-between space-y-6 hover:bg-[#111722]/60 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-[#8B98A9]">STEP {item.step}</span>
                      <span className="px-2 py-0.5 bg-[#07090E] border border-[#1E2636] text-[#00E5FF]">
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            SEÇÃO C — INSIDE THE TERMINAL (Amostra Demonstrativa - Seção 4.4)
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
                  Abaixo está uma prévia demonstrativa de como contratos, metadados de missão e dossiês de briefing são organizados dentro do ambiente autenticado.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-[#0C1017] border border-[#1E2636] font-mono text-[11px] text-[#8B98A9]">
                INTERFACE PREVIEW // DEMONSTRATIVE SAMPLE DATA
              </div>
            </div>

            {/* Moldura do Terminal Demonstrativo */}
            <div className="border border-[#1E2636] bg-[#0C1017] ah-reticle overflow-hidden">
              {/* Barra de Título da Janela do Terminal */}
              <div className="px-6 py-3 bg-[#07090E] border-b border-[#1E2636] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-[#00E5FF]" aria-hidden="true" />
                  <span className="text-[#E6EDF3]">
                    AFTERHOURS_TERMINAL // CONTRACT_DISPATCH_PREVIEW
                  </span>
                </div>
                <span className="text-[#8B98A9]">
                  SELECT A SAMPLE RECORD TO INSPECT BRIEFING
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1E2636]">
                {/* Lista de Contratos Demonstrativos (5 colunas) */}
                <div className="lg:col-span-5 divide-y divide-[#1E2636]">
                  {DEMONSTRATIVE_SAMPLES.map((sample) => {
                    const isSelected = sample.id === activeSample.id;
                    const isCritical = sample.threat === 'PSYCHO';
                    return (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => setSelectedSampleId(sample.id)}
                        className={`w-full text-left p-6 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#111722] border-l-2 border-l-[#00E5FF]'
                            : 'bg-[#0C1017] hover:bg-[#111722]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 font-mono text-[11px] mb-2">
                          <span className="text-[#8B98A9]">{sample.code}</span>
                          <span
                            className={`px-2 py-0.5 border ${
                              isCritical
                                ? 'border-[#F43F5E]/60 text-[#F43F5E] bg-[#F43F5E]/10'
                                : 'border-[#00E5FF]/50 text-[#00E5FF] bg-[#00E5FF]/10'
                            }`}
                          >
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
                          <span className="text-[#E6EDF3] font-medium">
                            {sample.reward}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Painel de Briefing da Amostra Selecionada (7 colunas) */}
                <div className="lg:col-span-7 flex flex-col justify-between bg-[#0C1017]">
                  <div>
                    {/* Faixa Visual com Foto 2 (Frankfurt) */}
                    <div className="relative h-40 overflow-hidden border-b border-[#1E2636] bg-[#07090E]">
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
                        <span className="px-2.5 py-1 bg-[#07090E]/90 border border-[#1E2636] text-[#8B98A9]">
                          {activeSample.coordinates}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-6 right-6">
                        <span className="font-mono text-xs text-[#8B98A9] block">
                          CLIENT: {activeSample.client}
                        </span>
                        <h3 className="font-display font-bold text-xl sm:text-2xl text-[#E6EDF3]">
                          {activeSample.title}
                        </h3>
                      </div>
                    </div>

                    {/* Detalhes do Briefing */}
                    <div className="p-6 space-y-6">
                      <div>
                        <h4 className="font-mono text-xs text-[#00E5FF] mb-2">
                          BRIEFING SUMMARY
                        </h4>
                        <p className="text-sm text-[#E6EDF3]/90 leading-relaxed">
                          {activeSample.summary}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-mono text-xs text-[#00E5FF] mb-2.5">
                          OPERATIONAL OBJECTIVES
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
                            SECTOR LOCATION
                          </span>
                          <span className="text-[#E6EDF3]">
                            {activeSample.sector}
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
                  </div>

                  {/* Aviso de Requisitos no Rodapé do Preview */}
                  <div className="px-6 py-4 bg-[#07090E] border-t border-[#1E2636] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                    <span className="flex items-center gap-2 text-[#8B98A9]">
                      <ShieldAlert className="w-4 h-4 text-[#00E5FF] shrink-0" aria-hidden="true" />
                      {activeSample.requirements}
                    </span>
                    <Link
                      to={terminalDestination}
                      className="text-[#00E5FF] hover:underline flex items-center gap-1"
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
