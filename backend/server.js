const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// MongoDB connection options - removed deprecated options
const mongooseOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority'
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    console.log('✅ MongoDB Connected Successfully');
    
    // Add connection event listeners
    mongoose.connection.on('error', err => {
      console.error('MongoDB Error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB Disconnected - Attempting to reconnect...');
    });
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};

// Initialize connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit : '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const homeRentRoutes = require('./routes/homeRentRoutes');
const electricityRoutes = require('./routes/electricityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const testDataRoutes = require('./routes/testDataRoutes');
const importRoutes = require('./routes/importRoutes');


// Import notification scheduler
const notificationScheduler = require('./services/notificationScheduler');
const notificationRoutes = require('./routes/notificationRoutes');

// Use routes with correct paths
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/home-rents', homeRentRoutes); // Fixed: ensure hyphenated route
app.use('/api/electricity', electricityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/test', testDataRoutes);
app.use('/api/import', importRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
    routes: {
      vehicles: '/api/vehicles',
      homeRents: '/api/home-rents',
      electricity: '/api/electricity',
      dashboard: '/api/dashboard',
      import: '/api/import',
      notifications: '/api/notifications'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

// Handle 404s
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.path);
  res.status(404).json({ 
    error: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      '/api/vehicles',
      '/api/home-rents',
      '/api/electricity',
      '/api/dashboard',
      '/api/import',
      '/api/notifications'
    ]
  });
});




// Start server
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log(`🚗 Vehicles: http://localhost:${PORT}/api/vehicles`);
      console.log(`🏠 Home Rents: http://localhost:${PORT}/api/home-rents`);
      console.log(`⚡ Electricity: http://localhost:${PORT}/api/electricity`);
      console.log(`📥 Import: http://localhost:${PORT}/api/import`);
    });
    
    // Start notification scheduler
    notificationScheduler.start();

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