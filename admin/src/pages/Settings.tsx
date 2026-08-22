import React, { useState } from 'react';
import { Shield, Key, ArrowRight } from 'lucide-react';
import PasswordChangeModal from '../components/PasswordChangeModal';

const Settings: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

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

      {showModal && (
        <PasswordChangeModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Settings;
