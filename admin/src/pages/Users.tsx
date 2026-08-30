import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, ShieldCheck, Clock, Phone, MapPin, ChevronDown, ChevronUp, Layers, Coins, Filter, X } from 'lucide-react';
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
  kycDocumentType?: string;
  kycDocumentNumber?: string;
  createdAt: string;
  activeSchemes?: any[];
  goldBalance?: number;
  silverBalance?: number;
}

const UserTransactions: React.FC<{ userId: string, token: string | null }> = ({ userId, token }) => {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        const response = await fetch(`https://ns-jewellery.onrender.com/api/admin/transactions?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setTxns(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxns();
  }, [userId, token]);

  if (loading) return <p className="text-gray-500 text-sm mt-4">Loading transactions...</p>;
  if (txns.length === 0) return <p className="text-gray-500 text-sm italic mt-4">No transactions found for this customer.</p>;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2">Payment History</h4>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-gray-500 font-semibold">Date</th>
              <th className="px-4 py-2 text-gray-500 font-semibold">Type</th>
              <th className="px-4 py-2 text-gray-500 font-semibold text-right">Amount</th>
              <th className="px-4 py-2 text-gray-500 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {txns.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{new Date(t.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold text-primary">{t.type.replace(/_/g, ' ')}</span>
                  <div className="text-xs text-gray-500 mt-1">{t.details}</div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-700">₹{t.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${t.status === 'SUCCESS' || t.status === 'PAID' ? 'bg-green-100 text-green-700' : t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterHasSchemes, setFilterHasSchemes] = useState(false);
  const [filterHasGold, setFilterHasGold] = useState(false);
  const [filterHasSilver, setFilterHasSilver] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGender = filterGender === 'ALL' || (user.gender && user.gender.toLowerCase() === filterGender.toLowerCase());
    const matchesSchemes = !filterHasSchemes || (user.activeSchemes && user.activeSchemes.length > 0);
    const matchesGold = !filterHasGold || (user.goldBalance && user.goldBalance > 0);
    const matchesSilver = !filterHasSilver || (user.silverBalance && user.silverBalance > 0);
    
    let matchesDate = true;
    if (filterDate) {
      const userDate = new Date(user.createdAt).toISOString().split('T')[0];
      matchesDate = userDate === filterDate;
    }

    return matchesSearch && matchesGender && matchesSchemes && matchesGold && matchesSilver && matchesDate;
  });

  const toggleExpand = (userId: string) => {
    setExpandedUserId(prev => prev === userId ? null : userId);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-serif text-secondary">Customers Management</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">Manage and view all registered users and their active schemes.</p>
          </div>
          
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search by name, phone or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-gray-700"
              />
              <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              title="Advanced Filters"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-6 pt-5 border-t border-gray-100 animate-fade-in flex flex-wrap items-center gap-6">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reg. Date</label>
              <input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)} 
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-700"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</label>
              <select 
                value={filterGender} 
                onChange={(e) => setFilterGender(e.target.value)} 
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-700 bg-white"
              >
                <option value="ALL">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center space-x-6 mt-4">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={filterHasSchemes} 
                  onChange={(e) => setFilterHasSchemes(e.target.checked)} 
                  className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4" 
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Active Schemes</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={filterHasGold} 
                  onChange={(e) => setFilterHasGold(e.target.checked)} 
                  className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4" 
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Has Gold</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={filterHasSilver} 
                  onChange={(e) => setFilterHasSilver(e.target.checked)} 
                  className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4" 
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Has Silver</span>
              </label>
            </div>

            {(filterDate || filterGender !== 'ALL' || filterHasSchemes || filterHasGold || filterHasSilver) && (
              <button 
                onClick={() => {
                  setFilterDate(''); setFilterGender('ALL'); setFilterHasSchemes(false); setFilterHasGold(false); setFilterHasSilver(false);
                }} 
                className="mt-4 flex items-center space-x-1 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider ml-auto bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <X size={14} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        )}
      </div>


      <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/40" />
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b-2 border-gray-100/50">
                <th className="px-6 py-5 font-bold">Customer</th>
                <th className="px-6 py-5 font-bold">Contact Info</th>
                <th className="px-6 py-5 font-bold">Location</th>
                <th className="px-6 py-5 font-bold">Status & Date</th>
                <th className="px-6 py-5 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <UsersIcon size={48} className="text-gray-300 mb-3" />
                      <p>No customers found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <tr 
                      onClick={() => toggleExpand(user.id)}
                      className="hover:bg-primary/5 transition-colors group cursor-pointer" 
                      style={{ animation: `fade-in 0.3s ease-out forwards`, animationDelay: `${index * 50}ms`, opacity: 0 }}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-background border border-primary/20 flex items-center justify-center text-primary font-serif text-xl shadow-sm group-hover:scale-110 transition-transform">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <p className="font-serif text-secondary text-lg font-medium">{user.name || 'Customer'}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase tracking-widest">{user.role}</span>
                              <span className="text-[10px] font-medium text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">#{user.id}</span>
                            </div>
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
                        <div className="flex items-start space-x-2 text-gray-600">
                          <div className="p-1.5 bg-gray-100/80 rounded-lg mt-0.5 group-hover:bg-white transition-colors shadow-sm">
                             <MapPin size={14} className="text-gray-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-700">{user.city || 'No city'}</span>
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
                                <span>{user.kycDocumentType || 'Verified KYC'} {user.kycDocumentNumber ? `- ${user.kycDocumentNumber.slice(-4).padStart(user.kycDocumentNumber.length, '*')}` : ''}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-100/80 text-amber-700 text-xs font-bold rounded-full border border-amber-200 shadow-sm">
                                <Clock size={14} />
                                <span>Pending KYC</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500">
                          {expandedUserId === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Content: Active Schemes */}
                    {expandedUserId === user.id && (
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        <td colSpan={5} className="px-8 py-6">
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2">Active Schemes & Plans</h4>
                          {(!user.activeSchemes || user.activeSchemes.length === 0) ? (
                            <p className="text-gray-500 text-sm italic">This customer is not enrolled in any active schemes.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {user.activeSchemes.map((scheme: any) => (
                                <div key={scheme.id} className="bg-white border border-primary/20 rounded-xl p-4 shadow-sm hover:border-primary/50 transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-serif text-lg text-secondary font-semibold">{scheme.planDetails?.name || 'Unknown Plan'}</h5>
                                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded">ACTIVE</span>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {scheme.planDetails?.schemeType && (
                                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${scheme.planDetails.schemeType === 'WEIGHT_BASED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'} flex items-center`}>
                                        <Layers size={10} className="mr-1" />
                                        {scheme.planDetails.schemeType === 'WEIGHT_BASED' ? 'Weight Based' : 'Value Based'}
                                      </span>
                                    )}
                                    {scheme.planDetails?.metalType && (
                                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${scheme.planDetails.metalType === 'SILVER' ? 'bg-gray-100 text-gray-600 border-gray-300' : 'bg-yellow-50 text-yellow-700 border-yellow-300'} flex items-center`}>
                                        <Coins size={10} className="mr-1" />
                                        {scheme.planDetails.metalType === 'SILVER' ? 'Silver' : 'Gold'}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2 mt-4 pt-3 border-t border-gray-100 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Monthly Amount</span>
                                      <span className="font-bold">₹{scheme.monthlyAmount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Total Paid</span>
                                      <span className="font-bold text-green-600">₹{scheme.totalPaid || 0}</span>
                                    </div>
                                    {scheme.planDetails?.schemeType === 'WEIGHT_BASED' && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Accumulated Weight</span>
                                        <span className="font-bold text-secondary">
                                          {/* In a real app, this would be fetched from DB. For now, showing placeholder. */}
                                          {((scheme.totalPaid || 0) / (scheme.planDetails.metalType === 'GOLD' ? 7000 : 90)).toFixed(3)}g
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Transaction History Section */}
                          <UserTransactions userId={user.id} token={token} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
