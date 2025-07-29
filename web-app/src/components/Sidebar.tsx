import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Users } from 'lucide-react';

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
      <nav className="flex flex-col flex-grow px-6">
        <div className="flex flex-col gap-4">
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
        </div>
      </nav>
      <div className="px-6 flex gap-2">
        <Link
          to="/household-settings"
          className={`p-2 rounded transition-colors duration-150 flex items-center justify-center ${location.pathname === '/household-settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
          title="Household Members"
        >
          <Users className="w-5 h-5" />
        </Link>
        <button
          onClick={handleLogout}
          className="flex-1 py-2 px-4 rounded text-lg font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center justify-center"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
