import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  AttributionControl,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Globe2,
  Crosshair,
  MapPin,
  FileSearch,
  Compass,
  Maximize2,
  AlertTriangle,
  ShieldAlert,
  Skull,
  Lock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { Contract, ThreatLevel } from '../../types/contract';
import { HoldToAcceptButton } from '../ui/HoldToAcceptButton';
import { useImmersion } from '../../context/ImmersionContext';
import { soundEngine } from '../../utils/sound';

interface TacticalWorldMapProps {
  contracts: Contract[];
  mode?: 'FULL_MAP' | 'HYBRID';
  operatorReputation?: number;
  onOpenDossier: (contract: Contract) => void;
  onAcceptContract?: (contract: Contract) => void | Promise<void>;
  acceptingId?: number | null;
}

const THREAT_COLOR_HEX: Record<ThreatLevel, string> = {
  LOW: '#10B981',
  MEDIUM: '#00E5FF',
  HIGH: '#F59E0B',
  PSYCHO: '#F43F5E',
};

const THREAT_LABEL: Record<ThreatLevel, string> = {
  LOW: 'BAIXO',
  MEDIUM: 'MÉDIO',
  HIGH: 'ALTO',
  PSYCHO: 'CRÍTICO',
};

// Basemap 100% gratuito e sem chave de API: OpenStreetMap oficial com filtro noturno Nocturnal Operations (RF-100, RF-105, RF-108)
const OSM_NOCTURNAL_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-standard': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm-raster-layer',
      type: 'raster',
      source: 'osm-standard',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// Estilo vetorial OpenFreeMap Dark (também 100% gratuito e sem API Key)
const OPENFREEMAP_VECTOR_URL = 'https://tiles.openfreemap.org/styles/dark';

function formatCoord(lat?: number, lng?: number): string {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return '35.6895° N, 139.6917° E';
  }
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function TacticalWorldMap({
  contracts,
  mode = 'FULL_MAP',
  operatorReputation = 1,
  onOpenDossier,
  onAcceptContract,
  acceptingId = null,
}: TacticalWorldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const { reducedMotion, visualMode } = useImmersion();
  const isInstantCamera = reducedMotion || visualMode === 'simplified';

  const geolocatedContracts = contracts.filter(
    (c) => typeof c.latitude === 'number' && typeof c.longitude === 'number'
  );

  const [focusedContractId, setFocusedContractId] = useState<number | null>(
    () => geolocatedContracts[0]?.id ?? null
  );
  const [basemapType, setBasemapType] = useState<'OSM_DARK' | 'VECTOR_DARK'>('OSM_DARK');
  const [mapFallbackMode, setMapFallbackMode] = useState<boolean>(false);
  const [cameraCoords, setCameraCoords] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  }>({
    lat: 22.0,
    lng: 15.0,
    zoom: 1.85,
  });

  const focusedContract =
    geolocatedContracts.find((c) => c.id === focusedContractId) ||
    geolocatedContracts[0] ||
    null;

  const flyToContract = useCallback(
    (contract: Contract) => {
      setFocusedContractId(contract.id);
      if (
        typeof contract.latitude !== 'number' ||
        typeof contract.longitude !== 'number'
      ) {
        return;
      }

      setCameraCoords({
        lat: contract.latitude,
        lng: contract.longitude,
        zoom: 5.8,
      });

      const map = mapRef.current;
      if (!map) return;

      if (isInstantCamera) {
        map.jumpTo({
          center: [contract.longitude, contract.latitude],
          zoom: 5.8,
        });
      } else {
        map.flyTo({
          center: [contract.longitude, contract.latitude],
          zoom: 5.8,
          speed: 1.35,
          curve: 1.4,
          essential: true,
        });
      }
    },
    [isInstantCamera]
  );

  // Inicialização da instância MapLibre GL JS + ResizeObserver para ocupar 100% da área útil
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return;

    let resizeObserver: ResizeObserver | null = null;

    try {
      const map = new MapLibreMap({
        container,
        style: OSM_NOCTURNAL_STYLE,
        center: [15.0, 22.0],
        zoom: 1.85,
        minZoom: 1.2,
        maxZoom: 18,
        attributionControl: false,
      });

      map.addControl(
        new NavigationControl({
          showCompass: true,
          showZoom: true,
        }),
        'top-right'
      );

      map.addControl(
        new AttributionControl({
          compact: false,
        }),
        'bottom-right'
      );

      map.on('load', () => {
        map.resize();
      });

      map.on('move', () => {
        const center = map.getCenter();
        setCameraCoords({
          lat: Number(center.lat.toFixed(4)),
          lng: Number(center.lng.toFixed(4)),
          zoom: Number(map.getZoom().toFixed(2)),
        });
      });

      resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(container);

      mapRef.current = map;
    } catch {
      window.setTimeout(() => setMapFallbackMode(true), 0);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Redimensiona imediatamente quando alterna entre FULL_MAP e HYBRID
  useEffect(() => {
    const timer = window.setTimeout(() => {
      mapRef.current?.resize();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [mode]);

  // Alternância entre camada OSM Tática (sem API Key) e Vetorial OpenFreeMap
  const toggleBasemapStyle = () => {
    soundEngine.playClick();
    const map = mapRef.current;
    if (!map) return;

    const nextType = basemapType === 'OSM_DARK' ? 'VECTOR_DARK' : 'OSM_DARK';
    setBasemapType(nextType);
    if (nextType === 'VECTOR_DARK') {
      map.setStyle(OPENFREEMAP_VECTOR_URL);
    } else {
      map.setStyle(OSM_NOCTURNAL_STYLE);
    }
  };

  // Sincronização dos marcadores geolocalizados com os contratos filtrados (RF-102, RF-103)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    geolocatedContracts.forEach((contract) => {
      if (
        typeof contract.latitude !== 'number' ||
        typeof contract.longitude !== 'number'
      ) {
        return;
      }

      const color = THREAT_COLOR_HEX[contract.threatLevel] || '#00E5FF';
      const isSelected = focusedContract?.id === contract.id;

      const el = document.createElement('button');
      el.type = 'button';
      el.setAttribute(
        'aria-label',
        `Selecionar contrato ${contract.title} em ${contract.locationName || 'coordenada'}`
      );
      el.style.cssText = `
        position: relative;
        width: ${isSelected ? '30px' : '22px'};
        height: ${isSelected ? '30px' : '22px'};
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(7, 9, 14, 0.94);
        border: ${isSelected ? '2px' : '1.5px'} solid ${color};
        box-shadow: 0 0 ${isSelected ? '18px' : '10px'} ${color}99;
        cursor: pointer;
        z-index: ${isSelected ? '20' : '10'};
      `;

      const coreDot = document.createElement('span');
      coreDot.style.cssText = `
        width: ${isSelected ? '9px' : '6px'};
        height: ${isSelected ? '9px' : '6px'};
        background: ${color};
        display: block;
      `;
      el.appendChild(coreDot);

      const labelTag = document.createElement('span');
      labelTag.textContent = `CTR-${String(contract.id).padStart(4, '0')}`;
      labelTag.style.cssText = `
        position: absolute;
        top: -22px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1px 6px;
        background: rgba(12, 16, 23, 0.96);
        border: 1px solid ${isSelected ? color : '#1E2636'};
        color: ${isSelected ? '#F1F5F9' : '#94A3B8'};
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        font-weight: ${isSelected ? '600' : '400'};
        letter-spacing: 0.08em;
        white-space: nowrap;
        pointer-events: none;
      `;
      el.appendChild(labelTag);

      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        soundEngine.playClick();
        flyToContract(contract);
      });

      const marker = new Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([contract.longitude, contract.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [geolocatedContracts, focusedContract?.id, flyToContract]);

  const resetGlobalOrbit = () => {
    soundEngine.playClick();
    const map = mapRef.current;
    setCameraCoords({ lat: 22.0, lng: 15.0, zoom: 1.85 });
    if (!map) return;

    if (isInstantCamera) {
      map.jumpTo({ center: [15.0, 22.0], zoom: 1.85 });
    } else {
      map.flyTo({
        center: [15.0, 22.0],
        zoom: 1.85,
        speed: 1.4,
        essential: true,
      });
    }
  };

  const minRep = focusedContract?.minReputation ?? 1;
  const meetsReputation = operatorReputation >= minRep;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 border border-[#1E2636] bg-[#0C1017] ah-corner-marks overflow-hidden h-[calc(100vh-14.5rem)] min-h-[620px]">
      {/* =========================================================
          PAINEL LATERAL DE LISTA SINCRONIZADA (EXIBIDO APENAS NO MODO HÍBRIDO)
         ========================================================= */}
      {mode === 'HYBRID' && (
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#1E2636] flex flex-col h-full overflow-hidden bg-[#0C1017]">
          <div className="p-4 border-b border-[#1E2636] bg-[#111722]/80 flex items-center justify-between shrink-0">
            <div>
              <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                MODO HÍBRIDO // LISTA + MAPA
              </span>
              <h3 className="font-display font-bold text-sm text-[#F1F5F9] mt-0.5">
                Alvos Geolocalizados ({geolocatedContracts.length})
              </h3>
            </div>

            <button
              type="button"
              onClick={resetGlobalOrbit}
              title="Restaurar visão orbital global"
              className="px-2.5 py-1.5 bg-[#07090E] border border-[#1E2636] hover:border-[#00E5FF] font-mono text-[10px] text-[#94A3B8] hover:text-[#00E5FF] uppercase tracking-[0.12em] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
              <span>ÓRBITA GLOBAL</span>
            </button>
          </div>

          {/* Lista de contratos que disparam flyTo ao clicar */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1E2636]">
            {geolocatedContracts.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-[#64748B]">
                Nenhum contrato geolocalizado corresponde aos filtros atuais.
              </div>
            ) : (
              geolocatedContracts.map((contract) => {
                const isSelected = focusedContract?.id === contract.id;
                const threatColor =
                  THREAT_COLOR_HEX[contract.threatLevel] || '#00E5FF';

                return (
                  <div
                    key={contract.id}
                    onClick={() => {
                      soundEngine.playClick();
                      flyToContract(contract);
                    }}
                    className={`w-full text-left p-4 transition-colors cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#111722] text-[#F1F5F9]'
                        : 'bg-[#0C1017] hover:bg-[#111722]/60 text-[#94A3B8]'
                    }`}
                  >
                    <span
                      className="absolute left-0 top-0 bottom-0 w-[3px] transition-opacity"
                      style={{
                        backgroundColor: threatColor,
                        opacity: isSelected ? 1 : 0.25,
                      }}
                    />

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.14em]">
                        CTR-{String(contract.id).padStart(4, '0')} //{' '}
                        {contract.region || 'GLOBAL'}
                      </span>
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.12em]"
                        style={{ color: threatColor }}
                      >
                        {THREAT_LABEL[contract.threatLevel]}
                      </span>
                    </div>

                    <p className="font-display font-bold text-sm text-[#F1F5F9] group-hover:text-[#00E5FF] transition-colors line-clamp-1">
                      {contract.title}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between font-mono text-[11px]">
                      <span className="text-[#64748B] flex items-center gap-1 truncate max-w-[55%]">
                        <MapPin className="w-3 h-3 text-[#00E5FF] shrink-0" />
                        {contract.locationName}
                      </span>

                      <div className="flex items-center gap-2">
                        <strong className="text-[#F1F5F9]">
                          {new Intl.NumberFormat('pt-BR').format(contract.reward)}{' '}
                          <span className="text-[#00E5FF]">¢</span>
                        </strong>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playClick();
                            onOpenDossier(contract);
                          }}
                          className="px-2 py-0.5 bg-[#07090E] border border-[#1E2636] hover:border-[#00E5FF] text-[10px] text-[#00E5FF] uppercase flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>DOSSIÊ</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          VIEWPORT MAPLIBRE GL JS (OCUPA 12 COLS NO MODO MAPA GLOBAL OU 8 COLS NO HÍBRIDO)
         ========================================================= */}
      <div
        className={`${
          mode === 'FULL_MAP' ? 'lg:col-span-12' : 'lg:col-span-8'
        } relative w-full h-full bg-[#07090E] overflow-hidden ${
          basemapType === 'OSM_DARK' ? 'ah-nocturnal-osm' : ''
        }`}
      >
        {/* Grade de fundo tática sob o canvas */}
        <div
          className="pointer-events-none absolute inset-0 ah-tactical-grid opacity-35"
          aria-hidden="true"
        />

        {/* Container oficial do MapLibre GL JS (100% da largura e altura) */}
        {!mapFallbackMode ? (
          <div
            ref={mapContainerRef}
            className="absolute inset-0 w-full h-full"
            aria-label="Mapa geográfico interativo da Terra com contratos do AFTERHOURS"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <AlertTriangle className="w-8 h-8 text-[#00E5FF] mb-2" />
            <p className="font-display font-bold text-lg text-[#F1F5F9]">
              Projeção Tática de Contingência Ativa (RF-107)
            </p>
            <p className="font-sans text-xs text-[#94A3B8] max-w-md mt-1">
              O motor WebGL não respondeu neste dispositivo. Todos os contratos geolocalizados permanecem selecionáveis pelo HUD tático.
            </p>
          </div>
        )}

        {/* TOP HUD OVERLAY FLUTUANTE SOBRE O MAPA */}
        <div className="absolute top-4 left-4 right-14 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-3">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-2 bg-[#07090E]/92 backdrop-blur-md border border-[#1E2636] flex items-center gap-3 font-mono text-[10px] tracking-[0.14em] uppercase">
              <span className="flex items-center gap-1.5 text-[#00E5FF]">
                <Globe2 className="w-3.5 h-3.5" />
                TERRA // WGS84
              </span>
              <span className="text-[#1E2636]">|</span>
              <span className="text-[#94A3B8]">
                {formatCoord(cameraCoords.lat, cameraCoords.lng)} (Z:{' '}
                {cameraCoords.zoom})
              </span>
            </div>

            <button
              type="button"
              onClick={resetGlobalOrbit}
              className="px-3 py-2 bg-[#07090E]/92 backdrop-blur-md border border-[#1E2636] hover:border-[#00E5FF] font-mono text-[10px] text-[#F1F5F9] hover:text-[#00E5FF] uppercase tracking-[0.14em] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Maximize2 className="w-3 h-3 text-[#00E5FF]" />
              <span>ÓRBITA GLOBAL</span>
            </button>

            <button
              type="button"
              onClick={toggleBasemapStyle}
              className="px-3 py-2 bg-[#07090E]/92 backdrop-blur-md border border-[#1E2636] hover:border-[#00E5FF] font-mono text-[10px] text-[#94A3B8] hover:text-[#00E5FF] uppercase tracking-[0.14em] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Layers className="w-3 h-3 text-[#00E5FF]" />
              <span>
                CAMADA: {basemapType === 'OSM_DARK' ? 'SATÉLITE NOTURNO' : 'VETORIAL ESCURO'}
              </span>
            </button>
          </div>

          <div className="pointer-events-auto px-3 py-2 bg-[#07090E]/92 backdrop-blur-md border border-[#1E2636] flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em]">
            <span className="flex items-center gap-1 text-[#10B981]">
              <span className="w-2 h-2 bg-[#10B981]" /> BAIXO
            </span>
            <span className="flex items-center gap-1 text-[#00E5FF]">
              <span className="w-2 h-2 bg-[#00E5FF]" /> MÉDIO
            </span>
            <span className="flex items-center gap-1 text-[#F59E0B]">
              <span className="w-2 h-2 bg-[#F59E0B]" /> ALTO
            </span>
            <span className="flex items-center gap-1 text-[#F43F5E]">
              <span className="w-2 h-2 bg-[#F43F5E]" /> CRÍTICO
            </span>
          </div>
        </div>

        {/* BARRA DE SALTO RÁPIDO ENTRE CIDADES (EXIBIDA NO MODO TELA CHEIA MAPA GLOBAL) */}
        {mode === 'FULL_MAP' && geolocatedContracts.length > 0 && (
          <div className="absolute top-16 left-4 right-14 z-10 pointer-events-none hidden xl:flex flex-wrap items-center gap-1.5">
            {geolocatedContracts.map((c) => {
              const isSelected = focusedContract?.id === c.id;
              const dotColor = THREAT_COLOR_HEX[c.threatLevel] || '#00E5FF';
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    flyToContract(c);
                  }}
                  className={`pointer-events-auto px-2.5 py-1 border font-mono text-[10px] uppercase tracking-[0.12em] flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#111722] border-[#00E5FF] text-[#F1F5F9]'
                      : 'bg-[#07090E]/85 border-[#1E2636] text-[#94A3B8] hover:border-[#00E5FF]/50 hover:text-[#F1F5F9]'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span>CTR-{String(c.id).padStart(4, '0')}</span>
                  <span className="text-[#64748B]">
                    {(c.locationName || '').split(',')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* BOTTOM HUD OVERLAY FLUTUANTE: CARD DO CONTRATO SELECIONADO NO MAPA (RF-103) */}
        {focusedContract && (
          <div className="absolute bottom-5 left-4 right-4 md:right-auto md:max-w-2xl z-10 pointer-events-none">
            <div className="pointer-events-auto bg-[#0C1017]/95 backdrop-blur-md border border-[#1E2636] p-5 ah-corner-marks shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                    <span className="text-[#00E5FF] font-semibold">
                      CTR-{String(focusedContract.id).padStart(4, '0')}
                    </span>
                    <span className="text-[#1E2636]">|</span>
                    <span className="text-[#94A3B8]">
                      {focusedContract.locationName}
                    </span>
                    <span className="text-[#1E2636]">|</span>
                    <span className="text-[#64748B]">
                      {formatCoord(
                        focusedContract.latitude,
                        focusedContract.longitude
                      )}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-lg text-[#F1F5F9] flex items-center gap-2">
                    {focusedContract.threatLevel === 'PSYCHO' ? (
                      <Skull className="w-4 h-4 text-[#F43F5E] shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    )}
                    {focusedContract.title}
                  </h4>

                  <p className="font-sans text-xs text-[#94A3B8] line-clamp-2">
                    {focusedContract.summary || focusedContract.briefing}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-4 font-mono text-[11px]">
                    <span className="text-[#64748B]">
                      ALVO:{' '}
                      <strong className="text-[#F1F5F9]">
                        {focusedContract.targetName}
                      </strong>
                    </span>
                    <span className="text-[#64748B]">
                      CONTRATANTE:{' '}
                      <strong className="text-[#94A3B8]">
                        {focusedContract.faction}
                      </strong>
                    </span>
                    <span className="text-[#64748B]">
                      RECOMPENSA:{' '}
                      <strong className="text-[#00E5FF]">
                        {new Intl.NumberFormat('pt-BR').format(
                          focusedContract.reward
                        )}{' '}
                        ¢
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Ações diretas no Card Cartográfico */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenDossier(focusedContract);
                    }}
                    className="px-3.5 py-2.5 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF] text-[#F1F5F9] hover:text-[#00E5FF] font-mono text-[11px] uppercase tracking-[0.14em] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>ABRIR DOSSIÊ</span>
                  </button>

                  {onAcceptContract && focusedContract.status === 'AVAILABLE' && (
                    meetsReputation ? (
                      <HoldToAcceptButton
                        onAccept={() => onAcceptContract(focusedContract)}
                        isPsycho={focusedContract.threatLevel === 'PSYCHO'}
                        disabled={acceptingId === focusedContract.id}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenDossier(focusedContract)}
                        className="px-3.5 py-2.5 bg-[#F43F5E]/10 border border-[#F43F5E]/50 text-[#F43F5E] font-mono text-[11px] uppercase tracking-[0.12em] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>EXIGE REP &ge; {minRep}</span>
                      </button>
                    )
                  )}

                  {focusedContract.status !== 'AVAILABLE' && (
                    <span className="px-3 py-2 bg-[#111722] border border-[#1E2636] font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.14em] flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>{focusedContract.status}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TacticalWorldMap;
