const mongoose = require('mongoose');

const homeRentSchema = new mongoose.Schema({
  contractNumber: { 
    type: String, 
    required: true 
  },
  contractStartingDate: { 
    type: Date,
    required: true,
    set: v => v ? new Date(v) : null
  },
  contractEndingDate: { 
    type: Date,
    required: true,
    set: v => v ? new Date(v) : null
  },
  notice: String,
  paymentTerms: String,
  paymentType: { 
    type: String, 
    default: 'cash' 
  },
  paymentStatus: { 
    type: String, 
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
  address: String,
  contactPerson: String,
  gtsContact: String,
  comments: String,
  attachments: [{ type: Object }]
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Format dates for consistency
      if (ret.contractStartingDate) {
        ret.contractStartingDate = ret.contractStartingDate.toISOString().split('T')[0];
      }
      if (ret.contractEndingDate) {
        ret.contractEndingDate = ret.contractEndingDate.toISOString().split('T')[0];
        // Calculate remaining days
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(ret.contractEndingDate);
        const diffTime = endDate.getTime() - today.getTime();
        ret.remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Add virtual for remaining days calculation
homeRentSchema.virtual('remainingDays').get(function() {
  if (!this.contractEndingDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(this.contractEndingDate);
  const diffTime = endDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('HomeRent', homeRentSchema);