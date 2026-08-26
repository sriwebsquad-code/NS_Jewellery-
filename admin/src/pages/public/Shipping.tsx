
import { Link } from 'react-router-dom';

const Shipping = () => {
  return (
    <div className="min-h-screen bg-amber-50 py-12 px-6 md:px-20">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-md rounded-lg">
        <div className="mb-8">
          <Link to="/" className="text-amber-600 hover:text-amber-800 font-medium">&larr; Back to Home</Link>
        </div>
        <h1 className="text-3xl font-serif text-amber-900 font-bold mb-6">Shipping & Delivery Policy</h1>
        
        <div className="prose text-gray-700">
          <h3 className="text-xl font-bold mt-6 mb-2">Delivery Timelines</h3>
          <p>We process all physical jewellery redemptions and orders within 3-5 business days. Transit time varies between 3 to 7 business days depending on your location in India.</p>
          
          <h3 className="text-xl font-bold mt-6 mb-2">Shipping Costs</h3>
          <p>For return shipping, customers will be responsible for paying their own shipping costs. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>

          <h3 className="text-xl font-bold mt-6 mb-2">In-Store Pickup</h3>
          <p>We highly recommend local customers to pick up their physical jewellery directly from our flagship store in Cuddalore to ensure the highest safety and security of your investment.</p>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
