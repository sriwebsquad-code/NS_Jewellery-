import React, { useState, useEffect } from 'react';
import { Users, Gem, TrendingUp, Landmark, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';

const Dashboard: React.FC = () => {
  const [statsData, setStatsData] = useState<any>({
    totalUsers: 0,
    activePlans: 0,
    plansBreakdown: { goldValue: 0, silverValue: 0, goldWeight: 0, silverWeight: 0 },
    totalGoldMembers: 0,
    totalSilverMembers: 0,
    totalGoldWeight: 0,
    totalSilverWeight: 0,
    monthlyRevenue: 0,
    recentActions: []
  });

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetch('https://ns-jewellery.onrender.com/api/admin/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatsData(data.data);
        }
      })
      .catch(err => console.error('Error fetching dashboard stats:', err));
  }, [token]);

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value?.toLocaleString() || 0}`;
  };

  const toggleCard = (card: string) => {
    setExpandedCard(expandedCard === card ? null : card);
  };

  const stats = [
    { label: 'Total Users', value: statsData.totalUsers.toString(), icon: <Users size={24} className="text-secondary" />, expandable: false },
    { 
      label: 'Active Plans', 
      value: statsData.activePlans.toString(), 
      icon: <Landmark size={24} className="text-secondary" />, 
      expandable: true,
      id: 'plans'
    },
    { 
      label: 'Total Jewellery', 
      value: (statsData.totalGoldMembers + statsData.totalSilverMembers).toString(), 
      icon: <Gem size={24} className="text-secondary" />, 
      expandable: true,
      id: 'jewellery'
    },
    { label: 'Monthly Revenue', value: formatCurrency(statsData.monthlyRevenue), icon: <TrendingUp size={24} className="text-primary" />, expandable: false },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className={`glass-card p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${stat.expandable ? 'cursor-pointer hover:border-primary/30' : ''} ${expandedCard === stat.id && stat.expandable ? 'ring-2 ring-primary border-transparent shadow-lg shadow-primary/10' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => stat.expandable ? toggleCard(stat.id!) : null}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 80, className: 'text-gray-900' })}
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/50 rounded-xl shadow-sm backdrop-blur-md">
                  {stat.icon}
                </div>
                {stat.expandable && (
                  <div className="p-1 bg-gray-50 rounded-full text-gray-400 group-hover:text-primary transition-colors">
                    {expandedCard === stat.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1 tracking-wide uppercase">{stat.label}</p>
                <h3 className="text-4xl font-serif text-secondary tracking-tight">{stat.value}</h3>
              </div>
            </div>

            {/* Expanded Content for Plans */}
            {expandedCard === 'plans' && stat.id === 'plans' && (
              <div className="mt-4 pt-4 border-t border-gray-100 relative z-10 animate-fade-in space-y-2">
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">Gold Value Schemes :</span>
                  <span className="font-bold text-secondary text-base">{statsData.plansBreakdown?.goldValue || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">Silver Value Schemes:</span>
                  <span className="font-bold text-secondary text-base">{statsData.plansBreakdown?.silverValue || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">Gold Weight Schemes:</span>
                  <span className="font-bold text-secondary text-base">{statsData.plansBreakdown?.goldWeight || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">Silver Weight Schemes:</span>
                  <span className="font-bold text-secondary text-base">{statsData.plansBreakdown?.silverWeight || 0}</span>
                </div>
              </div>
            )}

            {/* Expanded Content for Jewellery */}
            {expandedCard === 'jewellery' && stat.id === 'jewellery' && (
              <div className="mt-6 pt-4 border-t border-gray-100 relative z-10 animate-fade-in space-y-3">
                <div className="bg-[#D4AF37]/10 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Total Gold</span>
                  <span className="text-lg font-serif font-bold text-[#D4AF37]">{(statsData.totalGoldWeight || 0).toFixed(4)}g</span>
                </div>
                <div className="bg-[#C0C0C0]/20 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Total Silver</span>
                  <span className="text-lg font-serif font-bold text-gray-600">{(statsData.totalSilverWeight || 0).toFixed(4)}g</span>
                </div>
              </div>
            )}
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
             {statsData.recentActions && statsData.recentActions.length > 0 ? (
               statsData.recentActions.map((action: any, i: number) => (
                <div key={i} className="flex items-center space-x-4 p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-colors cursor-pointer border border-transparent hover:border-primary/10">
                  <div className="w-10 h-10 rounded-full bg-background border border-primary/20 flex items-center justify-center text-primary text-sm font-bold font-serif shadow-sm uppercase">
                    {action.user ? action.user.substring(0, 2) : 'US'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{action.title}</p>
                    <p className="text-xs text-gray-600 font-medium">{action.user}</p>
                    <p className="text-[10px] text-gray-400 flex items-center mt-0.5">
                      <Clock size={10} className="mr-1" />
                      {action.time ? formatDistanceToNow(new Date(action.time), { addSuffix: true }) : 'Recently'}
                    </p>
                  </div>
                </div>
               ))
             ) : (
               <div className="text-center text-gray-400 text-sm py-10">
                 No recent actions found.
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
