import React from 'react';
import ActionButtons from '../common/ActionButtons';

const HomeRentsTable = ({ data = [], onEdit, onDelete }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }).format(date);
    } catch {
      return 'Invalid Date';
    }
  };

  const calculateRemainingDays = (endDateStr) => {
    if (!endDateStr) return null;
    try {
      const endDate = new Date(endDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(endDate.getTime())) return null;
      const diffTime = endDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  const formatCurrency = (value) => {
    const amount = Number(value);
    if (isNaN(amount)) return 'SAR 0.00';
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const getRowClass = (item) => {
    const remainingDays = calculateRemainingDays(item.contractEndingDate);
    if (remainingDays === null) return 'bg-white';
    if (remainingDays < 0) return 'bg-red-100 border-l-4 border-red-500';
    if (remainingDays <= 10) return 'bg-yellow-100 border-l-4 border-orange-500';
    return 'bg-white border-l-4 border-transparent';
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Contract Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Starting Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                End Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Notice
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Remaining Days
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Payment Terms
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Payment Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Payment Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Actual Rent
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Contact Person
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                GTS Contact
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => {
              const remainingDays = calculateRemainingDays(item.contractEndingDate);
              
              return (
                <tr key={item._id} className={`${getRowClass(item)} hover:bg-gray-50`}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.contractNumber || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatDate(item.contractStartingDate)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatDate(item.contractEndingDate)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.notice || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {remainingDays !== null ? (
                      <span className={
                        remainingDays < 0 
                          ? 'text-red-600 font-semibold' 
                          : remainingDays <= 10 
                          ? 'text-orange-600 font-semibold' 
                          : 'text-green-600'
                      }>
                        {remainingDays < 0 
                          ? `Expired ${Math.abs(remainingDays)} days ago` 
                          : `${remainingDays} days`}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.paymentTerms || '3 Installments'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.paymentType || 'cash'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : item.paymentStatus === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatCurrency(item.rentAnnually)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.address || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.contactPerson || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.gtsContact || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-center">
                    <ActionButtons
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item._id)}
                      attachments={item.attachments}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomeRentsTable;