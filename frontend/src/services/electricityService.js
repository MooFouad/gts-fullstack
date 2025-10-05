import api from './api';

const electricityService = {
  // Get all electricity bills
  getAll: async (params = {}) => {
    return await api.get('/electricity', params);
  },

  // Get single electricity bill by ID
  getById: async (id) => {
    return await api.get(`/electricity/${id}`);
  },

  // Create new electricity bill
  create: async (electricityData) => {
    return await api.post('/electricity', electricityData);
  },

  // Update electricity bill
  update: async (id, electricityData) => {
    return await api.put(`/electricity/${id}`, electricityData);
  },

  // Delete electricity bill
  delete: async (id) => {
    return await api.delete(`/electricity/${id}`);
  },

  // Get count
  getCount: async () => {
    return await api.get('/electricity/count/total');
  },

  // Search electricity bills
  search: async (searchTerm, status = 'all') => {
    return await api.get('/electricity', { search: searchTerm, status });
  }
};

export default electricityService;