import * as XLSX from 'xlsx';

const readExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (err) {
        reject(new Error('Failed to parse Excel file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Helper function to convert Excel serial date to JavaScript date
const excelDateToJSDate = (serial) => {
  if (!serial) return '';
  
  // If it's already a string date, return it
  if (typeof serial === 'string') {
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(serial)) {
      return serial;
    }
    // Try to parse the date
    const date = new Date(serial);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return serial;
  }
  
  // Excel dates are stored as number of days since 1900-01-01
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  
  const year = date_info.getFullYear();
  const month = String(date_info.getMonth() + 1).padStart(2, '0');
  const day = String(date_info.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Helper function to get value from row with multiple possible column names
const getRowValue = (row, possibleNames) => {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return '';
};

export const importHomeRentsFromExcel = async (file, addItemFunction) => {
  try {
    const jsonData = await readExcelFile(file);
    
    if (!jsonData || jsonData.length === 0) {
      throw new Error('Excel file is empty or invalid');
    }

    console.log('Excel data loaded:', jsonData);
    console.log('First row columns:', Object.keys(jsonData[0]));
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Map Excel columns to database fields with support for Arabic headers
        const homeRent = {
          // Contract Number - رقم العقد
          contractNumber: getRowValue(row, [
            'Contract Number',
            'رقم العقد',
            'Sm',
            '__EMPTY' // Sometimes Excel puts data in unnamed columns
          ]),
          
          // Starting Date - تاريخ البداية
          contractStartingDate: excelDateToJSDate(getRowValue(row, [
            'Starting Date',
            'تاريخ البداية',
            'Start Date',
            '__EMPTY_1'
          ])),
          
          // End Date - تاريخ النهاية
          contractEndingDate: excelDateToJSDate(getRowValue(row, [
            'End Date',
            'تاريخ النهاية',
            'Ending Date',
            '__EMPTY_2'
          ])),
          
          // Notice/Duration - الإشعار
          duration: String(getRowValue(row, [
            'Notice',
            'الإشعار',
            'Duration',
            'المدة',
            '__EMPTY_3'
          ])),
          
          // Payment Dates - تواريخ الدفعات
          firstPaymentDate: excelDateToJSDate(getRowValue(row, [
            'Payment Terms',
            'شروط الدفع',
            'First Payment',
            'الدفعة الأولى',
            '__EMPTY_4'
          ])),
          
          secondPaymentDate: excelDateToJSDate(getRowValue(row, [
            'Payment Type',
            'نوع الدفع',
            'Second Payment',
            'الدفعة الثانية',
            '__EMPTY_5'
          ])),
          
          thirdPaymentDate: excelDateToJSDate(getRowValue(row, [
            'Payments Status',
            'حالة الدفع',
            'Third Payment',
            'الدفعة الثالثة',
            '__EMPTY_6'
          ])),
          
          fourthPaymentDate: excelDateToJSDate(getRowValue(row, [
            'Amount',
            'المبلغ',
            'Fourth Payment',
            'الدفعة الرابعة',
            '__EMPTY_7'
          ])),
          
          // Actual Rent - الإيجار الفعلي
          rentAnnually: String(getRowValue(row, [
            'Actual Rent',
            'الإيجار الفعلي',
            'Annual Rent',
            'الإيجار السنوي',
            'Rent',
            '__EMPTY_8'
          ])),
          
          // Address - العنوان
          address: getRowValue(row, [
            'Address',
            'العنوان',
            'Location',
            '__EMPTY_9'
          ]),
          
          // Location (used as fallback)
          location: getRowValue(row, [
            'Address',
            'العنوان',
            'Location',
            'الموقع',
            '__EMPTY_9'
          ]),
          
          // Contract Person/Name - الشخص المسؤول / اسم العقار
          name: getRowValue(row, [
            'Contract Person',
            'الشخص المسؤول',
            'Person',
            'Name',
            'اسم العقار',
            'Property Name',
            '__EMPTY_10'
          ]),
          
          // GTS Contact - جهة الاتصال
          gts: getRowValue(row, [
            'GTS Contact',
            'جهة الاتصال',
            'GTS',
            'Contact',
            '__EMPTY_11'
          ]),
          
          // Mobile/Electricity Meter - رقم الجوال / العداد
          electricityMeterNumber: getRowValue(row, [
            'Mobile',
            'رقم الجوال',
            'Electricity Meter',
            'رقم العداد',
            '__EMPTY_12'
          ]),
          
          // Saudi Electric Company - الشركة السعودية للكهرباء
          saudiElectricCompany: getRowValue(row, [
            'Saudi Electric Company',
            'الشركة السعودية للكهرباء',
            'SEC',
            '__EMPTY_13'
          ]),
          
          // Comment/Notes - التعليق / الملاحظات
          note: getRowValue(row, [
            'Comment',
            'التعليق',
            'Note',
            'ملاحظات',
            'Notes',
            '__EMPTY_14'
          ]),
          
          // Additional fields
          project: getRowValue(row, ['Project', 'المشروع', '__EMPTY_15']),
          district: getRowValue(row, ['District', 'الحي', '__EMPTY_16']),
          bms: getRowValue(row, ['BMS', '__EMPTY_17']),
          spd: getRowValue(row, ['SPD', '__EMPTY_18']),
          contactNo: getRowValue(row, ['Contact No', 'رقم الاتصال', '__EMPTY_19']),
          
          // Status
          contractStatus: 'Active',
          
          // Remarks
          remarks: getRowValue(row, ['Remarks', 'ملاحظات إضافية', '__EMPTY_20']),
          
          // Attachments
          attachments: []
        };

        // Validate required fields
        if (!homeRent.contractNumber || homeRent.contractNumber.trim() === '') {
          throw new Error(`Row ${i + 2}: Contract Number is required (رقم العقد مطلوب)`);
        }
        
        if (!homeRent.name || homeRent.name.trim() === '') {
          throw new Error(`Row ${i + 2}: Contract Person/Property Name is required (اسم العقار مطلوب)`);
        }
        
        if (!homeRent.contractStartingDate) {
          throw new Error(`Row ${i + 2}: Starting Date is required (تاريخ البداية مطلوب)`);
        }
        
        if (!homeRent.contractEndingDate) {
          throw new Error(`Row ${i + 2}: End Date is required (تاريخ النهاية مطلوب)`);
        }

        // Use address as location if location is empty
        if (!homeRent.location) {
          homeRent.location = homeRent.address || 'N/A';
        }

        // Clean up empty values
        Object.keys(homeRent).forEach(key => {
          if (homeRent[key] === '' || homeRent[key] === null || homeRent[key] === undefined) {
            if (key === 'attachments') {
              homeRent[key] = [];
            } else if (key === 'contractStatus') {
              homeRent[key] = 'Active';
            } else {
              homeRent[key] = '';
            }
          }
        });

        console.log(`Processing row ${i + 1}:`, homeRent);

        // Add to database using the provided function
        await addItemFunction(homeRent);
        successCount++;
        
      } catch (rowError) {
        errorCount++;
        errors.push(`Row ${i + 2}: ${rowError.message}`);
        console.error(`Error processing row ${i + 1}:`, rowError);
      }
    }

    if (errorCount > 0) {
      console.warn('Import completed with errors:', errors);
      if (successCount === 0) {
        throw new Error(`Failed to import any records. Errors:\n${errors.join('\n')}`);
      } else {
        alert(`Imported ${successCount} records with ${errorCount} errors:\n${errors.slice(0, 5).join('\n')}${errorCount > 5 ? '\n...' : ''}`);
      }
    }

    return { success: true, count: successCount, errors: errorCount };
    
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
};

export const importVehiclesFromExcel = async (file, addItemFunction) => {
  try {
    const jsonData = await readExcelFile(file);
    
    const vehicles = jsonData.map(row => ({
      plateNumber: getRowValue(row, ['Plate Number', 'رقم اللوحة', 'plateNumber']),
      plateType: getRowValue(row, ['Plate Type', 'نوع اللوحة', 'plateType']),
      vehicleMaker: getRowValue(row, ['Vehicle Maker', 'الشركة المصنعة', 'vehicleMaker']),
      vehicleModel: getRowValue(row, ['Vehicle Model', 'الموديل', 'vehicleModel']),
      modelYear: getRowValue(row, ['Model Year', 'سنة الصنع', 'modelYear']) || new Date().getFullYear(),
      sequenceNumber: getRowValue(row, ['Sequence Number', 'الرقم التسلسلي', 'sequenceNumber']),
      chassisNumber: getRowValue(row, ['Chassis Number', 'رقم الشاسيه', 'chassisNumber']),
      licenseExpiryDate: excelDateToJSDate(getRowValue(row, ['License Expiry Date', 'تاريخ انتهاء الرخصة', 'licenseExpiryDate'])),
      inspectionExpiryDate: excelDateToJSDate(getRowValue(row, ['Inspection Expiry Date', 'تاريخ انتهاء الفحص', 'inspectionExpiryDate'])),
      actualDriverId: getRowValue(row, ['Actual Driver ID', 'رقم السائق', 'actualDriverId']),
      actualDriverName: getRowValue(row, ['Driver Name', 'اسم السائق', 'actualDriverName']),
      mvpiStatus: getRowValue(row, ['MVPI Status', 'حالة MVPI', 'mvpiStatus']) || 'Active',
      insuranceStatus: getRowValue(row, ['Insurance Status', 'حالة التأمين', 'insuranceStatus']) || 'Valid',
      restrictionStatus: getRowValue(row, ['Restriction Status', 'حالة القيود', 'restrictionStatus']) || 'None',
      istemarahIssueDate: excelDateToJSDate(getRowValue(row, ['Istemarah Issue Date', 'تاريخ إصدار الاستمارة', 'istemarahIssueDate'])),
      vehicleStatus: getRowValue(row, ['Vehicle Status', 'حالة المركبة', 'vehicleStatus']) || 'Active',
      bodyType: getRowValue(row, ['Body Type', 'نوع الهيكل', 'bodyType']),
      attachments: []
    }));

    // Validate required fields
    const invalidRows = vehicles.filter(v => !v.plateNumber || !v.vehicleMaker);
    if (invalidRows.length > 0) {
      throw new Error('Some rows are missing required fields (Plate Number, Vehicle Maker)');
    }

    let successCount = 0;
    for (const vehicle of vehicles) {
      await addItemFunction(vehicle);
      successCount++;
    }

    return { success: true, count: successCount };
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
};

export const importElectricityFromExcel = async (file, addItemFunction) => {
  try {
    const jsonData = await readExcelFile(file);
    
    const bills = jsonData.map(row => ({
      departmentNumber: getRowValue(row, ['Department Number', 'رقم القسم', 'departmentNumber']),
      meterNumber: getRowValue(row, ['Meter Number', 'رقم العداد', 'meterNumber']),
      location: getRowValue(row, ['Location', 'الموقع', 'location']),
      lastReadingDate: excelDateToJSDate(getRowValue(row, ['Last Reading Date', 'تاريخ القراءة الأخيرة', 'lastReadingDate'])),
      currentReading: getRowValue(row, ['Current Reading', 'القراءة الحالية', 'currentReading']) || 0,
      previousReading: getRowValue(row, ['Previous Reading', 'القراءة السابقة', 'previousReading']) || 0,
      consumption: getRowValue(row, ['Consumption', 'الاستهلاك', 'consumption']) || 0,
      billAmount: getRowValue(row, ['Bill Amount', 'مبلغ الفاتورة', 'billAmount']) || 0,
      billDate: excelDateToJSDate(getRowValue(row, ['Bill Date', 'تاريخ الفاتورة', 'billDate'])),
      dueDate: excelDateToJSDate(getRowValue(row, ['Due Date', 'تاريخ الاستحقاق', 'dueDate'])),
      paymentStatus: getRowValue(row, ['Payment Status', 'حالة الدفع', 'paymentStatus']) || 'Pending',
      propertyType: getRowValue(row, ['Property Type', 'نوع العقار', 'propertyType']),
      subscriberName: getRowValue(row, ['Subscriber Name', 'اسم المشترك', 'subscriberName']),
      subscriberNumber: getRowValue(row, ['Subscriber Number', 'رقم المشترك', 'subscriberNumber']),
      notes: getRowValue(row, ['Notes', 'ملاحظات', 'notes']),
      alertThreshold: getRowValue(row, ['Alert Threshold', 'حد التنبيه', 'alertThreshold']) || null,
      lastMonthConsumption: getRowValue(row, ['Last Month Consumption', 'استهلاك الشهر السابق', 'lastMonthConsumption']) || null,
      attachments: []
    }));

    // Validate required fields
    const invalidRows = bills.filter(b => !b.departmentNumber || !b.meterNumber);
    if (invalidRows.length > 0) {
      throw new Error('Some rows are missing required fields (Department Number, Meter Number)');
    }

    let successCount = 0;
    for (const bill of bills) {
      await addItemFunction(bill);
      successCount++;
    }

    return { success: true, count: successCount };
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
};