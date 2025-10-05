import { useState, useEffect, useCallback } from 'react';
import { vehicleService, homeRentService, electricityService } from '../services';

// Map type to service
const serviceMap = {
  vehicle: vehicleService,
  homeRent: homeRentService,
  electricity: electricityService
};

export const useDataManagementNew = (type = 'vehicle') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const service = serviceMap[type];

  const fetchData = useCallback(async () => {
    if (!service) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await service.getAll();
      setData(result || []);
    } catch (err) {
      console.error(`Error fetching ${type} data:`, err);
      const errorMessage = err.message.includes('Failed to fetch') ? 
        'Could not connect to server. Please check if the backend is running.' : 
        err.message;
      setError(errorMessage);
      setData([]);
      // Retry after 5 seconds if it's a connection error
      if (err.message.includes('Failed to fetch')) {
        setTimeout(() => {
          console.log('Retrying connection...');
          fetchData();
        }, 5000);
      }
    } finally {
      setLoading(false);
    }
  }, [service, type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addItem = useCallback(async (newItem) => {
    try {
      setLoading(true);
      const result = await service.create(newItem);
      setData(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const updateItem = useCallback(async (id, updatedItem) => {
    if (!id) {
      throw new Error('No ID provided for update operation');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Updating item:', {
        id,
        updatedItem
      });
      
      const result = await service.update(id, updatedItem);
      
      setData(prev => prev.map(item => 
        item._id === id ? result : item
      ));
      
      return result;
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const deleteItem = useCallback(async (id) => {
    try {
      setLoading(true);
      await service.delete(id);
      setData(prev => prev.filter(item => item._id !== id && item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshData: fetchData
  };
};