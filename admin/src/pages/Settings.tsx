import React, { useState, useEffect } from 'react';
import { Shield, Key, ArrowRight, MessageCircle, Save, Loader2 } from 'lucide-react';
import PasswordChangeModal from '../components/PasswordChangeModal';

const Settings: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

  const API_URL = 'https://ns-jewellery.onrender.com';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      const data = await res.json();
      if (data.success && data.data) {
        setWhatsappNumber(data.data.whatsappNumber || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ whatsappNumber })
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage({ text: 'Settings saved successfully!', type: 'success' });
        setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
      } else {
        setSaveMessage({ text: data.message || 'Failed to save settings', type: 'error' });
      }
    } catch (error) {
      setSaveMessage({ text: 'Error saving settings', type: 'error' });
    } finally {
      setSaving(false);
    }
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

        {/* Contact Information Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center space-x-3 bg-gray-50">
            <MessageCircle className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Contact Information</h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <div className="flex-1 mr-4">
                <h3 className="font-semibold text-gray-800 text-lg">WhatsApp Number</h3>
                <p className="text-gray-500 text-sm mt-1 mb-3">This number will be used when customers click "Proceed to Buy" or "Inquire" in the app.</p>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-start sm:items-center max-w-lg">
                  <div className="flex-1 w-full relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium">+91</span>
                    <input 
                      type="text" 
                      placeholder="Enter 10-digit mobile number"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg pl-12 pr-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      disabled={loading}
                    />
                  </div>
                  <button 
                    onClick={saveSettings}
                    disabled={loading || saving}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center space-x-2 w-full sm:w-auto disabled:opacity-70"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
                {saveMessage.text && (
                  <p className={`mt-3 text-sm font-medium ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {saveMessage.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {showModal && (
        <PasswordChangeModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Settings;
