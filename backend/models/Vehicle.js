const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    trim: true
  },
  plateType: {
    type: String,
    required: true
  },
  vehicleMaker: {
    type: String,
    required: true
  },
  vehicleModel: {
    type: String,
    required: true
  },
  modelYear: {
    type: Number,
    required: true
  },
  sequenceNumber: {
    type: String,
    default: ''
  },
  chassisNumber: {
    type: String,
    required: true
  },
  licenseExpiryDate: {
    type: String,
    required: true
  },
  inspectionExpiryDate: {
    type: String,
    required: true
  },
  actualDriverId: {
    type: String,
    default: ''
  },
  actualDriverName: {
    type: String,
    default: ''
  },
  mvpiStatus: {
    type: String,
    default: 'Active'
  },
  insuranceStatus: {
    type: String,
    default: 'Valid'
  },
  restrictionStatus: {
    type: String,
    default: 'None'
  },
  istemarahIssueDate: {
    type: String,
    default: ''
  },
  vehicleStatus: {
    type: String,
    default: 'Active'
  },
  bodyType: {
    type: String,
    default: ''
  },
  attachments: {
    type: Array,
    default: []
  }
}, {
  timestamps: true
});

// Index for faster searches
vehicleSchema.index({ plateNumber: 1 });
vehicleSchema.index({ vehicleStatus: 1 });
vehicleSchema.index({ licenseExpiryDate: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);