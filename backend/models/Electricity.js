const mongoose = require('mongoose');

const electricitySchema = new mongoose.Schema({
  no: {
    type: String,
    required: true
  },
  account: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  project: {
    type: String,
    required: true
  },
  division: {
    type: String,
    required: true
  },
  meterNumber: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  attachments: {
    type: Array
  }
}, {
  timestamps: true
});

// Indexes
electricitySchema.index({ account: 1 });
electricitySchema.index({ meterNumber: 1 });
electricitySchema.index({ no: 1 });

module.exports = mongoose.model('Electricity', electricitySchema);
