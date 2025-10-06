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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Comments
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">
                  {item.contractNumber || 'N/A'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {item.paymentTerms || '3 Installments'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {item.paymentType || 'cash'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {item.paymentStatus || 'Pending'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {item.amount
                    ? `SAR ${Number(item.amount).toLocaleString()}`
                    : 'SAR 0.00'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {item.rentAnnually
                    ? `SAR ${Number(item.rentAnnually).toLocaleString()}`
                    : 'SAR 0.00'}
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
                <td className="px-4 py-2 text-sm text-gray-900">
                  {item.comments || 'N/A'}
                </td>
                <td className="px-4 py-2 text-sm text-center">
                  <ActionButtons
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item._id)}
                    attachments={item.attachments}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomeRentsTable;