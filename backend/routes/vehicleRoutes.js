const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    console.log('Fetching vehicles...');
    const vehicles = await Vehicle.find({})
      .lean()
      .maxTimeMS(5000) // Set maximum execution time
      .exec();

    // Format dates safely
    const formattedVehicles = vehicles.map(vehicle => {
      // Create new object with formatted dates
      return {
        ...vehicle,
        licenseExpiryDate: vehicle.licenseExpiryDate ? 
          new Date(vehicle.licenseExpiryDate).toISOString().split('T')[0] : null,
        inspectionExpiryDate: vehicle.inspectionExpiryDate ? 
          new Date(vehicle.inspectionExpiryDate).toISOString().split('T')[0] : null,
        istemarahIssueDate: vehicle.istemarahIssueDate ? 
          new Date(vehicle.istemarahIssueDate).toISOString().split('T')[0] : null,
      };
    });

    console.log(`Found ${vehicles.length} vehicles`);
    res.json(formattedVehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    if (error.name === 'MongooseError' && error.message.includes('timed out')) {
      return res.status(503).json({ error: 'Database operation timed out. Please try again.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE vehicle
router.post('/', async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE vehicle
router.put('/:id', async (req, res) => {
  try {
    console.log('Update request received for vehicle ID:', req.params.id);
    console.log('Update data:', req.body);

    // Validate MongoDB ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('Invalid MongoDB ID format:', req.params.id);
      return res.status(400).json({ error: 'Invalid vehicle ID format' });
    }

    // Check if vehicle exists first
    const existingVehicle = await Vehicle.findById(req.params.id);
    if (!existingVehicle) {
      console.error('Vehicle not found:', req.params.id);
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Perform the update
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, _id: req.params.id }, // Ensure _id is preserved
      { new: true, runValidators: true }
    );

    console.log('Vehicle updated successfully:', vehicle);
    res.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(400).json({
      error: error.message,
      type: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET count
router.get('/count/total', async (req, res) => {
  try {
    const count = await Vehicle.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;