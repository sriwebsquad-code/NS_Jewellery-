import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Users, Gem, Landmark, ShieldCheck, LogOut, TrendingUp, CreditCard, X, MapPin, Phone, Clock } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [showAbout, setShowAbout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Live Rates', path: '/rates', icon: <TrendingUp size={20} /> },
    { name: 'Jewellery', path: '/jewellery', icon: <Gem size={20} /> },
    { name: 'Transactions', path: '/transactions', icon: <CreditCard size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Digital Customers', path: '/digital-customers', icon: <Users size={20} /> },
    { name: 'Value Based Schemes', path: '/plans/value', icon: <Landmark size={20} /> },
    { name: 'Weight Based Schemes', path: '/plans/weight', icon: <Landmark size={20} /> },
    { name: 'Admin Settings', path: '/settings', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white m-4 rounded-xl flex flex-col z-10 overflow-hidden shadow-sm border border-primary/10">
        <div className="p-6">
          <div className="w-40 mx-auto mb-4 flex items-center justify-center">
            <img src="/rn_new_logo.png" alt="RN Logo" className="w-full h-auto object-contain" />
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest text-center">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 group ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-secondary'
                }`}
              >
                <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white drop-shadow-sm' : 'text-primary/60 group-hover:text-primary'}`}>
                  {item.icon}
                </div>
                <span className={`font-medium ${isActive ? 'font-semibold tracking-wide' : ''}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/20 bg-white/30">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-3 text-red-500 p-3 w-full rounded-xl hover:bg-red-50 hover:shadow-sm transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col z-10">
        <header className="bg-white m-4 rounded-xl p-5 flex justify-between items-center shadow-sm border border-primary/10">
          <h2 className="text-2xl font-serif text-secondary animate-fade-in">Overview</h2>
          
          <div className="flex items-center space-x-4 relative">
            <button 
              onClick={() => setShowAbout(true)}
              className="flex items-center space-x-3 bg-background px-4 py-2 rounded-full shadow-sm border border-primary/10 hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">
                A
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-[#D4AF37] leading-tight">NS Admin</span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Superadmin</span>
              </div>
            </button>
          </div>
        </header>
        
        <div className="p-6 pt-2 flex-1 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* About Us Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold font-serif text-secondary">Admin NS Mahaveer</h3>
              <button 
                onClick={() => setShowAbout(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-1 rounded-full shadow-sm border border-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-center mb-2">
                <div className="w-32 mx-auto flex items-center justify-center">
                  <img src="/rn_new_logo.png" alt="RN Logo" className="w-full h-auto object-contain" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                  Established: Since 1962
                </span>
                <p className="text-gray-600 text-sm leading-relaxed italic">
                  "A legacy of purity and trust. NS Mahaveer Jewellery has been a well-known and trusted establishment in Cuddalore for over six decades, offering premium gold, silver, and traditional jewellery."
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-start space-x-3 text-sm">
                  <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
                  <p className="text-gray-600 leading-relaxed">
                    40-41, Lawrence Road, Muthaiya Nagar, Thirupapuliyur, Cuddalore – 607002
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="text-primary shrink-0" size={18} />
                  <p className="text-gray-600">+91 7299573995</p>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Clock className="text-primary shrink-0" size={18} />
                  <p className="text-gray-600">Mon - Sun: 9:30 AM - 8:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;

