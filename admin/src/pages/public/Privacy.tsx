import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-amber-50 py-12 px-6 md:px-20">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-md rounded-lg">
        <div className="mb-8">
          <Link to="/" className="text-amber-600 hover:text-amber-800 font-medium">&larr; Back to Home</Link>
        </div>
        <h1 className="text-3xl font-serif text-amber-900 font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose text-gray-700">
          <p><strong>Last Updated: August 26, 2026</strong></p>
          
          <h3 className="text-xl font-bold mt-6 mb-2">Personal Data</h3>
          <p>Personal Information means and includes all information such as name, address, phone number, DOB, and payment details that may have been voluntarily provided by the user. This data is securely stored and never sold to third parties.</p>
          
          <h3 className="text-xl font-bold mt-6 mb-2">Use of Information</h3>
          <p>We use your information to facilitate your gold savings schemes, verify your identity for compliance, process transactions, and provide customer support.</p>

          <h3 className="text-xl font-bold mt-6 mb-2">Data Security</h3>
          <p>We employ stringent security measures to protect your personal data from unauthorized access, alteration, or destruction.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
