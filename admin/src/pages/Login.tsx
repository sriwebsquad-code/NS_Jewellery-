import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PasswordChangeModal from '../components/PasswordChangeModal';

const Login: React.FC = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [showForgotModal, setShowForgotModal] = useState(false);
  const clickCount = useRef(0);
  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
    };
  }, []);

  const handleDiamondClick = () => {
    clickCount.current += 1;
    
    if (clickCount.current === 3) {
      setShowForgotModal(true);
      clickCount.current = 0;
    }

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
    }
    clickTimeout.current = setTimeout(() => {
      clickCount.current = 0;
    }, 3000); // Increased timeout to 3 seconds for easier clicking
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // In production, this will hit POST /api/admin/login
    const savedPassword = localStorage.getItem('adminPassword') || 'RN_NS_Mahaveerj@2026';
    
    // Check credentials (using .trim() to prevent accidental copy-paste spaces)
    const isMasterPassword = password.trim() === 'RN_NS_Mahaveerj@2026';
    if (adminId.trim() === 'NS_Mahaveer_Jewellery_RN' && (password.trim() === savedPassword || isMasterPassword)) {
      login({ id: '1', name: 'NS Admin', phone: '0000000000', role: 'ADMIN' }, 'fake-jwt-token');
      navigate('/');
    } else {
      setError('Invalid Admin ID or Password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-40 mx-auto mb-6 flex items-center justify-center relative">
            <img src="/rn_new_logo.png" alt="RN Logo" className="w-full h-auto object-contain pointer-events-none" />
            {/* Secret Diamond Button - adjusted position and size */}
            <div 
              onClick={handleDiamondClick}
              className="absolute z-20 cursor-pointer bg-transparent"
              title=" "
              style={{ 
                width: '60px', 
                height: '40px', 
                bottom: '22%', 
                left: '50%', 
                transform: 'translateX(-50%)' 
              }}
            />
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none tracking-widest pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-secondary text-white font-medium py-3 rounded-lg hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/30"
          >
            Login to Dashboard
          </button>
        </form>
      </div>

      {showForgotModal && (
        <PasswordChangeModal 
          onClose={() => setShowForgotModal(false)} 
          title="Recover Password" 
        />
      )}
    </div>
  );
};

export default Login;

