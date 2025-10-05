const mongoose = require('mongoose');

const electricitySchema = new mongoose.Schema({
  departmentNumber: {
    type: String,
    required: true,
    trim: true
  },
  meterNumber: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  lastReadingDate: {
    type: String,
    required: true
  },
  currentReading: {
    type: Number,
    required: true
  },
  previousReading: {
    type: Number,
    required: true
  },
  consumption: {
    type: Number,
    required: true
  },
  billAmount: {
    type: Number,
    required: true
  },
  billDate: {
    type: String,
    required: true
  },
  dueDate: {
    type: String,
    required: true
  },
  paymentDate: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue'],
    default: 'Pending'
  },
  propertyType: {
    type: String,
    enum: ['Commercial', 'Residential', 'Industrial'],
    required: true
  },
  subscriberName: {
    type: String,
    required: true
  },
  subscriberNumber: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  attachments: {
    type: Array,
    default: []
  },
  alertThreshold: {
    type: Number,
    default: null
  },
  lastMonthConsumption: {
    type: Number,
    default: null
  },
  consumptionAlert: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
electricitySchema.index({ departmentNumber: 1 });
electricitySchema.index({ meterNumber: 1 });
electricitySchema.index({ paymentStatus: 1 });
electricitySchema.index({ dueDate: 1 });

module.exports = mongoose.model('Electricity', electricitySchema);
