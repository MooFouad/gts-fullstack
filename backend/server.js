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
const importRoutes = require('./routes/importRoutes');

// Use routes with correct paths
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/home-rents', homeRentRoutes); // Fixed: ensure hyphenated route
app.use('/api/electricity', electricityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/test', testDataRoutes);
app.use('/api/import', importRoutes);

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
      import: '/api/import'
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
      '/api/import'
    ]
  });
});

// Start server
const startServer = async () => {
  const PORT = 5000;
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