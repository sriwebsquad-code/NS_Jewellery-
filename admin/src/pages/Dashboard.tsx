import React, { useState, useEffect } from 'react';
import { Users, Gem, TrendingUp, Landmark, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const token = useAuthStore(state => state.token);
  const navigate = useNavigate();

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

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
      label: 'Digital Customers', 
      value: (statsData.totalGoldMembers + statsData.totalSilverMembers).toString(), 
      icon: <Gem size={24} className="text-secondary" />, 
      expandable: true,
      id: 'jewellery'
    },
    { 
      label: 'Monthly Revenue', 
      value: formatCurrency(statsData.monthlyRevenue), 
      icon: <TrendingUp size={24} className="text-primary" />, 
      expandable: true,
      id: 'revenue'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className={`glass-card p-6 flex flex-col rounded-2xl relative overflow-hidden transition-all duration-300 ${stat.expandable ? 'cursor-pointer hover:border-primary/30' : ''} ${expandedCards.has(stat.id!) && stat.expandable ? 'ring-2 ring-primary border-transparent shadow-lg shadow-primary/10' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => stat.expandable ? toggleCard(stat.id!) : null}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 80, className: 'text-gray-900' })}
            </div>
            
            <div className="relative z-10 flex flex-col flex-1 justify-between min-h-[120px]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/50 rounded-xl shadow-sm backdrop-blur-md">
                  {stat.icon}
                </div>
                {stat.expandable && (
                  <div className="p-1 bg-gray-50 rounded-full text-gray-400 group-hover:text-primary transition-colors">
                    {expandedCards.has(stat.id!) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1 tracking-wide uppercase">{stat.label}</p>
                <h3 className="text-4xl font-serif text-secondary tracking-tight">{stat.value}</h3>
              </div>
            </div>

            {/* Expanded Content for Plans */}
            {expandedCards.has('plans') && stat.id === 'plans' && (
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
            {expandedCards.has('jewellery') && stat.id === 'jewellery' && (
              <div className="mt-4 pt-4 border-t border-gray-100 relative z-10 animate-fade-in space-y-2">
                <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-[#D4AF37]/10 transition-colors">
                  <span className="text-gray-700 font-medium">Gold Customer : {statsData.totalGoldMembers || 0}</span>
                  <span className="font-bold text-[#D4AF37] text-base">{(statsData.totalGoldWeight || 0).toFixed(4)}g</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-[#C0C0C0]/20 transition-colors">
                  <span className="text-gray-700 font-medium">Silver Customer : {statsData.totalSilverMembers || 0}</span>
                  <span className="font-bold text-gray-600 text-base">{(statsData.totalSilverWeight || 0).toFixed(4)}g</span>
                </div>
              </div>
            )}

            {/* Expanded Content for Revenue */}
            {expandedCards.has('revenue') && stat.id === 'revenue' && (
              <div className="mt-4 pt-4 border-t border-gray-100 relative z-10 animate-fade-in space-y-2">
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">digisilver:</span>
                  <span className="font-bold text-secondary text-base">{formatCurrency(statsData.revenueBreakdown?.digiSilver || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">digigold :</span>
                  <span className="font-bold text-secondary text-base">{formatCurrency(statsData.revenueBreakdown?.digiGold || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">Gold Value Schemes :</span>
                  <span className="font-bold text-secondary text-base">{formatCurrency(statsData.revenueBreakdown?.goldValue || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">Silver Value Schemes:</span>
                  <span className="font-bold text-secondary text-base">{formatCurrency(statsData.revenueBreakdown?.silverValue || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">Gold Weight Schemes:</span>
                  <span className="font-bold text-secondary text-base">{formatCurrency(statsData.revenueBreakdown?.goldWeight || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">Silver Weight Schemes:</span>
                  <span className="font-bold text-secondary text-base">{formatCurrency(statsData.revenueBreakdown?.silverWeight || 0)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl min-h-[350px] relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
          <h3 className="font-serif text-secondary mb-6 text-2xl relative z-10 flex items-center">
            <TrendingUp className="mr-3 text-primary" size={24} />
            Revenue Analytics
          </h3>
          <div className="flex-1 relative z-10 min-h-[300px]">
            {statsData.dailyChartData && statsData.dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={statsData.dailyChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 10 }} 
                    interval={4}
                    dy={8}
                  />
                  <YAxis 
                    tickFormatter={(val) => val === 0 ? '₹0' : `₹${(val/1000).toFixed(1)}k`} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 11 }} 
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `₹${Number(value || 0).toLocaleString()}`, 
                      name === 'gold' ? 'Digi Gold' : 'Digi Silver'
                    ]}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #f3f0e8', 
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                      fontSize: '13px'
                    }}
                    labelStyle={{ fontWeight: 600, color: '#374151' }}
                  />
                  <Legend 
                    formatter={(value) => value === 'gold' ? 'Digi Gold' : 'Digi Silver'}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gold" 
                    stroke="#D4AF37" 
                    strokeWidth={2.5} 
                    dot={false}
                    activeDot={{ r: 5, fill: '#D4AF37' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="silver" 
                    stroke="#9ca3af" 
                    strokeWidth={2.5} 
                    dot={false}
                    activeDot={{ r: 5, fill: '#9ca3af' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm flex flex-col h-full items-center justify-center pb-8">
                <TrendingUp size={48} className="text-primary/20 mb-4" />
                <span>No digital transactions in the last 30 days</span>
              </div>
            )}
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl min-h-[350px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />
          <h3 className="font-serif text-secondary mb-4 text-2xl relative z-10">Recent Actions</h3>
          <div className="space-y-3 relative z-10 overflow-y-auto max-h-[380px] pr-1">
              {statsData.recentActions && statsData.recentActions.length > 0 ? (
                statsData.recentActions.map((action: any, i: number) => (
                 <div 
                   key={i} 
                   onClick={() => action.route ? navigate(action.route) : null}
                   className="flex items-center space-x-4 p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-colors cursor-pointer border border-transparent hover:border-primary/30 shadow-sm hover:shadow-md"
                 >
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
