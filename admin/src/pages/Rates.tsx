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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Live Metal Rates</h2>
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          <RefreshCw size={14} className="animate-spin-slow" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-primary">
              <TrendingUp size={24} />
              <h3 className="text-xl font-bold text-gray-800">22K Gold Rate</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Gram (₹)</label>
              <input
                type="text"
                value={goldRate}
                onChange={(e) => setGoldRate(e.target.value)}
                className="w-full text-3xl font-bold text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none"
              />
            </div>
            <p className="text-sm text-gray-500">Applies to all 22K jewellery and digital gold purchases.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-400">
              <TrendingUp size={24} />
              <h3 className="text-xl font-bold text-gray-800">Pure Silver Rate</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Gram (₹)</label>
              <input
                type="text"
                value={silverRate}
                onChange={(e) => setSilverRate(e.target.value)}
                className="w-full text-3xl font-bold text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors outline-none"
              />
            </div>
            <p className="text-sm text-gray-500">Applies to all silver items and digital silver purchases.</p>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button type="submit" disabled={isLoading} className="bg-secondary text-white px-8 py-3 rounded-xl font-medium flex items-center space-x-2 hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 disabled:opacity-70">
            <Save size={20} />
            <span>{isLoading ? 'Updating...' : 'Update Rates'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatesManagement;
