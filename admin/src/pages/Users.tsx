import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, ShieldCheck, Clock, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  dob: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  role: string;
  kycStatus: string;
  createdAt: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://ns-jewellery.onrender.com/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.phone && user.phone.includes(searchTerm)) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm gap-4 border border-primary/10">
        <div>
          <h2 className="text-3xl font-serif text-secondary">Customers Management</h2>
          <p className="text-sm font-medium text-gray-500 mt-2">Manage and view all registered users across the platform.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all shadow-sm font-medium text-gray-700"
          />
          <Search size={20} className="absolute left-4 top-3.5 text-primary" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/40" />
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b-2 border-gray-100/50">
                <th className="px-6 py-5 font-bold">Customer</th>
                <th className="px-6 py-5 font-bold">Contact Info</th>
                <th className="px-6 py-5 font-bold">Personal Details</th>
                <th className="px-6 py-5 font-bold">Location</th>
                <th className="px-6 py-5 font-bold">Status & Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <UsersIcon size={48} className="text-gray-300 mb-3" />
                      <p>No customers found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-white/60 transition-colors group" style={{ animation: `fade-in 0.3s ease-out forwards`, animationDelay: `${index * 50}ms`, opacity: 0 }}>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-background border border-primary/20 flex items-center justify-center text-primary font-serif text-xl shadow-sm group-hover:scale-110 transition-transform">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-serif text-secondary text-lg font-medium">{user.name || 'Customer'}</p>
                          <p className="text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 inline-block mt-1 uppercase tracking-widest">{user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <div className="p-1.5 bg-gray-100/80 rounded-lg group-hover:bg-white transition-colors shadow-sm">
                             <Phone size={14} className="text-gray-500" />
                          </div>
                          <span className="font-medium">{user.phone}</span>
                        </div>
                        {user.email && (
                          <div className="flex items-center space-x-2 text-gray-500 text-sm">
                            <span className="font-medium">{user.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-800 font-medium">
                          DOB: <span className="text-gray-500 font-normal">{user.dob || 'N/A'}</span>
                        </span>
                        <span className="text-sm text-gray-800 font-medium">
                          Gender: <span className="text-gray-500 font-normal">{user.gender || 'N/A'}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-start space-x-2 text-gray-600">
                        <div className="p-1.5 bg-gray-100/80 rounded-lg mt-0.5 group-hover:bg-white transition-colors shadow-sm">
                           <MapPin size={14} className="text-gray-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">{user.city || 'No city provided'}</span>
                          <span className="text-xs text-gray-500">{user.state ? `${user.state}, ` : ''}{user.pincode || ''}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-1.5">
                          {user.kycStatus === 'VERIFIED' ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100/80 text-green-700 text-xs font-bold rounded-full border border-green-200 shadow-sm">
                              <ShieldCheck size={14} />
                              <span>Verified KYC</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-100/80 text-amber-700 text-xs font-bold rounded-full border border-amber-200 shadow-sm">
                              <Clock size={14} />
                              <span>Pending KYC</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
