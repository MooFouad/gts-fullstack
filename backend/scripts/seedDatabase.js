const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Vehicle = require('../models/Vehicle');
const HomeRent = require('../models/HomeRent');
const Electricity = require('../models/Electricity');

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    family: 4
  });
  console.log('✅ Connected to MongoDB');
}

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function seedVehicles() {
  const count = await Vehicle.countDocuments();
  if (count > 0) {
    console.log(`ℹ️ Vehicles already have ${count} records. Skipping.`);
    return;
  }
  const year = new Date().getFullYear();
  const items = [
    {
      plateNumber: 'ABC-1234',
      plateType: 'Private',
      vehicleMaker: 'Toyota',
      vehicleModel: 'Camry',
      modelYear: year - 2,
      sequenceNumber: 'SEQ001',
      chassisNumber: 'CHASSIS001',
      licenseExpiryDate: addDays(new Date(), 45),
      inspectionExpiryDate: addDays(new Date(), 15),
      actualDriverId: 'DR001',
      actualDriverName: 'John Doe',
      mvpiStatus: 'Active',
      insuranceStatus: 'Valid',
      restrictionStatus: 'None',
      vehicleStatus: 'Active',
      bodyType: 'Sedan',
      attachments: []
    },
    {
      plateNumber: 'XYZ-5678',
      plateType: 'Private',
      vehicleMaker: 'Honda',
      vehicleModel: 'Civic',
      modelYear: year - 1,
      sequenceNumber: 'SEQ002',
      chassisNumber: 'CHASSIS002',
      licenseExpiryDate: addDays(new Date(), 5),
      inspectionExpiryDate: addDays(new Date(), 60),
      actualDriverId: 'DR002',
      actualDriverName: 'Jane Smith',
      mvpiStatus: 'Active',
      insuranceStatus: 'Valid',
      restrictionStatus: 'None',
      vehicleStatus: 'Active',
      bodyType: 'Hatchback',
      attachments: []
    }
  ];
  await Vehicle.insertMany(items);
  console.log(`✅ Seeded Vehicles: ${items.length}`);
}

async function seedHomeRents() {
  const count = await HomeRent.countDocuments();
  if (count > 0) {
    console.log(`ℹ️ HomeRents already have ${count} records. Skipping.`);
    return;
  }
  const items = [
    {
      contractNumber: 'CON-001',
      contractStartingDate: addDays(new Date(), -180),
      contractEndingDate: addDays(new Date(), 20),
      notice: '30 days',
      paymentTerms: 'Quarterly',
      paymentType: 'bank transfer',
      paymentStatus: 'Pending',
      amount: 5000,
      rentAnnually: 60000,
      address: '123 Main St',
      contactPerson: 'Owner A',
      gtsContact: 'GTS A',
      comments: 'Near metro',
      attachments: []
    },
    {
      contractNumber: 'CON-002',
      contractStartingDate: addDays(new Date(), -365),
      contractEndingDate: addDays(new Date(), 120),
      notice: '60 days',
      paymentTerms: 'Annually',
      paymentType: 'cash',
      paymentStatus: 'Paid',
      amount: 4000,
      rentAnnually: 48000,
      address: '456 Side St',
      contactPerson: 'Owner B',
      gtsContact: 'GTS B',
      comments: 'Top floor',
      attachments: []
    }
  ];
  await HomeRent.insertMany(items);
  console.log(`✅ Seeded HomeRents: ${items.length}`);
}

async function seedElectricity() {
  const count = await Electricity.countDocuments();
  if (count > 0) {
    console.log(`ℹ️ Electricity already has ${count} records. Skipping.`);
    return;
  }
  const items = [
    {
      departmentNumber: 'DEPT-01',
      meterNumber: 'METER-001',
      location: 'Office 1',
      lastReadingDate: addDays(new Date(), -30),
      currentReading: 12000,
      previousReading: 11850,
      consumption: 150,
      billAmount: 820.5,
      billDate: addDays(new Date(), -20),
      dueDate: addDays(new Date(), 7),
      paymentStatus: 'Pending',
      propertyType: 'Commercial',
      subscriberName: 'Company A',
      subscriberNumber: 'SUB-001',
      notes: '',
      attachments: []
    },
    {
      departmentNumber: 'DEPT-02',
      meterNumber: 'METER-002',
      location: 'Warehouse',
      lastReadingDate: addDays(new Date(), -40),
      currentReading: 8800,
      previousReading: 8700,
      consumption: 100,
      billAmount: 560.0,
      billDate: addDays(new Date(), -15),
      dueDate: addDays(new Date(), 25),
      paymentStatus: 'Pending',
      propertyType: 'Industrial',
      subscriberName: 'Company B',
      subscriberNumber: 'SUB-002',
      notes: '',
      attachments: []
    }
  ];
  await Electricity.insertMany(items);
  console.log(`✅ Seeded Electricity: ${items.length}`);
}

async function run() {
  try {
    await connect();
    await seedVehicles();
    await seedHomeRents();
    await seedElectricity();
    console.log('\n🎉 Seeding completed.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

run();


