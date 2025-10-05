import { useState, useCallback } from 'react';

export const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback((err = null) => {
    setLoading(false);
    setError(err);
  }, []);

  return {
    loading,
    error,
    startLoading,
    stopLoading
  };
};