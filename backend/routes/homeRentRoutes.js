const express = require('express');
const router = express.Router();
const HomeRent = require('../models/HomeRent');

// GET all home rents
router.get('/', async (req, res) => {
  try {
    const homeRents = await HomeRent.find({}).lean();
    console.log('Found home rents:', homeRents.length);
    res.json(homeRents);
  } catch (error) {
    console.error('GET / Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single home rent
router.get('/:id', async (req, res) => {
  try {
    const rent = await HomeRent.findById(req.params.id);
    if (!rent) return res.status(404).json({ error: 'Home rent not found' });
    res.json(rent);
  } catch (error) {
    console.error('Error getting home rent:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE home rent
router.post('/', async (req, res) => {
  try {
    console.log('Creating new home rent:', req.body);
    const homeRent = new HomeRent(req.body);
    const saved = await homeRent.save();
    console.log('Created successfully:', saved._id);
    res.status(201).json(saved);
  } catch (error) {
    console.error('POST / Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// UPDATE home rent
router.put('/:id', async (req, res) => {
  try {
    console.log('Update request received for home rent ID:', req.params.id);
    console.log('Update data:', req.body);

    // Validate MongoDB ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('Invalid MongoDB ID format:', req.params.id);
      return res.status(400).json({ error: 'Invalid home rent ID format' });
    }

    // Check if home rent exists first
    const existingRent = await HomeRent.findById(req.params.id);
    if (!existingRent) {
      console.error('Home rent not found:', req.params.id);
      return res.status(404).json({ error: 'Home rent not found' });
    }

    // Perform the update
    const rent = await HomeRent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, _id: req.params.id }, // Ensure _id is preserved
      { new: true, runValidators: true }
    );

    console.log('Home rent updated successfully:', rent);
    res.json(rent);
  } catch (error) {
    console.error('Error updating home rent:', error);
    res.status(400).json({
      error: error.message,
      type: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE home rent
router.delete('/:id', async (req, res) => {
  try {
    console.log('Delete request for ID:', req.params.id);
    const result = await HomeRent.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Home rent not found' });
    }
    console.log('Successfully deleted:', req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;