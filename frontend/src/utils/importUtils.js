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

export const importVehiclesFromExcel = async (file, service) => {
  try {
    const jsonData = await readExcelFile(file);
    
    // Transform Excel data to match your schema
    const vehicles = jsonData.map(row => ({
      plateNumber: row['Plate Number'] || row['plateNumber'],
      plateType: row['Plate Type'] || row['plateType'],
      vehicleMaker: row['Vehicle Maker'] || row['vehicleMaker'],
      vehicleModel: row['Vehicle Model'] || row['vehicleModel'],
      modelYear: row['Model Year'] || row['modelYear'],
      sequenceNumber: row['Sequence Number'] || row['sequenceNumber'],
      chassisNumber: row['Chassis Number'] || row['chassisNumber'],
      licenseExpiryDate: row['License Expiry Date'] || row['licenseExpiryDate'],
      inspectionExpiryDate: row['Inspection Expiry Date'] || row['inspectionExpiryDate'],
      actualDriverId: row['Actual Driver ID'] || row['actualDriverId'],
      actualDriverName: row['Driver Name'] || row['actualDriverName'],
      mvpiStatus: row['MVPI Status'] || row['mvpiStatus'] || 'Active',
      insuranceStatus: row['Insurance Status'] || row['insuranceStatus'] || 'Valid',
      restrictionStatus: row['Restriction Status'] || row['restrictionStatus'] || 'None',
      istemarahIssueDate: row['Istemarah Issue Date'] || row['istemarahIssueDate'],
      vehicleStatus: row['Vehicle Status'] || row['vehicleStatus'] || 'Active',
      bodyType: row['Body Type'] || row['bodyType']
    }));

    // Validate required fields
    const invalidRows = vehicles.filter(v => !v.plateNumber || !v.vehicleMaker);
    if (invalidRows.length > 0) {
      throw new Error('Some rows are missing required fields (Plate Number, Vehicle Maker)');
    }

    // Save to database
    for (const vehicle of vehicles) {
      await service.create(vehicle);
    }

    return { success: true, count: vehicles.length };
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
};

export const importHomeRentsFromExcel = async (file, service) => {
  try {
    const jsonData = await readExcelFile(file);
    
    const homeRents = jsonData.map(row => ({
      name: row['Property Name'] || row['name'],
      location: row['Location'] || row['location'],
      district: row['District'] || row['district'],
      project: row['Project'] || row['project'],
      contractNumber: row['Contract Number'] || row['contractNumber'],
      contractStartingDate: row['Contract Starting Date'] || row['contractStartingDate'],
      contractEndingDate: row['Contract Ending Date'] || row['contractEndingDate'],
      contractStatus: row['Contract Status'] || row['contractStatus'] || 'Active',
      firstPaymentDate: row['First Payment Date'] || row['firstPaymentDate'],
      secondPaymentDate: row['Second Payment Date'] || row['secondPaymentDate'],
      thirdPaymentDate: row['Third Payment Date'] || row['thirdPaymentDate'],
      fourthPaymentDate: row['Fourth Payment Date'] || row['fourthPaymentDate'],
      rentAnnually: row['Annual Rent'] || row['rentAnnually'],
      address: row['Address'] || row['address'],
      electricityMeterNumber: row['Electricity Meter Number'] || row['electricityMeterNumber'],
      contactNo: row['Contact Number'] || row['contactNo']
    }));

    // Validate required fields
    const invalidRows = homeRents.filter(h => !h.name || !h.contractNumber);
    if (invalidRows.length > 0) {
      throw new Error('Some rows are missing required fields (Property Name, Contract Number)');
    }

    // Save to database
    for (const homeRent of homeRents) {
      await service.create(homeRent);
    }

    return { success: true, count: homeRents.length };
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
};

export const importElectricityFromExcel = async (file, service) => {
  try {
    const jsonData = await readExcelFile(file);
    
    const bills = jsonData.map(row => ({
      departmentNumber: row['Department Number'] || row['departmentNumber'],
      meterNumber: row['Meter Number'] || row['meterNumber'],
      location: row['Location'] || row['location'],
      lastReadingDate: row['Last Reading Date'] || row['lastReadingDate'],
      currentReading: row['Current Reading'] || row['currentReading'],
      previousReading: row['Previous Reading'] || row['previousReading'],
      consumption: row['Consumption'] || row['consumption'],
      billAmount: row['Bill Amount'] || row['billAmount'],
      billDate: row['Bill Date'] || row['billDate'],
      dueDate: row['Due Date'] || row['dueDate'],
      paymentStatus: row['Payment Status'] || row['paymentStatus'] || 'Pending',
      propertyType: row['Property Type'] || row['propertyType'],
      subscriberName: row['Subscriber Name'] || row['subscriberName'],
      subscriberNumber: row['Subscriber Number'] || row['subscriberNumber'],
      notes: row['Notes'] || row['notes'],
      alertThreshold: row['Alert Threshold'] || row['alertThreshold'],
      lastMonthConsumption: row['Last Month Consumption'] || row['lastMonthConsumption']
    }));

    // Validate required fields
    const invalidRows = bills.filter(b => !b.departmentNumber || !b.meterNumber);
    if (invalidRows.length > 0) {
      throw new Error('Some rows are missing required fields (Department Number, Meter Number)');
    }

    // Save to database
    for (const bill of bills) {
      await service.create(bill);
    }

    return { success: true, count: bills.length };
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
};