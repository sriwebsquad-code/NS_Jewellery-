import React, { useState, useEffect } from 'react';
import { Layers, Users as UsersIcon, ChevronDown, ChevronUp, CheckCircle, Clock, ArrowRight, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ReceiptModal, { ReceiptData } from '../components/ReceiptModal';

interface PlansManagementProps {
  typeFilter: 'VALUE_BASED' | 'WEIGHT_BASED';
  metalFilter?: 'GOLD' | 'SILVER';
}

const PlansManagement: React.FC<PlansManagementProps> = ({ typeFilter, metalFilter }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const token = useAuthStore(state => state.token);



  // View Customers State
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planUsers, setPlanUsers] = useState<any[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Transaction State
  const [expandedUserPlanId, setExpandedUserPlanId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    fetchPlans();
    setSearchQuery('');
  }, [typeFilter, metalFilter]);

  useEffect(() => {
    const matchingPlan = plans.find((p: any) => p.schemeType === typeFilter && (!metalFilter || p.metalType === metalFilter));
    if (matchingPlan) {
      handleViewCustomers(matchingPlan);
    } else {
      setSelectedPlan(null);
      setPlanUsers([]);
    }
  }, [plans, typeFilter, metalFilter]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('https://ns-jewellery.onrender.com/api/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } catch (error) {
      console.error('Failed to fetch plans', error);
    }
  };



  const handleViewCustomers = async (plan: any) => {
    setSelectedPlan(plan);
    setIsFetchingUsers(true);
    setExpandedUserPlanId(null);
    setSearchQuery('');
    try {
      const res = await fetch(`https://ns-jewellery.onrender.com/api/plans/${plan.id}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPlanUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch plan users', error);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const toggleExpandCustomer = async (userPlanId: string) => {
    if (expandedUserPlanId === userPlanId) {
      setExpandedUserPlanId(null);
      return;
    }
    
    setExpandedUserPlanId(userPlanId);
    setIsFetchingTransactions(true);
    
    try {
      const res = await fetch(`https://ns-jewellery.onrender.com/api/plans/user-plan/${userPlanId}/transactions`, {
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

  const handleRedeem = async (userPlanId: string) => {
    if (!window.confirm("Are you sure you want to mark this scheme as REDEEMED? This cannot be undone.")) {
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await fetch(`https://ns-jewellery.onrender.com/api/plans/user-plan/${userPlanId}/redeem`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Scheme redeemed successfully!");
        // Update local state to reflect redemption
        setPlanUsers(prev => prev.map(up => up.id === userPlanId ? { ...up, status: 'REDEEMED' } : up));
        
        // Find the user details to show in the bill
        const enrollment = planUsers.find(up => up.id === userPlanId);
        
        setReceiptData({
          id: userPlanId,
          date: new Date().toISOString(),
          type: 'SCHEME_REDEEM',
          details: selectedPlan?.name || 'Scheme Redemption',
          amount: `₹${enrollment?.totalPaid || 0}`,
          customerName: enrollment?.user?.name || 'Customer',
          customerPhone: enrollment?.user?.phone
        });
      } else {
        alert(data.message || 'Failed to redeem scheme');
      }
    } catch (error) {
      console.error('Failed to redeem scheme', error);
      alert('Network error');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 relative">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-primary/10">
        <div>
          <h2 className="text-3xl font-serif text-secondary">
            {metalFilter === 'GOLD' ? 'Gold ' : metalFilter === 'SILVER' ? 'Silver ' : ''}
            {typeFilter === 'VALUE_BASED' ? 'Value Schemes' : 'Weight Schemes'}
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage investment schemes and view enrollments.</p>
        </div>
      </div>

      {isFetchingUsers ? (
        <div className="text-center py-20 text-gray-500 font-medium animate-pulse bg-white rounded-xl shadow-sm border border-primary/10">
          Loading customers...
        </div>
      ) : selectedPlan ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-2xl font-serif text-secondary">{selectedPlan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Customers currently enrolled in this scheme</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search name or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
          
          <div className="p-0 overflow-y-auto w-full">
            {planUsers.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <UsersIcon size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium text-lg">No customers enrolled yet.</p>
                <p className="text-gray-400 text-sm mt-1">Users will appear here once they join the scheme from the mobile app.</p>
              </div>
            ) : (
              <div className="w-full">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                    <tr className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Total Paid</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {planUsers.filter(enrollment => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      const nameMatch = enrollment.user?.name?.toLowerCase().includes(q) || false;
                      const phoneMatch = enrollment.user?.phone?.toLowerCase().includes(q) || false;
                      const amountMatch = enrollment.monthlyAmount?.toString().includes(q) || enrollment.totalPaid?.toString().includes(q) || false;
                      return nameMatch || phoneMatch || amountMatch;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">
                          No customers found matching "{searchQuery}"
                        </td>
                      </tr>
                    ) : planUsers.filter(enrollment => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      const nameMatch = enrollment.user?.name?.toLowerCase().includes(q) || false;
                      const phoneMatch = enrollment.user?.phone?.toLowerCase().includes(q) || false;
                      const amountMatch = enrollment.monthlyAmount?.toString().includes(q) || enrollment.totalPaid?.toString().includes(q) || false;
                      return nameMatch || phoneMatch || amountMatch;
                    }).map((enrollment, idx) => (
                      <React.Fragment key={idx}>
                        <tr 
                          onClick={() => toggleExpandCustomer(enrollment.id)}
                          className={`hover:bg-primary/5 transition-colors cursor-pointer ${expandedUserPlanId === enrollment.id ? 'bg-primary/5' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-serif">
                                {enrollment.user?.name ? enrollment.user.name.charAt(0).toUpperCase() : 'C'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{enrollment.user?.name || 'Unknown Customer'}</p>
                                <p className="text-xs text-gray-500">{enrollment.user?.phone || 'No phone'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${enrollment.status === 'REDEEMED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {enrollment.status}
                            </span>
                            <div className="text-[10px] text-gray-400 mt-1 font-medium">Since {new Date(enrollment.startDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-bold text-secondary text-lg">₹{enrollment.totalPaid}</p>
                            <p className="text-xs text-gray-500 font-medium">₹{enrollment.monthlyAmount}/mo</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="text-gray-400 p-1 hover:text-primary transition-colors">
                              {expandedUserPlanId === enrollment.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Transaction Details */}
                        {expandedUserPlanId === enrollment.id && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={4} className="px-8 py-6">
                              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                  <div>
                                    <h4 className="text-lg font-serif text-secondary font-semibold">Transaction History</h4>
                                    <p className="text-xs text-gray-500 mt-1">All payments made by this customer for this scheme.</p>
                                  </div>
                                  
                                  {enrollment.status !== 'REDEEMED' && (
                                    <button 
                                      onClick={() => handleRedeem(enrollment.id)}
                                      disabled={isRedeeming}
                                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors shadow-sm"
                                    >
                                      <CheckCircle size={16} />
                                      <span>Redeem Scheme</span>
                                    </button>
                                  )}
                                </div>

                                {isFetchingTransactions ? (
                                  <div className="text-center py-8 text-gray-400">Loading transactions...</div>
                                ) : transactions.length === 0 ? (
                                  <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                                    <Clock size={24} className="mb-2 opacity-50" />
                                    <p>No transactions found for this scheme.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {transactions.map(tx => (
                                      <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-50 hover:border-primary/20 transition-colors bg-gray-50/50">
                                        <div className="flex items-center space-x-3">
                                          <div className="p-2 bg-green-100 text-green-700 rounded-full">
                                            <ArrowRight size={14} />
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700 text-sm">Payment</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{new Date(tx.createdAt).toLocaleString()}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-bold text-secondary">₹{tx.amount}</p>
                                          <p className={`text-[10px] font-bold tracking-wider uppercase ${tx.status === 'VERIFIED' || tx.status === 'SUCCESS' ? 'text-green-600' : 'text-amber-600'}`}>{tx.status}</p>
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 font-medium bg-white rounded-xl shadow-sm border border-primary/10 flex flex-col items-center">
          <Layers size={48} className="text-gray-300 mb-4" />
          No scheme found for this category.
        </div>
      )}

      <ReceiptModal 
        isOpen={!!receiptData} 
        onClose={() => setReceiptData(null)} 
        data={receiptData} 
      />
    </div>
  );
};

export default PlansManagement;
