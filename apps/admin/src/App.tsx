import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TenantsPage } from './pages/TenantsPage';
import { UsersPage } from './pages/UsersPage';
import { AppUsersPage } from './pages/AppUsersPage';
import { EldersPage } from './pages/EldersPage';
import { DevicesPage } from './pages/DevicesPage';
import { GatewaysPage } from './pages/GatewaysPage';
import { AlertsPage } from './pages/AlertsPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="app-users" element={<AppUsersPage />} />
          <Route path="elders" element={<EldersPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="gateways" element={<GatewaysPage />} />
          <Route path="alerts" element={<AlertsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
