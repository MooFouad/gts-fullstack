const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true },
  plateType: { type: String },
  vehicleMaker: { type: String },
  vehicleModel: { type: String },
  modelYear: { type: Number },
  sequenceNumber: { type: String },
  chassisNumber: { type: String },
  licenseExpiryDate: { 
    type: Date,
    set: v => v ? new Date(v) : null 
  },
  inspectionExpiryDate: { 
    type: Date,
    set: v => v ? new Date(v) : null 
  },
  actualDriverId: { type: String },
  actualDriverName: { type: String },
  mvpiStatus: { 
    type: String,
    enum: ['Active', 'Expired', 'Warning'],
    default: 'Active'
  },
  insuranceStatus: { 
    type: String,
    enum: ['Valid', 'Invalid', 'Expired'],
    default: 'Valid'
  },
  restrictionStatus: { type: String },
  istemarahIssueDate: { 
    type: Date,
    set: v => v ? new Date(v) : null 
  },
  vehicleStatus: { 
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Active'
  },
  bodyType: { type: String },
  attachments: [{ type: Object }],
  createdAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Add indexes for better performance
vehicleSchema.index({ plateNumber: 1 });
vehicleSchema.index({ licenseExpiryDate: 1 });
vehicleSchema.index({ inspectionExpiryDate: 1 });

// Add query timeout
vehicleSchema.pre('find', function() {
  this.maxTimeMS(5000);
});

// Add pre-save middleware to ensure dates are valid
vehicleSchema.pre('save', function(next) {
  if (this.licenseExpiryDate && isNaN(this.licenseExpiryDate.getTime())) {
    this.licenseExpiryDate = null;
  }
  if (this.inspectionExpiryDate && isNaN(this.inspectionExpiryDate.getTime())) {
    this.inspectionExpiryDate = null;
  }
  if (this.istemarahIssueDate && isNaN(this.istemarahIssueDate.getTime())) {
    this.istemarahIssueDate = null;
  }
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);