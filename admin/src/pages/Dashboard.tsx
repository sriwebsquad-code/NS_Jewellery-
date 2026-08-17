import React from 'react';
import { Users, Gem, TrendingUp, Landmark } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Users', value: '1,245', icon: <Users size={24} className="text-blue-500" /> },
    { label: 'Active Plans', value: '850', icon: <Landmark size={24} className="text-green-500" /> },
    { label: 'Total Jewellery', value: '342', icon: <Gem size={24} className="text-purple-500" /> },
    { label: 'Monthly Revenue', value: '₹12.5L', icon: <TrendingUp size={24} className="text-primary" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          <div className="text-gray-400 text-sm flex h-full items-center justify-center pb-8">
            Chart integration pending...
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="font-semibold text-gray-800 mb-4">Gold/Silver Rates History</h3>
          <div className="text-gray-400 text-sm flex h-full items-center justify-center pb-8">
            Chart integration pending...
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
