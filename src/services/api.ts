// API Configuration
const API_BASE_URL = 'https://bloodlinkdemo-production.up.railway.app/api';

// Helper function for API calls
type ApiError = {
  status: number;
  message: string;
  raw?: string;
};

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";

  // Prova a leggere JSON solo se Content-Type è JSON
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      // JSON malformato anche se dichiarato JSON
      const raw = await res.text().catch(() => "");
      throw { status: res.status, message: "Risposta JSON non valida dal server.", raw } as ApiError;
    }
  }

  // Altrimenti leggi testo (plain/HTML)
  const raw = await res.text().catch(() => "");
  return { raw };
}

export async function apiCall<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Se stai mandando JSON nel body, imposta content-type
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await parseResponse(res);
  
  
  if (!res.ok) {
    // Prova a leggere un "message" se arriva JSON
    const message =
      (data as any)?.message ||
      (data as any)?.raw ||
      `Errore HTTP ${res.status}`;

    // Mappatura errori "user-friendly"
    let friendly = message;
    if (res.status === 401) friendly = "Credenziali non corrette.";
    if (res.status === 404) friendly = "Utente non trovato o endpoint inesistente.";
    //if (res.status >= 500) friendly = "Errore interno del server. Controlla i log backend.";

    const err: ApiError = { status: res.status, message: friendly, raw: (data as any)?.raw };
    throw err;
  }

  // Se ok ma non JSON, torna raw (puoi anche vietarlo)
  if ((data as any)?.raw !== undefined) {
    throw { status: res.status, message: "Il server ha risposto OK ma non JSON.", raw: (data as any).raw } as ApiError;
  }

  return data as T;
}


// Dashboard APIs
export const dashboardAPI = {
  getStats: () => apiCall('/dashboard/stats'),
  getDailyConsumption: () => apiCall('/dashboard/consumption'),
  getWeeklyDonations: () => apiCall('/dashboard/donations/weekly'),
  getHospitals: () => apiCall('/dashboard/hospitals'),
};

// Blood Inventory APIs
export const inventoryAPI = {
  // Ottieni l'inventario per un ospedale specifico
  getHospitalId: () => localStorage.getItem('hospitalId'),

  getAll: (id: any) => apiCall(`/BloodUnits/${id}`),
  getStats: (id: any) => apiCall(`/BloodUnits/stats/${id}`),
  getByType: (bloodType: string) => apiCall(`/BloodUnits/${bloodType}`),
  update: (bloodType: string, data: any) => 
    apiCall(`/BloodUnits/${bloodType}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Hospitals & Requests APIs
export const hospitalsAPI = {
  getAll: () => apiCall('/hospitals'),
  getRequests: (filters?: any) => {
    const queryParams = filters ? `?${new URLSearchParams(filters)}` : '';
    return apiCall(`/Appointments/Hospital${queryParams}`);
  },
  approveRequest: (id: any, hospitalId: any) => 
    apiCall(`/Appointments/${id}/accept`, {
      method: 'POST', body: JSON.stringify({ hospitalId ,id}),
    }),
  rejectRequest: (id : any, hospitalId: any) => 
    apiCall(`/Appointments/${id}/reject`, {
      method: 'POST', body: JSON.stringify({ hospitalId ,id}),
      
    }),
};

// Donations & Campaigns APIs
export const campaignsAPI = {
  getAll: () => apiCall('/campaigns'),
  getById: (id: number) => apiCall(`/campaigns/${id}`),
  create: (data: any) => 
    apiCall('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) => 
    apiCall(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => 
    apiCall(`/campaigns/${id}`, {
      method: 'DELETE',
    }),
};

// Transfers & Logistics APIs
export const transfersAPI = {
  getAll: () => apiCall('/transfers'),
  getById: (id: string) => apiCall(`/transfers/${id}`),
  create: (data: any) => 
    apiCall('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: string) => 
    apiCall(`/transfers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Analytics & Reports APIs
export const analyticsAPI = {
  getMonthlyData: () => apiCall('/analytics/monthly'),
  getBloodTypeDistribution: () => apiCall('/analytics/blood-types'),
  getDonorAgeGroups: () => apiCall('/analytics/donors/age-groups'),
  exportReport: (type: string, period: string) => 
    apiCall(`/analytics/export?type=${type}&period=${period}`),
};

// Auth APIs
export const authAPI = {
  login: (email: string, password: string, loginType: any) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, loginType }),
    }),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => apiCall('/auth/me'),
};

// Settings APIs
export const settingsAPI = {
  getProfile: () => apiCall('/settings/profile'),
  updateProfile: (data: any) => 
    apiCall('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updatePassword: (currentPassword: string, newPassword: string) => 
    apiCall('/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  getNotifications: () => apiCall('/settings/notifications'),
  updateNotifications: (settings: any) => 
    apiCall('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};
