// Central export for all services
import api from './api';
import vehicleService from './vehicleService';
import homeRentService from './homeRentService';
import electricityService from './electricityService';
import dashboardService from './dashboardService';

export {
  api,
  vehicleService,
  homeRentService,
  electricityService,
  dashboardService
};

export default {
  api,
  vehicle: vehicleService,
  homeRent: homeRentService,
  electricity: electricityService,
  dashboard: dashboardService
};