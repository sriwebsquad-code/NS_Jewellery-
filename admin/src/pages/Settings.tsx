import React, { useState } from 'react';
import { Shield, Key, Mail, Phone, Lock, CheckCircle2, ArrowRight, X } from 'lucide-react';

type Step = 'SELECT_METHOD' | 'ENTER_DETAILS' | 'VERIFY_OTP' | 'SET_PASSWORD';
type Method = 'EMAIL' | 'PHONE' | null;

const ALLOWED_EMAILS = [
  'sriwebsquad@gmail.com',
  'nsmahaveerjewellery@gmail.com',
  'parthi15august@gmail.com'
];

const Settings: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<Step>('SELECT_METHOD');
  const [method, setMethod] = useState<Method>(null);
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetFlow = () => {
    setStep('SELECT_METHOD');
    setMethod(null);
    setEmail('');
    setPhone('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    setShowModal(false);
    resetFlow();
  };

  const handleSendOtp = () => {
    setError('');
    if (method === 'EMAIL') {
      if (!ALLOWED_EMAILS.includes(email.toLowerCase().trim())) {
        setError('Unauthorized email address. You do not have permission to reset the password.');
        return;
      }
    } else {
      if (!phone || phone.length < 10) {
        setError('Please enter a valid phone number.');
        return;
      }
    }
    // Simulate sending OTP
    setStep('VERIFY_OTP');
  };

  const handleVerifyOtp = () => {
    setError('');
    if (otp.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }
    // Simulate successful OTP verification
    setStep('SET_PASSWORD');
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
      handleClose();
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[600px]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold font-serif text-secondary mb-2">Admin Settings</h1>
          <p className="text-gray-500">Manage your administrative preferences and security settings.</p>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center space-x-3 bg-gray-50">
            <Shield className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Security</h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Key className="text-secondary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">Admin Password</h3>
                  <p className="text-gray-500 text-sm mt-1">Change the master password used to access the admin portal.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-secondary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-secondary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 shrink-0"
              >
                <span>Change Password</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Password Change Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-secondary">Change Password</h3>
              <button 
                onClick={handleClose}
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
                          className="flex-1 bg-secondary text-white py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors shadow-md shadow-secondary/20"
                        >
                          Send OTP
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
                          className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                        >
                          Verify Code
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
      )}
    </div>
  );
};

export default Settings;
