import { useState, useEffect, useCallback } from 'react';
import { vehicleService, homeRentService, electricityService } from '../services';
import { isExpired } from '../utils/dateUtils';

// Map type to service
const serviceMap = {
  vehicle: vehicleService,
  homeRent: homeRentService,
  electricity: electricityService
};

export const useDataManagement = (type = 'vehicle', useAPI = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const service = serviceMap[type];

  const updateItemStatus = useCallback((item) => {
    if (type === 'vehicle') {
      const isLicenseExpired = isExpired(item.licenseExpiryDate);
      const isInspectionExpired = isExpired(item.inspectionExpiryDate);
      if (isLicenseExpired || isInspectionExpired) {
        return { ...item, vehicleStatus: 'Inactive' };
      }
    } else if (type === 'homeRent') {
      const isContractExpired = isExpired(item.contractEndingDate);
      if (isContractExpired) {
        return { ...item, contractStatus: 'Inactive' };
      }
    }
    return item;
  }, [type]);

  // Load initial data
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!useAPI || !service) {
        setData([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log(`🔄 Loading ${type} data from API...`);
        const result = await service.getAll();
        if (mounted) {
          setData(result || []);
          console.log(`✅ Successfully loaded ${result?.length || 0} ${type} items`);
        }
      } catch (err) {
        if (mounted) {
          console.error(`❌ Error loading ${type} data:`, err);
          setError(err.message);
          setData([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [type, useAPI, service]);

  // Update status checker
  useEffect(() => {
    const checkAndUpdateStatus = () => {
      const updatedData = data.map(updateItemStatus);
      if (JSON.stringify(updatedData) !== JSON.stringify(data)) {
        setData(updatedData);
      }
    };
    
    checkAndUpdateStatus();
    const interval = setInterval(checkAndUpdateStatus, 3600000); // Every hour
    
    return () => clearInterval(interval);
  }, [data, updateItemStatus]);

  const dispatchCountUpdate = useCallback((newData) => {
    const event = new CustomEvent('itemCountUpdate', {
      detail: { type, count: newData.length }
    });
    window.dispatchEvent(event);
  }, [type]);

  // ADD ITEM
  const addItem = async (newItem) => {
    if (!useAPI || !service) {
      throw new Error('API is not enabled');
    }

    setLoading(true);
    try {
      const createdItem = await service.create(newItem);
      const itemWithStatus = updateItemStatus(createdItem);
      setData(prevData => {
        const newData = [...prevData, itemWithStatus];
        dispatchCountUpdate(newData);
        return newData;
      });
      setError(null);
      return createdItem;
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE ITEM
  const updateItem = async (id, updatedItem) => {
    if (!useAPI || !service) {
      throw new Error('API is not enabled');
    }

    setLoading(true);
    setError(null);
    try {
      // Get the correct MongoDB _id
      let mongoId;
      if (typeof id === 'string' && id.length === 24) {
        // If it looks like a MongoDB _id, use it directly
        mongoId = id;
      } else {
        // Otherwise try to find the corresponding item and get its _id
        const existingItem = data.find(item => 
          item._id === id || item.id === id || item._id === id._id
        );
        mongoId = existingItem?._id || id;
      }
      
      console.log('Updating item with ID:', mongoId);
      const updated = await service.update(mongoId, {
        ...updatedItem,
        _id: mongoId // Ensure _id is included in the update
      });
      
      console.log('Update response:', updated);
      const itemWithStatus = updateItemStatus(updated);
      
      setData(prevData => {
        const newData = prevData.map(item => 
          (item._id === mongoId || item.id === id) ? itemWithStatus : item
        );
        dispatchCountUpdate(newData);
        return newData;
      });
      
      return updated;
    } catch (err) {
      console.error('Error updating item:', err);
      const errorMessage = err.message || 'Failed to update item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // DELETE ITEM
  const deleteItem = async (id) => {
    if (!useAPI || !service) {
      throw new Error('API is not enabled');
    }

    setLoading(true);
    try {
      // MongoDB uses _id, localStorage uses id
      const mongoId = typeof id === 'object' ? id._id : (data.find(item => item.id === id)?._id || id);
      await service.delete(mongoId);
      setData(prevData => {
        const newData = prevData.filter(item => item._id !== mongoId && item.id !== id);
        dispatchCountUpdate(newData);
        return newData;
      });
      setError(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, addItem, updateItem, deleteItem, loading, error };
};