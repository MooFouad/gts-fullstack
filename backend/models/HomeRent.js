const mongoose = require('mongoose');

const homeRentSchema = new mongoose.Schema({
  contractNumber: {
    type: String,
    required: true,
    trim: true
  },
  contractStartingDate: { 
    type: String,
    required: true
  },
  contractEndingDate: { 
    type: String,
    required: true
  },
  notice: {
    type: String,
    default: '',
    trim: true
  },
  noticeDays: {
    type: Number,
    default: null
  },
  paymentTerms: {
    type: String,
    default: '3 Installments',
    trim: true
  },
  paymentType: {
    type: String,
    default: 'cash',
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending'
  },
  amount: {
    type: Number,
    default: 0
  },
  rentAnnually: { 
    type: Number,
    default: 0
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  contactPerson: {
    type: String,
    default: '',
    trim: true
  },
  gtsContact: {
    type: String,
    default: '',
    trim: true
  },
  comments: {
    type: String,
    default: '',
    trim: true
  },
  attachments: {
    type: Array,
    default: []
  }
}, {
  timestamps: true
});

// Virtual field for remaining days until contract ends
homeRentSchema.virtual('remainingDays').get(function() {
  if (!this.contractEndingDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(this.contractEndingDate);
  endDate.setHours(0, 0, 0, 0);
  
  const daysUntilEnd = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilEnd < 0) return -1;
  return daysUntilEnd;
});

// Ensure virtual fields are included when converting to JSON
homeRentSchema.set('toJSON', { virtuals: true });
homeRentSchema.set('toObject', { virtuals: true });

// Indexes for better query performance
homeRentSchema.index({ contractNumber: 1 });
homeRentSchema.index({ contractEndingDate: 1 });
homeRentSchema.index({ contractStartingDate: 1 });

module.exports = mongoose.model('HomeRent', homeRentSchema);