import React, { useState, useEffect } from 'react';
import { Users, Gem, TrendingUp, Landmark } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    activePlans: 0,
    totalJewellery: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    fetch('https://ns-jewellery.onrender.com/api/admin/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatsData(data.data);
        }
      })
      .catch(err => console.error('Error fetching dashboard stats:', err));
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString()}`;
  };

  const stats = [
    { label: 'Total Users', value: statsData.totalUsers.toString(), icon: <Users size={24} className="text-secondary" /> },
    { label: 'Active Plans', value: statsData.activePlans.toString(), icon: <Landmark size={24} className="text-secondary" /> },
    { label: 'Total Jewellery', value: statsData.totalJewellery.toString(), icon: <Gem size={24} className="text-secondary" /> },
    { label: 'Monthly Revenue', value: formatCurrency(statsData.monthlyRevenue), icon: <TrendingUp size={24} className="text-primary" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className="glass-card p-6 rounded-2xl glass-card-hover relative overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 80, className: 'text-gray-900' })}
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/50 rounded-xl shadow-sm backdrop-blur-md">
                  {stat.icon}
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-100/50 px-2 py-1 rounded-md backdrop-blur-md">+12%</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1 tracking-wide uppercase">{stat.label}</p>
                <h3 className="text-4xl font-serif text-secondary tracking-tight">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl min-h-[350px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
          <h3 className="font-serif text-secondary mb-6 text-2xl relative z-10">Revenue Analytics</h3>
          <div className="text-gray-400 text-sm flex flex-col h-full items-center justify-center pb-8 relative z-10">
            <TrendingUp size={48} className="text-primary/20 mb-4" />
            <span>Chart integration pending...</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl min-h-[350px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />
          <h3 className="font-serif text-secondary mb-6 text-2xl relative z-10">Recent Actions</h3>
          <div className="space-y-4 relative z-10">
             {[1,2,3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-background border border-primary/20 flex items-center justify-center text-primary text-xs font-bold font-serif">
                    US
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">User Registered</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
