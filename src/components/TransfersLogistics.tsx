import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Truck } from 'lucide-react';
import { useAPI, useMutation } from '../hooks/useAPI';
import { transfersAPI } from '../services/api';

type Transfer = {
  id: string;
  from?: string;
  to?: string;
  bloodType?: string;
  component?: string;
  units?: number;
  status: string; // In Transit | Delayed | Delivered ...
  temperature?: number;
  updatedAt?: string;
};

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s.includes('delivered')) return <Badge className="bg-green-100 text-green-700">Delivered</Badge>;
  if (s.includes('delayed')) return <Badge className="bg-red-100 text-red-700">Delayed</Badge>;
  if (s.includes('transit')) return <Badge className="bg-yellow-100 text-yellow-700">In Transit</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function TransfersLogistics() {
  const { data, loading, error, refetch } = useAPI<Transfer[]>(() => transfersAPI.getAll(), []);

  const updateStatus = useMutation((params: { id: string; status: string }) =>
    transfersAPI.updateStatus(params.id, params.status)
  );

  const [changingId, setChangingId] = useState<string | null>(null);

  const setStatus = async (id: string, status: string) => {
    setChangingId(id);
    await updateStatus.mutate({ id, status });
    setChangingId(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Truck className="w-6 h-6 text-orange-500" />
          <span>Transfers & Logistics</span>
        </h1>
        <p className="text-gray-600 mt-1">Trasferimenti e tracking (dati da API)</p>
      </div>

      {error && (
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">Errore API: {error.message}</p>
        </Card>
      )}

      <Card className="p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-xl font-bold">Transfer Orders</h3>
          <Button variant="outline" onClick={refetch} disabled={loading}>
            Refresh
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Blood</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Temp (°C)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-gray-600">
                    Caricamento…
                  </TableCell>
                </TableRow>
              )}

              {!loading && (!data || data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-gray-600">
                    Nessun trasferimento.
                  </TableCell>
                </TableRow>
              )}

              {(data || []).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell>{t.from || '—'}</TableCell>
                  <TableCell>{t.to || '—'}</TableCell>
                  <TableCell>
                    {t.bloodType ? `${t.bloodType}${t.component ? ` • ${t.component}` : ''}` : '—'}
                  </TableCell>
                  <TableCell>{typeof t.units === 'number' ? t.units : '—'}</TableCell>
                  <TableCell>{statusBadge(t.status)}</TableCell>
                  <TableCell>{typeof t.temperature === 'number' ? t.temperature : '—'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={changingId === t.id}
                      onClick={() => setStatus(t.id, 'In Transit')}
                    >
                      In Transit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={changingId === t.id}
                      onClick={() => setStatus(t.id, 'Delivered')}
                    >
                      Delivered
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={changingId === t.id}
                      onClick={() => setStatus(t.id, 'Delayed')}
                    >
                      Delayed
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
