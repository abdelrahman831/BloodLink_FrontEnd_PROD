import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Droplet, MapPin, Search } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAPI } from '../hooks/useAPI';
import { dashboardAPI } from '../services/api';

type ConsumptionPoint = {
  day: string;
  consumption: number;
  donations: number;
};

type BloodTypeDonation = {
  bloodType: string;
  count: number;
};

type Hospital = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status?: string; // adequate | low | critical (opzionale)
  inventory?: number; // percentuale o units (dipende dal backend)
  bloodTypes?: string[];
  address?: string;
  openRequests?: number;
};

type DashboardStats = {
  totalUnitsAvailable?: number;
  openUrgentRequests?: number;
  expiringSoonPercent?: number;
  avgResponseTimeHours?: number;
  campaignsToday?: number;
  campaignsThisWeek?: number;
};

const bloodTypeOptions = ['A+', 'O+', 'B+', 'AB+', 'A-', 'O-', 'B-', 'AB-'];

function StatusPill({ status }: { status?: string }) {
  const s = (status || '').toLowerCase();
  if (s === 'adequate' || s === 'safe') return <span className="px-2 py-1 rounded-md text-white text-xs font-bold" style={{ backgroundColor: '#10b981' }}>✅ Adequate</span>;
  if (s === 'low' || s === 'medium') return <span className="px-2 py-1 rounded-md text-white text-xs font-bold" style={{ backgroundColor: '#f59e0b' }}>⚠️ Low</span>;
  if (s === 'critical' || s === 'severe') return <span className="px-2 py-1 rounded-md text-white text-xs font-bold" style={{ backgroundColor: '#ef4444' }}>🚨 Critical</span>;
  return <span className="px-2 py-1 rounded-md text-gray-700 text-xs font-semibold bg-gray-100">—</span>;
}

export function DashboardOverview() {
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);

  const { data: stats, loading: statsLoading, error: statsError } = useAPI<DashboardStats>(
    () => dashboardAPI.getStats(),
    []
  );

  const { data: trendData, loading: trendLoading, error: trendError } = useAPI<ConsumptionPoint[]>(
    () => dashboardAPI.getDailyConsumption(),
    []
  );

  const { data: weekly, loading: weeklyLoading, error: weeklyError } = useAPI<BloodTypeDonation[]>(
    () => dashboardAPI.getWeeklyDonations(),
    []
  );

  const { data: hospitals, loading: hospitalsLoading, error: hospitalsError } = useAPI<Hospital[]>(
    () => dashboardAPI.getHospitals(),
    []
  );

  const filteredHospitals = useMemo(() => {
    if (!hospitals) return [];
    if (!selectedBloodType) return hospitals;
    return hospitals.filter((h) => (h.bloodTypes || []).includes(selectedBloodType));
  }, [hospitals, selectedBloodType]);

  const mapUrl = useMemo(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key) return null;

    const selected = selectedHospitalId ? filteredHospitals.find((h) => h.id === selectedHospitalId) : null;
    if (selected?.lat && selected?.lng) {
      return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${selected.lat},${selected.lng}&zoom=15`;
    }
    return `https://www.google.com/maps/embed/v1/place?key=${key}&q=Cairo,Egypt&zoom=11`;
  }, [filteredHospitals, selectedHospitalId]);

  const anyError = statsError || trendError || weeklyError || hospitalsError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span>Dashboard Overview</span>
          <Droplet className="w-8 h-8 text-red-500" />
        </h1>
        <p className="text-gray-600 mt-2">Panoramica live (solo dati da API — niente dummy)</p>
      </div>

      {anyError && (
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700 font-semibold">Errore nel caricamento dati.</p>
          <p className="text-xs text-red-600 mt-1">
            {String(anyError.message || anyError)}
          </p>
        </Card>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600">Unità disponibili</p>
          <p className="text-2xl font-bold mt-1">{statsLoading ? '…' : (stats?.totalUnitsAvailable ?? '—')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600">Urgenti aperte</p>
          <p className="text-2xl font-bold mt-1">{statsLoading ? '…' : (stats?.openUrgentRequests ?? '—')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600">Scadenza vicina %</p>
          <p className="text-2xl font-bold mt-1">{statsLoading ? '…' : (stats?.expiringSoonPercent ?? '—')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600">Tempo risposta medio (h)</p>
          <p className="text-2xl font-bold mt-1">{statsLoading ? '…' : (stats?.avgResponseTimeHours ?? '—')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600">Carovane oggi</p>
          <p className="text-2xl font-bold mt-1">{statsLoading ? '…' : (stats?.campaignsToday ?? '—')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600">Carovane settimana</p>
          <p className="text-2xl font-bold mt-1">{statsLoading ? '…' : (stats?.campaignsThisWeek ?? '—')}</p>
        </Card>
      </div>

      {/* Blood type filter */}
      <Card className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-900">Filtra per gruppo sanguigno</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBloodType('')}
              className={`px-5 py-2.5 rounded-lg font-bold transition-all ${
                selectedBloodType === ''
                  ? 'bg-red-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-red-100 border-2 border-gray-200'
              }`}
            >
              Tutti
            </button>
            {bloodTypeOptions.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedBloodType(type)}
                className={`px-5 py-2.5 rounded-lg font-bold transition-all ${
                  selectedBloodType === type
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-red-100 border-2 border-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {selectedBloodType && (
            <div className="p-4 bg-white rounded-lg border-2 border-red-300 shadow-sm">
              <p className="text-base text-gray-800">
                <span className="font-bold text-red-700 text-lg">{hospitalsLoading ? '…' : filteredHospitals.length}</span>
                {' '}strutture hanno{' '}
                <span className="font-bold text-red-800 text-lg">{selectedBloodType}</span>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Map + hospitals */}
      <Card className="p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Ospedali / Blood Banks
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {hospitalsLoading && <p className="text-sm text-gray-600">Caricamento…</p>}
            {!hospitalsLoading && filteredHospitals.length === 0 && (
              <p className="text-sm text-gray-600">Nessun risultato.</p>
            )}
            {filteredHospitals.map((h) => (
              <button
                type="button"
                key={h.id}
                onClick={() => setSelectedHospitalId(h.id === selectedHospitalId ? null : h.id)}
                className={`w-full text-left p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                  selectedHospitalId === h.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900">{h.name}</h4>
                    {h.address && <p className="text-sm text-gray-600 mt-1">{h.address}</p>}
                  </div>
                  <div className="ml-3">
                    <StatusPill status={h.status} />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-700">
                  {typeof h.inventory === 'number' && <span><b>Stock:</b> {h.inventory}</span>}
                  {typeof h.openRequests === 'number' && <span><b>Open req:</b> {h.openRequests}</span>}
                  {(h.bloodTypes?.length ?? 0) > 0 && (
                    <span className="truncate"><b>Types:</b> {h.bloodTypes!.join(', ')}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden border bg-white">
            {!mapUrl ? (
              <div className="p-6">
                <p className="text-sm text-gray-700 font-semibold">Mappa non configurata.</p>
                <p className="text-xs text-gray-600 mt-1">
                  Aggiungi <code className="px-1 bg-gray-100 rounded">VITE_GOOGLE_MAPS_API_KEY</code> nel tuo <code className="px-1 bg-gray-100 rounded">.env</code>.
                </p>
              </div>
            ) : (
              <iframe
                title="Map"
                key={String(selectedHospitalId ?? 'all')}
                src={mapUrl}
                width="100%"
                height="500"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Trends */}
      <Card className="p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Consumi vs Donazioni</h3>
        </div>

        {trendLoading && <p className="text-sm text-gray-600">Caricamento…</p>}
        {!trendLoading && (!trendData || trendData.length === 0) && (
          <p className="text-sm text-gray-600">Nessun dato trend disponibile.</p>
        )}

        {!!trendData?.length && (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="consumption" name="Consumption" fillOpacity={0.2} />
                <Area type="monotone" dataKey="donations" name="Donations" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Weekly donations */}
      <Card className="p-6 shadow-xl">
        <h3 className="text-xl font-bold">Donazioni settimanali per gruppo</h3>
        {weeklyLoading && <p className="text-sm text-gray-600 mt-2">Caricamento…</p>}
        {!weeklyLoading && (!weekly || weekly.length === 0) && (
          <p className="text-sm text-gray-600 mt-2">Nessun dato disponibile.</p>
        )}

        {!!weekly?.length && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {weekly.map((w) => (
              <div key={w.bloodType} className="p-3 rounded-lg border bg-white">
                <p className="text-sm text-gray-600">{w.bloodType}</p>
                <p className="text-xl font-bold">{w.count}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
