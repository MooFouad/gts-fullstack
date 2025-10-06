import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useDataManagementNew = (type) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getEndpoint = (type) => {
    switch(type) {
      case 'vehicle':
        return '/vehicles';
      case 'homeRent':
        return '/home-rents';
      case 'electricity':
        return '/electricity';
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = getEndpoint(type);
      console.log(`Fetching from: ${endpoint}`);
      const response = await api.get(endpoint);
      setData(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateData = useCallback((items) => {
    if (!Array.isArray(items)) {
      console.error('Invalid data format:', items);
      return [];
    }

    return items.map(item => {
      // Ensure all required fields exist
      const validatedItem = {
        _id: item._id || '',
        name: item.name || '',
        location: item.location || '',
        contractNumber: item.contractNumber || '',
        contractStartingDate: item.contractStartingDate || '',
        contractEndingDate: item.contractEndingDate || '',
        contractStatus: item.contractStatus || 'Active',
        rentAnnually: Number(item.rentAnnually) || 0,
        contactNo: item.contactNo || '',
        gts: item.gts || '',
        attachments: Array.isArray(item.attachments) ? item.attachments : []
      };

      // Ensure dates are in correct format
      try {
        if (validatedItem.contractStartingDate) {
          new Date(validatedItem.contractStartingDate).toISOString();
        }
        if (validatedItem.contractEndingDate) {
          new Date(validatedItem.contractEndingDate).toISOString();
        }
      } catch (error) {
        console.error('Invalid date format:', error);
      }

      return validatedItem;
    });
  }, []);

  const addItem = useCallback(async (newItem) => {
    try {
      const endpoint = `/${type}s`;
      const response = await api.post(endpoint, newItem);
      setData(prev => [...prev, response]);
      return response;
    } catch (err) {
      throw new Error(`Failed to add ${type}: ${err.message}`);
    }
  }, [type]);

  const updateItem = useCallback(async (id, updatedItem) => {
    try {
      const endpoint = `/${type}s/${id}`;
      const response = await api.put(endpoint, updatedItem);
      setData(prev => prev.map(item => item._id === id ? response : item));
      return response;
    } catch (err) {
      throw new Error(`Failed to update ${type}: ${err.message}`);
    }
  }, [type]);

  const deleteItem = useCallback(async (id) => {
    try {
      const endpoint = `/${type}s/${id}`;
      await api.delete(endpoint);
      setData(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      throw new Error(`Failed to delete ${type}: ${err.message}`);
    }
  }, [type]);

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