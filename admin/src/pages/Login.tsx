import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // In production, this will hit POST /api/admin/login
    // Default admin credentials
    if (adminId === 'admin' && password === 'admin123') {
      login({ id: '1', name: 'Admin', phone: '0000000000', role: 'ADMIN' }, 'fake-jwt-token');
      navigate('/');
    } else {
      setError('Invalid Admin ID or Password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-40 mx-auto mb-6 flex items-center justify-center">
            <img src="/rn_new_logo.png" alt="RN Logo" className="w-full h-auto object-contain" />
          </div>
          <p className="text-gray-500">Admin Portal Login</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
              placeholder="Enter Admin ID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none tracking-widest"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-secondary text-white font-medium py-3 rounded-lg hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/30"
          >
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

