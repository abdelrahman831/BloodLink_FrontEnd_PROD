import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Settings, User, Bell } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { useAPI, useMutation } from '../hooks/useAPI';
import { settingsAPI } from '../services/api';

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
};

type Notifications = {
  urgentRequests: boolean;
  lowStock: boolean;
  campaignUpdates: boolean;
  dailyReports: boolean;
};

export function SettingsPage() {
  const { data: profile, loading: pLoading, error: pError } = useAPI<Profile>(() => settingsAPI.getProfile(), []);
  const { data: notif, loading: nLoading, error: nError, refetch: refetchNotif } = useAPI<Notifications>(
    () => settingsAPI.getNotifications(),
    []
  );

  const saveProfile = useMutation((payload: Profile) => settingsAPI.updateProfile(payload));
  const saveNotif = useMutation((payload: Notifications) => settingsAPI.updateNotifications(payload));

  const [form, setForm] = useState<Profile>({ firstName: '', lastName: '', email: '' });
  const [localNotif, setLocalNotif] = useState<Notifications>({
    urgentRequests: false,
    lowStock: false,
    campaignUpdates: false,
    dailyReports: false,
  });

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  useEffect(() => {
    if (notif) setLocalNotif(notif);
  }, [notif]);

  const error = pError || nError;

  const onSaveProfile = async () => {
    await saveProfile.mutate(form);
  };

  const onToggle = async (key: keyof Notifications, value: boolean) => {
    const next = { ...localNotif, [key]: value };
    setLocalNotif(next);
    await saveNotif.mutate(next);
    refetchNotif();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Settings className="w-6 h-6 text-gray-500" />
          <span>Settings</span>
        </h1>
        <p className="text-gray-600 mt-1">Impostazioni account e notifiche (dati da API)</p>
      </div>

      {error && (
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">Errore API: {error.message}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-bold">Profile</h3>
          </div>

          {pLoading ? (
            <p className="text-sm text-gray-600">Caricamento…</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone || ''}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Job Title</Label>
                <Input
                  id="position"
                  value={form.position || ''}
                  onChange={(e) => setForm((s) => ({ ...s, position: e.target.value }))}
                />
              </div>

              <Button onClick={onSaveProfile} disabled={saveProfile.loading}>
                {saveProfile.loading ? 'Salvataggio…' : 'Save Changes'}
              </Button>
            </div>
          )}
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-bold">Notification Settings</h3>
          </div>

          {nLoading ? (
            <p className="text-sm text-gray-600">Caricamento…</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Urgent Request Notifications</p>
                  <p className="text-sm text-gray-500">Alert istantaneo per richieste urgenti</p>
                </div>
                <Switch checked={localNotif.urgentRequests} onCheckedChange={(v) => onToggle('urgentRequests', v)} />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p>Low Stock Alerts</p>
                  <p className="text-sm text-gray-500">Alert quando lo stock scende sotto soglia</p>
                </div>
                <Switch checked={localNotif.lowStock} onCheckedChange={(v) => onToggle('lowStock', v)} />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p>Campaign Updates</p>
                  <p className="text-sm text-gray-500">Aggiornamenti su risultati campagne</p>
                </div>
                <Switch checked={localNotif.campaignUpdates} onCheckedChange={(v) => onToggle('campaignUpdates', v)} />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p>Daily Reports</p>
                  <p className="text-sm text-gray-500">Riassunto giornaliero via email</p>
                </div>
                <Switch checked={localNotif.dailyReports} onCheckedChange={(v) => onToggle('dailyReports', v)} />
              </div>

              {saveNotif.error && <p className="text-sm text-red-600">Errore salvataggio: {saveNotif.error.message}</p>}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
