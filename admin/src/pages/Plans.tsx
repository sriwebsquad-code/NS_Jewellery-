import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';

const PlansManagement: React.FC = () => {
  const [plans] = useState([
    { id: 1, name: '11-Month Swarna Plan', amount: '₹5,000/mo', duration: '11 Months', benefits: '1 Month Free Installment' },
    { id: 2, name: 'Silver Savings', amount: '₹1,000/mo', duration: '6 Months', benefits: 'Zero Making Charges' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Savings Plans</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-colors">
          <Plus size={20} />
          <span>Create New Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
                <Calendar size={24} />
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{plan.name}</h3>
            <p className="text-primary font-semibold text-lg mb-4">{plan.amount}</p>
            <div className="space-y-2 mt-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-gray-800">{plan.duration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Benefits</span>
                <span className="font-medium text-gray-800">{plan.benefits}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansManagement;
