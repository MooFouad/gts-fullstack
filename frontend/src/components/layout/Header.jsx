import React from 'react';

const Header = () => {
  return (
    <div className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="logo.png" 
            alt="GTS logo" 
            className="h-12 sm:h-16 w-auto object-contain" 
          />
          <h1 className="ml-4 text-xl sm:text-2xl font-bold text-gray-800 hidden sm:block">GTS Management</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-800 text-sm sm:text-base">Welcome</span>
        </div>
      </div>
    </div>
  );
};

export default Header;