import React, { useState, useEffect } from 'react';
import FormField from '../common/FormField';
import FormActions from '../common/FormActions';
import AttachmentField from '../common/AttachmentField';

const HomeRentForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    contractNumber: '',
    startingDate: '',
    endDate: '',
    notice: '',
    noticeDate: '',
    paymentTerms: '',
    paymentType: '',
    paymentsStatus: 'pending',
    amount: '',
    actualRent: '',
    address: '',
    contactPerson: '',
    gtsContact: '',
    comments: '',
    attachments: []
  });

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        startingDate: formatDateForInput(initialData.startingDate),
        endDate: formatDateForInput(initialData.endDate),
        noticeDate: formatDateForInput(initialData.noticeDate)
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const paymentStatusOptions = ['pending', 'paid', 'overdue', 'cancelled'];
  const paymentTypeOptions = ['cash', 'bank transfer', 'check'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Contract Number" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.contractNumber}
            onChange={(e) => handleChange('contractNumber', e.target.value)}
          />
        </FormField>

        <FormField label="Starting Date" required>
          <input
            type="date"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.startingDate}
            onChange={(e) => handleChange('startingDate', e.target.value)}
          />
        </FormField>

        <FormField label="End Date" required>
          <input
            type="date"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </FormField>

        <FormField label="Notice Period">
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={formData.notice}
            onChange={(e) => handleChange('notice', e.target.value)}
          />
        </FormField>

        <FormField label="Notice Date">
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={formData.noticeDate}
            onChange={(e) => handleChange('noticeDate', e.target.value)}
          />
        </FormField>

        <FormField label="Payment Terms" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.paymentTerms}
            onChange={(e) => handleChange('paymentTerms', e.target.value)}
          />
        </FormField>

        <FormField label="Payment Type" required>
          <select
            required
            className="w-full border rounded px-3 py-2"
            value={formData.paymentType}
            onChange={(e) => handleChange('paymentType', e.target.value)}
          >
            <option value="">Select Payment Type</option>
            {paymentTypeOptions.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Payments Status" required>
          <select
            required
            className="w-full border rounded px-3 py-2"
            value={formData.paymentsStatus}
            onChange={(e) => handleChange('paymentsStatus', e.target.value)}
          >
            {paymentStatusOptions.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Amount" required>
          <input
            type="number"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
          />
        </FormField>

        <FormField label="Actual Rent" required>
          <input
            type="number"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.actualRent}
            onChange={(e) => handleChange('actualRent', e.target.value)}
          />
        </FormField>

        <FormField label="Address" required>
          <textarea
            required
            className="w-full border rounded px-3 py-2"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows="3"
          />
        </FormField>

        <FormField label="Contact Person" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
          />
        </FormField>

        <FormField label="GTS Contact" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.gtsContact}
            onChange={(e) => handleChange('gtsContact', e.target.value)}
          />
        </FormField>

        <FormField label="Comments" className="col-span-2">
          <textarea
            className="w-full border rounded px-3 py-2"
            value={formData.comments}
            onChange={(e) => handleChange('comments', e.target.value)}
            rows="3"
          />
        </FormField>

        <FormField label="Documents & Attachments" className="col-span-2">
          <AttachmentField
            attachments={formData.attachments}
            onChange={(attachments) => handleChange('attachments', attachments)}
          />
        </FormField>
      </div>

      <FormActions 
        onCancel={onCancel} 
        submitText={initialData ? "Update Contract" : "Add Contract"} 
        isEdit={!!initialData} 
      />
    </form>
  );
};

export default HomeRentForm;