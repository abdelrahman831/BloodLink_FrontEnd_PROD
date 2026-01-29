import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Building2, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useAPI, useMutation } from '../hooks/useAPI';
import { apiCall, hospitalsAPI } from '../services/api';
import { format } from 'date-fns';

type Hospital = {
  id: number;
  name: string;
  region?: string;
};

type RequestItem = {
  id: number;
  hospitalId: number;
  hospitalName?: string;
  bloodType: string;
  component?: string;
  units: number;
  priority?: 'urgent' | 'normal' | string;
  status: 'Pending' | 'Approved' | 'In Transit' | 'Delivered' | 'Failed' | string;
  createdAt?: string;
};

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s.includes('pending')) return <Badge variant="secondary">Pending</Badge>;
  if (s.includes('approved')) return <Badge className="bg-blue-100 text-blue-700">Approved</Badge>;
  if (s.includes('transit')) return <Badge className="bg-yellow-100 text-yellow-700">In Transit</Badge>;
  if (s.includes('delivered')) return <Badge className="bg-green-100 text-green-700">Delivered</Badge>;
  if (s.includes('failed')) return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function HospitalsRequests() {
  const [hospitalId, setHospitalId] = useState<string>('');
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (hospitalId) f.hospitalId = hospitalId;
    if (onlyUrgent) f.priority = 'urgent';
    return f;
  }, [hospitalId, onlyUrgent]);

  const { data: hospitals } = useAPI<Hospital[]>(() => hospitalsAPI.getAll(), []);
  const { data: requests, loading, error, refetch } = useAPI<RequestItem[]>(
    () => hospitalsAPI.getRequests(),
    [hospitalId, onlyUrgent]
  );

  const approve = useMutation((id: any, hospitalId: any) => hospitalsAPI.approveRequest(id, hospitalId));
  const reject = useMutation((id: any, hospitalId: any) => hospitalsAPI.rejectRequest(id, hospitalId));
  const onApprove = async (id: any, hospitalId: any) => {
    await approve.mutate(id, hospitalId);
    refetch();
  };

  const onReject = async (id: any, hospitalId: any) => {
    await reject.mutate(id, hospitalId);
    refetch();
  };



  
        const bloodTypeMap = {
        3 : 'A+', 4: 'A-', 5: 'B+', 6: 'B-',
        7: 'AB+', 8: 'AB-', 1: 'O+', 2: 'O-'
      };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-purple-600" />
          <span>Donation Requests</span>
        </h1>
        <p className="text-gray-600 mt-1">Donation requests from hospitals (data from API)</p>
      </div>
{/* 
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-sm text-gray-700">Hospital</label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {(hospitals || []).map((h) => (
                <option key={h.id} value={String(h.id)}>
                  {h.name}
                </option>
              ))}
            </select>

            <label className="text-sm text-gray-700 flex items-center gap-2">
              <input type="checkbox" checked={onlyUrgent} onChange={(e) => setOnlyUrgent(e.target.checked)} />
              Only urgent
            </label>
          </div>


        </div>
      </Card> */}

      {error && (
        <Card className="p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">Api Error: {error.message}</p>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-700" />
            Requests
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Button variant="outline" onClick={refetch}>
            Refresh
          </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CenterName</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Blood Type</TableHead>
              <TableHead>UserName</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
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

            {!loading && (!requests || requests.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} className="text-sm text-gray-600">
                  Nessuna richiesta.
                </TableCell>
              </TableRow>
            )}

            {(requests || []).map((r) => (
              <TableRow key={r.id}>
              {console.log(r)}
              {console.log(bloodTypeMap[1])}
              
                <TableCell>{r.centerName}</TableCell>
                <TableCell>{format(new Date(r.date),"dd/MM/yyyy")}</TableCell>
                <TableCell>{bloodTypeMap[parseInt(r.bloodType)]}</TableCell>
                <TableCell>{r.userName || '—'}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>{statusBadge(r.status)}</TableCell>
                <TableCell className="text-right space-x-5">
                  <Button
                    size="sm"
                    onClick={() => hospitalsAPI.approveRequest(r.id,r.hospitalId) && refetch }
                    disabled={approve.loading}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={hospitalsAPI.rejectRequest(r.id,r.hospitalId) && refetch }
                    disabled={reject.loading}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
