const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const absherService = require('../services/absherService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Absher Routes
 * All configuration is read from environment variables for security
 * Only sync endpoints are exposed
 */

/**
 * POST /api/absher/sync
 * Sync all vehicles from Absher API
 */
router.post('/sync', async (req, res, next) => {
  try {
    console.log('\n🔄 Starting Absher sync...');

    // Get all vehicles that have plate number and sequence number
    const vehicles = await Vehicle.find({
      plateNumber: { $exists: true, $ne: '' },
      sequenceNumber: { $exists: true, $ne: '' }
    });

    if (vehicles.length === 0) {
      return res.json({
        success: true,
        message: 'No vehicles found to sync',
        data: { total: 0, successful: 0, failed: 0 }
      });
    }

    console.log(`📋 Found ${vehicles.length} vehicles to sync`);

    // Sync all vehicles
    const results = {
      total: vehicles.length,
      successful: 0,
      failed: 0,
      errors: [],
      updated: []
    };

    for (const vehicle of vehicles) {
      try {
        console.log(`\n🔍 Syncing: ${vehicle.plateNumber} (${vehicle.sequenceNumber})`);

        const absherData = await absherService.getVehicleInsuranceDetails(
          vehicle.plateNumber,
          vehicle.sequenceNumber
        );

        // Update vehicle with Absher data
        Object.assign(vehicle, absherData);
        await vehicle.save();

        results.successful++;
        results.updated.push({
          plateNumber: vehicle.plateNumber,
          sequenceNumber: vehicle.sequenceNumber
        });

        console.log(`✅ Successfully synced: ${vehicle.plateNumber}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Failed to sync vehicle ${vehicle.plateNumber}:`, error.message);
        results.failed++;
        results.errors.push({
          plateNumber: vehicle.plateNumber,
          sequenceNumber: vehicle.sequenceNumber,
          error: error.message
        });
      }
    }

    console.log(`\n✅ Sync complete: ${results.successful}/${results.total} successful`);

    res.json({
      success: true,
      message: `Sync complete: ${results.successful}/${results.total} vehicles updated`,
      data: results
    });
  } catch (error) {
    console.error('❌ Error in sync:', error);
    next(error);
  }
});

/**
 * POST /api/absher/sync/vehicle/:id
 * Sync a single vehicle from Absher API
 */
router.post('/sync/vehicle/:id', async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404));
    }

    if (!vehicle.plateNumber || !vehicle.sequenceNumber) {
      return next(new AppError('Vehicle must have plate number and sequence number to sync', 400));
    }

    console.log(`🔄 Syncing vehicle: ${vehicle.plateNumber}`);

    const absherData = await absherService.getVehicleInsuranceDetails(
      vehicle.plateNumber,
      vehicle.sequenceNumber
    );

    // Update vehicle with Absher data
    Object.assign(vehicle, absherData);
    await vehicle.save();

    console.log(`✅ Vehicle synced successfully: ${vehicle.plateNumber}`);

    res.json({
      success: true,
      message: 'Vehicle synced successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('❌ Error syncing vehicle:', error);
    next(error);
  }
});

/**
 * POST /api/absher/test-connection
 * Test connection to Absher API
 */
router.post('/test-connection', async (req, res, next) => {
  try {
    console.log('🧪 Testing Absher API connection...');

    const result = await absherService.testConnection();

    res.json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    next(error);
  }
});

module.exports = router;
