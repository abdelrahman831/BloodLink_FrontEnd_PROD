import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Megaphone } from 'lucide-react';
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
  BloodType?: string[];
  HospitalId: string;
};

export function DonationsCampaigns() {
  const [tab, setTab] = useState<'active' | 'completed' | 'upcoming'>('active');

  const hospitalId = localStorage.getItem('hospitalId') ?? '';

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [formData, setFormData] = useState<CampaignCreateDto>({
    Title: '',
    LocationCity: '',
    StartDate: new Date().toISOString().substring(0, 10),
    EndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    Description: '',
    BloodType: [],
    HospitalId: hospitalId,
  });

  const campaignsData = useAPI<Campaign[]>(() => campaignsAPI.getById(hospitalId));

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const bloodTypeToEnum: Record<string, string> = {
    'O+': 'O_p',
    'O-': 'O_n',
    'A+': 'A_p',
    'A-': 'A_n',
    'B+': 'B_p',
    'B-': 'B_n',
    'AB+': 'AB_p',
    'AB-': 'AB_n',
  };

  const createCampaign = useMutation((payload: CampaignCreateDto) => campaignsAPI.create(payload));

  const handleFormChange = (field: keyof Omit<CampaignCreateDto, 'BloodType' | 'HospitalId'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleBloodType = (type: string) => {
    setFormData((prev) => {
      const current = prev.BloodType ?? [];
      return {
        ...prev,
        BloodType: current.includes(type)
          ? current.filter((item) => item !== type)
          : [...current, type],
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');

    if (!hospitalId) {
      return;
    }

    const payload: CampaignCreateDto = {
      ...formData,
      HospitalId: hospitalId,
      StartDate: new Date(formData.StartDate).toISOString(),
      EndDate: new Date(formData.EndDate).toISOString(),
      BloodType: formData.BloodType?.length
        ? formData.BloodType.map((type) => bloodTypeToEnum[type] ?? 'None')
        : undefined,
    };

    const created = await createCampaign.mutate(payload);

    if (created) {
      setSuccessMessage('Campagna creata con successo.');
      campaignsData.refetch();
      setFormData((prev) => ({
        ...prev,
        Title: '',
        LocationCity: '',
        Description: '',
        BloodType: [],
      }));
    }
  };

  console.log('Fetched campaigns:', campaignsData);

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

      </div>

      <Card className="p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Crea nuova campagna</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium">Titolo</span>
              <Input
                value={formData.Title}
                onChange={(event) => handleFormChange('Title', event.target.value)}
                placeholder="Nome campagna"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Città</span>
              <Input
                value={formData.LocationCity}
                onChange={(event) => handleFormChange('LocationCity', event.target.value)}
                placeholder="Milano"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium">Data inizio</span>
              <Input
                type="date"
                value={formData.StartDate}
                onChange={(event) => handleFormChange('StartDate', event.target.value)}
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Data fine</span>
              <Input
                type="date"
                value={formData.EndDate}
                onChange={(event) => handleFormChange('EndDate', event.target.value)}
                required
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium">Descrizione</span>
            <Textarea
              value={formData.Description}
              onChange={(event) => handleFormChange('Description', event.target.value)}
              placeholder="Descrivi brevemente la campagna"
              required
            />
          </label>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Tipi di sangue</legend>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {bloodTypes.map((type) => (
                <label key={type} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.BloodType?.includes(type) ?? false}
                    onChange={() => toggleBloodType(type)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={createCampaign.loading || !hospitalId}>
              {createCampaign.loading ? 'Creazione…' : 'Crea campagna'}
            </Button>
            {successMessage ? (
              <p className="text-sm text-green-700">{successMessage}</p>
            ) : null}
            {!hospitalId ? (
              <p className="text-sm text-orange-600">HospitalId mancante. Verifica le impostazioni di autenticazione.</p>
            ) : null}
          </div>
        </form>
      </Card>

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
