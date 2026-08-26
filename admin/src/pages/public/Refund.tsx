import React from 'react';
import { Link } from 'react-router-dom';

const Refund = () => {
  return (
    <div className="min-h-screen bg-amber-50 py-12 px-6 md:px-20">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-md rounded-lg">
        <div className="mb-8">
          <Link to="/" className="text-amber-600 hover:text-amber-800 font-medium">&larr; Back to Home</Link>
        </div>
        <h1 className="text-3xl font-serif text-amber-900 font-bold mb-6">Refund & Cancellation Policy</h1>
        
        <div className="prose text-gray-700">
          <h3 className="text-xl font-bold mt-6 mb-2">Cancellation Policy</h3>
          <p>Once an order is successfully placed but not confirmed, it can be cancelled by either the buyer or the seller. Once an order is confirmed, it cannot be cancelled if dispatched. For customized jewellery, orders once confirmed cannot be cancelled under any circumstances.</p>
          
          <h3 className="text-xl font-bold mt-6 mb-2">Return Policy</h3>
          <p>Return requests will be accepted only when an order is delivered successfully. Returns will be accepted up to 10 days post successful delivery. Items weighing below 4 grams of Gold, 50 grams of silver, and customised Jewellery are not eligible for returns.</p>

          <h3 className="text-xl font-bold mt-6 mb-2">Refund Policy</h3>
          <p>In order to be eligible for a refund, you have to return the product within 10 calendar days in the exact same condition that you received it. The money will be refunded to the original payment method you used. If the product is damaged in any way, you will not be eligible for a refund.</p>
        </div>
      </div>
    </div>
  );
};

export default Refund;
