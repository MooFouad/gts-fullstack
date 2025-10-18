import React, { useState, useEffect } from 'react';
import FormField from '../common/FormField';
import FormActions from '../common/FormActions';
import AttachmentField from '../common/AttachmentField';

const ElectricityForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    no: '',
    account: '',
    name: '',
    city: '',
    address: '',
    project: '',
    division: '',
    meterNumber: '',
    date: '',
    attachments: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="No." required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.no}
            onChange={(e) => handleChange('no', e.target.value)}
          />
        </FormField>

        <FormField label="Account" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.account}
            onChange={(e) => handleChange('account', e.target.value)}
          />
        </FormField>

        <FormField label="Name" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </FormField>

        <FormField label="City" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </FormField>

        <FormField label="Address" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </FormField>

        <FormField label="Project" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.project}
            onChange={(e) => handleChange('project', e.target.value)}
          />
        </FormField>

        <FormField label="Division" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.division}
            onChange={(e) => handleChange('division', e.target.value)}
          />
        </FormField>

        <FormField label="Meter Number" required>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.meterNumber}
            onChange={(e) => handleChange('meterNumber', e.target.value)}
          />
        </FormField>

        <FormField label="Date" required>
          <input
            type="date"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
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
        submitText={initialData ? "Update Electricity" : "Add Electricity"}
        isEdit={!!initialData}
      />
    </form>
  );
};

export default ElectricityForm;