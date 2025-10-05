import api from './api';

const vehicleService = {
  // Get all vehicles
  getAll: async (params = {}) => {
    return await api.get('/vehicles', params);
  },

  // Get single vehicle by ID
  getById: async (id) => {
    return await api.get(`/vehicles/${id}`);
  },

  // Create new vehicle
  create: async (vehicleData) => {
    return await api.post('/vehicles', vehicleData);
  },

  // Update vehicle
  update: async (id, vehicleData) => {
    return await api.put(`/vehicles/${id}`, vehicleData);
  },

  // Delete vehicle
  delete: async (id) => {
    return await api.delete(`/vehicles/${id}`);
  },

  // Get count
  getCount: async () => {
    return await api.get('/vehicles/count/total');
  },

  // Search vehicles
  search: async (searchTerm, status = 'all') => {
    return await api.get('/vehicles', { search: searchTerm, status });
  }
};

export default vehicleService;