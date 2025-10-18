const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // 1. Plate Number (رقم اللوحة)
  plateNumber: { type: String },

  // 2. Registration Type (نوع التسجيل)
  registrationType: { type: String },

  // 3. Brand (العلامة التجارية / الشركة المصنعة)
  vehicleMaker: { type: String },

  // 4. Model (الموديل)
  vehicleModel: { type: String },

  // 5. Year of Manufacture (سنة التصنيع)
  modelYear: { type: Number },

  // 6. Serial Number (الرقم التسلسلي)
  sequenceNumber: { type: String },

  // 7. Chassis Number (رقم الشاسيه)
  chassisNumber: { type: String },

  // 8. Basic Color (اللون الأساسي)
  basicColor: { type: String },

  // 9. License Expiry Date (تاريخ انتهاء الرخصة)
  licenseExpiryDate: {
    type: Date,
    set: v => v ? new Date(v) : null
  },

  // 10. Inspection Expiry Date (تاريخ انتهاء الفحص)
  inspectionExpiryDate: {
    type: Date,
    set: v => v ? new Date(v) : null
  },

  // 11. Actual User ID Number (رقم هوية المستخدم الفعلي)
  actualDriverId: { type: String },

  // 12. Actual User Name (اسم المستخدم الفعلي)
  actualDriverName: { type: String },

  // 13. Inspection Status (حالة الفحص)
  inspectionStatus: { type: String },

  // 14. Insurance Status (حالة التأمين)
  insuranceStatus: { type: String },

  // Additional insurance fields from Absher
  insuranceCompany: { type: String },
  insurancePolicyNumber: { type: String },
  insuranceExpiryDate: {
    type: Date,
    set: v => v ? new Date(v) : null
  },

  // Istemarah (Registration) renewal fields
  renewalRequestId: { type: String },
  renewalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: null
  },
  renewalFees: { type: Number },
  renewalExpiryDate: {
    type: Date,
    set: v => v ? new Date(v) : null
  },
  lastRenewalRequestDate: { type: Date },

  // Data source tracking
  dataSource: {
    type: String,
    enum: ['manual', 'absher', 'import'],
    default: 'manual'
  },
  lastSyncDate: { type: Date },

  // Additional system fields
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
vehicleSchema.index({ insuranceExpiryDate: 1 });
vehicleSchema.index({ renewalExpiryDate: 1 });
vehicleSchema.index({ renewalStatus: 1 });
vehicleSchema.index({ dataSource: 1 });

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
  if (this.insuranceExpiryDate && isNaN(this.insuranceExpiryDate.getTime())) {
    this.insuranceExpiryDate = null;
  }
  if (this.renewalExpiryDate && isNaN(this.renewalExpiryDate.getTime())) {
    this.renewalExpiryDate = null;
  }
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);