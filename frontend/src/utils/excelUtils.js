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
 * Export vehicles data to Excel
 */
export const exportVehiclesToExcel = (vehicles) => {
  exportToExcel(vehicles, 'Vehicles_Export', 'Vehicles');
};

/**
 * Export home rents data to Excel
 */
export const exportHomeRentsToExcel = (homeRents) => {
  exportToExcel(homeRents, 'HomeRents_Export', 'Home Rents');
};

/**
 * Export electricity bills to Excel
 */
export const exportElectricityToExcel = (electricity) => {
  exportToExcel(electricity, 'Electricity_Export', 'Electricity Bills');
};

/**
 * Export all data to a single Excel file with multiple sheets
 */
export const exportAllDataToExcel = (vehicles, homeRents, electricity) => {
  const wb = XLSX.utils.book_new();

  // Add vehicles sheet
  if (vehicles && vehicles.length > 0) {
    const vehiclesData = vehicles.map(({ attachments, ...rest }) => ({
      ...rest,
      attachmentCount: attachments?.length || 0
    }));
    const wsVehicles = XLSX.utils.json_to_sheet(vehiclesData);
    XLSX.utils.book_append_sheet(wb, wsVehicles, 'Vehicles');
  }

  // Add home rents sheet
  if (homeRents && homeRents.length > 0) {
    const homeRentsData = homeRents.map(({ attachments, ...rest }) => ({
      ...rest,
      attachmentCount: attachments?.length || 0
    }));
    const wsHomeRents = XLSX.utils.json_to_sheet(homeRentsData);
    XLSX.utils.book_append_sheet(wb, wsHomeRents, 'Home Rents');
  }

  // Add electricity sheet
  if (electricity && electricity.length > 0) {
    const electricityData = electricity.map(({ attachments, ...rest }) => ({
      ...rest,
      attachmentCount: attachments?.length || 0
    }));
    const wsElectricity = XLSX.utils.json_to_sheet(electricityData);
    XLSX.utils.book_append_sheet(wb, wsElectricity, 'Electricity');
  }

  // Generate file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Complete_Export_${timestamp}.xlsx`);
};