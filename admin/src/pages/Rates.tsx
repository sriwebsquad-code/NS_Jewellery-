import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Save, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface RateHistory {
  id: string;
  goldRate: number;
  silverRate: number;
  effectiveDate: string;
  createdAt: string;
}

const RatesManagement: React.FC = () => {
  const [goldRate, setGoldRate] = useState('7,250');
  const [silverRate, setSilverRate] = useState('85');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 16));
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<RateHistory[]>([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchRates();
    fetchHistory();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch('https://ns-jewellery.onrender.com/api/rates');
      const data = await response.json();
      if (data.success && data.data) {
        setGoldRate(data.data.goldRate.toString());
        setSilverRate(data.data.silverRate.toString());
        setLastUpdated(new Date(data.data.updatedAt).toLocaleString());
      }
    } catch (error) {
      console.error('Failed to fetch rates:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('https://ns-jewellery.onrender.com/api/rates/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch rate history:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('https://ns-jewellery.onrender.com/api/rates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ goldRate, silverRate, effectiveDate })
      });
      const data = await response.json();
      if (data.success) {
        setLastUpdated(new Date(data.data.updatedAt).toLocaleString());
        fetchHistory(); // Refresh history table
        alert('Rates updated successfully!');
      } else {
        alert('Failed to update rates: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating rates:', error);
      alert('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-primary/10">
        <h2 className="text-3xl font-serif text-secondary">Live Metal Rates</h2>
        <div className="flex items-center text-sm font-medium text-secondary bg-primary/5 px-4 py-2 rounded border border-primary/10 space-x-2">
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-xl shadow-sm border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/40" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 mt-4">
          <div className="space-y-6 relative p-6 bg-background rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
            <div className="flex items-center space-x-4 text-primary">
              <div className="w-12 h-12 rounded bg-white border border-primary/20 flex items-center justify-center shadow-sm">
                <TrendingUp size={24} className="text-primary" />
              </div>
              <h3 className="text-2xl font-serif text-secondary">22K Gold Rate</h3>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-widest">Per Gram (₹)</label>
              <input
                type="text"
                value={goldRate}
                onChange={(e) => setGoldRate(e.target.value)}
                className="w-full text-4xl font-serif text-secondary px-4 py-3 rounded border border-primary/20 bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-6 relative p-6 bg-background rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="w-12 h-12 rounded bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <TrendingUp size={24} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-serif text-secondary">Pure Silver Rate</h3>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-widest">Per Gram (₹)</label>
              <input
                type="text"
                value={silverRate}
                onChange={(e) => setSilverRate(e.target.value)}
                className="w-full text-4xl font-serif text-secondary px-4 py-3 rounded border border-gray-200 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-t border-primary/10 pt-8">
          <div className="w-full md:w-1/2">
            <label className="block text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-widest">Effective Date & Time</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full text-secondary px-4 py-3 pl-10 rounded border border-primary/20 bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none font-medium"
              />
              <Calendar size={18} className="absolute left-3 top-3.5 text-primary" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-10 py-3 rounded shadow-sm hover:shadow-md transition-all font-semibold flex items-center justify-center space-x-2 tracking-wide uppercase text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <>
                <Save size={20} />
                <span>Save New Rates</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Rate History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden mt-8">
        <div className="p-6 border-b border-primary/10 flex justify-between items-center">
          <h3 className="text-xl font-serif text-secondary">Rate History Log</h3>
          <span className="text-xs bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded">Last 50 changes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background text-gray-500 text-[10px] uppercase tracking-widest border-b border-primary/10">
                <th className="px-6 py-4 font-semibold">Effective Date</th>
                <th className="px-6 py-4 font-semibold">Gold (22K)</th>
                <th className="px-6 py-4 font-semibold">Silver</th>
                <th className="px-6 py-4 font-semibold">Logged On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No rate history available</td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-secondary">
                      {new Date(record.effectiveDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-primary">₹{record.goldRate.toLocaleString()}</td>
                    <td className="px-6 py-4 font-serif font-bold text-gray-600">₹{record.silverRate.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(record.createdAt).toLocaleString()}
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

export default RatesManagement;
