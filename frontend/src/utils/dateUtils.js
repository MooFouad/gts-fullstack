export const getExpiryStatus = (dateString) => {
      // إذا كان التاريخ غير موجود، نرجع 'valid' عشان ما يظهرش أحمر
      if (!dateString) return 'valid';

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiryDate = new Date(dateString);
      expiryDate.setHours(0, 0, 0, 0);

      // تحقق إذا كان التاريخ صحيح
      if (isNaN(expiryDate.getTime())) return 'valid';

      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'expired';
      if (diffDays <= 10) return 'warning';
      return 'valid';
};

export const isExpired = (dateString) => {
      if (!dateString) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const expiryDate = new Date(dateString);
      expiryDate.setHours(0, 0, 0, 0);
      
      return expiryDate < today;
};

export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Handle ISO date strings
  if (typeof dateString === 'string' && dateString.includes('-')) {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  }
  
  // Handle date objects
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // Try parsing other formats
  const parsed = new Date(dateString);
  return !isNaN(parsed.getTime()) ? parsed : null;
};

export const formatDate = (dateString) => {
  const date = parseDate(dateString);
  if (!date) return 'N/A';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateRemainingDays = (dateString) => {
  const date = parseDate(dateString);
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

