import React, { useState } from 'react';
import HomeRentsTable from './HomeRentsTable';
import HomeRentForm from './HomeRentForm';
import FormDialog from '../common/FormDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import Toolbar from '../layout/Toolbar';
import ExportButton from '../common/ExportButton';
import { useDataManagement } from '../../hooks/useDataManagement';
import { exportHomeRentsToExcel } from '../../utils/excelUtils';

const HomeRentsContainer = () => {
  const [formDialog, setFormDialog] = useState({ isOpen: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: items, addItem, updateItem, deleteItem, loading, error, refreshData } = useDataManagement('homeRent');

  const filteredItems = items.filter((item) => {
    // Search filter
    const matchSearch = Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Status filter
    let matchStatus = true;
    if (filterStatus !== 'all') {
      const isContractExpired = new Date(item.contractEndingDate) < new Date();
      const hasUpcomingPayment = [
        item.firstPaymentDate,
        item.secondPaymentDate,
        item.thirdPaymentDate,
        item.fourthPaymentDate
      ].some(date => {
        const paymentDate = new Date(date);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return paymentDate >= now && paymentDate <= thirtyDaysFromNow;
      });
      
      if (filterStatus === 'expired') {
        matchStatus = isContractExpired;
      } else if (filterStatus === 'warning') {
        matchStatus = !isContractExpired && hasUpcomingPayment;
      } else if (filterStatus === 'valid') {
        matchStatus = !isContractExpired && !hasUpcomingPayment;
      }
    }

    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    setFormDialog({ isOpen: true, data: null });
  };

  const handleEdit = (rent) => {
    setFormDialog({ isOpen: true, data: rent });
  };

  const handleSubmit = async (formData) => {
    try {
      if (formDialog.data) {
        console.log('Updating home rent with data:', formDialog.data);
        await updateItem(formDialog.data._id, {
          ...formData,
          _id: formDialog.data._id
        });
      } else {
        await addItem(formData);
      }
      setFormDialog({ isOpen: false, data: null });
      // Refresh data to ensure UI is updated
      await refreshData();
    } catch (err) {
      console.error('Form submission error:', err);
      alert(`Error: ${err.message || 'Failed to save changes. Please try again.'}`);
    }
  };

  const handleDelete = (id) => {
    console.log('Initiating delete for:', id);
    setDeleteDialog({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (deleteDialog.id) {
      try {
        await deleteItem(deleteDialog.id);
        setDeleteDialog({ isOpen: false, id: null });
        // Refresh data to ensure UI is updated
        await refreshData();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleExport = () => {
    try {
      exportHomeRentsToExcel(items);
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
        <h2 className="text-xl font-semibold">Home Rentals</h2>
        <div className="flex flex-wrap gap-2">
          <ExportButton onClick={handleExport} label="Export Home Rentals" />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Home Rental
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

      <HomeRentsTable
        data={filteredItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormDialog
        isOpen={formDialog.isOpen}
        onClose={() => setFormDialog({ isOpen: false, data: null })}
        title={formDialog.data ? 'Edit Home Rental' : 'Add Home Rental'}
      >
        <HomeRentForm
          initialData={formDialog.data}
          onSubmit={handleSubmit}
          onCancel={() => setFormDialog({ isOpen: false, data: null })}
        />
      </FormDialog>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this rental property?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default HomeRentsContainer;