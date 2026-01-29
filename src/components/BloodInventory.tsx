import { Card } from './ui/card';
import { Droplet, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { useAPI } from '../hooks/useAPI';
import { inventoryAPI } from '../services/api';

type InventoryItem = {
  bloodType: string;
  unitsAvailable: number;
  expiringSoon: number;
  averageDemand?: number;
  status?: 'adequate' | 'low' | 'critical' | string;
  fillPercentage?: number;
};

function statusBadge(status?: string) {
  const s = (status || '').toLowerCase();
  if (s === 'critical') return <Badge variant="destructive">Critical</Badge>;
  if (s === 'low') return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Low</Badge>;
  if (s === 'adequate' || s === 'safe') return <Badge className="bg-green-100 text-green-700">Adequate</Badge>;
  return <Badge variant="outline">—</Badge>;
}

export function BloodInventory() {
  const { data, loading, error } = useAPI<InventoryItem[]>(() => inventoryAPI.getAll(), []);

  const totalUnits = (data || []).reduce((sum, item) => sum + (item.unitsAvailable || 0), 0);
  const totalExpiring = (data || []).reduce((sum, item) => sum + (item.expiringSoon || 0), 0);
  const criticalTypes = (data || []).filter((item) => {
    const s = (item.status || '').toLowerCase();
    return s === 'critical' || s === 'low';
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Droplet className="w-6 h-6 text-blue-500" />
          <span>Blood Inventory</span>
        </h1>
        <p className="text-gray-600 mt-1">Tabella inventario (dati da API)</p>
      </div>

      {error && (
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">Errore API: {error.message}</p>
        </Card>
      )}

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Units</p>
              <h3 className="mt-1 text-2xl font-bold">{loading ? '—' : totalUnits.toLocaleString()}</h3>
            </div>
            <Droplet className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Expiring Soon</p>
              <h3 className="mt-1 text-2xl font-bold">{loading ? '—' : totalExpiring}</h3>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low/Critical Types</p>
              <h3 className="mt-1 text-2xl font-bold">{loading ? '—' : criticalTypes}</h3>
            </div>
            <CheckCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-4">Inventory</h3>

        {loading && <p className="text-sm text-gray-600">Caricamento…</p>}
        {!loading && (!data || data.length === 0) && <p className="text-sm text-gray-600">Nessun dato disponibile.</p>}

        {!!data?.length && (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Expiring Soon</TableHead>
                  <TableHead>Avg Demand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fill %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.bloodType}>
                    <TableCell className="font-bold">{item.bloodType}</TableCell>
                    <TableCell>{item.unitsAvailable}</TableCell>
                    <TableCell>{item.expiringSoon}</TableCell>
                    <TableCell>{item.averageDemand ?? '—'}</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-28">
                          <Progress value={item.fillPercentage ?? 0} />
                        </div>
                        <span className="text-sm text-gray-600">{item.fillPercentage ?? 0}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
