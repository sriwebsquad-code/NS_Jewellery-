import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UsersManagement from './Users';
import { useAuthStore } from '../store/authStore';

const CustomerDetails: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://ns-jewellery.onrender.com/api/admin/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (data.success) {
        setIsVerified(true);
      } else {
        setError(data.message || 'Incorrect Password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => navigate('/admin/settings')}
          className="flex items-center text-gray-500 hover:text-primary transition-colors text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm w-fit"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Settings
        </button>
        <UsersManagement allowDelete={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-primary/10 p-8 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/80" />
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm">
            <Lock size={28} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-secondary">Admin Verification</h2>
          <p className="text-gray-500 text-sm mt-2">
            This section contains sensitive customer data and permanent deletion tools. Please verify your admin password to continue.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Admin Password</label>
            <input
              type="password"
              placeholder="Enter your master password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs font-medium pl-1 mt-1 animate-fade-in">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] flex items-center justify-center space-x-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-70"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Verify & Continue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerDetails;
