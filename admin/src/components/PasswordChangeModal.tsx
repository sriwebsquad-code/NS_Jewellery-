import React, { useState } from 'react';
import { Mail, Phone, Lock, CheckCircle2, X } from 'lucide-react';

type Step = 'SELECT_METHOD' | 'ENTER_DETAILS' | 'VERIFY_OTP' | 'SET_PASSWORD';
type Method = 'EMAIL' | 'PHONE' | null;

const ALLOWED_EMAILS = [
  'sriwebsquad@gmail.com',
  'nsmahaveerjewellery@gmail.com',
  'parthi15august@gmail.com'
];

const ALLOWED_PHONES = [
  '7418484430',
  '7845391712',
  '8400916916'
];

interface PasswordChangeModalProps {
  onClose: () => void;
  title?: string;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ onClose, title = 'Change Password' }) => {
  const [step, setStep] = useState<Step>('SELECT_METHOD');
  const [method, setMethod] = useState<Method>(null);
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setError('');
    if (method === 'EMAIL') {
      if (!ALLOWED_EMAILS.includes(email.toLowerCase().trim())) {
        setError('Unauthorized email address. You do not have permission to reset the password.');
        return;
      }
    } else {
      if (!ALLOWED_PHONES.includes(phone.trim())) {
        setError('Unauthorized phone number. You do not have permission to reset the password.');
        return;
      }
    }
    
    setLoading(true);
    try {
      const endpoint = method === 'EMAIL' ? '/api/auth/send-email-otp' : '/api/auth/send-admin-phone-otp';
      const body = method === 'EMAIL' 
        ? JSON.stringify({ email: email.trim() }) 
        : JSON.stringify({ phone: `+91${phone.trim()}` });
        
      const response = await fetch(`https://ns-jewellery.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const data = await response.json();
      if (data.success) {
        setStep('VERIFY_OTP');
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }
    
    setLoading(true);
    try {
      const body = method === 'EMAIL'
        ? JSON.stringify({ email: email.trim(), otp })
        : JSON.stringify({ phone: `+91${phone.trim()}`, otp });

      const response = await fetch('https://ns-jewellery.onrender.com/api/auth/verify-otp-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const data = await response.json();
      if (data.success) {
        setStep('SET_PASSWORD');
      } else {
        setError(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Save to localStorage to persist the password for the mock login
    localStorage.setItem('adminPassword', newPassword);
    
    setSuccess('Password has been successfully changed!');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-secondary">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-1 rounded-full shadow-sm border border-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm border border-red-100 flex items-start space-x-2">
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 flex items-center space-x-3 border border-green-100">
              <CheckCircle2 size={24} />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {!success && (
            <>
              {step === 'SELECT_METHOD' && (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">Please verify your identity to change the password.</p>
                  
                  <button 
                    onClick={() => { setMethod('EMAIL'); setStep('ENTER_DETAILS'); setError(''); }}
                    className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="p-3 bg-gray-100 rounded-full group-hover:bg-white group-hover:text-primary transition-colors">
                      <Mail size={24} />
                    </div>
                    <div className="ml-4 text-left">
                      <h4 className="font-semibold text-gray-800">Verify via Email</h4>
                      <p className="text-xs text-gray-500 mt-1">Send an OTP to an authorized email</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setMethod('PHONE'); setStep('ENTER_DETAILS'); setError(''); }}
                    className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="p-3 bg-gray-100 rounded-full group-hover:bg-white group-hover:text-primary transition-colors">
                      <Phone size={24} />
                    </div>
                    <div className="ml-4 text-left">
                      <h4 className="font-semibold text-gray-800">Verify via Phone</h4>
                      <p className="text-xs text-gray-500 mt-1">Send an OTP to your phone number</p>
                    </div>
                  </button>
                </div>
              )}

              {step === 'ENTER_DETAILS' && (
                <div className="space-y-6">
                  <p className="text-gray-600">Enter your {method === 'EMAIL' ? 'email address' : 'phone number'} to receive a verification code.</p>
                  
                  {method === 'EMAIL' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Authorized Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
                        placeholder="Enter your email"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
                        placeholder="Enter your mobile number"
                      />
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setStep('SELECT_METHOD')}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="flex-1 bg-secondary text-white py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors shadow-md shadow-secondary/20 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'VERIFY_OTP' && (
                <div className="space-y-6">
                  <p className="text-gray-600">Enter the verification code sent to <span className="font-bold text-gray-800">{method === 'EMAIL' ? email : phone}</span>.</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 text-center tracking-[0.5em] font-bold text-xl rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setStep('ENTER_DETAILS')}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'SET_PASSWORD' && (
                <div className="space-y-5">
                  <div className="flex items-center space-x-3 bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 mb-2">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-medium">Identity verified successfully.</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none tracking-widest"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none tracking-widest"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleChangePassword}
                    className="w-full bg-secondary text-white py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/30 mt-2"
                  >
                    Change Password
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
