// src/utils/excelUtils.js
import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Prepare data for export (exclude attachments binary data)
  const exportData = data.map(item => {
    const { attachments, ...rest } = item;
    return {
      ...rest,
      // Add attachment count instead of full attachment data
      attachmentCount: attachments?.length || 0
    };
  });

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const maxWidth = 50;
  const colWidths = Object.keys(exportData[0] || {}).map(key => {
    const maxLength = Math.max(
      key.length,
      ...exportData.map(row => String(row[key] || '').length)
    );
    return { wch: Math.min(maxLength + 2, maxWidth) };
  });
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate file and trigger download
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
};

/**
 * Export vehicles data to Excel (only table columns)
 */
export const exportVehiclesToExcel = (vehicles) => {
  if (!vehicles || vehicles.length === 0) {
    alert('No data to export');
    return;
  }

  // Select only the 14 fields that appear in the table
  const exportData = vehicles.map(vehicle => ({
    'Plate Number': vehicle.plateNumber || '',
    'Registration Type': vehicle.registrationType || '',
    'Brand': vehicle.vehicleMaker || '',
    'Model': vehicle.vehicleModel || '',
    'Year of Manufacture': vehicle.modelYear || '',
    'Serial Number': vehicle.sequenceNumber || '',
    'Chassis Number': vehicle.chassisNumber || '',
    'Basic Color': vehicle.basicColor || '',
    'License Expiry Date': vehicle.licenseExpiryDate || '',
    'Inspection Expiry Date': vehicle.inspectionExpiryDate || '',
    'Actual User ID Number': vehicle.actualDriverId || '',
    'Actual User Name': vehicle.actualDriverName || '',
    'Inspection Status': vehicle.inspectionStatus || '',
    'Insurance Status': vehicle.insuranceStatus || ''
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // Plate Number
    { wch: 18 }, // Registration Type
    { wch: 15 }, // Brand
    { wch: 15 }, // Model
    { wch: 18 }, // Year of Manufacture
    { wch: 15 }, // Serial Number
    { wch: 20 }, // Chassis Number
    { wch: 15 }, // Basic Color
    { wch: 20 }, // License Expiry Date
    { wch: 22 }, // Inspection Expiry Date
    { wch: 22 }, // Actual User ID Number
    { wch: 20 }, // Actual User Name
    { wch: 18 }, // Inspection Status
    { wch: 18 }  // Insurance Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');

  // Generate file with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Vehicles_Export_${timestamp}.xlsx`);
};

/**
 * Export home rents data to Excel (only table columns)
 */
export const exportHomeRentsToExcel = (homeRents) => {
  if (!homeRents || homeRents.length === 0) {
    alert('No data to export');
    return;
  }

  // Select only the fields that appear in the table
  const exportData = homeRents.map(rent => ({
    'Contract Number': rent.contractNumber || '',
    'Property Name': rent.name || '',
    'Location': rent.location || '',
    'District': rent.district || '',
    'Project': rent.project || '',
    'Starting Date': rent.contractStartingDate || '',
    'End Date': rent.contractEndingDate || '',
    'Contract Status': rent.contractStatus || '',
    'Duration': rent.duration || '',
    'First Payment': rent.firstPaymentDate || '',
    'Second Payment': rent.secondPaymentDate || '',
    'Third Payment': rent.thirdPaymentDate || '',
    'Fourth Payment': rent.fourthPaymentDate || '',
    'Annual Rent': rent.rentAnnually || '',
    'Address': rent.address || '',
    'Contact Person': rent.contactPerson || '',
    'Contact Number': rent.contactNo || '',
    'GTS Contact': rent.gts || '',
    'Electricity Meter': rent.electricityMeterNumber || '',
    'Saudi Electric Company': rent.saudiElectricCompany || '',
    'BMS': rent.bms || '',
    'SPD': rent.spd || '',
    'Notes': rent.note || '',
    'Remarks': rent.remarks || ''
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
    { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 25 },
    { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Home Rents');

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `HomeRents_Export_${timestamp}.xlsx`);
};

/**
 * Export electricity bills to Excel (only table columns)
 */
export const exportElectricityToExcel = (electricity) => {
  if (!electricity || electricity.length === 0) {
    alert('No data to export');
    return;
  }

  // Select only the fields that appear in the table
  const exportData = electricity.map(bill => ({
    'Department Number': bill.departmentNumber || '',
    'Meter Number': bill.meterNumber || '',
    'Location': bill.location || '',
    'Property Type': bill.propertyType || '',
    'Subscriber Name': bill.subscriberName || '',
    'Subscriber Number': bill.subscriberNumber || '',
    'Last Reading Date': bill.lastReadingDate || '',
    'Current Reading': bill.currentReading || '',
    'Previous Reading': bill.previousReading || '',
    'Consumption': bill.consumption || '',
    'Bill Amount': bill.billAmount || '',
    'Bill Date': bill.billDate || '',
    'Due Date': bill.dueDate || '',
    'Payment Date': bill.paymentDate || '',
    'Payment Status': bill.paymentStatus || '',
    'Alert Threshold': bill.alertThreshold || '',
    'Last Month Consumption': bill.lastMonthConsumption || '',
    'Notes': bill.notes || ''
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  ws['!cols'] = [
    { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 20 },
    { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
    { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 20 }, { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Electricity Bills');

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Electricity_Export_${timestamp}.xlsx`);
};

/**
 * Export all data to a single Excel file with multiple sheets (only table columns)
 */
export const exportAllDataToExcel = (vehicles, homeRents, electricity) => {
  const wb = XLSX.utils.book_new();

  // Add vehicles sheet
  if (vehicles && vehicles.length > 0) {
    const vehiclesData = vehicles.map(vehicle => ({
      'Plate Number': vehicle.plateNumber || '',
      'Registration Type': vehicle.registrationType || '',
      'Brand': vehicle.vehicleMaker || '',
      'Model': vehicle.vehicleModel || '',
      'Year of Manufacture': vehicle.modelYear || '',
      'Serial Number': vehicle.sequenceNumber || '',
      'Chassis Number': vehicle.chassisNumber || '',
      'Basic Color': vehicle.basicColor || '',
      'License Expiry Date': vehicle.licenseExpiryDate || '',
      'Inspection Expiry Date': vehicle.inspectionExpiryDate || '',
      'Actual User ID Number': vehicle.actualDriverId || '',
      'Actual User Name': vehicle.actualDriverName || '',
      'Inspection Status': vehicle.inspectionStatus || '',
      'Insurance Status': vehicle.insuranceStatus || ''
    }));
    const wsVehicles = XLSX.utils.json_to_sheet(vehiclesData);
    XLSX.utils.book_append_sheet(wb, wsVehicles, 'Vehicles');
  }

  // Add home rents sheet
  if (homeRents && homeRents.length > 0) {
    const homeRentsData = homeRents.map(rent => ({
      'Contract Number': rent.contractNumber || '',
      'Property Name': rent.name || '',
      'Location': rent.location || '',
      'District': rent.district || '',
      'Project': rent.project || '',
      'Starting Date': rent.contractStartingDate || '',
      'End Date': rent.contractEndingDate || '',
      'Contract Status': rent.contractStatus || '',
      'Duration': rent.duration || '',
      'First Payment': rent.firstPaymentDate || '',
      'Second Payment': rent.secondPaymentDate || '',
      'Third Payment': rent.thirdPaymentDate || '',
      'Fourth Payment': rent.fourthPaymentDate || '',
      'Annual Rent': rent.rentAnnually || '',
      'Address': rent.address || '',
      'Contact Person': rent.contactPerson || '',
      'Contact Number': rent.contactNo || '',
      'GTS Contact': rent.gts || '',
      'Electricity Meter': rent.electricityMeterNumber || '',
      'Saudi Electric Company': rent.saudiElectricCompany || '',
      'BMS': rent.bms || '',
      'SPD': rent.spd || '',
      'Notes': rent.note || '',
      'Remarks': rent.remarks || ''
    }));
    const wsHomeRents = XLSX.utils.json_to_sheet(homeRentsData);
    XLSX.utils.book_append_sheet(wb, wsHomeRents, 'Home Rents');
  }

  // Add electricity sheet
  if (electricity && electricity.length > 0) {
    const electricityData = electricity.map(bill => ({
      'Department Number': bill.departmentNumber || '',
      'Meter Number': bill.meterNumber || '',
      'Location': bill.location || '',
      'Property Type': bill.propertyType || '',
      'Subscriber Name': bill.subscriberName || '',
      'Subscriber Number': bill.subscriberNumber || '',
      'Last Reading Date': bill.lastReadingDate || '',
      'Current Reading': bill.currentReading || '',
      'Previous Reading': bill.previousReading || '',
      'Consumption': bill.consumption || '',
      'Bill Amount': bill.billAmount || '',
      'Bill Date': bill.billDate || '',
      'Due Date': bill.dueDate || '',
      'Payment Date': bill.paymentDate || '',
      'Payment Status': bill.paymentStatus || '',
      'Alert Threshold': bill.alertThreshold || '',
      'Last Month Consumption': bill.lastMonthConsumption || '',
      'Notes': bill.notes || ''
    }));
    const wsElectricity = XLSX.utils.json_to_sheet(electricityData);
    XLSX.utils.book_append_sheet(wb, wsElectricity, 'Electricity');
  }

  // Generate file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Complete_Export_${timestamp}.xlsx`);
};