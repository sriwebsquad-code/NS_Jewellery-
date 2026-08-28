
import { Link, useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src="/rn_logo_black.png" alt="RN Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-2xl font-serif text-amber-900 font-bold">NS Mahaveer Jewellery</h1>
        </div>
        <button 
          onClick={() => navigate('/admin')}
          className="text-amber-800 hover:text-amber-600 font-medium"
        >
          Staff Login
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-serif text-amber-900 font-bold mb-6">
          Premium Gold & Silver Savings
        </h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-10">
          Join our exclusive digital gold wallet and monthly savings plans to secure your future. 
          Download the NS Mahaveer app today and start investing with as little as ₹100.
        </p>
        <div className="flex space-x-4">
          <button className="bg-amber-600 text-white px-8 py-3 rounded-full font-bold hover:bg-amber-700 shadow-lg cursor-default">
            Download App (Coming Soon)
          </button>
        </div>
      </main>

      {/* Footer & Policies */}
      <footer className="bg-amber-900 text-amber-100 py-8 px-6 text-center">
        <div className="mb-6">
          <p className="font-bold text-xl text-white mb-2">NS Mahaveer Jewellery</p>
          <p>40-41, Lawrence Road, Muthaiya Nagar</p>
          <p>Thirupapuliyur, Cuddalore - 607002</p>
          <p>Contact: +91 84009 16916 | nsmahaveerjewellery@gmail.com</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
          <Link to="/terms" className="hover:text-white underline">Terms & Conditions</Link>
          <Link to="/privacy" className="hover:text-white underline">Privacy Policy</Link>
          <Link to="/refund" className="hover:text-white underline">Refund & Cancellation</Link>
          <Link to="/shipping" className="hover:text-white underline">Shipping Policy</Link>
          <Link to="/contact" className="hover:text-white underline">Contact Us</Link>
        </div>
        
        <p className="text-xs mt-8 opacity-70">
          &copy; {new Date().getFullYear()} NS Mahaveer Jewellery. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
