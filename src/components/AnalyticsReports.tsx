import { Card } from './ui/card';
import { BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAPI } from '../hooks/useAPI';
import { analyticsAPI } from '../services/api';

type MonthlyPoint = { month: string; donations: number; consumption: number; wastage?: number };

type BloodTypePoint = { bloodType: string; count: number };

type AgeGroupPoint = { ageGroup: string; count: number };

export function AnalyticsReports() {
  const { data: monthly, loading: mLoading, error: mError } = useAPI<MonthlyPoint[]>(
    () => analyticsAPI.getMonthlyData(),
    []
  );
  const { data: bloodTypes, loading: bLoading, error: bError } = useAPI<BloodTypePoint[]>(
    () => analyticsAPI.getBloodTypeDistribution(),
    []
  );
  const { data: ages, loading: aLoading, error: aError } = useAPI<AgeGroupPoint[]>(
    () => analyticsAPI.getDonorAgeGroups(),
    []
  );

  const error = mError || bError || aError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BarChart3 className="w-6 h-6 text-indigo-500" />
          <span>Analytics & Reports</span>
        </h1>
        <p className="text-gray-600 mt-1">Grafici caricati da API</p>
      </div>

      {error && (
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">Errore API: {error.message}</p>
        </Card>
      )}

      <Card className="p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-2">Monthly Trend</h3>
        {mLoading && <p className="text-sm text-gray-600">Caricamento…</p>}
        {!mLoading && (!monthly || monthly.length === 0) && <p className="text-sm text-gray-600">Nessun dato disponibile.</p>}

        {!!monthly?.length && (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="donations" name="Donations" />
                <Bar dataKey="consumption" name="Consumption" />
                {'wastage' in (monthly?.[0] || {}) ? <Bar dataKey="wastage" name="Wastage" /> : null}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-2">Blood Type Distribution</h3>
          {bLoading && <p className="text-sm text-gray-600">Caricamento…</p>}
          {!bLoading && (!bloodTypes || bloodTypes.length === 0) && <p className="text-sm text-gray-600">Nessun dato disponibile.</p>}

          {!!bloodTypes?.length && (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bloodTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bloodType" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-2">Donor Age Groups</h3>
          {aLoading && <p className="text-sm text-gray-600">Caricamento…</p>}
          {!aLoading && (!ages || ages.length === 0) && <p className="text-sm text-gray-600">Nessun dato disponibile.</p>}

          {!!ages?.length && (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
