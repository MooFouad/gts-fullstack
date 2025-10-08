const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Mock data for testing without MongoDB
const mockData = {
  vehicles: [
    {
      _id: '1',
      plateNumber: 'ABC-123',
      vehicleMaker: 'Toyota',
      vehicleModel: 'Camry',
      licenseExpiryDate: '2024-12-31',
      inspectionExpiryDate: '2024-11-30',
      vehicleStatus: 'Active'
    }
  ],
  homeRents: [
    {
      _id: '1',
      contractNumber: 'CONTRACT-001',
      contractStartingDate: '2024-01-01',
      contractEndingDate: '2024-12-31',
      amount: 5000,
      address: '123 Main St',
      paymentStatus: 'Pending'
    }
  ],
  electricity: [
    {
      _id: '1',
      meterNumber: 'METER-001',
      location: 'Office Building',
      billAmount: 1500,
      dueDate: '2024-12-15',
      paymentStatus: 'Pending'
    }
  ]
};

// Mock API Routes
app.get('/api/vehicles', (req, res) => {
  res.json(mockData.vehicles);
});

app.get('/api/vehicles/count', (req, res) => {
  res.json({ count: mockData.vehicles.length });
});

app.get('/api/home-rents', (req, res) => {
  res.json(mockData.homeRents);
});

app.get('/api/home-rents/count', (req, res) => {
  res.json({ count: mockData.homeRents.length });
});

app.get('/api/electricity', (req, res) => {
  res.json(mockData.electricity);
});

app.get('/api/electricity/count', (req, res) => {
  res.json({ count: mockData.electricity.length });
});

// Notification routes (simplified)
app.get('/api/notifications/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

app.post('/api/notifications/subscribe', (req, res) => {
  console.log('📱 Push subscription received:', req.body);
  res.json({ success: true, message: 'Subscription saved (mock)' });
});

app.post('/api/notifications/test', (req, res) => {
  console.log('🧪 Test notification requested for:', req.body.email);
  res.json({ success: true, message: 'Test notification sent (mock)' });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: 'disabled (mock mode)',
    timestamp: new Date(),
    routes: {
      vehicles: '/api/vehicles',
      homeRents: '/api/home-rents',
      electricity: '/api/electricity',
      notifications: '/api/notifications'
    }
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ 
    error: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      '/api/vehicles',
      '/api/home-rents',
      '/api/electricity',
      '/api/notifications'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Mock Server running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`🚗 Vehicles: http://localhost:${PORT}/api/vehicles`);
  console.log(`🏠 Home Rents: http://localhost:${PORT}/api/home-rents`);
  console.log(`⚡ Electricity: http://localhost:${PORT}/api/electricity`);
  console.log(`\n📝 Note: Running in mock mode without MongoDB`);
  console.log(`📝 To use real database, install MongoDB and run: npm start`);
});
