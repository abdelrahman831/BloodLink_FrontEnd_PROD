import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Building2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useAPI, useMutation } from '../hooks/useAPI';
import { apiCall, hospitalsAPI } from '../services/api';
import { format } from 'date-fns';
import { Check, X } from "lucide-react";
type Hospital = {
  id: number;
  name: string;
  region?: string;
};

type RequestItem = {
  id: number;
  hospitalId: number;
  hospitalName?: string;
  bloodType: number;
  component?: string;
  units: number;
  priority?: 'urgent' | 'normal' | string;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
};



function statusBadge(status: number) {
  const s = status;

  if (s === 0) return <Badge variant="secondary">Pending</Badge>;
  if (s === 1) return <Badge className="bg-blue-100 text-blue-700">Approved</Badge>;
  if (s === 2) return <Badge className="bg-yellow-100 text-yellow-700">In Transit</Badge>;
  if (s === 5) return <Badge className="bg-green-100 text-green-700">Delivered</Badge>;
  if (s === 3) return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function HospitalsRequests() {
  const [hospitalId, setHospitalId] = useState<string>('');
  const [onlyUrgent, setOnlyUrgent] = useState(false);
const [search, setSearch] = useState("");
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { data: hospitals } = useAPI<Hospital[]>(() => hospitalsAPI.getAll(), []);
  const { data: requests, loading, error, refetch } = useAPI<RequestItem[]>(
    () => hospitalsAPI.getRequests(),
    [hospitalId, onlyUrgent]
  );

  const approve = useMutation((id: any, hospitalId: any) => hospitalsAPI.approveRequest(id, hospitalId));
  const reject = useMutation((id: any, hospitalId: any) => hospitalsAPI.rejectRequest(id, hospitalId));
const onApprove = async (id: any, hospitalId: any) => {
  await approve.mutate(id, hospitalId);
  await refetch();
};

const onReject = async (id: any, hospitalId: any) => {
  await reject.mutate(id, hospitalId);
  await refetch();
};

const [pendingAction, setPendingAction] = useState<{ id: number; type: "approve" | "reject" } | null>(null);


const handleSort = (column: string) => {
  if (sortColumn === column) {
    setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
  } else {
    setSortColumn(column);
    setSortDirection("asc");
  }
};

const filteredAndSorted = useMemo(() => {
  let data = [...(requests || [])];

  // 🔎 FILTER
  if (search) {
    const lower = search.toLowerCase();
    data = data.filter(r =>
      r.centerName?.toLowerCase().includes(lower) ||
      r.userName?.toLowerCase().includes(lower) ||
      r.phone?.toLowerCase().includes(lower)
    );
  }

  // 🔼 SORT
  if (sortColumn) {
    data.sort((a, b) => {
      const aVal = (a as any)[sortColumn];
      const bVal = (b as any)[sortColumn];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  return data;
}, [requests, search, sortColumn, sortDirection]);

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (hospitalId) f.hospitalId = hospitalId;
    if (onlyUrgent) f.priority = 'urgent';
    return f;
  }, [hospitalId, onlyUrgent]);

  
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
        <div className="mb-4">
  <input
    type="text"
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border rounded px-3 py-2 w-full md:w-1/3"
  />
</div>


        <Table>
          <TableHeader>
            <TableRow>
             <TableHead onClick={() => handleSort("centerName")} className="cursor-pointer">
  CenterName
</TableHead>

<TableHead onClick={() => handleSort("date")} className="cursor-pointer">
  Date
</TableHead>

<TableHead onClick={() => handleSort("bloodType")} className="cursor-pointer">
  Blood Type
</TableHead>

<TableHead onClick={() => handleSort("userName")} className="cursor-pointer">
  UserName
</TableHead>

<TableHead onClick={() => handleSort("phone")} className="cursor-pointer">
  Phone
</TableHead>

<TableHead onClick={() => handleSort("status")} className="cursor-pointer">
  Status
</TableHead>

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

            {filteredAndSorted.map((r) => (
              <TableRow key={r.id}>
             
             
                <TableCell>{r.centerName}</TableCell>
                <TableCell>{format(new Date(r.date),"dd/MM/yyyy")}</TableCell>
                <TableCell>{bloodTypeMap[parseInt(r.bloodType)]}</TableCell>
                <TableCell>{r.userName || '—'}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>{statusBadge(r.status)}</TableCell>
               <TableCell className="text-right">
  <div className="inline-flex items-center justify-end gap-2">
    <Button
      variant="outline"
      size="sm"
      className="h-9 px-3 gap-2"
      disabled={approve.loading || reject.loading}
      onClick={async () => {
        try {
          setPendingAction({ id: r.id, type: "approve" });
          await onApprove(r.id, r.hospitalId);
        } finally {
          setPendingAction(null);
        }
      }}
    >
      {pendingAction?.id === r.id && pendingAction?.type === "approve" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Check className="h-4 w-4" />
      )}
      <span className="hidden md:inline">Approve</span>
    </Button>

    <Button
      variant="destructive"
      size="sm"
      className="h-9 px-3 gap-2"
      disabled={approve.loading || reject.loading}
      onClick={async () => {
        try {
          setPendingAction({ id: r.id, type: "reject" });
          await onReject(r.id, r.hospitalId);
        } finally {
          setPendingAction(null);
        }
      }}
    >
      {pendingAction?.id === r.id && pendingAction?.type === "reject" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <X className="h-4 w-4" />
      )}
      <span className="hidden md:inline">Reject</span>
    </Button>
  </div>
</TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
