import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-48 bg-white shadow-lg flex flex-col py-8 z-30">
      <nav className="flex flex-col flex-grow gap-4 px-6">
        <Link
          to="/transactions"
          className={`py-2 px-4 rounded text-lg font-medium transition-colors duration-150 ${location.pathname === '/transactions' || location.pathname === '/' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          Transactions
        </Link>
        <Link
          to="/categories"
          className={`py-2 px-4 rounded text-lg font-medium transition-colors duration-150 ${location.pathname === '/categories' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          Categories
        </Link>
      </nav>
      <div className="px-6">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 rounded text-lg font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
