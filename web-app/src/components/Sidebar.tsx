import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="fixed left-0 top-0 h-full w-48 bg-white shadow-lg flex flex-col py-8 z-30">
      <nav className="flex flex-col gap-4 px-6">
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
    </aside>
  );
};

export default Sidebar;
