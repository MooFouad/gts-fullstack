const express = require('express');
const router = express.Router();
const HomeRent = require('../models/HomeRent');

// GET all home rents
router.get('/', async (req, res) => {
  try {
    console.log('Fetching home rents...');
    const homeRents = await HomeRent.find({}).lean();

    const formattedRents = homeRents.map(rent => {
      // Log raw data for debugging
      console.log('Raw rent data:', {
        id: rent._id,
        startDate: rent.contractStartingDate,
        endDate: rent.contractEndingDate,
        rent: rent.rentAnnually
      });

      return {
        ...rent,
        contractStartingDate: rent.contractStartingDate || '',
        contractEndingDate: rent.contractEndingDate || '',
        rentAnnually: Number(rent.rentAnnually || 0),
        amount: Number(rent.amount || 0)
      };
    });

    console.log(`Found ${formattedRents.length} home rents`);
    res.json(formattedRents);
  } catch (error) {
    console.error('Error fetching home rents:', error);
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
    const rent = new HomeRent(req.body);
    await rent.save();
    console.log('Home rent created successfully:', rent);
    res.status(201).json(rent);
  } catch (error) {
    console.error('Error creating home rent:', error);
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
    const rent = await HomeRent.findByIdAndDelete(req.params.id);
    if (!rent) return res.status(404).json({ error: 'Home rent not found' });
    res.json({ message: 'Home rent deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting home rent:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;