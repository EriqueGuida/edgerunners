import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  ShieldAlert,
  Plus,
  Edit3,
  CheckCircle2,
  MapPin,
  Search,
  RotateCcw,
  Save,
  Activity,
  Database,
  Globe2,
  Wallet,
} from 'lucide-react';
import api from '../services/api';
import {
  fetchAllContractsUnified,
  createLocalContract,
  updateLocalContract,
  updateLocalContractStatus,
} from '../services/contractStore';
import type { Contract, ContractStatus, ThreatLevel } from '../types/contract';
import { soundEngine } from '../utils/sound';

const OSM_ADMIN_PICKER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-admin': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-admin-layer',
      type: 'raster',
      source: 'osm-admin',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const CITY_PRESETS = [
  { label: 'Tóquio', locationName: 'Shinjuku, Tóquio — Japão', region: 'ÁSIA-PACÍFICO', lat: 35.6895, lng: 139.6917 },
  { label: 'São Paulo', locationName: 'Av. Paulista, São Paulo — Brasil', region: 'AMÉRICA LATINA', lat: -23.5614, lng: -46.6559 },
  { label: 'Berlim', locationName: 'Kreuzberg, Berlim — Alemanha', region: 'EUROPA', lat: 52.4986, lng: 13.4033 },
  { label: 'Singapura', locationName: 'Marina Bay, Singapura', region: 'ÁSIA-PACÍFICO', lat: 1.2834, lng: 103.8607 },
  { label: 'Seul', locationName: 'Gangnam, Seul — Coreia do Sul', region: 'ÁSIA-PACÍFICO', lat: 37.4979, lng: 127.0276 },
  { label: 'Zurique', locationName: 'Zurique — Suíça', region: 'EUROPA', lat: 47.3769, lng: 8.5417 },
  { label: 'Nova York', locationName: 'Midtown, Nova York — EUA', region: 'AMÉRICA DO NORTE', lat: 40.7549, lng: -73.984 },
];

export function Admin() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Campos do Formulário de Criação/Edição (RF-110, RF-111)
  const [title, setTitle] = useState('');
  const [targetName, setTargetName] = useState('');
  const [faction, setFaction] = useState('');
  const [reward, setReward] = useState('25000');
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('HIGH');
  const [minReputation, setMinReputation] = useState('5');
  const [locationName, setLocationName] = useState('Shinjuku, Tóquio — Japão');
  const [region, setRegion] = useState('ÁSIA-PACÍFICO');
  const [latitude, setLatitude] = useState<number>(35.6895);
  const [longitude, setLongitude] = useState<number>(139.6917);
  const [summary, setSummary] = useState('');
  const [briefing, setBriefing] = useState('');
  const [objectives, setObjectives] = useState('');

  // Referências para o Seletor Cartográfico Interativo (MapLibre Click-to-Pick)
  const pickerContainerRef = useRef<HTMLDivElement | null>(null);
  const pickerMapRef = useRef<MapLibreMap | null>(null);
  const pickerMarkerRef = useRef<Marker | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAllContractsUnified().then(({ contracts: list }) => {
      if (!cancelled) {
        setContracts(list);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Inicializa o Mapa Seletor de Coordenadas (clique no mapa define latitude/longitude)
  useEffect(() => {
    const container = pickerContainerRef.current;
    if (!container || pickerMapRef.current) return;

    let resizeObserver: ResizeObserver | null = null;

    try {
      const map = new MapLibreMap({
        container,
        style: OSM_ADMIN_PICKER_STYLE,
        center: [139.6917, 35.6895],
        zoom: 2.2,
        attributionControl: false,
      });

      map.addControl(
        new NavigationControl({ showCompass: false, showZoom: true }),
        'top-right'
      );

      const el = document.createElement('div');
      el.style.cssText = `
        width: 24px;
        height: 24px;
        border: 2px solid #00E5FF;
        background: rgba(0, 229, 255, 0.22);
        box-shadow: 0 0 16px #00E5FF;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      const dot = document.createElement('span');
      dot.style.cssText = 'width: 6px; height: 6px; background: #00E5FF; display: block;';
      el.appendChild(dot);

      const marker = new Marker({ element: el, anchor: 'center' })
        .setLngLat([139.6917, 35.6895])
        .addTo(map);

      map.on('click', (e) => {
        soundEngine.playClick();
        const pickedLat = Number(e.lngLat.lat.toFixed(4));
        const pickedLng = Number(e.lngLat.lng.toFixed(4));
        setLatitude(pickedLat);
        setLongitude(pickedLng);
        marker.setLngLat([pickedLng, pickedLat]);
      });

      resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(container);

      pickerMapRef.current = map;
      pickerMarkerRef.current = marker;
    } catch {
      // Ignora caso WebGL não esteja disponível
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      pickerMarkerRef.current?.remove();
      pickerMapRef.current?.remove();
      pickerMapRef.current = null;
    };
  }, []);

  // Atualiza a posição do marcador quando o usuário digita coordenadas ou escolhe preset
  const syncMapPin = (lat: number, lng: number, fly = false) => {
    setLatitude(lat);
    setLongitude(lng);
    pickerMarkerRef.current?.setLngLat([lng, lat]);
    if (fly && pickerMapRef.current) {
      pickerMapRef.current.flyTo({ center: [lng, lat], zoom: 5, speed: 1.4 });
    }
  };

  const resetForm = () => {
    soundEngine.playClick();
    setEditingId(null);
    setTitle('');
    setTargetName('');
    setFaction('');
    setReward('25000');
    setThreatLevel('HIGH');
    setMinReputation('5');
    setLocationName('Shinjuku, Tóquio — Japão');
    setRegion('ÁSIA-PACÍFICO');
    setSummary('');
    setBriefing('');
    setObjectives('');
    syncMapPin(35.6895, 139.6917, false);
  };

  const handleLoadForEdit = (c: Contract) => {
    soundEngine.playClick();
    setEditingId(c.id);
    setTitle(c.title);
    setTargetName(c.targetName);
    setFaction(c.faction);
    setReward(String(c.reward));
    setThreatLevel(c.threatLevel);
    setMinReputation(String(c.minReputation ?? 1));
    setLocationName(c.locationName || '');
    setRegion(c.region || 'GLOBAL');
    setSummary(c.summary || '');
    setBriefing(c.briefing || '');
    setObjectives(c.objectives || '');
    const lat = c.latitude ?? 35.6895;
    const lng = c.longitude ?? 139.6917;
    syncMapPin(lat, lng, true);
  };

  const handleSubmitContract = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      targetName: targetName.trim(),
      faction: faction.trim(),
      reward: Number(reward) || 15000,
      threatLevel,
      minReputation: Math.max(1, Number(minReputation) || 1),
      locationName: locationName.trim() || 'Setor Urbano Classificado',
      region,
      latitude,
      longitude,
      summary: summary.trim() || undefined,
      briefing: briefing.trim() || undefined,
      objectives: objectives.trim() || undefined,
    };

    try {
      if (editingId !== null) {
        try {
          const res = await api.put<Contract>(
            `/api/admin/contracts/${editingId}`,
            payload
          );
          setContracts((prev) =>
            prev.map((c) => (c.id === editingId ? res.data : c))
          );
        } catch {
          const updated = updateLocalContract(editingId, payload);
          if (updated) {
            setContracts((prev) =>
              prev.map((c) => (c.id === editingId ? updated : c))
            );
          }
        }
        setFeedback(
          `CONTRATO CTR-${String(editingId).padStart(4, '0')} ATUALIZADO COM SUCESSO.`
        );
      } else {
        try {
          const res = await api.post<Contract>('/api/admin/contracts', payload);
          setContracts((prev) => [res.data, ...prev]);
        } catch {
          const created = createLocalContract(payload);
          setContracts((prev) => [created, ...prev]);
        }
        setFeedback('NOVO CONTRATO GEOLOCALIZADO PUBLICADO NA REDE.');
      }

      soundEngine.playSuccess();
      resetForm();
      window.setTimeout(() => setFeedback(null), 4000);
    } catch {
      soundEngine.playWarning();
    }
  };

  const handleStatusChange = async (id: number, nextStatus: ContractStatus) => {
    soundEngine.playClick();
    try {
      const res = await api.patch<Contract>(`/api/admin/contracts/${id}/status`, {
        status: nextStatus,
      });
      setContracts((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } catch {
      const updated = updateLocalContractStatus(id, nextStatus);
      if (updated) {
        setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      }
    }
    setFeedback(
      `STATUS DO CONTRATO CTR-${String(id).padStart(4, '0')} ALTERADO PARA ${nextStatus}.`
    );
    window.setTimeout(() => setFeedback(null), 3500);
  };

  const availableCount = contracts.filter((c) => c.status === 'AVAILABLE').length;
  const activeCount = contracts.filter((c) => c.status === 'ACCEPTED').length;
  const completedCount = contracts.filter((c) => c.status === 'COMPLETED').length;
  const totalVolume = contracts
    .filter((c) => c.status === 'COMPLETED')
    .reduce((acc, c) => acc + c.reward, 0);

  const filteredContracts = contracts.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return [c.title, c.targetName, c.faction, c.locationName, c.status]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q);
  });

  return (
    <div className="space-y-8">
      {/* =========================================================
          1. CABEÇALHO & INDICADORES ADMINISTRATIVOS (RF-116)
         ========================================================= */}
      <section className="border border-[#1E2636] bg-[#0C1017] p-6 md:p-8 ah-corner-marks relative overflow-hidden">
        <div className="h-[1px] w-full bg-[#00E5FF] absolute top-0 left-0" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.18em] flex items-center gap-2 mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              DIRECTORATE OVERWATCH // ADM_05
            </span>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-[#F1F5F9] tracking-tight">
              Painel Administrativo &amp; Despacho Geoespacial
            </h1>
            <p className="font-sans text-sm text-[#94A3B8] mt-1">
              Crie ou edite contratos clicando diretamente no mapa da Terra para definir coordenadas WGS84 e monitore todas as operações.
            </p>
          </div>
        </div>

        {/* 4 KPIs Globais da Rede */}
        <div className="mt-6 pt-6 border-t border-[#1E2636] grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#111722] border border-[#1E2636]">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] flex items-center justify-between">
              TOTAL DE CONTRATOS <Database className="w-3.5 h-3.5 text-[#00E5FF]" />
            </span>
            <span className="font-display font-bold text-2xl text-[#F1F5F9] mt-1 block">
              {contracts.length}
            </span>
          </div>

          <div className="p-4 bg-[#111722] border border-[#1E2636]">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] flex items-center justify-between">
              DISPONÍVEIS NA REDE <Globe2 className="w-3.5 h-3.5 text-[#00E5FF]" />
            </span>
            <span className="font-display font-bold text-2xl text-[#00E5FF] mt-1 block">
              {availableCount}
            </span>
          </div>

          <div className="p-4 bg-[#111722] border border-[#1E2636]">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] flex items-center justify-between">
              EM EXECUÇÃO ATIVA <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
            </span>
            <span className="font-display font-bold text-2xl text-[#F59E0B] mt-1 block">
              {activeCount}
            </span>
          </div>

          <div className="p-4 bg-[#111722] border border-[#1E2636]">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-[0.14em] flex items-center justify-between">
              VOLUME LIQUIDADO ({completedCount}) <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
            </span>
            <span className="font-display font-bold text-2xl text-[#10B981] mt-1 block">
              {new Intl.NumberFormat('pt-BR').format(totalVolume)} ¢
            </span>
          </div>
        </div>
      </section>

      {feedback && (
        <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/60 text-[#10B981] font-mono text-xs uppercase tracking-[0.14em] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* =========================================================
          2. FORMULÁRIO DE CRIAÇÃO/EDIÇÃO + MAPA CLICK-TO-PICK (RF-110, RF-111)
         ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Formulário (6 cols) */}
        <section className="xl:col-span-6 bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks">
          <div className="flex items-center justify-between border-b border-[#1E2636] pb-4 mb-5">
            <div>
              <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] flex items-center gap-1.5">
                {editingId ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {editingId
                  ? `EDITANDO CONTRATO // CTR-${String(editingId).padStart(4, '0')}`
                  : 'NOVO DESPACHO DE CONTRATO'}
              </span>
              <h2 className="font-display font-bold text-lg text-[#F1F5F9] mt-0.5">
                {editingId ? 'Editar Parâmetros do Contrato' : 'Cadastrar Novo Contrato'}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF] font-mono text-[10px] text-[#94A3B8] hover:text-[#F1F5F9] uppercase flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>MODO CRIAÇÃO</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitContract} className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1">
                Título da Operação
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Interceptação de Satélite Comercial em Kyūshū"
                className="w-full px-3.5 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-sans text-xs text-[#F1F5F9] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1">
                  Alvo Primário
                </label>
                <input
                  type="text"
                  required
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="Ex: Estação Orbital K-14"
                  className="w-full px-3.5 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-sans text-xs text-[#F1F5F9] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1">
                  Contratante / Corporação
                </label>
                <input
                  type="text"
                  required
                  value={faction}
                  onChange={(e) => setFaction(e.target.value)}
                  placeholder="Ex: Aethelgard Dynamics"
                  className="w-full px-3.5 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-sans text-xs text-[#F1F5F9] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1">
                  Recompensa (¢)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="w-full px-3 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-mono text-xs text-[#F1F5F9] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1">
                  Risco
                </label>
                <select
                  value={threatLevel}
                  onChange={(e) => setThreatLevel(e.target.value as ThreatLevel)}
                  className="w-full px-3 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-mono text-xs text-[#F1F5F9] focus:outline-none"
                >
                  <option value="LOW">BAIXO</option>
                  <option value="MEDIUM">MÉDIO</option>
                  <option value="HIGH">ALTO</option>
                  <option value="PSYCHO">CRÍTICO</option>
                </select>
              </div>
              <div>
                <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1">
                  REP Mínima
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={minReputation}
                  onChange={(e) => setMinReputation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-mono text-xs text-[#F1F5F9] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1">
                  Localização / Cidade
                </label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-sans text-xs text-[#F1F5F9] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1">
                  Região Geográfica
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-mono text-xs text-[#F1F5F9] focus:outline-none"
                >
                  <option value="ÁSIA-PACÍFICO">ÁSIA-PACÍFICO</option>
                  <option value="AMÉRICA LATINA">AMÉRICA LATINA</option>
                  <option value="EUROPA">EUROPA</option>
                  <option value="AMÉRICA DO NORTE">AMÉRICA DO NORTE</option>
                  <option value="ORIENTE MÉDIO & ÁFRICA">ORIENTE MÉDIO &amp; ÁFRICA</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] text-[#00E5FF] uppercase mb-1">
                  Latitude WGS84 (Clique no mapa ao lado)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => syncMapPin(Number(e.target.value), longitude)}
                  className="w-full px-3.5 py-2 bg-[#07090E] border border-[#00E5FF]/50 font-mono text-xs text-[#00E5FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#00E5FF] uppercase mb-1">
                  Longitude WGS84 (Clique no mapa ao lado)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => syncMapPin(latitude, Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-[#07090E] border border-[#00E5FF]/50 font-mono text-xs text-[#00E5FF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1">
                Briefing Tático Completo
              </label>
              <textarea
                rows={2}
                value={briefing}
                onChange={(e) => setBriefing(e.target.value)}
                placeholder="Contexto narrativo e instruções de infiltração..."
                className="w-full px-3.5 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-sans text-xs text-[#F1F5F9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-[#94A3B8] mb-1">
                Objetivos Separados por Ponto e Vírgula (;)
              </label>
              <input
                type="text"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="Ex: Infiltrar perímetro;Extrair chave mestra;Transmitir hash"
                className="w-full px-3.5 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-sans text-xs text-[#F1F5F9] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00E5FF] hover:bg-[#33ECFF] text-[#07090E] font-mono font-semibold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {editingId
                  ? 'SALVAR ALTERAÇÕES DO CONTRATO'
                  : 'PUBLICAR CONTRATO GEOLOCALIZADO'}
              </span>
            </button>
          </form>
        </section>

        {/* Seletor Cartográfico Interativo MapLibre GL JS (6 cols) */}
        <section className="xl:col-span-6 bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks flex flex-col justify-between">
          <div className="border-b border-[#1E2636] pb-3.5 mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                INTERACTIVE COORDINATE PICKER // WGS84
              </span>
              <h2 className="font-display font-bold text-lg text-[#F1F5F9] mt-0.5">
                Clique no Mapa para Definir Latitude &amp; Longitude
              </h2>
            </div>

            <span className="font-mono text-xs text-[#00E5FF] bg-[#111722] border border-[#1E2636] px-2.5 py-1">
              {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
            </span>
          </div>

          {/* Presets rápidos de cidades */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="font-mono text-[10px] text-[#64748B] uppercase mr-1">
              PRESETS:
            </span>
            {CITY_PRESETS.map((city) => (
              <button
                key={city.label}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setLocationName(city.locationName);
                  setRegion(city.region);
                  syncMapPin(city.lat, city.lng, true);
                }}
                className="px-2.5 py-1 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF] font-mono text-[10px] text-[#94A3B8] hover:text-[#00E5FF] uppercase cursor-pointer"
              >
                {city.label}
              </button>
            ))}
          </div>

          {/* Container MapLibre */}
          <div className="relative flex-1 min-h-[380px] border border-[#1E2636] bg-[#07090E] ah-nocturnal-osm overflow-hidden">
            <div ref={pickerContainerRef} className="absolute inset-0 w-full h-full" />
          </div>
        </section>
      </div>

      {/* =========================================================
          3. TABELA DENSA DE GESTÃO DE CONTRATOS & STATUS (RF-112, RF-113)
         ========================================================= */}
      <section className="bg-[#0C1017] border border-[#1E2636] p-6 ah-corner-marks space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2636] pb-4">
          <div>
            <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.16em]">
              GLOBAL OPERATIONS LEDGER
            </span>
            <h2 className="font-display font-bold text-xl text-[#F1F5F9] mt-0.5">
              Monitoramento de Contratos e Disponibilidade ({filteredContracts.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por título, alvo ou status..."
              className="w-full pl-9 pr-3 py-2 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] font-sans text-xs text-[#F1F5F9] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1E2636] text-[#64748B] text-[10px] uppercase tracking-[0.14em]">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">OPERAÇÃO / ALVO</th>
                <th className="py-3 px-3">SETOR (WGS84)</th>
                <th className="py-3 px-3">RISCO</th>
                <th className="py-3 px-3">RECOMPENSA</th>
                <th className="py-3 px-3">STATUS ATUAL</th>
                <th className="py-3 px-3 text-right">CONTROLE ADMIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2636]">
              {filteredContracts.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-[#111722]/60 transition-colors"
                >
                  <td className="py-3.5 px-3 text-[#00E5FF] font-semibold">
                    CTR-{String(c.id).padStart(4, '0')}
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-sans font-semibold text-xs text-[#F1F5F9]">
                      {c.title}
                    </p>
                    <span className="text-[10px] text-[#64748B]">
                      {c.targetName} // {c.faction}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#94A3B8] text-[11px]">
                    {c.locationName || 'Global'}
                    {typeof c.latitude === 'number' && (
                      <span className="block text-[10px] text-[#64748B]">
                        {c.latitude.toFixed(2)}°, {c.longitude?.toFixed(2)}°
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 bg-[#111722] border border-[#1E2636] text-[10px]">
                      {c.threatLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#F1F5F9] font-semibold">
                    {new Intl.NumberFormat('pt-BR').format(c.reward)} ¢
                  </td>
                  <td className="py-3.5 px-3">
                    <select
                      value={c.status}
                      onChange={(e) =>
                        handleStatusChange(c.id, e.target.value as ContractStatus)
                      }
                      aria-label={`Alterar status do contrato ${c.title}`}
                      className="px-2.5 py-1 bg-[#07090E] border border-[#1E2636] focus:border-[#00E5FF] text-[11px] text-[#00E5FF] uppercase cursor-pointer"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleLoadForEdit(c)}
                      className="px-3 py-1.5 bg-[#111722] border border-[#1E2636] hover:border-[#00E5FF] text-[#F1F5F9] hover:text-[#00E5FF] text-[10px] uppercase tracking-[0.12em] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>EDITAR</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Admin;
