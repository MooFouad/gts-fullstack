import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/logo.svg"
            alt="GTS logo"
            className="h-12 sm:h-16 w-auto object-contain"
          />
          <h1 className="ml-4 text-xl sm:text-2xl font-bold text-gray-800 hidden sm:block">
            GTS Management
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center gap-2 text-gray-700">
            <User size={20} className="text-blue-600" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            title="Logout"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;