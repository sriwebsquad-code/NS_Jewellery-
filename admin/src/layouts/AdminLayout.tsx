import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Users, Gem, Landmark, ShieldCheck, LogOut, TrendingUp } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Jewellery', path: '/jewellery', icon: <Gem size={20} /> },
    { name: 'Savings Plans', path: '/plans', icon: <Landmark size={20} /> },
    { name: 'Live Rates', path: '/rates', icon: <TrendingUp size={20} /> },
    { name: 'Admin Settings', path: '/settings', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-secondary">NS Jewellery</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center space-x-3 text-gray-700 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-500 p-3 w-full rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
          <div className="flex items-center space-x-4">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
              Admin
            </span>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
