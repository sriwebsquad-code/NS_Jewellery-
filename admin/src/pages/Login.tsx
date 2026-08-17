import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [mpin, setMpin] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Hardcoded for demo since we haven't wired the API yet
    // In production, this will hit POST /api/auth/mpin/login
    if (phone === '9999999999' && mpin === '1234') {
      login({ id: '1', name: 'Admin', phone, role: 'ADMIN' }, 'fake-jwt-token');
      navigate('/');
    } else {
      setError('Invalid Phone or MPIN');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">NS Jewellery</h1>
          <p className="text-gray-500">Admin Portal Login</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
              placeholder="Enter admin phone"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">4-Digit MPIN</label>
            <input
              type="password"
              maxLength={4}
              value={mpin}
              onChange={(e) => setMpin(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none tracking-widest text-lg"
              placeholder="••••"
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
