import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';

const PlansManagement: React.FC = () => {
  const [plans] = useState([
    { id: 1, name: '11-Month Swarna Plan', amount: '₹5,000/mo', duration: '11 Months', benefits: '1 Month Free Installment' },
    { id: 2, name: 'Silver Savings', amount: '₹1,000/mo', duration: '6 Months', benefits: 'Zero Making Charges' },
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center glass-panel p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Savings Plans</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage investment schemes.</p>
        </div>
        <button className="bg-gradient-to-r from-primary to-primary-light text-gray-900 px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 font-bold">
          <Plus size={20} />
          <span>Create New Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div key={plan.id} className="glass-card rounded-3xl shadow-lg border border-white/40 p-8 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 p-4 rounded-2xl text-secondary shadow-sm">
                <Calendar size={28} />
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-500 hover:text-white hover:bg-blue-500 p-2 rounded-xl transition-colors shadow-sm bg-white/50">
                  <Edit2 size={16} />
                </button>
                <button className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-colors shadow-sm bg-white/50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">{plan.name}</h3>
            <div className="inline-block bg-primary/10 px-3 py-1 rounded-lg mb-6 self-start border border-primary/20">
              <p className="text-primary font-bold text-lg">{plan.amount}</p>
            </div>
            
            <div className="space-y-4 mt-auto bg-white/40 p-4 rounded-2xl border border-white/60">
              <div className="flex justify-between items-center text-sm border-b border-gray-200/50 pb-2">
                <span className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Duration</span>
                <span className="font-bold text-gray-800">{plan.duration}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Benefits</span>
                <span className="font-bold text-green-600 bg-green-100/80 px-2 py-0.5 rounded-md text-right max-w-[150px] leading-tight">{plan.benefits}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansManagement;
