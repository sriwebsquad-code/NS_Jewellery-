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
import { useAuthStore } from './store/authStore';

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
          <Route path="jewellery" element={<JewelleryManagement />} />
          <Route path="plans" element={<PlansManagement />} />
          <Route path="transactions" element={<TransactionsManagement />} />
          <Route path="rates" element={<RatesManagement />} />
          <Route path="settings" element={<div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">Settings (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
