import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  
  // Form state for step 2
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // STEP 1: Google Login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    const idToken = credentialResponse.credential;
    
    if (!idToken) {
      setError('Google Sign-In failed: No ID token received');
      return;
    }

    try {
      const response = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth/admin/google` : 'https://ns-jewellery.onrender.com/api/auth/admin/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Google Auth Successful! Move to Step 2 instead of going to dashboard
        setStep(2);
      } else {
        setError(data.message || 'Access Denied. This Google account is not authorized.');
      }
    } catch (err) {
      setError('Network error connecting to backend. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed or was cancelled.');
  };

  // STEP 2: Master Password Login
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth/admin/login` : 'https://ns-jewellery.onrender.com/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Both steps passed! Final login.
        login(data.data.user, data.data.token);
        navigate('/');
      } else {
        setError(data.message || 'Incorrect Admin ID or Password');
      }
    } catch (err) {
      setError('Network error connecting to backend. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-40 mx-auto mb-6 flex items-center justify-center relative">
            <img src="/rn_new_logo.png" alt="RN Logo" className="w-full h-auto object-contain pointer-events-none" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Portal</h2>
          <p className="text-gray-500">
            {step === 1 ? 'Step 1: Verify your identity' : 'Step 2: Enter Master Credentials'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-6 text-center">
              Please sign in with your authorized Google account to continue.
            </p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              shape="rectangular"
              theme="outline"
              text="signin_with"
              size="large"
            />
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleManualLogin} className="space-y-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a0d2f] focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a0d2f] focus:border-transparent"
                placeholder="Enter Password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6a0d2f] text-white py-2 mt-2 rounded-lg font-medium hover:bg-[#85113b] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setPassword(''); }}
              className="w-full bg-gray-100 text-gray-600 py-2 mt-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Google Sign In
            </button>
          </form>
        )}
        
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Restricted access. Only authorized administrators may log in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
