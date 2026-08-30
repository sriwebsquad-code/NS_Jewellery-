import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, ShieldCheck, Clock, Phone, MapPin, ChevronDown, ChevronUp, Layers, Coins, Filter, X, User as UserIcon, Mail, Calendar, UserCheck, Map, Hash, FileText } from 'lucide-react';
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
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-gray-500 font-semibold">Date</th>
              <th className="px-4 py-3 text-gray-500 font-semibold">Type</th>
              <th className="px-4 py-3 text-gray-500 font-semibold text-right">Amount</th>
              <th className="px-4 py-3 text-gray-500 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {txns.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{new Date(t.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold text-primary">{t.type.replace(/_/g, ' ')}</span>
                  <div className="text-xs text-gray-500 mt-1">{t.details}</div>
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-800">₹{t.amount.toLocaleString()}</td>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  
  // Advanced Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterSchemeType, setFilterSchemeType] = useState('ALL');
  const [filterMetalType, setFilterMetalType] = useState('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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
    // 1. Text Search Filter
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Gender Filter
    const matchesGender = filterGender === 'ALL' || (user.gender && user.gender.toUpperCase() === filterGender);

    // 3. Scheme & Metal Type Filter
    let matchesScheme = true;
    let matchesMetal = true;
    
    if (filterSchemeType !== 'ALL' || filterMetalType !== 'ALL') {
      const activeSchemes = user.activeSchemes || [];
      // If filtering by scheme/metal but they have no schemes, they don't match
      if (activeSchemes.length === 0) {
        matchesScheme = false;
        matchesMetal = false;
      } else {
        if (filterSchemeType !== 'ALL') {
          matchesScheme = activeSchemes.some(s => s.planDetails?.schemeType === filterSchemeType);
        }
        if (filterMetalType !== 'ALL') {
          matchesMetal = activeSchemes.some(s => s.planDetails?.metalType === filterMetalType);
        }
      }
    }

    // 4. Date Range Filter
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && new Date(user.createdAt) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(user.createdAt) <= endDate;
    }

    return matchesSearch && matchesGender && matchesScheme && matchesMetal && matchesDate;
  });

  const toggleExpand = (userId: string) => {
    setExpandedUserId(prev => prev === userId ? null : userId);
  };

  const clearFilters = () => {
    setFilterGender('ALL');
    setFilterSchemeType('ALL');
    setFilterMetalType('ALL');
    setDateRange({ start: '', end: '' });
  };

  const activeFiltersCount = (filterGender !== 'ALL' ? 1 : 0) + 
                             (filterSchemeType !== 'ALL' ? 1 : 0) + 
                             (filterMetalType !== 'ALL' ? 1 : 0) + 
                             (dateRange.start || dateRange.end ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm gap-4 border border-primary/10">
        <div>
          <h2 className="text-3xl font-serif text-secondary">Customers Management</h2>
          <p className="text-sm font-medium text-gray-500 mt-2">Manage and view all registered users and their active schemes.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-700"
            />
            <Search size={18} className="absolute left-4 top-3 text-gray-400" />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-colors ${
              showFilters || activeFiltersCount > 0 
                ? 'bg-primary/5 border-primary/30 text-primary' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-primary/10 animate-fade-in flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-serif font-semibold text-lg text-secondary">Advanced Filters</h3>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                <X size={12} /> Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Joined Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full p-2 text-sm border border-gray-200 rounded-md bg-gray-50 outline-none focus:border-primary/50" 
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full p-2 text-sm border border-gray-200 rounded-md bg-gray-50 outline-none focus:border-primary/50" 
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</label>
              <select 
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-md bg-gray-50 outline-none focus:border-primary/50"
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Scheme Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheme Type</label>
              <select 
                value={filterSchemeType}
                onChange={(e) => setFilterSchemeType(e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-md bg-gray-50 outline-none focus:border-primary/50"
              >
                <option value="ALL">All Schemes</option>
                <option value="WEIGHT_BASED">Weight Based</option>
                <option value="VALUE_BASED">Value Based</option>
              </select>
            </div>

            {/* Metal Type (Gold/Silver) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Metal Coins/Schemes</label>
              <select 
                value={filterMetalType}
                onChange={(e) => setFilterMetalType(e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-md bg-gray-50 outline-none focus:border-primary/50"
              >
                <option value="ALL">All Metals</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/40" />
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b-2 border-gray-100/50">
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Contact Info</th>
                <th className="px-6 py-4 font-bold">Location</th>
                <th className="px-6 py-4 font-bold">Status & Date</th>
                <th className="px-6 py-4 font-bold text-center">Action</th>
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
                      <p>No customers found matching your search and filters.</p>
                      {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="mt-3 text-primary text-sm font-semibold hover:underline">
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <tr 
                      onClick={() => toggleExpand(user.id)}
                      className="hover:bg-primary/5 transition-colors group cursor-pointer" 
                      style={{ animation: `fade-in 0.3s ease-out forwards`, animationDelay: `${index * 30}ms`, opacity: 0 }}
                    >
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <div className="p-1.5 bg-gray-100/80 rounded-lg group-hover:bg-white transition-colors shadow-sm">
                               <Phone size={14} className="text-gray-500" />
                            </div>
                            <span className="font-medium text-sm">{user.phone}</span>
                          </div>
                          {user.email && (
                            <div className="flex items-center space-x-2 text-gray-500 text-sm">
                              <span className="font-medium text-xs">{user.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-2 text-gray-600">
                          <div className="p-1.5 bg-gray-100/80 rounded-lg mt-0.5 group-hover:bg-white transition-colors shadow-sm">
                             <MapPin size={14} className="text-gray-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-gray-700">{user.city || 'No city'}</span>
                            <span className="text-xs text-gray-500">{user.state ? `${user.state}, ` : ''}{user.pincode || ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1.5">
                            {user.kycStatus === 'VERIFIED' ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-green-100/80 text-green-700 text-[11px] font-bold rounded-full border border-green-200 shadow-sm">
                                <ShieldCheck size={12} />
                                <span>{user.kycDocumentType || 'Verified'} {user.kycDocumentNumber ? `**${user.kycDocumentNumber.slice(-4)}` : ''}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100/80 text-amber-700 text-[11px] font-bold rounded-full border border-amber-200 shadow-sm">
                                <Clock size={12} />
                                <span>Pending KYC</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500">
                          {expandedUserId === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Content: Complete Details, Schemes, Txns */}
                    {expandedUserId === user.id && (
                      <tr className="bg-gray-50/50 border-b border-gray-200">
                        <td colSpan={5} className="px-4 py-6 md:px-8">
                          
                          {/* NEW: Account Details Section */}
                          <div className="bg-white border border-primary/20 rounded-xl p-5 md:p-6 shadow-sm mb-6">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 border-b pb-2">Account Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 rounded-full text-amber-600 border border-amber-100"><UserIcon size={16} /></div>
                                <div>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Full Name</p>
                                  <p className="font-semibold text-gray-900 text-sm">{user.name || 'Not Provided'}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-full text-blue-600 border border-blue-100"><Mail size={16} /></div>
                                <div>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                                  <p className="font-semibold text-gray-900 text-sm truncate max-w-[150px]">{user.email || 'Not Provided'}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-pink-50 rounded-full text-pink-600 border border-pink-100"><Calendar size={16} /></div>
                                <div>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Date of Birth</p>
                                  <p className="font-semibold text-gray-900 text-sm">{user.dob ? new Date(user.dob).toLocaleDateString() : 'Not Provided'}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-full text-purple-600 border border-purple-100"><UserCheck size={16} /></div>
                                <div>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Gender</p>
                                  <p className="font-semibold text-gray-900 text-sm capitalize">{user.gender || 'Not Provided'}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 rounded-full text-emerald-600 border border-emerald-100"><MapPin size={16} /></div>
                                <div>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Address</p>
                                  <p className="font-semibold text-gray-900 text-sm line-clamp-2">{user.address || 'Not Provided'}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-teal-50 rounded-full text-teal-600 border border-teal-100"><Map size={16} /></div>
                                <div>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">State & City</p>
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {user.state || 'Not Provided'} {user.city ? `/ ${user.city}` : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 rounded-full text-orange-600 border border-orange-100"><Hash size={16} /></div>
                                <div>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Pincode</p>
                                  <p className="font-semibold text-gray-900 text-sm">{user.pincode || 'Not Provided'}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 rounded-full text-indigo-600 border border-indigo-100"><FileText size={16} /></div>
                                <div>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">KYC Verification</p>
                                  <p className={`font-bold text-sm ${user.kycStatus === 'VERIFIED' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {user.kycStatus === 'VERIFIED' ? `Verified (${user.kycDocumentType || 'Aadhar'})` : 'Verify Now'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2">Active Schemes & Plans</h4>
                          {(!user.activeSchemes || user.activeSchemes.length === 0) ? (
                            <p className="text-gray-500 text-sm italic bg-white p-4 rounded-lg border border-gray-100">This customer is not enrolled in any active schemes.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {user.activeSchemes.map((scheme: any) => (
                                <div key={scheme.id} className="bg-white border border-primary/20 rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors">
                                  <div className="flex justify-between items-start mb-3">
                                    <h5 className="font-serif text-lg text-secondary font-bold">{scheme.planDetails?.name || 'Unknown Plan'}</h5>
                                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-200 shadow-sm">ACTIVE</span>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2 mb-5">
                                    {scheme.planDetails?.schemeType && (
                                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${scheme.planDetails.schemeType === 'WEIGHT_BASED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'} flex items-center`}>
                                        <Layers size={10} className="mr-1" />
                                        {scheme.planDetails.schemeType === 'WEIGHT_BASED' ? 'Weight Based' : 'Value Based'}
                                      </span>
                                    )}
                                    {scheme.planDetails?.metalType && (
                                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${scheme.planDetails.metalType === 'SILVER' ? 'bg-gray-100 text-gray-600 border-gray-300' : 'bg-amber-50 text-amber-700 border-amber-300'} flex items-center`}>
                                        <Coins size={10} className="mr-1" />
                                        {scheme.planDetails.metalType === 'SILVER' ? 'Silver' : 'Gold'}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2 mt-2 pt-4 border-t border-gray-100 text-sm bg-gray-50/50 rounded-b-lg -mx-5 -mb-5 p-4">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">Monthly Amount</span>
                                      <span className="font-bold text-gray-800">₹{scheme.monthlyAmount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">Total Paid</span>
                                      <span className="font-bold text-green-600">₹{(scheme.totalPaid || 0).toLocaleString()}</span>
                                    </div>
                                    {scheme.planDetails?.schemeType === 'WEIGHT_BASED' && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-500 font-medium">Accumulated Weight</span>
                                        <span className="font-bold text-primary">
                                          {/* Mock calculation for weight based on price */}
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
                          <div className="mt-4">
                            <UserTransactions userId={user.id} token={token} />
                          </div>
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
