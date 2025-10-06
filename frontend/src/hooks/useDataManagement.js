import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useDataManagement = (type) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getEndpoint = (type) => {
    switch(type) {
      case 'homeRent':
        return '/home-rents';
      case 'vehicle':
        return '/vehicles';
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

  const addItem = useCallback(async (newItem) => {
    try {
      const endpoint = getEndpoint(type);
      const response = await api.post(endpoint, newItem);
      setData(prev => [...prev, response]);
      return response;
    } catch (err) {
      throw new Error(`Failed to add ${type}: ${err.message}`);
    }
  }, [type]);

  const updateItem = useCallback(async (id, updatedItem) => {
    try {
      const endpoint = getEndpoint(type);
      const response = await api.put(`${endpoint}/${id}`, updatedItem);
      setData(prev => prev.map(item => item._id === id ? response : item));
      return response;
    } catch (err) {
      throw new Error(`Failed to update ${type}: ${err.message}`);
    }
  }, [type]);

  const deleteItem = useCallback(async (id) => {
    try {
      const endpoint = getEndpoint(type);
      await api.delete(`${endpoint}/${id}`);
      setData(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      throw new Error(`Failed to delete ${type}: ${err.message}`);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, addItem, updateItem, deleteItem, refreshData: fetchData };
};