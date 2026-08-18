import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Search, Filter, RefreshCw, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const TransactionsManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const url = new URL('https://ns-jewellery.onrender.com/api/admin/transactions');
      if (statusFilter) url.searchParams.append('status', statusFilter);
      
      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string, model: string, status: string) => {
    if (!window.confirm(`Are you sure you want to mark this transaction as ${status}?`)) return;
    
    try {
      const response = await fetch(`https://ns-jewellery.onrender.com/api/admin/transactions/${id}/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ model, status })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Transaction marked as ${status}`);
        fetchTransactions();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Verification failed', error);
      alert('Verification failed');
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.user?.phone?.includes(searchQuery) || 
    t.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-primary/10 gap-4">
        <div>
          <h2 className="text-3xl font-serif text-secondary">Payments & Transactions</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Verify payments and generate receipts.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input 
              type="text" 
              placeholder="Search phone, name, ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm text-secondary"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm text-secondary appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success / Paid</option>
              <option value="FAILED">Failed</option>
            </select>
            <Filter size={14} className="absolute left-3 top-3 text-gray-400" />
          </div>

          <button onClick={fetchTransactions} className="bg-primary/10 text-primary p-2 rounded hover:bg-primary/20 transition-colors">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background text-gray-500 text-[10px] uppercase tracking-widest border-b border-primary/10">
                <th className="px-6 py-4 font-semibold">Date & ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Type & Details</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard size={48} className="mb-4 opacity-20" />
                      <p>No transactions found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-secondary">
                        {new Date(txn.date).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-mono mt-1" title={txn.id}>
                        ...{txn.id.substring(txn.id.length - 8)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-secondary">{txn.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{txn.user?.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider mb-1">
                        {txn.type.replace(/_/g, ' ')}
                      </span>
                      <p className="text-sm text-gray-600">{txn.details}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-serif font-bold text-secondary text-lg">₹{txn.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {txn.status === 'PENDING' && <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold uppercase tracking-wider"><RefreshCw size={12} /><span>Pending</span></span>}
                      {(txn.status === 'SUCCESS' || txn.status === 'PAID') && <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider"><CheckCircle size={12} /><span>Success</span></span>}
                      {txn.status === 'FAILED' && <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider"><XCircle size={12} /><span>Failed</span></span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {txn.status === 'PENDING' ? (
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleVerify(txn.id, txn.model, txn.model === 'installment' ? 'PAID' : 'SUCCESS')} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors" title="Verify Payment">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleVerify(txn.id, txn.model, 'FAILED')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors" title="Mark Failed">
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="View Receipt" onClick={() => alert('Receipt generation coming soon!')}>
                          <FileText size={18} />
                        </button>
                      )}
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

export default TransactionsManagement;
