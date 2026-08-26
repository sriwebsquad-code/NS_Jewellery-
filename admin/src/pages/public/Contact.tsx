
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div className="min-h-screen bg-amber-50 py-12 px-6 md:px-20">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-md rounded-lg">
        <div className="mb-8">
          <Link to="/" className="text-amber-600 hover:text-amber-800 font-medium">&larr; Back to Home</Link>
        </div>
        <h1 className="text-3xl font-serif text-amber-900 font-bold mb-6">Contact Us</h1>
        
        <div className="prose text-gray-700">
          <p className="mb-6">If you have any questions, concerns, or need support with your digital gold wallet or savings plans, our team is always ready to assist you.</p>
          
          <h3 className="text-xl font-bold mt-6 mb-2">Flagship Store Address</h3>
          <p>
            NS Mahaveer Jewellery<br />
            40-41, Lawrence Road, Muthaiya Nagar<br />
            Thirupapuliyur, Cuddalore - 607002<br />
            Tamil Nadu, India
          </p>
          
          <h3 className="text-xl font-bold mt-6 mb-2">Customer Support</h3>
          <p><strong>Phone:</strong> +91 7299573995</p>
          <p><strong>Email:</strong> support@nsmahaveer.com</p>
          <p><strong>Business Hours:</strong> Monday - Sunday: 9:30 AM - 8:30 PM</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
