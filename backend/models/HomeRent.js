const mongoose = require('mongoose');

const homeRentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  district: {
    type: String,
    default: ''
  },
  project: {
    type: String,
    default: ''
  },
  contractNumber: {
    type: String,
    required: true
  },
  contractStartingDate: {
    type: String,
    required: true
  },
  contractEndingDate: {
    type: String,
    required: true
  },
  contractStatus: {
    type: String,
    default: 'Active'
  },
  firstPaymentDate: {
    type: String,
    required: true
  },
  secondPaymentDate: {
    type: String,
    required: true
  },
  thirdPaymentDate: {
    type: String,
    required: true
  },
  fourthPaymentDate: {
    type: String,
    required: true
  },
  rentAnnually: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  electricityMeterNumber: {
    type: String,
    default: ''
  },
  contactNo: {
    type: String,
    default: ''
  },
  attachments: {
    type: Array,
    default: []
  },
  // Optional fields from your data
  gts: {
    type: String,
    default: ''
  },
  bms: {
    type: String,
    default: ''
  },
  spd: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: ''
  },
  saudiElectricCompany: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
homeRentSchema.index({ contractNumber: 1 });
homeRentSchema.index({ contractStatus: 1 });
homeRentSchema.index({ contractEndingDate: 1 });

module.exports = mongoose.model('HomeRent', homeRentSchema);