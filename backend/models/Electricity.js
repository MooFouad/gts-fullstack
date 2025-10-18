const mongoose = require('mongoose');

const electricitySchema = new mongoose.Schema({
  no: {
    type: String
  },
  account: {
    type: String
  },
  name: {
    type: String
  },
  city: {
    type: String
  },
  address: {
    type: String
  },
  project: {
    type: String
  },
  division: {
    type: String
  },
  meterNumber: {
    type: String
  },
  date: {
    type: String
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
