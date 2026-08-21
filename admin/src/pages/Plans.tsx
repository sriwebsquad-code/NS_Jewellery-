import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, X, Layers, Coins, Users as UsersIcon, ChevronDown, ChevronUp, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface PlansManagementProps {
  typeFilter: 'VALUE_BASED' | 'WEIGHT_BASED';
}

const PlansManagement: React.FC<PlansManagementProps> = ({ typeFilter }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const token = useAuthStore(state => state.token);

  // New Plan State
  const [name, setName] = useState('');
  const [durationMonths, setDurationMonths] = useState('11');
  const [minAmount, setMinAmount] = useState('1000');
  const [schemeType, setSchemeType] = useState(typeFilter);
  const [metalType, setMetalType] = useState('GOLD');

  // View Customers State
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planUsers, setPlanUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  
  // Transaction State
  const [expandedUserPlanId, setExpandedUserPlanId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    fetchPlans();
    setSchemeType(typeFilter);
    // When tab changes, close modal and form
    setIsAddingPlan(false);
    setIsModalOpen(false);
  }, [typeFilter]);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://ns-jewellery.onrender.com/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, durationMonths, minAmount, schemeType, metalType })
      });
      if (res.ok) {
        setIsAddingPlan(false);
        setName('');
        setDurationMonths('11');
        setMinAmount('1000');
        setSchemeType('VALUE_BASED');
        setMetalType('GOLD');
        fetchPlans();
      } else {
        alert('Failed to create plan');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to connect');
    }
  };

  const handleViewCustomers = async (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
    setIsFetchingUsers(true);
    setExpandedUserPlanId(null);
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
          <h2 className="text-3xl font-serif text-secondary">{typeFilter === 'VALUE_BASED' ? 'Value Based Schemes' : 'Weight Based Schemes'}</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage investment schemes and view enrollments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.filter(p => p.schemeType === typeFilter).map((plan, index) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-primary/10 p-6 flex flex-col h-full relative group hover:border-primary/40 transition-all hover:-translate-y-1" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Calendar size={24} />
              </div>
              <button className="text-gray-400 hover:text-red-500 transition-colors p-2">
                <Trash2 size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-serif text-secondary mb-3">{plan.name}</h3>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${plan.schemeType === 'WEIGHT_BASED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'} flex items-center`}>
                <Layers size={10} className="mr-1" />
                {plan.schemeType === 'WEIGHT_BASED' ? 'Weight Based' : 'Value Based'}
              </span>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${plan.metalType === 'SILVER' ? 'bg-gray-100 text-gray-600 border-gray-300' : 'bg-yellow-50 text-yellow-700 border-yellow-300'} flex items-center`}>
                <Coins size={10} className="mr-1" />
                {plan.metalType === 'SILVER' ? 'Silver' : 'Gold'}
              </span>
            </div>

            <div className="space-y-3 mt-auto pt-4 border-t border-primary/10 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Min Amount</span>
                <span className="font-bold text-secondary">₹{plan.minAmount} / mo</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Duration</span>
                <span className="font-bold text-secondary">{plan.durationMonths} Months</span>
              </div>
            </div>

            <button 
              onClick={() => handleViewCustomers(plan)}
              className="w-full mt-2 bg-gray-50 hover:bg-primary/10 text-primary border border-primary/20 py-2.5 rounded flex justify-center items-center space-x-2 transition-colors font-bold text-xs uppercase tracking-wider"
            >
              <UsersIcon size={16} />
              <span>View Customers</span>
            </button>
          </div>
        ))}
        {plans.filter(p => p.schemeType === typeFilter).length === 0 && !isAddingPlan && (
          <p className="text-gray-400 font-medium col-span-3 text-center py-12">No plans found.</p>
        )}
      </div>

      {/* Customer List Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-serif text-secondary">{selectedPlan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Customers currently enrolled in this scheme</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1">
              {isFetchingUsers ? (
                <div className="text-center py-12 text-gray-500 font-medium animate-pulse">Loading customers...</div>
              ) : planUsers.length === 0 ? (
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
                      {planUsers.map((enrollment, idx) => (
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
        </div>
      )}
    </div>
  );
};

export default PlansManagement;
