import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import JewelleryManagement from './pages/Jewellery';
import PlansManagement from './pages/Plans';
import RatesManagement from './pages/Rates';
import UsersManagement from './pages/Users';
import TransactionsManagement from './pages/Transactions';
import DigitalCustomers from './pages/DigitalCustomers';
import { useAuthStore } from './store/authStore';

import Settings from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="digital-customers" element={<DigitalCustomers />} />
          <Route path="jewellery" element={<JewelleryManagement />} />
          <Route path="plans/value" element={<PlansManagement typeFilter="VALUE_BASED" />} />
          <Route path="plans/weight" element={<PlansManagement typeFilter="WEIGHT_BASED" />} />
          <Route path="transactions" element={<TransactionsManagement />} />
          <Route path="rates" element={<RatesManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
