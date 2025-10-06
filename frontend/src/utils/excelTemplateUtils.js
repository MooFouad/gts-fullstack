import * as XLSX from 'xlsx';

/**
 * Generate Excel template for Home Rents
 */
export const generateHomeRentTemplate = () => {
  const templateData = [
    {
      'Contract Number': 'Example: M202407671-1-0',
      'Starting Date': '2024-07-02',
      'End Date': '2025-07-01',
      'Notice': '60 days',
      'Payment Terms': '2024-07-02',
      'Payment Type': '2024-10-02',
      'Payments Status': '2025-01-02',
      'Amount': '2025-04-02',
      'Actual Rent': '8000',
      'Address': 'Riyadh - 7071',
      'Contract Person': 'Mr. Iyad Alshihab',
      'GTS Contact': 'Mobile +966550859388',
      'Mobile': '',
      'Saudi Electric Company': '',
      'Comment': '',
      'Project': '',
      'BMS': '',
      'SPD': ''
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // Contract Number
    { wch: 15 }, // Starting Date
    { wch: 15 }, // End Date
    { wch: 12 }, // Notice
    { wch: 15 }, // Payment Terms
    { wch: 15 }, // Payment Type
    { wch: 15 }, // Payments Status
    { wch: 15 }, // Amount
    { wch: 12 }, // Actual Rent
    { wch: 30 }, // Address
    { wch: 20 }, // Contract Person
    { wch: 25 }, // GTS Contact
    { wch: 20 }, // Mobile
    { wch: 25 }, // Saudi Electric Company
    { wch: 30 }, // Comment
    { wch: 15 }, // Project
    { wch: 10 }, // BMS
    { wch: 10 }  // SPD
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Home Rents Template');
  XLSX.writeFile(wb, 'HomeRents_Template.xlsx');
};

/**
 * Generate Excel template for Vehicles
 */
export const generateVehicleTemplate = () => {
  const templateData = [
    {
      'Plate Number': 'ABC1234',
      'Plate Type': 'Private',
      'Vehicle Maker': 'Toyota',
      'Vehicle Model': 'Camry',
      'Model Year': 2023,
      'Sequence Number': 'SEQ001',
      'Chassis Number': 'CHASSIS123456',
      'License Expiry Date': '2025-12-31',
      'Inspection Expiry Date': '2025-06-30',
      'Actual Driver ID': 'DRV001',
      'Driver Name': 'John Doe',
      'MVPI Status': 'Active',
      'Insurance Status': 'Valid',
      'Restriction Status': 'None',
      'Istemarah Issue Date': '2024-01-01',
      'Vehicle Status': 'Active',
      'Body Type': 'Sedan'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);

  ws['!cols'] = [
    { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 18 },
    { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 12 },
    { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 15 },
    { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Vehicles Template');
  XLSX.writeFile(wb, 'Vehicles_Template.xlsx');
};

/**
 * Generate Excel template for Electricity
 */
export const generateElectricityTemplate = () => {
  const templateData = [
    {
      'Department Number': 'DEPT-001',
      'Meter Number': 'MTR-2024-001',
      'Location': 'Main Building',
      'Last Reading Date': '2025-01-01',
      'Current Reading': 5000,
      'Previous Reading': 4500,
      'Consumption': 500,
      'Bill Amount': 750,
      'Bill Date': '2025-01-02',
      'Due Date': '2025-01-25',
      'Payment Status': 'Pending',
      'Property Type': 'Commercial',
      'Subscriber Name': 'GTS Company',
      'Subscriber Number': 'SUB-001',
      'Notes': 'Monthly bill',
      'Alert Threshold': 600,
      'Last Month Consumption': 480
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);

  ws['!cols'] = [
    { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 18 },
    { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 20 }, { wch: 18 }, { wch: 30 }, { wch: 15 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Electricity Template');
  XLSX.writeFile(wb, 'Electricity_Template.xlsx');
};