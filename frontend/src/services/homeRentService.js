import api from './api';

const homeRentService = {
  // Get all home rents
  getAll: async (params = {}) => {
    return await api.get('/home-rents', params);
  },

  // Get single home rent by ID
  getById: async (id) => {
    return await api.get(`/home-rents/${id}`);
  },

  // Create new home rent
  create: async (homeRentData) => {
    return await api.post('/home-rents', homeRentData);
  },

  // Update home rent
  update: async (id, homeRentData) => {
    return await api.put(`/home-rents/${id}`, homeRentData);
  },

  // Delete home rent
  delete: async (id) => {
    return await api.delete(`/home-rents/${id}`);
  },

  // Get count
  getCount: async () => {
    return await api.get('/home-rents/count/total');
  },

  // Search home rents
  search: async (searchTerm, status = 'all') => {
    return await api.get('/home-rents', { search: searchTerm, status });
  }
};

export default homeRentService;