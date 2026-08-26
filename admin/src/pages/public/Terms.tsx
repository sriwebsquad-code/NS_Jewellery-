import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-amber-50 py-12 px-6 md:px-20">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-md rounded-lg">
        <div className="mb-8">
          <Link to="/" className="text-amber-600 hover:text-amber-800 font-medium">&larr; Back to Home</Link>
        </div>
        <h1 className="text-3xl font-serif text-amber-900 font-bold mb-6">Terms & Conditions</h1>
        
        <div className="prose text-gray-700">
          <p><strong>Last Updated: August 26, 2026</strong></p>
          
          <h3 className="text-xl font-bold mt-6 mb-2">1. Introduction</h3>
          <p>Welcome to NS Mahaveer Jewellery. By accessing our app and website, you agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
          
          <h3 className="text-xl font-bold mt-6 mb-2">2. Eligibility</h3>
          <p>You must be at least 18 years of age to use our services. By using our platform, you warrant that you meet this requirement and are legally capable of entering into binding contracts.</p>

          <h3 className="text-xl font-bold mt-6 mb-2">3. Savings Plans and Digital Gold</h3>
          <p>Our monthly savings plans and digital gold wallet are subject to live market rates. The accumulated weight or value cannot be encashed; it must be redeemed against physical jewellery purchases at our store.</p>

          <h3 className="text-xl font-bold mt-6 mb-2">4. KYC Requirements</h3>
          <p>As per Indian regulations, we require valid KYC (Aadhaar/PAN) for specific transaction thresholds. You agree to provide accurate information during verification.</p>

          <h3 className="text-xl font-bold mt-6 mb-2">5. Contact Information</h3>
          <p>If you have any questions regarding these terms, please contact us at support@nsmahaveer.com.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
