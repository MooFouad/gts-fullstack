const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit : '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gts-dashboard';

console.log('Attempting to connect to MongoDB...');
console.log('Using database:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database Name:', mongoose.connection.name);
    console.log('Database Host:', mongoose.connection.host);
  })
  .catch(error => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const homeRentRoutes = require('./routes/homeRentRoutes');
const electricityRoutes = require('./routes/electricityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const testDataRoutes = require('./routes/testDataRoutes');

//use routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/home-rents', homeRentRoutes);
app.use('/api/electricity', electricityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/test', testDataRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method
  });

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      return res.status(409).json({ 
        error: 'Duplicate Entry', 
        details: 'This record already exists.'
      });
    }
    return res.status(500).json({ 
      error: 'Database Error', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'A database error occurred'
    });
  }

  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// start server

const startServer = async () => {
  const PORT = 5000; // Using standard port
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();