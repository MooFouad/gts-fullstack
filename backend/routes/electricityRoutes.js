const express = require('express');
const router = express.Router();
const Electricity = require('../models/Electricity');

// GET all electricity bills
router.get('/', async (req, res) => {
  try {
    console.log('Fetching electricity bills...');
    const bills = await Electricity.find({}).sort({ createdAt: -1 });
    console.log(`Found ${bills.length} electricity bills`);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching electricity bills:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single electricity bill
router.get('/:id', async (req, res) => {
  try {
    const bill = await Electricity.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Electricity bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE electricity bill
router.post('/', async (req, res) => {
  try {
    console.log('Received electricity data:', req.body);
    // Auto-calculate consumption if not provided
    if (!req.body.consumption && req.body.currentReading && req.body.previousReading) {
      req.body.consumption = req.body.currentReading - req.body.previousReading;
    }
    
    // Check consumption alert
    if (req.body.alertThreshold && req.body.consumption > req.body.alertThreshold) {
      req.body.consumptionAlert = true;
    }
    
    const bill = new Electricity(req.body);
    console.log('Saving electricity bill to database...');
    await bill.save();
    console.log('Electricity bill saved successfully:', bill);
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE electricity bill
router.put('/:id', async (req, res) => {
  try {
    console.log('Update request received for ID:', req.params.id);
    console.log('Update data:', req.body);

    // Auto-calculate consumption if readings are updated
    if (req.body.currentReading && req.body.previousReading) {
      req.body.consumption = req.body.currentReading - req.body.previousReading;
    }
    
    // Check consumption alert
    if (req.body.alertThreshold && req.body.consumption > req.body.alertThreshold) {
      req.body.consumptionAlert = true;
    } else {
      req.body.consumptionAlert = false;
    }
    
    // Ensure we have a valid MongoDB ID
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const bill = await Electricity.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!bill) return res.status(404).json({ error: 'Electricity bill not found' });
    
    console.log('Update successful:', bill);
    res.json(bill);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ 
      error: error.message,
      type: error.name,
      details: error.stack
    });
  }
});

// DELETE electricity bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Electricity.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Electricity bill not found' });
    res.json({ message: 'Electricity bill deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET count
router.get('/count/total', async (req, res) => {
  try {
    const count = await Electricity.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;