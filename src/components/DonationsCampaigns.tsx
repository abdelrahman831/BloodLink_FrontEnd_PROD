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
  title: string;
  locationCity?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'upcoming' | 'scheduled' | string;
  possibleDonorsCount?: number;
  hospitalId?: number;
  unitsCollected?: number;
  bloodTypesCollected?: string[];
  eligiblePercent?: number;
  avgWaitMinutes?: number;
};

type CampaignCreateDto = {
  Title: string;
  LocationCity: string;
  StartDate: string;
  EndDate: string;
  Description: string;
  BloodType?: Array<string | null>;
  HospitalId: string;
};

export function DonationsCampaigns() {
  const [tab, setTab] = useState<'active' | 'completed' | 'upcoming'>('active');

  const hospitalId = localStorage.getItem('hospitalId') ?? '';

  const campaignsData = useAPI<Campaign[]>(() => campaignsAPI.getById(hospitalId));

  console.log('Fetched campaigns:', campaignsData);
      
  // const campaigns = useMemo(() => {
  //   const arr = campaignsData || [];
  //   if (tab === 'active') return arr.filter((c) => c.status?.toLowerCase() === 'active' || c.status?.toLowerCase() === 'live');
  //   if (tab === 'completed') return arr.filter((c) => c.status?.toLowerCase() === 'completed');
  //   return arr.filter((c) => ['upcoming', 'scheduled'].includes(c.status?.toLowerCase()));
  // }, [campaignsData, tab]);

  // Create Campaign: usiamo il DTO backend per inviare i campi corretti.
  const createCampaign = useMutation((payload: CampaignCreateDto) => campaignsAPI.create(payload));

  const onQuickCreate = async () => {
    if (!hospitalId) {
      console.error('Missing hospitalId, impossible creare la campagna.');
      return;
    }

    const payload: CampaignCreateDto = {
      Title: 'Donor Drive: Emergency Blood Mobile Unit',
      LocationCity: 'Milano',
      StartDate: new Date().toISOString(),
      EndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      Description: 'Campagna di donazione sangue organizzata in partnership con l’ospedale locale.',
      BloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      HospitalId: hospitalId,
    };

    await createCampaign.mutate(payload);
    campaignsData.refetch();
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

      {(createCampaign.error) && (
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">Errore API: {(createCampaign.error as any )?.message}</p>
        </Card>
      )}

      <Card className="p-6 shadow-xl">
        <Tabs value={tab}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {campaignsData.loading && <p className="text-sm text-gray-600">Loading...</p>}
            {!campaignsData.loading && campaignsData.data && campaignsData.data.length === 0 && <p className="text-sm text-gray-600">Nessuna campagna trovata.</p>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {campaignsData.data?.map((c) => (
                <div key={c.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg">{c.title}</h3>
                      <p className="text-sm text-gray-600">{c.locationCity || '—'}</p>
                    </div>
                    {/* {statusBadge(c.status)} */}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Donors</p>
                      <p className="font-semibold">{c.possibleDonorsCount ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Units collected</p>
                      <p className="font-semibold">{c.unitsCollected ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Eligible %</p>
                      <p className="font-semibold">{c.eligiblePercent != null ? `${c.eligiblePercent}%` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Average wait time</p>
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
