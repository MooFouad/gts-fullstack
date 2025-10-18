const mongoose = require('mongoose');

/**
 * Absher Configuration Schema
 * Stores API credentials and configuration for Absher Business integration
 */
const absherConfigSchema = new mongoose.Schema({
  // Client ID (رقم العميل)
  clientId: {
    type: String,
    required: true,
    trim: true
  },

  // Client Secret (الكتلة السرية)
  clientSecret: {
    type: String,
    required: true,
    trim: true
  },

  // Authorization Server URL
  authorizationServer: {
    type: String,
    required: true,
    default: 'https://iam.apps.devnet.elm.sa',
    trim: true
  },

  // Realm Name
  realmName: {
    type: String,
    required: true,
    default: 'tamm-QA',
    trim: true
  },

  // Link ID (معرف الربط) - Optional for tracking
  linkId: {
    type: String,
    trim: true
  },

  // Status (الحالة)
  status: {
    type: String,
    enum: ['active', 'inactive', 'testing'],
    default: 'active'
  },

  // Last connection test
  lastTestedAt: {
    type: Date
  },

  // Last sync date
  lastSyncDate: {
    type: Date
  },

  // Test result
  lastTestResult: {
    success: Boolean,
    message: String,
    testedAt: Date
  },

  // Notes
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for quick lookup
absherConfigSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AbsherConfig', absherConfigSchema);
