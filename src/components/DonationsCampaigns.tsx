import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Megaphone, Plus } from 'lucide-react';
import { useAPI, useMutation } from '../hooks/useAPI';
import { campaignsAPI } from '../services/api';

type Campaign = {
  id: number;
  name: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  status: 'active' | 'completed' | 'upcoming' | 'scheduled' | string;
  donorsCount?: number;
  unitsCollected?: number;
  bloodTypesCollected?: string[];
  eligiblePercent?: number;
  avgWaitMinutes?: number;
};

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === 'active' || s === 'live') return <Badge className="bg-green-100 text-green-700">Active</Badge>;
  if (s === 'completed') return <Badge className="bg-gray-100 text-gray-700">Completed</Badge>;
  if (s === 'upcoming' || s === 'scheduled') return <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function DonationsCampaigns() {
  const [tab, setTab] = useState<'active' | 'completed' | 'upcoming'>('active');

  const { data, loading, error, refetch } = useAPI<Campaign[]>(() => campaignsAPI.getAll(), []);

  const campaigns = useMemo(() => {
    const arr = data || [];
    if (tab === 'active') return arr.filter((c) => c.status?.toLowerCase() === 'active' || c.status?.toLowerCase() === 'live');
    if (tab === 'completed') return arr.filter((c) => c.status?.toLowerCase() === 'completed');
    return arr.filter((c) => ['upcoming', 'scheduled'].includes(c.status?.toLowerCase()));
  }, [data, tab]);

  // Create Campaign: lasciamo un bottone che chiama l'API (se non esiste ti dirà cosa manca)
  const createCampaign = useMutation((payload: Partial<Campaign>) => campaignsAPI.create(payload));

  const onQuickCreate = async () => {
    // Niente dummy mostrato a schermo: questa è solo una chiamata per verificare se l'endpoint esiste.
    // Quando mi passi le tue API, lo allineiamo alla tua struttura (campi obbligatori).
    await createCampaign.mutate({ name: 'New Campaign', status: 'scheduled' } as any);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <span>Donations Campaigns & Mobile Units</span>
          </h1>
          <p className="text-gray-600 mt-1">Gestione carovane (dati da API)</p>
        </div>

        <Button onClick={onQuickCreate} disabled={createCampaign.loading}>
          <Plus className="w-4 h-4 mr-2" />
          {createCampaign.loading ? 'Creazione…' : 'Create Campaign (test endpoint)'}
        </Button>
      </div>

      {(error || createCampaign.error) && (
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">Errore API: {(error || createCampaign.error)?.message}</p>
        </Card>
      )}

      <Card className="p-6 shadow-xl">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {loading && <p className="text-sm text-gray-600">Caricamento…</p>}
            {!loading && campaigns.length === 0 && <p className="text-sm text-gray-600">Nessuna campagna trovata.</p>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {campaigns.map((c) => (
                <div key={c.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg">{c.name}</h3>
                      <p className="text-sm text-gray-600">{c.location || '—'}</p>
                    </div>
                    {statusBadge(c.status)}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Donatori</p>
                      <p className="font-semibold">{c.donorsCount ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Unità raccolte</p>
                      <p className="font-semibold">{c.unitsCollected ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Idonei</p>
                      <p className="font-semibold">{c.eligiblePercent != null ? `${c.eligiblePercent}%` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Attesa media</p>
                      <p className="font-semibold">{c.avgWaitMinutes != null ? `${c.avgWaitMinutes} min` : '—'}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Blood types collected</p>
                    <p className="text-sm">{c.bloodTypesCollected?.length ? c.bloodTypesCollected.join(', ') : '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
