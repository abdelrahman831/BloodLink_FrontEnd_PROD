import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './app/layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';

import { DashboardOverview } from './components/DashboardOverview';
import { BloodInventory } from './components/BloodInventory';
import { HospitalsRequests } from './components/HospitalsRequests';
import { DonationsCampaigns } from './components/DonationsCampaigns';
import { TransfersLogistics } from './components/TransfersLogistics';
import { AnalyticsReports } from './components/AnalyticsReports';
import { SettingsPage } from './components/SettingsPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="inventory" element={<BloodInventory />} />
          <Route path="hospitals" element={<HospitalsRequests />} />
          <Route path="donations" element={<DonationsCampaigns />} />
          <Route path="transfers" element={<TransfersLogistics />} />
          <Route path="analytics" element={<AnalyticsReports />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
