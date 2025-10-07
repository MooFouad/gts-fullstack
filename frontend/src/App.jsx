import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { checkNotificationPermission, checkAndSendNotifications } from './utils/notificationUtils';
import Header from './components/layout/Header';
import TabNavigation from './components/layout/TabNavigation';
import NotificationSettings from './components/common/NotificationSettings';
import { vehicleService, homeRentService, electricityService } from './services';
import Toolbar from './components/layout/Toolbar';
import StatusLegend from './components/common/StatusLegend';
import VehiclesContainer from './components/vehicles/VehiclesContainer';
import HomeRentsContainer from './components/homeRents/HomeRentsContainer';
import ConfirmDialog from './components/common/ConfirmDialog';
import ElectricityContainer from './components/electricity/ElectricityContainer';

const App = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [showSettings, setShowSettings] = useState(false);
  const [counts, setCounts] = useState({
    vehicles: 0,
    homeRents: 0,
    electricity: 0
  });

  useEffect(() => {
    // Request notification permission on startup
    checkNotificationPermission();

    // Fetch initial counts from API
    const fetchCounts = async () => {
      try {
        const [vehiclesCount, homeRentsCount, electricityCount] = await Promise.all([
          vehicleService.getCount(),
          homeRentService.getCount(),
          electricityService.getCount()
        ]);

        setCounts({
          vehicles: vehiclesCount.count,
          homeRents: homeRentsCount.count,
          electricity: electricityCount.count
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();

    // Listen for count updates
    const handleCountUpdate = (event) => {
      const { type, count } = event.detail;
      setCounts(prevCounts => ({
        ...prevCounts,
        [type + 's']: count
      }));
    };

    window.addEventListener('itemCountUpdate', handleCountUpdate);

    // Check notifications hourly (browser-side backup)
    const checkInterval = setInterval(async () => {
      try {
        const [vehicles, homeRents, electricity] = await Promise.all([
          vehicleService.getAll(),
          homeRentService.getAll(),
          electricityService.getAll()
        ]);
        checkAndSendNotifications(vehicles, 'vehicle');
        checkAndSendNotifications(homeRents, 'homeRent');
        checkAndSendNotifications(electricity, 'electricity');
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    }, 60 * 60 * 1000);

    return () => {
      window.removeEventListener('itemCountUpdate', handleCountUpdate);
      clearInterval(checkInterval);
    };
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full overflow-hidden">
      <Header />

      {/* Navigation with Settings Button */}
      <div className="bg-gray-50 border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            vehiclesCount={counts.vehicles}
            homeRentsCount={counts.homeRents}
            electricityCount={counts.electricity}
          />
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
            title="Notification Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <StatusLegend />

      {/* Notification Settings Panel */}
      {showSettings && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <NotificationSettings />
        </div>
      )}

      <div className="p-2 sm:p-4 overflow-x-auto">
        <div className={activeTab === 'vehicles' ? 'block' : 'hidden'}>
          <VehiclesContainer />
        </div>

        <div className={activeTab === 'homeRents' ? 'block' : 'hidden'}>
          <HomeRentsContainer />
        </div>

        <div className={activeTab === 'electricity' ? 'block' : 'hidden'}>
          <ElectricityContainer />
        </div>
      </div>
    </div>
  );
};

export default App;