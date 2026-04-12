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
  BloodType?: number[];
  HospitalId: string;
};

type CampaignFormState = Omit<CampaignCreateDto, 'BloodType'> & {
  BloodType: string[];
};

export function DonationsCampaigns() {
  const [tab, setTab] = useState<'active' | 'completed' | 'upcoming'>('active');

  const hospitalId = localStorage.getItem('hospitalId') ?? '';

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [formData, setFormData] = useState<CampaignFormState>({
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

  const bloodTypeToEnum: Record<string, number> = {
    'O+': 1,
    'O-': 2,
    'A+': 3,
    'A-': 4,
    'B+': 5,
    'B-': 6,
    'AB+': 7,
    'AB-': 8,
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
      Title: formData.Title,
      LocationCity: formData.LocationCity,
      StartDate: new Date(formData.StartDate).toISOString(),
      EndDate: new Date(formData.EndDate).toISOString(),
      Description: formData.Description,
      BloodType: formData.BloodType?.length
        ? formData.BloodType.map((type) => bloodTypeToEnum[type] ?? 0)
        : undefined,
      HospitalId: hospitalId,
    };

    const created = await createCampaign.mutate(payload);

    if (created) {
      setSuccessMessage('Campaign created successfully.');
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
          <p className="text-gray-600 mt-1">Manage mobile units and campaigns (API data)</p>
        </div>

      </div>

      <Card className="p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Create new campaign</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium">Title</span>
              <Input
                value={formData.Title}
                onChange={(event) => handleFormChange('Title', event.target.value)}
                placeholder="Campaign name"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">City</span>
              <Input
                value={formData.LocationCity}
                onChange={(event) => handleFormChange('LocationCity', event.target.value)}
                placeholder="Milan"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium">Start date</span>
              <Input
                type="date"
                value={formData.StartDate}
                onChange={(event) => handleFormChange('StartDate', event.target.value)}
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">End date</span>
              <Input
                type="date"
                value={formData.EndDate}
                onChange={(event) => handleFormChange('EndDate', event.target.value)}
                required
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium">Description</span>
            <Textarea
              value={formData.Description}
              onChange={(event) => handleFormChange('Description', event.target.value)}
              placeholder="Briefly describe the campaign"
              required
            />
          </label>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Blood types</legend>
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
              {createCampaign.loading ? 'Creating…' : 'Create campaign'}
            </Button>
            {successMessage ? (
              <p className="text-sm text-green-700">{successMessage}</p>
            ) : null}
            {!hospitalId ? (
              <p className="text-sm text-orange-600">Missing hospitalId. Check authentication settings.</p>
            ) : null}
          </div>
        </form>
      </Card>

      {(createCampaign.error) && (
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">API Error: {(createCampaign.error as any )?.message}</p>
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
            {!campaignsData.loading && campaignsData.data && campaignsData.data.length === 0 && <p className="text-sm text-gray-600">No campaigns found.</p>}

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
