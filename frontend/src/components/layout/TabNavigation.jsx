import React from 'react';
import { Car, Home, Zap } from 'lucide-react';

const TabNavigation = ({ activeTab, onTabChange, vehiclesCount, homeRentsCount, electricityCount }) => {
const handleTabChange = (tab) => {
    // Smooth transition
    if (tab !== activeTab) {
      onTabChange(tab);
    }
  };

  return (
    <div className="border-b overflow-x-auto bg-white sticky top-0 z-10">
      <div className="flex flex-wrap sm:flex-nowrap min-w-max sm:min-w-0">
      <button
      onClick={() => handleTabChange('vehicles')}
      className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
            activeTab === 'vehicles'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
      >
      <Car size={20} />
      vehicles ({vehiclesCount})
      </button>
      <button
      onClick={() => handleTabChange('homeRents')}
      className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
            activeTab === 'homeRents'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
      >
      <Home size={20} />
      Home Rents ({homeRentsCount})
      </button>
      <button
      onClick={() => handleTabChange('electricity')}
      className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
            activeTab === 'electricity'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
      >
      <Zap size={20} />
      Electricity ({electricityCount})
      </button>
      </div>
</div>
);
};

export default TabNavigation;