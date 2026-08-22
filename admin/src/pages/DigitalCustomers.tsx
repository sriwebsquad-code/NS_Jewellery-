import React, { useState, useEffect } from 'react';
import { Layers, Coins, Search, ArrowRight, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const DigitalCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'GOLD' | 'SILVER'>('GOLD');
  const token = useAuthStore(state => state.token);

  // Expandable row state
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('https://ns-jewellery.onrender.com/api/digital/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch digital customers', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpand = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }
    
    setExpandedUserId(userId);
    setIsFetchingTransactions(true);
    setTransactions([]);
    
    try {
      const res = await fetch(`https://ns-jewellery.onrender.com/api/digital/admin/user/${userId}/transactions/${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setIsFetchingTransactions(false);
    }
  };

  const handleRedeem = async (userId: string, currentBalance: number) => {
    if (!window.confirm(`Are you sure you want to REDEEM ${currentBalance.toFixed(4)}g of ${activeTab === 'GOLD' ? 'Gold' : 'Silver'} for this customer? Their balance will become 0.`)) {
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await fetch(`https://ns-jewellery.onrender.com/api/digital/admin/user/${userId}/redeem/${activeTab}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Redeemed successfully!");
        // Refresh everything to reflect changes
        await fetchCustomers();
        setExpandedUserId(null); // Close the row
      } else {
        alert(data.message || 'Failed to redeem');
      }
    } catch (error) {
      console.error('Failed to redeem', error);
      alert('Network error');
    } finally {
      setIsRedeeming(false);
    }
  };

  // Filter customers by search term and active tab
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          customer.user?.phone?.includes(searchTerm);
    const hasBalance = activeTab === 'GOLD' ? customer.balances?.goldBalance > 0 : customer.balances?.silverBalance > 0;
    return matchesSearch && hasBalance;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-primary/10 gap-4">
        <div>
          <h2 className="text-3xl font-serif text-secondary">Digital Locker Customers</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage and view customers' digital metal balances.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => { setActiveTab('GOLD'); setExpandedUserId(null); }}
            className={`flex-1 py-4 text-center font-bold tracking-wider uppercase text-sm transition-colors ${activeTab === 'GOLD' ? 'bg-yellow-50 text-yellow-700 border-b-2 border-yellow-500' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <img src="/gold_coin.png" alt="Gold Coin" className="w-5 h-5 object-contain" />
              <span>Digi Gold</span>
            </div>
          </button>
          <button 
            onClick={() => { setActiveTab('SILVER'); setExpandedUserId(null); }}
            className={`flex-1 py-4 text-center font-bold tracking-wider uppercase text-sm transition-colors ${activeTab === 'SILVER' ? 'bg-gray-100 text-gray-700 border-b-2 border-gray-500' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <img src="/silver_coin.png" alt="Silver Coin" className="w-5 h-5 object-contain" />
              <span>Digi Silver</span>
            </div>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Layers size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">No {activeTab === 'GOLD' ? 'Gold' : 'Silver'} customers found.</p>
            {searchTerm && <p className="text-gray-400 text-sm mt-1">Try adjusting your search term.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="px-6 py-4">Customer Info</th>
                  <th className="px-6 py-4 text-right">Balance (g)</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.map((customer, idx) => {
                  const currentBalance = activeTab === 'GOLD' ? customer.balances.goldBalance : customer.balances.silverBalance;
                  const isExpanded = expandedUserId === customer.userId;
                  
                  return (
                    <React.Fragment key={idx}>
                      <tr 
                        onClick={() => handleExpand(customer.userId)}
                        className={`hover:bg-primary/5 transition-colors cursor-pointer ${isExpanded ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-serif">
                              {customer.user?.name ? customer.user.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-serif font-medium text-gray-900">{customer.user?.name || 'Unknown User'}</p>
                                <span className="text-[10px] font-medium text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">#{customer.userId}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                <Phone size={12} />
                                <span>{customer.user?.phone || 'No phone'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${activeTab === 'GOLD' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                            <Coins size={14} className={activeTab === 'GOLD' ? 'text-yellow-600' : 'text-gray-500'} />
                            <span className="font-bold">{currentBalance.toFixed(4)} g</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="text-gray-400 p-1 hover:text-primary transition-colors">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Transaction History */}
                      {isExpanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={3} className="px-8 py-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                <div>
                                  <h4 className="text-lg font-serif text-secondary font-semibold">{activeTab === 'GOLD' ? 'Digi Gold' : 'Digi Silver'} Transactions</h4>
                                  <p className="text-xs text-gray-500 mt-1">Buying history for this customer.</p>
                                </div>
                                
                                {currentBalance > 0 && (
                                  <button 
                                    onClick={() => handleRedeem(customer.userId, currentBalance)}
                                    disabled={isRedeeming}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors shadow-sm"
                                  >
                                    <CheckCircle size={16} />
                                    <span>Redeem {activeTab === 'GOLD' ? 'Gold' : 'Silver'}</span>
                                  </button>
                                )}
                              </div>

                              {isFetchingTransactions ? (
                                <div className="text-center py-8 text-gray-400">Loading transactions...</div>
                              ) : transactions.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                                  <Clock size={24} className="mb-2 opacity-50" />
                                  <p>No transaction history found.</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {transactions.map(tx => (
                                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-50 hover:border-primary/20 transition-colors bg-gray-50/50">
                                      <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${tx.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                          {tx.type === 'BUY' ? <ArrowRight size={14} /> : <CheckCircle size={14} />}
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-700 text-sm">{tx.type === 'BUY' ? 'Bought' : 'Redeemed'}</p>
                                          <p className="text-[10px] text-gray-400 font-medium">{new Date(tx.createdAt).toLocaleString()}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-secondary">{tx.type === 'BUY' ? '+' : '-'}{tx.weight} g</p>
                                        {tx.type === 'BUY' && <p className="text-[10px] text-gray-500 font-medium">₹{tx.amount}</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalCustomers;
