import React from 'react';
import { getExpiryStatus } from '../../utils/dateUtils';

const ExpiryIndicator = ({ date }) => {
// Return '-' for empty or invalid dates
if (!date || date === '' || date === 'Invalid Date') {
  return <span>-</span>;
}

// Format the date properly
let displayDate = date;

// If it's an ISO date string (from database), extract YYYY-MM-DD
if (typeof date === 'string' && date.includes('T')) {
  displayDate = date.split('T')[0];
}

// Validate the date is properly formatted
if (!displayDate || displayDate === '' || displayDate === 'Invalid Date') {
  return <span>-</span>;
}

const status = getExpiryStatus(displayDate);

return (
<div className="flex items-center gap-2">
      {displayDate}
      {status === 'expired' && <span className="text-red-600">⚠️</span>}
      {status === 'warning' && <span className="text-orange-600">⏰</span>}
</div>
);
};

export default ExpiryIndicator;