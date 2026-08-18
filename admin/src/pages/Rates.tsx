import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Save } from 'lucide-react';

const RatesManagement: React.FC = () => {
  const [goldRate, setGoldRate] = useState('7,250');
  const [silverRate, setSilverRate] = useState('85');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rates');
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goldRate, silverRate })
      });
      const data = await response.json();
      if (data.success) {
        setLastUpdated(new Date(data.data.updatedAt).toLocaleString());
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center glass-panel p-6 rounded-2xl shadow-sm">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Live Metal Rates</h2>
        <div className="flex items-center text-sm font-medium text-secondary bg-secondary/10 px-4 py-2 rounded-full space-x-2">
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="glass-card p-8 rounded-3xl shadow-lg border border-white/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary-light to-secondary" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 mt-4">
          <div className="space-y-6 relative p-6 bg-white/40 rounded-2xl border border-white hover:bg-white/60 transition-colors">
            <div className="flex items-center space-x-4 text-primary">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
                <TrendingUp size={24} color="white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 tracking-tight">22K Gold Rate</h3>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">Per Gram (₹)</label>
              <input
                type="text"
                value={goldRate}
                onChange={(e) => setGoldRate(e.target.value)}
                className="w-full text-4xl font-black text-gray-900 px-6 py-4 rounded-2xl border-2 border-primary/20 bg-white/80 focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none shadow-sm"
              />
            </div>
            <p className="text-sm font-medium text-gray-500">Applies to all 22K jewellery and digital gold purchases.</p>
          </div>

          <div className="space-y-6 relative p-6 bg-white/40 rounded-2xl border border-white hover:bg-white/60 transition-colors">
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-300 flex items-center justify-center shadow-md">
                <TrendingUp size={24} color="white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Pure Silver Rate</h3>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">Per Gram (₹)</label>
              <input
                type="text"
                value={silverRate}
                onChange={(e) => setSilverRate(e.target.value)}
                className="w-full text-4xl font-black text-gray-900 px-6 py-4 rounded-2xl border-2 border-gray-200 bg-white/80 focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all outline-none shadow-sm"
              />
            </div>
            <p className="text-sm font-medium text-gray-500">Applies to all silver items and digital silver purchases.</p>
          </div>
        </div>

        <div className="flex justify-end pt-8 border-t border-gray-200/50">
          <button type="submit" disabled={isLoading} className="bg-gradient-to-r from-secondary to-secondary-light text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center space-x-3 hover:shadow-xl hover:shadow-secondary/30 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none disabled:hover:shadow-none">
            {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
            <span>Update Live Rates</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatesManagement;
