import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    const idToken = credentialResponse.credential;
    
    if (!idToken) {
      setError('Google Sign-In failed: No ID token received');
      return;
    }

    try {
      const response = await fetch('https://ns-jewellery.onrender.com/api/auth/admin/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Backend generated JWT
        login(data.data.user, data.data.token);
        navigate('/');
      } else {
        // Render 403 Forbidden Access Denied message
        setError(data.message || 'Access Denied. This Google account is not authorized.');
      }
    } catch (err) {
      setError('Network error connecting to backend. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed or was cancelled.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-40 mx-auto mb-6 flex items-center justify-center relative">
            <img src="/rn_new_logo.png" alt="RN Logo" className="w-full h-auto object-contain pointer-events-none" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Portal</h2>
          <p className="text-gray-500">Sign in with your authorized Google Account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="flex justify-center mt-6 mb-4">
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
