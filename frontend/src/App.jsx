import React, { useState, useEffect } from 'react';
import { checkNotificationPermission, checkAndSendNotifications } from './utils/notificationUtils';
import Header from './components/layout/Header';
import TabNavigation from './components/layout/TabNavigation';
import { vehicleService, homeRentService, electricityService } from './services';
import Toolbar from './components/layout/Toolbar';
import StatusLegend from './components/common/StatusLegend';
import VehiclesContainer from './components/vehicles/VehiclesContainer';
import HomeRentsContainer from './components/homeRents/HomeRentsContainer';
import ConfirmDialog from './components/common/ConfirmDialog';
// Live data only - no mock data
import ElectricityContainer from './components/electricity/ElectricityContainer';

const App = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [counts, setCounts] = useState({
    vehicles: 0,
    homeRents: 0,
    electricity: 0
  });

  useEffect(() => {
    // طلب إذن الإشعارات عند بدء التطبيق
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
        [type + 's']: count  // Add 's' to match the counts object keys
      }));
    };

    window.addEventListener('itemCountUpdate', handleCountUpdate);

    // Check notifications hourly with live data
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
    // Smooth tab transition
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full overflow-hidden">
      <Header />

      {/* Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        vehiclesCount={counts.vehicles}
        homeRentsCount={counts.homeRents}
        electricityCount={counts.electricity}
      />

      {/* Toolbar */}

      <StatusLegend />

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
