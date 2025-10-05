import api from './api';

const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    return await api.get('/dashboard/stats');
  },

  // Get counts for all items
  getCounts: async () => {
    return await api.get('/dashboard/counts');
  },

  // Health check
  healthCheck: async () => {
    return await api.get('/health');
  }
};

export default dashboardService;