// src/components/vehicles/VehiclesContainer.jsx
import React, { useState } from 'react';
import VehiclesTable from './VehiclesTable';
import VehicleForm from './VehicleForm';
import FormDialog from '../common/FormDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import Toolbar from '../layout/Toolbar';
import ExportButton from '../common/ExportButton';
import { useDataManagementNew as useDataManagement } from '../../hooks/useDataManagementNew';
import { exportVehiclesToExcel } from '../../utils/excelUtils';

const VehiclesContainer = () => {
  const [formDialog, setFormDialog] = useState({ isOpen: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: items, addItem, updateItem, deleteItem, loading, error } = useDataManagement('vehicle');

  const filteredItems = items.filter((item) => {
    // Search filter
    const matchSearch = Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Status filter
    let matchStatus = true;
    if (filterStatus !== 'all') {
      const isLicenseExpired = new Date(item.licenseExpiryDate) < new Date();
      const isInspectionExpired = new Date(item.inspectionExpiryDate) < new Date();
      
      if (filterStatus === 'expired') {
        matchStatus = isLicenseExpired || isInspectionExpired;
      } else if (filterStatus === 'warning') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const licenseNeedsRenewal = new Date(item.licenseExpiryDate) <= thirtyDaysFromNow && !isLicenseExpired;
        const inspectionNeedsRenewal = new Date(item.inspectionExpiryDate) <= thirtyDaysFromNow && !isInspectionExpired;
        matchStatus = licenseNeedsRenewal || inspectionNeedsRenewal;
      } else if (filterStatus === 'valid') {
        matchStatus = !isLicenseExpired && !isInspectionExpired;
      }
    }

    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    setFormDialog({ isOpen: true, data: null });
  };

  const handleEdit = (vehicle) => {
    setFormDialog({ isOpen: true, data: vehicle });
  };

  const handleSubmit = async (formData) => {
    try {
      if (formDialog.data) {
        console.log('Updating vehicle with data:', formDialog.data);
        await updateItem(formDialog.data._id, {
          ...formData,
          _id: formDialog.data._id // Ensure _id is preserved
        });
      } else {
        await addItem(formData);
      }
      setFormDialog({ isOpen: false, data: null });
    } catch (err) {
      console.error('Form submission error:', err);
      alert(`Error: ${err.message || 'Failed to save changes. Please try again.'}`);
    }
  };

  const handleDelete = (id) => {
    setDeleteDialog({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteDialog.id !== null) {
      deleteItem(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const handleExport = () => {
    try {
      exportVehiclesToExcel(items);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data to Excel. Please try again.');
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold">Vehicles</h2>
        <div className="flex flex-wrap gap-2">
          <ExportButton onClick={handleExport} label="Export Vehicles" />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Vehicle
          </button>
        </div>
      </div>

      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        totalItems={items.length}
      />

      <VehiclesTable
        data={filteredItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormDialog
        isOpen={formDialog.isOpen}
        onClose={() => setFormDialog({ isOpen: false, data: null })}
        title={formDialog.data ? 'Edit Vehicle' : 'Add Vehicle'}
      >
        <VehicleForm
          initialData={formDialog.data}
          onSubmit={handleSubmit}
          onCancel={() => setFormDialog({ isOpen: false, data: null })}
        />
      </FormDialog>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this vehicle?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default VehiclesContainer;